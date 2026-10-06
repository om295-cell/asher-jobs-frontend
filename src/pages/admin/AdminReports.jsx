import React, { useEffect, useState, useCallback } from 'react'
import { Link } from 'react-router-dom'
import { useLanguage } from '../../context/LanguageContext'
import { useToast } from '../../context/ToastContext'
import { adminApi } from '../../api/admin.api'
import {
  AlertCircle,
  CheckCircle,
  XCircle,
  Clock,
  Building2,
  User,
  MessageSquare,
  ShieldCheck,
  Save,
  X
} from 'lucide-react'
import LoadingSpinner from '../../components/ui/LoadingSpinner'
import StatusBadge from '../../components/ui/StatusBadge'
import Pagination from '../../components/ui/Pagination'
import EmptyState from '../../components/ui/EmptyState'

export default function AdminReports() {
  const { isRtl } = useLanguage()
  const { showToast } = useToast()

  const [reports, setReports] = useState([])
  const [total, setTotal] = useState(0)
  const [page, setPage] = useState(1)
  const [totalPages, setTotalPages] = useState(1)
  const [loading, setLoading] = useState(true)

  // Status Filter
  const [statusFilter, setStatusFilter] = useState('')

  // Resolve Modal
  const [resolveModal, setResolveModal] = useState({ open: false, report: null, status: 'Resolved', notes: '' })
  const [saving, setSaving] = useState(false)

  const fetchReports = useCallback((targetPage = 1) => {
    setLoading(true)
    const params = { page: targetPage, limit: 15 }
    if (statusFilter) params.status = statusFilter

    adminApi.listReports(params)
      .then(res => {
        setReports(res.data?.data || [])
        setTotal(res.data?.pagination?.total || 0)
        setTotalPages(res.data?.pagination?.totalPages || 1)
        setPage(targetPage)
      })
      .catch(err => {
        showToast(err.response?.data?.message || 'Failed to load reports', 'error')
      })
      .finally(() => setLoading(false))
  }, [statusFilter, showToast])

  useEffect(() => {
    fetchReports(1)
  }, [fetchReports])

  const handleOpenResolve = (report) => {
    setResolveModal({
      open: true,
      report,
      status: 'Resolved',
      notes: ''
    })
  }

  const handleResolveSubmit = async (e) => {
    e.preventDefault()
    try {
      setSaving(true)
      await adminApi.resolveReport(resolveModal.report._id, {
        status: resolveModal.status,
        resolutionNotes: resolveModal.notes
      })
      showToast(isRtl ? 'تم تحديث حالة البلاغ بنجاح' : 'Report resolved successfully', 'success')
      setResolveModal({ open: false, report: null, status: 'Resolved', notes: '' })
      fetchReports(page)
    } catch (err) {
      showToast(err.response?.data?.message || 'Action failed', 'error')
    } finally {
      setSaving(false)
    }
  }

  return (
    <div style={{ padding: 'clamp(1.25rem, 3vw, 2rem) 0 3rem', background: 'var(--bg-page)', minHeight: '85vh' }}>
      <div className="container">
        {/* Header */}
        <div style={{ display: 'flex', flexWrap: 'wrap', justifyContent: 'space-between', alignItems: 'center', gap: '1rem', marginBottom: '1.75rem' }}>
          <div>
            <h1 style={{ fontSize: 'clamp(1.25rem, 3vw, 1.625rem)', fontWeight: 800, color: 'var(--slate-900)' }}>
              {isRtl ? 'ملاحظات وبلاغات الشركات' : 'Candidate Feedback & Reports'}
            </h1>
            <p style={{ color: 'var(--slate-500)', fontSize: '0.9375rem', marginTop: '0.25rem' }}>
              {isRtl ? 'متابعة ملاحظات المصانع حول صحة بيانات وأرقام هواتف المرشحين' : 'Review reports from companies regarding candidate details'}
            </p>
          </div>

          <div>
            <select
              className="form-control"
              value={statusFilter}
              onChange={(e) => setStatusFilter(e.target.value)}
              style={{ minWidth: 160, width: '100%' }}
            >
              <option value="">{isRtl ? 'جميع البلاغات' : 'All Reports'}</option>
              <option value="Open">{isRtl ? 'قيد المتابعة (Open)' : 'Open'}</option>
              <option value="Resolved">{isRtl ? 'تم الحل (Resolved)' : 'Resolved'}</option>
              <option value="Dismissed">{isRtl ? 'مرفوض (Dismissed)' : 'Dismissed'}</option>
            </select>
          </div>
        </div>

        {/* Table */}
        <div className="card" style={{ padding: 0, overflow: 'hidden' }}>
          {loading ? (
            <div style={{ padding: '3rem' }}>
              <LoadingSpinner />
            </div>
          ) : reports.length === 0 ? (
            <EmptyState
              icon={CheckCircle}
              title={isRtl ? 'لا توجد بلاغات حالياً' : 'No reports found'}
              description={isRtl ? 'قاعدة البيانات نقية ولا توجد ملاحظات معلقة.' : 'All clear! No open reports.'}
            />
          ) : (
            <div className="table-responsive">
              <table className="data-table" style={{ width: '100%', minWidth: '700px', borderCollapse: 'collapse', textAlign: isRtl ? 'right' : 'left', fontSize: '0.875rem' }}>
                <thead>
                  <tr style={{ background: 'var(--slate-50)', borderBottom: '1px solid var(--border)' }}>
                    <th style={{ padding: '0.875rem 1rem', fontWeight: 700, color: 'var(--slate-600)' }}>
                      {isRtl ? 'المرشح المبلغ عنه' : 'Candidate'}
                    </th>
                    <th style={{ padding: '0.875rem 1rem', fontWeight: 700, color: 'var(--slate-600)' }}>
                      {isRtl ? 'الشركة المُبلّغة' : 'Reporting Company'}
                    </th>
                    <th style={{ padding: '0.875rem 1rem', fontWeight: 700, color: 'var(--slate-600)' }}>
                      {isRtl ? 'نوع البلاغ' : 'Reason'}
                    </th>
                    <th style={{ padding: '0.875rem 1rem', fontWeight: 700, color: 'var(--slate-600)' }}>
                      {isRtl ? 'التفاصيل' : 'Details'}
                    </th>
                    <th style={{ padding: '0.875rem 1rem', fontWeight: 700, color: 'var(--slate-600)' }}>
                      {isRtl ? 'الحالة' : 'Status'}
                    </th>
                    <th style={{ padding: '0.875rem 1rem', fontWeight: 700, color: 'var(--slate-600)', textAlign: 'center' }}>
                      {isRtl ? 'الإجراء' : 'Action'}
                    </th>
                  </tr>
                </thead>
                <tbody>
                  {reports.map((rep) => {
                    const isOpen = rep.status === 'Open'
                    return (
                      <tr key={rep._id} style={{ borderBottom: '1px solid var(--border)' }}>
                        <td style={{ padding: '0.875rem 1rem' }}>
                          <Link to={`/admin/candidates/${rep.candidateId?._id || rep.candidateId}`} style={{ fontWeight: 700, color: 'var(--accent)' }}>
                            {rep.candidateId?.fullName || (isRtl ? 'مرشح' : 'Candidate')}
                          </Link>
                          {rep.candidateId?.phone && (
                            <div style={{ color: 'var(--slate-500)', fontSize: '0.8125rem' }} dir="ltr">
                              {rep.candidateId.phone}
                            </div>
                          )}
                        </td>

                        <td style={{ padding: '0.875rem 1rem' }}>
                          <div style={{ fontWeight: 600, color: 'var(--slate-800)' }}>
                            {rep.companyId?.companyName || (isRtl ? 'شركة' : 'Company')}
                          </div>
                        </td>

                        <td style={{ padding: '0.875rem 1rem', fontWeight: 600, color: 'var(--rose)' }}>
                          {rep.reason || (isRtl ? 'ملاحظة عامة' : 'Report')}
                        </td>

                        <td style={{ padding: '0.875rem 1rem', color: 'var(--slate-600)', maxWidth: 260 }}>
                          <div style={{ whiteSpace: 'pre-wrap', wordBreak: 'break-word' }}>
                            {rep.notes || rep.description || '—'}
                          </div>
                          {rep.resolutionNotes && (
                            <div style={{ marginTop: '0.25rem', fontSize: '0.75rem', color: 'var(--emerald)', fontWeight: 600 }}>
                              {isRtl ? 'إجراء الإدارة: ' : 'Admin note: '} {rep.resolutionNotes}
                            </div>
                          )}
                        </td>

                        <td style={{ padding: '0.875rem 1rem' }}>
                          <StatusBadge status={rep.status} />
                        </td>

                        <td style={{ padding: '0.875rem 1rem', textAlign: 'center' }}>
                          {isOpen ? (
                            <button
                              onClick={() => handleOpenResolve(rep)}
                              className="btn btn-primary"
                              style={{ padding: '0.35rem 0.65rem', fontSize: '0.8125rem', fontWeight: 700 }}
                            >
                              <ShieldCheck size={14} />
                              {isRtl ? 'معالجة' : 'Resolve'}
                            </button>
                          ) : (
                            <span style={{ fontSize: '0.75rem', color: 'var(--slate-400)' }}>
                              {isRtl ? 'تمت المعالجة' : 'Closed'}
                            </span>
                          )}
                        </td>
                      </tr>
                    )
                  })}
                </tbody>
              </table>
            </div>
          )}

          {totalPages > 1 && (
            <div style={{ padding: '1rem', borderTop: '1px solid var(--border)' }}>
              <Pagination
                currentPage={page}
                totalPages={totalPages}
                onPageChange={(p) => fetchReports(p)}
              />
            </div>
          )}
        </div>
      </div>

      {/* Resolve Modal */}
      {resolveModal.open && (
        <div className="modal-overlay" style={{ position: 'fixed', inset: 0, background: 'rgba(0,0,0,0.5)', display: 'flex', alignItems: 'center', justifyContent: 'center', zIndex: 1000, padding: '1rem' }}>
          <div className="card card-responsive modal-content" style={{ maxWidth: 480, width: '100%', padding: 'clamp(1.25rem, 4vw, 1.75rem)' }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1.25rem' }}>
              <h2 style={{ fontSize: '1.25rem', fontWeight: 800, color: 'var(--slate-900)', margin: 0 }}>
                {isRtl ? 'معالجة البلاغ' : 'Resolve Report'}
              </h2>
              <button
                onClick={() => setResolveModal({ open: false, report: null, status: 'Resolved', notes: '' })}
                style={{ background: 'none', border: 'none', cursor: 'pointer', color: 'var(--slate-400)' }}
              >
                <X size={20} />
              </button>
            </div>

            <form onSubmit={handleResolveSubmit}>
              <div className="form-group">
                <label className="form-label">{isRtl ? 'تحديث الحالة' : 'Status'}</label>
                <select
                  className="form-control"
                  value={resolveModal.status}
                  onChange={(e) => setResolveModal(prev => ({ ...prev, status: e.target.value }))}
                >
                  <option value="Resolved">{isRtl ? 'تم الحل وتحديث البيانات (Resolved)' : 'Resolved'}</option>
                  <option value="Dismissed">{isRtl ? 'حفظ / تجاهل البلاغ (Dismissed)' : 'Dismissed'}</option>
                </select>
              </div>

              <div className="form-group" style={{ marginBottom: '1.5rem' }}>
                <label className="form-label">{isRtl ? 'ملاحظات الإدارة والإجراء المتخذ' : 'Admin Resolution Notes'}</label>
                <textarea
                  className="form-control"
                  rows={3}
                  placeholder={isRtl ? 'مثال: تم الاتصال بالمرشح وتحديث رقم الهاتف، أو تم تعديل حالة التوفر...' : 'Resolution notes...'}
                  value={resolveModal.notes}
                  onChange={(e) => setResolveModal(prev => ({ ...prev, notes: e.target.value }))}
                />
              </div>

              <div style={{ display: 'flex', justifyContent: 'flex-end', gap: '0.75rem' }}>
                <button
                  type="button"
                  className="btn"
                  style={{ background: 'var(--slate-100)', color: 'var(--slate-700)' }}
                  onClick={() => setResolveModal({ open: false, report: null, status: 'Resolved', notes: '' })}
                >
                  {isRtl ? 'إلغاء' : 'Cancel'}
                </button>
                <button type="submit" disabled={saving} className="btn btn-primary" style={{ fontWeight: 600 }}>
                  <Save size={16} />
                  {isRtl ? (saving ? 'جاري الحفظ...' : 'حفظ الإجراء') : (saving ? 'Saving...' : 'Save')}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  )
}
