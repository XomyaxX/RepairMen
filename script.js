// ================================
//   Константы
// ================================
const SHEET_URL = "https://docs.google.com/spreadsheets/d/e/2PACX-1vRY6KMZf4V6FC_dXc6yPEi1Yt1e267LVIC8Ewsm4IMTtEtwNOAeBEnrNsl-TWArKAylzdy6AipcUDf3/pub?output=csv";

// ================================
//   Упрощенная отправка заявки (без Google Apps Script)
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
        timestamp: new Date().toISOString(),
        id: Date.now()
    });
    localStorage.setItem('repair_requests', JSON.stringify(requests));

    console.log('Заявка сохранена:', data);

    // Переходим на страницу мастеров через 2 секунды
    setTimeout(() => {
        const query = new URLSearchParams(data).toString();
        window.location.href = `masters.html?${query}`;
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
    // Проверяем, находимся ли мы на странице с мастерами
    const mastersBlock = document.getElementById("masters");
    if (!mastersBlock) return;

    try {
        const params = new URLSearchParams(window.location.search);
        const selectedType = params.get("type");

        const response = await fetch(SHEET_URL);
        const csv = await response.text();
        const rows = csv.trim().split("\n").map(r => r.split(","));

        mastersBlock.innerHTML = "";

        // Если нет данных
        if (rows.length <= 1) {
            mastersBlock.innerHTML = '<p class="no-masters">Мастера пока не добавлены</p>';
            return;
        }

        const headers = rows[0].map(h => h.trim().toLowerCase());
        
        rows.slice(1).forEach((row, index) => {
            const master = {};
            headers.forEach((header, i) => {
                master[header] = (row[i] || '').trim();
            });

            // Фильтрация по типу
            if (selectedType && master.category && master.category !== selectedType) {
                return;
            }

            const card = document.createElement("div");
            card.className = "master-card";
            card.innerHTML = `
                <img src="${master.photo || 'https://via.placeholder.com/150?text=No+Photo'}" alt="Фото мастера" />
                <h3>${master.fio || master.name || 'Мастер'}</h3>
                <p><strong>Стаж:</strong> ${master.exp || master.experience || 'Не указан'}</p>
                <p><strong>Специализация:</strong> ${master.category || 'Не указана'}</p>
                <a href="tel:${master.phone || master.tel || ''}" class="button">Позвонить: ${master.phone || master.tel || 'Не указан'}</a>
            `;
            
            mastersBlock.appendChild(card);

            // Анимация появления
            setTimeout(() => {
                card.style.opacity = "1";
                card.style.transform = "translateY(0)";
            }, index * 100);
        });

    } catch (error) {
        console.error('Ошибка загрузки мастеров:', error);
        const mastersBlock = document.getElementById("masters");
        if (mastersBlock) {
            mastersBlock.innerHTML = '<p class="error-message">Ошибка загрузки данных. Попробуйте позже.</p>';
        }
    }
}

// Загружаем мастеров только если мы на нужной странице
if (document.getElementById("masters")) {
    loadMasters();
}