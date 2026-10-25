import React from 'react';
import { useLanguage } from '../../context/LanguageContext';
import { Mail, MessageSquare, ExternalLink } from 'lucide-react';

const content = {
  ar: {
    title: 'تواصل معنا',
    subtitle: 'نسعد دائماً بالإجابة على استفساراتكم ومساعدة أصحاب الأعمال والباحثين عن عمل.',
    statusAvailable: 'فريق الدعم متاح للرد',
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
    ]
  },
  en: {
    title: 'Contact Us',
    subtitle: 'We are always happy to assist employers and job seekers with any inquiries.',
    statusAvailable: 'Support team is online & ready to assist',
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
    ]
  }
};

export default function ContactPage() {
  const { isRtl } = useLanguage();
  const t = isRtl ? content.ar : content.en;

  return (
    <main dir={isRtl ? 'rtl' : 'ltr'} style={{ background: 'var(--bg-page)', padding: 'clamp(3rem, 7vw, 6rem) 0' }}>
      <div className="container" style={{ maxWidth: 860 }}>
        
        {/* Header */}
        <header style={{ textAlign: 'center', marginBottom: '3rem' }}>
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
              maxWidth: 640,
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

        {/* Channels Grid (WhatsApp & Email) */}
        <section>
          <div
            style={{
              display: 'grid',
              gridTemplateColumns: 'repeat(auto-fit, minmax(min(100%, 340px), 1fr))',
              gap: '1.5rem'
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
                    padding: '1.75rem',
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
                    <div style={{ display: 'flex', alignItems: 'center', gap: '1rem', marginBottom: '1.25rem' }}>
                      <div
                        style={{
                          width: 50,
                          height: 50,
                          borderRadius: 'var(--radius-md)',
                          background: ch.id === 'whatsapp' ? '#128c7e' : 'var(--slate-900)',
                          color: '#ffffff',
                          display: 'grid',
                          placeItems: 'center',
                          flexShrink: 0
                        }}
                      >
                        <Icon size={24} />
                      </div>
                      <div>
                        <h2 style={{ fontSize: '1.15rem', fontWeight: 800, margin: 0, color: 'var(--slate-900)' }}>
                          {ch.title}
                        </h2>
                        <p style={{ fontSize: '0.85rem', color: 'var(--slate-500)', margin: '0.25rem 0 0' }}>
                          {ch.desc}
                        </p>
                      </div>
                    </div>

                    <p
                      dir="ltr"
                      style={{
                        fontSize: '1.15rem',
                        fontWeight: 750,
                        color: 'var(--slate-900)',
                        margin: '0 0 1.5rem',
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
                      padding: '0.8rem 1rem',
                      borderRadius: 'var(--radius-md)',
                      background: ch.id === 'whatsapp' ? '#128c7e' : 'var(--slate-900)',
                      color: '#ffffff',
                      fontSize: '0.95rem',
                      fontWeight: 750,
                      textDecoration: 'none',
                      transition: 'opacity 0.15s ease'
                    }}
                    onMouseEnter={(e) => (e.currentTarget.style.opacity = '0.9')}
                    onMouseLeave={(e) => (e.currentTarget.style.opacity = '1')}
                  >
                    <span>{ch.actionLabel}</span>
                    <ExternalLink size={15} />
                  </a>
                </div>
              );
            })}
          </div>
        </section>

      </div>
    </main>
  );
}
