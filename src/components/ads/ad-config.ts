/* =====================================================================
 *  AD NETWORK CONFIGURATION
 *  Central registry for banner ad units.
 *  Smartlink, Native Banner, and Social Bar have been removed.
 *  In-feed ads now use Google AdSense (see adsense-ad.tsx).
 * ===================================================================== */

export type AdUnitId =
  | "banner_468x60"
  | "banner_320x50"
  | "banner_728x90"
  | "banner_160x300";

export interface AdUnit {
  id: AdUnitId;
  name: string;
  nameAr: string;
  type: "iframe";
  width: number;
  height: number;
  src?: string;
  atOptionsKey?: string;
}

export const AD_UNITS: Record<AdUnitId, AdUnit> = {
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

export function pickResponsiveAds(width: number): AdUnitId[] {
  if (width < 640) return ["banner_320x50"];
  if (width < 1024) return ["banner_468x60", "banner_728x90"];
  return ["banner_728x90", "banner_160x300"];
}
