import React, { useEffect, useState } from 'react'
import { useParams, useNavigate } from 'react-router-dom'
import { useLanguage } from '../../context/LanguageContext'
import { useToast } from '../../context/ToastContext'
import { companyApi } from '../../api/company.api'
import { ArrowRight, ArrowLeft, Trash2 } from 'lucide-react'
import StatusBadge from '../../components/ui/StatusBadge'
import LoadingSpinner from '../../components/ui/LoadingSpinner'

export default function CompanyRequestDetail() {
  const { id } = useParams()
  const { isRtl } = useLanguage()
  const { showToast } = useToast()
  const navigate = useNavigate()
  const [request, setRequest] = useState(null)
  const [loading, setLoading] = useState(true)
  const BackIcon = isRtl ? ArrowRight : ArrowLeft

  useEffect(() => {
    companyApi.getRequest(id).then(res => setRequest(res.data?.data)).catch(() => {}).finally(() => setLoading(false))
  }, [id])

  const handleCancel = async () => {
    if (!window.confirm(isRtl ? 'هل تريد إلغاء هذا الطلب؟' : 'Cancel this request?')) return
    try {
      await companyApi.cancelRequest(id)
      showToast(isRtl ? 'تم إلغاء الطلب' : 'Request cancelled', 'success')
      navigate('/company/requests')
    } catch (err) {
      showToast(err.response?.data?.message || 'Error', 'error')
    }
  }

  if (loading) return <LoadingSpinner />
  if (!request) return <div style={{ padding: '3rem', textAlign: 'center', color: 'var(--slate-500)' }}>{isRtl ? 'الطلب غير موجود' : 'Request not found'}</div>

  return (
    <div style={{ padding: '2rem 0', background: 'var(--bg-page)', minHeight: '80vh' }}>
      <div className="container" style={{ maxWidth: 720 }}>
        <button onClick={() => navigate('/company/requests')} style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', background: 'none', border: 'none', cursor: 'pointer', color: 'var(--slate-500)', fontWeight: 600, marginBottom: '1.5rem', fontSize: '0.9375rem' }}>
          <BackIcon size={18} />
          {isRtl ? 'العودة للطلبات' : 'Back to Requests'}
        </button>

        <div className="card" style={{ padding: '2rem' }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: '1.5rem' }}>
            <div>
              <h1 style={{ fontSize: '1.375rem', fontWeight: 800, color: 'var(--slate-900)', marginBottom: '0.5rem' }}>{request.jobTitle}</h1>
              <div style={{ display: 'flex', gap: '0.75rem', alignItems: 'center' }}>
                <StatusBadge status={request.status} />
                <span style={{ color: 'var(--slate-500)', fontSize: '0.875rem' }}>{new Date(request.createdAt).toLocaleDateString(isRtl ? 'ar-EG' : 'en-US')}</span>
              </div>
            </div>
            {request.status === 'Open' && (
              <button onClick={handleCancel} style={{ display: 'flex', alignItems: 'center', gap: '0.4rem', padding: '0.5rem 1rem', background: '#ffffff', color: '#000000', border: '1.5px solid #000000', borderRadius: '8px', fontWeight: 700, cursor: 'pointer', fontSize: '0.875rem' }}>
                <Trash2 size={16} />
                {isRtl ? 'إلغاء الطلب' : 'Cancel Request'}
              </button>
            )}
          </div>

          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))', gap: '1rem', padding: '1.25rem', background: 'var(--slate-50)', borderRadius: 'var(--radius-md)' }}>
            <div>
              <div style={{ fontSize: '0.75rem', color: 'var(--slate-500)', fontWeight: 700 }}>{isRtl ? 'المسمى الوظيفي' : 'Job Title'}</div>
              <div style={{ fontSize: '0.9375rem', fontWeight: 600, color: 'var(--slate-800)' }}>{request.jobTitle}</div>
            </div>
            <div>
              <div style={{ fontSize: '0.75rem', color: 'var(--slate-500)', fontWeight: 700 }}>{isRtl ? 'العدد المطلوب' : 'Headcount Required'}</div>
              <div style={{ fontSize: '0.9375rem', fontWeight: 600, color: 'var(--slate-800)' }}>{request.count}</div>
            </div>
            <div>
              <div style={{ fontSize: '0.75rem', color: 'var(--slate-500)', fontWeight: 700 }}>{isRtl ? 'العدد المُؤمَّن' : 'Fulfilled Count'}</div>
              <div style={{ fontSize: '0.9375rem', fontWeight: 600, color: '#000000' }}>{request.fulfilledCount || 0}</div>
            </div>
          </div>

          {request.notes && (
            <div style={{ marginTop: '1.25rem' }}>
              <div style={{ fontSize: '0.75rem', color: 'var(--slate-500)', fontWeight: 700, marginBottom: '0.5rem' }}>{isRtl ? 'ملاحظات' : 'Notes'}</div>
              <p style={{ fontSize: '0.9375rem', color: 'var(--slate-700)', lineHeight: 1.7 }}>{request.notes}</p>
            </div>
          )}

          {request.adminNotes && (
            <div style={{ marginTop: '1.25rem', padding: '1rem', background: '#f4f4f5', border: '1.5px solid #000000', borderRadius: 'var(--radius-md)' }}>
              <div style={{ fontSize: '0.75rem', color: '#000000', fontWeight: 700, marginBottom: '0.5rem' }}>{isRtl ? 'ملاحظات الإدارة' : 'Admin Notes'}</div>
              <p style={{ fontSize: '0.9375rem', color: '#52525b' }}>{request.adminNotes}</p>
            </div>
          )}
        </div>
      </div>
    </div>
  )
}
