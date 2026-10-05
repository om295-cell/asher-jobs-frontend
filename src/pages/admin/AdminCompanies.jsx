import React, { useEffect, useState, useCallback } from 'react'
import { Link, useSearchParams } from 'react-router-dom'
import { useLanguage } from '../../context/LanguageContext'
import { useToast } from '../../context/ToastContext'
import { adminApi } from '../../api/admin.api'
import {
  Building2,
  Search,
  CheckCircle,
  XCircle,
  Clock,
  Eye,
  ShieldAlert,
  ShieldCheck,
  Phone,
  Mail,
  MapPin,
  Filter
} from 'lucide-react'
import LoadingSpinner from '../../components/ui/LoadingSpinner'
import StatusBadge from '../../components/ui/StatusBadge'
import Pagination from '../../components/ui/Pagination'
import ConfirmModal from '../../components/modals/ConfirmModal'
import EmptyState from '../../components/ui/EmptyState'

export default function AdminCompanies() {
  const { isRtl } = useLanguage()
  const { showToast } = useToast()
  const [searchParams, setSearchParams] = useSearchParams()

  const [companies, setCompanies] = useState([])
  const [total, setTotal] = useState(0)
  const [page, setPage] = useState(1)
  const [totalPages, setTotalPages] = useState(1)
  const [loading, setLoading] = useState(true)

  // Filters
  const [keyword, setKeyword] = useState(searchParams.get('keyword') || '')
  const [status, setStatus] = useState(searchParams.get('status') || '')

  // Reject reason dialog
  const [rejectModal, setRejectModal] = useState({ open: false, companyId: null, companyName: '', reason: '' })
  const [confirmModal, setConfirmModal] = useState({ open: false, title: '', message: '', action: null })

  const fetchCompanies = useCallback((targetPage = 1) => {
    setLoading(true)
    const params = { page: targetPage, limit: 15 }
    if (keyword) params.keyword = keyword
    if (status) params.verificationStatus = status

    adminApi.listCompanies(params)
      .then(res => {
        setCompanies(res.data?.data || [])
        setTotal(res.data?.pagination?.total || 0)
        setTotalPages(res.data?.pagination?.totalPages || 1)
        setPage(targetPage)
      })
      .catch(err => {
        showToast(err.response?.data?.message || 'Failed to load companies', 'error')
      })
      .finally(() => setLoading(false))
  }, [keyword, status, showToast])

  useEffect(() => {
    fetchCompanies(1)
  }, [fetchCompanies])

  const handleFilterSubmit = (e) => {
    e.preventDefault()
    fetchCompanies(1)
  }

  const handleApprove = (company) => {
    setConfirmModal({
      open: true,
      title: isRtl ? 'اعتماد الشركة وتفعيل البحث' : 'Approve Company Access',
      message: isRtl
        ? `هل تريد اعتماد شركة "${company.companyName}"؟ سيتم تمكينها من البحث في قاعدة بيانات المرشحين والتواصل معهم.`
        : `Approve "${company.companyName}" to search candidate database?`,
      confirmText: isRtl ? 'اعتماد وتفعيل' : 'Approve & Activate',
      danger: false,
      action: async () => {
        try {
          await adminApi.approveCompany(company._id)
          showToast(isRtl ? `تم اعتماد ${company.companyName} بنجاح` : 'Company approved successfully', 'success')
          fetchCompanies(page)
        } catch (err) {
          showToast(err.response?.data?.message || 'Approval failed', 'error')
        }
      }
    })
  }

  const handleRejectSubmit = async (e) => {
    e.preventDefault()
    try {
      await adminApi.rejectCompany(rejectModal.companyId, rejectModal.reason)
      showToast(isRtl ? 'تم رفض طلب تسجيل الشركة' : 'Company rejected', 'success')
      setRejectModal({ open: false, companyId: null, companyName: '', reason: '' })
      fetchCompanies(page)
    } catch (err) {
      showToast(err.response?.data?.message || 'Reject action failed', 'error')
    }
  }

  const handleToggleBlock = (company) => {
    const isCurrentlyBlocked = company.isBlocked || company.userId?.isBlocked
    const newBlockedState = !isCurrentlyBlocked

    setConfirmModal({
      open: true,
      title: newBlockedState ? (isRtl ? 'حظر حساب الشركة' : 'Block Company Account') : (isRtl ? 'إلغاء حظر الشركة' : 'Unblock Company'),
      message: newBlockedState
        ? (isRtl ? `هل أنت متأكد من حظر حساب "${company.companyName}"؟` : `Block account for "${company.companyName}"?`)
        : (isRtl ? `إعادة تفعيل حساب "${company.companyName}"؟` : `Restore access for "${company.companyName}"?`),
      confirmText: newBlockedState ? (isRtl ? 'حظر' : 'Block') : (isRtl ? 'إلغاء الحظر' : 'Unblock'),
      danger: newBlockedState,
      action: async () => {
        try {
          await adminApi.toggleBlockCompany(company._id, newBlockedState, 'Admin action')
          showToast(newBlockedState ? (isRtl ? 'تم الحظر' : 'Company blocked') : (isRtl ? 'تم إلغاء الحظر' : 'Company unblocked'), 'success')
          fetchCompanies(page)
        } catch (err) {
          showToast(err.response?.data?.message || 'Action failed', 'error')
        }
      }
    })
  }

  return (
    <div style={{ padding: '2rem 0 3rem', background: 'var(--bg-page)', minHeight: '85vh' }}>
      <div className="container">
        {/* Header */}
        <div style={{ display: 'flex', flexWrap: 'wrap', justifyContent: 'space-between', alignItems: 'center', gap: '1rem', marginBottom: '1.75rem' }}>
          <div>
            <h1 style={{ fontSize: '1.625rem', fontWeight: 800, color: 'var(--slate-900)' }}>
              {isRtl ? 'إدارة واعتماد الشركات والمصانع' : 'Company Verification & Management'}
            </h1>
            <p style={{ color: 'var(--slate-500)', fontSize: '0.9375rem', marginTop: '0.25rem' }}>
              {isRtl ? `إجمالي الشركات المسجلة: ${total} منشأة` : `Total registered: ${total} companies`}
            </p>
          </div>
        </div>

        {/* Filter Bar */}
        <div className="card" style={{ padding: '1.25rem', marginBottom: '1.5rem' }}>
          <form onSubmit={handleFilterSubmit} style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(220px, 1fr))', gap: '1rem', alignItems: 'flex-end' }}>
            <div className="form-group" style={{ margin: 0 }}>
              <label className="form-label">{isRtl ? 'بحث باسم الشركة / المسؤول / الهاتف' : 'Search Company / Contact / Phone'}</label>
              <input
                type="text"
                className="form-control"
                placeholder={isRtl ? 'مثال: مصنع السيراميك، الرواد...' : 'e.g. Al Rowad...'}
                value={keyword}
                onChange={(e) => setKeyword(e.target.value)}
              />
            </div>

            <div className="form-group" style={{ margin: 0 }}>
              <label className="form-label">{isRtl ? 'حالة الاعتماد' : 'Verification Status'}</label>
              <select className="form-control" value={status} onChange={(e) => setStatus(e.target.value)}>
                <option value="">{isRtl ? 'جميع الحالات' : 'All Statuses'}</option>
                <option value="Pending">{isRtl ? '⏳ في انتظار المراجعة (Pending)' : 'Pending Review'}</option>
                <option value="Approved">{isRtl ? '✓ معتمد ومفعل (Approved)' : 'Approved'}</option>
                <option value="Rejected">{isRtl ? '✕ مرفوض (Rejected)' : 'Rejected'}</option>
              </select>
            </div>

            <div style={{ display: 'flex', gap: '0.5rem' }}>
              <button type="submit" className="btn btn-primary" style={{ flex: 1 }}>
                <Search size={16} />
                {isRtl ? 'تصفية' : 'Filter'}
              </button>
              <button
                type="button"
                className="btn"
                style={{ background: 'var(--slate-100)', color: 'var(--slate-700)' }}
                onClick={() => {
                  setKeyword('')
                  setStatus('')
                  setTimeout(() => fetchCompanies(1), 0)
                }}
              >
                {isRtl ? 'إعادة ضبط' : 'Reset'}
              </button>
            </div>
          </form>
        </div>

        {/* Companies Table */}
        <div className="card" style={{ padding: 0, overflow: 'hidden' }}>
          {loading ? (
            <div style={{ padding: '3rem' }}>
              <LoadingSpinner />
            </div>
          ) : companies.length === 0 ? (
            <EmptyState
              icon={Building2}
              title={isRtl ? 'لا توجد شركات مطابقة' : 'No companies found'}
              description={isRtl ? 'جرب تغيير فلاتر البحث أعلاه.' : 'Try adjusting your filters.'}
            />
          ) : (
            <div style={{ overflowX: 'auto' }}>
              <table style={{ width: '100%', borderCollapse: 'collapse', textAlign: isRtl ? 'right' : 'left', fontSize: '0.875rem' }}>
                <thead>
                  <tr style={{ background: 'var(--slate-50)', borderBottom: '1px solid var(--border)' }}>
                    <th style={{ padding: '0.875rem 1rem', fontWeight: 700, color: 'var(--slate-600)' }}>
                      {isRtl ? 'المنشأة / الشركة' : 'Company'}
                    </th>
                    <th style={{ padding: '0.875rem 1rem', fontWeight: 700, color: 'var(--slate-600)' }}>
                      {isRtl ? 'القطاع' : 'Industry'}
                    </th>
                    <th style={{ padding: '0.875rem 1rem', fontWeight: 700, color: 'var(--slate-600)' }}>
                      {isRtl ? 'مسؤول التوظيف' : 'Contact Person'}
                    </th>
                    <th style={{ padding: '0.875rem 1rem', fontWeight: 700, color: 'var(--slate-600)' }}>
                      {isRtl ? 'الموقع' : 'Location'}
                    </th>
                    <th style={{ padding: '0.875rem 1rem', fontWeight: 700, color: 'var(--slate-600)' }}>
                      {isRtl ? 'حالة الاعتماد' : 'Verification'}
                    </th>
                    <th style={{ padding: '0.875rem 1rem', fontWeight: 700, color: 'var(--slate-600)' }}>
                      {isRtl ? 'الباقة' : 'Subscription'}
                    </th>
                    <th style={{ padding: '0.875rem 1rem', fontWeight: 700, color: 'var(--slate-600)', textAlign: 'center' }}>
                      {isRtl ? 'الإجراءات' : 'Actions'}
                    </th>
                  </tr>
                </thead>
                <tbody>
                  {companies.map((comp) => {
                    const isPending = comp.verificationStatus === 'Pending'
                    const isApproved = comp.verificationStatus === 'Approved'
                    const isBlocked = comp.isBlocked || comp.userId?.isBlocked

                    return (
                      <tr key={comp._id} style={{ borderBottom: '1px solid var(--border)' }}>
                        <td style={{ padding: '0.875rem 1rem' }}>
                          <div style={{ fontWeight: 800, color: 'var(--slate-900)' }}>{comp.companyName}</div>
                          <div style={{ color: 'var(--slate-500)', fontSize: '0.8125rem', marginTop: '0.15rem' }}>
                            <span dir="ltr">{comp.phone}</span>
                          </div>
                        </td>

                        <td style={{ padding: '0.875rem 1rem', color: 'var(--slate-700)', fontWeight: 600 }}>
                          {comp.industry || '—'}
                        </td>

                        <td style={{ padding: '0.875rem 1rem', color: 'var(--slate-700)' }}>
                          <div>{comp.contactPerson || '—'}</div>
                          <div style={{ fontSize: '0.75rem', color: 'var(--slate-500)' }}>{comp.contactEmail || comp.email || ''}</div>
                        </td>

                        <td style={{ padding: '0.875rem 1rem', color: 'var(--slate-700)' }}>
                          {comp.area || (isRtl ? 'العاشر من رمضان' : '10th of Ramadan')}
                        </td>

                        <td style={{ padding: '0.875rem 1rem' }}>
                          <StatusBadge status={comp.verificationStatus} />
                          {isBlocked && (
                            <div style={{ marginTop: '0.25rem' }}>
                              <span style={{ fontSize: '0.75rem', padding: '0.15rem 0.5rem', borderRadius: 'var(--radius-full)', background: 'var(--rose-light)', color: 'var(--rose)', fontWeight: 700 }}>
                                {isRtl ? 'محظور' : 'Blocked'}
                              </span>
                            </div>
                          )}
                        </td>

                        <td style={{ padding: '0.875rem 1rem' }}>
                          <span style={{ fontSize: '0.8125rem', fontWeight: 600, color: 'var(--slate-800)' }}>
                            {comp.subscription?.plan || 'Standard'}
                          </span>
                        </td>

                        <td style={{ padding: '0.875rem 1rem', textAlign: 'center' }}>
                          <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '0.375rem' }}>
                            {isPending && (
                              <>
                                <button
                                  onClick={() => handleApprove(comp)}
                                  className="btn btn-emerald"
                                  style={{ padding: '0.35rem 0.6rem', fontSize: '0.8125rem', fontWeight: 700 }}
                                  title={isRtl ? 'اعتماد الشركة' : 'Approve'}
                                >
                                  <CheckCircle size={14} />
                                  {isRtl ? 'اعتماد' : 'Approve'}
                                </button>

                                <button
                                  onClick={() => setRejectModal({ open: true, companyId: comp._id, companyName: comp.companyName, reason: '' })}
                                  className="btn"
                                  style={{ padding: '0.35rem 0.6rem', background: 'var(--rose-light)', color: 'var(--rose)', fontSize: '0.8125rem', fontWeight: 700 }}
                                  title={isRtl ? 'رفض الطلب' : 'Reject'}
                                >
                                  <XCircle size={14} />
                                  {isRtl ? 'رفض' : 'Reject'}
                                </button>
                              </>
                            )}

                            <Link
                              to={`/admin/companies/${comp._id}`}
                              className="btn"
                              style={{ padding: '0.35rem', background: 'var(--slate-100)', color: 'var(--slate-700)' }}
                              title={isRtl ? 'تفاصيل الشركة' : 'View Company'}
                            >
                              <Eye size={15} />
                            </Link>

                            <button
                              onClick={() => handleToggleBlock(comp)}
                              className="btn"
                              style={{
                                padding: '0.35rem',
                                background: isBlocked ? 'var(--emerald-light)' : 'var(--amber-light)',
                                color: isBlocked ? 'var(--emerald)' : 'var(--amber)'
                              }}
                              title={isBlocked ? (isRtl ? 'إلغاء الحظر' : 'Unblock') : (isRtl ? 'حظر الشركة' : 'Block')}
                            >
                              {isBlocked ? <ShieldCheck size={15} /> : <ShieldAlert size={15} />}
                            </button>
                          </div>
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
                onPageChange={(p) => fetchCompanies(p)}
              />
            </div>
          )}
        </div>
      </div>

      {/* Reject Reason Modal */}
      {rejectModal.open && (
        <div style={{ position: 'fixed', inset: 0, background: 'rgba(0,0,0,0.5)', display: 'flex', alignItems: 'center', justifyContent: 'center', zIndex: 1000, padding: '1rem' }}>
          <div className="card" style={{ maxWidth: 460, width: '100%', padding: '1.75rem' }}>
            <h2 style={{ fontSize: '1.25rem', fontWeight: 800, color: 'var(--rose)', marginBottom: '0.75rem' }}>
              {isRtl ? 'رفض اعتماد الشركة' : 'Reject Company Verification'}
            </h2>
            <p style={{ color: 'var(--slate-600)', fontSize: '0.875rem', marginBottom: '1.25rem' }}>
              {isRtl ? `يرجى توضيح سبب رفض "${rejectModal.companyName}":` : `Please state the reason for rejecting "${rejectModal.companyName}":`}
            </p>
            <form onSubmit={handleRejectSubmit}>
              <div className="form-group">
                <textarea
                  className="form-control"
                  rows={3}
                  placeholder={isRtl ? 'مثال: السجل التجاري غير واضح أو غير مطابق لمدينة العاشر...' : 'Reason for rejection...'}
                  value={rejectModal.reason}
                  onChange={(e) => setRejectModal(prev => ({ ...prev, reason: e.target.value }))}
                  required
                />
              </div>
              <div style={{ display: 'flex', justifyContent: 'flex-end', gap: '0.75rem' }}>
                <button
                  type="button"
                  className="btn"
                  style={{ background: 'var(--slate-100)', color: 'var(--slate-700)' }}
                  onClick={() => setRejectModal({ open: false, companyId: null, companyName: '', reason: '' })}
                >
                  {isRtl ? 'إلغاء' : 'Cancel'}
                </button>
                <button type="submit" className="btn btn-primary" style={{ background: 'var(--rose)', borderColor: 'var(--rose)' }}>
                  {isRtl ? 'تأكيد الرفض' : 'Confirm Rejection'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      <ConfirmModal
        isOpen={confirmModal.open}
        title={confirmModal.title}
        message={confirmModal.message}
        confirmText={confirmModal.confirmText}
        isDanger={confirmModal.danger}
        onConfirm={confirmModal.action}
        onClose={() => setConfirmModal(prev => ({ ...prev, open: false }))}
      />
    </div>
  )
}
