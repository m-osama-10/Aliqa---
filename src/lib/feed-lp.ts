/* ================================================================== */
/*  LINEAR PROGRAMMING SOLVER — Big-M Simplex Method                   */
/*                                                                     */
/*  Solves: minimize  c · x                                            */
/*          subject to A x {<=, =, >=} b                               */
/*                     0 <= x <= ub                                    */
/*                                                                     */
/*  Used by the feed formulation engine to find the cheapest balanced  */
/*  ration. Runs entirely client-side (offline-first, APK-ready).      */
/* ================================================================== */

type Rel = "<=" | ">=" | "=";

interface Constraint {
  coeff: number[];
  op: Rel;
  rhs: number;
}

interface LPResult {
  x: number[];
  obj: number;
  feasible: boolean;
}

const EPS = 1e-9;
const BIG_M = 1e7;
const MAX_ITER = 2000;

/**
 * Minimize c·x subject to constraints and variable upper bounds.
 * Returns null-equivalent (feasible=false) when infeasible.
 */
export function solveLP(
  cost: number[],
  constraints: Constraint[],
  upperBounds: number[]
): LPResult {
  const nVars = cost.length;

  // Fold upper bounds into constraint set (x_i <= ub_i).
  const allCons: Constraint[] = [...constraints];
  for (let i = 0; i < nVars; i++) {
    if (isFinite(upperBounds[i]) && upperBounds[i] < 1e9) {
      const coeff = new Array(nVars).fill(0);
      coeff[i] = 1;
      allCons.push({ coeff, op: "<=", rhs: upperBounds[i] });
    }
  }

  const nCon = allCons.length;
  let nSlack = 0;
  let nSurplus = 0;
  let nArt = 0;
  for (const c of allCons) {
    if (c.op === "<=") nSlack++;
    else if (c.op === ">=") {
      nSurplus++;
      nArt++;
    } else nArt++;
  }

  const totalVars = nVars + nSlack + nSurplus + nArt;

  // Build tableau A (nCon x totalVars), b (nCon), objective row (totalVars).
  const A: number[][] = Array.from({ length: nCon }, () =>
    new Array(totalVars).fill(0)
  );
  const b: number[] = new Array(nCon).fill(0);
  const obj: number[] = new Array(totalVars).fill(0);
  for (let i = 0; i < nVars; i++) obj[i] = cost[i];

  const basis: number[] = new Array(nCon).fill(-1);
  let slackIdx = nVars;
  let surpIdx = nVars + nSlack;
  let artIdx = nVars + nSlack + nSurplus;

  for (let i = 0; i < nCon; i++) {
    const c = allCons[i];
    for (let j = 0; j < nVars; j++) A[i][j] = c.coeff[j];
    b[i] = c.rhs;
    // Normalize negative rhs by flipping the row.
    if (b[i] < 0) {
      for (let j = 0; j < totalVars; j++) A[i][j] = -A[i][j];
      b[i] = -b[i];
      // Flip operator semantics for variable allocation.
      if (c.op === "<=") {
        // became >=
        A[i][surpIdx] = -1;
        A[i][artIdx] = 1;
        basis[i] = artIdx;
        obj[artIdx] = BIG_M;
        surpIdx++;
        artIdx++;
      } else if (c.op === ">=") {
        A[i][slackIdx] = 1;
        basis[i] = slackIdx;
        slackIdx++;
      } else {
        A[i][artIdx] = 1;
        basis[i] = artIdx;
        obj[artIdx] = BIG_M;
        artIdx++;
      }
      continue;
    }
    if (c.op === "<=") {
      A[i][slackIdx] = 1;
      basis[i] = slackIdx;
      slackIdx++;
    } else if (c.op === ">=") {
      A[i][surpIdx] = -1;
      A[i][artIdx] = 1;
      basis[i] = artIdx;
      obj[artIdx] = BIG_M;
      surpIdx++;
      artIdx++;
    } else {
      A[i][artIdx] = 1;
      basis[i] = artIdx;
      obj[artIdx] = BIG_M;
      artIdx++;
    }
  }

  // Simplex iterations (minimization): reduced cost = c_j - z_j.
  // Entering variable: most negative reduced cost.
  for (let iter = 0; iter < MAX_ITER; iter++) {
    // Compute reduced costs.
    let enter = -1;
    let best = -EPS;
    for (let j = 0; j < totalVars; j++) {
      let zj = 0;
      for (let i = 0; i < nCon; i++) zj += obj[basis[i]] * A[i][j];
      const reduced = obj[j] - zj;
      if (reduced < best) {
        best = reduced;
        enter = j;
      }
    }
    if (enter === -1) break; // optimal

    // Ratio test.
    let leave = -1;
    let minRatio = Infinity;
    for (let i = 0; i < nCon; i++) {
      if (A[i][enter] > EPS) {
        const ratio = b[i] / A[i][enter];
        if (ratio < minRatio - EPS) {
          minRatio = ratio;
          leave = i;
        }
      }
    }
    if (leave === -1) {
      // Unbounded — shouldn't happen for bounded feed LP.
      return { x: new Array(nVars).fill(0), obj: 0, feasible: false };
    }

    // Pivot.
    const piv = A[leave][enter];
    for (let j = 0; j < totalVars; j++) A[leave][j] /= piv;
    b[leave] /= piv;
    for (let i = 0; i < nCon; i++) {
      if (i !== leave && Math.abs(A[i][enter]) > EPS) {
        const factor = A[i][enter];
        for (let j = 0; j < totalVars; j++) A[i][j] -= factor * A[leave][j];
        b[i] -= factor * b[leave];
      }
    }
    basis[leave] = enter;
  }

  // Extract solution.
  const x = new Array(nVars).fill(0);
  for (let i = 0; i < nCon; i++) {
    if (basis[i] < nVars) x[basis[i]] = b[i];
  }

  // Feasibility: all artificial variables must be zero.
  let feasible = true;
  for (let i = 0; i < nCon; i++) {
    if (basis[i] >= nVars + nSlack + nSurplus) {
      if (b[i] > 1e-5) {
        feasible = false;
        break;
      }
    }
  }

  const objVal = cost.reduce((s, c, i) => s + c * x[i], 0);
  return { x, obj: objVal, feasible };
}

/* ================================================================== */
/*  FEED FORMULATION ENGINE                                            */
/* ================================================================== */

import {
  ANIMALS,
  INGREDIENTS,
  INGREDIENT_ORDER,
  type AnimalKey,
  type AnimalProfile,
  type FormulationMode,
  type FormulationResult,
  type IngredientKey,
} from "./feed-data";
import type { IngredientNutrition } from "./ingredient-db";

interface FormulateParams {
  animalKey: AnimalKey;
  weight: number;
  production: number;
  prices: Record<string, number>;
  mode: FormulationMode;
  flockSize?: number; // for poultry; defaults to 1
  ingredients: IngredientNutrition[]; // editable DB — all nutrition values read from here
}

/**
 * Smart Manual Balancing:
 * - User locks certain ingredients at specific percentages
 * - System re-balances ONLY the unlocked ingredients to meet targets
 * - Never adds ingredients that are at 0% (not in the ration)
 * - Only adjusts ingredients already in the ration
 * - If impossible, returns the best possible solution + explanation
 */
export interface FormulateWithLocksParams extends FormulateParams {
  /** Map of ingredient key → fixed percentage (user-locked) */
  lockedPercents: Record<string, number>;
  /** Which ingredient keys are in the current ration (non-zero) */
  activeKeys: string[];
}

export function formulateRationWithLocks(params: FormulateWithLocksParams): FormulationResult {
  const animal: AnimalProfile = ANIMALS[params.animalKey];
  const perAnimalDmi = animal.dmi(params.weight, params.production);
  const flockSize = Math.max(1, Math.round(params.flockSize ?? 1));
  const dmi = +(perAnimalDmi * flockSize).toFixed(3);

  // Build ingredient map from the editable DB
  const ingMap: Record<string, IngredientNutrition> = {};
  for (const ing of params.ingredients) ingMap[ing.key] = ing;

  // Locked ingredients (user-fixed) — these stay exactly as set
  const locked = params.lockedPercents;
  const lockedKeys = Object.keys(locked).filter((k) => locked[k] > 0);

  // Unlocked ingredients that are already in the ration (non-zero in activeKeys)
  // These are the ONLY ingredients we can adjust
  const adjustableKeys = params.activeKeys.filter(
    (k) => !lockedKeys.includes(k) && (locked[k] ?? 0) === 0
  );

  // Calculate what the locked ingredients contribute
  let lockedSum = 0;
  let lockedCp = 0;
  let lockedTdn = 0;
  let lockedFiber = 0;
  let lockedCost = 0;
  for (const k of lockedKeys) {
    const pct = locked[k] / 100;
    const ing = ingMap[k];
    if (!ing) continue;
    lockedSum += locked[k];
    lockedCp += pct * ing.protein;
    lockedTdn += pct * ing.tdn;
    lockedFiber += pct * ing.fiber;
    lockedCost += pct * (params.prices[k] ?? ing.price);
  }

  // Remaining percentage to fill with adjustable ingredients
  const remainingPct = 100 - lockedSum;
  if (remainingPct < 0) {
    // Locked ingredients exceed 100% — impossible
    return {
      dmi,
      perAnimalDmi,
      flockSize,
      components: [],
      totalCost: 0,
      costPerKg: 0,
      costPerMonth: 0,
      costPerAnimal: 0,
      costPerTon: 0,
      achieved: { cp: 0, tdn: 0, fiber: 0 },
      targets: { cpMin: animal.targets.cpMin, tdnMin: animal.targets.tdnMin, fiberMax: animal.targets.fiberMax },
      feasible: false,
      warnings: [`النسبة المثبتة (${lockedSum.toFixed(1)}%) تتجاوز 100%. لا يمكن إكمال التركيبة.`],
    };
  }

  // Nutrition targets (after mode relaxation)
  const relax = params.mode === "economy" ? 2.5 : 0;
  const relaxTdn = params.mode === "economy" ? 5 : 0;
  const relaxForage = params.mode === "economy" ? 8 : 0;
  const cpMin = Math.max(0, animal.targets.cpMin - relax);
  const tdnMin = Math.max(0, animal.targets.tdnMin - relaxTdn);
  const fiberMax = animal.targets.fiberMax;
  const forageMin = Math.max(0, animal.forageMin - relaxForage);

  // What the adjustable ingredients need to provide (per unit of their share)
  const remainingShare = remainingPct / 100;

  // Nutrition needed from adjustable ingredients (in absolute % terms)
  const cpNeeded = cpMin - lockedCp;
  const tdnNeeded = tdnMin - lockedTdn;
  const fiberAllowed = fiberMax * (1) - lockedFiber; // total fiber must stay under fiberMax

  // Build LP: minimize cost of adjustable ingredients
  // subject to: they sum to remainingPct, and meet nutrition targets
  const nVars = adjustableKeys.length;

  if (nVars === 0) {
    // No adjustable ingredients — check if locked alone meets targets
    const achieved = {
      cp: lockedCp,
      tdn: lockedTdn,
      fiber: lockedFiber,
    };
    const warnings: string[] = [];
    if (achieved.cp < cpMin) warnings.push(`البروتين ${achieved.cp.toFixed(1)}% أقل من المطلوب ${cpMin}%. لا توجد خامات قابلة للتعديل.`);
    if (achieved.tdn < tdnMin) warnings.push(`الطاقة ${achieved.tdn.toFixed(1)}% أقل من المطلوب ${tdnMin}%. لا توجد خامات قابلة للتعديل.`);
    if (achieved.fiber > fiberMax) warnings.push(`الألياف ${achieved.fiber.toFixed(1)}% أعلى من الحد الأقصى ${fiberMax}%.`);

    const components = lockedKeys.map((k) => {
      const ing = ingMap[k];
      const pct = locked[k];
      const kg = +((pct / 100) * dmi).toFixed(3);
      const cost = +(kg * (params.prices[k] ?? ing?.price ?? 0)).toFixed(2);
      return {
        ingredient: makeIngredientObj(k, ing),
        percent: pct,
        kg,
        cost,
      };
    });

    const totalCost = +components.reduce((s, c) => s + c.cost, 0).toFixed(2);
    return {
      dmi, perAnimalDmi, flockSize, components,
      totalCost,
      costPerKg: dmi > 0 ? +(totalCost / dmi).toFixed(2) : 0,
      costPerMonth: +(totalCost * 30).toFixed(2),
      costPerAnimal: +(totalCost / flockSize).toFixed(2),
    costPerTon: +((dmi > 0 ? totalCost / dmi : 0) * 1000).toFixed(2),
      achieved,
      targets: { cpMin, tdnMin, fiberMax },
      feasible: warnings.length === 0,
      warnings: warnings.length > 0 ? warnings : ["لا توجد خامات قابلة للتعديل. التركيبة الحالية هي الأفضل الممكنة."],
    };
  }

  // Cost vector for adjustable ingredients
  const cost = adjustableKeys.map((k) => params.prices[k] ?? ingMap[k]?.price ?? 0);

  const constraints: Constraint[] = [];

  // 1) Sum of adjustable = remainingPct/100
  constraints.push({
    coeff: new Array(nVars).fill(1),
    op: "=",
    rhs: remainingShare,
  });

  // 2) CP from adjustable >= cpNeeded/100 (if positive)
  if (cpNeeded > 0) {
    constraints.push({
      coeff: adjustableKeys.map((k) => (ingMap[k]?.protein ?? 0) / 100),
      op: ">=",
      rhs: cpNeeded / 100,
    });
  }

  // 3) TDN from adjustable >= tdnNeeded/100 (if positive)
  if (tdnNeeded > 0) {
    constraints.push({
      coeff: adjustableKeys.map((k) => (ingMap[k]?.tdn ?? 0) / 100),
      op: ">=",
      rhs: tdnNeeded / 100,
    });
  }

  // 4) Fiber from adjustable <= fiberAllowed/100 (if constraint is binding)
  if (fiberAllowed > 0) {
    constraints.push({
      coeff: adjustableKeys.map((k) => (ingMap[k]?.fiber ?? 0) / 100),
      op: "<=",
      rhs: fiberAllowed / 100,
    });
  }

  // 5) Forage constraint for ruminants (locked forage + adjustable forage >= forageMin)
  if (animal.species === "ruminant" && forageMin > 0) {
    const forageKeys = ["hay", "straw", "corn_silage"];
    let lockedForage = 0;
    for (const k of lockedKeys) {
      if (forageKeys.includes(k)) lockedForage += locked[k];
    }
    const forageNeeded = Math.max(0, forageMin - lockedForage);
    if (forageNeeded > 0) {
      const coeff = adjustableKeys.map((k) => (forageKeys.includes(k) ? 1 : 0));
      if (coeff.some((c) => c > 0)) {
        constraints.push({ coeff, op: ">=", rhs: forageNeeded / 100 });
      }
    }
  }

  // 6) Upper bounds for adjustable ingredients (from animal bounds or ingredient maxUsage)
  const upperBounds: number[] = adjustableKeys.map((k) => {
    const b = animal.bounds[k];
    const ing = ingMap[k];
    return (b ? b.ub : (ing?.maxUsage ?? 100)) / 100;
  });

  const result = solveLP(cost, constraints, upperBounds);

  // Build final components
  const allComponents = [];

  // Locked components
  for (const k of lockedKeys) {
    const ing = ingMap[k];
    const pct = locked[k];
    const kg = +((pct / 100) * dmi).toFixed(3);
    const c = +(kg * (params.prices[k] ?? ing?.price ?? 0)).toFixed(2);
    allComponents.push({ ingredient: makeIngredientObj(k, ing), percent: pct, kg, cost: c });
  }

  // Adjustable components (from LP)
  if (result.feasible) {
    for (let i = 0; i < nVars; i++) {
      const k = adjustableKeys[i];
      const ing = ingMap[k];
      const pct = result.x[i] * 100;
      if (pct < 0.05) continue;
      const kg = +(result.x[i] * dmi).toFixed(3);
      const c = +(result.x[i] * dmi * (params.prices[k] ?? ing?.price ?? 0)).toFixed(2);
      allComponents.push({ ingredient: makeIngredientObj(k, ing), percent: pct, kg, cost: c });
    }
  } else {
    // Infeasible — produce best-effort: distribute remaining proportionally by current values
    // Try: just fill remaining with cheapest adjustable
    // Or: proportional fill based on upper bounds
    let totalUb = 0;
    for (let i = 0; i < nVars; i++) totalUb += upperBounds[i];
    if (totalUb > 0) {
      for (let i = 0; i < nVars; i++) {
        const k = adjustableKeys[i];
        const ing = ingMap[k];
        const pct = (upperBounds[i] / totalUb) * remainingPct;
        if (pct < 0.05) continue;
        const kg = +((pct / 100) * dmi).toFixed(3);
        const c = +(kg * (params.prices[k] ?? ing?.price ?? 0)).toFixed(2);
        allComponents.push({ ingredient: makeIngredientObj(k, ing), percent: pct, kg, cost: c });
      }
    }
  }

  // Calculate achieved nutrition
  const achieved = {
    cp: allComponents.reduce((s, c) => s + (c.percent / 100) * (c.ingredient.protein ?? 0), 0),
    tdn: allComponents.reduce((s, c) => s + (c.percent / 100) * (c.ingredient.tdn ?? 0), 0),
    fiber: allComponents.reduce((s, c) => s + (c.percent / 100) * (c.ingredient.fiber ?? 0), 0),
  };

  const totalCost = +allComponents.reduce((s, c) => s + c.cost, 0).toFixed(2);

  // Build warnings
  const warnings: string[] = [];
  if (!result.feasible) {
    warnings.push("لا يمكن تحقيق القيم الغذائية المستهدفة بالكامل مع الخامات المثبتة والمتاحة.");
    if (achieved.cp < cpMin) {
      warnings.push(`البروتين المتحقق ${achieved.cp.toFixed(1)}% أقل من المطلوب ${cpMin}%. اقتراح: قلّل كمية الخامات منخفضة البروتين أو أضف مصدر بروتين.`);
    }
    if (achieved.tdn < tdnMin) {
      warnings.push(`الطاقة المتحققة ${achieved.tdn.toFixed(1)}% أقل من المطلوب ${tdnMin}%. اقتراح: زِد كمية الذرة أو مصادر الطاقة.`);
    }
    if (achieved.fiber > fiberMax) {
      warnings.push(`الألياف المتحققة ${achieved.fiber.toFixed(1)}% أعلى من الحد الأقصى ${fiberMax}%. اقتراح: قلّل الألياف الخشنة.`);
    }
    warnings.push("هذه أفضل تركيبة ممكنة بالقيود الحالية. يمكنك تعديل الخامات المثبتة لتوسيع نطاق الحلول.");
  } else {
    if (achieved.cp < cpMin - 0.3) warnings.push(`البروتين ${achieved.cp.toFixed(1)}% أقل من الهدف ${cpMin}%.`);
    if (achieved.tdn < tdnMin - 0.5) warnings.push(`الطاقة ${achieved.tdn.toFixed(1)}% أقل من الهدف ${tdnMin}%.`);
    if (achieved.fiber > fiberMax + 0.5) warnings.push(`الألياف ${achieved.fiber.toFixed(1)}% أعلى من المحدود ${fiberMax}%.`);
  }

  // Check sum = 100
  const sumPct = allComponents.reduce((s, c) => s + c.percent, 0);
  if (Math.abs(sumPct - 100) > 0.5) {
    warnings.push(`مجموع النسب ${sumPct.toFixed(1)}% — قد لا تكون التركيبة متوازنة تماماً.`);
  }

  return {
    dmi,
    perAnimalDmi,
    flockSize,
    components: allComponents.filter((c) => c.percent > 0.05),
    totalCost,
    costPerKg: dmi > 0 ? +(totalCost / dmi).toFixed(2) : 0,
    costPerMonth: +(totalCost * 30).toFixed(2),
    costPerAnimal: +(totalCost / flockSize).toFixed(2),
    costPerTon: +((dmi > 0 ? totalCost / dmi : 0) * 1000).toFixed(2),
    achieved,
    targets: { cpMin, tdnMin, fiberMax },
    feasible: result.feasible,
    warnings,
  };
}

/** Helper: build an Ingredient-like object from the DB entry */
function makeIngredientObj(key: string, ing: IngredientNutrition | undefined) {
  return {
    key,
    name: ing?.name ?? key,
    nameEn: ing?.nameEn ?? key,
    short: ing?.name ?? key,
    shortEn: ing?.nameEn ?? key,
    category: ing?.category ?? ("additive" as const),
    categoryLabel: ing?.category ?? "additive",
    defaultPrice: ing?.price ?? 0,
    protein: ing?.protein ?? 0,
    tdn: ing?.tdn ?? 0,
    fiber: ing?.fiber ?? 0,
    color: ing?.category === "energy" ? "#f59e0b" : ing?.category === "protein" ? "#10b981" : ing?.category === "fiber" ? "#84cc16" : "#a855f7",
    emoji: ing?.emoji ?? "🧪",
    icon: undefined as never,
  };
}

/**
 * Build & solve the feed-formulation LP for the given animal, weight,
 * production level, market prices, and objective mode.
 *
 * Objective: minimize cost per kg of ration (as-fed).
 * Constraints:
 *   - sum of fractions = 1
 *   - crude protein >= target (relaxed in economy mode)
 *   - TDN (energy) >= target (relaxed in economy mode)
 *   - crude fiber <= max
 *   - roughage (hay + straw) >= forageMin (ruminants)
 *   - per-ingredient lower & upper bounds
 *
 * For poultry, kg/cost values are scaled by flockSize so the result shows
 * the whole-flock totals.
 */
export function formulateRation(params: FormulateParams): FormulationResult {
  const animal: AnimalProfile = ANIMALS[params.animalKey];
  const perAnimalDmi = animal.dmi(params.weight, params.production);
  const flockSize = Math.max(1, Math.round(params.flockSize ?? 1));
  const dmi = +(perAnimalDmi * flockSize).toFixed(3);

  // Build ingredient map from the editable DB — NO hardcoded values.
  const ingMap: Record<string, IngredientNutrition> = {};
  for (const ing of params.ingredients) ingMap[ing.key] = ing;

  // Only include ingredients that are relevant for this animal
  // (have non-zero maxUsage in the animal's bounds OR default bounds)
  const activeKeys = params.ingredients
    .filter((ing) => {
      const bounds = animal.bounds[ing.key];
      // Include if: animal has explicit bounds, OR ingredient has default maxUsage > 0
      return (bounds && bounds.ub > 0) || (ing.maxUsage > 0 && !bounds);
    })
    .map((ing) => ing.key);

  // Apply mode relaxation to targets and bounds.
  const relax = params.mode === "economy" ? 2.5 : 0;
  const relaxTdn = params.mode === "economy" ? 5 : 0;
  const relaxForage = params.mode === "economy" ? 8 : 0;
  const cpMin = Math.max(0, animal.targets.cpMin - relax);
  const tdnMin = Math.max(0, animal.targets.tdnMin - relaxTdn);
  const fiberMax = animal.targets.fiberMax;
  const forageMin = Math.max(0, animal.forageMin - relaxForage);

  // Variables order = activeKeys.
  const nVars = activeKeys.length;
  const cost = activeKeys.map((k) => params.prices[k] ?? ingMap[k]?.price ?? 0);

  const constraints: Constraint[] = [];

  // 1) Sum = 1 (100%)
  constraints.push({ coeff: new Array(nVars).fill(1), op: "=", rhs: 1 });

  // 2) Crude protein >= cpMin/100 (read from DB)
  constraints.push({
    coeff: activeKeys.map((k) => (ingMap[k]?.protein ?? 0) / 100),
    op: ">=",
    rhs: cpMin / 100,
  });

  // 3) TDN >= tdnMin/100 (read from DB)
  constraints.push({
    coeff: activeKeys.map((k) => (ingMap[k]?.tdn ?? 0) / 100),
    op: ">=",
    rhs: tdnMin / 100,
  });

  // 4) Crude fiber <= fiberMax/100 (read from DB)
  constraints.push({
    coeff: activeKeys.map((k) => (ingMap[k]?.fiber ?? 0) / 100),
    op: "<=",
    rhs: fiberMax / 100,
  });

  // 5) Roughage (hay + straw + corn_silage) >= forageMin (ruminants only).
  if (animal.species === "ruminant" && forageMin > 0) {
    const forageKeys = ["hay", "straw", "corn_silage"];
    const coeff = activeKeys.map((k) => (forageKeys.includes(k) ? 1 : 0));
    if (coeff.some((c) => c > 0)) {
      constraints.push({ coeff, op: ">=", rhs: forageMin / 100 });
    }
  }

  // 6) Per-ingredient lower & upper bounds (from DB maxUsage, or animal bounds).
  const upperBounds: number[] = new Array(nVars).fill(1);
  activeKeys.forEach((k, i) => {
    const ing = ingMap[k];
    const b = animal.bounds[k];
    // Use animal bounds if defined, otherwise use ingredient's default minUsage/maxUsage
    const lb = b ? b.lb : (ing?.minUsage ?? 0);
    const ub = b ? b.ub : (ing?.maxUsage ?? 100);
    if (lb > 0) {
      const coeff = new Array(nVars).fill(0);
      coeff[i] = 1;
      constraints.push({ coeff, op: ">=", rhs: lb / 100 });
    }
    upperBounds[i] = ub / 100;
  });

  const result = solveLP(cost, constraints, upperBounds);

  const warnings: string[] = [];
  if (!result.feasible) {
    return {
      dmi,
      perAnimalDmi,
      flockSize,
      components: [],
      totalCost: 0,
      costPerKg: 0,
      costPerMonth: 0,
      costPerAnimal: 0,
      costPerTon: 0,
      achieved: { cp: 0, tdn: 0, fiber: 0 },
      targets: { cpMin, tdnMin, fiberMax },
      feasible: false,
      warnings: [
        "لا يوجد حل ممكن بهذه القيود. جرّب توسيع الحدود المتاحة أو راجع الأسعار.",
      ],
    };
  }

  // Build components — read nutrition from DB, NOT hardcoded.
  const components = activeKeys.map((k, i) => {
    const ing = ingMap[k];
    if (!ing) return null;
    const percent = result.x[i] * 100;
    const kg = +(result.x[i] * dmi).toFixed(3);
    const price = params.prices[k] ?? ing.price;
    const c = +(result.x[i] * dmi * price).toFixed(2);
    return {
      ingredient: {
        key: ing.key,
        name: ing.name,
        nameEn: ing.nameEn,
        short: ing.name,
        shortEn: ing.nameEn,
        category: ing.category,
        categoryLabel: ing.category,
        defaultPrice: ing.price,
        protein: ing.protein,
        tdn: ing.tdn,
        fiber: ing.fiber,
        color: ing.category === "energy" ? "#f59e0b" : ing.category === "protein" ? "#10b981" : ing.category === "fiber" ? "#84cc16" : "#a855f7",
        emoji: ing.emoji,
        icon: undefined as never,
      },
      percent,
      kg,
      cost: c,
    };
  }).filter((c): c is NonNullable<typeof c> => c !== null && c.percent > 0.05);

  // Achieved nutrition — read from DB.
  const achieved = {
    cp: activeKeys.reduce((s, k, i) => s + result.x[i] * (ingMap[k]?.protein ?? 0), 0),
    tdn: activeKeys.reduce((s, k, i) => s + result.x[i] * (ingMap[k]?.tdn ?? 0), 0),
    fiber: activeKeys.reduce((s, k, i) => s + result.x[i] * (ingMap[k]?.fiber ?? 0), 0),
  };

  const totalCost = +components.reduce((s, c) => s + c.cost, 0).toFixed(2);
  const costPerKg = +(totalCost / dmi).toFixed(2);
  const costPerMonth = +(totalCost * 30).toFixed(2);
  const costPerAnimal = +(totalCost / flockSize).toFixed(2);

  // Warnings.
  if (achieved.cp < cpMin - 0.3) warnings.push("البروتين أقل قليلاً من الهدف — راجع حدود الصويا.");
  if (achieved.tdn < tdnMin - 0.5) warnings.push("الطاقة أقل من الهدف — اسمح بمزيد من الذرة.");
  if (achieved.fiber > fiberMax + 0.5) warnings.push("الألياف أعلى من الموصى — قلّل التبن/الدريس.");

  return {
    dmi,
    perAnimalDmi,
    flockSize,
    components,
    totalCost,
    costPerKg,
    costPerMonth,
    costPerAnimal,
    costPerTon: +((dmi > 0 ? totalCost / dmi : 0) * 1000).toFixed(2),
    achieved,
    targets: { cpMin, tdnMin, fiberMax },
    feasible: true,
    warnings,
  };
}

/* ================================================================== */
/*  MANUAL RATION (user-edited percentages)                            */
/* ================================================================== */

import type { PriceMap } from "./storage";

/**
 * Build a FormulationResult from user-supplied percentages (manual override
 * of the LP solution). Recomputes kg, cost, and achieved nutrition so the
 * UI can live-update as the farmer drags the percentages.
 */
export function computeManualResult(
  percents: Partial<Record<string, number>>,
  perAnimalDmi: number,
  prices: Record<string, number>,
  targets: { cpMin: number; tdnMin: number; fiberMax: number },
  flockSize: number = 1,
  ingredients: IngredientNutrition[] = []
): FormulationResult {
  const flock = Math.max(1, Math.round(flockSize));
  const dmi = +(perAnimalDmi * flock).toFixed(3);

  // Build map from editable DB
  const ingMap: Record<string, IngredientNutrition> = {};
  for (const ing of ingredients) ingMap[ing.key] = ing;

  const allKeys = Object.keys(percents).filter((k) => (percents[k] ?? 0) > 0.05);

  const components = allKeys.map((k) => {
    const pct = percents[k] ?? 0;
    const ing = ingMap[k];
    const kg = +((pct / 100) * dmi).toFixed(3);
    const price = prices[k] ?? ing?.price ?? 0;
    const cost = +(kg * price).toFixed(2);
    return {
      ingredient: {
        key: k,
        name: ing?.name ?? k,
        nameEn: ing?.nameEn ?? k,
        short: ing?.name ?? k,
        shortEn: ing?.nameEn ?? k,
        category: ing?.category ?? "additive",
        categoryLabel: ing?.category ?? "additive",
        defaultPrice: ing?.price ?? 0,
        protein: ing?.protein ?? 0,
        tdn: ing?.tdn ?? 0,
        fiber: ing?.fiber ?? 0,
        color: "",
        icon: undefined as never,
      },
      percent: pct,
      kg,
      cost,
    };
  });

  const achieved = {
    cp: allKeys.reduce((s, k) => s + ((percents[k] ?? 0) / 100) * (ingMap[k]?.protein ?? 0), 0),
    tdn: allKeys.reduce((s, k) => s + ((percents[k] ?? 0) / 100) * (ingMap[k]?.tdn ?? 0), 0),
    fiber: allKeys.reduce((s, k) => s + ((percents[k] ?? 0) / 100) * (ingMap[k]?.fiber ?? 0), 0),
  };

  const totalCost = +components.reduce((s, c) => s + c.cost, 0).toFixed(2);
  const costPerKg = dmi > 0 ? +(totalCost / dmi).toFixed(2) : 0;
  const costPerMonth = +(totalCost * 30).toFixed(2);
  const costPerAnimal = +(totalCost / flock).toFixed(2);

  const warnings: string[] = [];
  if (achieved.cp < targets.cpMin - 0.3)
    warnings.push("البروتين أقل من الهدف الموصى به.");
  if (achieved.tdn < targets.tdnMin - 0.5)
    warnings.push("الطاقة أقل من الهدف الموصى به.");
  if (achieved.fiber > targets.fiberMax + 0.5)
    warnings.push("الألياف أعلى من الموصى به.");

  const sumPct = allKeys.reduce((s, k) => s + (percents[k] ?? 0), 0);
  if (Math.abs(sumPct - 100) > 0.1) {
    warnings.push(`مجموع النسب ${sumPct.toFixed(1)}% — يجب أن يساوي 100%.`);
  }

  return {
    dmi,
    perAnimalDmi,
    flockSize: flock,
    components,
    totalCost,
    costPerKg,
    costPerMonth,
    costPerAnimal,
    costPerTon: +(costPerKg * 1000).toFixed(2),
    targets,
    feasible: true,
    warnings,
  };
}
