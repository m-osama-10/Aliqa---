"use client";

import { useEffect, useRef } from "react";
import { AD_UNITS, type AdUnitId } from "./ad-config";

interface AdBannerProps {
  unitId: Extract<AdUnitId, "banner_468x60" | "banner_320x50" | "banner_728x90" | "banner_160x300">;
  className?: string;
}

/**
 * Banner ad (iframe type) — uses the atOptions config + invoke.js pattern.
 * The script reads window.atOptions and injects an iframe with the ad.
 */
export function AdBanner({ unitId, className = "" }: AdBannerProps) {
  const containerRef = useRef<HTMLDivElement>(null);
  const unit = AD_UNITS[unitId];

  useEffect(() => {
    if (!unit.src || !unit.atOptionsKey || !containerRef.current) return;

    // Clear container
    containerRef.current.innerHTML = "";

    // Remove any previously injected script with this src
    document.querySelectorAll(`script[src="${unit.src}"]`).forEach((s) => s.remove());

    // Set the atOptions config on window BEFORE the script runs
    (window as unknown as Record<string, unknown>).atOptions = {
      key: unit.atOptionsKey,
      format: "iframe",
      height: unit.height,
      width: unit.width,
      params: {},
    };

    // Inject the invoke.js script
    const script = document.createElement("script");
    script.src = unit.src;
    containerRef.current.appendChild(script);

    return () => {
      script.remove();
    };
  }, [unit.src, unit.atOptionsKey, unit.height, unit.width]);

  return (
    <div
      className={`flex items-center justify-center overflow-hidden rounded-lg bg-muted/30 ${className}`}
      style={{ width: "100%", maxWidth: unit.width, minHeight: unit.height }}
      aria-label="إعلان"
    >
      <div ref={containerRef} style={{ width: unit.width, height: unit.height }} />
    </div>
  );
}

/* ---------- Convenience wrappers ---------- */
export function AdBanner468({ className }: { className?: string }) {
  return <AdBanner unitId="banner_468x60" className={className} />;
}
export function AdBanner320({ className }: { className?: string }) {
  return <AdBanner unitId="banner_320x50" className={className} />;
}
export function AdBanner728({ className }: { className?: string }) {
  return <AdBanner unitId="banner_728x90" className={className} />;
}
export function AdBanner160({ className }: { className?: string }) {
  return <AdBanner unitId="banner_160x300" className={className} />;
}
