// backend/controllers/barbersController.js
const admin = require('firebase-admin'); // Já inicializado no index.js

const barberController = {
    /**
     * Obtém as estatísticas do dashboard para o barbeiro logado.
     * Inclui contagem de cortes realizados, pendentes e cancelados.
     * O barberId é extraído do token de autenticação (req.user.id).
     */
    async getDashboardStats(req, res) {
        try {
            const db = admin.firestore();
            // O ID do barbeiro deve vir do token de autenticação, injetado pelo authMiddleware
            const barberId = req.user.id; // Supondo que o token decodificado tenha um campo 'id'

            if (!barberId) {
                console.error('[BarberController] getDashboardStats: ID do barbeiro não fornecido no token.');
                return res.status(400).json({ message: 'ID do barbeiro não fornecido no token.' });
            }

            // Referência à coleção de agendamentos
            const appointmentsRef = db.collection('appointments');

            // Contar cortes realizados para o barbeiro específico (agora da coleção 'appointments')
            const completedAppointmentsSnapshot = await appointmentsRef
                .where('barberId', '==', barberId) // Filtrar por barberId
                .where('status', '==', 'completed')
                .get();
            const completedCuts = completedAppointmentsSnapshot.size;

            // Contar agendamentos pendentes para o barbeiro específico
            const pendingAppointmentsSnapshot = await appointmentsRef
                .where('barberId', '==', barberId) // Filtrar por barberId
                .where('status', '==', 'pending')
                .get();
            const pendingAppointments = pendingAppointmentsSnapshot.size;

            // Contar agendamentos cancelados para o barbeiro específico
            const cancelledAppointmentsSnapshot = await appointmentsRef
                .where('barberId', '==', barberId) // Filtrar por barberId
                .where('status', '==', 'cancelled')
                .get();
            const cancelledAppointments = cancelledAppointmentsSnapshot.size;

            res.status(200).json({
                completedCuts,
                pendingAppointments,
                cancelledAppointments
            });

        } catch (error) {
            console.error('Erro ao buscar estatísticas do dashboard:', error);
            res.status(500).json({ message: 'Erro interno do servidor ao buscar estatísticas.' });
        }
    },

    /**
     * Obtém agendamentos para uma data específica ou para um mês/ano para o barbeiro logado.
     * A data é esperada no formato YYYY-MM-DD via query parameter 'date', OU
     * o mês e ano são esperados via query parameters 'month' (0-11) e 'year'.
     * O barberId é extraído do token de autenticação (req.user.id).
     */
    async getAppointmentsByDate(req, res) {
        const { date, month, year } = req.query; // Pode vir 'date' OU 'month' e 'year'
        const barberId = req.user.id; // Supondo que o token decodificado tenha um campo 'id'

        if (!barberId) {
            console.error('[BarberController] getAppointmentsByDate: ID do barbeiro não fornecido no token.');
            return res.status(400).json({ message: 'ID do barbeiro não fornecido no token.' });
        }

        try {
            const db = admin.firestore();
            const appointmentsRef = db.collection('appointments');
            let queryRef = appointmentsRef.where('barberId', '==', barberId);

            let startQueryDate, endQueryDate; // Usaremos datas locais para os limites da consulta

            if (date) {
                // Se uma data específica for fornecida, busca para aquele dia
                // Cria objetos Date que representam o início e o fim do dia no fuso horário local do servidor
                startQueryDate = new Date(date + 'T00:00:00'); // Força interpretação local
                startQueryDate.setHours(0, 0, 0, 0); // Garante início exato do dia
                endQueryDate = new Date(date + 'T23:59:59.999'); // Força interpretação local
                endQueryDate.setHours(23, 59, 59, 999); // Garante fim exato do dia

                console.log(`[BarberController] Buscando agendamentos para o dia: ${date}`);
                console.log(`[BarberController] Range de data (Local): ${startQueryDate.toISOString()} a ${endQueryDate.toISOString()}`);

            } else if (month !== undefined && year !== undefined) {
                // Se mês e ano forem fornecidos, busca para o mês inteiro
                const parsedYear = parseInt(year, 10);
                const parsedMonth = parseInt(month, 10); // Mês 0-indexado

                // Primeiro dia do mês no fuso horário local
                startQueryDate = new Date(parsedYear, parsedMonth, 1, 0, 0, 0, 0);
                // Último dia do mês no fuso horário local
                endQueryDate = new Date(parsedYear, parsedMonth + 1, 0, 23, 59, 59, 999);

                console.log(`[BarberController] Buscando agendamentos para o mês: ${month}/${year}`);
                console.log(`[BarberController] Range de data (Local): ${startQueryDate.toISOString()} a ${endQueryDate.toISOString()}`);

            } else {
                console.error('[BarberController] getAppointmentsByDate: Data ou mês/ano são obrigatórios.');
                return res.status(400).json({ message: 'Data ou mês/ano são obrigatórios para buscar agendamentos.' });
            }

            // Converte objetos Date locais para Timestamps do Firestore
            const startTimestamp = admin.firestore.Timestamp.fromDate(startQueryDate);
            const endTimestamp = admin.firestore.Timestamp.fromDate(endQueryDate);

            queryRef = queryRef
                .where('dateTime', '>=', startTimestamp)
                .where('dateTime', '<=', endTimestamp); // Use <= para endTimestamp para incluir todo o último milissegundo do dia

            // Sempre ordenar por dateTime para consultas de range
            const appointmentsSnapshot = await queryRef.orderBy('dateTime', 'asc').get();

            const appointments = appointmentsSnapshot.docs.map(doc => {
                const data = doc.data();
                // Ao retornar para o frontend, converte o Timestamp do Firestore de volta para uma string ISO
                // O frontend pode então convertê-lo para a data/hora local para exibição
                if (data.dateTime && typeof data.dateTime.toDate === 'function') {
                    data.dateTime = data.dateTime.toDate().toISOString(); // Converte para string ISO para consistência
                }
                return { id: doc.id, ...data };
            });

            console.log(`[BarberController] Agendamentos encontrados: ${appointments.length}`);
            res.status(200).json(appointments);

        } catch (error) {
            console.error('Erro ao buscar agendamentos por data/mês:', error);
            res.status(500).json({ message: 'Erro interno do servidor ao buscar agendamentos.' });
        }
    },

    /**
     * Atualiza o status de um agendamento específico.
     * @param {string} req.params.appointmentId - O ID do agendamento a ser atualizado.
     * @param {string} req.body.status - O novo status (e.g., 'completed', 'cancelled', 'pending').
     */
    async updateAppointmentStatus(req, res) {
        const { appointmentId } = req.params;
        const { status } = req.body;
        const barberId = req.user.id; // Verifica se o barbeiro logado é o dono do agendamento

        if (!appointmentId || !status) {
            return res.status(400).json({ message: 'ID do agendamento e status são obrigatórios.' });
        }

        try {
            const db = admin.firestore();
            const appointmentRef = db.collection('appointments').doc(appointmentId);
            const doc = await appointmentRef.get();

            if (!doc.exists) {
                return res.status(404).json({ message: 'Agendamento não encontrado.' });
            }

            // Opcional: Verificar se o agendamento pertence ao barbeiro logado para segurança
            if (doc.data().barberId !== barberId) {
                return res.status(403).json({ message: 'Você não tem permissão para atualizar este agendamento.' });
            }

            await appointmentRef.update({ status: status });
            res.status(200).json({ message: `Status do agendamento ${appointmentId} atualizado para ${status}.` });

        } catch (error) {
            console.error('Erro ao atualizar status do agendamento:', error);
            res.status(500).json({ message: 'Erro interno do servidor ao atualizar status do agendamento.' });
        }
    },

    /**
     * Obtém os dias de disponibilidade de um barbeiro específico.
     * O barberId é esperado como um parâmetro de rota.
     * Retorna um array de strings no formato 'YYYY-MM-DD'.
     */
    async getAvailableDays(req, res) {
        const { barberId } = req.params; // ID do barbeiro vem dos parâmetros da URL
        if (!barberId) {
            console.error('[BarberController] getAvailableDays: ID do barbeiro é obrigatório.');
            return res.status(400).json({ message: 'ID do barbeiro é obrigatório.' });
        }

        try {
            const db = admin.firestore();
            const availableDaysRef = db.collection('barber_available_days');

            // Busca o documento de dias disponíveis para o barbeiro específico
            const docRef = availableDaysRef.doc(barberId);
            const doc = await docRef.get();

            if (!doc.exists) {
                return res.status(200).json([]); // Retorna array vazio se não houver dias cadastrados
            }

            // Mapeia os documentos para retornar apenas o campo 'dates'
            const availableDays = doc.data().dates || []; // Retorna o array de datas

            res.status(200).json(availableDays); // Retorna um array de strings de datas

        } catch (error) {
            console.error('Erro ao buscar dias disponíveis:', error);
            res.status(500).json({ message: 'Erro interno do servidor ao buscar dias disponíveis.' });
        }
    },

    /**
     * Define/Atualiza os dias de disponibilidade de um barbeiro específico.
     * O barberId é extraído do token de autenticação (req.user.id).
     * Recebe um array de strings de datas no formato 'YYYY-MM-DD' no corpo da requisição.
     */
    async setAvailableDays(req, res) {
        const barberId = req.user.id; // ID do barbeiro logado
        const { availableDates } = req.body; // Array de datas no formato 'YYYY-MM-DD'

        if (!barberId) {
            return res.status(400).json({ message: 'ID do barbeiro não fornecido no token.' });
        }
        if (!Array.isArray(availableDates)) {
            return res.status(400).json({ message: 'O corpo da requisição deve conter um array de datas (availableDates).' });
        }

        try {
            const db = admin.firestore();
            const availableDaysRef = db.collection('barber_available_days');

            // Salva ou atualiza o documento do barbeiro com a nova lista de datas disponíveis
            // Usamos .doc(barberId) para garantir que cada barbeiro tenha seu próprio documento
            await availableDaysRef.doc(barberId).set({ dates: availableDates });

            res.status(200).json({ message: 'Dias disponíveis atualizados com sucesso!' });

        } catch (error) {
            console.error('Erro ao definir dias disponíveis:', error);
            res.status(500).json({ message: 'Erro interno do servidor ao definir dias disponíveis.' });
        }
    },

    /**
     * Obtém os horários disponíveis para agendamento de um barbeiro em uma data específica.
     * Considera os dias de disponibilidade definidos pelo barbeiro e os agendamentos existentes.
     * @param {string} req.params.barberId - O ID do barbeiro.
     * @param {string} req.query.date - A data no formato 'YYYY-MM-DD'.
     * @returns {Array<string>} Um array de horários disponíveis no formato 'HH:MM'.
     */
    async getAvailableTimeSlots(req, res) {
        const { barberId } = req.params;
        const { date } = req.query;

        if (!barberId || !date) {
            return res.status(400).json({ message: 'ID do barbeiro e data são obrigatórios.' });
        }

        try {
            const db = admin.firestore();
            const availableDaysRef = db.collection('barber_available_days');
            const appointmentsRef = db.collection('appointments');

            // 1. Verificar se o barbeiro está disponível neste dia
            const barberAvailabilityDoc = await availableDaysRef.doc(barberId).get();
            const availableDays = barberAvailabilityDoc.exists ? barberAvailabilityDoc.data().dates || [] : [];

            if (!availableDays.includes(date)) {
                return res.status(200).json([]); // Barbeiro não está disponível neste dia
            }

            // 2. Gerar todos os horários possíveis para o dia
            const startHour = 8; // 8 AM
            const endHour = 22;  // 10 PM
            const slotDurationMinutes = 60; // Slots de 1 em 1 hora

            const possibleSlots = [];
            // Força a interpretação da data como local para gerar os horários
            const current = new Date(date + 'T00:00:00');
            current.setHours(startHour, 0, 0, 0); // Início do dia de trabalho

            while (current.getHours() < endHour || (current.getHours() === endHour && current.getMinutes() === 0)) {
                possibleSlots.push(current.toLocaleTimeString('pt-BR', { hour: '2-digit', minute: '2-digit', hour12: false }));
                current.setMinutes(current.getMinutes() + slotDurationMinutes);
            }

            // 3. Obter agendamentos existentes para este barbeiro e data
            // Usa objetos Date locais para os limites da consulta, consistente com createAppointment
            const startOfDayLocal = new Date(date + 'T00:00:00'); // Força interpretação local
            startOfDayLocal.setHours(0, 0, 0, 0); // Garante início exato do dia
            const endOfDayLocal = new Date(date + 'T23:59:59.999'); // Força interpretação local
            endOfDayLocal.setHours(23, 59, 59, 999); // Garante fim exato do dia

            const bookedAppointmentsSnapshot = await appointmentsRef
                .where('barberId', '==', barberId)
                .where('dateTime', '>=', admin.firestore.Timestamp.fromDate(startOfDayLocal))
                .where('dateTime', '<=', admin.firestore.Timestamp.fromDate(endOfDayLocal)) // Usa <=
                .get();

            const bookedSlots = new Set();
            bookedAppointmentsSnapshot.docs.forEach(doc => {
                const apptData = doc.data();
                if (apptData.dateTime && typeof apptData.dateTime.toDate === 'function') { // Verifica o método toDate()
                    const apptDate = apptData.dateTime.toDate(); // Obtém o objeto Date no fuso horário local do servidor
                    const bookedTime = apptDate.toLocaleTimeString('pt-BR', { hour: '2-digit', minute: '2-digit', hour12: false });
                    bookedSlots.add(bookedTime);
                }
            });

            // 4. Filtrar horários disponíveis
            const availableTimeSlots = possibleSlots.filter(slot => !bookedSlots.has(slot));

            res.status(200).json(availableTimeSlots);

        } catch (error) {
            console.error('Erro ao buscar horários disponíveis:', error);
            res.status(500).json({ message: 'Erro interno do servidor ao buscar horários disponíveis.' });
        }
    },

    /**
     * Obtém os barbeiros disponíveis para a tela de agendamento do cliente.
     * Por enquanto, retorna dados mockados. Em um projeto real, buscaria do Firestore.
     */
    async getBarbers(req, res) {
        try {
            // TODO: Implementar busca de barbeiros reais do Firestore
            // Por enquanto, retorna barbeiros mockados
            const barbers = [
                { id: '10uVBB3Vr4Wu6Xez9JAt', name: 'João Barbeiro' },
                // Adicione mais barbeiros conforme necessário
            ];
            res.status(200).json(barbers);
        } catch (error) {
            console.error('Erro ao buscar barbeiros:', error);
            res.status(500).json({ message: 'Erro interno do servidor ao buscar barbeiros.' });
        }
    },

    /**
     * Cria um novo agendamento no Firestore.
     * Esta função seria chamada quando o cliente confirmar o agendamento.
     */
    async createAppointment(req, res) {
        const { barberId, customerName, customerPhone, service, dateTime, paymentMethod } = req.body;

        if (!barberId || !customerName || !service || !dateTime) {
            return res.status(400).json({ message: 'Dados do agendamento incompletos.' });
        }

        try {
            const db = admin.firestore();
            const appointmentsRef = db.collection('appointments');

            // Cria um objeto Date diretamente da string de entrada.
            // Este objeto Date estará no fuso horário local do servidor.
            // O Firestore irá converter isso para UTC ao salvar como Timestamp.
            const appointmentDate = new Date(dateTime);

            if (isNaN(appointmentDate.getTime())) {
                return res.status(400).json({ message: 'Formato de data e hora inválido.' });
            }

            const newAppointment = {
                barberId,
                customerName,
                customerPhone: customerPhone || null,
                service,
                dateTime: admin.firestore.Timestamp.fromDate(appointmentDate), // Salva como Timestamp
                paymentMethod: paymentMethod || 'Dinheiro',
                status: 'pending', // Status inicial do agendamento
                createdAt: admin.firestore.FieldValue.serverTimestamp() // Adiciona timestamp de criação
            };

            const docRef = await appointmentsRef.add(newAppointment);
            res.status(201).json({ message: 'Agendamento criado com sucesso!', appointmentId: docRef.id });

        } catch (error) {
            console.error('Erro ao criar agendamento:', error);
            res.status(500).json({ message: 'Erro interno do servidor ao criar agendamento.' });
        }
    }
};

module.exports = barberController;
