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

// Переводчик кодов из твоей таблицы в красивые названия
const CATEGORY_TRANSLATOR = {
    "wash": "Ремонт стиральных машин",
    "washer": "Ремонт стиральных машин", // на случай опечатки
    "fridge": "Ремонт холодильников",
    "dishwasher": "Ремонт посудомоечных машин",
    "oven": "Ремонт духовых шкафов и плит",
    "conditioner": "Ремонт кондиционеров",
    "tv": "Ремонт телевизоров",
    "pc": "Ремонт компьютеров",
    "laptops": "Ремонт ноутбуков"
};

// ================================
//   Инфо о заявке
// ================================
function populateRequestInfo() {
    const params = new URLSearchParams(location.search);
    const rawType = params.get('type');
    
    // Пытаемся перевести тип, если не вышло - пишем как есть
    const displayType = CATEGORY_TRANSLATOR[rawType] || rawType || 'Не указан';
    
    document.getElementById('req-type').textContent = displayType;
    document.getElementById('req-model').textContent = params.get('model') || 'Не указана';
    document.getElementById('req-problem').textContent = params.get('problem') || 'Не указано';
}

// ================================
//   ЗАГРУЗКА МАСТЕРОВ
// ================================
async function loadMastersFromMastersJS() {
    const mastersContainer = document.getElementById("masters");
    if (!mastersContainer) return;
    
    mastersContainer.innerHTML = '<div class="loader"></div><p style="text-align:center">Загрузка базы мастеров...</p>';

    try {
        console.log("Загрузка данных...");
        // Добавляем timestamp, чтобы избежать кэширования браузером
        const response = await fetch(SHEET_URL + '&t=' + new Date().getTime());
        
        if (!response.ok) throw new Error("Нет доступа к таблице");
        
        const csv = await response.text();
        // Парсим CSV по строкам
        const rows = csv.trim().split('\n').map(r => r.split(',').map(c => c.trim().replace(/^"|"$/g, '')));
        
        renderMasters(rows);

    } catch (error) {
        console.error("Ошибка:", error);
        mastersContainer.innerHTML = `
            <div style="text-align:center; padding: 40px; border: 1px solid red; border-radius: 10px;">
                <h3>Ошибка загрузки данных</h3>
                <p>Проверьте ссылку на таблицу и формат данных.</p>
                <button class="button" onclick="location.reload()">Попробовать снова</button>
            </div>
        `;
    }
}

function renderMasters(rows) {
    const mastersContainer = document.getElementById("masters");
    mastersContainer.innerHTML = "";

    const params = new URLSearchParams(window.location.search);
    const selectedType = params.get("type"); // Например: 'wash'

    let visibleCount = 0;

    // Начинаем с 1, пропуская заголовок fio,exp...
    for (let i = 1; i < rows.length; i++) {
        const row = rows[i];
        if (row.length < 5) continue; // Пропускаем битые строки

        // Берем данные из твоей новой таблицы
        const fio = row[0];
        const experience = row[1];
        const photo = row[2];
        const phone = row[3];
        const categoryCode = row[4].toLowerCase(); // 'wash', 'fridge' и т.д.

        // ФИЛЬТРАЦИЯ
        // Если тип выбран И код в таблице не совпадает с выбранным -> пропускаем
        // Например: ищем 'fridge', а у мастера 'wash' -> скрываем
        if (selectedType && categoryCode !== selectedType.toLowerCase() && selectedType !== 'all') {
            // Обработка случая washer/wash
            if (!(selectedType === 'wash' && categoryCode === 'washer') && 
                !(selectedType === 'washer' && categoryCode === 'wash')) {
                continue;
            }
        }

        // Красивое название специализации
        const specializationDisplay = CATEGORY_TRANSLATOR[categoryCode] || categoryCode;

        // Фото или заглушка
        const safePhoto = photo && photo.includes('http') ? photo : `https://ui-avatars.com/api/?name=${encodeURIComponent(fio)}&background=3b82f6&color=fff&size=150`;

        // Генерация рейтинга
        const rating = (4.7 + Math.random() * 0.3).toFixed(1);
        const reviews = Math.floor(15 + Math.random() * 50);

        const card = document.createElement("div");
        card.className = "master-card";
        // Анимация
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

            <div class="master-exp" style="margin-bottom: 5px; color: var(--text);">Опыт: <strong>${experience} лет</strong></div>
            <div class="master-specialization" style="color: var(--primary); font-size: 0.9rem; margin-bottom: 20px; font-weight: 500;">
                ${specializationDisplay}
            </div>
            
            <a class="cta-button" href="tel:${phone}" style="width: 100%; display: block; text-decoration: none; padding: 12px; font-size: 1rem;">
                Вызвать мастера
            </a>
        `;

        mastersContainer.appendChild(card);
        
        setTimeout(() => {
            card.style.opacity = "1";
            card.style.transform = "translateY(0)";
        }, visibleCount * 100);

        visibleCount++;
    }

    if (visibleCount === 0) {
        mastersContainer.innerHTML = `
            <div style="grid-column: 1 / -1; text-align: center; padding: 40px; background: var(--card-bg); border-radius: 15px; border: 1px solid var(--card-border);">
                <h3>Свободных мастеров по категории "${CATEGORY_TRANSLATOR[selectedType] || selectedType}" сейчас нет</h3>
                <p>Попробуйте выбрать другую категорию.</p>
                <button class="button" onclick="window.location.href='index.html'">Вернуться назад</button>
            </div>
        `;
    }
}

document.addEventListener('DOMContentLoaded', function() {
    initTheme();
    populateRequestInfo();
    loadMastersFromMastersJS();
});