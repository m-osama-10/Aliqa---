/* ================================================================== */
/*  UNIT TESTS — normalizeFormulationResult()                          */
/*  Run: bun test src/lib/__tests__/result-normalization.test.ts       */
/* ================================================================== */

import { describe, it, expect } from "bun:test";
import {
  normalizeFormulationResult,
  type FormulationResult,
} from "../feed-data";

const COMPLETE_RESULT: FormulationResult = {
  dmi: 18.5,
  perAnimalDmi: 18.5,
  flockSize: 1,
  components: [
    {
      ingredient: {
        key: "corn",
        name: "ذرة صفراء",
        nameEn: "Yellow Corn",
        short: "ذرة",
        shortEn: "Corn",
        category: "energy",
        categoryLabel: "energy",
        defaultPrice: 12,
        protein: 8.5,
        tdn: 88,
        fiber: 2.5,
        color: "#f59e0b",
        emoji: "🌽",
        icon: undefined as never,
      },
      percent: 50,
      kg: 9.25,
      cost: 111,
    },
  ],
  totalCost: 150.5,
  costPerKg: 8.1,
  costPerMonth: 4515,
  costPerAnimal: 150.5,
  costPerTon: 8100,
  achieved: { cp: 15, tdn: 70, fiber: 10 },
  targets: { cpMin: 15, tdnMin: 65, fiberMax: 24 },
  feasible: true,
  warnings: [],
};

describe("normalizeFormulationResult", () => {
  it("returns a complete result for valid input (passthrough)", () => {
    const out = normalizeFormulationResult(COMPLETE_RESULT);
    expect(out.dmi).toBe(18.5);
    expect(out.achieved.cp).toBe(15);
    expect(out.targets.cpMin).toBe(15);
    expect(out.feasible).toBe(true);
    expect(out.components).toHaveLength(1);
    expect(out.warnings).toEqual([]);
  });

  it("handles null input", () => {
    const out = normalizeFormulationResult(null);
    expect(out.achieved).toEqual({ cp: 0, tdn: 0, fiber: 0 });
    expect(out.targets).toEqual({ cpMin: 0, tdnMin: 0, fiberMax: 0 });
    expect(out.components).toEqual([]);
    expect(out.warnings).toEqual([]);
    expect(out.feasible).toBe(false);
    expect(out.flockSize).toBe(1);
  });

  it("handles undefined input", () => {
    const out = normalizeFormulationResult(undefined);
    expect(out.achieved).toEqual({ cp: 0, tdn: 0, fiber: 0 });
    expect(out.feasible).toBe(false);
  });

  it("backfills missing achieved object", () => {
    const partial = { ...COMPLETE_RESULT, achieved: undefined } as Partial<FormulationResult>;
    const out = normalizeFormulationResult(partial);
    expect(out.achieved).toEqual({ cp: 0, tdn: 0, fiber: 0 });
    expect(out.targets.cpMin).toBe(15); // targets preserved
  });

  it("backfills missing targets object", () => {
    const partial = { ...COMPLETE_RESULT, targets: undefined } as Partial<FormulationResult>;
    const out = normalizeFormulationResult(partial);
    expect(out.targets).toEqual({ cpMin: 0, tdnMin: 0, fiberMax: 0 });
    expect(out.achieved.cp).toBe(15); // achieved preserved
  });

  it("backfills missing components array", () => {
    const partial = { ...COMPLETE_RESULT, components: undefined } as Partial<FormulationResult>;
    const out = normalizeFormulationResult(partial);
    expect(out.components).toEqual([]);
  });

  it("backfills missing warnings array", () => {
    const partial = { ...COMPLETE_RESULT, warnings: undefined } as Partial<FormulationResult>;
    const out = normalizeFormulationResult(partial);
    expect(out.warnings).toEqual([]);
  });

  it("backfills missing cost fields", () => {
    const partial = {
      dmi: 10,
      flockSize: 2,
      achieved: { cp: 10, tdn: 60, fiber: 5 },
      targets: { cpMin: 12, tdnMin: 60, fiberMax: 20 },
      feasible: true,
      warnings: [],
      components: [],
    } as Partial<FormulationResult>;
    const out = normalizeFormulationResult(partial);
    // costPerKg derived: totalCost/dmi = 0/10 = 0
    expect(out.costPerKg).toBe(0);
    // costPerMonth derived: totalCost*30 = 0
    expect(out.costPerMonth).toBe(0);
    // costPerAnimal derived: totalCost/flockSize = 0/2 = 0
    expect(out.costPerAnimal).toBe(0);
    // costPerTon derived: costPerKg*1000 = 0
    expect(out.costPerTon).toBe(0);
    // perAnimalDmi derived from dmi
    expect(out.perAnimalDmi).toBe(10);
  });

  it("derives costPerKg from totalCost/dmi when missing", () => {
    const partial = {
      dmi: 10,
      totalCost: 100,
      flockSize: 1,
      achieved: { cp: 0, tdn: 0, fiber: 0 },
      targets: { cpMin: 0, tdnMin: 0, fiberMax: 0 },
      feasible: true,
      warnings: [],
      components: [],
    } as Partial<FormulationResult>;
    const out = normalizeFormulationResult(partial);
    expect(out.costPerKg).toBe(10); // 100/10
    expect(out.costPerTon).toBe(10000); // 10*1000
  });

  it("derives costPerAnimal from totalCost/flockSize when missing", () => {
    const partial = {
      dmi: 10,
      totalCost: 100,
      flockSize: 4,
      achieved: { cp: 0, tdn: 0, fiber: 0 },
      targets: { cpMin: 0, tdnMin: 0, fiberMax: 0 },
      feasible: true,
      warnings: [],
      components: [],
    } as Partial<FormulationResult>;
    const out = normalizeFormulationResult(partial);
    expect(out.costPerAnimal).toBe(25); // 100/4
  });

  it("clamps flockSize to minimum 1", () => {
    const partial = { ...COMPLETE_RESULT, flockSize: 0 } as Partial<FormulationResult>;
    const out = normalizeFormulationResult(partial);
    expect(out.flockSize).toBe(1);
  });

  it("handles flockSize = NaN", () => {
    const partial = { ...COMPLETE_RESULT, flockSize: NaN } as Partial<FormulationResult>;
    const out = normalizeFormulationResult(partial);
    expect(out.flockSize).toBe(1);
  });

  it("handles NaN in achieved fields", () => {
    const partial = {
      ...COMPLETE_RESULT,
      achieved: { cp: NaN, tdn: undefined as unknown as number, fiber: 10 },
    } as Partial<FormulationResult>;
    const out = normalizeFormulationResult(partial);
    expect(out.achieved.cp).toBe(0);
    expect(out.achieved.tdn).toBe(0);
    expect(out.achieved.fiber).toBe(10);
  });

  it("handles NaN in targets fields", () => {
    const partial = {
      ...COMPLETE_RESULT,
      targets: { cpMin: NaN, tdnMin: 65, fiberMax: undefined as unknown as number },
    } as Partial<FormulationResult>;
    const out = normalizeFormulationResult(partial);
    expect(out.targets.cpMin).toBe(0);
    expect(out.targets.tdnMin).toBe(65);
    expect(out.targets.fiberMax).toBe(0);
  });

  it("handles component with missing fields", () => {
    const partial = {
      ...COMPLETE_RESULT,
      components: [
        {
          ingredient: { key: "corn", name: "ذرة", nameEn: "Corn", short: "ذرة", shortEn: "Corn", category: "energy", categoryLabel: "energy", defaultPrice: 12, protein: 8.5, tdn: 88, fiber: 2.5, color: "#f59e0b", emoji: "🌽", icon: undefined as never },
          percent: undefined as unknown as number,
          kg: undefined as unknown as number,
          cost: undefined as unknown as number,
        },
      ],
    } as Partial<FormulationResult>;
    const out = normalizeFormulationResult(partial);
    expect(out.components[0].percent).toBe(0);
    expect(out.components[0].kg).toBe(0);
    expect(out.components[0].cost).toBe(0);
  });

  it("preserves feasible flag", () => {
    expect(normalizeFormulationResult({ ...COMPLETE_RESULT, feasible: false }).feasible).toBe(false);
    expect(normalizeFormulationResult({ ...COMPLETE_RESULT, feasible: true }).feasible).toBe(true);
  });

  it("handles empty components array", () => {
    const partial = { ...COMPLETE_RESULT, components: [] } as Partial<FormulationResult>;
    const out = normalizeFormulationResult(partial);
    expect(out.components).toEqual([]);
  });

  it("always returns a fresh object (no mutation of input)", () => {
    const input = { ...COMPLETE_RESULT };
    const out = normalizeFormulationResult(input);
    expect(out).not.toBe(input);
    expect(out.achieved).not.toBe(input.achieved);
    expect(out.targets).not.toBe(input.targets);
  });

  it("simulates legacy schema (only dmi + totalCost) — the root-cause scenario", () => {
    // This is exactly what old saved rations looked like before the fix
    const legacy = {
      dmi: 18.5,
      totalCost: 150.5,
      // NO: achieved, targets, components, feasible, warnings, perAnimalDmi,
      //     flockSize, costPerKg, costPerMonth, costPerAnimal, costPerTon
    } as Partial<FormulationResult>;
    const out = normalizeFormulationResult(legacy);
    // Must NOT crash on .achieved.cp access — this was the original bug
    expect(() => out.achieved.cp).not.toThrow();
    expect(out.achieved.cp).toBe(0);
    expect(out.targets.cpMin).toBe(0);
    expect(out.components).toEqual([]);
    expect(out.warnings).toEqual([]);
    expect(out.feasible).toBe(false);
    expect(out.flockSize).toBe(1);
    expect(out.costPerKg).toBeCloseTo(150.5 / 18.5, 5); // derived
    expect(out.costPerMonth).toBeCloseTo(150.5 * 30, 1); // derived
    expect(out.costPerAnimal).toBe(150.5); // totalCost/1
    expect(out.costPerTon).toBeCloseTo((150.5 / 18.5) * 1000, 1); // derived
  });
});
