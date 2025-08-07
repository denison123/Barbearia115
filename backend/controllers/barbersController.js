// backend/controllers/barbersController.js

const admin = require('../config/firebase');
const db = admin.firestore();

// Função para obter estatísticas do dashboard
exports.getDashboardStats = async (req, res) => {
    try {
        const barberId = req.user.id;
        
        if (!barberId) {
            console.error('getDashboardStats: barberId não encontrado na requisição (possivelmente authMiddleware não adicionou).');
            return res.status(400).json({ message: 'ID do barbeiro não fornecido.' });
        }

        console.log(`Buscando estatísticas para o barbeiro com ID: ${barberId}`);

        // Obter o início e o fim do mês atual para filtrar os agendamentos
        const now = new Date();
        const startOfMonth = new Date(now.getFullYear(), now.getMonth(), 1);
        const endOfMonth = new Date(now.getFullYear(), now.getMonth() + 1, 0, 23, 59, 59, 999);

        const collectionRef = db.collection('appointment_schedules');
        
        // CORREÇÃO: Usar um filtro de intervalo no campo `dateTime` para ser mais eficiente e adicionar orderBy
        const q = collectionRef
                    .where('barberId', '==', barberId)
                    .where('dateTime', '>=', startOfMonth)
                    .where('dateTime', '<=', endOfMonth)
                    .orderBy('dateTime', 'asc');

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
        const barberId = req.user.id;
        const { availableDates } = req.body; 

        if (!barberId) {
            return res.status(400).json({ message: 'ID do barbeiro não fornecido.' });
        }
        if (!availableDates || !Array.isArray(availableDates)) {
            return res.status(400).json({ message: 'Dados de disponibilidade inválidos. Esperado um array.' });
        }

        const docRef = db.collection('barber_available_days').doc(barberId);
        await docRef.set({ dates: availableDates });

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
        const { barberId } = req.params;

        if (!barberId) {
            console.error('getAvailableDays: ID do barbeiro não fornecido na requisição.');
            return res.status(400).json({ message: 'ID do barbeiro não fornecido.' });
        }

        const docRef = db.collection('barber_available_days').doc(barberId);
        console.log(`[getAvailableDays] Tentando buscar documento: barber_available_days/${barberId}`);
        const docSnapshot = await docRef.get();

        console.log(`[getAvailableDays] docSnapshot.exists: ${docSnapshot.exists}`);
        if (docSnapshot.exists) {
            const data = docSnapshot.data();
            console.log(`[getAvailableDays] Dados do documento:`, data);
            const availableDays = data.dates || [];
            console.log(`[getAvailableDays] Dias disponíveis para ${barberId}:`, availableDays);
            return res.status(200).json(availableDays);
        } else {
            console.log(`[getAvailableDays] Nenhum documento de disponibilidade encontrado para o barbeiro ${barberId}.`);
            return res.status(200).json([]);
        }
    } catch (error) {
        console.error('Erro ao buscar dias disponíveis:', error);
        return res.status(500).json({ message: 'Erro interno do servidor ao buscar dias disponíveis.' });
    }
};


// Implementação da função para obter a lista de barbeiros
exports.getBarbers = async (req, res) => {
    try {
        const barbersRef = db.collection('barbers');
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

            const availabilityDocRef = db.collection('barber_available_days').doc(barberData.id);
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
        const { barberId } = req.params;
        const { date } = req.query;

        if (!barberId || !date) {
            return res.status(400).json({ message: 'ID do barbeiro e data são obrigatórios.' });
        }

        const appointmentsRef = db.collection('appointment_schedules');
        
        const defaultStartHour = 9;
        const defaultEndHour = 18;
        const intervalMinutes = 60;

        let allPossibleSlots = [];
        for (let hour = defaultStartHour; hour < defaultEndHour; hour++) {
            allPossibleSlots.push(`${String(hour).padStart(2, '0')}:00`);
        }

        const q = appointmentsRef
            .where('barberId', '==', barberId)
            .where('date', '==', date);

        const querySnapshot = await q.get();
        const bookedSlots = new Set();

        querySnapshot.forEach(doc => {
            const appt = doc.data();
            let apptTime;
            if (appt.dateTime && typeof appt.dateTime === 'object' && appt.dateTime._seconds !== undefined) {
                const dateObj = new Date(appt.dateTime._seconds * 1000);
                apptTime = dateObj.toLocaleTimeString('pt-BR', { hour: '2-digit', minute: '2-digit' });
            } else if (typeof appt.dateTime === 'string') {
                const dateObj = new Date(appt.dateTime);
                apptTime = dateObj.toLocaleTimeString('pt-BR', { hour: '2-digit', minute: '2-digit' });
            }
            
            if (apptTime) {
                const [hour, minute] = apptTime.split(':');
                bookedSlots.add(`${hour}:${minute}`);
            }
        });

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
        const barberId = req.user.id;
        const { date, month, year } = req.query;

        if (!barberId) {
            console.error('getAppointmentsByDate: ID do barbeiro não fornecido na requisição.');
            return res.status(400).json({ message: 'ID do barbeiro não fornecido.' });
        }

        const appointmentsRef = db.collection('appointment_schedules');
        let q = appointmentsRef.where('barberId', '==', barberId);

        if (date) {
            q = q.where('date', '==', date);
            console.log(`[getAppointmentsByDate] Buscando agendamentos para o barbeiro ${barberId} na data: ${date}`);
        } else if (month !== undefined && year !== undefined) {
            // CORREÇÃO: Usar um filtro de intervalo no campo `dateTime` para ser mais eficiente
            const startOfMonth = new Date(parseInt(year), parseInt(month), 1);
            const endOfMonth = new Date(parseInt(year), parseInt(month) + 1, 0, 23, 59, 59);

            // ADICIONAR orderBy para suportar a consulta de intervalo de data
            q = appointmentsRef
                .where('barberId', '==', barberId)
                .where('dateTime', '>=', startOfMonth)
                .where('dateTime', '<=', endOfMonth)
                .orderBy('dateTime', 'asc');

            console.log(`[getAppointmentsByDate] Buscando agendamentos por mês/ano para o barbeiro ${barberId} no mês: ${month}, ano: ${year}`);
        } else {
            return res.status(400).json({ message: 'Data ou mês/ano são obrigatórios.' });
        }

        const querySnapshot = await q.get();
        const appointments = [];

        querySnapshot.forEach(doc => {
            const data = doc.data();
            appointments.push({ 
                id: doc.id,
                ...data,
                // CORREÇÃO: Mapear os dados para garantir que a resposta tenha os campos esperados
                customerName: data.clientName,
                customerPhone: data.clientPhone
            });
        });

        console.log(`[getAppointmentsByDate] Agendamentos encontrados:`, appointments);
        return res.status(200).json(appointments);

    } catch (error) {
        console.error('Erro ao buscar agendamentos por data:', error);
        return res.status(500).json({ message: 'Erro interno do servidor ao buscar agendamentos.' });
    }
};

exports.updateAppointmentStatus = async (req, res) => {
    try {
        const { appointmentId } = req.params;
        const { status } = req.body;

        if (!appointmentId || !status) {
            return res.status(400).json({ message: 'ID do agendamento e status são obrigatórios.' });
        }

        const appointmentRef = db.collection('appointment_schedules').doc(appointmentId);
        await appointmentRef.update({ status });

        return res.status(200).json({ message: `Status do agendamento ${appointmentId} atualizado para ${status}.` });

    } catch (error) {
        console.error('Erro ao atualizar status do agendamento:', error);
        return res.status(500).json({ message: 'Erro interno do servidor ao atualizar status do agendamento.' });
    }
};

exports.createAppointment = async (req, res) => {
    console.log('[createAppointment] Criando novo agendamento...');
    console.log('[createAppointment] Corpo da requisição:', req.body);
    try {
        const { barberId, customerName, customerPhone, service, dateTime } = req.body;
        
        if (!barberId || !customerName || !customerPhone || !service || !dateTime) {
            return res.status(400).json({ message: 'Todos os campos são obrigatórios: barberId, customerName, customerPhone, service, dateTime.' });
        }

        const appointmentDateTime = new Date(dateTime);
        const date = appointmentDateTime.toISOString().split('T')[0];
        const time = appointmentDateTime.toLocaleTimeString('pt-BR', { hour: '2-digit', minute: '2-digit' });

        const appointmentsRef = db.collection('appointment_schedules');
        const q = appointmentsRef
            .where('barberId', '==', barberId)
            .where('date', '==', date)
            .where('time', '==', time)
            .limit(1);

        const querySnapshot = await q.get();
        if (!querySnapshot.empty) {
            return res.status(409).json({ message: 'Este horário já está agendado. Por favor, escolha outro.' });
        }

        const newAppointment = {
            barberId,
            // CORREÇÃO: Salvar os dados do cliente com as chaves corretas
            clientName: customerName,
            clientPhone: customerPhone,
            service,
            date,
            time,
            dateTime: appointmentDateTime,
            status: 'pending',
            createdAt: admin.firestore.FieldValue.serverTimestamp()
        };

        const docRef = await appointmentsRef.add(newAppointment);
        console.log(`[createAppointment] Agendamento criado com ID: ${docRef.id}`);

        return res.status(201).json({ 
            message: 'Agendamento criado com sucesso!',
            appointmentId: docRef.id
        });

    } catch (error) {
        console.error('Erro ao criar agendamento:', error);
        return res.status(500).json({ message: 'Erro interno do servidor ao criar agendamento.' });
    }
};
