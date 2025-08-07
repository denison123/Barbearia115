// backend/routes/auth.js
const express = require('express');
const router = express.Router();
const authController = require('../controllers/authController');

// Rota de login, usando a função loginBarber do authController
// Certifique-se de que a função `loginBarber` é exportada do seu controller
router.post('/login', authController.loginBarber);

module.exports = router;
