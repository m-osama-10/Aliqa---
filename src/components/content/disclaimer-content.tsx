"use client";

import {
  AlertTriangle,
  Stethoscope,
  BookOpen,
  ShieldX,
  Megaphone,
  FlaskConical,
  Scale,
} from "lucide-react";
import Link from "next/link";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Separator } from "@/components/ui/separator";
import { ContentPageLayout } from "./content-page-layout";
import { useLang } from "@/lib/i18n";

export function DisclaimerContent() {
  const { lang } = useLang();
  const isRtl = lang === "ar";
  const title = isRtl ? "إخلاء المسؤولية" : "Disclaimer";

  if (!isRtl) {
    return (
      <ContentPageLayout title={title}>
        <div className="space-y-6 text-sm leading-relaxed text-foreground">
          <p className="text-muted-foreground">Last updated: July 2025</p>

          <Card className="border-amber-300/60 bg-amber-50/60 dark:border-amber-800/40 dark:bg-amber-950/20">
            <CardContent className="flex items-start gap-3 p-4">
              <AlertTriangle className="mt-0.5 h-5 w-5 shrink-0 text-amber-600 dark:text-amber-400" />
              <p className="text-xs text-foreground/80">
                The Aleeqa app is a technical tool designed to help Egyptian livestock farmers
                formulate feed rations based on Linear Programming and NRC nutritional standards.
                The information and results provided by the App are for educational and
                informational purposes only and do not replace professional veterinary or
                nutritional advice.
              </p>
            </CardContent>
          </Card>

          <section>
            <div className="mb-2 flex items-center gap-2">
              <span className="flex h-9 w-9 items-center justify-center rounded-lg bg-primary/10 text-primary">
                <FlaskConical className="h-5 w-5" />
              </span>
              <h2 className="text-lg font-bold">1. Nutritional Disclaimers</h2>
            </div>
            <p>
              The ration formulations produced by Aleeqa are based on the nutritional values you
              enter for each ingredient and the animal targets set in the App. While we provide
              default values from reputable scientific sources, actual nutritional content of feed
              ingredients varies significantly by region, harvest season, storage conditions,
              processing method, and quality. A batch of yellow corn from one region may have a
              different Crude Protein or TDN value than the default we use.
            </p>
            <p className="mt-2">
              You are responsible for verifying and adjusting the nutritional values to match the
              actual ingredients available to you. The App cannot account for variations in feed
              quality, contamination (e.g., mycotoxins), or anti-nutritional factors that may be
              present in your specific ingredients. Always inspect feed visually and, when
              possible, conduct laboratory analysis for accurate nutritional profiling.
            </p>
            <p className="mt-2">
              Ration results are general recommendations for healthy animals under typical
              management conditions. They do not account for individual animal health status,
              pregnancy stage, lactation phase, age, weight, breed, climate stress, or disease
              conditions.
            </p>
          </section>

          <section>
            <div className="mb-2 flex items-center gap-2">
              <span className="flex h-9 w-9 items-center justify-center rounded-lg bg-primary/10 text-primary">
                <BookOpen className="h-5 w-5" />
              </span>
              <h2 className="text-lg font-bold">2. NRC &amp; Scientific References</h2>
            </div>
            <p>
              The nutritional targets used in the App are derived from the publications of the
              National Research Council (NRC) of the United States, including the &quot;Nutrient
              Requirements of Dairy Cattle&quot;, &quot;Nutrient Requirements of Beef Cattle&quot;,
              &quot;Nutrient Requirements of Small Ruminants&quot;, and &quot;Nutrient Requirements
              of Poultry&quot;. These standards are internationally recognized references for
              animal nutrition.
            </p>
            <p className="mt-2">
              However, the NRC values have been adapted to the Egyptian context — accounting for
              local feed ingredients, climate conditions, and common breeds. These adaptations
              reflect our interpretation of the science for the local market, and may differ from
              the original NRC recommendations. For the original NRC values, please consult the
              official NRC publications directly.
            </p>
            <div className="mt-3 flex flex-wrap gap-1.5">
              <Badge variant="secondary">NRC Dairy Cattle</Badge>
              <Badge variant="secondary">NRC Beef Cattle</Badge>
              <Badge variant="secondary">NRC Small Ruminants</Badge>
              <Badge variant="secondary">NRC Poultry</Badge>
              <Badge variant="secondary">Linear Programming</Badge>
            </div>
          </section>

          <section>
            <div className="mb-2 flex items-center gap-2">
              <span className="flex h-9 w-9 items-center justify-center rounded-lg bg-primary/10 text-primary">
                <Stethoscope className="h-5 w-5" />
              </span>
              <h2 className="text-lg font-bold">3. Professional Consultation Advice</h2>
            </div>
            <p>
              The results generated by Aleeqa are <strong>not a substitute</strong> for
              professional veterinary or animal nutrition advice. We strongly recommend consulting
              a licensed veterinarian or a qualified animal nutritionist, especially in the
              following situations:
            </p>
            <ul className="ml-4 mt-2 list-disc space-y-1">
              <li>Animals showing signs of illness, weight loss, or reduced production</li>
              <li>Pregnant or lactating animals with special nutritional needs</li>
              <li>Young animals (calves, lambs, chicks) with developing digestive systems</li>
              <li>Large-scale commercial operations where small errors compound into significant losses</li>
              <li>When introducing new feed ingredients or changing the ration significantly</li>
              <li>When animals are exposed to environmental stress (heat, cold, transport)</li>
              <li>When using unconventional or by-product ingredients that may contain anti-nutritional factors</li>
            </ul>
            <p className="mt-2">
              A professional can assess your specific situation, conduct feed analysis, evaluate
              animal health, and recommend rations tailored to your herd&apos;s needs — services
              that an automated tool cannot provide.
            </p>
          </section>

          <section>
            <div className="mb-2 flex items-center gap-2">
              <span className="flex h-9 w-9 items-center justify-center rounded-lg bg-primary/10 text-primary">
                <ShieldX className="h-5 w-5" />
              </span>
              <h2 className="text-lg font-bold">4. No Warranty</h2>
            </div>
            <p>
              The App is provided &quot;as is&quot; and &quot;as available&quot;, without any
              warranties of any kind — whether express, implied, or statutory. We do not warrant
              that the App will be error-free, uninterrupted, secure, or that the results will be
              accurate, reliable, or suitable for your specific needs.
            </p>
            <p className="mt-2">
              We do not guarantee any specific outcomes from using the suggested rations, including
              but not limited to: weight gain, milk production, egg production, feed conversion
              ratio, cost savings, or animal health. Actual results depend on many factors beyond
              ration composition, including but not limited to animal genetics, health, environment,
              management practices, and feed quality.
            </p>
          </section>

          <section>
            <div className="mb-2 flex items-center gap-2">
              <span className="flex h-9 w-9 items-center justify-center rounded-lg bg-primary/10 text-primary">
                <Megaphone className="h-5 w-5" />
              </span>
              <h2 className="text-lg font-bold">5. Third-Party Ads Disclaimer</h2>
            </div>
            <p>
              The App displays advertisements served by Google AdSense and other third-party
              advertising networks. These ads are delivered dynamically based on your browsing
              history, device information, and other factors determined by the ad networks. We do
              not control which specific ads are shown to you.
            </p>
            <p className="mt-2">
              We do not endorse, and are not responsible for, the products, services, claims, or
              content of any third-party advertisement. Any transactions or interactions you have
              with advertisers are solely between you and the advertiser. We strongly recommend
              conducting your own research before purchasing any product or service advertised
              within the App.
            </p>
            <p className="mt-2">
              You can manage your ad personalization preferences through{" "}
              <a
                href="https://www.google.com/settings/ads"
                target="_blank"
                rel="noopener noreferrer"
                className="font-semibold text-primary hover:underline"
                dir="ltr"
              >
                Google Ads Settings
              </a>
              .
            </p>
          </section>

          <Separator />

          <section>
            <div className="mb-2 flex items-center gap-2">
              <span className="flex h-9 w-9 items-center justify-center rounded-lg bg-primary/10 text-primary">
                <Scale className="h-5 w-5" />
              </span>
              <h2 className="text-lg font-bold">6. Acceptance of Risk</h2>
            </div>
            <p>
              By using Aleeqa, you acknowledge that you have read and understood this disclaimer,
              and that you use the App and its results at your own risk. You agree to hold the
              Aleeqa team harmless from any claims, damages, or losses arising from your reliance on
              the App&apos;s output.
            </p>
            <p className="mt-2">
              For any questions about this disclaimer, please{" "}
              <Link href="/contact" className="font-semibold text-primary hover:underline">
                contact us
              </Link>
              . For our full terms of use, see our{" "}
              <Link href="/terms" className="font-semibold text-primary hover:underline">
                Terms &amp; Conditions
              </Link>
              .
            </p>
          </section>
        </div>
      </ContentPageLayout>
    );
  }

  return (
    <ContentPageLayout title={title}>
      <div className="space-y-6 text-sm leading-relaxed text-foreground">
        <p className="text-muted-foreground">آخر تحديث: يوليو ٢٠٢٥</p>

        <Card className="border-amber-300/60 bg-amber-50/60 dark:border-amber-800/40 dark:bg-amber-950/20">
          <CardContent className="flex items-start gap-3 p-4">
            <AlertTriangle className="mt-0.5 h-5 w-5 shrink-0 text-amber-600 dark:text-amber-400" />
            <p className="text-xs text-foreground/80">
              تطبيق عليقة أداة تقنية تساعد مربي الماشية المصريين على تركيب العلائق الغذائية
              بناءً على البرمجة الخطية ومعايير NRC الغذائية. المعلومات والنتائج المُقدَّمة من
              التطبيق لأغراض تعليمية وإرشادية فقط، ولا تُغني عن الاستشارة البيطرية أو الغذائية
              المهنية.
            </p>
          </CardContent>
        </Card>

        <section>
          <div className="mb-2 flex items-center gap-2">
            <span className="flex h-9 w-9 items-center justify-center rounded-lg bg-primary/10 text-primary">
              <FlaskConical className="h-5 w-5" />
            </span>
            <h2 className="text-lg font-bold">١. تنبيهات غذائية</h2>
          </div>
          <p>
            تركيبات العليقة التي ينتجها تطبيق عليقة مبنية على القيم الغذائية التي تُدخلها لكل
            مكوّن والأهداف الحيوانية المضبوطة في التطبيق. ورغم أننا نوفّر قيماً افتراضية من
            مصادر علمية موثوقة، فإن المحتوى الغذائي الفعلي لمكوّنات الأعلاف يختلف بشكل كبير
            حسب المنطقة، موسم الحصاد، ظروف التخزين، طريقة المعالجة، والجودة. دفعة ذرة صفراء من
            منطقة قد تحمل قيمة بروتين خام أو TDN مختلفة عن القيمة الافتراضية التي نستخدمها.
          </p>
          <p className="mt-2">
            أنت مسؤول عن التحقق من القيم الغذائية وتعديلها لتتناسب مع المكوّنات الفعلية المتاحة
            لك. لا يستطيع التطبيق مراعاة الاختلافات في جودة العلف، أو التلوث (مثل السموم
            الفطرية)، أو العوامل المضادة للتغذية التي قد تكون موجودة في مكوّناتك المحددة.
            افحص العلف بصرياً دائماً وعند الإمكان أجرِ تحليلاً معملياً دقيقاً للقيم الغذائية.
          </p>
          <p className="mt-2">
            نتائج العليقة توصيات عامة لحيوانات سليمة في ظروف إدارة نموذجية. لا تراعي حالة صحة
            الحيوان الفردية، مرحلة الحمل، مرحلة الإدرار، العمر، الوزن، السلالة، إجهاد المناخ،
            أو حالة المرض.
          </p>
        </section>

        <section>
          <div className="mb-2 flex items-center gap-2">
            <span className="flex h-9 w-9 items-center justify-center rounded-lg bg-primary/10 text-primary">
              <BookOpen className="h-5 w-5" />
            </span>
            <h2 className="text-lg font-bold">٢. مراجع NRC والعلمية</h2>
          </div>
          <p>
            الأهداف الغذائية المستخدمة في التطبيق مستمدة من إصدارات المجلس القومي للبحث
            الأمريكي (NRC)، بما يشمل &quot;الاحتياجات الغذائية للأبقار الحلوب&quot;،
            &quot;الاحتياجات الغذائية لأبقار اللحم&quot;، &quot;الاحتياجات الغذائية للمجترات
            الصغيرة&quot;، و&quot;الاحتياجات الغذائية للدواجن&quot;. هذه المعايير مراجع معترف
            بها دولياً في تغذية الحيوان.
          </p>
          <p className="mt-2">
            لكن قيم NRC تم تكييفها للسياق المصري — مع مراعاة المكوّنات العلفية المحلية، ظروف
            المناخ، والسلالات الشائعة. هذه التكييفات تعكس تفسيرنا للعلم للسوق المحلي، وقد تختلف
            عن توصيات NRC الأصلية. للحصول على قيم NRC الأصلية، يُرجى الرجوع إلى إصدارات NRC
            الرسمية مباشرةً.
          </p>
          <div className="mt-3 flex flex-wrap gap-1.5">
            <Badge variant="secondary">NRC للأبقار الحلوب</Badge>
            <Badge variant="secondary">NRC لأبقار اللحم</Badge>
            <Badge variant="secondary">NRC للمجترات الصغيرة</Badge>
            <Badge variant="secondary">NRC للدواجن</Badge>
            <Badge variant="secondary">البرمجة الخطية</Badge>
          </div>
        </section>

        <section>
          <div className="mb-2 flex items-center gap-2">
            <span className="flex h-9 w-9 items-center justify-center rounded-lg bg-primary/10 text-primary">
              <Stethoscope className="h-5 w-5" />
            </span>
            <h2 className="text-lg font-bold">٣. نصيحة الاستشارة المهنية</h2>
          </div>
          <p>
            النتائج التي ينتجها تطبيق عليقة <strong>ليست بديلاً</strong> عن الاستشارة البيطرية
            أو الغذائية المهنية. نوصي بشدة باستشارة طبيب بيطري مرخّص أو أخصائي تغذية حيوان مؤهل،
            خصوصاً في الحالات التالية:
          </p>
          <ul className="ml-4 mt-2 list-disc space-y-1">
            <li>الحيوانات التي تظهر عليها علامات المرض، فقدان الوزن، أو انخفاض الإنتاج</li>
            <li>الحيوانات الحوامل أو في فترة الإدرار ذات الاحتياجات الغذائية الخاصة</li>
            <li>الحيوانات الصغيرة (عجول، حملان، كتاكيت) بجهاز هضمي في طور التكوّن</li>
            <li>المشاريع التجارية واسعة النطاق حيث الأخطاء الصغيرة تتراكم لخسائر كبيرة</li>
            <li>عند إدخال مواد علف جديدة أو تغيير العليقة بشكل كبير</li>
            <li>عند تعرّض الحيوانات لإجهاد بيئي (حرارة، برودة، نقل)</li>
            <li>عند استخدام مكوّنات غير تقليدية أو ثانوية قد تحتوي على عوامل مضادة للتغذية</li>
          </ul>
          <p className="mt-2">
            يمكن للأخصائي تقييم حالتك المحددة، إجراء تحليل للأعلاف، تقييم صحة الحيوان، واقتراح
            علائق مخصصة لاحتياجات قطيعك — خدمات لا يستطيع أداة آلية تقديمها.
          </p>
        </section>

        <section>
          <div className="mb-2 flex items-center gap-2">
            <span className="flex h-9 w-9 items-center justify-center rounded-lg bg-primary/10 text-primary">
              <ShieldX className="h-5 w-5" />
            </span>
            <h2 className="text-lg font-bold">٤. عدم الضمان</h2>
          </div>
          <p>
            يُقدَّم التطبيق &quot;كما هو&quot; و&quot;حسب التوفر&quot;، دون أي ضمانات من أي
            نوع — سواء صريحة أو ضمنية أو قانونية. لا نضمن أن يكون التطبيق خالياً من الأخطاء،
            متاحاً باستمرار، آمناً، أو أن تكون النتائج دقيقة أو موثوقة أو مناسبة لاحتياجاتك
            المحددة.
          </p>
          <p className="mt-2">
            لا نضمن أي نتائج محددة من استخدام العلائق المقترحة، بما يشمل على سبيل المثال لا
            الحصر: زيادة الوزن، إنتاج اللبن، إنتاج البيض، معامل التحويل الغذائي، توفير التكلفة،
            أو صحة الحيوان. النتائج الفعلية تعتمد على عوامل كثيرة تتجاوز تركيب العليقة، تشمل
            الوراثة، الصحة، البيئة، ممارسات الإدارة، وجودة العلف.
          </p>
        </section>

        <section>
          <div className="mb-2 flex items-center gap-2">
            <span className="flex h-9 w-9 items-center justify-center rounded-lg bg-primary/10 text-primary">
              <Megaphone className="h-5 w-5" />
            </span>
            <h2 className="text-lg font-bold">٥. إخلاء مسؤولية الإعلانات الخارجية</h2>
          </div>
          <p>
            يعرض التطبيق إعلانات تُقدَّم من Google AdSense وشبكات إعلانية أخرى لأطراف ثالثة.
            تُعرَض هذه الإعلانات ديناميكياً بناءً على سجل التصفح، معلومات الجهاز، وعوامل أخرى
            تحددها شبكات الإعلان. لا نتحكم في الإعلانات المحددة التي تظهر لك.
          </p>
          <p className="mt-2">
            لا نُؤيد ولا نتحمّل مسؤولية المنتجات أو الخدمات أو الادعاءات أو محتوى أي إعلان لأطراف
            ثالثة. أي معاملات أو تفاعلات تجريها مع المعلنين هي بينك وبين المعلن فقط. نوصي بشدة
            بإجراء بحثك الخاص قبل شراء أي منتج أو خدمة مُعلَن عنها داخل التطبيق.
          </p>
          <p className="mt-2">
            يمكنك إدارة تفضيلات تخصيص الإعلانات من خلال{" "}
            <a
              href="https://www.google.com/settings/ads"
              target="_blank"
              rel="noopener noreferrer"
              className="font-semibold text-primary hover:underline"
              dir="ltr"
            >
              إعدادات إعلانات Google
            </a>
            .
          </p>
        </section>

        <Separator />

        <section>
          <div className="mb-2 flex items-center gap-2">
            <span className="flex h-9 w-9 items-center justify-center rounded-lg bg-primary/10 text-primary">
              <Scale className="h-5 w-5" />
            </span>
            <h2 className="text-lg font-bold">٦. قبول المخاطرة</h2>
          </div>
          <p>
            باستخدامك تطبيق عليقة، فإنك تقرّ بأنك قرأت وفهمت إخلاء المسؤولية هذا، وأنك تستخدم
            التطبيق ونتائجه على مسؤوليتك الخاصة. وتوافق على إعفاء فريق عليقة من أي مطالبات أو
            أضرار أو خسائر تنشأ عن اعتمادك على مخرجات التطبيق.
          </p>
          <p className="mt-2">
            لأي أسئلة حول إخلاء المسؤولية هذا، يُرجى{" "}
            <Link href="/contact" className="font-semibold text-primary hover:underline">
              التواصل معنا
            </Link>
            . للاطلاع على الشروط الكاملة للاستخدام، راجع{" "}
            <Link href="/terms" className="font-semibold text-primary hover:underline">
              الشروط والأحكام
            </Link>
            .
          </p>
        </section>
      </div>
    </ContentPageLayout>
  );
}
