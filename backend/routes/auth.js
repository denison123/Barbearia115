// backend/routes/auth.js
const express = require('express');
const router = express.Router();
const authController = require('../controllers/authController');

// Rota de login, usando a função loginBarber do authController
router.post('/login', authController.loginBarber);

// NOVA ROTA: Rota para buscar o perfil do barbeiro após o login
// A rota do frontend envia o ID token e este controller irá verificar a autenticação
// e buscar os dados do barbeiro no Firestore.
router.post('/profile', authController.profile);

module.exports = router;
