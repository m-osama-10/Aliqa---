import type { Metadata } from "next";
import { AboutUsContent } from "@/components/content/about-us-content";

export const metadata: Metadata = {
  title: "من نحن | عليقة",
  description:
    "تعرّف على فريق عليقة — حاسبة العليقة الذكية للمربي المصري. رسالتنا، رؤيتنا للزراعة المصرية، والتقنيات المستخدمة في بناء التطبيق.",
  alternates: {
    canonical: "/about",
  },
  openGraph: {
    title: "من نحن | عليقة",
    description:
      "فريق عليقة — مهندسون مصريون متخصصون في الإنتاج الحيواني والبايوتكنولوجي يبنون أدوات ذكية لخدمة المربي المصري.",
    type: "website",
  },
};

export default function AboutPage() {
  return <AboutUsContent />;
}
