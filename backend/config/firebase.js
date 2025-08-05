// backend/config/firebase.js
const admin = require('firebase-admin');
const dotenv = require('dotenv');

dotenv.config(); // Carrega variáveis de ambiente do .env se estiver em desenvolvimento local

let serviceAccount;

// Tenta carregar as credenciais da variável de ambiente FIREBASE_SERVICE_ACCOUNT_BASE64
if (process.env.FIREBASE_SERVICE_ACCOUNT_BASE64) {
    try {
        // Decodifica a string Base64 para JSON
        const decodedString = Buffer.from(process.env.FIREBASE_SERVICE_ACCOUNT_BASE64, 'base64').toString('utf8');
        serviceAccount = JSON.parse(decodedString);
        console.log('Firebase: Credenciais carregadas de FIREBASE_SERVICE_ACCOUNT_BASE64.');
    } catch (error) {
        console.error('Firebase: Erro ao decodificar ou parsear FIREBASE_SERVICE_ACCOUNT_BASE64:', error);
        // Fallback ou erro crítico se a variável não for válida
        process.exit(1); // Encerra o processo se a credencial principal falhar
    }
} else {
    // Fallback para o arquivo de chave de serviço local (apenas para desenvolvimento)
    // Em produção no Render, FIREBASE_SERVICE_ACCOUNT_BASE64 deve ser usado
    try {
        serviceAccount = require('./serviceAccountKey.json'); // Certifique-se de que este arquivo existe localmente
        console.log('Firebase: Credenciais carregadas de serviceAccountKey.json (modo de desenvolvimento/fallback).');
    } catch (error) {
        console.error('Firebase: serviceAccountKey.json não encontrado ou inválido e FIREBASE_SERVICE_ACCOUNT_BASE64 não está configurado. Erro:', error);
        process.exit(1); // Encerra o processo se nenhuma credencial for encontrada
    }
}

// IMPORTANTE: Certifique-se de que a private_key tem as quebras de linha corretas
// Se a private_key vier de uma variável de ambiente que escapa \n para \\n, corrija aqui
if (serviceAccount && serviceAccount.private_key) {
    serviceAccount.private_key = serviceAccount.private_key.replace(/\\n/g, '\n');
}

// Inicializa o Firebase Admin SDK
try {
    admin.initializeApp({
        credential: admin.credential.cert(serviceAccount)
    });
    console.log('Firebase Admin SDK inicializado com sucesso.');
} catch (error) {
    console.error('Erro ao inicializar Firebase Admin SDK:', error);
    process.exit(1); // Encerra o processo se a inicialização falhar
}

const db = admin.firestore();

module.exports = { db, admin };
