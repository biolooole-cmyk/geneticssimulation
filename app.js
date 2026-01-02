/*************************************************
 * app.js
 * Генетична симуляція (9 клас)
 * ФІНАЛЬНА, ВИПРАВЛЕНА, ПОВНА ВЕРСІЯ
 *************************************************/

import {
  getTheoreticalDistribution,
  aggregatePhenotypes
} from "./genetics.js";

import { simulate } from "./simulation.js";

import {
  clearCharts,
  renderComparisonTable,
  renderBarChart
} from "./charts.js";

/* ===============================================
   DOM READY
   =============================================== */

document.addEventListener("DOMContentLoaded", () => {

  /* ---------- DOM ---------- */
  const modelRadios = document.querySelectorAll('input[name="model"]');
  const trait2Block = document.getElementById("trait2");
  const runBtn = document.getElementById("run");
  const output = document.getElementById("output");
  const offspringInput = document.getElementById("offspring");

  /* ===============================================
     INIT
     =============================================== */

  modelRadios.forEach(r =>
    r.addEventListener("change", updateModel)
  );

  runBtn.addEventListener("click", runSimulation);
  updateModel();

  /* ===============================================
     MODE
     =============================================== */

  function getMode() {
    return [...modelRadios].find(r => r.checked).value;
  }

  function updateModel() {
    const mode = getMode();
    trait2Block.style.display = mode === "di" ? "block" : "none";
  }

  /* ===============================================
     DATA COLLECTION
     =============================================== */

  function getChecked(name, label) {
    const el = document.querySelector(`input[name="${name}"]:checked`);
    if (!el) {
      throw new Error(`Оберіть ${label}`);
    }
    return el.value;
  }

  function collectParentGenotypes() {
    const mode = getMode();

    const p1g1 = getChecked("p1-g1", "ознаку 1 для Батька 1");
    const p2g1 = getChecked("p2-g1", "ознаку 1 для Батька 2");

    let p1 = p1g1;
    let p2 = p2g1;

    if (mode === "di") {
      const p1g2 = getChecked("p1-g2", "ознаку 2 для Батька 1");
      const p2g2 = getChecked("p2-g2", "ознаку 2 для Батька 2");

      // локусне формування
      p1 = `${p1g1}${p1g2}`;
      p2 = `${p2g1}${p2g2}`;
    }

    return { p1, p2 };
  }

  /* ===============================================
     SIMULATION
     =============================================== */

  function runSimulation() {
    try {
      clearCharts(output);

      const { p1, p2 } = collectParentGenotypes();

      const n = parseInt(offspringInput.value, 10);
      if (!Number.isInteger(n) || n < 20) {
        throw new Error("Кількість нащадків має бути не менше 20");
      }

      const mode = getMode();

      /* ----- Опис генів (стабільний) ----- */
      const geneDefs = [
        {
          trait: "Колір насіння",
          dom: "A",
          rec: "a",
          domDesc: "жовте",
          recDesc: "зелене"
        }
      ];

      if (mode === "di") {
        geneDefs.push({
          trait: "Форма насіння",
          dom: "B",
          rec: "b",
          domDesc: "гладке",
          recDesc: "зморшкувате"
        });
      }

      /* ----- Теорія ----- */
      const theoryGenotypes =
        getTheoreticalDistribution(p1, p2, mode);

      /* ----- Експеримент ----- */
      const experimentalGenotypes =
        simulate(p1, p2, n, mode);

      /* ----- Фенотипи ----- */
      const theoryPhenotypes =
        aggregatePhenotypes(theoryGenotypes, geneDefs);

      const experimentalPhenotypes =
        aggregatePhenotypes(experimentalGenotypes, geneDefs);

      renderResults(
        p1,
        p2,
        theoryGenotypes,
        experimentalGenotypes,
        theoryPhenotypes,
        experimentalPhenotypes,
        n
      );

    } catch (err) {
      alert(err.message);
    }
  }

  /* ===============================================
     OUTPUT
     =============================================== */

  function renderResults(
    p1,
    p2,
    theoryGen,
    expGen,
    theoryPheno,
    expPheno,
    total
  ) {
    const info = document.createElement("div");
    info.innerHTML = `
      <h3>Генотипи батьків</h3>
      <p>Батько 1: <strong>${p1}</strong></p>
      <p>Батько 2: <strong>${p2}</strong></p>
    `;
    output.appendChild(info);

    const genTitle = document.createElement("h3");
    genTitle.textContent = "Генотипи нащадків";
    output.appendChild(genTitle);

    renderComparisonTable(output, theoryGen, expGen, total);
    renderBarChart(output, theoryGen, expGen, total);

    output.appendChild(document.createElement("hr"));

    const phTitle = document.createElement("h3");
    phTitle.textContent = "Фенотипи нащадків";
    output.appendChild(phTitle);

    renderComparisonTable(output, theoryPheno, expPheno, total);
    renderBarChart(output, theoryPheno, expPheno, total);
  }

});

