// index.js
require('dotenv').config();
const express = require('express');
const path = require('path');
const admin = require('firebase-admin');

// --- INICIALIZAÇÃO DO FIREBASE ADMIN SDK ---
const serviceAccountBase64 = process.env.FIREBASE_SERVICE_ACCOUNT_BASE64;

if (serviceAccountBase64) {
    try {
        const serviceAccount = JSON.parse(Buffer.from(serviceAccountBase64, 'base64').toString('utf8'));
        admin.initializeApp({
            credential: admin.credential.cert(serviceAccount)
        });
        console.log('Firebase Admin SDK inicializado com sucesso via variável de ambiente.');
    } catch (error) {
        console.error('ERRO CRÍTICO: Falha ao inicializar Firebase Admin SDK a partir da variável de ambiente:', error);
        process.exit(1);
    }
} else {
    console.error('ERRO CRÍTICO: Variável de ambiente FIREBASE_SERVICE_ACCOUNT_BASE64 não encontrada. Firebase Admin SDK NÃO inicializado.');
    process.exit(1);
}

const app = express();
const PORT = process.env.PORT || 3001;

// --- Middlewares CORS (Solução Definitiva) ---
// Middleware para lidar com as requisições de pré-voo (OPTIONS)
app.use((req, res, next) => {
    // Definir os cabeçalhos CORS para permitir acesso de qualquer origem
    res.header('Access-Control-Allow-Origin', '*');
    res.header('Access-Control-Allow-Methods', 'GET, POST, PUT, DELETE, OPTIONS');
    res.header('Access-Control-Allow-Headers', 'Content-Type, Authorization');

    // Se a requisição for do tipo OPTIONS, respondemos com status 200 e terminamos o fluxo
    if (req.method === 'OPTIONS') {
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
