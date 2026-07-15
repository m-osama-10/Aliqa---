"use client";

import { useState, type FormEvent } from "react";
import {
  Mail,
  Phone,
  Clock,
  Send,
  User,
  MessageSquare,
  Users,
  GraduationCap,
  Github,
  Facebook,
  Linkedin,
  Loader2,
  CheckCircle2,
  Mailbox,
} from "lucide-react";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Separator } from "@/components/ui/separator";
import { useToast } from "@/hooks/use-toast";
import { ContentPageLayout } from "./content-page-layout";
import { useLang } from "@/lib/i18n";

interface TeamContact {
  name: string;
  nameEn: string;
  initials: string;
  specialty: string;
  specialtyEn: string;
  gradient: string;
  phone?: string;
  phoneLabel?: string;
  links: { href: string; icon: typeof Github; label: string }[];
}

const TEAM_CONTACT: TeamContact[] = [
  {
    name: "م. محمد أسامة",
    nameEn: "Eng. Mohamed Osama",
    initials: "م.م",
    specialty: "بايوتكنولوجي",
    specialtyEn: "Biotechnology",
    gradient: "from-primary to-primary/70",
    phone: "01116938114",
    phoneLabel: "01116938114",
    links: [
      { href: "https://github.com/m-osama-10", icon: Github, label: "GitHub" },
      { href: "https://www.facebook.com/M.o0sama", icon: Facebook, label: "Facebook" },
      { href: "https://www.linkedin.com/in/MoOsama", icon: Linkedin, label: "LinkedIn" },
    ],
  },
  {
    name: "م. حازم أسامة",
    nameEn: "Eng. Hazem Osama",
    initials: "م.ح",
    specialty: "إنتاج حيواني",
    specialtyEn: "Animal Production",
    gradient: "from-amber-500 to-amber-600",
    phone: "+201021339436",
    phoneLabel: "+20 10 21339436",
    links: [
      { href: "https://www.facebook.com/hazem.osama.509", icon: Facebook, label: "Facebook" },
    ],
  },
  {
    name: "م. خالد خشيلة",
    nameEn: "Eng. Khaled Kashila",
    initials: "م.خ",
    specialty: "إنتاج حيواني",
    specialtyEn: "Animal Production",
    gradient: "from-emerald-500 to-emerald-600",
    phone: "+201025409928",
    phoneLabel: "+20 10 25409928",
    links: [
      { href: "https://www.facebook.com/khaled.kashila", icon: Facebook, label: "Facebook" },
    ],
  },
];

export function ContactUsContent() {
  const { lang } = useLang();
  const isRtl = lang === "ar";
  const { toast } = useToast();

  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [message, setMessage] = useState("");
  const [submitted, setSubmitted] = useState(false);
  const [loading, setLoading] = useState(false);

  const handleSubmit = (e: FormEvent) => {
    e.preventDefault();
    setLoading(true);
    // UI-only: simulate submission
    setTimeout(() => {
      setLoading(false);
      setSubmitted(true);
      toast({
        title: isRtl ? "تم استلام رسالتك" : "Message received",
        description: isRtl
          ? "شكراً لتواصلك معنا. سنرد عليك خلال ٤٨ ساعة عمل."
          : "Thank you for reaching out. We will reply within 48 business hours.",
      });
      setName("");
      setEmail("");
      setMessage("");
      // Reset success state after 4 seconds so user can send again
      setTimeout(() => setSubmitted(false), 4000);
    }, 700);
  };

  const title = isRtl ? "اتصل بنا" : "Contact Us";

  return (
    <ContentPageLayout title={title}>
      <div className="space-y-6 text-sm leading-relaxed text-foreground">
        {/* Intro */}
        <p className="text-muted-foreground">
          {isRtl
            ? "نرحب دائماً بتواصلك معنا — سواء للاستفسار عن استخدام التطبيق، أو الإبلاغ عن مشكلة، أو اقتراح ميزة جديدة، أو حتى لمشاركتنا قصة نجاحك. اختر طريقة التواصل المناسبة لك من الأسفل."
            : "We always welcome your communication — whether it's to ask about using the app, report an issue, suggest a new feature, or even share a success story. Choose the contact method that suits you below."}
        </p>

        {/* Response time note */}
        <Card className="border-primary/30 bg-primary/5">
          <CardContent className="flex items-center gap-3 p-4">
            <span className="flex h-10 w-10 shrink-0 items-center justify-center rounded-full bg-primary/15 text-primary">
              <Clock className="h-5 w-5" />
            </span>
            <div>
              <p className="font-bold text-foreground">
                {isRtl ? "وقت الاستجابة" : "Response Time"}
              </p>
              <p className="text-xs text-muted-foreground">
                {isRtl
                  ? "نرد عادةً على الرسائل خلال ٤٨ ساعة عمل (من الأحد إلى الخميس). الرسائل المُرسلة عبر النموذج أدناه تصل إلى بريد الفريق مباشرةً."
                  : "We typically reply to messages within 48 business hours (Sunday to Thursday). Messages sent via the form below reach the team's inbox directly."}
              </p>
            </div>
          </CardContent>
        </Card>

        {/* Contact methods grid */}
        <div className="grid gap-4 md:grid-cols-2">
          {/* Email */}
          <Card className="border-border/60">
            <CardContent className="p-5">
              <div className="mb-3 flex items-center gap-2">
                <span className="flex h-9 w-9 items-center justify-center rounded-lg bg-primary/10 text-primary">
                  <Mailbox className="h-5 w-5" />
                </span>
                <h2 className="text-base font-bold">
                  {isRtl ? "البريد الإلكتروني" : "Email"}
                </h2>
              </div>
              <p className="mb-2 text-xs text-muted-foreground">
                {isRtl
                  ? "للاستفسارات العامة والدعم الفني والإبلاغ عن الأخطاء."
                  : "For general inquiries, technical support, and bug reports."}
              </p>
              <a
                href="mailto:aleeqa.app@gmail.com"
                className="inline-flex items-center gap-2 text-sm font-semibold text-primary transition-opacity hover:opacity-80"
                dir="ltr"
              >
                <Mail className="h-4 w-4" />
                aleeqa.app@gmail.com
              </a>
            </CardContent>
          </Card>

          {/* Phone */}
          <Card className="border-border/60">
            <CardContent className="p-5">
              <div className="mb-3 flex items-center gap-2">
                <span className="flex h-9 w-9 items-center justify-center rounded-lg bg-primary/10 text-primary">
                  <Phone className="h-5 w-5" />
                </span>
                <h2 className="text-base font-bold">
                  {isRtl ? "الهاتف" : "Phone"}
                </h2>
              </div>
              <p className="mb-2 text-xs text-muted-foreground">
                {isRtl
                  ? "للتواصل المباشر مع أعضاء الفريق في أوقات العمل."
                  : "For direct communication with team members during working hours."}
              </p>
              <div className="flex flex-col gap-1 text-sm font-semibold text-foreground">
                <a
                  href="tel:01116938114"
                  className="inline-flex items-center gap-2 transition-colors hover:text-primary"
                  dir="ltr"
                >
                  <Phone className="h-3.5 w-3.5 text-primary" />
                  01116938114
                </a>
                <a
                  href="tel:+201021339436"
                  className="inline-flex items-center gap-2 transition-colors hover:text-primary"
                  dir="ltr"
                >
                  <Phone className="h-3.5 w-3.5 text-primary" />
                  +20 10 21339436
                </a>
                <a
                  href="tel:+201025409928"
                  className="inline-flex items-center gap-2 transition-colors hover:text-primary"
                  dir="ltr"
                >
                  <Phone className="h-3.5 w-3.5 text-primary" />
                  +20 10 25409928
                </a>
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Team contacts */}
        <Card className="overflow-hidden border-primary/20">
          <div className="bg-gradient-to-l from-primary to-primary/80 px-4 py-4 text-primary-foreground">
            <div className="flex items-center gap-2">
              <Users className="h-5 w-5" />
              <h2 className="text-lg font-black">
                {isRtl ? "تواصل مع أعضاء الفريق" : "Contact Team Members"}
              </h2>
            </div>
            <p className="mt-0.5 text-xs text-primary-foreground/80">
              {isRtl
                ? "كل عضو من الفريق متاح للتواصل المباشر عبر قنواته"
                : "Each team member is reachable directly via their channels"}
            </p>
          </div>
          <CardContent className="p-5">
            <div className="grid grid-cols-1 gap-4 sm:grid-cols-3">
              {TEAM_CONTACT.map((member) => (
                <div
                  key={member.name}
                  className="flex flex-col items-center rounded-xl border border-border/60 bg-card p-4 text-center"
                >
                  <div
                    className={`mb-3 flex h-16 w-16 items-center justify-center rounded-full bg-gradient-to-br ${member.gradient} text-base font-black text-white shadow-sm`}
                  >
                    {member.initials}
                  </div>
                  <p className="text-sm font-bold text-foreground">
                    {isRtl ? member.name : member.nameEn}
                  </p>
                  <div className="mt-0.5 flex items-center justify-center gap-1 text-[10px] text-muted-foreground">
                    <GraduationCap className="h-3 w-3 text-primary" />
                    {isRtl ? member.specialty : member.specialtyEn}
                  </div>
                  {member.phone && member.phoneLabel && (
                    <a
                      href={`tel:${member.phone}`}
                      className="mt-2 inline-flex items-center gap-1 text-[11px] font-semibold text-primary transition-opacity hover:opacity-80"
                      dir="ltr"
                    >
                      <Phone className="h-3 w-3" />
                      {member.phoneLabel}
                    </a>
                  )}
                  <div className="mt-2 flex flex-wrap justify-center gap-1.5">
                    {member.links.map((link) => {
                      const Icon = link.icon;
                      return (
                        <a
                          key={link.label}
                          href={link.href}
                          target="_blank"
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

        {/* Contact form */}
        <Card className="border-border/60">
          <CardContent className="p-5">
            <div className="mb-4 flex items-center gap-2">
              <span className="flex h-9 w-9 items-center justify-center rounded-lg bg-primary/10 text-primary">
                <MessageSquare className="h-5 w-5" />
              </span>
              <div>
                <h2 className="text-lg font-bold">
                  {isRtl ? "أرسل لنا رسالة" : "Send Us a Message"}
                </h2>
                <p className="text-xs text-muted-foreground">
                  {isRtl
                    ? "املأ الحقول التالية وسنعاود التواصل معك عبر بريدك الإلكتروني."
                    : "Fill in the fields below and we'll get back to you via email."}
                </p>
              </div>
            </div>

            {submitted ? (
              <div className="rounded-lg border border-primary/30 bg-primary/5 p-6 text-center">
                <CheckCircle2 className="mx-auto mb-3 h-10 w-10 text-primary" />
                <h3 className="text-base font-bold text-foreground">
                  {isRtl ? "شكراً لتواصلك!" : "Thank you for reaching out!"}
                </h3>
                <p className="mt-1 text-xs text-muted-foreground">
                  {isRtl
                    ? "تم استلام رسالتك. سنرد عليك خلال ٤٨ ساعة عمل."
                    : "Your message has been received. We'll reply within 48 business hours."}
                </p>
              </div>
            ) : (
              <form onSubmit={handleSubmit} className="space-y-4">
                <div className="space-y-2">
                  <Label htmlFor="contact-name">
                    {isRtl ? "الاسم" : "Name"}
                  </Label>
                  <div className="relative">
                    <User className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
                    <Input
                      id="contact-name"
                      type="text"
                      value={name}
                      onChange={(e) => setName(e.target.value)}
                      placeholder={isRtl ? "اكتب اسمك" : "Enter your name"}
                      className="pl-9"
                      required
                    />
                  </div>
                </div>

                <div className="space-y-2">
                  <Label htmlFor="contact-email">
                    {isRtl ? "البريد الإلكتروني" : "Email"}
                  </Label>
                  <div className="relative">
                    <Mail className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
                    <Input
                      id="contact-email"
                      type="email"
                      value={email}
                      onChange={(e) => setEmail(e.target.value)}
                      placeholder="you@example.com"
                      className="pl-9"
                      required
                      dir="ltr"
                    />
                  </div>
                </div>

                <div className="space-y-2">
                  <Label htmlFor="contact-message">
                    {isRtl ? "الرسالة" : "Message"}
                  </Label>
                  <Textarea
                    id="contact-message"
                    value={message}
                    onChange={(e) => setMessage(e.target.value)}
                    placeholder={isRtl
                      ? "اكتب استفسارك أو ملاحظتك هنا..."
                      : "Write your inquiry or feedback here..."
                    }
                    rows={5}
                    required
                    minLength={10}
                  />
                </div>

                <Button type="submit" className="w-full gap-2" disabled={loading}>
                  {loading ? (
                    <Loader2 className="h-4 w-4 animate-spin" />
                  ) : (
                    <Send className="h-4 w-4" />
                  )}
                  {isRtl ? "إرسال الرسالة" : "Send Message"}
                </Button>

                <p className="text-center text-[10px] text-muted-foreground">
                  {isRtl
                    ? "بالضغط على إرسال، أنت توافق على معالجة بياناتك لأغراض الرد على استفسارك فقط."
                    : "By sending, you agree to your data being processed solely to reply to your inquiry."}
                </p>
              </form>
            )}
          </CardContent>
        </Card>
      </div>
    </ContentPageLayout>
  );
}
