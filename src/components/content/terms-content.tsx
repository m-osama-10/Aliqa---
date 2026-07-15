"use client";

import { ScrollText, ShieldCheck, Mail } from "lucide-react";
import Link from "next/link";
import { Card, CardContent } from "@/components/ui/card";
import { ContentPageLayout } from "./content-page-layout";
import { useLang } from "@/lib/i18n";

export function TermsContent() {
  const { lang } = useLang();
  const isRtl = lang === "ar";
  const title = isRtl ? "الشروط والأحكام" : "Terms & Conditions";

  if (!isRtl) {
    return (
      <ContentPageLayout title={title}>
        <div className="space-y-6 text-sm leading-relaxed text-foreground">
          <p className="text-muted-foreground">Last updated: July 2025</p>

          <Card className="border-primary/20 bg-primary/5">
            <CardContent className="flex items-start gap-3 p-4">
              <ScrollText className="mt-0.5 h-5 w-5 shrink-0 text-primary" />
              <p className="text-xs text-muted-foreground">
                Please read these terms carefully before using the Aleeqa app. By accessing or
                using the app, you agree to be bound by these Terms &amp; Conditions. If you do
                not agree with any part of these terms, please do not use the app.
              </p>
            </CardContent>
          </Card>

          <section>
            <h2 className="mb-2 text-lg font-bold">1. Acceptance of Terms</h2>
            <p>
              By using the Aleeqa application (&quot;the App&quot;, &quot;we&quot;, or &quot;us&quot;),
              you confirm that you have read, understood, and agree to these Terms &amp; Conditions
              in full. If you do not agree, you must immediately discontinue use of the App. These
              terms apply to all visitors, users, and others who access or use the App.
            </p>
            <p className="mt-2">
              If you are using the App on behalf of an organization or farm, you represent that you
              have the authority to bind that entity to these terms.
            </p>
          </section>

          <section>
            <h2 className="mb-2 text-lg font-bold">2. Use License</h2>
            <p>
              Aleeqa is provided free of charge for personal and professional use in animal feed
              formulation. We grant you a limited, non-exclusive, non-transferable license to use
              the App for lawful purposes in accordance with these terms.
            </p>
            <p className="mt-2">You agree NOT to:</p>
            <ul className="ml-4 list-disc space-y-1">
              <li>Modify, adapt, reverse-engineer, or decompile any part of the App&apos;s source code or algorithms</li>
              <li>Use the App for any illegal activity or in violation of applicable local laws</li>
              <li>Resell, sublicense, or redistribute the App or any derived content without written permission</li>
              <li>Attempt to disrupt, overload, or attack the App&apos;s infrastructure or supporting services</li>
              <li>Remove or alter any copyright, trademark, or proprietary notices</li>
            </ul>
            <p className="mt-2">
              The App is supported by advertisements served via Google AdSense. You acknowledge that
              ads are part of the service and may be personalized based on your browsing activity
              subject to Google&apos;s policies.
            </p>
          </section>

          <section>
            <h2 className="mb-2 text-lg font-bold">3. Disclaimers</h2>
            <p>
              The App provides feed ration formulations based on Linear Programming optimization
              and National Research Council (NRC) nutritional standards, adjusted for the Egyptian
              market. The results are intended as a technical reference to assist you in feed
              formulation and do not constitute veterinary, nutritional, or professional advice.
            </p>
            <p className="mt-2">
              We do not guarantee that the results will meet your specific requirements, that the
              App will be uninterrupted or error-free, or that any defect will be corrected. Actual
              animal performance depends on many factors beyond ration composition, including
              health, environment, management, and genetics.
            </p>
            <p className="mt-2">
              Always consult a qualified veterinary nutritionist or animal production specialist
              before making significant changes to your animals&apos; diet, especially for
              production animals or in cases of illness.
            </p>
          </section>

          <section>
            <h2 className="mb-2 text-lg font-bold">4. Limitation of Liability</h2>
            <p>
              To the maximum extent permitted by applicable law, the Aleeqa team and its members
              shall not be liable for any direct, indirect, incidental, consequential, special, or
              exemplary damages arising from your use of, or inability to use, the App. This
              includes, but is not limited to, loss of animals, decreased production, financial
              loss, or business interruption.
            </p>
            <p className="mt-2">
              You use the App solely at your own risk and are responsible for verifying the
              suitability of any ration for your specific animals and conditions before applying it
              in practice.
            </p>
          </section>

          <section>
            <h2 className="mb-2 text-lg font-bold">5. Privacy and Data</h2>
            <p>
              Your use of the App is also governed by our Privacy Policy, which describes how we
              handle any data you provide. The App stores most user data (prices, saved rations,
              preferences) locally in your browser and does not transmit it to our servers unless
              you create an optional account.
            </p>
            <p className="mt-2">
              For full details, please review our{" "}
              <Link href="/privacy" className="font-semibold text-primary hover:underline">
                Privacy Policy
              </Link>
              .
            </p>
          </section>

          <section>
            <h2 className="mb-2 text-lg font-bold">6. Intellectual Property</h2>
            <p>
              All content provided by the App — including but not limited to text, graphics, the
              feed ingredient database, nutritional values, articles, logos, and software code — is
              the property of the Aleeqa team or its licensors and is protected by Egyptian and
              international intellectual property laws.
            </p>
            <p className="mt-2">
              The nutritional standards (NRC) referenced are publicly available scientific
              guidelines; their application within the App is our own interpretation for the
              Egyptian context.
            </p>
          </section>

          <section>
            <h2 className="mb-2 text-lg font-bold">7. Third-Party Services</h2>
            <p>
              The App uses third-party services, including Google AdSense for advertising and
              Supabase for optional authentication. These services have their own terms and privacy
              policies. We are not responsible for the practices or content of these third parties.
            </p>
            <p className="mt-2">
              Third-party advertisements may be displayed within the App. We do not endorse and are
              not responsible for the products or services advertised.
            </p>
          </section>

          <section>
            <h2 className="mb-2 text-lg font-bold">8. Changes to These Terms</h2>
            <p>
              We reserve the right to modify these Terms &amp; Conditions at any time. Any changes
              will be effective immediately upon posting the updated version on this page, with an
              updated revision date. Your continued use of the App after any change constitutes
              acceptance of the new terms.
            </p>
            <p className="mt-2">
              We encourage you to review this page periodically to stay informed of any updates.
            </p>
          </section>

          <section>
            <h2 className="mb-2 text-lg font-bold">9. Termination</h2>
            <p>
              We may suspend or terminate your access to the App at any time, with or without cause
              or notice, if we believe you have violated these terms or for any other reason. Upon
              termination, all licenses granted to you will immediately cease.
            </p>
          </section>

          <section>
            <h2 className="mb-2 text-lg font-bold">10. Governing Law &amp; Contact</h2>
            <p>
              These terms are governed by the laws of the Arab Republic of Egypt. Any disputes
              arising from your use of the App shall be resolved in the Egyptian courts.
            </p>
            <p className="mt-2">
              For any questions regarding these Terms &amp; Conditions, please{" "}
              <Link href="/contact" className="font-semibold text-primary hover:underline">
                contact us
              </Link>
              .
            </p>
          </section>

          <Card className="border-border/60 bg-secondary/30">
            <CardContent className="flex items-start gap-3 p-4">
              <ShieldCheck className="mt-0.5 h-5 w-5 shrink-0 text-primary" />
              <p className="text-xs text-muted-foreground">
                By continuing to use Aleeqa, you acknowledge that you have read, understood, and
                agreed to all of the above Terms &amp; Conditions.
              </p>
            </CardContent>
          </Card>

          <div className="flex items-center justify-center gap-1.5 text-xs text-muted-foreground">
            <Mail className="h-3.5 w-3.5 text-primary" />
            <Link href="/contact" className="font-semibold text-primary hover:underline">
              Questions? Contact us
            </Link>
          </div>
        </div>
      </ContentPageLayout>
    );
  }

  return (
    <ContentPageLayout title={title}>
      <div className="space-y-6 text-sm leading-relaxed text-foreground">
        <p className="text-muted-foreground">آخر تحديث: يوليو ٢٠٢٥</p>

        <Card className="border-primary/20 bg-primary/5">
          <CardContent className="flex items-start gap-3 p-4">
            <ScrollText className="mt-0.5 h-5 w-5 shrink-0 text-primary" />
            <p className="text-xs text-muted-foreground">
              يُرجى قراءة هذه الشروط بعناية قبل استخدام تطبيق عليقة. باستخدامك للتطبيق أو
              الوصول إليه، فإنك توافق على الالتزام بهذه الشروط والأحكام. إذا كنت لا توافق على
              أي جزء منها، يُرجى عدم استخدام التطبيق.
            </p>
          </CardContent>
        </Card>

        <section>
          <h2 className="mb-2 text-lg font-bold">١. قبول الشروط</h2>
          <p>
            باستخدامك لتطبيق &quot;عليقة&quot; (&quot;التطبيق&quot;، أو &quot;نحن&quot;)، فإنك
            تؤكد أنك قرأت وفهمت ووافقت على هذه الشروط والأحكام بالكامل. إذا كنت لا توافق، يجب
            عليك التوقف فوراً عن استخدام التطبيق. تنطبق هذه الشروط على كل زائر أو مستخدم
            أو غيره ممن يصل إلى التطبيق أو يستخدمه.
          </p>
          <p className="mt-2">
            إذا كنت تستخدم التطبيق نيابةً عن مؤسسة أو مزرعة، فإنك تقر بأنك مخوّل بإلزام تلك
            الجهة بهذه الشروط.
          </p>
        </section>

        <section>
          <h2 className="mb-2 text-lg font-bold">٢. ترخيص الاستخدام</h2>
          <p>
            يُقدَّم تطبيق عليقة مجاناً للاستخدام الشخصي والمهني في تركيب العلائق الغذائية.
            نمنحك ترخيصاً محدوداً غير حصري وغير قابل للتحويل لاستخدام التطبيق لأغراض مشروعة
            وفقاً لهذه الشروط.
          </p>
          <p className="mt-2">تلتزم بعدم القيام بما يلي:</p>
          <ul className="ml-4 list-disc space-y-1">
            <li>تعديل أو تكييف أو هندسة عكسية أو فك تشفير أي جزء من شيفرة التطبيق أو خوارزمياته</li>
            <li>استخدام التطبيق في أي نشاط غير قانوني أو مخالف للقوانين المحلية المعمول بها</li>
            <li>إعادة بيع أو ترخيص من الباطن أو توزيع التطبيق أو أي محتوى مشتق منه دون إذن كتابي</li>
            <li>محاولة تعطيل أو إجهاد أو مهاجمة بنية التطبيق التحتية أو الخدمات الداعمة</li>
            <li>إزالة أو تغيير أي إشعارات حقوق ملكية أو علامات تجارية</li>
          </ul>
          <p className="mt-2">
            يُدعَم التطبيق بإعلانات تُعرَض عبر Google AdSense. وتقرّ بأن الإعلانات جزء من
            الخدمة وقد تكون مخصصة بناءً على نشاطك في التصفح وفقاً لسياسات Google.
          </p>
        </section>

        <section>
          <h2 className="mb-2 text-lg font-bold">٣. إخلاء المسؤولية</h2>
          <p>
            يُقدّم التطبيق تركيبات علف مبنية على تحسين البرمجة الخطية (Linear Programming)
            ومعايير المجلس القومي للبحث الأمريكي (NRC) الغذائية، مُعدَّلة للسوق المصري.
            النتائج تُعدّ مرجعاً تقنياً لمساعدتك في تركيب العليقة، ولا تُعدّ استشارة بيطرية أو
            غذائية أو مهنية.
          </p>
          <p className="mt-2">
            لا نضمن أن النتائج ستلبي متطلباتك المحددة، أو أن التطبيق سيعمل دون انقطاع أو أخطاء،
            أو أن أي عيب سيُصحَّح. الأداء الفعلي للحيوان يعتمد على عوامل كثيرة تتجاوز تركيب
            العليقة، تشمل الصحة، البيئة، الإدارة، والوراثة.
          </p>
          <p className="mt-2">
            استشر دائماً أخصائي تغذية بيطري مؤهل أو اختصاصي إنتاج حيواني قبل إجراء تغييرات
            كبيرة على نظام حيواناتك الغذائي، خصوصاً لحيوانات الإنتاج أو في حالات المرض.
          </p>
        </section>

        <section>
          <h2 className="mb-2 text-lg font-bold">٤. حدود المسؤولية</h2>
          <p>
            إلى أقصى حد يسمح به القانون المعمول به، لا يتحمّل فريق عليقة وأعضاؤه أي مسؤولية عن
            أي أضرار مباشرة أو غير مباشرة أو عرضية أو تبعية أو خاصة أو استثنائية تنشأ عن
            استخدامك للتطبيق أو عجزك عن استخدامه. يشمل ذلك، على سبيل المثال لا الحصر، فقدان
            الحيوانات، أو انخفاض الإنتاج، أو الخسارة المالية، أو انقطاع النشاط.
          </p>
          <p className="mt-2">
            تستخدم التطبيق على مسؤوليتك الخاصة بالكامل، وتتحمل مسؤولية التحقق من ملاءمة أي
            عليقة لحيواناتك ولظروفك المحددة قبل تطبيقها فعلياً.
          </p>
        </section>

        <section>
          <h2 className="mb-2 text-lg font-bold">٥. الخصوصية والبيانات</h2>
          <p>
            يخضع استخدامك للتطبيق أيضاً لسياسة الخصوصية الخاصة بنا، التي توضّح كيفية تعاملنا
            مع أي بيانات تقدّمها. يخزّن التطبيق معظم بيانات المستخدم (الأسعار، العلائق
            المحفوظة، التفضيلات) محلياً في متصفحك ولا يرسلها إلى خوادمنا إلا إذا أنشأت حساباً
            اختيارياً.
          </p>
          <p className="mt-2">
            للتفاصيل الكاملة، يُرجى الاطلاع على{" "}
            <Link href="/privacy" className="font-semibold text-primary hover:underline">
              سياسة الخصوصية
            </Link>
            .
          </p>
        </section>

        <section>
          <h2 className="mb-2 text-lg font-bold">٦. الملكية الفكرية</h2>
          <p>
            كل المحتوى المُقدَّم من التطبيق — بما في ذلك على سبيل المثال لا الحصر النصوص،
            الرسومات، قاعدة بيانات المكوّنات، القيم الغذائية، المقالات، الشعارات، والشيفرة
            البرمجية — هو ملك لفريق عليقة أو مرخّصيه ومحمي بقوانين الملكية الفكرية المصرية
            والدولية.
          </p>
          <p className="mt-2">
            المعايير الغذائية (NRC) المرجعية هي إرشادات علمية متاحة للعموم؛ أما تطبيقها داخل
            التطبيق فهو تفسيرنا الخاص للسياق المصري.
          </p>
        </section>

        <section>
          <h2 className="mb-2 text-lg font-bold">٧. خدمات الأطراف الثالثة</h2>
          <p>
            يستخدم التطبيق خدمات أطراف ثالثة، تشمل Google AdSense للإعلانات وSupabase للمصادقة
            الاختيارية. لهذه الخدمات شروط وسياسات خصوصية خاصة بها. لسنا مسؤولين عن ممارسات أو
            محتوى هذه الأطراف الثالثة.
          </p>
          <p className="mt-2">
            قد تُعرَض إعلانات أطراف ثالثة داخل التطبيق. لا نُؤيد ولا نتحمّل مسؤولية المنتجات
            أو الخدمات المُعلَن عنها.
          </p>
        </section>

        <section>
          <h2 className="mb-2 text-lg font-bold">٨. التغييرات على هذه الشروط</h2>
          <p>
            نحتفظ بالحق في تعديل هذه الشروط والأحكام في أي وقت. تسري أي تغييرات فوراً عند نشر
            النسخة المُحدَّثة على هذه الصفحة مع تحديث تاريخ المراجعة. استمرارك في استخدام
            التطبيق بعد أي تغيير يُعدّ قبولاً للشروط الجديدة.
          </p>
          <p className="mt-2">
            ننصحك بمراجعة هذه الصفحة بشكل دوري للبقاء على اطلاع بأي تحديثات.
          </p>
        </section>

        <section>
          <h2 className="mb-2 text-lg font-bold">٩. الإنهاء</h2>
          <p>
            قد نُعلّق أو نُنهي وصولك إلى التطبيق في أي وقت، مع أو بدون سبب أو إشعار، إذا اعتقدنا
            أنك انتهكت هذه الشروط أو لأي سبب آخر. عند الإنهاء، تنتهي فوراً جميع التراخيص
            الممنوحة لك.
          </p>
        </section>

        <section>
          <h2 className="mb-2 text-lg font-bold">١٠. القانون الحاكم والتواصل</h2>
          <p>
            تخضع هذه الشروط لقوانين جمهورية مصر العربية. أي نزاعات تنشأ عن استخدامك للتطبيق
            تُحلّ أمام المحاكم المصرية.
          </p>
          <p className="mt-2">
            لأي أسئلة تتعلق بهذه الشروط والأحكام، يُرجى{" "}
            <Link href="/contact" className="font-semibold text-primary hover:underline">
              التواصل معنا
            </Link>
            .
          </p>
        </section>

        <Card className="border-border/60 bg-secondary/30">
          <CardContent className="flex items-start gap-3 p-4">
            <ShieldCheck className="mt-0.5 h-5 w-5 shrink-0 text-primary" />
            <p className="text-xs text-muted-foreground">
              باستمرارك في استخدام عليقة، فإنك تقرّ بأنك قرأت وفهمت ووافقت على جميع الشروط
              والأحكام أعلاه.
            </p>
          </CardContent>
        </Card>

        <div className="flex items-center justify-center gap-1.5 text-xs text-muted-foreground">
          <Mail className="h-3.5 w-3.5 text-primary" />
          <Link href="/contact" className="font-semibold text-primary hover:underline">
            لديك أسئلة؟ تواصل معنا
          </Link>
        </div>
      </div>
    </ContentPageLayout>
  );
}
