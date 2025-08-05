// backend/config/firebase.js
const admin = require('firebase-admin');

// Obter o conteúdo da chave de serviço das variáveis de ambiente do Render.
// Certifique-se de que o nome da variável de ambiente corresponde EXATAMENTE ao que você definiu no Render.
const serviceAccountKeyString = process.env.FIREBASE_SERVICE_ACCOUNT_KEY; // <<< AQUI ESTÁ A CHAVE!

// Verifique se a variável de ambiente existe
if (!serviceAccountKeyString) {
  console.error('A variável de ambiente FIREBASE_SERVICE_ACCOUNT_KEY não foi encontrada.');
  console.error('Por favor, adicione o conteúdo do seu arquivo serviceAccountKey.json como uma variável de ambiente no painel do Render.');
} else {
  try {
    // Analise o conteúdo JSON da variável de ambiente
    const serviceAccount = JSON.parse(serviceAccountKeyString);

    // Inicialize o SDK do Firebase Admin se ainda não foi inicializado
    if (!admin.apps.length) {
      admin.initializeApp({
        credential: admin.credential.cert(serviceAccount)
      });
      console.log('Firebase Admin SDK inicializado com sucesso via variável de ambiente.');
    }
  } catch (error) {
    console.error('Erro ao analisar a variável de ambiente FIREBASE_SERVICE_ACCOUNT_KEY:', error);
    console.error('Certifique-se de que o valor é um JSON válido e que não há caracteres extras.');
    console.error('Conteúdo problemático (primeiros 50 caracteres):', serviceAccountKeyString.substring(0, 50)); // Ajuda a diagnosticar
  }
}

// Exporte o objeto 'admin' inicializado.
module.exports = admin;
