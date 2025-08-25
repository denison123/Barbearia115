// src/components/SelecaoBarbeiro/SelecaoBarbeiro.js

import React from 'react';
import { useNavigate } from 'react-router-dom';
import barbeiros from '../../data/barbeiros';
import './SelecaoBarbeiro.css';

const SelecaoBarbeiro = ({ onSelecionarBarbeiro }) => {
  const navigate = useNavigate();

  const handleSelecionar = (barbeiro) => {
    onSelecionarBarbeiro(barbeiro);
    navigate('/agendar/data-hora'); // Redireciona para a próxima etapa
  };

  return (
    <div className="selecao-barbeiro-container">
      <h2>2. Escolha o Barbeiro</h2>
      <div className="barbeiro-lista">
        {barbeiros.map(barbeiro => (
          <div
            key={barbeiro.id}
            className="barbeiro-card"
            onClick={() => handleSelecionar(barbeiro)}
          >
            <img src={barbeiro.foto} alt={barbeiro.nome} className="barbeiro-foto" />
            <h3>{barbeiro.nome}</h3>
            <p className="barbeiro-especialidade">{barbeiro.especialidade}</p>
          </div>
        ))}
      </div>
    </div>
  );
};

export default SelecaoBarbeiro;