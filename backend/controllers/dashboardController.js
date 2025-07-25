// backend/controllers/dashboardController.js

const dashboardController = {
    async getMonthlyStats(req, res) {
        const { barberId } = req.params;
        const { month, year } = req.query;

        console.log(`[Backend Dashboard] Recebida requisição para estatísticas: Barbeiro ${barberId}, Mês ${month}, Ano ${year}`);

        try {
            const stats = {
                completedCuts: 15, // Dados mock
                pendingCuts: 3,
                cancelledCuts: 1
            };
            res.status(200).json(stats);
        } catch (error) {
            console.error('Erro ao buscar estatísticas mensais:', error);
            res.status(500).json({ message: 'Erro interno do servidor ao buscar estatísticas mensais.' });
        }
    },

    async getAppointmentsByDate(req, res) {
        const { barberId } = req.params;
        const { date } = req.query;

        console.log(`[Backend Dashboard] Recebida requisição para agendamentos por data: Barbeiro ${barberId}, Data ${date}`);

        try {
            const mockAppointments = [
                { id: 'appt1', time: '09:00', customerName: 'Ana Silva', customerPhone: '987654321', paymentMethod: 'Cartão de Crédito', status: 'completed' },
                { id: 'appt2', time: '10:30', customerName: 'Bruno Costa', customerPhone: '123456789', paymentMethod: 'Dinheiro', status: 'pending' },
            ];

            // Filtra os agendamentos mockados para a data solicitada (ex: para testar com '2025-07-23')
            const filteredAppointments = mockAppointments.filter(appt => {
                // Você pode ajustar as datas aqui para testar diferentes dias
                return date === '2025-07-23' || date === '2025-07-24';
            });

            res.status(200).json(filteredAppointments);
        } catch (error) {
            console.error('Erro ao buscar agendamentos por data:', error);
            res.status(500).json({ message: 'Erro interno do servidor ao buscar agendamentos por data.' });
        }
    },
};

module.exports = dashboardController;