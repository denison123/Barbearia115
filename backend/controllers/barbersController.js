// backend/controllers/barbersController.js

const barbersController = {
    async getAllBarbers(req, res) {
        console.log('[Backend Barbers] Recebida requisição para todos os barbeiros.');
        const mockBarbers = [
            { id: '10uVBB3Vr4Wu6Xez9JAt', name: 'João Barbeiro', image: '/imag/foto1.jpg' },
            { id: 'anotherBarberId', name: 'Maria Barbeira', image: '/imag/foto2.jpg' },
        ];
        res.status(200).json(mockBarbers);
    },

    async getAvailableDays(req, res) {
        const { barberId } = req.params;
        const { month, year } = req.query;

        console.log(`[Backend Barbers] Recebida requisição para dias disponíveis: Barbeiro ${barberId}, Mês ${month}, Ano ${year}`);

        try {
            const availableDays = [
                '2025-07-21', '2025-07-22', '2025-07-23', '2025-07-24',
                '2025-07-25', '2025-07-26', '2025-07-27', '2025-07-28',
                '2025-07-29', '2025-07-30'
            ]; // Dados mock
            res.status(200).json({ availableDays });
        } catch (error) {
            console.error('Erro ao buscar dias disponíveis:', error);
            res.status(500).json({ message: 'Erro interno do servidor ao buscar dias disponíveis.' });
        }
    },

    async addAvailableDay(req, res) {
        const { barberId } = req.params;
        const { date } = req.body;
        console.log(`[Backend Barbers] Recebida requisição para adicionar dia disponível: Barbeiro ${barberId}, Data ${date}`);
        try {
            // Lógica para adicionar ao Banco de Dados (mocked)
            res.status(200).json({ message: `Dia disponível ${date} adicionado com sucesso.` });
        } catch (error) {
            console.error('Erro ao adicionar dia disponível:', error);
            res.status(500).json({ message: 'Erro ao adicionar dia disponível.' });
        }
    },

    async removeAvailableDay(req, res) {
        const { barberId, date } = req.params;
        console.log(`[Backend Barbers] Recebida requisição para remover dia disponível: Barbeiro ${barberId}, Data ${date}`);
        try {
            // Lógica para remover do Banco de Dados (mocked)
            res.status(200).json({ message: `Dia disponível ${date} removido com sucesso.` });
        } catch (error) {
            console.error('Erro ao remover dia disponível:', error);
            res.status(500).json({ message: 'Erro ao remover dia disponível.' });
        }
    }
};

module.exports = barbersController;