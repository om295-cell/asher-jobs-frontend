import React, { useState } from 'react';
import { Link } from 'react-router-dom';
import { useLanguage } from '../../context/LanguageContext';
import {
  Mail,
  Send,
  MessageSquare,
  CheckCircle2,
  ExternalLink,
  RefreshCw,
  FileText,
  ShieldCheck
} from 'lucide-react';

const content = {
  ar: {
    title: 'تواصل معنا',
    subtitle: 'نسعد دائماً بالإجابة على استفساراتكم ومساعدة أصحاب الأعمال والباحثين عن عمل.',
    statusAvailable: 'فريق الدعم متاح للرد',
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
        id: 'email',
        icon: Mail,
        title: 'البريد الإلكتروني',
        value: 'omarhassan@asher-jobs.com',
        desc: 'للمراسلات الرسمية والشراكات والفوترة',
        actionLabel: 'إرسال بريد',
        actionType: 'mail',
        link: 'mailto:omarhassan@asher-jobs.com'
      }
    ],

    // Form
    formTitle: 'أرسل لنا رسالة مباشرة',
    formSubtitle: 'املأ النموذج وسيقوم مسؤول الدعم بالتواصل معك ومتابعة طلبك.',
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
    sending: 'جاري الإرسال...',

    // Success State
    successTitle: 'تم استلام رسالتك بنجاح!',
    successDesc: 'شكراً لتواصلك مع عاشر جوبز. تم تسجيل طلبك وسيقوم أحد ممثلي الدعم بمراجعته والرد عليك في أقرب وقت.',
    ticketLabel: 'رقم التذكرة المرجعي:',
    btnSendAnother: 'إرسال استفسار آخر',

    // Support Note
    refundNoticeTitle: 'لطلبات الفواتير والاسترداد:',
    refundNoticeText: 'يرجى تزويدنا برقم العملية واسم الشركة المسجل عبر البريد الرسمي أو الواتساب، وعدم مشاركة أي بيانات بطاقات ائتمانية حساسة.'
  },

  en: {
    title: 'Contact Us',
    subtitle: 'We are always happy to assist employers and job seekers with any inquiries.',
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
        id: 'email',
        icon: Mail,
        title: 'Official Email',
        value: 'omarhassan@asher-jobs.com',
        desc: 'For formal proposals, billing and corporate inquiries',
        actionLabel: 'Send Email',
        actionType: 'mail',
        link: 'mailto:omarhassan@asher-jobs.com'
      }
    ],

    // Form
    formTitle: 'Send Us a Direct Message',
    formSubtitle: 'Fill out this form and a representative will get back to you promptly.',
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
    sending: 'Sending...',

    // Success State
    successTitle: 'Message Received Successfully!',
    successDesc: 'Thank you for reaching out to Asher Jobs. Your inquiry has been logged and our support team will review and reply shortly.',
    ticketLabel: 'Reference Ticket ID:',
    btnSendAnother: 'Send Another Message',

    // Support Note
    refundNoticeTitle: 'For Billing & Refund Inquiries:',
    refundNoticeText: 'Please state your company name and order reference number in your message. Never send credit card numbers via email or chat.'
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
    }, 600);
  };

  return (
    <main dir={isRtl ? 'rtl' : 'ltr'} style={{ background: 'var(--bg-page)', padding: 'clamp(2rem, 5vw, 4.5rem) 0' }}>
      <div className="container" style={{ maxWidth: 860 }}>
        
        {/* Header */}
        <header style={{ textAlign: 'center', marginBottom: '2.5rem' }}>
          <h1
            style={{
              fontSize: 'clamp(2.1rem, 5vw, 3rem)',
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
              maxWidth: 680,
              margin: '0 auto 1.5rem',
              color: 'var(--slate-600)',
              fontSize: '1.05rem',
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

        {/* Quick Channels Grid (WhatsApp & Email) */}
        <section style={{ marginBottom: '2.5rem' }}>
          <div
            style={{
              display: 'grid',
              gridTemplateColumns: 'repeat(auto-fit, minmax(min(100%, 340px), 1fr))',
              gap: '1.25rem'
            }}
          >
            {t.channels.map((ch) => {
              const Icon = ch.icon;

              return (
                <div
                  key={ch.id}
                  style={{
                    background: 'var(--bg-surface)',
                    border: '1px solid var(--border)',
                    borderRadius: 'var(--radius-lg)',
                    padding: '1.5rem',
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
                    <div style={{ display: 'flex', alignItems: 'center', gap: '0.85rem', marginBottom: '1rem' }}>
                      <div
                        style={{
                          width: 46,
                          height: 46,
                          borderRadius: 'var(--radius-md)',
                          background: ch.id === 'whatsapp' ? '#128c7e' : 'var(--slate-900)',
                          color: '#ffffff',
                          display: 'grid',
                          placeItems: 'center',
                          flexShrink: 0
                        }}
                      >
                        <Icon size={22} />
                      </div>
                      <div>
                        <h3 style={{ fontSize: '1.05rem', fontWeight: 800, margin: 0, color: 'var(--slate-900)' }}>
                          {ch.title}
                        </h3>
                        <p style={{ fontSize: '0.825rem', color: 'var(--slate-500)', margin: '0.2rem 0 0' }}>
                          {ch.desc}
                        </p>
                      </div>
                    </div>

                    <p
                      dir="ltr"
                      style={{
                        fontSize: '1.05rem',
                        fontWeight: 700,
                        color: 'var(--slate-800)',
                        margin: '0 0 1.25rem',
                        textAlign: isRtl ? 'right' : 'left'
                      }}
                    >
                      {ch.value}
                    </p>
                  </div>

                  <a
                    href={ch.link}
                    target={ch.actionType === 'whatsapp' ? '_blank' : undefined}
                    rel="noopener noreferrer"
                    style={{
                      display: 'inline-flex',
                      alignItems: 'center',
                      justifyContent: 'center',
                      gap: '0.5rem',
                      width: '100%',
                      padding: '0.7rem 1rem',
                      borderRadius: 'var(--radius-md)',
                      background: ch.id === 'whatsapp' ? '#128c7e' : 'var(--slate-100)',
                      color: ch.id === 'whatsapp' ? '#ffffff' : 'var(--slate-900)',
                      fontSize: '0.9rem',
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

        {/* Interactive Contact Form */}
        <section
          style={{
            background: 'var(--bg-surface)',
            border: '1px solid var(--border)',
            borderRadius: 'var(--radius-lg)',
            padding: 'clamp(1.5rem, 4vw, 2.5rem)',
            boxShadow: 'var(--shadow-sm)',
            marginBottom: '2rem'
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

                <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(220px, 1fr))', gap: '1rem' }}>
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

                <div style={{ marginTop: '0.5rem' }}>
                  <button
                    type="submit"
                    disabled={submitting}
                    style={{
                      display: 'inline-flex',
                      alignItems: 'center',
                      justifyContent: 'center',
                      gap: '0.65rem',
                      width: '100%',
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
                </div>
              </form>
            </div>
          )}
        </section>

        {/* Payment & Refund Guidance */}
        <section
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
        </section>

      </div>
    </main>
  );
}
