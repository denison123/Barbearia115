// backend/routes/appointments.js
const express = require('express');
const router = express.Router();
const appointmentsController = require('../controllers/appointmentsController');
// const authMiddleware = require('../middleware/authMiddleware'); // Se necessário para criar/gerenciar

// Rota para obter horários disponíveis para agendamento
router.get('/available', appointmentsController.getAvailableSlots);

// Rota para criar um novo agendamento (pode ser pública para o cliente)
router.post('/', appointmentsController.createAppointment);

// Rotas para gerenciar agendamentos (provavelmente autenticadas para o barbeiro)
// router.put('/:id', authMiddleware, appointmentsController.updateAppointmentStatus);
// router.delete('/:id', authMiddleware, appointmentsController.deleteAppointment);

module.exports = router;