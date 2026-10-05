import React, { useEffect, useRef, useState } from 'react'
import { useLanguage } from '../../context/LanguageContext'
import { candidateApi } from '../../api/candidate.api'
import { Printer, Download } from 'lucide-react'
import LoadingSpinner from '../../components/ui/LoadingSpinner'

export default function CandidateCv() {
  const { isRtl } = useLanguage()
  const [profile, setProfile] = useState(null)
  const [loading, setLoading] = useState(true)
  const printRef = useRef()

  useEffect(() => {
    candidateApi.getMyProfile().then(res => setProfile(res.data?.data)).catch(() => {}).finally(() => setLoading(false))
  }, [])

  const handlePrint = () => {
    const content = printRef.current?.innerHTML
    const win = window.open('', '_blank')
    win.document.write(`
      <html dir="${isRtl ? 'rtl' : 'ltr'}" lang="${isRtl ? 'ar' : 'en'}">
        <head>
          <title>CV — ${profile?.fullName}</title>
          <meta charset="UTF-8">
          <style>
            body { font-family: Arial, sans-serif; margin: 40px; color: #000000; }
            h1 { font-size: 1.75rem; font-weight: 900; }
            h2 { font-size: 1rem; font-weight: 700; border-bottom: 2px solid #000000; padding-bottom: 4px; margin-top: 1.5rem; color: #000000; }
            .row { display: flex; gap: 2rem; flex-wrap: wrap; margin-bottom: 0.5rem; }
            .label { font-size: 0.75rem; color: #52525b; font-weight: 700; }
            .value { font-size: 0.9375rem; font-weight: 600; color: #000000; }
            .tag { display: inline-block; padding: 2px 10px; background: #f4f4f5; color: #000000; border: 1px solid #000000; border-radius: 9999px; font-size: 0.8125rem; font-weight: 600; margin: 2px; }
            .footer { margin-top: 3rem; font-size: 0.75rem; color: #71717a; text-align: center; }
          </style>
        </head>
        <body>
          ${content}
          <div class="footer">تم إنشاؤه بواسطة منصة عاشر جوبز | Asher Jobs Platform — asherjobs.com</div>
        </body>
      </html>
    `)
    win.document.close()
    win.print()
  }

  if (loading) return <LoadingSpinner />
  if (!profile) return <div style={{ padding: '3rem', textAlign: 'center', color: 'var(--slate-500)' }}>{isRtl ? 'الملف غير متاح' : 'Profile unavailable'}</div>

  return (
    <div style={{ padding: '2rem 0', background: 'var(--bg-page)', minHeight: '80vh' }}>
      <div className="container" style={{ maxWidth: 720 }}>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1.5rem' }}>
          <h1 style={{ fontSize: '1.5rem', fontWeight: 800, color: 'var(--slate-900)' }}>
            {isRtl ? 'طباعة / تحميل CV' : 'Print / Download CV'}
          </h1>
          <button onClick={handlePrint} className="btn btn-primary" style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
            <Printer size={18} />
            {isRtl ? 'طباعة' : 'Print'}
          </button>
        </div>

        <div className="card" style={{ padding: '2.5rem' }} ref={printRef}>
          {/* Header */}
          <div style={{ borderBottom: '3px solid var(--accent)', paddingBottom: '1.5rem', marginBottom: '1.5rem' }}>
            <h1 style={{ fontSize: '1.75rem', fontWeight: 900, color: 'var(--slate-900)', marginBottom: '0.5rem' }}>{profile.fullName}</h1>
            <div style={{ fontSize: '1rem', fontWeight: 600, color: 'var(--accent)' }}>{isRtl ? profile.desiredJob?.nameAr : profile.desiredJob?.name}</div>
          </div>

          {/* Contact & Info */}
          <h2 style={{ fontSize: '0.875rem', fontWeight: 800, color: 'var(--accent)', borderBottom: '2px solid var(--accent)', paddingBottom: '0.375rem', marginBottom: '1rem', textTransform: 'uppercase', letterSpacing: '0.05em' }}>
            {isRtl ? 'بيانات التواصل' : 'Contact Information'}
          </h2>
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))', gap: '0.875rem', marginBottom: '1.5rem' }}>
            {[
              { label: isRtl ? 'الهاتف' : 'Phone', value: profile.user?.phone },
              { label: isRtl ? 'البريد الإلكتروني' : 'Email', value: profile.user?.email },
              { label: isRtl ? 'المحافظة' : 'Governorate', value: profile.governorate },
              { label: isRtl ? 'المنطقة' : 'Area', value: profile.area },
            ].filter(f => f.value).map(({ label, value }) => (
              <div key={label}>
                <div style={{ fontSize: '0.75rem', color: 'var(--slate-500)', fontWeight: 700 }}>{label}</div>
                <div style={{ fontSize: '0.9375rem', fontWeight: 600, color: 'var(--slate-800)' }}>{value}</div>
              </div>
            ))}
          </div>

          {/* Experience & Education */}
          <h2 style={{ fontSize: '0.875rem', fontWeight: 800, color: 'var(--accent)', borderBottom: '2px solid var(--accent)', paddingBottom: '0.375rem', marginBottom: '1rem', textTransform: 'uppercase', letterSpacing: '0.05em' }}>
            {isRtl ? 'الخبرة والمؤهلات' : 'Experience & Education'}
          </h2>
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))', gap: '0.875rem', marginBottom: '1.5rem' }}>
            <div>
              <div style={{ fontSize: '0.75rem', color: 'var(--slate-500)', fontWeight: 700 }}>{isRtl ? 'سنوات الخبرة' : 'Years of Experience'}</div>
              <div style={{ fontSize: '0.9375rem', fontWeight: 600, color: 'var(--slate-800)' }}>{profile.yearsOfExperience ?? 0} {isRtl ? 'سنوات' : 'years'}</div>
            </div>
            <div>
              <div style={{ fontSize: '0.75rem', color: 'var(--slate-500)', fontWeight: 700 }}>{isRtl ? 'المؤهل الدراسي' : 'Qualification'}</div>
              <div style={{ fontSize: '0.9375rem', fontWeight: 600, color: 'var(--slate-800)' }}>{profile.qualification || '—'}</div>
            </div>
          </div>

          {/* Skills */}
          {profile.skills?.length > 0 && (
            <>
              <h2 style={{ fontSize: '0.875rem', fontWeight: 800, color: 'var(--accent)', borderBottom: '2px solid var(--accent)', paddingBottom: '0.375rem', marginBottom: '1rem', textTransform: 'uppercase', letterSpacing: '0.05em' }}>
                {isRtl ? 'المهارات' : 'Skills'}
              </h2>
              <div style={{ display: 'flex', flexWrap: 'wrap', gap: '0.5rem', marginBottom: '1.5rem' }}>
                {profile.skills.map(skill => (
                  <span key={skill} style={{ padding: '0.25rem 0.75rem', background: 'var(--accent-light)', color: 'var(--accent)', borderRadius: '9999px', fontSize: '0.8125rem', fontWeight: 700 }}>{skill}</span>
                ))}
              </div>
            </>
          )}

          {/* Notes */}
          {profile.notes && (
            <>
              <h2 style={{ fontSize: '0.875rem', fontWeight: 800, color: 'var(--accent)', borderBottom: '2px solid var(--accent)', paddingBottom: '0.375rem', marginBottom: '1rem', textTransform: 'uppercase', letterSpacing: '0.05em' }}>
                {isRtl ? 'ملاحظات' : 'Notes'}
              </h2>
              <p style={{ fontSize: '0.9375rem', color: 'var(--slate-600)', lineHeight: 1.7 }}>{profile.notes}</p>
            </>
          )}

          {/* Footer watermark (for screen only) */}
          <div style={{ marginTop: '2rem', paddingTop: '1.25rem', borderTop: '1px solid var(--border)', textAlign: 'center', fontSize: '0.75rem', color: 'var(--slate-400)' }}>
            {isRtl ? 'تم إنشاؤه بواسطة منصة' : 'Generated by'} عاشر جوبز | Asher Jobs — asherjobs.com
          </div>
        </div>
      </div>
    </div>
  )
}
