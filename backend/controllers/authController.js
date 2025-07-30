// backend/controllers/authController.js
const jwt = require('jsonwebtoken');

const authController = {
    async login(req, res) {
        const { email, password } = req.body;
        console.log(`[Backend Auth] Tentativa de login para: ${email}`);

        // **DADOS MOCKADOS PARA SIMULAR UM LOGIN BEM-SUCEDIDO**
        // Em um projeto real, você buscaria o usuário no banco de dados
        // e verificaria a senha (usando bcrypt, por exemplo).
        if (email === 'teste@barbeiro.com' && password === 'senha123') {
            const barber = {
                id: '10uVBB3Vr4Wu6Xez9JAt', // ID do barbeiro mockado
                name: 'João Barbeiro',
                email: 'teste@barbeiro.com',
                role: 'barber' // Indica o papel do usuário (ex: admin, barbeiro, cliente)
            };

            try {
                // **ATUALIZAÇÃO CRUCIAL AQUI:**
                // Usando process.env.JWT_SECRET para assinar o token.
                // Certifique-se de que JWT_SECRET está definido no seu arquivo .env
                // e que 'dotenv' está configurado no seu index.js.
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