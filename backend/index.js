// index.js
require('dotenv').config(); // Para desenvolvimento local, Render ignora isso em produção
const express = require('express');
const path = require('path');
const cors = require('cors');
const admin = require('firebase-admin'); // Importe o Firebase Admin SDK

// --- INICIALIZAÇÃO CORRETA DO FIREBASE ADMIN SDK ---
// Use a variável de ambiente para as credenciais em produção (Render)
const serviceAccountBase64 = process.env.FIREBASE_SERVICE_ACCOUNT_BASE64;

if (serviceAccountBase64) {
    try {
        const serviceAccount = JSON.parse(Buffer.from(serviceAccountBase64, 'base64').toString('utf8'));
        admin.initializeApp({
            credential: admin.credential.cert(serviceAccount)
            // Se você estiver usando Realtime Database ou Cloud Storage, adicione databaseURL ou storageBucket
            // databaseURL: "https://<YOUR_PROJECT_ID>.firebaseio.com"
        });
        console.log('Firebase Admin SDK inicializado com sucesso via variável de ambiente.');
    } catch (error) {
        console.error('ERRO CRÍTICO: Falha ao inicializar Firebase Admin SDK a partir da variável de ambiente:', error);
        // Em um ambiente de produção, é crucial que o servidor não continue se o Firebase não inicializar.
        // Isso fará com que o Render detecte a falha mais rapidamente.
        process.exit(1);
    }
} else {
    console.error('ERRO CRÍTICO: Variável de ambiente FIREBASE_SERVICE_ACCOUNT_BASE64 não encontrada. Firebase Admin SDK NÃO inicializado.');
    // Se a variável não for encontrada, o servidor não deve iniciar.
    process.exit(1);
}

const app = express();
const PORT = process.env.PORT || 3001; // Render fornecerá process.env.PORT

// Middlewares
app.use(cors()); // Use CORS se o frontend estiver em um domínio diferente
app.use(express.json()); // Para parsear JSON no corpo das requisições

// Importar rotas (coloque após a inicialização do Firebase se as rotas dependem dele)
const authRoutes = require('./routes/auth');
const barberRoutes = require('./routes/barbers');

// Servir arquivos estáticos da pasta 'public'
// ATENÇÃO: Se o seu frontend for um Static Site no Render, esta linha pode não ser necessária
// no seu backend, a menos que o backend também sirva o frontend.
// Se você está implantando o frontend como um Static Site SEPARADO, remova esta linha.
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
})