// masters.js (обновлённый)
// Загружает CSV из Google Sheets, рендерит карточки мастеров,
// фильтрует/сортирует и заполняет блок "Ваша заявка".

const SHEET_URL = "https://docs.google.com/spreadsheets/d/e/2PACX-1vRY6KMZf4V6FC_dXc6yPEi1Yt1e267LVIC8Ewsm4IMTtEtwNOAeBEnrNsl-TWArKAylzdy6AipcUDf3/pub?output=csv";

// Соответствие значений select в форме -> как категории могут быть записаны в Google Sheet
const TYPE_MAP = {
  wash: "Стиральная машина",
  fridge: "Холодильник",
  pc: "Персональный компьютер",
  laptops: "Ноутбук",
  panel: "Варочная панель",
  conditioners: "Кондиционер",
  tv: "Телевизор"
};

function normalize(str){
  if (str == null) return '';
  return String(str).trim().toLowerCase().replace(/\s+/g,' ');
}

// Улучшенный CSV-парсер: поддерживает поля в кавычках и двойные кавычки внутри
function parseCSV(text){
  const rows = [];
  let cur = '';
  let row = [];
  let inQuotes = false;
  for(let i=0;i<text.length;i++){
    const ch = text[i];
    const next = text[i+1];

    if (ch === '"') {
      // если двойная кавычка подряд — это экранированная кавычка внутри поля
      if (inQuotes && next === '"') {
        cur += '"';
        i++; // пропускаем второй
        continue;
      }
      inQuotes = !inQuotes;
      continue;
    }

    if (ch === ',' && !inQuotes){
      row.push(cur);
      cur = '';
      continue;
    }

    if ((ch === '\n' || ch === '\r') && !inQuotes){
      // конец строки
      if (cur !== '' || row.length > 0){
        row.push(cur);
        rows.push(row);
      }
      row = [];
      cur = '';
      if (ch === '\r' && next === '\n') i++;
      continue;
    }

    cur += ch;
  }
  if (cur !== '' || row.length > 0){
    row.push(cur);
    rows.push(row);
  }
  return rows;
}

function showLocalError(msg){
  const container = document.getElementById('masters');
  if(container) container.innerHTML = `<p style="padding:16px;color:var(--text);opacity:0.9">${msg}</p>`;
  console.warn(msg);
}

function populateRequestInfo(){
  const params = new URLSearchParams(location.search);
  const rawType = params.get('type');
  const model = params.get('model') || params.get('model') || '—';
  const problem = params.get('problem') || params.get('problem') || '—';
  const typeDisplay = TYPE_MAP[rawType] || rawType || '—';

  const elType = document.getElementById('req-type');
  const elModel = document.getElementById('req-model');
  const elProblem = document.getElementById('req-problem');

  if (elType) elType.textContent = typeDisplay;
  if (elModel) elModel.textContent = model;
  if (elProblem) elProblem.textContent = problem;
}

function tryParseExp(expStr){
  if(!expStr) return 0;
  // извлечь число лет из строки, например "5 лет", "10", "3.5"
  const m = expStr.match(/[\d,.]+/);
  if(!m) return 0;
  return parseFloat(m[0].replace(',', '.')) || 0;
}

async function loadMasters(){
  populateRequestInfo();

  try{
    const resp = await fetch(SHEET_URL, {cache: "no-store"});
    if(!resp.ok) throw new Error('CSV fetch failed: ' + resp.status);
    let csv = await resp.text();
    csv = csv.trim();
    if(!csv) { showLocalError('Нет данных в таблице мастеров.'); return; }

    const rows = parseCSV(csv);
    if(rows.length < 1){ showLocalError('CSV не содержит строк'); return; }

    const headers = rows[0].map(h => (h||'').trim());
    const dataRows = rows.slice(1).filter(r=> r.some(c => String(c).trim() !== ''));

    // параметры из URL
    const urlParams = new URLSearchParams(window.location.search);
    const selectedTypeRaw = urlParams.get('type'); // это значение из select (например 'wash')
    const selectedTypeNorm = normalize(TYPE_MAP[selectedTypeRaw] || selectedTypeRaw || '');

    const sortParam = urlParams.get('sort'); // например 'exp'

    const container = document.getElementById('masters');
    if(!container) { console.warn('Контейнер masters не найден'); return; }
    container.innerHTML = '';

    const normalizeHeader = h => (h||'').trim().toLowerCase();

    dataRows.forEach((r, idx) => {
      const obj = {};
      headers.forEach((h,i) => obj[normalizeHeader(h)] = (r[i]||'').trim());

      // Поддерживаем разные варианты заголовков
      const fio = obj['фио'] || obj['fio'] || obj['name'] || '';
      const exp = obj['опыт'] || obj['exp'] || obj['experience'] || '';
      const photo = obj['фото'] || obj['photo'] || obj['image'] || '';
      const phone = obj['телефон'] || obj['phone'] || obj['tel'] || '';
      const category = (obj['категория'] || obj['category'] || '').trim();

      // фильтрация по типу (если задан)
      const categoryNorm = normalize(category);
      if (selectedTypeNorm && categoryNorm && selectedTypeNorm !== categoryNorm) {
        return;
      }

      const card = document.createElement('div');
      card.className = 'master-card';

      const imgSrc = photo || 'https://via.placeholder.com/150?text=No+Photo';
      const phoneHref = phone ? phone.replace(/\s+/g,'') : '';

      card.innerHTML = `
        <img class="master-photo" src="${imgSrc}" alt="${fio || 'Фото мастера'}">
        <div class="master-name">${fio || 'Без имени'}</div>
        <div class="master-exp">Опыт: ${exp || '—'}</div>
        <a class="master-phone" href="${phoneHref ? 'tel:' + phoneHref : '#'}">${phone ? 'Позвонить: '+phone : 'Тел: -'}</a>
      `;

      card.addEventListener('click', ()=>openPreview({fio,exp,photo:imgSrc,phone,category}));

      container.appendChild(card);
      setTimeout(()=>card.classList.add('visible'), idx*80);
    });

    // если задана сортировка, попробуем применить (по опыту)
    if (sortParam === 'exp'){
      const nodes = Array.from(container.querySelectorAll('.master-card'));
      nodes.sort((a,b)=>{
        const aExp = tryParseExp(a.querySelector('.master-exp')?.textContent || '');
        const bExp = tryParseExp(b.querySelector('.master-exp')?.textContent || '');
        return bExp - aExp;
      });
      container.innerHTML = '';
      nodes.forEach(n=>container.appendChild(n));
    }

    // если контейнер пуст — показать сообщение
    if(!container.children.length){
      container.innerHTML = `<p style="padding:16px;color:var(--text);opacity:0.85">Подходящих мастеров не найдено.</p>`;
    }

  }catch(e){
    console.error('loadMasters error', e);
    showLocalError('Ошибка загрузки мастеров — попробуйте позже.');
  }
}

function openPreview(data){
  const modal = document.getElementById('previewModal');
  const content = document.getElementById('modalContent');
  if(!modal || !content) return;
  const photo = data.photo || 'https://via.placeholder.com/120?text=No+Photo';
  const safePhone = data.phone ? data.phone.replace(/\s+/g,'') : '';
  content.innerHTML = `
    <div style="display:flex;gap:12px;align-items:center">
      <img src="${photo}" style="width:120px;height:120px;border-radius:12px;object-fit:cover">
      <div style="flex:1">
        <h3 style="margin:0 0 6px;color:var(--accent)">${data.fio||'Без имени'}</h3>
        <div style="font-size:0.95rem;margin-bottom:6px">Опыт: ${data.exp||'—'}</div>
        <div style="font-size:0.95rem">Категория: ${data.category||'-'}</div>
      </div>
    </div>
    <div style="margin-top:12px;text-align:right">
      ${ safePhone ? `<a class="button" href="tel:${safePhone}">Позвонить</a>` : `<button class="button" disabled>Телефон отсутствует</button>` }
    </div>
  `;
  modal.classList.remove('hidden');
}

// modal close handling — надёжно вешаем обработчики
window.addEventListener('load', ()=>{
  const closeBtn = document.getElementById('modalClose');
  const modal = document.getElementById('previewModal');
  if (closeBtn){
    closeBtn.addEventListener('click', ()=> modal.classList.add('hidden'));
  }
  if(modal){
    modal.addEventListener('click', (e)=>{
      if(e.target === modal) modal.classList.add('hidden');
    });
  }
});

// init
document.addEventListener('DOMContentLoaded', ()=>{
  loadMasters();
});
