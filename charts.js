/*************************************************
 * charts.js
 * Наукова візуалізація результатів симуляції
 * Порівняння: теорія ↔ експеримент
 *************************************************/

/* =================================================
   КОНСТАНТИ
   ================================================= */

const COLORS = {
  theory: "#4a6fa5",
  experiment: "#c44536"
};

const FONT = "12px Arial";

/* =================================================
   ОЧИЩЕННЯ
   ================================================= */

/**
 * Очищає контейнер перед повторним рендером
 */
export function clearCharts(container) {
  container.innerHTML = "";
}

/* =================================================
   1. ТАБЛИЦЯ ПОРІВНЯННЯ
   ================================================= */

export function renderComparisonTable(container, theory, experiment, total) {
  const table = document.createElement("table");
  table.className = "result-table";

  table.innerHTML = `
    <thead>
      <tr>
        <th>Генотип</th>
        <th>Теорія (%)</th>
        <th>Експеримент (%)</th>
      </tr>
    </thead>
    <tbody></tbody>
  `;

  const tbody = table.querySelector("tbody");

  // стабільний порядок генотипів
  const genotypes = Object.keys(theory).sort();

  genotypes.forEach(genotype => {
    const tr = document.createElement("tr");

    const theoryPct = (theory[genotype] * 100).toFixed(1);
    const expPct =
      ((experiment[genotype] || 0) / total * 100).toFixed(1);

    tr.innerHTML = `
      <td>${genotype}</td>
      <td>${theoryPct}</td>
      <td>${expPct}</td>
    `;

    tbody.appendChild(tr);
  });

  container.appendChild(table);
}

/* =================================================
   2. СТОВПЧИКОВА ДІАГРАМА
   ================================================= */

/**
 * Малює порівняльну стовпчикову діаграму
 * Вісь Y зафіксована: 0–100% (усвідомлене методичне рішення)
 */
export function renderBarChart(container, theory, experiment, total) {
  // очищення контейнера від попередніх canvas
  const oldCanvas = container.querySelector("canvas");
  if (oldCanvas) oldCanvas.remove();

  const canvas = document.createElement("canvas");
  canvas.width = 700;
  canvas.height = 420;
  canvas.setAttribute(
    "aria-label",
    "Порівняння теоретичних та експериментальних частот генотипів"
  );

  container.appendChild(canvas);

  const ctx = canvas.getContext("2d");
  ctx.font = FONT;

  const padding = 70;
  const chartWidth = canvas.width - padding * 2;
  const chartHeight = canvas.height - padding * 2;

  const genotypes = Object.keys(theory).sort();

  const groupWidth = chartWidth / genotypes.length;
  const barWidth = groupWidth / 3;

  drawAxes(ctx, canvas, padding, chartHeight);

  genotypes.forEach((g, i) => {
    const theoryVal = theory[g] * 100;
    const expVal =
      ((experiment[g] || 0) / total) * 100;

    const xBase = padding + i * groupWidth;

    // теорія
    drawBar(
      ctx,
      xBase + barWidth * 0.5,
      theoryVal,
      barWidth,
      chartHeight,
      canvas.height - padding,
      COLORS.theory
    );

    // експеримент
    drawBar(
      ctx,
      xBase + barWidth * 1.5,
      expVal,
      barWidth,
      chartHeight,
      canvas.height - padding,
      COLORS.experiment
    );

    // підпис генотипу
    ctx.fillStyle = "#000";
    ctx.textAlign = "center";
    ctx.fillText(
      g,
      xBase + groupWidth / 2,
      canvas.height - padding + 18
    );
  });

  drawLegend(ctx, canvas.width - 200, padding);
}

/* =================================================
   3. ДОПОМІЖНІ ФУНКЦІЇ
   ================================================= */

function drawAxes(ctx, canvas, padding, chartHeight) {
  ctx.strokeStyle = "#000";
  ctx.beginPath();
  ctx.moveTo(padding, padding);
  ctx.lineTo(padding, canvas.height - padding);
  ctx.lineTo(canvas.width - padding, canvas.height - padding);
  ctx.stroke();

  ctx.textAlign = "right";

  // фіксована шкала 0–100%
  [0, 25, 50, 75, 100].forEach(v => {
    const y =
      canvas.height - padding - (v / 100) * chartHeight;
    ctx.fillText(v + "%", padding - 8, y + 4);
  });

  // підпис осі Y
  ctx.save();
  ctx.translate(25, canvas.height / 2);
  ctx.rotate(-Math.PI / 2);
  ctx.textAlign = "center";
  ctx.fillText("Частота генотипів (%)", 0, 0);
  ctx.restore();
}

function drawBar(ctx, x, value, width, height, baseY, color) {
  const h = (value / 100) * height;
  ctx.fillStyle = color;
  ctx.fillRect(x, baseY - h, width, h);
}

function drawLegend(ctx, x, y) {
  ctx.textAlign = "left";

  ctx.fillStyle = COLORS.theory;
  ctx.fillRect(x, y, 14, 14);
  ctx.fillStyle = "#000";
  ctx.fillText("Теорія", x + 22, y + 12);

  ctx.fillStyle = COLORS.experiment;
  ctx.fillRect(x, y + 24, 14, 14);
  ctx.fillStyle = "#000";
  ctx.fillText("Експеримент", x + 22, y + 36);
}

