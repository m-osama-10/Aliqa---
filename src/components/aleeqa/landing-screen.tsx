"use client";

import {
  Wheat,
  Calculator,
  Cpu,
  Coins,
  PiggyBank,
  Share2,
  ShieldCheck,
  ArrowLeft,
  Sprout,
  Leaf,
  Menu,
  X,
  Info,
  Sparkles,
  SlidersHorizontal,
  GitCompare,
  FileText,
  Layers,
  BookOpen,
  ArrowRight,
  Beef,
  ListChecks,
  Wrench,
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
import { AdSlot, AdSection, DelayedAd } from "@/components/ads";

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
            <button onClick={() => scrollTo("tools")} className="rounded-lg px-3 py-1.5 text-sm font-medium text-muted-foreground transition-colors hover:bg-secondary hover:text-foreground">
              {lang === "ar" ? "الأدوات" : "Tools"}
            </button>
            <a href="/knowledge" className="flex items-center gap-1 rounded-lg px-3 py-1.5 text-sm font-medium text-muted-foreground transition-colors hover:bg-secondary hover:text-foreground">
              <BookOpen className="h-3.5 w-3.5" />
              {lang === "ar" ? "المعرفة" : "Knowledge"}
            </a>
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
              <button onClick={() => scrollTo("tools")} className="rounded-lg px-3 py-2 text-right text-sm font-medium text-muted-foreground hover:bg-secondary hover:text-foreground">
                {lang === "ar" ? "الأدوات" : "Tools"}
              </button>
              <a href="/knowledge" className="flex items-center gap-1.5 rounded-lg px-3 py-2 text-right text-sm font-medium text-muted-foreground hover:bg-secondary hover:text-foreground">
                <BookOpen className="h-4 w-4" />
                {lang === "ar" ? "مركز المعرفة" : "Knowledge Center"}
              </a>
            </nav>
          </div>
        )}
      </header>

      <main className="flex-1">
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
                  <HeroStat value={lang === "ar" ? "٩" : "9"} label={t("landing.hero.stat_animals")} />
                  <HeroStat value={lang === "ar" ? "٢٢" : "22"} label={t("landing.hero.stat_ingredients")} />
                  <HeroStat value={lang === "ar" ? "مجاني" : "Free"} label={lang === "ar" ? "بلا تسجيل" : "No sign-up"} />
                </div>
              </div>

              {/* Phone mockup */}
              <div className="lg:col-span-5">
                <HeroPhoneMockup onEnter={onEnter} />
              </div>
            </div>
          </div>
        </section>

        {/* In-feed ad after hero (delayed — no immediate popup) */}
        <DelayedAd delayMs={10000}>
          <AdSection placement="in-feed" label={t("common.ad")} />
        </DelayedAd>

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

        {/* Delayed sidebar ad (was intrusive smartlink+sidebar block) */}
        <DelayedAd delayMs={12000}>
          <div className="mx-auto flex max-w-5xl flex-col items-center gap-4 px-4 py-8 sm:flex-row sm:justify-center sm:px-6">
            <AdSlot placement="sidebar" />
          </div>
        </DelayedAd>

        {/* Merged: Why use the app + Features (one unified section) */}
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
              <FeatureCard icon={Calculator} title={t("landing.features.f1.t")} desc={t("landing.features.f1.d")} color="primary" />
              <FeatureCard icon={Layers} title={t("landing.features.f2.t")} desc={t("landing.features.f2.d")} color="blue" />
              <FeatureCard icon={SlidersHorizontal} title={t("landing.features.f3.t")} desc={t("landing.features.f3.d")} color="amber" />
              <FeatureCard icon={Sparkles} title={t("landing.features.f4.t")} desc={t("landing.features.f4.d")} color="emerald" />
              <FeatureCard icon={PiggyBank} title={t("landing.features.f5.t")} desc={t("landing.features.f5.d")} color="emerald" />
              <FeatureCard icon={Coins} title={t("landing.features.f6.t")} desc={t("landing.features.f6.d")} color="amber" />
              <FeatureCard icon={GitCompare} title={t("landing.features.f7.t")} desc={t("landing.features.f7.d")} color="purple" />
              <FeatureCard icon={Share2} title={t("landing.features.f8.t")} desc={t("landing.features.f8.d")} color="rose" />
              <FeatureCard icon={FileText} title={t("landing.features.f9.t")} desc={t("landing.features.f9.d")} color="primary" />
            </div>
          </div>
        </section>

        {/* In-feed ad between sections (delayed) */}
        <DelayedAd delayMs={10000}>
          <AdSection placement="in-feed" label={t("common.ad")} />
        </DelayedAd>

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

        {/* Tools section — 2×3 grid of platform tools */}
        <section id="tools" className="scroll-mt-16 py-12 sm:py-16">
          <div className="mx-auto max-w-5xl px-4 sm:px-6">
            <div className="mb-8 text-center">
              <Badge className="mb-2 gap-1.5 border-primary/30 bg-primary/10 text-primary hover:bg-primary/10">
                <Wrench className="h-3.5 w-3.5" />
                {lang === "ar" ? "الأدوات" : "Tools"}
              </Badge>
              <h2 className="text-balance text-2xl font-black leading-tight text-foreground sm:text-3xl">
                {lang === "ar" ? "أدوات المنصة المتكاملة" : "Platform Tools"}
              </h2>
              <p className="mx-auto mt-2 max-w-2xl text-balance text-sm text-muted-foreground">
                {lang === "ar"
                  ? "كل ما تحتاجه لإدارة تغذية حيواناتك في مكان واحد — أدلة، حاسبات، ومقالات احترافية."
                  : "Everything you need to manage your animals' nutrition — guides, calculators, and professional articles."}
              </p>
            </div>

            <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-3">
              {/* Nutrition Guide */}
              <a href="/nutrition" className="group rounded-2xl border border-border/60 bg-card p-5 transition-all hover:border-primary/40 hover:shadow-lg">
                <div className="mb-3 flex h-12 w-12 items-center justify-center rounded-xl bg-gradient-to-br from-primary/15 to-primary/5 text-primary transition-transform group-hover:scale-110">
                  <BookOpen className="h-6 w-6" />
                </div>
                <h3 className="mb-1 text-sm font-extrabold text-foreground">
                  {lang === "ar" ? "دليل التغذية" : "Nutrition Guide"}
                </h3>
                <p className="text-xs leading-relaxed text-muted-foreground">
                  {lang === "ar" ? "الأهداف الغذائية لكل حيوان، فئات المكوّنات، والمفاهيم الأساسية." : "Nutritional targets per animal, ingredient categories, and key concepts."}
                </p>
              </a>

              {/* Ingredients */}
              <a href="/ingredients" className="group rounded-2xl border border-border/60 bg-card p-5 transition-all hover:border-primary/40 hover:shadow-lg">
                <div className="mb-3 flex h-12 w-12 items-center justify-center rounded-xl bg-gradient-to-br from-amber-500/15 to-amber-500/5 text-amber-600 transition-transform group-hover:scale-110">
                  <Wheat className="h-6 w-6" />
                </div>
                <h3 className="mb-1 text-sm font-extrabold text-foreground">
                  {lang === "ar" ? "المواد الخام" : "Ingredients"}
                </h3>
                <p className="text-xs leading-relaxed text-muted-foreground">
                  {lang === "ar" ? "٢٢ مكوّن بتفاصيل كاملة: قيم غذائية، حدود، مميزات، عيوب، وبدائل." : "22 ingredients with full details: nutrition, bounds, pros, cons, and alternatives."}
                </p>
              </a>

              {/* Compare */}
              <a href="/compare" className="group rounded-2xl border border-border/60 bg-card p-5 transition-all hover:border-primary/40 hover:shadow-lg">
                <div className="mb-3 flex h-12 w-12 items-center justify-center rounded-xl bg-gradient-to-br from-emerald-500/15 to-emerald-500/5 text-emerald-600 transition-transform group-hover:scale-110">
                  <GitCompare className="h-6 w-6" />
                </div>
                <h3 className="mb-1 text-sm font-extrabold text-foreground">
                  {lang === "ar" ? "مقارنة المواد" : "Compare Ingredients"}
                </h3>
                <p className="text-xs leading-relaxed text-muted-foreground">
                  {lang === "ar" ? "قارن مادتين جنباً إلى جنب: البروتين، الطاقة، السعر، والتوصيات." : "Compare two ingredients side by side: protein, energy, price, and recommendations."}
                </p>
              </a>

              {/* Livestock Cost Calculator */}
              <a href="/livestock-cost-calculator" className="group rounded-2xl border border-border/60 bg-card p-5 transition-all hover:border-primary/40 hover:shadow-lg">
                <div className="mb-3 flex h-12 w-12 items-center justify-center rounded-xl bg-gradient-to-br from-purple-500/15 to-purple-500/5 text-purple-600 transition-transform group-hover:scale-110">
                  <Beef className="h-6 w-6" />
                </div>
                <h3 className="mb-1 text-sm font-extrabold text-foreground">
                  {lang === "ar" ? "حاسبة التربية" : "Cost Calculator"}
                </h3>
                <p className="text-xs leading-relaxed text-muted-foreground">
                  {lang === "ar" ? "احسب تكلفة التربية كاملة: العلف، الشراء، الربح، نقطة التعادل، والعائد." : "Calculate full breeding cost: feed, purchase, profit, break-even, and ROI."}
                </p>
              </a>

              {/* Knowledge Center */}
              <a href="/knowledge" className="group rounded-2xl border border-border/60 bg-card p-5 transition-all hover:border-primary/40 hover:shadow-lg">
                <div className="mb-3 flex h-12 w-12 items-center justify-center rounded-xl bg-gradient-to-br from-primary/15 to-primary/5 text-primary transition-transform group-hover:scale-110">
                  <BookOpen className="h-6 w-6" />
                </div>
                <h3 className="mb-1 text-sm font-extrabold text-foreground">
                  {lang === "ar" ? "مركز المعرفة" : "Knowledge Center"}
                </h3>
                <p className="text-xs leading-relaxed text-muted-foreground">
                  {lang === "ar" ? "٢٨ مقال احترافي عن تغذية الأبقار والجاموس والأغنام والدواجن." : "28 professional articles on cattle, buffalo, sheep, and poultry nutrition."}
                </p>
              </a>

              {/* Calculator */}
              <button onClick={onEnter} className="group rounded-2xl border border-border/60 bg-card p-5 text-start transition-all hover:border-primary/40 hover:shadow-lg">
                <div className="mb-3 flex h-12 w-12 items-center justify-center rounded-xl bg-gradient-to-br from-primary/15 to-primary/5 text-primary transition-transform group-hover:scale-110">
                  <Calculator className="h-6 w-6" />
                </div>
                <h3 className="mb-1 text-sm font-extrabold text-foreground">
                  {lang === "ar" ? "حاسبة العليقة" : "Feed Calculator"}
                </h3>
                <p className="text-xs leading-relaxed text-muted-foreground">
                  {lang === "ar" ? "احسب أرخص عليقة متوازنة في ٦ خطوات بمحرك برمجة خطية." : "Calculate the cheapest balanced ration in 6 steps with an LP engine."}
                </p>
              </button>
            </div>
          </div>
        </section>

        {/* Knowledge Center — prominent section */}
        <section id="knowledge" className="scroll-mt-16 bg-secondary/30 py-12 sm:py-16">
          <div className="mx-auto max-w-5xl px-4 sm:px-6">
            <div className="mb-8 text-center">
              <Badge className="mb-2 gap-1.5 border-primary/30 bg-primary/10 text-primary hover:bg-primary/10">
                <BookOpen className="h-3.5 w-3.5" />
                {lang === "ar" ? "مركز المعرفة" : "Knowledge Center"}
              </Badge>
              <h2 className="text-balance text-2xl font-black leading-tight text-foreground sm:text-3xl">
                {lang === "ar" ? "تعلّم كيف تربي وتغذّي حيواناتك صح" : "Learn to raise and feed your animals right"}
              </h2>
              <p className="mx-auto mt-2 max-w-2xl text-balance text-sm text-muted-foreground">
                {lang === "ar"
                  ? "مقالات احترافية عن تغذية الأبقار والجاموس والأغنام والدواجن، شرح المواد الخام، نصائح للمربين، وأخطاء شائعة يجب تجنبها."
                  : "Professional articles on cattle, buffalo, sheep, and poultry nutrition, ingredient guides, farmer tips, and common mistakes to avoid."}
              </p>
            </div>

            {/* Article category cards */}
            <div className="mb-6 grid gap-3 sm:grid-cols-2 lg:grid-cols-4">
              <a href="/knowledge" className="group rounded-xl border border-border/60 bg-card p-4 transition-all hover:border-primary/40 hover:shadow-md">
                <div className="mb-2 flex items-center gap-2">
                  <span className="text-2xl">🐄</span>
                  <span className="text-sm font-bold text-foreground">{lang === "ar" ? "تغذية الأبقار" : "Cattle"}</span>
                </div>
                <p className="text-xs text-muted-foreground">{lang === "ar" ? "أساسيات ومتطلبات الأبقار الحلوب" : "Dairy cow nutrition basics"}</p>
              </a>
              <a href="/knowledge" className="group rounded-xl border border-border/60 bg-card p-4 transition-all hover:border-primary/40 hover:shadow-md">
                <div className="mb-2 flex items-center gap-2">
                  <span className="text-2xl">🐃</span>
                  <span className="text-sm font-bold text-foreground">{lang === "ar" ? "تغذية الجاموس" : "Buffalo"}</span>
                </div>
                <p className="text-xs text-muted-foreground">{lang === "ar" ? "احتياجات الجاموس الحلوب والتسمين" : "Buffalo nutrition guide"}</p>
              </a>
              <a href="/knowledge" className="group rounded-xl border border-border/60 bg-card p-4 transition-all hover:border-primary/40 hover:shadow-md">
                <div className="mb-2 flex items-center gap-2">
                  <span className="text-2xl">🐔</span>
                  <span className="text-sm font-bold text-foreground">{lang === "ar" ? "تغذية الدواجن" : "Poultry"}</span>
                </div>
                <p className="text-xs text-muted-foreground">{lang === "ar" ? "تركيب علائق البياض والتسمين" : "Layer & broiler formulation"}</p>
              </a>
              <a href="/knowledge" className="group rounded-xl border border-border/60 bg-card p-4 transition-all hover:border-primary/40 hover:shadow-md">
                <div className="mb-2 flex items-center gap-2">
                  <span className="text-2xl">💡</span>
                  <span className="text-sm font-bold text-foreground">{lang === "ar" ? "نصائح وأخطاء" : "Tips & Mistakes"}</span>
                </div>
                <p className="text-xs text-muted-foreground">{lang === "ar" ? "نصائح للمربين وأخطاء شائعة" : "Farmer tips and common mistakes"}</p>
              </a>
            </div>

            {/* CTA button */}
            <div className="flex justify-center">
              <a href="/knowledge">
                <Button size="lg" className="gap-2">
                  <BookOpen className="h-4 w-4" />
                  {lang === "ar" ? "استكشف مركز المعرفة" : "Browse Articles"}
                  <ArrowRight className="h-4 w-4" />
                </Button>
              </a>
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

        {/* Footer leaderboard ad (delayed) */}
        <DelayedAd delayMs={15000}>
          <div className="border-t border-border/40 bg-muted/20 py-3">
            <div className="mx-auto flex max-w-5xl justify-center px-4">
              <AdSlot placement="footer" />
            </div>
          </div>
        </DelayedAd>
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
          {/* Content page links */}
          <div className="mt-4 flex flex-wrap items-center justify-center gap-x-3 gap-y-1 border-t border-border/40 pt-3 text-[11px]">
            <a href="/guide" className="text-muted-foreground transition-colors hover:text-primary">
              {lang === "ar" ? "دليل الاستخدام" : "User Guide"}
            </a>
            <span className="text-muted-foreground/40">·</span>
            <a href="/nutrition" className="text-muted-foreground transition-colors hover:text-primary">
              {lang === "ar" ? "دليل التغذية" : "Nutrition Guide"}
            </a>
            <span className="text-muted-foreground/40">·</span>
            <a href="/knowledge" className="text-muted-foreground transition-colors hover:text-primary">
              {lang === "ar" ? "مركز المعرفة" : "Knowledge Center"}
            </a>
            <span className="text-muted-foreground/40">·</span>
            <a href="/ingredients" className="text-muted-foreground transition-colors hover:text-primary">
              {lang === "ar" ? "المواد الخام" : "Ingredients"}
            </a>
            <span className="text-muted-foreground/40">·</span>
            <a href="/compare" className="text-muted-foreground transition-colors hover:text-primary">
              {lang === "ar" ? "مقارنة المواد" : "Compare"}
            </a>
            <span className="text-muted-foreground/40">·</span>
            <a href="/livestock-cost-calculator" className="text-muted-foreground transition-colors hover:text-primary">
              {lang === "ar" ? "حاسبة التربية" : "Cost Calculator"}
            </a>
            <span className="text-muted-foreground/40">·</span>
            <a href="/faq" className="text-muted-foreground transition-colors hover:text-primary">
              {lang === "ar" ? "الأسئلة الشائعة" : "FAQ"}
            </a>
            <span className="text-muted-foreground/40">·</span>
            <a href="/privacy" className="text-muted-foreground transition-colors hover:text-primary">
              {lang === "ar" ? "سياسة الخصوصية" : "Privacy Policy"}
            </a>
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

function FeatureCard({
  icon: Icon,
  title,
  desc,
  color = "primary",
}: {
  icon: typeof Calculator;
  title: string;
  desc: string;
  color?: "primary" | "amber" | "emerald" | "purple" | "blue" | "rose";
}) {
  const colorMap = {
    primary: "from-primary/15 to-primary/5 text-primary",
    amber: "from-amber-500/15 to-amber-500/5 text-amber-600",
    emerald: "from-emerald-500/15 to-emerald-500/5 text-emerald-600",
    purple: "from-purple-500/15 to-purple-500/5 text-purple-600",
    blue: "from-blue-500/15 to-blue-500/5 text-blue-600",
    rose: "from-rose-500/15 to-rose-500/5 text-rose-600",
  };
  return (
    <Card className="group border-border/60 transition-all hover:border-primary/40 hover:shadow-md">
      <CardContent className="p-4">
        <div className="mb-2 flex items-center gap-2">
          <span className={`flex h-10 w-10 items-center justify-center rounded-xl bg-gradient-to-br ${colorMap[color]} transition-transform group-hover:scale-110`}>
            <Icon className="h-5 w-5" />
          </span>
        </div>
        <p className="mb-1 text-sm font-extrabold text-foreground">{title}</p>
        <p className="text-xs leading-relaxed text-muted-foreground">{desc}</p>
      </CardContent>
    </Card>
  );
}
