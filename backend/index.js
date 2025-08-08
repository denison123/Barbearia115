// backend/index.js - Código do servidor (backend)

const express = require('express');
const path = require('path');
const cors = require('cors');

// Importa os controladores, se necessário.
// Por exemplo:
// const authController = require('./backend/controllers/authController.js');

const app = express();
const PORT = process.env.PORT || 3000;

// Middleware para habilitar o CORS
app.use(cors());

// Middleware para lidar com JSON
app.use(express.json());

// Middleware para servir os arquivos estáticos da pasta 'public'
// Isso permite que o navegador acesse login.html, login.js, etc.
app.use(express.static(path.join(__dirname, 'public')));


// === Rotas da API (Backend) ===
// Exemplo de rota de login da API.
// Este é o endpoint que o seu login.js do frontend irá chamar.
app.post('/api/auth/login', (req, res) => {
    const { email, password } = req.body;

    // Lógica real de autenticação deve estar aqui
    // Ex: conectar a um banco de dados, verificar credenciais
    
    console.log('Tentativa de login com:', email);

    // Exemplo de lógica de sucesso com retorno do tipo de usuário
    if (email && password) {
        let userRole = 'cliente'; // Padrão
        if (email.includes('barbeiro')) {
            userRole = 'barbeiro';
        }

        return res.status(200).json({ 
            message: 'Login bem-sucedido!',
            user: {
                email: email,
                role: userRole
            }
        });
    } else {
        return res.status(401).json({ message: 'E-mail ou senha incorretos' });
    }
});

// Inicializa o servidor
app.listen(PORT, () => {
    console.log(`Servidor rodando na porta ${PORT}`);
});