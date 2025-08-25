// src/components/HeroSection/HeroSection.js

import React from 'react';
import { Link } from 'react-router-dom';
import './HeroSection.css';

const HeroSection = () => {
  return (
    <div className="hero-section">
      <div className="hero-content">
        <h1 className="hero-title">Seu Estilo. Seu Horário. Sua Barbearia.</h1>
        <p className="hero-subtitle">
          Agende seu corte ou barba com os melhores profissionais da cidade.
        </p>
        <Link to="/agendar" className="cta-button-hero">
          Agendar Agora
        </Link>
      </div>
    </div>
  );
};

export default HeroSection;