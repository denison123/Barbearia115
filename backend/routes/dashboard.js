// backend/routes/dashboard.js
const express = require('express');
const router = express.Router(); // CORREÇÃO: Deve ser express.Router() para criar um roteador modular
const dashboardController = require('../controllers/dashboardController');
const authMiddleware = require('../middleware/authMiddleware'); // Apenas importado, não usado em GETs

// Rota para obter estatísticas mensais
// Certifique-se de que dashboardController.getMonthlyStats está exportado e é uma função
router.get('/stats/:barberId/month', authMiddleware, dashboardController.getMonthlyStats);

// Rota para obter agendamentos para uma data específica
// Certifique-se de que dashboardController.getAppointmentsByDate está exportado e é uma função
router.get('/appointments/:barberId', authMiddleware, dashboardController.getAppointmentsByDate);

module.exports = router;
