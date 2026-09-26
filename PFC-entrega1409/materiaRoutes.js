const axios = require('axios');
require('dotenv').config();

/**
 * Envia a questao, a resposta esperada e a resposta do aluno para a API de IA
 * e recebe de volta uma avaliacao estruturada (correta/incorreta, nota e feedback).
 *
 * Retorna sempre um objeto no formato:
 * { correta: boolean, nota: number, feedback: string }
 */
async function corrigirResposta({ enunciado, respostaEsperada, respostaAluno }) {
  const prompt = `Voce e um assistente pedagogico que corrige respostas de alunos, incluindo alunos com autismo, entao seja claro, objetivo e gentil.

Questao: ${enunciado}
Resposta esperada (gabarito): ${respostaEsperada}
Resposta do aluno: ${respostaAluno}

Avalie a resposta do aluno e responda APENAS com um JSON valido, sem texto adicional, no formato:
{"correta": true ou false, "nota": numero de 0 a 10, "feedback": "explicacao curta, clara e encorajadora sobre o que esta certo ou errado"}`;

  try {
    const response = await axios.post(
      process.env.AI_API_URL,
      {
        model: process.env.AI_MODEL,
        max_tokens: 500,
        messages: [{ role: 'user', content: prompt }],
      },
      {
        headers: {
          'Content-Type': 'application/json',
          'x-api-key': process.env.AI_API_KEY,
          'anthropic-version': '2023-06-01',
        },
      }
    );

    const textoResposta = response.data?.content
      ?.map((bloco) => bloco.text || '')
      .join('')
      .trim();

    const jsonLimpo = textoResposta.replace(/```json|```/g, '').trim();
    const resultado = JSON.parse(jsonLimpo);

    return {
      correta: Boolean(resultado.correta),
      nota: Number(resultado.nota),
      feedback: String(resultado.feedback),
    };
  } catch (err) {
    console.error('[aiService] Erro ao chamar a API de IA:', err.message);
    // Fallback seguro caso a API de IA esteja indisponivel
    return {
      correta: null,
      nota: null,
      feedback: 'Nao foi possivel obter a correcao automatica no momento. Tente novamente em instantes.',
    };
  }
}

module.exports = { corrigirResposta };
