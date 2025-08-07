// index.js
require('dotenv').config();
const express = require('express');
const path = require('path');
const cors = require('cors');

// Certifique-se de que o Firebase Admin SDK seja inicializado
require('./config/firebase');

const app = express();
const PORT = process.env.PORT || 3001;

// Middlewares para CORS e análise do corpo da requisição
app.use(cors());
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// Servir arquivos estáticos da pasta 'public'
app.use(express.static(path.join(__dirname, 'public')));
console.log(`Servindo arquivos estáticos de: ${path.join(__dirname, 'public')}`);

// Rota principal que serve o index.html.
// Esta rota é o ponto de entrada da sua aplicação de frontend (SPA - Single Page Application).
// Qualquer outra rota do frontend (como '/login', '/dashboard', etc.) será gerenciada
// pelo JavaScript do lado do cliente (navegador).
app.get('/*', (req, res) => {
    res.sendFile(path.join(__dirname, 'public', 'index.html'));
});

// Importar e usar rotas da API
const authRoutes = require('./routes/auth');
const barberRoutes = require('./routes/barbers');
app.use('/api/auth', authRoutes);
app.use('/api/barber', barberRoutes);

app.listen(PORT, () => {
    console.log(`Servidor rodando na porta ${PORT}`);
});
