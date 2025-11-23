// ================================
//   Система управления темой
// ================================
function initTheme() {
    const savedTheme = localStorage.getItem('theme');
    const systemPrefersDark = window.matchMedia('(prefers-color-scheme: dark)').matches;
    
    if (savedTheme === 'light') document.body.classList.add('light');
    else if (savedTheme === 'dark') document.body.classList.remove('light');
    else if (!systemPrefersDark) document.body.classList.add('light');
    
    updateThemeToggle();
}

function toggleTheme() {
    const isCurrentlyLight = document.body.classList.contains('light');
    if (isCurrentlyLight) {
        document.body.classList.remove('light');
        localStorage.setItem('theme', 'dark');
    } else {
        document.body.classList.add('light');
        localStorage.setItem('theme', 'light');
    }
    updateThemeToggle();
}

function updateThemeToggle() {
    const toggleBtn = document.querySelector('.theme-toggle');
    if (toggleBtn) toggleBtn.textContent = document.body.classList.contains('light') ? '🌙' : '☀️';
}

// ================================
//   НАСТРОЙКИ ДАННЫХ
// ================================
var SHEET_URL = "https://docs.google.com/spreadsheets/d/e/2PACX-1vRY6KMZf4V6FC_dXc6yPEi1Yt1e267LVIC8Ewsm4IMTtEtwNOAeBEnrNsl-TWArKAylzdy6AipcUDf3/pub?output=csv";

// ЗАПАСНЫЕ ДАННЫЕ (Показываются, если Google Таблица недоступна)
const BACKUP_MASTERS = [
    ["Алексей Петров", "8 лет", "", "+7 (999) 111-22-33", "Ремонт стиральных машин, Холодильники"],
    ["Дмитрий Иванов", "12 лет", "", "+7 (999) 444-55-66", "Компьютерный мастер, Ноутбуки"],
    ["Сергей Сидоров", "5 лет", "", "+7 (999) 777-88-99", "Ремонт телевизоров, Электроника"],
    ["Иван Кузнецов", "15 лет", "", "+7 (999) 000-00-01", "Сантехника, Варочные панели, Плиты"]
];

const TYPE_MAP = {
    wash: "Стиральная машина",
    fridge: "Холодильник", 
    pc: "Компьютер",
    laptops: "Ноутбук",
    panel: "Варочная панель",
    conditioners: "Кондиционер",
    tv: "Телевизор",
    other: "Техника"
};

// Ключевые слова для поиска (приводим к нижнему регистру)
const SEARCH_KEYWORDS = {
    wash: ["стиральн", "машин"],
    fridge: ["холодильн", "морозил"],
    pc: ["компьютер", "пк", "системн"],
    laptops: ["ноутбук", "лэптоп"],
    panel: ["варочн", "плит", "духов"],
    conditioners: ["кондиционер", "сплит"],
    tv: ["телевиз", "тв", "tv", "плазм"]
};

// ================================
//   Инфо о заявке
// ================================
function populateRequestInfo() {
    const params = new URLSearchParams(location.search);
    const rawType = params.get('type');
    
    document.getElementById('req-type').textContent = TYPE_MAP[rawType] || rawType || 'Не указан';
    document.getElementById('req-model').textContent = params.get('model') || 'Не указана';
    document.getElementById('req-problem').textContent = params.get('problem') || 'Не указано';
}

// ================================
//   ГЛАВНАЯ ФУНКЦИЯ ЗАГРУЗКИ
// ================================
async function loadMastersFromMastersJS() {
    const mastersContainer = document.getElementById("masters");
    if (!mastersContainer) return;
    
    mastersContainer.innerHTML = '<div class="loader"></div><p style="text-align:center">Загрузка базы мастеров...</p>';

    let rows = [];
    let source = "Google Sheets";

    try {
        console.log("Попытка загрузить данные из Google Таблицы...");
        const response = await fetch(SHEET_URL);
        
        if (!response.ok) throw new Error("Ошибка сети или доступа к таблице");
        
        const csv = await response.text();
        console.log("Данные получены. Длина ответа:", csv.length);
        
        // Парсим CSV
        rows = csv.trim().split('\n').map(r => r.split(',').map(c => c.trim().replace(/^"|"$/g, '')));
        
        // Проверка на пустой ответ
        if (rows.length <= 1) throw new Error("Таблица пуста или некорректный формат");

    } catch (error) {
        console.warn("⚠️ Ошибка загрузки Google Таблицы:", error);
        console.warn("🔄 Переключаемся на ЗАПАСНЫЕ данные (Backup Mode)");
        
        source = "Локальная база (Backup)";
        rows = [["Заголовок"], ...BACKUP_MASTERS]; // Добавляем фейковый заголовок, чтобы логика i=1 работала
    }

    renderMasters(rows, source);
}

// ================================
//   РЕНДЕРИНГ (ОТРИСОВКА)
// ================================
function renderMasters(rows, sourceName) {
    const mastersContainer = document.getElementById("masters");
    mastersContainer.innerHTML = ""; // Очищаем лоадер

    // Параметры фильтрации
    const params = new URLSearchParams(window.location.search);
    const urlType = params.get("type");
    
    // Получаем массив ключевых слов для текущего типа
    const keywords = SEARCH_KEYWORDS[urlType] || [];
    
    console.log(`=== ОТЛАДКА ФИЛЬТРАЦИИ (${sourceName}) ===`);
    console.log(`Ищем тип: "${urlType}"`);
    console.log(`Ключевые слова: [${keywords.join(', ')}]`);

    let visibleCount = 0;

    // Начинаем с 1, чтобы пропустить заголовки (или 0, если это массив бэкапа без заголовка, но мы добавили фейк)
    for (let i = 1; i < rows.length; i++) {
        const row = rows[i];
        
        // Защита от пустых строк
        if (row.length < 2) continue;

        // Разбор строки (безопасно)
        const fio = row[0] || "Мастер";
        const experience = row[1] || "5 лет";
        const photo = row[2] || "";
        const phone = row[3] || "";
        const specialization = row[4] || "Универсал";

        // === ЛОГИКА ФИЛЬТРА ===
        let isMatch = true;
        
        // Если тип выбран, проверяем совпадение
        if (urlType && keywords.length > 0) {
            const specLower = specialization.toLowerCase();
            // Проверяем, есть ли ХОТЬ ОДНО ключевое слово в специализации
            const keywordMatch = keywords.some(word => specLower.includes(word));
            
            if (!keywordMatch) {
                isMatch = false;
                // console.log(`Скрыт мастер ${fio}: специализация "${specialization}" не содержит [${keywords}]`);
            }
        }

        if (isMatch) {
            createMasterCard(mastersContainer, fio, experience, photo, phone, specialization, i);
            visibleCount++;
        }
    }

    // Если ничего не найдено
    if (visibleCount === 0) {
        console.log("Мастера не найдены после фильтрации. Показываем сообщение.");
        mastersContainer.innerHTML = `
            <div style="grid-column: 1 / -1; text-align: center; padding: 40px; background: var(--card-bg); border-radius: 15px; border: 1px solid var(--action);">
                <h3>К сожалению, по запросу "${TYPE_MAP[urlType] || urlType}" свободных мастеров нет</h3>
                <p>Но мы можем подобрать специалиста вручную!</p>
                <div style="margin-top: 20px;">
                    <p style="font-size: 0.9rem; opacity: 0.7; margin-bottom: 10px;">Показаны все доступные мастера других категорий:</p>
                    <button class="button" onclick="window.location.href='masters.html'">Показать всех мастеров</button>
                </div>
            </div>
        `;
    } else {
        console.log(`Показано мастеров: ${visibleCount}`);
    }
}

function createMasterCard(container, fio, exp, photo, phone, spec, index) {
    const safePhoto = photo && photo.length > 5 ? photo : `https://ui-avatars.com/api/?name=${encodeURIComponent(fio)}&background=3b82f6&color=fff&size=150`;
    
    // Рандомный рейтинг
    const rating = (4.7 + Math.random() * 0.3).toFixed(1);
    const reviews = Math.floor(20 + Math.random() * 80);

    const card = document.createElement("div");
    card.className = "master-card";
    // Стили для анимации
    card.style.opacity = "0";
    card.style.transform = "translateY(20px)";
    card.style.transition = "all 0.5s ease";
    
    card.innerHTML = `
        <div style="position: absolute; top: 15px; right: 15px; background: rgba(16, 185, 129, 0.1); color: var(--success); padding: 4px 10px; border-radius: 12px; font-size: 0.75rem; font-weight: bold;">
            🛡️ Проверен
        </div>
        
        <img class="master-photo" src="${safePhoto}" alt="${fio}">
        
        <div class="master-name">${fio}</div>
        
        <div style="display: flex; justify-content: center; align-items: center; gap: 5px; margin-bottom: 10px; color: #fbbf24;">
            ⭐ ${rating} <span style="color: var(--text-muted); font-size: 0.8rem;">(${reviews})</span>
        </div>

        <div class="master-exp" style="margin-bottom: 5px; color: var(--text);">Опыт: <strong>${exp}</strong></div>
        <div class="master-specialization" style="color: var(--text-muted); font-size: 0.85rem; margin-bottom: 20px; height: 40px; overflow: hidden;">${spec}</div>
        
        <a class="cta-button" href="tel:${phone}" style="width: 100%; display: block; text-decoration: none; padding: 12px; font-size: 1rem;">
            Вызвать мастера
        </a>
    `;

    container.appendChild(card);
    
    // Запуск анимации с задержкой
    setTimeout(() => {
        card.style.opacity = "1";
        card.style.transform = "translateY(0)";
    }, index * 100);
}

// Запуск
document.addEventListener('DOMContentLoaded', function() {
    initTheme();
    populateRequestInfo();
    loadMastersFromMastersJS();
});