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

// Ссылка на таблицу мастеров
var SHEET_URL = "https://docs.google.com/spreadsheets/d/e/2PACX-1vRY6KMZf4V6FC_dXc6yPEi1Yt1e267LVIC8Ewsm4IMTtEtwNOAeBEnrNsl-TWArKAylzdy6AipcUDf3/pub?output=csv";

// ================================
//   Словарь для отображения (Красивые названия)
// ================================
const TYPE_MAP = {
    wash: "Стиральная машина",
    fridge: "Холодильник", 
    pc: "Компьютер",
    laptops: "Ноутбук",
    panel: "Варочная панель",
    conditioners: "Кондиционер",
    tv: "Телевизор",
    other: "Другая техника"
};

// ================================
//   Словарь для поиска (Корни слов для фильтра)
// ================================
const SEARCH_KEYWORDS = {
    wash: "стиральн",      // найдет "стиральная", "стиральных"
    fridge: "холодильн",   // найдет "холодильник", "холодильников"
    pc: "компьютер",
    laptops: "ноутбук",
    panel: "варочн",       // найдет "варочная", "варочной"
    conditioners: "кондиционер",
    tv: "телевиз"          // найдет "телевизор", "телевизоров"
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
//   ЗАГРУЗКА МАСТЕРОВ
// ================================
async function loadMastersFromMastersJS() {
    try {
        const response = await fetch(SHEET_URL);
        const csv = await response.text();
        const rows = csv.trim().split('\n').map(r => r.split(',').map(c => c.trim().replace(/^"|"$/g, '')));
        
        const mastersContainer = document.getElementById("masters");
        if (!mastersContainer) return;
        
        mastersContainer.innerHTML = "";
        
        // Получаем тип из URL
        const params = new URLSearchParams(window.location.search);
        const urlType = params.get("type");
        
        // Определяем ключевое слово для поиска (на русском)
        // Если тип не найден в словаре, ищем по самому слову
        const filterKeyword = SEARCH_KEYWORDS[urlType] || urlType || "";
        
        console.log(`Фильтр: Тип URL='${urlType}', Ключевое слово='${filterKeyword}'`);

        let hasMasters = false;

        // Генераторы для красоты
        const getRandomRating = () => (4.7 + Math.random() * 0.3).toFixed(1);
        const getRandomReviews = () => Math.floor(20 + Math.random() * 100);

        // Перебираем строки (пропускаем заголовок)
        for (let i = 1; i < rows.length; i++) {
            const row = rows[i];
            if (row.length < 5) continue;
            
            const [fio, experience, photo, phone, specialization] = row;

            // ЛОГИКА ФИЛЬТРАЦИИ
            // Если фильтр задан, проверяем, есть ли ключевое слово в специализации мастера
            if (filterKeyword) {
                if (!specialization || !specialization.toLowerCase().includes(filterKeyword.toLowerCase())) {
                    continue; // Пропускаем, если не совпадает
                }
            }
            
            // Заглушка для фото
            const safePhoto = photo && photo.length > 5 ? photo : `https://ui-avatars.com/api/?name=${encodeURIComponent(fio)}&background=3b82f6&color=fff&size=150`;

            const card = document.createElement("div");
            card.className = "master-card";
            card.style.opacity = "0";
            card.style.transform = "translateY(20px)";
            card.style.transition = "all 0.5s ease";

            card.innerHTML = `
                <div style="position: absolute; top: 15px; right: 15px; background: #e0f2fe; color: #0284c7; padding: 4px 10px; border-radius: 12px; font-size: 0.75rem; font-weight: bold;">
                    🛡️ Проверен
                </div>
                
                <img class="master-photo" src="${safePhoto}" alt="${fio}">
                
                <div class="master-name">${fio}</div>
                
                <div style="display: flex; justify-content: center; align-items: center; gap: 5px; margin-bottom: 10px; color: gold;">
                    ⭐ ${getRandomRating()} <span style="color: var(--text-muted); font-size: 0.8rem;">(${getRandomReviews()} отзывов)</span>
                </div>

                <div class="master-exp" style="margin-bottom: 5px;">Опыт работы: <strong>${experience}</strong></div>
                <div class="master-specialization" style="color: var(--text-muted); font-size: 0.9rem; margin-bottom: 15px;">${specialization}</div>
                
                <a class="cta-button" href="tel:${phone}" style="width: 100%; display: block; text-decoration: none; padding: 12px;">
                    📞 Позвонить мастеру
                </a>
                <p style="font-size: 0.75rem; color: var(--text-muted); margin-top: 10px;">Среднее время прибытия: 45 мин</p>
            `;
            
            mastersContainer.appendChild(card);
            
            setTimeout(() => {
                card.style.opacity = "1";
                card.style.transform = "translateY(0)";
            }, i * 100);
            
            hasMasters = true;
        }

        if (!hasMasters) {
            mastersContainer.innerHTML = `
                <div style="grid-column: 1 / -1; text-align: center; padding: 50px; background: var(--card-bg); border-radius: 15px; border: 1px dashed var(--card-border);">
                    <h3>По вашему запросу "${TYPE_MAP[urlType] || urlType}" свободных мастеров сейчас нет</h3>
                    <p style="margin: 15px 0;">Попробуйте выбрать другую категорию или позвоните диспетчеру.</p>
                    <button class="cta-button" onclick="window.location.href='index.html#request-form'">Связаться с диспетчером</button>
                </div>
            `;
        }

    } catch (error) {
        console.error("Ошибка:", error);
        document.getElementById("masters").innerHTML = `<p style="text-align:center; color:red;">Ошибка загрузки базы мастеров</p>`;
    }
}

// Запуск при загрузке
document.addEventListener('DOMContentLoaded', function() {
    initTheme();
    populateRequestInfo();
    loadMastersFromMastersJS();
});