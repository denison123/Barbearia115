// public/js/login.js

// Certifique-se de que o SDK do Firebase Client esteja importado no seu HTML.
// Exemplo: <script src="https://www.gstatic.com/firebasejs/11.6.1/firebase-app.js"></script>
// Exemplo: <script src="https://www.gstatic.com/firebasejs/11.6.1/firebase-auth.js"></script>

// A URL base do seu backend.
const API_BASE_URL = 'https://barbearia-backend-9h56.onrender.com/api';

// Configuração do Firebase Client - Você deve preencher com as suas credenciais.
const firebaseConfig = {
    apiKey: "YOUR_API_KEY",
    authDomain: "YOUR_AUTH_DOMAIN",
    projectId: "YOUR_PROJECT_ID",
    storageBucket: "YOUR_STORAGE_BUCKET",
    messagingSenderId: "YOUR_MESSAGING_SENDER_ID",
    appId: "YOUR_APP_ID"
};

// Inicializa o Firebase
if (!firebase.apps.length) {
    firebase.initializeApp(firebaseConfig);
}
const auth = firebase.auth();

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

            // 1. O cliente do Firebase faz o login e verifica a senha de forma segura.
            const userCredential = await auth.signInWithEmailAndPassword(email, password);
            const user = userCredential.user;

            // 2. Obtém o ID Token, que é a prova de autenticação do usuário.
            const idToken = await user.getIdToken();

            // 3. Envia o ID Token para o backend para obter os dados do barbeiro.
            const response = await fetch(`${API_BASE_URL}/auth/profile`, {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                    'Authorization': `Bearer ${idToken}` // Envia o token no cabeçalho
                }
            });

            const data = await response.json();

            if (response.ok) {
                // 4. Armazena o ID Token e os dados do barbeiro no localStorage.
                localStorage.setItem('token', idToken);
                localStorage.setItem('barber', JSON.stringify(data.barber));

                loginMessage.textContent = 'Login bem-sucedido!';
                loginMessage.classList.add('text-green-500');

                setTimeout(() => {
                    window.location.href = 'barber-dashboard.html';
                }, 1000);
            } else {
                loginMessage.textContent = data.message || 'Erro ao buscar dados do barbeiro.';
                loginMessage.classList.add('text-red-500');
                // O Firebase já lidou com erros de credenciais, este é um erro do backend.
                console.error('Erro no backend após autenticação:', data.message);
            }
        } catch (error) {
            // Este bloco captura erros de credenciais do Firebase
            let errorMessage = 'Erro ao fazer login. Verifique seu email e senha.';
            if (error.code === 'auth/user-not-found') {
                errorMessage = 'Usuário não encontrado.';
            } else if (error.code === 'auth/wrong-password') {
                errorMessage = 'Senha incorreta.';
            }
            loginMessage.textContent = errorMessage;
            loginMessage.classList.add('text-red-500');
            console.error('Erro de login do Firebase:', error);
        }
    });
});
