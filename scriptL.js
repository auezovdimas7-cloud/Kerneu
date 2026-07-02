document.addEventListener('DOMContentLoaded', () => {

    /* ============================================
       1. ЛОГИКА СЛАЙДЕРА ФОТОГРАФИЙ (В СЕКЦИИ HERO)
       ============================================ */
    const sliderTrack = document.querySelector('.gallery-slider-track');
    const sliderArrow = document.querySelector('.slider-arrow');
    const slides = document.querySelectorAll('.gallery-slide');
    let currentSlide = 0;

    if (sliderArrow && sliderTrack && slides.length > 0) {
        const totalSlides = slides.length;

        sliderArrow.addEventListener('click', () => {
            // Переход к следующему слайду. Если дошли до конца — возвращаемся в начало.
            currentSlide = (currentSlide + 1) % totalSlides;
            
            // Сдвигаем трек со слайдами
            sliderTrack.style.transform = `translateX(-${currentSlide * 100}%)`;
            
            // Если мы не на первом слайде, переворачиваем стрелку
            if (currentSlide > 0) {
                sliderArrow.classList.add('is-flipped');
            } else {
                sliderArrow.classList.remove('is-flipped');
            }
        });
    }

    /* ============================================
       2. ПРИВЯЗКА КЛИКОВ ПО КАРТОЧКАМ ПРОЕКТОВ
       ============================================ */
    // Автоматически назначаем открытие нужного слайда карусели 
    // при клике на карточку на главной странице (0, 1, 2...)
    const projectCards = document.querySelectorAll('.project-card');
    projectCards.forEach((card, index) => {
        card.addEventListener('click', () => {
            if (typeof window.openGallery === 'function') {
                window.openGallery(index);
            }
        });
    });

    /* ============================================
       3. АКТИВНЫЙ ПУНКТ МЕНЮ ПРИ СКРОЛЛЕ (SCROLLSPY)
       ============================================ */
    const navLinks = document.querySelectorAll('.main-nav a');
    const trackedSections = Array.from(navLinks)
        .map(link => document.querySelector(link.getAttribute('href')))
        .filter(Boolean);

    const setActiveNavLink = () => {
        const headerOffset = 110; // высота липкой шапки + запас
        const scrollPos = window.scrollY + headerOffset;

        // Если страница прокручена до самого низа, а последняя секция
        // (например, короткий футер "Контакты") настолько мала, что
        // scrollPos никогда не "дотягивается" до её offsetTop —
        // считаем последнюю секцию активной принудительно.
        const scrolledToBottom =
            window.innerHeight + window.scrollY >= document.documentElement.scrollHeight - 2;

        let currentSection = trackedSections[0];

        if (scrolledToBottom) {
            currentSection = trackedSections[trackedSections.length - 1];
        } else {
            trackedSections.forEach(section => {
                if (section.offsetTop <= scrollPos) {
                    currentSection = section;
                }
            });
        }

        navLinks.forEach(link => {
            const isActive = currentSection && link.getAttribute('href') === `#${currentSection.id}`;
            link.classList.toggle('active', isActive);
        });
    };

    if (trackedSections.length > 0) {
        setActiveNavLink();
        window.addEventListener('scroll', setActiveNavLink);
        window.addEventListener('resize', setActiveNavLink);
    }

    /* ============================================
       4. ЗАКРЫТИЕ ГАЛЕРЕИ ПО КЛИКУ ВНЕ КАРТОЧКИ
       ============================================ */
    // Закрываем окно, если клик пришёлся не на карточку проекта,
    // не на стрелки навигации и не на крестик закрытия.
    const projectsGallery = document.getElementById('projects-gallery');
    if (projectsGallery) {
        projectsGallery.addEventListener('click', (e) => {
            const clickedInsideCard = e.target.closest('.carousel-card');
            const clickedArrow = e.target.closest('.drawer-nav-arrow');
            const clickedCloseBtn = e.target.closest('.drawer-close');

            if (!clickedInsideCard && !clickedArrow && !clickedCloseBtn) {
                window.closeGallery();
            }
        });
    }

    /* ============================================
       5. АККОРДЕОН FAQ
       ============================================ */
    const faqItems = document.querySelectorAll('.faq-item');
    faqItems.forEach((item) => {
        const question = item.querySelector('.faq-question');
        question.addEventListener('click', () => {
            item.classList.toggle('is-open');
        });
    });

    /* ============================================
       6. УПРАВЛЕНИЕ ГАЛЕРЕЕЙ С КЛАВИАТУРЫ
       ============================================ */
    // Стрелки ← / → переключают проекты, Escape закрывает окно.
    // Работает только пока галерея открыта (класс is-active),
    // чтобы не перехватывать клавиши на остальной странице.
    document.addEventListener('keydown', (e) => {
        const gallery = document.getElementById('projects-gallery');
        if (!gallery || !gallery.classList.contains('is-active')) return;

        if (e.key === 'ArrowRight') {
            e.preventDefault();
            window.moveCarousel(1);
        } else if (e.key === 'ArrowLeft') {
            e.preventDefault();
            window.moveCarousel(-1);
        } else if (e.key === 'Escape') {
            e.preventDefault();
            window.closeGallery();
        }
    });
});


/* ============================================
   3. ГЛОБАЛЬНАЯ ЛОГИКА 3D КАРУСЕЛИ (ГАЛЕРЕИ)
   ============================================ */

let currentCardIndex = 0; 
const totalCards = 6; // Количество проектов в карусели

// Обновляем визуальное состояние карусели
function updateCarousel() {
    const cards = document.querySelectorAll('.carousel-card');
    
    cards.forEach((card, index) => {
        // Очищаем старые позиции
        card.classList.remove('card-center', 'card-left', 'card-right', 'card-hidden');
        
        // Сбрасываем скролл, чтобы при возврате к карточке текст был в самом начале
        const scrollArea = card.querySelector('.drawer-content-scroll');
        if (scrollArea) scrollArea.scrollTop = 0;

        // Назначаем новые позиции (центр, слева, справа, скрыто)
        if (index === currentCardIndex) {
            card.classList.add('card-center'); 
        } else if (index === currentCardIndex - 1) {
            card.classList.add('card-left');   
        } else if (index === currentCardIndex + 1) {
            card.classList.add('card-right');  
        } else {
            card.classList.add('card-hidden'); 
        }
    });

    // Управляем активностью кнопок (отключаем, если дошли до края галереи)
    const prevBtn = document.querySelector('.arrow-prev');
    const nextBtn = document.querySelector('.arrow-next');
    
    if (prevBtn) prevBtn.disabled = currentCardIndex === 0;
    if (nextBtn) nextBtn.disabled = currentCardIndex === totalCards - 1;
}

// Функция перелистывания по клику на стрелки внутри галереи (-1 назад, 1 вперед)
window.moveCarousel = function(direction) {
    const newIndex = currentCardIndex + direction;
    if (newIndex >= 0 && newIndex < totalCards) {
        currentCardIndex = newIndex;
        updateCarousel();
    }
};

// Функция открытия галереи
window.openGallery = function(startIndex) {
    currentCardIndex = startIndex; // Указываем, с какой карточки начать
    updateCarousel();
    
    const gallery = document.getElementById('projects-gallery');
    if (gallery) {
        gallery.classList.add('is-active');

        // Считаем ширину полосы прокрутки, чтобы контент не "прыгал"
        // вправо/влево при скрытии скролла — именно этот сдвиг мешал
        // hover-анимациям карточек после закрытия окна.
        const scrollbarWidth = window.innerWidth - document.documentElement.clientWidth;

        // Блокируем скролл основной страницы, чтобы не листалась на фоне
        document.body.style.overflow = 'hidden';
        if (scrollbarWidth > 0) {
            document.body.style.paddingRight = `${scrollbarWidth}px`;
        }
    }
};

// Функция закрытия галереи
window.closeGallery = function() {
    const gallery = document.getElementById('projects-gallery');
    if (gallery) {
        gallery.classList.remove('is-active');
        // Возвращаем возможность скроллить основную страницу
        document.body.style.overflow = '';
        document.body.style.paddingRight = '';
    }
};