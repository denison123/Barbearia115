// index.js
require('dotenv').config();
const express = require('express');
const path = require('path');
// Não precisamos mais do 'admin' aqui, pois a inicialização será feita em firebase.js
// const admin = require('firebase-admin');

// --- GARANTA QUE O FIREBASE ADMIN SDK SEJA INICIALIZADO ---
// Apenas importe o arquivo de configuração do Firebase para garantir que ele seja executado
// e o SDK seja inicializado.
require('./config/firebase'); // Isso irá executar o código em firebase.js

const app = express();
const PORT = process.env.PORT || 3001;

// --- Middlewares CORS (Solução Definitiva) ---
// Middleware para lidar com todas as requisições de pré-voo (OPTIONS) e definir os cabeçalhos CORS
app.use((req, res, next) => {
    // Definir os cabeçalhos CORS para permitir acesso de qualquer origem
    res.header('Access-Control-Allow-Origin', '*');
    res.header('Access-Control-Allow-Methods', 'GET, POST, PUT, DELETE, OPTIONS');
    res.header('Access-Control-Allow-Headers', 'Content-Type, Authorization');

    // Se a requisição for do tipo OPTIONS, respondemos com status 200 e terminamos o fluxo
    if (req.method === 'OPTIONS') {
        console.log('Requisição OPTIONS recebida, respondendo com 200 OK.');
        return res.sendStatus(200);
    }
    
    // Se não for uma requisição OPTIONS, continuamos para o próximo middleware/rota
    next();
});

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
