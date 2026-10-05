import React, { useEffect, useState, useCallback } from 'react'
import { Link, useSearchParams } from 'react-router-dom'
import { useLanguage } from '../../context/LanguageContext'
import { useToast } from '../../context/ToastContext'
import { adminApi } from '../../api/admin.api'
import { jobsApi } from '../../api/jobs.api'
import {
  Users,
  Search,
  Filter,
  Eye,
  ShieldAlert,
  ShieldCheck,
  Trash2,
  Phone,
  Briefcase,
  MapPin,
  CheckCircle2,
  XCircle,
  FileSpreadsheet
} from 'lucide-react'
import LoadingSpinner from '../../components/ui/LoadingSpinner'
import StatusBadge from '../../components/ui/StatusBadge'
import Pagination from '../../components/ui/Pagination'
import ConfirmModal from '../../components/modals/ConfirmModal'
import EmptyState from '../../components/ui/EmptyState'

export default function AdminCandidates() {
  const { isRtl } = useLanguage()
  const { showToast } = useToast()
  const [searchParams, setSearchParams] = useSearchParams()

  const [candidates, setCandidates] = useState([])
  const [total, setTotal] = useState(0)
  const [page, setPage] = useState(1)
  const [totalPages, setTotalPages] = useState(1)
  const [loading, setLoading] = useState(true)

  const [categories, setCategories] = useState([])
  const [jobs, setJobs] = useState([])

  // Filters
  const [keyword, setKeyword] = useState(searchParams.get('keyword') || '')
  const [availability, setAvailability] = useState(searchParams.get('availability') || '')
  const [categoryId, setCategoryId] = useState(searchParams.get('categoryId') || '')

  // Modal actions
  const [selectedCandidate, setSelectedCandidate] = useState(null)
  const [confirmModal, setConfirmModal] = useState({ open: false, title: '', message: '', action: null })

  // Fetch categories & jobs for filter dropdowns
  useEffect(() => {
    Promise.all([jobsApi.getCategories(), jobsApi.getJobs()])
      .then(([catRes, jobRes]) => {
        setCategories(catRes.data?.data || [])
        setJobs(jobRes.data?.data || [])
      })
      .catch(() => {})
  }, [])

  const fetchCandidates = useCallback((targetPage = 1) => {
    setLoading(true)
    const params = { page: targetPage, limit: 15 }
    if (keyword) params.keyword = keyword
    if (availability) params.availability = availability
    if (categoryId) params.categoryId = categoryId

    adminApi.listCandidates(params)
      .then(res => {
        setCandidates(res.data?.data || [])
        setTotal(res.data?.pagination?.total || 0)
        setTotalPages(res.data?.pagination?.totalPages || 1)
        setPage(targetPage)
      })
      .catch(err => {
        showToast(err.response?.data?.message || (isRtl ? 'فشل تحميل بيانات المرشحين' : 'Failed to load candidates'), 'error')
      })
      .finally(() => setLoading(false))
  }, [keyword, availability, categoryId, isRtl, showToast])

  useEffect(() => {
    fetchCandidates(1)
  }, [fetchCandidates])

  const handleFilterSubmit = (e) => {
    e.preventDefault()
    fetchCandidates(1)
  }

  const handleToggleBlock = (candidate) => {
    const isCurrentlyBlocked = candidate.accountStatus === 'blocked' || candidate.userId?.isBlocked
    const newBlockedState = !isCurrentlyBlocked

    setConfirmModal({
      open: true,
      title: newBlockedState
        ? (isRtl ? 'حظر حساب المرشح' : 'Block Candidate Account')
        : (isRtl ? 'إلغاء حظر المرشح' : 'Unblock Candidate'),
      message: newBlockedState
        ? (isRtl ? `هل أنت متأكد من حظر حساب "${candidate.fullName}"؟ لن يتمكن من تسجيل الدخول.` : `Are you sure you want to block "${candidate.fullName}"?`)
        : (isRtl ? `هل تريد إعادة تفعيل حساب "${candidate.fullName}"؟` : `Restore access for "${candidate.fullName}"?`),
      confirmText: newBlockedState ? (isRtl ? 'حظر الحساب' : 'Block Account') : (isRtl ? 'تفعيل' : 'Unblock'),
      danger: newBlockedState,
      action: async () => {
        try {
          await adminApi.toggleBlockCandidate(candidate._id, newBlockedState, newBlockedState ? 'Admin action' : '')
          showToast(newBlockedState ? (isRtl ? 'تم حظر المرشح بنجاح' : 'Candidate blocked') : (isRtl ? 'تم رفع الحظر بنجاح' : 'Candidate unblocked'), 'success')
          fetchCandidates(page)
        } catch (err) {
          showToast(err.response?.data?.message || 'Action failed', 'error')
        }
      }
    })
  }

  const handleDelete = (candidate) => {
    setConfirmModal({
      open: true,
      title: isRtl ? 'حذف ملف المرشح' : 'Delete Candidate Profile',
      message: isRtl
        ? `هل أنت متأكد من حذف ملف "${candidate.fullName}"؟ سيتم إخفاء الملف من نتائج البحث.`
        : `Are you sure you want to delete profile for "${candidate.fullName}"?`,
      confirmText: isRtl ? 'حذف الملف' : 'Delete',
      danger: true,
      action: async () => {
        try {
          await adminApi.deleteCandidate(candidate._id)
          showToast(isRtl ? 'تم حذف ملف المرشح بنجاح' : 'Candidate profile deleted', 'success')
          fetchCandidates(page)
        } catch (err) {
          showToast(err.response?.data?.message || 'Delete failed', 'error')
        }
      }
    })
  }

  const handleStatusChange = async (candidateId, newStatus) => {
    try {
      await adminApi.updateCandidateStatus(candidateId, newStatus)
      showToast(isRtl ? 'تم تحديث حالة المرشح' : 'Candidate availability updated', 'success')
      fetchCandidates(page)
    } catch (err) {
      showToast(err.response?.data?.message || 'Update failed', 'error')
    }
  }

  return (
    <div style={{ padding: '2rem 0 3rem', background: 'var(--bg-page)', minHeight: '85vh' }}>
      <div className="container">
        {/* Header */}
        <div style={{ display: 'flex', flexWrap: 'wrap', justifyContent: 'space-between', alignItems: 'center', gap: '1rem', marginBottom: '1.75rem' }}>
          <div>
            <h1 style={{ fontSize: '1.625rem', fontWeight: 800, color: 'var(--slate-900)' }}>
              {isRtl ? 'إدارة قاعدة بيانات المرشحين' : 'Candidate Database Management'}
            </h1>
            <p style={{ color: 'var(--slate-500)', fontSize: '0.9375rem', marginTop: '0.25rem' }}>
              {isRtl ? `إجمالي المسجلين: ${total} مرشح` : `Total registered: ${total} candidates`}
            </p>
          </div>
        </div>

        {/* Filters Box */}
        <div className="card" style={{ padding: '1.25rem', marginBottom: '1.5rem' }}>
          <form onSubmit={handleFilterSubmit} style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))', gap: '1rem', alignItems: 'flex-end' }}>
            <div className="form-group" style={{ margin: 0 }}>
              <label className="form-label">{isRtl ? 'بحث بالاسم / الهاتف / المنطقة' : 'Search Name / Phone / Area'}</label>
              <div style={{ position: 'relative' }}>
                <input
                  type="text"
                  className="form-control"
                  placeholder={isRtl ? 'مثال: محمد، 010...' : 'e.g. Ahmed, 010...'}
                  value={keyword}
                  onChange={(e) => setKeyword(e.target.value)}
                />
              </div>
            </div>

            <div className="form-group" style={{ margin: 0 }}>
              <label className="form-label">{isRtl ? 'القطاع الوظيفي' : 'Category'}</label>
              <select className="form-control" value={categoryId} onChange={(e) => setCategoryId(e.target.value)}>
                <option value="">{isRtl ? 'جميع القطاعات' : 'All Categories'}</option>
                {categories.map((c) => (
                  <option key={c._id} value={c._id}>
                    {isRtl ? (c.nameAr || c.name) : (c.name || c.nameAr)}
                  </option>
                ))}
              </select>
            </div>

            <div className="form-group" style={{ margin: 0 }}>
              <label className="form-label">{isRtl ? 'حالة التوفر' : 'Availability'}</label>
              <select className="form-control" value={availability} onChange={(e) => setAvailability(e.target.value)}>
                <option value="">{isRtl ? 'الكل' : 'All'}</option>
                <option value="Available">{isRtl ? 'متاح للعمل (Available)' : 'Available'}</option>
                <option value="Employed">{isRtl ? 'يعمل حالياً (Employed)' : 'Employed'}</option>
                <option value="NotLooking">{isRtl ? 'غير مهتم (Not Looking)' : 'Not Looking'}</option>
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
                  setCategoryId('')
                  setAvailability('')
                  setTimeout(() => fetchCandidates(1), 0)
                }}
              >
                {isRtl ? 'إعادة ضبط' : 'Reset'}
              </button>
            </div>
          </form>
        </div>

        {/* Candidates Table */}
        <div className="card" style={{ padding: 0, overflow: 'hidden' }}>
          {loading ? (
            <div style={{ padding: '3rem' }}>
              <LoadingSpinner />
            </div>
          ) : candidates.length === 0 ? (
            <EmptyState
              icon={Users}
              title={isRtl ? 'لا يوجد مرشحون متطابقون' : 'No candidates found'}
              description={isRtl ? 'جرب تغيير شروط البحث أو الفلاتر أعلاه.' : 'Try adjusting your search criteria.'}
            />
          ) : (
            <div style={{ overflowX: 'auto' }}>
              <table style={{ width: '100%', borderCollapse: 'collapse', textAlign: isRtl ? 'right' : 'left', fontSize: '0.875rem' }}>
                <thead>
                  <tr style={{ background: 'var(--slate-50)', borderBottom: '1px solid var(--border)' }}>
                    <th style={{ padding: '0.875rem 1rem', fontWeight: 700, color: 'var(--slate-600)' }}>
                      {isRtl ? 'المرشح' : 'Candidate'}
                    </th>
                    <th style={{ padding: '0.875rem 1rem', fontWeight: 700, color: 'var(--slate-600)' }}>
                      {isRtl ? 'الوظيفة المستهدفة' : 'Desired Job'}
                    </th>
                    <th style={{ padding: '0.875rem 1rem', fontWeight: 700, color: 'var(--slate-600)' }}>
                      {isRtl ? 'المنطقة' : 'Location'}
                    </th>
                    <th style={{ padding: '0.875rem 1rem', fontWeight: 700, color: 'var(--slate-600)' }}>
                      {isRtl ? 'الخبرة' : 'Exp.'}
                    </th>
                    <th style={{ padding: '0.875rem 1rem', fontWeight: 700, color: 'var(--slate-600)' }}>
                      {isRtl ? 'حالة التوفر' : 'Availability'}
                    </th>
                    <th style={{ padding: '0.875rem 1rem', fontWeight: 700, color: 'var(--slate-600)' }}>
                      {isRtl ? 'حالة الحساب' : 'Status'}
                    </th>
                    <th style={{ padding: '0.875rem 1rem', fontWeight: 700, color: 'var(--slate-600)', textAlign: 'center' }}>
                      {isRtl ? 'الإجراءات' : 'Actions'}
                    </th>
                  </tr>
                </thead>
                <tbody>
                  {candidates.map((cand) => {
                    const isBlocked = cand.accountStatus === 'blocked' || cand.userId?.isBlocked
                    return (
                      <tr key={cand._id} style={{ borderBottom: '1px solid var(--border)', transition: 'background 0.15s' }}>
                        <td style={{ padding: '0.875rem 1rem' }}>
                          <div style={{ fontWeight: 700, color: 'var(--slate-900)' }}>{cand.fullName}</div>
                          <div style={{ color: 'var(--slate-500)', fontSize: '0.8125rem', display: 'flex', alignItems: 'center', gap: '0.35rem', marginTop: '0.15rem' }}>
                            <Phone size={12} />
                            <span dir="ltr">{cand.phone}</span>
                          </div>
                        </td>

                        <td style={{ padding: '0.875rem 1rem' }}>
                          <div style={{ fontWeight: 600, color: 'var(--accent)' }}>
                            {isRtl ? (cand.desiredJobId?.nameAr || cand.desiredJobId?.name) : (cand.desiredJobId?.name || cand.desiredJobId?.nameAr)}
                          </div>
                          <div style={{ fontSize: '0.75rem', color: 'var(--slate-400)' }}>
                            {isRtl ? (cand.categoryId?.nameAr || cand.categoryId?.name) : (cand.categoryId?.name || cand.categoryId?.nameAr)}
                          </div>
                        </td>

                        <td style={{ padding: '0.875rem 1rem', color: 'var(--slate-700)' }}>
                          <div>{cand.governorate || '—'}</div>
                          <div style={{ fontSize: '0.75rem', color: 'var(--slate-500)' }}>{cand.area || ''}</div>
                        </td>

                        <td style={{ padding: '0.875rem 1rem', color: 'var(--slate-700)' }}>
                          {cand.yearsOfExperience || 0} {isRtl ? 'سنة' : 'yrs'}
                        </td>

                        <td style={{ padding: '0.875rem 1rem' }}>
                          <select
                            style={{
                              fontSize: '0.8125rem',
                              padding: '0.25rem 0.5rem',
                              borderRadius: 'var(--radius-sm)',
                              border: '1px solid var(--border)',
                              background: '#fff'
                            }}
                            value={cand.availabilityStatus || 'Available'}
                            onChange={(e) => handleStatusChange(cand._id, e.target.value)}
                          >
                            <option value="Available">{isRtl ? 'متاح' : 'Available'}</option>
                            <option value="Employed">{isRtl ? 'يعمل' : 'Employed'}</option>
                            <option value="NotLooking">{isRtl ? 'غير مهتم' : 'Not Looking'}</option>
                          </select>
                        </td>

                        <td style={{ padding: '0.875rem 1rem' }}>
                          {isBlocked ? (
                            <span style={{ fontSize: '0.75rem', padding: '0.2rem 0.5rem', borderRadius: 'var(--radius-full)', background: 'var(--rose-light)', color: 'var(--rose)', fontWeight: 700 }}>
                              {isRtl ? 'محظور' : 'Blocked'}
                            </span>
                          ) : (
                            <span style={{ fontSize: '0.75rem', padding: '0.2rem 0.5rem', borderRadius: 'var(--radius-full)', background: 'var(--emerald-light)', color: 'var(--emerald)', fontWeight: 700 }}>
                              {isRtl ? 'نشط' : 'Active'}
                            </span>
                          )}
                        </td>

                        <td style={{ padding: '0.875rem 1rem', textAlign: 'center' }}>
                          <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '0.375rem' }}>
                            <Link
                              to={`/admin/candidates/${cand._id}`}
                              className="btn"
                              style={{ padding: '0.35rem', background: 'var(--slate-100)', color: 'var(--slate-700)' }}
                              title={isRtl ? 'عرض التفاصيل' : 'View Details'}
                            >
                              <Eye size={15} />
                            </Link>

                            <button
                              onClick={() => handleToggleBlock(cand)}
                              className="btn"
                              style={{
                                padding: '0.35rem',
                                background: isBlocked ? 'var(--emerald-light)' : 'var(--amber-light)',
                                color: isBlocked ? 'var(--emerald)' : 'var(--amber)'
                              }}
                              title={isBlocked ? (isRtl ? 'إلغاء الحظر' : 'Unblock') : (isRtl ? 'حظر الحساب' : 'Block')}
                            >
                              {isBlocked ? <ShieldCheck size={15} /> : <ShieldAlert size={15} />}
                            </button>

                            <button
                              onClick={() => handleDelete(cand)}
                              className="btn"
                              style={{ padding: '0.35rem', background: 'var(--rose-light)', color: 'var(--rose)' }}
                              title={isRtl ? 'حذف الملف' : 'Delete Profile'}
                            >
                              <Trash2 size={15} />
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
                onPageChange={(p) => fetchCandidates(p)}
              />
            </div>
          )}
        </div>
      </div>

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
