/* ================================================================== */
/*  INGREDIENT DATABASE — Flexible, editable nutrition values          */
/*  All values are loaded from localStorage (user-editable).           */
/*  Default values are standard Egyptian feed composition tables.      */
/* ================================================================== */

export type IngredientCategory = "energy" | "protein" | "fiber" | "additive";

export interface IngredientNutrition {
  key: string;
  name: string;
  nameEn: string;
  category: IngredientCategory;
  emoji: string;
  // Nutrition values (all editable, all as-fed %)
  protein: number; // Crude Protein CP %
  tdn: number; // Total Digestible Nutrients % (energy)
  fiber: number; // Crude Fiber CF %
  fat: number; // Ether Extract EE %
  calcium: number; // Ca %
  phosphorus: number; // P %
  dryMatter: number; // DM %
  // Usage bounds (as % of ration)
  minUsage: number; // minimum %
  maxUsage: number; // maximum recommended %
  // Price
  price: number; // EGP per kg
}

/* ---------- Default values (standard reference) ---------- */
export const DEFAULT_INGREDIENTS: IngredientNutrition[] = [
  // Energy sources
  { key: "corn", name: "ذرة صفراء", nameEn: "Yellow Corn", category: "energy", emoji: "🌽", protein: 8.5, tdn: 88, fiber: 2.5, fat: 3.8, calcium: 0.02, phosphorus: 0.28, dryMatter: 88, minUsage: 0, maxUsage: 65, price: 12 },
  { key: "barley", name: "شعير", nameEn: "Barley", category: "energy", emoji: "🌾", protein: 11.5, tdn: 84, fiber: 5, fat: 1.8, calcium: 0.05, phosphorus: 0.34, dryMatter: 89, minUsage: 0, maxUsage: 50, price: 10 },
  { key: "sorghum", name: "سورجم", nameEn: "Sorghum", category: "energy", emoji: "🌾", protein: 10, tdn: 82, fiber: 3, fat: 3.1, calcium: 0.03, phosphorus: 0.3, dryMatter: 88, minUsage: 0, maxUsage: 55, price: 9 },
  { key: "bran", name: "ردة قمح", nameEn: "Wheat Bran", category: "energy", emoji: "🌾", protein: 15.5, tdn: 70, fiber: 10, fat: 4, calcium: 0.14, phosphorus: 1.15, dryMatter: 88, minUsage: 0, maxUsage: 25, price: 8 },
  { key: "rice_bran", name: "نخالة أرز", nameEn: "Rice Bran", category: "energy", emoji: "🌾", protein: 13, tdn: 68, fiber: 12, fat: 14, calcium: 0.08, phosphorus: 1.5, dryMatter: 90, minUsage: 0, maxUsage: 15, price: 7 },
  { key: "molasses", name: "مولاس", nameEn: "Molasses", category: "energy", emoji: "🍯", protein: 3, tdn: 72, fiber: 0, fat: 0.5, calcium: 0.8, phosphorus: 0.1, dryMatter: 75, minUsage: 0, maxUsage: 10, price: 6 },

  // Protein sources
  { key: "soybean44", name: "كسب صويا 44%", nameEn: "Soybean Meal 44%", category: "protein", emoji: "🫘", protein: 44, tdn: 84, fiber: 7, fat: 1, calcium: 0.3, phosphorus: 0.65, dryMatter: 89, minUsage: 0, maxUsage: 35, price: 28 },
  { key: "soybean46", name: "كسب صويا 46%", nameEn: "Soybean Meal 46%", category: "protein", emoji: "🫘", protein: 46, tdn: 84, fiber: 6, fat: 1, calcium: 0.3, phosphorus: 0.65, dryMatter: 89, minUsage: 0, maxUsage: 35, price: 29 },
  { key: "cottonseed", name: "كسب قطن", nameEn: "Cottonseed Meal", category: "protein", emoji: "🫘", protein: 24, tdn: 72, fiber: 18, fat: 1.5, calcium: 0.2, phosphorus: 1, dryMatter: 90, minUsage: 0, maxUsage: 20, price: 16 },
  { key: "sunflower", name: "كسب عباد الشمس", nameEn: "Sunflower Meal", category: "protein", emoji: "🌻", protein: 30, tdn: 68, fiber: 20, fat: 2.5, calcium: 0.35, phosphorus: 1, dryMatter: 90, minUsage: 0, maxUsage: 15, price: 15 },
  { key: "linseed", name: "كسب كتان", nameEn: "Linseed Meal", category: "protein", emoji: "🫘", protein: 32, tdn: 72, fiber: 9, fat: 4, calcium: 0.4, phosphorus: 0.85, dryMatter: 90, minUsage: 0, maxUsage: 15, price: 17 },
  { key: "fava_bean", name: "فول بلدي", nameEn: "Fava Bean", category: "protein", emoji: "🫘", protein: 24, tdn: 80, fiber: 8, fat: 1.5, calcium: 0.15, phosphorus: 0.5, dryMatter: 88, minUsage: 0, maxUsage: 25, price: 18 },
  { key: "peanut", name: "فول سوداني", nameEn: "Peanut Meal", category: "protein", emoji: "🥜", protein: 26, tdn: 78, fiber: 12, fat: 8, calcium: 0.2, phosphorus: 0.6, dryMatter: 90, minUsage: 0, maxUsage: 15, price: 16 },

  // Fiber / forage
  { key: "hay", name: "برسيم جاف", nameEn: "Hay (dried clover)", category: "fiber", emoji: "🌿", protein: 17, tdn: 58, fiber: 28, fat: 2.5, calcium: 1.4, phosphorus: 0.25, dryMatter: 90, minUsage: 0, maxUsage: 50, price: 9 },
  { key: "corn_silage", name: "سيلاج ذرة", nameEn: "Corn Silage", category: "fiber", emoji: "🌽", protein: 8, tdn: 70, fiber: 24, fat: 3, calcium: 0.25, phosphorus: 0.22, dryMatter: 35, minUsage: 0, maxUsage: 60, price: 3 },
  { key: "straw", name: "تبن قمح", nameEn: "Wheat Straw", category: "fiber", emoji: "🌾", protein: 3, tdn: 42, fiber: 40, fat: 1.5, calcium: 0.3, phosphorus: 0.1, dryMatter: 90, minUsage: 0, maxUsage: 25, price: 4 },

  // Additives / minerals
  { key: "limestone", name: "كربونات الكالسيوم", nameEn: "Limestone (CaCO3)", category: "additive", emoji: "🪨", protein: 0, tdn: 0, fiber: 0, fat: 0, calcium: 38, phosphorus: 0, dryMatter: 100, minUsage: 0, maxUsage: 3, price: 2 },
  { key: "bicarb", name: "بيكربونات الصوديوم", nameEn: "Sodium Bicarbonate", category: "additive", emoji: "🧂", protein: 0, tdn: 0, fiber: 0, fat: 0, calcium: 0, phosphorus: 0, dryMatter: 100, minUsage: 0, maxUsage: 1.5, price: 5 },
  { key: "salt", name: "ملح الطعام", nameEn: "Salt (NaCl)", category: "additive", emoji: "🧂", protein: 0, tdn: 0, fiber: 0, fat: 0, calcium: 0, phosphorus: 0, dryMatter: 100, minUsage: 0, maxUsage: 1, price: 3 },
  { key: "mineral_mix", name: "مخلوط أملاح معدنية", nameEn: "Mineral Mix", category: "additive", emoji: "🧪", protein: 0, tdn: 0, fiber: 0, fat: 0, calcium: 20, phosphorus: 12, dryMatter: 100, minUsage: 0, maxUsage: 2, price: 20 },
  { key: "vitamins", name: "فيتامينات", nameEn: "Vitamins", category: "additive", emoji: "💊", protein: 0, tdn: 0, fiber: 0, fat: 0, calcium: 0, phosphorus: 0, dryMatter: 100, minUsage: 0, maxUsage: 0.5, price: 45 },
  { key: "toxin_binder", name: "مضاد سموم", nameEn: "Toxin Binder", category: "additive", emoji: "💊", protein: 0, tdn: 0, fiber: 0, fat: 0, calcium: 0, phosphorus: 0, dryMatter: 100, minUsage: 0, maxUsage: 0.5, price: 25 },
];

export const INGREDIENT_KEYS = DEFAULT_INGREDIENTS.map((i) => i.key);

/* ---------- localStorage persistence ---------- */
const STORAGE_KEY = "alieqa.ingredients.v2";

/** Load ingredients from localStorage, falling back to defaults. */
export function loadIngredients(): IngredientNutrition[] {
  if (typeof window === "undefined") return DEFAULT_INGREDIENTS;
  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    if (!raw) return DEFAULT_INGREDIENTS;
    const saved = JSON.parse(raw) as Partial<IngredientNutrition>[];
    // Merge: use saved values, but ensure all default fields exist
    return DEFAULT_INGREDIENTS.map((def) => {
      const user = saved.find((s) => s.key === def.key);
      return user ? { ...def, ...user } : def;
    });
  } catch {
    return DEFAULT_INGREDIENTS;
  }
}

/** Save ingredients to localStorage. */
export function saveIngredients(ingredients: IngredientNutrition[]): void {
  if (typeof window === "undefined") return;
  try {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(ingredients));
  } catch {
    /* ignore */
  }
}

/** Reset all ingredients to default values. */
export function resetIngredients(): IngredientNutrition[] {
  if (typeof window !== "undefined") {
    localStorage.removeItem(STORAGE_KEY);
  }
  return DEFAULT_INGREDIENTS;
}

/** Get a map of ingredients by key for quick lookup. */
export function ingredientMap(ingredients: IngredientNutrition[]): Record<string, IngredientNutrition> {
  const map: Record<string, IngredientNutrition> = {};
  for (const ing of ingredients) map[ing.key] = ing;
  return map;
}

/** Category labels (Arabic). */
export const CATEGORY_LABELS: Record<IngredientCategory, string> = {
  energy: "طاقة",
  protein: "بروتين",
  fiber: "ألياف خشنة",
  additive: "إضافات",
};

/** Category order for display. */
export const CATEGORY_ORDER: IngredientCategory[] = ["energy", "protein", "fiber", "additive"];
