"use client";

import { useState } from "react";
import {
  Save,
  RotateCcw,
  Coins,
  CheckCircle2,
  Plus,
  Trash2,
  Pencil,
} from "lucide-react";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { toast } from "sonner";
import { cn } from "@/lib/utils";
import {
  INGREDIENTS,
  INGREDIENT_ORDER,
  type IngredientCategory,
  type IngredientKey,
} from "@/lib/feed-data";
import {
  usePrices,
  useRations,
  MAX_PRICE_PROFILES,
  type PriceProfile,
} from "@/lib/storage";
import { useLang } from "@/lib/i18n";
import { AdSlot, AdSection } from "@/components/ads";

function draftFromPrices(prices: Record<IngredientKey, number>): Record<IngredientKey, string> {
  const d = {} as Record<IngredientKey, string>;
  for (const k of INGREDIENT_ORDER) d[k] = String(prices[k]);
  return d;
}

export function PricesScreen() {
  const { t, lang } = useLang();
  const {
    prices,
    updatePrice,
    resetPrices,
    profiles,
    activeProfileId,
    addProfile,
    switchProfile,
    deleteProfile,
    renameProfile,
  } = usePrices();
  const { rations } = useRations();
  const count = rations.length;
  const [draft, setDraft] = useState<Record<IngredientKey, string>>(() => draftFromPrices(prices));

  // Re-sync draft inputs when the active profile changes (switch / add / delete).
  // Implemented as the React-recommended "store previous prop, adjust state in
  // render" pattern to avoid setState-in-effect cascades.
  const [prevActiveId, setPrevActiveId] = useState(activeProfileId);
  if (prevActiveId !== activeProfileId) {
    setPrevActiveId(activeProfileId);
    setDraft(draftFromPrices(prices));
  }

  const numLocale = lang === "ar" ? "ar-EG" : "en-GB";
  const fmt = (n: number, d = 0) =>
    n.toLocaleString(numLocale, { minimumFractionDigits: d, maximumFractionDigits: d });

  const catLabel = (cat: IngredientCategory) => {
    switch (cat) {
      case "energy":
        return t("data.energy");
      case "protein":
        return t("data.protein_cat");
      case "fiber":
        return t("data.fiber_cat");
      case "additive":
        return t("data.additive_cat");
    }
  };

  const commit = (key: IngredientKey) => {
    const v = Number(draft[key]);
    if (!isFinite(v) || v < 0) {
      toast.error(t("prices.invalid"));
      setDraft((prev) => ({ ...prev, [key]: String(prices[key]) }));
      return;
    }
    updatePrice(key, v);
    const ingName = lang === "ar" ? INGREDIENTS[key].name : INGREDIENTS[key].nameEn;
    toast.success(t("prices.saved", { name: ingName }), {
      description: `${fmt(v)} ${t("common.egp")}/${t("common.kg")}`,
    });
  };

  const handleReset = () => {
    resetPrices();
    toast.success(t("prices.reset_done"));
  };

  /* ----------------------- Profile management ----------------------- */

  const handleAdd = () => {
    const promptLabel = lang === "ar" ? "اسم ملف الأسعار الجديد" : "New price profile name";
    const entered = window.prompt(promptLabel);
    if (entered === null) return; // cancelled
    const trimmed = entered.trim();
    if (!trimmed) {
      toast.error(lang === "ar" ? "الاسم فارغ" : "Name is empty");
      return;
    }
    // Use the same string for both locales; the user can rename later.
    const ok = addProfile(trimmed, trimmed);
    if (!ok) {
      toast.error(
        lang === "ar"
          ? `الحد الأقصى ${MAX_PRICE_PROFILES} ملفات`
          : `Max ${MAX_PRICE_PROFILES} profiles`
      );
    } else {
      toast.success(lang === "ar" ? "تمت إضافة ملف الأسعار" : "Price profile added");
    }
  };

  const handleRename = (p: PriceProfile) => {
    const promptLabel = lang === "ar" ? `إعادة تسمية "${p.name}"` : `Rename "${p.nameEn}"`;
    const current = lang === "ar" ? p.name : p.nameEn;
    const entered = window.prompt(promptLabel, current);
    if (entered === null) return;
    const trimmed = entered.trim();
    if (!trimmed) {
      toast.error(lang === "ar" ? "الاسم فارغ" : "Name is empty");
      return;
    }
    renameProfile(p.id, trimmed, trimmed);
    toast.success(lang === "ar" ? "تمت إعادة التسمية" : "Renamed");
  };

  const handleDelete = (p: PriceProfile) => {
    const label = lang === "ar" ? p.name : p.nameEn;
    const msg = lang === "ar"
      ? `حذف ملف الأسعار "${label}"؟ لا يمكن التراجع.`
      : `Delete price profile "${label}"? This cannot be undone.`;
    if (!window.confirm(msg)) return;
    const ok = deleteProfile(p.id);
    if (!ok) {
      toast.error(
        lang === "ar" ? "لا يمكن حذف الملف الأخير" : "Cannot delete the last profile"
      );
    } else {
      toast.success(lang === "ar" ? "تم الحذف" : "Deleted");
    }
  };

  const profileLabel = (p: PriceProfile) => (lang === "ar" ? p.name : p.nameEn);

  return (
    <div className="space-y-4">
      <Card className="border-border/60 bg-gradient-to-l from-primary/8 to-transparent">
        <CardContent className="space-y-3 p-4">
          <div className="flex items-center justify-between gap-3">
            <div className="flex items-center gap-2.5">
              <span className="flex h-10 w-10 items-center justify-center rounded-xl bg-primary/10 text-primary">
                <Coins className="h-5 w-5" />
              </span>
              <div>
                <p className="text-sm font-extrabold text-foreground">{t("prices.title")}</p>
                <p className="text-[11px] text-muted-foreground">
                  {count > 0
                    ? t("prices.subtitle_count", { n: count })
                    : t("prices.subtitle_none")}
                </p>
              </div>
            </div>
            <Button onClick={handleReset} variant="outline" size="sm" className="gap-1.5">
              <RotateCcw className="h-3.5 w-3.5" /> {t("common.reset")}
            </Button>
          </div>

          {/* Profile selector — tabs / chips */}
          <div className="flex flex-wrap items-center gap-1.5">
            {profiles.map((p) => {
              const isActive = p.id === activeProfileId;
              const label = profileLabel(p);
              return (
                <div
                  key={p.id}
                  className={cn(
                    "group flex items-stretch overflow-hidden rounded-lg border text-xs font-bold",
                    isActive
                      ? "border-primary bg-primary/10 text-primary"
                      : "border-border bg-card text-foreground hover:border-primary/40"
                  )}
                >
                  <button
                    type="button"
                    onClick={() => switchProfile(p.id)}
                    className="max-w-[140px] truncate px-3 py-1.5"
                    title={label}
                  >
                    {label}
                  </button>
                  <button
                    type="button"
                    onClick={() => handleRename(p)}
                    className="px-1.5 text-muted-foreground/70 hover:bg-primary/10 hover:text-primary"
                    aria-label={lang === "ar" ? "إعادة تسمية الملف" : "Rename profile"}
                    title={lang === "ar" ? "إعادة تسمية" : "Rename"}
                  >
                    <Pencil className="h-3 w-3" />
                  </button>
                  {profiles.length > 1 && (
                    <button
                      type="button"
                      onClick={() => handleDelete(p)}
                      className="px-1.5 text-muted-foreground/70 hover:bg-destructive/10 hover:text-destructive"
                      aria-label={lang === "ar" ? "حذف الملف" : "Delete profile"}
                      title={lang === "ar" ? "حذف" : "Delete"}
                    >
                      <Trash2 className="h-3 w-3" />
                    </button>
                  )}
                </div>
              );
            })}
            {profiles.length < MAX_PRICE_PROFILES && (
              <button
                type="button"
                onClick={handleAdd}
                className="flex items-center gap-1 rounded-lg border border-dashed border-border px-2.5 py-1.5 text-xs font-bold text-muted-foreground hover:border-primary hover:text-primary"
                aria-label={lang === "ar" ? "إضافة ملف أسعار" : "Add price profile"}
                title={lang === "ar" ? "إضافة ملف" : "Add profile"}
              >
                <Plus className="h-3.5 w-3.5" />
                {lang === "ar" ? "إضافة" : "Add"}
              </button>
            )}
          </div>
        </CardContent>
      </Card>

      <div className="space-y-3">
        {INGREDIENT_ORDER.map((key) => {
          const ing = INGREDIENTS[key];
          const Icon = ing.icon;
          const changed = Number(draft[key]) !== prices[key];
          const ingName = lang === "ar" ? ing.name : ing.nameEn;
          return (
            <Card key={key} className="border-border/60">
              <CardContent className="p-3.5">
                <div className="flex items-center gap-3">
                  <span
                    className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl text-white"
                    style={{ backgroundColor: ing.color }}
                  >
                    <Icon className="h-5 w-5" />
                  </span>
                  <div className="min-w-0 flex-1">
                    <p className="text-sm font-extrabold text-foreground">{ingName}</p>
                    <div className="mt-0.5 flex flex-wrap gap-1">
                      <Badge variant="secondary" className="text-[9px]">{catLabel(ing.category)}</Badge>
                      <Badge variant="outline" className="text-[9px]">{t("manual.protein")} {fmt(ing.protein, 1)}%</Badge>
                      <Badge variant="outline" className="text-[9px]">{t("data.energy")} {fmt(ing.tdn, 0)}%</Badge>
                    </div>
                  </div>
                  <div className="flex items-center gap-1.5">
                    <div className="relative">
                      <input
                        type="number"
                        inputMode="decimal"
                        min={0}
                        step={0.5}
                        value={draft[key]}
                        onChange={(e) =>
                          setDraft((prev) => ({ ...prev, [key]: e.target.value }))
                        }
                        onBlur={() => commit(key)}
                        onKeyDown={(e) => {
                          if (e.key === "Enter") (e.target as HTMLInputElement).blur();
                        }}
                        className="w-20 rounded-lg border border-border bg-card px-2 py-1.5 text-center text-sm font-bold tabular-nums focus:border-primary focus:outline-none focus:ring-2 focus:ring-primary/20"
                      />
                      <span className="pointer-events-none absolute -left-9 top-1/2 -translate-y-1/2 text-[10px] text-muted-foreground">
                        {t("common.egp")}
                      </span>
                    </div>
                    {changed ? (
                      <Button
                        size="sm"
                        variant="default"
                        className="h-8 w-8 p-0"
                        onClick={() => commit(key)}
                        aria-label={t("common.save")}
                      >
                        <Save className="h-3.5 w-3.5" />
                      </Button>
                    ) : (
                      <CheckCircle2 className="h-4 w-4 shrink-0 text-primary/60" />
                    )}
                  </div>
                </div>
                <p className="mt-2 text-[10px] text-muted-foreground">
                  {t("prices.default_hint", { n: fmt(ing.defaultPrice) })}
                </p>
              </CardContent>
            </Card>
          );
        })}
      </div>

      <div className="flex items-start gap-2 rounded-lg bg-primary/5 p-3 text-[11px] leading-relaxed text-muted-foreground">
        <Coins className="mt-0.5 h-3.5 w-3.5 shrink-0 text-primary" />
        <p>
          {t("prices.note")}
        </p>
      </div>

      {/* Ad at the bottom of prices screen */}
      <AdSection placement="in-feed" label="إعلان" />
      <div className="flex justify-center">
        <AdSlot placement="footer" />
      </div>
    </div>
  );
}
