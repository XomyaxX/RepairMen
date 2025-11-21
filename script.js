// ================================
//   URL Google Apps Script
// ================================
const GOOGLE_SCRIPT_URL = "https://script.google.com/macros/s/AKfycbx-DDv0LP_K5BK1RNjak_K6bwfFc9eCVJmaT1IIjiVvlDNcYYTcC_kP_-uki7lSqyMj0w/exec";


// ================================
//   Отправка заявки
// ================================
document.querySelector('.request-form')?.addEventListener('submit', async function (e) {
    e.preventDefault();

    const form = new FormData(this);
    const data = Object.fromEntries(form.entries());

    // Создание всплывающего окна (без alert)
    showPopup("Отправляем заявку...");

    // Отправка в Google Sheets
    try {
        await fetch(GOOGLE_SCRIPT_URL, {
            method: "POST",
            body: JSON.stringify(data),
            headers: { "Content-Type": "application/json" }
        });

        showPopup("Заявка успешно отправлена! Мастер скоро свяжется с вами.");

        // Передаём данные на страницу мастеров
        const query = new URLSearchParams(data).toString();
        window.location.href = `masters.html?${query}`;

    } catch (error) {
        showPopup("Ошибка отправки заявки. Попробуйте позже.", true);
        console.error(error);
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
    }, 2500);
}


// ================================
//   Загрузка мастеров с фильтрацией
// ================================
async function loadMasters() {
    const params = new URLSearchParams(window.location.search);
    const selectedType = params.get("type");

    const response = await fetch(SHEET_URL);
    const csv = await response.text();
    const rows = csv.trim().split("\n").map(r => r.split(","));

    const mastersBlock = document.getElementById("masters");
    if (!mastersBlock) return;

    mastersBlock.innerHTML = "";

    rows.slice(1).forEach(row => {
        const [fio, experience, photo, phone, specialization] = row;

        // Если пришёл тип — фильтруем
        if (selectedType && specialization !== selectedType) return;

        const card = document.createElement("div");
        card.className = "master-card reveal";
        card.innerHTML = `
            <img src="${photo}" alt="Фото мастера" />
            <h3>${fio}</h3>
            <p><strong>Стаж:</strong> ${experience}</p>
            <p><strong>Телефон:</strong> ${phone}</p>
        `;
        mastersBlock.appendChild(card);
    });
}

loadMasters();
