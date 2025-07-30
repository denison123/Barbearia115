// public/js/slider.js

document.addEventListener('DOMContentLoaded', () => {
    const sliderContainer = document.getElementById('service-slider');
    if (!sliderContainer) {
        console.warn('Slider container not found. Skipping slider initialization.');
        return;
    }

    const images = Array.from(sliderContainer.querySelectorAll('.slider-image'));
    const prevButton = sliderContainer.querySelector('.prev-slide');
    const nextButton = sliderContainer.querySelector('.next-slide');
    const dotsContainer = sliderContainer.querySelector('.slider-dots');

    let currentIndex = 0;
    let slideInterval;

    // Cria os indicadores (dots)
    images.forEach((_, index) => {
        const dot = document.createElement('span');
        dot.classList.add('dot');
        if (index === 0) {
            dot.classList.add('active');
        }
        dot.addEventListener('click', () => {
            goToSlide(index);
            resetAutoPlay();
        });
        dotsContainer.appendChild(dot);
    });

    const dots = Array.from(dotsContainer.querySelectorAll('.dot'));

    // Função para mostrar um slide específico
    function showSlide(index) {
        images.forEach((img, i) => {
            img.classList.remove('active');
            if (i === index) {
                img.classList.add('active');
            }
        });
        dots.forEach((dot, i) => {
            dot.classList.remove('active');
            if (i === index) {
                dot.classList.add('active');
            }
        });
    }

    // Função para ir para o próximo slide
    function nextSlide() {
        currentIndex = (currentIndex + 1) % images.length;
        showSlide(currentIndex);
    }

    // Função para ir para o slide anterior
    function prevSlide() {
        currentIndex = (currentIndex - 1 + images.length) % images.length;
        showSlide(currentIndex);
    }

    // Função para ir para um slide específico
    function goToSlide(index) {
        currentIndex = index;
        showSlide(currentIndex);
    }

    // Inicia o autoplay
    function startAutoPlay() {
        slideInterval = setInterval(nextSlide, 3000); // Muda a cada 3 segundos
    }

    // Reseta o autoplay (útil após interação manual)
    function resetAutoPlay() {
        clearInterval(slideInterval);
        startAutoPlay();
    }

    // Adiciona event listeners para os botões
    prevButton.addEventListener('click', () => {
        prevSlide();
        resetAutoPlay();
    });

    nextButton.addEventListener('click', () => {
        nextSlide();
        resetAutoPlay();
    });

    // Inicializa o slider
    showSlide(currentIndex);
    startAutoPlay();
});
