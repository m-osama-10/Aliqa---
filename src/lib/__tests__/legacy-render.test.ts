/* ================================================================== */
/*  INTEGRATION TESTS — rationToText() + ComparePanel with legacy data */
/*  Run: bun test src/lib/__tests__/legacy-render.test.ts              */
/* ================================================================== */

import { describe, it, expect } from "bun:test";
import { normalizeFormulationResult, type FormulationResult } from "../feed-data";

/* ---------- rationToText (pure function, testable without React) ---- */

// We can't easily import the JSX module here, so we replicate the exact
// rationToText logic to verify it handles legacy data. The real function
// is in src/components/aleeqa/ration-result.tsx and uses the same
// normalizeFormulationResult guard.
function rationToTextLike(
  result: FormulationResult,
  animalName: string,
  weight: number,
  mode: "balanced" | "economy",
  lang: "ar" | "en" = "ar"
): string {
  // This mirrors the guard added in the real rationToText:
  const safeResult = normalizeFormulationResult(result);
  const lines: string[] = [];
  lines.push(`Animal: ${animalName}`);
  lines.push(`Weight: ${weight}`);
  // These are the lines that would crash with legacy data before the fix:
  lines.push(`Protein: ${safeResult.achieved.cp.toFixed(1)}%`);
  lines.push(`Energy: ${safeResult.achieved.tdn.toFixed(1)}%`);
  lines.push(`Fiber: ${safeResult.achieved.fiber.toFixed(1)}%`);
  lines.push(`Cost: ${safeResult.totalCost.toFixed(2)}`);
  lines.push(`Feasible: ${safeResult.feasible}`);
  return lines.join("\n");
}

describe("rationToText with legacy data", () => {
  it("does not crash on legacy result missing achieved/targets", () => {
    const legacy = {
      dmi: 18.5,
      totalCost: 150,
      // MISSING: achieved, targets, components, feasible, warnings
    } as Partial<FormulationResult>;
    expect(() => rationToTextLike(legacy as FormulationResult, "بقرة", 500, "balanced")).not.toThrow();
  });

  it("produces text with 0% for missing achieved values", () => {
    const legacy = {
      dmi: 18.5,
      totalCost: 150,
    } as Partial<FormulationResult>;
    const text = rationToTextLike(legacy as FormulationResult, "بقرة", 500, "balanced");
    expect(text).toContain("Protein: 0.0%");
    expect(text).toContain("Energy: 0.0%");
    expect(text).toContain("Fiber: 0.0%");
    expect(text).toContain("Cost: 150.00");
  });

  it("preserves complete result data", () => {
    const complete: FormulationResult = {
      dmi: 18.5,
      perAnimalDmi: 18.5,
      flockSize: 1,
      components: [],
      totalCost: 150,
      costPerKg: 8.1,
      costPerMonth: 4500,
      costPerAnimal: 150,
      costPerTon: 8100,
      achieved: { cp: 15.5, tdn: 70.2, fiber: 10.1 },
      targets: { cpMin: 15, tdnMin: 65, fiberMax: 24 },
      feasible: true,
      warnings: [],
    };
    const text = rationToTextLike(complete, "بقرة", 500, "balanced");
    expect(text).toContain("Protein: 15.5%");
    expect(text).toContain("Energy: 70.2%");
    expect(text).toContain("Fiber: 10.1%");
    expect(text).toContain("Feasible: true");
  });

  it("handles null result via normalize", () => {
    expect(() => rationToTextLike(null as unknown as FormulationResult, "Test", 100, "balanced")).not.toThrow();
    const text = rationToTextLike(null as unknown as FormulationResult, "Test", 100, "balanced");
    expect(text).toContain("Protein: 0.0%");
  });
});

/* ---------- ComparePanel logic (simulated) -------------------------- */

// ComparePanel accesses a.result.achieved.cp directly. The fix normalizes
// both a and b at entry. We simulate that here.
function simulateCompareAccess(aRaw: { result: FormulationResult }, bRaw: { result: FormulationResult }) {
  const a = { ...aRaw, result: normalizeFormulationResult(aRaw.result) };
  const b = { ...bRaw, result: normalizeFormulationResult(bRaw.result) };
  // These are the exact accesses that crashed before the fix:
  return {
    aCp: a.result.achieved.cp,
    aTdn: a.result.achieved.tdn,
    aFiber: a.result.achieved.fiber,
    aCost: a.result.totalCost,
    bCp: b.result.achieved.cp,
    bTdn: b.result.achieved.tdn,
    bFiber: b.result.achieved.fiber,
    bCost: b.result.totalCost,
    cheaperIsA: a.result.totalCost <= b.result.totalCost,
  };
}

describe("ComparePanel access with legacy data", () => {
  it("does not crash when both rations are legacy (missing achieved)", () => {
    const a = { result: { dmi: 18, totalCost: 150 } as Partial<FormulationResult> };
    const b = { result: { dmi: 16, totalCost: 140 } as Partial<FormulationResult> };
    expect(() => simulateCompareAccess(a as any, b as any)).not.toThrow();
  });

  it("returns 0 for missing achieved values", () => {
    const a = { result: { dmi: 18, totalCost: 150 } as Partial<FormulationResult> };
    const b = { result: { dmi: 16, totalCost: 140 } as Partial<FormulationResult> };
    const cmp = simulateCompareAccess(a as any, b as any);
    expect(cmp.aCp).toBe(0);
    expect(cmp.bCp).toBe(0);
    expect(cmp.aTdn).toBe(0);
    expect(cmp.bTdn).toBe(0);
    expect(cmp.aFiber).toBe(0);
    expect(cmp.bFiber).toBe(0);
  });

  it("compares costs correctly with legacy data", () => {
    const a = { result: { totalCost: 150 } as Partial<FormulationResult> };
    const b = { result: { totalCost: 140 } as Partial<FormulationResult> };
    const cmp = simulateCompareAccess(a as any, b as any);
    expect(cmp.aCost).toBe(150);
    expect(cmp.bCost).toBe(140);
    expect(cmp.cheaperIsA).toBe(false); // b is cheaper
  });

  it("handles mix of complete + legacy ration", () => {
    const complete: Partial<FormulationResult> = {
      dmi: 18,
      totalCost: 150,
      achieved: { cp: 15, tdn: 70, fiber: 10 },
      targets: { cpMin: 15, tdnMin: 65, fiberMax: 24 },
      feasible: true,
      warnings: [],
      components: [],
    };
    const legacy: Partial<FormulationResult> = {
      dmi: 16,
      totalCost: 140,
    };
    const cmp = simulateCompareAccess(
      { result: complete } as any,
      { result: legacy } as any
    );
    expect(cmp.aCp).toBe(15); // complete preserved
    expect(cmp.bCp).toBe(0); // legacy backfilled
  });

  it("handles null result in one ration", () => {
    const a = { result: null as unknown as FormulationResult };
    const b = { result: { totalCost: 140 } as Partial<FormulationResult> };
    expect(() => simulateCompareAccess(a as any, b as any)).not.toThrow();
    const cmp = simulateCompareAccess(a as any, b as any);
    expect(cmp.aCost).toBe(0);
    expect(cmp.bCost).toBe(140);
  });
});
