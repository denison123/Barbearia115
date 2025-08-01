// backend/controllers/barbersController.js
// Importa o módulo 'path' para ajudar com caminhos de arquivos.
const path = require('path');

// Log de depuração para verificar o caminho.
// __dirname é a pasta atual (backend/controllers).
// O require tenta aceder a '../../firebase.js', o que deveria ser a raiz do projeto.
console.log('Pasta atual:', __dirname);
console.log('Tentando aceder ao módulo em:', path.join(__dirname, '../../firebase'));

// O caminho abaixo é o mais provável se a estrutura for:
// - projeto/
//   - backend/
//     - controllers/
//       - barbersController.js
//   - firebase.js
const { db } = require('../../firebase');

const { getFirestore } = require('firebase-admin/firestore');

const barbersController = {
    getDashboardStats: async (req, res) => {
        try {
            const barberId = req.user.id;
            
            if (!barberId) {
                console.error('getDashboardStats: barberId não encontrado na requisição.');
                return res.status(400).json({ message: 'ID do barbeiro não fornecido.' });
            }

            console.log(`Buscando estatísticas para o barbeiro com ID: ${barberId}`);

            const firestore = getFirestore();
            const collectionRef = firestore.collection('appointment_schedules');
            const q = collectionRef.where('barberId', '==', barberId);
            const querySnapshot = await q.get();

            let completedAppointments = 0;
            let pendingAppointments = 0;
            let cancelledAppointments = 0;

            querySnapshot.forEach(doc => {
                const data = doc.data();
                if (data.status === 'completed') {
                    completedAppointments++;
                } else if (data.status === 'pending') {
                    pendingAppointments++;
                } else if (data.status === 'cancelled') {
                    cancelledAppointments++;
                }
            });

            const stats = {
                monthly: {
                    cortesRealizados: completedAppointments,
                    cortesPendentes: pendingAppointments,
                    cortesCancelados: cancelledAppointments,
                },
            };
            
            console.log('Estatísticas encontradas:', stats.monthly);
            return res.status(200).json(stats);

        } catch (error) {
            console.error('Erro ao buscar estatísticas do dashboard:', error);
            return res.status(500).json({ message: 'Erro interno do servidor ao buscar estatísticas.' });
        }
    },
    
    setAvailability: async (req, res) => {
        try {
            const barberId = req.user.id;
            const { availability } = req.body;
            
            if (!barberId) {
                return res.status(400).json({ message: 'ID do barbeiro não fornecido.' });
            }

            const firestore = getFirestore();
            const docRef = firestore.collection('barber_availability').doc(barberId);
            await docRef.set({ availability });

            return res.status(200).json({ message: 'Disponibilidade salva com sucesso!' });
        } catch (error) {
            console.error('Erro ao salvar disponibilidade:', error);
            return res.status(500).json({ message: 'Erro interno do servidor.' });
        }
    }
};

module.exports = barbersController;
