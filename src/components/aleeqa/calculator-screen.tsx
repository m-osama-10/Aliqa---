"use client";

import { useMemo, useState, useEffect } from "react";
import {
  Calculator,
  PiggyBank,
  Info,
  Wheat,
  Sparkles,
  SlidersHorizontal,
  RotateCcw,
  Check,
  Printer,
  FileText,
  Coins,
} from "lucide-react";
import { cn } from "@/lib/utils";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Separator } from "@/components/ui/separator";
import { toast } from "sonner";
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from "@/components/ui/tooltip";
import {
  ANIMALS,
  ANIMAL_ORDER,
  INGREDIENTS,
  INGREDIENT_ORDER,
  type AnimalKey,
  type FormulationMode,
  type IngredientKey,
  normalizeFormulationResult,
} from "@/lib/feed-data";
import { computeManualResult, formulateRation, formulateRationWithLocks } from "@/lib/feed-lp";
import { usePrices, useRations, useIngredients, type PriceMap } from "@/lib/storage";
import { CATEGORY_LABELS, CATEGORY_ORDER } from "@/lib/ingredient-db";
import { printRationReport } from "@/lib/ration-report";
import { useLang } from "@/lib/i18n";
import { RationResult, rationToText } from "./ration-result";
import { ManualEditor } from "./manual-editor";
import { AdSlot, AdSection } from "@/components/ads";

export function CalculatorScreen() {
  const { t, lang } = useLang();
  const { prices, updatePrice, updatedAt, activeProfile } = usePrices();
  const { rations, saveRation } = useRations();
  const { ingredients } = useIngredients();

  const numLocale = lang === "ar" ? "ar-EG" : "en-GB";
  const fmt = (n: number | undefined | null, d = 2) =>
    (n ?? 0).toLocaleString(numLocale, { minimumFractionDigits: d, maximumFractionDigits: d });

  const [animalKey, setAnimalKey] = useState<AnimalKey>("dairy_cow");
  const [weight, setWeight] = useState(ANIMALS.dairy_cow.defaultWeight);
  const [production, setProduction] = useState(ANIMALS.dairy_cow.productionDefault);
  const [flockSize, setFlockSize] = useState(ANIMALS.dairy_cow.defaultFlockSize);
  const [mode, setMode] = useState<FormulationMode>("balanced");
  const [selectedIngredients, setSelectedIngredients] = useState<Set<string>>(new Set());
  const [ingredientSelectionMode, setIngredientSelectionMode] = useState<"auto" | "manual">("auto");

  // Manual percentage editing.
  const [manualMode, setManualMode] = useState(false);
  const [manualPercents, setManualPercents] = useState<Record<string, number>>({});
  const [lockedKeys, setLockedKeys] = useState<Set<string>>(new Set());
  const [autoBalance, setAutoBalance] = useState(false);

  const animal = ANIMALS[animalKey];

  const handleAnimalChange = (key: AnimalKey) => {
    setAnimalKey(key);
    setWeight(ANIMALS[key].defaultWeight);
    setProduction(ANIMALS[key].productionDefault);
    setFlockSize(ANIMALS[key].defaultFlockSize);
    setManualMode(false);
    setManualPercents({});
    setSelectedIngredients(new Set());
    setIngredientSelectionMode("auto");
  };

  // Get ingredients available for this animal
  const availableIngredients = useMemo(() => {
    return ingredients.filter((ing) => {
      const b = animal.bounds[ing.key];
      return (b && b.ub > 0) || (!b && ing.maxUsage > 0);
    });
  }, [ingredients, animal]);

  // Effective selected keys (auto = all available, manual = user selection)
  const effectiveSelectedKeys = useMemo(() => {
    if (ingredientSelectionMode === "auto" || selectedIngredients.size === 0) {
      return new Set(availableIngredients.map((ing) => ing.key));
    }
    return selectedIngredients;
  }, [ingredientSelectionMode, selectedIngredients, availableIngredients]);

  // Selected ingredient objects for formulation
  const selectedIngredientObjects = useMemo(() => {
    return ingredients.filter((ing) => effectiveSelectedKeys.has(ing.key));
  }, [ingredients, effectiveSelectedKeys]);

  // Wrappers that reset manual mode when scenario inputs change.
  const handleWeightChange = (v: number) => {
    setWeight(v);
    setManualMode(false);
    setManualPercents({});
  };
  const handleProductionChange = (v: number) => {
    setProduction(v);
    setManualMode(false);
    setManualPercents({});
  };
  const handleFlockChange = (v: number) => {
    setFlockSize(v);
    setManualMode(false);
    setManualPercents({});
  };
  const handleModeChange = (m: FormulationMode) => {
    setMode(m);
    setManualMode(false);
    setManualPercents({});
  };

  const lpResult = useMemo(
    () => formulateRation({ animalKey, weight, production, prices, mode, flockSize, ingredients: selectedIngredientObjects }),
    [animalKey, weight, production, prices, mode, flockSize, selectedIngredientObjects]
  );

  // Balanced baseline for savings + diff comparison.
  const balancedResult = useMemo(
    () => formulateRation({ animalKey, weight, production, prices, mode: "balanced", flockSize, ingredients: selectedIngredientObjects }),
    [animalKey, weight, production, prices, flockSize, selectedIngredientObjects]
  );

  // Reset manual mode when scenario inputs change (not prices).
  // (handled inline by handleWeightChange / handleProductionChange / handleModeChange)

  // Enable manual mode: snapshot current LP result into editable percents.
  const enableManual = () => {
    const snap: Record<string, number> = {};
    for (const ing of selectedIngredientObjects) {
      const c = lpResult.components.find((c) => c.ingredient.key === ing.key);
      snap[ing.key] = c ? +c.percent.toFixed(1) : 0;
    }
    setManualPercents(snap);
    setManualMode(true);
    toast.info(t("calc.manual_toast"));
  };

  const disableManual = () => {
    setManualMode(false);
  };

  // The result to display: manual override if active, else LP.
  const displayResult = useMemo(() => {
    if (manualMode && autoBalance) {
      // Smart balancing: locked ingredients stay fixed, others adjust
      const lockedPercents: Record<string, number> = {};
      for (const k of lockedKeys) {
        lockedPercents[k] = manualPercents[k] ?? 0;
      }
      const activeKeys = Object.keys(manualPercents).filter((k) => manualPercents[k] > 0);
      return formulateRationWithLocks({
        animalKey,
        weight,
        production,
        prices,
        mode,
        flockSize,
        ingredients: selectedIngredientObjects,
        lockedPercents,
        activeKeys,
      });
    }
    if (manualMode) {
      return computeManualResult(
        manualPercents,
        lpResult.perAnimalDmi,
        prices,
        {
          cpMin: animal.targets.cpMin,
          tdnMin: animal.targets.tdnMin,
          fiberMax: animal.targets.fiberMax,
        },
        flockSize,
        selectedIngredientObjects
      );
    }
    return lpResult;
  }, [manualMode, manualPercents, lpResult, prices, animal.targets, flockSize, selectedIngredientObjects, autoBalance, lockedKeys, animalKey, weight, production, mode]);

  // Sync manualPercents with auto-balance result so sliders/inputs update
  useEffect(() => {
    if (manualMode && autoBalance && displayResult.feasible) {
      const newPercents: Record<string, number> = {};
      for (const c of displayResult.components) {
        newPercents[c.ingredient.key] = +c.percent.toFixed(1);
      }
      let changed = false;
      for (const k of Object.keys(newPercents)) {
        if (Math.abs((manualPercents[k] ?? 0) - newPercents[k]) > 0.05) { changed = true; break; }
      }
      if (changed) setManualPercents((prev) => ({ ...prev, ...newPercents }));
    }
  }, [displayResult, manualMode, autoBalance]);

  const savings =
    mode === "economy" && !manualMode && lpResult.feasible && balancedResult.feasible
      ? {
          amount: +(balancedResult.totalCost - lpResult.totalCost).toFixed(2),
          pct:
            balancedResult.totalCost > 0
              ? +(((balancedResult.totalCost - lpResult.totalCost) / balancedResult.totalCost) * 100).toFixed(1)
              : 0,
        }
      : null;

  const handleSave = () => {
    if (!displayResult.feasible) {
      toast.error(t("calc.no_save"));
      return;
    }
    const flockUnitLabel = lang === "ar" ? animal.flockUnit : animal.flockUnitEn;
    const weightUnitLabel = lang === "ar" ? animal.weightUnit : animal.weightUnitEn;
    const animalNameLabel = lang === "ar" ? animal.name : animal.nameEn;
    const flockLabel =
      animal.hasFlockInput && flockSize > 1
        ? ` — ${(flockSize ?? 0).toLocaleString(numLocale)} ${flockUnitLabel}`
        : "";
    const saved = saveRation({
      name: `${animalNameLabel} — ${weight} ${weightUnitLabel}${flockLabel}${
        manualMode ? ` (${lang === "ar" ? "يدوية" : "manual"})` : ""
      }`,
      animalKey,
      animalName: animalNameLabel,
      weight,
      production,
      flockSize,
      mode: manualMode ? "balanced" : mode,
      prices,
      result: displayResult,
    });
    if (saved) {
      toast.success(t("calc.saved_toast"));
    } else {
      toast.error(t("calc.save_fail"));
    }
  };

  const handleShare = async () => {
    if (!displayResult.feasible) return;
    const animalNameLabel = lang === "ar" ? animal.name : animal.nameEn;
    const flockUnitLabel = lang === "ar" ? animal.flockUnit : animal.flockUnitEn;
    const text = rationToText(displayResult, animalNameLabel, weight, mode, flockUnitLabel, lang);
    const nav = navigator as Navigator & { share?: (d: { text: string; title?: string }) => Promise<void> };
    if (nav.share) {
      try {
        await nav.share({ title: t("common.app_name"), text });
        return;
      } catch {
        /* fall through to copy */
      }
    }
    try {
      await navigator.clipboard.writeText(text);
      toast.success(t("rations.copied_toast"));
    } catch {
      toast.error(t("rations.copy_fail"));
    }
  };

  const handlePdf = () => {
    if (!displayResult.feasible) {
      toast.error(t("calc.no_export"));
      return;
    }
    printRationReport({
      result: displayResult,
      animalKey,
      weight,
      production,
      flockSize,
      mode: manualMode ? "balanced" : mode,
      prices,
      savings,
      lang,
    });
  };

  const handleWhatsapp = () => {
    if (!displayResult.feasible) return;
    const animalNameLabel = lang === "ar" ? animal.name : animal.nameEn;
    const flockUnitLabel = lang === "ar" ? animal.flockUnit : animal.flockUnitEn;
    const text = encodeURIComponent(
      rationToText(displayResult, animalNameLabel, weight, mode, flockUnitLabel, lang)
    );
    window.open(`https://wa.me/?text=${text}`, "_blank");
  };

  // Clamp helper for number inputs.
  const clampWeight = (v: number) =>
    Math.min(animal.weightMax, Math.max(animal.weightMin, v || animal.weightMin));
  const clampProduction = (v: number) =>
    Math.min(animal.productionMax, Math.max(animal.productionMin, v || 0));

  return (
    <div className="space-y-5">
      {/* Animal selector */}
      <Card className="overflow-hidden border-border/60">
        <CardContent className="p-4">
          <SectionLabel n={lang === "ar" ? "١" : "1"} title={t("calc.s1.title")} />
          <div className="grid grid-cols-2 gap-2 sm:grid-cols-4">
            {ANIMAL_ORDER.map((key) => {
              const a = ANIMALS[key];
              return (
                <button
                  key={key}
                  onClick={() => handleAnimalChange(key)}
                  className={cn(
                    "group flex flex-col items-center gap-1 rounded-xl border-2 p-3 text-center transition-all",
                    animalKey === key
                      ? "border-primary bg-primary/10 shadow-sm"
                      : "border-border bg-card hover:border-primary/40 hover:bg-secondary/50"
                  )}
                >
                  <span className="text-2xl transition-transform group-hover:scale-110">{a.emoji}</span>
                  <span className="text-xs font-bold text-foreground">{lang === "ar" ? a.name : a.nameEn}</span>
                </button>
              );
            })}
          </div>
        </CardContent>
      </Card>

      {/* Animal data inputs */}
      <Card className="border-border/60">
        <CardContent className="space-y-4 p-4">
          <SectionLabel n={lang === "ar" ? "٢" : "2"} title={t("calc.s2.title")} />
          {/* Weight — slider + number input */}
          <div>
            <div className="mb-1.5 flex items-center justify-between gap-2">
              <label className="text-xs font-bold text-foreground">{t("calc.weight")}</label>
              <div className="flex items-center gap-1.5">
                <input
                  type="number"
                  inputMode="decimal"
                  min={animal.weightMin}
                  max={animal.weightMax}
                  step={animal.weightStep}
                  value={weight}
                  onChange={(e) => handleWeightChange(clampWeight(Number(e.target.value)))}
                  className="w-20 rounded-lg border border-border bg-card px-2 py-1 text-center text-sm font-bold tabular-nums focus:border-primary focus:outline-none focus:ring-2 focus:ring-primary/20"
                />
                <span className="text-[11px] text-muted-foreground">{lang === "ar" ? animal.weightUnit : animal.weightUnitEn}</span>
              </div>
            </div>
            <input
              type="range"
              min={animal.weightMin}
              max={animal.weightMax}
              step={animal.weightStep}
              value={weight}
              onChange={(e) => handleWeightChange(Number(e.target.value))}
              className="h-2 w-full cursor-pointer appearance-none rounded-full bg-secondary accent-primary"
            />
            <div className="mt-1 flex justify-between text-[10px] text-muted-foreground">
              <span>{fmt(animal.weightMin, 0)} {lang === "ar" ? animal.weightUnit : animal.weightUnitEn}</span>
              <span>{fmt(animal.weightMax, 0)} {lang === "ar" ? animal.weightUnit : animal.weightUnitEn}</span>
            </div>
          </div>

          {/* Production (dairy only) — slider + number input */}
          {animal.hasProductionInput && (
            <div>
              <div className="mb-1.5 flex items-center justify-between gap-2">
                <label className="text-xs font-bold text-foreground">{lang === "ar" ? animal.productionLabel : animal.productionLabelEn}</label>
                <div className="flex items-center gap-1.5">
                  <input
                    type="number"
                    inputMode="decimal"
                    min={animal.productionMin}
                    max={animal.productionMax}
                    step={animal.productionStep}
                    value={production}
                    onChange={(e) => handleProductionChange(clampProduction(Number(e.target.value)))}
                    className="w-20 rounded-lg border border-border bg-card px-2 py-1 text-center text-sm font-bold tabular-nums focus:border-primary focus:outline-none focus:ring-2 focus:ring-primary/20"
                  />
                  <span className="text-[11px] text-muted-foreground">{lang === "ar" ? animal.productionUnit : animal.productionUnitEn}</span>
                </div>
              </div>
              <input
                type="range"
                min={animal.productionMin}
                max={animal.productionMax}
                step={animal.productionStep}
                value={production}
                onChange={(e) => handleProductionChange(Number(e.target.value))}
                className="h-2 w-full cursor-pointer appearance-none rounded-full bg-secondary accent-primary"
              />
              <div className="mt-1 flex justify-between text-[10px] text-muted-foreground">
                <span>{fmt(animal.productionMin, 0)} {lang === "ar" ? animal.productionUnit : animal.productionUnitEn}</span>
                <span>{fmt(animal.productionMax, 0)} {lang === "ar" ? animal.productionUnit : animal.productionUnitEn}</span>
              </div>
            </div>
          )}

          {/* Flock / herd size (all species) */}
          {animal.hasFlockInput && (
            <div>
              <div className="mb-1.5 flex items-center justify-between gap-2">
                <label className="text-xs font-bold text-foreground">{lang === "ar" ? animal.flockLabel : animal.flockLabelEn}</label>
                <div className="flex items-center gap-1.5">
                  <input
                    type="number"
                    inputMode="numeric"
                    min={animal.flockMin}
                    max={animal.flockMax}
                    step={animal.flockStep}
                    value={flockSize}
                    onChange={(e) =>
                      handleFlockChange(
                        Math.max(
                          animal.flockMin,
                          Math.min(animal.flockMax, Math.round(Number(e.target.value) || animal.flockMin))
                        )
                      )
                    }
                    className="w-24 rounded-lg border border-border bg-card px-2 py-1 text-center text-sm font-bold tabular-nums focus:border-primary focus:outline-none focus:ring-2 focus:ring-primary/20"
                  />
                  <span className="text-[11px] text-muted-foreground">{lang === "ar" ? animal.flockUnit : animal.flockUnitEn}</span>
                </div>
              </div>
              <input
                type="range"
                min={animal.flockMin}
                max={Math.min(animal.flockMax, 1000)}
                step={animal.flockStep}
                value={Math.min(flockSize, 1000)}
                onChange={(e) => handleFlockChange(Number(e.target.value))}
                className="h-2 w-full cursor-pointer appearance-none rounded-full bg-secondary accent-primary"
              />
              <div className="mt-1 flex items-center justify-between text-[10px] text-muted-foreground">
                <span>{fmt(animal.flockMin, 0)} {lang === "ar" ? animal.flockUnit : animal.flockUnitEn}</span>
                <span>{lang === "ar" ? `حتى ${fmt(animal.flockMax, 0)} ${animal.flockUnit} (اكتب الرقم مباشرة)` : `Up to ${fmt(animal.flockMax, 0)} ${animal.flockUnitEn} (type the number directly)`}</span>
              </div>
            </div>
          )}

          {/* DMI preview */}
          <div className="flex items-center justify-between rounded-lg bg-secondary/60 px-3 py-2">
            <span className="text-xs text-muted-foreground">
              {t("calc.dmi_label")}
              {animal.hasFlockInput && flockSize > 1 ? t("calc.dmi_flock_suffix") : ""}
            </span>
            <span className="text-sm font-extrabold tabular-nums text-foreground">{fmt(lpResult.dmi)} {t("common.kg")}/{t("common.day")}</span>
          </div>

          <p className="rounded-lg bg-primary/5 p-2.5 text-[11px] leading-relaxed text-muted-foreground">
            {lang === "ar" ? animal.description : animal.descriptionEn}
          </p>
        </CardContent>
      </Card>

      {/* Ingredient Selection */}
      <Card className="border-primary/30">
        <CardContent className="space-y-3 p-4">
          <SectionLabel n={lang === "ar" ? "٣" : "3"} title={lang === "ar" ? "اختيار المواد الخام" : "Select Ingredients"} />
          <div className="grid grid-cols-2 gap-2">
            <button
              onClick={() => setIngredientSelectionMode("auto")}
              className={cn(
                "rounded-lg border-2 px-3 py-2.5 text-xs font-bold transition-all",
                ingredientSelectionMode === "auto" ? "border-primary bg-primary/10 text-primary" : "border-border text-muted-foreground"
              )}
            >
              {lang === "ar" ? "تلقائي" : "Automatic"}
              <span className="mt-0.5 block text-[10px] font-normal opacity-80">{lang === "ar" ? "النظام يختار الأفضل" : "System picks best"}</span>
            </button>
            <button
              onClick={() => setIngredientSelectionMode("manual")}
              className={cn(
                "rounded-lg border-2 px-3 py-2.5 text-xs font-bold transition-all",
                ingredientSelectionMode === "manual" ? "border-primary bg-primary/10 text-primary" : "border-border text-muted-foreground"
              )}
            >
              {lang === "ar" ? "يدوي" : "Manual"}
              <span className="mt-0.5 block text-[10px] font-normal opacity-80">{lang === "ar" ? "أختار بنفسي" : "I choose"}</span>
            </button>
          </div>

          {ingredientSelectionMode === "manual" && (
            <div className="space-y-2">
              {CATEGORY_ORDER.map((cat) => {
                const catItems = availableIngredients.filter((ing) => ing.category === cat);
                if (catItems.length === 0) return null;
                return (
                  <div key={cat}>
                    <p className="mb-1 text-xs font-bold text-primary">{CATEGORY_LABELS[cat]}</p>
                    <div className="flex flex-wrap gap-1.5">
                      {catItems.map((ing) => {
                        const isSelected = selectedIngredients.has(ing.key);
                        return (
                          <button
                            key={ing.key}
                            onClick={() => {
                              setSelectedIngredients((prev) => {
                                const next = new Set(prev);
                                if (next.has(ing.key)) next.delete(ing.key);
                                else next.add(ing.key);
                                return next;
                              });
                            }}
                            className={cn(
                              "flex items-center gap-1 rounded-lg border-2 px-2 py-1 text-[11px] font-bold transition-all",
                              isSelected ? "border-primary bg-primary/10 text-primary" : "border-border text-muted-foreground hover:border-primary/30"
                            )}
                          >
                            <span>{ing.emoji}</span>
                            {lang === "ar" ? ing.name : ing.nameEn}
                            {isSelected && <span>✓</span>}
                          </button>
                        );
                      })}
                    </div>
                  </div>
                );
              })}
              <p className="text-[10px] text-muted-foreground">
                {lang === "ar" ? `المختار: ${selectedIngredients.size} مادة` : `Selected: ${selectedIngredients.size} items`}
              </p>
            </div>
          )}
          {ingredientSelectionMode === "auto" && (
            <p className="text-[11px] text-muted-foreground">
              {lang === "ar" ? `${availableIngredients.length} مادة متاحة — سيتم استخدامها تلقائياً` : `${availableIngredients.length} ingredients available — all will be used`}
            </p>
          )}
        </CardContent>
      </Card>

      {/* Cost optimizer */}
      <Card className="border-accent/40">
        <CardContent className="space-y-3 p-4">
          <div className="flex items-center gap-2">
            <PiggyBank className="h-4 w-4 text-accent-foreground" />
            <SectionLabel n={lang === "ar" ? "٤" : "4"} title={t("calc.s3.title")} inline />
            <TooltipProvider>
              <Tooltip>
                <TooltipTrigger asChild>
                  <Info className="h-3.5 w-3.5 text-muted-foreground" />
                </TooltipTrigger>
                <TooltipContent side="top" className="max-w-[240px] text-xs">
                  {t("calc.s3.tip")}
                </TooltipContent>
              </Tooltip>
            </TooltipProvider>
          </div>
          <div className="grid grid-cols-2 gap-2">
            <button
              onClick={() => handleModeChange("balanced")}
              disabled={manualMode}
              className={cn(
                "rounded-lg border-2 px-3 py-2.5 text-xs font-bold transition-all disabled:opacity-40",
                mode === "balanced" && !manualMode
                  ? "border-primary bg-primary/10 text-primary"
                  : "border-border text-muted-foreground hover:border-primary/30"
              )}
            >
              {t("calc.balanced")}
              <span className="mt-0.5 block text-[10px] font-normal opacity-80">{t("calc.balanced_sub")}</span>
            </button>
            <button
              onClick={() => handleModeChange("economy")}
              disabled={manualMode}
              className={cn(
                "rounded-lg border-2 px-3 py-2.5 text-xs font-bold transition-all disabled:opacity-40",
                mode === "economy" && !manualMode
                  ? "border-accent-foreground bg-accent/20 text-accent-foreground"
                  : "border-border text-muted-foreground hover:border-accent/50"
              )}
            >
              {t("calc.economy")}
              <span className="mt-0.5 block text-[10px] font-normal opacity-80">{t("calc.economy_sub")}</span>
            </button>
          </div>

          {/* Economy diff — show what changed vs balanced */}
          {mode === "economy" && !manualMode && lpResult.feasible && balancedResult.feasible && (
            <div className="rounded-lg border border-accent/40 bg-accent/8 p-2.5">
              <p className="mb-1.5 flex items-center gap-1 text-[11px] font-bold text-accent-foreground">
                <Sparkles className="h-3 w-3" /> {t("calc.diff_label")}
              </p>
              <div className="flex flex-wrap gap-1.5">
                {selectedIngredientObjects.map((ing) => {
                  const bal = balancedResult.components.find((c) => c.ingredient.key === ing.key)?.percent ?? 0;
                  const eco = lpResult.components.find((c) => c.ingredient.key === ing.key)?.percent ?? 0;
                  const diff = +(eco - bal).toFixed(1);
                  if (Math.abs(diff) < 0.2) return null;
                  const ingLabel = lang === "ar" ? ing.name : ing.nameEn;
                  return (
                    <span
                      key={ing.key}
                      className={cn(
                        "rounded-md px-1.5 py-0.5 text-[10px] font-bold tabular-nums",
                        diff > 0 ? "bg-green-100 text-green-800" : "bg-red-100 text-red-700"
                      )}
                    >
                      {ingLabel} {diff > 0 ? "+" : ""}{fmt(diff, 1)}%
                    </span>
                  );
                })}
              </div>
            </div>
          )}
        </CardContent>
      </Card>

      {/* Prices snapshot — inline editable */}
      <Card className="border-border/60 bg-secondary/30">
        <CardContent className="p-4">
          <div className="mb-2 flex items-center justify-between gap-2">
            <div className="flex items-center gap-2">
              <SectionLabel n={lang === "ar" ? "٥" : "5"} title={t("calc.s4.title")} inline />
              <Badge variant="outline" className="gap-1 text-[10px] font-bold">
                <Coins className="h-3 w-3" />
                {lang === "ar" ? activeProfile.name : activeProfile.nameEn}
              </Badge>
            </div>
            {updatedAt ? (
              <span className="text-[10px] text-muted-foreground">{t("common.updated")}: {updatedAt}</span>
            ) : (
              <span className="text-[10px] text-muted-foreground">{t("common.default_prices")}</span>
            )}
          </div>
          <div className="grid grid-cols-1 gap-2 sm:grid-cols-2">
            {selectedIngredientObjects.map((ing) => {
              const ingName = lang === "ar" ? ing.name : ing.nameEn;
              return (
                <div
                  key={ing.key}
                  className="flex items-center gap-2 rounded-lg border border-border/50 bg-card px-3 py-2"
                >
                  <span className="flex h-8 w-8 shrink-0 items-center justify-center rounded-lg bg-secondary text-base">{ing.emoji}</span>
                  <div className="min-w-0 flex-1">
                    <p className="text-xs font-bold text-foreground leading-tight">{ingName}</p>
                    <p className="text-[10px] text-muted-foreground">
                      {lang === "ar" ? "بروتين" : "CP"}: {ing.protein}% · {lang === "ar" ? "طاقة" : "TDN"}: {ing.tdn}%
                    </p>
                  </div>
                  <div className="flex shrink-0 items-center gap-1">
                    <input
                      type="number"
                      inputMode="decimal"
                      min={0}
                      step={0.5}
                      value={prices[ing.key] ?? ing.price}
                      onChange={(e) => {
                        const v = Number(e.target.value);
                        if (isFinite(v) && v >= 0) updatePrice(ing.key as never, v);
                      }}
                      className="w-16 rounded-md border border-border bg-background px-1.5 py-1 text-center text-sm font-extrabold tabular-nums focus:border-primary focus:outline-none focus:ring-1 focus:ring-primary/30"
                    />
                    <span className="text-[10px] text-muted-foreground whitespace-nowrap">{lang === "ar" ? "ج/كجم" : "EGP/kg"}</span>
                  </div>
                </div>
              );
            })}
          </div>
          <p className="mt-2 text-[10px] text-muted-foreground">
            {t("calc.s4.hint")}
          </p>
        </CardContent>
      </Card>

      <Separator />

      {/* Result */}
      <div>
        {/* In-feed ad above the result */}
        <AdSection placement="in-feed" label="إعلان" className="mb-3" />
        <div className="mb-3 flex flex-wrap items-center gap-2">
          <Calculator className="h-5 w-5 text-primary" />
          <h3 className="text-base font-extrabold text-foreground">
            {manualMode ? t("calc.result_manual") : t("calc.result_title")}
          </h3>
          <Badge variant="secondary" className="gap-1 text-[10px]">
            {manualMode ? (
              <><SlidersHorizontal className="h-3 w-3" /> {t("calc.manual_badge")}</>
            ) : (
              <><Sparkles className="h-3 w-3" /> {t("calc.lp_badge")}</>
            )}
          </Badge>
          <div className="ms-auto flex gap-1.5">
            {!manualMode ? (
              <Button onClick={enableManual} variant="outline" size="sm" className="gap-1.5">
                <SlidersHorizontal className="h-3.5 w-3.5" /> {t("calc.edit_btn")}
              </Button>
            ) : (
              <Button onClick={disableManual} variant="outline" size="sm" className="gap-1.5">
                <RotateCcw className="h-3.5 w-3.5" /> {t("calc.reset_auto")}
              </Button>
            )}
          </div>
        </div>

        {manualMode ? (
          <ManualEditor
            percents={manualPercents}
            onChange={(k, v) => setManualPercents((p) => ({ ...p, [k]: v }))}
            onDistribute={(newPercents) => setManualPercents(newPercents)}
            result={displayResult}
            availableKeys={selectedIngredientObjects.map((ing) => ing.key)}
            ingredients={selectedIngredientObjects}
            prices={prices}
            onSave={handleSave}
            onShare={handleShare}
            onPdf={handlePdf}
            onRebalance={() => {
              setAutoBalance(true);
              setLockedKeys(new Set());
            }}
            onReset={disableManual}
            lockedKeys={lockedKeys}
            onToggleLock={(key) => {
              setLockedKeys((prev) => {
                const next = new Set(prev);
                if (next.has(key)) next.delete(key);
                else next.add(key);
                return next;
              });
            }}
            autoBalance={autoBalance}
            onToggleAutoBalance={() => {
              setAutoBalance((v) => !v);
              if (autoBalance) setLockedKeys(new Set()); // clear locks when turning off
            }}
          />
        ) : (
          <RationResult
            result={displayResult}
            animalName={lang === "ar" ? animal.name : animal.nameEn}
            mode={mode}
            savings={savings}
            onSave={handleSave}
            onShare={handleShare}
            onPrint={handlePdf}
            flockUnit={lang === "ar" ? animal.flockUnit : animal.flockUnitEn}
            flockEmoji={animal.emoji}
          />
        )}

        <div className="mt-3 flex flex-wrap gap-2">
          <Button onClick={handleWhatsapp} variant="outline" size="sm" className="gap-1.5">
            <Wheat className="h-3.5 w-3.5" /> {t("common.whatsapp")}
          </Button>
          <Button onClick={handlePdf} variant="outline" size="sm" className="gap-1.5">
            <FileText className="h-3.5 w-3.5" /> {t("common.pdf")}
          </Button>
          {rations.length > 0 && (
            <span className="self-center text-[10px] text-muted-foreground">
              {t("calc.saved_count", { n: rations.length })}
            </span>
          )}
        </div>
      </div>

      <div className="flex items-start gap-2 rounded-lg border border-dashed border-border bg-card p-3 text-[10px] leading-relaxed text-muted-foreground">
        <Info className="mt-0.5 h-3.5 w-3.5 shrink-0 text-primary" />
        <p>
          {t("calc.disclaimer")}
        </p>
      </div>
    </div>
  );
}

/* ================================================================== */
/*  MANUAL PERCENTAGE EDITOR                                           */
/*  Now imported from ./manual-editor.tsx (shared component)          */
/* ================================================================== */

function SectionLabel({ n, title, inline }: { n: string; title: string; inline?: boolean }) {
  return (
    <div className={cn("flex items-center gap-2", inline && "inline-flex")}>
      <span className="flex h-6 w-6 items-center justify-center rounded-md bg-primary/10 font-mono text-[11px] font-black text-primary">
        {n}
      </span>
      <h4 className="text-sm font-extrabold text-foreground">{title}</h4>
    </div>
  );
}
