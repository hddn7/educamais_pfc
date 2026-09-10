const jwt = require('jsonwebtoken');

// Verifica se o token JWT enviado no header Authorization e valido
function autenticar(req, res, next) {
  const header = req.headers['authorization'];
  const token = header && header.startsWith('Bearer ') ? header.split(' ')[1] : null;

  if (!token) {
    return res.status(401).json({ erro: 'Token de autenticacao nao informado.' });
  }

  try {
    const payload = jwt.verify(token, process.env.JWT_SECRET);
    req.usuario = payload; // { id, nome, email, papel }
    next();
  } catch (err) {
    return res.status(401).json({ erro: 'Token invalido ou expirado.' });
  }
}

// Restringe o acesso a determinados papeis (ex: 'PROFESSOR', 'ADMIN')
function autorizar(...papeisPermitidos) {
  return (req, res, next) => {
    if (!req.usuario || !papeisPermitidos.includes(req.usuario.papel)) {
      return res.status(403).json({ erro: 'Voce nao tem permissao para acessar este recurso.' });
    }
    next();
  };
}

module.exports = { autenticar, autorizar };
