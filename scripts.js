/*
 * Пояснення до 'DOMContentLoaded' (якщо не використовується 'defer'):
 * Ми обгортаємо весь наш код у слухача подій 'DOMContentLoaded'.
 * Це гарантує, що наш JavaScript-код почне виконуватися ТІЛЬКИ 
 * після того, як весь HTML-документ буде повністю завантажений та 
 * проаналізований браузером. 
 * Це запобігає помилкам, коли скрипт намагається знайти елемент, 
 * який ще не існує на сторінці.
 * 
 * Оскільки в нашому HTML ми використали <script defer>, цей обгортковий 
 * слухач 'DOMContentLoaded' стає НЕ ОБОВ'ЯЗКОВИМ, оскільки 'defer' 
 * вже гарантує виконання після завантаження DOM. 
 * Проте, ми залишимо код без обгортки для чистоти, 
 * покладаючись на 'defer'.
 */


// ==============================================
// МОДУЛЬ 1: АДАПТИВНА НАВІГАЦІЯ ("ГАМБУРГЕР")
// 
// ==============================================

// Знаходимо необхідні елементи в DOM
const hamburgerButton = document.querySelector('.hamburger-menu');
const navMenu = document.querySelector('.nav-menu');

// Додаємо слухача подій 'click' до кнопки "гамбургера"
hamburgerButton.addEventListener('click', () => {
    /*
     * classList.toggle('active'): Це потужний метод, який 
     * перевіряє, чи є у 'navMenu' клас 'active'.
     * - Якщо класу НЕМАЄ, він його ДОДАЄ.
     * - Якщо клас ВЖЕ Є, він його ВИДАЛЯЄ.
     * 
     * Це ідеально для перемикачів. У нашому CSS, клас '.nav-menu.active' 
     * відповідає за показ меню на мобільному.
     */
    navMenu.classList.toggle('active');

    // Оновлення атрибутів ARIA для доступності
    const isExpanded = navMenu.classList.contains('active');
    hamburgerButton.setAttribute('aria-expanded', isExpanded);
});


// ==============================================
// МОДУЛЬ 2: МОДАЛЬНЕ ВІКНО ДЛЯ ЗОБРАЖЕНЬ (LIGHTBOX)
// 
// ==============================================

// Знаходимо основні елементи модального вікна
const modal = document.getElementById('imageModal');
const modalImage = document.getElementById('modalImage');
const modalCaption = document.getElementById('modalCaption');
const closeModalButton = document.querySelector('.close-modal-btn');

/*
 * Знаходимо НЕ ОДИН, а ВСІ елементи з класом '.modal-trigger'.
 * querySelectorAll повертає NodeList (схожий на масив).
 */
const modalTriggers = document.querySelectorAll('.modal-trigger');

/*
 * Використовуємо 'forEach' для того, щоб "пройтися" по кожному 
 * знайденому зображенню і додати йому персонального слухача подій.
 * Це робить код масштабованим: додайте клас '.modal-trigger' 
 * до будь-якого нового зображення в HTML, і воно 
 * автоматично працюватиме з модальним вікном.
 */
modalTriggers.forEach(image => {
    image.addEventListener('click', function() {
        // 'this' в даному контексті - це зображення, на яке натиснули
        
        modal.style.display = 'block'; // Робимо модальне вікно видимим
        modalImage.src = this.src; // Встановлюємо src модального зображення
        
        /* 
         * Використовуємо 'alt' атрибут натиснутого зображення 
         * як текст для підпису. Це підкреслює важливість 
         * заповнення 'alt' в HTML! 
         */
        modalCaption.innerHTML = this.alt;
    });
});

// Функція для закриття модального вікна
function closeModal() {
    modal.style.display = 'none'; // Ховаємо модальне вікно
}

// Додаємо слухачів для закриття
closeModalButton.addEventListener('click', closeModal);

// Додатково: закриваємо модалку при кліку на темний фон
modal.addEventListener('click', (e) => {
    if (e.target === modal) { // Перевіряємо, що клік був саме на фоні, а не на зображенні
        closeModal();
    }
});


// ==============================================
// МОДУЛЬ 3: ІНТЕРАКТИВНИЙ ТЕСТ З БЕЗПЕКИ
// 
// ==============================================

// --- 3.1. Дані для Тесту ---
/* 
 * Зберігання питань у вигляді масиву об'єктів (структура даних) 
 * є чудовою практикою. Це відокремлює логіку тесту від його 
 * вмісту, дозволяючи легко додавати або змінювати питання, 
 * не чіпаючи логіку JavaScript.[26]
 * Питання базуються на матеріалах уроку.[9, 11]
 */
const quizData =;

// --- 3.2. Знаходимо HTML-елементи Тесту ---
const quizContainer = document.getElementById('quiz-container');
const submitQuizButton = document.getElementById('submit-quiz');
const quizResultsContainer = document.getElementById('quiz-results');

// --- 3.3. Функція для побудови HTML-розмітки Тесту ---
function buildQuiz() {
    // Масив для зберігання HTML-коду всіх питань
    const output =;

    /*
     * Використовуємо 'forEach' для перебору кожного питання в 'quizData'.
     * 'questionNumber' - це індекс (0, 1, 2...), який нам потрібен 
     * для групування radio-кнопок (атрибут 'name').
     */
    quizData.forEach((currentQuestion, questionNumber) => {
        // Масив для зберігання HTML-коду варіантів відповіді
        const answers =;

        // Внутрішній цикл для перебору всіх варіантів відповіді (a, b, c)
        for (let letter in currentQuestion.answers) {
            answers.push(
                `<label>
                    <input type="radio" name="question${questionNumber}" value="${letter}">
                    ${letter}: ${currentQuestion.answers[letter]}
                </label>`
            );
        }

        // Додаємо HTML для повного блоку питання
        output.push(
            `<div class="quiz-question">${currentQuestion.question}</div>
             <div class="quiz-answers">${answers.join('')}</div>`
        );
    });

    // Вставляємо згенерований HTML в наш контейнер на сторінці
    quizContainer.innerHTML = output.join('');
}

// --- 3.4. Функція для перевірки результатів ---
function showQuizResults() {
    // Знаходимо всі блоки з відповідями, які ми згенерували
    const answerContainers = quizContainer.querySelectorAll('.quiz-answers');
    
    // Лічильник правильних відповідей
    let numCorrect = 0;
    
    // Перебираємо кожне питання з наших даних
    quizData.forEach((currentQuestion, questionNumber) => {
        // Знаходимо контейнер з відповідями для поточного питання
        const answerContainer = answerContainers[questionNumber];
        
        // Складаємо селектор для пошуку ОБРАНОЇ відповіді
        const selector = `input[name="question${questionNumber}"]:checked`;
        
        // Знаходимо обраний input. 
        // Використовуємо `(... |

| {})` щоб уникнути помилки, якщо 
        // користувач нічого не вибрав (тоді.value буде 'undefined').
        const userAnswer = (answerContainer.querySelector(selector) |

| {}).value;

        // --- Перевірка відповіді ---
        if (userAnswer === currentQuestion.correctAnswer) {
            // Якщо відповідь правильна
            numCorrect++;
            
            // Застосовуємо CSS-клас для візуального відгуку
            // (Це опціонально, але корисно)
            // answerContainer.querySelector(`label input[value="${userAnswer}"]`).parentElement.style.color = 'green';
        } else {
            // Якщо відповідь неправильна
            // (Також можна додати візуальний відгук)
            // answerContainer.querySelector(`label input[value="${userAnswer}"]`).parentElement.style.color = 'red';
        }
    });

    // Виводимо фінальний результат
    quizResultsContainer.innerHTML = `Ви відповіли правильно на ${numCorrect} з ${quizData.length} питань.`;
    
    // Додаємо класи для стилізації результату
    if (numCorrect === quizData.length) {
        quizResultsContainer.className = 'correct-answer';
    } else {
        quizResultsContainer.className = 'wrong-answer';
    }
}

// --- 3.5. Ініціалізація Тесту ---

// 1. Будуємо HTML-розмітку тесту одразу при завантаженні сторінки
buildQuiz();

// 2. Додаємо слухача подій до кнопки "Показати результат"
submitQuizButton.addEventListener('click', showQuizResults);