// ================================
//   Упрощенная отправка заявки
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
//   Проверка доступности сервиса
// ================================
async function checkServiceAvailability() {
    try {
        const response = await fetch('https://script.google.com/macros/s/AKfycbywvfAHNbzztHg7AOxwePi2FHFdXmYsdJEsqi7UVf1HtnDkNndo0M5d0rHuJ15iZ9hnRQ/exec', {
            method: 'GET',
            mode: 'no-cors'
        });
        return true;
    } catch (error) {
        console.warn('Сервис недоступен, используется локальное сохранение');
        return false;
    }
}

// Проверяем при загрузке
document.addEventListener('DOMContentLoaded', checkServiceAvailability);