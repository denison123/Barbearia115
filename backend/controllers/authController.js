// backend/controllers/authController.js
const { admin } = require('../config/firebase');

exports.loginBarber = async (req, res) => {
    const { email, password } = req.body;

    try {
        // 1. Encontra o usuário do Firebase com base no email fornecido
        const userRecord = await admin.auth().getUserByEmail(email);

        // 2. IMPORTANTE: Em um cenário real, você faria uma verificação da senha aqui.
        // Como o Firebase Admin SDK não tem uma função para verificar senhas
        // diretamente (isso é feito no lado do cliente), esta é uma simplificação.
        // Você precisaria de uma forma de verificar a senha, talvez com um banco
        // de dados secundário ou um serviço de autenticação personalizado.

        // 3. Se a verificação de credenciais for bem-sucedida, crie um Custom Token.
        // O Custom Token é um "bilhete" que o cliente usará para se autenticar.
        const customToken = await admin.auth().createCustomToken(userRecord.uid);

        // 4. Busca os dados do barbeiro no Firestore para enviar ao cliente
        const barberDoc = await admin.firestore().collection('barbers').doc(userRecord.uid).get();

        if (!barberDoc.exists) {
            return res.status(404).json({ message: 'Dados do barbeiro não encontrados.' });
        }

        const barberData = { id: barberDoc.id, ...barberDoc.data() };
        
        // 5. Envia o Custom Token e os dados do barbeiro para o cliente
        // O cliente usará este token para obter o Token de ID real.
        res.status(200).json({ 
            message: 'Login bem-sucedido. Use o token personalizado para autenticar o cliente.', 
            token: customToken,
            barber: barberData
        });
    } catch (error) {
        console.error('Erro no login:', error);
        res.status(401).json({ message: 'Credenciais inválidas ou erro no servidor.' });
    }
};
