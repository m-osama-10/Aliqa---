import type { Metadata } from "next";
import { TermsContent } from "@/components/content/terms-content";

export const metadata: Metadata = {
  title: "الشروط والأحكام | عليقة",
  description:
    "الشروط والأحكام لاستخدام تطبيق عليقة — حاسبة العليقة الذكية للمربي المصري. اقرأ بنود الاستخدام والترخيص والمسؤوليات القانونية.",
  alternates: {
    canonical: "/terms",
  },
  openGraph: {
    title: "الشروط والأحكام | عليقة",
    description:
      "بنود وشروط استخدام تطبيق عليقة — الحقوق والواجبات والمسؤوليات القانونية.",
    type: "website",
  },
};

export default function TermsPage() {
  return <TermsContent />;
}
