# P5 — New Pages + SEO Schemas

**Task ID:** P5
**Agent:** main (Z.ai Code)
**Task:** Create 4 new content pages (about/contact/terms/disclaimer) + Organization, FAQ, BreadcrumbList JSON-LD schemas + canonical URLs + sitemap update + footer link updates + remove ads from auth-screen.

## Work Log

- Read `worklog.md` (P1–P4 history), existing `content-page-layout.tsx`, `faq-content.tsx`, `about-screen.tsx` (team data — 3 members), `auth-screen.tsx`, `landing-screen.tsx` footer, `layout.tsx`, `sitemap.ts`, and all existing `src/app/*/page.tsx` files.
- Followed the established patterns: `ContentPageLayout` + "use client" content components + bilingual `lang === "ar"` checks.

## Files Created (4 page routes + 4 content components = 8 new files)

1. **`src/app/about/page.tsx`** — server component, bilingual metadata (title/description), `alternates: { canonical: "/about" }`, OpenGraph, renders `AboutUsContent`.
2. **`src/components/content/about-us-content.tsx`** ("use client", ~280 lines) — About Us content:
   - Hero card with intro paragraph + secondary paragraph (offline-first design philosophy, LP solver, no registration).
   - Mission card (empower every Egyptian breeder; raise production efficiency; reduce waste in feeding costs).
   - Vision card (competitive Egyptian animal production sector; 70% cost reference; trusted reference).
   - Team card (3 members with gradient avatars, bilingual name/specialty, social+phone links from `about-screen.tsx`).
   - Technology card with 2 sub-cards (LP Simplex + NRC Standards) + 4 capability badges.
   - Closing card with call to action.
   - 500+ words per language (AR/EN).
3. **`src/app/contact/page.tsx`** — server component, bilingual metadata, `alternates: { canonical: "/contact" }`.
4. **`src/components/content/contact-us-content.tsx`** ("use client", ~280 lines) — Contact Us content:
   - Intro + response time card (48 business hours, Sunday-Thursday).
   - Two-column grid: Email card (aleeqa.app@gmail.com) + Phone card (3 team phone numbers).
   - Team contacts card (3 members with gradient avatars + phone + social links).
   - Contact form (UI only, no backend): name, email, message — uses local state + setTimeout to simulate submission + shows success state + toast notification. Includes a consent footnote.
5. **`src/app/terms/page.tsx`** — server component, bilingual metadata, `alternates: { canonical: "/terms" }`.
6. **`src/components/content/terms-content.tsx`** ("use client", ~300 lines) — Terms & Conditions with 10 sections (bilingual):
   - 1. Acceptance of Terms / قبول الشروط
   - 2. Use License / ترخيص الاستخدام
   - 3. Disclaimers / إخلاء المسؤولية
   - 4. Limitation of Liability / حدود المسؤولية
   - 5. Privacy and Data / الخصوصية والبيانات
   - 6. Intellectual Property / الملكية الفكرية
   - 7. Third-Party Services / خدمات الأطراف الثالثة
   - 8. Changes to These Terms / التغييرات على هذه الشروط
   - 9. Termination / الإنهاء
   - 10. Governing Law & Contact / القانون الحاكم والتواصل
   - Cross-links to /privacy, /contact. Egyptian law governing clause.
7. **`src/app/disclaimer/page.tsx`** — server component, bilingual metadata, `alternates: { canonical: "/disclaimer" }`.
8. **`src/components/content/disclaimer-content.tsx`** ("use client", ~270 lines) — Disclaimer with 6 sections (bilingual):
   - 1. Nutritional Disclaimers / تنبيهات غذائية — feed variability, mycotoxins, anti-nutritional factors.
   - 2. NRC & Scientific References / مراجع NRC والعلمية — NRC publications cited + adaptation note.
   - 3. Professional Consultation Advice / نصيحة الاستشارة المهنية — 7 specific scenarios requiring vet consult.
   - 4. No Warranty / عدم الضمان — "as is" disclaimer.
   - 5. Third-Party Ads Disclaimer / إخلاء مسؤولية الإعلانات الخارجية — AdSense + opt-out link.
   - 6. Acceptance of Risk / قبول المخاطرة — cross-links to /terms and /contact.
   - 400+ words per language.

## Files Modified (10 existing files)

1. **`src/app/layout.tsx`**:
   - Added `SITE_URL` constant ("https://aleqa.vercel.app").
   - Added `metadataBase: new URL(SITE_URL)` to metadata.
   - Added `alternates: { canonical: "/" }` to metadata.
   - Added `url: SITE_URL` to `openGraph`.
   - Added `ORGANIZATION_SCHEMA` constant (Organization type with name, alternateName, url, logo, description, foundingDate "2025").
   - Injected `<script type="application/ld+json" dangerouslySetInnerHTML>` into `<head>` for the Organization schema.
2. **`src/components/content/faq-content.tsx`**:
   - Added `FAQPage` JSON-LD schema covering all 15 AR Q&As + 15 EN Q&As (30 Question entities total, each with acceptedAnswer + inLanguage).
   - Injected as `<script type="application/ld+json">` inside the `<ContentPageLayout>`.
3. **`src/components/content/content-page-layout.tsx`**:
   - Added `usePathname` from `next/navigation` to detect current page.
   - Added `SITE_URL` constant.
   - Added `breadcrumbSchema` (BreadcrumbList type) with 2 items: Home (position 1, name "الرئيسية"/"Home", item=SITE_URL) and Current Page (position 2, name=title, item=current path URL).
   - Injected as `<script type="application/ld+json">` at the top of the layout's root div.
   - Added 4 new footer links: `/about` (من نحن / About), `/contact` (اتصل بنا / Contact), `/terms` (الشروط والأحكام / Terms), `/disclaimer` (إخلاء المسؤولية / Disclaimer).
   - Removed unused `t` from `useLang()` destructure (no functional change).
4. **`src/components/aleeqa/landing-screen.tsx`**:
   - Added the same 4 new footer links to the landing-screen footer.
5. **`src/app/privacy/page.tsx`** — Added `alternates: { canonical: "/privacy" }`.
6. **`src/app/faq/page.tsx`** — Added `alternates: { canonical: "/faq" }`.
7. **`src/app/guide/page.tsx`** — Added `alternates: { canonical: "/guide" }`.
8. **`src/app/nutrition/page.tsx`** — Added `alternates: { canonical: "/nutrition" }`.
9. **`src/app/livestock-cost-calculator/page.tsx`** — Added `alternates: { canonical: "/livestock-cost-calculator" }`.
10. **`src/app/sitemap.ts`** — Added 4 new entries to `STATIC_ROUTES` array: `/about`, `/contact`, `/terms`, `/disclaimer`.
11. **`src/components/auth/auth-screen.tsx`**:
    - Removed `import { AdSlot } from "@/components/ads";`.
    - Removed the entire "Ad below auth card" block (`<div className="mt-6 flex flex-col items-center gap-3"><AdSlot placement="header" /><AdSlot placement="in-feed" /></div>`).
    - Login page is now ad-free (low-content page per task instructions).
12. **`src/app/api/route.ts`** (incidental fix): Added `export const dynamic = "force-static"` so the static-export build doesn't fail on `/api`. This is the same `force-static` requirement noted in P3 worklog for sitemap/robots. Pre-existing issue discovered during `bun run build`.

## Already-Canonical Pages (no change needed)

`/knowledge/page.tsx`, `/ingredients/page.tsx`, `/compare/page.tsx`, `/ingredients/[key]/page.tsx`, `/knowledge/[slug]/page.tsx` already had `alternates: { canonical: "..." }` from P1/P3 work — left untouched.

`src/app/page.tsx` is a client component (no `metadata` export) — covered by `layout.tsx` `alternates: { canonical: "/" }`.

## Verification

- `bunx eslint src/` → **clean** (0 errors, 0 warnings). All 14 lint errors in the project are pre-existing in `mobile-app-full/` (unrelated to this task).
- `bunx tsc --noEmit` → no new errors. Only pre-existing errors in: `capacitor.config.ts`, `src/components/ads/ad-{native-banner,smartlink,social-bar}.tsx`, `src/lib/__tests__/*`, mobile-app files.
- `bun run build` → **SUCCESS**. 68 static pages generated including the 4 new routes (`/about`, `/contact`, `/terms`, `/disclaimer`). Build output:
  ```
  ✓ Compiled successfully in 21.1s
  ✓ Generating static pages using 1 worker (68/68) in 1609.1ms
  Route (app)
  ├ ○ /about
  ├ ○ /contact
  ├ ○ /disclaimer
  └ ○ /terms
  ```
- All routes return HTTP 200: `/about/`, `/contact/`, `/terms/`, `/disclaimer/`, `/sitemap.xml`, `/faq/`.
- **Organization schema verified** in `/` HTML: `"@type":"Organization"`, `"alternateName":"Aleeqa"`, `"foundingDate":"2025"`.
- **FAQ schema verified** in `/faq/` HTML: `1 "@type":"FAQPage"` + `30 "@type":"Question"` + `30 "@type":"Answer"` (15 AR + 15 EN).
- **BreadcrumbList schema verified** in `/about/` HTML: `BreadcrumbList` present.
- **Canonical URLs verified** in HTML for all pages: `/` → `https://aleqa.vercel.app/`, `/about/` → `.../about/`, `/contact/` → `.../contact/`, `/terms/` → `.../terms/`, `/disclaimer/` → `.../disclaimer/`, `/privacy/` → `.../privacy/`, `/faq/` → `.../faq/`, `/livestock-cost-calculator/` → `.../livestock-cost-calculator/`.
- **Sitemap** verified: 13 static routes (was 9) including all 4 new routes + 22 ingredient pages + 28 knowledge articles = 63 total entries.
- **Page content verified** (curl grep): all 4 new pages render their expected AR content (hero titles, section headings, team member names, form fields, NRC references, etc.).

## Ads Removal Summary (per task rule #9)

- ✅ Removed `AdSlot` from `src/components/auth/auth-screen.tsx` (login = low-content page).
- ❌ Did NOT remove ads from: landing-screen, app-shell, calculator result, prices, rations, about-screen (inside app) — these are high-content pages where ads are kept.

## Did NOT modify (per task rules)

- Any existing calculation logic in `src/lib/feed-lp.ts`, `src/lib/ration-report.ts`, `src/lib/percentage-distribution.ts`, etc.
- The i18n dictionary (`src/lib/i18n.tsx`) — used existing `useLang()` hook directly.
- The ingredient DB or article library.
- Any existing routes' calculation logic.

## Stage Summary

- 8 new files created (4 page.tsx + 4 content components).
- 12 existing files modified (layout, faq-content, content-page-layout, landing-screen, 5 page.tsx for canonical, sitemap, auth-screen, api/route.ts).
- 4 new JSON-LD schemas added: Organization (in layout, all pages), FAQPage (in /faq), BreadcrumbList (in ContentPageLayout, all content pages).
- All 13 static routes have canonical URLs (was 5 + layout = 6).
- Sitemap grew from 9 → 13 static routes.
- Lint clean (src/), TypeScript clean (no new errors), build successful (68/68 pages).
- All 4 new pages serve HTTP 200 with full AR + EN content.
- All 4 schemas verified present in rendered HTML.
