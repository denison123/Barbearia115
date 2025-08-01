// backend/middleware/authMiddleware.js
const jwt = require('jsonwebtoken');

const authMiddleware = (req, res, next) => {
    // Verifique se o cabeçalho de autorização está presente
    const authHeader = req.headers.authorization;

    if (!authHeader || !authHeader.startsWith('Bearer ')) {
        console.log('Acesso negado: Cabeçalho de Autorização ausente ou mal formatado.');
        return res.status(401).json({ message: 'Acesso negado. Token não fornecido.' });
    }

    // Extraia o token do cabeçalho "Bearer <token>"
    const token = authHeader.split(' ')[1];

    try {
        // Verifique se o segredo JWT está definido
        if (!process.env.JWT_SECRET) {
            console.error('ERRO CRÍTICO: Variável de ambiente JWT_SECRET não definida.');
            return res.status(500).json({ message: 'Erro no servidor: segredo de autenticação não configurado.' });
        }

        // Verifique o token
        const decoded = jwt.verify(token, process.env.JWT_SECRET);
        
        // Adicione o payload do token à requisição para uso nas rotas
        req.user = decoded; 
        console.log('Autenticação bem-sucedida para o usuário:', req.user.id);
        next(); // Continue para o próximo middleware/rota
    } catch (error) {
        // Se o token for inválido, expire, ou houver outro erro de verificação
        console.log('Falha na autenticação: Token inválido ou expirado.', error.message);
        return res.status(401).json({ message: 'Token inválido ou expirado.' });
    }
};

module.exports = authMiddleware;
