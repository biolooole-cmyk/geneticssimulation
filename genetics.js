/*************************************************
 * genetics.js
 * Наукова модель спадковості (Мендель)
 * Рівні: генотип → гамети → зиготи → фенотип
 *************************************************/

/* =================================================
   1. ЗАГАЛЬНІ НАЛАШТУВАННЯ
   ================================================= */

/**
 * Локусна структура моделі
 * mono — один ген (A)
 * di   — два гени (A, B)
 */
const LOCI = {
  mono: ["A"],
  di: ["A", "B"]
};

/* =================================================
   2. ВАЛІДАЦІЯ ТА НОРМАЛІЗАЦІЯ ГЕНОТИПІВ
   ================================================= */

/**
 * Перевіряє біологічну коректність генотипу
 */
function validateGenotype(genotype, mode) {
  const loci = LOCI[mode];
  if (!loci) return false;

  // Довжина генотипу має відповідати кількості локусів
  if (genotype.length !== loci.length * 2) return false;

  for (let i = 0; i < loci.length; i++) {
    const pair = genotype.slice(i * 2, i * 2 + 2);
    const locus = loci[i];

    // У парі мають бути відповідні алелі (наприклад A та a)
    if (
      !pair.includes(locus) ||
      !pair.toLowerCase().includes(locus.toLowerCase())
    ) {
      return false;
    }
  }

  return true;
}

/**
 * Приводить генотип до канонічного вигляду
 * Наприклад: aA → Aa, BbAa → AaBb
 */
function normalizeGenotype(genotype, mode) {
  const loci = LOCI[mode];
  let normalized = "";

  loci.forEach(locus => {
    const alleles = genotype
      .split("")
      .filter(a => a.toUpperCase() === locus);

    // Домінантний алель завжди перший
    alleles.sort();
    normalized += alleles.join("");
  });

  return normalized;
}

/* =================================================
   3. УТВОРЕННЯ ГАМЕТ (МЕЙОЗ)
   ================================================= */

/**
 * Формує розподіл гамет
 * Повертає об’єкт вигляду:
 * { гамета: ймовірність }
 */
function getGameteDistribution(genotype, mode) {
  genotype = normalizeGenotype(genotype, mode);
  const loci = LOCI[mode];

  // Початковий набір (порожня гамета з імовірністю 1)
  let gametes = [{ seq: "", p: 1 }];

  loci.forEach((locus, index) => {
    const pair = genotype.slice(index * 2, index * 2 + 2);

    // Якщо алелі однакові — варіант лише один
    const alleles =
      pair[0] === pair[1] ? [pair[0]] : [pair[0], pair[1]];

    const newGametes = [];

    gametes.forEach(g => {
      alleles.forEach(a => {
        newGametes.push({
          seq: g.seq + a,
          p: g.p * (1 / alleles.length)
        });
      });
    });

    gametes = newGametes;
  });

  // Агрегація ймовірностей однакових гамет
  const distribution = {};
  gametes.forEach(g => {
    distribution[g.seq] = (distribution[g.seq] || 0) + g.p;
  });

  return distribution;
}

/* =================================================
   4. ТЕОРЕТИЧНИЙ РОЗПОДІЛ ЗИГОТ
   ================================================= */

/**
 * Обчислює теоретичний розподіл генотипів нащадків
 */
export function getTheoreticalDistribution(parent1, parent2, mode) {
  if (
    !validateGenotype(parent1, mode) ||
    !validateGenotype(parent2, mode)
  ) {
    throw new Error(
      "Біологічно некоректний генотип одного з батьків"
    );
  }

  const g1 = getGameteDistribution(parent1, mode);
  const g2 = getGameteDistribution(parent2, mode);

  const offspring = {};

  // Комбінація гамет → зиготи
  for (const gam1 in g1) {
    for (const gam2 in g2) {
      const zygoteRaw = gam1 + gam2;
      const zygote = normalizeGenotype(zygoteRaw, mode);
      const p = g1[gam1] * g2[gam2];

      offspring[zygote] = (offspring[zygote] || 0) + p;
    }
  }

  return offspring;
}

/* =================================================
   5. ФЕНОТИП (ПОВНЕ ДОМІНУВАННЯ)
   ================================================= */

/**
 * Перетворює генотип на фенотип
 * (припущення: повне домінування)
 */
export function genotypeToPhenotype(genotype, mode) {
  genotype = normalizeGenotype(genotype, mode);

  if (mode === "mono") {
    return genotype.includes("A")
      ? "Домінантний фенотип"
      : "Рецесивний фенотип";
  }

  // Дигібридний випадок
  const phenotype = [];

  phenotype.push(
    genotype.slice(0, 2).includes("A") ? "A-" : "aa"
  );
  phenotype.push(
    genotype.slice(2).includes("B") ? "B-" : "bb"
  );

  return phenotype.join(" ");
}
