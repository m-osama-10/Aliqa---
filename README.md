# 🌾 عليقة | Alieqa — حاسبة العليقة الذكية

> **أداة تقنية مجانية تساعد مربي الأبقار والجاموس والأغنام والدواجن في مصر على تركيب العلائق الغذائية بدقة علمية وبأقل تكلفة — محرك برمجة خطية يعمل أوفلاين.**

<div dir="rtl">

## 📋 ملخص المشروع

**عليقة** هو مشروع متكامل (موقع ويب + تطبيق موبايل + خلفية Supabase) يحل مشكلة حساب العليقة الغذائية للمربي المصري بدلاً من الورقة والقلم والتجربة والخطأ. يستخدم محرك **برمجة خطية (Linear Programming)** لحساب أرخص عليقة متوازنة تحقق احتياجات الحيوان من البروتين والطاقة والألياف.

### 🎯 المشكلة التي يحلها
المربي المصري يحسب العليقة يدوياً بورقة وقلم، ويعتمد على التجربة والخطأ، مما يسبب:
- تكلفة أعلى من اللازم
- علائق غير متوازنة غذائياً
- هدر في المكوّنات
- صعوبة التعديل عند تغيّر الأسعار

### ✅ الحل
تطبيق ذكي يحسب في ثوانٍ، بأسعار سوقك أنت، أرخص تركيبة عليقة تحقق الاحتياجات الغذائية لكل نوع حيوان — **بدون إنترنت**.

---

## ✨ المزايا الرئيسية

| الميزة | الوصف |
|--------|-------|
| 🧮 **محرك برمجة خطية** | حساب أرخص عليقة متوازنة (بروتين + طاقة + ألياف) |
| 🐄 **9 أنواع حيوانات** | بقرة حلوب، جاموس حلوب، جاموس تسمين، خروف، عجل، دجاج بياض، أمهات بياض، دجاج تسمين، كتاكيت بادي |
| 🌾 **6 مكوّنات سوق** | ذرة، صويا، ردة، دريس، تبن، إضافات |
| 💰 **أسعار قابلة للتعديل** | حدّث الأسعار بأسعار سوقك الأسبوعي |
| 📱 **يعمل أوفلاين** | كل الحسابات والأسعار والعلائق محفوظة على جهازك |
| 🌐 **ثنائي اللغة** | عربي (RTL) + إنجليزي (LTR) |
| 🌙 **وضع ليلي** | تصميم بألوان زراعية (أخضر + ذهبي) |
| 📤 **مشاركة سريعة** | واتساب، طباعة، PDF |
| 🔔 **إشعارات فورية** | عبر Expo Push Notifications |
| 📊 **لوحة تحكم للأدمن** | إدارة المستخدمين والإعلانات والإعدادات |

---

## 🏗️ بنية المشروع

```
aleeqa/
├── src/                          ← موقع Next.js 16 (يعمل الآن على port 3000)
│   ├── app/                      ← الصفحة الرئيسية
│   ├── components/
│   │   ├── aleeqa/               ← شاشات التطبيق (الحاسبة، الأسعار، العلائق، حول)
│   │   ├── ads/                  ← 7 وحدات إعلانية موزّعة على المشروع كله
│   │   ├── admin/                ← لوحة تحكم الأدمن
│   │   ├── auth/                 ← تسجيل الدخول/حساب جديد/ضيف
│   │   └── ui/                   ← مكونات shadcn/ui
│   ├── lib/
│   │   ├── supabase/             ← اتصال Supabase (publishable key فقط)
│   │   ├── services/             ← settings, ads, calculators, favorites, history...
│   │   ├── store/                ← Zustand (auth, app state)
│   │   ├── offline/              ← cache + sync engine + retry
│   │   ├── feed-data.ts          ← قاعدة بيانات المكوّنات والحيوانات
│   │   ├── feed-lp.ts            ← محرك البرمجة الخطية
│   │   └── i18n.tsx              ← ترجمات عربي/إنجليزي
│   └── types/db.ts               ← أنواع TypeScript مطابقة لقاعدة البيانات
│
├── mobile-app/                   ← تطبيق React Native / Expo (SDK 52)
│   ├── src/
│   │   ├── api/                  ← supabase, auth, calculators, favorites, ads...
│   │   ├── components/
│   │   │   ├── Ads/              ← مكونات الإعلانات (WebView-based)
│   │   │   └── ...               ← مكونات أخرى
│   │   ├── screens/
│   │   │   ├── auth/             ← Login, Register, ForgotPassword
│   │   │   ├── main/             ← Home, Calculator, Results, Favorites, History...
│   │   │   └── admin/            ← Dashboard, Users, Ads, Settings...
│   │   ├── services/             ← rationOptimizer, syncEngine, pushNotifications
│   │   ├── store/                ← authStore, appStore, syncStore (Zustand)
│   │   └── navigation/           ← React Navigation (auth + tabs + admin stacks)
│   ├── app.json                  ← إعدادات Expo
│   └── eas.json                  ← بناء APK (production + preview)
│
├── supabase/migrations/
│   └── 0001_init_alieqa.sql      ← SQL كامل (12 جدول + RLS + indexes + policies)
│
└── public/                       ← أيقونات + manifest
```

---

## 🗄️ قاعدة البيانات (Supabase)

### الجداول (12 جدول)
| الجدول | الوصف |
|--------|-------|
| `profiles` | ملفات المستخدمين (1-1 مع auth.users) |
| `subscriptions` | اشتراكات (free/pro/premium) |
| `notifications` | إشعارات (فردية أو broadcast) |
| `ads` | إعلانات ديناميكية من الأدمن |
| `settings` | إعدادات التطبيق (maintenance, version, social links...) |
| `calculators` | الآلات الحاسبة |
| `calculator_categories` | تصنيفات الآلات الحاسبة |
| `favorites` | المفضلات (لكل مستخدم) |
| `history` | سجل العمليات |
| `feedback` | ملاحظات المستخدمين |
| `app_versions` | إصدارات التطبيق (force update) |
| `device_tokens` | توكنز الإشعارات (Expo Push) |

### الأمان
- ✅ **Row Level Security** مفعّل على كل جدول
- ✅ **Publishable Key فقط** (لا Service Role Key في الكود)
- ✅ Policies: عام للقراءة، مالك للبيانات، أدمن للإدارة
- ✅ Soft delete (`deleted_at`) على كل جدول
- ✅ Triggers لـ `updated_at` + إنشاء profile تلقائي عند التسجيل

### تشغيل SQL
1. افتح مشروع Supabase → **SQL Editor** → New query
2. **انسخ محتوى** الملف `supabase/migrations/0001_init_alieqa.sql` (وليس المسار!)
3. الصق المحتوى في المحرر → Run
4. (اختياري) اجعل نفسك أدمن:
```sql
UPDATE profiles SET role = 'admin' WHERE email = 'you@example.com';
```

---

## 🔐 المصادقة (Authentication)

| الميزة | الحالة |
|--------|-------|
| تسجيل دخول بالبريد + كلمة المرور | ✅ |
| حساب جديد (تأكيد بالبريد) | ✅ |
| نسيت كلمة المرور | ✅ |
| تذكّرني (حفظ الجلسة) | ✅ |
| وضع الضيف (بدون حساب) | ✅ |
| إنشاء profile تلقائي | ✅ (trigger) |

---

## 📡 الإعلانات (7 وحدات)

وزّعنا **7 وحدات إعلانية** على المشروع كله (موقع + موبايل):

| # | الوحدة | النوع | أماكن الظهور |
|---|--------|-------|--------------|
| 1 | **Smartlink** | رابط | صفحة الهبوط، الحاسبة، النتائج، حسابي |
| 2 | **Native Banner** | script+div | بين أقسام الصفحة الرئيسية، النتائج |
| 3 | **Social Bar** | script | شريط عائم في كل الصفحات |
| 4 | **Banner 468×60** | iframe | أعلى الصفحة (تابلت) |
| 5 | **Banner 320×50** | iframe | أعلى/أسفل الصفحة (موبايل) |
| 6 | **Banner 728×90** | iframe | أعلى/أسفل الصفحة (ديسكتوب) |
| 7 | **Banner 160×300** | iframe | الشريط الجانبي |

### أماكن التوزيع
- **الموقع**: الصفحة الرئيسية (5 مواضع)، الحاسبة، الأسعار، العلائق، حول، تسجيل الدخول، لوحة الأدمن
- **الموبايل**: الرئيسية، الحاسبة، النتائج، المفضلة، السجل، الأسعار، الإشعارات، الإعدادات، حسابي، ملاحظات

الإعلانات **responsive** — تختار الحجم المناسب حسب عرض الشاشة تلقائياً.

---

## 📱 تشغيل الموقع (Vercel)

الموقع مبني بـ **Next.js 16** ويعمل على Vercel مباشرة:

```bash
# 1. ثبّت المتطلبات
bun install   # أو: npm install

# 2. شغّل محلياً
bun run dev   # http://localhost:3000

# 3. للنشر على Vercel
# - ارفع المشروع لـ GitHub
# - اربطه بـ Vercel
# - أضف متغيرات البيئة:
#   NEXT_PUBLIC_SUPABASE_URL=https://lepdythxcdurjwncxnnt.supabase.co
#   NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY=sb_publishable_nWluULZyJ-hU3f42jd0mbg_8iNXWxkp
```

---

## 📲 بناء تطبيق الموبايل (APK)

تطبيق الموبايل في مجلد `mobile-app/` — مبني بـ **Expo SDK 52 + React Native 0.76**:

### الطريقة الموصى بها: EAS Build (سحابي)
```bash
cd mobile-app

# 1. ثبّت المتطلبات
npm install

# 2. ثبّت EAS CLI
npm install -g eas-cli

# 3. سجّل دخول Expo
eas login

# 4. اربط المشروع
eas build:configure

# 5. ابنِ الـ APK (يتم البناء في سحابة Expo)
eas build -p android --profile production
```

الـ `eas.json` مضبوط بـ `buildType: "apk"` للـ production و preview.

### تشغيل محلي (بدون بناء)
```bash
cd mobile-app
npm install
npx expo start
# اضغط 'a' للأندرويد، 'i' للـ iOS
```

---

## 🔧 المتغيرات البيئية

أنشئ ملف `.env` في جذر المشروع (للموقع):
```env
NEXT_PUBLIC_SUPABASE_URL=https://lepdythxcdurjwncxnnt.supabase.co
NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY=sb_publishable_nWluULZyJ-hU3f42jd0mbg_8iNXWxkp
```

وللتطبيق في `mobile-app/src/api/supabase.ts` و `mobile-app/app.json` (موجودين مسبقاً).

> ⚠️ **مهم**: لا تستخدم Service Role Key أبداً — RLS يحمي كل الوصول.

---

## 🎨 التقنيات المستخدمة

### الموقع
- Next.js 16 (App Router) + TypeScript 5
- Tailwind CSS 4 + shadcn/ui
- @supabase/ssr + @supabase/supabase-js
- Zustand للحالة
- خط Cairo للعربية

### الموبايل
- Expo SDK 52 + React Native 0.76
- React Navigation v7
- expo-notifications + expo-secure-store
- react-native-webview (للإعلانات)
- Zustand

### الخلفية
- Supabase (PostgreSQL + Auth + Realtime + Storage)
- Row Level Security على كل جدول
- RPCs: `get_public_settings`, `get_active_ads`, `increment_ad_stat`, `get_unread_count`

---

## 🔌 الدعم الأوفلاين

- **Cache**: إعدادات + إعلانات + آلات حاسبة + تصنيفات → localStorage (ويب) / AsyncStorage (موبايل)
- **Pending ops queue**: المفضلة والسجل يُحفظون محلياً عند انقطاع الإنترنت
- **Auto-sync**: عند عودة الإنترنت + كل 60 ثانية
- **Retry**: exponential backoff (500ms × 2ⁿ)

---

## 📊 لوحة تحكم الأدمن

يمكن الوصول لها من تبويب "حسابي" → "لوحة التحكم" (للمستخدمين بدور admin فقط):

1. **نظرة عامة** — إحصائيات (مستخدمين، إعلانات، ملاحظات)
2. **المستخدمون** — قائمة + ترقية لأدمن + حذف
3. **الإعلانات** — إضافة/تعديل/حذف/تفعيل
4. **الإعدادات** — تعديل أي إعداد (maintenance, version, روابط...)
5. **الإشعارات** — إرسال broadcast أو فردي
6. **التصنيفات** — تفعيل/حذف تصنيفات الآلات الحاسبة
7. **الملاحظات** — عرض + تغيير الحالة

---

## 📄 الترخيص

Proprietary — عليقة © 2025

</div>
