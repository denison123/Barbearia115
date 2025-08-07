// index.js
require('dotenv').config();
const express = require('express');
const path = require('path');
const cors = require('cors'); // Importa a biblioteca CORS

// --- GARANTA QUE O FIREBASE ADMIN SDK SEJA INICIALIZADO ---
// Apenas importe o arquivo de configuração do Firebase para garantir que ele seja executado
// e o SDK seja inicializado.
require('./config/firebase');

const app = express();
const PORT = process.env.PORT || 3001;

// --- Middlewares CORS (Solução com a biblioteca 'cors') ---
// Em ambientes de produção, é altamente recomendável especificar a origem do seu frontend
// para maior segurança. Ex: cors({ origin: 'http://localhost:3000' });
app.use(cors());

// Middlewares para análise do corpo da requisição
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// Importar rotas
const authRoutes = require('./routes/auth');
const barberRoutes = require('./routes/barbers');

// Servir arquivos estáticos da pasta 'public'
app.use(express.static(path.join(__dirname, 'public')));
console.log(`Servindo arquivos estáticos de: ${path.join(__dirname, 'public')}`);

// Usar rotas
app.use('/api/auth', authRoutes);
app.use('/api/barber', barberRoutes);

// Rota de teste
app.get('/', (req, res) => {
    res.send('Backend da Barbearia 115 está rodando!');
});

app.listen(PORT, () => {
    console.log(`Servidor rodando na porta ${PORT}`);
});
