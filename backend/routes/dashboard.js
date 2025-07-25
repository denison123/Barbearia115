// backend/routes/dashboard.js
const express = require('express');
const router = express.Router();
const dashboardController = require('../controllers/dashboardController');
const authMiddleware = require('../middleware/authMiddleware'); // Apenas importado, não usado em GETs

// Rota para obter estatísticas mensais (SEM authMiddleware)
router.get('/stats/:barberId/month', authMiddleware, dashboardController.getMonthlyStats);

// Rota para obter agendamentos para uma data específica (SEM authMiddleware)
router.get('/appointments/:barberId', authMiddleware, dashboardController.getAppointmentsByDate);

module.exports = router;