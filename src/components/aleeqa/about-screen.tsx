"use client";

import {
  Calculator,
  WifiOff,
  Cpu,
  Coins,
  ShieldCheck,
  Leaf,
  Smartphone,
  Github,
  Facebook,
  Linkedin,
  Phone,
  Users,
  GraduationCap,
  UserCircle,
} from "lucide-react";
import { Card, CardContent } from "@/components/ui/card";
import { Separator } from "@/components/ui/separator";
import { Badge } from "@/components/ui/badge";
import { INGREDIENTS, INGREDIENT_ORDER } from "@/lib/feed-data";
import { useLang } from "@/lib/i18n";
import { AdSection, AdSmartlink } from "@/components/ads";

const INGREDIENT_EMOJI: Record<string, string> = {
  corn: "🌽",
  soybean: "🫘",
  bran: "🌾",
  hay: "🌿",
  straw: "🐄",
  premix: "💊",
};

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

  const stepNum = (n: number) => (lang === "ar" ? ["١", "٢", "٣", "٤", "٥"][n - 1] : String(n));

  return (
    <div className="space-y-4">
      {/* Team & Developers Section — FIRST */}
      <Card className="overflow-hidden border-primary/20">
        <div className="bg-gradient-to-l from-primary to-primary/80 px-4 py-4 text-primary-foreground">
          <div className="flex items-center gap-2">
            <Users className="h-5 w-5" />
            <h2 className="text-lg font-black">
              {lang === "ar" ? "فريق العمل" : "Our Team"}
            </h2>
          </div>
          <p className="mt-0.5 text-xs text-primary-foreground/80">
            {lang === "ar"
              ? "خريجو كلية الزراعة — جامعة أسيوط 2018م"
              : "Faculty of Agriculture graduates — Assiut University 2018"}
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
                    // eslint-disable-next-line @next/next/no-img-element
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
          icon={WifiOff}
          title={t("about.f2.t")}
          desc={t("about.f2.d")}
        />
        <Feature
          icon={Coins}
          title={t("about.f3.t")}
          desc={t("about.f3.d")}
        />
        <Feature
          icon={Smartphone}
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
            {INGREDIENT_ORDER.map((k) => (
              <Badge key={k} variant="secondary">
                {INGREDIENT_EMOJI[k]} {lang === "ar" ? INGREDIENTS[k].name : INGREDIENTS[k].nameEn}
              </Badge>
            ))}
          </div>
          <p className="mt-3 text-[11px] leading-relaxed text-muted-foreground">
            {t("about.targets_title")}:{" "}
            {lang === "ar"
              ? "البقرة الحلوب (بروتين ١٤٪، طاقة ٦٣٪) — جاموس حلوب (بروتين ١٣٪، طاقة ٦٤٪) — جاموس تسمين (بروتين ١٢٪، طاقة ٦٦٪) — عجول تسمين (بروتين ١٦٪، طاقة ٦٨٪) — الأغنام (بروتين ١٣٪، طاقة ٦٥٪) — الدجاج البياض (بروتين ١٦.٥٪، طاقة ٦٦٪) — أمهات بياض (بروتين ١٧٪، طاقة ٦٨٪) — دجاج التسمين (بروتين ٢١٪، طاقة ٧٠٪) — كتاكيت البادي (بروتين ٢٣٪، طاقة ٧٢٪). للدواجن يمكنك تحديد عدد الطيور في القطيع لحساب التكلفة الإجمالية."
              : "Dairy cow (protein 14%, energy 63%) — Dairy buffalo (protein 13%, energy 64%) — Fattening buffalo (protein 12%, energy 66%) — Fattening calf (protein 16%, energy 68%) — Sheep (protein 13%, energy 65%) — Layer chicken (protein 16.5%, energy 66%) — Layer breeder (protein 17%, energy 68%) — Broiler (protein 21%, energy 70%) — Broiler starter (protein 23%, energy 72%). For poultry you can set the flock size to compute the total cost."}
          </p>
        </CardContent>
      </Card>

      <div className="flex items-center justify-center gap-2 py-2 text-center">
        <Calculator className="h-4 w-4 text-primary" />
        <p className="text-[11px] text-muted-foreground">
          {t("about.version")}
        </p>
      </div>

      {/* Ad at the bottom of about screen */}
      <AdSection placement="in-feed" label="إعلان" />
      <div className="flex justify-center">
        <AdSmartlink variant="banner" />
      </div>
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
