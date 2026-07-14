/* ================================================================== */
/*  UNIT TESTS — distributePercentageChange()                          */
/*  Run: bun test src/lib/__tests__/percentage-distribution.test.ts    */
/* ================================================================== */

import { describe, it, expect } from "bun:test";
import {
  distributePercentageChange,
  isSumValid,
  getSum,
} from "../percentage-distribution";
import { DEFAULT_INGREDIENTS } from "../ingredient-db";

const INGS = DEFAULT_INGREDIENTS;
const KEYS = ["corn", "soybean44", "hay", "bran"];

function makePercents(values: Record<string, number>): Record<string, number> {
  return { ...values };
}

describe("distributePercentageChange", () => {
  it("distributes a decrease across non-locked ingredients (sum stays 100)", () => {
    // corn=50, soy=30, hay=10, bran=10 (sum=100)
    // User increases corn to 60 → delta=+10 → others absorb -10
    const percents = makePercents({ corn: 50, soybean44: 30, hay: 10, bran: 10 });
    const result = distributePercentageChange({
      percents,
      changedKey: "corn",
      newValue: 60,
      lockedKeys: new Set(),
      ingredients: INGS,
      availableKeys: KEYS,
    });
    expect(result.corn).toBe(60);
    const sum = getSum(result, KEYS);
    expect(Math.abs(sum - 100)).toBeLessThan(0.1);
  });

  it("distributes an increase across non-locked ingredients (sum stays 100)", () => {
    const percents = makePercents({ corn: 50, soybean44: 30, hay: 10, bran: 10 });
    const result = distributePercentageChange({
      percents,
      changedKey: "corn",
      newValue: 40,
      lockedKeys: new Set(),
      ingredients: INGS,
      availableKeys: KEYS,
    });
    expect(result.corn).toBe(40);
    const sum = getSum(result, KEYS);
    expect(Math.abs(sum - 100)).toBeLessThan(0.1);
  });

  it("never changes locked ingredients", () => {
    const percents = makePercents({ corn: 50, soybean44: 30, hay: 10, bran: 10 });
    const locked = new Set(["soybean44"]);
    const result = distributePercentageChange({
      percents,
      changedKey: "corn",
      newValue: 60,
      lockedKeys: locked,
      ingredients: INGS,
      availableKeys: KEYS,
    });
    expect(result.soybean44).toBe(30); // unchanged
    expect(result.corn).toBe(60);
    const sum = getSum(result, KEYS);
    expect(Math.abs(sum - 100)).toBeLessThan(0.5); // may not be exactly 100 if locked blocks
  });

  it("respects maxUsage bounds", () => {
    // corn maxUsage=65. If we try to set corn to 80, it should clamp to 65.
    const percents = makePercents({ corn: 50, soybean44: 30, hay: 10, bran: 10 });
    const result = distributePercentageChange({
      percents,
      changedKey: "corn",
      newValue: 80,
      lockedKeys: new Set(),
      ingredients: INGS,
      availableKeys: KEYS,
    });
    const corn = INGS.find((i) => i.key === "corn")!;
    expect(result.corn).toBeLessThanOrEqual(corn.maxUsage);
  });

  it("never produces NaN or Infinity", () => {
    const percents = makePercents({ corn: 50, soybean44: 30, hay: 10, bran: 10 });
    const result = distributePercentageChange({
      percents,
      changedKey: "corn",
      newValue: 60,
      lockedKeys: new Set(),
      ingredients: INGS,
      availableKeys: KEYS,
    });
    for (const k of KEYS) {
      expect(Number.isFinite(result[k])).toBe(true);
      expect(result[k]).toBeGreaterThanOrEqual(0);
    }
  });

  it("handles NaN input gracefully", () => {
    const percents = makePercents({ corn: 50, soybean44: 30, hay: 10, bran: 10 });
    const result = distributePercentageChange({
      percents,
      changedKey: "corn",
      newValue: NaN,
      lockedKeys: new Set(),
      ingredients: INGS,
      availableKeys: KEYS,
    });
    expect(Number.isFinite(result.corn)).toBe(true);
    expect(result.corn).toBeGreaterThanOrEqual(0);
  });

  it("handles all-others-locked scenario (only changed key adjusts)", () => {
    const percents = makePercents({ corn: 50, soybean44: 30, hay: 10, bran: 10 });
    const locked = new Set(["soybean44", "hay", "bran"]);
    const result = distributePercentageChange({
      percents,
      changedKey: "corn",
      newValue: 60,
      lockedKeys: locked,
      ingredients: INGS,
      availableKeys: KEYS,
    });
    // Only corn can change; others are locked
    expect(result.soybean44).toBe(30);
    expect(result.hay).toBe(10);
    expect(result.bran).toBe(10);
    // corn may or may not be exactly 60 if sum can't be 100
    expect(Number.isFinite(result.corn)).toBe(true);
  });

  it("no-op when newValue equals oldValue", () => {
    const percents = makePercents({ corn: 50, soybean44: 30, hay: 10, bran: 10 });
    const result = distributePercentageChange({
      percents,
      changedKey: "corn",
      newValue: 50,
      lockedKeys: new Set(),
      ingredients: INGS,
      availableKeys: KEYS,
    });
    expect(result.corn).toBe(50);
    expect(result.soybean44).toBe(30);
    expect(result.hay).toBe(10);
    expect(result.bran).toBe(10);
  });

  it("handles decreasing an ingredient to 0", () => {
    const percents = makePercents({ corn: 50, soybean44: 30, hay: 10, bran: 10 });
    const result = distributePercentageChange({
      percents,
      changedKey: "hay",
      newValue: 0,
      lockedKeys: new Set(),
      ingredients: INGS,
      availableKeys: KEYS,
    });
    expect(result.hay).toBe(0);
    const sum = getSum(result, KEYS);
    expect(Math.abs(sum - 100)).toBeLessThan(0.5);
  });

  it("does not mutate the input percents object", () => {
    const original = makePercents({ corn: 50, soybean44: 30, hay: 10, bran: 10 });
    const snapshot = { ...original };
    distributePercentageChange({
      percents: original,
      changedKey: "corn",
      newValue: 60,
      lockedKeys: new Set(),
      ingredients: INGS,
      availableKeys: KEYS,
    });
    expect(original).toEqual(snapshot); // unchanged
  });
});

describe("isSumValid", () => {
  it("returns true when sum is exactly 100", () => {
    expect(isSumValid({ corn: 50, soy: 50 }, ["corn", "soy"])).toBe(true);
  });

  it("returns true when sum is within tolerance", () => {
    expect(isSumValid({ corn: 50.05, soy: 50 }, ["corn", "soy"])).toBe(true);
  });

  it("returns false when sum is off", () => {
    expect(isSumValid({ corn: 40, soy: 50 }, ["corn", "soy"])).toBe(false);
  });
});

describe("getSum", () => {
  it("sums all values for given keys", () => {
    expect(getSum({ corn: 10, soy: 20, hay: 5 }, ["corn", "soy", "hay"])).toBe(35);
  });

  it("treats missing keys as 0", () => {
    expect(getSum({ corn: 10 }, ["corn", "soy"])).toBe(10);
  });
});
