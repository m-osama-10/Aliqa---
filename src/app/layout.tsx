import type { Metadata, Viewport } from "next";
import { Alexandria } from "next/font/google";
import Script from "next/script";
import "./globals.css";
import { Toaster } from "@/components/ui/toaster";
import { LanguageProvider } from "@/lib/i18n";
import { AuthProvider } from "@/lib/store/auth-context";

const alexandria = Alexandria({
  variable: "--font-alexandria",
  subsets: ["arabic", "latin"],
  weight: ["300", "400", "500", "600", "700", "800"],
  display: "swap",
});

const SITE_URL = "https://aleqa.vercel.app";

export const metadata: Metadata = {
  metadataBase: new URL(SITE_URL),
  title: "عليقة | حاسبة العليقة الذكية للمربي المصري",
  description:
    "أداة تقنية مجانية تساعد مربي الأبقار والجاموس والأغنام والدواجن في مصر على تركيب العلائق الغذائية بدقة علمية وبأقل تكلفة — محرك برمجة خطية يعمل أوفلاين.",
  keywords: [
    "عليقة",
    "حاسبة العليقة",
    "تركيب العلائق",
    "الزراعة في مصر",
    "مربي الدواجن",
    "أبقار",
    "جاموس",
    "AgriTech",
    "Feed Formulation",
    "Alieqa",
  ],
  authors: [{ name: "عليقة" }],
  manifest: "/manifest.json",
  verification: {
    google: "NzRc3YlGLaVsr9ZAAr6PN6pjkGiitrVZXNv-KouX4T4",
  },
  icons: {
    icon: "/logo.svg",
    apple: "/icon-192.png",
  },
  alternates: {
    canonical: "/",
  },
  openGraph: {
    title: "عليقة | حاسبة العليقة الذكية",
    description: "حاسبة العليقة الذكية للمربي المصري — بدقة علمية وبأقل تكلفة.",
    siteName: "عليقة",
    type: "website",
    url: SITE_URL,
  },
  twitter: {
    card: "summary_large_image",
    title: "عليقة | حاسبة العليقة الذكية",
    description: "حاسبة العليقة الذكية للمربي المصري.",
  },
};

/** Organization JSON-LD schema — describes the publisher (Aleeqa) to search engines. */
const ORGANIZATION_SCHEMA = {
  "@context": "https://schema.org",
  "@type": "Organization",
  name: "عليقة",
  alternateName: "Aleeqa",
  url: SITE_URL,
  logo: `${SITE_URL}/logo.svg`,
  description: "حاسبة العليقة الذكية للمربي المصري",
  foundingDate: "2025",
};

export const viewport: Viewport = {
  width: "device-width",
  initialScale: 1,
  maximumScale: 1,
  userScalable: false,
  themeColor: "#2E7D4F",
  viewportFit: "cover",
};

// Google AdSense publisher ID
const ADSENSE_CLIENT = "ca-pub-3474575203383848";

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="ar" dir="rtl" suppressHydrationWarning>
      <head>
        {/* Organization JSON-LD schema — raw script tag for SEO crawlers.
            Must stay in <head> as a static tag (no React hydration issues). */}
        <script
          type="application/ld+json"
          dangerouslySetInnerHTML={{ __html: JSON.stringify(ORGANIZATION_SCHEMA) }}
        />
      </head>
      <body
        className={`${alexandria.variable} font-alexandria antialiased bg-background text-foreground`}
      >
        <AuthProvider>
          <LanguageProvider>
            {children}
          </LanguageProvider>
        </AuthProvider>
        {/* Google AdSense — loaded via next/script to avoid hydration mismatch.
            Placed at end of body so it doesn't interfere with <head> scripts. */}
        <Script
          id="adsbygoogle"
          async
          strategy="afterInteractive"
          src={`https://pagead2.googlesyndication.com/pagead/js/adsbygoogle.js?client=${ADSENSE_CLIENT}`}
          crossOrigin="anonymous"
        />
        <Toaster />
      </body>
    </html>
  );
}
