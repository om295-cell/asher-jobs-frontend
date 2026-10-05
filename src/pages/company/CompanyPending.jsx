import React, { useState } from 'react'
import { Link } from 'react-router-dom'
import { useAuth } from '../../context/AuthContext'
import { useLanguage } from '../../context/LanguageContext'
import { Clock, CheckCircle2, AlertTriangle, RefreshCw, LogOut, Phone, MessageSquare } from 'lucide-react'
import StatusBadge from '../../components/ui/StatusBadge'

export default function CompanyPending() {
  const { profile, refreshProfile, logout } = useAuth()
  const { isRtl } = useLanguage()
  const [checking, setChecking] = useState(false)

  const handleRefresh = async () => {
    try {
      setChecking(true)
      await refreshProfile()
    } finally {
      setChecking(false)
    }
  }

  const status = profile?.verificationStatus || 'Pending'
  const isRejected = status === 'Rejected'

  return (
    <div style={{ padding: '3.5rem 0', background: 'var(--bg-page)', minHeight: '80vh', display: 'flex', alignItems: 'center' }}>
      <div className="container" style={{ maxWidth: 640 }}>
        <div className="card" style={{ padding: '2.5rem', textAlign: 'center', boxShadow: 'var(--shadow-lg)' }}>
          <div
            style={{
              width: 72,
              height: 72,
              borderRadius: '50%',
              background: isRejected ? 'var(--rose-light)' : 'var(--amber-light)',
              color: isRejected ? 'var(--rose)' : 'var(--amber)',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              margin: '0 auto 1.5rem',
            }}
          >
            {isRejected ? <AlertTriangle size={36} /> : <Clock size={36} />}
          </div>

          <div style={{ marginBottom: '1rem' }}>
            <StatusBadge status={status} />
          </div>

          <h1 style={{ fontSize: '1.5rem', fontWeight: 800, color: 'var(--slate-900)', marginBottom: '0.75rem' }}>
            {isRejected
              ? (isRtl ? 'تم رفض طلب تسجيل الشركة' : 'Company Registration Rejected')
              : (isRtl ? 'طلبكم قيد المراجعة والاعتماد' : 'Account Under Review')}
          </h1>

          <p style={{ color: 'var(--slate-600)', fontSize: '1rem', lineHeight: 1.6, marginBottom: '2rem' }}>
            {isRejected
              ? (isRtl
                  ? 'نعتذر، لم يتم اعتماد حساب شركتكم. يُرجى مراجعة إدارة منصة عاشر جوبز لمعرفة التفاصيل أو إعادة إرسال الوثائق المطلوبة.'
                  : 'We regret to inform you that your registration could not be approved. Please contact Asher Jobs support for details.')
              : (isRtl
                  ? 'مرحباً بكم في عاشر جوبز! حرصاً على موثوقية قاعدة البيانات لمدينة العاشر من رمضان، يتم مراجعة بيانات وسجل الشركات يدوياً من قِبل الإدارة قبل تفعيل البحث والتواصل.'
                  : 'Welcome to Asher Jobs! To maintain candidate data privacy and trust in 10th of Ramadan city, all employer accounts are verified by our team before access is granted.')}
          </p>

          {profile && (
            <div
              style={{
                background: 'var(--slate-50)',
                border: '1px solid var(--border)',
                borderRadius: 'var(--radius-md)',
                padding: '1.25rem',
                textAlign: isRtl ? 'right' : 'left',
                marginBottom: '2rem',
                fontSize: '0.9375rem',
              }}
            >
              <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '0.5rem' }}>
                <span style={{ color: 'var(--slate-500)' }}>{isRtl ? 'اسم الشركة / المصنع:' : 'Company Name:'}</span>
                <span style={{ fontWeight: 700, color: 'var(--slate-800)' }}>{profile.companyName}</span>
              </div>
              <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '0.5rem' }}>
                <span style={{ color: 'var(--slate-500)' }}>{isRtl ? 'القطاع الصناعي:' : 'Industry Sector:'}</span>
                <span style={{ fontWeight: 600, color: 'var(--slate-700)' }}>{profile.industry || '—'}</span>
              </div>
              <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '0.5rem' }}>
                <span style={{ color: 'var(--slate-500)' }}>{isRtl ? 'مسؤول التوظيف:' : 'HR / Contact Person:'}</span>
                <span style={{ fontWeight: 600, color: 'var(--slate-700)' }}>{profile.contactPerson || '—'}</span>
              </div>
              <div style={{ display: 'flex', justifyContent: 'space-between' }}>
                <span style={{ color: 'var(--slate-500)' }}>{isRtl ? 'المنطقة:' : 'Location:'}</span>
                <span style={{ fontWeight: 600, color: 'var(--slate-700)' }}>{profile.city || (isRtl ? 'العاشر من رمضان' : '10th of Ramadan')}</span>
              </div>
            </div>
          )}

          <div style={{ display: 'flex', flexDirection: 'column', gap: '0.75rem' }}>
            <button
              onClick={handleRefresh}
              disabled={checking}
              className="btn btn-primary"
              style={{ width: '100%', padding: '0.75rem', fontWeight: 600 }}
            >
              <RefreshCw size={18} className={checking ? 'spin' : ''} />
              {isRtl ? (checking ? 'جاري التحقق...' : 'تحديث حالة الحساب') : (checking ? 'Checking...' : 'Check Approval Status')}
            </button>

            <a
              href="https://wa.me/201012345678"
              target="_blank"
              rel="noopener noreferrer"
              className="btn"
              style={{
                width: '100%',
                padding: '0.75rem',
                border: '1px solid var(--border)',
                background: '#fff',
                color: 'var(--slate-700)',
                fontWeight: 600,
                display: 'inline-flex',
                alignItems: 'center',
                justifyContent: 'center',
                gap: '0.5rem',
              }}
            >
              <MessageSquare size={18} color="#000000" />
              {isRtl ? 'تواصل مع الدعم الفني عبر واتساب' : 'Contact Support via WhatsApp'}
            </a>

            <button
              onClick={logout}
              className="btn"
              style={{
                width: '100%',
                padding: '0.75rem',
                background: 'transparent',
                color: '#000000',
                fontWeight: 600,
                border: 'none',
              }}
            >
              <LogOut size={16} />
              {isRtl ? 'تسجيل الخروج' : 'Log Out'}
            </button>
          </div>
        </div>
      </div>
    </div>
  )
}
