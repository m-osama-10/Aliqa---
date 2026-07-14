"use client";

import { supabase, IS_SUPABASE_CONFIGURED } from "@/lib/supabase/client";
import { cacheGet, cacheSet } from "@/lib/offline/cache";
import { withRetry } from "@/lib/offline/network";
import type { Ad, AdPlacement } from "@/types/db";

const CACHE_KEY = "ads:active";

/** Fetch active ads (optionally filtered by placement), cache for offline. */
export async function fetchActiveAds(placement?: AdPlacement): Promise<Ad[]> {
  if (!IS_SUPABASE_CONFIGURED) {
    return cacheGet<Ad[]>(CACHE_KEY, []) ?? [];
  }

  try {
    const result = await withRetry(() =>
      supabase.rpc("get_active_ads", { p_placement: placement ?? null })
    );
    const { data, error } = result as { data: unknown; error: unknown };
    if (error) throw error;
    const ads = (Array.isArray(data) ? data : []) as Ad[];
    if (!placement) cacheSet(CACHE_KEY, ads);
    return ads;
  } catch {
    return cacheGet<Ad[]>(CACHE_KEY, []) ?? [];
  }
}

/** Track an ad impression (fire-and-forget, safe offline). */
export async function trackAdImpression(adId: string) {
  if (!IS_SUPABASE_CONFIGURED) return;
  try {
    await supabase.rpc("increment_ad_stat", {
      ad_uuid: adId,
      stat: "impression",
    });
  } catch {
    /* ignore */
  }
}

/** Track an ad click (fire-and-forget). */
export async function trackAdClick(adId: string) {
  if (!IS_SUPABASE_CONFIGURED) return;
  try {
    await supabase.rpc("increment_ad_stat", {
      ad_uuid: adId,
      stat: "click",
    });
  } catch {
    /* ignore */
  }
}
