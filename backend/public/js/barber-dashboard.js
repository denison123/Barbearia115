// public/js/barber-dashboard.js

// URL base do seu backend
const API_BASE_URL = 'https://barbearia-backend-9h56.onrender.com';

// Função para formatar datas para o formato YYYY-MM-DD
function formatDate(date) {
    const year = date.getFullYear();
    const month = (date.getMonth() + 1).toString().padStart(2, '0');
    const day = date.getDate().toString().padStart(2, '0');
    return `${year}-${month}-${day}`;
}

// Variáveis globais para o mês/ano dos calendários
let currentAppointmentsDate = new Date(); // Inicia com a data atual para o calendário de agendamentos
let currentManageDate = new Date();        // Inicia com a data atual para o calendário de gerenciar disponibilidade
let selectedManageDates = new Set();       // Armazena as datas selecionadas para disponibilidade

// Função para buscar e exibir estatísticas
async function fetchAndDisplayStats(barberId, token) {
    console.log('[fetchAndDisplayStats] Buscando estatísticas...');
    try {
        // CORREÇÃO: Adicionado '/api' ao caminho da URL
        const response = await fetch(`${API_BASE_URL}/api/barber/dashboard-stats`, {
            headers: {
                'Authorization': `Bearer ${token}`
            }
        });

        if (response.ok) {
            const stats = await response.json();
            document.getElementById('cortes-realizados').textContent = stats.completedCuts || 0;
            document.getElementById('cortes-pendentes').textContent = stats.pendingAppointments || 0;
            document.getElementById('cortes-cancelados').textContent = stats.cancelledAppointments || 0;
            console.log('[fetchAndDisplayStats] Estatísticas carregadas com sucesso:', stats);
        } else {
            console.error('Erro ao carregar estatísticas:', response.status, response.statusText);
            const errorData = await response.json();
            if (response.status === 401 || response.status === 403) {
                alert('Sua sessão expirou ou não está autorizada. Faça login novamente.');
                localStorage.clear();
                window.location.href = 'login.html';
            } else {
                alert(`Erro ao carregar estatísticas: ${errorData.message || response.statusText}`);
            }
        }
    } catch (error) {
        console.error('Erro de rede ou servidor ao buscar estatísticas:', error);
        alert('Não foi possível conectar ao servidor para carregar as estatísticas.');
    }
}

// Função para atualizar o status de um agendamento
async function updateAppointmentStatus(appointmentId, newStatus, barberId, token) {
    console.log(`[updateAppointmentStatus] Atualizando agendamento ${appointmentId} para status: ${newStatus}`);
    try {
        // CORREÇÃO: Adicionado '/api' ao caminho da URL
        const response = await fetch(`${API_BASE_URL}/api/barber/appointments/${appointmentId}/status`, {
            method: 'PUT',
            headers: {
                'Content-Type': 'application/json',
                'Authorization': `Bearer ${token}`
            },
            body: JSON.stringify({ status: newStatus })
        });

        const data = await response.json();

        if (response.ok) {
            alert(`Agendamento ${appointmentId} atualizado para: ${newStatus}`);
            // Recarrega os agendamentos para a data atual para refletir a mudança
            const selectedDate = document.getElementById('selected-date-display').textContent;
            fetchAndDisplayAppointments(barberId, token, selectedDate);
            // Recarrega as estatísticas para atualizar os contadores
            fetchAndDisplayStats(barberId, token);
            console.log('[updateAppointmentStatus] Status atualizado com sucesso.');
        } else {
            console.error('Erro ao atualizar status do agendamento:', data.message || response.statusText);
            alert(`Erro ao atualizar agendamento: ${data.message || 'Erro desconhecido'}`);
        }
    } catch (error) {
        console.error('Erro de rede ao atualizar status:', error);
        alert('Não foi possível conectar ao servidor para atualizar o agendamento.');
    }
}


// Função para buscar e exibir agendamentos para uma data específica
async function fetchAndDisplayAppointments(barberId, token, date) {
    const appointmentsList = document.getElementById('appointments-list');
    const selectedDateDisplay = document.getElementById('selected-date-display');

    console.log(`[fetchAndDisplayAppointments] Buscando agendamentos para data: ${date}`);
    appointmentsList.innerHTML = '<li class="text-gray-400">Carregando agendamentos...</li>';
    selectedDateDisplay.textContent = date;

    try {
        // CORREÇÃO: Adicionado '/api' ao caminho da URL
        const response = await fetch(`${API_BASE_URL}/api/barber/appointments?date=${date}`, {
            headers: {
                'Authorization': `Bearer ${token}`
            }
        });

        if (response.ok) {
            const appointments = await response.json();
            console.log('Agendamentos recebidos para', date, ':', appointments); // Log para depuração
            appointmentsList.innerHTML = ''; // Limpa a lista antes de adicionar

            if (appointments.length === 0) {
                appointmentsList.innerHTML = '<li class="text-gray-400">Nenhum agendamento para esta data.</li>';
            } else {
                appointments.forEach(appt => {
                    // --- NOVOS LOGS DE DEPURAÇÃO ---
                    console.log('Detalhes do agendamento (appt):', appt);
                    console.log('appt.dateTime:', appt.dateTime);
                    console.log('typeof appt.dateTime:', typeof appt.dateTime);
                    console.log('appt.dateTime._seconds:', appt.dateTime ? appt.dateTime._seconds : 'N/A');
                    console.log('typeof appt.dateTime._seconds:', appt.dateTime ? typeof appt.dateTime._seconds : 'N/A');
                    // --- FIM DOS NOVOS LOGS ---

                    let appointmentTime = '';
                    // Tenta parsear como Firestore Timestamp (objeto com _seconds e _nanoseconds)
                    if (appt.dateTime && typeof appt.dateTime === 'object' && appt.dateTime._seconds !== undefined) {
                        const dateObj = new Date(appt.dateTime._seconds * 1000 + (appt.dateTime._nanoseconds / 1000000 || 0));
                        appointmentTime = dateObj.toLocaleTimeString('pt-BR', { hour: '2-digit', minute: '2-digit' });
                    } else if (appt.dateTime) {
                        // Tenta parsear como string ISO ou outro formato de data que Date() entenda
                        try {
                            const dateObj = new Date(appt.dateTime);
                            if (!isNaN(dateObj.getTime())) { // Verifica se a data é válida
                                appointmentTime = dateObj.toLocaleTimeString('pt-BR', { hour: '2-digit', minute: '2-digit' });
                            } else {
                                appointmentTime = 'N/A (Formato inválido)';
                            }
                        } catch (e) {
                            appointmentTime = 'N/A (Erro de parse)';
                        }
                    } else {
                        appointmentTime = 'N/A';
                    }

                    const li = document.createElement('li');
                    li.className = 'bg-gray-700 p-4 rounded-lg flex justify-between items-center mb-2';
                    li.innerHTML = `
                        <div>
                            <p class="text-white font-semibold">${appointmentTime} - ${appt.customerName || 'Cliente Desconhecido'}</p>
                            <p class="text-gray-400 text-sm">Serviço: ${appt.service || 'N/A'}</p>
                            <p class="text-gray-400 text-sm">Telefone: ${appt.customerPhone || 'N/A'}</p>
                            <p class="text-gray-400 text-xs">Status: ${appt.status || 'N/A'}</p>
                        </div>
                        <div class="flex space-x-2">
                            <button class="${appt.status === 'completed' ? 'bg-gray-500 cursor-not-allowed' : 'bg-green-600 hover:bg-green-700'} text-white py-1 px-3 rounded-lg text-sm complete-btn" data-id="${appt.id}" ${appt.status === 'completed' ? 'disabled' : ''}>Concluído</button>
                            <button class="${appt.status === 'cancelled' ? 'bg-gray-500 cursor-not-allowed' : 'bg-red-600 hover:bg-red-700'} text-white py-1 px-3 rounded-lg text-sm cancel-btn" data-id="${appt.id}" ${appt.status === 'cancelled' ? 'disabled' : ''}>Cancelar</button>
                        </div>
                    `;
                    appointmentsList.appendChild(li);

                    // Adiciona event listeners aos botões apenas se não estiverem desabilitados
                    if (appt.status !== 'completed') {
                        li.querySelector('.complete-btn').addEventListener('click', () => {
                            const storedBarber = JSON.parse(localStorage.getItem('barber'));
                            const barberId = storedBarber ? storedBarber.id : null;
                            const token = localStorage.getItem('token');
                            if (barberId && token) {
                                updateAppointmentStatus(appt.id, 'completed', barberId, token);
                            } else {
                                alert('Erro: Dados do barbeiro ou token ausentes.');
                                localStorage.clear();
                                window.location.href = 'login.html';
                            }
                        });
                    }

                    if (appt.status !== 'cancelled') {
                        li.querySelector('.cancel-btn').addEventListener('click', () => {
                            const storedBarber = JSON.parse(localStorage.getItem('barber'));
                            const barberId = storedBarber ? storedBarber.id : null;
                            const token = localStorage.getItem('token');
                            if (barberId && token) {
                                updateAppointmentStatus(appt.id, 'cancelled', barberId, token);
                            } else {
                                alert('Erro: Dados do barbeiro ou token ausentes.');
                                localStorage.clear();
                                window.location.href = 'login.html';
                            }
                        });
                    }
                });
            }
        } else {
            console.error('Erro ao carregar agendamentos:', response.status, response.statusText);
            const errorData = await response.json();
            if (response.status === 401 || response.status === 403) {
                alert('Sessão expirada ou não autorizada. Faça login novamente.');
                localStorage.clear();
                window.location.href = 'login.html';
            } else {
                appointmentsList.innerHTML = `<li class="text-red-500">Erro ao carregar agendamentos: ${errorData.message || response.statusText}</li>`;
            }
        }
    } catch (error) {
        console.error('Erro na requisição dos agendamentos:', error);
        appointmentsList.innerHTML = '<li class="text-red-500">Erro de conexão ao carregar agendamentos.</li>';
    }
}

/**
 * Busca todos os agendamentos para o mês atual e marca os dias no calendário.
 * Esta função é chamada ao renderizar o calendário.
 */
async function fetchAndMarkAppointmentsInCalendar(barberId, token, dateObj) {
    console.log('[fetchAndMarkAppointmentsInCalendar] Buscando agendamentos para marcar no calendário...');
    try {
        const year = dateObj.getFullYear();
        const month = dateObj.getMonth(); // Mês é 0-indexado

        // CORREÇÃO: Adicionado '/api' ao caminho da URL
        const response = await fetch(`${API_BASE_URL}/api/barber/appointments?month=${month}&year=${year}`, {
            headers: {
                'Authorization': `Bearer ${token}`
            }
        });

        if (response.ok) {
            const monthAppointments = await response.json();
            console.log('Agendamentos do mês recebidos para marcação:', monthAppointments);

            const datesWithAppointments = new Set();
            monthAppointments.forEach(appt => {
                if (appt.dateTime && typeof appt.dateTime === 'object' && appt.dateTime._seconds !== undefined) {
                    const apptDate = new Date(appt.dateTime._seconds * 1000 + appt.dateTime._nanoseconds / 1000000);
                    datesWithAppointments.add(formatDate(apptDate));
                }
            });

            const calendarEl = document.getElementById('appointments-calendar');
            if (!calendarEl) {
                console.error('[fetchAndMarkAppointmentsInCalendar] Elemento #appointments-calendar não encontrado!');
                return;
            }
            calendarEl.querySelectorAll('.calendar-day').forEach(dayDiv => {
                const date = dayDiv.dataset.date;
                if (date) { // Garante que o data-date existe
                    if (datesWithAppointments.has(date)) {
                        dayDiv.classList.add('has-appointments');
                    } else {
                        dayDiv.classList.remove('has-appointments');
                    }
                }
            });
            console.log('[fetchAndMarkAppointmentsInCalendar] Dias com agendamentos marcados no calendário.');

        } else {
            console.error('Erro ao buscar agendamentos do mês para marcação:', response.status, response.statusText);
        }
    } catch (error) {
        console.error('Erro de rede ao buscar agendamentos do mês para marcação:', error);
    }
}


/**
 * Renderiza o calendário de agendamentos dinamicamente.
 * @param {Date} dateObj - Objeto Date para o mês e ano a serem renderizados.
 */
function renderAppointmentsCalendar(dateObj) {
    console.log('[renderAppointmentsCalendar] Iniciando renderização do calendário de agendamentos para:', dateObj.toDateString());
    const calendarEl = document.getElementById('appointments-calendar');
    if (!calendarEl) {
        console.error('[renderAppointmentsCalendar] Elemento #appointments-calendar não encontrado!');
        return;
    }

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

    document.getElementById('current-month-appointments').textContent = dateObj.toLocaleString('pt-BR', { month: 'long', year: 'numeric' });

    for (let i = 0; i < firstDay; i++) {
        const emptyDiv = document.createElement('div');
        emptyDiv.className = 'py-2';
        calendarEl.appendChild(emptyDiv);
        console.log(`[renderAppointmentsCalendar] Adicionado div vazia para preenchimento: ${i}`);
    }

    for (let day = 1; day <= daysInMonth; day++) {
        const dayDiv = document.createElement('div');
        dayDiv.className = 'py-2 px-1 rounded-lg cursor-pointer transition duration-200 text-center calendar-day';
        dayDiv.textContent = day;

        const fullDate = new Date(year, month, day);
        const today = new Date();
        today.setHours(0, 0, 0, 0);

        const formattedDate = formatDate(fullDate);
        dayDiv.dataset.date = formattedDate; // Adiciona o data-date a cada dia

        if (fullDate < today) {
            dayDiv.classList.add('bg-gray-800', 'text-gray-500');
        } else if (fullDate.toDateString() === today.toDateString()) {
            dayDiv.classList.add('bg-yellow-600', 'text-black', 'font-bold');
        } else {
            dayDiv.classList.add('hover:bg-yellow-500', 'hover:text-black');
        }

        dayDiv.addEventListener('click', () => {
            calendarEl.querySelectorAll('.calendar-day').forEach(d => d.classList.remove('selected', 'bg-blue-600', 'text-white'));
            dayDiv.classList.add('selected', 'bg-blue-600', 'text-white', 'font-bold');

            const selectedDate = dayDiv.dataset.date;
            const storedBarber = JSON.parse(localStorage.getItem('barber'));
            const barberId = storedBarber ? storedBarber.id : null;
            const token = localStorage.getItem('token');
            if (barberId && token) {
                fetchAndDisplayAppointments(barberId, token, selectedDate);
            } else {
                alert('Informações do barbeiro ou token não encontrados. Faça login novamente.');
                localStorage.clear();
                window.location.href = 'login.html';
            }
        });

        calendarEl.appendChild(dayDiv);
        console.log(`[renderAppointmentsCalendar] Adicionado dia ${day} ao calendário.`);
    }
    console.log('[renderAppointmentsCalendar] Renderização do calendário de agendamentos concluída.');
}

// Funções para gerenciar o calendário de disponibilidade
async function fetchAndDisplayAvailableDays(barberId, token) {
    console.log('[fetchAndDisplayAvailableDays] Buscando dias disponíveis para gerenciamento...');
    const availableDaysList = document.getElementById('available-days-list');
    availableDaysList.innerHTML = '<li class="text-gray-400">Carregando dias disponíveis...</li>';
    selectedManageDates.clear(); // Limpa as datas selecionadas ao recarregar

    try {
        // CORREÇÃO: Adicionado '/api' ao caminho da URL
        const response = await fetch(`${API_BASE_URL}/api/barber/${barberId}/available-days`, {
            headers: {
                'Authorization': `Bearer ${token}`
            }
        });

        if (response.ok) {
            const availableDays = await response.json();
            console.log('Dias disponíveis recebidos do backend para gerenciamento:', availableDays);

            availableDaysList.innerHTML = '';
            if (availableDays.length === 0) {
                availableDaysList.innerHTML = '<li class="text-gray-400">Nenhum dia de disponibilidade cadastrado.</li>';
            } else {
                availableDays.forEach(date => {
                    selectedManageDates.add(date); // Adiciona as datas existentes ao Set
                    const li = document.createElement('li');
                    li.className = 'text-white text-sm mb-1';
                    li.textContent = date;
                    availableDaysList.appendChild(li);
                });
            }
            // Após carregar os dias, renderiza o calendário para marcá-los
            renderManageCalendar(currentManageDate);
            console.log('[fetchAndDisplayAvailableDays] Dias disponíveis carregados e calendário de gerenciamento renderizado.');

        } else {
            console.error('Erro ao carregar dias disponíveis:', response.status, response.statusText);
            availableDaysList.innerHTML = `<li class="text-red-500">Erro ao carregar dias disponíveis: ${response.statusText}</li>`;
        }
    } catch (error) {
        console.error('Erro de rede ao carregar dias disponíveis:', error);
        availableDaysList.innerHTML = '<li class="text-red-500">Erro de conexão ao carregar dias disponíveis.</li>';
    }
}

async function saveAvailableDays(barberId, token) {
    console.log('[saveAvailableDays] Tentando salvar dias disponíveis...');
    try {
        const datesToSave = Array.from(selectedManageDates); // Converte o Set para Array
        console.log('Enviando dias disponíveis para salvar:', datesToSave);

        // CORREÇÃO: Adicionado '/api' ao caminho da URL
        const response = await fetch(`${API_BASE_URL}/api/barber/available-days`, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
                'Authorization': `Bearer ${token}`
            },
            body: JSON.stringify({ availableDates: datesToSave })
        });

        const data = await response.json();

        if (response.ok) {
            alert(data.message || 'Dias disponíveis salvos com sucesso!');
            // Recarrega a lista de dias disponíveis e o calendário após salvar
            fetchAndDisplayAvailableDays(barberId, token);
            console.log('[saveAvailableDays] Dias disponíveis salvos com sucesso.');
        } else {
            console.error('Erro ao salvar dias disponíveis:', data.message || response.statusText);
            alert(`Erro ao salvar dias disponíveis: ${data.message || 'Erro desconhecido'}`);
        }
    } catch (error) {
        console.error('Erro de rede ao salvar dias disponíveis:', error);
        alert('Não foi possível conectar ao servidor para salvar os dias disponíveis.');
    }
}


/**
 * Renderiza o calendário de gerenciamento de disponibilidade dinamicamente.
 * @param {Date} dateObj - Objeto Date para o mês e ano a serem renderizados.
 */
function renderManageCalendar(dateObj) {
    console.log('[renderManageCalendar] Iniciando renderização do calendário de gerenciamento para:', dateObj.toDateString());
    const calendarEl = document.getElementById('availability-calendar');
    if (!calendarEl) {
        console.error('[renderManageCalendar] Elemento #availability-calendar não encontrado!');
        return;
    }

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

    document.getElementById('current-month-availability').textContent = dateObj.toLocaleString('pt-BR', { month: 'long', year: 'numeric' });

    for (let i = 0; i < firstDay; i++) {
        const emptyDiv = document.createElement('div');
        emptyDiv.className = 'py-2';
        calendarEl.appendChild(emptyDiv);
        console.log(`[renderManageCalendar] Adicionado div vazia para preenchimento: ${i}`);
    }

    for (let day = 1; day <= daysInMonth; day++) {
        const dayDiv = document.createElement('div');
        dayDiv.className = 'py-2 px-1 rounded-lg cursor-pointer transition duration-200 text-center manage-calendar-day';
        dayDiv.textContent = day;

        const fullDate = new Date(year, month, day);
        const today = new Date();
        today.setHours(0,0,0,0);

        const formattedDate = formatDate(fullDate);
        dayDiv.dataset.date = formattedDate; // Adiciona o data-date a cada dia

        if (fullDate < today) {
            dayDiv.classList.add('bg-gray-800', 'text-gray-500', 'cursor-not-allowed');
        } else {
            dayDiv.classList.add('hover:bg-yellow-500', 'hover:text-black');
            // Marca o dia se já estiver selecionado
            if (selectedManageDates.has(formattedDate)) {
                dayDiv.classList.add('bg-blue-600', 'text-white');
            }

            dayDiv.addEventListener('click', () => {
                if (dayDiv.classList.contains('bg-gray-800')) { // Não permite selecionar dias passados
                    return;
                }

                if (selectedManageDates.has(formattedDate)) {
                    selectedManageDates.delete(formattedDate);
                    dayDiv.classList.remove('bg-blue-600', 'text-white');
                } else {
                    selectedManageDates.add(formattedDate);
                    dayDiv.classList.add('bg-blue-600', 'text-white');
                }
                console.log('Dias selecionados para disponibilidade:', Array.from(selectedManageDates));
            });
        }
        calendarEl.appendChild(dayDiv);
        console.log(`[renderManageCalendar] Adicionado dia ${day} ao calendário de gerenciamento.`);
    }
    console.log('[renderManageCalendar] Renderização do calendário de gerenciamento concluída.');
}

// Event Listeners e inicialização
document.addEventListener('DOMContentLoaded', async () => {
    console.log('[DOMContentLoaded] Página carregada. Iniciando dashboard do barbeiro...');
    const storedBarber = JSON.parse(localStorage.getItem('barber'));
    const barberId = storedBarber ? storedBarber.id : null;
    const token = localStorage.getItem('token');
    const barberName = storedBarber ? storedBarber.name : null;

    const welcomeMessageEl = document.getElementById('welcome-message');
    const logoutButton = document.getElementById('logout-button');
    const backToSiteLink = document.getElementById('view-site-link');
    const saveAvailabilityButton = document.getElementById('save-availability-btn'); // Novo botão

    if (!barberId || !token) {
        console.warn('[DOMContentLoaded] ID do barbeiro ou token ausente. Redirecionando para login.');
        window.location.href = 'login.html';
        return;
    }

    if (barberName) {
        welcomeMessageEl.textContent = `Olá, ${barberName}!`;
    }

    await fetchAndDisplayStats(barberId, token);

    // Renderiza o calendário de agendamentos
    renderAppointmentsCalendar(currentAppointmentsDate);

    // Seleciona o dia atual no calendário e carrega agendamentos para ele.
    const today = new Date();
    const todayFormatted = formatDate(today);
    const todayElement = document.querySelector(`#appointments-calendar div[data-date="${todayFormatted}"]`);

    if (todayElement) {
        console.log('[DOMContentLoaded] Clicando no dia atual para carregar agendamentos:', todayFormatted);
        todayElement.click(); // Simula um clique para carregar os agendamentos de hoje e selecioná-lo
    } else {
        console.warn('[DOMContentLoaded] Dia atual não encontrado no calendário de agendamentos. Tentando o primeiro dia.');
        const firstDayElement = document.querySelector('#appointments-calendar div[data-date]');
        if (firstDayElement) {
            firstDayElement.click();
        } else {
            console.error('[DOMContentLoaded] Nenhum dia encontrado no calendário de agendamentos para clicar.');
        }
    }

    // Marca os dias com agendamentos APÓS o calendário ser renderizado e o dia atual clicado
    if (barberId && token) {
        console.log('[DOMContentLoaded] Buscando e marcando agendamentos no calendário.');
        await fetchAndMarkAppointmentsInCalendar(barberId, token, currentAppointmentsDate);
    }

    // Inicializa o calendário de gerenciamento de disponibilidade
    console.log('[DOMContentLoaded] Buscando e exibindo dias disponíveis para gerenciamento.');
    await fetchAndDisplayAvailableDays(barberId, token); // Busca os dias e renderiza o calendário

    document.getElementById('prev-month-appointments').addEventListener('click', async () => {
        console.log('[prev-month-appointments] Botão Anterior clicado.');
        currentAppointmentsDate.setMonth(currentAppointmentsDate.getMonth() - 1);
        renderAppointmentsCalendar(currentAppointmentsDate);
        const storedBarber = JSON.parse(localStorage.getItem('barber'));
        const barberId = storedBarber ? storedBarber.id : null;
        const token = localStorage.getItem('token');
        if (barberId && token) {
            await fetchAndMarkAppointmentsInCalendar(barberId, token, currentAppointmentsDate);
            const firstDayOfMonthEl = document.querySelector('#appointments-calendar div[data-date]');
            if (firstDayOfMonthEl) {
                firstDayOfMonthEl.click();
            }
        }
    });

    document.getElementById('next-month-appointments').addEventListener('click', async () => {
        console.log('[next-month-appointments] Botão Próximo clicado.');
        currentAppointmentsDate.setMonth(currentAppointmentsDate.getMonth() + 1);
        renderAppointmentsCalendar(currentAppointmentsDate);
        const storedBarber = JSON.parse(localStorage.getItem('barber'));
        const barberId = storedBarber ? storedBarber.id : null;
        const token = localStorage.getItem('token');
        if (barberId && token) {
            await fetchAndMarkAppointmentsInCalendar(barberId, token, currentAppointmentsDate);
            const firstDayOfMonthEl = document.querySelector('#appointments-calendar div[data-date]');
            if (firstDayOfMonthEl) {
                firstDayOfMonthEl.click();
            }
        }
    });

    document.getElementById('prev-month-availability').addEventListener('click', async () => {
        console.log('[prev-month-availability] Botão Anterior clicado (disponibilidade).');
        currentManageDate.setMonth(currentManageDate.getMonth() - 1);
        renderManageCalendar(currentManageDate);
        // Não chame fetchAndDisplayAvailableDays aqui, pois renderManageCalendar já usa selectedManageDates
        // que é populado por fetchAndDisplayAvailableDays no início.
        // Se precisar recarregar do backend, chame fetchAndDisplayAvailableDays(barberId, token);
    });

    document.getElementById('next-month-availability').addEventListener('click', async () => {
        console.log('[next-month-availability] Botão Próximo clicado (disponibilidade).');
        currentManageDate.setMonth(currentManageDate.getMonth() + 1);
        renderManageCalendar(currentManageDate);
        // Não chame fetchAndDisplayAvailableDays aqui, pois renderManageCalendar já usa selectedManageDates
        // que é populado por fetchAndDisplayAvailableDays no início.
        // Se precisar recarregar do backend, chame fetchAndDisplayAvailableDays(barberId, token);
    });

    // Event listener para o novo botão de salvar
    if (saveAvailabilityButton) {
        saveAvailabilityButton.addEventListener('click', () => {
            console.log('[saveAvailabilityButton] Botão Salvar Disponibilidade clicado.');
            const storedBarber = JSON.parse(localStorage.getItem('barber'));
            const barberId = storedBarber ? storedBarber.id : null;
            const token = localStorage.getItem('token');
            if (barberId && token) {
                saveAvailableDays(barberId, token);
            } else {
                alert('Erro: Dados do barbeiro ou token ausentes.');
                localStorage.clear();
                window.location.href = 'login.html';
            }
        });
    }


    logoutButton.addEventListener('click', () => {
        console.log('[logoutButton] Botão Sair clicado. Limpando localStorage e redirecionando.');
        localStorage.clear();
        window.location.href = 'login.html';
    });

    backToSiteLink.addEventListener('click', (e) => {
        e.preventDefault();
        console.log('[backToSiteLink] Botão Voltar ao Site clicado. Redirecionando.');
        window.location.href = 'index.html';
    });
});
