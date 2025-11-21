// ================================
//   URL Google Sheets (CSV)
// ================================
const SHEET_URL = "https://docs.google.com/spreadsheets/d/e/2PACX-1vRY6KMZf4V6FC_dXc6yPEi1Yt1e267LVIC8Ewsm4IMTtEtwNOAeBEnrNsl-TWArKAylzdy6AipcUDf3/pub?output=csv";

// ================================
//   Отправка заявки (упрощенная версия)
// ================================
document.querySelector('.request-form')?.addEventListener('submit', function (e) {
    e.preventDefault();

    const form = new FormData(this);
    const data = Object.fromEntries(form.entries());

    showPopup("Заявка принята! Мастер свяжется с вами в течение 30 минут.");

    // Сохраняем заявку в localStorage
    const requests = JSON.parse(localStorage.getItem('repair_requests') || '[]');
    requests.push({
        ...data,
        timestamp: new Date().toISOString()
    });
    localStorage.setItem('repair_requests', JSON.stringify(requests));

    // Переходим на страницу мастеров с параметрами
    const queryParams = new URLSearchParams();
    
    // Добавляем параметры для фильтрации и отображения
    if (data.type) queryParams.append('type', data.type);
    if (data.model) queryParams.append('model', data.model);
    if (data.problem) queryParams.append('problem', data.problem);
    
    // Переходим на страницу мастеров через 2 секунды
    setTimeout(() => {
        window.location.href = `masters.html?${queryParams.toString()}`;
    }, 2000);
});

// ================================
//   Функция всплывающего окна
// ================================
function showPopup(message, error = false) {
    let popup = document.getElementById("repairmen-popup");

    if (!popup) {
        popup = document.createElement("div");
        popup.id = "repairmen-popup";
        popup.style.cssText = `
            position: fixed;
            bottom: 30px;
            right: 30px;
            background: ${error ? '#e74c3c' : 'var(--accent)'};
            color: white;
            padding: 18px 25px;
            border-radius: 12px;
            font-size: 1.1rem;
            box-shadow: 0 10px 30px rgba(0,0,0,0.25);
            opacity: 0;
            transform: translateY(20px);
            transition: 0.4s;
            z-index: 9999;
        `;
        document.body.appendChild(popup);
    }

    popup.textContent = message;

    requestAnimationFrame(() => {
        popup.style.opacity = "1";
        popup.style.transform = "translateY(0)";
    });

    setTimeout(() => {
        popup.style.opacity = "0";
        popup.style.transform = "translateY(20px)";
    }, 3000);
}

// ================================
//   Загрузка мастеров (только для masters.html)
// ================================
async function loadMasters() {
    // Проверяем, находимся ли мы на странице masters.html
    if (!window.location.pathname.includes('masters.html')) {
        return;
    }

    const params = new URLSearchParams(window.location.search);
    const selectedType = params.get("type");

    try {
        const response = await fetch(SHEET_URL);
        const csv = await response.text();
        const rows = csv.trim().split("\n").map(r => {
            // Улучшенный парсинг CSV
            return r.split(',').map(cell => cell.trim().replace(/^"|"$/g, ''));
        });

        const mastersBlock = document.getElementById("masters");
        if (!mastersBlock) return;

        mastersBlock.innerHTML = "";

        // Пропускаем заголовок и обрабатываем данные
        let mastersCount = 0;
        rows.slice(1).forEach((row, index) => {
            if (row.length < 5) return;

            const [fio, experience, photo, phone, specialization] = row;

            // Если пришёл тип — фильтруем
            if (selectedType && specialization && !specialization.includes(selectedType)) {
                return;
            }

            const card = document.createElement("div");
            card.className = "master-card";
            card.innerHTML = `
                <img src="${photo || 'https://via.placeholder.com/150?text=No+Photo'}" 
                     alt="Фото мастера" 
                     onerror="this.src='https://via.placeholder.com/150?text=No+Photo'"
                     style="width: 150px; height: 150px; object-fit: cover; border-radius: 50%; margin-bottom: 15px;">
                <h3>${fio || 'Мастер'}</h3>
                <p><strong>Стаж:</strong> ${experience || 'не указан'}</p>
                <p><strong>Специализация:</strong> ${specialization || 'не указана'}</p>
                <p><strong>Телефон:</strong> <a href="tel:${phone || ''}" style="color: var(--accent); text-decoration: none;">${phone || 'не указан'}</a></p>
            `;
            mastersBlock.appendChild(card);

            // Анимация появления
            setTimeout(() => card.classList.add("visible"), index * 100);
            mastersCount++;
        });

        // Если нет мастеров
        if (mastersCount === 0) {
            mastersBlock.innerHTML = `
                <div style="text-align: center; padding: 40px; grid-column: 1 / -1;">
                    <h3>Мастеров по выбранной категории не найдено</h3>
                    <p>Попробуйте изменить параметры поиска или <a href="index.html">оставить заявку</a></p>
                </div>
            `;
        }

    } catch (error) {
        console.error('Ошибка загрузки мастеров:', error);
        const mastersBlock = document.getElementById("masters");
        if (mastersBlock) {
            mastersBlock.innerHTML = `
                <div style="text-align: center; padding: 40px; grid-column: 1 / -1; color: #e74c3c;">
                    <h3>Ошибка загрузки списка мастеров</h3>
                    <p>Попробуйте обновить страницу позже</p>
                </div>
            `;
        }
    }
}

// Загружаем мастеров только если мы на нужной странице
if (window.location.pathname.includes('masters.html')) {
    document.addEventListener('DOMContentLoaded', loadMasters);
}