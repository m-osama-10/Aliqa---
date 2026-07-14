"use client";

import {
  Calculator,
  Cpu,
  SlidersHorizontal,
  Sparkles,
  GitCompare,
  ShieldCheck,
  Leaf,
  Github,
  Facebook,
  Linkedin,
  Phone,
  Users,
  GraduationCap,
} from "lucide-react";
import { Card, CardContent } from "@/components/ui/card";
import { Separator } from "@/components/ui/separator";
import { Badge } from "@/components/ui/badge";
import { DEFAULT_INGREDIENTS } from "@/lib/ingredient-db";
import { useLang } from "@/lib/i18n";
import { AdSection, DelayedAd } from "@/components/ads";

interface TeamMember {
  name: string;
  initials: string;
  specialty: string;
  gradient: string;
  photo?: string; // placeholder for personal photo
  links: { href: string; icon: typeof Github; label: string }[];
}

const TEAM: TeamMember[] = [
  {
    name: "م. محمد أسامة",
    initials: "م.م",
    specialty: "بايوتكنولوجي",
    gradient: "from-primary to-primary/70",
    links: [
      { href: "https://github.com/m-osama-10", icon: Github, label: "GitHub" },
      { href: "https://www.facebook.com/M.o0sama", icon: Facebook, label: "Facebook" },
      { href: "https://www.linkedin.com/in/MoOsama", icon: Linkedin, label: "LinkedIn" },
      { href: "tel:01116938114", icon: Phone, label: "01116938114" },
    ],
  },
  {
    name: "م. حازم أسامة",
    initials: "م.ح",
    specialty: "إنتاج حيواني",
    gradient: "from-amber-500 to-amber-600",
    links: [
      { href: "https://www.facebook.com/hazem.osama.509", icon: Facebook, label: "Facebook" },
      { href: "tel:+201021339436", icon: Phone, label: "+20 10 21339436" },
    ],
  },
  {
    name: "م. خالد خشيلة",
    initials: "م.خ",
    specialty: "إنتاج حيواني",
    gradient: "from-emerald-500 to-emerald-600",
    links: [
      { href: "https://www.facebook.com/khaled.kashila", icon: Facebook, label: "Facebook" },
      { href: "tel:+201025409928", icon: Phone, label: "+20 10 25409928" },
    ],
  },
];

export function AboutScreen() {
  const { t, lang } = useLang();

  const stepNum = (n: number) => (lang === "ar" ? ["١", "٢", "٣", "٤", "٥", "٦"][n - 1] : String(n));

  return (
    <div className="space-y-4">
      {/* Team & Developers Section — FIRST */}
      <Card className="overflow-hidden border-primary/20">
        <div className="bg-gradient-to-l from-primary to-primary/80 px-4 py-4 text-primary-foreground">
          <div className="flex items-center gap-2">
            <Users className="h-5 w-5" />
            <h2 className="text-lg font-black">
              {t("about.team_title")}
            </h2>
          </div>
          <p className="mt-0.5 text-xs text-primary-foreground/80">
            {t("about.team_subtitle")}
          </p>
        </div>
        <CardContent className="p-4">
          <div className="grid grid-cols-1 gap-3 sm:grid-cols-3">
            {TEAM.map((member) => (
              <div
                key={member.name}
                className="flex flex-col items-center rounded-xl border border-border/60 bg-card p-3 text-center"
              >
                {/* Photo placeholder */}
                <div
                  className={`mb-2 flex h-16 w-16 items-center justify-center rounded-full bg-gradient-to-br ${member.gradient} text-lg font-black text-white shadow-sm`}
                >
                  {member.photo ? (
                    <img
                      src={member.photo}
                      alt={member.name}
                      className="h-16 w-16 rounded-full object-cover"
                    />
                  ) : (
                    member.initials
                  )}
                </div>
                <p className="text-sm font-bold text-foreground">{member.name}</p>
                <div className="mt-0.5 flex items-center justify-center gap-1 text-[10px] text-muted-foreground">
                  <GraduationCap className="h-3 w-3 text-primary" />
                  {member.specialty}
                </div>
                {/* Social links */}
                <div className="mt-2 flex flex-wrap justify-center gap-1">
                  {member.links.map((link) => {
                    const Icon = link.icon;
                    const isPhone = link.href.startsWith("tel:");
                    return (
                      <a
                        key={link.label}
                        href={link.href}
                        target={isPhone ? "_self" : "_blank"}
                        rel="noopener noreferrer"
                        title={link.label}
                        className="flex h-7 w-7 items-center justify-center rounded-lg border border-border/60 text-muted-foreground transition-colors hover:border-primary hover:bg-primary/10 hover:text-primary"
                      >
                        <Icon className="h-3.5 w-3.5" />
                      </a>
                    );
                  })}
                </div>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>

      <Separator />

      {/* App info card */}
      <Card className="overflow-hidden border-primary/20">
        <div className="bg-gradient-to-l from-primary to-primary/80 px-4 py-5 text-primary-foreground">
          <div className="flex items-center gap-3">
            <span className="flex h-12 w-12 items-center justify-center rounded-2xl bg-white/15 backdrop-blur">
              <Leaf className="h-6 w-6" />
            </span>
            <div>
              <h2 className="text-xl font-black">{t("common.app_name")}</h2>
              <p className="text-xs text-primary-foreground/80">{t("about.tagline")}</p>
            </div>
          </div>
        </div>
        <CardContent className="space-y-2 p-4 text-sm leading-relaxed text-foreground">
          <p>
            {t("about.intro")}
          </p>
        </CardContent>
      </Card>

      <div className="grid gap-3 sm:grid-cols-2">
        <Feature
          icon={Cpu}
          title={t("about.f1.t")}
          desc={t("about.f1.d")}
        />
        <Feature
          icon={SlidersHorizontal}
          title={t("about.f2.t")}
          desc={t("about.f2.d")}
        />
        <Feature
          icon={Sparkles}
          title={t("about.f3.t")}
          desc={t("about.f3.d")}
        />
        <Feature
          icon={GitCompare}
          title={t("about.f4.t")}
          desc={t("about.f4.d")}
        />
      </div>

      <Card className="border-border/60">
        <CardContent className="space-y-3 p-4">
          <p className="text-sm font-extrabold text-foreground">{t("about.how_title")}</p>
          <ol className="space-y-2.5 text-xs leading-relaxed text-muted-foreground">
            <Step n={stepNum(1)} text={t("about.step1")} />
            <Step n={stepNum(2)} text={t("about.step2")} />
            <Step n={stepNum(3)} text={t("about.step3")} />
            <Step n={stepNum(4)} text={t("about.step4")} />
            <Step n={stepNum(5)} text={t("about.step5")} />
            <Step n={stepNum(6)} text={t("about.step6")} />
          </ol>
        </CardContent>
      </Card>

      <Card className="border-border/60">
        <CardContent className="p-4">
          <div className="mb-2 flex items-center gap-2">
            <ShieldCheck className="h-4 w-4 text-primary" />
            <p className="text-sm font-extrabold text-foreground">{t("about.disclaimer_title")}</p>
          </div>
          <p className="text-[11px] leading-relaxed text-muted-foreground">
            {t("about.disclaimer")}
          </p>
        </CardContent>
      </Card>

      <Card className="border-border/60 bg-secondary/30">
        <CardContent className="p-4">
          <p className="mb-2 text-sm font-extrabold text-foreground">{t("about.components_title")}</p>
          <div className="flex flex-wrap gap-1.5">
            {DEFAULT_INGREDIENTS.map((ing) => (
              <Badge key={ing.key} variant="secondary">
                {ing.emoji} {lang === "ar" ? ing.name : ing.nameEn}
              </Badge>
            ))}
          </div>
          <p className="mt-3 text-[11px] leading-relaxed text-muted-foreground">
            {t("about.targets_title")}:{" "}
            {t("about.targets_summary")}
          </p>
        </CardContent>
      </Card>

      <div className="flex items-center justify-center gap-2 py-2 text-center">
        <Calculator className="h-4 w-4 text-primary" />
        <p className="text-[11px] text-muted-foreground">
          {t("about.version")}
        </p>
      </div>

      {/* Ad at the bottom of about screen (delayed) */}
      <DelayedAd delayMs={10000}>
        <AdSection placement="in-feed" label={t("common.ad")} />
        <div className="flex justify-center">
          <AdSection placement="in-feed" label={t("common.ad")} />
        </div>
      </DelayedAd>

      {/* Content page links */}
      <Card className="border-border/40 bg-secondary/20">
        <CardContent className="p-3">
          <div className="flex flex-wrap items-center justify-center gap-x-3 gap-y-1 text-[11px]">
            <a href="/guide" className="text-muted-foreground transition-colors hover:text-primary">
              {lang === "ar" ? "📖 دليل الاستخدام" : "📖 User Guide"}
            </a>
            <span className="text-muted-foreground/40">·</span>
            <a href="/nutrition" className="text-muted-foreground transition-colors hover:text-primary">
              {lang === "ar" ? "🌿 دليل التغذية" : "🌿 Nutrition Guide"}
            </a>
            <span className="text-muted-foreground/40">·</span>
            <a href="/faq" className="text-muted-foreground transition-colors hover:text-primary">
              {lang === "ar" ? "❓ الأسئلة الشائعة" : "❓ FAQ"}
            </a>
            <span className="text-muted-foreground/40">·</span>
            <a href="/privacy" className="text-muted-foreground transition-colors hover:text-primary">
              {lang === "ar" ? "🔒 سياسة الخصوصية" : "🔒 Privacy Policy"}
            </a>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}

function Feature({
  icon: Icon,
  title,
  desc,
}: {
  icon: typeof Calculator;
  title: string;
  desc: string;
}) {
  return (
    <Card className="border-border/60">
      <CardContent className="p-4">
        <div className="mb-2 flex h-9 w-9 items-center justify-center rounded-lg bg-primary/10 text-primary">
          <Icon className="h-4.5 w-4.5" />
        </div>
        <p className="text-sm font-bold text-foreground">{title}</p>
        <p className="mt-1 text-xs leading-relaxed text-muted-foreground">{desc}</p>
      </CardContent>
    </Card>
  );
}

function Step({ n, text }: { n: string; text: string }) {
  return (
    <li className="flex items-start gap-2.5">
      <span className="flex h-5 w-5 shrink-0 items-center justify-center rounded-full bg-primary text-[10px] font-black text-primary-foreground">
        {n}
      </span>
      <span>{text}</span>
    </li>
  );
}
