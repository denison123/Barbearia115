// backend/routes/dashboard.js
const express = require('express');
const router = express.Router(); 
const dashboardController = require('../controllers/dashboardController');
const authMiddleware = require('../middleware/authMiddleware'); // Importa o middleware de autenticação

// Rota para obter estatísticas mensais de um barbeiro
// O middleware de autenticação é aplicado para garantir que o usuário está logado
router.get('/stats/:barberId/month', authMiddleware, dashboardController.getMonthlyStats);

// Rota para obter agendamentos para uma data específica de um barbeiro
// O middleware de autenticação também é aplicado nesta rota
router.get('/appointments/:barberId', authMiddleware, dashboardController.getAppointmentsByDate);

module.exports = router;
