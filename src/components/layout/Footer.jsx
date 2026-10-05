import React from 'react';
import { Link } from 'react-router-dom';
import { Briefcase, MapPin, Phone, Mail, ShieldCheck } from 'lucide-react';
import { useLanguage } from '../../context/LanguageContext';

export default function Footer() {
  const { t, isRtl } = useLanguage();

  return (
    <footer style={{ backgroundColor: 'var(--slate-900)', color: '#ffffff', paddingTop: '3.5rem', paddingBottom: '2rem' }}>
      <div className="container">
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(240px, 1fr))', gap: '2.5rem', marginBottom: '3rem' }}>
          {/* Brand Info */}
          <div>
            <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem', marginBottom: '1rem' }}>
              <div
                style={{
                  height: 38,
                  padding: '3px 8px',
                  borderRadius: 'var(--radius-sm)',
                  background: '#ffffff',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center'
                }}
              >
                <img
                  src="/logo.png"
                  alt={t('brandName')}
                  style={{ height: '28px', width: 'auto', objectFit: 'contain', display: 'block' }}
                />
              </div>
              <span style={{ fontSize: '1.25rem', fontWeight: 800 }}>{t('brandName')}</span>
            </div>
            <p style={{ fontSize: '0.875rem', color: 'var(--slate-400)', lineHeight: 1.7, marginBottom: '1.25rem' }}>
              {isRtl
                ? 'المنصة المتخصصة في بناء قاعدة بيانات موحدة ومنظمة للباحثين عن عمل وربطهم بالمصانع والشركات المعتمدة في مدينة العاشر من رمضان والمناطق الصناعية المجاورة.'
                : 'The dedicated recruitment platform creating a centralized, structured database connecting job seekers with verified industrial factories in 10th of Ramadan.'}
            </p>
            <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', fontSize: '0.8125rem', color: 'var(--slate-300)' }}>
              <MapPin size={16} style={{ color: '#ffffff' }} />
              <span>{isRtl ? 'مدينة العاشر من رمضان، محافظة الشرقية، مصر' : '10th of Ramadan City, Sharqia, Egypt'}</span>
            </div>
          </div>

          {/* Quick links */}
          <div>
            <h4 style={{ fontSize: '0.9375rem', fontWeight: 700, color: '#ffffff', marginBottom: '1rem' }}>
              {isRtl ? 'روابط سريعة' : 'Quick Links'}
            </h4>
            <ul style={{ listStyle: 'none', display: 'flex', flexDirection: 'column', gap: '0.625rem', fontSize: '0.875rem' }}>
              <li>
                <Link to="/" style={{ color: 'var(--slate-400)', transition: 'color 0.15s' }}>
                  {t('navHome')}
                </Link>
              </li>
              <li>
                <Link to="/how-it-works" style={{ color: 'var(--slate-400)' }}>
                  {t('navHowItWorks')}
                </Link>
              </li>
              <li>
                <Link to="/about" style={{ color: 'var(--slate-400)' }}>
                  {t('navAbout')}
                </Link>
              </li>
              <li>
                <Link to="/register/candidate" style={{ color: 'var(--slate-400)' }}>
                  {t('navRegisterCandidate')}
                </Link>
              </li>
              <li>
                <Link to="/register/company" style={{ color: 'var(--slate-400)' }}>
                  {t('navRegisterCompany')}
                </Link>
              </li>
            </ul>
          </div>


          {/* Security & Verification */}
          <div>
            <h4 style={{ fontSize: '0.9375rem', fontWeight: 700, color: '#ffffff', marginBottom: '1rem' }}>
              {isRtl ? 'الأمان وموثوقية البيانات' : 'Trust & Verification'}
            </h4>
            <p style={{ fontSize: '0.8125rem', color: 'var(--slate-400)', lineHeight: 1.6, marginBottom: '1rem' }}>
              {isRtl
                ? 'جميع الشركات تخضع للمراجعة والاعتماد اليدوي قبل السماح لها بالوصول لبيانات التواصل للمرشحين لحماية الخصوصية.'
                : 'All employers undergo administrative verification before accessing candidate contact details to ensure privacy.'}
            </p>
            <div style={{ display: 'inline-flex', alignItems: 'center', gap: '0.5rem', background: 'rgba(255,255,255,0.1)', color: '#ffffff', border: '1px solid rgba(255,255,255,0.3)', padding: '0.35rem 0.75rem', borderRadius: 'var(--radius-sm)', fontSize: '0.75rem', fontWeight: 600 }}>
              <ShieldCheck size={16} />
              <span>{isRtl ? 'بيانات معتمدة ومحمية' : 'Verified & Protected Database'}</span>
            </div>
          </div>
        </div>

        {/* Bottom Bar */}
        <div
          style={{
            borderTop: '1px solid rgba(255, 255, 255, 0.1)',
            paddingTop: '1.5rem',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'space-between',
            flexWrap: 'wrap',
            gap: '1rem',
            fontSize: '0.8125rem',
            color: 'var(--slate-500)'
          }}
        >
          <div>
            © {new Date().getFullYear()} {t('brandName')} — {isRtl ? 'جميع الحقوق محفوظة' : 'All rights reserved'}.
          </div>
          <div>
            {isRtl
              ? 'صممت خصيصاً لتنظيم سوق التوظيف الصناعي والمهني'
              : 'Built for structured industrial & professional recruitment'}
          </div>
        </div>
      </div>
    </footer>
  );
}
