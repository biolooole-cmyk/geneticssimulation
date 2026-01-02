/*************************************************
 * app.js
 * Керування генетичною симуляцією
 * Ген → алелі → генотип → фенотип → візуалізація
 *
 * ВАЖЛИВО:
 * - app.js НЕ визначає домінування
 * - app.js НЕ нормалізує генотипи
 * - уся біологічна логіка — в genetics.js
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

/* =================================================
   1. DOM
   ================================================= */

const modelRadios = document.querySelectorAll('input[name="model"]');

// Ген 1
const gene1 = {
  trait: document.getElementById("gene1-trait"),
  dom: document.getElementById("gene1-dom-symbol"),
  rec: document.getElementById("gene1-rec-symbol"),
  domDesc: document.getElementById("gene1-dom-desc"),
  recDesc: document.getElementById("gene1-rec-desc")
};

// Ген 2
const gene2Block = document.getElementById("gene2-block");
const gene2 = {
  trait: document.getElementById("gene2-trait"),
  dom: document.getElementById("gene2-dom-symbol"),
  rec: document.getElementById("gene2-rec-symbol"),
  domDesc: document.getElementById("gene2-dom-desc"),
  recDesc: document.getElementById("gene2-rec-desc")
};

// Батьки
const parents = {
  p1: {
    g1: [
      document.getElementById("p1-g1-a1"),
      document.getElementById("p1-g1-a2")
    ],
    g2: [
      document.getElementById("p1-g2-a1"),
      document.getElementById("p1-g2-a2")
    ]
  },
  p2: {
    g1: [
      document.getElementById("p2-g1-a1"),
      document.getElementById("p2-g1-a2")
    ],
    g2: [
      document.getElementById("p2-g2-a1"),
      document.getElementById("p2-g2-a2")
    ]
  }
};

const offspringInput = document.getElementById("offspring");
const runBtn = document.getElementById("run");
const output = document.getElementById("output");

/* =================================================
   2. INIT
   ================================================= */

init();

function init() {
  attachEvents();
  updateModel();
}

/* =================================================
   3. EVENTS
   ================================================= */

function attachEvents() {
  modelRadios.forEach(r =>
    r.addEventListener("change", updateModel)
  );

  [
    gene1.dom, gene1.rec,
    gene2.dom, gene2.rec
  ].forEach(input =>
    input.addEventListener("input", updateParentSelectors)
  );

  runBtn.addEventListener("click", runSimulation);
}

/* =================================================
   4. MODEL
   ================================================= */

function getMode() {
  return [...modelRadios].find(r => r.checked).value;
}

function updateModel() {
  const mode = getMode();
  gene2Block.style.display = mode === "di" ? "block" : "none";
  clearParentSelectors();
  updateParentSelectors();
}

/* =================================================
   5. VALIDATION
   ================================================= */

function validateGene(gene, index) {
  if (!gene.trait.value.trim()) {
    throw new Error(`Не вказана ознака для гена ${index}`);
  }

  if (!gene.dom.value.trim() || !gene.rec.value.trim()) {
    throw new Error(`Не вказані алелі для гена ${index}`);
  }

  if (gene.dom.value === gene.rec.value) {
    throw new Error(`Алелі гена ${index} мають бути різними`);
  }

  return {
    trait: gene.trait.value.trim(),
    dom: gene.dom.value.trim(),
    rec: gene.rec.value.trim(),
    domDesc: gene.domDesc.value.trim(),
    recDesc: gene.recDesc.value.trim()
  };
}

/* =================================================
   6. PARENTS
   ================================================= */

function clearParentSelectors() {
  Object.values(parents).forEach(parent =>
    Object.values(parent).forEach(gene =>
      gene.forEach(sel => (sel.innerHTML = ""))
    )
  );
}

function fillSelectors(selectors, alleles) {
  selectors.forEach(sel => {
    sel.innerHTML = "";
    alleles.forEach(a => {
      const opt = document.createElement("option");
      opt.value = a;
      opt.textContent = a;
      sel.appendChild(opt);
    });
  });
}

function updateParentSelectors() {
  try {
    const g1 = validateGene(gene1, 1);
    fillSelectors(
      [...parents.p1.g1, ...parents.p2.g1],
      [g1.dom, g1.rec]
    );

    if (getMode() === "di") {
      const g2 = validateGene(gene2, 2);
      fillSelectors(
        [...parents.p1.g2, ...parents.p2.g2],
        [g2.dom, g2.rec]
      );
    }
  } catch {
    // користувач ще вводить дані
  }
}

/**
 * ЗБІР ГЕНОТИПУ:
 * app.js НЕ нормалізує і НЕ визначає домінування
 */
function collectGenotype(parentKey, genes) {
  let genotype = "";

  genes.forEach(gene => {
    const [a1, a2] =
      parents[parentKey][gene.key].map(sel => sel.value);

    if (!a1 || !a2) {
      throw new Error("Не всі алелі обрані у батьків");
    }

    genotype += a1 + a2;
  });

  return genotype;
}

/* =================================================
   7. SIMULATION
   ================================================= */

function runSimulation() {
  try {
    const mode = getMode();

    const g1 = validateGene(gene1, 1);
    const geneDefs = [{ ...g1 }];
    const genes = [{ key: "g1" }];

    if (mode === "di") {
      const g2 = validateGene(gene2, 2);
      geneDefs.push({ ...g2 });
      genes.push({ key: "g2" });
    }

    const p1Genotype = collectGenotype("p1", genes);
    const p2Genotype = collectGenotype("p2", genes);

    const n = parseInt(offspringInput.value, 10);
    if (!Number.isInteger(n) || n < 1) {
      throw new Error("Некоректна кількість нащадків");
    }

    const theoryGenotypes =
      getTheoreticalDistribution(p1Genotype, p2Genotype, mode);

    const expGenotypes =
      simulate(p1Genotype, p2Genotype, n, mode);

    const theoryPhenotypes =
      aggregatePhenotypes(theoryGenotypes, geneDefs);

    const expPhenotypes =
      aggregatePhenotypes(expGenotypes, geneDefs);

    renderResults(
      p1Genotype,
      p2Genotype,
      theoryGenotypes,
      expGenotypes,
      theoryPhenotypes,
      expPhenotypes,
      n
    );
  } catch (err) {
    alert(err.message);
  }
}

/* =================================================
   8. OUTPUT
   ================================================= */

function renderResults(
  p1,
  p2,
  theoryGen,
  expGen,
  theoryPheno,
  expPheno,
  n
) {
  clearCharts(output);

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

  renderComparisonTable(output, theoryGen, expGen, n);
  renderBarChart(output, theoryGen, expGen, n);

  output.appendChild(document.createElement("hr"));

  const phTitle = document.createElement("h3");
  phTitle.textContent = "Фенотипи нащадків";
  output.appendChild(phTitle);

  renderComparisonTable(output, theoryPheno, expPheno, n);
  renderBarChart(output, theoryPheno, expPheno, n);
}

