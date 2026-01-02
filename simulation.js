/*************************************************
 * simulation.js
 * Стохастична симуляція спадковості
 * Рівень: гамети → зиготи → розподіл
 *************************************************/

import {
  getTheoreticalDistribution
} from "./genetics.js";

/* =================================================
   1. ДОПОМІЖНІ ФУНКЦІЇ
   ================================================= */

/**
 * Випадковий вибір елемента з урахуванням ймовірностей
 * distribution: { ключ: ймовірність }
 */
function weightedRandom(distribution) {
  const r = Math.random();
  let cumulative = 0;

  for (const key of Object.keys(distribution)) {
    cumulative += distribution[key];
    if (r <= cumulative) {
      return key;
    }
  }

  // Захист від похибок округлення
  return Object.keys(distribution).at(-1);
}

/* =================================================
   2. ОСНОВНА СИМУЛЯЦІЯ
   ================================================= */

/**
 * Стохастичне моделювання потомства
 *
 * parent1, parent2 — генотипи батьків
 * n — кількість нащадків
 * mode — mono | di
 *
 * Повертає об’єкт:
 * { генотип: кількість }
 */
export function simulate(parent1, parent2, n, mode) {
  if (!Number.isInteger(n) || n < 1) {
    throw new Error(
      "Кількість нащадків повинна бути додатним цілим числом"
    );
  }

  // Теоретичний розподіл зигот — основа експерименту
  const theoretical = getTheoreticalDistribution(
    parent1,
    parent2,
    mode
  );

  // Ініціалізація лічильників
  const results = {};
  for (const genotype in theoretical) {
    results[genotype] = 0;
  }

  // n незалежних актів запліднення
  for (let i = 0; i < n; i++) {
    const zygote = weightedRandom(theoretical);
    results[zygote]++;
  }

  return results;
}
