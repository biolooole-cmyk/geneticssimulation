/*************************************************
 * app.js
 * Керування інтерфейсом генетичної симуляції
 *************************************************/

import { simulate } from "./simulation.js";
import { getTheoreticalDistribution } from "./genetics.js";
import { drawChart, clearChart } from "./charts.js";

/* ========= DOM-ЕЛЕМЕНТИ ========= */

const modeSelect = document.getElementById("mode");
const parent1Select = document.getElementById("parent1");
const parent2Select = document.getElementById("parent2");
const offspringInput = document.getElementById("offspring");

const runButton = document.getElementById("run");
const resetButton = document.getElementById("reset");

const theoryOutput = document.getElementById("theory-output");
const experimentOutput = document.getElementById("experiment-output");

/* ========= ДАНІ ========= */

// Можливі генотипи
const MONO_GENOTYPES = ["AA", "Aa", "aa"];

// Дигібридне схрещування — всі можливі генотипи
const DI_GENOTYPES = [
  "AABB", "AABb", "AAbb",
  "AaBB", "AaBb", "Aabb",
  "aaBB", "aaBb", "aabb"
];

/* ========= ІНІЦІАЛІЗАЦІЯ ========= */

init();

function init() {
  updateParentSelectors();
  attachEventListeners();
}

/* ========= ОБРОБНИКИ ПОДІЙ ========= */

function attachEventListeners() {
  modeSelect.addEventListener("change", updateParentSelectors);
  runButton.addEventListener("click", runSimulation);
  resetButton.addEventListener("click", resetSimulation);
}

/* ========= ЛОГІКА ІНТЕРФЕЙСУ ========= */

/**
 * Оновлює випадаючі списки генотипів
 * відповідно до типу схрещування
 */
function updateParentSelectors() {
  const mode = modeSelect.value;
  const genotypes = mode === "mono" ? MONO_GENOTYPES : DI_GENOTYPES;

  populateSelect(parent1Select, genotypes);
  populateSelect(parent2Select, genotypes);
}

/**
 * Заповнює select значеннями
 */
function populateSelect(selectElement, values) {
  selectElement.innerHTML = "";

  values.forEach(genotype => {
    const option = document.createElement("option");
    option.value = genotype;
    option.textContent = genotype;
    selectElement.appendChild(option);
  });
}

/* ========= СИМУЛЯЦІЯ ========= */

function runSimulation() {
  const parent1 = parent1Select.value;
  const parent2 = parent2Select.value;
  const offspringCount = parseInt(offspringInput.value, 10);

  if (!offspringCount || offspringCount < 1) {
    alert("Будь ласка, введіть коректну кількість нащадків.");
    return;
  }

  // Теоретичне очікування
  const theoretical = getTheoreticalDistribution(parent1, parent2, modeSelect.value);
  renderTheory(theoretical);

  // Експеримент
  const experimental = simulate(parent1, parent2, offspringCount, modeSelect.value);
  renderExperiment(experimental, offspringCount);

  // Візуалізація
  drawChart(
    Object.fromEntries(
      Object.entries(experimental).map(
        ([key, value]) => [key, value / offspringCount]
      )
    )
  );
}

/* ========= ВІДОБРАЖЕННЯ РЕЗУЛЬТАТІВ ========= */

/**
 * Виводить теоретичний розподіл
 */
function renderTheory(distribution) {
  theoryOutput.innerHTML = formatDistribution(
    distribution,
    "Очікувана ймовірність"
  );
}

/**
 * Виводить результати експерименту
 */
function renderExperiment(results, total) {
  const frequencies = {};

  Object.keys(results).forEach(key => {
    frequencies[key] = (results[key] / total).toFixed(3);
  });

  experimentOutput.innerHTML = formatDistribution(
    frequencies,
    "Відносна частота"
  );
}

/**
 * Форматує розподіл у вигляді таблиці
 */
function formatDistribution(data, label) {
  let html = `
    <table class="result-table">
      <tr>
        <th>Генотип</th>
        <th>${label}</th>
      </tr>`;

  for (const key in data) {
    html += `
      <tr>
        <td>${key}</td>
        <td>${data[key]}</td>
      </tr>`;
  }

  html += "</table>";
  return html;
}

/* ========= СКИДАННЯ ========= */

function resetSimulation() {
  theoryOutput.innerHTML = `
    <p class="placeholder">
      Запустіть симуляцію, щоб побачити теоретичні ймовірності.
    </p>`;

  experimentOutput.innerHTML = `
    <p class="placeholder">
      Тут з’являться результати випадкового моделювання.
    </p>`;

  clearChart();
}
