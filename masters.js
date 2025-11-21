// masters.js (исправленный)

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
//   Загрузка мастеров
// ================================
async function loadMasters() {
    try {
        const response = await fetch(SHEET_URL);
        const csv = await response.text();
        const rows = csv.trim().split('\n').map(r => r.split(',').map(cell => cell.trim()));
        
        const mastersContainer = document.getElementById("masters");
        if (!mastersContainer) return;

        mastersContainer.innerHTML = "";

        const params = new URLSearchParams(window.location.search);
        const selectedType = params.get("type");

        // Пропускаем заголовок
        for (let i = 1; i < rows.length; i++) {
            const row = rows[i];
            if (row.length < 5) continue;

            const [fio, experience, photo, phone, specialization] = row;

            // Фильтрация по типу
            if (selectedType && specialization !== TYPE_MAP[selectedType]) continue;

            const card = document.createElement("div");
            card.className = "master-card";
            card.innerHTML = `
                <img class="master-photo" src="${photo || 'https://via.placeholder.com/150?text=No+Photo'}" alt="Фото мастера" />
                <div class="master-name">${fio || 'Без имени'}</div>
                <div class="master-exp">Опыт: ${experience || '—'}</div>
                <a class="master-phone" href="tel:${phone || ''}">${phone ? 'Позвонить: ' + phone : 'Тел: -'}</a>
            `;
            mastersContainer.appendChild(card);

            // Анимация появления
            setTimeout(() => card.classList.add("visible"), i * 100);
        }

        // Если нет мастеров
        if (!mastersContainer.children.length) {
            mastersContainer.innerHTML = '<p style="text-align: center; padding: 40px;">Мастеров по выбранной категории не найдено</p>';
        }

    } catch (error) {
        console.error("Ошибка загрузки мастеров", error);
        const mastersContainer = document.getElementById("masters");
        if (mastersContainer) {
            mastersContainer.innerHTML = '<p style="text-align: center; padding: 40px; color: #e74c3c;">Ошибка загрузки списка мастеров</p>';
        }
    }
}

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
}

// ================================
//   Инициализация при загрузке
// ================================
document.addEventListener('DOMContentLoaded', function() {
    populateRequestInfo();
    loadMasters();
});
function populateRequestInfo() {
    const params = new URLSearchParams(location.search);
    
    console.log('Все параметры URL:', {
        type: params.get('type'),
        model: params.get('model'), 
        problem: params.get('problem'),
        fullURL: window.location.href
    });
    
    const rawType = params.get('type');
    const model = params.get('model');
    const problem = params.get('problem');
    
    const typeDisplay = TYPE_MAP[rawType] || rawType || 'Не указан';
    
    const elType = document.getElementById('req-type');
    const elModel = document.getElementById('req-model');
    const elProblem = document.getElementById('req-problem');

    console.log('Найденные элементы:', {
        elType: !!elType,
        elModel: !!elModel, 
        elProblem: !!elProblem
    });

    if (elType) elType.textContent = typeDisplay;
    if (elModel) elModel.textContent = model || 'Не указана';
    if (elProblem) elProblem.textContent = problem || 'Не указано';
}