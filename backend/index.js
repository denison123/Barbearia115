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

// Rota de teste
// Esta rota agora não é mais a principal e foi removida para que a rota '/' sirva o index.html
// app.get('/', (req, res) => {
//    res.send('Backend da Barbearia 115 está rodando!');
// });

// CORREÇÃO: Nova rota raiz que servirá o arquivo index.html,
// permitindo que o frontend seja carregado corretamente.
app.get('/', (req, res) => {
    res.sendFile(path.join(__dirname, 'public', 'index.html'));
});

// Importar e usar rotas da API
const authRoutes = require('./routes/auth');
const barberRoutes = require('./routes/barbers');
app.use('/api/auth', authRoutes);
app.use('/api/barber', barberRoutes);

// Rota para servir o arquivo login.html diretamente
app.get('/login.html', (req, res) => {
    // A rota deve apontar para o caminho correto do seu arquivo HTML
    res.sendFile(path.join(__dirname, 'public', 'login.html'));
});

app.listen(PORT, () => {
    console.log(`Servidor rodando na porta ${PORT}`);
});
