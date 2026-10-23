import React from 'react';
import { useLanguage } from '../../context/LanguageContext';
import { BadgeCheck, Building2, Target } from 'lucide-react';

const copy = {
  en: {
    title: 'About Asher Jobs',
    intro: 'A recruitment platform built for the people and businesses powering Egypt’s industrial communities.',
    missionTitle: 'Our mission',
    mission: 'Asher Jobs helps job seekers present their experience clearly and helps verified employers find relevant talent. We focus on practical recruitment needs across 10th of Ramadan City and nearby industrial areas.',
    platformTitle: 'How the platform works',
    platform: 'Candidates can create and maintain a professional profile. Companies apply for access and are reviewed before they can view candidate contact details. Employers can search by standardized job titles and relevant experience, then contact candidates for recruitment opportunities.',
    trustTitle: 'Trust and responsible access',
    trust: 'Candidate information is shared with approved employers for recruitment purposes. We use account controls and review procedures to help protect the platform and its members.',
    operator: 'Platform operator',
    operatorName: 'Asher Media for Electronic Services',
    registry: 'Commercial Register No. 11615',
    location: '10th of Ramadan City, Sharqia Governorate, Egypt'
  },
  ar: {
    title: 'عن عاشر جوبز',
    intro: 'منصة توظيف تخدم الأفراد والشركات التي تدعم المجتمعات الصناعية في مصر.',
    missionTitle: 'مهمتنا',
    mission: 'تساعد عاشر جوبز الباحثين عن عمل على عرض خبراتهم بوضوح، وتساعد الشركات المعتمدة على الوصول إلى الكفاءات المناسبة. نركز على احتياجات التوظيف العملية في مدينة العاشر من رمضان والمناطق الصناعية المجاورة.',
    platformTitle: 'كيف تعمل المنصة',
    platform: 'يمكن للباحثين عن عمل إنشاء ملف مهني وتحديثه. وتتقدم الشركات بطلب للوصول إلى المنصة وتخضع للمراجعة قبل السماح لها بالاطلاع على بيانات التواصل للمرشحين. ويمكن للشركات البحث حسب المسميات الوظيفية والخبرات المناسبة والتواصل مع المرشحين بشأن فرص العمل.',
    trustTitle: 'الثقة والاستخدام المسؤول',
    trust: 'تُشارك بيانات المرشحين مع الشركات المعتمدة لأغراض التوظيف. ونستخدم ضوابط الحسابات وإجراءات المراجعة للمساعدة في حماية المنصة وأعضائها.',
    operator: 'مشغّل المنصة',
    operatorName: 'عاشر ميديا للخدمات الإلكترونية',
    registry: 'السجل التجاري رقم 11615',
    location: 'مدينة العاشر من رمضان، محافظة الشرقية، مصر'
  }
};

export default function AboutPage() {
  const { isRtl } = useLanguage();
  const text = isRtl ? copy.ar : copy.en;

  return (
    <main dir={isRtl ? 'rtl' : 'ltr'} style={{ padding: 'clamp(2rem, 5vw, 4rem) 0', background: 'var(--bg-page)' }}>
      <div className="container" style={{ maxWidth: 860 }}>
        <header style={{ textAlign: 'center', marginBottom: '2rem' }}>
          <p style={{ color: 'var(--accent)', fontWeight: 700, marginBottom: '0.5rem' }}>{text.operatorName}</p>
          <h1 style={{ fontSize: 'clamp(1.8rem, 5vw, 2.6rem)', fontWeight: 850, color: 'var(--slate-900)', margin: '0 0 0.75rem' }}>{text.title}</h1>
          <p style={{ maxWidth: 680, margin: '0 auto', color: 'var(--slate-600)', lineHeight: 1.8 }}>{text.intro}</p>
        </header>

        <div style={{ display: 'grid', gap: '1rem' }}>
          <section className="card card-responsive" style={{ display: 'flex', gap: '1rem', alignItems: 'flex-start' }}>
            <Target size={25} style={{ color: 'var(--accent)', flexShrink: 0, marginTop: 3 }} />
            <div>
              <h2 style={{ fontSize: '1.2rem', margin: '0 0 0.65rem', color: 'var(--slate-900)' }}>{text.missionTitle}</h2>
              <p style={{ margin: 0, color: 'var(--slate-600)', lineHeight: 1.85 }}>{text.mission}</p>
            </div>
          </section>

          <section className="card card-responsive" style={{ display: 'flex', gap: '1rem', alignItems: 'flex-start' }}>
            <Building2 size={25} style={{ color: 'var(--accent)', flexShrink: 0, marginTop: 3 }} />
            <div>
              <h2 style={{ fontSize: '1.2rem', margin: '0 0 0.65rem', color: 'var(--slate-900)' }}>{text.platformTitle}</h2>
              <p style={{ margin: 0, color: 'var(--slate-600)', lineHeight: 1.85 }}>{text.platform}</p>
            </div>
          </section>

          <section className="card card-responsive" style={{ display: 'flex', gap: '1rem', alignItems: 'flex-start' }}>
            <BadgeCheck size={25} style={{ color: 'var(--accent)', flexShrink: 0, marginTop: 3 }} />
            <div>
              <h2 style={{ fontSize: '1.2rem', margin: '0 0 0.65rem', color: 'var(--slate-900)' }}>{text.trustTitle}</h2>
              <p style={{ margin: 0, color: 'var(--slate-600)', lineHeight: 1.85 }}>{text.trust}</p>
            </div>
          </section>

          <section className="card card-responsive" aria-label={text.operator}>
            <h2 style={{ fontSize: '1.1rem', margin: '0 0 0.6rem', color: 'var(--slate-900)' }}>{text.operator}</h2>
            <p style={{ margin: 0, color: 'var(--slate-700)', fontWeight: 700 }}>{text.operatorName}</p>
            <p style={{ margin: '0.35rem 0 0', color: 'var(--slate-600)' }}>{text.registry}</p>
            <p style={{ margin: '0.35rem 0 0', color: 'var(--slate-600)' }}>{text.location}</p>
          </section>
        </div>
      </div>
    </main>
  );
}
