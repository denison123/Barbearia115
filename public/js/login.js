// login.js
const loginForm = document.getElementById('loginForm');
const loginMessage = document.getElementById('loginMessage');

loginForm.addEventListener('submit', async (event) => {
    event.preventDefault(); // <--- ESSA LINHA É CRÍTICA! Impede o recarregamento da página e envio padrão.

    const email = document.getElementById('email').value;
    const password = document.getElementById('password').value;

    loginMessage.textContent = 'Autenticando...';
    loginMessage.className = 'mt-4 text-center text-sm sm:text-lg font-semibold text-blue-400';

    try {
        // Certifique-se de que a URL da sua API está correta
        const response = await fetch('http://localhost:3001/api/auth/login', {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
            },
            body: JSON.stringify({ email, password }),
        });

        const data = await response.json();

        if (response.ok) {
            loginMessage.textContent = data.message || 'Login bem-sucedido!';
            loginMessage.className = 'mt-4 text-center text-sm sm:text-lg font-semibold text-green-500';

            // Salvar o token (e talvez dados do barbeiro) no localStorage
            localStorage.setItem('token', data.token);
            localStorage.setItem('barberId', data.barber.id); // Certifique-se que seu backend retorna o ID
            localStorage.setItem('barberName', data.barber.name);

            // Redirecionar para o painel do barbeiro
            window.location.href = 'barber-dashboard.html';
        } else {
            loginMessage.textContent = data.message || 'Erro no login. Verifique suas credenciais.';
            loginMessage.className = 'mt-4 text-center text-sm sm:text-lg font-semibold text-red-500';
        }
    } catch (error) {
        console.error('Erro ao fazer login:', error);
        loginMessage.textContent = 'Erro ao conectar com o servidor.';
        loginMessage.className = 'mt-4 text-center text-sm sm:text-lg font-semibold text-red-500';
    }
});