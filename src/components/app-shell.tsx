"use client";

import { useState, useEffect } from "react";
import {
  Calculator,
  Coins,
  BookMarked,
  Info,
  Leaf,
  ArrowRight,
  User as UserIcon,
  Wifi,
  WifiOff,
  RefreshCw,
} from "lucide-react";
import { cn } from "@/lib/utils";
import { useLang } from "@/lib/i18n";
import { CalculatorScreenMobile } from "@/components/aleeqa/calculator-screen-mobile";
import { PricesScreen } from "@/components/aleeqa/prices-screen";
import { RationsScreen } from "@/components/aleeqa/rations-screen";
import { AboutScreen } from "@/components/aleeqa/about-screen";
import { LanguageToggle } from "@/components/aleeqa/language-toggle";
import { ThemeToggle } from "@/components/aleeqa/theme-toggle";
import { ProfileScreen } from "@/components/profile-screen";
import { AdBanner } from "@/components/common/ad-banner";
import { AdSlot, AdSection, AdSocialBar, AdSmartlink } from "@/components/ads";
import { useNetworkStatus } from "@/lib/offline/network";
import { initSyncEngine, syncPendingOps } from "@/lib/offline/sync-engine";
import { getPendingOps } from "@/lib/offline/cache";
import { useAuth } from "@/lib/store/auth-context";
import { fetchPublicSettings } from "@/lib/services/settings";
import { useAppStore } from "@/lib/store/app-store";

type Tab = "calculator" | "prices" | "rations" | "about" | "profile";

interface AppShellProps {
  onHome?: () => void;
  onShowAuth?: () => void;
  onShowAdmin?: () => void;
}

export function AppShell({ onHome, onShowAuth, onShowAdmin }: AppShellProps) {
  const { t, lang } = useLang();
  const isRtl = lang === "ar";
  const [tab, setTab] = useState<Tab>("calculator");
  const online = useNetworkStatus();
  const [pending, setPending] = useState(0);
  const [syncing, setSyncing] = useState(false);
  const { user, isGuest } = useAuth();
  const { setSettings, settings } = useAppStore();

  // Load settings from Supabase on mount (dynamic app settings)
  useEffect(() => {
    fetchPublicSettings().then(setSettings);
    initSyncEngine();
    const interval = setInterval(() => setPending(getPendingOps().length), 2000);
    return () => clearInterval(interval);
  }, [setSettings]);

  // Sync when back online
  useEffect(() => {
    if (online && pending > 0) {
      setSyncing(true);
      syncPendingOps().then(() => {
        setSyncing(false);
        setPending(getPendingOps().length);
      });
    }
  }, [online, pending]);

  // Maintenance mode check (admins bypass)
  const maintenanceMode = settings.maintenance_mode === true && user?.role !== "admin";

  const TABS: { key: Tab; labelKey: string; icon: typeof Calculator }[] = [
    { key: "calculator", labelKey: "nav.calculator", icon: Calculator },
    { key: "prices", labelKey: "nav.prices", icon: Coins },
    { key: "rations", labelKey: "nav.rations", icon: BookMarked },
    { key: "about", labelKey: "nav.about", icon: Info },
    { key: "profile", labelKey: "nav.profile", icon: UserIcon },
  ];

  if (maintenanceMode) {
    return (
      <div className="flex min-h-screen flex-col items-center justify-center bg-muted/30 p-4 text-center">
        <div className="mb-4 flex h-16 w-16 items-center justify-center rounded-2xl bg-amber-100 dark:bg-amber-950">
          <RefreshCw className="h-8 w-8 text-amber-600" />
        </div>
        <h1 className="text-2xl font-black">{t("common.maintenance")}</h1>
        <p className="mt-2 max-w-sm text-sm text-muted-foreground">
          {isRtl
            ? "التطبيق قيد الصيانة حالياً. سنعود قريباً."
            : "The app is under maintenance. We'll be back soon."}
        </p>
      </div>
    );
  }

  return (
    <div className="flex min-h-screen flex-col bg-background">
      {/* Global social bar ad (injected once) */}
      <AdSocialBar />
      {/* Header leaderboard ad (728x90 desktop / 320x50 mobile) */}
      <div className="border-b border-border/40 bg-muted/20 py-2">
        <div className="mx-auto flex max-w-3xl w-full justify-center px-2">
          <AdSlot placement="header" />
        </div>
      </div>
      {/* App header */}
      <header className="sticky top-0 z-40 border-b border-border/70 bg-background/90 backdrop-blur-lg">
        <div className="mx-auto flex h-14 max-w-3xl w-full items-center justify-between gap-3 px-4">
          <button onClick={() => setTab("calculator")} className="flex items-center gap-2">
            <span className="flex h-9 w-9 items-center justify-center rounded-xl bg-gradient-to-br from-primary to-primary/70 text-primary-foreground shadow-sm">
              <Leaf className="h-5 w-5" />
            </span>
            <div className="leading-tight">
              <span className="block text-base font-black text-foreground">{t("common.app_name")}</span>
              <span className="block text-[9px] text-muted-foreground">{t("common.app_sub")}</span>
            </div>
          </button>
          <div className="flex items-center gap-2">
            {onHome && (
              <button
                onClick={onHome}
                className="flex items-center gap-1 rounded-lg border border-border px-2.5 py-1 text-[11px] font-bold text-muted-foreground transition-colors hover:bg-secondary hover:text-foreground"
              >
                <ArrowRight className="h-3.5 w-3.5" />
                {t("common.back_home")}
              </button>
            )}
            <LanguageToggle />
            <ThemeToggle />
            {/* Online/offline + sync indicator */}
            <div
              className={cn(
                "flex items-center gap-1 rounded-full px-2.5 py-1 text-[10px] font-bold",
                online
                  ? "bg-emerald-100 text-emerald-700 dark:bg-emerald-950 dark:text-emerald-400"
                  : "bg-amber-100 text-amber-700 dark:bg-amber-950 dark:text-amber-400"
              )}
            >
              {syncing ? (
                <RefreshCw className="h-3 w-3 animate-spin" />
              ) : online ? (
                <Wifi className="h-3 w-3" />
              ) : (
                <WifiOff className="h-3 w-3" />
              )}
              {syncing
                ? t("common.syncing")
                : online
                ? pending > 0
                  ? t("common.pending")
                  : t("common.online")
                : t("common.offline")}
            </div>
          </div>
        </div>
      </header>

      {/* Content */}
      <main className="mx-auto max-w-3xl w-full flex-1 px-4 pb-24 pt-4">
        {/* Auth gate banner — prompt guests to sign in */}
        {isGuest && tab !== "profile" && (
          <div className="mb-3 flex items-center justify-between gap-2 rounded-xl border border-primary/30 bg-primary/5 p-3">
            <p className="text-xs text-muted-foreground">
              {isRtl
                ? "أنت في وضع الضيف. سجّل الدخول لحفظ بياناتك."
                : "Guest mode. Sign in to sync your data."}
            </p>
            {onShowAuth && (
              <button
                onClick={onShowAuth}
                className="rounded-lg bg-primary px-3 py-1 text-xs font-bold text-primary-foreground"
              >
                {t("common.signin")}
              </button>
            )}
          </div>
        )}

        {/* Dynamic Supabase ad on home/calculator tab */}
        {(tab === "calculator" || tab === "about") && (
          <div className="mb-4">
            <AdBanner placement="home" />
          </div>
        )}

        {tab === "calculator" && <CalculatorScreenMobile />}
        {tab === "prices" && <PricesScreen />}
        {tab === "rations" && <RationsScreen />}
        {tab === "about" && <AboutScreen />}
        {tab === "profile" &&
          (user || isGuest ? (
            <ProfileScreen onAdminClick={onShowAdmin} />
          ) : (
            onShowAuth && <AuthPrompt onShowAuth={onShowAuth} />
          ))}

        {/* In-feed native ad between content and footer */}
        <AdSection placement="in-feed" label="إعلان مموّل" />
        {/* Smartlink CTA */}
        <div className="my-4 flex justify-center">
          <AdSmartlink variant="banner" />
        </div>
      </main>
      {/* Footer banner ad */}
      <div className="border-t border-border/40 bg-muted/20 py-2">
        <div className="mx-auto flex max-w-3xl w-full justify-center px-2">
          <AdSlot placement="footer" />
        </div>
      </div>

      {/* Bottom navigation */}
      <nav className="fixed bottom-0 left-0 right-0 z-40 border-t border-border/70 bg-background/95 backdrop-blur-lg pb-[env(safe-area-inset-bottom)]">
        <div className="mx-auto flex max-w-3xl w-full items-stretch justify-around px-2">
          {TABS.map((tabDef) => {
            const Icon = tabDef.icon;
            const active = tab === tabDef.key;
            return (
              <button
                key={tabDef.key}
                onClick={() => setTab(tabDef.key)}
                className={cn(
                  "relative flex flex-1 flex-col items-center gap-0.5 py-2.5 transition-colors",
                  active ? "text-primary" : "text-muted-foreground hover:text-foreground"
                )}
                aria-label={t(tabDef.labelKey)}
              >
                {active && <span className="absolute -top-px h-0.5 w-10 rounded-full bg-primary" />}
                <Icon className={cn("h-5 w-5 transition-transform", active && "scale-110")} />
                <span className={cn("text-[10px] font-bold", active && "font-extrabold")}>
                  {t(tabDef.labelKey)}
                </span>
              </button>
            );
          })}
        </div>
      </nav>
    </div>
  );
}

function AuthPrompt({ onShowAuth }: { onShowAuth: () => void }) {
  const { t, lang } = useLang();
  const isRtl = lang === "ar";
  return (
    <div className="flex flex-col items-center gap-4 py-16 text-center">
      <div className="flex h-16 w-16 items-center justify-center rounded-2xl bg-primary/10">
        <UserIcon className="h-8 w-8 text-primary" />
      </div>
      <div>
        <h3 className="text-lg font-bold">
          {isRtl ? "سجّل الدخول" : "Sign In"}
        </h3>
        <p className="mt-1 text-sm text-muted-foreground">
          {isRtl
            ? "سجّل الدخول للوصول إلى المفضلة والسجل والإشعارات"
            : "Sign in to access favorites, history, and notifications"}
        </p>
      </div>
      <button
        onClick={onShowAuth}
        className="rounded-xl bg-primary px-6 py-2.5 text-sm font-bold text-primary-foreground"
      >
        {t("common.signin")}
      </button>
    </div>
  );
}
