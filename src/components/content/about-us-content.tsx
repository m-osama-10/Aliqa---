"use client";

import {
  Leaf,
  Target,
  Eye,
  Cpu,
  ShieldCheck,
  Users,
  GraduationCap,
  Github,
  Facebook,
  Linkedin,
  Phone,
  Sparkles,
  MapPin,
  Wheat,
} from "lucide-react";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Separator } from "@/components/ui/separator";
import { ContentPageLayout } from "./content-page-layout";
import { useLang } from "@/lib/i18n";

interface TeamMember {
  name: string;
  nameEn: string;
  initials: string;
  specialty: string;
  specialtyEn: string;
  gradient: string;
  links: { href: string; icon: typeof Github; label: string }[];
}

const TEAM: TeamMember[] = [
  {
    name: "م. محمد أسامة",
    nameEn: "Eng. Mohamed Osama",
    initials: "م.م",
    specialty: "بايوتكنولوجي",
    specialtyEn: "Biotechnology",
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
    nameEn: "Eng. Hazem Osama",
    initials: "م.ح",
    specialty: "إنتاج حيواني",
    specialtyEn: "Animal Production",
    gradient: "from-amber-500 to-amber-600",
    links: [
      { href: "https://www.facebook.com/hazem.osama.509", icon: Facebook, label: "Facebook" },
      { href: "tel:+201021339436", icon: Phone, label: "+20 10 21339436" },
    ],
  },
  {
    name: "م. خالد خشيلة",
    nameEn: "Eng. Khaled Kashila",
    initials: "م.خ",
    specialty: "إنتاج حيواني",
    specialtyEn: "Animal Production",
    gradient: "from-emerald-500 to-emerald-600",
    links: [
      { href: "https://www.facebook.com/khaled.kashila", icon: Facebook, label: "Facebook" },
      { href: "tel:+201025409928", icon: Phone, label: "+20 10 25409928" },
    ],
  },
];

export function AboutUsContent() {
  const { lang } = useLang();
  const isRtl = lang === "ar";

  const title = isRtl ? "من نحن" : "About Us";

  return (
    <ContentPageLayout title={title}>
      <div className="space-y-6 text-sm leading-relaxed text-foreground">
        {/* Intro hero */}
        <Card className="overflow-hidden border-primary/20">
          <div className="bg-gradient-to-l from-primary to-primary/80 px-4 py-5 text-primary-foreground">
            <div className="flex items-center gap-3">
              <span className="flex h-12 w-12 items-center justify-center rounded-2xl bg-white/15 backdrop-blur">
                <Leaf className="h-6 w-6" />
              </span>
              <div>
                <h2 className="text-xl font-black">
                  {isRtl ? "عليقة — حاسبة العليقة الذكية" : "Aleeqa — Smart Feed Calculator"}
                </h2>
                <p className="text-xs text-primary-foreground/80">
                  {isRtl
                    ? "أداة تقنية مجانية لخدمة المربي المصري"
                    : "A free technical tool serving Egyptian farmers"}
                </p>
              </div>
            </div>
          </div>
          <CardContent className="space-y-3 p-5">
            <p>
              {isRtl
                ? "نحن فريق \"عليقة\" — مجموعة من المهندسين المصريين الشباب المتخصصين في الإنتاج الحيواني والبايوتكنولوجي، اجتمعنا على هدف واحد: تقديم أداة تقنية حديثة ومجانية تساعد مربي الأبقار والجاموس والأغنام والدواجن في مصر على تركيب العلائق الغذائية بدقة علمية وبأقل تكلفة ممكنة. انطلقنا من ملاحظة حقيقية بسيطة: كثير من المربين في الريف المصري يعتمدون على الخبرة التقليدية في تكوين العليقة، وهذا قد يُكلّفهم أكثر من اللازم أو يحرم الحيوان من احتياجاته الغذائية الأساسية."
                : "We are the \"Aleeqa\" team — a group of young Egyptian engineers specializing in animal production and biotechnology, united by one goal: to provide a modern, free technical tool that helps Egyptian breeders of cattle, buffalo, sheep, and poultry formulate feed rations with scientific precision and at the lowest possible cost. We started from a simple real-world observation: many farmers in rural Egypt still rely on traditional experience to mix rations, which can either cost them more than necessary or deprive their animals of essential nutritional requirements."}
            </p>
            <p>
              {isRtl
                ? "صمّمنا \"عليقة\" لتعمل أوفلاين بالكامل على أي جهاز، ولتستخدم خوارزمية البرمجة الخطية (Linear Programming — Simplex) في إيجاد أرخص تركيبة علف تلبي احتياجات الحيوان من البروتين والطاقة والألياف، مع احترام الحدود الدنيا والعليا لكل مادة خام. لا نطلب تسجيلاً ولا بيانات شخصية لاستخدام الحاسبة، وكل بيانات المستخدم تُخزَّن محلياً على جهازه فقط."
                : "We designed \"Aleeqa\" to work fully offline on any device, using the Linear Programming (Simplex) algorithm to find the cheapest feed mix that meets the animal's protein, energy, and fiber requirements, while respecting the minimum and maximum bounds of each raw ingredient. We do not require registration or personal data to use the calculator, and all user data is stored locally on their device only."}
            </p>
          </CardContent>
        </Card>

        {/* Mission */}
        <Card className="border-border/60">
          <CardContent className="p-5">
            <div className="mb-3 flex items-center gap-2">
              <span className="flex h-9 w-9 items-center justify-center rounded-lg bg-primary/10 text-primary">
                <Target className="h-5 w-5" />
              </span>
              <h2 className="text-lg font-bold">
                {isRtl ? "رسالتنا" : "Our Mission"}
              </h2>
            </div>
            <p>
              {isRtl
                ? "تمكين كل مربٍّ مصري — صغيراً كان أم كبيراً — من الوصول إلى أداة احترافية لتركيب العلائق، تُقدّم له أفضل توازن غذائي بأقل تكلفة، وتعمل في الحقل بدون إنترنت. نؤمن بأن التكنولوجيا يجب أن تصل إلى أبعد نقطة في الريف المصري، وأن تكون مجانية وسهلة الاستخدام لكل من يحتاجها."
                : "Empower every Egyptian breeder — small or large — to access a professional ration formulation tool that delivers the best nutritional balance at the lowest cost, and that works in the field without internet. We believe technology must reach the furthest corners of rural Egypt, and that it must be free and easy to use for anyone who needs it."}
            </p>
            <p className="mt-2">
              {isRtl
                ? "نهدف عبر هذه الأداة إلى رفع كفاءة الإنتاج الحيواني المصري، وتقليل الهدر في تكاليف التغذية التي تمثّل النسبة الأكبر من تكاليف التربية، ومساعدة المربي على اتخاذ قرارات مبنية على أرقام علمية بدلاً من التخمين."
                : "Through this tool we aim to raise the efficiency of Egyptian animal production, reduce waste in feeding costs (which represent the largest share of breeding expenses), and help breeders make decisions based on scientific numbers rather than guesswork."}
            </p>
          </CardContent>
        </Card>

        {/* Vision */}
        <Card className="border-border/60">
          <CardContent className="p-5">
            <div className="mb-3 flex items-center gap-2">
              <span className="flex h-9 w-9 items-center justify-center rounded-lg bg-primary/10 text-primary">
                <Eye className="h-5 w-5" />
              </span>
              <h2 className="text-lg font-bold">
                {isRtl ? "رؤيتنا للزراعة المصرية" : "Our Vision for Egyptian Agriculture"}
              </h2>
            </div>
            <p>
              {isRtl
                ? "نحلم بقطاع إنتاج حيواني مصري تنافسي، ينتج البروتين الحيواني بكفاءة عالية وبتكلفة عقلانية، ويقلّل من فجوة الاستيراد. نرى أن الطريق إلى هذا يبدأ من تزويد المربي بأدوات بسيطة وذكية تساعده على التحكم في تكلفة العليقة وجودتها، وهي التكلفة التي تتجاوز ٧٠٪ من إجمالي تكلفة الإنتاج."
                : "We dream of a competitive Egyptian animal production sector that produces animal protein efficiently and at a rational cost, narrowing the import gap. We see the path starting with equipping the farmer with simple, smart tools that help control the cost and quality of the ration — a cost that exceeds 70% of total production cost."}
            </p>
            <p className="mt-2">
              {isRtl
                ? "نسعى لأن تكون \"عليقة\" منصةً تجمع المعرفة العلمية بالخبرة الميدانية، وتطوّر محتواها باستمرار ليتناسب مع احتياجات المربي المصري وأسعار السوق المحلي، ولتكون مرجعاً موثوقاً لكل من يعمل في الإنتاج الحيواني في مصر والوطن العربي."
                : "We strive for \"Aleeqa\" to be a platform that bridges scientific knowledge with field experience, continuously evolving its content to match the needs of the Egyptian farmer and local market prices, and to be a trusted reference for everyone working in animal production in Egypt and the Arab world."}
            </p>
          </CardContent>
        </Card>

        <Separator />

        {/* Team */}
        <Card className="overflow-hidden border-primary/20">
          <div className="bg-gradient-to-l from-primary to-primary/80 px-4 py-4 text-primary-foreground">
            <div className="flex items-center gap-2">
              <Users className="h-5 w-5" />
              <h2 className="text-lg font-black">
                {isRtl ? "فريق العمل" : "Our Team"}
              </h2>
            </div>
            <p className="mt-0.5 text-xs text-primary-foreground/80">
              {isRtl
                ? "مهندسون مصريون شغوفون بالإنتاج الحيواني والتقنية"
                : "Egyptian engineers passionate about animal production and technology"}
            </p>
          </div>
          <CardContent className="p-5">
            <div className="grid grid-cols-1 gap-4 sm:grid-cols-3">
              {TEAM.map((member) => (
                <div
                  key={member.name}
                  className="flex flex-col items-center rounded-xl border border-border/60 bg-card p-4 text-center"
                >
                  <div
                    className={`mb-3 flex h-20 w-20 items-center justify-center rounded-full bg-gradient-to-br ${member.gradient} text-xl font-black text-white shadow-sm`}
                  >
                    {member.initials}
                  </div>
                  <p className="text-sm font-bold text-foreground">
                    {isRtl ? member.name : member.nameEn}
                  </p>
                  <div className="mt-1 flex items-center justify-center gap-1 text-[11px] text-muted-foreground">
                    <GraduationCap className="h-3.5 w-3.5 text-primary" />
                    {isRtl ? member.specialty : member.specialtyEn}
                  </div>
                  <div className="mt-3 flex flex-wrap justify-center gap-1.5">
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
                          className="flex h-8 w-8 items-center justify-center rounded-lg border border-border/60 text-muted-foreground transition-colors hover:border-primary hover:bg-primary/10 hover:text-primary"
                        >
                          <Icon className="h-4 w-4" />
                        </a>
                      );
                    })}
                  </div>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>

        {/* Technology */}
        <Card className="border-border/60">
          <CardContent className="p-5">
            <div className="mb-3 flex items-center gap-2">
              <span className="flex h-9 w-9 items-center justify-center rounded-lg bg-primary/10 text-primary">
                <Cpu className="h-5 w-5" />
              </span>
              <h2 className="text-lg font-bold">
                {isRtl ? "التقنيات المستخدمة" : "Technology We Use"}
              </h2>
            </div>
            <p className="mb-3">
              {isRtl
                ? "يقوم محرك الحساب في \"عليقة\" على ركيزتين علميتين أساسيتين، تم اختيارهما بعناية لضمان دقة النتائج وسرعتها:"
                : "The calculation engine in \"Aleeqa\" stands on two core scientific pillars, chosen carefully to ensure result accuracy and speed:"}
            </p>
            <div className="space-y-3">
              <div className="rounded-lg border border-border/60 bg-secondary/30 p-3">
                <p className="mb-1 flex items-center gap-2 font-bold text-foreground">
                  <Sparkles className="h-4 w-4 text-primary" />
                  {isRtl ? "محلل البرمجة الخطية (LP — Simplex)" : "Linear Programming Solver (Simplex)"}
                </p>
                <p className="text-xs text-muted-foreground">
                  {isRtl
                    ? "خوارزمية رياضية تبحث عن الحل الأمثل (الأرخص) ضمن مجموعة من القيود الغذائية. عند إدخال الأسعار والأهداف الغذائية، يبحث المحلل عن التركيبة الأقل تكلفة التي تحقق متطلبات البروتين والطاقة والألياف مع احترام الحدود القصوى والدنيا لكل مكوّن. هذه هي الطريقة نفسها المستخدمة في برامج تركيب العلائق الاحترافية حول العالم."
                    : "A mathematical algorithm that searches for the optimal (cheapest) solution within a set of nutritional constraints. Given prices and nutritional targets, the solver finds the lowest-cost mix that meets protein, energy, and fiber requirements while respecting the upper and lower bounds of each ingredient. This is the same method used in professional feed formulation software worldwide."}
                </p>
              </div>
              <div className="rounded-lg border border-border/60 bg-secondary/30 p-3">
                <p className="mb-1 flex items-center gap-2 font-bold text-foreground">
                  <ShieldCheck className="h-4 w-4 text-primary" />
                  {isRtl ? "معايير NRC (المجلس القومي للبحث الأمريكي)" : "NRC Standards (National Research Council)"}
                </p>
                <p className="text-xs text-muted-foreground">
                  {isRtl
                    ? "الأهداف الغذائية للحيوانات في التطبيق مبنية على معايير NRC المعتمدة عالمياً، مع تعديلات لتلائم ظروف السوق المصري وأنواع الأعلاف المتوفرة محلياً. تشمل الأهداف: البروتين الخام (CP)، مجموع العناصر الغذائية المهضومة (TDN)، الألياف الخام (CF)، الدهون (EE)، الكالسيوم (Ca)، الفسفور (P)، والمادة الجافة (DM)."
                    : "The nutritional targets for animals in the app are based on the globally-recognized NRC standards, with adjustments to fit Egyptian market conditions and locally available feed types. Targets include: Crude Protein (CP), Total Digestible Nutrients (TDN), Crude Fiber (CF), Ether Extract (EE), Calcium (Ca), Phosphorus (P), and Dry Matter (DM)."}
                </p>
              </div>
            </div>
            <div className="mt-4 flex flex-wrap gap-1.5">
              <Badge variant="secondary">
                <Wheat className="ml-1 h-3 w-3" />
                {isRtl ? "٢٢ مكوّن علف" : "22 feed ingredients"}
              </Badge>
              <Badge variant="secondary">
                <MapPin className="ml-1 h-3 w-3" />
                {isRtl ? "أسعار السوق المصري" : "Egyptian market prices"}
              </Badge>
              <Badge variant="secondary">
                <Cpu className="ml-1 h-3 w-3" />
                {isRtl ? "يعمل أوفلاين" : "Works offline"}
              </Badge>
              <Badge variant="secondary">
                <Users className="ml-1 h-3 w-3" />
                {isRtl ? "٩ أنواع حيوانات" : "9 animal types"}
              </Badge>
            </div>
          </CardContent>
        </Card>

        {/* Closing */}
        <Card className="border-border/60 bg-secondary/30">
          <CardContent className="p-5">
            <div className="mb-2 flex items-center gap-2">
              <Leaf className="h-4 w-4 text-primary" />
              <p className="text-sm font-extrabold text-foreground">
                {isRtl ? "كلمة أخيرة" : "A Final Word"}
              </p>
            </div>
            <p className="text-xs leading-relaxed text-muted-foreground">
              {isRtl
                ? "نؤمن أن نجاح المربي المصري هو نجاح لمشروعنا. لذلك نلتزم بتطوير \"عليقة\" باستمرار، والإصغاء لملاحظاتكم واقتراحاتكم. لا تترددوا في التواصل معنا عبر صفحة \"اتصل بنا\" بأي ملاحظة أو اقتراح لتطوير التطبيق — فكل ملاحظة من الميدان تساعدنا على تحسين الأداة لتخدمكم بشكل أفضل."
                : "We believe the success of the Egyptian farmer is the success of our project. We are committed to continuously developing \"Aleeqa\" and listening to your feedback and suggestions. Do not hesitate to reach out via the \"Contact Us\" page with any remark or suggestion to improve the app — every field note helps us refine the tool to serve you better."}
            </p>
          </CardContent>
        </Card>
      </div>
    </ContentPageLayout>
  );
}
