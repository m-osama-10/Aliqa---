"use client";

import {
  Coins,
  TrendingDown,
  Check,
  AlertTriangle,
  Share2,
  Printer,
  Save,
} from "lucide-react";
import { cn } from "@/lib/utils";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Separator } from "@/components/ui/separator";
import {
  PieChart,
  Pie,
  Cell,
  ResponsiveContainer,
} from "recharts";
import type { FormulationResult } from "@/lib/feed-data";
import { ANIMALS, normalizeFormulationResult } from "@/lib/feed-data";
import { useLang, type Lang } from "@/lib/i18n";

interface RationResultProps {
  result: FormulationResult;
  animalName: string;
  mode: "balanced" | "economy";
  savings?: { amount: number; pct: number } | null;
  onSave?: () => void;
  onShare?: () => void;
  onPrint?: () => void;
  compact?: boolean;
  /** Unit label for the flock/herd count, e.g. "رأس" or "طائر". */
  flockUnit?: string;
  /** Emoji for the flock banner. */
  flockEmoji?: string;
}

export function RationResult({
  result,
  animalName,
  mode,
  savings,
  onSave,
  onShare,
  onPrint,
  compact,
  flockUnit = "رأس",
  flockEmoji = "🐄",
}: RationResultProps) {
  const { t, lang } = useLang();
  const isBird = flockUnit === "طائر" || flockUnit === "bird";
  const fmt = (n: number | undefined | null, d = 2) =>
    (n ?? 0).toLocaleString(lang === "ar" ? "ar-EG" : "en-GB", {
      minimumFractionDigits: d,
      maximumFractionDigits: d,
    });
  const numLocale = lang === "ar" ? "ar-EG" : "en-GB";

  // Defense-in-depth: normalize via the shared helper so this component is
  // protected even if a caller bypasses migrateRation (e.g. displayResult
  // from the formulators is already normalized, but a saved-ration path or a
  // future code change might not be). This mirrors the guard in ManualEditor.
  const safeResult = normalizeFormulationResult(result);

  if (!safeResult.feasible) {
    return (
      <Card className="border-destructive/30">
        <CardContent className="flex items-start gap-3 p-4">
          <AlertTriangle className="mt-0.5 h-5 w-5 shrink-0 text-destructive" />
          <div>
            <p className="text-sm font-bold text-foreground">{t("safeResult.infeasible")}</p>
            <p className="mt-1 text-xs text-muted-foreground">{safeResult.warnings[0]}</p>
          </div>
        </CardContent>
      </Card>
    );
  }

  const chartData = safeResult.components.map((c) => ({
    name: lang === "ar" ? (c.ingredient as any).short || c.ingredient.name : (c.ingredient as any).shortEn || c.ingredient.nameEn,
    value: c.percent,
    color: (c.ingredient as any).color || "#888",
  }));

  return (
    <div className="space-y-4">
      {/* Summary stats */}
      <div className="grid grid-cols-2 gap-2 sm:grid-cols-4">
        <Stat label={t("safeResult.dmi_day")} value={`${fmt(safeResult.dmi)}`} unit={t("common.kg")} />
        <Stat
          label={t("safeResult.protein")}
          value={`${fmt(safeResult.achieved.cp, 1)}%`}
          unit={t("safeResult.target_ge", { n: fmt(safeResult.targets.cpMin, 0) })}
          ok={safeResult.achieved.cp >= safeResult.targets.cpMin - 0.3}
        />
        <Stat
          label={t("safeResult.energy")}
          value={`${fmt(safeResult.achieved.tdn, 1)}%`}
          unit={t("safeResult.target_ge", { n: fmt(safeResult.targets.tdnMin, 0) })}
          ok={safeResult.achieved.tdn >= safeResult.targets.tdnMin - 0.5}
        />
        <Stat
          label={t("safeResult.fiber")}
          value={`${fmt(safeResult.achieved.fiber, 1)}%`}
          unit={t("safeResult.max_le", { n: fmt(safeResult.targets.fiberMax, 0) })}
          ok={safeResult.achieved.fiber <= safeResult.targets.fiberMax + 0.5}
        />
      </div>

      {/* Cost + savings */}
      {safeResult.flockSize > 1 && (
        <div className="flex items-center justify-between rounded-xl bg-primary/8 px-4 py-2">
          <span className="flex items-center gap-1.5 text-xs font-bold text-primary">
            <span className="text-base">{flockEmoji}</span>
            {isBird ? t("safeResult.birds_in_flock") : t("safeResult.heads_in_flock")}
          </span>
          <span className="text-lg font-black tabular-nums text-foreground">
            {(safeResult.flockSize ?? 0).toLocaleString(numLocale)}{" "}
            <span className="text-xs text-muted-foreground">{flockUnit}</span>
          </span>
        </div>
      )}
      <div className="grid gap-2 sm:grid-cols-3">
        <div className="rounded-xl bg-gradient-to-l from-primary/10 to-transparent p-3 sm:col-span-1">
          <p className="text-[11px] text-muted-foreground">
            {t("safeResult.cost_daily")}
            {safeResult.flockSize > 1 ? ` ${t("safeResult.cost_flock")}` : ""}
          </p>
          <p className="text-2xl font-black tabular-nums text-foreground">
            {fmt(safeResult.totalCost)}{" "}
            <span className="text-xs font-medium text-muted-foreground">{t("common.egp")}</span>
          </p>
          <p className="text-[10px] text-muted-foreground">
            {fmt(safeResult.costPerMonth)} {t("common.egp")}/{t("common.month")}
          </p>
        </div>
        <div className="rounded-xl border border-border/60 bg-card p-3">
          {safeResult.flockSize > 1 ? (
            <>
              <p className="text-[11px] text-muted-foreground">
                {isBird ? t("safeResult.cost_per_bird") : t("safeResult.cost_per_head")}
              </p>
              <p className="text-xl font-black tabular-nums text-foreground">
                {fmt(safeResult.costPerAnimal)}{" "}
                <span className="text-xs text-muted-foreground">{t("common.egp")}</span>
              </p>
              <p className="text-[10px] text-muted-foreground">
                {fmt(safeResult.costPerKg)} {t("common.egp")}/{t("common.kg")}
              </p>
            </>
          ) : (
            <>
              <p className="text-[11px] text-muted-foreground">{t("safeResult.cost_per_kg")}</p>
              <p className="text-xl font-black tabular-nums text-foreground">
                {fmt(safeResult.costPerKg)}{" "}
                <span className="text-xs text-muted-foreground">{t("common.egp")}</span>
              </p>
              <p className="text-[10px] text-muted-foreground">
                {fmt(safeResult.costPerTon)} {t("common.egp")}/{lang === "ar" ? "طن" : "ton"}
              </p>
            </>
          )}
        </div>
        <div
          className={cn(
            "rounded-xl border p-3",
            savings && savings.amount > 0
              ? "border-accent/50 bg-accent/15"
              : "border-border/60 bg-card"
          )}
        >
          <p className="text-[11px] text-muted-foreground">{t("safeResult.savings")}</p>
          {savings && savings.amount > 0 ? (
            <>
              <p className="text-xl font-black tabular-nums text-accent-foreground">
                <TrendingDown className="me-1 inline h-4 w-4" />
                {fmt(savings.amount)} {t("common.egp")}
              </p>
              <p className="text-[10px] text-muted-foreground">
                {t("safeResult.savings_sub", { n: fmt(savings.pct, 0) })}
              </p>
            </>
          ) : (
            <p className="text-sm font-bold text-muted-foreground">—</p>
          )}
        </div>
      </div>

      {/* Warnings */}
      {safeResult.warnings.length > 0 && (
        <div className="space-y-1.5 rounded-lg border border-amber-400/40 bg-amber-50/70 p-3">
          {safeResult.warnings.map((w, i) => (
            <p key={i} className="flex items-start gap-1.5 text-[11px] text-amber-900">
              <AlertTriangle className="mt-0.5 h-3 w-3 shrink-0" />
              {w}
            </p>
          ))}
        </div>
      )}

      {/* Components + chart */}
      <div className="grid gap-4 lg:grid-cols-5">
        <div className="lg:col-span-3">
          <p className="mb-2 text-sm font-bold text-foreground/80">{t("safeResult.components_title")}</p>
          <div className={cn("space-y-2", !compact && "max-h-80 overflow-y-auto scroll-aleeqa pe-1")}>
            {safeResult.components.map((c) => {
              const ingName = lang === "ar" ? c.ingredient.name : c.ingredient.nameEn;
              const emoji = (c.ingredient as any).emoji || "🧪";
              const color = (c.ingredient as any).color || "#888";
              return (
                <div
                  key={c.ingredient.key}
                  className="rounded-lg border border-border/60 bg-card p-2.5"
                >
                  <div className="flex items-center justify-between gap-2">
                    <div className="flex items-center gap-2">
                      <span
                        className="flex h-7 w-7 items-center justify-center rounded-md bg-secondary text-base"
                      >
                        {emoji}
                      </span>
                      <div>
                        <p className="text-xs font-bold text-foreground">{ingName}</p>
                        <p className="text-[10px] text-muted-foreground">
                          {fmt(c.percent, 1)}% · {fmt(c.ingredient.protein, 1)}% {t("manual.protein")}
                        </p>
                      </div>
                    </div>
                    <div className="text-left">
                      <p className="text-xs font-extrabold tabular-nums text-foreground">
                        {fmt(c.kg, 2)} {t("common.kg")}
                      </p>
                      <p className="text-[10px] tabular-nums text-muted-foreground">
                        {fmt(c.cost, 2)} {t("common.egp")}
                      </p>
                    </div>
                  </div>
                  <div className="mt-2 flex items-center gap-2">
                    <div className="h-1.5 flex-1 overflow-hidden rounded-full bg-secondary">
                      <div
                        className="h-full rounded-full"
                        style={{ width: `${c.percent}%`, backgroundColor: color }}
                      />
                    </div>
                    <span className="w-10 text-left text-[10px] font-bold tabular-nums text-muted-foreground">
                      {fmt(c.percent, 0)}%
                    </span>
                  </div>
                </div>
              );
            })}
          </div>
        </div>

        <div className="lg:col-span-2">
          <p className="mb-2 text-sm font-bold text-foreground/80">{t("safeResult.chart_title")}</p>
          <div className="flex h-full min-h-[220px] flex-col items-center justify-center rounded-lg border border-border/60 bg-secondary/30 p-3">
            <ResponsiveContainer width="100%" height={170}>
              <PieChart>
                <Pie
                  data={chartData}
                  dataKey="value"
                  nameKey="name"
                  cx="50%"
                  cy="50%"
                  innerRadius={40}
                  outerRadius={68}
                  paddingAngle={2}
                  stroke="none"
                >
                  {chartData.map((entry, i) => (
                    <Cell key={i} fill={entry.color} />
                  ))}
                </Pie>
              </PieChart>
            </ResponsiveContainer>
            <div className="mt-2 grid w-full grid-cols-2 gap-1.5">
              {chartData.map((d) => (
                <div key={d.name} className="flex items-center gap-1.5 text-[10px]">
                  <span className="h-2.5 w-2.5 rounded-sm" style={{ backgroundColor: d.color }} />
                  <span className="font-medium text-foreground">{d.name}</span>
                  <span className="ms-auto tabular-nums text-muted-foreground">{fmt(d.value, 0)}%</span>
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>

      {/* Actions */}
      {(onSave || onShare || onPrint) && (
        <>
          <Separator />
          <div className="flex flex-wrap gap-2">
            {onSave && (
              <Button onClick={onSave} size="sm" className="gap-1.5">
                <Save className="h-3.5 w-3.5" /> {t("common.save")}
              </Button>
            )}
            {onShare && (
              <Button onClick={onShare} variant="outline" size="sm" className="gap-1.5">
                <Share2 className="h-3.5 w-3.5" /> {t("common.share")}
              </Button>
            )}
            {onPrint && (
              <Button onClick={onPrint} variant="outline" size="sm" className="gap-1.5">
                <Printer className="h-3.5 w-3.5" /> {t("common.print")}
              </Button>
            )}
            <Badge variant="secondary" className="ms-auto self-center text-[10px]">
              {animalName} ·{" "}
              {mode === "economy" ? t("rations.mode_economy") : t("rations.mode_balanced")}
            </Badge>
          </div>
        </>
      )}
    </div>
  );
}

function Stat({
  label,
  value,
  unit,
  ok,
}: {
  label: string;
  value: string;
  unit: string;
  ok?: boolean;
}) {
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
      <p className="text-[10px] text-muted-foreground">{label}</p>
      <p className="text-base font-extrabold tabular-nums text-foreground">{value}</p>
      <p className="text-[10px] text-muted-foreground">{unit}</p>
    </div>
  );
}

/* ================================================================== */
/*  TEXT SUMMARY (for share / print)                                   */
/* ================================================================== */

const SHARE_DICT: Record<Lang, Record<string, string>> = {
  ar: {
    "share.brand": "عليقة — حاسبة العليقة الذكية",
    "share.animal": "الحيوان",
    "share.weight": "الوزن",
    "share.heads": "عدد الرؤوس",
    "share.birds": "عدد الطيور",
    "share.type": "النوع",
    "share.composition": "تركيبة العليقة",
    "share.daily_cost": "التكلفة اليومية",
    "share.monthly_cost": "التكلفة الشهرية",
    "share.per_head": "تكلفة الرأس/يوم",
    "share.per_bird": "تكلفة الطائر/يوم",
    "share.dmi": "المادة الجافة",
    "share.protein": "البروتين الخام",
    "share.energy": "الطاقة (TDN)",
    "share.fiber": "الألياف",
    "share.disclaimer": "قيم تقريبية لأغراض إرشادية. راجع أخصائي التغذية للقطعان الإنتاجية الكبيرة.",
    "common.kg": "كجم",
    "common.egp": "ج.م",
    "common.day": "يوم",
    "report.mode_balanced": "عليقة متوازنة",
    "report.mode_economy": "عليقة اقتصادية",
  },
  en: {
    "share.brand": "Aleeqa — Smart Feed Calculator",
    "share.animal": "Animal",
    "share.weight": "Weight",
    "share.heads": "Heads",
    "share.birds": "Birds",
    "share.type": "Type",
    "share.composition": "Ration composition",
    "share.daily_cost": "Daily cost",
    "share.monthly_cost": "Monthly cost",
    "share.per_head": "Cost/head/day",
    "share.per_bird": "Cost/bird/day",
    "share.dmi": "Dry matter",
    "share.protein": "Crude protein",
    "share.energy": "Energy (TDN)",
    "share.fiber": "Fiber",
    "share.disclaimer": "Approximate values for advisory purposes. Consult a nutritionist for large production flocks.",
    "common.kg": "kg",
    "common.egp": "EGP",
    "common.day": "day",
    "report.mode_balanced": "Balanced ration",
    "report.mode_economy": "Economy ration",
  },
};

export function rationToText(
  result: FormulationResult,
  animalName: string,
  weight: number,
  mode: "balanced" | "economy",
  flockUnit: string = "رأس",
  lang: Lang = "ar"
): string {
  // Normalize at the boundary: guarantees achieved/targets/components/costs
  // are present. Previously this function referenced `safeResult` which was
  // only defined inside the RationResult component — a scoping bug that would
  // throw "ReferenceError: safeResult is not defined" whenever the user
  // shared a ration via WhatsApp/clipboard.
  const safeResult = normalizeFormulationResult(result);
  const isBird = flockUnit === "طائر" || flockUnit === "bird";
  const tr = (key: string) => SHARE_DICT[lang][key] ?? SHARE_DICT.ar[key] ?? key;
  const numLocale = lang === "ar" ? "ar-EG" : "en-GB";
  const fmt = (n: number | undefined | null, d = 2) =>
    (n ?? 0).toLocaleString(numLocale, { minimumFractionDigits: d, maximumFractionDigits: d });

  const lines: string[] = [];
  lines.push(`🌿 *${tr("share.brand")}*`);
  lines.push("");
  lines.push(`🐄 ${tr("share.animal")}: ${animalName}`);
  lines.push(`⚖️ ${tr("share.weight")}: ${fmt(weight)} ${tr("common.kg")}`);
  if (safeResult.flockSize > 1) {
    lines.push(
      `${isBird ? "🐔" : "🐂"} ${isBird ? tr("share.birds") : tr("share.heads")}: ${(safeResult.flockSize ?? 0).toLocaleString(
        numLocale
      )} ${flockUnit}`
    );
  }
  lines.push(
    `📊 ${tr("share.type")}: ${mode === "economy" ? tr("report.mode_economy") : tr("report.mode_balanced")}`
  );
  lines.push("");
  lines.push("━━━━━━━━━━━━━━━");
  lines.push(`📝 *${tr("share.composition")}:*`);
  safeResult.components.forEach((c) => {
    const ingName = lang === "ar" ? c.ingredient.name : c.ingredient.nameEn;
    lines.push(
      `• ${ingName}: ${fmt(c.kg)} ${tr("common.kg")} (${fmt(c.percent, 0)}%) — ${fmt(c.cost)} ${tr("common.egp")}`
    );
  });
  lines.push("━━━━━━━━━━━━━━━");
  lines.push("");
  lines.push(`💵 ${tr("share.daily_cost")}: ${fmt(safeResult.totalCost)} ${tr("common.egp")}`);
  lines.push(`📅 ${tr("share.monthly_cost")}: ${fmt(safeResult.costPerMonth)} ${tr("common.egp")}`);
  if (safeResult.flockSize > 1) {
    lines.push(
      `${isBird ? "🐣" : "🐂"} ${isBird ? tr("share.per_bird") : tr("share.per_head")}: ${fmt(
        safeResult.costPerAnimal
      )} ${tr("common.egp")}`
    );
  }
  lines.push(`📏 ${tr("share.dmi")}: ${fmt(safeResult.dmi)} ${tr("common.kg")}/${tr("common.day")}`);
  lines.push(`🥩 ${tr("share.protein")}: ${fmt(safeResult.achieved.cp, 1)}%`);
  lines.push(`⚡ ${tr("share.energy")}: ${fmt(safeResult.achieved.tdn, 1)}%`);
  lines.push(`🌾 ${tr("share.fiber")}: ${fmt(safeResult.achieved.fiber, 1)}%`);
  lines.push("");
  lines.push(`⚠️ ${tr("share.disclaimer")}`);
  return lines.join("\n");
}
