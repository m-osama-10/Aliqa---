import {
  ANIMALS,
  INGREDIENTS,
  type AnimalKey,
  type FormulationMode,
  type FormulationResult,
  type IngredientKey,
  normalizeFormulationResult,
} from "./feed-data";
import type { PriceMap } from "./storage";
import { DICT, type Lang } from "./i18n";

/* ================================================================== */
/*  BILINGUAL TRANSLATION HELPER                                       */
/*  Uses the shared DICT from i18n.tsx — no duplicate dictionary.      */
/* ================================================================== */

const tr = (lang: Lang) => (key: string, vars?: Record<string, string | number>) => {
  let str = DICT[lang][key] ?? DICT.ar[key] ?? key;
  if (vars) {
    for (const [k, v] of Object.entries(vars)) {
      str = str.replace(new RegExp(`\\{${k}\\}`, "g"), String(v));
    }
  }
  return str;
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
  const { animalKey, weight, production, mode, savings } = params;
  // Normalize at the boundary: guarantees achieved/targets/components/costs
  // are all present even if a caller passes a stale saved-ration result.
  const result = normalizeFormulationResult(params.result);
  const lang: Lang = params.lang ?? "ar";
  const trFn = tr(lang);
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
        <td class="num">${fmt(c.kg, 2)} ${trFn("report.kg_unit")}</td>
        <td class="num">${fmt(ing.protein, 1)}%</td>
        <td class="num">${fmt(ing.tdn, 0)}%</td>
        <td class="num cost">${fmt(c.cost, 2)} ${trFn("report.egp_unit")}</td>
      </tr>`;
    })
    .join("");

  const savingsBlock =
    savings && savings.amount > 0
      ? `
    <div class="savings">
      <span class="savings-label">${trFn("report.savings_label")}</span>
      <span class="savings-value">${fmt(savings.amount, 2)} ${trFn("report.egp_unit")} (${fmt(savings.pct, 0)}%)</span>
    </div>`
      : "";

  const warningsBlock =
    result.warnings.length > 0
      ? `<div class="warnings"><strong>${trFn("report.warnings")}:</strong><ul>${result.warnings
          .map((w) => `<li>${w}</li>`)
          .join("")}</ul></div>`
      : "";

  const productionMeta = animal.hasProductionInput
    ? ` · ${productionLabel}: ${fmt(production, 0)} ${productionUnit}`
    : "";
  const flockMeta = isFlock
    ? ` · ${isBird ? trFn("report.birds_count") : trFn("report.heads_count")}: ${(flockSize ?? 0).toLocaleString(
        numLocale
      )} ${flockUnit}`
    : "";

  const html = `<!DOCTYPE html>
<html lang="${htmlLang}" dir="${htmlDir}">
<head>
<meta charset="utf-8" />
<title>${trFn("report.title")} — ${animalName}</title>
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
  <button class="print-btn no-print" onclick="window.print()">${trFn("report.print_btn")}</button>
  <div class="sheet">
    <div class="header">
      <div class="brand">
        <div class="brand-logo">🌾</div>
        <div>
          <div class="brand-name">${trFn("common.app_name")}</div>
          <div class="brand-sub">${trFn("common.app_sub")}</div>
        </div>
      </div>
      <div class="report-title">
        <h1>${trFn("report.title")}</h1>
        <div class="date">${dateStr}</div>
      </div>
    </div>

    <div class="animal-card">
      <div class="animal-emoji">${animal.emoji}</div>
      <div class="animal-info">
        <div class="animal-name">${animalName}</div>
        <div class="animal-meta">
          ${trFn("report.weight_label")}: ${fmt(weight, animalKey === "layer" || animalKey === "broiler" ? 1 : 0)} ${weightUnit}${productionMeta}${flockMeta}
          · ${trFn("report.dmi_label")}: ${fmt(result.dmi, 2)} ${trFn("report.kg_unit")}/${trFn("report.per_day")}
        </div>
      </div>
      <div class="mode-badge">${mode === "economy" ? trFn("report.mode_economy") : trFn("report.mode_balanced")}</div>
    </div>

    <div class="stats">
      <div class="stat ${result.achieved.cp >= result.targets.cpMin - 0.3 ? "ok" : "warn"}">
        <div class="stat-label">${trFn("report.protein_stat")}</div>
        <div class="stat-value">${fmt(result.achieved.cp, 1)}%</div>
        <div class="stat-sub">${trFn("report.target_ge", { n: fmt(result.targets.cpMin, 0) })}</div>
      </div>
      <div class="stat ${result.achieved.tdn >= result.targets.tdnMin - 0.5 ? "ok" : "warn"}">
        <div class="stat-label">${trFn("report.energy_stat")}</div>
        <div class="stat-value">${fmt(result.achieved.tdn, 1)}%</div>
        <div class="stat-sub">${trFn("report.target_ge", { n: fmt(result.targets.tdnMin, 0) })}</div>
      </div>
      <div class="stat ${result.achieved.fiber <= result.targets.fiberMax + 0.5 ? "ok" : "warn"}">
        <div class="stat-label">${trFn("report.fiber_stat")}</div>
        <div class="stat-value">${fmt(result.achieved.fiber, 1)}%</div>
        <div class="stat-sub">${trFn("report.max_le", { n: fmt(result.targets.fiberMax, 0) })}</div>
      </div>
    </div>

    <div class="cost-box">
      <div>
        <div class="cost-label">${trFn("report.daily_cost")} ${isFlock ? trFn("report.cost_for_flock") : trFn("report.cost_for_ration")}</div>
        <div class="cost-value">${fmt(result.totalCost, 2)} ${trFn("report.egp_unit")}</div>
        <div class="cost-sub">
          ${trFn("report.monthly_cost")}: ${fmt(result.costPerMonth, 2)} ${trFn("report.egp_unit")}
          ${isFlock ? ` · ${isBird ? trFn("report.per_bird") : trFn("report.per_head")}: ${fmt(result.costPerAnimal, 2)} ${trFn("report.egp_unit")}` : ` · ${trFn("report.per_kg_label")}: ${fmt(result.costPerKg, 2)} ${trFn("report.egp_unit")}`}
        </div>
      </div>
      <div style="font-size: 36px; opacity: 0.4;">💰</div>
    </div>

    ${isFlock ? `
    <div class="flock-box">
      <div class="flock-item">
        <span class="flock-label">${isBird ? "🐔" : "🐂"} ${isBird ? trFn("report.birds_count") : trFn("report.heads_count")}</span>
        <span class="flock-value">${(flockSize ?? 0).toLocaleString(numLocale)} ${flockUnit}</span>
      </div>
      <div class="flock-item">
        <span class="flock-label">💵 ${trFn("report.daily_cost")}</span>
        <span class="flock-value">${fmt(result.totalCost, 2)} ${trFn("report.egp_unit")}</span>
      </div>
      <div class="flock-item">
        <span class="flock-label">📅 ${trFn("report.monthly_cost")}</span>
        <span class="flock-value">${fmt(result.costPerMonth, 0)} ${trFn("report.egp_unit")}</span>
      </div>
      <div class="flock-item">
        <span class="flock-label">${isBird ? "🐣" : "🐂"} ${isBird ? trFn("report.per_bird") : trFn("report.per_head")}</span>
        <span class="flock-value">${fmt(result.costPerAnimal, 2)} ${trFn("report.egp_unit")}</span>
      </div>
    </div>` : ""}

    ${savingsBlock}

    <h2 class="section">${trFn("report.components_section")}</h2>
    <table>
      <thead>
        <tr>
          <th class="num">${trFn("report.col_num")}</th>
          <th>${trFn("report.col_component")}</th>
          <th class="num">${trFn("report.col_percent")}</th>
          <th class="num">${trFn("report.col_qty")}</th>
          <th class="num">${trFn("report.col_protein")}</th>
          <th class="num">${trFn("report.col_energy")}</th>
          <th class="num">${trFn("report.col_cost")}</th>
        </tr>
      </thead>
      <tbody>
        ${rows}
      </tbody>
      <tfoot>
        <tr>
          <td colspan="3">${trFn("report.total")}</td>
          <td class="num">${fmt(result.dmi, 2)} ${trFn("report.kg_unit")}</td>
          <td class="num">${fmt(result.achieved.cp, 1)}%</td>
          <td class="num">${fmt(result.achieved.tdn, 1)}%</td>
          <td class="num cost">${fmt(result.totalCost, 2)} ${trFn("report.egp_unit")}</td>
        </tr>
      </tfoot>
    </table>

    ${warningsBlock}

    <div class="footer">
      <div class="brand-line">${trFn("report.brand_line")}</div>
      <div>${trFn("report.footer.line1")}</div>
      <div>${trFn("report.copyright", { year: new Date().getFullYear() })}</div>
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
    alert(trFn("report.popup_blocked"));
    return;
  }
  w.document.open();
  w.document.write(html);
  w.document.close();
}
