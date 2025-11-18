// Прямая ссылка на CSV (опубликованная таблица)
const SHEET_URL = "https://docs.google.com/spreadsheets/d/e/2PACX-1vRY6KMZf4V6FC_dXc6yPEi1Yt1e267LVIC8Ewsm4IMTtEtwNOAeBEnrNsl-TWArKAylzdy6AipcUDf3/pub?output=csv";


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
const revealElements = document.querySelectorAll('.hero, .benefits, .request-block, .master-card');

function revealOnScroll() {
  const windowHeight = window.innerHeight;
  revealElements.forEach(el => {
    const elementTop = el.getBoundingClientRect().top;
    if(elementTop < windowHeight - 100) {
      el.classList.add('visible');
    }
  });
}

window.addEventListener('scroll', revealOnScroll);
window.addEventListener('load', revealOnScroll);


// Автозагрузка
loadMasters();
setInterval(loadMasters, 60000);