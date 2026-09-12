const { pool } = require('../config/db');
const { corrigirResposta } = require('../services/aiService');

// Aluno envia uma resposta para uma questao; o backend consulta a IA e salva a correcao
async function enviar(req, res) {
  try {
    const { questaoId, resposta } = req.body;

    if (!questaoId || !resposta) {
      return res.status(400).json({ erro: 'questaoId e resposta sao obrigatorios.' });
    }

    const [questoes] = await pool.query(
      'SELECT id, enunciado, resposta_esperada FROM questoes WHERE id = ? AND ativa = 1',
      [questaoId]
    );

    if (questoes.length === 0) {
      return res.status(404).json({ erro: 'Questao nao encontrada ou inativa.' });
    }

    const questao = questoes[0];

    const correcao = await corrigirResposta({
      enunciado: questao.enunciado,
      respostaEsperada: questao.resposta_esperada,
      respostaAluno: resposta,
    });

    const [resultado] = await pool.query(
      `INSERT INTO respostas (aluno_id, questao_id, resposta_aluno, correta, nota, feedback_ia)
       VALUES (?, ?, ?, ?, ?, ?)`,
      [req.usuario.id, questaoId, resposta, correcao.correta, correcao.nota, correcao.feedback]
    );

    return res.status(201).json({
      id: resultado.insertId,
      correta: correcao.correta,
      nota: correcao.nota,
      feedback: correcao.feedback,
    });
  } catch (err) {
    console.error('[respostaController.enviar]', err);
    return res.status(500).json({ erro: 'Erro ao enviar e corrigir resposta.' });
  }
}

// Historico de respostas do proprio aluno logado
async function minhasRespostas(req, res) {
  try {
    const [linhas] = await pool.query(
      `SELECT r.id, r.questao_id, q.enunciado, r.resposta_aluno, r.correta, r.nota, r.feedback_ia, r.criado_em
       FROM respostas r
       JOIN questoes q ON q.id = r.questao_id
       WHERE r.aluno_id = ?
       ORDER BY r.criado_em DESC`,
      [req.usuario.id]
    );
    return res.json(linhas);
  } catch (err) {
    console.error('[respostaController.minhasRespostas]', err);
    return res.status(500).json({ erro: 'Erro ao buscar historico de respostas.' });
  }
}

// Professor/admin: visualiza todas as respostas dadas para uma questao especifica
async function respostasPorQuestao(req, res) {
  try {
    const { questaoId } = req.params;
    const [linhas] = await pool.query(
      `SELECT r.id, r.aluno_id, u.nome AS aluno_nome, r.resposta_aluno, r.correta, r.nota, r.feedback_ia, r.criado_em
       FROM respostas r
       JOIN usuarios u ON u.id = r.aluno_id
       WHERE r.questao_id = ?
       ORDER BY r.criado_em DESC`,
      [questaoId]
    );
    return res.json(linhas);
  } catch (err) {
    console.error('[respostaController.respostasPorQuestao]', err);
    return res.status(500).json({ erro: 'Erro ao buscar respostas da questao.' });
  }
}

module.exports = { enviar, minhasRespostas, respostasPorQuestao };
