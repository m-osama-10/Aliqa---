# 🌾 عليقة | Alieqa — حاسبة العليقة الذكية

> **أداة تقنية مجانية تساعد مربي الأبقار والجاموس والأغنام والدواجن في مصر على تركيب العلائق الغذائية بدقة علمية وبأقل تكلفة — محرك برمجة خطية يعمل أوفلاين.**

<div dir="rtl">

## 📋 ملخص المشروع

**عليقة** هو مشروع متكامل (موقع ويب + تطبيق موبايل + خلفية Supabase) يحل مشكلة حساب العليقة الغذائية للمربي المصري بدلاً من الورقة والقلم والتجربة والخطأ. يستخدم محرك **برمجة خطية (Linear Programming)** لحساب أرخص عليقة متوازنة تحقق احتياجات الحيوان من البروتين والطاقة والألياف.

### 🏗️ المعمارية
الموقع والتطبيق **نفس الكود بالظبط** — التطبيق بيلف الموقع جوه native Android app باستخدام **Capacitor**. كل الميزات (الحاسبة، Supabase، الإعلانات، الأوفلاين، لوحة الأدمن) تشتغل في الاتنين زي بعض.

```
موقع Next.js (web) ──┐
                     ├──> نفس الكود ──> Capacitor ──> APK (Android)
تطبيق الموبايل ──────┘
```

---

## ✨ المزايا الرئيسية

| الميزة | الوصف |
|--------|-------|
| 🧮 **محرك برمجة خطية** | حساب أرخص عليقة متوازنة (بروتين + طاقة + ألياف) |
| 🐄 **9 أنواع حيوانات** | بقرة حلوب، جاموس حلوب، جاموس تسمين، خروف، عجل، دجاج بياض، أمهات بياض، دجاج تسمين، كتاكيت بادي |
| 🌾 **6 مكوّنات سوق** | ذرة، صويا، ردة، دريس، تبن، إضافات |
| 💰 **أسعار قابلة للتعديل** | حدّث الأسعار بأسعار سوقك |
| 📱 **تطبيق موبايل (APK)** | Capacitor — نفس كود الموقع |
| 🌐 **موقع ويب** | Next.js 16 + Vercel |
| 🌐 **ثنائي اللغة** | عربي (RTL) + إنجليزي (LTR) |
| 🌙 **وضع ليلي** | تصميم بألوان زراعية (أخضر + ذهبي) |
| 📊 **لوحة تحكم للأدمن** | إدارة المستخدمين والإعلانات والإعدادات |
| 🔔 **إشعارات** | عبر Expo Push / Web Notifications |
| 📡 **7 وحدات إعلانية** | موزّعة على الموقع والتطبيق |

---

## 🗄️ قاعدة البيانات (Supabase)

### الجداول (12 جدول)
`profiles, subscriptions, notifications, ads, settings, calculators, calculator_categories, favorites, history, feedback, app_versions, device_tokens`

### الأمان
- ✅ **Row Level Security** مفعّل على كل جدول
- ✅ **Publishable Key فقط** (لا Service Role Key)
- ✅ Policies: عام للقراءة، مالك للبيانات، أدمن للإدارة
- ✅ Soft delete على كل جدول

### تشغيل SQL
1. افتح Supabase → **SQL Editor**
2. انسخ **محتوى** `supabase/migrations/0001_init_alieqa.sql`
3. الصق → Run
4. (اختياري) `UPDATE profiles SET role = 'admin' WHERE email = 'you@example.com';`

---

## 📡 الإعلانات (7 وحدات)

| # | الوحدة | النوع |
|---|--------|-------|
| 1 | Smartlink | رابط |
| 2 | Native Banner | script+div |
| 3 | Social Bar | script |
| 4 | Banner 468×60 | iframe |
| 5 | Banner 320×50 | iframe |
| 6 | Banner 728×90 | iframe |
| 7 | Banner 160×300 | iframe |

الإعلانات موزّعة على: الصفحة الرئيسية، الحاسبة، الأسعار، العلائق، حول، تسجيل الدخول، لوحة الأدمن، والنتائج.

---

## 🚀 التشغيل والتطوير

### الموقع (Next.js)
```bash
bun install
bun run dev          # http://localhost:3000
```

### متغيرات البيئة (.env)
```env
NEXT_PUBLIC_SUPABASE_URL=https://lepdythxcdurjwncxnnt.supabase.co
NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY=sb_publishable_nWluULZyJ-hU3f42jd0mbg_8iNXWxkp
```

---

## 📲 بناء تطبيق الموبايل (APK) — Capacitor

التطبيق بيلف الموقع كله جوه native Android app باستخدام **Capacitor**.

### المتطلبات
- JDK 21
- Android SDK (platform 36, build-tools)
- Node.js / Bun

### البناء
```bash
# 1. ثبّت المتطلبات
bun install
bun add @capacitor/core @capacitor/cli @capacitor/android

# 2. ابنِ الموقع (static export)
bun run build

# 3. مزامنة الـ web assets مع Android
npx cap sync android

# 4. ابنِ الـ APK
cd android
./gradlew assembleRelease

# 5. الـ APK هيكون في:
# android/app/build/outputs/apk/release/app-release.apk
```

### أو بسكريبت واحد:
```bash
bun run cap:build
```

### فتح المشروع في Android Studio:
```bash
bun run cap:open
```

---

## 🔄 سير العمل (Workflow)

لما تعدّل أي حاجة في الموقع:

```bash
# 1. عدّل الكود في src/
# 2. أعد البناء
bun run build

# 3. مزامنة مع التطبيق
npx cap sync android

# 4. أعد بناء الـ APK
cd android && ./gradlew assembleRelease
```

أو بسكريبت واحد: `bun run cap:build`

---

## 📁 بنية المشروع

```
aleeqa/
├── src/                          ← كود الموقع (Next.js) — نفسه في التطبيق
│   ├── app/                      ← الصفحة الرئيسية
│   ├── components/
│   │   ├── aleeqa/               ← شاشات التطبيق
│   │   ├── ads/                  ← 7 وحدات إعلانية
│   │   ├── admin/                ← لوحة تحكم الأدمن
│   │   ├── auth/                 ← المصادقة
│   │   └── ui/                   ← shadcn/ui
│   ├── lib/                      ← supabase, services, store, offline
│   └── types/                    ← TypeScript types
│
├── android/                      ← مشروع Capacitor Android (مولّد)
│   ├── app/
│   │   ├── build.gradle          ← إعدادات البناء
│   │   ├── src/main/assets/public/  ← الموقع (static export)
│   │   └── src/main/res/         ← الأيقونات
│   └── gradlew
│
├── supabase/migrations/
│   └── 0001_init_alieqa.sql      ← SQL كامل
│
├── capacitor.config.ts           ← إعدادات Capacitor
├── next.config.ts                ← output: export (لـ Capacitor)
├── public/                       ← أيقونات + manifest + service worker
└── download/alieqa.apk           ← الـ APK النهائي
```

---

## 🎨 التقنيات

| الطبقة | التقنية |
|--------|---------|
| الموقع | Next.js 16 + TypeScript + Tailwind + shadcn/ui |
| الموبايل | Capacitor (يلف الموقع) |
| الخلفية | Supabase (PostgreSQL + Auth + RLS) |
| الأوفلاين | Service Worker + localStorage |
| الإعلانات | 7 وحدات (effectivecpmnetwork + highperformanceformat) |
| النشر (Web) | Vercel |
| النشر (APK) | Gradle assembleRelease |

---

## 📄 الترخيص

Proprietary — عليقة © 2025

</div>
