import React from 'react';
import { Link } from 'react-router-dom';
import { useLanguage } from '../../context/LanguageContext';

const sections = {
  en: [
    [
      'Who We Are & Legal Identity',
      'Asher Jobs (accessible at asherjobs.com) is operated by Asher Media for Electronic Services, an Egyptian registered enterprise (Commercial Register No. 11615), headquartered in 10th of Ramadan City, Sharqia Governorate, Arab Republic of Egypt. In this Privacy Policy, "we", "us", "our", and "Asher Jobs" refer to Asher Media for Electronic Services. We are committed to protecting the privacy, security, and confidentiality of all users, employers, and job seekers who access our platform.'
    ],
    [
      'Payment Information & Paymob PCI-DSS Compliance',
      'Asher Jobs does NOT store, collect, or process sensitive payment card information—including complete credit or debit card numbers, expiration dates, card verification codes (CVV/CVC), or 3D Secure one-time passwords (OTPs). All electronic payment transactions are securely handled directly by our certified third-party payment aggregator, Paymob (Paymob Solutions for Digital Payments), in full compliance with Payment Card Industry Data Security Standards (PCI-DSS Level 1). When you initiate a subscription payment, you are redirected to Paymob’s secure, 256-bit SSL/TLS encrypted checkout environment. We only receive a cryptographic transaction token, the masked payment method, transaction status, and payment order reference from Paymob to fulfill your service order.'
    ],
    [
      'Information We Collect',
      'Depending on how you interact with our platform, we collect the following categories of information:\n• Account & Identity Information: Full name, business or company name, commercial registration number, tax identification (where applicable), work email address, and mobile phone number.\n• Candidate Profiles & Recruitment Data: Contact details, professional work experience, vocational skills, educational background, job title preferences, current employment availability, and uploaded CV/resume files submitted voluntarily by job seekers for recruitment matching.\n• Transaction & Billing Records: Paymob transaction IDs, package purchased, billing cycle duration, amount paid in Egyptian Pounds (EGP), payment timestamp, and transaction fulfillment status.\n• Technical & Usage Logs: IP address, device model, operating system, browser type, referral URLs, access timestamps, and interaction logs for system stability and security monitoring.'
    ],
    [
      'How We Use Your Information',
      'We process collected information in accordance with applicable Egyptian laws, including Law No. 151 of 2020 on the Protection of Personal Data, for the following legitimate business purposes:\n• Creating, verifying, and administering employer and candidate accounts.\n• Delivering digital subscription services, candidate searches, and recruitment matching.\n• Verifying the legitimate commercial identity of employers prior to granting access to candidate details.\n• Processing payments and transaction invoices via Paymob.\n• Preventing fraud, unauthorized scraping, abuse, and security threats.\n• Providing customer support and responding to technical or operational inquiries.\n• Fulfilling legal, tax, accounting, and regulatory compliance obligations in Egypt.'
    ],
    [
      'Candidate Data Protection & Access Controls',
      'Candidate personal data and resumes are treated with strict confidentiality. Contact information and complete CVs are only made accessible to verified, paying employers who have been vetted and approved by our administration for legitimate hiring purposes. Candidate information is never made publicly indexable on open search engines without authorization. Candidates can update, amend, or delete their profiles at any time upon request.'
    ],
    [
      'Data Sharing & Third-Party Disclosure',
      'We do not sell, rent, trade, or monetize personal information to third parties. Information is shared strictly on a need-to-know basis with:\n1. Payment Aggregator: Paymob, strictly for processing, authorizing, and resolving payment transactions and refunds.\n2. Cloud & Hosting Infrastructure: Trusted, encrypted cloud service providers under binding confidentiality and data protection agreements.\n3. Legal & Regulatory Authorities: Egyptian governmental, judicial, or law enforcement entities only when compelled by valid subpoena, official court order, or binding legal statute.'
    ],
    [
      'Cookies & Session Storage',
      'We use strictly necessary session cookies and secure local storage to keep you authenticated, preserve your selected language (Arabic or English), and maintain website functionality. We do not use third-party behavioral advertising cookies. You can manage or disable cookies through your browser settings, though disabling essential session cookies may prevent account login features from functioning.'
    ],
    [
      'Data Security & Retention',
      'We implement industry-grade technical and organizational security controls—including TLS/HTTPS cryptographic transmission, database access restrictions, firewall protection, and internal privilege separation—to safeguard data against unauthorized access, loss, or disclosure. We retain personal and corporate records only as long as necessary to provide platform services, resolve legal disputes, and comply with Egyptian tax, accounting, and corporate record-keeping mandates.'
    ],
    [
      'Your Rights & Data Requests',
      'Under applicable privacy principles and Egyptian Law No. 151 of 2020, you have the right to request access to the personal data we hold about you, request corrections to inaccurate details, request deletion of your account and personal records, or object to specific processing activities. To exercise any of these rights, please contact our Data Protection and Compliance team at omarhassan@asher-jobs.com.'
    ],
    [
      'Updates & Contact Details',
      'We may update this Privacy Policy from time to time to reflect operational enhancements, new platform features, or evolving regulatory and payment gateway requirements. The most recent version will always be published on this page with immediate effect.\n\nFor questions, privacy inquiries, or payment security details, contact us:\n• Entity: Asher Media for Electronic Services (CR 11615)\n• Email: omarhassan@asher-jobs.com\n• Phone: +20 155 645 4666\n• Headquarters: 10th of Ramadan City, Sharqia Governorate, Egypt.'
    ]
  ],
  ar: [
    [
      'من نحن والهوية القانونية للمنصة',
      'تُدار منصة عاشر جوبز (المتاحة عبر asherjobs.com) بواسطة عاشر ميديا للخدمات الإلكترونية، وهي منشأة مسجلة بجمهورية مصر العربية بموجب السجل التجاري رقم 11615، ومقرها الإداري في مدينة العاشر من رمضان، محافظة الشرقية. ويُقصد بضمائر المتكلم («نحن» و«عاشر جوبز») عاشر ميديا للخدمات الإلكترونية. ونحن نلتزم بحماية خصوصية وأمان وسرية بيانات كافة المستخدمين من ممثلي الشركات والباحثين عن عمل.'
    ],
    [
      'بيانات الدفع والامتثال لمعايير Paymob وPCI-DSS',
      'لا تقوم عاشر جوبز نهائياً بتخزين أو جمع أو معالجة أي بيانات بنكية أو تفاصيل خاصة ببطاقات الدفع الإلكتروني، بما في ذلك رقم البطاقة الكامل (16 رقماً)، أو تاريخ الانتهاء، أو كود التحقق الأمني (CVV/CVC)، أو رمز التحقق السري المؤقت (OTP). وتتم جميع معاملات الدفع الإلكتروني ومعالجة بطاقات الدفع مباشرة وبشكل آمن عبر بوابة الدفع الإلكتروني المعتمدة والمرخصة Paymob (شركة بايموب لحلول المدفوعات الرقمية) المتوافقة مع أعلى معايير أمان مدفوعات البطاقات العالمية (PCI-DSS المستوى الأول). يتم تحويل المستخدم إلى صفحة الدفع الآمنة والمشفرة بتشفير 256-bit SSL/TLS الخاصة بـ Paymob، ولا تستلم عاشر جوبز سوى رمز تعريف المعاملة المشفر وحالة الدفع ورقم الطلب لإتمام تفعيل الخدمة المطلوبة.'
    ],
    [
      'المعلومات التي نجمعها',
      'تبعاً لطريقة استخدامك للمنصة، نقوم بجمع الفئات التالية من المعلومات:\n• بيانات الهوية والحساب: الاسم الكامل، اسم المنشأة أو الشركة، رقم السجل التجاري أو البطاقة الضريبية (عند الاقتضاء)، البريد الإلكتروني للعمل، ورقم الهاتف المحمول.\n• بيانات المرشحين وملفات التوظيف: بيانات التواصل، الخبرات المهنية السابقة، المهارات، المؤهلات العلمية، المسميات الوظيفية المستهدفة، حالة التوفر للعمل، وملفات السيرة الذاتية (CV) المقدمة طوعياً لغرض التوظيف.\n• سجلات المعاملات والفوترة: رقم طلب المعاملة الصادر من Paymob، باقة الاشتراك المشتراة، مدة الباقة، المبلغ المدفوع بالجنيه المصري (EGP)، توقيت السداد، وحالة تأكيد المعاملة.\n• البيانات التقنية وسجلات النظام: عنوان بروتوكول الإنترنت (IP)، نوع المتصفح والجهاز ونظام التشغيل، وتوقيت الدخول وسجلات النشاط المخصصة لمراقبة أمان واستقرار النظام.'
    ],
    [
      'أغراض واستخدام المعلومات المسجلة',
      'نقوم بمعالجة واستخدام البيانات المجمعة وفقاً للقوانين المصرية السارية، وبخاصة القانون رقم 151 لسنة 2020 بشأن حماية البيانات الشخصية، للأغراض التالية:\n• إنشاء وتفعيل وإدارة حسابات الشركات والمرشحين.\n• تقديم وتفعيل باقات الاشتراك الرقمية وإتاحة خدمات البحث في قاعدة بيانات المرشحين.\n• التحقق الإداري من الهوية القانونية والتجارية للشركات قبل السماح بالوصول لبيانات التواصل للمرشحين.\n• معالجة المدفوعات الرقمية وربط العمليات عبر بوابة Paymob.\n• حماية المنصة من عمليات الاحتيال والسحب الآلي غير المصرح به وضمان أمان البيانات.\n• تقديم خدمات الدعم الفني وخدمة العملاء والرد على استفسارات المشتركين.\n• الامتثال للالتزامات المحاسبية والضريبية والتنظيمية المقررة قانوناً في مصر.'
    ],
    [
      'حماية بيانات المرشحين وضوابط الوصول',
      'تحظى بيانات السيرة الذاتية ووسائل تواصل المرشحين بأعلى درجات السرية، ولا يُسمح بالاطلاع عليها إلا للشركات والمصانع المعتمدة والمشتركة في باقات المنصة بعد مراجعتها وتوثيقها إدارياً. ولا تُعرض بيانات المرشحين للمحركات العامة دون إذن، كما يحق للمرشح طلب تعديل أو تحديث أو حذف بياناته وسيرته الذاتية في أي وقت.'
    ],
    [
      'مشاركة البيانات والجهات الخارجية',
      'نحن لا نبيع أو نؤجر أو نتاجر ببيانات المستخدمين مع أي طرف ثالث لأغراض تسويقية أو تجارية. وتقتصر مشاركة البيانات المحدودة جداً على:\n1. مزود خدمات الدفع الإلكتروني: شركة Paymob، لغرض إتمام وتوثيق عمليات الدفع ورد المبالغ المستردة.\n2. مزودو خدمات البنية التحتية والاستضافة السحابية: بموجب اتفاقيات سرية صارمة لحماية وتشفير البيانات.\n3. الجهات القانونية والرقابية: السلطات القضائية أو الحكومية المصرية المختصة متى كان ذلك ملزماً بموجب أمر قضائي أو نص تشريعي نافذ.'
    ],
    [
      'ملفات تعريف الارتباط والتخزين المحلي',
      'نستخدم ملفات تعريف الارتباط الأساسية (Cookies) وتقنية التخزين المحلي للمتصفح لحفظ حالة تسجيل الدخول، وحفظ اللغة المفضلة (العربية أو الإنجليزية)، وضمان استمرارية تشغيل النظام. ولا نستخدم ملفات تتبع إعلانية من أطراف خارجية. يمكنك إدارة إعدادات الكوكيز عبر متصفحك، مع ملاحظة أن تعطيلها قد يؤثر على القدرة على تسجيل الدخول لحسابك.'
    ],
    [
      'أمان البيانات والاحتفاظ بها',
      'نطبق تدابير تقنية وتنظيمية متقدمة لحماية البيانات، تشمل التشفير الكامل عبر بروتوكولات HTTPS/TLS، وعزل قواعد البيانات، وضوابط الوصول الصارمة وجدران الحماية. ونحتفظ بالبيانات فقط للمدة اللازمة لتقديم الخدمات أو لتسوية النزاعات أو للامتثال لمتطلبات القوانين الضريبية والمحاسبية والتجارية السارية في جمهورية مصر العربية.'
    ],
    [
      'حقوق المستخدمين والطلبات المتعلقة بالبيانات',
      'وفقاً لأحكام القانون رقم 151 لسنة 2020، يحق لك طلب الاطلاع على بياناتك الشخصية المسجلة، أو طلب تصحيحها وتحديثها، أو طلب حذف الحساب والبيانات المرتبطة به. لتقديم أي طلب متعلق بحقوق الخصوصية، يمكنك مراسلة فريق حماية البيانات عبر البريد: omarhassan@asher-jobs.com.'
    ],
    [
      'التعديلات وبيانات الاتصال الرسمية',
      'يجوز لنا تحديث سياسة الخصوصية هذه من حين لآخر لتلائم التطورات التقنية أو متطلبات بوابة الدفع Paymob أو التشريعات القانونية، وتُعد أي تعديلات سارية فور نشرها على هذه الصفحة.\n\nللاستفسارات والطلبات المتعلقة بالخصوصية وأمان المعاملات، يرجى التواصل معنا:\n• المنشأة: عاشر ميديا للخدمات الإلكترونية (سجل تجاري 11615)\n• البريد الإلكتروني: omarhassan@asher-jobs.com\n• الهاتف: 4666 645 155 20+\n• المقر الرئيسي: مدينة العاشر من رمضان، محافظة الشرقية، جمهورية مصر العربية.'
    ]
  ]
};

export default function PrivacyPolicyPage() {
  const { isRtl } = useLanguage();
  const content = isRtl ? sections.ar : sections.en;

  return (
    <main dir={isRtl ? 'rtl' : 'ltr'} style={{ padding: 'clamp(2rem, 5vw, 4rem) 0', background: 'var(--bg-page)' }}>
      <article className="container" style={{ maxWidth: 900 }}>
        <header style={{ marginBottom: '1.5rem' }}>
          <h1 style={{ fontSize: 'clamp(1.8rem, 5vw, 2.5rem)', fontWeight: 850, margin: '0 0 0.65rem', color: 'var(--slate-900)' }}>
            {isRtl ? 'سياسة الخصوصية وحماية البيانات' : 'Privacy & Data Protection Policy'}
          </h1>
          <p style={{ margin: 0, color: 'var(--slate-600)', lineHeight: 1.8 }}>
            {isRtl
              ? 'توضح هذه السياسة التزام عاشر جوبز بحماية بياناتك والامتثال لمعايير بوابة الدفع Paymob والقوانين المصرية لحماية البيانات.'
              : 'This policy details how Asher Jobs collects, uses, and safeguards information in compliance with Paymob standards and Egyptian data privacy laws.'}
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
          {isRtl ? 'لأي استفسار بخصوص سياسة الخصوصية، ' : 'For any questions regarding our Privacy Policy, '}
          <Link to="/contact" style={{ color: 'var(--accent)', fontWeight: 700 }}>
            {isRtl ? 'تواصل معنا' : 'contact us'}
          </Link>.
        </p>
      </article>
    </main>
  );
}
