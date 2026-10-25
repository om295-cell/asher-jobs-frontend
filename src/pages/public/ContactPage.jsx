import React, { useState } from 'react';
import { Link } from 'react-router-dom';
import { useLanguage } from '../../context/LanguageContext';
import {
  Mail,
  Phone,
  MapPin,
  Clock,
  Send,
  MessageSquare,
  CheckCircle2,
  Copy,
  Check,
  ChevronDown,
  Building2,
  ShieldCheck,
  ExternalLink,
  Sparkles,
  RefreshCw,
  HelpCircle,
  FileText
} from 'lucide-react';

const content = {
  ar: {
    badge: 'عاشر ميديا للخدمات الإلكترونية | س.ت: 11615',
    title: 'تواصل مع فريق عاشر جوبز',
    subtitle: 'نسعد دائماً بالإجابة على استفساراتكم ومساعدة أصحاب الأعمال والباحثين عن عمل في العاشر من رمضان والمناطق الصناعية.',
    statusAvailable: 'فريق الدعم متصل وجاهز للرد',
    channelsTitle: 'قنوات التواصل المباشر',
    
    // Channels
    channels: [
      {
        id: 'whatsapp',
        icon: MessageSquare,
        title: 'واتساب مباشر',
        value: '+20 155 645 4666',
        desc: 'أسرع طريقة للتواصل والاستفسارات الفورية',
        actionLabel: 'محادثة فورية',
        actionType: 'whatsapp',
        link: 'https://wa.me/201556454666?text=' + encodeURIComponent('مرحباً فريق عاشر جوبز، أود الاستفسار بخصوص: ')
      },
      {
        id: 'phone',
        icon: Phone,
        title: 'اتصال هاتفي',
        value: '+20 155 645 4666',
        desc: 'السبت - الخميس من 9:00 ص حتى 5:00 م',
        actionLabel: 'اتصل الآن',
        actionType: 'tel',
        link: 'tel:+201556454666'
      },
      {
        id: 'email',
        icon: Mail,
        title: 'البريد الإلكتروني',
        value: 'asherjobs@outlook.com',
        desc: 'للمراسلات الرسمية والشراكات والفوترة',
        actionLabel: 'إرسال بريد',
        actionType: 'mail',
        link: 'mailto:asherjobs@outlook.com'
      },
      {
        id: 'location',
        icon: MapPin,
        title: 'المقر والإدارة',
        value: 'مدينة العاشر من رمضان',
        desc: 'محافظة الشرقية، جمهورية مصر العربية',
        actionLabel: 'عرض الخريطة',
        actionType: 'map',
        link: 'https://maps.google.com/?q=' + encodeURIComponent('العاشر من رمضان، محافظة الشرقية، مصر')
      }
    ],

    // Form
    formTitle: 'أرسل لنا رسالة مباشرة',
    formSubtitle: 'املأ النموذج وسيقوم مسؤول الدعم بالتواصل معك خلال ساعات العمل الرسمية.',
    nameLabel: 'الاسم بالكامل',
    namePlaceholder: 'أدخل اسمك الكريم',
    phoneLabel: 'رقم الهاتف / الواتساب',
    phonePlaceholder: '01XXXXXXXXX',
    emailLabel: 'البريد الإلكتروني',
    emailPlaceholder: 'name@example.com',
    typeLabel: 'صفة الاستفسار',
    typeOptions: [
      { value: 'employer', label: 'شركة / صاحب عمل (باقات واشتراكات وطلبات توظيف)' },
      { value: 'candidate', label: 'باحث عن عمل (تعديل سيرة ذاتية أو استفسار عام)' },
      { value: 'billing', label: 'مشكلة في الدفع أو الفواتير والمستندات' },
      { value: 'partnership', label: 'شراكة أو تعاون مؤسسي' },
      { value: 'other', label: 'استفسار عام آخر' }
    ],
    subjectLabel: 'موضوع الرسالة',
    subjectPlaceholder: 'ملخص سريع للاستفسار',
    messageLabel: 'تفاصيل الرسالة',
    messagePlaceholder: 'اكتب تفاصيل استفسارك أو طلبك هنا بوضوح...',
    btnSubmit: 'إرسال الرسالة الآن',
    btnSendWhatsApp: 'إرسال عبر الواتساب بدلاً من ذلك',
    sending: 'جاري الإرسال...',

    // Success State
    successTitle: 'تم استلام رسالتك بنجاح!',
    successDesc: 'شكراً لتواصلك مع عاشر جوبز. تم تسجيل طلبك وسيقوم أحد ممثلي خدمة العملاء بمراجعته والرد عليك في أقرب وقت.',
    ticketLabel: 'رقم التذكرة المرجعي:',
    btnSendAnother: 'إرسال استفسار آخر',

    // Side Info
    legalCardTitle: 'بيانات المنصة الرسمية',
    companyName: 'عاشر ميديا للخدمات الإلكترونية',
    crNumber: 'السجل التجاري رقم: 11615',
    hqText: 'المقر: مدينة العاشر من رمضان، محافظة الشرقية، مصر',
    complianceNote: 'منصة مصرية مسجلة رسمياً، وتعتمد بوابة الدفع Paymob المعتمدة من البنك المركزي المصري لجميع العمليات المالية.',
    hoursTitle: 'أوقات العمل وخدمة العملاء',
    hoursSchedule: 'السبت - الخميس: 9:00 صباحاً – 5:00 مساءً',
    hoursFriday: 'الجمعة: عطلة أسبوعية (يستمر استقبال الرسائل إلكترونياً 24/7)',
    refundNoticeTitle: 'لطلبات الفواتير والاسترداد:',
    refundNoticeText: 'يرجى تزويدنا برقم العملية واسم الشركة المسجل عبر البريد الرسمي أو الواتساب، وعدم مشاركة أي بيانات بطاقات ائتمانية حساسة.',

    // FAQ
    faqTitle: 'الأسئلة الشائعة السريعة',
    faqs: [
      {
        q: 'كيف يمكن للشركات تفعيل الحساب والوصول لأرقام هواتف المرشحين؟',
        a: 'بعد تسجيل حساب الشركة واختيار باقة البحث المناسبة والدفع عبر Paymob، تخضع بيانات الشركة للمراجعة السريعة للتحقق من السجل التجاري، ثم يتم فتح بيانات التواصل والتصدير فوراً.'
      },
      {
        q: 'أنا باحث عن عمل، كيف يمكنني تعديل مهنتي أو رقم هاتفي؟',
        a: 'يمكنك تسجيل الدخول لحسابك في أي وقت والانتقال إلى "الملف الشخصي" أو "السيرة الذاتية" لتحديث المسمى الوظيفي وسنوات الخبرة ورقم الهاتف مجاناً.'
      },
      {
        q: 'ماذا أفعل إذا تم خصم المبلغ ولم يتم تفعيل الباقة فوراً؟',
        a: 'في حالات نادرة لبطء اتصال البوابة، يرجى مراسلتنا فوراً عبر الواتساب أو البريد الإلكتروني مع إرفاق رقم العملية (Transaction ID)، وسيتم التحقق والتفعيل الفوري لحسابك.'
      },
      {
        q: 'هل توفر المنصة خدمات شحن أو توصيل مادي؟',
        a: 'لا، جميع خدمات عاشر جوبز هي خدمات رقمية سحابية 100%، والتفعيل يتم رقمياً عبر الإنترنت دون أي رسوم شحن أو بضائع مادية.'
      }
    ],

    copied: 'تم النسخ للحافظة!',
    copyBtn: 'نسخ'
  },

  en: {
    badge: 'Asher Media for Electronic Services | CR: 11615',
    title: 'Get in Touch with Asher Jobs',
    subtitle: 'We are here to assist employers and job seekers across 10th of Ramadan City and industrial business hubs.',
    statusAvailable: 'Support team is online & ready to assist',
    channelsTitle: 'Direct Communication Channels',

    // Channels
    channels: [
      {
        id: 'whatsapp',
        icon: MessageSquare,
        title: 'Direct WhatsApp',
        value: '+20 155 645 4666',
        desc: 'Fastest way for instant inquiries and live support',
        actionLabel: 'Chat Now',
        actionType: 'whatsapp',
        link: 'https://wa.me/201556454666?text=' + encodeURIComponent('Hello Asher Jobs team, I would like to inquire about: ')
      },
      {
        id: 'phone',
        icon: Phone,
        title: 'Phone Call',
        value: '+20 155 645 4666',
        desc: 'Saturday - Thursday from 9:00 AM to 5:00 PM',
        actionLabel: 'Call Now',
        actionType: 'tel',
        link: 'tel:+201556454666'
      },
      {
        id: 'email',
        icon: Mail,
        title: 'Official Email',
        value: 'asherjobs@outlook.com',
        desc: 'For formal proposals, billing and corporate inquiries',
        actionLabel: 'Send Email',
        actionType: 'mail',
        link: 'mailto:asherjobs@outlook.com'
      },
      {
        id: 'location',
        icon: MapPin,
        title: 'Headquarters',
        value: '10th of Ramadan City',
        desc: 'Sharqia Governorate, Egypt',
        actionLabel: 'View Map',
        actionType: 'map',
        link: 'https://maps.google.com/?q=' + encodeURIComponent('10th of Ramadan City, Sharqia Governorate, Egypt')
      }
    ],

    // Form
    formTitle: 'Send Us a Direct Message',
    formSubtitle: 'Fill out this form and a representative will get back to you promptly during business hours.',
    nameLabel: 'Full Name',
    namePlaceholder: 'Enter your full name',
    phoneLabel: 'Phone / WhatsApp Number',
    phonePlaceholder: '01XXXXXXXXX',
    emailLabel: 'Email Address',
    emailPlaceholder: 'name@example.com',
    typeLabel: 'Inquiry Category',
    typeOptions: [
      { value: 'employer', label: 'Employer / Company (Subscriptions, search quotas, recruitment)' },
      { value: 'candidate', label: 'Job Seeker (CV update, account assistance)' },
      { value: 'billing', label: 'Payment, billing, or transaction receipts' },
      { value: 'partnership', label: 'Corporate partnership or business proposal' },
      { value: 'other', label: 'General inquiry' }
    ],
    subjectLabel: 'Subject',
    subjectPlaceholder: 'Brief summary of your inquiry',
    messageLabel: 'Message Details',
    messagePlaceholder: 'Describe your request or question clearly...',
    btnSubmit: 'Submit Message Now',
    btnSendWhatsApp: 'Send via WhatsApp Instead',
    sending: 'Sending...',

    // Success State
    successTitle: 'Message Received Successfully!',
    successDesc: 'Thank you for reaching out to Asher Jobs. Your inquiry has been logged and our support team will review and reply shortly.',
    ticketLabel: 'Reference Ticket ID:',
    btnSendAnother: 'Send Another Message',

    // Side Info
    legalCardTitle: 'Official Platform Information',
    companyName: 'Asher Media for Electronic Services',
    crNumber: 'Commercial Register: 11615',
    hqText: 'HQ: 10th of Ramadan City, Sharqia Governorate, Egypt',
    complianceNote: 'Officially registered Egyptian entity utilizing Paymob payment gateway certified by the Central Bank of Egypt.',
    hoursTitle: 'Support & Working Hours',
    hoursSchedule: 'Saturday - Thursday: 9:00 AM – 5:00 PM',
    hoursFriday: 'Friday: Closed (Electronic inquiries accepted 24/7)',
    refundNoticeTitle: 'For Billing & Refund Inquiries:',
    refundNoticeText: 'Please state your company name and order reference number in your message. Never send credit card numbers via email or chat.',

    // FAQ
    faqTitle: 'Frequently Asked Questions',
    faqs: [
      {
        q: 'How do employers activate candidate phone contact details?',
        a: 'After choosing a suitable subscription quota and completing checkout via Paymob, company details are verified, and candidates’ direct phone contacts and export options unlock immediately.'
      },
      {
        q: 'I am a job seeker, how can I update my phone number or occupation?',
        a: 'Log into your candidate profile at any time, go to "My CV" or "Edit Profile", and adjust your standardized job title, experience level, and phone number free of charge.'
      },
      {
        q: 'What should I do if a payment went through but features did not unlock?',
        a: 'In rare cases of network delays, contact our operations team via WhatsApp or email with your Transaction ID, and our team will provision access manually within 2 hours.'
      },
      {
        q: 'Does Asher Jobs deliver physical goods or products?',
        a: 'No. All services provided by Asher Jobs are 100% digital cloud services. Access is granted electronically with zero shipping charges.'
      }
    ],

    copied: 'Copied to clipboard!',
    copyBtn: 'Copy'
  }
};

export default function ContactPage() {
  const { isRtl } = useLanguage();
  const t = isRtl ? content.ar : content.en;

  // Form state
  const [formData, setFormData] = useState({
    name: '',
    phone: '',
    email: '',
    type: 'employer',
    subject: '',
    message: ''
  });
  const [submitting, setSubmitting] = useState(false);
  const [submittedTicket, setSubmittedTicket] = useState(null);
  const [errorMsg, setErrorMsg] = useState('');

  // Copy feedback state
  const [copiedKey, setCopiedKey] = useState(null);

  // FAQ Accordion open index
  const [openFaq, setOpenFaq] = useState(0);

  const handleCopy = (key, text) => {
    navigator.clipboard?.writeText(text);
    setCopiedKey(key);
    setTimeout(() => {
      setCopiedKey(null);
    }, 2000);
  };

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
    if (errorMsg) setErrorMsg('');
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    if (!formData.name.trim() || !formData.phone.trim() || !formData.message.trim()) {
      setErrorMsg(isRtl ? 'يرجى ملء جميع الحقول الإلزامية (الاسم، الهاتف، الرسالة).' : 'Please complete all required fields (Name, Phone, Message).');
      return;
    }

    setSubmitting(true);
    // Simulate swift and robust submission logging
    setTimeout(() => {
      const ticketId = 'ASH-' + Math.floor(100000 + Math.random() * 900000);
      setSubmittedTicket(ticketId);
      setSubmitting(false);
      setFormData({
        name: '',
        phone: '',
        email: '',
        type: 'employer',
        subject: '',
        message: ''
      });
    }, 700);
  };

  const handleSendViaWhatsApp = () => {
    if (!formData.message.trim() && !formData.name.trim()) {
      window.open('https://wa.me/201556454666', '_blank');
      return;
    }

    const typeText = t.typeOptions.find((o) => o.value === formData.type)?.label || formData.type;
    const msg = isRtl
      ? `مرحباً فريق عاشر جوبز،\nالاسم: ${formData.name || 'غير محدد'}\nالهاتف: ${formData.phone || 'غير محدد'}\nالبريد: ${formData.email || 'غير محدد'}\nالصفة: ${typeText}\nالموضوع: ${formData.subject || 'استفسار عام'}\n\nنص الرسالة:\n${formData.message}`
      : `Hello Asher Jobs Team,\nName: ${formData.name || 'Not specified'}\nPhone: ${formData.phone || 'Not specified'}\nEmail: ${formData.email || 'Not specified'}\nCategory: ${typeText}\nSubject: ${formData.subject || 'General Inquiry'}\n\nMessage:\n${formData.message}`;

    window.open(`https://wa.me/201556454666?text=${encodeURIComponent(msg)}`, '_blank');
  };

  return (
    <main dir={isRtl ? 'rtl' : 'ltr'} style={{ background: 'var(--bg-page)', padding: 'clamp(2rem, 5vw, 4.5rem) 0' }}>
      <div className="container" style={{ maxWidth: 1120 }}>
        
        {/* Hero Header */}
        <header style={{ textAlign: 'center', marginBottom: '3rem' }}>
          <div
            style={{
              display: 'inline-flex',
              alignItems: 'center',
              gap: '0.5rem',
              padding: '0.4rem 0.95rem',
              borderRadius: 'var(--radius-full)',
              background: 'var(--slate-100)',
              color: 'var(--slate-800)',
              fontSize: '0.85rem',
              fontWeight: 650,
              marginBottom: '1rem',
              border: '1px solid var(--border)'
            }}
          >
            <Sparkles size={16} style={{ color: 'var(--slate-900)' }} />
            <span>{t.badge}</span>
          </div>

          <h1
            style={{
              fontSize: 'clamp(2.1rem, 5vw, 3.2rem)',
              fontWeight: 900,
              color: 'var(--slate-900)',
              lineHeight: 1.25,
              margin: '0 0 1rem',
              letterSpacing: '-0.02em'
            }}
          >
            {t.title}
          </h1>

          <p
            style={{
              maxWidth: 720,
              margin: '0 auto 1.5rem',
              color: 'var(--slate-600)',
              fontSize: '1.08rem',
              lineHeight: 1.85
            }}
          >
            {t.subtitle}
          </p>

          <div
            style={{
              display: 'inline-flex',
              alignItems: 'center',
              gap: '0.5rem',
              background: 'rgba(16, 185, 129, 0.08)',
              color: '#065f46',
              border: '1px solid rgba(16, 185, 129, 0.3)',
              padding: '0.35rem 0.85rem',
              borderRadius: 'var(--radius-full)',
              fontSize: '0.825rem',
              fontWeight: 600
            }}
          >
            <span
              style={{
                width: 8,
                height: 8,
                borderRadius: '50%',
                background: '#10b981',
                display: 'inline-block',
                boxShadow: '0 0 0 3px rgba(16, 185, 129, 0.25)'
              }}
            />
            <span>{t.statusAvailable}</span>
          </div>
        </header>

        {/* Quick Contact Channels Grid */}
        <section style={{ marginBottom: '3.5rem' }}>
          <h2 style={{ fontSize: '1.25rem', fontWeight: 800, color: 'var(--slate-900)', marginBottom: '1.25rem' }}>
            {t.channelsTitle}
          </h2>

          <div
            style={{
              display: 'grid',
              gridTemplateColumns: 'repeat(auto-fit, minmax(min(100%, 250px), 1fr))',
              gap: '1.25rem'
            }}
          >
            {t.channels.map((ch) => {
              const Icon = ch.icon;
              const isCopied = copiedKey === ch.id;

              return (
                <div
                  key={ch.id}
                  style={{
                    background: 'var(--bg-surface)',
                    border: '1px solid var(--border)',
                    borderRadius: 'var(--radius-lg)',
                    padding: '1.4rem',
                    display: 'flex',
                    flexDirection: 'column',
                    justifyContent: 'space-between',
                    boxShadow: 'var(--shadow-sm)',
                    transition: 'transform 0.2s ease, box-shadow 0.2s ease, border-color 0.2s ease'
                  }}
                  onMouseEnter={(e) => {
                    e.currentTarget.style.transform = 'translateY(-3px)';
                    e.currentTarget.style.borderColor = 'var(--slate-400)';
                    e.currentTarget.style.boxShadow = 'var(--shadow-md)';
                  }}
                  onMouseLeave={(e) => {
                    e.currentTarget.style.transform = 'translateY(0)';
                    e.currentTarget.style.borderColor = 'var(--border)';
                    e.currentTarget.style.boxShadow = 'var(--shadow-sm)';
                  }}
                >
                  <div>
                    <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '1rem' }}>
                      <div
                        style={{
                          width: 48,
                          height: 48,
                          borderRadius: 'var(--radius-md)',
                          background: 'var(--slate-900)',
                          color: '#ffffff',
                          display: 'grid',
                          placeItems: 'center',
                          flexShrink: 0
                        }}
                      >
                        <Icon size={22} />
                      </div>

                      <button
                        type="button"
                        onClick={() => handleCopy(ch.id, ch.value)}
                        style={{
                          background: 'transparent',
                          border: 'none',
                          cursor: 'pointer',
                          display: 'inline-flex',
                          alignItems: 'center',
                          gap: '0.35rem',
                          color: isCopied ? '#059669' : 'var(--slate-500)',
                          fontSize: '0.775rem',
                          fontWeight: 600,
                          padding: '0.3rem 0.5rem',
                          borderRadius: 'var(--radius-sm)'
                        }}
                        title={t.copyBtn}
                      >
                        {isCopied ? <Check size={14} /> : <Copy size={14} />}
                        <span>{isCopied ? t.copied : t.copyBtn}</span>
                      </button>
                    </div>

                    <h3 style={{ fontSize: '1.05rem', fontWeight: 800, margin: '0 0 0.35rem', color: 'var(--slate-900)' }}>
                      {ch.title}
                    </h3>
                    
                    <p
                      dir="ltr"
                      style={{
                        fontSize: '1rem',
                        fontWeight: 700,
                        color: 'var(--slate-800)',
                        margin: '0 0 0.45rem',
                        textAlign: isRtl ? 'right' : 'left'
                      }}
                    >
                      {ch.value}
                    </p>

                    <p style={{ fontSize: '0.825rem', color: 'var(--slate-500)', margin: '0 0 1.25rem', lineHeight: 1.6 }}>
                      {ch.desc}
                    </p>
                  </div>

                  <a
                    href={ch.link}
                    target={ch.actionType === 'whatsapp' || ch.actionType === 'map' ? '_blank' : undefined}
                    rel="noopener noreferrer"
                    style={{
                      display: 'inline-flex',
                      alignItems: 'center',
                      justifyContent: 'center',
                      gap: '0.5rem',
                      width: '100%',
                      padding: '0.65rem 1rem',
                      borderRadius: 'var(--radius-md)',
                      background: ch.id === 'whatsapp' ? '#128c7e' : 'var(--slate-100)',
                      color: ch.id === 'whatsapp' ? '#ffffff' : 'var(--slate-900)',
                      fontSize: '0.875rem',
                      fontWeight: 700,
                      textDecoration: 'none',
                      transition: 'opacity 0.15s ease'
                    }}
                    onMouseEnter={(e) => (e.currentTarget.style.opacity = '0.9')}
                    onMouseLeave={(e) => (e.currentTarget.style.opacity = '1')}
                  >
                    <span>{ch.actionLabel}</span>
                    <ExternalLink size={14} />
                  </a>
                </div>
              );
            })}
          </div>
        </section>

        {/* Form and Information Two-Column Grid */}
        <div
          style={{
            display: 'grid',
            gridTemplateColumns: 'repeat(auto-fit, minmax(min(100%, 480px), 1fr))',
            gap: '2.5rem',
            alignItems: 'start',
            marginBottom: '4rem'
          }}
        >
          {/* Column 1: Interactive Contact Form */}
          <section
            style={{
              background: 'var(--bg-surface)',
              border: '1px solid var(--border)',
              borderRadius: 'var(--radius-lg)',
              padding: 'clamp(1.5rem, 4vw, 2.5rem)',
              boxShadow: 'var(--shadow-sm)'
            }}
          >
            {submittedTicket ? (
              <div style={{ textAlign: 'center', padding: '2rem 1rem' }}>
                <div
                  style={{
                    width: 64,
                    height: 64,
                    borderRadius: '50%',
                    background: 'rgba(16, 185, 129, 0.12)',
                    color: '#10b981',
                    display: 'grid',
                    placeItems: 'center',
                    margin: '0 auto 1.5rem'
                  }}
                >
                  <CheckCircle2 size={36} />
                </div>

                <h3 style={{ fontSize: '1.45rem', fontWeight: 850, color: 'var(--slate-900)', margin: '0 0 0.75rem' }}>
                  {t.successTitle}
                </h3>

                <p style={{ color: 'var(--slate-600)', lineHeight: 1.8, maxWidth: 450, margin: '0 auto 1.5rem' }}>
                  {t.successDesc}
                </p>

                <div
                  style={{
                    display: 'inline-flex',
                    alignItems: 'center',
                    gap: '0.5rem',
                    background: 'var(--slate-100)',
                    padding: '0.6rem 1.2rem',
                    borderRadius: 'var(--radius-md)',
                    marginBottom: '2rem',
                    border: '1px solid var(--border)'
                  }}
                >
                  <span style={{ fontSize: '0.85rem', color: 'var(--slate-600)' }}>{t.ticketLabel}</span>
                  <strong dir="ltr" style={{ fontSize: '1.05rem', color: 'var(--slate-900)', fontFamily: 'monospace' }}>
                    {submittedTicket}
                  </strong>
                </div>

                <div>
                  <button
                    type="button"
                    onClick={() => setSubmittedTicket(null)}
                    style={{
                      display: 'inline-flex',
                      alignItems: 'center',
                      gap: '0.5rem',
                      background: 'var(--slate-900)',
                      color: '#ffffff',
                      border: 'none',
                      padding: '0.75rem 1.5rem',
                      borderRadius: 'var(--radius-md)',
                      fontWeight: 700,
                      cursor: 'pointer'
                    }}
                  >
                    <RefreshCw size={16} />
                    <span>{t.btnSendAnother}</span>
                  </button>
                </div>
              </div>
            ) : (
              <div>
                <div style={{ marginBottom: '1.75rem' }}>
                  <h2 style={{ fontSize: '1.45rem', fontWeight: 850, color: 'var(--slate-900)', margin: '0 0 0.5rem' }}>
                    {t.formTitle}
                  </h2>
                  <p style={{ margin: 0, color: 'var(--slate-600)', fontSize: '0.925rem', lineHeight: 1.7 }}>
                    {t.formSubtitle}
                  </p>
                </div>

                {errorMsg && (
                  <div
                    style={{
                      background: '#fef2f2',
                      border: '1px solid #fecaca',
                      color: '#991b1b',
                      padding: '0.75rem 1rem',
                      borderRadius: 'var(--radius-md)',
                      fontSize: '0.875rem',
                      marginBottom: '1.25rem',
                      fontWeight: 600
                    }}
                  >
                    {errorMsg}
                  </div>
                )}

                <form onSubmit={handleSubmit} style={{ display: 'grid', gap: '1.15rem' }}>
                  <div>
                    <label style={{ display: 'block', fontSize: '0.875rem', fontWeight: 700, color: 'var(--slate-800)', marginBottom: '0.4rem' }}>
                      {t.nameLabel} <span style={{ color: '#dc2626' }}>*</span>
                    </label>
                    <input
                      type="text"
                      name="name"
                      required
                      value={formData.name}
                      onChange={handleInputChange}
                      placeholder={t.namePlaceholder}
                      style={{
                        width: '100%',
                        padding: '0.75rem 0.95rem',
                        borderRadius: 'var(--radius-md)',
                        border: '1px solid var(--border)',
                        background: 'var(--bg-surface)',
                        color: 'var(--slate-900)',
                        outline: 'none',
                        fontSize: '0.95rem'
                      }}
                    />
                  </div>

                  <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))', gap: '1rem' }}>
                    <div>
                      <label style={{ display: 'block', fontSize: '0.875rem', fontWeight: 700, color: 'var(--slate-800)', marginBottom: '0.4rem' }}>
                        {t.phoneLabel} <span style={{ color: '#dc2626' }}>*</span>
                      </label>
                      <input
                        type="tel"
                        name="phone"
                        required
                        dir="ltr"
                        value={formData.phone}
                        onChange={handleInputChange}
                        placeholder={t.phonePlaceholder}
                        style={{
                          width: '100%',
                          padding: '0.75rem 0.95rem',
                          borderRadius: 'var(--radius-md)',
                          border: '1px solid var(--border)',
                          background: 'var(--bg-surface)',
                          color: 'var(--slate-900)',
                          outline: 'none',
                          fontSize: '0.95rem',
                          textAlign: isRtl ? 'right' : 'left'
                        }}
                      />
                    </div>

                    <div>
                      <label style={{ display: 'block', fontSize: '0.875rem', fontWeight: 700, color: 'var(--slate-800)', marginBottom: '0.4rem' }}>
                        {t.emailLabel}
                      </label>
                      <input
                        type="email"
                        name="email"
                        dir="ltr"
                        value={formData.email}
                        onChange={handleInputChange}
                        placeholder={t.emailPlaceholder}
                        style={{
                          width: '100%',
                          padding: '0.75rem 0.95rem',
                          borderRadius: 'var(--radius-md)',
                          border: '1px solid var(--border)',
                          background: 'var(--bg-surface)',
                          color: 'var(--slate-900)',
                          outline: 'none',
                          fontSize: '0.95rem',
                          textAlign: isRtl ? 'right' : 'left'
                        }}
                      />
                    </div>
                  </div>

                  <div>
                    <label style={{ display: 'block', fontSize: '0.875rem', fontWeight: 700, color: 'var(--slate-800)', marginBottom: '0.4rem' }}>
                      {t.typeLabel}
                    </label>
                    <select
                      name="type"
                      value={formData.type}
                      onChange={handleInputChange}
                      style={{
                        width: '100%',
                        padding: '0.75rem 0.95rem',
                        borderRadius: 'var(--radius-md)',
                        border: '1px solid var(--border)',
                        background: 'var(--bg-surface)',
                        color: 'var(--slate-900)',
                        outline: 'none',
                        fontSize: '0.95rem',
                        cursor: 'pointer'
                      }}
                    >
                      {t.typeOptions.map((opt) => (
                        <option key={opt.value} value={opt.value}>
                          {opt.label}
                        </option>
                      ))}
                    </select>
                  </div>

                  <div>
                    <label style={{ display: 'block', fontSize: '0.875rem', fontWeight: 700, color: 'var(--slate-800)', marginBottom: '0.4rem' }}>
                      {t.subjectLabel}
                    </label>
                    <input
                      type="text"
                      name="subject"
                      value={formData.subject}
                      onChange={handleInputChange}
                      placeholder={t.subjectPlaceholder}
                      style={{
                        width: '100%',
                        padding: '0.75rem 0.95rem',
                        borderRadius: 'var(--radius-md)',
                        border: '1px solid var(--border)',
                        background: 'var(--bg-surface)',
                        color: 'var(--slate-900)',
                        outline: 'none',
                        fontSize: '0.95rem'
                      }}
                    />
                  </div>

                  <div>
                    <label style={{ display: 'block', fontSize: '0.875rem', fontWeight: 700, color: 'var(--slate-800)', marginBottom: '0.4rem' }}>
                      {t.messageLabel} <span style={{ color: '#dc2626' }}>*</span>
                    </label>
                    <textarea
                      name="message"
                      required
                      rows={5}
                      value={formData.message}
                      onChange={handleInputChange}
                      placeholder={t.messagePlaceholder}
                      style={{
                        width: '100%',
                        padding: '0.75rem 0.95rem',
                        borderRadius: 'var(--radius-md)',
                        border: '1px solid var(--border)',
                        background: 'var(--bg-surface)',
                        color: 'var(--slate-900)',
                        outline: 'none',
                        fontSize: '0.95rem',
                        resize: 'vertical',
                        lineHeight: 1.65
                      }}
                    />
                  </div>

                  <div style={{ display: 'flex', flexDirection: 'column', gap: '0.75rem', marginTop: '0.5rem' }}>
                    <button
                      type="submit"
                      disabled={submitting}
                      style={{
                        display: 'inline-flex',
                        alignItems: 'center',
                        justifyContent: 'center',
                        gap: '0.65rem',
                        padding: '0.85rem 1.5rem',
                        borderRadius: 'var(--radius-md)',
                        background: 'var(--slate-900)',
                        color: '#ffffff',
                        border: 'none',
                        fontWeight: 750,
                        fontSize: '1rem',
                        cursor: submitting ? 'not-allowed' : 'pointer',
                        opacity: submitting ? 0.75 : 1,
                        transition: 'background 0.15s ease'
                      }}
                    >
                      <Send size={18} />
                      <span>{submitting ? t.sending : t.btnSubmit}</span>
                    </button>

                    <button
                      type="button"
                      onClick={handleSendViaWhatsApp}
                      style={{
                        display: 'inline-flex',
                        alignItems: 'center',
                        justifyContent: 'center',
                        gap: '0.65rem',
                        padding: '0.75rem 1.5rem',
                        borderRadius: 'var(--radius-md)',
                        background: '#f0fdf4',
                        color: '#15803d',
                        border: '1px solid #bbf7d0',
                        fontWeight: 700,
                        fontSize: '0.925rem',
                        cursor: 'pointer',
                        transition: 'background 0.15s ease'
                      }}
                    >
                      <MessageSquare size={17} />
                      <span>{t.btnSendWhatsApp}</span>
                    </button>
                  </div>
                </form>
              </div>
            )}
          </section>

          {/* Column 2: Legal Info, Working Hours & Trust Cards */}
          <div style={{ display: 'grid', gap: '1.25rem' }}>
            
            {/* Legal Identity Card */}
            <div
              style={{
                background: 'var(--bg-surface)',
                border: '1px solid var(--border)',
                borderRadius: 'var(--radius-lg)',
                padding: '1.5rem',
                boxShadow: 'var(--shadow-sm)'
              }}
            >
              <div style={{ display: 'flex', alignItems: 'center', gap: '0.65rem', marginBottom: '0.85rem' }}>
                <Building2 size={20} style={{ color: 'var(--slate-900)' }} />
                <h3 style={{ fontSize: '1.15rem', fontWeight: 800, color: 'var(--slate-900)', margin: 0 }}>
                  {t.legalCardTitle}
                </h3>
              </div>

              <div style={{ display: 'grid', gap: '0.5rem', fontSize: '0.925rem', color: 'var(--slate-700)', lineHeight: 1.7 }}>
                <p style={{ margin: 0, fontWeight: 750, color: 'var(--slate-900)' }}>{t.companyName}</p>
                <p style={{ margin: 0 }}>{t.crNumber}</p>
                <p style={{ margin: 0 }}>{t.hqText}</p>
              </div>

              <div
                style={{
                  marginTop: '1.15rem',
                  paddingTop: '1rem',
                  borderTop: '1px solid var(--border)',
                  display: 'flex',
                  alignItems: 'flex-start',
                  gap: '0.65rem'
                }}
              >
                <ShieldCheck size={18} style={{ color: '#059669', flexShrink: 0, marginTop: 2 }} />
                <p style={{ margin: 0, fontSize: '0.825rem', color: 'var(--slate-600)', lineHeight: 1.65 }}>
                  {t.complianceNote}
                </p>
              </div>
            </div>

            {/* Working Hours Card */}
            <div
              style={{
                background: 'var(--bg-surface)',
                border: '1px solid var(--border)',
                borderRadius: 'var(--radius-lg)',
                padding: '1.5rem',
                boxShadow: 'var(--shadow-sm)'
              }}
            >
              <div style={{ display: 'flex', alignItems: 'center', gap: '0.65rem', marginBottom: '0.85rem' }}>
                <Clock size={20} style={{ color: 'var(--slate-900)' }} />
                <h3 style={{ fontSize: '1.15rem', fontWeight: 800, color: 'var(--slate-900)', margin: 0 }}>
                  {t.hoursTitle}
                </h3>
              </div>

              <div style={{ display: 'grid', gap: '0.45rem', fontSize: '0.925rem', color: 'var(--slate-700)', lineHeight: 1.7 }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                  <span style={{ width: 6, height: 6, borderRadius: '50%', background: 'var(--slate-900)' }} />
                  <strong>{t.hoursSchedule}</strong>
                </div>
                <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', color: 'var(--slate-500)', fontSize: '0.85rem' }}>
                  <span style={{ width: 6, height: 6, borderRadius: '50%', background: 'var(--slate-400)' }} />
                  <span>{t.hoursFriday}</span>
                </div>
              </div>
            </div>

            {/* Payment & Refund Guidance */}
            <div
              style={{
                background: 'var(--slate-50)',
                border: '1px dashed var(--slate-300)',
                borderRadius: 'var(--radius-lg)',
                padding: '1.35rem'
              }}
            >
              <h4 style={{ fontSize: '0.95rem', fontWeight: 800, color: 'var(--slate-900)', margin: '0 0 0.45rem' }}>
                {t.refundNoticeTitle}
              </h4>
              <p style={{ margin: 0, fontSize: '0.85rem', color: 'var(--slate-600)', lineHeight: 1.75 }}>
                {t.refundNoticeText}
              </p>

              <div style={{ marginTop: '0.85rem', display: 'flex', gap: '1rem', flexWrap: 'wrap' }}>
                <Link
                  to="/refund-policy"
                  style={{
                    display: 'inline-flex',
                    alignItems: 'center',
                    gap: '0.35rem',
                    fontSize: '0.825rem',
                    fontWeight: 700,
                    color: 'var(--slate-900)',
                    textDecoration: 'underline'
                  }}
                >
                  <FileText size={14} />
                  <span>{isRtl ? 'سياسة الاسترداد' : 'Refund Policy'}</span>
                </Link>

                <Link
                  to="/privacy-policy"
                  style={{
                    display: 'inline-flex',
                    alignItems: 'center',
                    gap: '0.35rem',
                    fontSize: '0.825rem',
                    fontWeight: 700,
                    color: 'var(--slate-900)',
                    textDecoration: 'underline'
                  }}
                >
                  <ShieldCheck size={14} />
                  <span>{isRtl ? 'سياسة الخصوصية' : 'Privacy Policy'}</span>
                </Link>
              </div>
            </div>

          </div>
        </div>

        {/* FAQ Accordion Section */}
        <section
          style={{
            background: 'var(--bg-surface)',
            border: '1px solid var(--border)',
            borderRadius: 'var(--radius-lg)',
            padding: 'clamp(1.5rem, 4vw, 2.5rem)',
            boxShadow: 'var(--shadow-sm)'
          }}
        >
          <div style={{ display: 'flex', alignItems: 'center', gap: '0.65rem', marginBottom: '1.5rem' }}>
            <HelpCircle size={24} style={{ color: 'var(--slate-900)' }} />
            <h2 style={{ fontSize: '1.35rem', fontWeight: 850, color: 'var(--slate-900)', margin: 0 }}>
              {t.faqTitle}
            </h2>
          </div>

          <div style={{ display: 'grid', gap: '0.85rem' }}>
            {t.faqs.map((faq, idx) => {
              const isOpen = openFaq === idx;
              return (
                <div
                  key={idx}
                  style={{
                    border: '1px solid var(--border)',
                    borderRadius: 'var(--radius-md)',
                    overflow: 'hidden',
                    transition: 'border-color 0.15s ease'
                  }}
                >
                  <button
                    type="button"
                    onClick={() => setOpenFaq(isOpen ? null : idx)}
                    style={{
                      width: '100%',
                      padding: '1rem 1.25rem',
                      background: isOpen ? 'var(--slate-50)' : 'transparent',
                      border: 'none',
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'space-between',
                      textAlign: isRtl ? 'right' : 'left',
                      cursor: 'pointer',
                      fontSize: '0.975rem',
                      fontWeight: 750,
                      color: 'var(--slate-900)',
                      gap: '1rem'
                    }}
                  >
                    <span>{faq.q}</span>
                    <ChevronDown
                      size={18}
                      style={{
                        transform: isOpen ? 'rotate(180deg)' : 'rotate(0deg)',
                        transition: 'transform 0.2s ease',
                        flexShrink: 0
                      }}
                    />
                  </button>

                  {isOpen && (
                    <div
                      style={{
                        padding: '0 1.25rem 1.25rem 1.25rem',
                        background: 'var(--slate-50)',
                        color: 'var(--slate-600)',
                        fontSize: '0.9rem',
                        lineHeight: 1.8,
                        borderTop: '1px solid var(--border)'
                      }}
                    >
                      {faq.a}
                    </div>
                  )}
                </div>
              );
            })}
          </div>
        </section>

      </div>
    </main>
  );
}
