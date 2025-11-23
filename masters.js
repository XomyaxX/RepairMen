// ================================
//   НАСТРОЙКИ (БАЗА ДАННЫХ)
// ================================
const SHEET_URL = "https://docs.google.com/spreadsheets/d/e/2PACX-1vRY6KMZf4V6FC_dXc6yPEi1Yt1e267LVIC8Ewsm4IMTtEtwNOAeBEnrNsl-TWArKAylzdy6AipcUDf3/pub?output=csv";

// Переводчик: Код из Таблицы -> Название на сайте
const CATEGORY_MAP = {
    "wash": "Ремонт стиральных машин",
    "washer": "Ремонт стиральных машин",
    "dishwasher": "Ремонт посудомоечных машин",
    "fridge": "Ремонт холодильников",
    "oven": "Ремонт духовых шкафов",
    "panel": "Ремонт варочных панелей",
    "conditioner": "Ремонт кондиционеров",
    "tv": "Ремонт телевизоров",
    "pc": "Ремонт компьютеров",
    "laptops": "Ремонт ноутбуков"
};

// ================================
//   1. УПРАВЛЕНИЕ ТЕМОЙ
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
    const isLight = document.body.classList.toggle('light');
    localStorage.setItem('theme', isLight ? 'light' : 'dark');
    updateThemeToggle();
}

function updateThemeToggle() {
    const btn = document.querySelector('.theme-toggle');
    if (btn) btn.textContent = document.body.classList.contains('light') ? '🌙' : '☀️';
}

// ================================
//   2. ИНФОРМАЦИЯ О ЗАЯВКЕ
// ================================
function populateRequestInfo() {
    const params = new URLSearchParams(location.search);
    const rawType = params.get('type');
    
    // Переводим тип из URL в красивое название
    const displayType = CATEGORY_MAP[rawType] || rawType || 'Не указан';
    
    document.getElementById('req-type').textContent = displayType;
    document.getElementById('req-model').textContent = params.get('model') || 'Не указана';
    document.getElementById('req-problem').textContent = params.get('problem') || 'Не указано';
}

// ================================
//   3. ЗАГРУЗКА ИЗ GOOGLE SHEETS
// ================================
async function loadMastersFromMastersJS() {
    const container = document.getElementById("masters");
    container.innerHTML = '<div class="loader"></div><p style="text-align:center">Загрузка базы мастеров...</p>';

    try {
        // Добавляем случайное число time=..., чтобы браузер не кэшировал старую таблицу
        const response = await fetch(SHEET_URL + '&time=' + Date.now());
        
        if (!response.ok) throw new Error("Ошибка подключения к Google Таблице");
        
        const text = await response.text();
        const rows = parseCSV(text); // Используем правильный парсер
        
        renderMasters(rows);
        
    } catch (error) {
        console.error(error);
        container.innerHTML = `
            <div style="text-align:center; padding: 40px; border: 1px solid red; border-radius: 10px;">
                <h3>⚠️ Ошибка загрузки данных</h3>
                <p>Не удалось получить список мастеров с сервера.</p>
                <p style="font-size:0.8rem; opacity:0.7;">Совет: Если вы открыли файл локально, используйте локальный сервер (Live Server).</p>
            </div>
        `;
    }
}

// Простой парсер CSV (разбивает по строкам и запятым)
function parseCSV(text) {
    return text.trim().split('\n').map(row => {
        // Удаляем кавычки и лишние пробелы
        return row.split(',').map(cell => cell.trim().replace(/^"|"$/g, ''));
    });
}

// ================================
//   4. ОТРИСОВКА КАРТОЧЕК
// ================================
function renderMasters(rows) {
    const container = document.getElementById("masters");
    container.innerHTML = "";
    
    const params = new URLSearchParams(window.location.search);
    let selectedType = params.get("type"); // Например: 'wash' или 'fridge'

    let visibleCount = 0;

    // Начинаем с i=1, чтобы пропустить заголовок таблицы (fio, exp...)
    for (let i = 1; i < rows.length; i++) {
        const row = rows[i];
        if (row.length < 5) continue; // Пропуск битых строк

        // Данные из колонок таблицы
        const fio = row[0];
        const exp = row[1];
        const photo = row[2];
        const phone = row[3];
        const categoryCode = row[4].toLowerCase(); // 'wash', 'fridge'

        // === ФИЛЬТРАЦИЯ ===
        // Если тип выбран И он не совпадает с категорией мастера -> пропускаем
        if (selectedType && selectedType !== 'all') {
            // Учитываем нюансы (wash = washer, oven = panel)
            const isMatch = (categoryCode === selectedType.toLowerCase()) || 
                            (categoryCode === 'washer' && selectedType === 'wash') ||
                            (categoryCode === 'wash' && selectedType === 'washer') ||
                            (categoryCode === 'oven' && selectedType === 'panel'); // Плиты покажем для варочных панелей

            if (!isMatch) continue; 
        }

        // === СОЗДАНИЕ КАРТОЧКИ ===
        visibleCount++;
        createMasterCard(container, fio, exp, photo, phone, categoryCode, i);
    }

    // Если список пуст
    if (visibleCount === 0) {
        container.innerHTML = `
            <div style="grid-column: 1 / -1; text-align: center; padding: 40px; border: 1px solid var(--card-border); border-radius: 15px;">
                <h3>Нет свободных мастеров по категории "${CATEGORY_MAP[selectedType] || selectedType}"</h3>
                <p>Попробуйте выбрать другую технику или позвоните диспетчеру.</p>
                <a href="index.html" class="button">Вернуться на главную</a>
            </div>
        `;
    }
}

function createMasterCard(container, fio, exp, photo, phone, categoryCode, index) {
    // Красивое русское название
    const specName = CATEGORY_MAP[categoryCode] || categoryCode;
    
    // Заглушка, если фото нет или ссылка битая
    const safePhoto = (photo && photo.startsWith('http')) ? photo : `https://ui-avatars.com/api/?name=${encodeURIComponent(fio)}&background=3b82f6&color=fff&size=150`;

    // Рандомный рейтинг (для красоты)
    const rating = (4.7 + Math.random() * 0.3).toFixed(1);

    const card = document.createElement("div");
    card.className = "master-card";
    // Стили анимации
    card.style.opacity = "0";
    card.style.transform = "translateY(20px)";
    card.style.transition = "all 0.5s ease";

    card.innerHTML = `
        <div style="position: absolute; top: 15px; right: 15px; background: rgba(16, 185, 129, 0.1); color: var(--success); padding: 4px 10px; border-radius: 12px; font-size: 0.75rem; font-weight: bold;">
            🛡️ Проверен
        </div>
        <img class="master-photo" src="${safePhoto}" alt="${fio}" onerror="this.src='https://ui-avatars.com/api/?name=${encodeURIComponent(fio)}&background=random'">
        
        <div class="master-name">${fio}</div>
        
        <div style="display: flex; justify-content: center; align-items: center; gap: 5px; margin-bottom: 10px; color: #fbbf24;">
            ⭐ ${rating} <span style="color: var(--text-muted); font-size: 0.8rem;">(${Math.floor(Math.random() * 50 + 10)} отзывов)</span>
        </div>

        <div class="master-exp">Опыт: <strong>${exp} лет</strong></div>
        <div class="master-specialization" style="color: var(--primary); margin-bottom: 20px; font-weight: 500;">${specName}</div>
        
        <a class="cta-button" href="tel:${phone}" style="display: block; width: 100%;">Вызвать мастера</a>
    `;

    container.appendChild(card);

    // Запуск анимации
    setTimeout(() => {
        card.style.opacity = "1";
        card.style.transform = "translateY(0)";
    }, index * 100);
}

// Запуск
document.addEventListener('DOMContentLoaded', () => {
    initTheme();
    populateRequestInfo();
    loadMastersFromMastersJS();
});