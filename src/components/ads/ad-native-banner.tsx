"use client";

import { useEffect, useRef } from "react";
import { AD_UNITS } from "./ad-config";

/**
 * Native Banner ad — loads an external script that injects content
 * into a container div. The script is reloaded on mount.
 */
export function AdNativeBanner({ className = "" }: { className?: string }) {
  const containerRef = useRef<HTMLDivElement>(null);
  const unit = AD_UNITS.native_banner;

  useEffect(() => {
    if (!unit.src || !unit.containerId) return;
    const containerId = unit.containerId;

    // Clear any existing content
    const existing = document.getElementById(containerId);
    if (existing) existing.innerHTML = "";

    // Remove any previously injected script with this src
    document.querySelectorAll(`script[src="${unit.src}"]`).forEach((s) => s.remove());

    // Inject the script
    const script = document.createElement("script");
    script.async = true;
    script.setAttribute("data-cfasync", "false");
    script.src = unit.src;
    document.body.appendChild(script);

    return () => {
      // cleanup on unmount
      script.remove();
    };
  }, [unit.src, unit.containerId]);

  return (
    <div
      ref={containerRef}
      className={`overflow-hidden rounded-xl border border-border/40 bg-card/50 ${className}`}
      aria-label="إعلان"
    >
      <div id={unit.containerId} className="min-h-[100px] w-full" />
    </div>
  );
}
