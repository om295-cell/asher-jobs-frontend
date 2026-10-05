import React, { useEffect, useState } from 'react'
import { Link } from 'react-router-dom'
import { useLanguage } from '../../context/LanguageContext'
import { useToast } from '../../context/ToastContext'
import { companyApi } from '../../api/company.api'
import { Plus, FileText, Clock, CheckCircle, XCircle } from 'lucide-react'
import StatusBadge from '../../components/ui/StatusBadge'
import LoadingSpinner from '../../components/ui/LoadingSpinner'
import EmptyState from '../../components/ui/EmptyState'

export default function CompanyRequests() {
  const { isRtl } = useLanguage()
  const { showToast } = useToast()
  const [requests, setRequests] = useState([])
  const [loading, setLoading] = useState(true)
  const [showForm, setShowForm] = useState(false)
  const [form, setForm] = useState({ jobTitle: '', count: 1, notes: '' })
  const [submitting, setSubmitting] = useState(false)

  useEffect(() => {
    companyApi.getRequests().then(res => setRequests(res.data?.data || [])).catch(() => {}).finally(() => setLoading(false))
  }, [])

  const handleSubmit = async (e) => {
    e.preventDefault()
    try {
      setSubmitting(true)
      const res = await companyApi.createRequest(form)
      setRequests(prev => [res.data?.data, ...prev])
      setShowForm(false)
      setForm({ jobTitle: '', count: 1, notes: '' })
      showToast(isRtl ? 'تم إرسال الطلب بنجاح' : 'Request submitted successfully', 'success')
    } catch (err) {
      showToast(err.response?.data?.message || 'Error', 'error')
    } finally {
      setSubmitting(false)
    }
  }

  const STATUS_ICONS = { Open: Clock, Fulfilled: CheckCircle, Rejected: XCircle, Cancelled: XCircle }

  if (loading) return <LoadingSpinner />

  return (
    <div style={{ padding: '2rem 0', background: 'var(--bg-page)', minHeight: '80vh' }}>
      <div className="container" style={{ maxWidth: 860 }}>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1.5rem' }}>
          <h1 style={{ fontSize: '1.5rem', fontWeight: 800, color: 'var(--slate-900)' }}>
            {isRtl ? 'طلبات التوظيف' : 'Recruitment Requests'}
          </h1>
          <button onClick={() => setShowForm(!showForm)} className="btn btn-primary" style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
            <Plus size={18} />
            {isRtl ? 'طلب جديد' : 'New Request'}
          </button>
        </div>

        {/* New Request Form */}
        {showForm && (
          <div className="card" style={{ padding: '1.75rem', marginBottom: '1.5rem', borderTop: '3px solid var(--primary)' }}>
            <h3 style={{ fontWeight: 700, color: 'var(--slate-800)', marginBottom: '1.25rem' }}>
              {isRtl ? 'طلب توظيف جديد' : 'New Recruitment Request'}
            </h3>
            <form onSubmit={handleSubmit}>
              <div style={{ display: 'grid', gridTemplateColumns: '1fr auto', gap: '1rem', alignItems: 'end' }}>
                <div className="form-group" style={{ margin: 0 }}>
                  <label className="form-label">{isRtl ? 'المسمى الوظيفي المطلوب' : 'Required Job Title'} *</label>
                  <input type="text" className="form-control" value={form.jobTitle} onChange={e => setForm(p => ({ ...p, jobTitle: e.target.value }))} placeholder={isRtl ? 'مثال: فني كهرباء' : 'e.g. Electrical Technician'} required />
                </div>
                <div className="form-group" style={{ margin: 0 }}>
                  <label className="form-label">{isRtl ? 'العدد المطلوب' : 'Headcount'} *</label>
                  <input type="number" className="form-control" min="1" max="200" value={form.count} onChange={e => setForm(p => ({ ...p, count: e.target.value }))} required style={{ width: 100 }} />
                </div>
              </div>
              <div className="form-group" style={{ marginTop: '1rem' }}>
                <label className="form-label">{isRtl ? 'ملاحظات إضافية (اختياري)' : 'Additional Notes (Optional)'}</label>
                <textarea className="form-control" rows={2} value={form.notes} onChange={e => setForm(p => ({ ...p, notes: e.target.value }))} placeholder={isRtl ? 'متطلبات الخبرة، الشروط الخاصة...' : 'Experience requirements, special conditions...'} />
              </div>
              <div style={{ display: 'flex', gap: '0.75rem' }}>
                <button type="submit" className="btn btn-primary" disabled={submitting}>
                  {submitting ? (isRtl ? 'جاري الإرسال...' : 'Submitting...') : (isRtl ? 'إرسال الطلب' : 'Submit Request')}
                </button>
                <button type="button" onClick={() => setShowForm(false)} style={{ padding: '0.6rem 1.25rem', background: 'var(--slate-100)', border: '1px solid var(--border)', borderRadius: 'var(--radius-md)', cursor: 'pointer', fontWeight: 600, color: 'var(--slate-600)' }}>
                  {isRtl ? 'إلغاء' : 'Cancel'}
                </button>
              </div>
            </form>
          </div>
        )}

        {/* Requests List */}
        {requests.length === 0 ? (
          <EmptyState title={isRtl ? 'لا توجد طلبات بعد' : 'No requests yet'} description={isRtl ? 'أنشئ أول طلب توظيف للبدء' : 'Create your first recruitment request'} />
        ) : (
          <div style={{ display: 'flex', flexDirection: 'column', gap: '0.875rem' }}>
            {requests.map(req => {
              const Icon = STATUS_ICONS[req.status] || Clock
              return (
                <Link key={req._id} to={`/company/requests/${req._id}`} style={{ textDecoration: 'none' }}>
                  <div className="card" style={{ padding: '1.25rem 1.5rem', display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: '1rem', transition: 'box-shadow 0.15s' }}>
                    <div style={{ display: 'flex', gap: '1rem', alignItems: 'center' }}>
                      <div style={{ width: 44, height: 44, borderRadius: '10px', background: 'var(--accent-light)', color: 'var(--accent)', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                        <FileText size={20} />
                      </div>
                      <div>
                        <div style={{ fontWeight: 700, fontSize: '1.0625rem', color: 'var(--slate-800)' }}>{req.jobTitle}</div>
                        <div style={{ fontSize: '0.8125rem', color: 'var(--slate-500)' }}>
                          {isRtl ? `${req.count} موظف` : `${req.count} employee(s)`} · {new Date(req.createdAt).toLocaleDateString(isRtl ? 'ar-EG' : 'en-US')}
                        </div>
                      </div>
                    </div>
                    <StatusBadge status={req.status} />
                  </div>
                </Link>
              )
            })}
          </div>
        )}
      </div>
    </div>
  )
}
