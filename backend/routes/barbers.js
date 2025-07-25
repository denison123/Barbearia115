// backend/routes/barbers.js
const express = require('express');
const router = express.Router();
const barbersController = require('../controllers/barbersController');
const authMiddleware = require('../middleware/authMiddleware'); // Apenas importado, usado em POST/DELETE

// Rota para obter todos os barbeiros (SEM authMiddleware)
router.get('/', barbersController.getAllBarbers);

// Rota para obter os dias disponíveis de um barbeiro específico (SEM authMiddleware)
router.get('/:barberId/available-days', barbersController.getAvailableDays);

// Rotas para adicionar/remover dias disponíveis (COM authMiddleware, pois altera dados)
router.post('/:barberId/available-days', authMiddleware, barbersController.addAvailableDay);
router.delete('/:barberId/available-days/:date', authMiddleware, barbersController.removeAvailableDay);

module.exports = router;