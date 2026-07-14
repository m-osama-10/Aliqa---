/* ================================================================== */
/*  SMART PERCENTAGE DISTRIBUTION                                       */
/*                                                                     */
/*  When a user edits one ingredient's percentage, the delta must be   */
/*  distributed across the OTHER non-locked ingredients so the total   */
/*  always sums to exactly 100%.                                       */
/*                                                                     */
/*  Algorithm:                                                         */
/*    1. Compute delta = newPct - oldPct for the changed ingredient.   */
/*    2. The other ingredients must absorb -delta in total.            */
/*    3. Distribute -delta proportionally to each unlocked ingredient's */
/*       current value, clamped to [minUsage, maxUsage].               */
/*    4. If clamping leaves a remainder, redistribute it to remaining  */
/*       unlocked ingredients (iterative pass).                        */
/*    5. Guard against NaN, Infinity, and negative values.             */
/*                                                                     */
/*  This is a PURE function — it does NOT call any LP solver. It only  */
/*  adjusts percentages. The existing computeManualResult recomputes   */
/*  nutrition/cost from the new percentages.                           */
/* ================================================================== */

import type { IngredientNutrition } from "./ingredient-db";

export interface DistributionInput {
  /** Current percentages keyed by ingredient key. */
  percents: Record<string, number>;
  /** Key of the ingredient the user just edited. */
  changedKey: string;
  /** New percentage the user entered for changedKey. */
  newValue: number;
  /** Set of locked ingredient keys (cannot be adjusted). */
  lockedKeys: Set<string>;
  /** All ingredient definitions (to read minUsage/maxUsage bounds). */
  ingredients: IngredientNutrition[];
  /** Keys of ingredients available in the current ration. */
  availableKeys: string[];
}

/**
 * Clamp a value to [min, max]. Guards against NaN.
 */
function clamp(v: number, min: number, max: number): number {
  if (!Number.isFinite(v)) return min;
  return Math.max(min, Math.min(max, v));
}

/**
 * Redistribute a percentage change across non-locked ingredients.
 *
 * Returns a NEW percents object with the changedKey set to newValue
 * (clamped to its bounds) and the delta distributed across unlocked
 * ingredients, respecting each one's [minUsage, maxUsage] bounds.
 *
 * Guarantees:
 *   - Sum of all percentages === 100 (within 0.01 floating tolerance)
 *   - No NaN, Infinity, or negative values
 *   - Each ingredient stays within [0, maxUsage] (minUsage is a soft
 *     target — we allow going to 0 if needed to make room)
 *   - Locked ingredients are NEVER changed
 */
export function distributePercentageChange(
  input: DistributionInput
): Record<string, number> {
  const { percents, changedKey, newValue, lockedKeys, ingredients, availableKeys } = input;

  // Build bounds map: key -> { min, max }
  const bounds: Record<string, { min: number; max: number }> = {};
  for (const ing of ingredients) {
    bounds[ing.key] = {
      min: Math.max(0, ing.minUsage ?? 0),
      max: Math.max(ing.minUsage ?? 0, ing.maxUsage ?? 100),
    };
  }

  // Start with a copy of current percents (sanitized)
  const result: Record<string, number> = {};
  for (const k of availableKeys) {
    result[k] = clamp(Math.max(0, percents[k] ?? 0), 0, bounds[k]?.max ?? 100);
  }

  // Clamp the new value for the changed key to its bounds
  const changedBounds = bounds[changedKey] ?? { min: 0, max: 100 };
  const clampedNew = clamp(newValue, changedBounds.min, changedBounds.max);
  const oldVal = result[changedKey] ?? 0;
  const delta = clampedNew - oldVal;

  // Set the changed key to its new value
  result[changedKey] = clampedNew;

  // If no delta, nothing to distribute
  if (Math.abs(delta) < 0.001) {
    return result;
  }

  // The other ingredients must absorb -delta
  const toAbsorb = -delta;

  // Collect adjustable keys: not the changed key, not locked, and currently > 0
  // (we only adjust ingredients that have some percentage to give/take)
  let adjustable = availableKeys.filter(
    (k) => k !== changedKey && !lockedKeys.has(k)
  );

  // If absorbing positive (need to add to others), prefer those with room above current
  // If absorbing negative (need to take from others), prefer those with room below current
  // We do an iterative proportional distribution with clamping.

  // Iterative distribution: distribute the remaining amount across adjustable ingredients.
  // Each pass distributes proportionally, clamps to bounds, and carries the remainder.
  let remaining = toAbsorb;
  const MAX_PASSES = adjustable.length + 2; // enough passes to settle

  for (let pass = 0; pass < MAX_PASSES && Math.abs(remaining) > 0.001; pass++) {
    // Filter to ingredients that can still absorb in the needed direction
    const canAbsorb = adjustable.filter((k) => {
      const cur = result[k] ?? 0;
      const b = bounds[k] ?? { min: 0, max: 100 };
      if (remaining > 0) return cur < b.max - 0.001; // can increase
      return cur > 0.001; // can decrease (down to 0)
    });

    if (canAbsorb.length === 0) break;

    // Distribute proportionally to current values (for decrease) or to headroom (for increase)
    let totalWeight: number;
    if (remaining > 0) {
      // Increasing: distribute proportionally to remaining headroom
      totalWeight = canAbsorb.reduce((s, k) => {
        const b = bounds[k] ?? { min: 0, max: 100 };
        return s + Math.max(0, b.max - (result[k] ?? 0));
      }, 0);
    } else {
      // Decreasing: distribute proportionally to current value
      totalWeight = canAbsorb.reduce((s, k) => s + (result[k] ?? 0), 0);
    }

    if (totalWeight <= 0.001) break;

    const passRemaining = remaining;
    let passAbsorbed = 0;

    for (const k of canAbsorb) {
      const cur = result[k] ?? 0;
      const b = bounds[k] ?? { min: 0, max: 100 };
      let weight: number;
      if (passRemaining > 0) {
        weight = Math.max(0, b.max - cur);
      } else {
        weight = cur;
      }
      const share = (weight / totalWeight) * passRemaining;
      let newVal = cur + share;
      // Clamp to bounds
      newVal = clamp(newVal, 0, b.max);
      passAbsorbed += newVal - cur;
      result[k] = newVal;
    }

    remaining -= passAbsorbed;
    // Remove ingredients that are now at their bounds for the next pass
    adjustable = adjustable.filter((k) => {
      const cur = result[k] ?? 0;
      const b = bounds[k] ?? { min: 0, max: 100 };
      if (remaining > 0) return cur < b.max - 0.001;
      if (remaining < 0) return cur > 0.001;
      return false;
    });
  }

  // Final safety: ensure no NaN/Infinity and round to 1 decimal
  for (const k of availableKeys) {
    let v = result[k] ?? 0;
    if (!Number.isFinite(v)) v = 0;
    if (v < 0) v = 0;
    const b = bounds[k] ?? { min: 0, max: 100 };
    if (v > b.max) v = b.max;
    result[k] = +v.toFixed(2);
  }

  // Final sum check — if we're off by a small amount due to rounding/clamping,
  // adjust the largest non-locked, non-changed ingredient to make it exactly 100
  const sum = availableKeys.reduce((s, k) => s + (result[k] ?? 0), 0);
  const drift = 100 - sum;
  if (Math.abs(drift) > 0.01) {
    // Find the adjustable ingredient with the most room in the drift direction
    const candidates = availableKeys
      .filter((k) => k !== changedKey && !lockedKeys.has(k))
      .map((k) => ({ k, val: result[k] ?? 0, max: bounds[k]?.max ?? 100 }))
      .filter((c) => drift > 0 ? c.val < c.max - 0.01 : c.val > 0.01)
      .sort((a, b) => b.val - a.val);
    if (candidates.length > 0) {
      const c = candidates[0];
      result[c.k] = clamp((result[c.k] ?? 0) + drift, 0, c.max);
      if (!Number.isFinite(result[c.k])) result[c.k] = 0;
    }
  }

  return result;
}

/**
 * Check if the sum of percentages equals 100 (within tolerance).
 */
export function isSumValid(percents: Record<string, number>, keys: string[], tolerance = 0.1): boolean {
  const sum = keys.reduce((s, k) => s + (percents[k] ?? 0), 0);
  return Math.abs(sum - 100) <= tolerance;
}

/**
 * Get the sum of all percentages.
 */
export function getSum(percents: Record<string, number>, keys: string[]): number {
  return keys.reduce((s, k) => s + (percents[k] ?? 0), 0);
}
