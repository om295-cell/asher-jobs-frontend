import React from 'react';
import { Link } from 'react-router-dom';
import { useLanguage } from '../../context/LanguageContext';

const sections = {
  en: [
    ['What you purchase', 'Asher Jobs offers digital recruitment services to approved companies through prepaid subscriptions. The plan, access period, included limits, and total amount due are shown before payment. A subscription is activated after successful payment and any required company approval.'],
    ['Cancellation and renewal', 'Subscriptions are prepaid for the period selected at checkout and do not automatically renew. There are no future recurring subscription charges to cancel. You may choose not to purchase another period; access remains available until the paid period ends, subject to the account and subscription terms. Leaving the Paymob checkout before completing payment cancels that payment attempt.'],
    ['When you may request a refund', 'You may request a refund for a duplicate charge, an amount charged incorrectly, a payment confirmed as successful by Paymob that did not activate the purchased service, or a material service failure that we cannot resolve. You may also request cancellation and a refund within 14 days of purchase if you have not used the paid subscription features. Requests made after paid features have been used will be reviewed individually and handled in accordance with applicable law. Nothing in this policy limits rights that cannot be excluded under applicable consumer-protection law.'],
    ['How to submit a request', 'Email asherjobs@outlook.com with your company name, account email or phone number, order reference, payment date and amount, and a short explanation. For security, do not email your full card number, PIN, password, or card security code. We may contact you to verify the transaction or request supporting documents.'],
    ['Review and payment method', 'We will review the order and payment records and let you know the outcome. Approved refunds are sent to the original payment method through the payment provider. The time for the funds to appear depends on the payment provider and the card issuer or bank.'],
    ['Contact and legal rights', 'For cancellation, refund, or payment questions, contact asherjobs@outlook.com or +20 155 645 4666. This policy is operated by Asher Media for Electronic Services, Commercial Register No. 11615, 10th of Ramadan City, Sharqia Governorate, Egypt. Applicable statutory consumer rights continue to apply.']
  ],
  ar: [
    ['الخدمة التي تشتريها', 'تقدم عاشر جوبز خدمات توظيف رقمية للشركات المعتمدة من خلال اشتراكات مدفوعة مقدماً. وتُعرض الباقة ومدة الوصول والحدود المشمولة وإجمالي المبلغ المستحق قبل الدفع. يُفعّل الاشتراك بعد تأكيد نجاح الدفع واستكمال أي موافقة مطلوبة على الشركة.'],
    ['الإلغاء والتجديد', 'تُدفع الاشتراكات مقدماً للمدة التي تختارها عند إتمام الشراء ولا تتجدد تلقائياً. لذلك لا توجد رسوم اشتراك مستقبلية متكررة تحتاج إلى إلغائها. يمكنك عدم شراء مدة جديدة، ويظل الوصول متاحاً حتى نهاية المدة المدفوعة، وفق شروط الحساب والاشتراك. يؤدي مغادرة صفحة الدفع لدى Paymob قبل إتمام العملية إلى إلغاء محاولة الدفع.'],
    ['متى يمكنك طلب استرداد', 'يمكنك طلب استرداد المبلغ عند الخصم المكرر، أو خصم مبلغ غير صحيح، أو تأكيد Paymob نجاح الدفع دون تفعيل الخدمة المشتراة، أو حدوث عطل جوهري في الخدمة يتعذر علينا حله. ويمكنك أيضاً طلب إلغاء الاشتراك واسترداد المبلغ خلال 14 يوماً من الشراء إذا لم تستخدم مزايا الاشتراك المدفوعة. أما الطلبات بعد استخدام المزايا المدفوعة فتُراجع كل حالة على حدة وتُعالج وفق القانون المعمول به. ولا تنتقص هذه السياسة من أي حقوق لا يجوز استبعادها بموجب قوانين حماية المستهلك.'],
    ['كيفية تقديم الطلب', 'راسلنا على asherjobs@outlook.com مع اسم الشركة والبريد أو الهاتف المرتبط بالحساب ورقم الطلب وتاريخ الدفع والمبلغ وشرح موجز للطلب. حفاظاً على أمانك، لا ترسل رقم البطاقة كاملاً أو الرقم السري أو كلمة المرور أو رمز أمان البطاقة عبر البريد الإلكتروني. وقد نتواصل معك للتحقق من المعاملة أو لطلب مستندات داعمة.'],
    ['مراجعة الطلب وطريقة الاسترداد', 'سنراجع بيانات الطلب والدفع ونبلغك بالنتيجة. يُرسل المبلغ المسترد بعد الموافقة إلى وسيلة الدفع الأصلية عبر مزود الدفع. ويعتمد وقت ظهور المبلغ على مزود الدفع والبنك أو جهة إصدار البطاقة.'],
    ['التواصل والحقوق القانونية', 'للاستفسار عن الإلغاء أو الاسترداد أو المدفوعات، تواصل معنا عبر asherjobs@outlook.com أو +20 155 645 4666. تصدر هذه السياسة عن عاشر ميديا للخدمات الإلكترونية، السجل التجاري رقم 11615، مدينة العاشر من رمضان، محافظة الشرقية، مصر. وتظل الحقوق القانونية المقررة للمستهلك سارية.']
  ]
};

export default function RefundPolicyPage() {
  const { isRtl } = useLanguage();
  const content = isRtl ? sections.ar : sections.en;
  return (
    <main dir={isRtl ? 'rtl' : 'ltr'} style={{ padding: 'clamp(2rem, 5vw, 4rem) 0', background: 'var(--bg-page)' }}>
      <article className="container" style={{ maxWidth: 900 }}>
        <header style={{ marginBottom: '1.5rem' }}>
          <h1 style={{ fontSize: 'clamp(1.8rem, 5vw, 2.5rem)', fontWeight: 850, margin: '0 0 0.65rem', color: 'var(--slate-900)' }}>{isRtl ? 'سياسة الاسترداد والإلغاء' : 'Refund & Cancellation Policy'}</h1>
          <p style={{ margin: 0, color: 'var(--slate-600)', lineHeight: 1.8 }}>{isRtl ? 'توضح هذه السياسة كيفية إلغاء الاشتراك المدفوع وطلب استرداد المدفوعات المتعلقة بخدمات عاشر جوبز.' : 'This policy explains how to cancel a paid subscription and request a refund for Asher Jobs services.'}</p>
        </header>
        <div style={{ display: 'grid', gap: '0.85rem' }}>
          {content.map(([title, body]) => (
            <section className="card card-responsive" key={title}>
              <h2 style={{ fontSize: '1.08rem', margin: '0 0 0.55rem', color: 'var(--slate-900)' }}>{title}</h2>
              <p style={{ margin: 0, color: 'var(--slate-600)', lineHeight: 1.85 }}>{body}</p>
            </section>
          ))}
        </div>
        <p style={{ textAlign: 'center', marginTop: '1.25rem', color: 'var(--slate-500)' }}>
          {isRtl ? 'لأي استفسار آخر، ' : 'For any other questions, '}
          <Link to="/contact" style={{ color: 'var(--accent)', fontWeight: 700 }}>{isRtl ? 'تواصل معنا' : 'contact us'}</Link>.
        </p>
      </article>
    </main>
  );
}
