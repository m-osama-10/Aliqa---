"use client";

import {
  Wheat,
  Calculator,
  Cpu,
  WifiOff,
  Coins,
  PiggyBank,
  Share2,
  ShieldCheck,
  ArrowLeft,
  Check,
  Sprout,
  Leaf,
  Menu,
  X,
  Info,
} from "lucide-react";
import { useState } from "react";
import { cn } from "@/lib/utils";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { ANIMALS, ANIMAL_ORDER } from "@/lib/feed-data";
import { useLang } from "@/lib/i18n";
import { LanguageToggle } from "./language-toggle";
import { ThemeToggle } from "./theme-toggle";
import { AboutScreen } from "./about-screen";
import { AdSlot, AdSection, AdSocialBar, AdSmartlink } from "@/components/ads";

interface LandingScreenProps {
  onEnter: () => void;
}

export function LandingScreen({ onEnter }: LandingScreenProps) {
  const [menuOpen, setMenuOpen] = useState(false);
  const [aboutOpen, setAboutOpen] = useState(false);
  const { t, lang } = useLang();

  const scrollTo = (id: string) => {
    document.getElementById(id)?.scrollIntoView({ behavior: "smooth", block: "start" });
    setMenuOpen(false);
  };

  return (
    <div className="flex min-h-screen flex-col bg-background">
      {/* Header */}
      <header
        className="sticky top-0 z-50 border-b border-border/70 bg-background/85 backdrop-blur-lg"
      >
        <div className="mx-auto flex h-14 max-w-5xl items-center justify-between gap-3 px-4 sm:px-6">
          <button onClick={() => scrollTo("top")} className="flex items-center gap-2">
            <span className="flex h-9 w-9 items-center justify-center rounded-xl bg-gradient-to-br from-primary to-primary/70 text-primary-foreground shadow-sm">
              <Wheat className="h-5 w-5" />
            </span>
            <div className="leading-tight">
              <span className="block text-base font-black text-foreground">{t("common.app_name")}</span>
              <span className="block text-[9px] text-muted-foreground">{t("common.app_sub")}</span>
            </div>
          </button>

          <nav className="hidden items-center gap-1 md:flex">
            <button onClick={() => scrollTo("why")} className="rounded-lg px-3 py-1.5 text-sm font-medium text-muted-foreground transition-colors hover:bg-secondary hover:text-foreground">
              {t("landing.why.eyebrow")}
            </button>
            <button onClick={() => scrollTo("how")} className="rounded-lg px-3 py-1.5 text-sm font-medium text-muted-foreground transition-colors hover:bg-secondary hover:text-foreground">
              {t("landing.how.eyebrow")}
            </button>
            <button onClick={() => scrollTo("features")} className="rounded-lg px-3 py-1.5 text-sm font-medium text-muted-foreground transition-colors hover:bg-secondary hover:text-foreground">
              {t("landing.features.eyebrow")}
            </button>
          </nav>

          <div className="flex items-center gap-2">
            <Button onClick={() => setAboutOpen(true)} size="sm" variant="outline" className="gap-1.5">
              <Info className="h-4 w-4" />
              <span className="hidden sm:inline">{lang === "ar" ? "حول" : "About"}</span>
            </Button>
            <Button onClick={onEnter} size="sm" className="gap-1.5">
              <Calculator className="h-4 w-4" />
              {t("common.start_calc")}
            </Button>
            <LanguageToggle />
            <ThemeToggle />
            <button
              className="flex h-9 w-9 items-center justify-center rounded-lg border border-border md:hidden"
              onClick={() => setMenuOpen((v) => !v)}
              aria-label={lang === "ar" ? "القائمة" : "Menu"}
            >
              {menuOpen ? <X className="h-4 w-4" /> : <Menu className="h-4 w-4" />}
            </button>
          </div>
        </div>

        {menuOpen && (
          <div className="border-t border-border bg-background md:hidden">
            <nav className="mx-auto flex max-w-5xl flex-col gap-1 px-4 py-2">
              <button onClick={() => scrollTo("why")} className="rounded-lg px-3 py-2 text-right text-sm font-medium text-muted-foreground hover:bg-secondary hover:text-foreground">
                {t("landing.why.eyebrow")}
              </button>
              <button onClick={() => scrollTo("how")} className="rounded-lg px-3 py-2 text-right text-sm font-medium text-muted-foreground hover:bg-secondary hover:text-foreground">
                {t("landing.how.eyebrow")}
              </button>
              <button onClick={() => scrollTo("features")} className="rounded-lg px-3 py-2 text-right text-sm font-medium text-muted-foreground hover:bg-secondary hover:text-foreground">
                {t("landing.features.eyebrow")}
              </button>
            </nav>
          </div>
        )}
      </header>

      <main className="flex-1">
        {/* Global social bar (injected once) */}
        <AdSocialBar />
        {/* Hero */}
        <section id="top" className="relative overflow-hidden bg-hero-glow">
          <div className="absolute inset-0 bg-dots-pattern opacity-40" />
          <div className="relative mx-auto max-w-5xl px-4 py-12 sm:px-6 sm:py-16 lg:py-20">
            <div className="grid items-center gap-8 lg:grid-cols-12">
              <div className="lg:col-span-7">
                <Badge className="mb-4 gap-1.5 border-primary/30 bg-primary/10 text-primary hover:bg-primary/10">
                  <Sprout className="h-3.5 w-3.5" />
                  {t("common.free_offline")}
                </Badge>
                <h1 className="text-balance text-3xl font-black leading-[1.4] text-foreground sm:text-4xl lg:text-5xl">
                  {t("landing.hero.title1")}
                  <br />
                  <span className="text-gradient-green">{t("landing.hero.title2")}</span> {t("landing.hero.title3")}
                </h1>
                <p className="mt-4 max-w-xl text-balance text-sm leading-relaxed text-muted-foreground sm:text-base">
                  {t("landing.hero.desc")}
                </p>

                <div className="mt-6 flex flex-wrap items-center gap-3">
                  <Button onClick={onEnter} size="lg" className="gap-2">
                    <Calculator className="h-4 w-4" />
                    {t("common.start_now")}
                  </Button>
                  <Button onClick={() => scrollTo("why")} size="lg" variant="outline">
                    {t("landing.hero.why_btn")}
                    <ArrowLeft className="h-4 w-4" />
                  </Button>
                </div>

                <div className="mt-8 grid grid-cols-3 gap-2.5">
                  <HeroStat value={lang === "ar" ? "٥" : "5"} label={t("landing.hero.stat_animals")} />
                  <HeroStat value={lang === "ar" ? "٦" : "6"} label={t("landing.hero.stat_ingredients")} />
                  <HeroStat value={t("common.offline")} label={t("landing.hero.stat_offline")} />
                </div>
              </div>

              {/* Phone mockup */}
              <div className="lg:col-span-5">
                <HeroPhoneMockup onEnter={onEnter} />
              </div>
            </div>
          </div>
        </section>

        {/* In-feed ad after hero */}
        <AdSection placement="in-feed" label="إعلان" />

        {/* Animal strip */}
        <section className="border-y border-border/50 bg-secondary/30">
          <div className="mx-auto max-w-5xl px-4 py-4 sm:px-6">
            <p className="mb-2 text-center text-[11px] font-bold text-muted-foreground">
              {t("landing.animals_strip")}
            </p>
            <div className="flex flex-wrap items-center justify-center gap-2">
              {ANIMAL_ORDER.map((key) => {
                const a = ANIMALS[key];
                return (
                  <div
                    key={key}
                    className="flex items-center gap-1.5 rounded-full border border-border/60 bg-card px-3 py-1.5"
                  >
                    <span className="text-lg">{a.emoji}</span>
                    <span className="text-xs font-bold text-foreground">
                      {lang === "ar" ? a.name : a.nameEn}
                    </span>
                  </div>
                );
              })}
            </div>
          </div>
        </section>

        {/* Sidebar + smartlink ad block */}
        <div className="mx-auto flex max-w-5xl flex-col items-center gap-4 px-4 py-8 sm:flex-row sm:justify-center sm:px-6">
          <AdSlot placement="sidebar" />
          <AdSmartlink variant="banner" />
        </div>

        {/* Why use the app */}
        <section id="why" className="scroll-mt-16 py-12 sm:py-16">
          <div className="mx-auto max-w-5xl px-4 sm:px-6">
            <div className="mb-8 text-center">
              <Badge variant="secondary" className="mb-2">{t("landing.why.eyebrow")}</Badge>
              <h2 className="text-balance text-2xl font-black leading-tight text-foreground sm:text-3xl">
                {t("landing.why.title")} <span className="text-gradient-green">{t("landing.why.title_hl")}</span>
              </h2>
              <p className="mx-auto mt-2 max-w-2xl text-balance text-sm text-muted-foreground">
                {t("landing.why.desc")}
              </p>
            </div>

            <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-3">
              <Benefit
                icon={Cpu}
                title={t("landing.why.b1.t")}
                desc={t("landing.why.b1.d")}
              />
              <Benefit
                icon={PiggyBank}
                title={t("landing.why.b2.t")}
                desc={t("landing.why.b2.d")}
                highlight
              />
              <Benefit
                icon={WifiOff}
                title={t("landing.why.b3.t")}
                desc={t("landing.why.b3.d")}
              />
              <Benefit
                icon={Coins}
                title={t("landing.why.b4.t")}
                desc={t("landing.why.b4.d")}
              />
              <Benefit
                icon={Share2}
                title={t("landing.why.b5.t")}
                desc={t("landing.why.b5.d")}
              />
              <Benefit
                icon={ShieldCheck}
                title={t("landing.why.b6.t")}
                desc={t("landing.why.b6.d")}
              />
            </div>
          </div>
        </section>

        {/* In-feed ad between sections */}
        <AdSection placement="in-feed" label="إعلان" />

        {/* How it works */}
        <section id="how" className="scroll-mt-16 bg-secondary/30 py-12 sm:py-16">
          <div className="mx-auto max-w-5xl px-4 sm:px-6">
            <div className="mb-8 text-center">
              <Badge variant="secondary" className="mb-2">{t("landing.how.eyebrow")}</Badge>
              <h2 className="text-balance text-2xl font-black leading-tight text-foreground sm:text-3xl">
                {t("landing.how.title")}
              </h2>
            </div>
            <div className="grid gap-3 sm:grid-cols-3">
              <StepCard
                n={lang === "ar" ? "١" : "1"}
                title={t("landing.how.s1.t")}
                desc={t("landing.how.s1.d")}
              />
              <StepCard
                n={lang === "ar" ? "٢" : "2"}
                title={t("landing.how.s2.t")}
                desc={t("landing.how.s2.d")}
              />
              <StepCard
                n={lang === "ar" ? "٣" : "3"}
                title={t("landing.how.s3.t")}
                desc={t("landing.how.s3.d")}
              />
            </div>
          </div>
        </section>

        {/* In-feed ad + smartlink before Features */}
        <div className="mx-auto max-w-5xl px-4 py-6 sm:px-6">
          <AdSection placement="in-feed" label="إعلان" />
          <div className="mt-4 flex justify-center">
            <AdSmartlink variant="banner" />
          </div>
        </div>

        {/* Features */}
        <section id="features" className="scroll-mt-16 py-12 sm:py-16">
          <div className="mx-auto max-w-5xl px-4 sm:px-6">
            <div className="mb-8 text-center">
              <Badge variant="secondary" className="mb-2">{t("landing.features.eyebrow")}</Badge>
              <h2 className="text-balance text-2xl font-black leading-tight text-foreground sm:text-3xl">
                {t("landing.features.title")}
              </h2>
            </div>
            <div className="grid gap-3 sm:grid-cols-2">
              <FeatureRow
                icon={Calculator}
                title={t("landing.features.f1.t")}
                points={[t("landing.features.f1.p1"), t("landing.features.f1.p2"), t("landing.features.f1.p3")]}
              />
              <FeatureRow
                icon={PiggyBank}
                title={t("landing.features.f2.t")}
                points={[t("landing.features.f2.p1"), t("landing.features.f2.p2"), t("landing.features.f2.p3")]}
              />
              <FeatureRow
                icon={Coins}
                title={t("landing.features.f3.t")}
                points={[t("landing.features.f3.p1"), t("landing.features.f3.p2"), t("landing.features.f3.p3")]}
              />
              <FeatureRow
                icon={Share2}
                title={t("landing.features.f4.t")}
                points={[t("landing.features.f4.p1"), t("landing.features.f4.p2"), t("landing.features.f4.p3")]}
              />
            </div>
          </div>
        </section>

        {/* Final CTA */}
        <section className="py-12 sm:py-16">
          <div className="mx-auto max-w-5xl px-4 sm:px-6">
            <Card className="relative overflow-hidden border-primary/20 bg-gradient-to-br from-primary/8 via-card to-accent/8">
              <div className="absolute inset-0 bg-dots-pattern opacity-30" />
              <CardContent className="relative p-7 text-center sm:p-10">
                <span className="mx-auto mb-3 flex h-12 w-12 items-center justify-center rounded-2xl bg-gradient-to-br from-primary to-primary/70 text-primary-foreground shadow-lg">
                  <Leaf className="h-6 w-6" />
                </span>
                <h2 className="text-balance text-xl font-black text-foreground sm:text-2xl">
                  {t("landing.cta.title")}
                </h2>
                <p className="mx-auto mt-2 max-w-lg text-balance text-sm text-muted-foreground">
                  {t("landing.cta.desc")}
                </p>
                <Button onClick={onEnter} size="lg" className="mt-5 gap-2">
                  <Calculator className="h-4 w-4" />
                  {t("common.start_calc")}
                </Button>
              </CardContent>
            </Card>
          </div>
        </section>

        {/* Footer leaderboard ad */}
        <div className="border-t border-border/40 bg-muted/20 py-3">
          <div className="mx-auto flex max-w-5xl justify-center px-4">
            <AdSlot placement="footer" />
          </div>
        </div>
      </main>

      {/* Footer */}
      <footer className="border-t border-border bg-secondary/40">
        <div className="mx-auto max-w-5xl px-4 py-6 sm:px-6">
          <div className="flex flex-col items-center justify-between gap-3 sm:flex-row">
            <div className="flex items-center gap-2">
              <span className="flex h-8 w-8 items-center justify-center rounded-lg bg-gradient-to-br from-primary to-primary/70 text-primary-foreground">
                <Wheat className="h-4 w-4" />
              </span>
              <div className="text-center sm:text-start">
                <p className="text-sm font-extrabold text-foreground">
                  {t("common.app_name")} · {t("common.app_sub")}
                </p>
                <p className="text-[10px] text-muted-foreground">{t("landing.footer.tagline")}</p>
              </div>
            </div>
            <p className="flex items-center gap-1.5 text-[10px] text-muted-foreground">
              <Leaf className="h-3 w-3 text-primary" />
              {t("landing.footer.offline_note")}
            </p>
          </div>
        </div>
      </footer>

      {/* About Dialog */}
      <Dialog open={aboutOpen} onOpenChange={setAboutOpen}>
        <DialogContent className="max-h-[90vh] max-w-2xl overflow-y-auto p-0">
          <DialogHeader className="sr-only">
            <DialogTitle>{lang === "ar" ? "حول التطبيق" : "About"}</DialogTitle>
          </DialogHeader>
          <div className="p-4">
            <AboutScreen />
          </div>
        </DialogContent>
      </Dialog>
    </div>
  );
}

/* ------------------------------------------------------------------ */

function HeroStat({ value, label }: { value: string; label: string }) {
  return (
    <div className="rounded-2xl border border-border/70 bg-card/80 p-2.5 text-center backdrop-blur">
      <p className="text-xl font-black text-gradient-green">{value}</p>
      <p className="text-[10px] font-bold text-foreground">{label}</p>
    </div>
  );
}

function HeroPhoneMockup({ onEnter }: { onEnter: () => void }) {
  const { t, lang } = useLang();
  // Use a simple lookup for the 4 main ingredients shown in the mockup
  const ingLabels: Record<string, string> = lang === "ar"
    ? { corn: "ذرة", soybean: "صويا", bran: "ردة", hay: "دريس", straw: "تبن", premix: "إضافات" }
    : { corn: "Corn", soybean: "Soybean", bran: "Bran", hay: "Hay", straw: "Straw", premix: "Additives" };
  const ing = (k: string) => ingLabels[k] || k;
  const num = (ar: string, en: string) => (lang === "ar" ? ar : en);
  const dairyCow = lang === "ar" ? ANIMALS.dairy_cow.name : ANIMALS.dairy_cow.nameEn;

  return (
    <div className="relative mx-auto max-w-[260px]">
      {/* floating badges */}
      <div className="absolute -right-4 top-14 z-20 animate-float-slow rounded-2xl border border-border bg-card p-2 shadow-lg">
        <div className="flex items-center gap-1.5">
          <span className="flex h-7 w-7 items-center justify-center rounded-lg bg-[oklch(0.78_0.15_78)] text-white">
            <Wheat className="h-3.5 w-3.5" />
          </span>
          <div>
            <p className="text-[9px] text-muted-foreground">{ing("corn")}</p>
            <p className="text-[11px] font-bold tabular-nums">
              {num("١٢", "12")} {t("common.egp")}
            </p>
          </div>
        </div>
      </div>
      <div
        className="absolute -left-4 bottom-20 z-20 animate-float-slow rounded-2xl border border-border bg-card p-2 shadow-lg"
        style={{ animationDelay: "1.5s" }}
      >
        <div className="flex items-center gap-1.5">
          <span className="flex h-7 w-7 items-center justify-center rounded-lg bg-[oklch(0.6_0.13_140)] text-white">
            <Sprout className="h-3.5 w-3.5" />
          </span>
          <div>
            <p className="text-[9px] text-muted-foreground">{ing("soybean")}</p>
            <p className="text-[11px] font-bold tabular-nums">
              {num("٢٨", "28")} {t("common.egp")}
            </p>
          </div>
        </div>
      </div>

      {/* phone */}
      <button
        onClick={onEnter}
        className="relative block w-full rounded-[2.5rem] border-[6px] border-foreground/90 bg-foreground/90 p-1 text-right shadow-2xl transition-transform hover:scale-[1.02]"
        aria-label={lang === "ar" ? "افتح الحاسبة" : "Open calculator"}
      >
        <div className="overflow-hidden rounded-[2rem] bg-background">
          <div className="flex justify-center py-1.5">
            <div className="h-1.5 w-14 rounded-full bg-foreground/30" />
          </div>
          <div className="space-y-2.5 px-3 pb-4 pt-1">
            <div className="flex items-center justify-between rounded-xl bg-gradient-to-l from-primary to-primary/80 px-3 py-2 text-primary-foreground">
              <div className="flex items-center gap-1.5">
                <Calculator className="h-3.5 w-3.5" />
                <span className="text-[11px] font-bold">{t("common.app_name")}</span>
              </div>
              <span className="text-[8px] opacity-80">{dairyCow}</span>
            </div>

            <div className="grid grid-cols-4 gap-1">
              {["🐄", "🐃", "🐑", "🐔"].map((e, i) => (
                <div
                  key={i}
                  className={cn(
                    "flex justify-center rounded-lg border-2 py-1",
                    i === 0 ? "border-primary bg-primary/10" : "border-border"
                  )}
                >
                  <span className="text-base">{e}</span>
                </div>
              ))}
            </div>

            <div className="rounded-xl border border-border/60 p-2">
              <div className="mb-1 flex justify-between text-[9px]">
                <span className="text-muted-foreground">{t("calc.weight")}</span>
                <span className="font-bold tabular-nums">
                  {num("٥٠٠", "500")} {t("common.kg")}
                </span>
              </div>
              <div className="h-1.5 rounded-full bg-secondary">
                <div className="h-full w-3/4 rounded-full bg-primary" />
              </div>
            </div>

            <div className="space-y-1">
              {[
                { n: ing("corn"), p: num("٣٥٪", "35%"), c: "oklch(0.78 0.15 78)" },
                { n: ing("soybean"), p: num("١٨٪", "18%"), c: "oklch(0.6 0.13 140)" },
                { n: ing("bran"), p: num("١٢٪", "12%"), c: "oklch(0.7 0.1 55)" },
                { n: ing("hay"), p: num("٣٠٪", "30%"), c: "oklch(0.6 0.12 125)" },
              ].map((r) => (
                <div key={r.n} className="flex items-center gap-1.5">
                  <span className="h-2 w-2 rounded-sm" style={{ backgroundColor: r.c }} />
                  <span className="text-[9px] text-foreground">{r.n}</span>
                  <div className="mx-1 h-1 flex-1 rounded-full bg-secondary">
                    <div className="h-full rounded-full" style={{ width: r.p, backgroundColor: r.c }} />
                  </div>
                  <span className="text-[9px] font-bold tabular-nums text-muted-foreground">{r.p}</span>
                </div>
              ))}
            </div>

            <div className="flex items-center justify-between rounded-xl bg-accent/15 px-3 py-1.5">
              <span className="text-[9px] text-muted-foreground">{t("manual.cost_day")}</span>
              <span className="text-xs font-black tabular-nums text-accent-foreground">
                {num("٢١٩", "219")} {t("common.egp")}
              </span>
            </div>
          </div>
        </div>
      </button>
    </div>
  );
}

function Benefit({
  icon: Icon,
  title,
  desc,
  highlight,
}: {
  icon: typeof Cpu;
  title: string;
  desc: string;
  highlight?: boolean;
}) {
  return (
    <Card
      className={cn(
        "group border-border/60 transition-shadow hover:shadow-lg hover:shadow-primary/5",
        highlight && "border-accent/40 bg-accent/5"
      )}
    >
      <CardContent className="p-4">
        <div
          className={cn(
            "mb-2.5 flex h-10 w-10 items-center justify-center rounded-xl transition-colors",
            highlight
              ? "bg-accent text-accent-foreground"
              : "bg-primary/10 text-primary group-hover:bg-primary group-hover:text-primary-foreground"
          )}
        >
          <Icon className="h-5 w-5" />
        </div>
        <p className="mb-1 text-sm font-extrabold text-foreground">{title}</p>
        <p className="text-xs leading-relaxed text-muted-foreground">{desc}</p>
      </CardContent>
    </Card>
  );
}

function StepCard({ n, title, desc }: { n: string; title: string; desc: string }) {
  return (
    <Card className="border-border/60">
      <CardContent className="p-4">
        <span className="mb-2 flex h-9 w-9 items-center justify-center rounded-full bg-primary font-black text-primary-foreground">
          {n}
        </span>
        <p className="text-sm font-extrabold text-foreground">{title}</p>
        <p className="mt-1 text-xs leading-relaxed text-muted-foreground">{desc}</p>
      </CardContent>
    </Card>
  );
}

function FeatureRow({
  icon: Icon,
  title,
  points,
}: {
  icon: typeof Calculator;
  title: string;
  points: string[];
}) {
  return (
    <Card className="border-border/60">
      <CardContent className="p-4">
        <div className="mb-2 flex items-center gap-2">
          <span className="flex h-9 w-9 items-center justify-center rounded-lg bg-primary/10 text-primary">
            <Icon className="h-4.5 w-4.5" />
          </span>
          <p className="text-sm font-extrabold text-foreground">{title}</p>
        </div>
        <ul className="space-y-1.5">
          {points.map((p) => (
            <li key={p} className="flex items-start gap-1.5 text-xs text-muted-foreground">
              <Check className="mt-0.5 h-3 w-3 shrink-0 text-primary" />
              {p}
            </li>
          ))}
        </ul>
      </CardContent>
    </Card>
  );
}
