"use client";

import { ExternalLink } from "lucide-react";
import { AD_UNITS } from "./ad-config";

/**
 * Smartlink ad — renders as a prominent CTA button/link.
 * Opens the ad network smartlink in a new tab.
 */
export function AdSmartlink({
  variant = "button",
  className = "",
}: {
  variant?: "button" | "banner" | "inline";
  className?: string;
}) {
  const unit = AD_UNITS.smartlink;
  if (!unit.linkUrl) return null;

  if (variant === "inline") {
    return (
      <a
        href={unit.linkUrl}
        target="_blank"
        rel="noopener noreferrer sponsored"
        className={`inline-flex items-center gap-1 text-sm font-semibold text-primary hover:underline ${className}`}
      >
        {unit.linkText}
        <ExternalLink className="h-3 w-3" />
      </a>
    );
  }

  if (variant === "banner") {
    return (
      <a
        href={unit.linkUrl}
        target="_blank"
        rel="noopener noreferrer sponsored"
        className={`flex items-center justify-center gap-2 rounded-xl border border-primary/30 bg-gradient-to-r from-primary/10 to-amber-500/10 px-6 py-3 text-sm font-bold text-foreground transition-all hover:scale-[1.01] hover:shadow-md ${className}`}
      >
        <span className="flex h-6 w-6 items-center justify-center rounded-full bg-primary text-primary-foreground text-xs">
          ★
        </span>
        {unit.linkText}
        <ExternalLink className="h-4 w-4 text-primary" />
      </a>
    );
  }

  // button variant
  return (
    <a
      href={unit.linkUrl}
      target="_blank"
      rel="noopener noreferrer sponsored"
      className={`inline-flex items-center gap-2 rounded-lg bg-primary px-5 py-2.5 text-sm font-bold text-primary-foreground shadow-sm transition-transform hover:scale-105 ${className}`}
    >
      {unit.linkText}
      <ExternalLink className="h-4 w-4" />
    </a>
  );
}
