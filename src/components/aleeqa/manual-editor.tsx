"use client";

import { memo, useMemo, useCallback, useState } from "react";
import {
  Check,
  Printer,
  Info,
  Lock,
  Unlock,
  RotateCcw,
  Sparkles,
  ChevronDown,
  AlertTriangle,
} from "lucide-react";
import { cn } from "@/lib/utils";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import {
  Collapsible,
  CollapsibleTrigger,
  CollapsibleContent,
} from "@/components/ui/collapsible";
import type { FormulationResult } from "@/lib/feed-data";
import { normalizeFormulationResult } from "@/lib/feed-data";
import type { IngredientNutrition, IngredientCategory } from "@/lib/ingredient-db";
import { CATEGORY_LABELS, CATEGORY_ORDER } from "@/lib/ingredient-db";
import type { PriceMap } from "@/lib/storage";
import { distributePercentageChange, getSum } from "@/lib/percentage-distribution";
import { useLang } from "@/lib/i18n";

/* ================================================================== */
/*  TYPES & CONSTANTS                                                  */
/* ================================================================== */

export interface ManualEditorProps {
  percents: Record<string, number>;
  /** Called with the FULL new percents map (after smart distribution). */
  onChange: (key: string, value: number) => void;
  /**
   * Called with an UPDATER FUNCTION that receives the previous percents
   * and returns the new percents (after smart distribution).
   * The parent should apply it as: setManualPercents(prev => updater(prev))
   * This guarantees the distribution always uses the latest state —
   * no stale closures during rapid slider drags.
   */
  onDistribute: (updater: (prev: Record<string, number>) => Record<string, number>) => void;
  result: FormulationResult;
  availableKeys: string[];
  ingredients: IngredientNutrition[];
  prices: PriceMap;
  onSave: () => void;
  onShare: () => void;
  onPdf: () => void;
  /** Re-run the LP solver (Smart Rebalance button). */
  onRebalance: () => void;
  /** Reset to the LP solution (discard manual edits). */
  onReset: () => void;
  lockedKeys: Set<string>;
  onToggleLock: (key: string) => void;
  autoBalance: boolean;
  onToggleAutoBalance: () => void;
}

const CATEGORY_COLORS: Record<IngredientCategory, string> = {
  energy: "#f59e0b",
  protein: "#10b981",
  fiber: "#84cc16",
  mineral: "#a855f7",
  vitamin: "#ec4899",
  additive: "#6b7280",
};

const CATEGORY_DOT: Record<IngredientCategory, string> = {
  energy: "bg-amber-500",
  protein: "bg-emerald-500",
  fiber: "bg-lime-500",
  mineral: "bg-purple-500",
  vitamin: "bg-pink-500",
  additive: "bg-gray-500",
};

/* ================================================================== */
/*  MAIN COMPONENT                                                     */
/* ================================================================== */

function ManualEditorBase({
  percents,
  onDistribute,
  result,
  availableKeys,
  ingredients,
  prices,
  onSave,
  onShare,
  onPdf,
  onRebalance,
  onReset,
  lockedKeys,
  onToggleLock,
  autoBalance,
  onToggleAutoBalance,
}: ManualEditorProps) {
  const { t, lang } = useLang();
  const numLocale = lang === "ar" ? "ar-EG" : "en-GB";
  const fmt = useCallback(
    (n: number | undefined | null, d = 2) =>
      (n ?? 0).toLocaleString(numLocale, {
        minimumFractionDigits: d,
        maximumFractionDigits: d,
      }),
    [numLocale]
  );

  // Defense-in-depth: normalize via the shared helper.
  const safeResult = useMemo(() => normalizeFormulationResult(result), [result]);

  // Build ingredient map (memoized)
  const ingMap = useMemo(() => {
    const m: Record<string, IngredientNutrition> = {};
    for (const ing of ingredients) m[ing.key] = ing;
    return m;
  }, [ingredients]);

  // LP percentages for diff display (memoized)
  const lpPercents = useMemo(() => {
    const m: Record<string, number> = {};
    for (const c of safeResult.components) m[c.ingredient.key] = c.percent;
    return m;
  }, [safeResult.components]);

  // Sum of percentages
  const sumPct = useMemo(() => getSum(percents, availableKeys), [percents, availableKeys]);
  const sumOk = Math.abs(sumPct - 100) <= 0.1;

  // Smart change handler: distribute the delta across non-locked ingredients.
  // KEY FIX: onDistribute receives a FUNCTION (updater) so the parent can
  // apply it via setManualPercents(prev => updater(prev)). This guarantees
  // the distribution always uses the LATEST percents — no stale closures
  // during rapid slider drags where React may not re-render between events.
  const handleChange = useCallback(
    (key: string, rawValue: number) => {
      const value = Number.isFinite(rawValue) ? rawValue : 0;
      onDistribute((prev: Record<string, number>) =>
        distributePercentageChange({
          percents: prev,
          changedKey: key,
          newValue: value,
          lockedKeys,
          ingredients,
          availableKeys,
        })
      );
    },
    [lockedKeys, ingredients, availableKeys, onDistribute]
  );

  // Group ingredients by category (memoized)
  const grouped = useMemo(() => {
    const groups: Record<IngredientCategory, string[]> = {
      energy: [],
      protein: [],
      fiber: [],
      mineral: [],
      vitamin: [],
      additive: [],
    };
    for (const k of availableKeys) {
      const ing = ingMap[k];
      const cat = ing?.category ?? "additive";
      groups[cat].push(k);
    }
    return groups;
  }, [availableKeys, ingMap]);

  // Deviation from target (for the deviation stat)
  const deviation = useMemo(() => {
    const cpDev = safeResult.achieved.cp - safeResult.targets.cpMin;
    const tdnDev = safeResult.achieved.tdn - safeResult.targets.tdnMin;
    const fiberDev = safeResult.achieved.fiber - safeResult.targets.fiberMax;
    return { cpDev, tdnDev, fiberDev };
  }, [safeResult]);

  return (
    <Card className="border-primary/30">
      <CardContent className="space-y-4 p-4">
        {/* === Live nutrition + cost summary (4 stats) === */}
        <div className="grid grid-cols-2 gap-2 sm:grid-cols-4">
          <MiniStat
            label={t("manual.protein")}
            value={`${fmt(safeResult.achieved.cp, 1)}%`}
            ok={safeResult.achieved.cp >= safeResult.targets.cpMin - 0.3}
            sub={`≥ ${fmt(safeResult.targets.cpMin, 0)}%`}
            color="#10b981"
          />
          <MiniStat
            label={t("manual.energy")}
            value={`${fmt(safeResult.achieved.tdn, 1)}%`}
            ok={safeResult.achieved.tdn >= safeResult.targets.tdnMin - 0.5}
            sub={`≥ ${fmt(safeResult.targets.tdnMin, 0)}%`}
            color="#f59e0b"
          />
          <MiniStat
            label={t("manual.fiber")}
            value={`${fmt(safeResult.achieved.fiber, 1)}%`}
            ok={safeResult.achieved.fiber <= safeResult.targets.fiberMax + 0.5}
            sub={`≤ ${fmt(safeResult.targets.fiberMax, 0)}%`}
            color="#84cc16"
          />
          <MiniStat
            label={t("manual.cost_day")}
            value={fmt(safeResult.totalCost, 0)}
            sub={t("common.egp")}
            color="#6366f1"
          />
        </div>

        {/* === Sum bar === */}
        <div
          className={cn(
            "rounded-lg border p-2.5",
            sumOk ? "border-primary/30 bg-primary/5" : "border-amber-400/50 bg-amber-50"
          )}
        >
          <div className="mb-1 flex items-center justify-between text-[11px]">
            <span className="font-bold text-foreground">{t("manual.sum_label")}</span>
            <span
              className={cn(
                "font-extrabold tabular-nums",
                sumOk ? "text-primary" : "text-amber-700"
              )}
            >
              {fmt(sumPct, 1)}%
            </span>
          </div>
          <div className="h-2 overflow-hidden rounded-full bg-secondary">
            <div
              className={cn(
                "h-full rounded-full transition-all duration-150",
                sumOk ? "bg-primary" : "bg-amber-500"
              )}
              style={{ width: `${Math.min(100, Math.max(0, sumPct))}%` }}
            />
          </div>
          {!sumOk && (
            <p className="mt-1 text-[10px] font-bold text-amber-700">
              {sumPct > 100
                ? t("manual.over", { n: fmt(sumPct - 100, 1) })
                : t("manual.under", { n: fmt(100 - sumPct, 1) })}
            </p>
          )}
        </div>

        {/* === Smart Auto-Balance toggle === */}
        <div className="flex items-center justify-between gap-2 rounded-lg border border-primary/20 bg-primary/5 p-2.5">
          <div className="flex items-center gap-2">
            <button
              type="button"
              onClick={onToggleAutoBalance}
              className={cn(
                "relative h-6 w-11 rounded-full transition-colors",
                autoBalance ? "bg-primary" : "bg-muted-foreground/30"
              )}
              aria-pressed={autoBalance}
            >
              <span
                className={cn(
                  "absolute top-0.5 h-5 w-5 rounded-full bg-white shadow transition-transform",
                  autoBalance ? "left-5" : "left-0.5"
                )}
              />
            </button>
            <div>
              <p className="text-xs font-bold text-foreground">
                {lang === "ar" ? "موازنة تلقائية ذكية" : "Smart Auto-Balance"}
              </p>
              <p className="text-[10px] text-muted-foreground">
                {lang === "ar"
                  ? "ثبّت الخامات🔒 ويعدّل الباقي تلقائياً"
                  : "Lock🔒, auto-adjust rest"}
              </p>
            </div>
          </div>
          {lockedKeys.size > 0 && (
            <span className="rounded-full bg-primary px-2 py-0.5 text-[10px] font-bold text-primary-foreground">
              {lockedKeys.size} {lang === "ar" ? "مثبت" : "locked"}
            </span>
          )}
        </div>

        {/* === Auto-balance warnings === */}
        {autoBalance && safeResult.warnings.length > 0 && (
          <div className="rounded-lg border border-amber-400/50 bg-amber-50 p-2.5">
            {safeResult.warnings.map((w, i) => (
              <p key={i} className="text-[10px] font-medium text-amber-800">
                {w}
              </p>
            ))}
          </div>
        )}

        {/* === Ingredient cards grouped by category (accordion) === */}
        <div className="space-y-2">
          {CATEGORY_ORDER.map((cat) => {
            const keys = grouped[cat];
            if (!keys || keys.length === 0) return null;
            return (
              <CategoryAccordion
                key={cat}
                category={cat}
                keys={keys}
                ingMap={ingMap}
                percents={percents}
                lpPercents={lpPercents}
                prices={prices}
                lockedKeys={lockedKeys}
                autoBalance={autoBalance}
                dmi={safeResult.dmi}
                lang={lang}
                fmt={fmt}
                t={t}
                onChange={handleChange}
                onToggleLock={onToggleLock}
              />
            );
          })}
        </div>

        {/* === Bottom warnings === */}
        {safeResult.warnings.length > 0 && (
          <div className="rounded-lg border border-amber-400/40 bg-amber-50/70 p-2.5">
            {safeResult.warnings.map((w, i) => (
              <p
                key={i}
                className="flex items-start gap-1.5 text-[11px] text-amber-800"
              >
                <Info className="mt-0.5 h-3 w-3 shrink-0" />
                {w}
              </p>
            ))}
          </div>
        )}

        {/* === Action buttons === */}
        <div className="flex flex-wrap gap-2 border-t border-border pt-3">
          <Button
            onClick={onRebalance}
            variant="default"
            size="sm"
            className="gap-1.5"
            title={t("manual.rebalance")}
          >
            <Sparkles className="h-3.5 w-3.5" /> {t("manual.rebalance")}
          </Button>
          <Button
            onClick={onReset}
            variant="outline"
            size="sm"
            className="gap-1.5"
            title={t("manual.reset")}
          >
            <RotateCcw className="h-3.5 w-3.5" /> {t("manual.reset")}
          </Button>
          <Button
            onClick={onSave}
            size="sm"
            className="gap-1.5"
            disabled={!sumOk}
            title={t("manual.save")}
          >
            <Check className="h-3.5 w-3.5" /> {t("manual.save")}
          </Button>
          <Button
            onClick={onShare}
            variant="outline"
            size="sm"
            className="gap-1.5"
            disabled={!sumOk}
          >
            {t("common.share")}
          </Button>
          <Button
            onClick={onPdf}
            variant="outline"
            size="sm"
            className="gap-1.5"
            disabled={!sumOk}
          >
            <Printer className="h-3.5 w-3.5" /> {t("common.pdf")}
          </Button>
        </div>
      </CardContent>
    </Card>
  );
}

export const ManualEditor = memo(ManualEditorBase);

/* ================================================================== */
/*  MINI STAT (top summary cards)                                      */
/* ================================================================== */

interface MiniStatProps {
  label: string;
  value: string;
  sub: string;
  ok?: boolean;
  color?: string;
}

const MiniStat = memo(function MiniStat({ label, value, sub, ok, color }: MiniStatProps) {
  return (
    <div
      className={cn(
        "rounded-xl border p-2.5",
        ok === undefined
          ? "border-border/60 bg-card"
          : ok
            ? "border-primary/30 bg-primary/5"
            : "border-amber-400/40 bg-amber-50/60"
      )}
    >
      <p className="flex items-center gap-1 text-[10px] text-muted-foreground">
        {color && (
          <span
            className="inline-block h-2 w-2 rounded-full"
            style={{ backgroundColor: color }}
          />
        )}
        {label}
      </p>
      <p className="text-base font-extrabold tabular-nums text-foreground">{value}</p>
      <p className="text-[10px] text-muted-foreground">{sub}</p>
    </div>
  );
});

/* ================================================================== */
/*  CATEGORY ACCORDION                                                 */
/* ================================================================== */

interface CategoryAccordionProps {
  category: IngredientCategory;
  keys: string[];
  ingMap: Record<string, IngredientNutrition>;
  percents: Record<string, number>;
  lpPercents: Record<string, number>;
  prices: PriceMap;
  lockedKeys: Set<string>;
  autoBalance: boolean;
  dmi: number;
  lang: "ar" | "en";
  fmt: (n: number | undefined | null, d?: number) => string;
  t: (key: string, vars?: Record<string, string | number>) => string;
  onChange: (key: string, value: number) => void;
  onToggleLock: (key: string) => void;
}

const CategoryAccordion = memo(function CategoryAccordion({
  category,
  keys,
  ingMap,
  percents,
  lpPercents,
  prices,
  lockedKeys,
  autoBalance,
  dmi,
  lang,
  fmt,
  t,
  onChange,
  onToggleLock,
}: CategoryAccordionProps) {
  const [open, setOpen] = useState(true);
  const color = CATEGORY_COLORS[category];
  const dotClass = CATEGORY_DOT[category];
  const label = CATEGORY_LABELS[category];

  return (
    <Collapsible open={open} onOpenChange={setOpen}>
      <Card className="overflow-hidden border-border/60">
        <CollapsibleTrigger asChild>
          <button
            type="button"
            className="flex w-full items-center gap-2 p-3 text-start transition-colors hover:bg-secondary/50"
          >
            <span className={cn("h-2.5 w-2.5 rounded-full", dotClass)} />
            <span className="flex-1 text-sm font-extrabold text-foreground">{label}</span>
            <Badge variant="secondary" className="text-[10px]">
              {t("manual.components_count", { n: keys.length })}
            </Badge>
            <ChevronDown
              className={cn(
                "h-4 w-4 text-muted-foreground transition-transform",
                open && "rotate-180"
              )}
            />
          </button>
        </CollapsibleTrigger>
        <CollapsibleContent>
          <div className="space-y-2 border-t border-border/50 p-2.5">
            {keys.map((k) => (
              <ComponentRow
                key={k}
                ingKey={k}
                ing={ingMap[k]}
                pct={percents[k] ?? 0}
                dmi={dmi}
                price={prices[k] ?? ingMap[k]?.price ?? 0}
                lpPct={lpPercents[k] ?? 0}
                isLocked={lockedKeys.has(k)}
                autoBalance={autoBalance}
                lang={lang}
                fmt={fmt}
                t={t}
                color={color}
                onChange={onChange}
                onToggleLock={onToggleLock}
              />
            ))}
          </div>
        </CollapsibleContent>
      </Card>
    </Collapsible>
  );
});

/* ================================================================== */
/*  COMPONENT ROW (single ingredient)                                  */
/* ================================================================== */

interface ComponentRowProps {
  ingKey: string;
  ing: IngredientNutrition | undefined;
  pct: number;
  dmi: number;
  price: number;
  lpPct: number;
  isLocked: boolean;
  autoBalance: boolean;
  lang: "ar" | "en";
  fmt: (n: number | undefined | null, d?: number) => string;
  t: (key: string, vars?: Record<string, string | number>) => string;
  color: string;
  onChange: (key: string, value: number) => void;
  onToggleLock: (key: string) => void;
}

const ComponentRow = memo(function ComponentRow({
  ingKey,
  ing,
  pct,
  dmi,
  price,
  lpPct,
  isLocked,
  autoBalance,
  lang,
  fmt,
  t,
  color,
  onChange,
  onToggleLock,
}: ComponentRowProps) {
  const ingName = lang === "ar" ? ing?.name ?? ingKey : ing?.nameEn ?? ingKey;
  const emoji = ing?.emoji ?? "🧪";
  const kg = +((pct / 100) * dmi).toFixed(3);
  const cost = +(kg * price).toFixed(2);
  const diff = +(pct - lpPct).toFixed(1);
  const changed = Math.abs(diff) >= 0.1;
  const isAutoAdjusted = autoBalance && changed && !isLocked;

  const minBound = ing?.minUsage ?? 0;
  const maxBound = ing?.maxUsage ?? 100;
  const disabled = isLocked && autoBalance;

  const handleSlider = useCallback(
    (e: React.ChangeEvent<HTMLInputElement>) => {
      onChange(ingKey, Number(e.target.value));
    },
    [ingKey, onChange]
  );

  const handleInput = useCallback(
    (e: React.ChangeEvent<HTMLInputElement>) => {
      const v = Number(e.target.value);
      onChange(ingKey, Number.isFinite(v) ? Math.max(0, Math.min(100, v)) : 0);
    },
    [ingKey, onChange]
  );

  const handleLockToggle = useCallback(() => {
    onToggleLock(ingKey);
  }, [ingKey, onToggleLock]);

  return (
    <div
      className={cn(
        "rounded-lg border bg-card p-2.5 transition-all",
        isLocked
          ? "border-primary/50 bg-primary/5"
          : isAutoAdjusted
            ? "border-amber-400/50 bg-amber-50/50"
            : "border-border/60"
      )}
    >
      {/* Top row: emoji + name + stats + input + lock */}
      <div className="flex items-center gap-2">
        <span
          className="flex h-8 w-8 shrink-0 items-center justify-center rounded-lg text-base"
          style={{ backgroundColor: `${color}20` }}
        >
          {emoji}
        </span>
        <div className="min-w-0 flex-1">
          <p className="flex items-center gap-1 text-xs font-bold text-foreground">
            <span className="truncate">{ingName}</span>
            {isLocked && <Lock className="h-3 w-3 shrink-0 text-primary" />}
          </p>
          <p className="text-[10px] text-muted-foreground">
            <span className="font-medium text-foreground/80">
              {t("manual.protein")} {fmt(ing?.protein ?? 0, 1)}%
            </span>
            {" · "}
            <span>
              {t("manual.energy")} {fmt(ing?.tdn ?? 0, 0)}%
            </span>
            {" · "}
            <span>
              {fmt(price, 0)} {t("manual.egp")}
            </span>
          </p>
        </div>
        {/* Percentage input */}
        <div className="flex items-center gap-1">
          <input
            type="number"
            inputMode="decimal"
            min={0}
            max={100}
            step={0.5}
            value={pct}
            onChange={handleInput}
            disabled={disabled}
            className={cn(
              "w-14 rounded-md border bg-background px-1 py-1 text-center text-sm font-extrabold tabular-nums focus:border-primary focus:outline-none focus:ring-2 focus:ring-primary/20",
              disabled && "cursor-not-allowed opacity-50",
              isAutoAdjusted && "border-amber-400"
            )}
          />
          <span className="text-[10px] text-muted-foreground">%</span>
        </div>
        {/* Lock button */}
        <button
          type="button"
          onClick={handleLockToggle}
          disabled={!autoBalance}
          className={cn(
            "flex h-8 w-8 shrink-0 items-center justify-center rounded-md border transition-colors",
            !autoBalance
              ? "cursor-not-allowed border-border opacity-30"
              : isLocked
                ? "border-primary bg-primary text-primary-foreground"
                : "border-border hover:bg-secondary"
          )}
          title={isLocked ? t("manual.unlock") : t("manual.lock")}
          aria-label={isLocked ? t("manual.unlock") : t("manual.lock")}
        >
          {isLocked ? (
            <Lock className="h-3.5 w-3.5" />
          ) : (
            <Unlock className="h-3.5 w-3.5" />
          )}
        </button>
      </div>

      {/* Slider row */}
      <div className="mt-2">
        <input
          type="range"
          min={0}
          max={100}
          step={0.5}
          value={pct}
          onChange={handleSlider}
          disabled={disabled}
          className={cn(
            "h-1.5 w-full cursor-pointer appearance-none rounded-full bg-secondary accent-primary",
            disabled && "cursor-not-allowed opacity-50"
          )}
          style={{ accentColor: color }}
        />
        {/* Bounds + kg/cost below slider */}
        <div className="mt-1 flex items-center justify-between text-[9px] text-muted-foreground">
          <span>
            {t("manual.bounds", { min: fmt(minBound, 0), max: fmt(maxBound, 0) })}
          </span>
          <span className="tabular-nums">
            {fmt(kg, 2)} {t("manual.kg")} · {fmt(cost, 1)} {t("manual.egp")}
            {isAutoAdjusted && (
              <span
                className={cn(
                  "ms-1 font-bold",
                  diff > 0 ? "text-green-600" : "text-red-600"
                )}
              >
                ({diff > 0 ? "+" : ""}
                {fmt(diff, 1)}%)
              </span>
            )}
          </span>
        </div>
      </div>
    </div>
  );
});
