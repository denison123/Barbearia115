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
exports.setAvailableDays = async (req, res) => {
    try {
        const barberId = req.user.id; // Assume que o ID do barbeiro vem do token JWT
        const { availableDates } = req.body; 

        if (!barberId) {
            return res.status(400).json({ message: 'ID do barbeiro não fornecido.' });
        }
        if (!availableDates || !Array.isArray(availableDates)) {
            return res.status(400).json({ message: 'Dados de disponibilidade inválidos. Esperado um array.' });
        }

        const firestore = getFirestore();
        const docRef = firestore.collection('barber_available_days').doc(barberId);
        await docRef.set({ dates: availableDates }); // Salva como um array no campo 'dates'

        return res.status(200).json({ message: 'Disponibilidade salva com sucesso!' });
    } catch (error) {
        console.error('Erro ao salvar disponibilidade:', error);
        return res.status(500).json({ message: 'Erro interno do servidor ao salvar disponibilidade.' });
    }
};

// Implementação da função para obter os dias de disponibilidade de um barbeiro
exports.getAvailableDays = async (req, res) => {
    console.log('[getAvailableDays] Buscando dias disponíveis...');
    try {
        const { barberId } = req.params; // Obtém o ID do barbeiro dos parâmetros da URL

        if (!barberId) {
            console.error('getAvailableDays: ID do barbeiro não fornecido na requisição.');
            return res.status(400).json({ message: 'ID do barbeiro não fornecido.' });
        }

        const firestore = getFirestore();
        const docRef = firestore.collection('barber_available_days').doc(barberId);
        console.log(`[getAvailableDays] Tentando buscar documento: barber_available_days/${barberId}`);
        const docSnapshot = await docRef.get();

        console.log(`[getAvailableDays] docSnapshot.exists: ${docSnapshot.exists}`);
        if (docSnapshot.exists) {
            const data = docSnapshot.data();
            console.log(`[getAvailableDays] Dados do documento:`, data);
            const availableDays = data.dates || []; // Retorna o array do campo 'dates' ou um array vazio
            console.log(`[getAvailableDays] Dias disponíveis para ${barberId}:`, availableDays);
            return res.status(200).json(availableDays);
        } else {
            console.log(`[getAvailableDays] Nenhum documento de disponibilidade encontrado para o barbeiro ${barberId}.`);
            return res.status(200).json([]); // Retorna um array vazio se o documento não existir
        }
    } catch (error) {
        console.error('Erro ao buscar dias disponíveis:', error);
        return res.status(500).json({ message: 'Erro interno do servidor ao buscar dias disponíveis.' });
    }
};


// Implementação da função para obter a lista de barbeiros
exports.getBarbers = async (req, res) => {
    try {
        const firestore = getFirestore();
        const barbersRef = firestore.collection('barbers'); 
        console.log('[getBarbers] Buscando documentos na coleção "barbers".');
        const snapshot = await barbersRef.get();

        if (snapshot.empty) {
            console.log('[getBarbers] Nenhum barbeiro encontrado na coleção "barbers".');
            return res.status(200).json([]); 
        }

        const barbers = [];
        for (const doc of snapshot.docs) { 
            const barberData = { id: doc.id, ...doc.data() };
            console.log(`[getBarbers] Processando barbeiro: ${barberData.id}, nome: ${barberData.name}`);

            // Busca os dias de disponibilidade para cada barbeiro
            const availabilityDocRef = firestore.collection('barber_available_days').doc(barberData.id);
            console.log(`[getBarbers] Tentando buscar disponibilidade para: barber_available_days/${barberData.id}`);
            const availabilitySnapshot = await availabilityDocRef.get();
            
            console.log(`[getBarbers] availabilitySnapshot.exists para ${barberData.id}: ${availabilitySnapshot.exists}`);
            if (availabilitySnapshot.exists) {
                const availabilityData = availabilitySnapshot.data();
                console.log(`[getBarbers] Dados de disponibilidade brutos para ${barberData.id}:`, availabilityData);
                barberData.availableDays = availabilityData.dates || [];
                console.log(`[getBarbers] Dias disponíveis processados para ${barberData.id}:`, barberData.availableDays);
            } else {
                barberData.availableDays = [];
                console.log(`[getBarbers] Nenhum documento de disponibilidade encontrado para ${barberData.id}.`);
            }
            barbers.push(barberData);
        }

        console.log('Lista final de barbeiros encontrada:', barbers);
        return res.status(200).json(barbers);
    } catch (error) {
        console.error('Erro ao buscar a lista de barbeiros:', error);
        return res.status(500).json({ message: 'Erro interno do servidor ao buscar barbeiros.' });
    }
};

// Implementação da função para obter horários disponíveis para agendamento
exports.getAvailableTimeSlots = async (req, res) => {
    console.log('[getAvailableTimeSlots] Buscando horários disponíveis...');
    try {
        const { barberId } = req.params; // ID do barbeiro
        const { date } = req.query;     // Data no formato YYYY-MM-DD

        if (!barberId || !date) {
            return res.status(400).json({ message: 'ID do barbeiro e data são obrigatórios.' });
        }

        const firestore = getFirestore();
        
        // 1. Obter os horários de trabalho padrão do barbeiro (se existirem)
        // Por exemplo, você pode ter uma coleção 'barber_settings' ou campos no documento do barbeiro
        // Por enquanto, vamos usar horários fixos para demonstração.
        const defaultStartHour = 9; // 9:00
        const defaultEndHour = 18;  // 18:00
        const intervalMinutes = 60; // Slots de 60 minutos

        let allPossibleSlots = [];
        for (let hour = defaultStartHour; hour < defaultEndHour; hour++) {
            // Adiciona horários no formato 'HH:MM'
            allPossibleSlots.push(`${String(hour).padStart(2, '0')}:00`);
            // Se precisar de intervalos de 30 minutos, adicione:
            // allPossibleSlots.push(`${String(hour).padStart(2, '0')}:30`);
        }

        // 2. Obter agendamentos existentes para o barbeiro na data específica
        const appointmentsRef = firestore.collection('appointment_schedules');
        const q = appointmentsRef
            .where('barberId', '==', barberId)
            .where('date', '==', date); // Assumindo que você salva a data como string 'YYYY-MM-DD'

        const querySnapshot = await q.get();
        const bookedSlots = new Set();

        querySnapshot.forEach(doc => {
            const appt = doc.data();
            // Assumindo que appt.dateTime é uma string ISO ou um Timestamp do Firestore
            let apptTime;
            if (appt.dateTime && typeof appt.dateTime === 'object' && appt.dateTime._seconds !== undefined) {
                // Se for um Timestamp do Firestore
                const dateObj = new Date(appt.dateTime._seconds * 1000);
                apptTime = dateObj.toLocaleTimeString('pt-BR', { hour: '2-digit', minute: '2-digit' });
            } else if (typeof appt.dateTime === 'string') {
                // Se for uma string (e.g., "YYYY-MM-DDTHH:MM:SS")
                const dateObj = new Date(appt.dateTime);
                apptTime = dateObj.toLocaleTimeString('pt-BR', { hour: '2-digit', minute: '2-digit' });
            }
            
            // Normaliza o horário para o formato 'HH:MM' para comparação
            if (apptTime) {
                const [hour, minute] = apptTime.split(':');
                bookedSlots.add(`${hour}:${minute}`);
            }
        });

        // 3. Filtrar os horários possíveis para remover os já agendados
        const availableSlots = allPossibleSlots.filter(slot => !bookedSlots.has(slot));

        console.log(`[getAvailableTimeSlots] Horários disponíveis para ${barberId} em ${date}:`, availableSlots);
        return res.status(200).json(availableSlots);

    } catch (error) {
        console.error('Erro ao buscar horários disponíveis:', error);
        return res.status(500).json({ message: 'Erro interno do servidor ao buscar horários disponíveis.' });
    }
};

// Implementação da função para obter agendamentos por data para o dashboard do barbeiro
exports.getAppointmentsByDate = async (req, res) => {
    console.log('[getAppointmentsByDate] Buscando agendamentos por data para o dashboard...');
    try {
        const barberId = req.user.id; // Assume que o ID do barbeiro vem do token JWT
        const { date, month, year } = req.query; // Pode vir uma data específica ou mês/ano

        if (!barberId) {
            console.error('getAppointmentsByDate: ID do barbeiro não fornecido na requisição.');
            return res.status(400).json({ message: 'ID do barbeiro não fornecido.' });
        }

        const firestore = getFirestore();
        const appointmentsRef = firestore.collection('appointment_schedules');
        let q = appointmentsRef.where('barberId', '==', barberId);

        if (date) {
            // Se uma data específica for fornecida (formato YYYY-MM-DD)
            q = q.where('date', '==', date);
            console.log(`[getAppointmentsByDate] Buscando agendamentos para o barbeiro ${barberId} na data: ${date}`);
        } else if (month !== undefined && year !== undefined) {
            // Se mês e ano forem fornecidos (para o calendário de marcação)
            // Firebase não permite query por substring ou mês/ano diretamente em Timestamp
            // Assumimos que 'date' é salvo como 'YYYY-MM-DD' para facilitar a query por mês/ano
            // Ou que 'dateTime' é um Timestamp e precisamos filtrar no cliente ou ajustar a query
            // Para evitar problemas de índice e simplificar, vamos buscar todos os agendamentos do barbeiro
            // e filtrar por mês/ano no código, se a data não for fornecida.
            console.warn('[getAppointmentsByDate] Buscando agendamentos por mês/ano sem campo indexado. Pode ser ineficiente para muitos dados.');
            // A rota do frontend para marcar dias no calendário de agendamentos (fetchAndMarkAppointmentsInCalendar)
            // já envia month e year. Vamos buscar todos os agendamentos do barbeiro e filtrar pelo mês/ano.
        } else {
            return res.status(400).json({ message: 'Data ou mês/ano são obrigatórios.' });
        }

        const querySnapshot = await q.get();
        const appointments = [];

        querySnapshot.forEach(doc => {
            const data = doc.data();
            // Se a query foi por mês/ano e não por data exata, filtre aqui
            if (month !== undefined && year !== undefined && !date) {
                let apptDateObj;
                if (data.dateTime && typeof data.dateTime === 'object' && data.dateTime._seconds !== undefined) {
                    apptDateObj = new Date(data.dateTime._seconds * 1000);
                } else if (typeof data.dateTime === 'string') {
                    apptDateObj = new Date(data.dateTime);
                }

                if (apptDateObj && apptDateObj.getFullYear() === parseInt(year) && apptDateObj.getMonth() === parseInt(month)) {
                    appointments.push({ id: doc.id, ...data });
                }
            } else {
                appointments.push({ id: doc.id, ...data });
            }
        });

        console.log(`[getAppointmentsByDate] Agendamentos encontrados:`, appointments);
        return res.status(200).json(appointments);

    } catch (error) {
        console.error('Erro ao buscar agendamentos por data:', error);
        return res.status(500).json({ message: 'Erro interno do servidor ao buscar agendamentos.' });
    }
};

exports.updateAppointmentStatus = async (req, res) => {
    console.log('STUB: updateAppointmentStatus chamado. Implementar lógica.');
    return res.status(501).json({ message: 'Funcionalidade não implementada.' });
};

exports.createAppointment = async (req, res) => {
    console.log('STUB: createAppointment chamado. Implementar lógica.');
    return res.status(501).json({ message: 'Funcionalidade não implementada.' });
};
