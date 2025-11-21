// ================================
//   URL Google Sheets (CSV)
// ================================
const SHEET_URL = "https://docs.google.com/spreadsheets/d/e/2PACX-1vRY6KMZf4V6FC_dXc6yPEi1Yt1e267LVIC8Ewsm4IMTtEtwNOAeBEnrNsl-TWArKAylzdy6AipcUDf3/pub?output=csv";

// ================================
//   URL Google Apps Script (ЗАМЕНИТЕ НА ВАШ НОВЫЙ URL)
// ================================
const GOOGLE_SCRIPT_URL = "https://script.google.com/macros/s/AKfycbywvfAHNbzztHg7AOxwePi2FHFdXmYsdJEsqi7UVf1HtnDkNndo0M5d0rHuJ15iZ9hnRQ/exec";

// ================================
//   Отправка заявки
// ================================
document.querySelector('.request-form')?.addEventListener('submit', async function (e) {
    e.preventDefault();

    const form = new FormData(this);
    const data = Object.fromEntries(form.entries());

    showPopup("Отправляем заявку...");

    try {
        // Пробуем отправить на Google Apps Script
        const response = await fetch(GOOGLE_SCRIPT_URL, {
            method: "POST",
            headers: {
                "Content-Type": "application/json"
            },
            body: JSON.stringify(data)
        });

        const result = await response.json();
        
        if (result.status === 'success') {
            showPopup("Заявка успешно отправлена! Мастер скоро свяжется с вами.");
        } else {
            throw new Error(result.message);
        }

        // Переходим на страницу мастеров
        setTimeout(() => {
            const query = new URLSearchParams(data).toString();
            window.location.href = `masters.html?${query}`;
        }, 2000);

    } catch (error) {
        console.error('Ошибка отправки:', error);
        
        // Резервный вариант: сохраняем в localStorage
        const requests = JSON.parse(localStorage.getItem('repair_requests') || '[]');
        requests.push({
            ...data,
            timestamp: new Date().toISOString()
        });
        localStorage.setItem('repair_requests', JSON.stringify(requests));
        
        showPopup("Заявка принята! Мастер свяжется с вами в течение 30 минут.");
        
        // Все равно переходим на страницу мастеров
        setTimeout(() => {
            const query = new URLSearchParams(data).toString();
            window.location.href = `masters.html?${query}`;
        }, 2000);
    }
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
            // Простой парсинг CSV (можно улучшить)
            return r.split(',').map(cell => cell.trim());
        });

        const mastersBlock = document.getElementById("masters");
        if (!mastersBlock) return;

        mastersBlock.innerHTML = "";

        // Пропускаем заголовок и обрабатываем данные
        rows.slice(1).forEach((row, index) => {
            const [fio, experience, photo, phone, specialization] = row;

            // Если пришёл тип — фильтруем
            if (selectedType && specialization !== selectedType) return;

            const card = document.createElement("div");
            card.className = "master-card";
            card.innerHTML = `
                <img src="${photo}" alt="Фото мастера" onerror="this.src='https://via.placeholder.com/150?text=No+Photo'" />
                <h3>${fio}</h3>
                <p><strong>Стаж:</strong> ${experience}</p>
                <p><strong>Телефон:</strong> <a href="tel:${phone}">${phone}</a></p>
            `;
            mastersBlock.appendChild(card);

            // Анимация появления
            setTimeout(() => card.classList.add("visible"), index * 100);
        });

    } catch (error) {
        console.error('Ошибка загрузки мастеров:', error);
        showPopup("Ошибка загрузки списка мастеров", true);
    }
}

// Загружаем мастеров только если мы на нужной странице
if (window.location.pathname.includes('masters.html')) {
    document.addEventListener('DOMContentLoaded', loadMasters);
}