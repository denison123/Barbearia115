// login.js - Versão com redirecionamento para barbeiro ou cliente

// Substitua "https://seu-backend.onrender.com" pela URL real do seu servidor Render.
const API_BASE_URL = 'https://barbearia-backend-9h56.onrender.com';

document.getElementById('loginForm').addEventListener('submit', async (event) => {
    event.preventDefault();

    const email = document.getElementById('email').value;
    const password = document.getElementById('password').value;
    
    const loginData = {
        email: email,
        password: password
    };

    try {
        const response = await fetch(`${API_BASE_URL}/api/auth/login`, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json'
            },
            body: JSON.stringify(loginData)
        });

        if (response.ok) {
            const data = await response.json();
            console.log('Login bem-sucedido:', data);
            
            // Supondo que a resposta do backend inclua o tipo de usuário (ex: 'barbeiro' ou 'cliente')
            // Se o seu backend retorna o tipo de usuário em 'data.user.role', por exemplo
            const userRole = data.user.role; 

            // Lógica de redirecionamento baseada no tipo de usuário
            if (userRole === 'barbeiro') {
                window.location.href = '/barbeiro.html';
            } else if (userRole === 'cliente') {
                window.location.href = '/cliente.html';
            } else {
                // Se o tipo de usuário for desconhecido, redireciona para uma página padrão
                window.location.href = '/dashboard.html';
            }

        } else {
            const error = await response.json();
            console.error('Falha no login:', error.message);
            // Exiba a mensagem de erro para o usuário
            // Por exemplo: document.getElementById('errorMessage').textContent = error.message;
        }

    } catch (error) {
        console.error('Erro ao conectar ao servidor:', error);
        // Exiba a mensagem de erro de conexão
        // Por exemplo: document.getElementById('errorMessage').textContent = 'Erro de conexão. Tente novamente.';
    }
});
