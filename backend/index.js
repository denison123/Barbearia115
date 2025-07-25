// backend/index.js
const express = require('express');
const cors = require('cors');
const bodyParser = require('body-parser');
const path = require('path'); 

const firebase = require('./config/firebase'); 
const authRoutes = require('./routes/auth');
const barbersRoutes = require('./routes/barbers');
const dashboardRoutes = require('./routes/dashboard');
const appointmentsRoutes = require('./routes/appointments'); 

const app = express();
const PORT = process.env.PORT || 3001;

app.use(cors()); 
app.use(bodyParser.json()); 

// Esta linha deve estar no topo para servir arquivos estáticos
app.use(express.static(path.join(__dirname, '..', 'public')));

// Rotas da API
app.use('/api/auth', authRoutes);
app.use('/api/barbers', barbersRoutes); 
app.use('/api/dashboard', dashboardRoutes);
app.use('/api/appointments', appointmentsRoutes); 

// NENHUM app.use(authMiddleware) AQUI!

app.get('/', (req, res) => {
    res.sendFile(path.join(__dirname, '..', 'public', 'index.html'));
});

// REMOVA/COMENTE AS ROTAS REDUNDANTES para HTML:
/*
app.get('/barber-dashboard.html', (req, res) => {
    res.sendFile(path.join(__dirname, 'public', 'barber-dashboard.html'));
});

app.get('/login.html', (req, res) => {
    res.sendFile(path.join(__dirname, 'public', 'login.html'));
});
*/

app.use((err, req, res, next) => {
    console.error(err.stack);
    res.status(500).send('Algo deu errado no servidor!');
});

app.listen(PORT, () => {
    console.log(`Servidor rodando na porta ${PORT}`);
    console.log(`Servindo arquivos estáticos de: ${path.join(__dirname, 'public')}`);
});