import React, { useEffect, useState } from 'react'
import { Link } from 'react-router-dom'
import { useAuth } from '../../context/AuthContext'
import { useLanguage } from '../../context/LanguageContext'
import { candidateApi } from '../../api/candidate.api'
import { User, Phone, Briefcase, Star, Gift, Edit, Eye, MapPin, Clock } from 'lucide-react'
import StatusBadge from '../../components/ui/StatusBadge'
import LoadingSpinner from '../../components/ui/LoadingSpinner'

export default function CandidateDashboard() {
  const { user } = useAuth()
  const { isRtl } = useLanguage()
  const [profile, setProfile] = useState(null)
  const [stats, setStats] = useState(null)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    Promise.all([
      candidateApi.getMyProfile(),
      candidateApi.getMyStats()
    ]).then(([profileRes, statsRes]) => {
      setProfile(profileRes.data?.data)
      setStats(statsRes.data?.data)
    }).catch(() => {}).finally(() => setLoading(false))
  }, [])

  if (loading) return <LoadingSpinner />

  return (
    <div style={{ padding: '2rem 0', background: 'var(--bg-page)', minHeight: '80vh' }}>
      <div className="container">
        {/* Header */}
        <div style={{ marginBottom: '2rem' }}>
          <h1 style={{ fontSize: '1.625rem', fontWeight: 800, color: 'var(--slate-900)' }}>
            {isRtl ? `مرحباً، ${profile?.fullName || user?.email}` : `Welcome, ${profile?.fullName || user?.email}`}
          </h1>
          <p style={{ color: 'var(--slate-500)', marginTop: '0.25rem' }}>
            {isRtl ? 'لوحة التحكم الخاصة بحسابك — عاشر جوبز' : 'Your candidate dashboard — Asher Jobs'}
          </p>
        </div>

        {/* Profile completeness notice */}
        {profile && !profile.desiredJob && (
          <div style={{ background: 'var(--amber-light)', border: '1px solid var(--amber)', borderRadius: 'var(--radius-md)', padding: '1rem 1.25rem', marginBottom: '1.5rem', display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: '0.75rem' }}>
            <span style={{ color: 'var(--amber-dark)', fontWeight: 600, fontSize: '0.9375rem' }}>
              ⚠️ {isRtl ? 'أكمل ملفك المهني لتظهر في نتائج بحث الشركات' : 'Complete your profile to appear in company search results'}
            </span>
            <Link to="/candidate/profile/edit" style={{ background: 'var(--amber)', color: '#fff', padding: '0.4rem 0.875rem', borderRadius: '8px', fontWeight: 700, fontSize: '0.875rem', textDecoration: 'none' }}>
              {isRtl ? 'إكمال الملف' : 'Complete Profile'}
            </Link>
          </div>
        )}

        {/* Stats Grid */}
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(min(100%, 150px), 1fr))', gap: '1rem', marginBottom: '2rem' }}>
          {[
            { icon: Eye, label: isRtl ? 'مشاهدات ملفك' : 'Profile Views', value: stats?.profileViews ?? 0, color: '#000000', bg: '#f4f4f5' },
            { icon: Star, label: isRtl ? 'اختصارات بالمفضّلة' : 'Saved by Companies', value: stats?.savedCount ?? 0, color: '#000000', bg: '#f4f4f5' },
            { icon: Phone, label: isRtl ? 'طلبات تواصل' : 'Contact Requests', value: stats?.contactRequests ?? 0, color: '#000000', bg: '#f4f4f5' },
            { icon: Gift, label: isRtl ? 'إحالات ناجحة' : 'Referrals', value: stats?.referrals ?? 0, color: '#000000', bg: '#f4f4f5' },
          ].map(({ icon: Icon, label, value, color, bg }) => (
            <div key={label} className="card" style={{ display: 'flex', alignItems: 'center', gap: '1rem', padding: '1.25rem' }}>
              <div style={{ width: 44, height: 44, borderRadius: '10px', background: bg, color, display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0 }}>
                <Icon size={20} />
              </div>
              <div>
                <div style={{ fontSize: '1.625rem', fontWeight: 800, color: 'var(--slate-900)' }}>{value}</div>
                <div style={{ fontSize: '0.8125rem', color: 'var(--slate-500)' }}>{label}</div>
              </div>
            </div>
          ))}
        </div>

        {/* Profile Card & Quick Links */}
        <div className="split-layout">
          <div className="card card-responsive">
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1.5rem', flexWrap: 'wrap', gap: '0.75rem' }}>
              <h2 style={{ fontSize: '1.125rem', fontWeight: 700, color: 'var(--slate-800)' }}>
                {isRtl ? 'ملفك المهني' : 'Your Profile'}
              </h2>
              <Link to="/candidate/profile/edit" style={{ display: 'inline-flex', alignItems: 'center', gap: '0.4rem', padding: '0.5rem 1rem', background: 'var(--accent-light)', color: 'var(--accent)', borderRadius: '8px', fontWeight: 700, fontSize: '0.875rem', textDecoration: 'none' }}>
                <Edit size={16} />
                {isRtl ? 'تعديل' : 'Edit'}
              </Link>
            </div>

            {profile ? (
              <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(min(100%, 180px), 1fr))', gap: '1rem' }}>
                {[
                  { icon: User, label: isRtl ? 'الاسم الكامل' : 'Full Name', value: profile.fullName },
                  { icon: Phone, label: isRtl ? 'رقم الهاتف' : 'Phone', value: profile.user?.phone || profile.phone },
                  { icon: Briefcase, label: isRtl ? 'المهنة المطلوبة' : 'Desired Job', value: isRtl ? profile.desiredJob?.nameAr : profile.desiredJob?.name },
                  { icon: Star, label: isRtl ? 'سنوات الخبرة' : 'Experience', value: profile.yearsOfExperience !== undefined ? `${profile.yearsOfExperience} ${isRtl ? 'سنوات' : 'yrs'}` : '-' },
                  { icon: MapPin, label: isRtl ? 'المنطقة' : 'Location', value: [profile.area, profile.governorate].filter(Boolean).join('، ') || '-' },
                  { icon: Clock, label: isRtl ? 'حالة الملف' : 'Profile Status', value: <StatusBadge status={profile.status} /> },
                ].map(({ icon: Icon, label, value }) => (
                  <div key={label} style={{ display: 'flex', gap: '0.75rem', alignItems: 'flex-start' }}>
                    <Icon size={16} style={{ color: 'var(--slate-400)', marginTop: '0.25rem', flexShrink: 0 }} />
                    <div>
                      <div style={{ fontSize: '0.75rem', color: 'var(--slate-500)', fontWeight: 600, marginBottom: '0.2rem' }}>{label}</div>
                      <div style={{ fontSize: '0.9375rem', color: 'var(--slate-800)', fontWeight: 600 }}>{value || '-'}</div>
                    </div>
                  </div>
                ))}
              </div>
            ) : (
              <p style={{ color: 'var(--slate-400)', fontSize: '0.9375rem' }}>
                {isRtl ? 'لم يتم إنشاء الملف بعد.' : 'Profile not created yet.'}
              </p>
            )}
          </div>

          {/* Quick Links */}
          <div style={{ display: 'flex', flexDirection: 'column', gap: '0.75rem', width: '100%', maxWidth: '100%' }}>
            {[
              { to: '/candidate/profile/edit', icon: Edit, label: isRtl ? 'تعديل الملف' : 'Edit Profile', color: '#000000' },
              { to: '/candidate/cv', icon: User, label: isRtl ? 'عرض / طباعة CV' : 'View / Print CV', color: '#000000' },
              { to: '/candidate/referrals', icon: Gift, label: isRtl ? 'برنامج الإحالات' : 'Referral Program', color: '#000000' },
              { to: '/candidate/settings', icon: Star, label: isRtl ? 'الإعدادات' : 'Settings', color: '#000000' },
            ].map(({ to, icon: Icon, label, color }) => (
              <Link key={to} to={to} style={{
                display: 'flex', alignItems: 'center', gap: '0.75rem',
                padding: '0.875rem 1.125rem', background: '#fff', borderRadius: 'var(--radius-md)',
                border: '1px solid var(--border)', textDecoration: 'none', color: 'var(--slate-700)',
                fontWeight: 600, fontSize: '0.9375rem', transition: 'all 0.15s'
              }}>
                <Icon size={18} style={{ color }} />
                {label}
              </Link>
            ))}
          </div>
        </div>
      </div>
    </div>
  )
}
