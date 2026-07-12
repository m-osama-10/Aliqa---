/* =====================================================================
 *  AD NETWORK CONFIGURATION
 *  Central registry for all 7 ad units across the app.
 *  Ad scripts are loaded via next/script with the appropriate strategy.
 * ===================================================================== */

export type AdUnitId =
  | "smartlink"
  | "native_banner"
  | "social_bar"
  | "banner_468x60"
  | "banner_320x50"
  | "banner_728x90"
  | "banner_160x300";

export interface AdUnit {
  id: AdUnitId;
  name: string;
  nameAr: string;
  type: "link" | "script-div" | "script-only" | "iframe";
  width: number;
  height: number;
  /** Script URL(s) to load */
  src?: string;
  /** Container div id (for script-div type) */
  containerId?: string;
  /** atOptions config key (for iframe type) */
  atOptionsKey?: string;
  /** Smartlink URL */
  linkUrl?: string;
  /** Smartlink display text */
  linkText?: string;
}

export const AD_UNITS: Record<AdUnitId, AdUnit> = {
  smartlink: {
    id: "smartlink",
    name: "Smartlink",
    nameAr: "رابط ذكي",
    type: "link",
    width: 0,
    height: 0,
    linkUrl: "https://www.effectivecpmnetwork.com/dycf4uyk?key=568b4219419876ebaab26d5901a21464",
    linkText: "اعرض أفضل العروض",
  },
  native_banner: {
    id: "native_banner",
    name: "Native Banner",
    nameAr: "بانر أصلي",
    type: "script-div",
    width: 0,
    height: 250,
    src: "https://pl30337533.effectivecpmnetwork.com/4b8c5e9e7d96b04276080978d39ab1c5/invoke.js",
    containerId: "container-4b8c5e9e7d96b04276080978d39ab1c5",
  },
  social_bar: {
    id: "social_bar",
    name: "Social Bar",
    nameAr: "شريط اجتماعي",
    type: "script-only",
    width: 0,
    height: 50,
    src: "https://pl30337534.effectivecpmnetwork.com/72/a5/f0/72a5f04b78d375c5dbdb34390ddf417b.js",
  },
  banner_468x60: {
    id: "banner_468x60",
    name: "Banner 468x60",
    nameAr: "بانر 468×60",
    type: "iframe",
    width: 468,
    height: 60,
    src: "https://www.highperformanceformat.com/8f73b34600b60c1038b428f92337defb/invoke.js",
    atOptionsKey: "8f73b34600b60c1038b428f92337defb",
  },
  banner_320x50: {
    id: "banner_320x50",
    name: "Banner 320x50",
    nameAr: "بانر 320×50",
    type: "iframe",
    width: 320,
    height: 50,
    src: "https://www.highperformanceformat.com/16853d965fde40e03031c3c18b531465/invoke.js",
    atOptionsKey: "16853d965fde40e03031c3c18b531465",
  },
  banner_728x90: {
    id: "banner_728x90",
    name: "Banner 728x90",
    nameAr: "بانر 728×90",
    type: "iframe",
    width: 728,
    height: 90,
    src: "https://www.highperformanceformat.com/991e2a8aabb6ae41c5ecedffd5c76de4/invoke.js",
    atOptionsKey: "991e2a8aabb6ae41c5ecedffd5c76de4",
  },
  banner_160x300: {
    id: "banner_160x300",
    name: "Banner 160x300",
    nameAr: "بانر 160×300",
    type: "iframe",
    width: 160,
    height: 300,
    src: "https://www.highperformanceformat.com/bcb69437be1d16292d52ca803c2a11f6/invoke.js",
    atOptionsKey: "bcb69437be1d16292d52ca803c2a11f6",
  },
};

export const ALL_AD_IDS = Object.keys(AD_UNITS) as AdUnitId[];

/**
 * Pick responsive ad units based on viewport width.
 * - mobile (<640px): 320x50, native_banner
 * - tablet (640-1024px): 468x60, 728x90
 * - desktop (>=1024px): 728x90, 160x300
 */
export function pickResponsiveAds(width: number): AdUnitId[] {
  if (width < 640) return ["banner_320x50", "native_banner"];
  if (width < 1024) return ["banner_468x60", "banner_728x90"];
  return ["banner_728x90", "banner_160x300"];
}
