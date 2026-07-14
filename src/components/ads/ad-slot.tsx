"use client";

import { useEffect, useState } from "react";
import { type AdUnitId } from "./ad-config";
import { AdBanner } from "./ad-banner";
import { AdSenseAd } from "./adsense-ad";

export type AdPlacement =
  | "header" // top of page — 728x90 (desktop) / 320x50 (mobile)
  | "footer" // bottom — 728x90 / 320x50
  | "sidebar" // side — 160x300
  | "in-feed" // between content — AdSense responsive
  | "mobile-banner" // mobile only — 320x50
  | "leaderboard"; // wide top — 728x90 or 468x60

interface AdSlotProps {
  placement: AdPlacement;
  className?: string;
}

/**
 * Smart ad slot — picks the right ad unit based on placement + viewport.
 * Uses AdSense for in-feed, and banner components for header/footer/sidebar.
 */
export function AdSlot({ placement, className = "" }: AdSlotProps) {
  const [width, setWidth] = useState(1200);

  useEffect(() => {
    const update = () => setWidth(window.innerWidth);
    update();
    window.addEventListener("resize", update);
    return () => window.removeEventListener("resize", update);
  }, []);

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
      // AdSense responsive ad for in-feed placements
      return <AdSenseAd slot="" format="auto" className={className} />;

    case "mobile-banner":
      return isMobile ? (
        <AdBanner unitId="banner_320x50" className={className} />
      ) : null;

    default:
      return null;
  }
}

/**
 * Ad section — a labeled container wrapping an AdSlot with a small label.
 */
export function AdSection({
  placement,
  label = "إعلان",
  className = "",
}: {
  placement: AdPlacement;
  label?: string;
  className?: string;
}) {
  return (
    <section
      className={`my-4 flex flex-col items-center gap-1 ${className}`}
      aria-label="advertisement"
    >
      <span className="text-[9px] uppercase tracking-wider text-muted-foreground/50">
        {label}
      </span>
      <AdSlot placement={placement} className="w-full" />
    </section>
  );
}
