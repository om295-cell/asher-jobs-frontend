import React, { useEffect, useState } from 'react'
import { useLanguage } from '../../context/LanguageContext'
import { useToast } from '../../context/ToastContext'
import { candidateApi } from '../../api/candidate.api'
import { Gift, Copy, Users, CheckCircle } from 'lucide-react'
import LoadingSpinner from '../../components/ui/LoadingSpinner'

export default function CandidateReferrals() {
  const { isRtl } = useLanguage()
  const { showToast } = useToast()
  const [data, setData] = useState(null)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    candidateApi.getReferrals().then(res => setData(res.data?.data)).catch(() => {}).finally(() => setLoading(false))
  }, [])

  const copyLink = () => {
    const link = `${window.location.origin}/register/candidate?ref=${data?.referralCode}`
    navigator.clipboard.writeText(link).then(() => showToast(isRtl ? 'تم نسخ رابط الإحالة' : 'Referral link copied!', 'success'))
  }

  if (loading) return <LoadingSpinner />

  const referralLink = `${window.location.origin}/register/candidate?ref=${data?.referralCode || ''}`

  return (
    <div style={{ padding: '2rem 0', background: 'var(--bg-page)', minHeight: '80vh' }}>
      <div className="container" style={{ maxWidth: 680 }}>
        <div style={{ marginBottom: '2rem' }}>
          <h1 style={{ fontSize: '1.5rem', fontWeight: 800, color: 'var(--slate-900)', marginBottom: '0.375rem' }}>
            {isRtl ? 'برنامج الإحالة' : 'Referral Program'}
          </h1>
          <p style={{ color: 'var(--slate-500)', fontSize: '0.9375rem' }}>
            {isRtl ? 'شارك رابطك مع أصدقائك الباحثين عن عمل واحصل على مكافأة عند كل تسجيل ناجح.' : 'Share your link with job-seeking friends and earn rewards for each successful registration.'}
          </p>
        </div>

        {/* Stats */}
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: '1rem', marginBottom: '1.5rem' }}>
          {[
            { icon: Users, label: isRtl ? 'إجمالي الإحالات' : 'Total Referrals', value: data?.totalReferrals ?? 0, color: '#000000' },
            { icon: CheckCircle, label: isRtl ? 'إحالات مكتملة' : 'Completed', value: data?.completedReferrals ?? 0, color: '#000000' },
            { icon: Gift, label: isRtl ? 'نقاط المكافأة' : 'Reward Points', value: data?.rewardPoints ?? 0, color: '#000000' },
          ].map(({ icon: Icon, label, value, color }) => (
            <div key={label} className="card" style={{ padding: '1.25rem', textAlign: 'center' }}>
              <Icon size={24} style={{ color, margin: '0 auto 0.625rem' }} />
              <div style={{ fontSize: '1.75rem', fontWeight: 800, color: 'var(--slate-900)' }}>{value}</div>
              <div style={{ fontSize: '0.8125rem', color: 'var(--slate-500)' }}>{label}</div>
            </div>
          ))}
        </div>

        {/* Referral Link Card */}
        <div className="card" style={{ padding: '1.75rem' }}>
          <h3 style={{ fontWeight: 700, marginBottom: '1rem', color: 'var(--slate-800)' }}>
            {isRtl ? 'رابط الإحالة الخاص بك' : 'Your Referral Link'}
          </h3>
          <div style={{ display: 'flex', gap: '0.75rem', alignItems: 'center' }}>
            <input
              readOnly
              value={referralLink}
              dir="ltr"
              style={{
                flex: 1, padding: '0.75rem 1rem', background: 'var(--slate-50)',
                border: '1px solid var(--border)', borderRadius: 'var(--radius-md)',
                fontSize: '0.875rem', color: 'var(--slate-600)', fontFamily: 'monospace',
                textAlign: isRtl ? 'right' : 'left'
              }}
            />
            <button onClick={copyLink} style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', padding: '0.75rem 1.125rem', background: 'var(--accent)', color: '#fff', border: 'none', borderRadius: 'var(--radius-md)', fontWeight: 700, cursor: 'pointer', whiteSpace: 'nowrap', fontSize: '0.9375rem' }}>
              <Copy size={16} />
              {isRtl ? 'نسخ' : 'Copy'}
            </button>
          </div>
          <div style={{ marginTop: '1rem', padding: '0.875rem', background: 'var(--slate-50)', borderRadius: 'var(--radius-md)', fontSize: '0.875rem', color: 'var(--slate-600)' }}>
            {isRtl
              ? '💡 شارك الرابط على واتساب أو فيسبوك لمن يبحث عن عمل في مصانع العاشر من رمضان. ستحصل على نقاط مكافأة عند تسجيل كل صديق بنجاح.'
              : '💡 Share the link on WhatsApp or Facebook to anyone looking for industrial work. You earn reward points each time a friend successfully registers.'}
          </div>
        </div>

        {/* Referral History */}
        {data?.referrals?.length > 0 && (
          <div className="card" style={{ padding: '1.75rem', marginTop: '1.5rem' }}>
            <h3 style={{ fontWeight: 700, marginBottom: '1rem', color: 'var(--slate-800)' }}>
              {isRtl ? 'سجل الإحالات' : 'Referral History'}
            </h3>
            <div style={{ display: 'flex', flexDirection: 'column', gap: '0.75rem' }}>
              {data.referrals.map((ref, i) => (
                <div key={i} style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', padding: '0.75rem 1rem', background: 'var(--slate-50)', borderRadius: 'var(--radius-md)' }}>
                  <div>
                    <div style={{ fontWeight: 600, fontSize: '0.9375rem', color: 'var(--slate-800)' }}>{ref.referredUser?.phone || isRtl ? 'مجهول' : 'Unknown'}</div>
                    <div style={{ fontSize: '0.8125rem', color: 'var(--slate-500)' }}>{new Date(ref.createdAt).toLocaleDateString(isRtl ? 'ar-EG' : 'en-US')}</div>
                  </div>
                  <span style={{ padding: '0.25rem 0.75rem', background: ref.status === 'Completed' ? '#000000' : '#ffffff', color: ref.status === 'Completed' ? '#ffffff' : '#000000', border: '1px solid #000000', borderRadius: '9999px', fontSize: '0.8125rem', fontWeight: 700 }}>
                    {ref.status === 'Completed' ? (isRtl ? 'مكتمل' : 'Completed') : (isRtl ? 'معلّق' : 'Pending')}
                  </span>
                </div>
              ))}
            </div>
          </div>
        )}
      </div>
    </div>
  )
}
