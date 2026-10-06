import React, { useEffect, useState } from 'react'
import { Link } from 'react-router-dom'
import { useLanguage } from '../../context/LanguageContext'
import { adminApi } from '../../api/admin.api'
import {
  Users,
  Building2,
  Clock,
  CheckCircle2,
  AlertCircle,
  Briefcase,
  FileSpreadsheet,
  TrendingUp,
  ShieldCheck,
  ArrowRight,
  RefreshCw,
  ExternalLink
} from 'lucide-react'
import LoadingSpinner from '../../components/ui/LoadingSpinner'

export default function AdminDashboard() {
  const { isRtl } = useLanguage()
  const [metrics, setMetrics] = useState(null)
  const [loading, setLoading] = useState(true)

  const fetchMetrics = () => {
    setLoading(true)
    adminApi.getDashboard()
      .then(res => setMetrics(res.data?.data))
      .catch(() => {})
      .finally(() => setLoading(false))
  }

  useEffect(() => {
    fetchMetrics()
  }, [])

  if (loading) return <LoadingSpinner />

  const kpis = [
    {
      title: isRtl ? 'إجمالي المرشحين' : 'Total Candidates',
      value: metrics?.totalCandidates ?? 0,
      today: metrics?.candidatesToday ?? 0,
      icon: Users,
      color: 'var(--accent)',
      bg: 'var(--accent-light)',
      link: '/admin/candidates'
    },
    {
      title: isRtl ? 'المرشحون المتاحون للعمل' : 'Available for Work',
      value: metrics?.availableCandidates ?? 0,
      subtitle: isRtl ? 'جاهزون للتوظيف الفوري' : 'Ready to hire now',
      icon: CheckCircle2,
      color: 'var(--emerald)',
      bg: 'var(--emerald-light)',
      link: '/admin/candidates?availability=Available'
    },
    {
      title: isRtl ? 'المصانع والشركات' : 'Registered Companies',
      value: metrics?.totalCompanies ?? 0,
      today: metrics?.companiesToday ?? 0,
      icon: Building2,
      color: 'var(--primary)',
      bg: 'var(--primary-light)',
      link: '/admin/companies'
    },
    {
      title: isRtl ? 'شركات في انتظار الاعتماد' : 'Pending Approvals',
      value: metrics?.pendingCompanies ?? 0,
      urgent: (metrics?.pendingCompanies ?? 0) > 0,
      icon: Clock,
      color: 'var(--amber)',
      bg: 'var(--amber-light)',
      link: '/admin/companies?status=Pending'
    },
    {
      title: isRtl ? 'طلبات التوظيف' : 'Recruitment Requests',
      value: metrics?.totalRequests ?? 0,
      icon: Briefcase,
      color: '#000000',
      bg: '#f4f4f5',
      link: '/admin/recruitment-requests'
    },
    {
      title: isRtl ? 'بلاغات وملاحظات' : 'Open Reports',
      value: metrics?.pendingReports ?? 0,
      urgent: (metrics?.pendingReports ?? 0) > 0,
      icon: AlertCircle,
      color: 'var(--rose)',
      bg: 'var(--rose-light)',
      link: '/admin/reports'
    }
  ]

  return (
    <div style={{ padding: '2rem 0 3rem', background: 'var(--bg-page)', minHeight: '85vh' }}>
      <div className="container">
        {/* Header */}
        <div style={{ display: 'flex', flexWrap: 'wrap', justifyContent: 'space-between', alignItems: 'center', gap: '1rem', marginBottom: '2rem' }}>
          <div>
            <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', marginBottom: '0.25rem' }}>
              <span style={{ fontSize: '0.8125rem', fontWeight: 700, padding: '0.2rem 0.6rem', background: 'var(--slate-800)', color: '#fff', borderRadius: 'var(--radius-sm)' }}>
                {isRtl ? 'الإدارة العامة' : 'Admin Control'}
              </span>
              <span style={{ color: 'var(--slate-500)', fontSize: '0.875rem' }}>
                {isRtl ? 'مدينة العاشر من رمضان' : '10th of Ramadan City'}
              </span>
            </div>
            <h1 style={{ fontSize: '1.75rem', fontWeight: 800, color: 'var(--slate-900)' }}>
              {isRtl ? 'لوحة تحكم منصة عاشر جوبز' : 'Asher Jobs Control Center'}
            </h1>
          </div>

          <div style={{ display: 'flex', gap: '0.75rem' }}>
            <button
              onClick={fetchMetrics}
              className="btn"
              style={{ background: '#fff', border: '1px solid var(--border)', color: 'var(--slate-700)', fontWeight: 600 }}
            >
              <RefreshCw size={16} />
              {isRtl ? 'تحديث البيانات' : 'Refresh Data'}
            </button>
            <Link to="/company/search" className="btn btn-accent" style={{ fontWeight: 600 }}>
              <ExternalLink size={16} />
              {isRtl ? 'معاينة شاشة البحث' : 'Preview Search'}
            </Link>
          </div>
        </div>

        {/* Pending approvals alert banner if any */}
        {(metrics?.pendingCompanies ?? 0) > 0 && (
          <div
            style={{
              background: '#f4f4f5',
              border: '1.5px solid #000000',
              borderRadius: 'var(--radius-md)',
              padding: '1rem 1.25rem',
              marginBottom: '2rem',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'space-between',
              flexWrap: 'wrap',
              gap: '0.75rem'
            }}
          >
            <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem' }}>
              <Clock color="#000000" size={24} />
              <div>
                <strong style={{ color: '#000000', fontSize: '0.9375rem' }}>
                  {isRtl
                    ? `تنبيه: يوجد ${metrics.pendingCompanies} شركة / مصنع في انتظار المراجعة والاعتماد!`
                    : `Attention: ${metrics.pendingCompanies} companies are awaiting verification!`}
                </strong>
                <p style={{ color: '#52525b', fontSize: '0.8125rem', margin: 0 }}>
                  {isRtl ? 'لن تتمكن الشركات من تصفح المرشحين إلا بعد موافقة الإدارة.' : 'Companies cannot view candidates until approved.'}
                </p>
              </div>
            </div>
            <Link
              to="/admin/companies?status=Pending"
              className="btn btn-primary"
              style={{ fontSize: '0.875rem', padding: '0.5rem 1rem' }}
            >
              {isRtl ? 'مراجعة الشركات الآن' : 'Review Companies Now'}
              <ArrowRight size={14} style={{ transform: isRtl ? 'rotate(180deg)' : 'none' }} />
            </Link>
          </div>
        )}

        {/* KPI Grid */}
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(min(100%, 200px), 1fr))', gap: '1.25rem', marginBottom: '2.5rem' }}>
          {kpis.map((kpi, idx) => {
            const Icon = kpi.icon
            return (
              <Link
                key={idx}
                to={kpi.link}
                className="card"
                style={{
                  padding: '1.25rem',
                  display: 'flex',
                  flexDirection: 'column',
                  justifyContent: 'space-between',
                  border: kpi.urgent ? '2px solid var(--amber)' : '1px solid var(--border)',
                  textDecoration: 'none',
                  color: 'inherit',
                  transition: 'transform 0.15s, box-shadow 0.15s',
                  position: 'relative'
                }}
              >
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: '1rem' }}>
                  <span style={{ fontSize: '0.875rem', fontWeight: 700, color: 'var(--slate-600)' }}>
                    {kpi.title}
                  </span>
                  <div
                    style={{
                      width: 40,
                      height: 40,
                      borderRadius: 'var(--radius-md)',
                      background: kpi.bg,
                      color: kpi.color,
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'center',
                      flexShrink: 0
                    }}
                  >
                    <Icon size={20} />
                  </div>
                </div>

                <div>
                  <div style={{ fontSize: '2rem', fontWeight: 800, color: 'var(--slate-900)', lineHeight: 1 }}>
                    {kpi.value}
                  </div>
                  {kpi.today !== undefined && (
                    <div style={{ fontSize: '0.75rem', color: 'var(--emerald)', fontWeight: 600, marginTop: '0.5rem' }}>
                      {isRtl ? `+${kpi.today} مسجلين اليوم` : `+${kpi.today} joined today`}
                    </div>
                  )}
                  {kpi.subtitle && (
                    <div style={{ fontSize: '0.75rem', color: 'var(--slate-500)', marginTop: '0.5rem' }}>
                      {kpi.subtitle}
                    </div>
                  )}
                </div>
              </Link>
            )
          })}
        </div>

        {/* Analytics & Top Jobs Section */}
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(min(100%, 280px), 1fr))', gap: '1.5rem', marginBottom: '2.5rem' }}>
          {/* Top Job Roles in Database */}
          <div className="card" style={{ padding: '1.5rem' }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1.25rem' }}>
              <h2 style={{ fontSize: '1.125rem', fontWeight: 800, color: 'var(--slate-900)' }}>
                {isRtl ? 'أكثر التخصصات تسجيلاً بالعاشر' : 'Top Registered Professions'}
              </h2>
              <Link to="/admin/jobs" style={{ fontSize: '0.8125rem', color: 'var(--accent)', fontWeight: 600 }}>
                {isRtl ? 'كتالوج المهن ←' : 'View all jobs →'}
              </Link>
            </div>

            {(!metrics?.topJobs || metrics.topJobs.length === 0) ? (
              <p style={{ color: 'var(--slate-400)', fontSize: '0.875rem' }}>
                {isRtl ? 'لا توجد بيانات كافية حالياً' : 'No data available yet'}
              </p>
            ) : (
              <div style={{ display: 'flex', flexDirection: 'column', gap: '0.875rem' }}>
                {metrics.topJobs.map((item, i) => {
                  const maxCount = metrics.topJobs[0]?.count || 1
                  const pct = Math.round((item.count / maxCount) * 100)
                  return (
                    <div key={i}>
                      <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '0.875rem', marginBottom: '0.25rem' }}>
                        <span style={{ fontWeight: 600, color: 'var(--slate-800)' }}>
                          {isRtl ? (item.job?.nameAr || item.job?.name) : (item.job?.name || item.job?.nameAr)}
                        </span>
                        <span style={{ fontWeight: 700, color: 'var(--slate-600)' }}>
                          {item.count} {isRtl ? 'مرشح' : 'candidates'}
                        </span>
                      </div>
                      <div style={{ height: 8, background: 'var(--slate-100)', borderRadius: 'var(--radius-full)', overflow: 'hidden' }}>
                        <div
                          style={{
                            width: `${pct}%`,
                            height: '100%',
                            background: i === 0 ? 'var(--accent)' : 'var(--slate-400)',
                            borderRadius: 'var(--radius-full)'
                          }}
                        />
                      </div>
                    </div>
                  )
                })}
              </div>
            )}
          </div>

          {/* Quick Management Shortcuts */}
          <div className="card" style={{ padding: '1.5rem' }}>
            <h2 style={{ fontSize: '1.125rem', fontWeight: 800, color: 'var(--slate-900)', marginBottom: '1.25rem' }}>
              {isRtl ? 'إجراءات الإدارة السريعة' : 'Quick Admin Actions'}
            </h2>
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(min(100%, 130px), 1fr))', gap: '0.875rem' }}>
              <Link
                to="/admin/companies"
                className="btn"
                style={{
                  background: 'var(--slate-50)',
                  border: '1px solid var(--border)',
                  color: 'var(--slate-800)',
                  flexDirection: 'column',
                  padding: '1.25rem 0.75rem',
                  gap: '0.5rem',
                  textAlign: 'center',
                  fontWeight: 700,
                  fontSize: '0.875rem'
                }}
              >
                <Building2 size={24} color="var(--primary)" />
                {isRtl ? 'اعتماد الشركات' : 'Verify Companies'}
              </Link>

              <Link
                to="/admin/candidates"
                className="btn"
                style={{
                  background: 'var(--slate-50)',
                  border: '1px solid var(--border)',
                  color: 'var(--slate-800)',
                  flexDirection: 'column',
                  padding: '1.25rem 0.75rem',
                  gap: '0.5rem',
                  textAlign: 'center',
                  fontWeight: 700,
                  fontSize: '0.875rem'
                }}
              >
                <Users size={24} color="var(--accent)" />
                {isRtl ? 'إدارة المرشحين' : 'Manage Candidates'}
              </Link>

              <Link
                to="/admin/jobs"
                className="btn"
                style={{
                  background: 'var(--slate-50)',
                  border: '1px solid var(--border)',
                  color: 'var(--slate-800)',
                  flexDirection: 'column',
                  padding: '1.25rem 0.75rem',
                  gap: '0.5rem',
                  textAlign: 'center',
                  fontWeight: 700,
                  fontSize: '0.875rem'
                }}
              >
                <Briefcase size={24} color="var(--emerald)" />
                {isRtl ? 'المسميات والتخصصات' : 'Standard Job Titles'}
              </Link>

              <Link
                to="/admin/recruitment-requests"
                className="btn"
                style={{
                  background: 'var(--slate-50)',
                  border: '1px solid var(--border)',
                  color: 'var(--slate-800)',
                  flexDirection: 'column',
                  padding: '1.25rem 0.75rem',
                  gap: '0.5rem',
                  textAlign: 'center',
                  fontWeight: 700,
                  fontSize: '0.875rem'
                }}
              >
                <FileSpreadsheet size={24} color="#000000" />
                {isRtl ? 'طلبات التوظيف' : 'Employer Requests'}
              </Link>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}
