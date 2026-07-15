import type { Metadata } from "next";
import { DisclaimerContent } from "@/components/content/disclaimer-content";

export const metadata: Metadata = {
  title: "إخلاء المسؤولية | عليقة",
  description:
    "إخلاء مسؤولية تطبيق عليقة — تنبيهات غذائية، مراجع NRC، نصيحة الاستشارة المهنية، عدم الضمان، وإخلاء مسؤولية الإعلانات الخارجية.",
  alternates: {
    canonical: "/disclaimer",
  },
  openGraph: {
    title: "إخلاء المسؤولية | عليقة",
    description:
      "تنبيهات ومسؤوليات قانونية وعلمية لاستخدام تطبيق عليقة — اقرأ قبل الاعتماد على النتائج.",
    type: "website",
  },
};

export default function DisclaimerPage() {
  return <DisclaimerContent />;
}
