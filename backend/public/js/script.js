// public/js/script.js

// Using an IIFE (Immediately Invoked Function Expression) to encapsulate the code
// and prevent global scope pollution.
(function() {
    'use strict';

    // URL base do seu backend
    const API_BASE_URL = 'https://barbearia-backend-9h56.onrender.com'; // <-- Esta deve ser a URL correta!

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

    /**
     * Formata uma data para o formato 'YYYY-MM-DD'.
     * @param {Date} date - O objeto de data a ser formatado.
     * @returns {string} A data formatada.
     */
    function formatDate(date) {
        const year = date.getFullYear();
        const month = (date.getMonth() + 1).toString().padStart(2, '0');
        const day = date.getDate().toString().padStart(2, '0');
        return `${year}-${month}-${day}`;
    }

    /**
     * Exibe mensagens na interface do usuário com diferentes estilos.
     * @param {string} message - A mensagem a ser exibida.
     * @param {string} type - O tipo de mensagem ('info', 'success', 'error').
     */
    function displayMessage(message, type = 'info') {
        if (!appointmentMessage) return; // Garante que o elemento existe
        appointmentMessage.textContent = message;
        appointmentMessage.className = 'mt-4 text-center font-semibold';
        switch (type) {
            case 'success':
                appointmentMessage.classList.add('text-green-500');
                break;
            case 'error':
                appointmentMessage.classList.add('text-red-500');
                break;
            case 'info':
            default:
                appointmentMessage.classList.add('text-gray-400');
                break;
        }
    }

    // --- Funções de Busca de Dados (Backend) ---

    /**
     * Busca a lista de barbeiros disponíveis no backend e popula o dropdown.
     */
    async function fetchBarbers() {
        console.log('[fetchBarbers] Buscando barbeiros...');
        try {
            const response = await fetch(`${API_BASE_URL}/api/barber/list`); // URL com /api/
            if (!response.ok) {
                throw new Error(`HTTP error! status: ${response.status}`);
            }
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
            } else {
                barberSelect.innerHTML += '<option value="" disabled>Nenhum barbeiro disponível.</option>';
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
            renderCalendar(currentCalendarDate);
            console.log('[fetchAvailableDays] Nenhum barbeiro selecionado, dias disponíveis resetados.');
            return;
        }
        try {
            const response = await fetch(`${API_BASE_URL}/api/barber/${barberId}/available-days`); // URL com /api/
            if (response.ok) {
                availableDaysForSelectedBarber = await response.json(); // Espera um array de strings de data (YYYY-MM-DD)
                console.log('[fetchAvailableDays] Dias disponíveis recebidos:', availableDaysForSelectedBarber);
            } else {
                console.error('[fetchAvailableDays] Erro ao buscar dias disponíveis:', response.status, response.statusText);
                availableDaysForSelectedBarber = [];
                displayMessage('Erro ao carregar dias disponíveis para este barbeiro.', 'error');
            }
            renderCalendar(currentCalendarDate); // Re-renderiza o calendário após obter os dias
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
        availableTimesList.innerHTML = '';
        selectedTimeInput.value = ''; // Limpa o horário selecionado

        if (!barberId || !date) {
            availableTimesList.innerHTML = '<p class="text-gray-400">Selecione um barbeiro e uma data.</p>';
            return;
        }

        displayMessage('Carregando horários...', 'info');

        try {
            const response = await fetch(`${API_BASE_URL}/api/barber/${barberId}/available-slots?date=${date}`); // URL com /api/
            if (response.ok) {
                const slots = await response.json();
                console.log('[fetchAvailableSlots] Horários disponíveis recebidos:', slots);
                availableSlotsForSelectedDate = slots;
                renderAvailableSlots(availableSlotsForSelectedDate);
                displayMessage('');
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

        const dateTime = `${selectedDate}T${selectedTime}:00`;
        console.log('[submitAppointment] Tentando agendar com dateTime:', dateTime);

        try {
            displayMessage('Confirmando agendamento...', 'info');
            const response = await fetch(`${API_BASE_URL}/api/barber/book`, { // URL com /api/
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
                // Limpa o formulário e a seleção
                customerNameInput.value = '';
                customerPhoneInput.value = '';
                serviceSelect.value = '';
                selectedDateInput.value = '';
                selectedTimeInput.value = '';
                paymentMethodSelect.value = '';
                availableTimesList.innerHTML = '<p class="text-gray-400">Selecione uma data para ver os horários.</p>';
                // Recarrega os dias disponíveis para o barbeiro atual
                await fetchAvailableDays(barberSelect.value);
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
     * Renderiza os horários disponíveis na lista de botões.
     * @param {Array<string>} slots - Array de strings de horários (ex: ['09:00', '10:00']).
     */
    function renderAvailableSlots(slots) {
        console.log('[renderAvailableSlots] Renderizando slots:', slots);
        availableTimesList.innerHTML = '';
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
                selectedTimeInput.value = slot;
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

        // Limpa o grid, mantendo os cabeçalhos dos dias da semana
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
        const month = dateObj.getMonth();
        const firstDay = new Date(year, month, 1).getDay();
        const daysInMonth = new Date(year, month + 1, 0).getDate();

        currentMonthYearDisplay.textContent = dateObj.toLocaleString('pt-BR', { month: 'long', year: 'numeric' });

        // Preencher dias vazios no início do mês
        for (let i = 0; i < firstDay; i++) {
            const emptyDiv = document.createElement('div');
            emptyDiv.className = 'py-2';
            calendarGrid.appendChild(emptyDiv);
        }

        // Preencher dias do mês
        for (let day = 1; day <= daysInMonth; day++) {
            const dayDiv = document.createElement('div');
            dayDiv.className = 'py-2 px-1 rounded-lg text-center calendar-day';
            dayDiv.textContent = day;

            const fullDate = new Date(year, month, day);
            const today = new Date();
            today.setHours(0, 0, 0, 0);

            const formattedDate = formatDate(fullDate);
            dayDiv.dataset.date = formattedDate;

            // Adiciona classes de estilo com base na disponibilidade e na data atual
            // AQUI: Verifica se a data formatada está no array de dias disponíveis
            const isAvailable = availableDaysForSelectedBarber.includes(formattedDate);
            const isPastDay = fullDate < today;

            if (isPastDay) {
                dayDiv.classList.add('bg-gray-800', 'text-gray-500', 'cursor-not-allowed');
            } else if (isAvailable) {
                dayDiv.classList.add('bg-green-600', 'text-white', 'font-bold', 'cursor-pointer');
                dayDiv.addEventListener('click', () => handleDayClick(dayDiv, formattedDate));
            } else {
                dayDiv.classList.add('bg-gray-800', 'text-gray-500', 'cursor-not-allowed');
            }
            
            if (fullDate.toDateString() === today.toDateString()) {
                dayDiv.classList.add('today-marker');
            }

            calendarGrid.appendChild(dayDiv);
        }
    }

    /**
     * Lida com o clique em um dia do calendário.
     * @param {HTMLElement} dayDiv - O elemento do dia clicado.
     * @param {string} formattedDate - A data formatada do dia clicado.
     */
    async function handleDayClick(dayDiv, formattedDate) {
        // Remove a seleção de todos os outros dias
        calendarGrid.querySelectorAll('.calendar-day.selected-day').forEach(el => {
            el.classList.remove('selected-day', 'bg-blue-600');
            const elDateStr = el.dataset.date;
            // Garante que o dia retorna à cor original de disponibilidade ou não
            if (availableDaysForSelectedBarber.includes(elDateStr)) {
                el.classList.add('bg-green-600');
                el.classList.remove('bg-gray-800'); // Remove gray if it was available
            } else {
                el.classList.add('bg-gray-800');
                el.classList.remove('bg-green-600'); // Remove green if it was not available
            }
        });

        // Adiciona a seleção ao dia clicado
        dayDiv.classList.add('selected-day', 'bg-blue-600');
        dayDiv.classList.remove('bg-green-600', 'bg-gray-800'); // Remove cores anteriores

        selectedDateInput.value = formattedDate;
        await fetchAvailableSlots(barberSelect.value, formattedDate);
    }

    /**
     * Lida com a navegação do calendário (próximo/mês anterior).
     * @param {number} monthChange - 1 para próximo mês, -1 para mês anterior.
     */
    async function handleMonthNavigation(monthChange) {
        console.log(`[handleMonthNavigation] Navegando para o mês: ${monthChange > 0 ? 'seguinte' : 'anterior'}`);
        currentCalendarDate.setMonth(currentCalendarDate.getMonth() + monthChange);
        
        // Resetar a seleção de data e hora
        selectedDateInput.value = '';
        selectedTimeInput.value = '';
        availableTimesList.innerHTML = '<p class="text-gray-400">Selecione uma data para ver os horários.</p>';
        displayMessage('');

        if (barberSelect.value) {
            await fetchAvailableDays(barberSelect.value); // Rebusca os dias disponíveis para o novo mês
        } else {
            renderCalendar(currentCalendarDate);
        }
    }

    // --- Event Listeners e Inicialização ---

    document.addEventListener('DOMContentLoaded', async () => {
        console.log('[DOMContentLoaded] Página carregada. Iniciando...');
        
        // Carrega a lista de barbeiros ao iniciar
        await fetchBarbers();

        // Se a lista de barbeiros foi carregada e há barbeiros disponíveis,
        // carrega os dias disponíveis para o primeiro barbeiro.
        if (barberSelect.options.length > 1 && !barberSelect.value) {
            barberSelect.value = barberSelect.options[1].value; // Seleciona o primeiro barbeiro
        }

        if (barberSelect.value) {
            await fetchAvailableDays(barberSelect.value); // Carrega os dias disponíveis para o barbeiro selecionado
        } else {
            renderCalendar(currentCalendarDate); // Renderiza o calendário sem dias disponíveis se nenhum barbeiro estiver selecionado
        }

        // Event listener para mudança de barbeiro
        barberSelect.addEventListener('change', async () => {
            const selectedBarberId = barberSelect.value;
            console.log('[barberSelect.change] Barbeiro selecionado:', selectedBarberId);
            
            // Limpa a seleção de data e horários
            selectedDateInput.value = '';
            selectedTimeInput.value = '';
            availableTimesList.innerHTML = '<p class="text-gray-400">Selecione uma data para ver os horários.</p>';
            displayMessage('');

            await fetchAvailableDays(selectedBarberId); // Rebusca os dias disponíveis para o novo barbeiro
        });

        // Event listeners para navegação do calendário
        if (prevMonthButton) prevMonthButton.addEventListener('click', () => handleMonthNavigation(-1));
        if (nextMonthButton) nextMonthButton.addEventListener('click', () => handleMonthNavigation(1));
        
        // Event listener para o botão de confirmar agendamento
        if (confirmAppointmentButton) confirmAppointmentButton.addEventListener('click', submitAppointment);
    });

})();
