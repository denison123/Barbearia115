// backend/middleware/authMiddleware.js
// Middleware de autenticação de exemplo.

const authMiddleware = (req, res, next) => {
  console.log('Middleware de autenticação em execução...');

  // Simula a verificação de um token de autenticação
  const token = req.headers.authorization;

  if (token && token === 'Bearer my-secret-token') {
    // Se a autenticação for bem-sucedida, o fluxo continua
    // Em um cenário real, você decodificaria o token e anexaria o usuário ao objeto req
    console.log('Autenticação bem-sucedida.');
    next();
  } else {
    // Se a autenticação falhar, retorna um erro 401 (Não Autorizado)
    console.log('Falha na autenticação: Token inválido ou ausente.');
    res.status(401).json({ message: 'Acesso não autorizado. Token inválido ou ausente.' });
  }
};

module.exports = authMiddleware;
