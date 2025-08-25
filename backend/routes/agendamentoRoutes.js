// backend/routes/agendamentoRoutes.js

const express = require('express');
const router = express.Router();
const Agendamento = require('../models/Agendamento');

// Simulação de um barbeiro cadastrado no banco de dados
const barbeirosDb = [
  { id: 1, nome: 'Carlos Souza', email: 'carlos@barbearia.com', senha: '123' }
];

// ... (código das rotas POST e GET de agendamento) ...

// Nova Rota 3: POST para login do barbeiro
router.post('/login', async (req, res) => {
  try {
    const { email, senha } = req.body;

    // Busca o barbeiro por email (simulando uma busca no DB)
    const barbeiro = barbeirosDb.find(b => b.email === email);

    if (!barbeiro) {
      return res.status(404).json({ message: 'E-mail não encontrado.' });
    }

    // Verifica a senha (sem criptografia, para demonstração)
    if (barbeiro.senha !== senha) {
      return res.status(401).json({ message: 'Senha incorreta.' });
    }

    // Se as credenciais estiverem corretas, retorna as informações do barbeiro
    res.status(200).json({ 
      message: 'Login bem-sucedido!',
      barbeiro: {
        id: barbeiro.id,
        nome: barbeiro.nome,
        // Em um sistema real, aqui você geraria um token (JWT)
      }
    });

  } catch (error) {
    res.status(500).json({ message: 'Erro no servidor.', error: error.message });
  }
});

module.exports = router;