import React, { useEffect, useState } from 'react'
import { Link } from 'react-router-dom'
import { useLanguage } from '../../context/LanguageContext'
import { candidateApi } from '../../api/candidate.api'
import { Edit, User, Phone, Briefcase, MapPin, Star, BookOpen } from 'lucide-react'
import StatusBadge from '../../components/ui/StatusBadge'
import LoadingSpinner from '../../components/ui/LoadingSpinner'

export default function CandidateProfile() {
  const { isRtl } = useLanguage()
  const [profile, setProfile] = useState(null)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    candidateApi.getMyProfile().then(res => setProfile(res.data?.data)).catch(() => {}).finally(() => setLoading(false))
  }, [])

  if (loading) return <LoadingSpinner />
  if (!profile) return (
    <div style={{ padding: '4rem 1rem', textAlign: 'center' }}>
      <p style={{ color: 'var(--slate-500)' }}>{isRtl ? 'الملف غير موجود — قم بإنشائه الآن' : 'Profile not found — create it now'}</p>
      <Link to="/candidate/profile/edit" className="btn btn-accent" style={{ marginTop: '1rem', display: 'inline-flex' }}>{isRtl ? 'إنشاء الملف' : 'Create Profile'}</Link>
    </div>
  )

  const fields = [
    { icon: User, label: isRtl ? 'الاسم الكامل' : 'Full Name', value: profile.fullName },
    { icon: Phone, label: isRtl ? 'رقم الهاتف' : 'Phone', value: profile.user?.phone },
    { icon: Briefcase, label: isRtl ? 'المهنة المطلوبة' : 'Desired Job', value: isRtl ? profile.desiredJob?.nameAr : profile.desiredJob?.name },
    { icon: Star, label: isRtl ? 'سنوات الخبرة' : 'Years of Experience', value: `${profile.yearsOfExperience ?? 0} ${isRtl ? 'سنوات' : 'yrs'}` },
    { icon: BookOpen, label: isRtl ? 'المؤهل الدراسي' : 'Qualification', value: profile.qualification },
    { icon: MapPin, label: isRtl ? 'الموقع' : 'Location', value: [profile.area, profile.governorate].filter(Boolean).join('، ') },
  ]

  return (
    <div style={{ padding: '2rem 0', background: 'var(--bg-page)', minHeight: '80vh' }}>
      <div className="container" style={{ maxWidth: 720 }}>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '2rem' }}>
          <h1 style={{ fontSize: '1.5rem', fontWeight: 800, color: 'var(--slate-900)' }}>
            {isRtl ? 'ملفي المهني' : 'My Professional Profile'}
          </h1>
          <Link to="/candidate/profile/edit" style={{ display: 'inline-flex', alignItems: 'center', gap: '0.4rem', padding: '0.6rem 1.125rem', background: 'var(--accent)', color: '#fff', borderRadius: '8px', fontWeight: 700, fontSize: '0.875rem', textDecoration: 'none' }}>
            <Edit size={16} />
            {isRtl ? 'تعديل الملف' : 'Edit Profile'}
          </Link>
        </div>

        <div className="card" style={{ padding: '2rem', marginBottom: '1.5rem' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '1rem', marginBottom: '1.5rem', paddingBottom: '1.5rem', borderBottom: '1px solid var(--border)' }}>
            <div style={{ width: 64, height: 64, borderRadius: '50%', background: 'var(--accent)', color: '#fff', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '1.5rem', fontWeight: 800, flexShrink: 0 }}>
              {profile.fullName?.[0] || '?'}
            </div>
            <div>
              <h2 style={{ fontSize: '1.25rem', fontWeight: 700, color: 'var(--slate-900)', marginBottom: '0.25rem' }}>{profile.fullName}</h2>
              <div style={{ display: 'flex', gap: '0.75rem', alignItems: 'center' }}>
                <span style={{ fontSize: '0.9375rem', color: 'var(--slate-500)' }}>{isRtl ? profile.desiredJob?.nameAr : profile.desiredJob?.name}</span>
                <StatusBadge status={profile.status} />
              </div>
            </div>
          </div>

          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(220px, 1fr))', gap: '1.25rem' }}>
            {fields.map(({ icon: Icon, label, value }) => (
              <div key={label} style={{ display: 'flex', gap: '0.75rem', alignItems: 'flex-start' }}>
                <Icon size={16} style={{ color: 'var(--accent)', marginTop: '0.2rem', flexShrink: 0 }} />
                <div>
                  <div style={{ fontSize: '0.75rem', color: 'var(--slate-500)', fontWeight: 600, marginBottom: '0.2rem' }}>{label}</div>
                  <div style={{ fontSize: '0.9375rem', color: 'var(--slate-800)', fontWeight: 600 }}>{value || '—'}</div>
                </div>
              </div>
            ))}
          </div>

          {profile.skills?.length > 0 && (
            <div style={{ marginTop: '1.5rem', paddingTop: '1.5rem', borderTop: '1px solid var(--border)' }}>
              <div style={{ fontSize: '0.8125rem', fontWeight: 700, color: 'var(--slate-700)', marginBottom: '0.75rem' }}>
                {isRtl ? 'المهارات التقنية' : 'Technical Skills'}
              </div>
              <div style={{ display: 'flex', flexWrap: 'wrap', gap: '0.5rem' }}>
                {profile.skills.map(skill => (
                  <span key={skill} style={{ padding: '0.3rem 0.75rem', background: 'var(--accent-light)', color: 'var(--accent)', borderRadius: '9999px', fontSize: '0.8125rem', fontWeight: 600 }}>{skill}</span>
                ))}
              </div>
            </div>
          )}
        </div>

        {profile.notes && (
          <div className="card" style={{ padding: '1.5rem' }}>
            <h3 style={{ fontSize: '0.9375rem', fontWeight: 700, color: 'var(--slate-700)', marginBottom: '0.75rem' }}>{isRtl ? 'ملاحظات إضافية' : 'Additional Notes'}</h3>
            <p style={{ fontSize: '0.9375rem', color: 'var(--slate-600)', lineHeight: 1.7 }}>{profile.notes}</p>
          </div>
        )}
      </div>
    </div>
  )
}
