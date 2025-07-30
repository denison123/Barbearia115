// backend/middleware/authMiddleware.js
const jwt = require('jsonwebtoken');

module.exports = (req, res, next) => {
    // Obtenha o token do header da requisição
    const authHeader = req.headers['authorization'];
    if (!authHeader) {
        console.warn('[Backend Auth] Acesso negado: Nenhum token fornecido.');
        return res.status(401).json({ message: 'Acesso negado: Nenhum token fornecido.' });
    }

    const token = authHeader.split(' ')[1]; // Espera "Bearer TOKEN"

    if (!token) {
        console.warn('[Backend Auth] Acesso negado: Token mal formatado.');
        return res.status(401).json({ message: 'Acesso negado: Token mal formatado.' });
    }

    try {
        // Use process.env.JWT_SECRET aqui
        const decoded = jwt.verify(token, process.env.JWT_SECRET);
        req.user = decoded; // Adiciona os dados do usuário decodificados à requisição
        next(); // Prossegue para a próxima rota/middleware
    } catch (error) {
        console.error('Erro na verificação do token:', error.message);
        // Log detalhado para depuração
        // if (error.name === 'TokenExpiredError') {
        //     return res.status(401).json({ message: 'Token expirado.' });
        // } else if (error.name === 'JsonWebTokenError') {
        //     return res.status(401).json({ message: 'Token inválido.' });
        // }
        return res.status(401).json({ message: 'Token inválido ou expirado.' });
    }
};