"use client";

import { useSyncExternalStore, useCallback } from "react";

/** Online/offline status hook backed on navigator + window events. */
export function useNetworkStatus() {
  const subscribe = useCallback((cb: () => void) => {
    window.addEventListener("online", cb);
    window.addEventListener("offline", cb);
    return () => {
      window.removeEventListener("online", cb);
      window.removeEventListener("offline", cb);
    };
  }, []);
  const getSnapshot = () => navigator.onLine;
  const getServerSnapshot = () => true;
  return useSyncExternalStore(subscribe, getSnapshot, getServerSnapshot);
}

/** A tiny event-bus for "back online" triggers. */
const ONLINE_CALLBACKS = new Set<() => void>();
if (typeof window !== "undefined") {
  window.addEventListener("online", () => {
    ONLINE_CALLBACKS.forEach((cb) => {
      try {
        cb();
      } catch {
        /* ignore */
      }
    });
  });
}

export function onBackOnline(cb: () => void) {
  ONLINE_CALLBACKS.add(cb);
  return () => ONLINE_CALLBACKS.delete(cb);
}

/**
 * Retry wrapper with exponential backoff.
 * Accepts any thenable (Promise, PostgrestFilterBuilder, etc).
 * Usage: const data = await withRetry(() => fetchSomething());
 */
export async function withRetry<T>(
  fn: () => Promise<T> | { then: (onfulfilled: (v: T) => T, onrejected?: (e: unknown) => T) => unknown },
  maxRetries = 3,
  baseDelay = 500
): Promise<T> {
  let lastErr: unknown;
  for (let i = 0; i <= maxRetries; i++) {
    try {
      return await fn() as T;
    } catch (err) {
      lastErr = err;
      if (i < maxRetries) {
        await new Promise((r) => setTimeout(r, baseDelay * Math.pow(2, i)));
      }
    }
  }
  throw lastErr;
}
