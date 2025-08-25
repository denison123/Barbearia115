// src/pages/PainelBarbeiroPage.js

import React, { useState, useEffect } from 'react';
import './PainelBarbeiroPage.css';

const PainelBarbeiroPage = () => {
  const [agendamentos, setAgendamentos] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    // ID do barbeiro a ser buscado. Na vida real, viria do usuário logado.
    const barbeiroId = 1;

    const fetchAgendamentos = async () => {
      try {
        const response = await fetch(`http://localhost:5000/api/agendamentos/${barbeiroId}`);
        
        if (!response.ok) {
          throw new Error('Falha ao carregar agendamentos.');
        }

        const data = await response.json();
        setAgendamentos(data);
        setLoading(false);
      } catch (error) {
        setError(error.message);
        setLoading(false);
      }
    };

    fetchAgendamentos();
  }, []); // O array vazio [] garante que o useEffect rode apenas uma vez

  if (loading) {
    return <div className="painel-container">Carregando agenda...</div>;
  }

  if (error) {
    return <div className="painel-container error">Erro: {error}</div>;
  }
  
  return (
    <div className="painel-container">
      <h2 className="painel-title">Minha Agenda de Hoje</h2>
      
      {agendamentos.length === 0 ? (
        <p>Nenhum agendamento encontrado para hoje.</p>
      ) : (
        <ul className="agendamentos-list">
          {agendamentos.map(agendamento => (
            <li key={agendamento._id} className="agendamento-item">
              <div className="agendamento-info">
                <span>Cliente: <strong>{agendamento.cliente.nome}</strong></span>
                <span>Horário: <strong>{agendamento.dataHora.horario}</strong></span>
              </div>
              <p>Serviço: {agendamento.servico.nome}</p>
              <p>Telefone: {agendamento.cliente.telefone}</p>
            </li>
          ))}
        </ul>
      )}
    </div>
  );
};

export default PainelBarbeiroPage;