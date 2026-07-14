"use client";

import { useEffect, useState, type ReactNode } from "react";

/**
 * Delays rendering of ad content until the user has interacted with the page
 * OR a timeout has elapsed (whichever comes first).
 *
 * This prevents ads from appearing immediately on page load, which can
 * block the initial user experience. Ads only show after:
 *   - The user clicks/taps/scrolls/types anywhere, OR
 *   - `delayMs` milliseconds have passed (default 8000 = 8 seconds)
 *
 * The component renders nothing (null) until the delay condition is met,
 * so there's no layout shift from a placeholder.
 */
export function DelayedAd({
  children,
  delayMs = 8000,
  className = "",
}: {
  children: ReactNode;
  delayMs?: number;
  className?: string;
}) {
  const [show, setShow] = useState(false);

  useEffect(() => {
    // If reduced motion/data-saver is preferred, skip ads entirely
    if (
      typeof window !== "undefined" &&
      window.matchMedia?.("(prefers-reduced-data: reduce)").matches
    ) {
      return;
    }

    let timer: ReturnType<typeof setTimeout>;
    let shown = false;

    const reveal = () => {
      if (shown) return;
      shown = true;
      setShow(true);
      // Clean up listeners once revealed
      window.removeEventListener("click", reveal);
      window.removeEventListener("scroll", reveal, true);
      window.removeEventListener("keydown", reveal);
      window.removeEventListener("touchstart", reveal, true);
      clearTimeout(timer);
    };

    // Reveal on first user interaction
    window.addEventListener("click", reveal, { once: true });
    window.addEventListener("scroll", reveal, { once: true, capture: true });
    window.addEventListener("keydown", reveal, { once: true });
    window.addEventListener("touchstart", reveal, { once: true, capture: true });

    // Reveal after timeout regardless
    timer = setTimeout(reveal, delayMs);

    return () => {
      window.removeEventListener("click", reveal);
      window.removeEventListener("scroll", reveal, true);
      window.removeEventListener("keydown", reveal);
      window.removeEventListener("touchstart", reveal, true);
      clearTimeout(timer);
    };
  }, [delayMs]);

  if (!show) return null;
  return <div className={className}>{children}</div>;
}
