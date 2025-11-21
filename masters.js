// master loader: загружает CSV из Google Sheets и рендерит карточки
const SHEET_URL = "https://docs.google.com/spreadsheets/d/e/2PACX-1vRY6KMZf4V6FC_dXc6yPEi1Yt1e267LVIC8Ewsm4IMTtEtwNOAeBEnrNsl-TWArKAylzdy6AipcUDf3/pub?output=csv";

function parseCSV(text){
  // простой CSV-парсер, поддерживает значения в кавычках
  const rows = [];
  let cur = '';
  let row = [];
  let inQuotes = false;
  for(let i=0;i<text.length;i++){
    const ch = text[i];
    const next = text[i+1];
    if (ch === '"'){
      inQuotes = !inQuotes;
      continue;
    }
    if (ch === ',' && !inQuotes){ row.push(cur); cur=''; continue; }
    if ((ch === '\n' || ch === '\r') && !inQuotes){
      if (cur!=='' || row.length>0){ row.push(cur); rows.push(row); row=[]; cur=''; }
      // handle windows CRLF: skip next if \n follows \r
      if (ch === '\r' && next === '\n') i++;
      continue;
    }
    cur += ch;
  }
  // last
  if (cur!=='' || row.length>0){ row.push(cur); rows.push(row); }
  return rows;
}

async function loadMasters(){
  try{
    const resp = await fetch(SHEET_URL);
    if(!resp.ok) throw new Error('CSV fetch failed');
    let csv = await resp.text();
    // normalize
    csv = csv.trim();
    const rows = parseCSV(csv);
    if(rows.length < 2) return console.warn('No data');

    // Возможные заголовки: ФИО,Опыт,Фото,Телефон,Категория
    const headers = rows[0].map(h=>h.trim());
    const data = rows.slice(1).filter(r=>r.length>=1 && r.some(c=>c.trim()!=""));

    const urlParams = new URLSearchParams(window.location.search);
    const selectedType = urlParams.get('type');

    const container = document.getElementById('masters');
    container.innerHTML = '';

    data.forEach((r, idx)=>{
      const obj = {};
      headers.forEach((h,i)=> obj[h]= (r[i]||'').trim());

      // map Russian headers to keys
      const fio = obj['ФИО'] || obj['fio'] || obj['ФИО '];
      const exp = obj['Опыт'] || obj['exp'];
      const photo = obj['Фото'] || obj['photo'] || '';
      const phone = obj['Телефон'] || obj['phone'] || '';
      const category = (obj['Категория'] || obj['category'] || '').trim();

      if (selectedType && category && selectedType !== category) return; // фильтр

      const card = document.createElement('div');
      card.className = 'master-card';

      const imgSrc = photo || 'https://via.placeholder.com/150?text=No+Photo';
      card.innerHTML = `
        <img class="master-photo" src="${imgSrc}" alt="${fio||'Фото мастера'}">
        <div class="master-name">${fio||'Без имени'}</div>
        <div class="master-exp">Опыт: ${exp||'—'}</div>
        <a class="master-phone" href="tel:${phone||''}">${phone? 'Позвонить: '+phone : 'Тел: -'}</a>
      `;

      // preview on hover / click
      card.addEventListener('click', ()=>openPreview({fio,exp,photo:imgSrc,phone,category}));

      container.appendChild(card);
      // reveal animation delayed
      setTimeout(()=>card.classList.add('visible'), idx*80);
    });

  }catch(e){
    console.error('loadMasters error',e);
  }
}

function openPreview(data){
  const modal = document.getElementById('previewModal');
  const content = document.getElementById('modalContent');
  content.innerHTML = `
    <img src="${data.photo}" style="width:120px;height:120px;border-radius:12px;object-fit:cover;margin-bottom:12px">
    <h3 style="color:var(--accent)">${data.fio||'Без имени'}</h3>
    <p>Опыт: ${data.exp||'—'}</p>
    <p>Телефон: <a href="tel:${data.phone}">${data.phone||'-'}</a></p>
    <p>Категория: ${data.category||'-'}</p>
    <div style="margin-top:12px;text-align:right"><button class="button" onclick="location.href='tel:${data.phone}'">Позвонить</button></div>
  `;
  modal.classList.remove('hidden');
}

// modal close
window.addEventListener('load', ()=>{
  document.getElementById('modalClose')?.addEventListener('click', ()=>{
    document.getElementById('previewModal').classList.add('hidden');
  });
  document.getElementById('previewModal')?.addEventListener('click', (e)=>{ if(e.target.id==='previewModal') e.currentTarget.classList.add('hidden'); });
});

// init
document.addEventListener('DOMContentLoaded', ()=>{
  loadMasters();
});
