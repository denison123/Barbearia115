// public/js/login.js - Código do navegador (frontend)

document.getElementById('loginForm').addEventListener('submit', async (event) => {
    event.preventDefault();

    const email = document.getElementById('email').value;
    const password = document.getElementById('password').value;
    
    const loginData = {
        email: email,
        password: password
    };

    try {
        // O frontend chama a rota da API definida no backend (index.js)
        const response = await fetch('/api/auth/login', {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json'
            },
            body: JSON.stringify(loginData)
        });

        if (response.ok) {
            const data = await response.json();
            console.log('Login bem-sucedido:', data);
            
            const userRole = data.user.role; 

            // Redireciona o usuário
            if (userRole === 'barbeiro') {
                window.location.href = '/barber-dashboard.html';
            } else if (userRole === 'cliente') {
                window.location.href = '/client-dashboard.html';
            } else {
                window.location.href = '/index.html';
            }

        } else {
            const error = await response.json();
            console.error('Falha no login:', error.message);
            // Exibir a mensagem de erro na UI
        }

    } catch (error) {
        console.error('Erro ao conectar ao servidor:', error);
        // Exibir a mensagem de erro de conexão na UI
    }
});
