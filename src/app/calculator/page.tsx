import type { Metadata } from "next";
import { CalculatorStandalone } from "@/components/content/calculator-standalone";

export const metadata: Metadata = {
  title: "حاسبة العليقة الذكية | عليقة",
  description:
    "احسب أرخص عليقة متوازنة لحيواناتك بدقة علمية — محرك برمجة خطية يدعم ٩ أنواع حيوانات و٢٢ مكوّن. مجاني وبدون تسجيل.",
  alternates: { canonical: "/calculator" },
  openGraph: {
    title: "حاسبة العليقة الذكية | عليقة",
    description: "احسب أرخص عليقة متوازنة لحيواناتك بدقة علمية — مجاني وبدون تسجيل.",
    type: "website",
  },
};

export default function CalculatorPage() {
  return <CalculatorStandalone />;
}
