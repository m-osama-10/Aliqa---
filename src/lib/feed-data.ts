import { Wheat, Sprout, Leaf, FlaskConical, type LucideIcon } from "lucide-react";

/* ================================================================== */
/*  FEED INGREDIENT DATABASE — Egyptian market                         */
/*  Nutrition values are approximate, on an as-fed basis, suitable     */
/*  for a farmer-facing advisory tool. Sources: NRC simplifications +  */
/*  typical Egyptian feed composition tables.                          */
/* ================================================================== */

export type IngredientKey =
  | "corn"
  | "soybean"
  | "bran"
  | "hay"
  | "straw"
  | "premix";

export type IngredientCategory = "energy" | "protein" | "fiber" | "mineral" | "vitamin" | "additive";

export interface Ingredient {
  key: IngredientKey;
  name: string;
  nameEn: string;
  short: string;
  shortEn: string;
  category: IngredientCategory;
  categoryLabel: string;
  defaultPrice: number; // EGP / kg (as-fed)
  protein: number; // crude protein %
  tdn: number; // total digestible nutrients % (energy proxy)
  fiber: number; // crude fiber %
  color: string; // oklch
  icon: LucideIcon;
  /** Emoji used in mobile/manual editor UI (optional on legacy Ingredient records) */
  emoji?: string;
}

export const INGREDIENTS: Record<IngredientKey, Ingredient> = {
  corn: {
    key: "corn",
    name: "الذرة الصفراء",
    nameEn: "Yellow corn",
    short: "ذرة",
    shortEn: "Corn",
    category: "energy",
    categoryLabel: "طاقة",
    defaultPrice: 12,
    protein: 8.5,
    tdn: 88,
    fiber: 2.5,
    color: "oklch(0.78 0.15 78)",
    icon: Wheat,
  },
  soybean: {
    key: "soybean",
    name: "كسب فول الصويا",
    nameEn: "Soybean meal",
    short: "صويا",
    shortEn: "Soybean",
    category: "protein",
    categoryLabel: "بروتين",
    defaultPrice: 28,
    protein: 44,
    tdn: 77,
    fiber: 7,
    color: "oklch(0.6 0.13 140)",
    icon: Sprout,
  },
  bran: {
    key: "bran",
    name: "الردة (نخالة القمح)",
    nameEn: "Wheat bran",
    short: "ردة",
    shortEn: "Bran",
    category: "energy",
    categoryLabel: "طاقة/ألياف",
    defaultPrice: 8,
    protein: 15,
    tdn: 70,
    fiber: 10,
    color: "oklch(0.7 0.1 55)",
    icon: Wheat,
  },
  hay: {
    key: "hay",
    name: "الدريس (برسيم جاف)",
    nameEn: "Hay (dried clover)",
    short: "دريس",
    shortEn: "Hay",
    category: "fiber",
    categoryLabel: "ألياف خشنة",
    defaultPrice: 9,
    protein: 12,
    tdn: 55,
    fiber: 28,
    color: "oklch(0.6 0.12 125)",
    icon: Leaf,
  },
  straw: {
    key: "straw",
    name: "التبن (قش القمح)",
    nameEn: "Wheat straw",
    short: "تبن",
    shortEn: "Straw",
    category: "fiber",
    categoryLabel: "ألياف خشنة",
    defaultPrice: 4,
    protein: 3,
    tdn: 40,
    fiber: 40,
    color: "oklch(0.8 0.09 75)",
    icon: Leaf,
  },
  premix: {
    key: "premix",
    name: "الإضافات (فيتامينات + أملاح + مضادات سموم)",
    nameEn: "Additives (vitamins + minerals + toxin binders)",
    short: "إضافات",
    shortEn: "Additives",
    category: "additive",
    categoryLabel: "إضافات",
    defaultPrice: 45,
    protein: 0,
    tdn: 0,
    fiber: 0,
    color: "oklch(0.55 0.13 210)",
    icon: FlaskConical,
  },
};

export const INGREDIENT_ORDER: IngredientKey[] = [
  "corn",
  "soybean",
  "bran",
  "hay",
  "straw",
  "premix",
];

export const CATEGORY_COLORS: Record<IngredientCategory, string> = {
  energy: "oklch(0.78 0.15 78)",
  protein: "oklch(0.6 0.13 140)",
  fiber: "oklch(0.6 0.12 125)",
  mineral: "oklch(0.55 0.13 210)",
  vitamin: "oklch(0.65 0.15 0)",
  additive: "oklch(0.55 0.13 210)",
};

/* ================================================================== */
/*  ANIMAL PROFILES + NUTRITIONAL REQUIREMENTS                         */
/* ================================================================== */

export type AnimalKey =
  | "dairy_cow"
  | "dairy_buffalo"
  | "buffalo"
  | "calf"
  | "sheep"
  | "layer"
  | "layer_breeder"
  | "broiler"
  | "broiler_starter";

export interface AnimalProfile {
  key: AnimalKey;
  name: string;
  nameEn: string;
  emoji: string;
  species: "ruminant" | "poultry";
  defaultWeight: number;
  weightMin: number;
  weightMax: number;
  weightStep: number;
  weightUnit: string;
  weightUnitEn: string;
  hasProductionInput: boolean;
  productionLabel: string;
  productionLabelEn: string;
  productionUnit: string;
  productionUnitEn: string;
  productionDefault: number;
  productionMin: number;
  productionMax: number;
  productionStep: number;
  /** Shows a herd/flock-size input (number of animals) for all species. */
  hasFlockInput: boolean;
  defaultFlockSize: number;
  flockMin: number;
  flockMax: number;
  flockStep: number;
  /** Label for the unit, e.g. "رأس" for ruminants, "طائر" for poultry. */
  flockUnit: string;
  flockUnitEn: string;
  /** Label for the group, e.g. "القطيع" / "عدد الطيور". */
  flockLabel: string;
  flockLabelEn: string;
  description: string;
  descriptionEn: string;
  /** Dry matter / as-fed intake model in kg/day */
  dmi: (weight: number, production: number) => number;
  /** Nutritional targets (as-fed %). */
  targets: {
    cpMin: number; // crude protein min %
    tdnMin: number; // energy min %
    fiberMax: number; // crude fiber max %
  };
  /** Per-ingredient bounds as % of ration (0-100). */
  bounds: Record<string, { lb: number; ub: number }>;
  /** Minimum roughage (hay+straw) % for ruminants. */
  forageMin: number;
}

export const ANIMALS: Record<AnimalKey, AnimalProfile> = {
  dairy_cow: {
    key: "dairy_cow",
    name: "بقرة حلوب",
    nameEn: "Dairy cow",
    emoji: "🐄",
    species: "ruminant",
    defaultWeight: 500,
    weightMin: 300,
    weightMax: 700,
    weightStep: 10,
    weightUnit: "كجم",
    weightUnitEn: "kg",
    hasProductionInput: true,
    productionLabel: "إنتاج اللبن اليومي",
    productionLabelEn: "Daily milk production",
    productionUnit: "لتر/يوم",
    productionUnitEn: "L/day",
    productionDefault: 20,
    productionMin: 0,
    productionMax: 45,
    productionStep: 1,
    hasFlockInput: true,
    defaultFlockSize: 10,
    flockMin: 1,
    flockMax: 5000,
    flockStep: 1,
    flockUnit: "رأس",
    flockUnitEn: "head",
    flockLabel: "عدد رؤوس القطيع",
    flockLabelEn: "Herd size",
    dmi: (w, p) => +(0.025 * w + 0.35 * p).toFixed(2),
    // NRC dairy cow: CP 14-16%, TDN 63-68%, NDF min 28-30% (fiber ~17-24%)
    targets: { cpMin: 15, tdnMin: 65, fiberMax: 24 },
    bounds: {
      corn: { lb: 20, ub: 50 },
      barley: { lb: 0, ub: 30 },
      sorghum: { lb: 0, ub: 30 },
      bran: { lb: 0, ub: 20 },
      rice_bran: { lb: 0, ub: 10 },
      molasses: { lb: 0, ub: 8 },
      soybean44: { lb: 5, ub: 30 },
      soybean46: { lb: 0, ub: 28 },
      cottonseed: { lb: 0, ub: 15 },
      sunflower: { lb: 0, ub: 12 },
      linseed: { lb: 0, ub: 10 },
      fava_bean: { lb: 0, ub: 15 },
      hay: { lb: 10, ub: 45 },
      corn_silage: { lb: 0, ub: 50 },
      straw: { lb: 0, ub: 15 },
      limestone: { lb: 0.5, ub: 2 },
      bicarb: { lb: 0, ub: 1.2 },
      salt: { lb: 0.3, ub: 1 },
      mineral_mix: { lb: 0.5, ub: 1.5 },
      vitamins: { lb: 0.1, ub: 0.3 },
      toxin_binder: { lb: 0.1, ub: 0.3 },
    },
    forageMin: 40,
    description: "بقرة حلوب وزن ٥٠٠ كجم تنتج حوالي ٢٠ لتر لبن يومياً. تحتاج عاليقة عالية الطاقة والبروتين مع نسبة ألياف كافية للحاظنة.",
    descriptionEn: "A 500 kg dairy cow producing about 20 L of milk per day. Needs a high-energy, high-protein ration with adequate fiber for the rumen.",
  },
  buffalo: {
    key: "buffalo",
    name: "جاموس تسمين",
    nameEn: "Fattening buffalo",
    emoji: "🐃",
    species: "ruminant",
    defaultWeight: 400,
    weightMin: 250,
    weightMax: 600,
    weightStep: 10,
    weightUnit: "كجم",
    weightUnitEn: "kg",
    hasProductionInput: false,
    productionLabel: "",
    productionLabelEn: "",
    productionUnit: "",
    productionUnitEn: "",
    productionDefault: 0,
    productionMin: 0,
    productionMax: 0,
    productionStep: 0,
    hasFlockInput: true,
    defaultFlockSize: 10,
    flockMin: 1,
    flockMax: 5000,
    flockStep: 1,
    flockUnit: "رأس",
    flockUnitEn: "head",
    flockLabel: "عدد رؤوس القطيع",
    flockLabelEn: "Herd size",
    dmi: (w) => +(0.028 * w).toFixed(2),
    // NRC fattening buffalo: CP 11-13%, TDN 65-70%, fiber ~15-20%
    targets: { cpMin: 12.5, tdnMin: 67, fiberMax: 20 },
    bounds: {
      corn: { lb: 25, ub: 55 },
      barley: { lb: 0, ub: 30 },
      sorghum: { lb: 0, ub: 30 },
      bran: { lb: 0, ub: 22 },
      rice_bran: { lb: 0, ub: 10 },
      molasses: { lb: 0, ub: 8 },
      soybean44: { lb: 0, ub: 20 },
      cottonseed: { lb: 0, ub: 18 },
      sunflower: { lb: 0, ub: 12 },
      fava_bean: { lb: 0, ub: 12 },
      hay: { lb: 5, ub: 35 },
      corn_silage: { lb: 0, ub: 45 },
      straw: { lb: 0, ub: 18 },
      limestone: { lb: 0.3, ub: 1.5 },
      salt: { lb: 0.3, ub: 1 },
      mineral_mix: { lb: 0.5, ub: 1.5 },
      vitamins: { lb: 0.1, ub: 0.3 },
      toxin_binder: { lb: 0.1, ub: 0.3 },
    },
    forageMin: 12,
    description: "جاموس تسمين وزن ٤٠٠ كجم بمعدل نمو حوالي ١ كجم/يوم. يحتاج عاليقة عالية الطاقة لدعم النمو.",
    descriptionEn: "A 400 kg fattening buffalo with about 1 kg/day growth. Needs a high-energy ration to support growth.",
  },
  sheep: {
    key: "sheep",
    name: "خروف تسمين",
    nameEn: "Fattening sheep",
    emoji: "🐑",
    species: "ruminant",
    defaultWeight: 50,
    weightMin: 25,
    weightMax: 90,
    weightStep: 1,
    weightUnit: "كجم",
    weightUnitEn: "kg",
    hasProductionInput: false,
    productionLabel: "",
    productionLabelEn: "",
    productionUnit: "",
    productionUnitEn: "",
    productionDefault: 0,
    productionMin: 0,
    productionMax: 0,
    productionStep: 0,
    hasFlockInput: true,
    defaultFlockSize: 20,
    flockMin: 1,
    flockMax: 10000,
    flockStep: 1,
    flockUnit: "رأس",
    flockUnitEn: "head",
    flockLabel: "عدد رؤوس القطيع",
    flockLabelEn: "Flock size",
    dmi: (w) => +(0.04 * w).toFixed(2),
    // NRC fattening sheep: CP 12-14%, TDN 64-68%, fiber ~20-25%
    targets: { cpMin: 13.5, tdnMin: 66, fiberMax: 23 },
    bounds: {
      corn: { lb: 30, ub: 60 },
      barley: { lb: 0, ub: 35 },
      sorghum: { lb: 0, ub: 30 },
      bran: { lb: 0, ub: 18 },
      molasses: { lb: 0, ub: 8 },
      soybean44: { lb: 5, ub: 25 },
      cottonseed: { lb: 0, ub: 15 },
      sunflower: { lb: 0, ub: 12 },
      fava_bean: { lb: 0, ub: 15 },
      hay: { lb: 5, ub: 25 },
      straw: { lb: 0, ub: 12 },
      limestone: { lb: 0.3, ub: 1.5 },
      salt: { lb: 0.3, ub: 1 },
      mineral_mix: { lb: 0.5, ub: 1.5 },
      vitamins: { lb: 0.1, ub: 0.3 },
      toxin_binder: { lb: 0.1, ub: 0.3 },
    },
    forageMin: 20,
    description: "خروف تسمين وزن ٥٠ كجم بمعدل نمو ٢٥٠ جم/يوم. عاليقة مركزة عالية الطاقة.",
    descriptionEn: "A 50 kg fattening sheep with 250 g/day growth. A concentrated, high-energy ration.",
  },
  layer: {
    key: "layer",
    name: "دجاج بياض",
    nameEn: "Layer chicken",
    emoji: "🐔",
    species: "poultry",
    defaultWeight: 2,
    weightMin: 1.5,
    weightMax: 3,
    weightStep: 0.1,
    weightUnit: "كجم",
    weightUnitEn: "kg",
    hasProductionInput: false,
    productionLabel: "",
    productionLabelEn: "",
    productionUnit: "",
    productionUnitEn: "",
    productionDefault: 0,
    productionMin: 0,
    productionMax: 0,
    productionStep: 0,
    hasFlockInput: true,
    defaultFlockSize: 1000,
    flockMin: 1,
    flockMax: 50000,
    flockStep: 50,
    flockUnit: "طائر",
    flockUnitEn: "bird",
    flockLabel: "عدد الطيور في القطيع",
    flockLabelEn: "Flock size",
    dmi: () => 0.115,
    // NRC layer: CP 16-17%, ME 2750-2900 kcal/kg, fiber max 6%, Ca 3.5-4%
    targets: { cpMin: 16.5, tdnMin: 67, fiberMax: 6 },
    bounds: {
      corn: { lb: 50, ub: 65 },
      barley: { lb: 0, ub: 15 },
      sorghum: { lb: 0, ub: 20 },
      bran: { lb: 2, ub: 10 },
      molasses: { lb: 0, ub: 5 },
      soybean44: { lb: 15, ub: 28 },
      soybean46: { lb: 0, ub: 26 },
      cottonseed: { lb: 0, ub: 5 },
      sunflower: { lb: 0, ub: 8 },
      fava_bean: { lb: 0, ub: 10 },
      limestone: { lb: 3, ub: 8 },
      bicarb: { lb: 0, ub: 0.5 },
      salt: { lb: 0.25, ub: 0.5 },
      mineral_mix: { lb: 0.5, ub: 1.5 },
      vitamins: { lb: 0.1, ub: 0.3 },
      toxin_binder: { lb: 0.1, ub: 0.3 },
    },
    forageMin: 0,
    description: "دجاج بياض وزن ٢ كجم بمعدل إنتاج ٩٠٪. عاليقة مركزة منخفضة الألياف عالية البروتين. حدّد عدد الطيور لحساب تكلفة القطيع كاملاً.",
    descriptionEn: "A 2 kg layer chicken at 90% production. A concentrated, low-fiber, high-protein ration. Set the flock size to compute total flock cost.",
  },
  broiler: {
    key: "broiler",
    name: "دجاج تسمين",
    nameEn: "Broiler chicken",
    emoji: "🐤",
    species: "poultry",
    defaultWeight: 1.5,
    weightMin: 0.4,
    weightMax: 3,
    weightStep: 0.1,
    weightUnit: "كجم",
    weightUnitEn: "kg",
    hasProductionInput: false,
    productionLabel: "",
    productionLabelEn: "",
    productionUnit: "",
    productionUnitEn: "",
    productionDefault: 0,
    productionMin: 0,
    productionMax: 0,
    productionStep: 0,
    hasFlockInput: true,
    defaultFlockSize: 1000,
    flockMin: 1,
    flockMax: 50000,
    flockStep: 50,
    flockUnit: "طائر",
    flockUnitEn: "bird",
    flockLabel: "عدد الطيور في القطيع",
    flockLabelEn: "Flock size",
    // Broiler intake grows with weight; ~10% of body weight early, tapering.
    dmi: (w) => +Math.max(0.05, 0.10 * w - 0.02 * Math.max(0, w - 1) ** 2).toFixed(3),
    // NRC broiler finisher: CP 19-21%, ME 3000-3200 kcal/kg, fiber max 5%
    targets: { cpMin: 20, tdnMin: 71, fiberMax: 5 },
    bounds: {
      corn: { lb: 50, ub: 62 },
      barley: { lb: 0, ub: 10 },
      sorghum: { lb: 0, ub: 15 },
      bran: { lb: 0, ub: 5 },
      molasses: { lb: 0, ub: 3 },
      soybean44: { lb: 22, ub: 35 },
      soybean46: { lb: 0, ub: 33 },
      cottonseed: { lb: 0, ub: 5 },
      sunflower: { lb: 0, ub: 5 },
      fava_bean: { lb: 0, ub: 8 },
      limestone: { lb: 0.5, ub: 1.5 },
      salt: { lb: 0.2, ub: 0.4 },
      mineral_mix: { lb: 0.5, ub: 1.5 },
      vitamins: { lb: 0.1, ub: 0.3 },
      toxin_binder: { lb: 0.1, ub: 0.3 },
    },
    forageMin: 0,
    description: "دجاج تسمين وزن ١.٥ كجم. عاليقة عالية البروتين والطاقة للنمو السريع. حدّد عدد الكتاكيت لحساب تكلفة القطيع كاملاً.",
    descriptionEn: "A 1.5 kg broiler chicken. A high-protein, high-energy ration for rapid growth. Set the flock size to compute total flock cost.",
  },
  dairy_buffalo: {
    key: "dairy_buffalo",
    name: "جاموس حلوب",
    nameEn: "Dairy buffalo",
    emoji: "🐃",
    species: "ruminant",
    defaultWeight: 450,
    weightMin: 350,
    weightMax: 650,
    weightStep: 10,
    weightUnit: "كجم",
    weightUnitEn: "kg",
    hasProductionInput: true,
    productionLabel: "إنتاج اللبن اليومي",
    productionLabelEn: "Daily milk production",
    productionUnit: "لتر/يوم",
    productionUnitEn: "L/day",
    productionDefault: 12,
    productionMin: 0,
    productionMax: 25,
    productionStep: 1,
    hasFlockInput: true,
    defaultFlockSize: 10,
    flockMin: 1,
    flockMax: 5000,
    flockStep: 1,
    flockUnit: "رأس",
    flockUnitEn: "head",
    flockLabel: "عدد رؤوس القطيع",
    flockLabelEn: "Herd size",
    dmi: (w, p) => +(0.028 * w + 0.3 * p).toFixed(2),
    // NRC dairy buffalo: CP 14-15% (buffalo milk richer than cow), TDN 64-67%, fiber ~22-26%
    targets: { cpMin: 14.5, tdnMin: 65, fiberMax: 25 },
    bounds: {
      corn: { lb: 18, ub: 48 },
      barley: { lb: 0, ub: 25 },
      sorghum: { lb: 0, ub: 25 },
      bran: { lb: 0, ub: 20 },
      rice_bran: { lb: 0, ub: 10 },
      molasses: { lb: 0, ub: 8 },
      soybean44: { lb: 3, ub: 25 },
      cottonseed: { lb: 0, ub: 15 },
      sunflower: { lb: 0, ub: 12 },
      fava_bean: { lb: 0, ub: 12 },
      hay: { lb: 10, ub: 40 },
      corn_silage: { lb: 0, ub: 45 },
      straw: { lb: 0, ub: 15 },
      limestone: { lb: 0.5, ub: 2 },
      salt: { lb: 0.3, ub: 1 },
      mineral_mix: { lb: 0.5, ub: 1.5 },
      vitamins: { lb: 0.1, ub: 0.3 },
      toxin_binder: { lb: 0.1, ub: 0.3 },
    },
    forageMin: 40,
    description: "جاموس حلوب وزن ٤٥٠ كجم ينتج حوالي ١٢ لتر لبن يومياً. يحتاج عاليقة عالية الطاقة والبروتين.",
    descriptionEn: "A 450 kg dairy buffalo producing about 12 L of milk per day. Needs a high-energy, high-protein ration.",
  },
  calf: {
    key: "calf",
    name: "عجول تسمين",
    nameEn: "Fattening calf",
    emoji: "🐂",
    species: "ruminant",
    defaultWeight: 200,
    weightMin: 80,
    weightMax: 400,
    weightStep: 5,
    weightUnit: "كجم",
    weightUnitEn: "kg",
    hasProductionInput: false,
    productionLabel: "",
    productionLabelEn: "",
    productionUnit: "",
    productionUnitEn: "",
    productionDefault: 0,
    productionMin: 0,
    productionMax: 0,
    productionStep: 0,
    hasFlockInput: true,
    defaultFlockSize: 15,
    flockMin: 1,
    flockMax: 5000,
    flockStep: 1,
    flockUnit: "رأس",
    flockUnitEn: "head",
    flockLabel: "عدد رؤوس القطيع",
    flockLabelEn: "Herd size",
    dmi: (w) => +(0.032 * w).toFixed(2),
    // NRC fattening calf: CP 14-16%, TDN 67-70%, fiber ~15-18%
    targets: { cpMin: 15, tdnMin: 68, fiberMax: 18 },
    bounds: {
      corn: { lb: 30, ub: 55 },
      barley: { lb: 0, ub: 25 },
      sorghum: { lb: 0, ub: 25 },
      bran: { lb: 0, ub: 15 },
      molasses: { lb: 0, ub: 6 },
      soybean44: { lb: 10, ub: 30 },
      soybean46: { lb: 0, ub: 28 },
      cottonseed: { lb: 0, ub: 12 },
      sunflower: { lb: 0, ub: 10 },
      fava_bean: { lb: 0, ub: 12 },
      hay: { lb: 5, ub: 25 },
      straw: { lb: 0, ub: 10 },
      limestone: { lb: 0.3, ub: 1.5 },
      salt: { lb: 0.3, ub: 0.8 },
      mineral_mix: { lb: 0.5, ub: 1.5 },
      vitamins: { lb: 0.1, ub: 0.3 },
      toxin_binder: { lb: 0.1, ub: 0.3 },
    },
    forageMin: 15,
    description: "عجل تسمين وزن ٢٠٠ كجم في مرحلة النمو. يحتاج عاليقة عالية البروتين لبناء العضلات.",
    descriptionEn: "A 200 kg fattening calf in the growth phase. Needs a high-protein ration for muscle building.",
  },
  layer_breeder: {
    key: "layer_breeder",
    name: "أمهات دجاج بياض",
    nameEn: "Layer breeder",
    emoji: "🐓",
    species: "poultry",
    defaultWeight: 2.5,
    weightMin: 1.8,
    weightMax: 3.5,
    weightStep: 0.1,
    weightUnit: "كجم",
    weightUnitEn: "kg",
    hasProductionInput: false,
    productionLabel: "",
    productionLabelEn: "",
    productionUnit: "",
    productionUnitEn: "",
    productionDefault: 0,
    productionMin: 0,
    productionMax: 0,
    productionStep: 0,
    hasFlockInput: true,
    defaultFlockSize: 1000,
    flockMin: 1,
    flockMax: 50000,
    flockStep: 50,
    flockUnit: "طائر",
    flockUnitEn: "bird",
    flockLabel: "عدد الطيور في القطيع",
    flockLabelEn: "Flock size",
    dmi: () => 0.13,
    // NRC layer breeder: CP 15-16% (less than layer to control egg size), ME 2700-2850, fiber max 6%, Ca 3-4%
    targets: { cpMin: 16, tdnMin: 68, fiberMax: 6 },
    bounds: {
      corn: { lb: 52, ub: 66 },
      barley: { lb: 0, ub: 12 },
      sorghum: { lb: 0, ub: 18 },
      bran: { lb: 2, ub: 8 },
      molasses: { lb: 0, ub: 4 },
      soybean44: { lb: 14, ub: 26 },
      soybean46: { lb: 0, ub: 24 },
      cottonseed: { lb: 0, ub: 3 },
      sunflower: { lb: 0, ub: 6 },
      fava_bean: { lb: 0, ub: 8 },
      limestone: { lb: 3, ub: 8 },
      salt: { lb: 0.25, ub: 0.5 },
      mineral_mix: { lb: 0.5, ub: 1.5 },
      vitamins: { lb: 0.1, ub: 0.3 },
      toxin_binder: { lb: 0.1, ub: 0.3 },
    },
    forageMin: 0,
    description: "أمهات دجاج بياض وزن ٢.٥ كجم لإنتاج بيض التفقيس. عاليقة عالية البروتين والكالسيوم.",
    descriptionEn: "Layer breeder hens, 2.5 kg, producing hatching eggs. A high-protein, high-calcium ration.",
  },
  broiler_starter: {
    key: "broiler_starter",
    name: "كتاكيت بادي",
    nameEn: "Broiler starter chicks",
    emoji: "🐣",
    species: "poultry",
    defaultWeight: 0.5,
    weightMin: 0.2,
    weightMax: 1.2,
    weightStep: 0.05,
    weightUnit: "كجم",
    weightUnitEn: "kg",
    hasProductionInput: false,
    productionLabel: "",
    productionLabelEn: "",
    productionUnit: "",
    productionUnitEn: "",
    productionDefault: 0,
    productionMin: 0,
    productionMax: 0,
    productionStep: 0,
    hasFlockInput: true,
    defaultFlockSize: 1000,
    flockMin: 1,
    flockMax: 50000,
    flockStep: 50,
    flockUnit: "طائر",
    flockUnitEn: "bird",
    flockLabel: "عدد الطيور في القطيع",
    flockLabelEn: "Flock size",
    dmi: (w) => +(0.08 * w).toFixed(2),
    // NRC broiler starter: CP 22-24%, ME 3000-3100, fiber max 4%
    targets: { cpMin: 23, tdnMin: 72, fiberMax: 4 },
    bounds: {
      corn: { lb: 48, ub: 58 },
      barley: { lb: 0, ub: 8 },
      sorghum: { lb: 0, ub: 12 },
      bran: { lb: 0, ub: 3 },
      soybean44: { lb: 28, ub: 38 },
      soybean46: { lb: 0, ub: 36 },
      cottonseed: { lb: 0, ub: 3 },
      sunflower: { lb: 0, ub: 3 },
      fava_bean: { lb: 0, ub: 6 },
      molasses: { lb: 0, ub: 2 },
      limestone: { lb: 0.5, ub: 1.2 },
      salt: { lb: 0.2, ub: 0.35 },
      mineral_mix: { lb: 0.5, ub: 1.2 },
      vitamins: { lb: 0.1, ub: 0.25 },
      toxin_binder: { lb: 0.1, ub: 0.25 },
    },
    forageMin: 0,
    description: "كتاكيت تسمين في مرحلة البادي (الأسبوع الأول) وزن ٠.٥ كجم. عاليقة عالية البروتين جداً للنمو المبكر.",
    descriptionEn: "Broiler starter chicks in the first week, 0.5 kg. A very high-protein ration for early growth.",
  },
};

export const ANIMAL_ORDER: AnimalKey[] = [
  "dairy_cow",
  "dairy_buffalo",
  "buffalo",
  "calf",
  "sheep",
  "layer",
  "layer_breeder",
  "broiler",
  "broiler_starter",
];

/* ================================================================== */
/*  MODELS                                                             */
/* ================================================================== */

export type FormulationMode = "balanced" | "economy";

export interface FormulationResult {
  dmi: number; // kg/day (per animal OR per flock for poultry)
  perAnimalDmi: number; // kg/day per single animal
  flockSize: number; // 1 for ruminants, N for poultry
  components: Array<{
    ingredient: Ingredient;
    percent: number; // % of ration
    kg: number; // kg/day (total)
    cost: number; // EGP/day (total)
  }>;
  totalCost: number; // EGP/day (total)
  costPerKg: number; // EGP/kg of ration
  costPerMonth: number; // EGP/month (30d, total)
  costPerAnimal: number; // EGP/day per single animal
  costPerTon: number; // EGP/ton (1000 kg)
  achieved: { cp: number; tdn: number; fiber: number };
  targets: { cpMin: number; tdnMin: number; fiberMax: number };
  feasible: boolean;
  warnings: string[];
}

/* ================================================================== */
/*  RESULT NORMALIZER — single source of truth                          */
/*                                                                     */
/*  Guarantees a COMPLETE FormulationResult from any partial input.     */
/*  This is the ROOT-CAUSE fix: every result, whether freshly computed  */
/*  by a formulator OR loaded from localStorage (old schema), passes    */
/*  through this function so the UI never sees an incomplete result.    */
/*                                                                     */
/*  Defense-in-depth:                                                   */
/*    1. Formulators call this on their return value (catches future    */
/*       regressions if someone edits a formulator and forgets a field).*/
/*    2. migrateRation calls this when loading saved rations (fixes the */
/*       actual source of incomplete results: stale localStorage data). */
/*    3. Components keep their safeResult guards as a final safety net. */
/* ================================================================== */

const EMPTY_ACHIEVED = { cp: 0, tdn: 0, fiber: 0 } as const;
const EMPTY_TARGETS = { cpMin: 0, tdnMin: 0, fiberMax: 0 } as const;

/**
 * Safely coerce any value to a finite number, returning 0 for NaN/Infinity/null/undefined.
 * This prevents NaN from propagating into the UI (which would crash .toFixed() etc).
 */
function safeNum(v: unknown, fallback = 0): number {
  const n = typeof v === "number" ? v : Number(v);
  return Number.isFinite(n) ? n : fallback;
}

export function normalizeFormulationResult(
  input: Partial<FormulationResult> | null | undefined
): FormulationResult {
  const achieved = input?.achieved ?? EMPTY_ACHIEVED;
  const targets = input?.targets ?? EMPTY_TARGETS;
  const components = Array.isArray(input?.components) ? input!.components : [];
  const warnings = Array.isArray(input?.warnings) ? input!.warnings : [];
  const flockSize = Math.max(1, safeNum(input?.flockSize, 1));
  const dmi = safeNum(input?.dmi);
  const totalCost = safeNum(input?.totalCost);
  const costPerKg = safeNum(input?.costPerKg, dmi > 0 ? totalCost / dmi : 0);
  const costPerAnimal = safeNum(
    input?.costPerAnimal,
    flockSize > 0 ? totalCost / flockSize : 0
  );

  return {
    dmi,
    perAnimalDmi: safeNum(input?.perAnimalDmi, dmi),
    flockSize,
    components: components.map((c) => ({
      ingredient: c?.ingredient as Ingredient,
      percent: safeNum(c?.percent),
      kg: safeNum(c?.kg),
      cost: safeNum(c?.cost),
    })),
    totalCost,
    costPerKg,
    costPerMonth: safeNum(input?.costPerMonth, totalCost * 30),
    costPerAnimal,
    costPerTon: safeNum(input?.costPerTon, costPerKg * 1000),
    achieved: {
      cp: safeNum(achieved.cp),
      tdn: safeNum(achieved.tdn),
      fiber: safeNum(achieved.fiber),
    },
    targets: {
      cpMin: safeNum(targets.cpMin),
      tdnMin: safeNum(targets.tdnMin),
      fiberMax: safeNum(targets.fiberMax),
    },
    feasible: Boolean(input?.feasible ?? false),
    warnings,
  };
}
