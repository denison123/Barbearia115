// js/login.js

// URL base do seu backend
//
// A URL do seu backend no Render é: https://barbearia-backend-9h56.onrender.com/api
//
// Certifique-se de que esta URL corresponde ao endereço do seu servidor Express
const API_BASE_URL = 'https://barbearia-backend-9h56.onrender.com/api';

document.addEventListener('DOMContentLoaded', () => {
    // Seleciona o formulário de login e o elemento para exibir mensagens
    const loginForm = document.getElementById('loginForm');
    const loginMessage = document.getElementById('loginMessage');

    // Adiciona um listener para o evento de submissão do formulário
    loginForm.addEventListener('submit', async (event) => {
        event.preventDefault(); // Previne o comportamento padrão de recarregar a página

        // Limpa mensagens anteriores
        loginMessage.textContent = '';
        loginMessage.className = 'mt-4 text-center text-sm sm:text-lg font-semibold'; // Resetar classes

        // Obtém os valores dos campos de email e senha
        const email = document.getElementById('email').value;
        const password = document.getElementById('password').value;

        // Validação básica (opcional, mas recomendado)
        if (!email || !password) {
            loginMessage.textContent = 'Por favor, preencha todos os campos.';
            loginMessage.classList.add('text-red-500'); // Adiciona classe de erro
            return;
        }

        try {
            // Exibe uma mensagem de carregamento
            loginMessage.textContent = 'Autenticando...';
            loginMessage.classList.add('text-blue-400');

            // Faz a requisição POST para o endpoint de login do backend
            const response = await fetch(`${API_BASE_URL}/auth/login`, {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify({ email, password }), // Envia email e senha como JSON
            });

            const data = await response.json(); // Converte a resposta para JSON

            if (response.ok) {
                // Login bem-sucedido
                loginMessage.textContent = data.message || 'Login bem-sucedido!';
                loginMessage.classList.add('text-green-500');

                // Armazena o token JWT e os dados do barbeiro no localStorage
                // Isso é crucial para manter o usuário logado e para futuras requisições autenticadas
                localStorage.setItem('token', data.token);
                localStorage.setItem('barber', JSON.stringify(data.barber)); // Armazena como string JSON

                // Redireciona para o dashboard do barbeiro após um pequeno atraso
                setTimeout(() => {
                    window.location.href = 'barber-dashboard.html';
                }, 1000); // Atraso de 1 segundo para o usuário ver a mensagem de sucesso

            } else {
                // Login falhou (ex: credenciais inválidas)
                loginMessage.textContent = data.message || 'Erro ao fazer login. Tente novamente.';
                loginMessage.classList.add('text-red-500');
                console.error('Erro de login:', data.message);
            }
        } catch (error) {
            // Erro de rede ou servidor
            loginMessage.textContent = 'Não foi possível conectar ao servidor. Verifique sua conexão.';
            loginMessage.classList.add('text-red-500');
            console.error('Erro na requisição de login:', error);
        }
    });
});
