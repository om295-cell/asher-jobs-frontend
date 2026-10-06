import React from 'react'
import { Link } from 'react-router-dom'
import { useLanguage } from '../../context/LanguageContext'
import { MapPin, Phone, Mail, Target } from 'lucide-react'

export default function AboutPage() {
  const { isRtl } = useLanguage()
  return (
    <div style={{ padding: 'clamp(2rem, 5vw, 4rem) 0', background: 'var(--bg-page)' }}>
      <div className="container" style={{ maxWidth: 760 }}>
        <div style={{ textAlign: 'center', marginBottom: '2.5rem' }}>
          <h1 style={{ fontSize: 'clamp(1.75rem, 5vw, 2.25rem)', fontWeight: 800, color: 'var(--slate-900)', marginBottom: '0.75rem' }}>
            {isRtl ? 'من نحن — عاشر جوبز' : 'About Us — Asher Jobs'}
          </h1>
          <p style={{ fontSize: 'clamp(0.95rem, 2vw, 1.0625rem)', color: 'var(--slate-500)' }}>
            {isRtl ? 'قصة المنصة ومهمتها' : 'Platform Story & Mission'}
          </p>
        </div>

        <div className="card card-responsive" style={{ marginBottom: '1.5rem' }}>
          <div style={{ display: 'flex', gap: '1rem', alignItems: 'flex-start', marginBottom: '1.5rem' }}>
            <Target size={28} style={{ color: 'var(--accent)', flexShrink: 0, marginTop: '0.2rem' }} />
            <div>
              <h2 style={{ fontSize: '1.25rem', fontWeight: 700, color: 'var(--slate-800)', marginBottom: '0.75rem' }}>
                {isRtl ? 'المشكلة التي تحلّها عاشر جوبز' : 'The Problem Asher Jobs Solves'}
              </h2>
              <p style={{ fontSize: '0.9375rem', color: 'var(--slate-600)', lineHeight: 1.8 }}>
                {isRtl
                  ? 'المصانع والشركات في العاشر من رمضان والمناطق الصناعية المجاورة تحتاج باستمرار إلى فنيين وعمال ومهندسين ومحاسبين وسائقين. في نفس الوقت، آلاف الباحثين عن عمل يرسلون سيرهم الذاتية بشكل عشوائي عبر واتساب وفيسبوك والإيميل — دون تنظيم أو هيكلة. النتيجة: وقت ضائع وفرص ضائعة لكلا الطرفين.'
                  : 'Factories and companies in 10th of Ramadan and surrounding industrial zones continuously need technicians, workers, engineers, accountants, and drivers. At the same time, thousands of job seekers send CVs randomly through WhatsApp, Facebook, and email — unstructured and hard to find. The result: lost time and missed opportunities for both sides.'}
              </p>
            </div>
          </div>
          <div style={{ borderTop: '1px solid var(--border)', paddingTop: '1.5rem' }}>
            <h2 style={{ fontSize: '1.25rem', fontWeight: 700, color: 'var(--slate-800)', marginBottom: '0.75rem' }}>
              {isRtl ? 'حلّنا: قاعدة بيانات موحّدة ومنظّمة' : 'Our Solution: One Unified Database'}
            </h2>
            <p style={{ fontSize: '0.9375rem', color: 'var(--slate-600)', lineHeight: 1.8 }}>
              {isRtl
                ? 'منصة عاشر جوبز تبني قاعدة بيانات واحدة، منظّمة، قابلة للبحث — تجمع كل باحثي العمل وكل الشركات في منطقة صناعية واحدة. كل مرشح يسجّل مرة واحدة، وكل شركة معتمدة تجد ما تحتاجه في ثوانٍ.'
                : 'Asher Jobs builds one unified, searchable database — bringing together all job seekers and companies in the industrial zone. Every candidate registers once, and every approved company finds what they need in seconds.'}
            </p>
          </div>
        </div>

        <div className="card card-responsive">
          <h2 style={{ fontSize: '1.125rem', fontWeight: 700, color: 'var(--slate-800)', marginBottom: '1.25rem' }}>
            {isRtl ? 'للتواصل معنا' : 'Contact Us'}
          </h2>
          <div style={{ display: 'flex', flexDirection: 'column', gap: '0.875rem', fontSize: '0.9375rem', color: 'var(--slate-600)' }}>
            <div style={{ display: 'flex', gap: '0.75rem', alignItems: 'center' }}>
              <MapPin size={18} style={{ color: 'var(--accent)', flexShrink: 0 }} />
              <span>{isRtl ? 'العاشر من رمضان — محافظة الشرقية — مصر' : '10th of Ramadan, Sharqia Governorate, Egypt'}</span>
            </div>
            <div style={{ display: 'flex', gap: '0.75rem', alignItems: 'center' }}>
              <Phone size={18} style={{ color: 'var(--accent)', flexShrink: 0 }} />
              <span dir="ltr">+20 100 000 0000</span>
            </div>
            <div style={{ display: 'flex', gap: '0.75rem', alignItems: 'center' }}>
              <Mail size={18} style={{ color: 'var(--accent)', flexShrink: 0 }} />
              <span dir="ltr">info@asherjobs.com</span>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}
