const bcrypt = require('bcrypt');
const jwt = require('jsonwebtoken');
const { pool } = require('../config/db');

const SALT_ROUNDS = 10;
const PAPEIS_VALIDOS = ['ALUNO', 'PROFESSOR', 'ADMIN'];

async function registrar(req, res) {
  try {
    const { nome, email, senha, papel } = req.body;

    if (!nome || !email || !senha) {
      return res.status(400).json({ erro: 'Nome, email e senha sao obrigatorios.' });
    }

    const papelFinal = papel && PAPEIS_VALIDOS.includes(papel) ? papel : 'ALUNO';

    const [existentes] = await pool.query('SELECT id FROM usuarios WHERE email = ?', [email]);
    if (existentes.length > 0) {
      return res.status(409).json({ erro: 'Ja existe um usuario cadastrado com este email.' });
    }

    const senhaHash = await bcrypt.hash(senha, SALT_ROUNDS);

    const [resultado] = await pool.query(
      'INSERT INTO usuarios (nome, email, senha_hash, papel) VALUES (?, ?, ?, ?)',
      [nome, email, senhaHash, papelFinal]
    );

    return res.status(201).json({
      id: resultado.insertId,
      nome,
      email,
      papel: papelFinal,
    });
  } catch (err) {
    console.error('[authController.registrar]', err);
    return res.status(500).json({ erro: 'Erro ao registrar usuario.' });
  }
}

async function login(req, res) {
  try {
    const { email, senha } = req.body;

    if (!email || !senha) {
      return res.status(400).json({ erro: 'Email e senha sao obrigatorios.' });
    }

    const [linhas] = await pool.query(
      'SELECT id, nome, email, senha_hash, papel, ativo FROM usuarios WHERE email = ?',
      [email]
    );

    if (linhas.length === 0) {
      return res.status(401).json({ erro: 'Email ou senha invalidos.' });
    }

    const usuario = linhas[0];

    if (!usuario.ativo) {
      return res.status(403).json({ erro: 'Usuario inativo. Entre em contato com o suporte.' });
    }

    const senhaValida = await bcrypt.compare(senha, usuario.senha_hash);
    if (!senhaValida) {
      return res.status(401).json({ erro: 'Email ou senha invalidos.' });
    }

    const token = jwt.sign(
      { id: usuario.id, nome: usuario.nome, email: usuario.email, papel: usuario.papel },
      process.env.JWT_SECRET,
      { expiresIn: process.env.JWT_EXPIRES_IN || '1d' }
    );

    return res.json({
      token,
      usuario: { id: usuario.id, nome: usuario.nome, email: usuario.email, papel: usuario.papel },
    });
  } catch (err) {
    console.error('[authController.login]', err);
    return res.status(500).json({ erro: 'Erro ao efetuar login.' });
  }
}

module.exports = { registrar, login };
