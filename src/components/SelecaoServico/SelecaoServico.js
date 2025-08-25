// src/components/SelecaoServico/SelecaoServico.js

import React from 'react';
import { useNavigate } from 'react-router-dom';
import servicos from '../../data/servicos';
import './SelecaoServico.css';

const SelecaoServico = ({ onSelecionarServico }) => {
  const navigate = useNavigate();

  const handleSelecionar = (servico) => {
    onSelecionarServico(servico);
    navigate('/agendar/barbeiro'); // Redireciona para a próxima etapa
  };

  return (
    <div className="selecao-servico-container">
      <h2>1. Escolha o Serviço</h2>
      <div className="servico-lista">
        {servicos.map(servico => (
          <div
            key={servico.id}
            className="servico-card"
            onClick={() => handleSelecionar(servico)}
          >
            <h3>{servico.nome}</h3>
            <p className="servico-descricao">{servico.descricao}</p>
            <p className="servico-info">
              <span>Duração: {servico.duracao}</span>
              <span>Preço: R$ {servico.preco.toFixed(2)}</span>
            </p>
          </div>
        ))}
      </div>
    </div>
  );
};

export default SelecaoServico;