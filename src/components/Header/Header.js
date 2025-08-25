// src/components/Header/Header.js

import React from 'react';
import { Link } from 'react-router-dom';
import './Header.css';

const Header = () => {
  return (
    <header className="header">
      <div className="container">
        {/* Logotipo da Barbearia */}
        <Link to="/" className="logo">
          BARBEARIA
        </Link>
        
        {/* Navegação e botão de agendar */}
        <nav className="nav">
          <Link to="/agendar" className="cta-button">
            Agendar Agora
          </Link>
        </nav>
      </div>
    </header>
  );
};

export default Header;