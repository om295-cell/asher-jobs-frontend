import React from 'react';
import { Link } from 'react-router-dom';
import { useLanguage } from '../../context/LanguageContext';

const sections = {
  en: [
    ['Digital Service Declaration (No Physical Shipping)', 'Asher Jobs is an online recruitment database and digital platform operated by Asher Media for Electronic Services (Commercial Register No. 11615), located in 10th of Ramadan City, Sharqia Governorate, Egypt. All products, subscription plans, and features available on this website are strictly electronic, intangible digital services. No physical goods or tangible items are sold, packaged, shipped, or delivered. Consequently, there are no physical shipping carriers, tracking numbers, or physical delivery and handling fees.'],
    ['Delivery Method & Digital Fulfillment', 'Service delivery is performed entirely online over the internet. Upon successful payment authorization and confirmation through our certified payment gateway, Paymob, your purchased digital subscription, search quotas, and platform features are immediately activated and provisioned on your company account within seconds (Instant Digital Delivery). An electronic payment confirmation and order receipt are displayed in your account portal and logged under your billing history.'],
    ['Employer Verification & Review Window', 'For active, verified company accounts, digital delivery is 100% instant upon payment completion. For newly registered employers subject to administrative compliance verification (to safeguard candidate privacy and prevent unauthorized data usage), identity and commercial registration review is completed within 1 to 24 business hours. Once verified, full account access is unlocked immediately. If a company account cannot be approved under our platform criteria, a full refund is immediately initiated back to the original payment card.'],
    ['Delivery Charges & Currency', 'Because all services are delivered electronically via cloud infrastructure, all shipping and delivery charges are 0.00 EGP (Free Electronic Delivery). All prices, subscription plans, and fees are clearly denominated in Egyptian Pounds (EGP) and displayed prior to payment checkout, with zero hidden shipping or handling surcharges.'],
    ['Proof of Digital Delivery', 'The transmission of a successful transaction token and payment status from Paymob, combined with the automatic unlocking of subscription features and issuance of a digital order receipt in the employer portal, constitutes valid and conclusive legal proof of digital service delivery.'],
    ['Delivery Delays & Technical Support', 'In the rare event that a network disruption or gateway latency delays your digital subscription activation beyond 15 minutes after a successful Paymob payment, please contact our technical operations team immediately. We will verify your transaction reference and ensure your digital access is provisioned within 2 to 4 business hours:\n• Email: asherjobs@outlook.com\n• Phone: +20 155 645 4666\n• Physical Headquarters: 10th of Ramadan City, Sharqia Governorate, Egypt.']
  ],
  ar: [
    ['طبيعة الخدمات الرقمية (لا يوجد شحن مادي)', 'منصة عاشر جوبز هي منصة رقمية متخصصة في قواعد بيانات التوظيف وخدمات الربط المهني، وتُدار بواسطة عاشر ميديا للخدمات الإلكترونية (السجل التجاري رقم 11615)، ومقر النشاط في مدينة العاشر من رمضان، محافظة الشرقية، مصر. جميع المنتجات والباقات والخدمات المعروضة على المنصة هي خدمات رقمية وغير ملموسة بنسبة 100%. ولا تبيع المنصة أو تشحن أو تسلّم أي سلع أو بضائع مادية ملموسة، وبالتالي لا توجد شركات شحن مادي أو أرقام تتبع شحنات أو رسوم شحن وتوصيل مادي.'],
    ['آلية التسليم والتفعيل الرقمي الفوري', 'يتم تسليم الخدمات بالكامل عبر الإنترنت وبشكل إلكتروني فوري. بمجرد إتمام عملية الدفع بنجاح وتأكيدها عبر بوابة الدفع الإلكتروني المعتمدة Paymob، يتم تفعيل باقة الاشتراك الرقمية وحدود البحث والتحميل على حساب الشركة فوراً وخلال ثوانٍ معدودة (تسليم رقمي فوري). ويظهر إشعار التأكيد الإلكتروني وتفاصيل الفاتورة في لوحة تحكم الشركة وسجل العمليات.'],
    ['فترة مراجعة واعتماد حسابات الشركات', 'بالنسبة للشركات المفعلة والمعتمدة، يكون التسليم والتفعيل رقمياً وفورياً بنسبة 100% فور نجاح الدفع. أما بالنسبة للشركات الجديدة التي تتطلب مراجعة إدارية للتحقق من السجل التجاري وحماية بيانات المرشحين، فتتم المراجعة والاعتماد خلال فترة تتراوح بين ساعة واحدة و24 ساعة عمل كحد أقصى. وفي حال تعذر اعتماد الحساب وفق معايير المنصة، يتم رد كامل المبلغ المدفوع تلقائياً إلى وسيلة الدفع الأصلية.'],
    ['رسوم التسليم والعملة', 'نظراً لأن جميع الخدمات تُسلّم إلكترونياً عبر البنية التحتية السحابية للمنصة، فإن رسوم التسليم والشحن هي 0.00 جنيه مصري (تسليم رقمي مجاني تماماً). وجميع الأسعار ورسوم الاشتراكات معروضة ومحددة بوضوح بالجنيه المصري (EGP) قبل الانتقال لصفحة الدفع، دون أي رسوم توصيل أو مصاريف شحن خفية.'],
    ['إثبات التسليم الرقمي', 'يُعتبر إشعار نجاح المعاملة الصادر من بوابة الدفع Paymob مقترناً بتفعيل صلاحيات الباقة وصدور إيصال الطلب الإلكتروني في حساب المشترك إثباتاً قانونياً وفنياً قاطعاً لاكتمال تسليم الخدمة الرقمية بنجاح.'],
    ['معالجة التأخير والدعم الفني للتسليم', 'في حالة حدوث أي انقطاع تقني نادر أو تأخر في ظهور رصيد الباقة بعد إتمام الدفع بنجاح لدى Paymob لأكثر من 15 دقيقة، يُرجى التواصل فوراً مع فريق الدعم والعمليات للتحقق من رقم العملية وتفعيل الخدمة يدوياً خلال فترة من ساعتين إلى 4 ساعات عمل:\n• البريد الإلكتروني: asherjobs@outlook.com\n• الهاتف: 4666 645 155 20+\n• المقر الإداري: مدينة العاشر من رمضان، محافظة الشرقية، جمهورية مصر العربية.']
  ]
};

export default function DeliveryPolicyPage() {
  const { isRtl } = useLanguage();
  const content = isRtl ? sections.ar : sections.en;

  return (
    <main dir={isRtl ? 'rtl' : 'ltr'} style={{ padding: 'clamp(2rem, 5vw, 4rem) 0', background: 'var(--bg-page)' }}>
      <article className="container" style={{ maxWidth: 900 }}>
        <header style={{ marginBottom: '1.5rem' }}>
          <h1 style={{ fontSize: 'clamp(1.8rem, 5vw, 2.5rem)', fontWeight: 850, margin: '0 0 0.65rem', color: 'var(--slate-900)' }}>
            {isRtl ? 'سياسة التسليم والشحن' : 'Delivery & Shipping Policy'}
          </h1>
          <p style={{ margin: 0, color: 'var(--slate-600)', lineHeight: 1.8 }}>
            {isRtl
              ? 'توضح هذه السياسة طبيعة تسليم الخدمات الرقمية والاشتراكات الإلكترونية المقدمة عبر منصة عاشر جوبز وعبر بوابة الدفع Paymob.'
              : 'This policy explains how digital services and electronic subscriptions are delivered on Asher Jobs via the Paymob payment gateway.'}
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
          {isRtl ? 'لأي استفسار بخصوص تسليم وتفعيل الخدمات، ' : 'For any inquiries regarding service delivery and activation, '}
          <Link to="/contact" style={{ color: 'var(--accent)', fontWeight: 700 }}>
            {isRtl ? 'تواصل معنا' : 'contact us'}
          </Link>.
        </p>
      </article>
    </main>
  );
}
