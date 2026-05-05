document.addEventListener('DOMContentLoaded', () => {

// =============================================
// НАВІГАЦІЯ
// =============================================
const navigationButtons = document.querySelectorAll('.nav-btn');
const applicationSections = document.querySelectorAll('.game-section');

function navigateTo(targetId) {
    navigationButtons.forEach(btn => btn.classList.remove('active'));
    applicationSections.forEach(s => s.classList.remove('active'));
    const targetBtn = document.querySelector(`[data-target="${targetId}"]`);
    if (targetBtn) targetBtn.classList.add('active');
    const targetSection = document.getElementById(targetId);
    if (targetSection) targetSection.classList.add('active');
}
window.navigateTo = navigateTo;

navigationButtons.forEach(button => {
    button.addEventListener('click', () => navigateTo(button.getAttribute('data-target')));
});

// =============================================
// ГРА 1: DRAG AND DROP — Сортування пристроїв
// =============================================
const hardwareDevices = [
    { id: 'hw-kbd', name: '⌨️ Клавіатура', category: 'input' },
    { id: 'hw-mon', name: '🖥️ Монітор', category: 'output' },
    { id: 'hw-mus', name: '🖱️ Комп\'ютерна миша', category: 'input' },
    { id: 'hw-prn', name: '🖨️ Принтер', category: 'output' },
    { id: 'hw-mic', name: '🎤 Мікрофон', category: 'input' },
    { id: 'hw-spk', name: '🎧 Навушники', category: 'output' },
    { id: 'hw-scn', name: '📠 Сканер', category: 'input' },
    { id: 'hw-prj', name: '📽️ Проектор', category: 'output' },
    { id: 'hw-cam', name: '📷 Веб-камера', category: 'input' },
    { id: 'hw-plt', name: '🖊️ Графічний планшет', category: 'input' }
];

const poolContainer = document.getElementById('items-pool');
const targetZones = document.querySelectorAll('.drop-target-area');

function initializeDragAndDropGame() {
    poolContainer.innerHTML = '';
    targetZones.forEach(zone => zone.innerHTML = '');
    const randomized = [...hardwareDevices].sort(() => Math.random() - 0.5);
    randomized.forEach(device => {
        const el = document.createElement('div');
        el.classList.add('draggable-item');
        el.setAttribute('draggable', 'true');
        el.setAttribute('id', device.id);
        el.setAttribute('data-category', device.category);
        el.textContent = device.name;
        el.addEventListener('dragstart', e => {
            e.dataTransfer.setData('text/plain', e.target.id);
            setTimeout(() => { e.target.style.opacity = '0.4'; }, 0);
        });
        el.addEventListener('dragend', e => { e.target.style.opacity = '1'; });
        poolContainer.appendChild(el);
    });
}

targetZones.forEach(zone => {
    zone.addEventListener('dragover', e => { e.preventDefault(); zone.classList.add('drag-over'); });
    zone.addEventListener('dragleave', () => zone.classList.remove('drag-over'));
    zone.addEventListener('drop', e => {
        e.preventDefault();
        zone.classList.remove('drag-over');
        const id = e.dataTransfer.getData('text/plain');
        const el = document.getElementById(id);
        const required = zone.parentElement.getAttribute('data-category');
        if (required === el.getAttribute('data-category')) {
            zone.appendChild(el);
            el.setAttribute('draggable', 'false');
            el.style.cursor = 'default';
            el.style.backgroundColor = '#e6fffa';
            el.style.borderColor = 'var(--color-success)';
        } else {
            el.style.transform = 'translateX(10px)';
            setTimeout(() => el.style.transform = 'translateX(-10px)', 100);
            setTimeout(() => el.style.transform = 'translateX(0)', 200);
        }
    });
});

document.getElementById('btn-restart-drag').addEventListener('click', initializeDragAndDropGame);
initializeDragAndDropGame();

// =============================================
// ГРА 2: ВІКТОРИНА — Кібербезпека
// =============================================
const cybersecurityQuestions = [
    {
        query: "Яка дія вказує на ймовірну фішингову атаку?",
        choices: ["Прохання оновити сторінку браузера", "Лист від 'банку' з вимогою терміново ввести пароль за посиланням", "Повідомлення про нове відео від улюбленого блогера", "Пропозиція завантажити легальний антивірус"],
        correctIndex: 1
    },
    {
        query: "Що робити, якщо ти отримав повідомлення з погрозами або булінгом?",
        choices: ["Відповісти агресивно", "Видалити повідомлення і нікому не казати", "Зробити скріншот і показати дорослим", "Переслати друзям"],
        correctIndex: 2
    },
    {
        query: "Який критерій є ключовим для створення надійного пароля?",
        choices: ["Лише цифри", "Ім'я домашнього улюбленця", "Мінімум 8 символів, великі/малі літери та спецсимволи", "Один пароль для всіх акаунтів"],
        correctIndex: 2
    },
    {
        query: "Чому небезпечно підключатися до відкритих публічних Wi-Fi мереж?",
        choices: ["Вони працюють занадто повільно", "Зловмисники можуть перехопити незашифровані дані", "Вони споживають більше заряду батареї", "Неможливо зайти в соціальні мережі"],
        correctIndex: 1
    },
    {
        query: "Що таке двофакторна автентифікація (2FA)?",
        choices: ["Два різних паролі для одного акаунту", "Підтвердження входу двома способами (пароль + SMS-код)", "Два акаунти в одній соціальній мережі", "Подвійна перевірка написання пароля"],
        correctIndex: 1
    },
    {
        query: "Яке з тверджень про особисті дані в інтернеті є правильним?",
        choices: ["Можна ділитися адресою з усіма друзями онлайн", "Ніколи не публікуй свій номер телефону без потреби", "Фотографії домашніх тварин можуть розкрити адресу", "Тільки пункти Б і В"],
        correctIndex: 3
    }
];

let currentQuizStep = 0;
let successfulAnswers = 0;
const queryDisplay = document.getElementById('quiz-question-text');
const optionsContainer = document.getElementById('quiz-options-container');
const scoreDisplay = document.getElementById('quiz-score-display');
const proceedButton = document.getElementById('btn-next-question');
const progressFill = document.getElementById('quiz-progress-fill');

function renderQuizInterface() {
    proceedButton.classList.add('hidden');
    optionsContainer.innerHTML = '';
    if (currentQuizStep >= cybersecurityQuestions.length) {
        queryDisplay.innerHTML = `<span style="color:var(--color-primary)">Вікторину завершено!</span><br>Твій результат: ${successfulAnswers} з ${cybersecurityQuestions.length} правильних відповідей. 🎉`;
        progressFill.style.width = '100%';
        return;
    }
    progressFill.style.width = `${(currentQuizStep / cybersecurityQuestions.length) * 100}%`;
    const task = cybersecurityQuestions[currentQuizStep];
    queryDisplay.textContent = task.query;
    task.choices.forEach((text, idx) => {
        const btn = document.createElement('button');
        btn.classList.add('quiz-option-btn');
        btn.textContent = text;
        btn.addEventListener('click', () => {
            optionsContainer.querySelectorAll('.quiz-option-btn').forEach(b => b.style.pointerEvents = 'none');
            if (idx === task.correctIndex) {
                btn.classList.add('correct-answer'); successfulAnswers++;
            } else {
                btn.classList.add('wrong-answer');
                optionsContainer.querySelectorAll('.quiz-option-btn')[task.correctIndex].classList.add('correct-answer');
            }
            scoreDisplay.textContent = `Правильних відповідей: ${successfulAnswers} / ${cybersecurityQuestions.length}`;
            proceedButton.classList.remove('hidden');
        });
        optionsContainer.appendChild(btn);
    });
    scoreDisplay.textContent = `Правильних відповідей: ${successfulAnswers} / ${cybersecurityQuestions.length}`;
}

proceedButton.addEventListener('click', () => { currentQuizStep++; renderQuizInterface(); });
renderQuizInterface();

// =============================================
// ГРА 3: MEMORY GAME — Інформаційна мозаїка
// =============================================
const termsKnowledgeBase = [
    { pairId: '1', label: '1 Байт' }, { pairId: '1', label: '8 бітів' },
    { pairId: '2', label: '1 Кілобайт' }, { pairId: '2', label: '1024 байти' },
    { pairId: '3', label: 'Алгоритм' }, { pairId: '3', label: 'Послідовність команд' },
    { pairId: '4', label: 'Пристрій введення' }, { pairId: '4', label: 'Клавіатура' },
    { pairId: '5', label: 'Пристрій виведення' }, { pairId: '5', label: 'Монітор' },
    { pairId: '6', label: 'Фішинг' }, { pairId: '6', label: 'Інтернет-шахрайство' },
    { pairId: '7', label: 'Браузер' }, { pairId: '7', label: 'Програма для веб-сайтів' },
    { pairId: '8', label: 'Модем' }, { pairId: '8', label: 'Зв\'язок з Інтернетом' }
];

const gameBoardMemory = document.getElementById('memory-game-board');
const moveTrackerDisplay = document.getElementById('memory-moves-display');
let isBoardLocked = false, cardFlippedState = false, activeCardOne = null, activeCardTwo = null, totalMovesCounter = 0, pairsFound = 0;

function buildMemoryBoard() {
    gameBoardMemory.innerHTML = '';
    isBoardLocked = false; cardFlippedState = false; activeCardOne = null; activeCardTwo = null;
    totalMovesCounter = 0; pairsFound = 0;
    moveTrackerDisplay.textContent = 'Кількість спроб: 0';
    [...termsKnowledgeBase].sort(() => Math.random() - 0.5).forEach(cardData => {
        const card = document.createElement('div');
        card.classList.add('memory-card');
        card.setAttribute('data-pair', cardData.pairId);
        const front = document.createElement('div'); front.classList.add('card-face', 'card-front'); front.textContent = cardData.label;
        const back = document.createElement('div'); back.classList.add('card-face', 'card-back'); back.innerHTML = '&#10068;';
        card.appendChild(front); card.appendChild(back);
        card.addEventListener('click', handleMemoryCard);
        gameBoardMemory.appendChild(card);
    });
}

function handleMemoryCard() {
    if (isBoardLocked || this === activeCardOne) return;
    this.classList.add('is-flipped');
    if (!cardFlippedState) { cardFlippedState = true; activeCardOne = this; return; }
    activeCardTwo = this;
    totalMovesCounter++;
    moveTrackerDisplay.textContent = `Кількість спроб: ${totalMovesCounter}`;
    if (activeCardOne.dataset.pair === activeCardTwo.dataset.pair) {
        [activeCardOne, activeCardTwo].forEach(c => {
            c.removeEventListener('click', handleMemoryCard);
            c.querySelector('.card-front').style.borderColor = 'var(--color-success)';
            c.querySelector('.card-front').style.backgroundColor = '#e6fffa';
        });
        pairsFound++;
        if (pairsFound === termsKnowledgeBase.length / 2) setTimeout(() => alert(`🎉 Чудово! Всі пари знайдено за ${totalMovesCounter} спроб!`), 500);
        isBoardLocked = false; cardFlippedState = false; activeCardOne = null; activeCardTwo = null;
    } else {
        isBoardLocked = true;
        setTimeout(() => {
            activeCardOne.classList.remove('is-flipped'); activeCardTwo.classList.remove('is-flipped');
            isBoardLocked = false; cardFlippedState = false; activeCardOne = null; activeCardTwo = null;
        }, 1200);
    }
}

document.getElementById('btn-restart-memory').addEventListener('click', buildMemoryBoard);
buildMemoryBoard();

// =============================================
// ГРА 4: ДВІЙКОВИЙ КОД
// =============================================
const binaryBits = [128, 64, 32, 16, 8, 4, 2, 1];
let binaryTarget = 0, binaryScore = 0, binaryTotal = 0;

function getRandomBinaryTarget() { return Math.floor(Math.random() * 200) + 10; }

function renderBinaryGame() {
    const row = document.getElementById('binary-bits-row');
    row.innerHTML = '';
    binaryTarget = getRandomBinaryTarget();
    document.getElementById('binary-target-num').textContent = binaryTarget;
    document.getElementById('binary-current-val').textContent = '0';
    document.getElementById('binary-feedback').classList.add('hidden');
    document.getElementById('btn-next-binary').classList.add('hidden');
    document.getElementById('btn-check-binary').classList.remove('hidden');

    binaryBits.forEach(val => {
        const col = document.createElement('div');
        col.classList.add('binary-bit-col');
        const label = document.createElement('div');
        label.classList.add('binary-bit-label');
        label.textContent = val;
        const btn = document.createElement('button');
        btn.classList.add('binary-bit-btn');
        btn.textContent = '0';
        btn.dataset.val = val;
        btn.addEventListener('click', () => {
            btn.classList.toggle('active');
            btn.textContent = btn.classList.contains('active') ? '1' : '0';
            updateBinaryCurrentVal();
        });
        col.appendChild(label); col.appendChild(btn);
        row.appendChild(col);
    });
}

function updateBinaryCurrentVal() {
    let sum = 0;
    document.querySelectorAll('.binary-bit-btn.active').forEach(b => sum += parseInt(b.dataset.val));
    document.getElementById('binary-current-val').textContent = sum;
}

document.getElementById('btn-check-binary').addEventListener('click', () => {
    let sum = 0;
    document.querySelectorAll('.binary-bit-btn.active').forEach(b => sum += parseInt(b.dataset.val));
    const fb = document.getElementById('binary-feedback');
    binaryTotal++;
    fb.classList.remove('hidden');
    document.getElementById('btn-check-binary').classList.add('hidden');
    document.getElementById('btn-next-binary').classList.remove('hidden');
    document.querySelectorAll('.binary-bit-btn').forEach(b => b.disabled = true);
    if (sum === binaryTarget) {
        binaryScore++;
        fb.className = 'binary-feedback success';
        fb.textContent = `✅ Правильно! ${binaryTarget} у двійковому = ${binaryTarget.toString(2)}`;
    } else {
        fb.className = 'binary-feedback error';
        fb.textContent = `❌ Не вірно. ${binaryTarget} у двійковому = ${binaryTarget.toString(2)}`;
    }
    document.getElementById('binary-score').textContent = `Рахунок: ${binaryScore} / ${binaryTotal}`;
});

document.getElementById('btn-next-binary').addEventListener('click', renderBinaryGame);
renderBinaryGame();

// =============================================
// ГРА 5: ЗБЕРИ КОМП'ЮТЕР
// =============================================
const pcComponents = [
    { id: 'pc-cpu', name: '🧠 Процесор (CPU)', slot: 'cpu', desc: 'Мозок комп\'ютера' },
    { id: 'pc-ram', name: '💾 Оперативна пам\'ять (RAM)', slot: 'ram', desc: 'Тимчасова пам\'ять' },
    { id: 'pc-ssd', name: '💿 Жорсткий диск (SSD)', slot: 'storage', desc: 'Постійна пам\'ять' },
    { id: 'pc-gpu', name: '🎮 Відеокарта (GPU)', slot: 'gpu', desc: 'Обробка графіки' },
    { id: 'pc-psu', name: '⚡ Блок живлення (PSU)', slot: 'psu', desc: 'Подача струму' },
    { id: 'pc-mb',  name: '📋 Материнська плата', slot: 'mb',  desc: 'Основа всіх компонентів' }
];

const pcSlotDefs = [
    { id: 'cpu', label: '🧠 ______ — Процесор' },
    { id: 'ram', label: '💾 ______ — Оперативна пам\'ять' },
    { id: 'storage', label: '💿 ______ — Накопичувач' },
    { id: 'gpu', label: '🎮 ______ — Відеокарта' },
    { id: 'psu', label: '⚡ ______ — Блок живлення' },
    { id: 'mb',  label: '📋 ______ — Материнська плата' }
];

function initPcBuilder() {
    const pool = document.getElementById('pc-parts-pool');
    const slots = document.getElementById('pc-slots');
    pool.innerHTML = '<h4>Компоненти</h4>';
    slots.innerHTML = '';
    document.getElementById('pc-feedback').textContent = '';

    [...pcComponents].sort(() => Math.random() - 0.5).forEach(comp => {
        const el = document.createElement('div');
        el.classList.add('pc-part-item');
        el.setAttribute('draggable', 'true');
        el.setAttribute('id', comp.id);
        el.setAttribute('data-slot', comp.slot);
        el.textContent = comp.name;
        el.addEventListener('dragstart', e => { e.dataTransfer.setData('text/plain', e.target.id); setTimeout(() => e.target.style.opacity = '0.4', 0); });
        el.addEventListener('dragend', e => e.target.style.opacity = '1');
        pool.appendChild(el);
    });

    pcSlotDefs.forEach(slotDef => {
        const slot = document.createElement('div');
        slot.classList.add('pc-slot');
        slot.setAttribute('data-slot', slotDef.id);
        slot.textContent = slotDef.label;
        slot.addEventListener('dragover', e => { e.preventDefault(); slot.classList.add('drag-over'); });
        slot.addEventListener('dragleave', () => slot.classList.remove('drag-over'));
        slot.addEventListener('drop', e => {
            e.preventDefault();
            slot.classList.remove('drag-over');
            if (slot.classList.contains('filled')) return;
            const id = e.dataTransfer.getData('text/plain');
            const part = document.getElementById(id);
            const partSlot = part.getAttribute('data-slot');
            if (partSlot === slotDef.id) {
                slot.textContent = part.textContent;
                slot.classList.add('filled');
                part.remove();
                checkPcComplete();
            } else {
                slot.classList.add('wrong');
                setTimeout(() => slot.classList.remove('wrong'), 600);
            }
        });
        slots.appendChild(slot);
    });
}

function checkPcComplete() {
    const filled = document.querySelectorAll('.pc-slot.filled').length;
    const fb = document.getElementById('pc-feedback');
    if (filled === pcSlotDefs.length) {
        fb.textContent = '🎉 Відмінно! Комп\'ютер зібрано правильно!';
        fb.style.color = '#004d40';
        fb.style.background = '#e0fff8';
        fb.style.padding = '0.8rem';
        fb.style.borderRadius = '8px';
    }
}

document.getElementById('btn-restart-pc').addEventListener('click', initPcBuilder);
initPcBuilder();

// =============================================
// ГРА 6: ШВИДКОДРУК
// =============================================
const typingTexts = [
    "Комп'ютер є електронною машиною яка обробляє інформацію за заданою програмою.",
    "Інтернет це глобальна мережа яка поєднує мільйони комп'ютерів у всьому світі.",
    "Алгоритм це чітка послідовність кроків для розв'язання задачі.",
    "Процесор є мозком комп'ютера і виконує всі обчислення.",
    "Кіберзлочинці можуть викрасти паролі через небезпечні сайти та фішинг."
];

let typerTimer = null, typerTimeLeft = 60, typerStarted = false;
let typerCurrentText = '', typerCorrect = 0, typerErrors = 0, typerStartTime = 0;
const typerDisplay = document.getElementById('typer-text-display');
const typerInput = document.getElementById('typer-input');

function renderTyperText() {
    typerCurrentText = typingTexts[Math.floor(Math.random() * typingTexts.length)];
    typerDisplay.innerHTML = typerCurrentText.split('').map((ch, i) =>
        `<span class="typer-char" data-idx="${i}">${ch}</span>`
    ).join('');
}

function startTyper() {
    if (typerStarted) return;
    typerStarted = true; typerCorrect = 0; typerErrors = 0;
    typerTimeLeft = 60; typerStartTime = Date.now();
    typerInput.disabled = false; typerInput.value = ''; typerInput.focus();
    document.getElementById('btn-start-typer').disabled = true;
    renderTyperText();
    typerTimer = setInterval(() => {
        typerTimeLeft--;
        document.getElementById('typer-time').textContent = typerTimeLeft;
        if (typerTimeLeft <= 0) endTyper();
    }, 1000);
}

function endTyper() {
    clearInterval(typerTimer); typerStarted = false;
    typerInput.disabled = true;
    const elapsed = (Date.now() - typerStartTime) / 60000;
    const words = typerCorrect / 5;
    document.getElementById('typer-wpm').textContent = Math.round(words / elapsed) || 0;
    const total = typerCorrect + typerErrors;
    document.getElementById('typer-acc').textContent = total > 0 ? Math.round((typerCorrect / total) * 100) + '%' : '100%';
    document.getElementById('btn-start-typer').disabled = false;
    typerDisplay.innerHTML = '<div style="text-align:center;font-size:1.5rem;font-weight:800;color:var(--color-primary)">Час вийшов! Натисни "Почати" знову.</div>';
}

typerInput.addEventListener('input', () => {
    if (!typerStarted) return;
    const val = typerInput.value;
    const chars = typerDisplay.querySelectorAll('.typer-char');
    chars.forEach((ch, i) => {
        ch.classList.remove('correct', 'wrong', 'current');
        if (i < val.length) {
            if (val[i] === typerCurrentText[i]) { ch.classList.add('correct'); }
            else { ch.classList.add('wrong'); }
        } else if (i === val.length) {
            ch.classList.add('current');
        }
    });
    typerCorrect = [...chars].filter(c => c.classList.contains('correct')).length;
    typerErrors = [...chars].filter(c => c.classList.contains('wrong')).length;
    if (val.length >= typerCurrentText.length) {
        const words = typerCurrentText.split(' ').length;
        document.getElementById('typer-wpm').textContent = Math.round(words / ((Date.now() - typerStartTime) / 60000));
        renderTyperText(); typerInput.value = '';
    }
});

document.getElementById('btn-start-typer').addEventListener('click', () => {
    typerStarted = false;
    clearInterval(typerTimer);
    document.getElementById('typer-time').textContent = 60;
    document.getElementById('typer-wpm').textContent = 0;
    document.getElementById('typer-acc').textContent = '100%';
    startTyper();
});
renderTyperText();
typerInput.disabled = true;

// =============================================
// ГРА 7: ОДИНИЦІ ІНФОРМАЦІЇ
// =============================================
const unitsQuestions = [
    { q: "Скільки бітів містить 1 байт?", choices: ["4 біти", "8 бітів", "16 бітів", "2 біти"], correct: 1 },
    { q: "Скільки байтів у 1 кілобайті (КБ)?", choices: ["100 байтів", "512 байтів", "1000 байтів", "1024 байти"], correct: 3 },
    { q: "Яка одиниця більша?", choices: ["Мегабайт (МБ)", "Кілобайт (КБ)", "Гігабайт (ГБ)", "Байт"], correct: 2 },
    { q: "1 Гігабайт = ?", choices: ["1024 КБ", "1024 МБ", "1000 МБ", "1024 ТБ"], correct: 1 },
    { q: "Яка одиниця виміру інформації є найменшою?", choices: ["Байт", "Кілобайт", "Біт", "Мегабайт"], correct: 2 },
    { q: "Файл розміром 2048 байтів — це скільки кілобайтів?", choices: ["1 КБ", "2 КБ", "4 КБ", "0.5 КБ"], correct: 1 },
    { q: "Скільки мегабайтів у 1 гігабайті?", choices: ["100", "512", "1000", "1024"], correct: 3 }
];

let unitsStep = 0, unitsScore = 0;
function renderUnitsGame() {
    if (unitsStep >= unitsQuestions.length) {
        document.getElementById('units-question').innerHTML = `<span style="color:var(--color-primary)">Завершено!</span> Результат: ${unitsScore} / ${unitsQuestions.length}`;
        document.getElementById('units-options').innerHTML = '';
        return;
    }
    const q = unitsQuestions[unitsStep];
    document.getElementById('units-question').textContent = q.q;
    document.getElementById('btn-next-units').classList.add('hidden');
    const container = document.getElementById('units-options');
    container.innerHTML = '';
    q.choices.forEach((ch, idx) => {
        const btn = document.createElement('button');
        btn.classList.add('quiz-option-btn');
        btn.textContent = ch;
        btn.addEventListener('click', () => {
            container.querySelectorAll('.quiz-option-btn').forEach(b => b.style.pointerEvents = 'none');
            if (idx === q.correct) { btn.classList.add('correct-answer'); unitsScore++; }
            else { btn.classList.add('wrong-answer'); container.querySelectorAll('.quiz-option-btn')[q.correct].classList.add('correct-answer'); }
            document.getElementById('units-score').textContent = `${unitsScore} / ${unitsQuestions.length}`;
            document.getElementById('btn-next-units').classList.remove('hidden');
        });
        container.appendChild(btn);
    });
}
document.getElementById('btn-next-units').addEventListener('click', () => { unitsStep++; renderUnitsGame(); });
renderUnitsGame();

// =============================================
// ГРА 8: НАДІЙНИЙ ПАРОЛЬ
// =============================================
const passInput = document.getElementById('password-input');
const strengthFill = document.getElementById('pass-strength-fill');
const strengthLabel = document.getElementById('pass-strength-label');

function checkPassword(pass) {
    const criteria = {
        length: pass.length >= 8,
        upper: /[A-Z]/.test(pass),
        lower: /[a-z]/.test(pass),
        digit: /[0-9]/.test(pass),
        special: /[!@#$%^&*()_+\-=\[\]{};':"\\|,.<>\/?]/.test(pass)
    };
    const met = Object.values(criteria).filter(Boolean).length;

    ['length','upper','lower','digit','special'].forEach(key => {
        const el = document.getElementById(`crit-${key}`);
        if (criteria[key]) { el.textContent = el.textContent.replace('❌', '✅'); el.classList.add('met'); }
        else { el.textContent = el.textContent.replace('✅', '❌'); el.classList.remove('met'); }
    });

    const levels = [
        { label: 'Дуже слабкий 😱', color: '#ff595e', width: '20%' },
        { label: 'Слабкий 😟', color: '#ff595e', width: '35%' },
        { label: 'Середній 😐', color: '#fee440', width: '55%' },
        { label: 'Добрий 🙂', color: '#00bbf9', width: '75%' },
        { label: 'Надійний 💪', color: '#00f5d4', width: '100%' }
    ];
    const level = levels[Math.min(met, 4)];
    strengthFill.style.width = pass.length === 0 ? '0%' : level.width;
    strengthFill.style.background = level.color;
    strengthLabel.textContent = pass.length === 0 ? 'Введи пароль' : level.label;
    strengthLabel.style.color = pass.length === 0 ? 'var(--color-text-muted)' : level.color;
}

// Fix criteria text initially
document.getElementById('crit-length').textContent = '❌ Мінімум 8 символів';
document.getElementById('crit-upper').textContent = '❌ Велика літера (A-Z)';
document.getElementById('crit-lower').textContent = '❌ Мала літера (a-z)';
document.getElementById('crit-digit').textContent = '❌ Цифра (0-9)';
document.getElementById('crit-special').textContent = '❌ Спецсимвол (!@#$...)';

passInput.addEventListener('input', () => checkPassword(passInput.value));

document.getElementById('btn-toggle-pass').addEventListener('click', () => {
    passInput.type = passInput.type === 'password' ? 'text' : 'password';
});

document.getElementById('btn-gen-pass').addEventListener('click', () => {
    const chars = 'ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789!@#$%^&*';
    let pass = '';
    for (let i = 0; i < 14; i++) pass += chars[Math.floor(Math.random() * chars.length)];
    const display = document.getElementById('gen-pass-display');
    display.textContent = pass;
    display.classList.remove('hidden');
    passInput.value = pass;
    checkPassword(pass);
});

// =============================================
// ГРА 9: РОЗПІЗНАЙ ФІШИНГ
// =============================================
const phishingScenarios = [
    {
        from: "Від: банк-приват24-підтвердження@gmail.com",
        subject: "🚨 ТЕРМІНОВО: Ваш рахунок заблоковано!",
        body: "Шановний клієнте! Ваш банківський рахунок тимчасово заблоковано через підозрілу активність. Для відновлення доступу натисніть посилання та введіть повні дані картки, PIN-код та пароль до 24:00 сьогодні.",
        isPhishing: true,
        explanation: "🎣 ФІШИНГ! Ознаки: підозрілий email (gmail замість банківського домену), терміновість, вимога ввести PIN та пароль. Банки НІКОЛИ не просять пароль через email."
    },
    {
        from: "Від: newsletter@nationalgeographic.com",
        subject: "Нові статті про дикої природи цього тижня 🦁",
        body: "Привіт! Цього тижня на National Geographic: неймовірні фото левів Серенгеті, підводні знахідки в Тихому океані та репортаж про кліматичні зміни. Читай на нашому сайті!",
        isPhishing: false,
        explanation: "✅ БЕЗПЕЧНО. Офіційний домен nationalgeographic.com, звичайний дайджест без підозрілих прохань, не вимагає особистих даних."
    },
    {
        from: "Від: support@apple-id-verify.site",
        subject: "Ваш Apple ID буде видалено",
        body: "Ми виявили що ваш Apple ID використовується з невідомого пристрою. Щоб зберегти свій акаунт перейдіть на наш сайт та підтвердіть особистість ввівши Apple ID та пароль.",
        isPhishing: true,
        explanation: "🎣 ФІШИНГ! Домен apple-id-verify.site — не офіційний Apple. Справжні листи від Apple приходять лише з @apple.com. Ніколи не вводь пароль за таким посиланням!"
    },
    {
        from: "Від: noreply@classroom.google.com",
        subject: "Тебе запрошено до курсу: Інформатика 6 клас",
        body: "Привіт! Твій вчитель додав тебе до класу 'Інформатика 6 клас' у Google Classroom. Щоб переглянути завдання та матеріали, зайди до Google Classroom.",
        isPhishing: false,
        explanation: "✅ БЕЗПЕЧНО. Офіційний домен classroom.google.com, звичайне запрошення до навчання, не вимагає нічого підозрілого."
    },
    {
        from: "Від: winner2024@bestlottery-ukraine.net",
        subject: "🎰 ВІТАЄМО! Ви виграли 50,000 грн!",
        body: "Вітаємо! Ви були обрані переможцем нашої лотереї та виграли 50,000 грн! Для отримання призу надішліть свої повні дані: ім'я, адресу, номер картки та 200 грн страхового збору.",
        isPhishing: true,
        explanation: "🎣 ФІШИНГ/ШАХРАЙСТВО! Ти не брав участь у лотереї. Просять особисті дані та гроші — класична схема шахраїв. Нікому не надсилай гроші та дані!"
    }
];

let phishingStep = 0, phishingScore = 0;

function renderPhishing() {
    if (phishingStep >= phishingScenarios.length) {
        document.querySelector('.phishing-email-card').innerHTML = `<div style="padding:3rem;text-align:center;font-size:1.3rem;font-weight:800;color:var(--color-primary)">🎉 Завершено! Результат: ${phishingScore} / ${phishingScenarios.length}</div>`;
        document.querySelector('.phishing-buttons').classList.add('hidden');
        return;
    }
    const sc = phishingScenarios[phishingStep];
    document.getElementById('phishing-from').textContent = sc.from;
    document.getElementById('phishing-subject').textContent = sc.subject;
    document.getElementById('phishing-body').textContent = sc.body;
    const expl = document.getElementById('phishing-explanation');
    expl.classList.add('hidden'); expl.className = 'phishing-explanation hidden';
    document.getElementById('btn-next-phishing').classList.add('hidden');
    document.getElementById('btn-safe').disabled = false;
    document.getElementById('btn-phishing-pick').disabled = false;
}

function handlePhishingAnswer(userSaysPhishing) {
    const sc = phishingScenarios[phishingStep];
    const correct = userSaysPhishing === sc.isPhishing;
    if (correct) phishingScore++;
    const expl = document.getElementById('phishing-explanation');
    expl.textContent = sc.explanation;
    expl.classList.remove('hidden');
    expl.className = `phishing-explanation ${correct ? 'correct' : 'wrong'}`;
    document.getElementById('phishing-score').textContent = `Рахунок: ${phishingScore} / ${phishingScenarios.length}`;
    document.getElementById('btn-next-phishing').classList.remove('hidden');
    document.getElementById('btn-safe').disabled = true;
    document.getElementById('btn-phishing-pick').disabled = true;
}

document.getElementById('btn-safe').addEventListener('click', () => handlePhishingAnswer(false));
document.getElementById('btn-phishing-pick').addEventListener('click', () => handlePhishingAnswer(true));
document.getElementById('btn-next-phishing').addEventListener('click', () => { phishingStep++; renderPhishing(); });
renderPhishing();

// =============================================
// ГРА 10: БЕЗПЕЧНИЙ ЧАТ
// =============================================
const chatScenarios = [
    {
        message: "Привіт! Я твій новий однокласник 😊 Як тебе звати і де ти живеш? Хочу зустрітися!",
        options: [
            { text: "Привіт! Мене звуть [ім'я], живу на [вулиця]...", correct: false, why: "Ніколи не давай адресу незнайомцям в інтернеті!" },
            { text: "Привіт! Я не ділюсь адресою з незнайомими. Якщо ми однокласники, ми вже знайомі в школі.", correct: true, why: "✅ Правильно! Справжній однокласник знає тебе особисто. Не довіряй незнайомцям онлайн." },
            { text: "Відповідаю що завгодно, це ж просто розмова", correct: false, why: "Навіть звичайна розмова може бути небезпечною, якщо незнайомець дізнається твоє місцезнаходження." }
        ]
    },
    {
        message: "Я знайшов твою сторінку в соцмережах. Ти дуже класний! Давай дружити та обмінюватися фото? 📸",
        options: [
            { text: "Звичайно, надсилаю фото прямо зараз!", correct: false, why: "Не надсилай фото незнайомцям! Вони можуть використати їх у поганих цілях." },
            { text: "Ні, я не надсилаю особисті фото незнайомим людям.", correct: true, why: "✅ Правильно! Ніколи не надсилай особисті фото незнайомцям в інтернеті." },
            { text: "Добре, але спочатку ти надішли своє фото", correct: false, why: "Обмін фото з незнайомцями небезпечний незалежно від порядку." }
        ]
    },
    {
        message: "Не кажи батькам що ми спілкуємося — вони не зрозуміють нашу дружбу 🤫",
        options: [
            { text: "Добре, це буде наш секрет!", correct: false, why: "Дорослі, які просять тримати спілкування в секреті від батьків — небезпечні!" },
            { text: "Я розповім батькам про тебе. Якщо це справжня дружба — таємниць немає.", correct: true, why: "✅ Правильно! Якщо хтось просить тебе приховувати спілкування від дорослих — це тривожний сигнал!" },
            { text: "Зрозуміло, мовчатиму", correct: false, why: "Ніколи не тримай у таємниці від батьків незнайомців з інтернету!" }
        ]
    }
];

let chatStep = 0, chatScore = 0;

function renderChat() {
    if (chatStep >= chatScenarios.length) {
        document.getElementById('chat-window').innerHTML = `<div style="font-size:1.2rem;font-weight:800;color:var(--color-primary);text-align:center">🎉 Завершено! Результат: ${chatScore} / ${chatScenarios.length}</div>`;
        document.getElementById('chat-options').innerHTML = '';
        return;
    }
    const sc = chatScenarios[chatStep];
    const win = document.getElementById('chat-window');
    win.innerHTML = '';
    const msg = document.createElement('div'); msg.classList.add('chat-msg', 'stranger'); msg.textContent = sc.message;
    win.appendChild(msg);
    const opts = document.getElementById('chat-options'); opts.innerHTML = '';
    const fb = document.getElementById('chat-feedback'); fb.classList.add('hidden');
    document.getElementById('btn-next-chat').classList.add('hidden');

    sc.options.forEach(opt => {
        const btn = document.createElement('button'); btn.classList.add('chat-option-btn');
        btn.textContent = opt.text;
        btn.addEventListener('click', () => {
            opts.querySelectorAll('.chat-option-btn').forEach(b => { b.style.pointerEvents = 'none'; });
            if (opt.correct) { btn.classList.add('correct-chat'); chatScore++; fb.className = 'chat-feedback ok'; }
            else { btn.classList.add('wrong-chat'); fb.className = 'chat-feedback bad'; }
            fb.textContent = opt.why; fb.classList.remove('hidden');
            document.getElementById('chat-score').textContent = `Рахунок: ${chatScore} / ${chatScenarios.length}`;
            document.getElementById('btn-next-chat').classList.remove('hidden');
        });
        opts.appendChild(btn);
    });
}

document.getElementById('btn-next-chat').addEventListener('click', () => { chatStep++; renderChat(); });
renderChat();

// =============================================
// ГРА 11: ПРАВДА ЧИ МІФ
// =============================================
const tfStatements = [
    { statement: "Якщо видалити файл у кошик, він назавжди зникає з комп'ютера.", isTrue: false, explanation: "МІФ! Файл у кошику займає місце на диску. Він видаляється остаточно лише після очищення кошика." },
    { statement: "Антивірус може захистити від усіх видів загроз в інтернеті.", isTrue: false, explanation: "МІФ! Антивірус — важливий, але не єдиний захист. Соціальна інженерія та фішинг можуть обійти антивірус. Потрібна обережність користувача." },
    { statement: "1 байт = 8 бітів.", isTrue: true, explanation: "ПРАВДА! Це основне правило цифрового кодування. 1 байт завжди дорівнює рівно 8 бітам." },
    { statement: "Якщо сайт використовує HTTPS, він повністю безпечний і не може бути фішинговим.", isTrue: false, explanation: "МІФ! HTTPS означає лише що з'єднання зашифроване, але не гарантує що сам сайт чесний. Фішингові сайти теж можуть мати HTTPS." },
    { statement: "RAM (оперативна пам'ять) зберігає дані навіть після вимкнення комп'ютера.", isTrue: false, explanation: "МІФ! RAM — енергозалежна пам'ять. Після вимкнення живлення всі дані в ній зникають. Для постійного збереження є SSD/HDD." },
    { statement: "Процесор (CPU) є основним обчислювальним пристроєм комп'ютера.", isTrue: true, explanation: "ПРАВДА! CPU — це 'мозок' комп'ютера, що виконує всі основні обчислення та керує роботою інших компонентів." },
    { statement: "Один і той самий пароль можна безпечно використовувати на всіх сайтах.", isTrue: false, explanation: "МІФ! Якщо один сайт зламано, зловмисники отримають доступ до всіх твоїх акаунтів. Використовуй унікальні паролі!" },
    { statement: "Електронна пошта (email) була винайдена до появи інтернету.", isTrue: true, explanation: "ПРАВДА! Email існував ще в 1971 році у мережах-попередниках інтернету (ARPANET), задовго до появи World Wide Web." }
];

let tfStep = 0, tfScore = 0;
function renderTF() {
    if (tfStep >= tfStatements.length) {
        document.getElementById('tf-statement').innerHTML = `<span style="color:var(--color-primary)">Завершено! Результат: ${tfScore} / ${tfStatements.length} 🎉</span>`;
        document.querySelector('.tf-buttons').style.display = 'none';
        return;
    }
    document.getElementById('tf-statement').textContent = tfStatements[tfStep].statement;
    document.getElementById('tf-explanation').classList.add('hidden');
    document.getElementById('btn-next-tf').classList.add('hidden');
    document.getElementById('btn-truth').disabled = false;
    document.getElementById('btn-myth').disabled = false;
}

function handleTF(userSaysTrue) {
    const item = tfStatements[tfStep];
    const correct = userSaysTrue === item.isTrue;
    if (correct) tfScore++;
    const expl = document.getElementById('tf-explanation');
    expl.textContent = (correct ? '✅ ' : '❌ ') + item.explanation;
    expl.className = `tf-explanation ${correct ? 'correct' : 'wrong'}`;
    expl.classList.remove('hidden');
    document.getElementById('tf-score').textContent = `${tfScore} / ${tfStatements.length}`;
    document.getElementById('btn-next-tf').classList.remove('hidden');
    document.getElementById('btn-truth').disabled = true;
    document.getElementById('btn-myth').disabled = true;
}

document.getElementById('btn-truth').addEventListener('click', () => handleTF(true));
document.getElementById('btn-myth').addEventListener('click', () => handleTF(false));
document.getElementById('btn-next-tf').addEventListener('click', () => { tfStep++; renderTF(); });
renderTF();

// =============================================
// ГРА 12: АЛГОРИТМ КРОКІВ
// =============================================
const algorithms = [
    {
        task: "Алгоритм приготування бутерброда 🥪",
        steps: ["Взяти хліб", "Намастити масло", "Покласти сир", "Додати ковбасу", "Накрити другим шматком хліба", "Подати на стіл"],
        correct: [0,1,2,3,4,5]
    },
    {
        task: "Алгоритм входу на сайт 🌐",
        steps: ["Відкрити браузер", "Ввести адресу сайту", "Дочекатися завантаження", "Натиснути 'Увійти'", "Ввести логін та пароль", "Підтвердити вхід"],
        correct: [0,1,2,3,4,5]
    },
    {
        task: "Алгоритм збереження файлу 💾",
        steps: ["Відкрити програму", "Створити документ", "Написати текст", "Натиснути Ctrl+S", "Вибрати назву файлу", "Натиснути 'Зберегти'"],
        correct: [0,1,2,3,4,5]
    }
];

let algoStep = 0, algoScore = 0, algoCorrectTotal = 0;
let algoDragSrc = null;

function renderAlgo() {
    if (algoStep >= algorithms.length) {
        document.getElementById('algo-task').innerHTML = `<span style="color:var(--color-primary)">🎉 Завершено! Результат: ${algoScore} / ${algoCorrectTotal}</span>`;
        document.getElementById('algo-steps-list').innerHTML = '';
        return;
    }
    const algo = algorithms[algoStep];
    document.getElementById('algo-task').textContent = algo.task;
    document.getElementById('algo-feedback').classList.add('hidden');
    document.getElementById('btn-next-algo').classList.add('hidden');
    document.getElementById('btn-check-algo').classList.remove('hidden');

    const shuffled = [...algo.steps].sort(() => Math.random() - 0.5);
    const list = document.getElementById('algo-steps-list');
    list.innerHTML = '';
    shuffled.forEach((step, i) => {
        const el = document.createElement('div');
        el.classList.add('algo-step');
        el.setAttribute('draggable', 'true');
        el.dataset.text = step;
        el.innerHTML = `<div class="algo-step-num">${i + 1}</div><span>${step}</span>`;
        el.addEventListener('dragstart', e => { algoDragSrc = el; setTimeout(() => el.style.opacity = '0.4', 0); });
        el.addEventListener('dragend', e => { el.style.opacity = '1'; });
        el.addEventListener('dragover', e => { e.preventDefault(); el.classList.add('drag-over-step'); });
        el.addEventListener('dragleave', () => el.classList.remove('drag-over-step'));
        el.addEventListener('drop', e => {
            e.preventDefault(); el.classList.remove('drag-over-step');
            if (algoDragSrc !== el) {
                const allSteps = [...list.querySelectorAll('.algo-step')];
                const srcIdx = allSteps.indexOf(algoDragSrc);
                const tgtIdx = allSteps.indexOf(el);
                if (srcIdx < tgtIdx) list.insertBefore(algoDragSrc, el.nextSibling);
                else list.insertBefore(algoDragSrc, el);
                allSteps.forEach((s, idx) => s.querySelector('.algo-step-num').textContent = idx + 1);
            }
        });
        list.appendChild(el);
    });
}

document.getElementById('btn-check-algo').addEventListener('click', () => {
    const algo = algorithms[algoStep];
    const current = [...document.querySelectorAll('.algo-step')].map(s => s.dataset.text);
    let correct = current.every((s, i) => s === algo.steps[i]);
    algoCorrectTotal++;
    const fb = document.getElementById('algo-feedback');
    fb.classList.remove('hidden');
    if (correct) {
        algoScore++;
        fb.className = 'algo-feedback correct'; fb.textContent = '✅ Правильно! Алгоритм складено вірно!';
    } else {
        fb.className = 'algo-feedback wrong'; fb.textContent = `❌ Не зовсім. Правильний порядок: ${algo.steps.join(' → ')}`;
    }
    document.getElementById('algo-score').textContent = `Рахунок: ${algoScore} / ${algoCorrectTotal}`;
    document.getElementById('btn-check-algo').classList.add('hidden');
    document.getElementById('btn-next-algo').classList.remove('hidden');
});

document.getElementById('btn-next-algo').addEventListener('click', () => { algoStep++; renderAlgo(); });
renderAlgo();

// =============================================
// ГРА 13: БЛОК-СХЕМА
// =============================================
const flowchartShapes = [
    {
        name: "Початок / Кінець",
        svg: `<svg width="200" height="80" viewBox="0 0 200 80"><ellipse cx="100" cy="40" rx="90" ry="35" fill="none" stroke="#5a4fcf" stroke-width="3"/><text x="100" y="44" text-anchor="middle" font-family="Nunito" font-size="14" fill="#5a4fcf" font-weight="700">Початок / Кінець</text></svg>`,
        options: ["Початок / Кінець", "Дія (процес)", "Умова (рішення)", "Введення/Виведення"],
        correct: 0
    },
    {
        name: "Дія (процес)",
        svg: `<svg width="200" height="80" viewBox="0 0 200 80"><rect x="10" y="10" width="180" height="60" fill="none" stroke="#5a4fcf" stroke-width="3" rx="4"/><text x="100" y="44" text-anchor="middle" font-family="Nunito" font-size="14" fill="#5a4fcf" font-weight="700">Дія (процес)</text></svg>`,
        options: ["Початок / Кінець", "Дія (процес)", "Умова (рішення)", "З'єднувач"],
        correct: 1
    },
    {
        name: "Умова (рішення)",
        svg: `<svg width="200" height="100" viewBox="0 0 200 100"><polygon points="100,5 195,50 100,95 5,50" fill="none" stroke="#5a4fcf" stroke-width="3"/><text x="100" y="54" text-anchor="middle" font-family="Nunito" font-size="13" fill="#5a4fcf" font-weight="700">Умова?</text></svg>`,
        options: ["Початок / Кінець", "Дія (процес)", "Умова (рішення)", "Введення/Виведення"],
        correct: 2
    },
    {
        name: "Введення/Виведення",
        svg: `<svg width="220" height="80" viewBox="0 0 220 80"><polygon points="30,10 210,10 190,70 10,70" fill="none" stroke="#5a4fcf" stroke-width="3"/><text x="110" y="44" text-anchor="middle" font-family="Nunito" font-size="13" fill="#5a4fcf" font-weight="700">Введення/Виведення</text></svg>`,
        options: ["Дія (процес)", "Умова (рішення)", "Введення/Виведення", "Початок / Кінець"],
        correct: 2
    },
    {
        name: "З'єднувач",
        svg: `<svg width="100" height="100" viewBox="0 0 100 100"><circle cx="50" cy="50" r="42" fill="none" stroke="#5a4fcf" stroke-width="3"/><text x="50" y="54" text-anchor="middle" font-family="Nunito" font-size="13" fill="#5a4fcf" font-weight="700">1</text></svg>`,
        options: ["Початок / Кінець", "Дія (процес)", "З'єднувач", "Умова (рішення)"],
        correct: 2
    }
];

let fcStep = 0, fcScore = 0;
function renderFlowchart() {
    if (fcStep >= flowchartShapes.length) {
        document.getElementById('flowchart-shape-display').innerHTML = `<p style="font-size:1.3rem;font-weight:800;color:var(--color-primary)">🎉 Завершено! Результат: ${fcScore} / ${flowchartShapes.length}</p>`;
        document.getElementById('flowchart-options').innerHTML = '';
        return;
    }
    const shape = flowchartShapes[fcStep];
    document.getElementById('flowchart-shape-display').innerHTML = `<p>Що це за елемент блок-схеми?</p>${shape.svg}`;
    document.getElementById('btn-next-flowchart').classList.add('hidden');
    const opts = document.getElementById('flowchart-options'); opts.innerHTML = '';
    shape.options.forEach((opt, idx) => {
        const btn = document.createElement('button'); btn.classList.add('quiz-option-btn');
        btn.textContent = opt;
        btn.addEventListener('click', () => {
            opts.querySelectorAll('.quiz-option-btn').forEach(b => b.style.pointerEvents = 'none');
            if (idx === shape.correct) { btn.classList.add('correct-answer'); fcScore++; }
            else { btn.classList.add('wrong-answer'); opts.querySelectorAll('.quiz-option-btn')[shape.correct].classList.add('correct-answer'); }
            document.getElementById('flowchart-score').textContent = `${fcScore} / ${flowchartShapes.length}`;
            document.getElementById('btn-next-flowchart').classList.remove('hidden');
        });
        opts.appendChild(btn);
    });
}
document.getElementById('btn-next-flowchart').addEventListener('click', () => { fcStep++; renderFlowchart(); });
renderFlowchart();

// =============================================
// ГРА 14: ТОПОЛОГІЯ МЕРЕЖІ
// =============================================
const networkTopologies = [
    {
        name: "Зіркова топологія",
        draw: (ctx, w, h) => {
            const cx = w/2, cy = h/2;
            ctx.clearRect(0,0,w,h);
            ctx.fillStyle = '#5a4fcf'; ctx.beginPath(); ctx.arc(cx, cy, 20, 0, Math.PI*2); ctx.fill();
            ctx.fillStyle = '#fff'; ctx.font = 'bold 11px Nunito'; ctx.textAlign = 'center'; ctx.fillText('HUB', cx, cy+4);
            const pts = [[cx,60],[cx+160,cy],[cx,h-60],[cx-160,cy],[cx+110,80],[cx+110,h-80]];
            pts.forEach(([x,y]) => {
                ctx.strokeStyle = '#00bbf9'; ctx.lineWidth = 2; ctx.beginPath(); ctx.moveTo(cx,cy); ctx.lineTo(x,y); ctx.stroke();
                ctx.fillStyle = '#5a4fcf'; ctx.beginPath(); ctx.arc(x,y,14,0,Math.PI*2); ctx.fill();
                ctx.fillStyle = '#fff'; ctx.font = 'bold 10px Nunito'; ctx.fillText('ПК', x, y+4);
            });
        },
        options: ["Зіркова топологія", "Кільцева топологія", "Шинна топологія", "Комірчаста топологія"],
        correct: 0
    },
    {
        name: "Кільцева топологія",
        draw: (ctx, w, h) => {
            ctx.clearRect(0,0,w,h);
            const cx = w/2, cy = h/2, r = 100;
            const nodes = 6;
            const pts = Array.from({length: nodes}, (_, i) => [cx + r*Math.cos((i/nodes)*Math.PI*2 - Math.PI/2), cy + r*Math.sin((i/nodes)*Math.PI*2 - Math.PI/2)]);
            for (let i = 0; i < nodes; i++) {
                ctx.strokeStyle = '#00bbf9'; ctx.lineWidth = 2; ctx.beginPath();
                ctx.moveTo(pts[i][0], pts[i][1]); ctx.lineTo(pts[(i+1)%nodes][0], pts[(i+1)%nodes][1]); ctx.stroke();
            }
            pts.forEach(([x,y]) => {
                ctx.fillStyle = '#5a4fcf'; ctx.beginPath(); ctx.arc(x,y,14,0,Math.PI*2); ctx.fill();
                ctx.fillStyle = '#fff'; ctx.font = 'bold 10px Nunito'; ctx.textAlign='center'; ctx.fillText('ПК', x, y+4);
            });
        },
        options: ["Зіркова топологія", "Кільцева топологія", "Шинна топологія", "Деревоподібна топологія"],
        correct: 1
    },
    {
        name: "Шинна топологія",
        draw: (ctx, w, h) => {
            ctx.clearRect(0,0,w,h);
            const y = h/2;
            ctx.strokeStyle = '#00bbf9'; ctx.lineWidth = 4; ctx.beginPath(); ctx.moveTo(30, y); ctx.lineTo(w-30, y); ctx.stroke();
            const xs = [60, 140, 220, 300, 380, 460];
            xs.forEach(x => {
                ctx.strokeStyle = '#8d99ae'; ctx.lineWidth = 2; ctx.beginPath(); ctx.moveTo(x, y); ctx.lineTo(x, y-60); ctx.stroke();
                ctx.fillStyle = '#5a4fcf'; ctx.beginPath(); ctx.arc(x, y-60, 14, 0, Math.PI*2); ctx.fill();
                ctx.fillStyle = '#fff'; ctx.font = 'bold 10px Nunito'; ctx.textAlign='center'; ctx.fillText('ПК', x, y-56);
            });
            // terminators
            ctx.fillStyle = '#ff595e'; ctx.beginPath(); ctx.arc(30, y, 8, 0, Math.PI*2); ctx.fill();
            ctx.beginPath(); ctx.arc(w-30, y, 8, 0, Math.PI*2); ctx.fill();
        },
        options: ["Зіркова топологія", "Кільцева топологія", "Шинна топологія", "Деревоподібна топологія"],
        correct: 2
    }
];

let netStep = 0, netScore = 0;
function renderNetwork() {
    if (netStep >= networkTopologies.length) {
        const canvas = document.getElementById('network-canvas');
        const ctx = canvas.getContext('2d');
        ctx.clearRect(0,0,canvas.width, canvas.height);
        ctx.font = 'bold 20px Nunito'; ctx.fillStyle = '#5a4fcf'; ctx.textAlign = 'center';
        ctx.fillText(`🎉 Завершено! Результат: ${netScore} / ${networkTopologies.length}`, canvas.width/2, canvas.height/2);
        document.getElementById('network-options').innerHTML = '';
        return;
    }
    const topo = networkTopologies[netStep];
    const canvas = document.getElementById('network-canvas');
    const ctx = canvas.getContext('2d');
    topo.draw(ctx, canvas.width, canvas.height);
    document.getElementById('btn-next-network').classList.add('hidden');
    const opts = document.getElementById('network-options'); opts.innerHTML = '';
    topo.options.forEach((opt, idx) => {
        const btn = document.createElement('button'); btn.classList.add('quiz-option-btn');
        btn.textContent = opt;
        btn.addEventListener('click', () => {
            opts.querySelectorAll('.quiz-option-btn').forEach(b => b.style.pointerEvents = 'none');
            if (idx === topo.correct) { btn.classList.add('correct-answer'); netScore++; }
            else { btn.classList.add('wrong-answer'); opts.querySelectorAll('.quiz-option-btn')[topo.correct].classList.add('correct-answer'); }
            document.getElementById('network-score').textContent = `${netScore} / ${networkTopologies.length}`;
            document.getElementById('btn-next-network').classList.remove('hidden');
        });
        opts.appendChild(btn);
    });
}
document.getElementById('btn-next-network').addEventListener('click', () => { netStep++; renderNetwork(); });
renderNetwork();
// =============================================
// ГРА 17: АНАГРАМА
// =============================================
const anagramWords = [
    { word: 'МОНІТОР', hint: '📺 Пристрій виведення зображення' },
    { word: 'КЛАВІАТУРА', hint: '⌨️ Пристрій введення тексту' },
    { word: 'ПРОЦЕСОР', hint: '🧠 "Мозок" комп\'ютера' },
    { word: 'АЛГОРИТМ', hint: '📋 Послідовність кроків для розв\'язання задачі' },
    { word: 'ІНТЕРНЕТ', hint: '🌐 Глобальна комп\'ютерна мережа' },
    { word: 'ПРОГРАМА', hint: '💻 Набір інструкцій для комп\'ютера' },
    { word: 'ФАЙЛ', hint: '📁 Іменована одиниця зберігання даних' },
    { word: 'СКАНЕР', hint: '🖨️ Пристрій введення для оцифрування документів' }
];

let anagramStep = 0, anagramScore = 0, anagramTotal = 0, anagramHintUsed = false;

function scramble(word) {
    let arr = word.split('');
    for (let i = arr.length - 1; i > 0; i--) {
        const j = Math.floor(Math.random() * (i + 1));
        [arr[i], arr[j]] = [arr[j], arr[i]];
    }
    return arr.join('') === word ? scramble(word) : arr.join('');
}

function renderAnagram() {
    const item = anagramWords[anagramStep % anagramWords.length];
    anagramHintUsed = false;
    document.getElementById('anagram-hint').textContent = `Підказка: ${item.hint}`;
    document.getElementById('anagram-scrambled').textContent = scramble(item.word);
    document.getElementById('anagram-input').value = '';
    document.getElementById('anagram-feedback').classList.add('hidden');
    document.getElementById('btn-next-anagram').classList.add('hidden');
    document.getElementById('btn-check-anagram').classList.remove('hidden');
    document.getElementById('btn-hint-anagram').classList.remove('hidden');
}

document.getElementById('btn-check-anagram').addEventListener('click', () => {
    const input = document.getElementById('anagram-input').value.trim().toUpperCase();
    const correct = anagramWords[anagramStep % anagramWords.length].word;
    const fb = document.getElementById('anagram-feedback');
    anagramTotal++;
    fb.classList.remove('hidden');
    if (input === correct) {
        if (!anagramHintUsed) anagramScore++;
        fb.className = 'anagram-feedback correct';
        fb.textContent = anagramHintUsed ? `✅ Правильно! (без балів — використана підказка)` : '✅ Правильно! 🎉';
    } else {
        fb.className = 'anagram-feedback wrong';
        fb.textContent = `❌ Не вірно. Правильна відповідь: ${correct}`;
    }
    document.getElementById('anagram-score').textContent = `Рахунок: ${anagramScore} / ${anagramTotal}`;
    document.getElementById('btn-next-anagram').classList.remove('hidden');
    document.getElementById('btn-check-anagram').classList.add('hidden');
    document.getElementById('btn-hint-anagram').classList.add('hidden');
});

document.getElementById('btn-hint-anagram').addEventListener('click', () => {
    anagramHintUsed = true;
    const word = anagramWords[anagramStep % anagramWords.length].word;
    document.getElementById('anagram-input').value = word[0];
    document.getElementById('btn-hint-anagram').textContent = `💡 Перша літера: ${word[0]}`;
    document.getElementById('btn-hint-anagram').disabled = true;
});

document.getElementById('btn-next-anagram').addEventListener('click', () => { anagramStep++; renderAnagram(); });
document.getElementById('anagram-input').addEventListener('keypress', e => { if (e.key === 'Enter') document.getElementById('btn-check-anagram').click(); });
renderAnagram();

// =============================================
// ГРА 18: ВГАДАЙ ПО КАРТИНЦІ (emoji icons)
// =============================================
const imageGuessItems = [
    { emoji: '🖨️', answer: 'Принтер', options: ['Принтер', 'Сканер', 'Монітор', 'Модем'], correct: 0, desc: 'Пристрій виведення для друку документів' },
    { emoji: '💿', answer: 'Оптичний диск', options: ['Флеш-пам\'ять', 'Оптичний диск', 'Жорсткий диск', 'Хмарне сховище'], correct: 1, desc: 'CD/DVD — носій інформації у вигляді диску' },
    { emoji: '📡', answer: 'Антена/Роутер', options: ['Мікрофон', 'Камера', 'Антена/Роутер', 'Модем'], correct: 2, desc: 'Пристрій для передачі бездротового сигналу' },
    { emoji: '⌚', answer: 'Смарт-годинник', options: ['Мобільний телефон', 'Планшет', 'Ноутбук', 'Смарт-годинник'], correct: 3, desc: 'Носимий комп\'ютер на зап\'ясті' },
    { emoji: '🖲️', answer: 'Трекбол', options: ['Трекбол', 'Джойстик', 'Тачпад', 'Геймпад'], correct: 0, desc: 'Альтернатива миші — куля, яку крутять пальцем' },
    { emoji: '🎮', answer: 'Ігровий контролер', options: ['Клавіатура', 'Мишка', 'Ігровий контролер', 'Веб-камера'], correct: 2, desc: 'Пристрій введення для відеоігор' },
    { emoji: '🔋', answer: 'Акумулятор', options: ['Блок живлення', 'Акумулятор', 'Конденсатор', 'Процесор'], correct: 1, desc: 'Хімічне джерело живлення для портативних пристроїв' }
];

let guessStep = 0, guessScore = 0;
function renderGuessImage() {
    if (guessStep >= imageGuessItems.length) {
        document.getElementById('guess-image-display').innerHTML = `<span style="font-size:3rem">🎉</span>`;
        document.getElementById('guess-image-options').innerHTML = `<div style="font-size:1.3rem;font-weight:800;color:var(--color-primary);text-align:center">Результат: ${guessScore} / ${imageGuessItems.length}</div>`;
        return;
    }
    const item = imageGuessItems[guessStep];
    document.getElementById('guess-image-display').textContent = item.emoji;
    document.getElementById('guess-image-feedback').classList.add('hidden');
    document.getElementById('btn-next-guess').classList.add('hidden');
    const opts = document.getElementById('guess-image-options'); opts.innerHTML = '';
    item.options.forEach((opt, idx) => {
        const btn = document.createElement('button'); btn.classList.add('quiz-option-btn');
        btn.textContent = opt;
        btn.addEventListener('click', () => {
            opts.querySelectorAll('.quiz-option-btn').forEach(b => b.style.pointerEvents = 'none');
            const fb = document.getElementById('guess-image-feedback'); fb.classList.remove('hidden');
            if (idx === item.correct) { btn.classList.add('correct-answer'); guessScore++; fb.className='guess-image-feedback correct'; fb.textContent=`✅ Правильно! ${item.desc}`; }
            else { btn.classList.add('wrong-answer'); opts.querySelectorAll('.quiz-option-btn')[item.correct].classList.add('correct-answer'); fb.className='guess-image-feedback wrong'; fb.textContent=`❌ Не вірно. Правильно: ${item.answer}. ${item.desc}`; }
            document.getElementById('guess-image-score').textContent = `${guessScore} / ${imageGuessItems.length}`;
            document.getElementById('btn-next-guess').classList.remove('hidden');
        });
        opts.appendChild(btn);
    });
}
document.getElementById('btn-next-guess').addEventListener('click', () => { guessStep++; renderGuessImage(); });
renderGuessImage();

// =============================================
// ГРА 19: ХРОНОЛОГІЯ
// =============================================
const timelineDataSets = [
    {
        items: [
            { text: 'Перший електронний комп\'ютер (ENIAC)', year: 1945 },
            { text: 'Перша комп\'ютерна миша', year: 1964 },
            { text: 'Перша електронна пошта (email)', year: 1971 },
            { text: 'Перший персональний комп\'ютер Apple I', year: 1976 },
            { text: 'Виникнення Всесвітньої павутини (WWW)', year: 1991 },
            { text: 'Перший смартфон iPhone', year: 2007 }
        ]
    }
];

let tlStep = 0, tlScore = 0, tlTotal = 0;
let tlDragSrc = null;

function renderTimeline() {
    const dataset = timelineDataSets[tlStep % timelineDataSets.length];
    const shuffled = [...dataset.items].sort(() => Math.random() - 0.5);
    const slotsEl = document.getElementById('timeline-slots');
    slotsEl.innerHTML = '';
    document.getElementById('timeline-feedback').classList.add('hidden');
    document.getElementById('btn-next-timeline').classList.add('hidden');
    document.getElementById('btn-check-timeline').classList.remove('hidden');

    shuffled.forEach((item) => {
        const el = document.createElement('div');
        el.classList.add('timeline-item');
        el.setAttribute('draggable', 'true');
        el.dataset.year = item.year;
        el.innerHTML = `<span class="timeline-item-year">${item.year}</span><span>${item.text}</span>`;
        el.addEventListener('dragstart', e => { tlDragSrc = el; setTimeout(() => el.style.opacity='0.4', 0); });
        el.addEventListener('dragend', e => el.style.opacity='1');
        el.addEventListener('dragover', e => { e.preventDefault(); el.classList.add('drag-over-tl'); });
        el.addEventListener('dragleave', () => el.classList.remove('drag-over-tl'));
        el.addEventListener('drop', e => {
            e.preventDefault(); el.classList.remove('drag-over-tl');
            if (tlDragSrc !== el) {
                const all = [...slotsEl.querySelectorAll('.timeline-item')];
                const si = all.indexOf(tlDragSrc), ti = all.indexOf(el);
                if (si < ti) slotsEl.insertBefore(tlDragSrc, el.nextSibling);
                else slotsEl.insertBefore(tlDragSrc, el);
            }
        });
        slotsEl.appendChild(el);
    });
}

document.getElementById('btn-check-timeline').addEventListener('click', () => {
    const items = [...document.querySelectorAll('.timeline-item')];
    const years = items.map(i => parseInt(i.dataset.year));
    const sorted = [...years].sort((a,b) => a-b);
    const correct = years.every((y,i) => y === sorted[i]);
    tlTotal++;
    const fb = document.getElementById('timeline-feedback');
    fb.classList.remove('hidden');
    if (correct) {
        tlScore++;
        fb.className = 'timeline-feedback correct';
        fb.textContent = '✅ Правильно! Хронологія вірна!';
    } else {
        fb.className = 'timeline-feedback wrong';
        const ds = timelineDataSets[tlStep % timelineDataSets.length];
        const correctOrder = [...ds.items].sort((a,b) => a.year - b.year).map(i => `${i.year}: ${i.text}`).join('\n');
        fb.textContent = `❌ Не вірно. Правильний порядок:\n${correctOrder}`;
        fb.style.whiteSpace = 'pre-line';
    }
    document.getElementById('timeline-score').textContent = `${tlScore} / ${tlTotal}`;
    document.getElementById('btn-check-timeline').classList.add('hidden');
    document.getElementById('btn-next-timeline').classList.remove('hidden');
});
document.getElementById('btn-next-timeline').addEventListener('click', () => { tlStep++; renderTimeline(); });
renderTimeline();

// =============================================
// ГРА 20: HANGMAN — Вгадай слово
// =============================================
const hangmanWords = [
    { word: 'МОНІТОР', hint: 'Пристрій виведення зображення' },
    { word: 'ПРОЦЕСОР', hint: '"Мозок" комп\'ютера' },
    { word: 'КЛАВІАТУРА', hint: 'Пристрій для введення тексту' },
    { word: 'АЛГОРИТМ', hint: 'Послідовність кроків' },
    { word: 'ПРОГРАМА', hint: 'Набір інструкцій для ПК' },
    { word: 'ІНТЕРНЕТ', hint: 'Глобальна мережа' },
    { word: 'БРАУЗЕР', hint: 'Програма для перегляду сайтів' },
    { word: 'МЕРЕЖА', hint: 'З\'єднані між собою комп\'ютери' },
    { word: 'ВІРУС', hint: 'Шкідлива програма' },
    { word: 'АНТИВІРУС', hint: 'Захист від шкідливих програм' },
    { word: 'ПАРОЛЬ', hint: 'Секретний ключ до акаунту' },
    { word: 'ФІШИНГ', hint: 'Вид інтернет-шахрайства' }
];

const hmParts = ['hm-head','hm-body','hm-larm','hm-rarm','hm-lleg','hm-rleg'];
let hmWord = '', hmGuessed = [], hmWrong = [], hmMaxWrong = 6;

function startHangman() {
    const item = hangmanWords[Math.floor(Math.random() * hangmanWords.length)];
    hmWord = item.word;
    hmGuessed = []; hmWrong = [];
    document.getElementById('hangman-hint').textContent = `💡 Підказка: ${item.hint}`;
    hmParts.forEach(id => { const el = document.getElementById(id); if(el) el.classList.add('hidden'); });
    document.getElementById('hangman-wrong-letters').textContent = '';
    document.getElementById('hangman-status').classList.add('hidden');
    document.getElementById('btn-next-hangman').classList.add('hidden');
    renderHangmanWord();
    renderHangmanKeyboard();
}

function renderHangmanWord() {
    const display = document.getElementById('hangman-word-display');
    display.innerHTML = hmWord.split('').map(ch =>
        `<div class="hangman-letter-slot">${hmGuessed.includes(ch) ? ch : ''}</div>`
    ).join('');
}

function renderHangmanKeyboard() {
    const kb = document.getElementById('hangman-keyboard');
    kb.innerHTML = '';
    const letters = 'АБВГҐДЕЄЖЗИІЇЙКЛМНОПРСТУФХЦЧШЩЬЮЯ'.split('');
    letters.forEach(letter => {
        const btn = document.createElement('button');
        btn.classList.add('hm-key');
        btn.textContent = letter;
        if (hmGuessed.includes(letter)) btn.classList.add('used-correct');
        if (hmWrong.includes(letter)) btn.classList.add('used-wrong');
        btn.addEventListener('click', () => handleHangmanGuess(letter));
        kb.appendChild(btn);
    });
}

function handleHangmanGuess(letter) {
    if (hmGuessed.includes(letter) || hmWrong.includes(letter)) return;
    if (hmWord.includes(letter)) {
        hmGuessed.push(letter);
    } else {
        hmWrong.push(letter);
        const partEl = document.getElementById(hmParts[hmWrong.length - 1]);
        if (partEl) partEl.classList.remove('hidden');
        document.getElementById('hangman-wrong-letters').textContent = hmWrong.join('  ');
    }
    renderHangmanWord();
    renderHangmanKeyboard();
    const won = hmWord.split('').every(ch => hmGuessed.includes(ch));
    const lost = hmWrong.length >= hmMaxWrong;
    if (won || lost) {
        const status = document.getElementById('hangman-status');
        status.classList.remove('hidden', 'won', 'lost');
        if (won) { status.classList.add('won'); status.textContent = `🎉 Ти вгадав! Слово: ${hmWord}`; }
        else { status.classList.add('lost'); status.textContent = `😢 Програш. Слово було: ${hmWord}`; }
        document.getElementById('btn-next-hangman').classList.remove('hidden');
        document.getElementById('hangman-keyboard').querySelectorAll('.hm-key').forEach(b => b.style.pointerEvents = 'none');
    }
}

document.getElementById('btn-next-hangman').addEventListener('click', startHangman);
startHangman();

// =============================================
// ГРА 21: ЕМОДЗІ-КОД
// =============================================
const emojiPuzzles = [
    { emojis: '🌐🔒', answer: 'HTTPS', options: ['HTTP', 'HTTPS', 'FTP', 'DNS'], correct: 1, explanation: '🌐 (інтернет) + 🔒 (захист) = HTTPS — захищений протокол передачі даних' },
    { emojis: '💻🦠', answer: 'Комп\'ютерний вірус', options: ['Антивірус', 'Брандмауер', 'Комп\'ютерний вірус', 'Троян'], correct: 2, explanation: '💻 (комп\'ютер) + 🦠 (хвороба) = комп\'ютерний вірус' },
    { emojis: '🔑🔐', answer: 'Пароль', options: ['Пароль', 'Шифрування', 'Брандмауер', 'Авторизація'], correct: 0, explanation: '🔑 (ключ) + 🔐 (замок) = Пароль — секретний ключ до акаунту' },
    { emojis: '🧠💾', answer: 'RAM (оперативна пам\'ять)', options: ['CPU', 'SSD', 'RAM (оперативна пам\'ять)', 'GPU'], correct: 2, explanation: '🧠 (думки/обробка) + 💾 (пам\'ять) = RAM — оперативна пам\'ять' },
    { emojis: '🎣📧', answer: 'Фішинг', options: ['Спам', 'Фішинг', 'Вірус', 'DDoS-атака'], correct: 1, explanation: '🎣 (риболовля/обман) + 📧 (email) = Фішинг — шахрайство через електронну пошту' },
    { emojis: '☁️💾', answer: 'Хмарне сховище', options: ['Флеш-пам\'ять', 'SSD', 'Хмарне сховище', 'Сервер'], correct: 2, explanation: '☁️ (хмара/хмарні технології) + 💾 (зберігання) = Хмарне сховище' },
    { emojis: '🤖📝', answer: 'Алгоритм', options: ['Програма', 'Алгоритм', 'Скрипт', 'Функція'], correct: 1, explanation: '🤖 (автоматизація) + 📝 (інструкції) = Алгоритм — послідовність кроків' },
    { emojis: '📡🔗💻', answer: 'Комп\'ютерна мережа', options: ['Інтернет-провайдер', 'Wi-Fi', 'Комп\'ютерна мережа', 'Bluetooth'], correct: 2, explanation: '📡 (сигнал) + 🔗 (з\'єднання) + 💻 (комп\'ютер) = Комп\'ютерна мережа' }
];

let emojiStep = 0, emojiScore = 0;
function renderEmoji() {
    if (emojiStep >= emojiPuzzles.length) {
        document.getElementById('emoji-display').textContent = '🎉';
        document.getElementById('emoji-options').innerHTML = `<div style="font-size:1.3rem;font-weight:800;color:var(--color-primary);text-align:center">Завершено! Результат: ${emojiScore} / ${emojiPuzzles.length}</div>`;
        return;
    }
    const puzzle = emojiPuzzles[emojiStep];
    document.getElementById('emoji-display').textContent = puzzle.emojis;
    document.getElementById('emoji-feedback').classList.add('hidden');
    document.getElementById('btn-next-emoji').classList.add('hidden');
    const opts = document.getElementById('emoji-options'); opts.innerHTML = '';
    puzzle.options.forEach((opt, idx) => {
        const btn = document.createElement('button'); btn.classList.add('quiz-option-btn');
        btn.textContent = opt;
        btn.addEventListener('click', () => {
            opts.querySelectorAll('.quiz-option-btn').forEach(b => b.style.pointerEvents = 'none');
            const fb = document.getElementById('emoji-feedback'); fb.classList.remove('hidden');
            if (idx === puzzle.correct) { btn.classList.add('correct-answer'); emojiScore++; fb.className='emoji-feedback correct'; fb.textContent=`✅ ${puzzle.explanation}`; }
            else { btn.classList.add('wrong-answer'); opts.querySelectorAll('.quiz-option-btn')[puzzle.correct].classList.add('correct-answer'); fb.className='emoji-feedback wrong'; fb.textContent=`❌ Не вірно. ${puzzle.explanation}`; }
            document.getElementById('emoji-score').textContent = `${emojiScore} / ${emojiPuzzles.length}`;
            document.getElementById('btn-next-emoji').classList.remove('hidden');
        });
        opts.appendChild(btn);
    });
}
document.getElementById('btn-next-emoji').addEventListener('click', () => { emojiStep++; renderEmoji(); });
renderEmoji();

// =============================================
// ГРА 22: WHACK-A-VIRUS
// =============================================
const whackItems = [
    { emoji: '🦠', isVirus: true, name: 'Вірус' },
    { emoji: '💀', isVirus: true, name: 'Шкідник' },
    { emoji: '👾', isVirus: true, name: 'Зловред' },
    { emoji: '🔓', isVirus: true, name: 'Зломщик' },
    { emoji: '📁', isVirus: false, name: 'Файл' },
    { emoji: '📄', isVirus: false, name: 'Документ' },
    { emoji: '🛡️', isVirus: false, name: 'Антивірус' },
    { emoji: '💡', isVirus: false, name: 'Підказка' }
];

const WHACK_COLS = 4, WHACK_ROWS = 3, WHACK_HOLES = WHACK_COLS * WHACK_ROWS;
let whackScore = 0, whackMisses = 0, whackTimeLeft = 30;
let whackTimer = null, whackActive = false;
let whackHoles = [];
let whackShowTimers = [];

function buildWhackGrid() {
    const grid = document.getElementById('whack-grid');
    grid.style.gridTemplateColumns = `repeat(${WHACK_COLS}, 1fr)`;
    grid.innerHTML = '';
    whackHoles = [];
    for (let i = 0; i < WHACK_HOLES; i++) {
        const hole = document.createElement('div'); hole.classList.add('whack-hole');
        const item = document.createElement('div'); item.classList.add('whack-item');
        hole.appendChild(item); grid.appendChild(hole);
        whackHoles.push({ hole, item, occupied: false, isVirus: false });
    }
}

function showRandomItem() {
    if (!whackActive) return;
    const free = whackHoles.filter(h => !h.occupied);
    if (free.length === 0) return;
    const hole = free[Math.floor(Math.random() * free.length)];
    const itemData = whackItems[Math.floor(Math.random() * whackItems.length)];
    hole.occupied = true; hole.isVirus = itemData.isVirus;
    hole.item.textContent = itemData.emoji;
    hole.item.classList.add('visible');
    hole.item.onclick = () => {
        if (!hole.occupied) return;
        if (itemData.isVirus) {
            whackScore++;
            document.getElementById('whack-score').textContent = whackScore;
            hole.item.classList.add('hit');
        } else {
            whackMisses++;
            document.getElementById('whack-misses').textContent = whackMisses;
            hole.hole.style.background = '#5a0000';
            setTimeout(() => hole.hole.style.background = '', 300);
        }
        hideWhackItem(hole);
    };
    const t = setTimeout(() => hideWhackItem(hole), 1200 + Math.random() * 600);
    whackShowTimers.push(t);
}

function hideWhackItem(hole) {
    hole.item.classList.remove('visible', 'hit');
    hole.occupied = false; hole.isVirus = false;
    hole.item.onclick = null;
}

function startWhack() {
    whackScore = 0; whackMisses = 0; whackTimeLeft = 30; whackActive = true;
    document.getElementById('whack-score').textContent = 0;
    document.getElementById('whack-misses').textContent = 0;
    document.getElementById('whack-time').textContent = 30;
    document.getElementById('whack-result').classList.add('hidden');
    document.getElementById('btn-start-whack').disabled = true;
    buildWhackGrid();
    whackTimer = setInterval(() => {
        whackTimeLeft--;
        document.getElementById('whack-time').textContent = whackTimeLeft;
        if (whackTimeLeft <= 0) endWhack();
        else if (Math.random() < 0.7) showRandomItem();
    }, 800);
}

function endWhack() {
    clearInterval(whackTimer);
    whackShowTimers.forEach(clearTimeout);
    whackActive = false;
    document.getElementById('btn-start-whack').disabled = false;
    const res = document.getElementById('whack-result');
    res.classList.remove('hidden');
    res.textContent = `🎮 Гра завершена! Рахунок: ${whackScore} вірусів знищено, ${whackMisses} помилок. ${whackScore >= 15 ? '🏆 Відмінно!' : whackScore >= 8 ? '👍 Непогано!' : '💪 Тренуйся далі!'}`;
}

document.getElementById('btn-start-whack').addEventListener('click', startWhack);
buildWhackGrid();

// =============================================
// ГРА 23: З'ЄДНАЙ ТЕРМІНИ
// =============================================
const matchSets = [
    [
        { left: 'Процесор (CPU)', right: 'Виконує обчислення' },
        { left: 'Оперативна пам\'ять', right: 'Тимчасово зберігає дані' },
        { left: 'Жорсткий диск', right: 'Постійне зберігання' },
        { left: 'Відеокарта (GPU)', right: 'Обробляє графіку' },
        { left: 'Материнська плата', right: 'З\'єднує всі компоненти' }
    ],
    [
        { left: 'Браузер', right: 'Програма для сайтів' },
        { left: 'Фішинг', right: 'Крадіжка даних через обман' },
        { left: 'Брандмауер', right: 'Захист мережі' },
        { left: 'VPN', right: 'Шифрований тунель' },
        { left: 'Шифрування', right: 'Кодування інформації' }
    ],
    [
        { left: 'Алгоритм', right: 'Покрокова інструкція' },
        { left: 'Цикл', right: 'Повторення команд' },
        { left: 'Умова (if)', right: 'Вибір напрямку' },
        { left: 'Змінна', right: 'Контейнер для даних' },
        { left: 'Функція', right: 'Блок коду з ім\'ям' }
    ]
];

let matchSetIdx = 0, matchScore = 0, matchTotal = 0;
let matchSelectedLeft = null, matchSelectedRight = null;

function initMatch() {
    matchSetIdx = matchSetIdx % matchSets.length;
    const set = matchSets[matchSetIdx];
    const leftCol = document.getElementById('match-left');
    const rightCol = document.getElementById('match-right');
    leftCol.innerHTML = ''; rightCol.innerHTML = '';
    document.getElementById('match-feedback').classList.add('hidden');
    matchSelectedLeft = null; matchSelectedRight = null;

    const shuffledRight = [...set].sort(() => Math.random() - 0.5);

    set.forEach(pair => {
        const lEl = document.createElement('div');
        lEl.classList.add('match-item');
        lEl.textContent = pair.left;
        lEl.dataset.key = pair.left;
        lEl.addEventListener('click', () => handleMatchClick(lEl, 'left'));
        leftCol.appendChild(lEl);
    });

    shuffledRight.forEach(pair => {
        const rEl = document.createElement('div');
        rEl.classList.add('match-item');
        rEl.textContent = pair.right;
        rEl.dataset.key = pair.left;
        rEl.addEventListener('click', () => handleMatchClick(rEl, 'right'));
        rightCol.appendChild(rEl);
    });
}

function handleMatchClick(el, side) {
    if (el.classList.contains('matched-ok')) return;
    if (side === 'left') {
        document.querySelectorAll('#match-left .match-item').forEach(i => i.classList.remove('selected'));
        el.classList.add('selected');
        matchSelectedLeft = el;
    } else {
        document.querySelectorAll('#match-right .match-item').forEach(i => i.classList.remove('selected'));
        el.classList.add('selected');
        matchSelectedRight = el;
    }
    if (matchSelectedLeft && matchSelectedRight) {
        matchTotal++;
        const fb = document.getElementById('match-feedback');
        if (matchSelectedLeft.dataset.key === matchSelectedRight.dataset.key) {
            matchSelectedLeft.classList.remove('selected'); matchSelectedLeft.classList.add('matched-ok');
            matchSelectedRight.classList.remove('selected'); matchSelectedRight.classList.add('matched-ok');
            matchSelectedLeft.style.pointerEvents = 'none'; matchSelectedRight.style.pointerEvents = 'none';
            matchScore++;
            fb.className = 'match-feedback correct'; fb.textContent = '✅ Вірно!'; fb.classList.remove('hidden');
        } else {
            matchSelectedLeft.classList.remove('selected'); matchSelectedLeft.classList.add('matched-fail');
            matchSelectedRight.classList.remove('selected'); matchSelectedRight.classList.add('matched-fail');
            fb.className = 'match-feedback wrong'; fb.textContent = '❌ Не вірно! Спробуй ще.'; fb.classList.remove('hidden');
            setTimeout(() => {
                matchSelectedLeft.classList.remove('matched-fail');
                matchSelectedRight.classList.remove('matched-fail');
                fb.classList.add('hidden');
            }, 1200);
        }
        document.getElementById('match-score').textContent = `${matchScore} / ${matchTotal}`;
        matchSelectedLeft = null; matchSelectedRight = null;

        const allMatched = [...document.querySelectorAll('.match-item')].every(i => !i.classList.contains('matched-fail') && (i.classList.contains('matched-ok') || true));
        const leftItems = document.querySelectorAll('#match-left .match-item');
        if ([...leftItems].every(i => i.classList.contains('matched-ok'))) {
            setTimeout(() => { matchSetIdx++; initMatch(); }, 1500);
        }
    }
}

document.getElementById('btn-restart-match').addEventListener('click', () => { matchSetIdx = 0; matchScore = 0; matchTotal = 0; initMatch(); document.getElementById('match-score').textContent = '0 / 0'; });
initMatch();

// =============================================
// ГРА 24: HEX-КОЛЬОРИ
// =============================================
const hexQuestions = [
    { hex: '#FF0000', name: 'Червоний', options: ['#FF0000', '#00FF00', '#0000FF', '#FFFF00'], correct: 0, mode: 'hex' },
    { hex: '#00FF00', name: 'Зелений', options: ['#FF0000', '#00FF00', '#00FFFF', '#FF00FF'], correct: 1, mode: 'hex' },
    { hex: '#0000FF', name: 'Синій', options: ['#FF8800', '#FFFF00', '#0000FF', '#8800FF'], correct: 2, mode: 'hex' },
    { hex: '#FFFF00', name: 'Жовтий', options: ['Синій', 'Зелений', 'Жовтий', 'Червоний'], correct: 2, mode: 'name' },
    { hex: '#FF00FF', name: 'Пурпурний', options: ['Оранжевий', 'Пурпурний', 'Білий', 'Бірюзовий'], correct: 1, mode: 'name' },
    { hex: '#00FFFF', name: 'Бірюзовий', options: ['#FF0000', '#00FFFF', '#FFFF00', '#FF00FF'], correct: 1, mode: 'hex' },
    { hex: '#FF8800', name: 'Оранжевий', options: ['Оранжевий', 'Рожевий', 'Коричневий', 'Фіолетовий'], correct: 0, mode: 'name' },
    { hex: '#8800FF', name: 'Фіолетовий', options: ['#00FF00', '#FF8800', '#8800FF', '#0000FF'], correct: 2, mode: 'hex' }
];
let hexStep = 0, hexScore = 0;
function renderHex() {
    if (hexStep >= hexQuestions.length) {
        document.getElementById('hex-color-box').style.background = '#f0eeff';
        document.getElementById('hex-question').innerHTML = `<span style="color:var(--color-primary)">🎉 Завершено! ${hexScore} / ${hexQuestions.length}</span>`;
        document.getElementById('hex-options').innerHTML = '';
        return;
    }
    const q = hexQuestions[hexStep];
    document.getElementById('hex-color-box').style.background = q.hex;
    document.getElementById('hex-question').textContent = q.mode === 'hex' ? `Який HEX-код відповідає цьому кольору?` : `Як називається цей колір?`;
    document.getElementById('hex-feedback').classList.add('hidden');
    document.getElementById('btn-next-hex').classList.add('hidden');
    const opts = document.getElementById('hex-options'); opts.innerHTML = '';
    q.options.forEach((opt, idx) => {
        const btn = document.createElement('button'); btn.classList.add('quiz-option-btn');
        btn.textContent = opt;
        btn.addEventListener('click', () => {
            opts.querySelectorAll('.quiz-option-btn').forEach(b => b.style.pointerEvents = 'none');
            const fb = document.getElementById('hex-feedback'); fb.classList.remove('hidden');
            if (idx === q.correct) { btn.classList.add('correct-answer'); hexScore++; fb.className = 'hex-feedback correct'; fb.textContent = `✅ Правильно! ${q.name} = ${q.hex}`; }
            else { btn.classList.add('wrong-answer'); opts.querySelectorAll('.quiz-option-btn')[q.correct].classList.add('correct-answer'); fb.className = 'hex-feedback wrong'; fb.textContent = `❌ Не вірно. ${q.name} = ${q.hex}`; }
            document.getElementById('hex-score').textContent = `${hexScore} / ${hexQuestions.length}`;
            document.getElementById('btn-next-hex').classList.remove('hidden');
        });
        opts.appendChild(btn);
    });
}
document.getElementById('btn-next-hex').addEventListener('click', () => { hexStep++; renderHex(); });
renderHex();

// =============================================
// ГРА 25: ТИПИ ПАМ'ЯТІ
// =============================================
const storageItems = [
    { id: 'st-ram', name: '💾 RAM', category: 'volatile' },
    { id: 'st-cache', name: '⚡ Кеш CPU', category: 'volatile' },
    { id: 'st-ssd', name: '💿 SSD', category: 'nonvolatile' },
    { id: 'st-hdd', name: '🖴 HDD', category: 'nonvolatile' },
    { id: 'st-usb', name: '🔌 USB-флешка', category: 'nonvolatile' },
    { id: 'st-cloud', name: '☁️ Хмарне сховище', category: 'cloud' },
    { id: 'st-gdrive', name: '📁 Google Drive', category: 'cloud' },
    { id: 'st-dvd', name: '📀 DVD-диск', category: 'nonvolatile' }
];
const storageCategories = [
    { id: 'volatile', name: '⚡ Оперативна (RAM)', desc: 'Губиться при вимкненні' },
    { id: 'nonvolatile', name: '💾 Постійна (ROM/SSD)', desc: 'Зберігається після вимкнення' },
    { id: 'cloud', name: '☁️ Хмарна', desc: 'В інтернеті' }
];

function initStorageGame() {
    const pool = document.getElementById('storage-pool');
    const zones = document.getElementById('storage-zones');
    pool.innerHTML = ''; zones.innerHTML = '';
    [...storageItems].sort(() => Math.random() - 0.5).forEach(item => {
        const el = document.createElement('div'); el.classList.add('storage-item', 'draggable-item');
        el.setAttribute('draggable', 'true'); el.id = item.id;
        el.setAttribute('data-category', item.category);
        el.textContent = item.name;
        el.addEventListener('dragstart', e => { e.dataTransfer.setData('text/plain', e.target.id); setTimeout(() => { e.target.style.opacity = '0.4'; }, 0); });
        el.addEventListener('dragend', e => { e.target.style.opacity = '1'; });
        pool.appendChild(el);
    });
    storageCategories.forEach(cat => {
        const zone = document.createElement('div'); zone.classList.add('storage-zone');
        zone.innerHTML = `<h3>${cat.name}<br><small style="font-weight:600;opacity:0.7">${cat.desc}</small></h3>`;
        const dropArea = document.createElement('div'); dropArea.classList.add('storage-drop-area');
        dropArea.setAttribute('data-category', cat.id);
        dropArea.addEventListener('dragover', e => { e.preventDefault(); dropArea.classList.add('drag-over'); });
        dropArea.addEventListener('dragleave', () => dropArea.classList.remove('drag-over'));
        dropArea.addEventListener('drop', e => {
            e.preventDefault(); dropArea.classList.remove('drag-over');
            const id = e.dataTransfer.getData('text/plain');
            const el = document.getElementById(id);
            if (el.getAttribute('data-category') === cat.id) {
                dropArea.appendChild(el); el.setAttribute('draggable', 'false');
                el.style.cursor = 'default'; el.style.borderColor = 'var(--color-success)'; el.style.background = '#e0fff8';
            } else {
                el.style.transform = 'translateX(10px)';
                setTimeout(() => el.style.transform = 'translateX(-10px)', 100);
                setTimeout(() => el.style.transform = '', 200);
            }
        });
        zone.appendChild(dropArea); zones.appendChild(zone);
    });
}
document.getElementById('btn-restart-storage').addEventListener('click', initStorageGame);
initStorageGame();

// =============================================
// ГРА 26: ГАРЯЧІ КЛАВІШІ
// =============================================
const shortcutQuestions = [
    { keys: ['Ctrl', 'C'], action: 'Копіювати', options: ['Вирізати', 'Вставити', 'Копіювати', 'Зберегти'], correct: 2 },
    { keys: ['Ctrl', 'V'], action: 'Вставити', options: ['Вставити', 'Копіювати', 'Скасувати', 'Виділити все'], correct: 0 },
    { keys: ['Ctrl', 'Z'], action: 'Скасувати дію', options: ['Зберегти', 'Закрити', 'Скасувати дію', 'Повторити'], correct: 2 },
    { keys: ['Ctrl', 'S'], action: 'Зберегти файл', options: ['Виділити все', 'Зберегти файл', 'Надрукувати', 'Копіювати'], correct: 1 },
    { keys: ['Ctrl', 'A'], action: 'Виділити все', options: ['Відкрити файл', 'Виділити все', 'Закрити вкладку', 'Знайти'], correct: 1 },
    { keys: ['Alt', 'F4'], action: 'Закрити вікно', options: ['Перезавантажити', 'Закрити вікно', 'Зберегти', 'Переключити вікно'], correct: 1 },
    { keys: ['Ctrl', 'F'], action: 'Пошук по сторінці', options: ['Оновити сторінку', 'Відкрити нову вкладку', 'Пошук по сторінці', 'Зберегти сторінку'], correct: 2 },
    { keys: ['Ctrl', 'Shift', 'Esc'], action: 'Диспетчер завдань', options: ['Диспетчер завдань', 'Екранна клавіатура', 'Перезапуск', 'Вихід з системи'], correct: 0 }
];
let scStep = 0, scScore = 0;
function renderShortcut() {
    if (scStep >= shortcutQuestions.length) {
        document.getElementById('shortcut-display').innerHTML = `<span style="color:var(--color-primary);font-size:1.3rem;font-weight:800">🎉 Завершено! ${scScore} / ${shortcutQuestions.length}</span>`;
        document.getElementById('shortcut-options').innerHTML = ''; return;
    }
    const q = shortcutQuestions[scStep];
    const disp = document.getElementById('shortcut-display'); disp.innerHTML = '';
    q.keys.forEach((k, i) => {
        const badge = document.createElement('div'); badge.classList.add('key-badge'); badge.textContent = k;
        disp.appendChild(badge);
        if (i < q.keys.length - 1) { const plus = document.createElement('span'); plus.classList.add('key-plus'); plus.textContent = '+'; disp.appendChild(plus); }
    });
    document.getElementById('shortcut-feedback').classList.add('hidden');
    document.getElementById('btn-next-shortcut').classList.add('hidden');
    const opts = document.getElementById('shortcut-options'); opts.innerHTML = '';
    q.options.forEach((opt, idx) => {
        const btn = document.createElement('button'); btn.classList.add('quiz-option-btn'); btn.textContent = opt;
        btn.addEventListener('click', () => {
            opts.querySelectorAll('.quiz-option-btn').forEach(b => b.style.pointerEvents = 'none');
            const fb = document.getElementById('shortcut-feedback'); fb.classList.remove('hidden');
            if (idx === q.correct) { btn.classList.add('correct-answer'); scScore++; fb.className = 'shortcut-feedback correct'; fb.textContent = `✅ Правильно! ${q.keys.join('+')} = ${q.action}`; }
            else { btn.classList.add('wrong-answer'); opts.querySelectorAll('.quiz-option-btn')[q.correct].classList.add('correct-answer'); fb.className = 'shortcut-feedback wrong'; fb.textContent = `❌ Не вірно. ${q.keys.join('+')} = ${q.action}`; }
            document.getElementById('shortcut-score').textContent = `${scScore} / ${shortcutQuestions.length}`;
            document.getElementById('btn-next-shortcut').classList.remove('hidden');
        });
        opts.appendChild(btn);
    });
}
document.getElementById('btn-next-shortcut').addEventListener('click', () => { scStep++; renderShortcut(); });
renderShortcut();

// =============================================
// ГРА 27: РОЗ'ЄМИ ТА ПОРТИ
// =============================================
const portQuestions = [
    { emoji: '🔵', desc: 'Прямокутний роз\'єм для передачі даних та зарядки, версія 3.0', name: 'USB-A', options: ['HDMI', 'USB-A', 'DisplayPort', 'VGA'], correct: 1 },
    { emoji: '📺', desc: 'Цифровий інтерфейс для відео та аудіо, використовується для підключення телевізорів та моніторів', name: 'HDMI', options: ['VGA', 'DVI', 'HDMI', 'USB-C'], correct: 2 },
    { emoji: '🔌', desc: 'Овальний роз\'єм нового покоління, підтримує зарядку та відео, обернений (симетричний)', name: 'USB-C', options: ['Thunderbolt', 'USB-C', 'MicroUSB', 'Lightning'], correct: 1 },
    { emoji: '🟡', desc: '8-контактний роз\'єм для підключення до мережі (LAN/Ethernet)', name: 'RJ-45', options: ['RJ-11', 'RJ-45', 'BNC', 'Coaxial'], correct: 1 },
    { emoji: '🎧', desc: 'Круглий 3.5 мм роз\'єм для навушників та мікрофона', name: '3.5 мм Audio Jack', options: ['Optical Audio', '3.5 мм Audio Jack', 'XLR', 'RCA'], correct: 1 },
    { emoji: '⚡', desc: 'Швидкісний інтерфейс Apple, підтримує до 40 Гб/с, часто з блискавкою', name: 'Thunderbolt', options: ['USB 3.0', 'Thunderbolt', 'FireWire', 'eSATA'], correct: 1 }
];
let portStep = 0, portScore = 0;
function renderPorts() {
    if (portStep >= portQuestions.length) {
        document.getElementById('ports-image').textContent = '🎉';
        document.getElementById('ports-question').innerHTML = `<span style="color:var(--color-primary)">Завершено! ${portScore} / ${portQuestions.length}</span>`;
        document.getElementById('ports-options').innerHTML = ''; return;
    }
    const q = portQuestions[portStep];
    document.getElementById('ports-image').textContent = q.emoji;
    document.getElementById('ports-question').textContent = q.desc;
    document.getElementById('ports-feedback').classList.add('hidden');
    document.getElementById('btn-next-ports').classList.add('hidden');
    const opts = document.getElementById('ports-options'); opts.innerHTML = '';
    q.options.forEach((opt, idx) => {
        const btn = document.createElement('button'); btn.classList.add('quiz-option-btn'); btn.textContent = opt;
        btn.addEventListener('click', () => {
            opts.querySelectorAll('.quiz-option-btn').forEach(b => b.style.pointerEvents = 'none');
            const fb = document.getElementById('ports-feedback'); fb.classList.remove('hidden');
            if (idx === q.correct) { btn.classList.add('correct-answer'); portScore++; fb.className = 'ports-feedback correct'; fb.textContent = `✅ Правильно! Це ${q.name}`; }
            else { btn.classList.add('wrong-answer'); opts.querySelectorAll('.quiz-option-btn')[q.correct].classList.add('correct-answer'); fb.className = 'ports-feedback wrong'; fb.textContent = `❌ Не вірно. Це ${q.name}`; }
            document.getElementById('ports-score').textContent = `${portScore} / ${portQuestions.length}`;
            document.getElementById('btn-next-ports').classList.remove('hidden');
        });
        opts.appendChild(btn);
    });
}
document.getElementById('btn-next-ports').addEventListener('click', () => { portStep++; renderPorts(); });
renderPorts();

// =============================================
// ГРА 28: СОРТУЙ ЗАГРОЗИ
// =============================================
const threatItems = [
    { id: 'th1', name: '🦠 Trojan Horse', category: 'malware' },
    { id: 'th2', name: '📧 Фішинговий лист', category: 'social' },
    { id: 'th3', name: '💣 Ransomware', category: 'malware' },
    { id: 'th4', name: '📱 Смішинг (SMS)', category: 'social' },
    { id: 'th5', name: '🌊 DDoS-атака', category: 'network' },
    { id: 'th6', name: '👤 Man-in-the-Middle', category: 'network' },
    { id: 'th7', name: '😈 Соціальна інженерія', category: 'social' },
    { id: 'th8', name: '🔑 Кейлогер', category: 'malware' }
];
const threatCategories = [
    { id: 'malware', name: '🦠 Шкідливе ПЗ' },
    { id: 'social', name: '🎭 Соціальна інженерія' },
    { id: 'network', name: '🌐 Мережеві атаки' }
];
function initThreatGame() {
    const pool = document.getElementById('threat-pool');
    const zones = document.getElementById('threat-zones');
    pool.innerHTML = ''; zones.innerHTML = '';
    [...threatItems].sort(() => Math.random() - 0.5).forEach(item => {
        const el = document.createElement('div'); el.classList.add('threat-item');
        el.setAttribute('draggable', 'true'); el.id = item.id;
        el.setAttribute('data-category', item.category); el.textContent = item.name;
        el.addEventListener('dragstart', e => { e.dataTransfer.setData('text/plain', e.target.id); setTimeout(() => { e.target.style.opacity = '0.4'; }, 0); });
        el.addEventListener('dragend', e => { e.target.style.opacity = '1'; });
        pool.appendChild(el);
    });
    threatCategories.forEach(cat => {
        const zone = document.createElement('div'); zone.classList.add('threat-zone');
        zone.innerHTML = `<h3>${cat.name}</h3>`;
        const dropArea = document.createElement('div'); dropArea.classList.add('threat-drop-area');
        dropArea.setAttribute('data-category', cat.id);
        dropArea.addEventListener('dragover', e => { e.preventDefault(); dropArea.classList.add('drag-over'); });
        dropArea.addEventListener('dragleave', () => dropArea.classList.remove('drag-over'));
        dropArea.addEventListener('drop', e => {
            e.preventDefault(); dropArea.classList.remove('drag-over');
            const id = e.dataTransfer.getData('text/plain');
            const el = document.getElementById(id);
            if (el.getAttribute('data-category') === cat.id) {
                dropArea.appendChild(el); el.setAttribute('draggable', 'false');
                el.style.cursor = 'default'; el.style.borderColor = 'var(--color-success)'; el.style.background = '#e0fff8';
            } else {
                el.style.transform = 'translateX(8px)'; setTimeout(() => el.style.transform = 'translateX(-8px)', 100); setTimeout(() => el.style.transform = '', 200);
            }
        });
        zone.appendChild(dropArea); zones.appendChild(zone);
    });
}
document.getElementById('btn-restart-threat').addEventListener('click', initThreatGame);
initThreatGame();

// =============================================
// ГРА 29: ПРИВАТНІСТЬ ОНЛАЙН
// =============================================
const privacyItems = [
    { item: '📸 Фото домашнього улюбленця', safe: true, explanation: '✅ Можна! Фото тварин без геолокації та адреси безпечні для публікації.' },
    { item: '📍 Точна домашня адреса', safe: false, explanation: '🚫 Не варто! Домашня адреса — особиста інформація, яку можуть використати зловмисники.' },
    { item: '📞 Номер мобільного телефону', safe: false, explanation: '🚫 Не варто! Номер телефону може використовуватися для спаму, шахрайства або смішингу.' },
    { item: '🎂 Повна дата народження (день, місяць, рік)', safe: false, explanation: '🚫 Не варто! Повна дата народження може бути використана для крадіжки особистості.' },
    { item: '✏️ Улюблений предмет у школі', safe: true, explanation: '✅ Можна! Загальна інформація про вподобання не розкриває особистих даних.' },
    { item: '🏫 Повна назва та адреса школи', safe: false, explanation: '🚫 Не варто! Місцезнаходження школи може допомогти незнайомцям знайти тебе.' },
    { item: '🎮 Улюблена гра', safe: true, explanation: '✅ Можна! Ділитися хобі та вподобаннями — цілком нормально.' },
    { item: '🔑 Пароль від акаунту', safe: false, explanation: '🚫 Ніколи! Паролі — суто особиста інформація. Нікому не повідомляй їх онлайн!' }
];
let privStep = 0, privScore = 0;
function renderPrivacy() {
    if (privStep >= privacyItems.length) {
        document.getElementById('privacy-item').innerHTML = `<span style="color:var(--color-primary)">🎉 Завершено! ${privScore} / ${privacyItems.length}</span>`;
        document.getElementById('privacy-item').style.padding = '2rem';
        document.querySelectorAll('.privacy-btn').forEach(b => b.style.display = 'none'); return;
    }
    const sc = privacyItems[privStep];
    document.getElementById('privacy-item').textContent = sc.item;
    document.getElementById('privacy-explanation').classList.add('hidden');
    document.getElementById('btn-next-privacy').classList.add('hidden');
    document.getElementById('btn-pub-safe').disabled = false;
    document.getElementById('btn-pub-danger').disabled = false;
}
function handlePrivacy(userSaysSafe) {
    const sc = privacyItems[privStep];
    const correct = userSaysSafe === sc.safe;
    if (correct) privScore++;
    const expl = document.getElementById('privacy-explanation');
    expl.textContent = sc.explanation; expl.classList.remove('hidden');
    expl.className = `privacy-explanation ${correct ? 'correct' : 'wrong'}`;
    document.getElementById('privacy-score').textContent = `${privScore} / ${privacyItems.length}`;
    document.getElementById('btn-next-privacy').classList.remove('hidden');
    document.getElementById('btn-pub-safe').disabled = true;
    document.getElementById('btn-pub-danger').disabled = true;
}
document.getElementById('btn-pub-safe').addEventListener('click', () => handlePrivacy(true));
document.getElementById('btn-pub-danger').addEventListener('click', () => handlePrivacy(false));
document.getElementById('btn-next-privacy').addEventListener('click', () => { privStep++; renderPrivacy(); });
renderPrivacy();

// =============================================
// ГРА 30: ВИПРАВ ПАРОЛЬ
// =============================================
const fixPassQuestions = [
    { password: 'password', question: 'Що додати, щоб зробити пароль надійнішим?', options: ['Замінити на "password1"', 'Додати великі літери та символи → "P@ssw0rd!"', 'Зробити коротшим', 'Нічого, пароль і так добрий'], correct: 1, explanation: 'Пароль "password" — один з найненадійніших. Велика літера, цифра та спецсимвол значно підвищують безпеку.' },
    { password: 'ivan2010', question: 'Яка головна проблема цього пароля?', options: ['Занадто довгий', 'Містить особисті дані (ім\'я та рік)', 'Занадто складний', 'Не містить цифр'], correct: 1, explanation: 'Пароль з іменем та роком народження легко вгадати. Уникай особистих даних у паролях!' },
    { password: '12345678', question: 'Який варіант заміни найнадійніший?', options: ['123456789', 'qwertyui', 'Tr0ub4dor&3', '11111111'], correct: 2, explanation: 'Tr0ub4dor&3 має великі та малі літери, цифри та спецсимвол — це надійний пароль!' },
    { password: 'school', question: 'Чому цей пароль небезпечний?', options: ['Занадто довгий', 'Лише малі літери та словникове слово', 'Є цифри', 'Занадто складний'], correct: 1, explanation: 'Словникові слова легко підбираються автоматично. Використовуй комбінацію різних символів.' },
    { password: 'abc123', question: 'Що потрібно додати насамперед?', options: ['Ще цифр: "abc123456"', 'Спецсимволи та великі літери: "Abc!@3"', 'Замінити букви на такі ж', 'Зробити все малими літерами'], correct: 1, explanation: 'Спецсимволи (!@#$) та великі літери суттєво ускладнюють підбір пароля.' }
];
let fpStep = 0, fpScore = 0;
function renderFixPass() {
    if (fpStep >= fixPassQuestions.length) {
        document.getElementById('fix-pass-question').textContent = '🎉 Завершено!';
        document.getElementById('fix-pass-question').style.color = 'var(--color-success)';
        document.getElementById('fix-pass-options').innerHTML = `<div style="text-align:center;font-size:1.3rem;font-weight:800;color:var(--color-primary)">Результат: ${fpScore} / ${fixPassQuestions.length}</div>`; return;
    }
    const q = fixPassQuestions[fpStep];
    document.getElementById('fix-pass-question').textContent = q.password;
    document.getElementById('fix-pass-question').style.color = '';
    document.getElementById('fix-pass-feedback').classList.add('hidden');
    document.getElementById('btn-next-fix-pass').classList.add('hidden');
    const opts = document.getElementById('fix-pass-options'); opts.innerHTML = '';
    const questionLabel = document.createElement('div');
    questionLabel.style.cssText = 'margin-bottom:1rem;font-weight:700;font-size:1rem;color:var(--color-text-muted);';
    questionLabel.textContent = q.question; opts.appendChild(questionLabel);
    q.options.forEach((opt, idx) => {
        const btn = document.createElement('button'); btn.classList.add('quiz-option-btn'); btn.textContent = opt;
        btn.addEventListener('click', () => {
            opts.querySelectorAll('.quiz-option-btn').forEach(b => b.style.pointerEvents = 'none');
            const fb = document.getElementById('fix-pass-feedback'); fb.classList.remove('hidden');
            if (idx === q.correct) { btn.classList.add('correct-answer'); fpScore++; fb.className = 'fix-pass-feedback correct'; fb.textContent = `✅ ${q.explanation}`; }
            else { btn.classList.add('wrong-answer'); opts.querySelectorAll('.quiz-option-btn')[q.correct].classList.add('correct-answer'); fb.className = 'fix-pass-feedback wrong'; fb.textContent = `❌ ${q.explanation}`; }
            document.getElementById('fix-pass-score').textContent = `${fpScore} / ${fixPassQuestions.length}`;
            document.getElementById('btn-next-fix-pass').classList.remove('hidden');
        });
        opts.appendChild(btn);
    });
}
document.getElementById('btn-next-fix-pass').addEventListener('click', () => { fpStep++; renderFixPass(); });
renderFixPass();

// =============================================
// ГРА 31: ЗНАЙДИ ПОМИЛКУ (DEBUG)
// =============================================
const debugChallenges = [
    {
        task: 'Алгоритм повинен вивести числа від 1 до 5. Знайди рядок з помилкою:',
        lines: ['початок', 'i = 1', 'поки i <= 5:', '    вивести i', '    i = i - 1', 'кінець'],
        bugLine: 4,
        explanation: 'Рядок 5: "i = i - 1" — лічильник зменшується, а не збільшується. Має бути "i = i + 1".'
    },
    {
        task: 'Програма перевіряє чи число парне. Знайди помилку:',
        lines: ['початок', 'ввести число N', 'якщо N / 2 = 0:', '    вивести "Парне"', 'інакше:', '    вивести "Непарне"', 'кінець'],
        bugLine: 2,
        explanation: 'Рядок 3: для перевірки парності треба N mod 2 = 0 (залишок від ділення), а не N / 2 = 0.'
    },
    {
        task: 'Алгоритм знаходить максимум з двох чисел A і B. Знайди помилку:',
        lines: ['початок', 'ввести A, B', 'якщо A < B:', '    вивести "Максимум: A"', 'інакше:', '    вивести "Максимум: B"', 'кінець'],
        bugLine: 2,
        explanation: 'Рядок 3: умова "A < B" неправильна. Якщо A менше B, то максимум — B, а не A. Треба "A > B".'
    },
    {
        task: 'Цикл виводить 5 зірочок. Знайди помилку:',
        lines: ['початок', 'i = 0', 'поки i < 5:', '    вивести "*"', '    i = i + 1', 'вивести "Готово"', 'кінець'],
        bugLine: -1,
        explanation: '✅ Цей код правильний! Всі рядки коректні. Ітерація від 0 до 4 дає рівно 5 повторень.'
    }
];
let debugStep = 0, debugScore = 0;
let debugSelectedLine = null;
function renderDebug() {
    if (debugStep >= debugChallenges.length) {
        document.getElementById('debug-task').innerHTML = `<span style="color:var(--color-primary)">🎉 Завершено! ${debugScore} / ${debugChallenges.length}</span>`;
        document.getElementById('debug-code').innerHTML = ''; return;
    }
    const ch = debugChallenges[debugStep];
    document.getElementById('debug-task').textContent = ch.task;
    document.getElementById('debug-feedback').classList.add('hidden');
    document.getElementById('btn-next-debug').classList.add('hidden');
    debugSelectedLine = null;
    const codeEl = document.getElementById('debug-code'); codeEl.innerHTML = '';
    ch.lines.forEach((line, idx) => {
        const lineEl = document.createElement('div'); lineEl.classList.add('debug-line');
        lineEl.innerHTML = `<span class="debug-line-num">${idx + 1}</span><span>${line}</span>`;
        lineEl.dataset.lineIdx = idx;
        lineEl.addEventListener('click', () => {
            if (lineEl.classList.contains('correct-line') || lineEl.classList.contains('wrong-line')) return;
            document.querySelectorAll('.debug-line').forEach(l => l.classList.remove('selected'));
            lineEl.classList.add('selected');
            debugSelectedLine = idx;

            const fb = document.getElementById('debug-feedback'); fb.classList.remove('hidden');
            document.querySelectorAll('.debug-line').forEach(l => l.style.pointerEvents = 'none');

            if (ch.bugLine === -1) {
                fb.className = 'debug-feedback correct';
                fb.textContent = `✅ Правильно! ${ch.explanation}`;
                debugScore++;
            } else if (idx === ch.bugLine) {
                lineEl.classList.remove('selected'); lineEl.classList.add('correct-line');
                fb.className = 'debug-feedback correct'; fb.textContent = `✅ Знайшов! ${ch.explanation}`;
                debugScore++;
            } else {
                lineEl.classList.remove('selected'); lineEl.classList.add('wrong-line');
                if (ch.bugLine >= 0) document.querySelectorAll('.debug-line')[ch.bugLine].classList.add('correct-line');
                fb.className = 'debug-feedback wrong'; fb.textContent = `❌ Не вірно. ${ch.explanation}`;
            }
            document.getElementById('debug-score').textContent = `${debugScore} / ${debugChallenges.length}`;
            document.getElementById('btn-next-debug').classList.remove('hidden');
        });
        codeEl.appendChild(lineEl);
    });
    if (ch.bugLine === -1) {
        const noBtn = document.createElement('button'); noBtn.classList.add('secondary-btn');
        noBtn.textContent = '✅ Помилок немає'; noBtn.style.display = 'block'; noBtn.style.margin = '1rem auto';
        noBtn.addEventListener('click', () => {
            const fb = document.getElementById('debug-feedback'); fb.classList.remove('hidden');
            document.querySelectorAll('.debug-line').forEach(l => l.style.pointerEvents = 'none');
            noBtn.style.display = 'none';
            fb.className = 'debug-feedback correct'; fb.textContent = `✅ Правильно! ${ch.explanation}`;
            debugScore++; document.getElementById('debug-score').textContent = `${debugScore} / ${debugChallenges.length}`;
            document.getElementById('btn-next-debug').classList.remove('hidden');
        });
        codeEl.appendChild(noBtn);
    }
}
document.getElementById('btn-next-debug').addEventListener('click', () => { debugStep++; renderDebug(); });
renderDebug();

// =============================================
// ГРА 32: АЛГОРИТМ СОРТУВАННЯ
// =============================================
const sortvisQuestions = [
    { array: [5, 3, 8, 1, 4], highlight: [0, 1], question: 'Бульбашкове сортування: порівнюємо 5 і 3. Що далі?', options: ['Міняємо 5 і 3 місцями', 'Залишаємо як є', 'Видаляємо 5', 'Переносимо 3 в кінець'], correct: 0, explanation: '5 > 3, тому міняємо місцями. Результат: [3, 5, 8, 1, 4]' },
    { array: [3, 5, 8, 1, 4], highlight: [1, 2], question: 'Порівнюємо 5 і 8. Що далі?', options: ['Міняємо 5 і 8 місцями', 'Залишаємо як є — 5 < 8', 'Видаляємо 8', 'Починаємо спочатку'], correct: 1, explanation: '5 < 8, тому нічого не міняємо. Пара вже в правильному порядку.' },
    { array: [3, 5, 8, 1, 4], highlight: [2, 3], question: 'Порівнюємо 8 і 1. Що далі?', options: ['Залишаємо як є', 'Міняємо 8 і 1 місцями', 'Видаляємо 1', 'Сортування завершено'], correct: 1, explanation: '8 > 1, тому міняємо місцями. Результат: [3, 5, 1, 8, 4]' },
    { array: [3, 1, 5, 4, 8], highlight: [0, 1], question: 'Новий прохід. Порівнюємо 3 і 1. Що далі?', options: ['Залишаємо як є', 'Міняємо 3 і 1 місцями', 'Починаємо з початку масиву', 'Сортування завершено'], correct: 1, explanation: '3 > 1, тому міняємо. Великі елементи "спливають" у кінець.' }
];
let svStep = 0, svScore = 0;
const barColors = ['#5a4fcf','#00bbf9','#fee440','#ff595e','#00f5d4'];
function renderSortVis() {
    if (svStep >= sortvisQuestions.length) {
        document.getElementById('sortvis-question').innerHTML = `<span style="color:var(--color-primary)">🎉 Завершено! ${svScore} / ${sortvisQuestions.length}</span>`;
        document.getElementById('sortvis-options').innerHTML = ''; return;
    }
    const q = sortvisQuestions[svStep];
    const arrEl = document.getElementById('sortvis-array'); arrEl.innerHTML = '';
    const maxVal = Math.max(...q.array);
    q.array.forEach((val, idx) => {
        const bar = document.createElement('div'); bar.classList.add('sortvis-bar');
        if (q.highlight.includes(idx)) bar.classList.add('highlight');
        bar.style.height = `${(val / maxVal) * 120 + 20}px`;
        bar.style.background = barColors[idx % barColors.length];
        bar.textContent = val;
        arrEl.appendChild(bar);
    });
    document.getElementById('sortvis-question').textContent = q.question;
    document.getElementById('sortvis-feedback').classList.add('hidden');
    document.getElementById('btn-next-sortvis').classList.add('hidden');
    const opts = document.getElementById('sortvis-options'); opts.innerHTML = '';
    q.options.forEach((opt, idx) => {
        const btn = document.createElement('button'); btn.classList.add('quiz-option-btn'); btn.textContent = opt;
        btn.addEventListener('click', () => {
            opts.querySelectorAll('.quiz-option-btn').forEach(b => b.style.pointerEvents = 'none');
            const fb = document.getElementById('sortvis-feedback'); fb.classList.remove('hidden');
            if (idx === q.correct) { btn.classList.add('correct-answer'); svScore++; fb.className = 'sortvis-feedback correct'; fb.textContent = `✅ ${q.explanation}`; }
            else { btn.classList.add('wrong-answer'); opts.querySelectorAll('.quiz-option-btn')[q.correct].classList.add('correct-answer'); fb.className = 'sortvis-feedback wrong'; fb.textContent = `❌ ${q.explanation}`; }
            document.getElementById('sortvis-score').textContent = `${svScore} / ${sortvisQuestions.length}`;
            document.getElementById('btn-next-sortvis').classList.remove('hidden');
        });
        opts.appendChild(btn);
    });
}
document.getElementById('btn-next-sortvis').addEventListener('click', () => { svStep++; renderSortVis(); });
renderSortVis();

// =============================================
// ГРА 33: ЛОГІЧНІ ВЕНТИЛІ
// =============================================
const logicGateQuestions = [
    { gate: 'AND', a: 1, b: 1, result: 1, explanation: 'AND: 1 лише якщо обидва входи = 1' },
    { gate: 'AND', a: 1, b: 0, result: 0, explanation: 'AND: 0 якщо хоч один вхід = 0' },
    { gate: 'OR', a: 0, b: 1, result: 1, explanation: 'OR: 1 якщо хоч один вхід = 1' },
    { gate: 'OR', a: 0, b: 0, result: 0, explanation: 'OR: 0 лише якщо обидва входи = 0' },
    { gate: 'NOT', a: 1, b: null, result: 0, explanation: 'NOT: інвертує вхід. NOT(1) = 0' },
    { gate: 'NOT', a: 0, b: null, result: 1, explanation: 'NOT: інвертує вхід. NOT(0) = 1' },
    { gate: 'XOR', a: 1, b: 1, result: 0, explanation: 'XOR (виключне АБО): 1 лише якщо входи різні. 1 XOR 1 = 0' },
    { gate: 'XOR', a: 1, b: 0, result: 1, explanation: 'XOR: входи різні (1 і 0), тому результат = 1' }
];
let lgStep = 0, lgScore = 0;
function renderLogicGate() {
    if (lgStep >= logicGateQuestions.length) {
        document.getElementById('logic-gate-display').innerHTML = `<div style="font-size:1.3rem;font-weight:800;color:var(--color-primary)">🎉 ${lgScore} / ${logicGateQuestions.length}</div>`;
        document.getElementById('logic-question').innerHTML = 'Завершено!';
        document.getElementById('logic-options').innerHTML = ''; return;
    }
    const q = logicGateQuestions[lgStep];
    const disp = document.getElementById('logic-gate-display');
    if (q.b !== null) {
        disp.innerHTML = `<div class="logic-inputs"><div class="logic-input-val">${q.a}</div><div class="logic-input-val">${q.b}</div></div><div class="logic-gate-symbol">${q.gate}</div><div class="logic-output-mark">→ ?</div>`;
    } else {
        disp.innerHTML = `<div class="logic-inputs"><div class="logic-input-val">${q.a}</div></div><div class="logic-gate-symbol">${q.gate}</div><div class="logic-output-mark">→ ?</div>`;
    }
    document.getElementById('logic-question').textContent = q.b !== null ? `Що дає ${q.gate}(${q.a}, ${q.b})?` : `Що дає ${q.gate}(${q.a})?`;
    document.getElementById('logic-feedback').classList.add('hidden');
    document.getElementById('btn-next-logic').classList.add('hidden');
    const opts = document.getElementById('logic-options'); opts.innerHTML = '';
    [0, 1].forEach(val => {
        const btn = document.createElement('button'); btn.classList.add('quiz-option-btn'); btn.textContent = `Результат = ${val}`;
        btn.style.fontSize = '1.2rem'; btn.style.textAlign = 'center';
        btn.addEventListener('click', () => {
            opts.querySelectorAll('.quiz-option-btn').forEach(b => b.style.pointerEvents = 'none');
            const fb = document.getElementById('logic-feedback'); fb.classList.remove('hidden');
            if (val === q.result) { btn.classList.add('correct-answer'); lgScore++; fb.className = 'logic-feedback correct'; fb.textContent = `✅ ${q.explanation}`; }
            else { btn.classList.add('wrong-answer'); opts.querySelectorAll('.quiz-option-btn')[q.result].classList.add('correct-answer'); fb.className = 'logic-feedback wrong'; fb.textContent = `❌ ${q.explanation}`; }
            document.getElementById('logic-score').textContent = `${lgScore} / ${logicGateQuestions.length}`;
            document.getElementById('btn-next-logic').classList.remove('hidden');
        });
        opts.appendChild(btn);
    });
}
document.getElementById('btn-next-logic').addEventListener('click', () => { lgStep++; renderLogicGate(); });
renderLogicGate();

// =============================================
// ГРА 34: ТИПИ ЗМІННИХ
// =============================================
const varQuestions = [
    { code: 'x = 42', highlight: '42', question: 'Який тип має значення 42?', options: ['Рядок (String)', 'Ціле число (Integer)', 'Дійсне число (Float)', 'Булеве (Boolean)'], correct: 1, explanation: '42 — ціле число (Integer). Немає дробової частини.' },
    { code: 'name = "Андрій"', highlight: '"Андрій"', question: 'Який тип має "Андрій"?', options: ['Ціле число', 'Рядок (String)', 'Символ (Char)', 'Список'], correct: 1, explanation: 'Текст у лапках — це рядок (String).' },
    { code: 'price = 3.14', highlight: '3.14', question: 'Який тип має 3.14?', options: ['Integer', 'Boolean', 'Float (дійсне число)', 'String'], correct: 2, explanation: '3.14 — дійсне число з плаваючою точкою (Float).' },
    { code: 'isOnline = True', highlight: 'True', question: 'Який тип має True?', options: ['String', 'Integer', 'Float', 'Boolean (булеве)'], correct: 3, explanation: 'True/False — булеві (Boolean) значення, лише два стани.' },
    { code: 'colors = ["red","green","blue"]', highlight: '["red","green","blue"]', question: 'Який тип має цей набір значень?', options: ['Рядок', 'Ціле число', 'Список (List)', 'Float'], correct: 2, explanation: 'Квадратні дужки — це список (List), упорядкована колекція значень.' },
    { code: 'ch = "A"', highlight: '"A"', question: 'Який тип має "A" (одна буква у лапках)?', options: ['Boolean', 'String / Char', 'Integer', 'Float'], correct: 1, explanation: 'Одна буква у лапках — це символ (Char), який в більшості мов є підвидом String.' }
];
let varStep = 0, varScore = 0;
function renderVars() {
    if (varStep >= varQuestions.length) {
        document.getElementById('vars-code').innerHTML = `<span style="color:var(--color-success);font-size:1.2rem">🎉 Завершено! ${varScore} / ${varQuestions.length}</span>`;
        document.getElementById('vars-options').innerHTML = ''; return;
    }
    const q = varQuestions[varStep];
    const highlighted = q.code.replace(q.highlight, `<span class="vars-highlight">${q.highlight}</span>`);
    document.getElementById('vars-code').innerHTML = highlighted;
    document.getElementById('vars-feedback').classList.add('hidden');
    document.getElementById('btn-next-vars').classList.add('hidden');
    const opts = document.getElementById('vars-options'); opts.innerHTML = '';
    const qlabel = document.createElement('div');
    qlabel.style.cssText = 'font-weight:700;font-size:1rem;margin-bottom:1rem;color:var(--color-text-muted);';
    qlabel.textContent = q.question; opts.appendChild(qlabel);
    q.options.forEach((opt, idx) => {
        const btn = document.createElement('button'); btn.classList.add('quiz-option-btn'); btn.textContent = opt;
        btn.addEventListener('click', () => {
            opts.querySelectorAll('.quiz-option-btn').forEach(b => b.style.pointerEvents = 'none');
            const fb = document.getElementById('vars-feedback'); fb.classList.remove('hidden');
            if (idx === q.correct) { btn.classList.add('correct-answer'); varScore++; fb.className = 'vars-feedback correct'; fb.textContent = `✅ ${q.explanation}`; }
            else { btn.classList.add('wrong-answer'); opts.querySelectorAll('.quiz-option-btn')[q.correct].classList.add('correct-answer'); fb.className = 'vars-feedback wrong'; fb.textContent = `❌ ${q.explanation}`; }
            document.getElementById('vars-score').textContent = `${varScore} / ${varQuestions.length}`;
            document.getElementById('btn-next-vars').classList.remove('hidden');
        });
        opts.appendChild(btn);
    });
}
document.getElementById('btn-next-vars').addEventListener('click', () => { varStep++; renderVars(); });
renderVars();

// =============================================
// ГРА 35: ІНТЕРНЕТ-АБЕТКА
// =============================================
const iabcQuestions = [
    { abbr: 'URL', options: ['Universal Resource Link', 'Uniform Resource Locator', 'Unique Routing Label', 'Universal Read Layer'], correct: 1, explanation: 'URL — адреса ресурсу в інтернеті (наприклад: https://google.com)' },
    { abbr: 'HTML', options: ['HyperText Markup Language', 'High Transfer Mode Link', 'Hyper Terminal Media Language', 'Home Tool Main Line'], correct: 0, explanation: 'HTML — мова розмітки для створення веб-сторінок' },
    { abbr: 'IP', options: ['Internet Protocol', 'Internal Port', 'Interface Path', 'Index Page'], correct: 0, explanation: 'IP (Internet Protocol) — унікальна адреса пристрою в мережі' },
    { abbr: 'DNS', options: ['Digital Node System', 'Domain Name System', 'Data Network Service', 'Direct Node Search'], correct: 1, explanation: 'DNS перетворює доменні імена (google.com) на IP-адреси' },
    { abbr: 'HTTP', options: ['HyperText Transfer Protocol', 'High Traffic Tunnel Path', 'Home Transfer Terminal Port', 'Hybrid Text Tool Protocol'], correct: 0, explanation: 'HTTP — протокол передачі даних між браузером і сервером' },
    { abbr: 'ISP', options: ['Internal Server Port', 'Internet Service Provider', 'Integrated System Protocol', 'Indexed Shared Page'], correct: 1, explanation: 'ISP — інтернет-провайдер, компанія що надає доступ до інтернету' },
    { abbr: 'SSL', options: ['System Security Layer', 'Secure Sockets Layer', 'Shared Storage Link', 'Simple Script Language'], correct: 1, explanation: 'SSL шифрує дані між браузером і сервером (забезпечує HTTPS)' },
    { abbr: 'FTP', options: ['File Transfer Protocol', 'Fast Tunnel Path', 'Forward Traffic Port', 'Fixed Terminal Protocol'], correct: 0, explanation: 'FTP — протокол для передачі файлів між комп\'ютерами' }
];
let iabcStep = 0, iabcScore = 0;
function renderIabc() {
    if (iabcStep >= iabcQuestions.length) {
        document.getElementById('iabc-abbr').textContent = '🎉';
        document.getElementById('iabc-options').innerHTML = `<div style="text-align:center;font-size:1.3rem;font-weight:800;color:var(--color-primary)">Завершено! ${iabcScore} / ${iabcQuestions.length}</div>`; return;
    }
    const q = iabcQuestions[iabcStep];
    document.getElementById('iabc-abbr').textContent = q.abbr;
    document.getElementById('iabc-feedback').classList.add('hidden');
    document.getElementById('btn-next-iabc').classList.add('hidden');
    const opts = document.getElementById('iabc-options'); opts.innerHTML = '';
    q.options.forEach((opt, idx) => {
        const btn = document.createElement('button'); btn.classList.add('quiz-option-btn'); btn.textContent = opt;
        btn.addEventListener('click', () => {
            opts.querySelectorAll('.quiz-option-btn').forEach(b => b.style.pointerEvents = 'none');
            const fb = document.getElementById('iabc-feedback'); fb.classList.remove('hidden');
            if (idx === q.correct) { btn.classList.add('correct-answer'); iabcScore++; fb.className = 'iabc-feedback correct'; fb.textContent = `✅ ${q.explanation}`; }
            else { btn.classList.add('wrong-answer'); opts.querySelectorAll('.quiz-option-btn')[q.correct].classList.add('correct-answer'); fb.className = 'iabc-feedback wrong'; fb.textContent = `❌ ${q.explanation}`; }
            document.getElementById('iabc-score').textContent = `${iabcScore} / ${iabcQuestions.length}`;
            document.getElementById('btn-next-iabc').classList.remove('hidden');
        });
        opts.appendChild(btn);
    });
}
document.getElementById('btn-next-iabc').addEventListener('click', () => { iabcStep++; renderIabc(); });
renderIabc();

// =============================================
// ГРА 36: РОЗШИФРУЙ ПОСЛАННЯ (Шифр Цезаря)
// =============================================
const decodePuzzles = [
    { word: 'БРАУЗЕР', shift: 3, hint: 'Програма для перегляду веб-сайтів' },
    { word: 'ВІРУС', shift: 2, hint: 'Шкідлива програма' },
    { word: 'ПАРОЛЬ', shift: 4, hint: 'Секретний ключ до акаунту' },
    { word: 'МОНІТОР', shift: 1, hint: 'Пристрій виведення зображення' },
    { word: 'АЛГОРИТМ', shift: 3, hint: 'Послідовність кроків для розв\'язання задачі' },
    { word: 'ПРОЦЕСОР', shift: 2, hint: 'Мозок комп\'ютера' }
];
const ukAlphabet = 'АБВГҐДЕЄЖЗИІЇЙКЛМНОПРСТУФХЦЧШЩЬЮЯ';

function caesarShift(text, shift) {
    return text.split('').map(ch => {
        const idx = ukAlphabet.indexOf(ch);
        if (idx === -1) return ch;
        return ukAlphabet[(idx + shift) % ukAlphabet.length];
    }).join('');
}

let decodeStep = 0, decodeScore = 0, decodeHintUsed = false;
function renderDecode() {
    if (decodeStep >= decodePuzzles.length) {
        document.getElementById('decode-encrypted').textContent = '🎉';
        document.getElementById('decode-cipher-hint').textContent = `Завершено! Результат: ${decodeScore} / ${decodePuzzles.length}`;
        document.getElementById('decode-input').classList.add('hidden');
        document.querySelectorAll('.decode-btn-row button').forEach(b => b.classList.add('hidden')); return;
    }
    const p = decodePuzzles[decodeStep];
    decodeHintUsed = false;
    const encrypted = caesarShift(p.word, p.shift);
    document.getElementById('decode-encrypted').textContent = encrypted;
    document.getElementById('decode-cipher-hint').textContent = `💡 Підказка до теми: ${p.hint} | Зсув: ${p.shift}`;
    document.getElementById('decode-input').value = '';
    document.getElementById('decode-input').classList.remove('hidden');
    document.getElementById('decode-feedback').classList.add('hidden');
    document.getElementById('btn-next-decode').classList.add('hidden');
    document.getElementById('btn-check-decode').classList.remove('hidden');
    document.getElementById('btn-hint-decode').classList.remove('hidden');
    document.getElementById('decode-score').textContent = `${decodeScore} / ${decodePuzzles.length}`;
}
document.getElementById('btn-check-decode').addEventListener('click', () => {
    const p = decodePuzzles[decodeStep];
    const answer = document.getElementById('decode-input').value.trim().toUpperCase();
    const fb = document.getElementById('decode-feedback'); fb.classList.remove('hidden');
    if (answer === p.word) {
        fb.className = 'decode-feedback correct'; fb.textContent = `✅ Правильно! Слово: ${p.word}`;
        if (!decodeHintUsed) decodeScore++;
        document.getElementById('decode-score').textContent = `${decodeScore} / ${decodePuzzles.length}`;
        document.getElementById('btn-next-decode').classList.remove('hidden');
        document.getElementById('btn-check-decode').classList.add('hidden');
        document.getElementById('btn-hint-decode').classList.add('hidden');
    } else {
        fb.className = 'decode-feedback wrong'; fb.textContent = `❌ Не вірно. Спробуй ще!`;
    }
});
document.getElementById('btn-hint-decode').addEventListener('click', () => {
    const p = decodePuzzles[decodeStep];
    decodeHintUsed = true;
    document.getElementById('decode-cipher-hint').textContent = `💡 Перша літера слова: ${p.word[0]}`;
});
document.getElementById('btn-next-decode').addEventListener('click', () => { decodeStep++; renderDecode(); });
renderDecode();

// =============================================
// ГРА 37: ПІКСЕЛЬ-АРТ
// =============================================
const pixelPatterns = [
    {
        grid: 5,
        pattern: [[0,1,1,1,0],[1,0,0,0,1],[1,1,1,1,1],[1,0,0,0,1],[1,0,0,0,1]],
        label: 'Буква "А"'
    },
    {
        grid: 5,
        pattern: [[1,1,1,1,0],[1,0,0,0,1],[1,1,1,1,0],[1,0,0,0,1],[1,1,1,1,0]],
        label: 'Буква "В"'
    },
    {
        grid: 5,
        pattern: [[0,1,1,1,0],[1,0,0,0,1],[1,0,0,0,0],[1,0,0,0,1],[0,1,1,1,0]],
        label: 'Буква "С" (C)'
    }
];
let pixelStep = 0, pixelScore = 0;
let pixelState = [];
function renderPixelArt() {
    if (pixelStep >= pixelPatterns.length) {
        document.getElementById('pixel-binary-code').textContent = '🎉 Завершено!';
        document.getElementById('pixel-grid').innerHTML = `<div style="font-size:1.3rem;font-weight:800;color:var(--color-primary);padding:2rem">Результат: ${pixelScore} / ${pixelPatterns.length}</div>`;
        document.getElementById('btn-check-pixel').classList.add('hidden'); return;
    }
    const pat = pixelPatterns[pixelStep];
    const size = pat.grid;
    pixelState = Array.from({ length: size }, () => Array(size).fill(0));
    const binCode = pat.pattern.map(row => row.join(' ')).join('\n');
    document.getElementById('pixel-binary-code').textContent = binCode;
    document.getElementById('pixel-feedback').classList.add('hidden');
    document.getElementById('btn-next-pixel').classList.add('hidden');
    document.getElementById('btn-check-pixel').classList.remove('hidden');
    const grid = document.getElementById('pixel-grid');
    grid.innerHTML = '';
    grid.style.gridTemplateColumns = `repeat(${size}, 42px)`;
    for (let r = 0; r < size; r++) {
        for (let c = 0; c < size; c++) {
            const cell = document.createElement('div'); cell.classList.add('pixel-cell');
            cell.dataset.r = r; cell.dataset.c = c;
            cell.addEventListener('click', () => {
                pixelState[r][c] = pixelState[r][c] ? 0 : 1;
                cell.classList.toggle('filled', pixelState[r][c] === 1);
            });
            grid.appendChild(cell);
        }
    }
    document.getElementById('pixel-score').textContent = `${pixelScore} / ${pixelPatterns.length}`;
}
document.getElementById('btn-check-pixel').addEventListener('click', () => {
    const pat = pixelPatterns[pixelStep];
    let allCorrect = true;
    pat.pattern.forEach((row, r) => row.forEach((val, c) => { if (pixelState[r][c] !== val) allCorrect = false; }));
    const fb = document.getElementById('pixel-feedback'); fb.classList.remove('hidden');
    if (allCorrect) {
        pixelScore++;
        fb.className = 'pixel-feedback correct'; fb.textContent = `✅ Правильно! Це ${pat.label}`;
    } else {
        fb.className = 'pixel-feedback wrong'; fb.textContent = `❌ Не зовсім. Перевір малюнок ще раз або натисни "Далі".`;
        // Show correct
        document.querySelectorAll('.pixel-cell').forEach(cell => {
            const r = +cell.dataset.r, c = +cell.dataset.c;
            cell.classList.toggle('filled', pat.pattern[r][c] === 1);
        });
    }
    document.getElementById('pixel-score').textContent = `${pixelScore} / ${pixelPatterns.length}`;
    document.getElementById('btn-next-pixel').classList.remove('hidden');
    document.getElementById('btn-check-pixel').classList.add('hidden');
    document.querySelectorAll('.pixel-cell').forEach(c => c.style.pointerEvents = 'none');
});
document.getElementById('btn-next-pixel').addEventListener('click', () => { pixelStep++; renderPixelArt(); });
renderPixelArt();

}); // end DOMContentLoaded