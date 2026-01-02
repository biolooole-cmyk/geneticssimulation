/*************************************************
 * app.js — СТАБІЛЬНА ВЕРСІЯ
 * Генетична симуляція для 9 класу
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
   DOM READY — ГАРАНТОВАНО
   =============================================== */

window.addEventListener("load", () => {

  /* ---------- DOM ---------- */
  const modelRadios = document.querySelectorAll('input[name="model"]');
  const trait2Block = document.getElementById("trait2");
  const runBtn = document.getElementById("run");
  const output = document.getElementById("output");
  const offspringInput = document.getElementById("offspring");

  /* ---------- SAFETY CHECK ---------- */
  if (!runBtn || modelRadios.length === 0) {
    console.error("DOM elements not found");
    return;
  }

  /* ===============================================
     MODEL TOGGLE
     =============================================== */

  function getMode() {
    const checked = [...modelRadios].find(r => r.checked);
    return checked ? checked.value : "mono";
  }

  function updateModel() {
    const mode = getMode();
    if (trait2Block) {
      trait2Block.style.display = mode === "di" ? "block" : "none";
    }
  }

  modelRadios.forEach(r =>
    r.addEventListener("change", updateModel)
  );

  updateModel();

  /* ===============================================
     DATA COLLECTION (БЕЗ ПАДІНЬ)
     =============================================== */

  function safeGet(name) {
    const el = document.querySelector(`input[name="${name}"]:checked`);
    return el ? el.value : null;
  }

  function collectParents() {
    const mode = getMode();

    const p1g1 = safeGet("p1-g1");
    const p2g1 = safeGet("p2-g1");

    if (!p1g1 || !p2g1) {
      alert("Оберіть обидві ознаки для першої ознаки");
      return null;
    }

    let p1 = p1g1;
    let p2 = p2g1;

    if (mode === "di") {
      const p1g2 = safeGet("p1-g2");
      const p2g2 = safeGet("p2-g2");

      if (!p1g2 || !p2g2) {
        alert("Оберіть обидві ознаки для другої ознаки");
        return null;
      }

      p1 = p1g1 + p1g2;
      p2 = p2g1 + p2g2;
    }

    return { p1, p2, mode };
  }

  /* ===============================================
     RUN SIMULATION — 100% СПРАЦЬОВУЄ
     =============================================== */

  runBtn.addEventListener("click", () => {

    clearCharts(output);

    const parents = collectParents();
    if (!parents) return;

    const n = parseInt(offspringInput.value, 10) || 200;
    const { p1, p2, mode } = parents;

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

    const theoryGen = getTheoreticalDistribution(p1, p2, mode);
    const expGen = simulate(p1, p2, n, mode);

    const theoryPh = aggregatePhenotypes(theoryGen, geneDefs);
    const expPh = aggregatePhenotypes(expGen, geneDefs);

    output.innerHTML = `<h3>Результати схрещування</h3>`;

    renderComparisonTable(output, theoryGen, expGen, n);
    renderBarChart(output, theoryGen, expGen, n);

    output.appendChild(document.createElement("hr"));

    renderComparisonTable(output, theoryPh, expPh, n);
    renderBarChart(output, theoryPh, expPh, n);
  });

});



