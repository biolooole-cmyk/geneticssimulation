/*************************************************
 * charts.js
 * Візуалізація результатів генетичної симуляції
 * 9 клас — стабільна версія для GitHub Pages
 *************************************************/

/* ===============================================
   СТАН
   =============================================== */

let charts = [];

/* ===============================================
   ОЧИЩЕННЯ
   =============================================== */

export function clearCharts(container) {
  charts.forEach(c => c.destroy());
  charts = [];
  container.innerHTML = "";
}

/* ===============================================
   ВІЗУАЛЬНІ ФЕНОТИПИ
   =============================================== */

/*
  Ключі фенотипів приходять з aggregatePhenotypes(),
  наприклад:
  "жовте"
  "зелене"
  "гладке"
  "зморшкувате"
  "жовте + гладке"
*/

function phenotypeIcon(key) {
  let icons = "";

  // Колір
  if (key.includes("жовте")) {
    icons += `<span class="seed yellow"></span>`;
  }
  if (key.includes("зелене")) {
    icons += `<span class="seed green"></span>`;
  }

  // Форма
  if (key.includes("гладке")) {
    icons += `<span class="shape round"></span>`;
  }
  if (key.includes("зморшкувате")) {
    icons += `<span class="shape wrinkled"></span>`;
  }

  // fallback
  if (!icons) {
    icons = `<span class="seed hetero"></span>`;
  }

  return icons;
}

/* ===============================================
   ТАБЛИЦЯ ПОРІВНЯННЯ
   =============================================== */

export function renderComparisonTable(
  container,
  theory,
  experiment,
  total
) {
  const table = document.createElement("table");
  table.className = "result-table";

  table.innerHTML = `
    <thead>
      <tr>
        <th>Фенотип</th>
        <th>Теорія (%)</th>
        <th>Експеримент (%)</th>
      </tr>
    </thead>
    <tbody></tbody>
  `;

  const tbody = table.querySelector("tbody");
  const keys = Object.keys({ ...theory, ...experiment });

  keys.forEach(key => {
    const t = theory[key] || 0;
    const e = experiment[key] || 0;

    const row = document.createElement("tr");
    row.innerHTML = `
      <td class="label-cell">
        ${phenotypeIcon(key)}
        <span>${key}</span>
      </td>
      <td>${((t / total) * 100).toFixed(1)}</td>
      <td>${((e / total) * 100).toFixed(1)}</td>
    `;
    tbody.appendChild(row);
  });

  container.appendChild(table);
}

/* ===============================================
   СТОВПЧИКОВА ДІАГРАМА
   =============================================== */

export function renderBarChart(
  container,
  theory,
  experiment,
  total
) {
  if (typeof Chart === "undefined") {
    console.error("Chart.js не підключений");
    return;
  }

  const canvas = document.createElement("canvas");
  container.appendChild(canvas);

  const labels = Object.keys({ ...theory, ...experiment });

  const theoryData = labels.map(
    l => ((theory[l] || 0) / total) * 100
  );

  const expData = labels.map(
    l => ((experiment[l] || 0) / total) * 100
  );

  const chart = new Chart(canvas, {
    type: "bar",
    data: {
      labels,
      datasets: [
        {
          label: "Теоретично",
          data: theoryData,
          backgroundColor: "rgba(74, 111, 165, 0.6)"
        },
        {
          label: "Експериментально",
          data: expData,
          backgroundColor: "rgba(196, 69, 54, 0.6)"
        }
      ]
    },
    options: {
      responsive: true,
      plugins: {
        legend: {
          position: "top"
        }
      },
      scales: {
        y: {
          beginAtZero: true,
          title: {
            display: true,
            text: "Відсоток (%)"
          }
        }
      }
    }
  });

  charts.push(chart);
}

