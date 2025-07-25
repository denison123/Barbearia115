// public/script.js - Este é o script para a tela de agendamento do cliente
document.addEventListener('DOMContentLoaded', () => {
    // **CORREÇÃO AQUI: Garanta que a URL base NÃO inclua "/public/"**
    const API_BASE_URL = 'http://localhost:3001/api'; 

    // Elementos do DOM (certifique-se de que os IDs correspondem ao seu HTML)
    const currentMonthEl = document.getElementById('currentMonth'); // Ajuste conforme seu HTML
    const calendarDaysEl = document.getElementById('calendarDays'); // Ajuste conforme seu HTML
    const barberSelect = document.getElementById('barberSelect');
    const dateInput = document.getElementById('dateSelected');
    const timeInput = document.getElementById('timeSelected');
    const nameInput = document.getElementById('customerName');
    const phoneInput = document.getElementById('customerPhone');
    const paymentMethodSelect = document.getElementById('paymentMethod');
    const confirmAppointmentBtn = document.getElementById('confirmAppointmentBtn');

    let currentMonth = new Date().getMonth();
    let currentYear = new Date().getFullYear();
    let selectedDate = null;
    let selectedBarberId = null; // Para armazenar o ID do barbeiro selecionado

    // --- Funções de Renderização do Calendário e Agendamento ---

    function renderCalendar() {
        const currentMonthName = new Date(currentYear, currentMonth).toLocaleString('pt-BR', { month: 'long', year: 'numeric' });
        // Verifique se o elemento currentMonthEl existe antes de tentar acessar textContent
        const monthYearHeader = document.querySelector('#agendamentoCalendar .text-xl.font-semibold');
        if (monthYearHeader) {
            monthYearHeader.textContent = currentMonthName;
        }

        const calendarDaysContainer = document.querySelector('#agendamentoCalendar .calendar-grid'); // Onde os dias serão renderizados
        if (!calendarDaysContainer) {
            console.error("Elemento 'calendarDaysContainer' para o calendário de agendamento não encontrado no HTML!");
            return;
        }
        calendarDaysContainer.innerHTML = `
            <div class="font-bold text-gray-400">Dom</div>
            <div class="font-bold text-gray-400">Seg</div>
            <div class="font-bold text-gray-400">Ter</div>
            <div class="font-bold text-gray-400">Qua</div>
            <div class="font-bold text-gray-400">Qui</div>
            <div class="font-bold text-gray-400">Sex</div>
            <div class="font-bold text-gray-400">Sáb</div>
        `; // Limpa os dias anteriores e adiciona os cabeçalhos

        const firstDay = new Date(currentYear, currentMonth, 1).getDay(); // 0 = Domingo, 1 = Segunda...
        const daysInMonth = new Date(currentYear, currentMonth + 1, 0).getDate();

        // Preenche com dias vazios para alinhar o primeiro dia da semana
        for (let i = 0; i < firstDay; i++) {
            const emptyDay = document.createElement('div');
            emptyDay.classList.add('p-2', 'text-gray-500');
            calendarDaysContainer.appendChild(emptyDay);
        }

        for (let day = 1; day <= daysInMonth; day++) {
            const dayEl = document.createElement('div');
            dayEl.classList.add('p-2', 'rounded-md', 'cursor-pointer', 'hover:bg-blue-600', 'transition-colors', 'text-white');
            dayEl.textContent = day;

            const fullDate = `${currentYear}-${String(currentMonth + 1).padStart(2, '0')}-${String(day).padStart(2, '0')}`;
            dayEl.dataset.date = fullDate;

            // Adiciona classe para o dia atual (se for o caso)
            if (fullDate === new Date().toISOString().slice(0, 10)) {
                dayEl.classList.add('bg-blue-700');
            } else {
                dayEl.classList.add('bg-gray-700');
            }

            // Adiciona listener para seleção de data
            dayEl.addEventListener('click', () => {
                // Remove seleção anterior
                const previouslySelected = calendarDaysContainer.querySelector('.calendar-day-selected');
                if (previouslySelected) {
                    previouslySelected.classList.remove('bg-blue-500', 'calendar-day-selected');
                    // Retorna à cor padrão, a menos que seja o dia atual
                    if (previouslySelected.dataset.date === new Date().toISOString().slice(0, 10)) {
                        previouslySelected.classList.add('bg-blue-700');
                    } else {
                        previouslySelected.classList.add('bg-gray-700');
                    }
                }

                dayEl.classList.remove('bg-gray-700', 'bg-blue-700');
                dayEl.classList.add('bg-blue-500', 'calendar-day-selected');
                selectedDate = fullDate;
                dateInput.value = selectedDate;
                // Ao selecionar uma data, busca os horários disponíveis (se um barbeiro estiver selecionado)
                if (selectedBarberId) {
                    fetchAvailableTimes(selectedBarberId, selectedDate);
                } else {
                    timeInput.innerHTML = '<option value="">Selecione um barbeiro e uma data.</option>';
                    timeInput.disabled = true;
                }
            });

            calendarDaysContainer.appendChild(dayEl);
        }
    }

    // --- Funções de Fetch para o Backend (Cliente) ---

    async function fetchBarbers() {
        console.log('[Client Calendar] Fetching barbers from:', `${API_BASE_URL}/barbers`);
        try {
            const response = await fetch(`${API_BASE_URL}/barbers`);
            if (!response.ok) {
                const errorData = await response.json();
                throw new Error(`Falha ao carregar barbeiros: ${errorData.message || response.statusText}`);
            }
            const barbers = await response.json();
            barberSelect.innerHTML = '<option value="">Selecione o Barbeiro</option>';
            barbers.forEach(barber => {
                const option = document.createElement('option');
                option.value = barber.id;
                option.textContent = barber.name;
                barberSelect.appendChild(option);
            });
            // Tenta selecionar o primeiro barbeiro por padrão, se houver
            if (barbers.length > 0) {
                selectedBarberId = barbers[0].id; // Ou deixe vazio para o usuário escolher
                barberSelect.value = selectedBarberId;
            } else {
                barberSelect.innerHTML = '<option value="">Nenhum barbeiro disponível</option>';
            }

        } catch (error) {
            console.error('Erro ao carregar barbeiros:', error);
            barberSelect.innerHTML = '<option>Erro ao carregar barbeiros</option>';
        }
    }

    async function fetchBarberAvailableDaysForClient(barberId, month, year) {
        console.log('[Client Calendar] Fetching available days for barber:', barberId, 'month:', month, 'year:', year);
        try {
            // **CORREÇÃO AQUI: Garanta que não há /public/ no URL**
            // Esta é a linha corrigida
            const response = await fetch(`${API_BASE_URL}/barbers/${barberId}/available-days?month=${month}&year=${year}`); 
            if (!response.ok) {
                if (response.status === 401) {
                    throw new Error('Unauthorized');
                }
                const errorData = await response.json();
                throw new Error(`Falha ao buscar dias disponíveis para o cliente: ${errorData.message || response.statusText}`);
            }
            const data = await response.json();
            return data.availableDays || []; // Retorna um array de datas disponíveis
        } catch (error) {
            console.error('[Client Calendar] Erro ao buscar dias disponíveis para o barbeiro:', error);
            return []; // Retorna um array vazio em caso de erro
        }
    }

    async function fetchAvailableTimes(barberId, date) {
        // Mock de horários disponíveis
        // Em um cenário real, você faria uma requisição ao backend
        // para obter os horários disponíveis para o barbeiro e data específicos.
        const mockTimes = ['09:00', '10:00', '11:00', '13:00', '14:00', '15:00'];
        
        timeInput.innerHTML = '<option value="">Carregando horários...</option>';
        timeInput.disabled = true;

        if (barberId && date) {
            try {
                // Aqui você faria a chamada real para o backend para buscar horários
                // const response = await fetch(`${API_BASE_URL}/appointments/available-times?barberId=${barberId}&date=${date}`);
                // const data = await response.json();
                // const availableTimes = data.times;

                // Usando os horários mockados por enquanto
                const availableTimes = mockTimes;

                if (availableTimes.length > 0) {
                    timeInput.innerHTML = '<option value="">Selecione a Hora</option>';
                    availableTimes.forEach(time => {
                        const option = document.createElement('option');
                        const timeFormatted = time.substring(0, 5); // Para garantir HH:MM
                        option.value = timeFormatted;
                        option.textContent = timeFormatted;
                        timeInput.appendChild(option);
                    });
                    timeInput.disabled = false;
                } else {
                    timeInput.innerHTML = '<option value="">Nenhum horário disponível</option>';
                }
            } catch (error) {
                console.error('Erro ao buscar horários disponíveis:', error);
                timeInput.innerHTML = '<option value="">Erro ao carregar horários</option>';
            }
        } else {
            timeInput.innerHTML = '<option value="">Selecione um barbeiro e uma data.</option>';
        }
    }

    // --- Event Listeners ---
    document.getElementById('prevMonth').addEventListener('click', () => { // ID ajustado
        currentMonth--;
        if (currentMonth < 0) {
            currentMonth = 11;
            currentYear--;
        }
        renderCalendar();
    });

    document.getElementById('nextMonth').addEventListener('click', () => { // ID ajustado
        currentMonth++;
        if (currentMonth > 11) {
            currentMonth = 0;
            currentYear++;
        }
        renderCalendar();
    });

    barberSelect.addEventListener('change', (e) => {
        selectedBarberId = e.target.value;
        // Se um barbeiro e uma data já foram selecionados, busca horários novamente
        if (selectedBarberId && selectedDate) {
            fetchAvailableTimes(selectedBarberId, selectedDate);
        } else {
            timeInput.innerHTML = '<option value="">Selecione uma data para ver os horários.</option>';
            timeInput.disabled = true;
        }
        // Quando o barbeiro é alterado, o calendário precisa ser atualizado para mostrar os dias disponíveis DELE
        renderCalendarWithAvailableDays();
    });

    confirmAppointmentBtn.addEventListener('click', async () => {
        const selectedBarberName = barberSelect.options[barberSelect.selectedIndex].textContent;
        const customerName = nameInput.value.trim();
        const customerPhone = phoneInput.value.trim();
        const paymentMethod = paymentMethodSelect.value;
        const selectedTime = timeInput.value;

        if (!selectedDate || !selectedTime || !customerName || !customerPhone || !selectedBarberId || !paymentMethod) {
            alert('Por favor, preencha todos os campos e selecione uma data e um horário.');
            return;
        }

        const appointmentData = {
            barberId: selectedBarberId,
            date: selectedDate,
            time: selectedTime,
            customerName: customerName,
            customerPhone: customerPhone,
            paymentMethod: paymentMethod,
            barberName: selectedBarberName 
        };

        console.log('[Booking Form] Submitted:', appointmentData);

        try {
            // Em um cenário real, você enviaria estes dados para o backend
            // const response = await fetch(`${API_BASE_URL}/appointments`, {
            //     method: 'POST',
            //     headers: { 'Content-Type': 'application/json' },
            //     body: JSON.stringify(appointmentData)
            // });
            // if (!response.ok) {
            //     const errorData = await response.json();
            //     throw new Error(errorData.message || 'Falha ao confirmar agendamento.');
            // }

            // Mock de sucesso
            alert('Agendamento confirmado com sucesso!');
            // Limpa o formulário após o agendamento
            nameInput.value = '';
            phoneInput.value = '';
            paymentMethodSelect.value = '';
            dateInput.value = '';
            timeInput.innerHTML = '<option value="">Selecione uma data para ver os horários.</option>';
            timeInput.disabled = true;
            selectedDate = null;
            // Opcional: recarregar o calendário ou os horários disponíveis
            renderCalendarWithAvailableDays(); // Recarrega o calendário para refletir as datas disponíveis

        } catch (error) {
            console.error('Erro ao confirmar agendamento:', error);
            alert('Erro ao confirmar agendamento: ' + error.message);
        }
    });

    // --- Nova função para renderizar o calendário com dias disponíveis ---
    async function renderCalendarWithAvailableDays() {
        renderCalendar(); // Renderiza a estrutura básica do calendário
        if (selectedBarberId) {
            const availableDays = await fetchBarberAvailableDaysForClient(selectedBarberId, currentMonth + 1, currentYear);
            const calendarDaysContainer = document.querySelector('#agendamentoCalendar .calendar-grid');
            if (calendarDaysContainer) {
                // Percorre todos os dias do calendário e adiciona uma classe se estiver disponível
                Array.from(calendarDaysContainer.children).forEach(dayEl => {
                    const date = dayEl.dataset.date;
                    if (date && availableDays.includes(date)) {
                        dayEl.classList.add('bg-green-600', 'hover:bg-green-700'); // Cor para dia disponível
                        dayEl.classList.remove('bg-gray-700', 'bg-blue-700'); // Remove cores padrão ou de hoje
                    } else if (date && !availableDays.includes(date) && dayEl.dataset.date !== new Date().toISOString().slice(0, 10)) {
                        dayEl.classList.add('bg-gray-800', 'cursor-not-allowed', 'opacity-50'); // Cor para dia não disponível
                        dayEl.classList.remove('bg-gray-700', 'bg-blue-700', 'hover:bg-blue-600', 'hover:bg-green-700', 'bg-blue-500');
                        dayEl.replaceWith(dayEl.cloneNode(true)); // Remove event listeners para dias indisponíveis
                    }
                });
            }
        }
    }

    // --- Inicialização ---
    fetchBarbers().then(() => {
        // Depois de carregar os barbeiros e (opcionalmente) selecionar um,
        // renderize o calendário com os dias disponíveis do barbeiro selecionado
        renderCalendarWithAvailableDays();
    });
});