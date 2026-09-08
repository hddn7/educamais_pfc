const { pool } = require('../config/db');

async function listar(req, res) {
  try {
    const { materiaId } = req.query;

    let sql = 'SELECT id, materia_id, nome FROM assuntos';
    const params = [];

    if (materiaId) {
      sql += ' WHERE materia_id = ?';
      params.push(materiaId);
    }

    sql += ' ORDER BY nome';

    const [assuntos] = await pool.query(sql, params);
    return res.json(assuntos);
  } catch (err) {
    console.error('[assuntoController.listar]', err);
    return res.status(500).json({ erro: 'Erro ao listar assuntos.' });
  }
}

async function criar(req, res) {
  try {
    const { materiaId, nome } = req.body;
    if (!materiaId || !nome) {
      return res.status(400).json({ erro: 'materiaId e nome sao obrigatorios.' });
    }

    const [resultado] = await pool.query(
      'INSERT INTO assuntos (materia_id, nome) VALUES (?, ?)',
      [materiaId, nome]
    );
    return res.status(201).json({ id: resultado.insertId, materiaId, nome });
  } catch (err) {
    if (err.code === 'ER_DUP_ENTRY') {
      return res.status(409).json({ erro: 'Este assunto ja existe para a materia informada.' });
    }
    console.error('[assuntoController.criar]', err);
    return res.status(500).json({ erro: 'Erro ao criar assunto.' });
  }
}

module.exports = { listar, criar };
