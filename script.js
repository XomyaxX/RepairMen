// Прямая ссылка на CSV (опубликованная таблица)
const SHEET_URL = "https://docs.google.com/spreadsheets/d/e/2PACX-1vSm9UDeOeEQ61iJvCgB0jtnOcYoinpOdpN6AdL0rHLn22lpo0_JylOaDamiphnvQQbiraj9BKZEFx8d/pub?output=csv";


async function loadMasters() {
try {
const response = await fetch(SHEET_URL);
const csv = await response.text();
const rows = csv.trim().split("\n").map(r => r.split(","));


const mastersBlock = document.getElementById("masters");
if (!mastersBlock) return;


mastersBlock.innerHTML = "";


rows.slice(1).forEach(row => {
const [fio, experience, photo, phone] = row;


const card = document.createElement("div");
card.className = "master-card";


card.innerHTML = `
<img src="${photo}" alt="Фото мастера" />
<h3>${fio}</h3>
<p><strong>Опыт:</strong> ${experience}</p>
<p><strong>Телефон:</strong> ${phone}</p>
`;


mastersBlock.appendChild(card);
});
} catch (err) {
console.error("Ошибка загрузки мастеров:", err);
}
}


// Автозагрузка
loadMasters();
setInterval(loadMasters, 60000);