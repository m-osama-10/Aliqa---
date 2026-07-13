"use client";

import { create } from "zustand";
import { useEffect, useSyncExternalStore } from "react";
import { LandingScreen } from "@/components/aleeqa/landing-screen";
import { AppShell } from "@/components/app-shell";
import { AuthScreen } from "@/components/auth/auth-screen";
import { AdminDashboard } from "@/components/admin/admin-dashboard";
import { AuthProvider, useAuth } from "@/lib/store/auth-context";
import { useAppStore } from "@/lib/store/app-store";
import { LanguageProvider } from "@/lib/i18n";

/* ---------- entered flag (localStorage) ---------- */
const ENTERED_KEY = "aleeqa.entered.v1";
const listeners = new Set<() => void>();
let enteredCache: boolean | null = null; // null = not yet read from localStorage

function subscribe(cb: () => void) {
  listeners.add(cb);
  const onStorage = (e: StorageEvent) => {
    if (e.key === ENTERED_KEY) {
      enteredCache = null; // invalidate cache
      cb();
    }
  };
  window.addEventListener("storage", onStorage);
  return () => {
    listeners.delete(cb);
    window.removeEventListener("storage", onStorage);
  };
}
function notify() {
  listeners.forEach((l) => l());
}
function getSnapshot(): boolean {
  if (enteredCache === null) {
    enteredCache = localStorage.getItem(ENTERED_KEY) === "1";
  }
  return enteredCache;
}
function getServerSnapshot(): boolean {
  return false; // SSR always renders landing page
}

/* ---------- UI overlay flags (zustand) ---------- */
interface UIState {
  showAuth: boolean;
  showAdmin: boolean;
  setShowAuth: (v: boolean) => void;
  setShowAdmin: (v: boolean) => void;
}
const useUIStore = create<UIState>((set) => ({
  showAuth: false,
  showAdmin: false,
  setShowAuth: (showAuth) => set({ showAuth }),
  setShowAdmin: (showAdmin) => set({ showAdmin }),
}));

function AppInner() {
  const entered = useSyncExternalStore(subscribe, getSnapshot, getServerSnapshot);
  const { user, isGuest } = useAuth();
  const { locale, theme, settings } = useAppStore();
  const { showAuth, showAdmin, setShowAuth, setShowAdmin } = useUIStore();

  // Apply locale + RTL globally
  useEffect(() => {
    const root = document.documentElement;
    root.lang = locale;
    root.dir = locale === "ar" ? "rtl" : "ltr";
  }, [locale]);

  // Apply theme (light/dark/system)
  useEffect(() => {
    const root = document.documentElement;
    const apply = (isDark: boolean) => {
      root.classList.toggle("dark", isDark);
    };
    if (theme === "system") {
      const mq = window.matchMedia("(prefers-color-scheme: dark)");
      apply(mq.matches);
      const handler = (e: MediaQueryListEvent) => apply(e.matches);
      mq.addEventListener("change", handler);
      return () => mq.removeEventListener("change", handler);
    }
    apply(theme === "dark");
  }, [theme]);

  // Apply dynamic primary color
  useEffect(() => {
    const color = settings.primary_color as string | undefined;
    if (color) {
      document.documentElement.style.setProperty("--dynamic-primary", color);
    }
  }, [settings.primary_color]);

  // Reset admin view if user loses admin role
  useEffect(() => {
    if (user?.role !== "admin" && showAdmin) setShowAdmin(false);
  }, [user, showAdmin, setShowAdmin]);

  const enter = () => {
    try {
      localStorage.setItem(ENTERED_KEY, "1");
      notify();
    } catch {
      /* ignore */
    }
    window.scrollTo(0, 0);
  };

  const goHome = () => {
    try {
      localStorage.removeItem(ENTERED_KEY);
      notify();
    } catch {
      /* ignore */
    }
    window.scrollTo(0, 0);
  };

  // Admin dashboard (only admins)
  if (showAdmin && user?.role === "admin") {
    return <AdminDashboard onExit={() => setShowAdmin(false)} />;
  }

  // Auth screen
  if (showAuth && !user && !isGuest) {
    return <AuthScreen onSuccess={() => setShowAuth(false)} onBack={() => setShowAuth(false)} />;
  }

  // Landing or App
  // On first client render, always show Landing (enteredCache starts null → false)
  // After mount, if localStorage has "1", entered becomes true → AppShell
  if (!entered) {
    return <LandingScreen onEnter={enter} />;
  }

  // If entered but no user and not guest, still show AppShell (guest-like access)
  // The AppShell will prompt for login when needed

  return (
    <AppShell
      onHome={goHome}
      onShowAuth={() => setShowAuth(true)}
      onShowAdmin={() => setShowAdmin(true)}
    />
  );
}

export default function Home() {
  return (
    <AuthProvider>
      <LanguageProvider>
        <AppInner />
      </LanguageProvider>
    </AuthProvider>
  );
}
