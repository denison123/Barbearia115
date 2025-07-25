// public/js/barber-dashboard.js

// Função para formatar datas (se precisar)
function formatDate(date) {
    const year = date.getFullYear();
    const month = (date.getMonth() + 1).toString().padStart(2, '0');
    const day = date.getDate().toString().padStart(2, '0');
    return `${year}-${month}-${day}`;
}

// Funções para renderizar o calendário (adapte do seu código existente)
// ... (mantenha suas funções renderCalendar, updateCalendarHeader, etc.) ...

// Variáveis globais para o mês/ano do calendário de agendamentos
let currentAppointmentsDate = new Date(); // Inicia com a data atual para o calendário de agendamentos
let currentManageDate = new Date();      // Inicia com a data atual para o calendário de gerenciar disponibilidade

// Função para buscar e exibir estatísticas
async function fetchAndDisplayStats(barberId, token) {
    try {
        const response = await fetch(`http://localhost:3001/api/dashboard/stats/${barberId}/month`, {
            headers: {
                'Authorization': `Bearer ${token}`
            }
        });

        if (response.ok) {
            const stats = await response.json();
            document.getElementById('completedCuts').textContent = stats.completedCuts;
            document.getElementById('pendingCuts').textContent = stats.pendingCuts;
            document.getElementById('cancelledCuts').textContent = stats.cancelledCuts;
        } else {
            console.error('Erro ao carregar estatísticas:', response.status, response.statusText);
            // Implemente tratamento para 401 Unauthorized (token expirado/inválido)
            if (response.status === 401 || response.status === 403) {
                alert('Sua sessão expirou ou não está autorizada. Faça login novamente.');
                localStorage.clear(); // Limpa token e dados
                window.location.href = 'login.html';
            }
        }
    } catch (error) {
        console.error('Erro na requisição das estatísticas:', error);
    }
}

// Função para buscar e exibir agendamentos para uma data específica
async function fetchAndDisplayAppointments(barberId, token, date) {
    const appointmentsList = document.getElementById('appointmentsList');
    appointmentsList.innerHTML = '<p class="text-gray-400">Carregando agendamentos...</p>';
    document.querySelector('#appointmentsList + h3').textContent = `Agendamentos para ${date}`; // Atualiza o título

    try {
        // ATENÇÃO: A rota do backend para appointments espera 'barberId' em params e 'date' em query
        const response = await fetch(`http://localhost:3001/api/dashboard/appointments/${barberId}?date=${date}`, {
            headers: {
                'Authorization': `Bearer ${token}` // Inclua se a rota exigir autenticação no futuro
            }
        });

        if (response.ok) {
            const appointments = await response.json();
            appointmentsList.innerHTML = ''; // Limpa a mensagem de carregamento

            if (appointments.length === 0) {
                appointmentsList.innerHTML = '<p class="text-gray-400">Nenhum agendamento para esta data.</p>';
            } else {
                appointments.forEach(appt => {
                    const apptDiv = document.createElement('div');
                    apptDiv.className = 'bg-gray-700 p-4 rounded-lg flex justify-between items-center';
                    apptDiv.innerHTML = `
                        <div>
                            <p class="text-white font-semibold">${appt.time} - ${appt.customerName}</p>
                            <p class="text-gray-400 text-sm">Telefone: ${appt.customerPhone || 'N/A'}</p>
                            <p class="text-gray-400 text-sm">Pagamento: ${appt.paymentMethod || 'N/A'}</p>
                        </div>
                        <div class="flex space-x-2">
                            <button class="bg-green-600 hover:bg-green-700 text-white py-1 px-3 rounded-lg text-sm">Concluído</button>
                            <button class="bg-red-600 hover:bg-red-700 text-white py-1 px-3 rounded-lg text-sm">Cancelar</button>
                        </div>
                    `;
                    appointmentsList.appendChild(apptDiv);
                });
            }
        } else {
            console.error('Erro ao carregar agendamentos:', response.status, response.statusText);
             if (response.status === 401 || response.status === 403) {
                 alert('Sessão expirada ou não autorizada. Faça login novamente.');
                 localStorage.clear();
                 window.location.href = 'login.html';
            }
        }
    } catch (error) {
        console.error('Erro na requisição dos agendamentos:', error);
    }
}


// Função para renderizar o calendário de agendamentos
function renderAppointmentsCalendar(dateObj) {
    const calendarEl = document.getElementById('appointmentsCalendar');
    calendarEl.innerHTML = `
        <div class="font-bold text-gray-400">Dom</div>
        <div class="font-bold text-gray-400">Seg</div>
        <div class="font-bold text-gray-400">Ter</div>
        <div class="font-bold text-gray-400">Qua</div>
        <div class="font-bold text-gray-400">Qui</div>
        <div class="font-bold text-gray-400">Sex</div>
        <div class="font-bold text-gray-400">Sáb</div>
    `;

    const year = dateObj.getFullYear();
    const month = dateObj.getMonth(); // 0-11
    const firstDay = new Date(year, month, 1).getDay(); // Dia da semana do primeiro dia do mês (0=Dom, 6=Sáb)
    const daysInMonth = new Date(year, month + 1, 0).getDate(); // Último dia do mês

    document.getElementById('currentMonthYearAppointments').textContent = dateObj.toLocaleString('pt-BR', { month: 'long', year: 'numeric' });

    // Preencher dias vazios no início
    for (let i = 0; i < firstDay; i++) {
        const emptyDiv = document.createElement('div');
        emptyDiv.className = 'py-2';
        calendarEl.appendChild(emptyDiv);
    }

    // Preencher dias do mês
    for (let day = 1; day <= daysInMonth; day++) {
        const dayDiv = document.createElement('div');
        dayDiv.className = 'py-2 px-1 rounded-lg cursor-pointer transition duration-200';
        dayDiv.textContent = day;

        const fullDate = new Date(year, month, day);
        const today = new Date();
        today.setHours(0, 0, 0, 0); // Zera hora para comparação de data

        // Adiciona classes para dias passados, hoje, e futuros
        if (fullDate < today) {
            dayDiv.classList.add('bg-gray-800', 'text-gray-500'); // Dias passados
        } else if (fullDate.toDateString() === today.toDateString()) {
            dayDiv.classList.add('bg-yellow-600', 'text-black', 'font-bold'); // Hoje
        } else {
            dayDiv.classList.add('hover:bg-yellow-500', 'hover:text-black'); // Dias futuros
        }

        // Adiciona um listener para selecionar a data
        dayDiv.addEventListener('click', () => {
            // Remove a classe 'selected' de qualquer dia anterior
            document.querySelectorAll('.calendar-grid div.bg-blue-600').forEach(el => {
                el.classList.remove('bg-blue-600', 'text-white', 'font-bold');
                if (new Date(year, month, parseInt(el.textContent)).toDateString() === today.toDateString()) {
                    el.classList.add('bg-yellow-600', 'text-black'); // Volta a cor de 'hoje' se for o caso
                } else if (new Date(year, month, parseInt(el.textContent)) > today) {
                     el.classList.add('hover:bg-yellow-500', 'hover:text-black');
                } else {
                     el.classList.add('bg-gray-800', 'text-gray-500');
                }
            });

            // Adiciona a classe 'selected' ao dia clicado
            dayDiv.classList.remove('bg-yellow-600', 'text-black', 'hover:bg-yellow-500', 'hover:text-black', 'bg-gray-800', 'text-gray-500');
            dayDiv.classList.add('bg-blue-600', 'text-white', 'font-bold');

            const selectedDate = formatDate(fullDate);
            const barberId = localStorage.getItem('barberId');
            const token = localStorage.getItem('token');
            fetchAndDisplayAppointments(barberId, token, selectedDate);
        });

        calendarEl.appendChild(dayDiv);
    }
}


// Funções para gerenciar o calendário de disponibilidade (se for usar)
async function fetchAndDisplayAvailableDays(barberId, token) {
    const availableDaysList = document.getElementById('availableDaysList');
    availableDaysList.innerHTML = '<p class="text-gray-400">Carregando dias disponíveis...</p>';

    try {
        // Exemplo: se você tiver uma rota para isso
        // const response = await fetch(`http://localhost:3001/api/barbers/${barberId}/available-days`, {
        //     headers: { 'Authorization': `Bearer ${token}` }
        // });

        // Por enquanto, apenas um mock ou nada, já que não temos essa rota em dashboardController.js
        availableDaysList.innerHTML = '<p class="text-gray-400">Nenhum dia de disponibilidade cadastrado (implementar rota e lógica).</p>';

    } catch (error) {
        console.error('Erro ao carregar dias disponíveis:', error);
    }
}

function renderManageCalendar(dateObj) {
    const calendarEl = document.getElementById('manageCalendar');
    calendarEl.innerHTML = `
        <div class="font-bold text-gray-400">Dom</div>
        <div class="font-bold text-gray-400">Seg</div>
        <div class="font-bold text-gray-400">Ter</div>
        <div class="font-bold text-gray-400">Qua</div>
        <div class="font-bold text-gray-400">Qui</div>
        <div class="font-bold text-gray-400">Sex</div>
        <div class="font-bold text-gray-400">Sáb</div>
    `;

    const year = dateObj.getFullYear();
    const month = dateObj.getMonth();
    const firstDay = new Date(year, month, 1).getDay();
    const daysInMonth = new Date(year, month + 1, 0).getDate();

    document.getElementById('currentMonthYearManage').textContent = dateObj.toLocaleString('pt-BR', { month: 'long', year: 'numeric' });

    for (let i = 0; i < firstDay; i++) {
        calendarEl.appendChild(document.createElement('div'));
    }

    for (let day = 1; day <= daysInMonth; day++) {
        const dayDiv = document.createElement('div');
        dayDiv.className = 'py-2 px-1 rounded-lg cursor-pointer transition duration-200';
        dayDiv.textContent = day;

        const fullDate = new Date(year, month, day);
        const today = new Date();
        today.setHours(0,0,0,0);

        if (fullDate < today) {
            dayDiv.classList.add('bg-gray-800', 'text-gray-500');
        } else {
             dayDiv.classList.add('hover:bg-yellow-500', 'hover:text-black');
        }

        // TODO: Adicionar lógica para marcar dias disponíveis aqui
        // Ex: if (availableDays.includes(formatDate(fullDate))) { dayDiv.classList.add('bg-green-500'); }

        dayDiv.addEventListener('click', () => {
            // Lógica para adicionar/remover dia de disponibilidade
            alert(`Gerenciar disponibilidade para ${formatDate(fullDate)}`);
            // Você precisaria de um endpoint no backend para isso.
        });

        calendarEl.appendChild(dayDiv);
    }
}


// Event Listeners e inicialização
document.addEventListener('DOMContentLoaded', async () => {
    const barberId = localStorage.getItem('barberId');
    const token = localStorage.getItem('token');
    const barberName = localStorage.getItem('barberName');
    const welcomeMessage = document.getElementById('welcomeMessage');
    const logoutButton = document.getElementById('logoutButton');
    const backToSiteButton = document.getElementById('backToSiteButton');

    // Verifica se está logado
    if (!barberId || !token) {
        window.location.href = 'login.html';
        return;
    }

    if (barberName) {
        welcomeMessage.textContent = `Olá, ${barberName}!`;
    }

    // Inicializa a exibição de dados
    await fetchAndDisplayStats(barberId, token);

    // Inicializa os calendários
    renderAppointmentsCalendar(currentAppointmentsDate);
    renderManageCalendar(currentManageDate);

    // Seleciona a data atual no calendário de agendamentos para carregar os compromissos do dia
    const today = new Date();
    const currentDayEl = document.querySelector(`#appointmentsCalendar div:nth-child(${today.getDate() + new Date(today.getFullYear(), today.getMonth(), 1).getDay() + 7})`); // +7 para pular os dias da semana
    if (currentDayEl) {
        currentDayEl.click(); // Simula um clique para carregar os agendamentos de hoje
    }


    // Event Listeners para navegação dos calendários
    document.getElementById('prevMonthAppointments').addEventListener('click', () => {
        currentAppointmentsDate.setMonth(currentAppointmentsDate.getMonth() - 1);
        renderAppointmentsCalendar(currentAppointmentsDate);
        // Não busca agendamentos automaticamente, o usuário precisa clicar no dia
        document.querySelector('#appointmentsList + h3').textContent = `Agendamentos para Selecione uma Data`;
        document.getElementById('appointmentsList').innerHTML = '<p class="text-gray-400">Nenhum agendamento para esta data.</p>';
    });

    document.getElementById('nextMonthAppointments').addEventListener('click', () => {
        currentAppointmentsDate.setMonth(currentAppointmentsDate.getMonth() + 1);
        renderAppointmentsCalendar(currentAppointmentsDate);
        // Não busca agendamentos automaticamente, o usuário precisa clicar no dia
        document.querySelector('#appointmentsList + h3').textContent = `Agendamentos para Selecione uma Data`;
        document.getElementById('appointmentsList').innerHTML = '<p class="text-gray-400">Nenhum agendamento para esta data.</p>';
    });

    document.getElementById('prevMonthManage').addEventListener('click', () => {
        currentManageDate.setMonth(currentManageDate.getMonth() - 1);
        renderManageCalendar(currentManageDate);
        fetchAndDisplayAvailableDays(barberId, token); // Recarrega dias disponíveis para o novo mês
    });

    document.getElementById('nextMonthManage').addEventListener('click', () => {
        currentManageDate.setMonth(currentManageDate.getMonth() + 1);
        renderManageCalendar(currentManageDate);
        fetchAndDisplayAvailableDays(barberId, token); // Recarrega dias disponíveis para o novo mês
    });

    // Botões de navegação
    logoutButton.addEventListener('click', () => {
        localStorage.clear();
        window.location.href = 'login.html';
    });

    backToSiteButton.addEventListener('click', () => {
        window.location.href = 'index.html';
    });

    // Chame a função para carregar os dias disponíveis (mesmo que mockado ou vazio por enquanto)
    fetchAndDisplayAvailableDays(barberId, token);
});