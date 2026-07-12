"use client";

import { useEffect } from "react";
import { AD_UNITS } from "./ad-config";

/**
 * Social Bar ad — loads a script that injects a floating social bar.
 * The script manages its own positioning (usually fixed at bottom/top).
 */
export function AdSocialBar() {
  const unit = AD_UNITS.social_bar;

  useEffect(() => {
    if (!unit.src) return;

    // Remove any previously injected script with this src (avoid duplicates)
    document.querySelectorAll(`script[src="${unit.src}"]`).forEach((s) => s.remove());

    const script = document.createElement("script");
    script.src = unit.src;
    script.async = true;
    document.body.appendChild(script);

    return () => {
      script.remove();
      // Clean up any elements the social bar may have injected
      document
        .querySelectorAll('[id*="social-bar"], [class*="social-bar"]')
        .forEach((el) => el.remove());
    };
  }, [unit.src]);

  return null; // The script injects its own UI
}
