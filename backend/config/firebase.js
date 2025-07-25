// backend/config/firebase.js
const admin = require('firebase-admin');

// ATENÇÃO: Substitua './serviceAccountKey.json' pelo caminho REAL do seu arquivo JSON.
// Se o serviceAccountKey.json está na mesma pasta config/, use './serviceAccountKey.json'
// Se estivesse na raiz do backend, seria '../serviceAccountKey.json'
const serviceAccount = require('./serviceAccountKey.json');

// Verifique se o app Firebase já foi inicializado para evitar erros
if (!admin.apps.length) {
    admin.initializeApp({
        credential: admin.credential.cert(serviceAccount)
        // Se você usar outros serviços como Realtime Database ou Storage, adicione as URLs aqui:
        // databaseURL: "https://your-project-id.firebaseio.com",
        // storageBucket: "your-project-id.appspot.com"
    });
}

module.exports = admin; // Exporta o objeto 'admin' inicializado corretamente