import type { Metadata, Viewport } from "next";
import { Alexandria } from "next/font/google";
import "./globals.css";
import { Toaster } from "@/components/ui/toaster";

const alexandria = Alexandria({
  variable: "--font-alexandria",
  subsets: ["arabic", "latin"],
  weight: ["300", "400", "500", "600", "700", "800"],
  display: "swap",
});

export const metadata: Metadata = {
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
  icons: {
    icon: "/logo.svg",
    apple: "/icon-192.png",
  },
  openGraph: {
    title: "عليقة | حاسبة العليقة الذكية",
    description: "حاسبة العليقة الذكية للمربي المصري — بدقة علمية وبأقل تكلفة.",
    siteName: "عليقة",
    type: "website",
  },
  twitter: {
    card: "summary_large_image",
    title: "عليقة | حاسبة العليقة الذكية",
    description: "حاسبة العليقة الذكية للمربي المصري.",
  },
};

export const viewport: Viewport = {
  width: "device-width",
  initialScale: 1,
  maximumScale: 1,
  userScalable: false,
  themeColor: "#2E7D4F",
  viewportFit: "cover",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="ar" dir="rtl" suppressHydrationWarning>
      <body
        className={`${alexandria.variable} font-alexandria antialiased bg-background text-foreground`}
      >
        {children}
        <Toaster />
      </body>
    </html>
  );
}
