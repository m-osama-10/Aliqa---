import type { Metadata } from "next";
import { ContactUsContent } from "@/components/content/contact-us-content";

export const metadata: Metadata = {
  title: "اتصل بنا | عليقة",
  description:
    "تواصل مع فريق عليقة — أرسل ملاحظاتك أو اقتراحاتك أو استفساراتك حول حاسبة العليقة الذكية. روابط التواصل المباشر مع فريق العمل وطرق الإبلاغ عن المشكلات.",
  alternates: {
    canonical: "/contact",
  },
  openGraph: {
    title: "اتصل بنا | عليقة",
    description:
      "تواصل مع فريق عليقة عبر البريد، الهاتف، أو روابط التواصل الاجتماعي. نسعد بملاحظاتك واقتراحاتك.",
    type: "website",
  },
};

export default function ContactPage() {
  return <ContactUsContent />;
}
