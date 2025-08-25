// backend/models/Agendamento.js

const mongoose = require('mongoose');

const agendamentoSchema = new mongoose.Schema({
  servico: {
    nome: { type: String, required: true },
    // Adicione mais campos do serviço aqui, se necessário
  },
  barbeiro: {
    nome: { type: String, required: true },
    // Adicione mais campos do barbeiro aqui, se necessário
  },
  dataHora: {
    data: { type: String, required: true },
    horario: { type: String, required: true },
  },
  cliente: {
    nome: { type: String, required: true },
    telefone: { type: String, required: true },
  },
  createdAt: { type: Date, default: Date.now },
});

module.exports = mongoose.model('Agendamento', agendamentoSchema);