// backend/controllers/authController.js
const jwt = require('jsonwebtoken');
const admin = require('../config/firebase'); // Importe o admin aqui
const db = admin.firestore(); // Obtenha a instância do Firestore a partir do admin

const authController = {
    async login(req, res) {
        const { email, password } = req.body;
        console.log(`[Backend Auth] Tentativa de login para: ${email}`);

        // A CORREÇÃO ESTÁ AQUI: O ID do barbeiro deve ser consistente
        // com o ID do documento do Firestore.
        // Em um projeto real, você buscaria o usuário no banco de dados e usaria
        // o ID do documento do Firestore (doc.id) para gerar o token.
        // Como estamos usando dados mockados, ajustamos para o ID correto.
        const correctBarberId = '10uVBB3Vr4Wu6Xezj9At';

        // **DADOS MOCKADOS PARA SIMULAR UM LOGIN BEM-SUCEDIDO**
        if (email === 'teste@barbeiro.com' && password === 'senha123') {
            const barber = {
                id: correctBarberId, // ID do barbeiro mockado (CORRIGIDO)
                name: 'João Barbeiro',
                email: 'teste@barbeiro.com',
                role: 'barber'
            };

            try {
                // **ATUALIZAÇÃO CRUCIAL AQUI:**
                // Usando process.env.JWT_SECRET para assinar o token.
                const token = jwt.sign(barber, process.env.JWT_SECRET, { expiresIn: '1h' });

                console.log(`[Backend Auth] Login bem-sucedido para ${email}. Token gerado.`);
                return res.status(200).json({
                    message: 'Login bem-sucedido',
                    token,
                    barber: {
                        id: barber.id,
                        name: barber.name,
                        email: barber.email
                    }
                });
            } catch (jwtError) {
                console.error('[Backend Auth] Erro ao gerar token JWT:', jwtError);
                return res.status(500).json({ message: 'Erro interno do servidor ao gerar token.' });
            }
        } else {
            console.warn(`[Backend Auth] Tentativa de login falhou para: ${email}. Credenciais inválidas.`);
            return res.status(401).json({ message: 'Credenciais inválidas.' });
        }
    },
};

module.exports = authController;
