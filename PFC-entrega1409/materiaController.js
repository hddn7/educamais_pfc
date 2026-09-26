const { pool } = require('../config/db');

// Lista questoes ativas. Alunos nao recebem a resposta_esperada (evita "cola").
async function listar(req, res) {
  try {
    const { assuntoId } = req.query;
    const ehProfessorOuAdmin = ['PROFESSOR', 'ADMIN'].includes(req.usuario.papel);

    const campos = ehProfessorOuAdmin
      ? 'id, professor_id, assunto_id, enunciado, resposta_esperada, dificuldade, ativa, criado_em'
      : 'id, assunto_id, enunciado, dificuldade, criado_em';

    let sql = `SELECT ${campos} FROM questoes WHERE ativa = 1`;
    const params = [];

    if (assuntoId) {
      sql += ' AND assunto_id = ?';
      params.push(assuntoId);
    }

    sql += ' ORDER BY criado_em DESC';

    const [questoes] = await pool.query(sql, params);
    return res.json(questoes);
  } catch (err) {
    console.error('[questaoController.listar]', err);
    return res.status(500).json({ erro: 'Erro ao listar questoes.' });
  }
}

async function buscarPorId(req, res) {
  try {
    const { id } = req.params;
    const ehProfessorOuAdmin = ['PROFESSOR', 'ADMIN'].includes(req.usuario.papel);

    const campos = ehProfessorOuAdmin
      ? 'id, professor_id, assunto_id, enunciado, resposta_esperada, dificuldade, ativa, criado_em'
      : 'id, assunto_id, enunciado, dificuldade, criado_em';

    const [linhas] = await pool.query(`SELECT ${campos} FROM questoes WHERE id = ?`, [id]);

    if (linhas.length === 0) {
      return res.status(404).json({ erro: 'Questao nao encontrada.' });
    }

    return res.json(linhas[0]);
  } catch (err) {
    console.error('[questaoController.buscarPorId]', err);
    return res.status(500).json({ erro: 'Erro ao buscar questao.' });
  }
}

// Apenas professores/admin criam questoes
async function criar(req, res) {
  try {
    const { assuntoId, enunciado, respostaEsperada, dificuldade } = req.body;

    if (!assuntoId || !enunciado || !respostaEsperada) {
      return res.status(400).json({ erro: 'assuntoId, enunciado e respostaEsperada sao obrigatorios.' });
    }

    const [resultado] = await pool.query(
      `INSERT INTO questoes (professor_id, assunto_id, enunciado, resposta_esperada, dificuldade)
       VALUES (?, ?, ?, ?, ?)`,
      [req.usuario.id, assuntoId, enunciado, respostaEsperada, dificuldade || 'MEDIA']
    );

    return res.status(201).json({ id: resultado.insertId });
  } catch (err) {
    console.error('[questaoController.criar]', err);
    return res.status(500).json({ erro: 'Erro ao criar questao.' });
  }
}

async function atualizar(req, res) {
  try {
    const { id } = req.params;
    const { enunciado, respostaEsperada, dificuldade, ativa } = req.body;

    const [resultado] = await pool.query(
      `UPDATE questoes SET
         enunciado = COALESCE(?, enunciado),
         resposta_esperada = COALESCE(?, resposta_esperada),
         dificuldade = COALESCE(?, dificuldade),
         ativa = COALESCE(?, ativa)
       WHERE id = ?`,
      [enunciado, respostaEsperada, dificuldade, ativa, id]
    );

    if (resultado.affectedRows === 0) {
      return res.status(404).json({ erro: 'Questao nao encontrada.' });
    }

    return res.json({ mensagem: 'Questao atualizada com sucesso.' });
  } catch (err) {
    console.error('[questaoController.atualizar]', err);
    return res.status(500).json({ erro: 'Erro ao atualizar questao.' });
  }
}

async function remover(req, res) {
  try {
    const { id } = req.params;
    // Soft delete: apenas desativa a questao
    const [resultado] = await pool.query('UPDATE questoes SET ativa = 0 WHERE id = ?', [id]);

    if (resultado.affectedRows === 0) {
      return res.status(404).json({ erro: 'Questao nao encontrada.' });
    }

    return res.json({ mensagem: 'Questao desativada com sucesso.' });
  } catch (err) {
    console.error('[questaoController.remover]', err);
    return res.status(500).json({ erro: 'Erro ao remover questao.' });
  }
}

module.exports = { listar, buscarPorId, criar, atualizar, remover };
