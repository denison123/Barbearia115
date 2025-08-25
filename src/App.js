// src/App.js

import React from 'react';
import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';

// Páginas Públicas (qualquer um pode acessar)
import HomePage from './pages/HomePage';
import AgendamentoPage from './pages/AgendamentoPage';
import LoginPage from './pages/LoginPage';

// Componente para proteger as rotas
import PrivateRoute from './components/PrivateRoute';

// Páginas Privadas (apenas usuários logados)
import PainelBarbeiroPage from './pages/PainelBarbeiroPage';

const App = () => {
  return (
    <Router>
      <Routes>
        {/* Rotas Públicas */}
        <Route path="/" element={<HomePage />} />
        <Route path="/agendar" element={<AgendamentoPage />} />
        <Route path="/login" element={<LoginPage />} />

        {/* Rota Privada - Painel do Barbeiro */}
        <Route 
          path="/painel" 
          element={
            <PrivateRoute>
              <PainelBarbeiroPage />
            </PrivateRoute>
          } 
        />
      </Routes>
    </Router>
  );
};

export default App;