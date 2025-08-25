// backend/server.js

require('dotenv').config(); // Carrega as variáveis de ambiente
const express = require('express');
const mongoose = require('mongoose');
const cors = require('cors');
const agendamentoRoutes = require('./routes/agendamentoRoutes');

const app = express();
const PORT = process.env.PORT || 5000;

// Middleware para processar requisições JSON
app.use(express.json());

// Middleware para permitir requisições de diferentes origens (CORS)
app.use(cors());

// Conexão com o banco de dados MongoDB
mongoose.connect(process.env.MONGO_URI)
  .then(() => console.log('Conectado ao MongoDB!'))
  .catch(err => console.error('Erro de conexão ao MongoDB:', err));

// Usando as rotas de agendamento
app.use('/api', agendamentoRoutes);

app.listen(PORT, () => {
  console.log(`Servidor rodando na porta ${PORT}`);
});