// --- ВЫБОР ТЕМЫ (СОХРАНЕНИЕ В localStorage) ---
const themeSwitch = document.getElementById("theme-switch");

// Применяем сохранённую тему при загрузке
(function applySavedTheme() {
    const saved = localStorage.getItem("theme") || "light";
    document.body.classList.toggle("dark", saved === "dark");
    if (themeSwitch) themeSwitch.checked = saved === "dark";
})();

// Смена темы
if (themeSwitch) {
    themeSwitch.addEventListener("change", () => {
        const newTheme = themeSwitch.checked ? "dark" : "light";
        document.body.classList.toggle("dark", newTheme === "dark");
        localStorage.setItem("theme", newTheme);
    });
}


// --- ВАЛИДАЦИЯ ФОРМЫ ---
const form = document.getElementById("repair-form");

function validatePhone(phone) {
    return /^\d{10,15}$/.test(phone);
}

function showPopup(id) {
    const popup = document.getElementById(id);
    popup.classList.add("show");
    setTimeout(() => popup.classList.remove("show"), 3000);
}


if (form) {
    form.addEventListener("submit", function (e) {
        e.preventDefault();

        const formData = new FormData(form);
        const type = formData.get("type");
        const phone = formData.get("phone");

        if (!validatePhone(phone)) {
            showPopup("error-popup");
            return;
        }

        // Формирование URL для перехода
        const params = new URLSearchParams();
        params.append("type", type);
        params.append("model", formData.get("model"));
        params.append("problem", formData.get("problem"));

        // Отправка на Google Script (опционально)
        fetch("https://script.google.com/macros/s/AKfycbywkW9p_7VKpqk_I2RMnpsHuZWS5pWkYVJogntkyaqQGdvuL9RZ5M1xBcXiMZk5OvK5/exec", {
            method: "POST",
            body: formData
        });

        // Переход на страницу мастеров
        window.location.href = "masters.html?" + params.toString();
    });
}


// --- ПЛАВНАЯ АНИМАЦИЯ КНОПКИ ---
const findBtn = document.querySelector(".find-master-btn");
if (findBtn) {
    findBtn.addEventListener("click", () => {
        findBtn.classList.add("clicked");
        setTimeout(() => findBtn.classList.remove("clicked"), 300);
    });
}