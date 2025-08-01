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

// --- MIDDLEWARE CORS CUSTOMIZADO (SOLUÇÃO ROBUSTA) ---
// Adiciona os cabeçalhos CORS manualmente para garantir que funcionem.
// Você pode substituir '*' pelo URL do seu frontend em produção, como 'https://barbearia-frontend-9h56.onrender.com'
app.use((req, res, next) => {
    res.header('Access-Control-Allow-Origin', '*');
    res.header('Access-Control-Allow-Methods', 'GET, POST, PUT, DELETE, OPTIONS');
    res.header('Access-Control-Allow-Headers', 'Content-Type, Authorization');
    
    // Responde a requisições OPTIONS imediatamente
    if (req.method === 'OPTIONS') {
        return res.sendStatus(200);
    }
    
    next();
});

// Middlewares
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
