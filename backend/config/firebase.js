// backend/config/firebase.js
const admin = require('firebase-admin');
const dotenv = require('dotenv');

dotenv.config(); // Carrega variáveis de ambiente do .env se estiver em desenvolvimento local

const serviceAccount = {
    type: process.env.FIREBASE_TYPE,
    project_id: process.env.FIREBASE_PROJECT_ID,
    private_key_id: process.env.FIREBASE_PRIVATE_KEY_ID,
    // IMPORTANTE: A private_key deve ter as quebras de linha substituídas corretamente.
    // Use .replace(/\\n/g, '\n') para garantir que \\n seja interpretado como uma quebra de linha.
    private_key: process.env.FIREBASE_PRIVATE_KEY ? process.env.FIREBASE_PRIVATE_KEY.replace(/\\n/g, '\n') : undefined,
    client_email: process.env.FIREBASE_CLIENT_EMAIL,
    client_id: process.env.FIREBASE_CLIENT_ID,
    auth_uri: process.env.FIREBASE_AUTH_URI,
    token_uri: process.env.FIREBASE_TOKEN_URI,
    auth_provider_x509_cert_url: process.env.FIREBASE_AUTH_PROVIDER_X509_CERT_URL,
    client_x509_cert_url: process.env.FIREBASE_CLIENT_X509_CERT_URL,
    universe_domain: process.env.FIREBASE_UNIVERSE_DOMAIN
};

// Verificação básica para garantir que as credenciais essenciais existem
if (!serviceAccount.project_id || !serviceAccount.private_key || !serviceAccount.client_email) {
    console.error('Erro: Variáveis de ambiente essenciais do Firebase (PROJECT_ID, PRIVATE_KEY, CLIENT_EMAIL) não encontradas ou estão incompletas.');
    console.error('Por favor, verifique se todas as variáveis de ambiente do Firebase estão configuradas corretamente no Render.');
    process.exit(1); // Encerra o processo se as credenciais estiverem faltando
}

// Inicializa o Firebase Admin SDK
try {
    if (!admin.apps.length) { // Evita inicializar múltiplas vezes em ambientes de desenvolvimento
        admin.initializeApp({
            credential: admin.credential.cert(serviceAccount)
        });
        console.log(`Firebase Admin SDK inicializado com sucesso para o projeto: ${serviceAccount.project_id}`);
    }
} catch (error) {
    console.error('Erro ao inicializar Firebase Admin SDK:', error);
    process.exit(1); // Encerra o processo se a inicialização falhar
}

const db = admin.firestore();

module.exports = { db, admin };
