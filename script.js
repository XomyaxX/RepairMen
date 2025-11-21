// --- Настройка: вставь сюда URL своего Google Apps Script Web App (doPost) ---
const GOOGLE_SCRIPT_URL = "https://script.google.com/macros/s/AKfycbx-DDv0LP_K5BK1RNjak_K6bwfFc9eCVJmaT1IIjiVvlDNcYYTcC_kP_-uki7lSqyMj0w/exec";

// Popup (фирменный)
function showPopup(text, isError=false){
  const root = document.getElementById('popup-root');
  const el = document.createElement('div');
  el.className = 'popup';
  el.style.cssText = `position:fixed;right:20px;bottom:20px;padding:14px 18px;border-radius:12px;background:${isError?'#e74c3c':'var(--accent)'};color:#000;box-shadow:0 8px 30px rgba(0,0,0,0.3);z-index:9999`;
  el.textContent = text;
  root.appendChild(el);
  setTimeout(()=>{el.style.opacity='0';el.style.transform='translateY(10px)';},2200);
  setTimeout(()=>root.removeChild(el),2600);
}

// Theme toggle
function initThemeToggle(buttonId){
  const btn = document.getElementById(buttonId);
  btn?.addEventListener('click', ()=>document.body.classList.toggle('light'));
}

// Form handling: send to Google Apps Script, then redirect to masters.html with query
document.addEventListener('DOMContentLoaded', ()=>{
  initThemeToggle('themeToggle');
  initThemeToggle('themeToggle2');

  const form = document.getElementById('repairForm');
  const findBtn = document.getElementById('findMasters');
  const toForm = document.getElementById('toForm');

  toForm?.addEventListener('click', ()=>document.getElementById('requestBlock').scrollIntoView({behavior:'smooth'}));

  findBtn?.addEventListener('click', ()=>{
    const type = form.type.value;
    // перенаправляем на страницу мастеров с параметром type
    window.location.href = `masters.html?type=${encodeURIComponent(type)}`;
  });

  form?.addEventListener('submit', async (e)=>{
    e.preventDefault();
    const fd = new FormData(form);
    const data = Object.fromEntries(fd.entries());

    showPopup('Отправка заявки...');

    if (GOOGLE_SCRIPT_URL === 'https://script.google.com/macros/s/AKfycbx-DDv0LP_K5BK1RNjak_K6bwfFc9eCVJmaT1IIjiVvlDNcYYTcC_kP_-uki7lSqyMj0w/exec'){
      // Если нет Apps Script — просто перенаправляем и показываем сообщение
      showPopup('Заявка сохранена локально (Apps Script не настроен).', false);
      const params = new URLSearchParams(data).toString();
      window.location.href = `masters.html?${params}`;
      return;
    }

    try{
      const res = await fetch(GOOGLE_SCRIPT_URL, {
        method:'POST',headers:{'Content-Type':'application/json'},body:JSON.stringify(data)
      });
      if (!res.ok) throw new Error('Ошибка отправки');
      showPopup('Заявка отправлена успешно');
      // перенаправим с данными
      const params = new URLSearchParams(data).toString();
      window.location.href = `masters.html?${params}`;
    }catch(err){
      console.error(err);
      showPopup('Ошибка отправки заявки', true);
    }
  });
});
