const SHEET_URL = "https://docs.google.com/spreadsheets/d/e/2PACX-1vRY6KMZf4V6FC_dXc6yPEi1Yt1e267LVIC8Ewsm4IMTtEtwNOAeBEnrNsl-TWArKAylzdy6AipcUDf3/pub?output=csv";


async function loadMasters() {
try {
const response = await fetch(SHEET_URL);
const csv = await response.text();
const rows = csv.trim().split('\n').map(r => r.split(','));


const mastersBlock = document.getElementById('masters');
if(!mastersBlock) return;


mastersBlock.innerHTML = '';


rows.slice(1).forEach(row => {
const [fio, experience, photo, phone] = row;
const card = document.createElement('div');
card.className = 'master-card reveal';
card.innerHTML = `
<img src="${photo}" alt="Фото мастера" />
<h3>${fio}</h3>
<p><strong>Опыт:</strong> ${experience}</p>
<p><strong>Телефон:</strong> ${phone}</p>
`;
mastersBlock.appendChild(card);
});




// Простой scroll reveal
function revealOnScroll() {
  const reveals = document.querySelectorAll('.reveal');
  
  reveals.forEach(element => {
    const windowHeight = window.innerHeight;
    const elementTop = element.getBoundingClientRect().top;
    const elementVisible = 150;
    
    if (elementTop < windowHeight - elementVisible) {
      element.classList.add('visible');
    }
  });
}

// Запускаем при загрузке и скролле
window.addEventListener('load', revealOnScroll);
window.addEventListener('scroll', revealOnScroll);

// Обработчик формы
document.querySelector('.request-form')?.addEventListener('submit', function(e) {
  e.preventDefault();

  // Получаем значение типа техники
  const type = this.type.value;

  // Назначаем соответствующую страницу
  const pages = {
    wash: 'wash.html',
    fridge: 'fridge.html',
    pc: 'pc.html',
    laptops: 'laptops.html',
    panel: 'panel.html',
    conditioners: 'conditioners.html',
    tv: 'tv.html'
  };

  // Перенаправление
  if (pages[type]) {
    window.location.href = pages[type];
  } else {
    alert('Ошибка: неизвестный тип техники.');
  }
});


} catch(err){ console.error('Ошибка загрузки мастеров:', err); }
}


loadMasters();
setInterval(loadMasters, 60000);