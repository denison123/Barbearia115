// backend/controllers/barbersController.js

// O caminho está correto para acessar 'firebase.js' a partir de 'barbersController.js'
const { db } = require('../config/firebase');
const { getFirestore } = require('firebase-admin/firestore');

// Função para obter estatísticas do dashboard
exports.getDashboardStats = async (req, res) => {
    try {
        // req.user.id virá do middleware de autenticação (authMiddleware)
        const barberId = req.user.id; 
        
        if (!barberId) {
            console.error('getDashboardStats: barberId não encontrado na requisição (possivelmente authMiddleware não adicionou).');
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
};

// Função para definir/atualizar os dias de disponibilidade do barbeiro
// CORREÇÃO: Nome da função para corresponder à rota em barbers.js
exports.setAvailableDays = async (req, res) => {
    try {
        const barberId = req.user.id; // Assume que o ID do barbeiro vem do token JWT
        const { availability } = req.body; // Espera um objeto { availability: [...] }

        if (!barberId) {
            return res.status(400).json({ message: 'ID do barbeiro não fornecido.' });
        }
        if (!availability || !Array.isArray(availability)) {
            return res.status(400).json({ message: 'Dados de disponibilidade inválidos. Esperado um array.' });
        }

        const firestore = getFirestore();
        // Salva a disponibilidade em uma subcoleção ou documento específico do barbeiro
        const docRef = firestore.collection('barbers').doc(barberId).collection('availability').doc('current');
        await docRef.set({ days: availability }); // Salva como um array de dias

        return res.status(200).json({ message: 'Disponibilidade salva com sucesso!' });
    } catch (error) {
        console.error('Erro ao salvar disponibilidade:', error);
        return res.status(500).json({ message: 'Erro interno do servidor ao salvar disponibilidade.' });
    }
};

// --- STUBS PARA FUNÇÕES FALTANTES ---
// Você precisará implementar a lógica para cada uma dessas funções.
// Elas estão aqui para que as rotas em barbers.js não apontem para 'undefined'.

exports.getAppointmentsByDate = async (req, res) => {
    console.log('STUB: getAppointmentsByDate chamado. Implementar lógica.');
    return res.status(501).json({ message: 'Funcionalidade não implementada.' });
};

exports.updateAppointmentStatus = async (req, res) => {
    console.log('STUB: updateAppointmentStatus chamado. Implementar lógica.');
    return res.status(501).json({ message: 'Funcionalidade não implementada.' });
};

exports.getAvailableDays = async (req, res) => {
    console.log('STUB: getAvailableDays chamado. Implementar lógica.');
    return res.status(501).json({ message: 'Funcionalidade não implementada.' });
};

exports.getAvailableTimeSlots = async (req, res) => {
    console.log('STUB: getAvailableTimeSlots chamado. Implementar lógica.');
    return res.status(501).json({ message: 'Funcionalidade não implementada.' });
};

exports.getBarbers = async (req, res) => {
    console.log('STUB: getBarbers chamado. Implementar lógica.');
    return res.status(501).json({ message: 'Funcionalidade não implementada.' });
};

exports.createAppointment = async (req, res) => {
    console.log('STUB: createAppointment chamado. Implementar lógica.');
    return res.status(501).json({ message: 'Funcionalidade não implementada.' });
};
