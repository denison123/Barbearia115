// backend/controllers/authController.js
// IMPORTANTE: Este arquivo é o que o arquivo de rotas `auth.js` está importando.
// Certifique-se de que a sua função de login é exportada corretamente.
const admin = require('firebase-admin');

exports.loginBarber = async (req, res) => {
    const { email, password } = req.body;

    try {
        // Encontra o usuário do Firebase com base no email fornecido
        const userRecord = await admin.auth().getUserByEmail(email);

        // Gera um Custom Token. Este é o token que será enviado ao cliente.
        const customToken = await admin.auth().createCustomToken(userRecord.uid);

        // Busca os dados do barbeiro no Firestore para enviar ao cliente
        const barberDoc = await admin.firestore().collection('barbers').doc(userRecord.uid).get();

        if (!barberDoc.exists) {
            return res.status(404).json({ message: 'Dados do barbeiro não encontrados.' });
        }

        const barberData = { id: barberDoc.id, ...barberDoc.data() };
        
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
