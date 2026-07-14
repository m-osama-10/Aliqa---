/* ================================================================== */
/*  INTEGRATION TESTS — migrateRation() + save+reload cycle            */
/*  Run: bun test src/lib/__tests__/migrate-ration.test.ts             */
/* ================================================================== */

import { describe, it, expect, beforeEach, afterEach } from "bun:test";
import type { FormulationResult } from "../feed-data";
import { normalizeFormulationResult } from "../feed-data";

// migrateRation is private in storage.ts. We test its contract here by
// replicating its logic (which delegates entirely to normalizeFormulationResult).
// This validates the data-transformation pipeline independent of React hooks.
function simulateMigrateRation(r: any): any | null {
  if (!r || !r.id || !r.result || !r.animalKey) return null;
  r.result = normalizeFormulationResult(r.result as Partial<FormulationResult>);
  if (r.flockSize === undefined) r.flockSize = r.result.flockSize ?? 1;
  if (r.production === undefined) r.production = 0;
  return r;
}

describe("migrateRation (simulated)", () => {
  it("rejects null input", () => {
    expect(simulateMigrateRation(null)).toBeNull();
  });

  it("rejects ration without id", () => {
    expect(simulateMigrateRation({ result: {}, animalKey: "dairy_cow" })).toBeNull();
  });

  it("rejects ration without result", () => {
    expect(simulateMigrateRation({ id: "1", animalKey: "dairy_cow" })).toBeNull();
  });

  it("rejects ration without animalKey", () => {
    expect(simulateMigrateRation({ id: "1", result: {} })).toBeNull();
  });

  it("normalizes a complete ration (no-op)", () => {
    const complete = {
      id: "1",
      createdAt: "2024-01-01T00:00:00Z",
      name: "Test",
      animalKey: "dairy_cow",
      animalName: "بقرة",
      weight: 500,
      production: 20,
      flockSize: 1,
      mode: "balanced" as const,
      prices: { corn: 12 },
      result: {
        dmi: 18.5,
        perAnimalDmi: 18.5,
        flockSize: 1,
        components: [],
        totalCost: 150,
        costPerKg: 8.1,
        costPerMonth: 4500,
        costPerAnimal: 150,
        costPerTon: 8100,
        achieved: { cp: 15, tdn: 70, fiber: 10 },
        targets: { cpMin: 15, tdnMin: 65, fiberMax: 24 },
        feasible: true,
        warnings: [],
      } as FormulationResult,
    };
    const out = simulateMigrateRation(complete);
    expect(out).not.toBeNull();
    expect(out.result.achieved.cp).toBe(15);
    expect(out.result.targets.cpMin).toBe(15);
    expect(out.result.feasible).toBe(true);
  });

  it("normalizes a legacy ration missing achieved/targets/components", () => {
    const legacy = {
      id: "leg-1",
      createdAt: "2024-01-01T00:00:00Z",
      name: "Legacy",
      animalKey: "dairy_cow",
      animalName: "بقرة",
      weight: 500,
      production: 20,
      flockSize: 1,
      mode: "balanced" as const,
      prices: { corn: 12 },
      result: {
        dmi: 18.5,
        totalCost: 150,
        costPerKg: 8.1,
        costPerMonth: 4500,
        // MISSING: achieved, targets, components, feasible, warnings,
        //           perAnimalDmi, flockSize, costPerAnimal, costPerTon
      } as Partial<FormulationResult>,
    };
    const out = simulateMigrateRation(legacy);
    expect(out).not.toBeNull();
    // Must not crash — this was the root cause
    expect(() => out.result.achieved.cp).not.toThrow();
    expect(out.result.achieved).toEqual({ cp: 0, tdn: 0, fiber: 0 });
    expect(out.result.targets).toEqual({ cpMin: 0, tdnMin: 0, fiberMax: 0 });
    expect(out.result.components).toEqual([]);
    expect(out.result.warnings).toEqual([]);
    expect(out.result.feasible).toBe(false);
    expect(out.result.flockSize).toBe(1);
    expect(out.result.perAnimalDmi).toBe(18.5); // derived from dmi
    expect(out.result.costPerAnimal).toBe(150); // derived: totalCost/flockSize
  });

  it("backfills flockSize from result if missing on ration", () => {
    const legacy = {
      id: "leg-2",
      animalKey: "dairy_cow",
      result: {
        dmi: 10,
        flockSize: 5,
        achieved: { cp: 0, tdn: 0, fiber: 0 },
        targets: { cpMin: 0, tdnMin: 0, fiberMax: 0 },
        feasible: true,
        warnings: [],
        components: [],
      } as Partial<FormulationResult>,
    };
    const out = simulateMigrateRation(legacy);
    expect(out.flockSize).toBe(5); // from result.flockSize
  });

  it("defaults production to 0 if missing", () => {
    const legacy = {
      id: "leg-3",
      animalKey: "dairy_cow",
      flockSize: 1,
      result: {
        dmi: 10,
        achieved: { cp: 0, tdn: 0, fiber: 0 },
        targets: { cpMin: 0, tdnMin: 0, fiberMax: 0 },
        feasible: true,
        warnings: [],
        components: [],
      } as Partial<FormulationResult>,
    };
    const out = simulateMigrateRation(legacy);
    expect(out.production).toBe(0);
  });
});

/* ---------- save + reload cycle (localStorage integration) ---------- */

const RATIONS_KEY = "aleeqa.rations.v1";

describe("save + reload ration cycle", () => {
  beforeEach(() => {
    const store: Record<string, string> = {};
    (globalThis as any).localStorage = {
      getItem: (k: string) => store[k] ?? null,
      setItem: (k: string, v: string) => { store[k] = v; },
      removeItem: (k: string) => { delete store[k]; },
      clear: () => { for (const k of Object.keys(store)) delete store[k]; },
      key: (i: number) => Object.keys(store)[i] ?? null,
      get length() { return Object.keys(store).length; },
    };
  });

  afterEach(() => {
    delete (globalThis as any).localStorage;
  });

  it("save complete ration → reload → result is complete", () => {
    const ration = {
      id: "test-save-1",
      createdAt: new Date().toISOString(),
      name: "Test Save",
      animalKey: "dairy_cow",
      animalName: "بقرة",
      weight: 500,
      production: 20,
      flockSize: 1,
      mode: "balanced" as const,
      prices: { corn: 12 },
      result: normalizeFormulationResult({
        dmi: 18.5,
        totalCost: 150,
        achieved: { cp: 15, tdn: 70, fiber: 10 },
        targets: { cpMin: 15, tdnMin: 65, fiberMax: 24 },
        feasible: true,
        warnings: [],
        components: [],
      }),
    };
    localStorage.setItem(RATIONS_KEY, JSON.stringify([ration]));

    const raw = localStorage.getItem(RATIONS_KEY)!;
    const arr = JSON.parse(raw);
    expect(arr).toHaveLength(1);
    const loaded = arr[0];
    const migrated = simulateMigrateRation(loaded);
    expect(migrated.result.achieved.cp).toBe(15);
    expect(migrated.result.targets.cpMin).toBe(15);
    expect(migrated.result.feasible).toBe(true);
  });

  it("save legacy ration → reload via migrateRation → no crash, complete result", () => {
    const legacyRaw = {
      id: "legacy-reload-1",
      createdAt: "2023-06-01T00:00:00Z",
      name: "Old Ration",
      animalKey: "dairy_cow",
      animalName: "بقرة",
      weight: 450,
      production: 15,
      flockSize: 1,
      mode: "balanced",
      prices: { corn: 10 },
      result: {
        dmi: 16,
        totalCost: 120,
        costPerKg: 7.5,
        costPerMonth: 3600,
        // MISSING: achieved, targets, components, feasible, warnings, etc.
      },
    };
    localStorage.setItem(RATIONS_KEY, JSON.stringify([legacyRaw]));

    const raw = localStorage.getItem(RATIONS_KEY)!;
    const arr = JSON.parse(raw);
    const migrated = simulateMigrateRation(arr[0]);

    expect(() => migrated.result.achieved.cp).not.toThrow();
    expect(migrated.result.achieved).toEqual({ cp: 0, tdn: 0, fiber: 0 });
    expect(migrated.result.targets).toEqual({ cpMin: 0, tdnMin: 0, fiberMax: 0 });
    expect(migrated.result.components).toEqual([]);
    expect(migrated.result.feasible).toBe(false);
    expect(migrated.result.perAnimalDmi).toBe(16);
    expect(migrated.result.costPerAnimal).toBe(120);
  });

  it("handles multiple rations (mix of complete + legacy)", () => {
    const rations = [
      {
        id: "complete-1",
        animalKey: "dairy_cow",
        result: {
          dmi: 18,
          achieved: { cp: 15, tdn: 70, fiber: 10 },
          targets: { cpMin: 15, tdnMin: 65, fiberMax: 24 },
          feasible: true,
          warnings: [],
          components: [],
        },
      },
      {
        id: "legacy-1",
        animalKey: "dairy_cow",
        result: { dmi: 16, totalCost: 120 },
      },
    ];
    localStorage.setItem(RATIONS_KEY, JSON.stringify(rations));
    const raw = localStorage.getItem(RATIONS_KEY)!;
    const arr = JSON.parse(raw);
    const migrated = arr.map(simulateMigrateRation);

    expect(migrated).toHaveLength(2);
    expect(migrated[0].result.achieved.cp).toBe(15); // complete preserved
    expect(migrated[1].result.achieved.cp).toBe(0); // legacy backfilled
    expect(migrated[1].result.feasible).toBe(false);
  });
});
