// src/index.js
import React from 'react';
import ReactDOM from 'react-dom';
import App from './App';
import './styles/global.css'; // Importe o arquivo global aqui

ReactDOM.render(
  <React.StrictMode>
    <App />
  </React.StrictMode>,
  document.getElementById('root')
);