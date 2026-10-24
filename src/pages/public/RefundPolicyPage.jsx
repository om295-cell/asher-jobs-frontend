import React from 'react';
import { Link } from 'react-router-dom';
import { useLanguage } from '../../context/LanguageContext';

const sections = {
  en: [
    [
      'Services & Prepaid Subscriptions',
      'Asher Jobs (operated by Asher Media for Electronic Services, Commercial Register No. 11615, 10th of Ramadan City, Egypt) provides business-to-business digital recruitment database services, CV search access, and candidate matching subscriptions for verified industrial employers and companies. All subscription plans, search quotas, download allowances, and prices are clearly specified in Egyptian Pounds (EGP) on the platform prior to checkout. Subscriptions are activated upon successful payment confirmation via our payment gateway, Paymob.'
    ],
    [
      'Cancellation Policy & Subscription Renewals',
      'All subscriptions on Asher Jobs are prepaid for fixed terms (1, 3, 6, 9, or 12 months) and do NOT automatically renew. There are no recurring auto-debit charges against your payment card. You can choose not to renew at the end of your billing cycle with zero penalties. Your digital access remains active throughout the paid period. If you close or abandon the Paymob checkout window before completing 3D Secure card authentication, that payment attempt is automatically cancelled without any charge.'
    ],
    [
      'Refund Eligibility (14-Day Cooling-Off Period)',
      'In accordance with Egyptian Consumer Protection Law (Law No. 181 of 2018) and electronic commerce regulations, you are entitled to request a 100% full refund under the following conditions:\n1. 14-Day Unused Guarantee: If you request cancellation and refund within 14 calendar days of payment, provided that NO paid subscription features, candidate searches, CV unlocks, or candidate contact details have been accessed or downloaded.\n2. Duplicate Charges: If your payment card or digital wallet was accidentally billed more than once for the same order.\n3. Billing Discrepancies: If the amount charged differs from the agreed plan total displayed at checkout.\n4. Service Delivery Failure: If a payment was successfully captured by Paymob but your subscription features were not activated due to a technical error and our technical team could not resolve the issue within 24 hours of notification.'
    ],
    [
      'Non-Refundable Circumstances',
      'Refunds cannot be granted in the following scenarios:\n• Once candidate contact details, phone numbers, or complete CV profiles have been unlocked, viewed, or downloaded using the subscription plan. Under Egyptian Consumer Protection Law, digital content and customized data access that have been consumed cannot be returned.\n• Subscriptions where more than 14 calendar days have passed since the transaction date.\n• Accounts suspended or terminated due to documented violations of our Terms of Service (such as data scraping, resale of candidate information, harassment, or fraudulent employer credentials).'
    ],
    [
      'Refund Method & Gateway Settlement Timeline (Paymob)',
      'In strict compliance with payment gateway standards and card network regulations:\n• All approved refunds are credited back exclusively to the original payment card or payment instrument (Visa, Mastercard, Meeza, or digital wallet) used during the initial Paymob transaction.\n• Under no circumstances will refunds be issued in cash, cheques, or transferred to third-party bank accounts or alternate cards.\n• Processing Timelines: Once approved by Asher Jobs (within 1 to 2 business days), the refund request is submitted through Paymob. The time required for the refunded amount to appear on your bank account or card statement typically ranges between 7 to 14 business days, depending on your issuing bank and card network.'
    ],
    [
      'How to Submit a Refund Request',
      'To request a refund, please send an official written request from your registered company email to asherjobs@outlook.com or contact us by phone at +20 155 645 4666 with the following information:\n1. Company Name and registered account email/phone.\n2. Paymob Transaction ID / Order Reference number.\n3. Transaction date and exact amount charged in EGP.\n4. Reason for the cancellation or refund request.\n\nFor your security, never include your full 16-digit card number, CVV code, or banking passwords in any email communication. Our finance team will review your order and confirm the resolution within 48 business hours.'
    ],
    [
      'Corporate Details & Consumer Rights',
      'This policy is administered by Asher Media for Electronic Services (CR 11615), headquartered in 10th of Ramadan City, Sharqia Governorate, Egypt. Nothing in this policy restricts or diminishes statutory rights guaranteed to consumers under applicable Egyptian laws.'
    ]
  ],
  ar: [
    [
      'طبيعة الخدمات والاشتراكات المدفوعة مقدماً',
      'تقدم منصة عاشر جوبز (المملوكة والمدارة بواسطة عاشر ميديا للخدمات الإلكترونية، سجل تجاري رقم 11615، مدينة العاشر من رمضان، مصر) خدمات رقمية متخصصة للشركات والمصانع المعتمدة، تشمل البحث في قاعدة بيانات المرشحين المهنية وتحميل السير الذاتية والتواصل مع الكوادر. وتُعرض جميع الباقات وحدود البحث والتحميل والأسعار بوضوح تام بالجنيه المصري (EGP) قبل الانتقال لصفحة السداد. ويتم تفعيل الاشتراك فور تأكيد نجاح الدفع عبر بوابة الدفع الإلكتروني Paymob.'
    ],
    [
      'سياسة الإلغاء وعدم التجديد التلقائي',
      'جميع الاشتراكات في منصة عاشر جوبز مدفوعة مقدماً لمدد محددة (شهر، 3 أشهر، 6 أشهر، 9 أشهر، أو سنة كاملة) ولا تتجدد تلقائياً. لذلك لا توجد أي خصومات متكررة أو مفاجئة على بطاقتك البنكية. يحق للعميل عدم تجديد الاشتراك عند انتهاء مدته دون أي التزامات أو غرامات، ويظل الوصول متاحاً طوال المدة المدفوعة. كما أن إغلاق أو مغادرة نافذة الدفع في Paymob قبل تأكيد العملية يلغي محاولة السداد تلقائياً دون خصم أي مبالغ.'
    ],
    [
      'حالات وشروط استرداد المبالغ المدفوعة (مهلة 14 يوماً)',
      'وفقاً لأحكام قانون حماية المستهلك المصري (القانون رقم 181 لسنة 2018) والضوابط المنظمة للمدفوعات الإلكترونية، يحق للعميل طلب استرداد كامل المبلغ المدفوع بنسبة 100% في الحالات التالية:\n1. مهلة الـ 14 يوماً للخدمات غير المستخدمة: تقديم طلب الإلغاء والاسترداد خلال 14 يوماً تقويمياً من تاريخ السداد، بشرط عدم استخدام أي من مزايا الاشتراك المدفوع (أي عدم إجراء عمليات بحث مدفوعة أو استعراض بيانات تواصل أو تحميل سير ذاتية للمرشحين).\n2. الخصم المكرر: حدوث خصم مكرر لقيمة الباقة عن طريق الخطأ لنفس المعاملة.\n3. خطأ في قيمة الفاتورة: إذا تم خصم مبلغ يختلف عن القيمة المحددة للباقة والمعتمدة في شاشة الدفع.\n4. تعذر تفعيل الخدمة: تأكيد نجاح المعاملة وسحب المبلغ عبر Paymob مع تعذر تفعيل الباقة تقنياً على الحساب وفشل فريق الدعم الفني في معالجة العطل خلال 24 ساعة من الإبلاغ.'
    ],
    [
      'الحالات غير القابلة للاسترداد',
      'لا يمكن قبول طلبات الاسترداد في الحالات الآتية:\n• استهلاك الخدمة الرقمية: بمجرد فتح بيانات التواصل للمرشحين أو تحميل ملفات السير الذاتية (CV) باستخدام رصيد الباقة؛ حيث تُعد البيانات الرقمية المستهلكة مسلّمة بالكامل وفقاً لقانون حماية المستهلك ولا يمكن إرجاعها.\n• مرور أكثر من 14 يوماً تقويمياً على تاريخ إتمام الدفع.\n• الحسابات التي يتم إيقافها بسبب انتهاك شروط الاستخدام (مثل سحب البيانات غير المشروع، أو إعادة بيع بيانات المرشحين، أو تقديم بيانات شركة وهمية).'
    ],
    [
      'آلية الاسترداد وفترة التحصيل البنكي عبر Paymob',
      'التزاماً بالمعايير الصارمة لشبكات الدفع وبوابة Paymob:\n• يتم رد كافة المبالغ المستردة المعتمدة حصرياً إلى نفس وسيلة الدفع والبطاقة البنكية (فيزا، ماستركارد، ميزة، أو المحفظة الإلكترونية) المستخدمة في عملية الدفع الأصلية.\n• لا يتم رد المبالغ نقداً أو بشيكات أو تحويلها لأي بطاقات أو حسابات بنكية أخرى لطرف ثالث تحت أي ظرف.\n• المدة الزمنية لتسوية الاسترداد: يقوم فريق العمل بمراجعة واعتماد طلب الاسترداد خلال 1 إلى 2 يوم عمل، ثم تُحال المعاملة لبوابة Paymob. ويستغرق ظهور المبلغ في كشف حساب بطاقة العميل مدة تتراوح بين 7 إلى 14 يوم عمل، وذلك بحسب سياسة البنك المصدر للبطاقة وشبكة الدفع.'
    ],
    [
      'خطوات تقديم طلب الاسترداد',
      'لطلب استرداد المبلغ، يرجى إرسال بريد إلكتروني رسمي من البريد المسجل للشركة إلى asherjobs@outlook.com أو الاتصال هاتفياً على الرقم 4666 645 155 20+، متضمناً البيانات التالية:\n1. اسم الشركة ورقم الهاتف أو البريد الإلكتروني المسجل للحساب.\n2. رقم المعاملة لدى Paymob (Transaction / Order ID).\n3. تاريخ المعاملة والمبلغ الدقيق بالجنيه المصري.\n4. سبب طلب الاسترداد أو الإلغاء.\n\nتنبيه أمني: لا ترسل نهائياً رقم البطاقة البنكية كاملاً أو كود الأمان CVV أو كلمات المرور عبر البريد. وسيقوم القسم المالي بالرد عليك وتأكيد الإجراء خلال 48 ساعة عمل.'
    ],
    [
      'البيانات القانونية وحقوق المستهلك',
      'تخضع هذه السياسة لإدارة عاشر ميديا للخدمات الإلكترونية (سجل تجاري 11615)، ومقرها الإداري مدينة العاشر من رمضان، محافظة الشرقية، جمهورية مصر العربية. ولا تنتقص هذه البنود من أي حقوق قانونية مقررة للمستهلك بموجب القوانين المصرية السارية.'
    ]
  ]
};

export default function RefundPolicyPage() {
  const { isRtl } = useLanguage();
  const content = isRtl ? sections.ar : sections.en;

  return (
    <main dir={isRtl ? 'rtl' : 'ltr'} style={{ padding: 'clamp(2rem, 5vw, 4rem) 0', background: 'var(--bg-page)' }}>
      <article className="container" style={{ maxWidth: 900 }}>
        <header style={{ marginBottom: '1.5rem' }}>
          <h1 style={{ fontSize: 'clamp(1.8rem, 5vw, 2.5rem)', fontWeight: 850, margin: '0 0 0.65rem', color: 'var(--slate-900)' }}>
            {isRtl ? 'سياسة الاسترداد والإلغاء' : 'Refund & Cancellation Policy'}
          </h1>
          <p style={{ margin: 0, color: 'var(--slate-600)', lineHeight: 1.8 }}>
            {isRtl
              ? 'توضح هذه السياسة قواعد إلغاء الاشتراكات وضوابط استرداد المدفوعات عبر بوابة الدفع Paymob والقوانين المصرية لحماية المستهلك.'
              : 'This policy governs subscription cancellations, refund conditions, and card reversal timelines via the Paymob payment gateway under Egyptian consumer protection regulations.'}
          </p>
        </header>

        <div style={{ display: 'grid', gap: '0.85rem' }}>
          {content.map(([title, body]) => (
            <section className="card card-responsive" key={title}>
              <h2 style={{ fontSize: '1.08rem', margin: '0 0 0.55rem', color: 'var(--slate-900)' }}>{title}</h2>
              <p style={{ margin: 0, color: 'var(--slate-600)', lineHeight: 1.85, whiteSpace: 'pre-line' }}>{body}</p>
            </section>
          ))}
        </div>

        <p style={{ textAlign: 'center', marginTop: '1.25rem', color: 'var(--slate-500)' }}>
          {isRtl ? 'لأي استفسار بخصوص المدفوعات والاسترداد، ' : 'For any questions regarding billing and refunds, '}
          <Link to="/contact" style={{ color: 'var(--accent)', fontWeight: 700 }}>
            {isRtl ? 'تواصل معنا' : 'contact us'}
          </Link>.
        </p>
      </article>
    </main>
  );
}
