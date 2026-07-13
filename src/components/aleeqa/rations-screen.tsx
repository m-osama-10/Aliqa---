"use client";

import { useMemo, useState } from "react";
import {
  Trash2,
  Share2,
  Calendar,
  Coins,
  Inbox,
  FileDown,
  GitCompare,
  X,
  TrendingUp,
  ChevronDown,
} from "lucide-react";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Separator } from "@/components/ui/separator";
import { Checkbox } from "@/components/ui/checkbox";
import {
  Collapsible,
  CollapsibleTrigger,
  CollapsibleContent,
} from "@/components/ui/collapsible";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { toast } from "sonner";
import {
  ANIMALS,
  ANIMAL_ORDER,
  INGREDIENTS,
  INGREDIENT_ORDER,
  type AnimalKey,
  type IngredientKey,
} from "@/lib/feed-data";
import { useRations, type SavedRation } from "@/lib/storage";
import { useLang, type Lang } from "@/lib/i18n";
import { RationResult, rationToText } from "./ration-result";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
} from "@/components/ui/dialog";
import {
  ResponsiveContainer,
  LineChart,
  Line,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip as RTooltip,
} from "recharts";
import { AdSection } from "@/components/ads";

type TFunc = (key: string, vars?: Record<string, string | number>) => string;
type FmtFunc = (n: number, d?: number) => string;

export function RationsScreen() {
  const { t, lang } = useLang();
  const { rations, deleteRation } = useRations();
  const [selected, setSelected] = useState<SavedRation | null>(null);
  const [confirmDel, setConfirmDel] = useState<string | null>(null);
  const [compareMode, setCompareMode] = useState(false);
  const [compareIds, setCompareIds] = useState<string[]>([]);

  const numLocale = lang === "ar" ? "ar-EG" : "en-GB";
  const fmt = (n: number, d = 2) =>
    n.toLocaleString(numLocale, { minimumFractionDigits: d, maximumFractionDigits: d });

  /* ----------------------------------------------------------------
   *  Cost-trend groups: rations of the same animalKey with ≥2 entries.
   * ---------------------------------------------------------------- */
  const trendGroups = useMemo(() => {
    const map = new Map<AnimalKey, SavedRation[]>();
    for (const r of rations) {
      const arr = map.get(r.animalKey) ?? [];
      arr.push(r);
      map.set(r.animalKey, arr);
    }
    const groups: { animalKey: AnimalKey; items: SavedRation[] }[] = [];
    for (const key of ANIMAL_ORDER) {
      const arr = map.get(key);
      if (arr && arr.length >= 2) {
        const sorted = [...arr].sort(
          (a, b) => new Date(a.createdAt).getTime() - new Date(b.createdAt).getTime()
        );
        groups.push({ animalKey: key, items: sorted });
      }
    }
    return groups;
  }, [rations]);

  /* ----------------------------------------------------------------
   *  Compare selection (max 2).
   * ---------------------------------------------------------------- */
  const compareSelected = useMemo(
    () =>
      compareIds
        .map((id) => rations.find((r) => r.id === id))
        .filter((r): r is SavedRation => !!r),
    [compareIds, rations]
  );

  const toggleCompareSelect = (id: string) => {
    setCompareIds((prev) => {
      if (prev.includes(id)) return prev.filter((x) => x !== id);
      if (prev.length >= 2) return prev;
      return [...prev, id];
    });
  };

  const exitCompare = () => {
    setCompareMode(false);
    setCompareIds([]);
  };

  const handleShare = (r: SavedRation) => {
    const animal = ANIMALS[r.animalKey];
    const flockUnit = lang === "ar" ? animal?.flockUnit ?? "رأس" : animal?.flockUnitEn ?? "head";
    const text = rationToText(r.result, r.animalName, r.weight, r.mode, flockUnit, lang);
    const nav = navigator as Navigator & {
      share?: (d: { text: string; title?: string }) => Promise<void>;
    };
    if (nav.share) {
      nav.share({ title: t("common.app_name"), text }).catch(() => {});
    } else {
      navigator.clipboard
        ?.writeText(text)
        .then(() => toast.success(t("rations.copied_toast")))
        .catch(() => toast.error(t("rations.copy_fail")));
    }
  };

  const handleDelete = (id: string) => {
    deleteRation(id);
    toast.success(t("rations.deleted_toast"));
    setConfirmDel(null);
  };

  return (
    <div className="space-y-4">
      <Card className="border-border/60 bg-gradient-to-l from-accent/10 to-transparent">
        <CardContent className="flex items-center justify-between p-4">
          <div>
            <p className="text-sm font-extrabold text-foreground">{t("rations.title")}</p>
            <p className="text-[11px] text-muted-foreground">
              {rations.length > 0
                ? t("rations.subtitle_n", { n: rations.length })
                : t("rations.subtitle_0")}
            </p>
          </div>
          <div className="flex items-center gap-2">
            {rations.length >= 2 && (
              <Button
                size="sm"
                variant={compareMode ? "secondary" : "outline"}
                className="h-8 gap-1 text-xs"
                onClick={() => (compareMode ? exitCompare() : setCompareMode(true))}
              >
                {compareMode ? (
                  <>
                    <X className="h-3.5 w-3.5" /> {t("rations.compare_exit")}
                  </>
                ) : (
                  <>
                    <GitCompare className="h-3.5 w-3.5" /> {t("rations.compare_btn")}
                  </>
                )}
              </Button>
            )}
            <span className="text-3xl">📚</span>
          </div>
        </CardContent>
      </Card>

      {/* Compare mode banner */}
      {compareMode && (
        <Card className="border-primary/40 bg-primary/5">
          <CardContent className="flex items-center justify-between gap-2 p-3">
            <p className="text-xs font-bold text-foreground">
              {compareIds.length === 2
                ? t("rations.compare_title")
                : t("rations.compare_select")}
            </p>
            <Badge variant="secondary" className="text-[10px]">
              {t("rations.compare_selected", { n: compareIds.length })}
            </Badge>
          </CardContent>
        </Card>
      )}

      {/* Compare panel */}
      {compareMode && compareSelected.length === 2 && (
        <ComparePanel
          pair={[compareSelected[0], compareSelected[1]]}
          t={t}
          lang={lang}
          fmt={fmt}
          onClear={exitCompare}
        />
      )}

      {/* Cost trend (hidden during compare mode to reduce clutter) */}
      {!compareMode && rations.length >= 2 && (
        <CostTrendSection groups={trendGroups} t={t} lang={lang} fmt={fmt} />
      )}

      {rations.length === 0 ? (
        <Card className="border-dashed border-border/70">
          <CardContent className="flex flex-col items-center justify-center gap-3 p-10 text-center">
            <span className="flex h-14 w-14 items-center justify-center rounded-2xl bg-secondary text-muted-foreground">
              <Inbox className="h-7 w-7" />
            </span>
            <div>
              <p className="text-sm font-bold text-foreground">{t("rations.empty_title")}</p>
              <p className="mt-1 text-xs text-muted-foreground">
                {t("rations.empty_desc")}
              </p>
            </div>
          </CardContent>
        </Card>
      ) : (
        <div className="space-y-2.5">
          {rations.map((r) => {
            const animal = ANIMALS[r.animalKey];
            const weightUnit = lang === "ar" ? animal?.weightUnit : animal?.weightUnitEn;
            const flockUnit = lang === "ar" ? animal?.flockUnit ?? "رأس" : animal?.flockUnitEn ?? "head";
            const isCompareChecked = compareIds.includes(r.id);
            const isCompareDisabled =
              compareMode && compareIds.length >= 2 && !isCompareChecked;
            return (
              <Card key={r.id} className="border-border/60 transition-shadow hover:shadow-md">
                <CardContent className="p-3.5">
                  <div className="flex items-center gap-3">
                    {compareMode && (
                      <Checkbox
                        checked={isCompareChecked}
                        disabled={isCompareDisabled}
                        onCheckedChange={() => toggleCompareSelect(r.id)}
                        aria-label={r.name}
                        className="shrink-0"
                      />
                    )}
                    <span className="text-2xl">{animal?.emoji ?? "📄"}</span>
                    <div className="min-w-0 flex-1">
                      <p className="truncate text-sm font-extrabold text-foreground">{r.name}</p>
                      <div className="mt-0.5 flex flex-wrap items-center gap-1.5 text-[10px] text-muted-foreground">
                        <span className="flex items-center gap-0.5">
                          <Calendar className="h-3 w-3" />
                          {new Date(r.createdAt).toLocaleDateString(numLocale, {
                            day: "numeric",
                            month: "short",
                            hour: "2-digit",
                            minute: "2-digit",
                          })}
                        </span>
                        <span>·</span>
                        <span>{r.weight} {weightUnit}</span>
                        {r.flockSize > 1 && (
                          <>
                            <span>·</span>
                            <span>{r.flockSize.toLocaleString(numLocale)} {flockUnit}</span>
                          </>
                        )}
                        <span>·</span>
                        <Badge
                          variant="secondary"
                          className="px-1.5 py-0 text-[9px]"
                        >
                          {r.mode === "economy" ? t("rations.mode_economy") : t("rations.mode_balanced")}
                        </Badge>
                      </div>
                    </div>
                    <div className="text-left">
                      <p className="flex items-center gap-1 text-sm font-black tabular-nums text-foreground">
                        <Coins className="h-3.5 w-3.5 text-accent-foreground" />
                        {fmt(r.result.totalCost)}
                      </p>
                      <p className="text-[9px] text-muted-foreground">{t("common.egp")}/{t("common.day")}</p>
                    </div>
                  </div>
                  <Separator className="my-2.5" />
                  <div className="flex flex-wrap gap-1.5">
                    <Button size="sm" variant="default" className="h-7 gap-1 text-[11px]" onClick={() => setSelected(r)}>
                      <FileDown className="h-3 w-3" /> {t("rations.view")}
                    </Button>
                    <Button size="sm" variant="outline" className="h-7 gap-1 text-[11px]" onClick={() => handleShare(r)}>
                      <Share2 className="h-3 w-3" /> {t("common.share")}
                    </Button>
                    <Button
                      size="sm"
                      variant="ghost"
                      className="h-7 gap-1 text-[11px] text-destructive hover:bg-destructive/10 hover:text-destructive"
                      onClick={() => setConfirmDel(r.id)}
                    >
                      <Trash2 className="h-3 w-3" /> {t("rations.delete")}
                    </Button>
                  </div>
                </CardContent>
              </Card>
            );
          })}
        </div>
      )}

      {/* Detail dialog */}
      <Dialog open={!!selected} onOpenChange={(o) => !o && setSelected(null)}>
        <DialogContent className="max-h-[90vh] max-w-2xl overflow-y-auto scroll-aleeqa">
          <DialogHeader>
            <DialogTitle className="flex items-center gap-2">
              <span className="text-xl">{selected && ANIMALS[selected.animalKey]?.emoji}</span>
              {selected?.name}
            </DialogTitle>
            <DialogDescription>
              {lang === "ar"
                ? "تفاصيل العليقة المحفوظة — يمكنك مشاركتها أو طباعتها."
                : "Saved ration details — you can share or print it."}
            </DialogDescription>
          </DialogHeader>
          {selected && (() => {
            const animal = ANIMALS[selected.animalKey];
            const flockUnit = lang === "ar" ? animal?.flockUnit ?? "رأس" : animal?.flockUnitEn ?? "head";
            const flockEmoji = animal?.emoji ?? "📄";
            return (
              <RationResult
                result={selected.result}
                animalName={selected.animalName}
                mode={selected.mode}
                compact
                flockUnit={flockUnit}
                flockEmoji={flockEmoji}
              />
            );
          })()}
        </DialogContent>
      </Dialog>

      {/* Delete confirm */}
      <Dialog open={!!confirmDel} onOpenChange={(o) => !o && setConfirmDel(null)}>
        <DialogContent className="max-w-sm">
          <DialogHeader>
            <DialogTitle>{t("rations.delete_title")}</DialogTitle>
            <DialogDescription>
              {t("rations.delete_desc")}
            </DialogDescription>
          </DialogHeader>
          <div className="flex justify-end gap-2 pt-2">
            <Button variant="outline" size="sm" onClick={() => setConfirmDel(null)}>
              {t("common.cancel")}
            </Button>
            <Button
              variant="destructive"
              size="sm"
              onClick={() => confirmDel && handleDelete(confirmDel)}
            >
              {t("rations.delete")}
            </Button>
          </div>
        </DialogContent>
      </Dialog>

      {/* Ad at the bottom of rations screen */}
      <AdSection placement="in-feed" label="إعلان" />
    </div>
  );
}

/* ================================================================== */
/*  COMPARE PANEL                                                      */
/* ================================================================== */

interface ComparePanelProps {
  pair: [SavedRation, SavedRation];
  t: TFunc;
  lang: Lang;
  fmt: FmtFunc;
  onClear: () => void;
}

function ComparePanel({ pair, t, lang, fmt, onClear }: ComparePanelProps) {
  const [a, b] = pair;
  const animalA = ANIMALS[a.animalKey];
  const animalB = ANIMALS[b.animalKey];
  const cheaperIsA = a.result.totalCost <= b.result.totalCost;

  const numLocale = lang === "ar" ? "ar-EG" : "en-GB";

  const compMapA = useMemo(() => buildComponentMap(a), [a]);
  const compMapB = useMemo(() => buildComponentMap(b), [b]);

  const rows: {
    label: string;
    a: string;
    b: string;
    aCheaper?: boolean;
    bCheaper?: boolean;
  }[] = [
    {
      label: t("share.animal"),
      a: lang === "ar" ? animalA?.name ?? a.animalName : animalA?.nameEn ?? a.animalName,
      b: lang === "ar" ? animalB?.name ?? b.animalName : animalB?.nameEn ?? b.animalName,
    },
    {
      label: t("share.weight"),
      a: `${fmt(a.weight)} ${lang === "ar" ? animalA?.weightUnit : animalA?.weightUnitEn}`,
      b: `${fmt(b.weight)} ${lang === "ar" ? animalB?.weightUnit : animalB?.weightUnitEn}`,
    },
    {
      label:
        animalA?.species === "poultry" && animalB?.species === "poultry"
          ? t("share.birds")
          : t("share.heads"),
      a: a.flockSize.toLocaleString(numLocale),
      b: b.flockSize.toLocaleString(numLocale),
    },
    {
      label: t("share.type"),
      a: a.mode === "economy" ? t("rations.mode_economy") : t("rations.mode_balanced"),
      b: b.mode === "economy" ? t("rations.mode_economy") : t("rations.mode_balanced"),
    },
    {
      label: t("share.daily_cost"),
      a: `${fmt(a.result.totalCost)} ${t("common.egp")}`,
      b: `${fmt(b.result.totalCost)} ${t("common.egp")}`,
      aCheaper: cheaperIsA,
      bCheaper: !cheaperIsA,
    },
    {
      label: t("share.monthly_cost"),
      a: `${fmt(a.result.costPerMonth)} ${t("common.egp")}`,
      b: `${fmt(b.result.costPerMonth)} ${t("common.egp")}`,
    },
    {
      label:
        a.flockSize > 1 || b.flockSize > 1 ? t("share.per_head") : t("result.cost_per_kg"),
      a:
        a.flockSize > 1
          ? `${fmt(a.result.costPerAnimal)} ${t("common.egp")}`
          : `${fmt(a.result.costPerKg)} ${t("common.egp")}`,
      b:
        b.flockSize > 1
          ? `${fmt(b.result.costPerAnimal)} ${t("common.egp")}`
          : `${fmt(b.result.costPerKg)} ${t("common.egp")}`,
    },
    {
      label: t("share.protein"),
      a: `${fmt(a.result.achieved.cp, 1)}%`,
      b: `${fmt(b.result.achieved.cp, 1)}%`,
    },
    {
      label: t("share.energy"),
      a: `${fmt(a.result.achieved.tdn, 1)}%`,
      b: `${fmt(b.result.achieved.tdn, 1)}%`,
    },
    {
      label: t("share.fiber"),
      a: `${fmt(a.result.achieved.fiber, 1)}%`,
      b: `${fmt(b.result.achieved.fiber, 1)}%`,
    },
  ];

  // Component percentage rows — use all keys present in either ration
  const allKeys = Array.from(new Set([...Object.keys(compMapA), ...Object.keys(compMapB)]));
  const componentRows = allKeys.map((key) => {
    // Find ingredient name from the ration components
    const compA = a.components.find((c) => c.ingredient.key === key);
    const compB = b.components.find((c) => c.ingredient.key === key);
    const label = compA
      ? (lang === "ar" ? compA.ingredient.name : compA.ingredient.nameEn)
      : compB
      ? (lang === "ar" ? compB.ingredient.name : compB.ingredient.nameEn)
      : key;
    return {
      label,
      a: `${fmt(compMapA[key] ?? 0, 1)}%`,
      b: `${fmt(compMapB[key] ?? 0, 1)}%`,
    };
  });

  return (
    <Card className="border-primary/40">
      <CardContent className="p-3">
        <div className="mb-2 flex items-center justify-between gap-2">
          <p className="flex items-center gap-1.5 text-sm font-extrabold text-foreground">
            <GitCompare className="h-4 w-4 text-primary" />
            {t("rations.compare_title")}
          </p>
          <Button size="sm" variant="ghost" className="h-7 gap-1 text-[11px]" onClick={onClear}>
            <X className="h-3 w-3" /> {t("rations.compare_exit")}
          </Button>
        </div>
        <div className="overflow-x-auto">
          <Table className="text-xs">
            <TableHeader>
              <TableRow>
                <TableHead className="h-8 w-1/3 text-[10px] text-muted-foreground"></TableHead>
                <TableHead className="h-8 text-[10px] font-bold text-foreground">
                  <div className="flex items-center gap-1.5">
                    <span className="text-base">{animalA?.emoji}</span>
                    <span className="truncate">{a.name}</span>
                    {cheaperIsA && (
                      <Badge className="bg-primary/15 px-1.5 py-0 text-[9px] text-primary hover:bg-primary/15">
                        {t("rations.compare_cheaper")}
                      </Badge>
                    )}
                  </div>
                </TableHead>
                <TableHead className="h-8 text-[10px] font-bold text-foreground">
                  <div className="flex items-center gap-1.5">
                    <span className="text-base">{animalB?.emoji}</span>
                    <span className="truncate">{b.name}</span>
                    {!cheaperIsA && (
                      <Badge className="bg-primary/15 px-1.5 py-0 text-[9px] text-primary hover:bg-primary/15">
                        {t("rations.compare_cheaper")}
                      </Badge>
                    )}
                  </div>
                </TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {rows.map((row) => (
                <TableRow key={row.label}>
                  <TableCell className="py-1.5 text-[10px] font-medium text-muted-foreground">
                    {row.label}
                  </TableCell>
                  <TableCell
                    className={`py-1.5 text-[11px] font-bold tabular-nums ${
                      row.aCheaper ? "text-primary" : "text-foreground"
                    }`}
                  >
                    {row.a}
                  </TableCell>
                  <TableCell
                    className={`py-1.5 text-[11px] font-bold tabular-nums ${
                      row.bCheaper ? "text-primary" : "text-foreground"
                    }`}
                  >
                    {row.b}
                  </TableCell>
                </TableRow>
              ))}
              <TableRow>
                <TableCell colSpan={3} className="p-0">
                  <Separator className="my-1" />
                </TableCell>
              </TableRow>
              {componentRows.map((row) => (
                <TableRow key={row.label}>
                  <TableCell className="py-1.5 text-[10px] font-medium text-muted-foreground">
                    {row.label}
                  </TableCell>
                  <TableCell className="py-1.5 text-[11px] font-bold tabular-nums text-foreground">
                    {row.a}
                  </TableCell>
                  <TableCell className="py-1.5 text-[11px] font-bold tabular-nums text-foreground">
                    {row.b}
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </div>
      </CardContent>
    </Card>
  );
}

function buildComponentMap(r: SavedRation): Record<string, number> {
  const map: Record<string, number> = {};
  for (const c of r.result.components) {
    map[c.ingredient.key] = c.percent;
  }
  return map;
}

/* ================================================================== */
/*  COST TREND SECTION                                                 */
/* ================================================================== */

interface CostTrendSectionProps {
  groups: { animalKey: AnimalKey; items: SavedRation[] }[];
  t: TFunc;
  lang: Lang;
  fmt: FmtFunc;
}

function CostTrendSection({ groups, t, lang, fmt }: CostTrendSectionProps) {
  const numLocale = lang === "ar" ? "ar-EG" : "en-GB";
  const hasCharts = groups.length > 0;

  return (
    <Collapsible defaultOpen className="border-border/60">
      <Card className="border-border/60">
        <CollapsibleTrigger asChild>
          <button
            type="button"
            className="flex w-full items-center justify-between gap-2 p-3 text-start"
          >
            <span className="flex items-center gap-1.5 text-sm font-extrabold text-foreground">
              <TrendingUp className="h-4 w-4 text-primary" />
              {t("rations.trend_title")}
            </span>
            <ChevronDown className="h-4 w-4 text-muted-foreground transition-transform group-data-[state=open]:rotate-180" />
          </button>
        </CollapsibleTrigger>
        <CollapsibleContent>
          <Separator />
          <CardContent className="p-3">
            {hasCharts ? (
              <div className="space-y-3">
                {groups.map((g) => {
                  const animal = ANIMALS[g.animalKey];
                  const animalName =
                    lang === "ar" ? animal?.name ?? g.animalKey : animal?.nameEn ?? g.animalKey;
                  const data = g.items.map((r) => ({
                    name: r.name,
                    date: new Date(r.createdAt).toLocaleDateString(numLocale, {
                      day: "numeric",
                      month: "short",
                    }),
                    fullDate: new Date(r.createdAt).toLocaleString(numLocale, {
                      dateStyle: "medium",
                      timeStyle: "short",
                    }),
                    cost: r.result.totalCost,
                  }));
                  return (
                    <div
                      key={g.animalKey}
                      className="rounded-xl border border-border/60 bg-secondary/20 p-2.5"
                    >
                      <p className="mb-1.5 flex items-center gap-1.5 text-[11px] font-bold text-foreground">
                        <span className="text-sm">{animal?.emoji}</span>
                        {animalName}
                        <span className="ms-auto text-[10px] font-normal text-muted-foreground">
                          {g.items.length}
                        </span>
                      </p>
                      {/* recharts renders LTR; wrap to keep axes consistent in RTL pages */}
                      <div dir="ltr" className="h-[160px] w-full">
                        <ResponsiveContainer width="100%" height="100%">
                          <LineChart
                            data={data}
                            margin={{ top: 5, right: 8, bottom: 0, left: -10 }}
                          >
                            <CartesianGrid
                              strokeDasharray="3 3"
                              stroke="var(--border)"
                              strokeOpacity={0.5}
                            />
                            <XAxis
                              dataKey="date"
                              tick={{ fontSize: 10, fill: "var(--muted-foreground)" }}
                              tickLine={false}
                              axisLine={{ stroke: "var(--border)" }}
                              dy={4}
                            />
                            <YAxis
                              tick={{ fontSize: 10, fill: "var(--muted-foreground)" }}
                              tickLine={false}
                              axisLine={false}
                              width={48}
                              tickFormatter={(v: number) => fmt(v, 0)}
                            />
                            <RTooltip
                              contentStyle={{
                                fontSize: 11,
                                borderRadius: 8,
                                border: "1px solid var(--border)",
                                background: "var(--popover)",
                                color: "var(--popover-foreground)",
                              }}
                              labelStyle={{ color: "var(--muted-foreground)" }}
                              formatter={(value: number) => [
                                `${fmt(value)} ${t("common.egp")}`,
                                t("rations.trend_cost"),
                              ]}
                              labelFormatter={(label: string, payload) => {
                                const point = payload?.[0]?.payload as
                                  | { fullDate?: string; name?: string }
                                  | undefined;
                                return point?.fullDate ?? label;
                              }}
                            />
                            <Line
                              type="monotone"
                              dataKey="cost"
                              stroke="var(--chart-1)"
                              strokeWidth={2}
                              dot={{ r: 3, fill: "var(--chart-1)", strokeWidth: 0 }}
                              activeDot={{ r: 5 }}
                              isAnimationActive={false}
                            />
                          </LineChart>
                        </ResponsiveContainer>
                      </div>
                    </div>
                  );
                })}
              </div>
            ) : (
              <p className="py-2 text-center text-[11px] text-muted-foreground">
                {t("rations.trend_empty")}
              </p>
            )}
          </CardContent>
        </CollapsibleContent>
      </Card>
    </Collapsible>
  );
}
