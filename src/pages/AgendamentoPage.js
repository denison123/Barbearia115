// src/pages/AgendamentoPage.js

import React, { useState } from 'react';
import SelecaoServico from '../components/SelecaoServico/SelecaoServico';
import SelecaoBarbeiro from '../components/SelecaoBarbeiro/SelecaoBarbeiro';
import CalendarioHorarios from '../components/CalendarioHorarios/CalendarioHorarios';
import Confirmacao from '../components/Confirmacao/Confirmacao';
import './AgendamentoPage.css';

const AgendamentoPage = () => {
  const [passoAtual, setPassoAtual] = useState(1);
  const [agendamentoData, setAgendamentoData] = useState({});

  // 1. Lida com a seleção do serviço e avança para o próximo passo
  const handleSelecionarServico = (servico) => {
    setAgendamentoData({ ...agendamentoData, servico });
    setPassoAtual(2);
  };

  // 2. Lida com a seleção do barbeiro e avança para o próximo passo
  const handleSelecionarBarbeiro = (barbeiro) => {
    setAgendamentoData({ ...agendamentoData, barbeiro });
    setPassoAtual(3);
  };

  // 3. Lida com a seleção de data e horário e avança para o próximo passo
  const handleSelecionarDataHora = (dataHora) => {
    setAgendamentoData({ ...agendamentoData, dataHora });
    setPassoAtual(4);
  };

  // 4. Lida com a finalização do agendamento, comunicando com o backend
  const handleFinalizarAgendamento = async (agendamentoFinal) => {
    try {
      // Faz a requisição POST para a API do backend
      const response = await fetch('https://barbearia115.onrender.com/api/agendar', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(agendamentoFinal),
      });

      // Verifica se a resposta do servidor foi bem-sucedida (status 2xx)
      if (!response.ok) {
        // Se a resposta não for OK, lê o erro retornado pelo backend
        const errorData = await response.json();
        // Lança um erro com a mensagem do backend ou uma genérica
        throw new Error(errorData.message || 'Erro ao confirmar o agendamento.');
      }

      // Se a resposta for OK, exibe a mensagem de sucesso e reseta o fluxo
      const data = await response.json();
      console.log('Agendamento confirmado!', data);
      alert('Agendamento confirmado com sucesso! Entraremos em contato.');

      setAgendamentoData({});
      setPassoAtual(1);
    } catch (error) {
      // Captura e exibe o erro em um pop-up
      alert(error.message);
    }
  };

  return (
    <div className="agendamento-page-container">
      {/* Renderização condicional para exibir o componente do passo atual */}
      
      {passoAtual === 1 && (
        <SelecaoServico onSelecionarServico={handleSelecionarServico} />
      )}
      
      {passoAtual === 2 && (
        <SelecaoBarbeiro onSelecionarBarbeiro={handleSelecionarBarbeiro} />
      )}
      
      {passoAtual === 3 && (
        <CalendarioHorarios onSelecionarDataHora={handleSelecionarDataHora} />
      )}
      
      {passoAtual === 4 && (
        <Confirmacao 
          agendamento={agendamentoData} 
          onFinalizarAgendamento={handleFinalizarAgendamento} 
        />
      )}
    </div>
  );
};

export default AgendamentoPage;