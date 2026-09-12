const { pool } = require('../config/db');

async function listar(req, res) {
  try {
    const [materias] = await pool.query('SELECT id, nome FROM materias ORDER BY nome');
    return res.json(materias);
  } catch (err) {
    console.error('[materiaController.listar]', err);
    return res.status(500).json({ erro: 'Erro ao listar materias.' });
  }
}

async function criar(req, res) {
  try {
    const { nome } = req.body;
    if (!nome) {
      return res.status(400).json({ erro: 'O nome da materia e obrigatorio.' });
    }

    const [resultado] = await pool.query('INSERT INTO materias (nome) VALUES (?)', [nome]);
    return res.status(201).json({ id: resultado.insertId, nome });
  } catch (err) {
    if (err.code === 'ER_DUP_ENTRY') {
      return res.status(409).json({ erro: 'Ja existe uma materia com este nome.' });
    }
    console.error('[materiaController.criar]', err);
    return res.status(500).json({ erro: 'Erro ao criar materia.' });
  }
}

module.exports = { listar, criar };
