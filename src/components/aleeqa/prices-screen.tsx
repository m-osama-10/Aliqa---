"use client";

import { useState, useMemo } from "react";
import {
  RotateCcw,
  Search,
  ChevronDown,
  ChevronUp,
  Beaker,
  Edit3,
} from "lucide-react";
import { cn } from "@/lib/utils";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Badge } from "@/components/ui/badge";
import { usePrices, useIngredients } from "@/lib/storage";
import {
  CATEGORY_LABELS,
  CATEGORY_ORDER,
  DEFAULT_INGREDIENTS,
  type IngredientNutrition,
} from "@/lib/ingredient-db";
import { useLang } from "@/lib/i18n";
import { AdSection, AdSmartlink, DelayedAd } from "@/components/ads";

export function PricesScreen() {
  const { t, lang } = useLang();
  const { prices, updatePrice } = usePrices();
  const { ingredients, updateIngredient, resetAllIngredients } = useIngredients();
  const [expandedKey, setExpandedKey] = useState<string | null>(null);
  const [search, setSearch] = useState("");

  const isRtl = lang === "ar";

  // Fallback to defaults if ingredients not loaded yet
  const displayIngredients = ingredients.length > 0 ? ingredients : DEFAULT_INGREDIENTS;

  const filtered = useMemo(() => {
    if (!search.trim()) return displayIngredients;
    const q = search.toLowerCase();
    return displayIngredients.filter(
      (ing) =>
        ing.name.includes(search) ||
        ing.nameEn.toLowerCase().includes(q) ||
        ing.key.toLowerCase().includes(q)
    );
  }, [displayIngredients, search]);

  const handleReset = () => {
    if (confirm(t("prices.reset_confirm"))) {
      resetAllIngredients();
    }
  };

  return (
    <div className="space-y-4">
      {/* Header */}
      <Card className="border-primary/20">
        <CardContent className="p-4">
          <div className="mb-2 flex items-center justify-between gap-2">
            <div className="flex items-center gap-2">
              <Beaker className="h-5 w-5 text-primary" />
              <h2 className="text-base font-extrabold">
                {t("prices.ingredient_db_title")}
              </h2>
            </div>
            <Button size="sm" variant="outline" className="shrink-0 gap-1.5" onClick={handleReset}>
              <RotateCcw className="h-3.5 w-3.5" />
              <span className="hidden sm:inline">{t("prices.reset_btn")}</span>
            </Button>
          </div>
          <p className="text-xs text-muted-foreground">
            {t("prices.edit_hint")}
          </p>
        </CardContent>
      </Card>

      {/* Search */}
      <div className="relative">
        <Search className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
        <Input
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          placeholder={t("prices.search_placeholder")}
          className="pl-9"
        />
      </div>

      {/* Categories */}
      {CATEGORY_ORDER.map((cat) => {
        const catItems = filtered.filter((ing) => ing.category === cat);
        if (catItems.length === 0) return null;

        return (
          <div key={cat} className="space-y-2">
            {/* Category header */}
            <div className="sticky top-14 z-10 flex items-center gap-2 rounded-lg bg-primary px-3 py-2 text-primary-foreground shadow-sm">
              <span className="text-sm font-extrabold">{CATEGORY_LABELS[cat]}</span>
              <Badge className="bg-white/20 text-[10px]">{catItems.length}</Badge>
            </div>

            {/* Items */}
            {catItems.map((ing) => (
              <IngredientCard
                key={ing.key}
                ing={ing}
                price={prices[ing.key] ?? ing.price}
                isExpanded={expandedKey === ing.key}
                onToggle={() => setExpandedKey(expandedKey === ing.key ? null : ing.key)}
                onPriceChange={(v) => updatePrice(ing.key as never, v)}
                onFieldChange={(field, v) => updateIngredient(ing.key, field, v)}
                isRtl={isRtl}
                t={t}
              />
            ))}
          </div>
        );
      })}

      <p className="rounded-lg bg-primary/5 p-3 text-center text-[11px] text-muted-foreground">
        {t("prices.editable_hint")}
      </p>

      <DelayedAd delayMs={10000}>
        <AdSection placement="in-feed" label={t("common.ad")} />
        <div className="flex justify-center">
          <AdSmartlink variant="banner" />
        </div>
      </DelayedAd>
    </div>
  );
}

/* ---------- Single ingredient card ---------- */
function IngredientCard({
  ing,
  price,
  isExpanded,
  onToggle,
  onPriceChange,
  onFieldChange,
  isRtl,
  t,
}: {
  ing: IngredientNutrition;
  price: number;
  isExpanded: boolean;
  onToggle: () => void;
  onPriceChange: (v: number) => void;
  onFieldChange: (field: keyof IngredientNutrition, v: string | number) => void;
  isRtl: boolean;
  t: (key: string, vars?: Record<string, string | number>) => string;
}) {
  return (
    <Card className={cn("border-border/60", isExpanded && "border-primary/40")}>
      <CardContent className="p-3">
        {/* Compact row */}
        <button onClick={onToggle} className="flex w-full items-center gap-3">
          <span className="flex h-9 w-9 shrink-0 items-center justify-center rounded-lg bg-secondary text-xl">
            {ing.emoji}
          </span>
          <div className="min-w-0 flex-1 text-left">
            <p className="text-sm font-bold leading-tight">{isRtl ? ing.name : ing.nameEn}</p>
            <p className="mt-0.5 text-[10px] text-muted-foreground">
              {t("prices.cp_label")}: {ing.protein}% ·{" "}
              {t("prices.tdn_label")}: {ing.tdn}% ·{" "}
              {t("prices.cf_label")}: {ing.fiber}%
            </p>
          </div>
          <div className="flex shrink-0 items-center gap-2">
            <span className="rounded-md bg-primary/10 px-2 py-1 text-xs font-bold text-primary">
              {price} {t("prices.egp_per_kg_short")}
            </span>
            {isExpanded ? (
              <ChevronUp className="h-4 w-4 text-muted-foreground" />
            ) : (
              <ChevronDown className="h-4 w-4 text-muted-foreground" />
            )}
          </div>
        </button>

        {/* Expanded editor */}
        {isExpanded && (
          <div className="mt-3 space-y-3 border-t border-border/40 pt-3">
            <div className="flex items-center gap-1.5 text-xs font-bold text-primary">
              <Edit3 className="h-3.5 w-3.5" />
              {t("prices.edit_nutrition")}
            </div>

            {/* Price */}
            <EditField
              label={t("prices.price_field")}
              value={price}
              step={0.5}
              onChange={onPriceChange}
            />

            {/* Nutrition values */}
            <div className="grid grid-cols-2 gap-2">
              <EditField
                label={t("prices.protein_field")}
                value={ing.protein}
                step={0.1}
                onChange={(v) => onFieldChange("protein", v)}
              />
              <EditField
                label={t("prices.tdn_field")}
                value={ing.tdn}
                step={0.1}
                onChange={(v) => onFieldChange("tdn", v)}
              />
              <EditField
                label={t("prices.fiber_field")}
                value={ing.fiber}
                step={0.1}
                onChange={(v) => onFieldChange("fiber", v)}
              />
              <EditField
                label={t("prices.fat_field")}
                value={ing.fat}
                step={0.1}
                onChange={(v) => onFieldChange("fat", v)}
              />
              <EditField
                label={t("prices.calcium_field")}
                value={ing.calcium}
                step={0.01}
                onChange={(v) => onFieldChange("calcium", v)}
              />
              <EditField
                label={t("prices.phosphorus_field")}
                value={ing.phosphorus}
                step={0.01}
                onChange={(v) => onFieldChange("phosphorus", v)}
              />
              <EditField
                label={t("prices.dm_field")}
                value={ing.dryMatter}
                step={0.1}
                onChange={(v) => onFieldChange("dryMatter", v)}
              />
              <EditField
                label={t("prices.min_usage_field")}
                value={ing.minUsage}
                step={0.5}
                onChange={(v) => onFieldChange("minUsage", v)}
              />
              <EditField
                label={t("prices.max_usage_field")}
                value={ing.maxUsage}
                step={0.5}
                onChange={(v) => onFieldChange("maxUsage", v)}
              />
            </div>
          </div>
        )}
      </CardContent>
    </Card>
  );
}

/* ---------- Editable field ---------- */
function EditField({
  label,
  value,
  onChange,
  step = 0.1,
}: {
  label: string;
  value: number;
  onChange: (v: number) => void;
  step?: number;
}) {
  return (
    <div className="space-y-1">
      <Label className="text-[10px] font-bold text-muted-foreground">{label}</Label>
      <Input
        type="number"
        step={step}
        value={value}
        onChange={(e) => onChange(Number(e.target.value) || 0)}
        className="h-8 text-xs"
      />
    </div>
  );
}
