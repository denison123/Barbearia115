// src/components/CalendarioHorarios/CalendarioHorarios.js

import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import './CalendarioHorarios.css';

// Função para simular a busca por horários disponíveis
// Na vida real, você faria uma chamada para o seu backend (API)
const buscarHorariosDisponiveis = (data, duracaoServico) => {
  // Exemplo de horários fixos para demonstração.
  // Você pode ajustar isso com base na duração do serviço.
  const horarios = [
    '08:00','09:00','10:00','11:00','12:00',
    '13:00','14:00','15:00','16:00','17:00',
    '18:00','19:00','20:00','21:00','22:00'
  ];
  return horarios;
};

const CalendarioHorarios = ({ onSelecionarDataHora }) => {
  const [dataSelecionada, setDataSelecionada] = useState(null);
  const [horariosDisponiveis, setHorariosDisponiveis] = useState([]);
  const navigate = useNavigate();

  const handleSelecionarData = (data) => {
    setDataSelecionada(data);
    // Simula a busca de horários.
    // Na prática: fetch(`/api/horarios?data=${data}&duracao=${duracaoServico}`);
    const horarios = buscarHorariosDisponiveis(data, '30 min'); // '30 min' é um valor de exemplo
    setHorariosDisponiveis(horarios);
  };

  const handleSelecionarHorario = (horario) => {
    // Passa a data e o horário para o componente pai
    onSelecionarDataHora({ data: dataSelecionada, horario: horario });
    navigate('/agendar/confirmacao'); // Redireciona para a próxima etapa
  };

  // O componente do calendário deve ser integrado aqui, por exemplo:
  // <CalendarComponent onSelect={handleSelecionarData} />
  // Para simplicidade, vamos usar botões de data de exemplo.

  const datasDeExemplo = ['26/08', '27/08', '28/08', '29/08'];

  return (
    <div className="calendario-container">
      <h2>3. Selecione a Data e Horário</h2>
      
      <div className="datas-lista">
        <h3>Escolha o dia:</h3>
        {datasDeExemplo.map(data => (
          <button 
            key={data}
            className={`data-button ${data === dataSelecionada ? 'selected' : ''}`}
            onClick={() => handleSelecionarData(data)}
          >
            {data}
          </button>
        ))}
      </div>

      {dataSelecionada && (
        <div className="horarios-lista">
          <h3>Horários disponíveis em {dataSelecionada}:</h3>
          <div className="horarios-grid">
            {horariosDisponiveis.map(horario => (
              <button 
                key={horario}
                className="horario-button"
                onClick={() => handleSelecionarHorario(horario)}
              >
                {horario}
              </button>
            ))}
          </div>
        </div>
      )}
    </div>
  );
};

export default CalendarioHorarios;