"use client";

import { useState } from "react";
import {
  Coins,
  RotateCcw,
  Search,
  ChevronDown,
  ChevronUp,
  Beaker,
  DollarSign,
} from "lucide-react";
import { cn } from "@/lib/utils";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Badge } from "@/components/ui/badge";
import { usePrices, useIngredients } from "@/lib/storage";
import { CATEGORY_LABELS, CATEGORY_ORDER, type IngredientCategory } from "@/lib/ingredient-db";
import { useLang } from "@/lib/i18n";
import { AdSection, AdSmartlink } from "@/components/ads";

export function PricesScreen() {
  const { t, lang } = useLang();
  const { prices, updatePrice } = usePrices();
  const { ingredients, updateIngredient, resetAllIngredients } = useIngredients();
  const [expandedKey, setExpandedKey] = useState<string | null>(null);
  const [search, setSearch] = useState("");

  const isRtl = lang === "ar";
  const filtered = ingredients.filter(
    (ing) =>
      ing.name.includes(search) ||
      ing.nameEn.toLowerCase().includes(search.toLowerCase()) ||
      ing.key.includes(search)
  );

  const handleReset = () => {
    if (confirm(isRtl ? "هل تريد إعادة كل القيم الغذائية للقيم الافتراضية؟" : "Reset all nutrition values to defaults?")) {
      resetAllIngredients();
    }
  };

  return (
    <div className="space-y-4">
      {/* Header */}
      <Card className="border-primary/20 bg-gradient-to-br from-primary/5 to-transparent">
        <CardContent className="p-4">
          <div className="mb-3 flex items-center justify-between gap-2">
            <div className="flex items-center gap-2">
              <Beaker className="h-5 w-5 text-primary" />
              <h2 className="text-base font-extrabold text-foreground">
                {isRtl ? "القيم الغذائية للمواد الخام" : "Ingredient Nutrition Values"}
              </h2>
            </div>
            <Button size="sm" variant="outline" className="gap-1.5" onClick={handleReset}>
              <RotateCcw className="h-3.5 w-3.5" />
              {isRtl ? "إعادة ضبط" : "Reset"}
            </Button>
          </div>
          <p className="text-[11px] leading-relaxed text-muted-foreground">
            {isRtl
              ? "كل القيم قابلة للتعديل. عدّلها حسب نتائج التحليل المعملي أو الشركة المنتجة. يتم إعادة الحساب فوراً."
              : "All values are editable. Adjust based on lab analysis or manufacturer data. Recalculation is instant."}
          </p>
        </CardContent>
      </Card>

      {/* Search */}
      <div className="relative">
        <Search className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
        <Input
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          placeholder={isRtl ? "بحث عن مادة خام..." : "Search ingredient..."}
          className="pl-9"
        />
      </div>

      {/* Ingredients grouped by category */}
      {CATEGORY_ORDER.map((cat) => {
        const catItems = filtered.filter((ing) => ing.category === cat);
        if (catItems.length === 0) return null;
        return (
          <div key={cat}>
            <div className="mb-2 flex items-center gap-2">
              <h3 className="text-sm font-bold text-foreground">
                {CATEGORY_LABELS[cat]}
              </h3>
              <Badge variant="secondary" className="text-[10px]">
                {catItems.length}
              </Badge>
            </div>

            <div className="space-y-2">
              {catItems.map((ing) => {
                const isExpanded = expandedKey === ing.key;
                return (
                  <Card key={ing.key} className="border-border/60">
                    <CardContent className="p-3">
                      {/* Compact row — always visible */}
                      <button
                        onClick={() => setExpandedKey(isExpanded ? null : ing.key)}
                        className="flex w-full items-center gap-3 text-right"
                      >
                        <span className="text-xl">{ing.emoji}</span>
                        <div className="min-w-0 flex-1">
                          <p className="truncate text-sm font-bold text-foreground">
                            {isRtl ? ing.name : ing.nameEn}
                          </p>
                          <div className="mt-0.5 flex flex-wrap gap-2 text-[10px] text-muted-foreground">
                            <span className="font-semibold text-primary">CP: {ing.protein}%</span>
                            <span>TDN: {ing.tdn}%</span>
                            <span>CF: {ing.fiber}%</span>
                          </div>
                        </div>
                        <div className="flex items-center gap-1">
                          <span className="text-xs font-bold text-foreground">
                            {prices[ing.key] ?? ing.price} {isRtl ? "ج" : "EGP"}
                          </span>
                          {isExpanded ? (
                            <ChevronUp className="h-4 w-4 text-muted-foreground" />
                          ) : (
                            <ChevronDown className="h-4 w-4 text-muted-foreground" />
                          )}
                        </div>
                      </button>

                      {/* Expanded editor — all nutrition fields */}
                      {isExpanded && (
                        <div className="mt-3 space-y-3 border-t border-border/40 pt-3">
                          {/* Price */}
                          <FieldRow
                            label={isRtl ? "السعر (جنيه/كجم)" : "Price (EGP/kg)"}
                            icon={<DollarSign className="h-3.5 w-3.5" />}
                            value={prices[ing.key] ?? ing.price}
                            onChange={(v) => updatePrice(ing.key as never, v)}
                            step={0.5}
                          />

                          <div className="grid grid-cols-2 gap-2">
                            <FieldRow
                              label={isRtl ? "البروتين الخام (CP %)" : "Crude Protein (CP %)"}
                              value={ing.protein}
                              onChange={(v) => updateIngredient(ing.key, "protein", v)}
                              step={0.1}
                            />
                            <FieldRow
                              label={isRtl ? "الطاقة (TDN %)" : "Energy (TDN %)"}
                              value={ing.tdn}
                              onChange={(v) => updateIngredient(ing.key, "tdn", v)}
                              step={0.1}
                            />
                            <FieldRow
                              label={isRtl ? "الألياف الخام (CF %)" : "Crude Fiber (CF %)"}
                              value={ing.fiber}
                              onChange={(v) => updateIngredient(ing.key, "fiber", v)}
                              step={0.1}
                            />
                            <FieldRow
                              label={isRtl ? "الدهون (EE %)" : "Ether Extract (EE %)"}
                              value={ing.fat}
                              onChange={(v) => updateIngredient(ing.key, "fat", v)}
                              step={0.1}
                            />
                            <FieldRow
                              label={isRtl ? "الكالسيوم (Ca %)" : "Calcium (Ca %)"}
                              value={ing.calcium}
                              onChange={(v) => updateIngredient(ing.key, "calcium", v)}
                              step={0.01}
                            />
                            <FieldRow
                              label={isRtl ? "الفوسفور (P %)" : "Phosphorus (P %)"}
                              value={ing.phosphorus}
                              onChange={(v) => updateIngredient(ing.key, "phosphorus", v)}
                              step={0.01}
                            />
                            <FieldRow
                              label={isRtl ? "المادة الجافة (DM %)" : "Dry Matter (DM %)"}
                              value={ing.dryMatter}
                              onChange={(v) => updateIngredient(ing.key, "dryMatter", v)}
                              step={0.1}
                            />
                            <FieldRow
                              label={isRtl ? "الاسم" : "Name"}
                              value={ing.name}
                              onChange={(v) => updateIngredient(ing.key, "name", v)}
                              isText
                            />
                            <FieldRow
                              label={isRtl ? "الحد الأدنى (%)" : "Min Usage (%)"}
                              value={ing.minUsage}
                              onChange={(v) => updateIngredient(ing.key, "minUsage", v)}
                              step={0.5}
                            />
                            <FieldRow
                              label={isRtl ? "الحد الأقصى (%)" : "Max Usage (%)"}
                              value={ing.maxUsage}
                              onChange={(v) => updateIngredient(ing.key, "maxUsage", v)}
                              step={0.5}
                            />
                          </div>
                        </div>
                      )}
                    </CardContent>
                  </Card>
                );
              })}
            </div>
          </div>
        );
      })}

      <p className="rounded-lg bg-primary/5 p-3 text-center text-[11px] leading-relaxed text-muted-foreground">
        {isRtl
          ? "💡 كل القيم محفوظة على جهازك. عدّلها حسب تحليلك المعملي. تُستخدم القيم المعدلة فوراً في كل الحسابات."
          : "💡 All values are stored locally. Adjust to your lab analysis. Modified values are used immediately in all calculations."}
      </p>

      <AdSection placement="in-feed" label="إعلان" />
      <div className="flex justify-center">
        <AdSmartlink variant="banner" />
      </div>
    </div>
  );
}

function FieldRow({
  label,
  value,
  onChange,
  step = 0.1,
  icon,
  isText = false,
}: {
  label: string;
  value: number | string;
  onChange: (v: number) => void;
  step?: number;
  icon?: React.ReactNode;
  isText?: boolean;
}) {
  return (
    <div className="space-y-1">
      <Label className="flex items-center gap-1 text-[10px] font-bold text-muted-foreground">
        {icon}
        {label}
      </Label>
      <Input
        type={isText ? "text" : "number"}
        step={step}
        value={value}
        onChange={(e) => {
          if (isText) {
            onChange(e.target.value as unknown as number);
          } else {
            onChange(Number(e.target.value) || 0);
          }
        }}
        className="h-8 text-xs"
      />
    </div>
  );
}
