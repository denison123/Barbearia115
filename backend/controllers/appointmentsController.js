// backend/controllers/appointmentsController.js

const appointmentsController = {
    async getAvailableSlots(req, res) {
        const { date, barberId } = req.query; // Pega a data e o ID do barbeiro da query string
        console.log(`[Backend] Recebida requisição para horários disponíveis para data: ${date}, barbeiro: ${barberId}`);

        // VALIDAR A DATA AQUI
        if (!date || !barberId) {
            return res.status(400).json({ message: 'Data e ID do barbeiro são obrigatórios.' });
        }

        // --- DADOS MOCK PARA TESTE ---
        // Se você não tiver um banco de dados funcionando, use este mock para ver se o frontend exibe.
        // Se o frontend exibir com o mock, o problema está na sua lógica de DB.
        const mockAvailableTimes = [
            { time: '09:00', status: 'available' },
            { time: '09:30', status: 'available' },
            { time: '10:00', status: 'booked' }, // Um slot ocupado para teste
            { time: '10:30', status: 'available' },
            { time: '11:00', status: 'available' },
            { time: '11:30', status: 'available' },
            { time: '13:00', status: 'available' },
            { time: '13:30', status: 'available' },
            { time: '14:00', status: 'available' },
        ];

        // Lógica para simular "horários passados" para a data mock (opcional, para teste)
        const today = new Date();
        const requestedDate = new Date(date + 'T00:00:00'); // Normalize para início do dia

        let filteredSlots = mockAvailableTimes.filter(slot => {
            const slotDateTime = new Date(`${date}T${slot.time}:00`);
            // Se a data solicitada for no futuro, todos são "disponíveis" (exceto os marcados como 'booked' no mock)
            // Se a data solicitada for hoje, apenas horários futuros são disponíveis
            return slot.status === 'available' && slotDateTime > today;
        });

        // Se a data solicitada for no futuro (depois de hoje), todos os slots mock devem ser disponíveis
        if (requestedDate > new Date(today.getFullYear(), today.getMonth(), today.getDate())) {
             filteredSlots = mockAvailableTimes.map(slot => ({ ...slot, status: slot.status === 'booked' ? 'booked' : 'available' })); // Respeita os "booked" do mock
        } else if (requestedDate.toDateString() === today.toDateString()) {
             // Para a data de hoje, filtra os que já passaram
             filteredSlots = mockAvailableTimes.filter(slot => {
                const slotDateTime = new Date(`${date}T${slot.time}:00`);
                return slotDateTime > today;
             });
        }


        // Você substituirá isso pela sua lógica real do banco de dados, por exemplo:
        /*
        try {
            // Supondo que você tenha um modelo Appointment e um AvailableDay para verificar
            // Primeiro, verifique se o barbeiro está disponível neste dia (do modelo AvailableDay)
            const isBarberAvailable = await AvailableDay.findOne({
                where: {
                    barberId: barberId,
                    date: date // YYYY-MM-DD
                }
            });

            if (!isBarberAvailable) {
                return res.status(200).json([]); // Retorna array vazio se o barbeiro não está disponível
            }

            // Geração dos slots de horário (ex: a cada 30 minutos)
            const startHour = 9; // 9:00
            const endHour = 18;  // 18:00
            const intervalMinutes = 30;
            const allPossibleSlots = [];

            for (let h = startHour; h < endHour; h++) {
                for (let m = 0; m < 60; m += intervalMinutes) {
                    const time = `${h.toString().padStart(2, '0')}:${m.toString().padStart(2, '0')}`;
                    allPossibleSlots.push({ time: time, status: 'available' });
                }
            }

            // Buscar agendamentos existentes para esta data e barbeiro
            const existingAppointments = await Appointment.findAll({
                where: {
                    barberId: barberId,
                    date: date
                },
                attributes: ['time']
            });

            const bookedTimes = new Set(existingAppointments.map(appt => appt.time));

            // Filtrar os horários já ocupados e os que já passaram
            const availableSlots = allPossibleSlots.filter(slot => {
                const slotDateTime = new Date(`${date}T${slot.time}:00`);
                const now = new Date();

                // Garante que o slot não está no passado E não está reservado
                return slotDateTime > now && !bookedTimes.has(slot.time);
            }).map(slot => ({ time: slot.time, status: 'available' })); // Confirma status como 'available'

            return res.status(200).json(availableSlots);

        } catch (error) {
            console.error('Erro ao buscar horários disponíveis:', error);
            res.status(500).json({ message: 'Erro interno do servidor ao buscar horários disponíveis.' });
        }
        */

        // Envia os horários mockados (ou os filtrados pela sua lógica real)
        res.status(200).json(filteredSlots);
    },

    async createAppointment(req, res) {
        const { date, time, barberId, customerName, customerPhone, paymentMethod, status } = req.body;
        console.log('[Backend] Tentando criar agendamento:', req.body);

        if (!date || !time || !barberId || !customerName || !customerPhone || !paymentMethod) {
            return res.status(400).json({ message: 'Todos os campos são obrigatórios.' });
        }

        // Simula a validação e criação no banco de dados
        // Em um sistema real, você verificaria se o slot está realmente disponível
        // antes de criar, para evitar conflitos.
        const appointmentId = `appt_${Date.now()}`; // ID fictício

        try {
            // Exemplo de como você adicionaria ao banco de dados:
            // const newAppointment = await Appointment.create({
            //     date, time, barberId, customerName, customerPhone, paymentMethod, status
            // });

            console.log(`Agendamento criado: ID ${appointmentId}, Data: ${date}, Hora: ${time}, Barbeiro: ${barberId}`);
            res.status(201).json({
                message: 'Agendamento criado com sucesso!',
                appointment: { id: appointmentId, date, time, barberId, customerName, customerPhone, paymentMethod, status }
            });
        } catch (error) {
            console.error('Erro ao criar agendamento:', error);
            res.status(500).json({ message: 'Erro interno do servidor ao criar agendamento.' });
        }
    }
};

module.exports = appointmentsController;