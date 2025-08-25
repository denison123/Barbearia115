// src/components/PrivateRoute.js

import React from 'react';
import { Navigate } from 'react-router-dom';

const PrivateRoute = ({ children }) => {
  // Pega o ID do barbeiro salvo no localStorage após o login
  const isAuthenticated = localStorage.getItem('barbeiroId');

  // Se o ID existir, o usuário está "autenticado".
  if (isAuthenticated) {
    return children;
  }

  // Se o ID não existir, redireciona para a página de login
  return <Navigate to="/login" replace />;
};

export default PrivateRoute;