"use client";

import { useEffect, useState } from "react";
import { AD_UNITS, type AdUnitId } from "./ad-config";
import { AdSmartlink } from "./ad-smartlink";
import { AdNativeBanner } from "./ad-native-banner";
import { AdBanner } from "./ad-banner";

export type AdPlacement =
  | "header" // top of page — 728x90 (desktop) / 320x50 (mobile)
  | "footer" // bottom — 728x90 / 320x50
  | "sidebar" // side — 160x300
  | "in-feed" // between content — native banner
  | "interstitial" // full attention — smartlink banner
  | "mobile-banner" // mobile only — 320x50
  | "leaderboard"; // wide top — 728x90 or 468x60

interface AdSlotProps {
  placement: AdPlacement;
  className?: string;
  /** Force a specific ad unit regardless of placement */
  forceUnit?: AdUnitId;
}

/**
 * Smart ad slot — picks the right ad unit based on placement + viewport.
 * Falls back gracefully (no layout shift) if ads are disabled.
 */
export function AdSlot({ placement, className = "", forceUnit }: AdSlotProps) {
  const [width, setWidth] = useState(1200);

  useEffect(() => {
    const update = () => setWidth(window.innerWidth);
    update();
    window.addEventListener("resize", update);
    return () => window.removeEventListener("resize", update);
  }, []);

  // If a specific unit is forced, render it directly
  if (forceUnit) return <ForceUnit unit={forceUnit} className={className} />;

  const isMobile = width < 640;
  const isTablet = width >= 640 && width < 1024;

  switch (placement) {
    case "header":
    case "leaderboard":
      return isMobile ? (
        <AdBanner unitId="banner_320x50" className={className} />
      ) : isTablet ? (
        <AdBanner unitId="banner_468x60" className={className} />
      ) : (
        <AdBanner unitId="banner_728x90" className={className} />
      );

    case "footer":
      return isMobile ? (
        <AdBanner unitId="banner_320x50" className={className} />
      ) : (
        <AdBanner unitId="banner_728x90" className={className} />
      );

    case "sidebar":
      return <AdBanner unitId="banner_160x300" className={className} />;

    case "in-feed":
      return <AdNativeBanner className={className} />;

    case "interstitial":
      return <AdSmartlink variant="banner" className={className} />;

    case "mobile-banner":
      return isMobile ? (
        <AdBanner unitId="banner_320x50" className={className} />
      ) : null;

    default:
      return null;
  }
}

function ForceUnit({ unit, className }: { unit: AdUnitId; className: string }) {
  switch (unit) {
    case "smartlink":
      return <AdSmartlink variant="banner" className={className} />;
    case "native_banner":
      return <AdNativeBanner className={className} />;
    case "social_bar":
      return null; // social bar is rendered once globally
    case "banner_468x60":
      return <AdBanner unitId="banner_468x60" className={className} />;
    case "banner_320x50":
      return <AdBanner unitId="banner_320x50" className={className} />;
    case "banner_728x90":
      return <AdBanner unitId="banner_728x90" className={className} />;
    case "banner_160x300":
      return <AdBanner unitId="banner_160x300" className={className} />;
    default:
      return null;
  }
}

/**
 * Ad section — a labeled container wrapping an AdSlot with a small "إعلان" label.
 * Use this for in-page ad placements that should be visually distinct.
 */
export function AdSection({
  placement,
  label = "إعلان",
  className = "",
  forceUnit,
}: {
  placement: AdPlacement;
  label?: string;
  className?: string;
  forceUnit?: AdUnitId;
}) {
  return (
    <section
      className={`my-4 flex flex-col items-center gap-1 ${className}`}
      aria-label="advertisement"
    >
      <span className="text-[9px] uppercase tracking-wider text-muted-foreground/50">
        {label}
      </span>
      <AdSlot placement={placement} forceUnit={forceUnit} className="w-full" />
    </section>
  );
}
