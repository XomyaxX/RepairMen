// ================================
//   URL Google Apps Script
// ================================
const SHEET_URL = "https://docs.google.com/spreadsheets/d/e/2PACX-1vRY6KMZf4V6FC_dXc6yPEi1Yt1e267LVIC8Ewsm4IMTtEtwNOAeBEnrNsl-TWArKAylzdy6AipcUDf3/pub?output=csv";

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
function populateRequestInfo(){
  const params = new URLSearchParams(location.search);
  
  // Получаем параметры из URL
  const rawType = params.get('type');
  const model = params.get('model');
  const problem = params.get('problem');
  
  // Преобразуем тип техники в читаемый вид
  const typeDisplay = TYPE_MAP[rawType] || rawType || 'Не указан';
  
  // Получаем элементы для отображения
  const elType = document.getElementById('req-type');
  const elModel = document.getElementById('req-model');
  const elProblem = document.getElementById('req-problem');

  // Заполняем данные
  if (elType) elType.textContent = typeDisplay;
  if (elModel) elModel.textContent = model || 'Не указана';
  if (elProblem) elProblem.textContent = problem || 'Не указано';

  console.log('Параметры заявки:', { rawType, typeDisplay, model, problem });
}
