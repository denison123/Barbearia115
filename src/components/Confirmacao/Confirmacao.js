// src/components/Confirmacao/Confirmacao.js

import React, { useState } from 'react';
import './Confirmacao.css';

const Confirmacao = ({ agendamento, onFinalizarAgendamento }) => {
  const [nome, setNome] = useState('');
  const [telefone, setTelefone] = useState('');

  const handleConfirmar = (event) => {
    event.preventDefault(); // Evita que a página recarregue ao submeter o formulário

    if (!nome || !telefone) {
      alert('Por favor, preencha seu nome e telefone.');
      return;
    }

    // Objeto final com todos os dados do agendamento
    const agendamentoFinal = {
      ...agendamento,
      cliente: { nome, telefone },
    };

    // Chamada para a função no componente pai para finalizar o agendamento
    // Na vida real, você faria uma chamada para a API aqui
    onFinalizarAgendamento(agendamentoFinal);
  };

  return (
    <div className="confirmacao-container">
      <h2>4. Confirmação do Agendamento</h2>

      <div className="resumo">
        <h3>Resumo</h3>
        <p><strong>Serviço:</strong> {agendamento.servico.nome}</p>
        <p><strong>Barbeiro:</strong> {agendamento.barbeiro.nome}</p>
        <p><strong>Data:</strong> {agendamento.dataHora.data}</p>
        <p><strong>Horário:</strong> {agendamento.dataHora.horario}</p>
      </div>

      <form className="formulario-cliente" onSubmit={handleConfirmar}>
        <h3>Dados Pessoais</h3>
        <div className="form-group">
          <label htmlFor="nome">Nome Completo</label>
          <input
            type="text"
            id="nome"
            value={nome}
            onChange={(e) => setNome(e.target.value)}
            required
          />
        </div>
        <div className="form-group">
          <label htmlFor="telefone">Telefone (WhatsApp)</label>
          <input
            type="tel"
            id="telefone"
            value={telefone}
            onChange={(e) => setTelefone(e.target.value)}
            required
          />
        </div>
        <button type="submit" className="confirmar-button">
          Finalizar Agendamento
        </button>
      </form>
    </div>
  );
};

export default Confirmacao;