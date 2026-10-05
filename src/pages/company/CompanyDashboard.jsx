import React, { useEffect, useState } from 'react'
import { Link } from 'react-router-dom'
import { useAuth } from '../../context/AuthContext'
import { useLanguage } from '../../context/LanguageContext'
import { companyApi } from '../../api/company.api'
import { Users, Search, FileText, Phone, Star, TrendingUp } from 'lucide-react'
import LoadingSpinner from '../../components/ui/LoadingSpinner'
import StatusBadge from '../../components/ui/StatusBadge'

export default function CompanyDashboard() {
  const { profile } = useAuth()
  const { isRtl } = useLanguage()
  const [stats, setStats] = useState(null)
  const [recentInteractions, setRecentInteractions] = useState([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    Promise.all([
      companyApi.getStats(),
      companyApi.getRecentActivity()
    ]).then(([statsRes, actRes]) => {
      setStats(statsRes.data?.data)
      setRecentInteractions(actRes.data?.data || [])
    }).catch(() => {}).finally(() => setLoading(false))
  }, [])

  if (loading) return <LoadingSpinner />

  const isPending = profile?.verificationStatus !== 'Approved'

  return (
    <div style={{ padding: '2rem 0', background: 'var(--bg-page)', minHeight: '80vh' }}>
      <div className="container">
        <div style={{ marginBottom: '2rem' }}>
          <h1 style={{ fontSize: '1.625rem', fontWeight: 800, color: 'var(--slate-900)' }}>
            {isRtl ? `مرحباً، ${profile?.companyName || ''}` : `Welcome, ${profile?.companyName || ''}`}
          </h1>
          <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem', marginTop: '0.375rem' }}>
            <p style={{ color: 'var(--slate-500)', fontSize: '0.9375rem' }}>
              {isRtl ? 'لوحة التحكم — عاشر جوبز' : 'Company Dashboard — Asher Jobs'}
            </p>
            <StatusBadge status={profile?.verificationStatus} />
          </div>
        </div>

        {isPending && (
          <div style={{ background: '#f4f4f5', border: '2px solid #000000', borderRadius: 'var(--radius-md)', padding: '1rem 1.25rem', marginBottom: '2rem' }}>
            <strong style={{ color: '#000000' }}>
              {isRtl ? '⏳ حسابك في انتظار الموافقة الإدارية.' : '⏳ Your account is pending admin approval.'}
            </strong>
            <span style={{ color: '#52525b', fontSize: '0.9375rem', marginRight: '0.5rem' }}>
              {isRtl ? ' ستحصل على إشعار فور الموافقة.' : ' You will be notified upon approval.'}
            </span>
          </div>
        )}

        {/* Stats */}
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(160px, 1fr))', gap: '1rem', marginBottom: '2rem' }}>
          {[
            { icon: Search, label: isRtl ? 'عمليات البحث' : 'Searches Done', value: stats?.totalSearches ?? 0 },
            { icon: Phone, label: isRtl ? 'تواصل مع مرشحين' : 'Candidates Contacted', value: stats?.contacted ?? 0 },
            { icon: Star, label: isRtl ? 'مرشحون مميّزون' : 'Shortlisted', value: stats?.shortlisted ?? 0 },
            { icon: FileText, label: isRtl ? 'طلبات التوظيف' : 'Recruitment Requests', value: stats?.requests ?? 0 },
          ].map(({ icon: Icon, label, value }) => (
            <div key={label} className="card" style={{ display: 'flex', alignItems: 'center', gap: '1rem', padding: '1.25rem' }}>
              <div style={{ width: 44, height: 44, borderRadius: '10px', background: '#000000', color: '#ffffff', display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0 }}>
                <Icon size={20} />
              </div>
              <div>
                <div style={{ fontSize: '1.625rem', fontWeight: 800, color: 'var(--slate-900)' }}>{value}</div>
                <div style={{ fontSize: '0.8125rem', color: 'var(--slate-500)' }}>{label}</div>
              </div>
            </div>
          ))}
        </div>

        {/* Quick Actions */}
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(220px, 1fr))', gap: '1rem', marginBottom: '2rem' }}>
          {[
            { to: '/company/search', icon: Search, label: isRtl ? 'البحث عن مرشحين' : 'Search Candidates', desc: isRtl ? 'ابحث بالمهنة والموقع والخبرة' : 'Filter by job, location, experience', disabled: isPending },
            { to: '/company/requests', icon: FileText, label: isRtl ? 'طلبات التوظيف' : 'Recruitment Requests', desc: isRtl ? 'تحكّم في طلبات التوظيف المفتوحة' : 'Manage open hiring requests', disabled: isPending },
            { to: '/company/profile', icon: Users, label: isRtl ? 'ملف الشركة' : 'Company Profile', desc: isRtl ? 'عدّل بيانات الشركة' : 'Edit your company information', disabled: false },
            { to: '/company/subscription', icon: TrendingUp, label: isRtl ? 'الاشتراك' : 'Subscription', desc: isRtl ? 'إدارة خطة الاشتراك' : 'Manage your subscription plan', disabled: false },
          ].map(({ to, icon: Icon, label, desc, disabled }) => (
            <Link key={to} to={disabled ? '#' : to} style={{
              display: 'block', padding: '1.5rem', borderRadius: 'var(--radius-lg)',
              background: '#fff', border: '1px solid #000000',
              textDecoration: 'none', opacity: disabled ? 0.5 : 1,
              pointerEvents: disabled ? 'none' : 'auto',
              transition: 'box-shadow 0.15s'
            }}>
              <Icon size={24} style={{ color: '#000000', marginBottom: '0.75rem' }} />
              <div style={{ fontWeight: 700, fontSize: '1rem', color: 'var(--slate-800)', marginBottom: '0.25rem' }}>{label}</div>
              <div style={{ fontSize: '0.8125rem', color: 'var(--slate-500)' }}>{desc}</div>
              {disabled && <div style={{ marginTop: '0.5rem', fontSize: '0.75rem', color: '#52525b', fontWeight: 700 }}>{isRtl ? 'في انتظار الموافقة' : 'Pending approval'}</div>}
            </Link>
          ))}
        </div>

        {/* Recent Activity */}
        {recentInteractions.length > 0 && (
          <div className="card" style={{ padding: '1.75rem' }}>
            <h2 style={{ fontWeight: 700, fontSize: '1.0625rem', color: 'var(--slate-800)', marginBottom: '1.25rem' }}>
              {isRtl ? 'آخر النشاطات' : 'Recent Activity'}
            </h2>
            <div style={{ display: 'flex', flexDirection: 'column', gap: '0.75rem' }}>
              {recentInteractions.slice(0, 5).map((item, i) => (
                <div key={i} style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', padding: '0.75rem 1rem', background: 'var(--slate-50)', borderRadius: 'var(--radius-md)' }}>
                  <div>
                    <span style={{ fontWeight: 600, fontSize: '0.9375rem', color: 'var(--slate-800)' }}>{item.candidate?.fullName}</span>
                    <span style={{ fontSize: '0.8125rem', color: 'var(--slate-500)', marginRight: '0.5rem', marginLeft: '0.5rem' }}>—</span>
                    <span style={{ fontSize: '0.8125rem', color: 'var(--slate-500)' }}>{isRtl ? item.candidate?.desiredJob?.nameAr : item.candidate?.desiredJob?.name}</span>
                  </div>
                  <span style={{ fontSize: '0.75rem', color: 'var(--slate-400)' }}>{new Date(item.createdAt).toLocaleDateString(isRtl ? 'ar-EG' : 'en-US')}</span>
                </div>
              ))}
            </div>
          </div>
        )}
      </div>
    </div>
  )
}
