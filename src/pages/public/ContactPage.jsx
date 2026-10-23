import React from 'react';
import { Link } from 'react-router-dom';
import { useLanguage } from '../../context/LanguageContext';
import { Mail, MapPin, Phone, ArrowUpRight } from 'lucide-react';

const copy = {
  en: {
    title: 'Contact Us',
    intro: 'Questions about Asher Jobs, your account, a subscription, or a payment? Our team is here to help.',
    email: 'Email', phone: 'Phone', location: 'Business location',
    company: 'Asher Media for Electronic Services',
    address: '10th of Ramadan City, Sharqia Governorate, Egypt',
    response: 'For payment or refund requests, include your company name and order reference. Never send your full card number or security code by email.',
    about: 'About us'
  },
  ar: {
    title: 'تواصل معنا',
    intro: 'هل لديك استفسار عن عاشر جوبز أو حسابك أو الاشتراك أو عملية دفع؟ يسعد فريقنا بمساعدتك.',
    email: 'البريد الإلكتروني', phone: 'الهاتف', location: 'موقع النشاط التجاري',
    company: 'عاشر ميديا للخدمات الإلكترونية',
    address: 'مدينة العاشر من رمضان، محافظة الشرقية، مصر',
    response: 'لطلبات الدفع أو الاسترداد، يرجى ذكر اسم الشركة ورقم الطلب. لا ترسل رقم البطاقة كاملاً أو رمز الأمان عبر البريد الإلكتروني.',
    about: 'من نحن'
  }
};

function ContactCard({ icon: Icon, label, children }) {
  return (
    <div className="card card-responsive" style={{ display: 'flex', gap: '1rem', alignItems: 'flex-start' }}>
      <span style={{ width: 44, height: 44, display: 'grid', placeItems: 'center', borderRadius: 12, background: 'var(--slate-100)', color: 'var(--accent)', flexShrink: 0 }}>
        <Icon size={21} />
      </span>
      <div>
        <h2 style={{ fontSize: '0.9rem', margin: '0 0 0.35rem', color: 'var(--slate-500)' }}>{label}</h2>
        <div style={{ fontSize: '1.02rem', fontWeight: 700, color: 'var(--slate-800)', lineHeight: 1.65 }}>{children}</div>
      </div>
    </div>
  );
}

export default function ContactPage() {
  const { isRtl } = useLanguage();
  const text = isRtl ? copy.ar : copy.en;

  return (
    <main dir={isRtl ? 'rtl' : 'ltr'} style={{ padding: 'clamp(2rem, 5vw, 4rem) 0', background: 'var(--bg-page)' }}>
      <div className="container" style={{ maxWidth: 860 }}>
        <header style={{ textAlign: 'center', marginBottom: '2rem' }}>
          <p style={{ color: 'var(--accent)', fontWeight: 700, marginBottom: '0.5rem' }}>{text.company}</p>
          <h1 style={{ fontSize: 'clamp(1.8rem, 5vw, 2.6rem)', fontWeight: 850, color: 'var(--slate-900)', margin: '0 0 0.75rem' }}>{text.title}</h1>
          <p style={{ maxWidth: 650, margin: '0 auto', color: 'var(--slate-600)', lineHeight: 1.8 }}>{text.intro}</p>
        </header>

        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(min(100%, 320px), 1fr))', gap: '1rem' }}>
          <ContactCard icon={Mail} label={text.email}>
            <a href="mailto:asherjobs@outlook.com" dir="ltr" style={{ color: 'inherit', textDecoration: 'none' }}>asherjobs@outlook.com</a>
          </ContactCard>
          <ContactCard icon={Phone} label={text.phone}>
            <a href="tel:+201556454666" dir="ltr" style={{ color: 'inherit', textDecoration: 'none' }}>+20 155 645 4666</a>
          </ContactCard>
          <ContactCard icon={MapPin} label={text.location}>{text.address}</ContactCard>
        </div>

        <div className="card card-responsive" style={{ marginTop: '1rem', background: 'var(--slate-50)' }}>
          <p style={{ margin: 0, color: 'var(--slate-600)', lineHeight: 1.8 }}>{text.response}</p>
          <Link to="/about" style={{ display: 'inline-flex', alignItems: 'center', gap: '0.35rem', marginTop: '1rem', color: 'var(--accent)', fontWeight: 700, textDecoration: 'none' }}>
            {text.about}<ArrowUpRight size={16} />
          </Link>
        </div>
      </div>
    </main>
  );
}
