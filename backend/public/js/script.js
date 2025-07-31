// public/js/script.js

// URL base do seu backend
//const API_BASE_URL = 'http://localhost:3001/api';
const API_BASE_URL = 'https://barbearia-backend-9h50.onrender.com/api';

// Elementos do DOM
const calendarGrid = document.getElementById('calendar-grid');
const currentMonthYearDisplay = document.getElementById('current-month-year');
const prevMonthButton = document.getElementById('prev-month');
const nextMonthButton = document.getElementById('next-month');
const availableTimesList = document.getElementById('available-times-list');
const selectedDateInput = document.getElementById('selected-date');
const selectedTimeInput = document.getElementById('selected-time');
const customerNameInput = document.getElementById('customer-name-input');
const customerPhoneInput = document.getElementById('customer-phone-input');
const barberSelect = document.getElementById('barber-select');
const paymentMethodSelect = document.getElementById('payment-method-select');
const serviceSelect = document.getElementById('service-select');
const confirmAppointmentButton = document.getElementById('confirm-appointment-button');
const appointmentMessage = document.getElementById('appointment-message');

// Variáveis de estado do calendário
let currentCalendarDate = new Date();
let availableDaysForSelectedBarber = []; // Armazena os dias disponíveis do barbeiro selecionado
let availableSlotsForSelectedDate = []; // Armazena os horários disponíveis para a data selecionada

// --- Funções Auxiliares ---

// Função para formatar datas para o formato YYYY-MM-DD
function formatDate(date) {
    const year = date.getFullYear();
    const month = (date.getMonth() + 1).toString().padStart(2, '0');
    const day = date.getDate().toString().padStart(2, '0');
    return `${year}-${month}-${day}`;
}

// Função para exibir mensagens na interface
function displayMessage(message, type = 'info') {
    appointmentMessage.textContent = message;
    appointmentMessage.className = 'mt-4 text-center font-semibold';
    if (type === 'success') {
        appointmentMessage.classList.add('text-green-500');
    } else if (type === 'error') {
        appointmentMessage.classList.add('text-red-500');
    } else {
        appointmentMessage.classList.add('text-gray-400');
    }
}

// --- Funções de Busca de Dados (Backend) ---

/**
 * Busca a lista de barbeiros disponíveis no backend.
 * Popula o dropdown de seleção de barbeiros.
 */
async function fetchBarbers() {
    console.log('[fetchBarbers] Buscando barbeiros...');
    try {
        const response = await fetch(`${API_BASE_URL}/barber/list`);
        const barbers = await response.json();
        console.log('[fetchBarbers] Barbeiros recebidos:', barbers);

        barberSelect.innerHTML = '<option value="">Selecione um Barbeiro</option>';
        if (barbers.length > 0) {
            barbers.forEach(barber => {
                const option = document.createElement('option');
                option.value = barber.id;
                option.textContent = barber.name;
                barberSelect.appendChild(option);
            });
            // Opcional: Selecionar o primeiro barbeiro por padrão se houver apenas um ou para iniciar
            // if (barbers.length === 1) {
            //     barberSelect.value = barbers[0].id;
            // }
        } else {
            const option = document.createElement('option');
            option.value = '';
            option.textContent = 'Nenhum barbeiro disponível.';
            barberSelect.appendChild(option);
        }
    } catch (error) {
        console.error('[fetchBarbers] Erro ao buscar barbeiros:', error);
        displayMessage('Erro ao carregar a lista de barbeiros.', 'error');
    }
}

/**
 * Busca os dias de disponibilidade para o barbeiro selecionado.
 * @param {string} barberId - O ID do barbeiro.
 */
async function fetchAvailableDays(barberId) {
    console.log(`[fetchAvailableDays] Buscando dias disponíveis para o barbeiro: ${barberId}`);
    if (!barberId) {
        availableDaysForSelectedBarber = [];
        renderCalendar(currentCalendarDate); // Renderiza sem dias disponíveis
        console.log('[fetchAvailableDays] Nenhum barbeiro selecionado, dias disponíveis resetados.');
        return;
    }
    try {
        const response = await fetch(`${API_BASE_URL}/barber/${barberId}/available-days`);
        if (response.ok) {
            availableDaysForSelectedBarber = await response.json(); // Array de strings 'YYYY-MM-DD'
            console.log('[fetchAvailableDays] Dias disponíveis recebidos:', availableDaysForSelectedBarber);
            renderCalendar(currentCalendarDate); // Renderiza o calendário com os dias marcados
        } else {
            console.error('[fetchAvailableDays] Erro ao buscar dias disponíveis:', response.status, response.statusText);
            availableDaysForSelectedBarber = [];
            renderCalendar(currentCalendarDate);
            displayMessage('Erro ao carregar dias disponíveis para este barbeiro.', 'error');
        }
    } catch (error) {
        console.error('[fetchAvailableDays] Erro de rede ao buscar dias disponíveis:', error);
        availableDaysForSelectedBarber = [];
        renderCalendar(currentCalendarDate);
        displayMessage('Não foi possível conectar ao servidor para dias disponíveis.', 'error');
    }
}

/**
 * Busca os horários disponíveis para uma data e barbeiro específicos.
 * @param {string} barberId - O ID do barbeiro.
 * @param {string} date - A data no formato YYYY-MM-DD.
 */
async function fetchAvailableSlots(barberId, date) {
    console.log(`[fetchAvailableSlots] Buscando horários para barbeiro: ${barberId}, data: ${date}`);
    availableSlotsForSelectedDate = [];
    availableTimesList.innerHTML = ''; // Limpa a lista

    if (!barberId || !date) {
        availableTimesList.innerHTML = '<p class="text-gray-400">Selecione um barbeiro e uma data.</p>';
        return;
    }

    displayMessage('Carregando horários...', 'info');

    try {
        const response = await fetch(`${API_BASE_URL}/barber/${barberId}/available-slots?date=${date}`);
        if (response.ok) {
            const slots = await response.json();
            console.log('[fetchAvailableSlots] Horários disponíveis recebidos:', slots);

            availableSlotsForSelectedDate = slots; // Armazena os slots reais do backend
            renderAvailableSlots(availableSlotsForSelectedDate);
            displayMessage(''); // Limpa a mensagem de carregamento

        } else {
            console.error('[fetchAvailableSlots] Erro ao carregar horários disponíveis:', response.status, response.statusText);
            availableTimesList.innerHTML = `<p class="text-red-500">Erro ao carregar horários: ${response.statusText}</p>`;
            displayMessage('Erro ao carregar horários disponíveis.', 'error');
        }
    } catch (error) {
        console.error('[fetchAvailableSlots] Erro de rede ao buscar horários disponíveis:', error);
        availableTimesList.innerHTML = '<p class="text-red-500">Erro de conexão ao carregar horários.</p>';
        displayMessage('Não foi possível conectar ao servidor para horários disponíveis.', 'error');
    }
}

/**
 * Envia o agendamento para o backend.
 */
async function submitAppointment() {
    const barberId = barberSelect.value;
    const customerName = customerNameInput.value;
    const customerPhone = customerPhoneInput.value;
    const service = serviceSelect.value;
    const selectedDate = selectedDateInput.value;
    const selectedTime = selectedTimeInput.value;
    const paymentMethod = paymentMethodSelect.value;

    if (!barberId || !customerName || !service || !selectedDate || !selectedTime || !paymentMethod) {
        displayMessage('Por favor, preencha todos os campos obrigatórios.', 'error');
        return;
    }

    // Combina data e hora para criar um Timestamp
    const dateTime = `${selectedDate}T${selectedTime}:00`; // Ex: "2025-07-28T10:00:00"
    console.log('[submitAppointment] Tentando agendar com dateTime:', dateTime);

    try {
        displayMessage('Confirmando agendamento...', 'info');
        const response = await fetch(`${API_BASE_URL}/barber/book`, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
            },
            body: JSON.stringify({
                barberId,
                customerName,
                customerPhone,
                service,
                dateTime,
                paymentMethod
            }),
        });

        const data = await response.json();

        if (response.ok) {
            displayMessage(data.message || 'Agendamento realizado com sucesso!', 'success');
            // Limpa o formulário após o sucesso
            customerNameInput.value = '';
            customerPhoneInput.value = '';
            serviceSelect.value = '';
            selectedDateInput.value = '';
            selectedTimeInput.value = '';
            paymentMethodSelect.value = '';
            availableTimesList.innerHTML = '<p class="text-gray-400">Selecione uma data para ver os horários.</p>';
            // Recarrega os dias disponíveis para o barbeiro atual (se houver)
            fetchAvailableDays(barberSelect.value); // Isso também renderizará o calendário
        } else {
            displayMessage(data.message || 'Erro ao agendar. Tente novamente.', 'error');
            console.error('[submitAppointment] Erro ao agendar:', data.message);
        }
    } catch (error) {
        console.error('[submitAppointment] Erro de rede ao agendar:', error);
        displayMessage('Não foi possível conectar ao servidor para agendar.', 'error');
    }
}

// --- Funções de Renderização da Interface ---

/**
 * Renderiza os horários disponíveis na lista.
 * @param {Array<string>} slots - Array de strings de horários (ex: ['09:00', '10:00']).
 */
function renderAvailableSlots(slots) {
    console.log('[renderAvailableSlots] Renderizando slots:', slots);
    availableTimesList.innerHTML = ''; // Limpa a lista anterior
    if (slots.length === 0) {
        availableTimesList.innerHTML = '<p class="text-gray-400">Nenhum horário disponível para esta data.</p>';
        return;
    }

    slots.forEach(slot => {
        const button = document.createElement('button');
        button.className = 'bg-gray-700 hover:bg-yellow-500 hover:text-black text-white py-2 px-4 rounded-lg transition duration-200 text-sm mr-2 mb-2';
        button.textContent = slot;
        button.addEventListener('click', () => {
            // Remove a seleção anterior
            availableTimesList.querySelectorAll('.selected-time').forEach(btn => {
                btn.classList.remove('selected-time', 'bg-yellow-500', 'text-black');
                btn.classList.add('bg-gray-700', 'text-white');
            });
            // Adiciona a seleção atual
            button.classList.add('selected-time', 'bg-yellow-500', 'text-black');
            button.classList.remove('bg-gray-700', 'text-white');
            selectedTimeInput.value = slot; // Atualiza o campo de input oculto
        });
        availableTimesList.appendChild(button);
    });
}

/**
 * Renderiza o calendário para o mês e ano fornecidos, destacando dias disponíveis.
 * @param {Date} dateObj - Objeto Date para o mês e ano a serem renderizados.
 */
function renderCalendar(dateObj) {
    console.log('[renderCalendar] Renderizando calendário para:', dateObj.toDateString());
    if (!calendarGrid) {
        console.error('[renderCalendar] Elemento calendar-grid não encontrado!');
        return;
    }

    // Adicionado log para verificar o estilo computado do calendarGrid
    console.log('[renderCalendar] Computed display style for calendarGrid:', window.getComputedStyle(calendarGrid).display);

    // Limpa o grid, mas mantém os cabeçalhos dos dias da semana
    calendarGrid.innerHTML = `
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

    currentMonthYearDisplay.textContent = dateObj.toLocaleString('pt-BR', { month: 'long', year: 'numeric' });

    // Preencher dias vazios no início
    for (let i = 0; i < firstDay; i++) {
        const emptyDiv = document.createElement('div');
        emptyDiv.className = 'py-2';
        calendarGrid.appendChild(emptyDiv);
    }

    // Preencher dias do mês
    for (let day = 1; day <= daysInMonth; day++) {
        const dayDiv = document.createElement('div');
        dayDiv.className = 'py-2 px-1 rounded-lg cursor-pointer transition duration-200 text-center calendar-day';
        dayDiv.textContent = day;

        const fullDate = new Date(year, month, day);
        const today = new Date();
        today.setHours(0, 0, 0, 0); // Zera hora para comparação de data

        const formattedDate = formatDate(fullDate);
        dayDiv.dataset.date = formattedDate; // Armazena a data formatada no dataset

        console.log(`[renderCalendar] Dia: ${day}, Formatado: ${formattedDate}, Disponível? ${availableDaysForSelectedBarber.includes(formattedDate)}`);

        // Adiciona classes para dias passados, hoje, disponíveis e não disponíveis
        if (fullDate < today) {
            dayDiv.classList.add('bg-gray-800', 'text-gray-500', 'cursor-not-allowed'); // Dias passados
        } else {
            if (availableDaysForSelectedBarber.includes(formattedDate)) {
                dayDiv.classList.add('bg-green-600', 'text-white', 'font-bold', 'available-day'); // Dia disponível
                dayDiv.addEventListener('click', () => {
                    // Não permite clicar em dias passados ou não disponíveis
                    if (dayDiv.classList.contains('cursor-not-allowed')) {
                        return;
                    }

                    // Remove a seleção de todos os outros dias
                    calendarGrid.querySelectorAll('.calendar-day.selected').forEach(el => {
                        el.classList.remove('selected', 'bg-blue-600');
                        
                        // Restaura as classes originais com base na disponibilidade
                        const elDateStr = el.dataset.date; 
                        if (availableDaysForSelectedBarber.includes(elDateStr)) {
                            el.classList.add('bg-green-600', 'text-white');
                            el.classList.remove('bg-gray-800', 'text-gray-500', 'cursor-not-allowed');
                        } else {
                            el.classList.add('bg-gray-800', 'text-gray-500', 'cursor-not-allowed');
                            el.classList.remove('bg-green-600', 'text-white');
                        }
                    });

                    // Adiciona a seleção ao dia clicado
                    dayDiv.classList.add('selected', 'bg-blue-600');
                    dayDiv.classList.remove('bg-green-600', 'text-white');

                    selectedDateInput.value = formattedDate;
                    fetchAvailableSlots(barberSelect.value, formattedDate);
                });
            } else {
                dayDiv.classList.add('bg-gray-800', 'text-gray-500', 'cursor-not-allowed');
            }
        }

        if (fullDate.toDateString() === today.toDateString()) {
            // Se for hoje, adiciona uma classe extra para destaque visual
            dayDiv.classList.add('today-marker');
        }

        calendarGrid.appendChild(dayDiv);
    }
}

// --- Event Listeners e Inicialização ---

document.addEventListener('DOMContentLoaded', async () => {
    console.log('[DOMContentLoaded] Página carregada. Iniciando...');
    // Carrega a lista de barbeiros ao iniciar a página
    await fetchBarbers();

    // Event listener para mudança de barbeiro
    barberSelect.addEventListener('change', () => {
        const selectedBarberId = barberSelect.value;
        console.log('[barberSelect.change] Barbeiro selecionado:', selectedBarberId);
        fetchAvailableDays(selectedBarberId); // Busca dias disponíveis para o novo barbeiro
        availableTimesList.innerHTML = '<p class="text-gray-400">Selecione uma data para ver os horários.</p>';
        selectedDateInput.value = '';
        selectedTimeInput.value = '';
        displayMessage(''); // Limpa mensagens
    });

    // Lógica para carregar dias disponíveis se um barbeiro já estiver selecionado no carregamento
    // ou para selecionar o primeiro barbeiro real se a lista não estiver vazia.
    if (barberSelect.options.length > 1 && barberSelect.value === "") {
        // Seleciona automaticamente o primeiro barbeiro real se a opção padrão "Selecione um Barbeiro" estiver vazia
        barberSelect.value = barberSelect.options[1].value;
        console.log('[DOMContentLoaded] Barbeiro auto-selecionado:', barberSelect.value);
    }

    // Agora, se um barbeiro está selecionado (seja por padrão ou auto-seleção),
    // busca os dias disponíveis para ele.
    if (barberSelect.value) {
        await fetchAvailableDays(barberSelect.value);
    } else {
        // Se nenhum barbeiro foi selecionado (lista vazia ou apenas a opção padrão),
        // renderiza o calendário sem dias disponíveis marcados.
        renderCalendar(currentCalendarDate);
    }


    // Event listeners para navegação do calendário
    if (prevMonthButton) { // Verifica se o elemento existe antes de adicionar o listener
        prevMonthButton.addEventListener('click', () => {
            console.log('[prevMonthButton] Botão "Anterior" clicado.'); // Adicionado log
            currentCalendarDate.setMonth(currentCalendarDate.getMonth() - 1);
            renderCalendar(currentCalendarDate);
            // Recarrega dias disponíveis para o novo mês se um barbeiro estiver selecionado
            if (barberSelect.value) {
                fetchAvailableDays(barberSelect.value);
            }
            availableTimesList.innerHTML = '<p class="text-gray-400">Selecione uma data para ver os horários.</p>';
            selectedDateInput.value = '';
            selectedTimeInput.value = '';
            displayMessage('');
        });
    } else {
        console.error('[prevMonthButton] Botão "Anterior" não encontrado no DOM.');
    }

    if (nextMonthButton) { // Verifica se o elemento existe antes de adicionar o listener
        nextMonthButton.addEventListener('click', () => {
            console.log('[nextMonthButton] Botão "Próximo" clicado.'); // Adicionado log
            currentCalendarDate.setMonth(currentCalendarDate.getMonth() + 1);
            renderCalendar(currentCalendarDate);
            // Recarrega dias disponíveis para o novo mês se um barbeiro estiver selecionado
            if (barberSelect.value) {
                fetchAvailableDays(barberSelect.value);
            }
            availableTimesList.innerHTML = '<p class="text-gray-400">Selecione uma data para ver os horários.</p>';
            selectedDateInput.value = '';
            selectedTimeInput.value = '';
            displayMessage('');
        });
    } else {
        console.error('[nextMonthButton] Botão "Próximo" não encontrado no DOM.');
    }

    // Event listener para o botão de confirmar agendamento
    confirmAppointmentButton.addEventListener('click', submitAppointment);

});
