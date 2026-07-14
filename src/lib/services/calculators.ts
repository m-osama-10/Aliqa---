"use client";

import { supabase, IS_SUPABASE_CONFIGURED } from "@/lib/supabase/client";
import { cacheGet, cacheSet } from "@/lib/offline/cache";
import { withRetry } from "@/lib/offline/network";
import type { CalcCategoryWithCalculators, Calculator, CalculatorCategory } from "@/types/db";

const CACHE_KEY = "calculators:all";

/**
 * Fetch all enabled categories with their calculators.
 * Falls back to built-in seed data when offline or not configured.
 */
export async function fetchCalculators(): Promise<CalcCategoryWithCalculators[]> {
  if (!IS_SUPABASE_CONFIGURED) {
    return cacheGet<CalcCategoryWithCalculators[]>(CACHE_KEY, BUILTIN_CATEGORIES) ?? BUILTIN_CATEGORIES;
  }

  try {
    const [catsRes, calcsRes] = await Promise.all([
      withRetry(() =>
        supabase
          .from("calculator_categories")
          .select("*")
          .eq("enabled", true)
          .is("deleted_at", null)
          .order("sort_order")
      ),
      withRetry(() =>
        supabase
          .from("calculators")
          .select("*")
          .eq("enabled", true)
          .is("deleted_at", null)
          .order("sort_order")
      ),
    ]);

    const catsResult = catsRes as { data: unknown; error: unknown };
    const calcsResult = calcsRes as { data: unknown; error: unknown };

    if (catsResult.error) throw catsResult.error;
    if (calcsResult.error) throw calcsResult.error;

    const categories = (Array.isArray(catsResult.data) ? catsResult.data : []) as CalculatorCategory[];
    const calculators = (Array.isArray(calcsResult.data) ? calcsResult.data : []) as Calculator[];

    const result: CalcCategoryWithCalculators[] = categories.map((c) => ({
      ...c,
      calculators: calculators.filter((calc) => calc.category_id === c.id),
    }));

    cacheSet(CACHE_KEY, result);
    return result.length ? result : BUILTIN_CATEGORIES;
  } catch {
    return cacheGet<CalcCategoryWithCalculators[]>(CACHE_KEY, BUILTIN_CATEGORIES) ?? BUILTIN_CATEGORIES;
  }
}

/* ---------- Built-in fallback (offline seed) ---------- */
import type { AnimalKey } from "@/lib/feed-data";

export interface CalcLite {
  id: string;
  slug: string;
  name: string;
  name_en: string;
  icon: string;
  animal_key: AnimalKey;
  is_premium: boolean;
  description: string;
}

export const BUILTIN_CATEGORIES: CalcCategoryWithCalculators[] = [
  {
    id: "cat-ruminants",
    slug: "ruminants",
    name: "المجترات",
    name_en: "Ruminants",
    description: "الأبقار والجاموس والأغنام",
    icon: "🐄",
    sort_order: 0,
    enabled: true,
    created_at: "",
    updated_at: "",
    deleted_at: null,
    calculators: [
      { id: "c1", category_id: "cat-ruminants", slug: "dairy-cow", name: "بقرة حلوب", name_en: "Dairy Cow", description: "حساب العليقة للبقرة الحلوب", icon: "🐄", animal_key: "dairy_cow", config: {}, sort_order: 0, enabled: true, is_premium: false, created_at: "", updated_at: "", deleted_at: null },
      { id: "c2", category_id: "cat-ruminants", slug: "dairy-buffalo", name: "جاموس حلوب", name_en: "Dairy Buffalo", description: "حساب العليقة للجاموس الحلوب", icon: "🐃", animal_key: "dairy_buffalo", config: {}, sort_order: 1, enabled: true, is_premium: false, created_at: "", updated_at: "", deleted_at: null },
      { id: "c3", category_id: "cat-ruminants", slug: "fattening-buffalo", name: "جاموس تسمين", name_en: "Fattening Buffalo", description: "حساب العليقة لجاموس التسمين", icon: "🐃", animal_key: "buffalo", config: {}, sort_order: 2, enabled: true, is_premium: false, created_at: "", updated_at: "", deleted_at: null },
      { id: "c4", category_id: "cat-ruminants", slug: "fattening-sheep", name: "خروف تسمين", name_en: "Fattening Sheep", description: "حساب العليقة لخروف التسمين", icon: "🐑", animal_key: "sheep", config: {}, sort_order: 3, enabled: true, is_premium: false, created_at: "", updated_at: "", deleted_at: null },
      { id: "c5", category_id: "cat-ruminants", slug: "calf", name: "عجل", name_en: "Calf", description: "حساب العليقة للعجل الصغير", icon: "🐂", animal_key: "calf", config: {}, sort_order: 4, enabled: true, is_premium: false, created_at: "", updated_at: "", deleted_at: null },
    ],
  },
  {
    id: "cat-poultry",
    slug: "poultry",
    name: "الدواجن",
    name_en: "Poultry",
    description: "دجاج البياض والتسمين",
    icon: "🐔",
    sort_order: 1,
    enabled: true,
    created_at: "",
    updated_at: "",
    deleted_at: null,
    calculators: [
      { id: "c6", category_id: "cat-poultry", slug: "layer", name: "دجاج بياض", name_en: "Layer Chicken", description: "حساب العليقة لدجاج البياض", icon: "🐔", animal_key: "layer", config: {}, sort_order: 5, enabled: true, is_premium: false, created_at: "", updated_at: "", deleted_at: null },
      { id: "c7", category_id: "cat-poultry", slug: "layer-breeder", name: "أمهات بياض", name_en: "Layer Breeder", description: "حساب العليقة لأمهات دجاج البياض", icon: "🐤", animal_key: "layer_breeder", config: {}, sort_order: 6, enabled: true, is_premium: true, created_at: "", updated_at: "", deleted_at: null },
      { id: "c8", category_id: "cat-poultry", slug: "broiler", name: "دجاج تسمين", name_en: "Broiler", description: "حساب العليقة لدجاج التسمين", icon: "🐤", animal_key: "broiler", config: {}, sort_order: 7, enabled: true, is_premium: false, created_at: "", updated_at: "", deleted_at: null },
      { id: "c9", category_id: "cat-poultry", slug: "broiler-starter", name: "بادي تسمين", name_en: "Broiler Starter", description: "حساب العليقة البادي لدجاج التسمين", icon: "🐤", animal_key: "broiler_starter", config: {}, sort_order: 8, enabled: true, is_premium: true, created_at: "", updated_at: "", deleted_at: null },
    ],
  },
];
