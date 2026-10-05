import React, { useEffect, useState, useCallback } from 'react'
import { Link } from 'react-router-dom'
import { useLanguage } from '../../context/LanguageContext'
import { useToast } from '../../context/ToastContext'
import { adminApi } from '../../api/admin.api'
import {
  FileSpreadsheet,
  Building2,
  Briefcase,
  Users,
  Clock,
  CheckCircle,
  Eye,
  Edit,
  Save,
  X
} from 'lucide-react'
import LoadingSpinner from '../../components/ui/LoadingSpinner'
import StatusBadge from '../../components/ui/StatusBadge'
import Pagination from '../../components/ui/Pagination'
import EmptyState from '../../components/ui/EmptyState'

export default function AdminRequests() {
  const { isRtl } = useLanguage()
  const { showToast } = useToast()

  const [requests, setRequests] = useState([])
  const [total, setTotal] = useState(0)
  const [page, setPage] = useState(1)
  const [totalPages, setTotalPages] = useState(1)
  const [loading, setLoading] = useState(true)

  // Status Filter
  const [statusFilter, setStatusFilter] = useState('')

  // Status edit modal
  const [statusModal, setStatusModal] = useState({ open: false, req: null, status: 'Fulfilled', notes: '' })
  const [saving, setSaving] = useState(false)

  const fetchRequests = useCallback((targetPage = 1) => {
    setLoading(true)
    const params = { page: targetPage, limit: 15 }
    if (statusFilter) params.status = statusFilter

    adminApi.listRequests(params)
      .then(res => {
        setRequests(res.data?.data || [])
        setTotal(res.data?.pagination?.total || 0)
        setTotalPages(res.data?.pagination?.totalPages || 1)
        setPage(targetPage)
      })
      .catch(err => {
        showToast(err.response?.data?.message || 'Failed to load requests', 'error')
      })
      .finally(() => setLoading(false))
  }, [statusFilter, showToast])

  useEffect(() => {
    fetchRequests(1)
  }, [fetchRequests])

  const handleOpenStatusModal = (req) => {
    setStatusModal({
      open: true,
      req,
      status: req.status || 'Fulfilled',
      notes: req.adminNotes || ''
    })
  }

  const handleStatusSubmit = async (e) => {
    e.preventDefault()
    try {
      setSaving(true)
      await adminApi.updateRequestStatus(statusModal.req._id, statusModal.status, statusModal.notes)
      showToast(isRtl ? 'تم تحديث حالة طلب التوظيف' : 'Request status updated', 'success')
      setStatusModal({ open: false, req: null, status: 'Fulfilled', notes: '' })
      fetchRequests(page)
    } catch (err) {
      showToast(err.response?.data?.message || 'Update failed', 'error')
    } finally {
      setSaving(false)
    }
  }

  return (
    <div style={{ padding: '2rem 0 3rem', background: 'var(--bg-page)', minHeight: '85vh' }}>
      <div className="container">
        {/* Header */}
        <div style={{ display: 'flex', flexWrap: 'wrap', justifyContent: 'space-between', alignItems: 'center', gap: '1rem', marginBottom: '1.75rem' }}>
          <div>
            <h1 style={{ fontSize: '1.625rem', fontWeight: 800, color: 'var(--slate-900)' }}>
              {isRtl ? 'طلبات التوظيف الخاصة بالشركات' : 'Employer Recruitment Requests'}
            </h1>
            <p style={{ color: 'var(--slate-500)', fontSize: '0.9375rem', marginTop: '0.25rem' }}>
              {isRtl ? `إجمالي الطلبات المستلمة: ${total} طلب` : `Total requests: ${total}`}
            </p>
          </div>

          <div>
            <select
              className="form-control"
              value={statusFilter}
              onChange={(e) => setStatusFilter(e.target.value)}
              style={{ minWidth: 160 }}
            >
              <option value="">{isRtl ? 'جميع الحالات' : 'All Statuses'}</option>
              <option value="Pending">{isRtl ? 'قيد الانتظار (Pending)' : 'Pending'}</option>
              <option value="InProgress">{isRtl ? 'جاري التنفيذ (In Progress)' : 'In Progress'}</option>
              <option value="Fulfilled">{isRtl ? 'تم التوفير (Fulfilled)' : 'Fulfilled'}</option>
              <option value="Cancelled">{isRtl ? 'ملغي (Cancelled)' : 'Cancelled'}</option>
            </select>
          </div>
        </div>

        {/* Requests Table */}
        <div className="card" style={{ padding: 0, overflow: 'hidden' }}>
          {loading ? (
            <div style={{ padding: '3rem' }}>
              <LoadingSpinner />
            </div>
          ) : requests.length === 0 ? (
            <EmptyState
              icon={FileSpreadsheet}
              title={isRtl ? 'لا توجد طلبات توظيف مسجلة' : 'No requests found'}
              description={isRtl ? 'لم تقم أي شركة بإرسال طلب توظيف مخصص بعد.' : 'No recruitment requests yet.'}
            />
          ) : (
            <div style={{ overflowX: 'auto' }}>
              <table style={{ width: '100%', borderCollapse: 'collapse', textAlign: isRtl ? 'right' : 'left', fontSize: '0.875rem' }}>
                <thead>
                  <tr style={{ background: 'var(--slate-50)', borderBottom: '1px solid var(--border)' }}>
                    <th style={{ padding: '0.875rem 1rem', fontWeight: 700, color: 'var(--slate-600)' }}>
                      {isRtl ? 'الشركة / المصنع' : 'Company'}
                    </th>
                    <th style={{ padding: '0.875rem 1rem', fontWeight: 700, color: 'var(--slate-600)' }}>
                      {isRtl ? 'الوظيفة المطلوبة' : 'Required Job'}
                    </th>
                    <th style={{ padding: '0.875rem 1rem', fontWeight: 700, color: 'var(--slate-600)' }}>
                      {isRtl ? 'العدد' : 'Qty'}
                    </th>
                    <th style={{ padding: '0.875rem 1rem', fontWeight: 700, color: 'var(--slate-600)' }}>
                      {isRtl ? 'المنطقة المطلوبة' : 'Location'}
                    </th>
                    <th style={{ padding: '0.875rem 1rem', fontWeight: 700, color: 'var(--slate-600)' }}>
                      {isRtl ? 'الحالة' : 'Status'}
                    </th>
                    <th style={{ padding: '0.875rem 1rem', fontWeight: 700, color: 'var(--slate-600)' }}>
                      {isRtl ? 'تاريخ الطلب' : 'Date'}
                    </th>
                    <th style={{ padding: '0.875rem 1rem', fontWeight: 700, color: 'var(--slate-600)', textAlign: 'center' }}>
                      {isRtl ? 'الإجراء' : 'Action'}
                    </th>
                  </tr>
                </thead>
                <tbody>
                  {requests.map((r) => (
                    <tr key={r._id} style={{ borderBottom: '1px solid var(--border)' }}>
                      <td style={{ padding: '0.875rem 1rem' }}>
                        <div style={{ fontWeight: 700, color: 'var(--slate-900)' }}>
                          {r.companyId?.companyName || (isRtl ? 'شركة' : 'Company')}
                        </div>
                        {r.companyId?.phone && (
                          <div style={{ color: 'var(--slate-500)', fontSize: '0.8125rem' }} dir="ltr">
                            {r.companyId.phone}
                          </div>
                        )}
                      </td>

                      <td style={{ padding: '0.875rem 1rem' }}>
                        <div style={{ fontWeight: 600, color: 'var(--accent)' }}>
                          {isRtl ? (r.jobId?.nameAr || r.jobId?.name) : (r.jobId?.name || r.jobId?.nameAr)}
                        </div>
                        <div style={{ fontSize: '0.75rem', color: 'var(--slate-400)' }}>
                          {isRtl ? (r.categoryId?.nameAr || r.categoryId?.name) : (r.categoryId?.name || r.categoryId?.nameAr)}
                        </div>
                      </td>

                      <td style={{ padding: '0.875rem 1rem', fontWeight: 700, color: 'var(--slate-800)' }}>
                        {r.quantityRequested || 1}
                      </td>

                      <td style={{ padding: '0.875rem 1rem', color: 'var(--slate-600)' }}>
                        {r.governorate || '—'} {r.area ? `(${r.area})` : ''}
                      </td>

                      <td style={{ padding: '0.875rem 1rem' }}>
                        <StatusBadge status={r.status || 'Pending'} />
                      </td>

                      <td style={{ padding: '0.875rem 1rem', color: 'var(--slate-500)', fontSize: '0.8125rem' }}>
                        {new Date(r.createdAt).toLocaleDateString(isRtl ? 'ar-EG' : 'en-US')}
                      </td>

                      <td style={{ padding: '0.875rem 1rem', textAlign: 'center' }}>
                        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '0.375rem' }}>
                          <button
                            onClick={() => handleOpenStatusModal(r)}
                            className="btn btn-primary"
                            style={{ padding: '0.35rem 0.65rem', fontSize: '0.8125rem', fontWeight: 700 }}
                          >
                            <Edit size={14} />
                            {isRtl ? 'تحديث الحالة' : 'Status'}
                          </button>
                        </div>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}

          {totalPages > 1 && (
            <div style={{ padding: '1rem', borderTop: '1px solid var(--border)' }}>
              <Pagination
                currentPage={page}
                totalPages={totalPages}
                onPageChange={(p) => fetchRequests(p)}
              />
            </div>
          )}
        </div>
      </div>

      {/* Edit Status Modal */}
      {statusModal.open && (
        <div style={{ position: 'fixed', inset: 0, background: 'rgba(0,0,0,0.5)', display: 'flex', alignItems: 'center', justifyContent: 'center', zIndex: 1000, padding: '1rem' }}>
          <div className="card" style={{ maxWidth: 480, width: '100%', padding: '1.75rem' }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1.25rem' }}>
              <h2 style={{ fontSize: '1.25rem', fontWeight: 800, color: 'var(--slate-900)', margin: 0 }}>
                {isRtl ? 'تحديث حالة طلب التوظيف' : 'Update Recruitment Request'}
              </h2>
              <button
                onClick={() => setStatusModal({ open: false, req: null, status: 'Fulfilled', notes: '' })}
                style={{ background: 'none', border: 'none', cursor: 'pointer', color: 'var(--slate-400)' }}
              >
                <X size={20} />
              </button>
            </div>

            <form onSubmit={handleStatusSubmit}>
              <div className="form-group">
                <label className="form-label">{isRtl ? 'الحالة' : 'Status'}</label>
                <select
                  className="form-control"
                  value={statusModal.status}
                  onChange={(e) => setStatusModal(prev => ({ ...prev, status: e.target.value }))}
                >
                  <option value="Pending">{isRtl ? 'قيد الانتظار (Pending)' : 'Pending'}</option>
                  <option value="InProgress">{isRtl ? 'جاري الفرز والتواصل (In Progress)' : 'In Progress'}</option>
                  <option value="Fulfilled">{isRtl ? 'تم توفير العمالة بنجاح (Fulfilled)' : 'Fulfilled'}</option>
                  <option value="Cancelled">{isRtl ? 'إلغاء الطلب (Cancelled)' : 'Cancelled'}</option>
                </select>
              </div>

              <div className="form-group" style={{ marginBottom: '1.5rem' }}>
                <label className="form-label">{isRtl ? 'ملاحظات الإدارة' : 'Admin Notes'}</label>
                <textarea
                  className="form-control"
                  rows={3}
                  placeholder={isRtl ? 'مثال: تم إرسال 5 مرشحين للمقابلة، وتم توظيف 2 منهم بنجاح...' : 'Notes...'}
                  value={statusModal.notes}
                  onChange={(e) => setStatusModal(prev => ({ ...prev, notes: e.target.value }))}
                />
              </div>

              <div style={{ display: 'flex', justifyContent: 'flex-end', gap: '0.75rem' }}>
                <button
                  type="button"
                  className="btn"
                  style={{ background: 'var(--slate-100)', color: 'var(--slate-700)' }}
                  onClick={() => setStatusModal({ open: false, req: null, status: 'Fulfilled', notes: '' })}
                >
                  {isRtl ? 'إلغاء' : 'Cancel'}
                </button>
                <button type="submit" disabled={saving} className="btn btn-primary" style={{ fontWeight: 600 }}>
                  <Save size={16} />
                  {isRtl ? (saving ? 'جاري الحفظ...' : 'حفظ') : (saving ? 'Saving...' : 'Save')}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  )
}
