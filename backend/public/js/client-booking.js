// public/js/client-booking.js

const API_BASE_URL = 'http://localhost:3001/api';

let currentBookingDate = new Date();
let selectedBarberId = null; // Para armazenar o ID do barbeiro selecionado

// Função para formatar datas para o formato YYYY-MM-DD
function formatDate(date) {
    const year = date.getFullYear();
    const month = (date.getMonth() + 1).toString().padStart(2, '0');
    const day = date.getDate().toString().padStart(2, '0');
    return `${year}-${month}-${day}`;
}

// Função para buscar e exibir barbeiros
async function fetchAndDisplayBarbers() {
    const barberSelect = document.getElementById('barber-select');
    try {
        const response = await fetch(`${API_BASE_URL}/barber/list`);
        if (response.ok) {
            const barbers = await response.json();
            barberSelect.innerHTML = '<option value="">Selecione um Barbeiro</option>';
            barbers.forEach(barber => {
                const option = document.createElement('option');
                option.value = barber.id;
                option.textContent = barber.name;
                barberSelect.appendChild(option);
            });
        } else {
            console.error('Erro ao carregar barbeiros:', response.statusText);
            alert('Erro ao carregar barbeiros.');
        }
    } catch (error) {
        console.error('Erro de rede ao buscar barbeiros:', error);
        alert('Não foi possível conectar ao servidor para carregar barbeiros.');
    }
}

// Função para buscar e exibir horários disponíveis
async function fetchAndDisplayAvailableSlots(barberId, date) {
    const availableSlotsContainer = document.getElementById('available-slots');
    availableSlotsContainer.innerHTML = '<p class="text-gray-400">Carregando horários...</p>';

    if (!barberId) {
        availableSlotsContainer.innerHTML = '<p class="text-gray-400">Selecione um barbeiro para ver os horários.</p>';
        return;
    }

    try {
        const response = await fetch(`${API_BASE_URL}/barber/${barberId}/available-slots?date=${date}`);
        if (response.ok) {
            const slots = await response.json();
            console.log('Horários disponíveis recebidos:', slots); // Para depuração
            availableSlotsContainer.innerHTML = ''; // Limpa antes de adicionar

            if (slots.length === 0) {
                availableSlotsContainer.innerHTML = '<p class="text-gray-400">Nenhum horário disponível para esta data.</p>';
            } else {
                slots.forEach(slot => {
                    const button = document.createElement('button');
                    button.className = 'bg-gray-700 hover:bg-blue-600 text-white font-semibold py-2 px-4 rounded-lg transition duration-200 slot-btn';
                    button.textContent = slot;
                    button.dataset.time = slot; // Armazena a hora no dataset

                    button.addEventListener('click', () => {
                        // Remove a seleção de outros botões
                        document.querySelectorAll('.slot-btn').forEach(btn => {
                            btn.classList.remove('bg-blue-600');
                            btn.classList.add('bg-gray-700');
                        });
                        // Adiciona a seleção ao botão clicado
                        button.classList.remove('bg-gray-700');
                        button.classList.add('bg-blue-600');
                        document.getElementById('selected-time').value = slot; // Atualiza o campo de hora selecionada
                    });
                    availableSlotsContainer.appendChild(button);
                });
            }
        } else {
            console.error('Erro ao carregar horários disponíveis:', response.statusText);
            availableSlotsContainer.innerHTML = `<p class="text-red-500">Erro ao carregar horários: ${response.statusText}</p>`;
        }
    } catch (error) {
        console.error('Erro de rede ao buscar horários disponíveis:', error);
        availableSlotsContainer.innerHTML = '<p class="text-red-500">Erro de conexão ao carregar horários.</p>';
    }
}

// Função para renderizar o calendário de agendamento do cliente
function renderClientCalendar(dateObj) {
    const calendarEl = document.getElementById('client-calendar');
    // Limpa o conteúdo existente, mas mantém a estrutura do grid
    calendarEl.innerHTML = ''; 

    // Adiciona os cabeçalhos dos dias da semana
    const dayNames = ['Dom', 'Seg', 'Ter', 'Qua', 'Qui', 'Sex', 'Sáb'];
    dayNames.forEach(name => {
        const div = document.createElement('div');
        div.className = 'font-bold text-gray-400';
        div.textContent = name;
        calendarEl.appendChild(div);
    });

    const year = dateObj.getFullYear();
    const month = dateObj.getMonth();
    const firstDay = new Date(year, month, 1).getDay();
    const daysInMonth = new Date(year, month + 1, 0).getDate();

    document.getElementById('current-month-client').textContent = dateObj.toLocaleString('pt-BR', { month: 'long', year: 'numeric' });

    for (let i = 0; i < firstDay; i++) {
        calendarEl.appendChild(document.createElement('div'));
    }

    for (let day = 1; day <= daysInMonth; day++) {
        const dayDiv = document.createElement('div');
        dayDiv.className = 'py-2 px-1 rounded-lg cursor-pointer transition duration-200 text-center calendar-day';
        dayDiv.textContent = day;

        const fullDate = new Date(year, month, day);
        const today = new Date();
        today.setHours(0, 0, 0, 0);

        const formattedDate = formatDate(fullDate);
        dayDiv.dataset.date = formattedDate;

        if (fullDate < today) {
            dayDiv.classList.add('bg-gray-800', 'text-gray-500', 'cursor-not-allowed');
        } else {
            dayDiv.classList.add('hover:bg-yellow-500', 'hover:text-black');
        }

        dayDiv.addEventListener('click', () => {
            if (dayDiv.classList.contains('cursor-not-allowed')) {
                return; // Não permite clicar em dias passados
            }

            calendarEl.querySelectorAll('.calendar-day').forEach(d => d.classList.remove('selected', 'bg-blue-600', 'text-white'));
            dayDiv.classList.add('selected', 'bg-blue-600', 'text-white', 'font-bold');

            document.getElementById('selected-date').value = formattedDate; // Atualiza o campo de data selecionada
            
            // Se um barbeiro já foi selecionado, busca os horários disponíveis para a nova data
            if (selectedBarberId) {
                fetchAndDisplayAvailableSlots(selectedBarberId, formattedDate);
            } else {
                document.getElementById('available-slots').innerHTML = '<p class="text-gray-400">Selecione um barbeiro e uma data para ver os horários.</p>';
            }
        });

        calendarEl.appendChild(dayDiv);
    }
}

// Função para lidar com o envio do formulário de agendamento
async function handleBookingSubmit(event) {
    event.preventDefault();

    const barberId = document.getElementById('barber-select').value;
    const selectedDate = document.getElementById('selected-date').value;
    const selectedTime = document.getElementById('selected-time').value;
    const customerName = document.getElementById('customer-name').value;
    const customerPhone = document.getElementById('customer-phone').value;
    const service = document.getElementById('service-select').value;
    const paymentMethod = document.getElementById('payment-method-select').value;

    if (!barberId || !selectedDate || !selectedTime || !customerName || !service || !paymentMethod) {
        alert('Por favor, preencha todos os campos do agendamento.');
        return;
    }

    // Combina data e hora para criar o dateTime completo
    const dateTimeString = `${selectedDate}T${selectedTime}:00`;
    const dateTime = new Date(dateTimeString);

    if (isNaN(dateTime.getTime())) {
        alert('Data ou hora selecionada inválida.');
        return;
    }

    try {
        const response = await fetch(`${API_BASE_URL}/barber/book`, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json'
            },
            body: JSON.stringify({
                barberId,
                customerName,
                customerPhone,
                service,
                dateTime: dateTime.toISOString(), // Envia como ISO string
                paymentMethod
            })
        });

        const data = await response.json();

        if (response.ok) {
            alert(data.message || 'Agendamento realizado com sucesso!');
            // Limpa o formulário após o agendamento
            document.getElementById('booking-form').reset();
            document.getElementById('selected-date').value = '';
            document.getElementById('selected-time').value = '';
            document.getElementById('available-slots').innerHTML = '<p class="text-gray-400">Selecione um barbeiro e uma data para ver os horários.</p>';
            
            // Opcional: Recarregar horários disponíveis para a data atual do barbeiro selecionado
            if (selectedBarberId && selectedDate) {
                fetchAndDisplayAvailableSlots(selectedBarberId, selectedDate);
            }

        } else {
            console.error('Erro ao agendar:', data.message || response.statusText);
            alert(`Erro ao agendar: ${data.message || 'Erro desconhecido'}`);
        }
    } catch (error) {
        console.error('Erro de rede ao agendar:', error);
        alert('Não foi possível conectar ao servidor para agendar.');
    }
}


// Event Listeners e inicialização
document.addEventListener('DOMContentLoaded', async () => {
    // Carregar barbeiros
    await fetchAndDisplayBarbers();

    // Inicializar o calendário
    renderClientCalendar(currentBookingDate);

    // Event listeners para navegação do calendário
    document.getElementById('prev-month-client').addEventListener('click', () => {
        currentBookingDate.setMonth(currentBookingDate.getMonth() - 1);
        renderClientCalendar(currentBookingDate);
        // Recarregar slots se barbeiro e data estiverem selecionados
        const currentSelectedDate = document.getElementById('selected-date').value;
        if (selectedBarberId && currentSelectedDate) {
            fetchAndDisplayAvailableSlots(selectedBarberId, currentSelectedDate);
        }
    });

    document.getElementById('next-month-client').addEventListener('click', () => {
        currentBookingDate.setMonth(currentBookingDate.getMonth() + 1);
        renderClientCalendar(currentBookingDate);
        // Recarregar slots se barbeiro e data estiverem selecionados
        const currentSelectedDate = document.getElementById('selected-date').value;
        if (selectedBarberId && currentSelectedDate) {
            fetchAndDisplayAvailableSlots(selectedBarberId, currentSelectedDate);
        }
    });

    // Event listener para seleção de barbeiro
    document.getElementById('barber-select').addEventListener('change', (event) => {
        selectedBarberId = event.target.value;
        const currentSelectedDate = document.getElementById('selected-date').value;
        if (selectedBarberId && currentSelectedDate) {
            fetchAndDisplayAvailableSlots(selectedBarberId, currentSelectedDate);
        } else {
            document.getElementById('available-slots').innerHTML = '<p class="text-gray-400">Selecione um barbeiro e uma data para ver os horários.</p>';
        }
    });

    // Event listener para o formulário de agendamento
    document.getElementById('booking-form').addEventListener('submit', handleBookingSubmit);

    // Carregar serviços (mockados por enquanto)
    const serviceSelect = document.getElementById('service-select');
    const services = [
        { value: 'Corte de Cabelo', text: 'Corte de Cabelo (R$ 30)' },
        { value: 'Barba', text: 'Barba (R$ 25)' },
        { value: 'Coloração', text: 'Coloração (R$ 80)' }
    ];
    services.forEach(service => {
        const option = document.createElement('option');
        option.value = service.value;
        option.textContent = service.text;
        serviceSelect.appendChild(option);
    });

    // Carregar métodos de pagamento (mockados por enquanto)
    const paymentMethodSelect = document.getElementById('payment-method-select');
    const paymentMethods = [
        { value: 'Dinheiro', text: 'Dinheiro' },
        { value: 'Cartão de Crédito', text: 'Cartão de Crédito' },
        { value: 'Pix', text: 'Pix' }
    ];
    paymentMethods.forEach(method => {
        const option = document.createElement('option');
        option.value = method.value;
        option.textContent = method.text;
        paymentMethodSelect.appendChild(option);
    });
});
