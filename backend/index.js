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

// CORREÇÃO: Esta rota principal serve o arquivo index.html,
// que é o ponto de entrada da sua aplicação de frontend.
app.get('/', (req, res) => {
    res.sendFile(path.join(__dirname, 'public', 'index.html'));
});

// Rota para servir o arquivo login.html diretamente
// Acessível em https://barbearia-backend-9h56.onrender.com/login.html
app.get('/login.html', (req, res) => {
    res.sendFile(path.join(__dirname, 'public', 'login.html'));
});

// Importar e usar rotas da API
const authRoutes = require('./routes/auth');
const barberRoutes = require('./routes/barbers');
app.use('/api/auth', authRoutes);
app.use('/api/barber', barberRoutes);

// A rota de dashboard também é uma parte do frontend e é servida por express.static
// app.get('/barber-dashboard.html', (req, res) => {
//    res.sendFile(path.join(__dirname, 'public', 'barber-dashboard.html'));
// });

app.listen(PORT, () => {
    console.log(`Servidor rodando na porta ${PORT}`);
});
