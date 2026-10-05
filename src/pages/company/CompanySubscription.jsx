import React, { useEffect, useState } from 'react'
import { Link } from 'react-router-dom'
import { useAuth } from '../../context/AuthContext'
import { useLanguage } from '../../context/LanguageContext'
import { companyApi } from '../../api/company.api'
import { Check, ShieldCheck, Zap, Sparkles, Building, ArrowRight, MessageCircle } from 'lucide-react'
import LoadingSpinner from '../../components/ui/LoadingSpinner'
import StatusBadge from '../../components/ui/StatusBadge'

export default function CompanySubscription() {
  const { profile } = useAuth()
  const { isRtl } = useLanguage()
  const [stats, setStats] = useState(null)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    companyApi.getStats()
      .then(res => setStats(res.data?.data))
      .catch(() => {})
      .finally(() => setLoading(false))
  }, [])

  if (loading) return <LoadingSpinner />

  const subscription = profile?.subscription || {
    plan: 'Standard',
    status: 'Active',
    expiresAt: null,
    searchLimit: 500,
    exportLimit: 100
  }

  const plans = [
    {
      id: 'starter',
      nameAr: 'الباقة الأساسية (تجريبية)',
      nameEn: 'Starter Trial',
      priceAr: 'مجاناً للشركات المعتمدة',
      priceEn: 'Free for Approved Companies',
      featuresAr: [
        'بحث في قاعدة بيانات العاشر من رمضان',
        'عرض حتى 50 مرشح شهرياً',
        'تصدير 10 سير ذاتية بتنسيق CSV',
        'طلب توظيف واحد للمفاضلة',
        'دعم عبر البريد الإلكتروني'
      ],
      featuresEn: [
        'Search candidate database in 10th of Ramadan',
        'View up to 50 candidate profiles/month',
        'Export 10 CVs as CSV',
        '1 Custom recruitment request',
        'Standard email support'
      ],
      current: subscription.plan === 'Starter'
    },
    {
      id: 'standard',
      nameAr: 'باقة المصانع والشركات',
      nameEn: 'Standard Industrial',
      priceAr: '50 ج.م / شهرياً (بدلاً من 1100 ج.م)',
      priceEn: '50 EGP / month (instead of 1100 EGP)',
      popular: true,
      featuresAr: [
        'بحث غير محدود بجميع الفلاتر المتقدمة',
        'عرض حتى 500 مرشح شهرياً',
        'تصدير حتى 100 مرشح بتنسيق CSV / Excel',
        'طلبات توظيف مخصصة غير محدودة',
        'وصول مباشر لأرقام الهواتف والواتساب',
        'دعم فني وأولوية للمرشحين الجدد'
      ],
      featuresEn: [
        'Unlimited candidate advanced search',
        'View up to 500 candidate profiles/month',
        'Export up to 100 CVs as CSV / Excel',
        'Unlimited custom recruitment requests',
        'Direct phone & WhatsApp one-click contact',
        'Dedicated priority support'
      ],
      current: subscription.plan === 'Standard' || !subscription.plan
    },
    {
      id: 'enterprise',
      nameAr: 'باقة المؤسسات الكبرى',
      nameEn: 'Enterprise & Group',
      priceAr: 'عقود سنوية وتوظيف جماعي',
      priceEn: 'Annual High-Volume Hiring',
      featuresAr: [
        'وصول كامل وتصدير غير محدود للبيانات',
        'فريق توظيف مخصص لتصفية وإجراء المقابلات الأولية',
        'توفير عمالة ومهندسين للمشروعات وخطوط الإنتاج',
        'حملات توظيف مخصصة بالمدينة',
        'مدير حساب خاص ودعم مباشر 24/7'
      ],
      featuresEn: [
        'Full unlimited search and data export',
        'Dedicated Asher recruitment team for initial screening',
        'Fast-track mass technician & operator staffing',
        'Custom local hiring campaigns in 10th of Ramadan',
        'Dedicated account manager 24/7'
      ],
      current: subscription.plan === 'Enterprise'
    }
  ]

  return (
    <div style={{ padding: '2rem 0 3rem', background: 'var(--bg-page)', minHeight: '80vh' }}>
      <div className="container">
        {/* Header */}
        <div style={{ marginBottom: '2rem' }}>
          <h1 style={{ fontSize: '1.625rem', fontWeight: 800, color: 'var(--slate-900)' }}>
            {isRtl ? 'إدارة الاشتراك والباقات' : 'Subscription & Plans'}
          </h1>
          <p style={{ color: 'var(--slate-500)', fontSize: '0.9375rem', marginTop: '0.25rem' }}>
            {isRtl ? 'تفاصيل باقتك الحالية وحدود البحث والتصدير للمرشحين' : 'Manage your plan, candidate search limits, and exports'}
          </p>
        </div>

        {/* Current Plan Overview Card */}
        <div
          className="card"
          style={{
            padding: '1.75rem',
            marginBottom: '2.5rem',
            background: '#000000',
            color: '#fff',
            borderRadius: 'var(--radius-lg)'
          }}
        >
          <div style={{ display: 'flex', flexWrap: 'wrap', justifyContent: 'space-between', alignItems: 'center', gap: '1rem' }}>
            <div>
              <span
                style={{
                  display: 'inline-block',
                  background: 'rgba(255, 255, 255, 0.15)',
                  padding: '0.25rem 0.75rem',
                  borderRadius: 'var(--radius-full)',
                  fontSize: '0.8125rem',
                  fontWeight: 600,
                  marginBottom: '0.5rem'
                }}
              >
                {isRtl ? 'الباقة المفعلة الحالية' : 'Current Active Plan'}
              </span>
              <h2 style={{ fontSize: '1.5rem', fontWeight: 800, margin: '0 0 0.5rem 0' }}>
                {subscription.plan === 'Enterprise'
                  ? (isRtl ? 'باقة المؤسسات الكبرى' : 'Enterprise Plan')
                  : subscription.plan === 'Starter'
                  ? (isRtl ? 'الباقة الأساسية' : 'Starter Plan')
                  : (isRtl ? 'باقة المصانع القياسية' : 'Standard Industrial Plan')}
              </h2>
              <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem', opacity: 0.9, fontSize: '0.875rem' }}>
                <span>{isRtl ? 'حالة الحساب:' : 'Account Status:'}</span>
                <span style={{ color: '#ffffff', fontWeight: 700 }}>
                  {profile?.verificationStatus === 'Approved' ? (isRtl ? 'معتمد ومفعّل' : 'Approved & Active') : profile?.verificationStatus}
                </span>
              </div>
            </div>

            <a
              href="https://wa.me/201012345678?text=استفسار%20عن%20ترقية%20باقة%20عاشر%20جوبز"
              target="_blank"
              rel="noopener noreferrer"
              className="btn"
              style={{ padding: '0.75rem 1.5rem', fontWeight: 700, background: '#ffffff', color: '#000000', border: '1px solid #ffffff' }}
            >
              <MessageCircle size={18} />
              {isRtl ? 'تحدث مع الإدارة لترقية الباقة' : 'Upgrade via WhatsApp'}
            </a>
          </div>

          <div
            style={{
              display: 'grid',
              gridTemplateColumns: 'repeat(auto-fit, minmax(180px, 1fr))',
              gap: '1rem',
              marginTop: '1.5rem',
              paddingTop: '1.5rem',
              borderTop: '1px solid rgba(255, 255, 255, 0.1)'
            }}
          >
            <div>
              <div style={{ fontSize: '0.8125rem', opacity: 0.8 }}>{isRtl ? 'عمليات البحث المستهلكة' : 'Searches Used'}</div>
              <div style={{ fontSize: '1.25rem', fontWeight: 800, marginTop: '0.25rem' }}>{stats?.totalSearches ?? 0}</div>
            </div>
            <div>
              <div style={{ fontSize: '0.8125rem', opacity: 0.8 }}>{isRtl ? 'التواصل المباشر مع المرشحين' : 'Candidate Contacts'}</div>
              <div style={{ fontSize: '1.25rem', fontWeight: 800, marginTop: '0.25rem' }}>{stats?.totalInteractions ?? 0}</div>
            </div>
            <div>
              <div style={{ fontSize: '0.8125rem', opacity: 0.8 }}>{isRtl ? 'طلبات التوظيف النشطة' : 'Active Recruitment Requests'}</div>
              <div style={{ fontSize: '1.25rem', fontWeight: 800, marginTop: '0.25rem' }}>{stats?.activeRequests ?? 0}</div>
            </div>
          </div>
        </div>

        {/* Pricing Tiers Grid */}
        <h2 style={{ fontSize: '1.25rem', fontWeight: 800, color: 'var(--slate-900)', marginBottom: '1.25rem' }}>
          {isRtl ? 'مقارنة الباقات المتاحة للمصانع والشركات' : 'Available Employer Plans'}
        </h2>

        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(280px, 1fr))', gap: '1.5rem' }}>
          {plans.map((p) => {
            const features = isRtl ? p.featuresAr : p.featuresEn
            return (
              <div
                key={p.id}
                className="card"
                style={{
                  padding: '2rem',
                  display: 'flex',
                  flexDirection: 'column',
                  position: 'relative',
                  border: p.popular ? '2px solid var(--accent)' : '1px solid var(--border)',
                  boxShadow: p.popular ? 'var(--shadow-lg)' : 'var(--shadow-sm)'
                }}
              >
                {p.popular && (
                  <div
                    style={{
                      position: 'absolute',
                      top: '-12px',
                      left: '50%',
                      transform: 'translateX(-50%)',
                      background: 'var(--accent)',
                      color: '#fff',
                      fontSize: '0.75rem',
                      fontWeight: 800,
                      padding: '0.25rem 0.875rem',
                      borderRadius: 'var(--radius-full)'
                    }}
                  >
                    {isRtl ? 'الأكثر اختياراً بالمصانع' : 'Recommended'}
                  </div>
                )}

                <div style={{ marginBottom: '1.5rem' }}>
                  <h3 style={{ fontSize: '1.125rem', fontWeight: 800, color: 'var(--slate-900)', marginBottom: '0.5rem' }}>
                    {isRtl ? p.nameAr : p.nameEn}
                  </h3>
                  <div style={{ fontSize: '0.9375rem', color: 'var(--accent)', fontWeight: 700 }}>
                    {isRtl ? p.priceAr : p.priceEn}
                  </div>
                </div>

                <div style={{ flex: 1, marginBottom: '2rem' }}>
                  <ul style={{ listStyle: 'none', padding: 0, margin: 0, display: 'flex', flexDirection: 'column', gap: '0.75rem' }}>
                    {features.map((feat, idx) => (
                      <li key={idx} style={{ display: 'flex', alignItems: 'flex-start', gap: '0.625rem', fontSize: '0.875rem', color: 'var(--slate-700)' }}>
                        <Check size={16} color="#000000" style={{ flexShrink: 0, marginTop: '0.2rem' }} />
                        <span>{feat}</span>
                      </li>
                    ))}
                  </ul>
                </div>

                <div>
                  {p.current ? (
                    <div
                      style={{
                        padding: '0.625rem',
                        textAlign: 'center',
                        background: 'var(--slate-100)',
                        color: 'var(--slate-600)',
                        borderRadius: 'var(--radius-md)',
                        fontWeight: 700,
                        fontSize: '0.875rem'
                      }}
                    >
                      {isRtl ? '✓ باقتك الحالية' : '✓ Current Plan'}
                    </div>
                  ) : (
                    <a
                      href="https://wa.me/201012345678?text=طلب%20اشتراك%20في%20عاشر%20جوبز"
                      target="_blank"
                      rel="noopener noreferrer"
                      className={`btn ${p.popular ? 'btn-accent' : ''}`}
                      style={{
                        width: '100%',
                        fontWeight: 700,
                        padding: '0.625rem',
                        border: p.popular ? 'none' : '1px solid var(--border)',
                        background: p.popular ? undefined : '#fff'
                      }}
                    >
                      {isRtl ? 'طلب تفعيل الباقة' : 'Select Plan'}
                    </a>
                  )}
                </div>
              </div>
            )
          })}
        </div>
      </div>
    </div>
  )
}
