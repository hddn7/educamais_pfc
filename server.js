import 'dotenv/config';
import bcrypt from 'bcryptjs';
import Database from 'better-sqlite3';
import express from 'express';
import rateLimit from 'express-rate-limit';
import session from 'express-session';
import helmet from 'helmet';
import { randomBytes } from 'node:crypto';
import { mkdirSync } from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';

const directory = path.dirname(fileURLToPath(import.meta.url));
const dataDirectory = path.join(directory, 'data');
mkdirSync(dataDirectory, { recursive: true });

const database = new Database(path.join(dataDirectory, 'questio.sqlite'));
database.pragma('journal_mode = WAL');
database.pragma('foreign_keys = ON');
database.exec(`
  CREATE TABLE IF NOT EXISTS users (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    name TEXT NOT NULL,
    email TEXT NOT NULL UNIQUE,
    password_hash TEXT NOT NULL,
    created_at TEXT NOT NULL DEFAULT CURRENT_TIMESTAMP
  );
  CREATE TABLE IF NOT EXISTS consents (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    user_id INTEGER NOT NULL REFERENCES users(id),
    terms_version TEXT NOT NULL,
    privacy_version TEXT NOT NULL,
    accepted_at TEXT NOT NULL DEFAULT CURRENT_TIMESTAMP
  );
  CREATE TABLE IF NOT EXISTS audit_log (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    user_id INTEGER REFERENCES users(id),
    event TEXT NOT NULL,
    ip_address TEXT,
    user_agent TEXT,
    created_at TEXT NOT NULL DEFAULT CURRENT_TIMESTAMP
  );
  CREATE TABLE IF NOT EXISTS sessions (
    sid TEXT PRIMARY KEY,
    data TEXT NOT NULL,
    expires_at INTEGER NOT NULL
  );
  CREATE INDEX IF NOT EXISTS audit_log_user_date ON audit_log(user_id, id DESC);
  CREATE INDEX IF NOT EXISTS sessions_expiration ON sessions(expires_at);
`);

class SQLiteSessionStore extends session.Store {
  get(sid, callback) {
    try {
      const row = database.prepare('SELECT data, expires_at FROM sessions WHERE sid = ?').get(sid);
      if (!row) return callback(null, null);
      if (row.expires_at <= Date.now()) {
        database.prepare('DELETE FROM sessions WHERE sid = ?').run(sid);
        return callback(null, null);
      }
      callback(null, JSON.parse(row.data));
    } catch (error) {
      callback(error);
    }
  }

  set(sid, value, callback) {
    try {
      const expiresAt = value.cookie?.expires
        ? new Date(value.cookie.expires).getTime()
        : Date.now() + (value.cookie?.maxAge ?? 86_400_000);
      database
        .prepare(
          `
        INSERT INTO sessions (sid, data, expires_at) VALUES (?, ?, ?)
        ON CONFLICT(sid) DO UPDATE SET data = excluded.data, expires_at = excluded.expires_at
      `,
        )
        .run(sid, JSON.stringify(value), expiresAt);
      callback?.(null);
    } catch (error) {
      callback?.(error);
    }
  }

  destroy(sid, callback) {
    try {
      database.prepare('DELETE FROM sessions WHERE sid = ?').run(sid);
      callback?.(null);
    } catch (error) {
      callback?.(error);
    }
  }

  touch(sid, value, callback) {
    try {
      const expiresAt = value.cookie?.expires
        ? new Date(value.cookie.expires).getTime()
        : Date.now() + (value.cookie?.maxAge ?? 86_400_000);
      database.prepare('UPDATE sessions SET expires_at = ? WHERE sid = ?').run(expiresAt, sid);
      callback?.(null);
    } catch (error) {
      callback?.(error);
    }
  }
}

const app = express();
const port = Number(process.env.PORT) || 3000;
const isProduction = process.env.NODE_ENV === 'production';
const sessionSecret =
  process.env.SESSION_SECRET ?? (isProduction ? '' : randomBytes(32).toString('hex'));

if (!sessionSecret || sessionSecret.length < 32) {
  console.error('Defina SESSION_SECRET com pelo menos 32 caracteres no ambiente.');
  process.exit(1);
}

app.disable('x-powered-by');
app.use(
  helmet({
    contentSecurityPolicy: {
      directives: {
        'style-src': ["'self'", "'unsafe-inline'", 'https://fonts.googleapis.com'],
        'font-src': ["'self'", 'https://fonts.gstatic.com'],
      },
    },
  }),
);
app.use(express.json({ limit: '10kb' }));
app.use('/vendor/bootstrap', express.static(path.join(directory, 'node_modules/bootstrap/dist')));
app.use(
  session({
    name: 'questio.sid',
    secret: sessionSecret,
    store: new SQLiteSessionStore(),
    resave: false,
    saveUninitialized: false,
    cookie: {
      httpOnly: true,
      sameSite: 'strict',
      secure: process.env.NODE_ENV === 'production',
      maxAge: 8 * 60 * 60 * 1000,
    },
  }),
);

const insertAudit = database.prepare(`
  INSERT INTO audit_log (user_id, event, ip_address, user_agent)
  VALUES (?, ?, ?, ?)
`);

function audit(request, event, userId = request.session.userId ?? null) {
  insertAudit.run(userId, event, request.ip, String(request.get('user-agent') ?? '').slice(0, 300));
}

function requireUser(request, response, next) {
  if (!request.session.userId) {
    return response.status(401).json({ error: 'Entre na sua conta para continuar.' });
  }
  next();
}

const authLimiter = rateLimit({
  windowMs: 15 * 60 * 1000,
  limit: 10,
  standardHeaders: 'draft-8',
  legacyHeaders: false,
  message: { error: 'Muitas tentativas. Aguarde alguns minutos e tente novamente.' },
});

app.post('/api/register', authLimiter, async (request, response, next) => {
  try {
    const name = String(request.body.name ?? '').trim();
    const email = String(request.body.email ?? '')
      .trim()
      .toLowerCase();
    const password = String(request.body.password ?? '');
    const accepted = request.body.acceptedTerms === true && request.body.acceptedPrivacy === true;

    if (name.length < 2 || name.length > 80) {
      return response.status(400).json({ error: 'Informe um nome entre 2 e 80 caracteres.' });
    }
    if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email) || email.length > 254) {
      return response.status(400).json({ error: 'Informe um e-mail válido.' });
    }
    if (password.length < 10 || password.length > 128) {
      return response.status(400).json({ error: 'A senha precisa ter entre 10 e 128 caracteres.' });
    }
    if (!accepted) {
      return response
        .status(400)
        .json({ error: 'É necessário aceitar os termos e a política de privacidade.' });
    }
    if (database.prepare('SELECT id FROM users WHERE email = ?').get(email)) {
      return response.status(409).json({ error: 'Já existe uma conta com este e-mail.' });
    }

    const passwordHash = await bcrypt.hash(password, 12);
    const createAccount = database.transaction(() => {
      const result = database
        .prepare('INSERT INTO users (name, email, password_hash) VALUES (?, ?, ?)')
        .run(name, email, passwordHash);
      const userId = Number(result.lastInsertRowid);
      database
        .prepare(
          `
        INSERT INTO consents (user_id, terms_version, privacy_version)
        VALUES (?, '1.0', '1.0')
      `,
        )
        .run(userId);
      return userId;
    });
    const userId = createAccount();
    await new Promise((resolve, reject) =>
      request.session.regenerate((error) => (error ? reject(error) : resolve())),
    );
    request.session.userId = userId;
    audit(request, 'account.created', userId);
    response.status(201).json({ user: { id: userId, name, email } });
  } catch (error) {
    if (error.code === 'SQLITE_CONSTRAINT_UNIQUE') {
      return response.status(409).json({ error: 'Já existe uma conta com este e-mail.' });
    }
    next(error);
  }
});

app.post('/api/login', authLimiter, async (request, response, next) => {
  try {
    const email = String(request.body.email ?? '')
      .trim()
      .toLowerCase();
    const password = String(request.body.password ?? '');
    const user = database
      .prepare('SELECT id, name, email, password_hash FROM users WHERE email = ?')
      .get(email);

    if (!user || !(await bcrypt.compare(password, user.password_hash))) {
      audit(request, 'auth.login_failed', null);
      return response.status(401).json({ error: 'E-mail ou senha não conferem.' });
    }

    await new Promise((resolve, reject) =>
      request.session.regenerate((error) => (error ? reject(error) : resolve())),
    );
    request.session.userId = user.id;
    audit(request, 'auth.login_success', user.id);
    response.json({ user: { id: user.id, name: user.name, email: user.email } });
  } catch (error) {
    next(error);
  }
});

app.post('/api/logout', requireUser, (request, response, next) => {
  audit(request, 'auth.logout');
  request.session.destroy((error) => {
    if (error) return next(error);
    response.clearCookie('questio.sid', {
      httpOnly: true,
      sameSite: 'strict',
      secure: process.env.NODE_ENV === 'production',
    });
    response.status(204).end();
  });
});

app.get('/api/me', requireUser, (request, response) => {
  const user = database
    .prepare('SELECT id, name, email, created_at FROM users WHERE id = ?')
    .get(request.session.userId);
  if (!user) return response.status(401).json({ error: 'Sessão inválida.' });
  response.json({ user });
});

app.get('/api/audit', requireUser, (request, response) => {
  const events = database
    .prepare(
      `
    SELECT event, created_at FROM audit_log
    WHERE user_id = ? ORDER BY id DESC LIMIT 50
  `,
    )
    .all(request.session.userId);
  response.json({ events });
});

app.get('/api/cep/:cep', requireUser, async (request, response) => {
  const cep = String(request.params.cep ?? '').replace(/\D/g, '');
  if (!/^\d{8}$/.test(cep)) {
    return response.status(400).json({ error: 'Digite um CEP com 8 números.' });
  }

  try {
    const result = await fetch(`https://viacep.com.br/ws/${cep}/json/`, {
      signal: AbortSignal.timeout(5000),
    });
    if (!result.ok) throw new Error('ViaCEP indisponível');
    const address = await result.json();
    if (address.erro) return response.status(404).json({ error: 'CEP não encontrado.' });
    audit(request, 'address.cep_lookup');
    response.json({
      street: address.logradouro ?? '',
      neighborhood: address.bairro ?? '',
      city: address.localidade ?? '',
      state: address.uf ?? '',
    });
  } catch {
    response
      .status(502)
      .json({ error: 'Não foi possível consultar o ViaCEP agora. Tente novamente.' });
  }
});

app.get('/download/codigos', (request, response) => {
  response.download(path.join(directory, 'questio-pfc-codigos.zip'), 'questio-pfc-codigos.zip');
});

app.use(express.static(path.join(directory, 'public')));
app.use((error, request, response, next) => {
  console.error(error);
  if (response.headersSent) return next(error);
  response.status(500).json({ error: 'Ocorreu um erro inesperado. Tente novamente.' });
});

app.listen(port, () => {
  console.log(`Questio PFC disponível em http://localhost:${port}`);
});
