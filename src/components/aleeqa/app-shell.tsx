"use client";

import { useState } from "react";
import { Calculator, Coins, BookMarked, Info, Leaf, ArrowRight } from "lucide-react";
import { cn } from "@/lib/utils";
import { useLang } from "@/lib/i18n";
import { CalculatorScreenMobile } from "./calculator-screen-mobile";
import { PricesScreen } from "./prices-screen";
import { RationsScreen } from "./rations-screen";
import { AboutScreen } from "./about-screen";
import { LanguageToggle } from "./language-toggle";
import { ThemeToggle } from "./theme-toggle";

type Tab = "calculator" | "prices" | "rations" | "about";

const TABS: { key: Tab; labelKey: string; icon: typeof Calculator }[] = [
  { key: "calculator", labelKey: "nav.calculator", icon: Calculator },
  { key: "prices", labelKey: "nav.prices", icon: Coins },
  { key: "rations", labelKey: "nav.rations", icon: BookMarked },
  { key: "about", labelKey: "nav.about", icon: Info },
];

interface AppShellProps {
  onHome?: () => void;
}

export function AppShell({ onHome }: AppShellProps) {
  const { t } = useLang();
  const [tab, setTab] = useState<Tab>("calculator");

  return (
    <div className="flex min-h-screen flex-col bg-background">
      {/* App header */}
      <header className="sticky top-0 z-40 border-b border-border/70 bg-background/90 backdrop-blur-lg">
        <div className="mx-auto flex h-14 max-w-3xl items-center justify-between gap-3 px-4">
          <button
            onClick={() => setTab("calculator")}
            className="flex items-center gap-2"
          >
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
            <div className="hidden items-center gap-1 rounded-full bg-secondary/70 px-2.5 py-1 text-[10px] text-muted-foreground sm:flex">
              <span className="h-1.5 w-1.5 rounded-full bg-primary" />
              {t("common.offline")}
            </div>
          </div>
        </div>
      </header>

      {/* Content */}
      <main className="mx-auto w-full max-w-3xl flex-1 px-4 pb-24 pt-4">
        {tab === "calculator" && <CalculatorScreenMobile />}
        {tab === "prices" && <PricesScreen />}
        {tab === "rations" && <RationsScreen />}
        {tab === "about" && <AboutScreen />}
      </main>

      {/* Bottom navigation */}
      <nav className="fixed bottom-0 left-0 right-0 z-40 border-t border-border/70 bg-background/95 backdrop-blur-lg pb-[env(safe-area-inset-bottom)]">
        <div className="mx-auto flex max-w-3xl items-stretch justify-around px-2">
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
                {active && (
                  <span className="absolute -top-px h-0.5 w-10 rounded-full bg-primary" />
                )}
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
