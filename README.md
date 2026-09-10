require('dotenv').config();
const express = require('express');
const cors = require('cors');
const { testConnection } = require('./config/db');

const authRoutes = require('./routes/authRoutes');
const materiaRoutes = require('./routes/materiaRoutes');
const assuntoRoutes = require('./routes/assuntoRoutes');
const questaoRoutes = require('./routes/questaoRoutes');
const respostaRoutes = require('./routes/respostaRoutes');

const app = express();

app.use(cors());
app.use(express.json());

app.get('/api/health', (req, res) => {
  res.json({ status: 'ok', servico: 'pfc-aprendizagem-backend' });
});

app.use('/api/auth', authRoutes);
app.use('/api/materias', materiaRoutes);
app.use('/api/assuntos', assuntoRoutes);
app.use('/api/questoes', questaoRoutes);
app.use('/api/respostas', respostaRoutes);

// Tratamento de rota nao encontrada
app.use((req, res) => {
  res.status(404).json({ erro: 'Rota nao encontrada.' });
});

// Tratamento de erros nao capturados
app.use((err, req, res, next) => {
  console.error('[erro nao tratado]', err);
  res.status(500).json({ erro: 'Erro interno no servidor.' });
});

const PORT = process.env.PORT || 3000;

app.listen(PORT, async () => {
  console.log(`[server] Backend do PFC rodando na porta ${PORT}`);
  await testConnection();
});
