/*************************************************
 * charts.js
 * Візуалізація результатів симуляції
 * Працює і з генотипами, і з фенотипами
 *************************************************/

/* =================================================
   КОНСТАНТИ
   ================================================= */

const COLORS = {
  theory: "#4a6fa5",
  experiment: "#c44536"
};

const FONT = "12px system-ui";

/* =================================================
   ОЧИЩЕННЯ (викликається з app.js)
   ================================================= */

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
        <th>Категорія</th>
        <th>Теорія (%)</th>
        <th>Експеримент (%)</th>
      </tr>
    </thead>
    <tbody></tbody>
  `;

  const tbody = table.querySelector("tbody");

  const keys = Object.keys(theory).sort((a, b) =>
    a.localeCompare(b, "uk")
  );

  keys.forEach(key => {
    const theoryPct = (theory[key] * 100).toFixed(1);
    const expPct =
      ((experiment[key] || 0) / total * 100).toFixed(1);

    const tr = document.createElement("tr");
    tr.innerHTML = `
      <td class="label-cell">${key}</td>
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

export function renderBarChart(container, theory, experiment, total) {
  const canvas = document.createElement("canvas");

  const keys = Object.keys(theory);
  canvas.width = Math.max(700, keys.length * 140);
  canvas.height = 420;

  container.appendChild(canvas);

  const ctx = canvas.getContext("2d");
  ctx.font = FONT;

  const padding = 80;
  const chartHeight = canvas.height - padding * 2;
  const chartWidth = canvas.width - padding * 2;

  const sortedKeys = keys.sort((a, b) =>
    a.localeCompare(b, "uk")
  );

  const groupWidth = chartWidth / sortedKeys.length;
  const barWidth = groupWidth / 3;

  drawAxes(ctx, canvas, padding, chartHeight);

  sortedKeys.forEach((key, i) => {
    const theoryVal = theory[key] * 100;
    const expVal =
      ((experiment[key] || 0) / total) * 100;

    const xBase = padding + i * groupWidth;

    drawBar(
      ctx,
      xBase + barWidth * 0.5,
      theoryVal,
      barWidth,
      chartHeight,
      canvas.height - padding,
      COLORS.theory
    );

    drawBar(
      ctx,
      xBase + barWidth * 1.5,
      expVal,
      barWidth,
      chartHeight,
      canvas.height - padding,
      COLORS.experiment
    );

    drawLabel(
      ctx,
      key,
      xBase + groupWidth / 2,
      canvas.height - padding + 22,
      groupWidth
    );
  });

  drawLegend(ctx, canvas.width - 220, padding);
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

  [0, 25, 50, 75, 100].forEach(v => {
    const y =
      canvas.height - padding - (v / 100) * chartHeight;
    ctx.fillText(v + "%", padding - 8, y + 4);
  });

  ctx.save();
  ctx.translate(25, canvas.height / 2);
  ctx.rotate(-Math.PI / 2);
  ctx.textAlign = "center";
  ctx.fillText("Частота (%)", 0, 0);
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

function drawLabel(ctx, text, x, y, maxWidth) {
  ctx.fillStyle = "#000";
  ctx.textAlign = "center";

  const words = text.split(" ");
  let line = "";
  let offsetY = 0;

  words.forEach(word => {
    const test = line + word + " ";
    if (ctx.measureText(test).width > maxWidth) {
      ctx.fillText(line, x, y + offsetY);
      line = word + " ";
      offsetY += 14;
    } else {
      line = test;
    }
  });

  ctx.fillText(line, x, y + offsetY);
}

