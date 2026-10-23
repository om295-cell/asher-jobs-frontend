import React from 'react';
import { useLanguage } from '../../context/LanguageContext';

const sections = {
  en: [
    ['Who we are', 'Asher Jobs is operated by Asher Media for Electronic Services (Commercial Register No. 11615), located in 10th of Ramadan City, Sharqia Governorate, Egypt. In this policy, “we” and “Asher Jobs” refer to the operator and the recruitment platform.'],
    ['Information we collect', 'Depending on how you use the platform, we may collect account and contact details such as your name, mobile number, and email; candidate profile information such as work history, skills, qualifications, preferred roles, availability, and CV files; employer and company details; support messages; and payment records such as order references, amount, currency, and transaction status. We also receive basic technical and security information such as device and browser details, IP address, session data, and activity logs.'],
    ['How we use information', 'We use information to create and administer accounts, operate candidate profiles and company services, match candidates with recruitment opportunities, verify employers, process subscriptions, respond to support requests, protect the platform against misuse, maintain service reliability, and meet legal, accounting, and regulatory obligations.'],
    ['How candidate information is shared', 'Candidate profile information and contact details may be made available to companies that have been reviewed and approved by Asher Jobs, for recruitment purposes and according to the platform’s access controls. Please keep your profile accurate and do not include information you do not want considered for recruitment.'],
    ['Service providers and payments', 'We may share the minimum information needed with trusted providers that support hosting, database operations, communications, security, and payment processing. Payments are processed through Paymob’s hosted payment flow. Asher Jobs does not ask you to send card details by email and does not store your full card number or card security code. Paymob may process payment data under its own privacy terms.'],
    ['Cookies and local storage', 'We use essential browser storage and cookies to support authentication, remember your language preference, and keep the platform working. Your browser settings can be used to manage cookies; disabling essential storage may prevent some account features from working.'],
    ['Retention and security', 'We retain information for as long as needed to provide the service and for legitimate operational purposes, including security, resolving disputes, and keeping transaction, tax, and accounting records as required. We apply reasonable technical and organizational measures to protect information, but no online service can guarantee absolute security.'],
    ['Your choices and requests', 'You may contact us to ask about, correct, or request deletion of personal information associated with your account, or to raise a privacy concern. We may need to verify your identity and may retain certain records where required by law or needed to resolve disputes and protect the service.'],
    ['Changes and contact', 'We may update this policy as the platform or applicable requirements change. The current version will be published on this page. For privacy questions or requests, email asherjobs@outlook.com or call +20 155 645 4666.']
  ],
  ar: [
    ['من نحن', 'تُدار منصة عاشر جوبز بواسطة عاشر ميديا للخدمات الإلكترونية (السجل التجاري رقم 11615)، ومقر النشاط في مدينة العاشر من رمضان، محافظة الشرقية، مصر. ويُقصد بعبارتي «نحن» و«عاشر جوبز» مشغّل المنصة ومنصة التوظيف.'],
    ['المعلومات التي نجمعها', 'بحسب استخدامك للمنصة، قد نجمع بيانات الحساب والتواصل مثل الاسم ورقم الهاتف والبريد الإلكتروني؛ وبيانات ملف المرشح مثل الخبرات والمهارات والمؤهلات والوظائف المطلوبة وحالة التوفر وملفات السيرة الذاتية؛ وبيانات الشركات وممثليها؛ ورسائل الدعم؛ وسجلات الدفع مثل رقم الطلب والمبلغ والعملة وحالة المعاملة. وقد نجمع أيضاً معلومات تقنية وأمنية أساسية مثل نوع الجهاز والمتصفح وعنوان IP وبيانات الجلسات وسجلات النشاط.'],
    ['كيف نستخدم المعلومات', 'نستخدم المعلومات لإنشاء الحسابات وإدارتها، وتشغيل ملفات المرشحين وخدمات الشركات، وربط المرشحين بفرص التوظيف، والتحقق من الشركات، ومعالجة الاشتراكات، والرد على طلبات الدعم، وحماية المنصة من إساءة الاستخدام، والحفاظ على موثوقية الخدمة، والوفاء بالالتزامات القانونية والمحاسبية والتنظيمية.'],
    ['مشاركة بيانات المرشحين', 'قد نتيح بيانات ملفات المرشحين ووسائل التواصل للشركات التي راجعتها عاشر جوبز واعتمدتها، لأغراض التوظيف ووفق ضوابط الوصول في المنصة. يرجى الحفاظ على دقة ملفك وعدم إضافة معلومات لا ترغب في استخدامها لأغراض التوظيف.'],
    ['مقدمو الخدمات والمدفوعات', 'قد نشارك الحد الأدنى اللازم من المعلومات مع مقدمي الخدمات الموثوقين الذين يدعمون الاستضافة وقواعد البيانات والاتصالات والأمان ومعالجة المدفوعات. تتم معالجة المدفوعات من خلال صفحة الدفع المستضافة لدى Paymob. لا تطلب عاشر جوبز إرسال بيانات البطاقة عبر البريد الإلكتروني ولا تخزن رقم البطاقة كاملاً أو رمز الأمان الخاص بها. وقد تعالج Paymob بيانات الدفع وفق سياسة الخصوصية الخاصة بها.'],
    ['ملفات تعريف الارتباط والتخزين المحلي', 'نستخدم ملفات تعريف الارتباط والتخزين الأساسي في المتصفح لدعم تسجيل الدخول وحفظ تفضيل اللغة وتشغيل المنصة. يمكنك إدارة ملفات تعريف الارتباط من إعدادات المتصفح؛ وقد يؤدي تعطيل التخزين الأساسي إلى توقف بعض وظائف الحساب.'],
    ['الاحتفاظ بالمعلومات والأمان', 'نحتفظ بالمعلومات ما دامت ضرورية لتقديم الخدمة ولأغراض تشغيلية مشروعة، بما في ذلك الأمان وتسوية النزاعات والاحتفاظ بسجلات المعاملات والضرائب والمحاسبة حسبما يلزم. ونطبق تدابير تقنية وتنظيمية معقولة لحماية المعلومات، مع العلم أن أي خدمة عبر الإنترنت لا يمكنها ضمان الأمان المطلق.'],
    ['خياراتك وطلباتك', 'يمكنك التواصل معنا للاستفسار عن المعلومات الشخصية المرتبطة بحسابك أو طلب تصحيحها أو حذفها أو تقديم استفسار متعلق بالخصوصية. وقد نحتاج إلى التحقق من هويتك، كما قد نحتفظ ببعض السجلات إذا تطلب القانون ذلك أو لفض النزاعات وحماية الخدمة.'],
    ['التعديلات والتواصل', 'قد نحدّث هذه السياسة عند تغير المنصة أو المتطلبات ذات الصلة، وسننشر النسخة الحالية في هذه الصفحة. للاستفسارات أو الطلبات المتعلقة بالخصوصية، راسلنا على asherjobs@outlook.com أو اتصل على +20 155 645 4666.']
  ]
};

export default function PrivacyPolicyPage() {
  const { isRtl } = useLanguage();
  const content = isRtl ? sections.ar : sections.en;
  return (
    <main dir={isRtl ? 'rtl' : 'ltr'} style={{ padding: 'clamp(2rem, 5vw, 4rem) 0', background: 'var(--bg-page)' }}>
      <article className="container" style={{ maxWidth: 900 }}>
        <header style={{ marginBottom: '1.5rem' }}>
          <h1 style={{ fontSize: 'clamp(1.8rem, 5vw, 2.5rem)', fontWeight: 850, margin: '0 0 0.65rem', color: 'var(--slate-900)' }}>{isRtl ? 'سياسة الخصوصية' : 'Privacy Policy'}</h1>
          <p style={{ margin: 0, color: 'var(--slate-600)', lineHeight: 1.8 }}>{isRtl ? 'توضح هذه السياسة أنواع المعلومات التي تتعامل معها عاشر جوبز وكيفية استخدامها وحمايتها.' : 'This policy explains what information Asher Jobs handles and how we use and protect it.'}</p>
        </header>
        <div style={{ display: 'grid', gap: '0.85rem' }}>
          {content.map(([title, body]) => (
            <section className="card card-responsive" key={title}>
              <h2 style={{ fontSize: '1.08rem', margin: '0 0 0.55rem', color: 'var(--slate-900)' }}>{title}</h2>
              <p style={{ margin: 0, color: 'var(--slate-600)', lineHeight: 1.85 }}>{body}</p>
            </section>
          ))}
        </div>
      </article>
    </main>
  );
}
