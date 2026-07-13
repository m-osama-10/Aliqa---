"use client";

import { useCallback, useRef, useSyncExternalStore } from "react";
import {
  INGREDIENTS,
  INGREDIENT_ORDER,
  type AnimalKey,
  type FormulationMode,
  type IngredientKey,
} from "./feed-data";
import type { FormulationResult } from "./feed-data";

/* ================================================================== */
/*  Minimal external store (localStorage-backed) with subscribe API.  */
/*  Using useSyncExternalStore gives SSR-safe, lint-compliant reads.  */
/* ================================================================== */

type Listener = () => void;
const listeners = new Set<Listener>();

function subscribe(listener: Listener) {
  listeners.add(listener);
  const onStorage = (e: StorageEvent) => {
    if (e.key === null || e.key?.startsWith("aleeqa.")) listener();
  };
  window.addEventListener("storage", onStorage);
  return () => {
    listeners.delete(listener);
    window.removeEventListener("storage", onStorage);
  };
}

function notify() {
  listeners.forEach((l) => l());
}

function readJSON<T>(key: string, fallback: T): T {
  if (typeof window === "undefined") return fallback;
  try {
    const raw = localStorage.getItem(key);
    if (!raw) return fallback;
    return JSON.parse(raw) as T;
  } catch {
    return fallback;
  }
}

function writeJSON(key: string, value: unknown): boolean {
  try {
    localStorage.setItem(key, JSON.stringify(value));
    notify();
    return true;
  } catch (e) {
    // QuotaExceededError or SecurityError — surface to caller.
    return false;
  }
}

function removeKey(key: string) {
  try {
    localStorage.removeItem(key);
    notify();
  } catch {
    /* ignore */
  }
}

/** Test if localStorage has remaining space (rough check). */
export function storageAvailable(): boolean {
  try {
    const test = "__aleeqa_test__";
    localStorage.setItem(test, "1");
    localStorage.removeItem(test);
    return true;
  } catch {
    return false;
  }
}

/* ================================================================== */
/*  PRICES (with multiple price profiles)                              */
/* ================================================================== */

export type PriceMap = Record<string, number>;

/** Legacy single-price-map key. Kept only to migrate older installs. */
const PRICES_KEY = "aleeqa.prices.v1";
const PRICES_UPDATED_KEY = "aleeqa.prices.updated.v1";
const PROFILES_KEY = "aleeqa.priceProfiles.v1";
const ACTIVE_PROFILE_KEY = "aleeqa.activeProfile.v1";

/** Maximum number of saved price profiles. */
export const MAX_PRICE_PROFILES = 3;
const DEFAULT_PROFILE_ID = "default";

/**
 * A named, user-editable set of ingredient prices. The active profile's
 * `prices` feed the LP solver and the price-editing screen.
 */
export interface PriceProfile {
  id: string;
  name: string;
  nameEn: string;
  prices: PriceMap;
}

export function defaultPrices(): PriceMap {
  // Build from the editable ingredient DB, not from hardcoded values.
  const map: PriceMap = {};
  // Import lazily to avoid circular dependency issues during SSR.
  const { DEFAULT_INGREDIENTS } = require("./ingredient-db");
  for (const ing of DEFAULT_INGREDIENTS) {
    map[ing.key] = ing.price;
  }
  return map;
}

function genId(): string {
  return typeof crypto !== "undefined" && "randomUUID" in crypto
    ? crypto.randomUUID()
    : `${Date.now()}-${Math.random().toString(36).slice(2)}`;
}

/**
 * Backward-compat: read the legacy single-price-map key if it exists, merged
 * with defaults. Returns null when the legacy key is absent (so the seeder
 * falls back to plain defaults).
 */
function readLegacyPrices(): PriceMap | null {
  if (typeof window === "undefined") return null;
  try {
    const raw = localStorage.getItem(PRICES_KEY);
    if (!raw) return null;
    const old = JSON.parse(raw) as Partial<PriceMap>;
    return { ...defaultPrices(), ...old };
  } catch {
    return null;
  }
}

/** First-run seed: one default profile, made active. */
function seedProfiles(): PriceProfile[] {
  const seedPrices = readLegacyPrices() ?? defaultPrices();
  const profiles: PriceProfile[] = [
    {
      id: DEFAULT_PROFILE_ID,
      name: "افتراضي",
      nameEn: "Default",
      prices: seedPrices,
    },
  ];
  try {
    localStorage.setItem(PROFILES_KEY, JSON.stringify(profiles));
    localStorage.setItem(ACTIVE_PROFILE_KEY, DEFAULT_PROFILE_ID);
  } catch {
    /* quota — caller will fall back to in-memory state */
  }
  return profiles;
}

/** Make sure each profile has a complete PriceMap (handles schema drift). */
function normalizeProfiles(raw: PriceProfile[]): PriceProfile[] {
  return raw.map((p) => ({
    id: p.id || genId(),
    name: p.name || "افتراضي",
    nameEn: p.nameEn || "Default",
    prices: { ...defaultPrices(), ...(p.prices || {}) },
  }));
}

const SERVER_PRICES = defaultPrices();
const SERVER_PROFILES: PriceProfile[] = [];
/** Stable SSR fallback for the derived `activeProfile` value. */
const SERVER_ACTIVE_PROFILE: PriceProfile = {
  id: DEFAULT_PROFILE_ID,
  name: "افتراضي",
  nameEn: "Default",
  prices: SERVER_PRICES,
};

let cachedProfiles: PriceProfile[] | null = null;
let cachedActiveProfileId: string | null = null;
let cachedPrices: PriceMap | null = null;
let cachedPricesForId: string | null = null;

function getProfilesSnapshot(): PriceProfile[] {
  if (typeof window === "undefined") return SERVER_PROFILES;
  if (cachedProfiles === null) {
    const raw = readJSON<PriceProfile[]>(PROFILES_KEY, []);
    if (!raw || raw.length === 0) {
      cachedProfiles = seedProfiles();
    } else {
      cachedProfiles = normalizeProfiles(raw);
    }
  }
  return cachedProfiles;
}
function getProfilesServerSnapshot(): PriceProfile[] {
  return SERVER_PROFILES;
}

function getActiveProfileIdSnapshot(): string {
  if (typeof window === "undefined") return DEFAULT_PROFILE_ID;
  if (cachedActiveProfileId === null) {
    const profiles = getProfilesSnapshot();
    const stored = localStorage.getItem(ACTIVE_PROFILE_KEY);
    if (stored && profiles.some((p) => p.id === stored)) {
      cachedActiveProfileId = stored;
    } else {
      cachedActiveProfileId = profiles[0]?.id ?? DEFAULT_PROFILE_ID;
      try {
        localStorage.setItem(ACTIVE_PROFILE_KEY, cachedActiveProfileId);
      } catch {
        /* ignore */
      }
    }
  }
  return cachedActiveProfileId;
}
function getActiveProfileIdServerSnapshot(): string {
  return DEFAULT_PROFILE_ID;
}

function getActiveProfile(): PriceProfile {
  if (typeof window === "undefined") return SERVER_ACTIVE_PROFILE;
  const profiles = getProfilesSnapshot();
  if (profiles.length === 0) return SERVER_ACTIVE_PROFILE;
  const activeId = getActiveProfileIdSnapshot();
  return profiles.find((p) => p.id === activeId) ?? profiles[0];
}

function getPricesSnapshot(): PriceMap {
  if (typeof window === "undefined") return SERVER_PRICES;
  const activeId = getActiveProfileIdSnapshot();
  if (cachedPrices === null || cachedPricesForId !== activeId) {
    cachedPrices = getActiveProfile().prices;
    cachedPricesForId = activeId;
  }
  return cachedPrices;
}

function getPricesServerSnapshot(): PriceMap {
  return SERVER_PRICES;
}

const EMPTY_STRING = "";
function getUpdatedAtSnapshot(): string {
  if (typeof window === "undefined") return EMPTY_STRING;
  return localStorage.getItem(PRICES_UPDATED_KEY) || EMPTY_STRING;
}
function getUpdatedAtServerSnapshot(): string {
  return EMPTY_STRING;
}

/** Persist the new profiles array and refresh derived caches. */
function commitProfiles(next: PriceProfile[]): boolean {
  const ok = writeJSON(PROFILES_KEY, next);
  if (ok) {
    cachedProfiles = next;
    cachedPrices = null;
    cachedPricesForId = null;
  }
  return ok;
}

/** Update the active-profile id (cache + localStorage) without notify. */
function setActiveProfileId(id: string) {
  cachedActiveProfileId = id;
  cachedPrices = null;
  cachedPricesForId = null;
  try {
    localStorage.setItem(ACTIVE_PROFILE_KEY, id);
  } catch {
    /* ignore */
  }
}

function stampUpdatedAt() {
  const now = new Date().toLocaleString("ar-EG", {
    dateStyle: "medium",
    timeStyle: "short",
  });
  try {
    localStorage.setItem(PRICES_UPDATED_KEY, now);
  } catch {
    /* ignore */
  }
}

function clearUpdatedAt() {
  try {
    localStorage.removeItem(PRICES_UPDATED_KEY);
  } catch {
    /* ignore */
  }
}

export function usePrices() {
  const prices = useSyncExternalStore(subscribe, getPricesSnapshot, getPricesServerSnapshot);
  const updatedAt = useSyncExternalStore(subscribe, getUpdatedAtSnapshot, getUpdatedAtServerSnapshot);
  const profiles = useSyncExternalStore(subscribe, getProfilesSnapshot, getProfilesServerSnapshot);
  const activeProfileId = useSyncExternalStore(
    subscribe,
    getActiveProfileIdSnapshot,
    getActiveProfileIdServerSnapshot
  );
  const activeProfile = getActiveProfile();

  const updatePrice = useCallback((key: IngredientKey, value: number): boolean => {
    const activeId = getActiveProfileIdSnapshot();
    const next = getProfilesSnapshot().map((p) =>
      p.id === activeId ? { ...p, prices: { ...p.prices, [key]: value } } : p
    );
    const ok = commitProfiles(next);
    if (ok) {
      stampUpdatedAt();
      notify();
    }
    return ok;
  }, []);

  const resetPrices = useCallback(() => {
    const activeId = getActiveProfileIdSnapshot();
    const def = defaultPrices();
    const next = getProfilesSnapshot().map((p) =>
      p.id === activeId ? { ...p, prices: def } : p
    );
    const ok = commitProfiles(next);
    if (ok) {
      clearUpdatedAt();
      notify();
    }
  }, []);

  const addProfile = useCallback((name: string, nameEn: string): boolean => {
    const current = getProfilesSnapshot();
    if (current.length >= MAX_PRICE_PROFILES) return false;
    const arName = name.trim();
    const enName = nameEn.trim();
    const newProfile: PriceProfile = {
      id: genId(),
      name: arName || enName || "ملف",
      nameEn: enName || arName || "Profile",
      prices: defaultPrices(),
    };
    const next = [...current, newProfile];
    const ok = commitProfiles(next);
    if (ok) {
      setActiveProfileId(newProfile.id);
      clearUpdatedAt();
      notify();
    }
    return ok;
  }, []);

  const switchProfile = useCallback((id: string): void => {
    const profiles = getProfilesSnapshot();
    if (!profiles.some((p) => p.id === id)) return;
    if (id === getActiveProfileIdSnapshot()) return;
    setActiveProfileId(id);
    clearUpdatedAt();
    notify();
  }, []);

  const deleteProfile = useCallback((id: string): boolean => {
    const current = getProfilesSnapshot();
    if (current.length <= 1) return false; // never delete the last profile
    if (!current.some((p) => p.id === id)) return false;
    const next = current.filter((p) => p.id !== id);
    const ok = commitProfiles(next);
    if (ok) {
      if (id === getActiveProfileIdSnapshot()) {
        setActiveProfileId(next[0].id);
      }
      clearUpdatedAt();
      notify();
    }
    return ok;
  }, []);

  const renameProfile = useCallback((id: string, name: string, nameEn: string): void => {
    const current = getProfilesSnapshot();
    const target = current.find((p) => p.id === id);
    if (!target) return;
    const arName = name.trim();
    const enName = nameEn.trim();
    if (!arName && !enName) return;
    const next = current.map((p) =>
      p.id === id
        ? {
            ...p,
            name: arName || p.name,
            nameEn: enName || p.nameEn,
          }
        : p
    );
    commitProfiles(next);
    // commitProfiles already calls notify() via writeJSON.
  }, []);

  return {
    prices,
    updatePrice,
    resetPrices,
    updatedAt,
    profiles,
    activeProfileId,
    activeProfile,
    addProfile,
    switchProfile,
    deleteProfile,
    renameProfile,
  };
}

/* ================================================================== */
/*  SAVED RATIONS                                                      */
/* ================================================================== */

export interface SavedRation {
  id: string;
  name: string;
  createdAt: string; // ISO
  animalKey: AnimalKey;
  animalName: string;
  weight: number;
  production: number;
  flockSize: number;
  mode: FormulationMode;
  prices: PriceMap;
  result: FormulationResult;
}

const RATIONS_KEY = "aleeqa.rations.v1";

/**
 * Migrate/validate a saved ration so older saves don't break the UI when
 * the FormulationResult shape evolves. Patches missing fields with safe
 * defaults derived from existing data.
 */
function migrateRation(r: Partial<SavedRation>): SavedRation | null {
  if (!r || !r.id || !r.result || !r.animalKey) return null;
  const res = r.result as Partial<FormulationResult>;
  // Backfill flock-related fields if missing (added in v1 → flock feature).
  if (res.perAnimalDmi === undefined) res.perAnimalDmi = res.dmi ?? 0;
  if (res.flockSize === undefined) res.flockSize = r.flockSize ?? 1;
  if (res.costPerAnimal === undefined) {
    res.costPerAnimal = res.flockSize > 0 ? (res.totalCost ?? 0) / res.flockSize : 0;
  }
  r.result = res as FormulationResult;
  if (r.flockSize === undefined) r.flockSize = res.flockSize ?? 1;
  if (r.production === undefined) r.production = 0;
  return r as SavedRation;
}

const SERVER_RATIONS: SavedRation[] = [];
let cachedRations: SavedRation[] | null = null;
function getRationsSnapshot(): SavedRation[] {
  if (typeof window === "undefined") return SERVER_RATIONS;
  if (cachedRations === null) {
    const raw = readJSON<Partial<SavedRation>[]>(RATIONS_KEY, []);
    cachedRations = raw.map(migrateRation).filter((r): r is SavedRation => r !== null);
  }
  return cachedRations;
}
function getRationsServerSnapshot(): SavedRation[] {
  return SERVER_RATIONS;
}

export function useRations() {
  const rations = useSyncExternalStore(subscribe, getRationsSnapshot, getRationsServerSnapshot);

  const saveRation = useCallback(
    (ration: Omit<SavedRation, "id" | "createdAt">): SavedRation | null => {
      const id =
        typeof crypto !== "undefined" && "randomUUID" in crypto
          ? crypto.randomUUID()
          : `${Date.now()}-${Math.random().toString(36).slice(2)}`;
      const full: SavedRation = {
        ...ration,
        id,
        createdAt: new Date().toISOString(),
      };
      const next = [full, ...getRationsSnapshot()].slice(0, 50);
      const ok = writeJSON(RATIONS_KEY, next);
      if (!ok) return null;
      cachedRations = next;
      return full;
    },
    []
  );

  const deleteRation = useCallback((id: string) => {
    const next = getRationsSnapshot().filter((r) => r.id !== id);
    cachedRations = next;
    writeJSON(RATIONS_KEY, next);
  }, []);

  return { rations, saveRation, deleteRation };
}

/* ================================================================== */
/*  ACTIVE TAB PERSISTENCE                                             */
/* ================================================================== */

export function usePersistentState<T>(key: string, initial: T) {
  const clientRef = useRef<{ v: T } | null>(null);
  const value = useSyncExternalStore(
    subscribe,
    () => {
      if (typeof window === "undefined") return initial;
      try {
        const raw = localStorage.getItem(key);
        const v = raw ? (JSON.parse(raw) as T) : initial;
        if (!clientRef.current || clientRef.current.v !== v) clientRef.current = { v };
        return clientRef.current.v;
      } catch {
        return initial;
      }
    },
    () => initial
  );

  const update = useCallback(
    (v: T | ((prev: T) => T)) => {
      const prev =
        typeof window !== "undefined"
          ? (() => {
              try {
                const raw = localStorage.getItem(key);
                return raw ? (JSON.parse(raw) as T) : initial;
              } catch {
                return initial;
              }
            })()
          : initial;
      const next = typeof v === "function" ? (v as (p: T) => T)(prev) : v;
      writeJSON(key, next);
    },
    [key, initial]
  );

  return [value, update] as const;
}

/* ================================================================== */
/*  INGREDIENTS (editable nutrition DB)                                 */
/* ================================================================== */

import {
  loadIngredients,
  saveIngredients,
  resetIngredients,
  type IngredientNutrition,
} from "./ingredient-db";

let cachedIngredients: IngredientNutrition[] | null = null;
const ingredientListeners = new Set<() => void>();

function getIngredientsSnapshot(): IngredientNutrition[] {
  if (!cachedIngredients) {
    cachedIngredients = loadIngredients();
  }
  return cachedIngredients;
}

function getIngredientsServerSnapshot(): IngredientNutrition[] {
  // Use require to avoid circular import at module load
  const { DEFAULT_INGREDIENTS } = require("./ingredient-db");
  return DEFAULT_INGREDIENTS;
}

function notifyIngredients() {
  ingredientListeners.forEach((l) => l());
}

export function useIngredients() {
  const ingredients = useSyncExternalStore(
    subscribeIngredients,
    getIngredientsSnapshot,
    getIngredientsServerSnapshot
  );

  const updateIngredient = useCallback(
    (key: string, field: keyof IngredientNutrition, value: string | number) => {
      const next = getIngredientsSnapshot().map((ing) =>
        ing.key === key ? { ...ing, [field]: value } : ing
      );
      cachedIngredients = next;
      saveIngredients(next);
      notifyIngredients();
    },
    []
  );

  const updateAllIngredients = useCallback((next: IngredientNutrition[]) => {
    cachedIngredients = next;
    saveIngredients(next);
    notifyIngredients();
  }, []);

  const resetAllIngredients = useCallback(() => {
    cachedIngredients = resetIngredients();
    notifyIngredients();
  }, []);

  return {
    ingredients,
    updateIngredient,
    updateAllIngredients,
    resetAllIngredients,
  };
}

function subscribeIngredients(cb: () => void) {
  ingredientListeners.add(cb);
  return () => ingredientListeners.delete(cb);
}
