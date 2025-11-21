// masters.js
const SHEET_URL = "https://docs.google.com/spreadsheets/d/e/2PACX-1vRY6KMZf4V6FC_dXc6yPEi1Yt1e267LVIC8Ewsm4IMTtEtwNOAeBEnrNsl-TWArKAylzdy6AipcUDf3/pub?output=csv";

// ================================
//   Соответствие типов техники
// ================================
const TYPE_MAP = {
    wash: "Стиральная машина",
    fridge: "Холодильник", 
    pc: "Персональный компьютер",
    laptops: "Ноутбук",
    panel: "Варочная панель",
    conditioners: "Кондиционер",
    tv: "Телевизор"
};

// ================================
//   Заполнение информации о заявке
// ================================
function populateRequestInfo() {
    const params = new URLSearchParams(location.search);
    
    const rawType = params.get('type');
    const model = params.get('model');
    const problem = params.get('problem');
    
    const typeDisplay = TYPE_MAP[rawType] || rawType || 'Не указан';
    
    const elType = document.getElementById('req-type');
    const elModel = document.getElementById('req-model');
    const elProblem = document.getElementById('req-problem');

    if (elType) elType.textContent = typeDisplay;
    if (elModel) elModel.textContent = model || 'Не указана';
    if (elProblem) elProblem.textContent = problem || 'Не указано';

    console.log('Параметры заявки:', { 
        rawType, 
        typeDisplay, 
        model, 
        problem,
        fullURL: window.location.href 
    });
}

// ================================
//   Загрузка мастеров
// ================================
async function loadMastersFromMastersJS() {
    try {
        const response = await fetch(SHEET_URL);
        const csv = await response.text();
        const rows = csv.trim().split('\n').map(r => 
            r.split(',').map(cell => cell.trim().replace(/^"|"$/g, ''))
        );
        
        const mastersContainer = document.getElementById("masters");
        if (!mastersContainer) return;

        mastersContainer.innerHTML = "";

        const params = new URLSearchParams(window.location.search);
        const selectedType = params.get("type");

        let hasMasters = false;

        // Пропускаем заголовок
        for (let i = 1; i < rows.length; i++) {
            const row = rows[i];
            if (row.length < 5) continue;

            const [fio, experience, photo, phone, specialization] = row;

            // Фильтрация по типу
            if (selectedType && specialization && !specialization.toLowerCase().includes(selectedType.toLowerCase())) {
                continue;
            }

            const card = document.createElement("div");
            card.className = "master-card";
            card.innerHTML = `
                <img class="master-photo" src="${photo || 'https://via.placeholder.com/150?text=No+Photo'}" 
                     alt="Фото мастера" 
                     onerror="this.src='https://via.placeholder.com/150?text=No+Photo'">
                <div class="master-name">${fio || 'Мастер'}</div>
                <div class="master-exp">Опыт: ${experience || '—'}</div>
                <div class="master-specialization">Специализация: ${specialization || '—'}</div>
                <a class="master-phone" href="tel:${phone || ''}">${phone ? '📞 ' + phone : 'Телефон не указан'}</a>
            `;
            mastersContainer.appendChild(card);

            setTimeout(() => card.classList.add("visible"), i * 100);
            hasMasters = true;
        }

        // Если нет мастеров
        if (!hasMasters) {
            mastersContainer.innerHTML = `
                <div style="text-align: center; padding: 40px; grid-column: 1 / -1;">
                    <h3>Мастеров по выбранной категории не найдено</h3>
                    <p>Попробуйте изменить параметры поиска или <a href="index.html" style="color: var(--accent);">оставить заявку</a></p>
                </div>
            `;
        }

    } catch (error) {
        console.error("Ошибка загрузки мастеров", error);
        const mastersContainer = document.getElementById("masters");
        if (mastersContainer) {
            mastersContainer.innerHTML = `
                <div style="text-align: center; padding: 40px; grid-column: 1 / -1; color: #e74c3c;">
                    <h3>Ошибка загрузки списка мастеров</h3>
                    <p>Попробуйте обновить страницу позже</p>
                </div>
            `;
        }
    }
}

// ================================
//   Просмотр сохранённых заявок (для отладки)
// ================================
function showSavedRequests() {
    const requests = JSON.parse(localStorage.getItem('repair_requests') || '[]');
    console.log('Сохранённые заявки:', requests);
    
    if (requests.length > 0) {
        console.table(requests);
    }
}

// ================================
//   Инициализация при загрузке
// ================================
document.addEventListener('DOMContentLoaded', function() {
    console.log('masters.js загружен');
    populateRequestInfo();
    loadMastersFromMastersJS();
    showSavedRequests();
});