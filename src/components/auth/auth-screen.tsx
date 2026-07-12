"use client";

import { useState, type FormEvent } from "react";
import {
  Wheat,
  Mail,
  Lock,
  User,
  Eye,
  EyeOff,
  Loader2,
  ArrowRight,
  ArrowLeft,
  ShieldCheck,
  WifiOff,
  KeyRound,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Card, CardContent } from "@/components/ui/card";
import { Checkbox } from "@/components/ui/checkbox";
import { useToast } from "@/hooks/use-toast";
import { signIn, signUp, resetPassword } from "@/lib/services/auth";
import { useAuthStore } from "@/lib/store/auth-store";
import { IS_SUPABASE_CONFIGURED } from "@/lib/supabase/client";
import { useLang } from "@/lib/i18n";
import { LanguageToggle } from "@/components/aleeqa/language-toggle";
import { ThemeToggle } from "@/components/aleeqa/theme-toggle";
import { AdSlot, AdSmartlink } from "@/components/ads";

type Mode = "login" | "register" | "forgot";

interface AuthScreenProps {
  onSuccess: () => void;
  onBack?: () => void;
}

export function AuthScreen({ onSuccess, onBack }: AuthScreenProps) {
  const [mode, setMode] = useState<Mode>("login");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [fullName, setFullName] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [remember, setRemember] = useState(true);
  const [loading, setLoading] = useState(false);
  const [resetSent, setResetSent] = useState(false);
  const { toast } = useToast();
  const { setGuest, setRememberMe } = useAuthStore();
  const { t, lang } = useLang();
  const isRtl = lang === "ar";
  const ArrowBack = isRtl ? ArrowRight : ArrowLeft;

  const handleSubmit = async (e: FormEvent) => {
    e.preventDefault();
    if (!IS_SUPABASE_CONFIGURED) {
      toast({
        title: isRtl ? "غير متصل بقاعدة البيانات" : "Database not connected",
        description: isRtl
          ? "يمكنك استخدام وضع الضيف مؤقتاً أو تشغيل سكربت SQL في Supabase."
          : "Use guest mode temporarily or run the SQL migration in Supabase.",
        variant: "destructive",
      });
      return;
    }

    setLoading(true);
    try {
      if (mode === "login") {
        setRememberMe(remember);
        await signIn({ email, password });
        toast({
          title: isRtl ? "أهلاً بعودتك!" : "Welcome back!",
          description: isRtl ? "تم تسجيل الدخول بنجاح" : "Signed in successfully",
        });
        onSuccess();
      } else if (mode === "register") {
        setRememberMe(remember);
        await signUp({ email, password, fullName });
        toast({
          title: isRtl ? "تم إنشاء الحساب" : "Account created",
          description: isRtl
            ? "تحقق من بريدك لتأكيد الحساب، ثم سجّل الدخول."
            : "Check your email to confirm, then sign in.",
        });
        setMode("login");
      } else if (mode === "forgot") {
        await resetPassword(email);
        setResetSent(true);
      }
    } catch (err) {
      const msg = err instanceof Error ? err.message : String(err);
      toast({
        title: isRtl ? "حدث خطأ" : "An error occurred",
        description: msg,
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  };

  const handleGuest = () => {
    setGuest(true);
    toast({
      title: isRtl ? "وضع الضيف" : "Guest mode",
      description: isRtl
        ? "يمكنك التصفح بدون حساب. سيتم حفظ بياناتك محلياً."
        : "Browse without an account. Data saved locally.",
    });
    onSuccess();
  };

  return (
    <div className="relative flex min-h-screen flex-col items-center justify-center overflow-hidden bg-gradient-to-b from-emerald-50 via-background to-background p-4 dark:from-emerald-950/30">
      {/* decorative blobs */}
      <div className="pointer-events-none absolute -top-24 -right-24 h-72 w-72 rounded-full bg-primary/10 blur-3xl" />
      <div className="pointer-events-none absolute -bottom-24 -left-24 h-72 w-72 rounded-full bg-emerald-500/10 blur-3xl" />

      <div className="absolute right-4 top-4 flex items-center gap-2">
        <LanguageToggle />
        <ThemeToggle />
      </div>

      {onBack && (
        <button
          onClick={onBack}
          className="absolute left-4 top-4 flex h-9 w-9 items-center justify-center rounded-lg border border-border bg-background/80 backdrop-blur"
          aria-label={isRtl ? "رجوع" : "Back"}
        >
          <ArrowBack className="h-4 w-4" />
        </button>
      )}

      <div className="relative z-10 w-full max-w-md">
        {/* Logo */}
        <div className="mb-6 flex flex-col items-center gap-3 text-center">
          <span className="flex h-14 w-14 items-center justify-center rounded-2xl bg-gradient-to-br from-primary to-primary/70 text-primary-foreground shadow-lg">
            <Wheat className="h-7 w-7" />
          </span>
          <div>
            <h1 className="text-2xl font-black tracking-tight">
              {t("common.app_name")}
            </h1>
            <p className="text-sm text-muted-foreground">{t("common.app_sub")}</p>
          </div>
        </div>

        <Card className="border-border/60 shadow-xl">
          <CardContent className="p-6">
            {/* Tabs */}
            {mode !== "forgot" && (
              <div className="mb-6 grid grid-cols-2 gap-1 rounded-xl bg-muted p-1">
                <button
                  type="button"
                  onClick={() => setMode("login")}
                  className={`rounded-lg py-2 text-sm font-semibold transition-colors ${
                    mode === "login"
                      ? "bg-background text-foreground shadow-sm"
                      : "text-muted-foreground hover:text-foreground"
                  }`}
                >
                  {isRtl ? "تسجيل الدخول" : "Sign In"}
                </button>
                <button
                  type="button"
                  onClick={() => setMode("register")}
                  className={`rounded-lg py-2 text-sm font-semibold transition-colors ${
                    mode === "register"
                      ? "bg-background text-foreground shadow-sm"
                      : "text-muted-foreground hover:text-foreground"
                  }`}
                >
                  {isRtl ? "حساب جديد" : "Register"}
                </button>
              </div>
            )}

            {mode === "forgot" && resetSent ? (
              <div className="space-y-4 py-4 text-center">
                <div className="mx-auto flex h-14 w-14 items-center justify-center rounded-full bg-emerald-100 dark:bg-emerald-950">
                  <Mail className="h-7 w-7 text-primary" />
                </div>
                <div>
                  <h3 className="text-lg font-bold">
                    {isRtl ? "تحقق من بريدك" : "Check your email"}
                  </h3>
                  <p className="mt-1 text-sm text-muted-foreground">
                    {isRtl
                      ? "أرسلنا رابط إعادة تعيين كلمة المرور إلى بريدك."
                      : "We sent a password reset link to your email."}
                  </p>
                </div>
                <Button
                  variant="outline"
                  className="w-full"
                  onClick={() => {
                    setMode("login");
                    setResetSent(false);
                  }}
                >
                  {isRtl ? "العودة لتسجيل الدخول" : "Back to sign in"}
                </Button>
              </div>
            ) : (
              <form onSubmit={handleSubmit} className="space-y-4">
                {mode === "register" && (
                  <div className="space-y-2">
                    <Label htmlFor="fullName">
                      {isRtl ? "الاسم الكامل" : "Full name"}
                    </Label>
                    <div className="relative">
                      <User className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
                      <Input
                        id="fullName"
                        type="text"
                        value={fullName}
                        onChange={(e) => setFullName(e.target.value)}
                        placeholder={isRtl ? "أحمد محمد" : "Ahmed Mohamed"}
                        className="pl-9"
                        required
                      />
                    </div>
                  </div>
                )}

                <div className="space-y-2">
                  <Label htmlFor="email">
                    {isRtl ? "البريد الإلكتروني" : "Email"}
                  </Label>
                  <div className="relative">
                    <Mail className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
                    <Input
                      id="email"
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

                {mode !== "forgot" && (
                  <div className="space-y-2">
                    <Label htmlFor="password">
                      {isRtl ? "كلمة المرور" : "Password"}
                    </Label>
                    <div className="relative">
                      <Lock className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
                      <Input
                        id="password"
                        type={showPassword ? "text" : "password"}
                        value={password}
                        onChange={(e) => setPassword(e.target.value)}
                        placeholder="••••••••"
                        className="pl-9 pr-9"
                        required
                        minLength={6}
                        dir="ltr"
                      />
                      <button
                        type="button"
                        onClick={() => setShowPassword((v) => !v)}
                        className="absolute right-3 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-foreground"
                        aria-label={isRtl ? "إظهار كلمة المرور" : "Toggle password"}
                      >
                        {showPassword ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                      </button>
                    </div>
                  </div>
                )}

                {mode === "login" && (
                  <div className="flex items-center justify-between">
                    <label className="flex cursor-pointer items-center gap-2 text-sm text-muted-foreground">
                      <Checkbox checked={remember} onCheckedChange={(v) => setRemember(v === true)} />
                      {isRtl ? "تذكّرني" : "Remember me"}
                    </label>
                    <button
                      type="button"
                      onClick={() => setMode("forgot")}
                      className="text-sm font-medium text-primary hover:underline"
                    >
                      {isRtl ? "نسيت كلمة المرور؟" : "Forgot password?"}
                    </button>
                  </div>
                )}

                <Button type="submit" className="w-full gap-2" disabled={loading}>
                  {loading ? (
                    <Loader2 className="h-4 w-4 animate-spin" />
                  ) : (
                    <KeyRound className="h-4 w-4" />
                  )}
                  {mode === "login"
                    ? isRtl ? "دخول" : "Sign In"
                    : mode === "register"
                    ? isRtl ? "إنشاء حساب" : "Create Account"
                    : isRtl ? "إرسال الرابط" : "Send Reset Link"}
                </Button>

                {mode === "forgot" && (
                  <Button
                    type="button"
                    variant="ghost"
                    className="w-full"
                    onClick={() => setMode("login")}
                  >
                    {isRtl ? "العودة لتسجيل الدخول" : "Back to sign in"}
                  </Button>
                )}
              </form>
            )}

            {/* Divider */}
            {mode !== "forgot" && (
              <>
                <div className="my-5 flex items-center gap-3">
                  <div className="h-px flex-1 bg-border" />
                  <span className="text-xs text-muted-foreground">
                    {isRtl ? "أو" : "OR"}
                  </span>
                  <div className="h-px flex-1 bg-border" />
                </div>

                <Button
                  type="button"
                  variant="outline"
                  className="w-full gap-2"
                  onClick={handleGuest}
                >
                  <WifiOff className="h-4 w-4" />
                  {isRtl ? "الدخول كضيف" : "Continue as Guest"}
                </Button>
              </>
            )}
          </CardContent>
        </Card>

        {/* Trust line */}
        <div className="mt-4 flex items-center justify-center gap-1.5 text-xs text-muted-foreground">
          <ShieldCheck className="h-3.5 w-3.5 text-primary" />
          {isRtl
            ? "بياناتك محمية بـ Row Level Security"
            : "Protected by Row Level Security"}
        </div>

        {!IS_SUPABASE_CONFIGURED && (
          <p className="mt-3 rounded-lg border border-amber-300 bg-amber-50 p-3 text-center text-xs text-amber-800 dark:border-amber-800 dark:bg-amber-950/40 dark:text-amber-300">
            {isRtl
              ? "⚠️ لم يتم ضبط Supabase. شغّل سكربت SQL من مجلد supabase/migrations."
              : "⚠️ Supabase not configured. Run the SQL script in supabase/migrations."}
          </p>
        )}

        {/* Ad below auth card */}
        <div className="mt-6 flex flex-col items-center gap-3">
          <AdSlot placement="header" />
          <AdSmartlink variant="banner" />
        </div>
      </div>
    </div>
  );
}
