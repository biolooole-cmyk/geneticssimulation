/*************************************************
 * genetics.js
 * Біологічне ядро симуляції спадковості
 *
 * ✔ коректний мейоз
 * ✔ ймовірнісна модель
 * ✔ mono / di
 * ✔ фенотипи (додані без ламання ядра)
 *************************************************/

/* =================================================
   1. СТРУКТУРА ЛОКУСІВ
   ================================================= */

const LOCI = {
  mono: ["A"],
  di: ["A", "B"]
};

/* =================================================
   2. ВАЛІДАЦІЯ ГЕНОТИПІВ
   ================================================= */

function validateGenotype(genotype, mode) {
  const loci = LOCI[mode];
  if (!loci) return false;

  if (genotype.length !== loci.length * 2) return false;

  for (let i = 0; i < loci.length; i++) {
    const pair = genotype.slice(i * 2, i * 2 + 2);
    const locus = loci[i];

    if (
      !pair.includes(locus) ||
      !pair.toLowerCase().includes(locus.toLowerCase())
    ) {
      return false;
    }
  }

  return true;
}

/* =================================================
   3. НОРМАЛІЗАЦІЯ ГЕНОТИПУ
   (канонічний запис, не для фенотипу)
   ================================================= */

function normalizeGenotype(genotype, mode) {
  const loci = LOCI[mode];
  let normalized = "";

  loci.forEach(locus => {
    const alleles = genotype
      .split("")
      .filter(a => a.toUpperCase() === locus);

    // A перед a — лише для канонічного запису
    alleles.sort();
    normalized += alleles.join("");
  });

  return normalized;
}

/* =================================================
   4. УТВОРЕННЯ ГАМЕТ (МЕЙОЗ)
   ================================================= */

function getGameteDistribution(genotype, mode) {
  genotype = normalizeGenotype(genotype, mode);
  const loci = LOCI[mode];

  let gametes = [{ seq: "", p: 1 }];

  loci.forEach((locus, index) => {
    const pair = genotype.slice(index * 2, index * 2 + 2);

    const alleles =
      pair[0] === pair[1] ? [pair[0]] : [pair[0], pair[1]];

    const next = [];

    gametes.forEach(g => {
      alleles.forEach(a => {
        next.push({
          seq: g.seq + a,
          p: g.p * (1 / alleles.length)
        });
      });
    });

    gametes = next;
  });

  const distribution = {};
  gametes.forEach(g => {
    distribution[g.seq] = (distribution[g.seq] || 0) + g.p;
  });

  return distribution;
}

/* =================================================
   5. ТЕОРЕТИЧНИЙ РОЗПОДІЛ ГЕНОТИПІВ
   ================================================= */

export function getTheoreticalDistribution(parent1, parent2, mode) {
  if (
    !validateGenotype(parent1, mode) ||
    !validateGenotype(parent2, mode)
  ) {
    throw new Error("Біологічно некоректний генотип батьків");
  }

  const g1 = getGameteDistribution(parent1, mode);
  const g2 = getGameteDistribution(parent2, mode);

  const offspring = {};

  for (const a in g1) {
    for (const b in g2) {
      const raw = a + b;
      const genotype = normalizeGenotype(raw, mode);
      const p = g1[a] * g2[b];

      offspring[genotype] = (offspring[genotype] || 0) + p;
    }
  }

  return offspring;
}

/* =================================================
   6. ГЕНОТИП → ФЕНОТИП
   (повне домінування, шкільний рівень)
   ================================================= */

/**
 * geneDefs = [
 *   {
 *     trait: "Колір насіння",
 *     dom: "A",
 *     rec: "a",
 *     domDesc: "жовте",
 *     recDesc: "зелене"
 *   }
 * ]
 */
export function genotypeToPhenotype(genotype, geneDefs) {
  if (genotype.length !== geneDefs.length * 2) {
    throw new Error("Генотип не відповідає опису генів");
  }

  const phenotype = [];

  geneDefs.forEach((gene, i) => {
    const pair = genotype.slice(i * 2, i * 2 + 2);
    const hasDominant = pair.includes(gene.dom);

    phenotype.push(
      `${gene.trait}: ${
        hasDominant ? gene.domDesc : gene.recDesc
      }`
    );
  });

  return phenotype.join("; ");
}

/* =================================================
   7. АГРЕГАЦІЯ ФЕНОТИПІВ
   ================================================= */

/**
 * Працює і з ймовірностями, і з кількостями
 */
export function aggregatePhenotypes(
  genotypeDistribution,
  geneDefs
) {
  const result = {};

  Object.entries(genotypeDistribution).forEach(
    ([genotype, value]) => {
      const phenotype =
        genotypeToPhenotype(genotype, geneDefs);

      result[phenotype] =
        (result[phenotype] || 0) + value;
    }
  );

  return result;
}
