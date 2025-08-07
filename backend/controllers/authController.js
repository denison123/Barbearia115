// backend/controllers/authController.js
const { admin, db } = require('../config/firebase');

/**
 * Lida com a requisição de login do barbeiro.
 * Note: Este endpoint pode ser usado para registro ou login dependendo da lógica.
 * A autenticação de senha é feita pelo Firebase no frontend.
 * Aqui, vamos apenas verificar se o usuário existe e obter o perfil.
 */
exports.loginBarber = async (req, res) => {
    // Essa função não é estritamente necessária se o frontend usa o Firebase Auth
    // diretamente e apenas chama a rota /profile para obter os dados.
    // Mas pode ser usada para um fluxo de login mais complexo se necessário.
    res.status(501).send({ message: "Este endpoint não está implementado, o login é tratado no frontend." });
};


/**
 * Lida com a requisição do perfil do barbeiro após o login do Firebase no frontend.
 * Usa o ID token para verificar a autenticidade do usuário e buscar seus dados.
 */
exports.profile = async (req, res) => {
    console.log('Recebida requisição para /api/auth/profile');
    // O ID token é enviado no header de Autorização
    const idToken = req.headers.authorization ? req.headers.authorization.split('Bearer ')[1] : null;

    if (!idToken) {
        console.log('Erro: ID Token não fornecido.');
        return res.status(401).send({ message: 'Não autorizado: ID Token não fornecido.' });
    }

    try {
        // Verifica o ID token usando o Firebase Admin SDK
        const decodedToken = await admin.auth().verifyIdToken(idToken);
        const uid = decodedToken.uid;
        console.log(`ID Token verificado para o UID: ${uid}`);

        // Busca o documento do barbeiro no Firestore usando o UID
        const barberRef = db.collection('barbers').doc(uid);
        const doc = await barberRef.get();

        if (!doc.exists) {
            console.log('Erro: Dados do barbeiro não encontrados para o UID:', uid);
            return res.status(404).send({ message: 'Dados do barbeiro não encontrados.' });
        }

        const barberData = doc.data();
        console.log('Dados do barbeiro encontrados:', barberData);

        // Retorna os dados do barbeiro
        return res.status(200).send({ barber: { ...barberData, id: doc.id } });

    } catch (error) {
        console.error('Erro ao verificar o ID Token ou buscar o barbeiro:', error);
        return res.status(401).send({ message: 'Não autorizado: ID Token inválido ou expirado.' });
    }
};
