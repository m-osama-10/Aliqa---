"use client";

import {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useMemo,
  useSyncExternalStore,
  type ReactNode,
} from "react";

export type Lang = "ar" | "en";

/* ================================================================== */
/*  DICTIONARY                                                         */
/*  Access via t("key.path"). Keys are flat dot-paths.                */
/* ================================================================== */

const DICT: Record<Lang, Record<string, string>> = {
  ar: {
    // ---- common ----
    "common.app_name": "عليقة",
    "common.app_sub": "حاسبة العليقة الذكية",
    "common.offline": "أوفلاين",
    "common.free_offline": "مجاني · يعمل أوفلاين · للمربي المصري",
    "common.egp": "ج.م",
    "common.kg": "كجم",
    "common.day": "يوم",
    "common.month": "شهر",
    "common.save": "حفظ",
    "common.share": "مشاركة",
    "common.print": "طباعة",
    "common.cancel": "إلغاء",
    "common.delete": "حذف",
    "common.close": "إغلاق",
    "common.reset": "افتراضي",
    "common.updated": "آخر تحديث",
    "common.default_prices": "أسعار افتراضية",
    "common.back_home": "الصفحة الرئيسية",
    "common.start_calc": "ابدأ الحساب",
    "common.start_now": "ابدأ حساب العليقة الآن",
    "common.pdf": "تصدير PDF للطباعة",
    "common.whatsapp": "مشاركة عبر واتساب",

    // ---- nav tabs ----
    "nav.calculator": "الحاسبة",
    "nav.prices": "الأسعار",
    "nav.rations": "علائقي",
    "nav.about": "حول",
    "nav.profile": "حسابي",
    "nav.admin": "الإدارة",

    // ---- common extra ----
    "common.guest": "ضيف",
    "common.signin": "دخول",
    "common.online": "متصل",
    "common.syncing": "مزامنة...",
    "common.synced": "تمت المزامنة",
    "common.pending": "بانتظار المزامنة",
    "common.maintenance": "الصيانة جارية",
    "common.ad": "إعلان",
    "common.dismiss": "إغلاق",
    "common.head_unit": "رأس",
    "common.toggle_lang_aria": "تبديل اللغة",
    "lang.toggle_hint": "Switch to English",

    // ---- calculator stepper / nav ----
    "calc.stepper.animal": "الحيوان",
    "calc.stepper.data": "البيانات",
    "calc.stepper.items": "المواد",
    "calc.stepper.mode": "الوضع",
    "calc.stepper.prices": "الأسعار",
    "calc.stepper.result": "النتيجة",
    "calc.next": "التالي",
    "calc.back": "السابق",
    "calc.calculate": "احسب العليقة",
    "calc.start_over": "ابدأ من جديد",
    "calc.edit_data": "تعديل البيانات",
    "calc.manual_suffix": "يدوية",
    "calc.flock_up_to": "حتى {n} (اكتب الرقم مباشرة)",
    "calc.ingredients_title": "اختيار المواد الخام",
    "calc.ingredient_mode.auto": "تلقائي",
    "calc.ingredient_mode.auto_sub": "النظام يختار الأفضل",
    "calc.ingredient_mode.manual": "يدوي",
    "calc.ingredient_mode.manual_sub": "أختار بنفسي",
    "calc.ingredient_select_hint": "اختر المواد المتوفرة لديك. سيتم استخدامها فقط في الحسابات.",
    "calc.ingredient_select_at_least": "اختر مادة واحدة على الأقل",
    "calc.ingredient_selected_count": "المختار: {n} مادة",
    "calc.ingredient_auto_info": "النظام سيستخدم جميع المواد المناسبة تلقائياً",
    "calc.ingredient_auto_count": "{n} مادة متاحة",
    "calc.cp": "بروتين",
    "calc.tdn": "طاقة",
    "calc.egp_per_kg": "ج/كجم",

    // ---- landing ----
    "landing.hero.title1": "من الورقة والقلم إلى",
    "landing.hero.title2": "عليقة ذكية",
    "landing.hero.title3": "في جيب كل مربي",
    "landing.hero.desc":
      "خطة منتج متكاملة: أداة حسابية مجانية تخدم المربي، ونموذج أعمال متعدد المصادر يخدم الأعمال، وتقنية أوفلاين تناسب الواقع المصري. جاهزة للتنفيذ على مراحل.",
    "landing.hero.why_btn": "ليه أستخدم التطبيق؟",
    "landing.hero.stat_animals": "أنواع حيوانات",
    "landing.hero.stat_ingredients": "مكوّنات سوق",
    "landing.hero.stat_offline": "بدون إنترنت",
    "landing.animals_strip": "يدعم أنواع الإنتاج الرئيسية في مصر",
    "landing.why.eyebrow": "ليه تستخدم التطبيق",
    "landing.why.title": "لأن المربي المصري يستاهل أداة",
    "landing.why.title_hl": "علمية ومجانية",
    "landing.why.desc":
      "بدل ما تحسب العليقة على ورقة بقلم وتعتمد على التجربة والخطأ، عليقة تحسبها لك بدقة علمية وبأقل تكلفة — في ثوانٍ وبدون إنترنت.",
    "landing.why.b1.t": "دقة علمية حقيقية",
    "landing.why.b1.d":
      "محرك برمجة خطية (Linear Programming) يحسب أرخص عليقة متوازنة تحقق احتياجات الحيوان من البروتين والطاقة والألياف.",
    "landing.why.b2.t": "توفير مالي يومي",
    "landing.why.b2.d":
      "الموازن الاقتصادي يرتّب المكوّنات البديلة الأرخص التي تحقق نفس القيمة الغذائية، ويوريك التوفير بالجنيه يومياً وشهرياً.",
    "landing.why.b3.t": "يعمل بدون إنترنت",
    "landing.why.b3.d":
      "كل الحسابات والأسعار والعلائق محفوظة على جهازك. مناسبة للمزارع في المناطق اللي شبكتها ضعيفة.",
    "landing.why.b4.t": "أسعار سوقك أنت",
    "landing.why.b4.d":
      "تحدّث أسعار الذرة والصويا والردة والتبن بأسعار سوقك الأسبوعي، والتركيبة تتعدّل لحظياً.",
    "landing.why.b5.t": "شارك العليقة فوراً",
    "landing.why.b5.d":
      "ابعت التركيبة للعامل في المزرعة عبر واتساب، أو احفظها واطبعها. كل عليقة محفوظة لرجوع ليها بعدين.",
    "landing.why.b6.t": "مجاني وبدون إعلانات",
    "landing.why.b6.d":
      "أداة حسابية بحتة، لا تبيع ولا تورد مستلزمات. بياناتك كلها على جهازك، مفيش تسجيل ولا حسابات.",
    "landing.how.eyebrow": "إزاي يشتغل",
    "landing.how.title": "ثلاث خطوات وبس",
    "landing.how.s1.t": "اختار الحيوان والوزن",
    "landing.how.s1.d": "بقرة حلوب، جاموس، خروف، دجاج بياض، أو دجاج تسمين — وحدد الوزن والإنتاج.",
    "landing.how.s2.t": "تأكد من أسعار اليوم",
    "landing.how.s2.d": "الأسعار الافتراضية موجودة، عدّلها بأسعار سوقك عشان تحسب صح.",
    "landing.how.s3.t": "استلم التركيبة",
    "landing.how.s3.d": "شوف الكميات والنسب والتكلفة اليومية والشهرية، وشاركها أو احفظها.",
    "landing.features.eyebrow": "المزايا",
    "landing.features.title": "كل اللي محتاجه المربي في مكان واحد",
    "landing.features.f1.t": "حاسبة العليقة الذكية",
    "landing.features.f1.p1": "تركيبة لحظية بالكجم والنسبة",
    "landing.features.f1.p2": "بروتين وطاقة وألياف محسوبة",
    "landing.features.f1.p3": "رسم بياني واضح",
    "landing.features.f2.t": "الموازن الاقتصادي",
    "landing.features.f2.p1": "عليقة متوازنة أو اقتصادية",
    "landing.features.f2.p2": "حساب التوفير اليومي والشهري",
    "landing.features.f2.p3": "بدائل أرخص بنفس القيمة",
    "landing.features.f3.t": "إدارة الأسعار",
    "landing.features.f3.p1": "أسعار قابلة للتعديل",
    "landing.features.f3.p2": "تُحفظ تلقائياً على جهازك",
    "landing.features.f3.p3": "تتحدث بأسعار سوقك",
    "landing.features.f4.t": "حفظ ومشاركة",
    "landing.features.f4.p1": "سجل علائق محفوظة",
    "landing.features.f4.p2": "مشاركة عبر واتساب",
    "landing.features.f4.p3": "طباعة التركيبة",

    // ---- what's new section (highlights recent features) ----
    "landing.new.eyebrow": "جديد",
    "landing.new.title": "آخر التحديثات والمزايا الجديدة",
    "landing.new.subtitle": "إضافات وتحسينات مهمة لإطلاق أفضل وأدق",
    "landing.new.n1.t": "معالج من ٦ خطوات",
    "landing.new.n1.d": "واجهة مرتبة بخطوات واضحة: الحيوان ← البيانات ← الخامات ← الوضع ← الأسعار ← النتيجة",
    "landing.new.n2.t": "المحرر اليدوي بالبطاقات",
    "landing.new.n2.d": "تعديل النسب بكروت منظمة حسب الفئة (طاقة/بروتين/ألياف...) مع شريط تمرير وزر قفل لكل مادة",
    "landing.new.n3.t": "التوزيع الذكي للنسب",
    "landing.new.n3.d": "لما تزود أو تقلّل أي مادة، باقي الخامات تتعدّل تلقائياً عشان المجموع يفضل 100%",
    "landing.new.n4.t": "إعادة التوازن الذكي",
    "landing.new.n4.d": "زر واحد يعيد تشغيل محلل البرمجة الخطية مع احترام الخامات المقفلة والحدود",
    "landing.new.n5.t": "مقارنة العليقات",
    "landing.new.n5.d": "قارن عليقتين جنباً إلى جنب: البروتين، الطاقة، التكلفة، والمكوّنات",
    "landing.new.n6.t": "طباعة وتقرير PDF",
    "landing.new.n6.d": "اطبع تركيبة العليقة بتقرير A4 منسّق بالعربي والإنجليزي للمشاركة أو الأرشفة",

    "landing.cta.title": "جاهز تحسب عليقتك بأقل تكلفة؟",
    "landing.cta.desc": "ادخل الحاسبة دلوقتي — مجاني، بدون تسجيل، وبيشتغل بدون إنترنت.",
    "landing.footer.tagline": "أداة حسابية مجانية للمربي المصري",
    "landing.footer.offline_note": "يعمل أوفلاين · بياناتك على جهازك",

    // ---- calculator ----
    "calc.s1.title": "اختر الحيوان وحالته الإنتاجية",
    "calc.s2.title": "بيانات الحيوان",
    "calc.weight": "الوزن",
    "calc.production": "إنتاج اللبن اليومي",
    "calc.dmi_label": "المادة الجافة المتناولة (DMI)",
    "calc.dmi_flock_suffix": " — للقطيع",
    "calc.s3.title": "الموازن الاقتصادي",
    "calc.s3.tip":
      "الوضع الاقتصادي يرخي أهداف البروتين والطاقة والألياف الخشنة قليلاً فيختار المحرك بدائل أرخص — وتشوف الكميات تتغير والتوفير بالجنيه.",
    "calc.balanced": "عليقة متوازنة",
    "calc.balanced_sub": "تحقق كل الأهداف الغذائية",
    "calc.economy": "عليقة اقتصادية",
    "calc.economy_sub": "أرخص بديل بنفس القيمة تقريباً",
    "calc.diff_label": "الفرق عن المتوازنة:",
    "calc.s4.title": "أسعار اليوم (قابلة للتعديل)",
    "calc.s4.hint": "غيّر السعر مباشرة — التركيبة تتحسب فوراً بأسعار سوقك. الأسعار تُحفظ تلقائياً على جهازك.",
    "calc.result_title": "التركيبة المقترحة",
    "calc.result_manual": "التركيبة (تعديل يدوي)",
    "calc.lp_badge": "محسوبة بالبرمجة الخطية",
    "calc.manual_badge": "تعديل يدوي",
    "calc.edit_btn": "تعديل النسب يدوياً",
    "calc.reset_auto": "رجوع للحساب التلقائي",
    "calc.manual_toast": "وضع التعديل اليدوي — عدّل النسب وشاهد التغيير لحظياً",
    "calc.saved_toast": "تم حفظ العليقة في قائمة علائقك",
    "calc.no_export": "لا يوجد تركيبة للتصدير",
    "calc.no_save": "لا يمكن حفظ عليقة غير قابلة للتركيب",
    "calc.save_fail": "تعذّر الحفظ — امسح علائق قديمة وحاول مرة أخرى",
    "calc.saved_count": "لديك {n} عليقة محفوظة",
    "calc.disclaimer":
      "القيم تقريبية لأغراض إرشادية على أساس الوزن كما يُقدَّم. للقطعان الإنتاجية الكبيرة أو حالات خاصة (حمل، مرض، تغيير مفاجئ في الإنتاج) استشر أخصائي تغذية. الأهداف الغذائية مبنية على متوسطات NRC ومعدّلة للسوق المصري.",

    // ---- manual editor ----
    "manual.protein": "البروتين",
    "manual.energy": "الطاقة",
    "manual.fiber": "الألياف",
    "manual.cost_day": "التكلفة/يوم",
    "manual.sum_label": "مجموع النسب",
    "manual.over": "زائد {n}% — قلّل النسب",
    "manual.under": "ناقص {n}% — زود النسب",
    "manual.save": "حفظ العليقة",
    "manual.rebalance": "إعادة التوازن الذكي",
    "manual.reset": "إعادة ضبط العليقة",
    "manual.lock": "تثبيت",
    "manual.unlock": "إلغاء التثبيت",
    "manual.bounds": "{min}% - {max}%",
    "manual.kg": "كجم",
    "manual.egp": "ج.م",
    "manual.target_deviation": "الانحراف عن الهدف",
    "manual.components_count": "{n} مكوّن",
    "manual.no_adjustable": "جميع الخامات مثبتة — لا يمكن إعادة التوزيع",
    "manual.rebalance_success": "تم إعادة التوازن بنجاح — تم تحديث النسب والمؤشرات",
    "manual.rebalance_failed": "تعذر إيجاد حل يحقق القيود الحالية. جرّب فك بعض المواد المقفلة أو تعديل الحدود.",
    "manual.rebalance_running": "جارٍ إعادة حساب العليقة...",
    "manual.auto_balance": "موازنة تلقائية ذكية",
    "manual.auto_balance_sub": "ثبّت الخامات🔒 ويعدّل الباقي تلقائياً",
    "manual.locked_count": "مثبت",

    // ---- ration result ----
    "result.dmi_day": "المادة الجافة/اليوم",
    "result.protein": "البروتين الخام",
    "result.energy": "الطاقة (TDN)",
    "result.fiber": "الألياف الخام",
    "result.target_ge": "الهدف ≥ {n}%",
    "result.max_le": "الأقصى {n}%",
    "result.cost_daily": "التكلفة اليومية",
    "result.cost_flock": "للقطيع",
    "result.cost_per_kg": "تكلفة الكيلوجرام",
    "result.cost_per_head": "تكلفة الرأس الواحد/يوم",
    "result.cost_per_bird": "تكلفة الطائر الواحد/يوم",
    "result.savings": "التوفير",
    "result.savings_sub": "{n}% أقل يومياً",
    "result.components_title": "تفصيل المكوّنات",
    "result.chart_title": "نسب التركيبة",
    "result.infeasible": "تعذّر تركيب عليقة بهذه القيود",
    "result.heads_in_flock": "عدد الرؤوس في القطيع",
    "result.birds_in_flock": "عدد الطيور في القطيع",

    // ---- prices screen ----
    "prices.title": "أسعار خامات السوق المصري",
    "prices.subtitle_count": "{n} عليقة محفوظة على جهازك",
    "prices.subtitle_none": "أسعار افتراضية — عدّلها بأسعار سوقك",
    "prices.default_hint": "السعر الافتراضي: {n} ج.م/كجم",
    "prices.note":
      "تُحفظ الأسعار على جهازك تلقائياً ويعمل التطبيق بدون إنترنت. عند توفّر الشبكة يمكنك تحديثها يدوياً بأسعار سوقك الأسبوعي. التركيبة تُعاد لحظياً مع كل تغيير سعر.",
    "prices.invalid": "أدخل سعراً صحيحاً",
    "prices.saved": "تم تحديث سعر {name}",
    "prices.reset_done": "تمت إعادة الأسعار للقيم الافتراضية",
    "prices.ingredient_db_title": "قاعدة بيانات المواد الخام",
    "prices.reset_btn": "إعادة ضبط",
    "prices.reset_confirm": "إعادة كل القيم للافتراضية؟",
    "prices.edit_hint": "اضغط على أي مادة لتعديل القيم الغذائية والسعر. التغييرات تُحفظ وتُستخدم فوراً في الحسابات.",
    "prices.search_placeholder": "بحث...",
    "prices.editable_hint": "💡 جميع القيم قابلة للتعديل وتُحفظ على جهازك",
    "prices.cp_label": "بروتين",
    "prices.tdn_label": "طاقة",
    "prices.cf_label": "ألياف",
    "prices.egp_per_kg_short": "ج/كجم",
    "prices.edit_nutrition": "تعديل القيم الغذائية",
    "prices.price_field": "السعر (جنيه/كجم)",
    "prices.protein_field": "بروتين خام (CP %)",
    "prices.tdn_field": "طاقة (TDN %)",
    "prices.fiber_field": "ألياف خام (CF %)",
    "prices.fat_field": "دهون (EE %)",
    "prices.calcium_field": "كالسيوم (Ca %)",
    "prices.phosphorus_field": "فوسفور (P %)",
    "prices.dm_field": "مادة جافة (DM %)",
    "prices.min_usage_field": "أدنى استخدام (%)",
    "prices.max_usage_field": "أقصى استخدام (%)",

    // ---- rations screen ----
    "rations.title": "العلائق المحفوظة",
    "rations.subtitle_n": "{n} عليقة محفوظة على جهازك",
    "rations.subtitle_0": "لا توجد علائق محفوظة بعد",
    "rations.empty_title": "لا توجد علائق محفوظة",
    "rations.empty_desc": "احسب عليقة من تبويب «الحاسبة» ثم اضغط «حفظ العليقة» لتظهر هنا.",
    "rations.view": "عرض",
    "rations.delete": "حذف",
    "rations.delete_title": "حذف العليقة؟",
    "rations.delete_desc": "لا يمكن التراجع عن هذا الإجراء. العليقة ستُحذف من جهازك نهائياً.",
    "rations.deleted_toast": "تم حذف العليقة",
    "rations.copied_toast": "تم نسخ التركيبة",
    "rations.copy_fail": "تعذّر النسخ",
    "rations.mode_balanced": "متوازنة",
    "rations.mode_economy": "اقتصادية",
    "rations.compare_btn": "مقارنة علقتين",
    "rations.compare_exit": "إنهاء المقارنة",
    "rations.compare_title": "مقارنة العلائق",
    "rations.compare_select": "اختر علقتين للمقارنة",
    "rations.compare_selected": "محدد: {n}/2",
    "rations.compare_cheaper": "الأرخص",
    "rations.trend_title": "تتبّع التكلفة عبر الزمن",
    "rations.trend_empty": "احفظ علقتين أو أكثر من نفس النوع لعرض تتبّع التكلفة.",
    "rations.trend_cost": "التكلفة اليومية (ج.م)",
    "rations.dialog_desc": "تفاصيل العليقة المحفوظة — يمكنك مشاركتها أو طباعتها.",

    // ---- about screen ----
    "about.tagline": "حاسبة العليقة الذكية للمربي المصري",
    "about.intro":
      "أداة تقنية مجانية تساعد مربي الأبقار والجاموس والأغنام والدواجن في مصر على تركيب العلائق الغذائية بدقة علمية وبأقل تكلفة، بناءً على مكوّنات السوق المصري. التطبيق لا يبيع ولا يورد مستلزمات — هو أداة حسابية بحتة.",
    "about.f1.t": "محرك برمجة خطية حقيقي",
    "about.f1.d": "يحلّ أرخص عليقة متوازنة عبر خوارزمية Simplex على جهازك نفسه — لا خوادم ولا انتظار.",
    "about.f2.t": "يعمل بدون إنترنت",
    "about.f2.d": "كل الحسابات والأسعار والعلائق محفوظة محلياً. مناسبة للمزارع ذات الشبكة الضعيفة.",
    "about.f3.t": "موازن اقتصادي",
    "about.f3.d": "يُعيد ترتيب المكوّنات لاختيار البدائل الأرخص التي تحقق نفس القيمة الغذائية تقريباً.",
    "about.f4.t": "جاهز للهاتف",
    "about.f4.d": "تصميم mobile-first يمكن تثبيته على الشاشة الرئيسية أو تحويله إلى تطبيق APK.",
    "about.how_title": "كيف يعمل التطبيق؟",
    "about.step1": "اختر نوع الحيوان وحالته الإنتاجية من تبويب الحاسبة.",
    "about.step2": "أدخل وزن الحيوان (وإنتاج اللبن للأبقار الحلوب).",
    "about.step3": "تأكد من أسعار اليوم من تبويب الأسعار — عدّلها بأسعار سوقك.",
    "about.step4": "اختر عليقة متوازنة أو اقتصادية وشاهد التركيبة لحظياً.",
    "about.step5": "احفظ العليقة أو شاركها مع عامل المزرعة عبر واتساب.",
    "about.disclaimer_title": "إخلاء مسؤولية",
    "about.disclaimer":
      "القيم الغذائية والأهداف تقريبية لأغراض إرشادية، مبنية على متوسطات NRC ومعدّلة للسوق المصري. للقطعان الإنتاجية الكبيرة أو الحالات الخاصة (حمل، مرض، تغيير مفاجئ في الإنتاج، حيوانات صغيرة) استشر أخصائي تغذية قبل التطبيق. التطبيق لا يُغني عن الاستشارة البيطرية المتخصصة.",
    "about.components_title": "المكوّنات المدعومة",
    "about.targets_title": "الأهداف الغذائية",
    "about.version": "عليقة · الإصدار ١.٠ · صُمّم للمربي المصري",
    "about.team_title": "فريق العمل",
    "about.team_subtitle": "خريجو كلية الزراعة — جامعة أسيوط 2018م",
    "about.targets_summary": "البقرة الحلوب (بروتين ١٤٪، طاقة ٦٣٪) — جاموس حلوب (بروتين ١٣٪، طاقة ٦٤٪) — جاموس تسمين (بروتين ١٢٪، طاقة ٦٦٪) — عجول تسمين (بروتين ١٦٪، طاقة ٦٨٪) — الأغنام (بروتين ١٣٪، طاقة ٦٥٪) — الدجاج البياض (بروتين ١٦.٥٪، طاقة ٦٦٪) — أمهات بياض (بروتين ١٧٪، طاقة ٦٨٪) — دجاج التسمين (بروتين ٢١٪، طاقة ٧٠٪) — كتاكيت البادي (بروتين ٢٣٪، طاقة ٧٢٪). للدواجن يمكنك تحديد عدد الطيور في القطيع لحساب التكلفة الإجمالية.",

    // ---- report ----
    "report.title": "تقرير تركيبة العليقة",
    "report.daily_cost": "التكلفة اليومية",
    "report.monthly_cost": "التكلفة الشهرية",
    "report.per_head": "تكلفة الرأس/يوم",
    "report.per_bird": "تكلفة الطائر/يوم",
    "report.heads_count": "عدد الرؤوس",
    "report.birds_count": "عدد الطيور",
    "report.components_section": "تفصيل مكوّنات العليقة",
    "report.col_num": "#",
    "report.col_component": "المكوّن",
    "report.col_percent": "النسبة",
    "report.col_qty": "الكمية/يوم",
    "report.col_protein": "بروتين",
    "report.col_energy": "طاقة",
    "report.col_cost": "التكلفة",
    "report.total": "الإجمالي",
    "report.savings_label": "التوفير اليومي مقارنة بالعليقة المتوازنة",
    "report.warnings": "ملاحظات",
    "report.footer.line1": "قيم تقريبية لأغراض إرشادية مبنية على متوسطات NRC ومعدّلة للسوق المصري. للقطعان الإنتاجية الكبيرة استشر أخصائي تغذية.",
    "report.footer.line2": "أداة حسابية بحتة — لا تبيع ولا تورد مستلزمات.",
    "report.mode_balanced": "عليقة متوازنة",
    "report.mode_economy": "عليقة اقتصادية",
    "report.print_btn": "🖨️ طباعة / حفظ PDF",

    // ---- animal/ingredient names (defaults; overridden by data fields) ----
    "data.energy": "طاقة",
    "data.protein_cat": "بروتين",
    "data.energy_fiber": "طاقة/ألياف",
    "data.fiber_cat": "ألياف خشنة",
    "data.additive_cat": "إضافات",

    // ---- share text ----
    "share.brand": "عليقة — حاسبة العليقة الذكية",
    "share.animal": "الحيوان",
    "share.weight": "الوزن",
    "share.heads": "عدد الرؤوس",
    "share.birds": "عدد الطيور",
    "share.type": "النوع",
    "share.composition": "تركيبة العليقة",
    "share.daily_cost": "التكلفة اليومية",
    "share.monthly_cost": "التكلفة الشهرية",
    "share.per_head": "تكلفة الرأس/يوم",
    "share.per_bird": "تكلفة الطائر/يوم",
    "share.dmi": "المادة الجافة",
    "share.protein": "البروتين الخام",
    "share.energy": "الطاقة (TDN)",
    "share.fiber": "الألياف",
    "share.disclaimer": "قيم تقريبية لأغراض إرشادية. راجع أخصائي التغذية للقطعان الإنتاجية الكبيرة.",
  },

  en: {
    // ---- common ----
    "common.app_name": "Aleeqa",
    "common.app_sub": "Smart Feed Calculator",
    "common.offline": "Offline",
    "common.free_offline": "Free · Offline · For Egyptian farmers",
    "common.egp": "EGP",
    "common.kg": "kg",
    "common.day": "day",
    "common.month": "month",
    "common.save": "Save",
    "common.share": "Share",
    "common.print": "Print",
    "common.cancel": "Cancel",
    "common.delete": "Delete",
    "common.close": "Close",
    "common.reset": "Defaults",
    "common.updated": "Last updated",
    "common.default_prices": "Default prices",
    "common.back_home": "Home",
    "common.start_calc": "Start",
    "common.start_now": "Start calculating now",
    "common.pdf": "Export PDF",
    "common.whatsapp": "Share via WhatsApp",

    // ---- nav tabs ----
    "nav.calculator": "Calculator",
    "nav.prices": "Prices",
    "nav.rations": "My Rations",
    "nav.about": "About",
    "nav.profile": "Profile",
    "nav.admin": "Admin",

    // ---- common extra ----
    "common.guest": "Guest",
    "common.signin": "Sign In",
    "common.online": "Online",
    "common.syncing": "Syncing...",
    "common.synced": "Synced",
    "common.pending": "Pending sync",
    "common.maintenance": "Maintenance mode",
    "common.ad": "Ad",
    "common.dismiss": "Dismiss",
    "common.head_unit": "head",
    "common.toggle_lang_aria": "Toggle language",
    "lang.toggle_hint": "التبديل للعربية",

    // ---- calculator stepper / nav ----
    "calc.stepper.animal": "Animal",
    "calc.stepper.data": "Data",
    "calc.stepper.items": "Items",
    "calc.stepper.mode": "Mode",
    "calc.stepper.prices": "Prices",
    "calc.stepper.result": "Result",
    "calc.next": "Next",
    "calc.back": "Back",
    "calc.calculate": "Calculate",
    "calc.start_over": "Start over",
    "calc.edit_data": "Edit data",
    "calc.manual_suffix": "manual",
    "calc.flock_up_to": "Up to {n} (type the number directly)",
    "calc.ingredients_title": "Select Ingredients",
    "calc.ingredient_mode.auto": "Automatic",
    "calc.ingredient_mode.auto_sub": "System picks best",
    "calc.ingredient_mode.manual": "Manual",
    "calc.ingredient_mode.manual_sub": "I choose",
    "calc.ingredient_select_hint": "Select ingredients available to you. Only these will be used.",
    "calc.ingredient_select_at_least": "Select at least one ingredient",
    "calc.ingredient_selected_count": "Selected: {n} items",
    "calc.ingredient_auto_info": "System will use all suitable ingredients automatically",
    "calc.ingredient_auto_count": "{n} ingredients available",
    "calc.cp": "CP",
    "calc.tdn": "TDN",
    "calc.egp_per_kg": "EGP/kg",

    // ---- landing ----
    "landing.hero.title1": "From paper & pen to a",
    "landing.hero.title2": "smart ration",
    "landing.hero.title3": "in every farmer's pocket",
    "landing.hero.desc":
      "An integrated product: a free calculation tool that serves farmers, a multi-stream business model, and offline tech fit for the Egyptian reality. Ready to launch in phases.",
    "landing.hero.why_btn": "Why use the app?",
    "landing.hero.stat_animals": "animal types",
    "landing.hero.stat_ingredients": "market ingredients",
    "landing.hero.stat_offline": "no internet",
    "landing.animals_strip": "Supports the main production types in Egypt",
    "landing.why.eyebrow": "Why use the app",
    "landing.why.title": "Because Egyptian farmers deserve a",
    "landing.why.title_hl": "scientific & free tool",
    "landing.why.desc":
      "Instead of computing rations on paper with trial and error, Aleeqa calculates them with scientific accuracy at the lowest cost — in seconds, offline.",
    "landing.why.b1.t": "Real scientific accuracy",
    "landing.why.b1.d":
      "A Linear Programming engine finds the cheapest balanced ration that meets the animal's protein, energy, and fiber needs.",
    "landing.why.b2.t": "Daily money savings",
    "landing.why.b2.d":
      "The cost optimizer ranks cheaper alternative ingredients with the same nutritional value, showing savings in EGP daily and monthly.",
    "landing.why.b3.t": "Works offline",
    "landing.why.b3.d":
      "All calculations, prices, and rations are stored on your device. Suited for farms with weak connectivity.",
    "landing.why.b4.t": "Your market prices",
    "landing.why.b4.d":
      "Update corn, soybean, bran, and straw prices with your weekly market prices — the ration recomputes instantly.",
    "landing.why.b5.t": "Share instantly",
    "landing.why.b5.d":
      "Send the ration to farm workers via WhatsApp, or save and print it. Every ration is stored for later.",
    "landing.why.b6.t": "Free, no ads",
    "landing.why.b6.d":
      "A pure calculation tool — sells nothing, supplies nothing. All data stays on your device. No sign-up.",
    "landing.how.eyebrow": "How it works",
    "landing.how.title": "Just three steps",
    "landing.how.s1.t": "Pick animal & weight",
    "landing.how.s1.d": "Dairy cow, buffalo, sheep, layer, or broiler — and set the weight and production.",
    "landing.how.s2.t": "Check today's prices",
    "landing.how.s2.d": "Default prices are included; adjust them to your market to compute accurately.",
    "landing.how.s3.t": "Get the ration",
    "landing.how.s3.d": "See quantities, percentages, daily and monthly cost — then share or save it.",
    "landing.features.eyebrow": "Features",
    "landing.features.title": "Everything a farmer needs in one place",
    "landing.features.f1.t": "Smart ration calculator",
    "landing.features.f1.p1": "Instant ration in kg & %",
    "landing.features.f1.p2": "Protein, energy & fiber computed",
    "landing.features.f1.p3": "Clear charts",
    "landing.features.f2.t": "Cost optimizer",
    "landing.features.f2.p1": "Balanced or economy ration",
    "landing.features.f2.p2": "Daily & monthly savings",
    "landing.features.f2.p3": "Cheaper alternatives, same value",
    "landing.features.f3.t": "Price management",
    "landing.features.f3.p1": "Editable prices",
    "landing.features.f3.p2": "Auto-saved on your device",
    "landing.features.f3.p3": "Updates with your market",
    "landing.features.f4.t": "Save & share",
    "landing.features.f4.p1": "Saved ration history",
    "landing.features.f4.p2": "Share via WhatsApp",
    "landing.features.f4.p3": "Print the ration",

    // ---- what's new section ----
    "landing.new.eyebrow": "New",
    "landing.new.title": "Latest Updates & New Features",
    "landing.new.subtitle": "Key additions and improvements for a better, more accurate launch",
    "landing.new.n1.t": "6-Step Wizard",
    "landing.new.n1.d": "Clean step-by-step UI: Animal → Data → Ingredients → Mode → Prices → Result",
    "landing.new.n2.t": "Card-Based Manual Editor",
    "landing.new.n2.d": "Edit percentages with cards grouped by category (energy/protein/fiber...) with a slider and lock button per ingredient",
    "landing.new.n3.t": "Smart Percentage Distribution",
    "landing.new.n3.d": "When you increase or decrease any ingredient, the rest auto-adjust to keep the total at 100%",
    "landing.new.n4.t": "Smart Rebalance",
    "landing.new.n4.d": "One button re-runs the LP solver while respecting locked ingredients and bounds",
    "landing.new.n5.t": "Ration Comparison",
    "landing.new.n5.d": "Compare two rations side by side: protein, energy, cost, and components",
    "landing.new.n6.t": "Print & PDF Report",
    "landing.new.n6.d": "Print the ration in a formatted A4 report in Arabic and English for sharing or archiving",

    "landing.cta.title": "Ready to compute your cheapest ration?",
    "landing.cta.desc": "Enter the calculator now — free, no sign-up, works offline.",
    "landing.footer.tagline": "A free calculation tool for Egyptian farmers",
    "landing.footer.offline_note": "Works offline · Your data stays on your device",

    // ---- calculator ----
    "calc.s1.title": "Pick the animal & production stage",
    "calc.s2.title": "Animal data",
    "calc.weight": "Weight",
    "calc.production": "Daily milk production",
    "calc.dmi_label": "Dry matter intake (DMI)",
    "calc.dmi_flock_suffix": " — for the herd",
    "calc.s3.title": "Cost optimizer",
    "calc.s3.tip":
      "Economy mode relaxes protein, energy and roughage targets slightly so the engine picks cheaper alternatives — you'll see quantities change and savings in EGP.",
    "calc.balanced": "Balanced ration",
    "calc.balanced_sub": "Meets all nutritional targets",
    "calc.economy": "Economy ration",
    "calc.economy_sub": "Cheaper alternative, ~same value",
    "calc.diff_label": "Difference vs balanced:",
    "calc.s4.title": "Today's prices (editable)",
    "calc.s4.hint": "Change a price directly — the ration recomputes instantly with your market prices. Prices auto-save on your device.",
    "calc.result_title": "Suggested ration",
    "calc.result_manual": "Ration (manual edit)",
    "calc.lp_badge": "Solved with Linear Programming",
    "calc.manual_badge": "Manual edit",
    "calc.edit_btn": "Edit percentages manually",
    "calc.reset_auto": "Back to automatic",
    "calc.manual_toast": "Manual edit mode — adjust percentages and see changes live",
    "calc.saved_toast": "Ration saved to your list",
    "calc.no_export": "No ration to export",
    "calc.no_save": "Cannot save an infeasible ration",
    "calc.save_fail": "Save failed — delete old rations and try again",
    "calc.saved_count": "You have {n} saved rations",
    "calc.disclaimer":
      "Values are approximate, for advisory purposes, on an as-fed basis. For large production flocks or special cases (pregnancy, disease, sudden production change) consult a nutritionist. Targets are based on NRC averages, tuned for the Egyptian market.",

    // ---- manual editor ----
    "manual.protein": "Protein",
    "manual.energy": "Energy",
    "manual.fiber": "Fiber",
    "manual.cost_day": "Cost/day",
    "manual.sum_label": "Sum of percentages",
    "manual.over": "Over by {n}% — reduce",
    "manual.under": "Under by {n}% — add more",
    "manual.save": "Save ration",
    "manual.rebalance": "Smart Rebalance",
    "manual.reset": "Reset ration",
    "manual.lock": "Lock",
    "manual.unlock": "Unlock",
    "manual.bounds": "{min}% - {max}%",
    "manual.kg": "kg",
    "manual.egp": "EGP",
    "manual.target_deviation": "Target deviation",
    "manual.components_count": "{n} components",
    "manual.no_adjustable": "All ingredients locked — cannot redistribute",
    "manual.rebalance_success": "Rebalanced successfully — percentages and indicators updated",
    "manual.rebalance_failed": "Could not find a feasible solution. Try unlocking some ingredients or adjusting bounds.",
    "manual.rebalance_running": "Re-calculating ration...",
    "manual.auto_balance": "Smart Auto-Balance",
    "manual.auto_balance_sub": "Lock🔒, auto-adjust rest",
    "manual.locked_count": "locked",

    // ---- ration result ----
    "result.dmi_day": "Dry matter/day",
    "result.protein": "Crude protein",
    "result.energy": "Energy (TDN)",
    "result.fiber": "Crude fiber",
    "result.target_ge": "Target ≥ {n}%",
    "result.max_le": "Max {n}%",
    "result.cost_daily": "Daily cost",
    "result.cost_flock": "for the herd",
    "result.cost_per_kg": "Cost per kg",
    "result.cost_per_head": "Cost per head/day",
    "result.cost_per_bird": "Cost per bird/day",
    "result.savings": "Savings",
    "result.savings_sub": "{n}% lower daily",
    "result.components_title": "Component breakdown",
    "result.chart_title": "Ration percentages",
    "result.infeasible": "Could not formulate a ration with these constraints",
    "result.heads_in_flock": "Heads in the herd",
    "result.birds_in_flock": "Birds in the flock",

    // ---- prices screen ----
    "prices.title": "Egyptian market ingredient prices",
    "prices.subtitle_count": "{n} rations saved on your device",
    "prices.subtitle_none": "Default prices — adjust to your market",
    "prices.default_hint": "Default price: {n} EGP/kg",
    "prices.note":
      "Prices auto-save on your device and the app works offline. When online, you can update them manually with your weekly market prices. The ration recomputes instantly on every price change.",
    "prices.invalid": "Enter a valid price",
    "prices.saved": "Updated price of {name}",
    "prices.reset_done": "Prices reset to defaults",
    "prices.ingredient_db_title": "Ingredient Database",
    "prices.reset_btn": "Reset",
    "prices.reset_confirm": "Reset all to defaults?",
    "prices.edit_hint": "Tap any ingredient to edit nutrition values and price. Changes are saved and used instantly.",
    "prices.search_placeholder": "Search...",
    "prices.editable_hint": "💡 All values are editable and stored locally",
    "prices.cp_label": "CP",
    "prices.tdn_label": "TDN",
    "prices.cf_label": "CF",
    "prices.egp_per_kg_short": "EGP/kg",
    "prices.edit_nutrition": "Edit Nutrition Values",
    "prices.price_field": "Price (EGP/kg)",
    "prices.protein_field": "Crude Protein (CP %)",
    "prices.tdn_field": "Energy (TDN %)",
    "prices.fiber_field": "Crude Fiber (CF %)",
    "prices.fat_field": "Fat (EE %)",
    "prices.calcium_field": "Calcium (Ca %)",
    "prices.phosphorus_field": "Phosphorus (P %)",
    "prices.dm_field": "Dry Matter (DM %)",
    "prices.min_usage_field": "Min Usage (%)",
    "prices.max_usage_field": "Max Usage (%)",

    // ---- rations screen ----
    "rations.title": "Saved rations",
    "rations.subtitle_n": "{n} rations saved on your device",
    "rations.subtitle_0": "No saved rations yet",
    "rations.empty_title": "No saved rations",
    "rations.empty_desc": "Compute a ration from the Calculator tab, then tap Save to see it here.",
    "rations.view": "View",
    "rations.delete": "Delete",
    "rations.delete_title": "Delete ration?",
    "rations.delete_desc": "This cannot be undone. The ration will be permanently removed from your device.",
    "rations.deleted_toast": "Ration deleted",
    "rations.copied_toast": "Ration copied",
    "rations.copy_fail": "Copy failed",
    "rations.mode_balanced": "Balanced",
    "rations.mode_economy": "Economy",
    "rations.compare_btn": "Compare two rations",
    "rations.compare_exit": "Exit compare",
    "rations.compare_title": "Ration comparison",
    "rations.compare_select": "Select two rations to compare",
    "rations.compare_selected": "Selected: {n}/2",
    "rations.compare_cheaper": "Cheaper",
    "rations.trend_title": "Cost trend over time",
    "rations.trend_empty": "Save two or more rations of the same type to see the cost trend.",
    "rations.trend_cost": "Daily cost (EGP)",
    "rations.dialog_desc": "Saved ration details — you can share or print it.",

    // ---- about screen ----
    "about.tagline": "Smart feed calculator for Egyptian farmers",
    "about.intro":
      "A free technical tool that helps Egyptian cattle, buffalo, sheep, and poultry farmers formulate rations with scientific accuracy at the lowest cost, based on Egyptian market ingredients. The app sells nothing and supplies nothing — it's a pure calculation tool.",
    "about.f1.t": "Real LP engine",
    "about.f1.d": "Solves the cheapest balanced ration via a Simplex algorithm on your own device — no servers, no waiting.",
    "about.f2.t": "Works offline",
    "about.f2.d": "All calculations, prices, and rations are stored locally. Suited for farms with weak connectivity.",
    "about.f3.t": "Cost optimizer",
    "about.f3.d": "Rearranges ingredients to pick cheaper alternatives with roughly the same nutritional value.",
    "about.f4.t": "Mobile-ready",
    "about.f4.d": "A mobile-first design that can be installed to the home screen or wrapped as an APK.",
    "about.how_title": "How does the app work?",
    "about.step1": "Pick the animal type and production stage from the Calculator tab.",
    "about.step2": "Enter the animal's weight (and milk production for dairy cows).",
    "about.step3": "Check today's prices in the Prices tab — adjust to your market.",
    "about.step4": "Choose balanced or economy and see the ration instantly.",
    "about.step5": "Save the ration or share it with farm workers via WhatsApp.",
    "about.disclaimer_title": "Disclaimer",
    "about.disclaimer":
      "Nutritional values and targets are approximate, for advisory purposes, based on NRC averages tuned for the Egyptian market. For large production flocks or special cases (pregnancy, disease, sudden production change, young animals) consult a nutritionist before applying. The app does not replace specialized veterinary consultation.",
    "about.components_title": "Supported ingredients",
    "about.targets_title": "Nutritional targets",
    "about.version": "Aleeqa · Version 1.0 · Built for Egyptian farmers",
    "about.team_title": "Our Team",
    "about.team_subtitle": "Faculty of Agriculture graduates — Assiut University 2018",
    "about.targets_summary": "Dairy cow (protein 14%, energy 63%) — Dairy buffalo (protein 13%, energy 64%) — Fattening buffalo (protein 12%, energy 66%) — Fattening calf (protein 16%, energy 68%) — Sheep (protein 13%, energy 65%) — Layer chicken (protein 16.5%, energy 66%) — Layer breeder (protein 17%, energy 68%) — Broiler (protein 21%, energy 70%) — Broiler starter (protein 23%, energy 72%). For poultry you can set the flock size to compute the total cost.",

    // ---- report ----
    "report.title": "Ration formulation report",
    "report.daily_cost": "Daily cost",
    "report.monthly_cost": "Monthly cost",
    "report.per_head": "Cost/head/day",
    "report.per_bird": "Cost/bird/day",
    "report.heads_count": "Number of heads",
    "report.birds_count": "Number of birds",
    "report.components_section": "Ration component breakdown",
    "report.col_num": "#",
    "report.col_component": "Component",
    "report.col_percent": "Percent",
    "report.col_qty": "Qty/day",
    "report.col_protein": "Protein",
    "report.col_energy": "Energy",
    "report.col_cost": "Cost",
    "report.total": "Total",
    "report.savings_label": "Daily savings vs balanced ration",
    "report.warnings": "Notes",
    "report.footer.line1": "Approximate values for advisory purposes, based on NRC averages tuned for the Egyptian market. For large production flocks consult a nutritionist.",
    "report.footer.line2": "A pure calculation tool — sells nothing, supplies nothing.",
    "report.mode_balanced": "Balanced ration",
    "report.mode_economy": "Economy ration",
    "report.print_btn": "🖨️ Print / Save PDF",

    // ---- data categories ----
    "data.energy": "Energy",
    "data.protein_cat": "Protein",
    "data.energy_fiber": "Energy/Fiber",
    "data.fiber_cat": "Roughage",
    "data.additive_cat": "Additive",

    // ---- share text ----
    "share.brand": "Aleeqa — Smart Feed Calculator",
    "share.animal": "Animal",
    "share.weight": "Weight",
    "share.heads": "Heads",
    "share.birds": "Birds",
    "share.type": "Type",
    "share.composition": "Ration composition",
    "share.daily_cost": "Daily cost",
    "share.monthly_cost": "Monthly cost",
    "share.per_head": "Cost/head/day",
    "share.per_bird": "Cost/bird/day",
    "share.dmi": "Dry matter",
    "share.protein": "Crude protein",
    "share.energy": "Energy (TDN)",
    "share.fiber": "Fiber",
    "share.disclaimer": "Approximate values for advisory purposes. Consult a nutritionist for large production flocks.",
  },
};

/* ================================================================== */
/*  CONTEXT                                                            */
/* ================================================================== */

interface LangContextValue {
  lang: Lang;
  dir: "rtl" | "ltr";
  setLang: (l: Lang) => void;
  toggleLang: () => void;
  t: (key: string, vars?: Record<string, string | number>) => string;
}

const LangContext = createContext<LangContextValue | null>(null);

const LANG_KEY = "aleeqa.lang.v1";
const listeners = new Set<() => void>();

function subscribeLang(cb: () => void) {
  listeners.add(cb);
  const onStorage = (e: StorageEvent) => {
    if (e.key === LANG_KEY) cb();
  };
  if (typeof window !== "undefined") window.addEventListener("storage", onStorage);
  return () => {
    listeners.delete(cb);
    if (typeof window !== "undefined") window.removeEventListener("storage", onStorage);
  };
}

function getLangSnapshot(): Lang {
  if (typeof window === "undefined") return "ar";
  const v = localStorage.getItem(LANG_KEY);
  return v === "en" || v === "ar" ? v : "ar";
}

function getLangServerSnapshot(): Lang {
  return "ar";
}

function notifyLang() {
  listeners.forEach((l) => l());
}

export function LanguageProvider({ children }: { children: ReactNode }) {
  const lang = useSyncExternalStore(subscribeLang, getLangSnapshot, getLangServerSnapshot);
  const dir: "rtl" | "ltr" = lang === "ar" ? "rtl" : "ltr";

  // Keep <html> dir/lang in sync (client-side).
  useEffect(() => {
    document.documentElement.lang = lang;
    document.documentElement.dir = dir;
  }, [lang, dir]);

  const setLang = useCallback((l: Lang) => {
    try {
      localStorage.setItem(LANG_KEY, l);
      notifyLang();
    } catch {
      /* ignore */
    }
  }, []);

  const toggleLang = useCallback(() => {
    setLang(getLangSnapshot() === "ar" ? "en" : "ar");
  }, [setLang]);

  const t = useCallback(
    (key: string, vars?: Record<string, string | number>) => {
      let str = DICT[lang][key] ?? DICT.ar[key] ?? key;
      if (vars) {
        for (const [k, v] of Object.entries(vars)) {
          str = str.replace(new RegExp(`\\{${k}\\}`, "g"), String(v));
        }
      }
      return str;
    },
    [lang]
  );

  const value = useMemo(
    () => ({ lang, dir, setLang, toggleLang, t }),
    [lang, dir, setLang, toggleLang, t]
  );

  return <LangContext.Provider value={value}>{children}</LangContext.Provider>;
}

export function useLang() {
  const ctx = useContext(LangContext);
  if (!ctx) {
    // Safe fallback so components never crash if used outside provider.
    return {
      lang: "ar" as Lang,
      dir: "rtl" as const,
      setLang: () => {},
      toggleLang: () => {},
      t: (key: string) => DICT.ar[key] ?? key,
    };
  }
  return ctx;
}
