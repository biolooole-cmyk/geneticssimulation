/*************************************************
 * charts.js
 * Наукова візуалізація розподілів
 * Стовпчикова діаграма (частоти)
 *************************************************/

const CANVAS_ID = "chart";

/* =================================================
   1. ОТРИМАННЯ CANVAS
   ================================================= */

function getCanvasContext() {
  const canvas = document.getElementById(CANVAS_ID);
  if (!canvas) {
    throw new Error("Canvas з id='chart' не знайдено");
  }
  const ctx = canvas.getContext("2d");
  if (!ctx) {
    throw new Error("Не вдалося отримати 2D-контекст canvas");
  }
  return { canvas, ctx };
}

/* =================================================
   2. ОЧИЩЕННЯ ДІАГРАМИ
   ================================================= */

export function clearChart() {
  const { canvas, ctx } = getCanvasContext();
  ctx.clearRect(0, 0, canvas.width, canvas.height);
}

/* =================================================
   3. ПОБУДОВА ДІАГРАМИ
   ================================================= */

/**
 * data: { генотип: частота }, де частота ∈ [0; 1]
 */
export function drawChart(data) {
  const { canvas, ctx } = getCanvasContext();
  clearChart();

  const keys = Object.keys(data);
  if (keys.length === 0) return;

  /* ---- НАЛАШТУВАННЯ ---- */
  const padding = 60;
  const chartWidth = canvas.width - padding * 2;
  const chartHeight = canvas.height - padding * 2;

  // Фіксована шкала для частот
  const maxValue = 1;

  const barWidth = chartWidth / keys.length;

  /* ---- ОСІ ---- */
  ctx.strokeStyle = "#000";
  ctx.lineWidth = 1;

  // Вісь Y
  ctx.beginPath();
  ctx.moveTo(padding, padding);
  ctx.lineTo(padding, canvas.height - padding);
  ctx.stroke();

  // Вісь X
  ctx.beginPath();
  ctx.moveTo(padding, canvas.height - padding);
  ctx.lineTo(canvas.width - padding, canvas.height - padding);
  ctx.stroke();

  /* ---- ШКАЛА Y (ЧАСТОТА) ---- */
  ctx.font = "12px Arial";
  ctx.textAlign = "right";
  ctx.fillStyle = "#000";

  [0, 0.25, 0.5, 0.75, 1].forEach(v => {
    const y = canvas.height - padding - v * chartHeight;
    ctx.fillText(v.toFixed(2), padding - 5, y + 4);
    ctx.beginPath();
    ctx.moveTo(padding - 3, y);
    ctx.lineTo(padding, y);
    ctx.stroke();
  });

  /* ---- СТОВПЧИКИ ---- */
  ctx.fillStyle = "#4a6fa5";

  keys.forEach((key, i) => {
    const value = data[key];
    const height = value * chartHeight;

    const x = padding + i * barWidth;
    const y = canvas.height - padding - height;

    ctx.fillRect(
      x + barWidth * 0.1,
      y,
      barWidth * 0.8,
      height
    );

    // Підпис генотипу (вісь X)
    ctx.fillStyle = "#000";
    ctx.textAlign = "center";
    ctx.fillText(
      key,
      x + barWidth / 2,
      canvas.height - padding + 15
    );

    // Підпис значення
    ctx.fillText(
      value.toFixed(3),
      x + barWidth / 2,
      y - 5
    );

    ctx.fillStyle = "#4a6fa5";
  });

  /* ---- ПІДПИСИ ОСЕЙ ---- */

  // Підпис осі Y
  ctx.save();
  ctx.translate(20, canvas.height / 2);
  ctx.rotate(-Math.PI / 2);
  ctx.textAlign = "center";
  ctx.font = "14px Arial";
  ctx.fillStyle = "#000";
  ctx.fillText("Частота (0–1)", 0, 0);
  ctx.restore();

  // Підпис осі X
  ctx.textAlign = "center";
  ctx.fillText(
    "Генотипи нащадків",
    canvas.width / 2,
    canvas.height - 10
  );
}

