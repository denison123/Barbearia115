// js/login.js
// Certifique-se de ter importado o SDK do Firebase Client no seu HTML.
// Exemplo: <script src="https://www.gstatic.com/firebasejs/11.6.1/firebase-app.js"></script>
// Exemplo: <script src="https://www.gstatic.com/firebasejs/11.6.1/firebase-auth.js"></script>

const firebaseConfig = {
  // SUAS CONFIGURAÇÕES DE CLIENTE DO FIREBASE AQUI
  // Exemplo: apiKey, authDomain, projectId, etc.
};

// Inicialize o Firebase se ainda não foi inicializado
if (!firebase.apps.length) {
    firebase.initializeApp(firebaseConfig);
}
const auth = firebase.auth();

const API_BASE_URL = 'https://barbearia-backend-9h56.onrender.com/api';

document.addEventListener('DOMContentLoaded', () => {
    const loginForm = document.getElementById('loginForm');
    const loginMessage = document.getElementById('loginMessage');

    loginForm.addEventListener('submit', async (event) => {
        event.preventDefault();
        loginMessage.textContent = '';
        loginMessage.className = 'mt-4 text-center text-sm sm:text-lg font-semibold';

        const email = document.getElementById('email').value;
        const password = document.getElementById('password').value;

        if (!email || !password) {
            loginMessage.textContent = 'Por favor, preencha todos os campos.';
            loginMessage.classList.add('text-red-500');
            return;
        }

        try {
            loginMessage.textContent = 'Autenticando...';
            loginMessage.classList.add('text-blue-400');

            // 1. Faz a requisição para o backend para obter o Custom Token
            const response = await fetch(`${API_BASE_URL}/auth/login`, {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify({ email, password }),
            });

            const data = await response.json();

            if (response.ok) {
                // 2. Usa o Custom Token para fazer login no Firebase do lado do cliente
                const userCredential = await auth.signInWithCustomToken(data.token);
                const user = userCredential.user;

                // 3. Obtém o Token de ID válido do Firebase
                const idToken = await user.getIdToken();
                
                // 4. Armazena o Token de ID e os dados do barbeiro no localStorage
                localStorage.setItem('token', idToken);
                localStorage.setItem('barber', JSON.stringify(data.barber));

                loginMessage.textContent = 'Login bem-sucedido!';
                loginMessage.classList.add('text-green-500');

                setTimeout(() => {
                    window.location.href = 'barber-dashboard.html';
                }, 1000);
            } else {
                loginMessage.textContent = data.message || 'Erro ao fazer login. Tente novamente.';
                loginMessage.classList.add('text-red-500');
                console.error('Erro de login:', data.message);
            }
        } catch (error) {
            loginMessage.textContent = 'Não foi possível conectar ou autenticar. Verifique suas credenciais.';
            loginMessage.classList.add('text-red-500');
            console.error('Erro na requisição ou no Firebase:', error);
        }
    });
});
