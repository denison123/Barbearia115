// backend/middleware/authMiddleware.js
// Middleware de autenticação que verifica o token JWT do Firebase.

// Importa o módulo de administrador do Firebase
// Certifique-se de que a sua aplicação Firebase foi inicializada
// em um arquivo de configuração no seu backend.
const admin = require('firebase-admin');

// -------------------------------------------------------------
// IMPORTANTE: Adicione este trecho para inicializar o Firebase Admin SDK
// Use o caminho para o seu arquivo de service account JSON.
// const serviceAccount = require('../../path/to/seu-arquivo-firebase-admin.json');
// admin.initializeApp({
//   credential: admin.credential.cert(serviceAccount)
// });
// -------------------------------------------------------------

const authMiddleware = async (req, res, next) => {
  console.log('Middleware de autenticação em execução...');

  // 1. Obtém o cabeçalho de autorização da requisição.
  const authHeader = req.headers.authorization;

  // 2. Verifica se o cabeçalho existe e se começa com "Bearer ".
  if (!authHeader || !authHeader.startsWith('Bearer ')) {
    console.warn('Falha na autenticação: Cabeçalho Authorization ausente ou inválido.');
    return res.status(401).json({ message: 'Acesso não autorizado. O token de autenticação está ausente.' });
  }

  // 3. Extrai o token JWT (removendo a parte "Bearer ").
  const token = authHeader.split(' ')[1];

  try {
    // 4. Utiliza o Firebase Admin SDK para verificar o token.
    // Esta é a parte que substitui a sua verificação manual.
    const decodedToken = await admin.auth().verifyIdToken(token);

    // 5. Se a verificação for bem-sucedida, anexa o usuário decodificado à requisição.
    // Isso torna os dados do usuário disponíveis para os próximos handlers de rota.
    req.user = decodedToken;
    console.log('Autenticação bem-sucedida. Usuário:', req.user.email);
    
    // 6. Chama o próximo middleware/handler de rota.
    next();
  } catch (error) {
    // 7. Se a verificação falhar (token inválido, expirado, etc.), retorna um erro 401.
    console.error('Falha na autenticação: Token inválido ou expirado.', error.message);
    res.status(401).json({ message: 'Acesso não autorizado. O token é inválido ou expirou.' });
  }
};

module.exports = authMiddleware;
