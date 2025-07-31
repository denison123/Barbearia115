// index.js
require('dotenv').config(); // Certifique-se de carregar as variáveis de ambiente primeiro
const express = require('express');
const path = require('path');
const cors = require('cors'); // Se você estiver usando CORS
const admin = require('firebase-admin'); // Importe o Firebase Admin SDK

// Importar rotas
const authRoutes = require('./routes/auth');
const barberRoutes = require('./routes/barbers');

// **Inicialização do Firebase Admin SDK**
// Certifique-se de que o caminho para o arquivo de credenciais está correto
// Corrigido o caminho para 'config/serviceAccountKey.json' conforme sua estrutura de pastas
const serviceAccount = require('./config/serviceAccountKey.json'); // Caminho CORRETO para o seu arquivo JSON

const serviceAccountBase64 = process.env.FIREBASE_SERVICE_ACCOUNT_BASE64;

if (serviceAccountBase64) {
    try {
        const serviceAccount = JSON.parse(Buffer.from(serviceAccountBase64, 'base64').toString('utf8'));
        admin.initializeApp({
            credential: admin.credential.cert(serviceAccount)
        });
        console.log('Firebase Admin SDK inicializado com sucesso via variável de ambiente.');
    } catch (error) {
        console.error('Erro ao inicializar Firebase Admin SDK a partir da variável de ambiente:', error);
        // Considere sair do processo se a inicialização do Firebase for crítica
        // process.exit(1);
    }
} else {
    console.warn('Variável de ambiente FIREBASE_SERVICE_ACCOUNT_BASE64 não encontrada. Firebase Admin SDK não inicializado.');
    // Se o Firebase Admin SDK for essencial, você pode querer lançar um erro ou sair aqui.
}

admin.initializeApp({
    credential: admin.credential.cert(serviceAccount),
    // Se você estiver usando Realtime Database ou Cloud Storage, adicione databaseURL ou storageBucket
    // databaseURL: "https://<YOUR_PROJECT_ID>.firebaseio.com"
});

const app = express();
const PORT = process.env.PORT || 3001;

// Middlewares
app.use(cors()); // Use CORS se o frontend estiver em um domínio diferente
app.use(express.json()); // Para parsear JSON no corpo das requisições

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
