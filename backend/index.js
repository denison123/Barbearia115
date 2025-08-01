// index.js
require('dotenv').config(); // Para desenvolvimento local, Render ignora isso em produção
const express = require('express');
const path = require('path');
const cors = require('cors');
const admin = require('firebase-admin'); // Importe o Firebase Admin SDK

// --- INICIALIZAÇÃO CORRETA DO FIREBASE ADMIN SDK ---
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

// --- CONFIGURAÇÃO EXPLÍCITA DO CORS ---
// Adicione o URL do seu frontend para permitir requisições apenas dele.
// Substitua 'https://barbearia-frontend-9h56.onrender.com' pelo seu domínio de frontend.
const corsOptions = {
    origin: '*', // Se o seu frontend estiver no mesmo domínio do backend, você pode usar o domínio do frontend aqui. Para teste, '*' funciona.
    methods: ['GET', 'POST', 'PUT', 'DELETE'],
    allowedHeaders: ['Content-Type', 'Authorization']
};

app.use(cors(corsOptions));

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
