/*************************************************
 * app.js
 * Керування генетичною симуляцією
 * Ген → алелі → генотип → теорія → експеримент
 *************************************************/

import { getTheoreticalDistribution } from "./genetics.js";
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
  rec: document.getElementById("gene1-rec-symbol")
};

// Ген 2
const gene2Block = document.getElementById("gene2-block");
const gene2 = {
  trait: document.getElementById("gene2-trait"),
  dom: document.getElementById("gene2-dom-symbol"),
  rec: document.getElementById("gene2-rec-symbol")
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

  // оновлення селектів при зміні алелів
  [gene1.dom, gene1.rec, gene2.dom, gene2.rec].forEach(input => {
    input.addEventListener("input", updateParentSelectors);
  });

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
  const trait = gene.trait.value.trim();
  const dom = gene.dom.value.trim();
  const rec = gene.rec.value.trim();

  if (!trait) {
    throw new Error(`Не вказана ознака для гена ${index}`);
  }

  if (!dom || !rec) {
    throw new Error(`Не вказані алелі для гена ${index}`);
  }

  if (dom === rec) {
    throw new Error(`Алелі гена ${index} мають бути різними`);
  }

  if (!/^[A-Za-z]$/.test(dom) || !/^[A-Za-z]$/.test(rec)) {
    throw new Error(`Алелі гена ${index} мають бути однією літерою`);
  }

  return { dom, rec };
}

/* =================================================
   6. PARENTS
   ================================================= */

function clearParentSelectors() {
  Object.values(parents).forEach(parent => {
    Object.values(parent).forEach(gene =>
      gene.forEach(sel => (sel.innerHTML = ""))
    );
  });
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

function collectGenotype(parentKey, genes) {
  let genotype = "";

  genes.forEach(gene => {
    const [a1, a2] = parents[parentKey][gene.key].map(sel => sel.value);

    if (!a1 || !a2) {
      throw new Error("Не всі алелі обрані у батьків");
    }

    genotype +=
      a1 === a2
        ? a1 + a2
        : (a1 === gene.dom ? a1 + a2 : a2 + a1);
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
    const genes = [{ key: "g1", ...g1 }];

    if (mode === "di") {
      const g2 = validateGene(gene2, 2);
      genes.push({ key: "g2", ...g2 });
    }

    const p1Genotype = collectGenotype("p1", genes);
    const p2Genotype = collectGenotype("p2", genes);

    const n = parseInt(offspringInput.value, 10);
    if (!Number.isInteger(n) || n < 1) {
      throw new Error("Некоректна кількість нащадків");
    }

    const theory = getTheoreticalDistribution(
      p1Genotype,
      p2Genotype,
      mode
    );

    const exp = simulate(
      p1Genotype,
      p2Genotype,
      n,
      mode
    );

    renderResults(p1Genotype, p2Genotype, theory, exp, n);
  } catch (err) {
    alert(err.message);
  }
}

/* =================================================
   8. OUTPUT
   ================================================= */

function renderResults(p1, p2, theory, exp, n) {
  clearCharts(output);

  const info = document.createElement("div");
  info.innerHTML = `
    <h3>Генотипи батьків</h3>
    <p>Батько 1: <strong>${p1}</strong></p>
    <p>Батько 2: <strong>${p2}</strong></p>
  `;

  output.appendChild(info);

  renderComparisonTable(output, theory, exp, n);
  renderBarChart(output, theory, exp, n);
}


