import React from 'react';
import { useLanguage } from '../../context/LanguageContext';
import { Mail, ExternalLink } from 'lucide-react';

function WhatsAppIcon({ size = 24 }) {
  return (
    <svg width={size} height={size} viewBox="0 0 24 24" fill="currentColor">
      <path d="M17.472 14.382c-.297-.149-1.758-.867-2.03-.967-.273-.099-.471-.148-.67.15-.197.297-.767.966-.94 1.164-.173.199-.347.223-.644.075-.297-.15-1.255-.463-2.39-1.475-.883-.788-1.48-1.761-1.653-2.059-.173-.297-.018-.458.13-.606.134-.133.298-.347.446-.52.149-.174.198-.298.298-.497.099-.198.05-.371-.025-.52-.075-.149-.669-1.612-.916-2.207-.242-.579-.487-.5-.669-.51-.173-.008-.371-.01-.57-.01-.198 0-.52.074-.792.372-.272.297-1.04 1.016-1.04 2.479 0 1.462 1.065 2.875 1.213 3.074.149.198 2.096 3.2 5.077 4.487.709.306 1.262.489 1.694.625.712.227 1.36.195 1.871.118.571-.085 1.758-.719 2.006-1.413.248-.694.248-1.289.173-1.413-.074-.124-.272-.198-.57-.347m-5.421 7.403h-.004a9.87 9.87 0 01-5.031-1.378l-.361-.214-3.741.982.998-3.648-.235-.374a9.86 9.86 0 01-1.51-5.26c.001-5.45 4.436-9.884 9.888-9.884 2.64 0 5.122 1.03 6.988 2.898a9.825 9.825 0 012.893 6.994c-.003 5.45-4.437 9.884-9.885 9.884m8.413-18.297A11.815 11.815 0 0012.05 0C5.495 0 .16 5.335.157 11.892c0 2.096.547 4.142 1.588 5.945L.057 24l6.305-1.654a11.882 11.882 0 005.683 1.448h.005c6.554 0 11.89-5.335 11.893-11.893a11.821 11.821 0 00-3.48-8.413z"/>
    </svg>
  );
}

const content = {
  ar: {
    title: 'تواصل معنا',
    subtitle: 'نسعد دائماً بالإجابة على استفساراتكم ومساعدة أصحاب الأعمال والباحثين عن عمل.',
    statusAvailable: 'فريق الدعم متاح للرد',
    channels: [
      {
        id: 'whatsapp',
        icon: WhatsAppIcon,
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
        icon: WhatsAppIcon,
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
