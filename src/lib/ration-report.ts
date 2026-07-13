import {
  ANIMALS,
  INGREDIENTS,
  type AnimalKey,
  type FormulationMode,
  type FormulationResult,
  type IngredientKey,
} from "./feed-data";
import type { PriceMap } from "./storage";
import type { Lang } from "./i18n";

/* ================================================================== */
/*  LOCAL BILINGUAL DICTIONARY                                         */
/*  Mirrors the report.* keys (and a few helpers) from src/lib/i18n.tsx */
/*  so ration-report.ts can run as a plain TS function (no React).     */
/* ================================================================== */

const REPORT_DICT: Record<Lang, Record<string, string>> = {
  ar: {
    "report.title": "تقرير تركيبة العليقة",
    "report.daily_cost": "التكلفة اليومية",
    "report.monthly_cost": "التكلفة الشهرية",
    "report.per_head": "تكلفة الرأس/يوم",
    "report.per_bird": "تكلفة الطائر/يوم",
    "report.heads_count": "عدد الرؤوس",
    "report.birds_count": "عدد الطيور",
    "report.components_section": "تفصيل مكوّنات العليقة",
    "report.col_num": "#",
    "report.col_component": "المكوّن",
    "report.col_percent": "النسبة",
    "report.col_qty": "الكمية/يوم",
    "report.col_protein": "بروتين",
    "report.col_energy": "طاقة",
    "report.col_cost": "التكلفة",
    "report.total": "الإجمالي",
    "report.savings_label": "التوفير اليومي مقارنة بالعليقة المتوازنة",
    "report.warnings": "ملاحظات",
    "report.footer.line1":
      "قيم تقريبية لأغراض إرشادية مبنية على متوسطات NRC ومعدّلة للسوق المصري. للقطعان الإنتاجية الكبيرة استشر أخصائي تغذية.",
    "report.footer.line2": "أداة حسابية بحتة — لا تبيع ولا تورد مستلزمات.",
    "report.mode_balanced": "عليقة متوازنة",
    "report.mode_economy": "عليقة اقتصادية",
    "report.print_btn": "🖨️ طباعة / حفظ PDF",
    "report.popup_blocked": "السماح بالنوافذ المنبثقة لطباعة التقرير، أو جرّب زر المشاركة.",
    "report.weight_label": "الوزن",
    "report.production_label": "الإنتاج",
    "report.dmi_label": "المادة الجافة",
    "report.cost_for_flock": "للقطيع",
    "report.cost_for_ration": "للعليقة",
    "report.per_kg_label": "الكيلوجرام",
    "report.kg_unit": "كجم",
    "report.egp_unit": "ج.م",
    "report.per_day": "يوم",
    "common.app_name": "عليقة",
    "common.app_sub": "حاسبة العليقة الذكية للمربي المصري",
    "report.copyright": "أداة حسابية بحتة — لا تبيع ولا تورد مستلزمات. © {year} عليقة",
    "report.brand_line": "عليقة · حاسبة العليقة الذكية — www.aleeqa.app",
    "report.target_ge": "الهدف ≥ {n}%",
    "report.max_le": "الأقصى {n}%",
    "report.protein_stat": "البروتين الخام",
    "report.energy_stat": "الطاقة (TDN)",
    "report.fiber_stat": "الألياف الخام",
  },
  en: {
    "report.title": "Ration formulation report",
    "report.daily_cost": "Daily cost",
    "report.monthly_cost": "Monthly cost",
    "report.per_head": "Cost/head/day",
    "report.per_bird": "Cost/bird/day",
    "report.heads_count": "Number of heads",
    "report.birds_count": "Number of birds",
    "report.components_section": "Ration component breakdown",
    "report.col_num": "#",
    "report.col_component": "Component",
    "report.col_percent": "Percent",
    "report.col_qty": "Qty/day",
    "report.col_protein": "Protein",
    "report.col_energy": "Energy",
    "report.col_cost": "Cost",
    "report.total": "Total",
    "report.savings_label": "Daily savings vs balanced ration",
    "report.warnings": "Notes",
    "report.footer.line1":
      "Approximate values for advisory purposes, based on NRC averages tuned for the Egyptian market. For large production flocks consult a nutritionist.",
    "report.footer.line2": "A pure calculation tool — sells nothing, supplies nothing.",
    "report.mode_balanced": "Balanced ration",
    "report.mode_economy": "Economy ration",
    "report.print_btn": "🖨️ Print / Save PDF",
    "report.popup_blocked": "Allow pop-ups to print the report, or try the share button.",
    "report.weight_label": "Weight",
    "report.production_label": "Production",
    "report.dmi_label": "Dry matter",
    "report.cost_for_flock": "for the herd",
    "report.cost_for_ration": "for the ration",
    "report.per_kg_label": "Per kg",
    "report.kg_unit": "kg",
    "report.egp_unit": "EGP",
    "report.per_day": "day",
    "common.app_name": "Aleeqa",
    "common.app_sub": "Smart Feed Calculator for Egyptian farmers",
    "report.copyright": "A pure calculation tool — sells nothing, supplies nothing. © {year} Aleeqa",
    "report.brand_line": "Aleeqa · Smart Feed Calculator — www.aleeqa.app",
    "report.target_ge": "Target ≥ {n}%",
    "report.max_le": "Max {n}%",
    "report.protein_stat": "Crude protein",
    "report.energy_stat": "Energy (TDN)",
    "report.fiber_stat": "Crude fiber",
  },
};

interface ReportParams {
  result: FormulationResult;
  animalKey: AnimalKey;
  weight: number;
  production: number;
  flockSize?: number;
  mode: FormulationMode;
  prices: PriceMap;
  savings: { amount: number; pct: number } | null;
  lang?: Lang;
}

/**
 * Generates a self-contained, A4-formatted HTML ration report and opens it in
 * a new window for printing / saving as PDF. The layout is clean, with the app
 * brand, animal info, component table, nutrition summary, and cost. Supports
 * bilingual output (Arabic RTL or English LTR) via the `lang` param.
 */
export function printRationReport(params: ReportParams) {
  const { result, animalKey, weight, production, mode, savings } = params;
  const lang: Lang = params.lang ?? "ar";
  const tr = (key: string, vars?: Record<string, string | number>) => {
    let str = REPORT_DICT[lang][key] ?? REPORT_DICT.ar[key] ?? key;
    if (vars) {
      for (const [k, v] of Object.entries(vars)) {
        str = str.replace(new RegExp(`\\{${k}\\}`, "g"), String(v));
      }
    }
    return str;
  };
  const animal = ANIMALS[animalKey];
  const flockSize = params.flockSize ?? result.flockSize ?? 1;
  const isFlock = animal.hasFlockInput && flockSize > 1;
  const flockUnit = lang === "ar" ? animal.flockUnit : animal.flockUnitEn;
  const isBird = animal.flockUnit === "طائر";
  const numLocale = lang === "ar" ? "ar-EG" : "en-GB";
  const fmt = (n: number | undefined | null, d = 2) =>
    (n ?? 0).toLocaleString(numLocale, { minimumFractionDigits: d, maximumFractionDigits: d });
  const htmlLang = lang === "ar" ? "ar" : "en";
  const htmlDir = lang === "ar" ? "rtl" : "ltr";
  const dateStr = new Date().toLocaleDateString(numLocale, {
    weekday: "long",
    year: "numeric",
    month: "long",
    day: "numeric",
  });

  const animalName = lang === "ar" ? animal.name : animal.nameEn;
  const weightUnit = lang === "ar" ? animal.weightUnit : animal.weightUnitEn;
  const productionLabel =
    lang === "ar" ? animal.productionLabel : animal.productionLabelEn;
  const productionUnit =
    lang === "ar" ? animal.productionUnit : animal.productionUnitEn;

  const rows = result.components
    .map((c, i) => {
      const ing = c.ingredient;
      const ingName = lang === "ar" ? ing.name : ing.nameEn;
      return `<tr>
        <td class="num">${i + 1}</td>
        <td><span class="dot" style="background:${(ing as any).color || "#888"}"></span>${ingName}</td>
        <td class="num">${fmt(c.percent, 1)}%</td>
        <td class="num">${fmt(c.kg, 2)} ${tr("report.kg_unit")}</td>
        <td class="num">${fmt(ing.protein, 1)}%</td>
        <td class="num">${fmt(ing.tdn, 0)}%</td>
        <td class="num cost">${fmt(c.cost, 2)} ${tr("report.egp_unit")}</td>
      </tr>`;
    })
    .join("");

  const savingsBlock =
    savings && savings.amount > 0
      ? `
    <div class="savings">
      <span class="savings-label">${tr("report.savings_label")}</span>
      <span class="savings-value">${fmt(savings.amount, 2)} ${tr("report.egp_unit")} (${fmt(savings.pct, 0)}%)</span>
    </div>`
      : "";

  const warningsBlock =
    result.warnings.length > 0
      ? `<div class="warnings"><strong>${tr("report.warnings")}:</strong><ul>${result.warnings
          .map((w) => `<li>${w}</li>`)
          .join("")}</ul></div>`
      : "";

  const productionMeta = animal.hasProductionInput
    ? ` · ${productionLabel}: ${fmt(production, 0)} ${productionUnit}`
    : "";
  const flockMeta = isFlock
    ? ` · ${isBird ? tr("report.birds_count") : tr("report.heads_count")}: ${(flockSize ?? 0).toLocaleString(
        numLocale
      )} ${flockUnit}`
    : "";

  const html = `<!DOCTYPE html>
<html lang="${htmlLang}" dir="${htmlDir}">
<head>
<meta charset="utf-8" />
<title>${tr("report.title")} — ${animalName}</title>
<style>
  @page { size: A4; margin: 14mm; }
  * { box-sizing: border-box; }
  body {
    font-family: "Alexandria", "Segoe UI", Tahoma, sans-serif;
    color: #1a2b22;
    margin: 0;
    padding: 0;
    background: #fff;
    -webkit-print-color-adjust: exact;
    print-color-adjust: exact;
  }
  .sheet { max-width: 190mm; margin: 0 auto; }
  /* Header */
  .header {
    display: flex;
    align-items: center;
    justify-content: space-between;
    border-bottom: 3px solid #2E7D4F;
    padding-bottom: 10px;
    margin-bottom: 16px;
  }
  .brand { display: flex; align-items: center; gap: 10px; }
  .brand-logo {
    width: 42px; height: 42px; border-radius: 10px;
    background: linear-gradient(135deg, #2E7D4F, #4ea870);
    display: flex; align-items: center; justify-content: center;
    color: #fff; font-size: 22px;
  }
  .brand-name { font-size: 22px; font-weight: 900; color: #2E7D4F; }
  .brand-sub { font-size: 11px; color: #667; }
  .report-title {
    text-align: ${htmlDir === "rtl" ? "left" : "right"};
  }
  .report-title h1 { margin: 0; font-size: 18px; color: #1a2b22; }
  .report-title .date { font-size: 11px; color: #667; margin-top: 2px; }

  /* Animal card */
  .animal-card {
    display: flex; align-items: center; gap: 14px;
    background: linear-gradient(135deg, #f0f7f2, #faf7ef);
    border: 1px solid #d8e6dd;
    border-radius: 12px;
    padding: 12px 16px;
    margin-bottom: 16px;
  }
  .animal-emoji { font-size: 38px; }
  .animal-info { flex: 1; }
  .animal-name { font-size: 17px; font-weight: 800; }
  .animal-meta { font-size: 12px; color: #556; margin-top: 2px; }
  .mode-badge {
    background: ${mode === "economy" ? "#D9A521" : "#2E7D4F"};
    color: #fff; padding: 5px 12px; border-radius: 999px;
    font-size: 12px; font-weight: 700;
  }

  /* Summary stats */
  .stats { display: flex; gap: 10px; margin-bottom: 16px; }
  .stat {
    flex: 1; border: 1px solid #e0e0e0; border-radius: 10px;
    padding: 10px; text-align: center;
  }
  .stat-label { font-size: 10px; color: #667; }
  .stat-value { font-size: 18px; font-weight: 800; color: #1a2b22; margin-top: 2px; }
  .stat-sub { font-size: 9px; color: #888; }
  .stat.ok { border-color: #b5d9c1; background: #f0f7f2; }
  .stat.warn { border-color: #e6c77a; background: #fdf6e3; }

  /* Cost highlight */
  .cost-box {
    background: linear-gradient(135deg, #2E7D4F, #4ea870);
    color: #fff; border-radius: 12px; padding: 14px 18px;
    margin-bottom: 16px; display: flex; justify-content: space-between; align-items: center;
  }
  .cost-label { font-size: 12px; opacity: 0.9; }
  .cost-value { font-size: 26px; font-weight: 900; }
  .cost-sub { font-size: 11px; opacity: 0.85; margin-top: 2px; }

  .savings {
    background: #fdf6e3; border: 1px solid #e6c77a; border-radius: 10px;
    padding: 10px 14px; margin-bottom: 16px;
    display: flex; justify-content: space-between; align-items: center;
  }
  .savings-label { font-size: 12px; color: #7a5a1a; }
  .savings-value { font-size: 16px; font-weight: 800; color: #8a6a1a; }

  /* Flock summary */
  .flock-box {
    display: grid; grid-template-columns: repeat(4, 1fr); gap: 8px;
    margin-bottom: 16px;
  }
  .flock-item {
    background: #f0f7f2; border: 1px solid #b5d9c1; border-radius: 10px;
    padding: 10px 8px; text-align: center;
  }
  .flock-label { display: block; font-size: 10px; color: #556; margin-bottom: 3px; }
  .flock-value { display: block; font-size: 15px; font-weight: 800; color: #2E7D4F; }

  /* Table */
  h2.section { font-size: 14px; color: #2E7D4F; margin: 18px 0 8px; ${htmlDir === "rtl" ? "border-right" : "border-left"}: 4px solid #2E7D4F; padding-${htmlDir === "rtl" ? "right" : "left"}: 8px; }
  table { width: 100%; border-collapse: collapse; font-size: 12px; }
  th {
    background: #f0f7f2; color: #2E7D4F; font-weight: 700;
    padding: 8px 6px; text-align: ${htmlDir === "rtl" ? "right" : "left"}; border-bottom: 2px solid #2E7D4F;
  }
  th.num, td.num { text-align: center; }
  td { padding: 7px 6px; border-bottom: 1px solid #eee; }
  tr:last-child td { border-bottom: 2px solid #2E7D4F; }
  td.cost { font-weight: 800; }
  .dot { display: inline-block; width: 10px; height: 10px; border-radius: 3px; margin-${htmlDir === "rtl" ? "left" : "right"}: 6px; vertical-align: middle; }
  tfoot td { font-weight: 800; background: #faf7ef; border-bottom: none; }

  /* Warnings */
  .warnings {
    background: #fdf3f0; border: 1px solid #e6b8a8; border-radius: 10px;
    padding: 10px 14px; margin: 14px 0; font-size: 11px; color: #8a3a1a;
  }
  .warnings ul { margin: 4px 0 0; padding-${htmlDir === "rtl" ? "right" : "left"}: 16px; }
  .warnings li { margin-top: 2px; }

  /* Footer */
  .footer {
    margin-top: 20px; padding-top: 10px; border-top: 1px solid #ddd;
    font-size: 10px; color: #888; text-align: center; line-height: 1.6;
  }
  .footer .brand-line { color: #2E7D4F; font-weight: 700; }

  @media print {
    body { background: #fff; }
    .no-print { display: none; }
  }
  .print-btn {
    position: fixed; top: 14px; ${htmlDir === "rtl" ? "left" : "right"}: 14px; z-index: 99;
    background: #2E7D4F; color: #fff; border: none; border-radius: 10px;
    padding: 10px 18px; font-size: 13px; font-weight: 700; cursor: pointer;
    font-family: inherit;
  }
  .print-btn:hover { background: #256e44; }
</style>
</head>
<body>
  <button class="print-btn no-print" onclick="window.print()">${tr("report.print_btn")}</button>
  <div class="sheet">
    <div class="header">
      <div class="brand">
        <div class="brand-logo">🌾</div>
        <div>
          <div class="brand-name">${tr("common.app_name")}</div>
          <div class="brand-sub">${tr("common.app_sub")}</div>
        </div>
      </div>
      <div class="report-title">
        <h1>${tr("report.title")}</h1>
        <div class="date">${dateStr}</div>
      </div>
    </div>

    <div class="animal-card">
      <div class="animal-emoji">${animal.emoji}</div>
      <div class="animal-info">
        <div class="animal-name">${animalName}</div>
        <div class="animal-meta">
          ${tr("report.weight_label")}: ${fmt(weight, animalKey === "layer" || animalKey === "broiler" ? 1 : 0)} ${weightUnit}${productionMeta}${flockMeta}
          · ${tr("report.dmi_label")}: ${fmt(result.dmi, 2)} ${tr("report.kg_unit")}/${tr("report.per_day")}
        </div>
      </div>
      <div class="mode-badge">${mode === "economy" ? tr("report.mode_economy") : tr("report.mode_balanced")}</div>
    </div>

    <div class="stats">
      <div class="stat ${result.achieved.cp >= result.targets.cpMin - 0.3 ? "ok" : "warn"}">
        <div class="stat-label">${tr("report.protein_stat")}</div>
        <div class="stat-value">${fmt(result.achieved.cp, 1)}%</div>
        <div class="stat-sub">${tr("report.target_ge", { n: fmt(result.targets.cpMin, 0) })}</div>
      </div>
      <div class="stat ${result.achieved.tdn >= result.targets.tdnMin - 0.5 ? "ok" : "warn"}">
        <div class="stat-label">${tr("report.energy_stat")}</div>
        <div class="stat-value">${fmt(result.achieved.tdn, 1)}%</div>
        <div class="stat-sub">${tr("report.target_ge", { n: fmt(result.targets.tdnMin, 0) })}</div>
      </div>
      <div class="stat ${result.achieved.fiber <= result.targets.fiberMax + 0.5 ? "ok" : "warn"}">
        <div class="stat-label">${tr("report.fiber_stat")}</div>
        <div class="stat-value">${fmt(result.achieved.fiber, 1)}%</div>
        <div class="stat-sub">${tr("report.max_le", { n: fmt(result.targets.fiberMax, 0) })}</div>
      </div>
    </div>

    <div class="cost-box">
      <div>
        <div class="cost-label">${tr("report.daily_cost")} ${isFlock ? tr("report.cost_for_flock") : tr("report.cost_for_ration")}</div>
        <div class="cost-value">${fmt(result.totalCost, 2)} ${tr("report.egp_unit")}</div>
        <div class="cost-sub">
          ${tr("report.monthly_cost")}: ${fmt(result.costPerMonth, 2)} ${tr("report.egp_unit")}
          ${isFlock ? ` · ${isBird ? tr("report.per_bird") : tr("report.per_head")}: ${fmt(result.costPerAnimal, 2)} ${tr("report.egp_unit")}` : ` · ${tr("report.per_kg_label")}: ${fmt(result.costPerKg, 2)} ${tr("report.egp_unit")}`}
        </div>
      </div>
      <div style="font-size: 36px; opacity: 0.4;">💰</div>
    </div>

    ${isFlock ? `
    <div class="flock-box">
      <div class="flock-item">
        <span class="flock-label">${isBird ? "🐔" : "🐂"} ${isBird ? tr("report.birds_count") : tr("report.heads_count")}</span>
        <span class="flock-value">${(flockSize ?? 0).toLocaleString(numLocale)} ${flockUnit}</span>
      </div>
      <div class="flock-item">
        <span class="flock-label">💵 ${tr("report.daily_cost")}</span>
        <span class="flock-value">${fmt(result.totalCost, 2)} ${tr("report.egp_unit")}</span>
      </div>
      <div class="flock-item">
        <span class="flock-label">📅 ${tr("report.monthly_cost")}</span>
        <span class="flock-value">${fmt(result.costPerMonth, 0)} ${tr("report.egp_unit")}</span>
      </div>
      <div class="flock-item">
        <span class="flock-label">${isBird ? "🐣" : "🐂"} ${isBird ? tr("report.per_bird") : tr("report.per_head")}</span>
        <span class="flock-value">${fmt(result.costPerAnimal, 2)} ${tr("report.egp_unit")}</span>
      </div>
    </div>` : ""}

    ${savingsBlock}

    <h2 class="section">${tr("report.components_section")}</h2>
    <table>
      <thead>
        <tr>
          <th class="num">${tr("report.col_num")}</th>
          <th>${tr("report.col_component")}</th>
          <th class="num">${tr("report.col_percent")}</th>
          <th class="num">${tr("report.col_qty")}</th>
          <th class="num">${tr("report.col_protein")}</th>
          <th class="num">${tr("report.col_energy")}</th>
          <th class="num">${tr("report.col_cost")}</th>
        </tr>
      </thead>
      <tbody>
        ${rows}
      </tbody>
      <tfoot>
        <tr>
          <td colspan="3">${tr("report.total")}</td>
          <td class="num">${fmt(result.dmi, 2)} ${tr("report.kg_unit")}</td>
          <td class="num">${fmt(result.achieved.cp, 1)}%</td>
          <td class="num">${fmt(result.achieved.tdn, 1)}%</td>
          <td class="num cost">${fmt(result.totalCost, 2)} ${tr("report.egp_unit")}</td>
        </tr>
      </tfoot>
    </table>

    ${warningsBlock}

    <div class="footer">
      <div class="brand-line">${tr("report.brand_line")}</div>
      <div>${tr("report.footer.line1")}</div>
      <div>${tr("report.copyright", { year: new Date().getFullYear() })}</div>
    </div>
  </div>
  <script>
    // Auto-trigger print dialog after the report loads.
    window.addEventListener('load', function(){ setTimeout(function(){ window.print(); }, 400); });
  </script>
</body>
</html>`;

  const w = window.open("", "_blank", "width=820,height=1000");
  if (!w) {
    // Pop-up blocked — fallback: write into current document is risky, so alert.
    alert(tr("report.popup_blocked"));
    return;
  }
  w.document.open();
  w.document.write(html);
  w.document.close();
}
