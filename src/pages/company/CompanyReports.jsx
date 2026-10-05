import React, { useEffect, useState } from 'react'
import { useLanguage } from '../../context/LanguageContext'
import { companyApi } from '../../api/company.api'
import { Phone, MessageCircle, Star, Clock } from 'lucide-react'
import LoadingSpinner from '../../components/ui/LoadingSpinner'
import EmptyState from '../../components/ui/EmptyState'

const TYPE_ICONS = { Phone, WhatsApp: MessageCircle, Shortlisted: Star, Viewed: Clock }

export default function CompanyReports() {
  const { isRtl } = useLanguage()
  const [interactions, setInteractions] = useState([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    companyApi.getInteractions().then(res => setInteractions(res.data?.data || [])).catch(() => {}).finally(() => setLoading(false))
  }, [])

  if (loading) return <LoadingSpinner />

  return (
    <div style={{ padding: '2rem 0', background: 'var(--bg-page)', minHeight: '80vh' }}>
      <div className="container" style={{ maxWidth: 860 }}>
        <div style={{ marginBottom: '2rem' }}>
          <h1 style={{ fontSize: '1.5rem', fontWeight: 800, color: 'var(--slate-900)' }}>
            {isRtl ? 'تقارير التواصل مع المرشحين' : 'Candidate Interaction Reports'}
          </h1>
          <p style={{ color: 'var(--slate-500)', fontSize: '0.875rem', marginTop: '0.25rem' }}>
            {isRtl ? `${interactions.length} تفاعل مسجّل` : `${interactions.length} interactions recorded`}
          </p>
        </div>

        {interactions.length === 0 ? (
          <EmptyState title={isRtl ? 'لا توجد تقارير بعد' : 'No reports yet'} description={isRtl ? 'ابدأ بالبحث عن المرشحين والتواصل معهم' : 'Start searching for candidates and contact them'} />
        ) : (
          <div className="card" style={{ overflow: 'hidden' }}>
            <div style={{ overflowX: 'auto' }}>
              <table style={{ width: '100%', borderCollapse: 'collapse' }}>
                <thead>
                  <tr style={{ background: 'var(--slate-50)', borderBottom: '1px solid var(--border)' }}>
                    {[
                      isRtl ? 'المرشح' : 'Candidate',
                      isRtl ? 'المهنة' : 'Job',
                      isRtl ? 'نوع التواصل' : 'Interaction Type',
                      isRtl ? 'التاريخ' : 'Date',
                    ].map((h, i) => (
                      <th key={i} style={{ padding: '0.875rem 1.25rem', textAlign: 'start', fontSize: '0.8125rem', fontWeight: 700, color: 'var(--slate-600)', textTransform: 'uppercase', letterSpacing: '0.03em' }}>{h}</th>
                    ))}
                  </tr>
                </thead>
                <tbody>
                  {interactions.map((item, i) => {
                    const Icon = TYPE_ICONS[item.interactionType] || Clock
                    return (
                      <tr key={i} style={{ borderBottom: '1px solid var(--border)', transition: 'background 0.1s' }}>
                        <td style={{ padding: '0.875rem 1.25rem', fontWeight: 600, fontSize: '0.9375rem', color: 'var(--slate-800)' }}>{item.candidate?.fullName || '—'}</td>
                        <td style={{ padding: '0.875rem 1.25rem', fontSize: '0.875rem', color: 'var(--slate-600)' }}>
                          {isRtl ? item.candidate?.desiredJob?.nameAr : item.candidate?.desiredJob?.name || '—'}
                        </td>
                        <td style={{ padding: '0.875rem 1.25rem' }}>
                          <span style={{ display: 'inline-flex', alignItems: 'center', gap: '0.375rem', padding: '0.25rem 0.75rem', borderRadius: '9999px', fontSize: '0.8125rem', fontWeight: 700, background: '#f4f4f5', color: '#000000', border: '1px solid #d4d4d8' }}>
                            <Icon size={12} />
                            {item.interactionType}
                          </span>
                        </td>
                        <td style={{ padding: '0.875rem 1.25rem', fontSize: '0.875rem', color: 'var(--slate-500)' }}>
                          {new Date(item.createdAt).toLocaleDateString(isRtl ? 'ar-EG' : 'en-US')}
                        </td>
                      </tr>
                    )
                  })}
                </tbody>
              </table>
            </div>
          </div>
        )}
      </div>
    </div>
  )
}
