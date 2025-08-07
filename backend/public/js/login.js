// login.js - Corrigido para fazer a requisição POST para o backend

// Certifique-se de que a URL base da sua API esteja definida corretamente.
// Substitua "https://seu-backend.onrender.com" pela URL real do seu servidor Render.
const API_BASE_URL = 'https://barbearia-backend-9h56.onrender.com';

document.getElementById('loginForm').addEventListener('submit', async (event) => {
    // Impede o envio padrão do formulário, que causaria o erro "Cannot POST"
    event.preventDefault();

    const email = document.getElementById('email').value;
    const password = document.getElementById('password').value;
    
    // Objeto com os dados de login a serem enviados ao servidor
    const loginData = {
        email: email,
        password: password
    };

    try {
        // Faz a requisição POST para o endpoint de login na sua API do backend
        // A URL completa é construída usando a URL base e a rota da API
        const response = await fetch(`${API_BASE_URL}/api/auth/login`, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json'
            },
            // Converte o objeto JavaScript em uma string JSON para o corpo da requisição
            body: JSON.stringify(loginData)
        });

        // Verifica se a resposta do servidor foi bem-sucedida
        if (response.ok) {
            const data = await response.json();
            console.log('Login bem-sucedido:', data);
            
            // Aqui você pode redirecionar o usuário ou salvar o token de autenticação
            // window.location.href = '/dashboard.html';
        } else {
            // A requisição falhou, exibe uma mensagem de erro
            const error = await response.json();
            console.error('Falha no login:', error.message);
            // Mostra a mensagem de erro para o usuário (em um elemento HTML)
            // document.getElementById('errorMessage').textContent = error.message;
        }

    } catch (error) {
        // Exibe um erro de rede ou de conexão
        console.error('Erro ao conectar ao servidor:', error);
        // document.getElementById('errorMessage').textContent = 'Erro de conexão. Tente novamente.';
    }
});
