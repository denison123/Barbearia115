// backend/routes/barbers.js
const express = require('express');
const router = express.Router();
const barberController = require('../controllers/barbersController'); // Certifique-se do nome correto do arquivo
const authMiddleware = require('../middleware/authMiddleware'); // Middleware de autenticação

// Rotas para o Dashboard do Barbeiro (protegidas por autenticação)
router.get('/dashboard-stats', authMiddleware, barberController.getDashboardStats);
router.get('/appointments', authMiddleware, barberController.getAppointmentsByDate);
// Rota para atualizar o status de um agendamento
router.put('/appointments/:appointmentId/status', authMiddleware, barberController.updateAppointmentStatus);
// Rota para definir/atualizar os dias de disponibilidade do barbeiro
router.post('/available-days', authMiddleware, barberController.setAvailableDays);


// Rotas para a Tela de Agendamento do Cliente (podem não precisar de autenticação JWT, dependendo da sua lógica)
// Rota para obter dias de disponibilidade de um barbeiro (para o barbeiro marcar no dashboard)
router.get('/:barberId/available-days', barberController.getAvailableDays);
// NOVA ROTA: Rota para obter horários disponíveis para agendamento de um barbeiro em uma data específica
router.get('/:barberId/available-slots', barberController.getAvailableTimeSlots);


// Rota para obter a lista de barbeiros (para o cliente selecionar)
router.get('/list', barberController.getBarbers);

// Rota para criar um novo agendamento (cliente enviando os dados)
router.post('/book', barberController.createAppointment);

module.exports = router;
