// --- НОРМАЛИЗАЦИЯ КАТЕГОРИЙ ---
const CATEGORY_NORMALIZE = {
    wash: "washing_machine",
    washer: "washing_machine",
    washing_machine: "washing_machine",

    fridge: "fridge",

    dishwasher: "dishwasher",

    oven: "oven",

    conditioner: "ac",
    conditioners: "ac",
    ac: "ac"
};

const CATEGORY_RU = {
    washing_machine: "Стиральная машина",
    fridge: "Холодильник",
    dishwasher: "Посудомоечная машина",
    oven: "Духовой шкаф",
    ac: "Кондиционер"
};

// --- ПАРСЕР CSV ---
function parseCSV(data) {
    const lines = data.split("\n").map(i => i.trim()).filter(i => i.length > 0);
    const headers = lines[0].split(",");

    const result = [];

    for (let i = 1; i < lines.length; i++) {
        const row = lines[i].split(",");
        if (row.length !== headers.length) continue;

        const obj = {};
        for (let j = 0; j < headers.length; j++) {
            obj[headers[j]] = row[j];
        }
        result.push(obj);
    }

    return result;
}

// --- ЗАГРУЗКА МАСТЕРОВ ---
async function loadMasters() {
    try {
        const response = await fetch(
            "https://docs.google.com/spreadsheets/d/e/2PACX-1vRuW7v0Dq7HqRhZ9VfQ1yFbY8iNmK3s41oY14QRKTIb_f7Zl5xSNrBNkVqrzLhcqx/pub?output=csv"
        );
        const csvText = await response.text();
        const rows = parseCSV(csvText);

        // нормализация данных
        return rows.map(row => {
            const normalizedCategory = CATEGORY_NORMALIZE[row.category] || row.category;
            return {
                name: row.fio,
                exp: row.exp,
                phone: row.phone,
                photo: row.photo,
                category: normalizedCategory
            };
        });
    } catch (err) {
        console.error("Ошибка загрузки CSV:", err);
        return [];
    }
}

// --- ОТОБРАЖЕНИЕ МАСТЕРОВ ---
function renderMasters(list) {
    const container = document.getElementById("masters-container");
    container.innerHTML = "";

    if (list.length === 0) {
        container.innerHTML = "<p class='no-masters'>Мастера не найдены.</p>";
        return;
    }

    list.forEach(master => {
        const card = document.createElement("div");
        card.className = "master-card";
        card.innerHTML = `
            <img src="${master.photo}" class="master-photo">
            <h3>${master.name}</h3>
            <p>Стаж: ${master.exp} лет</p>
            <p>Категория: ${CATEGORY_RU[master.category] || master.category}</p>
        `;

        card.onclick = () => openModal(master);
        container.appendChild(card);
    });
}

// --- МОДАЛКА ---
function openModal(master) {
    const modal = document.getElementById("master-modal");
    modal.querySelector(".modal-photo").src = master.photo;
    modal.querySelector(".modal-name").textContent = master.name;
    modal.querySelector(".modal-exp").textContent = `${master.exp} лет`;
    modal.querySelector(".modal-category").textContent = CATEGORY_RU[master.category];
    modal.querySelector(".call-btn").href = `tel:${master.phone}`;

    modal.classList.add("open");
}

document.getElementById("modal-close").onclick = () => {
    document.getElementById("master-modal").classList.remove("open");
};

// --- ПОДСТАНОВКА ДАННЫХ ЗАЯВКИ ---
function fillRequestInfo() {
    const params = new URLSearchParams(location.search);

    const type = CATEGORY_NORMALIZE[params.get("type")] || "-";
    document.getElementById("req-type").textContent = CATEGORY_RU[type] || "-";

    document.getElementById("req-model").textContent = params.get("model") || "-";
    document.getElementById("req-problem").textContent = params.get("problem") || "-";
}

// --- ФИЛЬТР ---
function applyFilter(masters) {
    const params = new URLSearchParams(location.search);
    const reqType = CATEGORY_NORMALIZE[params.get("type")];

    if (!reqType) return masters;

    return masters.filter(m => m.category === reqType);
}

// --- ЗАПУСК ---
(async function() {
    fillRequestInfo();

    const masters = await loadMasters();
    const filtered = applyFilter(masters);

    renderMasters(filtered);
})();
