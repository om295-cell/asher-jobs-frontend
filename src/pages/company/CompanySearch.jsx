import React, { useEffect, useState, useCallback, useRef, useMemo } from 'react'
import { useLanguage } from '../../context/LanguageContext'
import { useToast } from '../../context/ToastContext'
import { searchApi } from '../../api/search.api'
import { jobsApi } from '../../api/jobs.api'
import { companyApi } from '../../api/company.api'
import { Link } from 'react-router-dom'
import { Search, SlidersHorizontal, Download, Phone, MessageCircle, Star, X, ShoppingCart, Sparkles, Clock, ChevronDown, Check } from 'lucide-react'
import CandidateCard from '../../components/ui/CandidateCard'
import CandidateDetailModal from '../../components/modals/CandidateDetailModal'
import Pagination from '../../components/ui/Pagination'
import LoadingSpinner from '../../components/ui/LoadingSpinner'
import EmptyState from '../../components/ui/EmptyState'

const EXP_RANGES = [
  { label: 'الكل', value: '' },
  { label: '0 - 2 سنة', value: '0-2' },
  { label: '3 - 5 سنوات', value: '3-5' },
  { label: '6 - 10 سنوات', value: '6-10' },
  { label: 'أكثر من 10 سنوات', value: '10+' },
]

function SearchableJobFilter({ jobs, selectedJobId, onSelect, isRtl }) {
  const [open, setOpen] = useState(false)
  const [search, setSearch] = useState('')
  const wrapperRef = useRef(null)

  const selectedJob = useMemo(
    () => jobs.find(j => String(j._id) === String(selectedJobId)),
    [jobs, selectedJobId]
  )

  const filteredJobs = useMemo(() => {
    if (!search.trim()) return jobs
    const q = search.trim().toLowerCase()
    return jobs.filter(j => {
      const name = (j.name || '').toLowerCase()
      const nameAr = (j.nameAr || '').toLowerCase()
      const cat = (j.categoryId?.nameAr || j.categoryId?.name || '').toLowerCase()
      return name.includes(q) || nameAr.includes(q) || cat.includes(q)
    })
  }, [jobs, search])

  useEffect(() => {
    function handleClickOutside(e) {
      if (wrapperRef.current && !wrapperRef.current.contains(e.target)) {
        setOpen(false)
      }
    }
    document.addEventListener('mousedown', handleClickOutside)
    return () => document.removeEventListener('mousedown', handleClickOutside)
  }, [])

  return (
    <div ref={wrapperRef} style={{ position: 'relative', width: '100%' }}>
      <div
        onClick={() => setOpen(!open)}
        className="form-control"
        style={{
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'space-between',
          cursor: 'pointer',
          padding: '0.625rem 0.85rem',
          userSelect: 'none',
          backgroundColor: '#ffffff',
          borderColor: '#000000',
          minHeight: '42px'
        }}
      >
        <span style={{ overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap', fontWeight: selectedJob ? 700 : 500, color: '#000000' }}>
          {selectedJob
            ? (isRtl ? selectedJob.nameAr || selectedJob.name : selectedJob.name || selectedJob.nameAr)
            : (isRtl ? '-- كل المهن --' : '-- All Jobs --')}
        </span>
        <div style={{ display: 'flex', alignItems: 'center', gap: '0.35rem', flexShrink: 0 }}>
          {selectedJob && (
            <span
              role="button"
              tabIndex={0}
              onClick={(e) => {
                e.stopPropagation()
                onSelect('')
                setSearch('')
              }}
              title={isRtl ? 'إلغاء التحديد' : 'Clear'}
              style={{
                display: 'inline-flex',
                alignItems: 'center',
                justifyContent: 'center',
                width: 20,
                height: 20,
                borderRadius: '50%',
                background: '#f4f4f5',
                color: '#000000',
                cursor: 'pointer'
              }}
            >
              <X size={12} />
            </span>
          )}
          <ChevronDown size={16} style={{ color: '#000000' }} />
        </div>
      </div>

      {open && (
        <div
          style={{
            position: 'absolute',
            top: 'calc(100% + 4px)',
            left: 0,
            right: 0,
            zIndex: 100,
            background: '#ffffff',
            border: '1.5px solid #000000',
            borderRadius: '8px',
            boxShadow: '0 10px 25px rgba(0, 0, 0, 0.1)',
            padding: '0.5rem',
            maxHeight: '280px',
            display: 'flex',
            flexDirection: 'column'
          }}
        >
          <div style={{ position: 'relative', marginBottom: '0.5rem' }}>
            <Search
              size={15}
              style={{
                position: 'absolute',
                top: '50%',
                [isRtl ? 'right' : 'left']: '10px',
                transform: 'translateY(-50%)',
                color: '#71717a'
              }}
            />
            <input
              type="text"
              autoFocus
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              placeholder={isRtl ? 'ابحث عن اسم المهنة...' : 'Search job title...'}
              style={{
                width: '100%',
                padding: isRtl ? '0.45rem 2rem 0.45rem 0.75rem' : '0.45rem 0.75rem 0.45rem 2rem',
                borderRadius: '6px',
                border: '1px solid #000000',
                fontSize: '0.85rem',
                outline: 'none',
                background: '#ffffff',
                color: '#000000'
              }}
            />
          </div>

          <div style={{ overflowY: 'auto', flex: 1 }}>
            {/* All Jobs option */}
            <div
              onClick={() => {
                onSelect('')
                setOpen(false)
                setSearch('')
              }}
              style={{
                padding: '0.5rem 0.75rem',
                borderRadius: '6px',
                cursor: 'pointer',
                fontSize: '0.875rem',
                color: !selectedJobId ? '#000000' : '#52525b',
                fontWeight: !selectedJobId ? 700 : 500,
                background: !selectedJobId ? '#f4f4f5' : 'transparent',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'space-between',
                transition: 'background 0.1s'
              }}
              onMouseEnter={(e) => (e.currentTarget.style.background = '#f4f4f5')}
              onMouseLeave={(e) => {
                if (selectedJobId) e.currentTarget.style.background = 'transparent'
              }}
            >
              <span>{isRtl ? '-- كل المهن --' : '-- All Jobs --'}</span>
              {!selectedJobId && <Check size={14} color="#000000" />}
            </div>

            {filteredJobs.length === 0 ? (
              <div style={{ padding: '0.75rem', textAlign: 'center', color: '#71717a', fontSize: '0.85rem' }}>
                {isRtl ? 'لا توجد مهن مطابقة لبحثك' : 'No matching jobs found'}
              </div>
            ) : (
              filteredJobs.map((j) => {
                const isSelected = String(j._id) === String(selectedJobId)
                return (
                  <div
                    key={j._id}
                    onClick={() => {
                      onSelect(j._id)
                      setOpen(false)
                      setSearch('')
                    }}
                    style={{
                      padding: '0.5rem 0.75rem',
                      borderRadius: '6px',
                      cursor: 'pointer',
                      fontSize: '0.875rem',
                      color: isSelected ? '#000000' : '#18181b',
                      fontWeight: isSelected ? 700 : 500,
                      background: isSelected ? '#f4f4f5' : 'transparent',
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'space-between',
                      transition: 'background 0.1s'
                    }}
                    onMouseEnter={(e) => (e.currentTarget.style.background = '#f4f4f5')}
                    onMouseLeave={(e) => {
                      if (!isSelected) e.currentTarget.style.background = 'transparent'
                    }}
                  >
                    <span>{isRtl ? j.nameAr || j.name : j.name || j.nameAr}</span>
                    {isSelected && <Check size={14} color="#000000" />}
                  </div>
                )
              })
            )}
          </div>
        </div>
      )}
    </div>
  )
}

export default function CompanySearch() {
  const { isRtl } = useLanguage()
  const { showToast } = useToast()
  const [jobs, setJobs] = useState([])
  const [candidates, setCandidates] = useState([])
  const [total, setTotal] = useState(0)
  const [page, setPage] = useState(1)
  const [loading, setLoading] = useState(false)
  const [selectedCandidate, setSelectedCandidate] = useState(null)
  const [showFilters, setShowFilters] = useState(true)
  const [entitlements, setEntitlements] = useState(null)
  const [filters, setFilters] = useState({
    desiredJobId: '',
    expRange: ''
  })

  const fetchEntitlements = useCallback(async () => {
    try {
      const res = await companyApi.getEntitlements()
      if (res.data?.success) {
        setEntitlements(res.data.data)
      }
    } catch (_) {}
  }, [])

  useEffect(() => {
    jobsApi.getJobs().then(res => setJobs(res.data?.data || [])).catch(() => {})
    fetchEntitlements()
  }, [fetchEntitlements])

  const doSearch = useCallback((currentPage = 1) => {
    setLoading(true)
    const params = { page: currentPage, limit: 12 }
    if (filters.desiredJobId) params.desiredJobId = filters.desiredJobId
    if (filters.expRange) {
      const parts = filters.expRange.split('-')
      if (parts.length === 2) { params.minExp = parts[0]; params.maxExp = parts[1] }
      else if (filters.expRange === '10+') params.minExp = 10
    }
    searchApi.searchCandidates(params).then(res => {
      setCandidates(res.data?.data || [])
      setTotal(res.data?.total || 0)
      fetchEntitlements()
    }).catch(() => showToast(isRtl ? 'خطأ في البحث' : 'Search error', 'error'))
      .finally(() => setLoading(false))
  }, [filters, isRtl, showToast, fetchEntitlements])

  useEffect(() => { doSearch(1); setPage(1) }, [])

  const handleSearch = (e) => { e.preventDefault(); setPage(1); doSearch(1) }
  const handlePageChange = (p) => { setPage(p); doSearch(p) }

  const handleContact = async (candidateId, type) => {
    try {
      const res = await companyApi.recordInteraction(candidateId, type)
      showToast(isRtl ? `تم تسجيل ${type === 'Phone' ? 'الاتصال' : 'واتساب'} بنجاح` : `${type} contact recorded`, 'success')
      return res.data?.data
    } catch (err) {
      showToast(err.response?.data?.message || 'Error', 'error')
    }
  }

  const handleExport = async () => {
    try {
      const params = {}
      if (filters.desiredJobId) params.desiredJobId = filters.desiredJobId
      if (filters.governorate) params.governorate = filters.governorate
      const res = await companyApi.exportCandidates(params)
      fetchEntitlements()
      const blob = new Blob([res.data], { type: 'text/csv;charset=utf-8;' })
      const url = URL.createObjectURL(blob)
      const a = document.createElement('a')
      a.href = url
      a.download = `candidates-${Date.now()}.csv`
      a.click()
      URL.revokeObjectURL(url)
      showToast(
        isRtl
          ? 'تم تصدير أول 10 مرشحين بنجاح (الحد الأقصى للملف الواحد)'
          : 'Export successful (limited to 10 candidates per file)',
        'success'
      )
    } catch (err) {
      let errMsg = isRtl ? 'فشل التصدير' : 'Export failed'
      if (err.response?.data instanceof Blob) {
        try {
          const text = await err.response.data.text()
          const json = JSON.parse(text)
          if (json.message) errMsg = json.message
        } catch (_) {}
      } else if (err.response?.data?.message) {
        errMsg = err.response.data.message
      }
      showToast(errMsg, 'error')
    }
  }

  return (
    <div style={{ padding: '2rem 0', background: 'var(--bg-page)', minHeight: '80vh' }}>
      <div className="container">
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1.5rem', flexWrap: 'wrap', gap: '0.75rem' }}>
          <div>
            <h1 style={{ fontSize: '1.5rem', fontWeight: 800, color: 'var(--slate-900)' }}>
              {isRtl ? 'البحث عن مرشحين' : 'Search Candidates'}
            </h1>
            <p style={{ color: 'var(--slate-500)', fontSize: '0.875rem', marginTop: '0.25rem' }}>
              {isRtl ? `${total} مرشح متاح في قاعدة البيانات (التصدير بحد أقصى 10 مرشحين في الملف)` : `${total} candidates available (export limited to max 10 candidates per file)`}
            </p>
          </div>
          <div style={{ display: 'flex', gap: '0.75rem', flexWrap: 'wrap' }}>
            <button onClick={() => setShowFilters(!showFilters)} style={{ display: 'flex', alignItems: 'center', gap: '0.4rem', padding: '0.6rem 1rem', background: '#fff', border: '1px solid var(--border)', borderRadius: '8px', fontWeight: 600, cursor: 'pointer', fontSize: '0.875rem', color: 'var(--slate-700)' }}>
              <SlidersHorizontal size={16} />
              {isRtl ? 'فلاتر' : 'Filters'}
            </button>
            <button
              onClick={handleExport}
              title={isRtl ? 'تصدير أول 10 مرشحين كملف CSV' : 'Export top 10 candidates as CSV'}
              style={{ display: 'flex', alignItems: 'center', gap: '0.4rem', padding: '0.6rem 1rem', background: 'var(--emerald)', color: '#fff', border: 'none', borderRadius: '8px', fontWeight: 700, cursor: 'pointer', fontSize: '0.875rem' }}
            >
              <Download size={16} />
              {isRtl ? 'تصدير CSV (أول 10)' : 'Export CSV (Max 10)'}
            </button>
          </div>
        </div>

        {/* Cairo Daily Quota & Subscription Status Banner */}
        {entitlements && (
          <div
            style={{
              background: '#ffffff',
              border: '1px solid var(--border)',
              borderRadius: '16px',
              padding: '1.25rem',
              marginBottom: '1.5rem',
              boxShadow: '0 1px 3px rgba(0,0,0,0.05)',
              display: 'flex',
              flexWrap: 'wrap',
              alignItems: 'center',
              justifyContent: 'space-between',
              gap: '1rem'
            }}
          >
            <div style={{ display: 'flex', alignItems: 'center', gap: '1rem', flexWrap: 'wrap' }}>
              <span
                style={{
                  padding: '0.35rem 0.85rem',
                  borderRadius: '999px',
                  fontWeight: 800,
                  fontSize: '0.8125rem',
                  background: entitlements.plan === 'Platinum' ? '#e0e7ff' : entitlements.plan === 'Gold' ? '#fef3c7' : '#e2e8f0',
                  color: entitlements.plan === 'Platinum' ? '#3730a3' : entitlements.plan === 'Gold' ? '#92400e' : '#334155',
                  border: '1px solid currentColor'
                }}
              >
                باقة: {entitlements.plan}
              </span>

              <div style={{ display: 'flex', alignItems: 'center', gap: '0.4rem', fontSize: '0.875rem', color: 'var(--slate-700)' }}>
                <span>عمليات البحث اليومية المتبقية:</span>
                <strong style={{ color: 'var(--primary)', fontWeight: 800 }}>
                  {entitlements.remainingDailySearches} / {entitlements.limits?.dailySearchLimit}
                </strong>
              </div>

              <div style={{ display: 'flex', alignItems: 'center', gap: '0.4rem', fontSize: '0.875rem', color: 'var(--slate-700)' }}>
                <span>تاريخ اليوم (القاهرة):</span>
                <span style={{ fontWeight: 600 }}>{entitlements.cairoDate}</span>
              </div>
            </div>

            <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem', flexWrap: 'wrap' }}>
              {entitlements.limits?.cartEnabled && (
                <Link
                  to="/company/cart"
                  className="btn"
                  style={{
                    background: '#eff6ff',
                    color: '#1d4ed8',
                    border: '1px solid #bfdbfe',
                    padding: '0.45rem 0.85rem',
                    borderRadius: '10px',
                    fontSize: '0.8125rem',
                    fontWeight: 700,
                    display: 'flex',
                    alignItems: 'center',
                    gap: '0.4rem',
                    textDecoration: 'none'
                  }}
                >
                  <ShoppingCart size={15} />
                  <span>سلة المرشحين (تصدير مجمع)</span>
                </Link>
              )}

              {entitlements.limits?.platinumBrowseEnabled && (
                <Link
                  to="/company/browse"
                  className="btn"
                  style={{
                    background: 'linear-gradient(135deg, #4338ca, #6366f1)',
                    color: '#ffffff',
                    border: 'none',
                    padding: '0.45rem 0.85rem',
                    borderRadius: '10px',
                    fontSize: '0.8125rem',
                    fontWeight: 700,
                    display: 'flex',
                    alignItems: 'center',
                    gap: '0.4rem',
                    textDecoration: 'none',
                    boxShadow: '0 2px 4px rgba(79, 70, 229, 0.25)'
                  }}
                >
                  <Sparkles size={15} />
                  <span>بوابة التصفح الحصرية (VIP)</span>
                </Link>
              )}

              <span style={{ fontSize: '0.75rem', color: 'var(--slate-500)', display: 'flex', alignItems: 'center', gap: '0.25rem' }}>
                <Clock size={12} />
                <span>تتجدد الحصص 00:00 بتوقيت القاهرة</span>
              </span>
            </div>
          </div>
        )}

        {/* Filters */}
        {showFilters && (
          <div className="card card-responsive" style={{ marginBottom: '1.5rem' }}>
            <form onSubmit={handleSearch}>
              <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(min(100%, 240px), 1fr))', gap: '1rem', marginBottom: '1.25rem' }}>
                <div className="form-group" style={{ margin: 0 }}>
                  <label className="form-label">{isRtl ? 'المهنة' : 'Job Title'}</label>
                  <SearchableJobFilter
                    jobs={jobs}
                    selectedJobId={filters.desiredJobId}
                    onSelect={(jobId) => setFilters(p => ({ ...p, desiredJobId: jobId }))}
                    isRtl={isRtl}
                  />
                </div>
                <div className="form-group" style={{ margin: 0 }}>
                  <label className="form-label">{isRtl ? 'سنوات الخبرة' : 'Experience Range'}</label>
                  <select className="form-control" value={filters.expRange} onChange={e => setFilters(p => ({ ...p, expRange: e.target.value }))}>
                    {EXP_RANGES.map(r => <option key={r.value} value={r.value}>{r.label}</option>)}
                  </select>
                </div>
              </div>
              <div style={{ display: 'flex', alignItems: 'center', justifyContent: isRtl ? 'flex-start' : 'flex-end', gap: '0.75rem' }}>
                <button type="submit" className="btn btn-primary" style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                  <Search size={18} />
                  {isRtl ? 'بحث' : 'Search'}
                </button>
              </div>
            </form>
          </div>
        )}

        {/* Results */}
        {loading ? <LoadingSpinner /> : candidates.length === 0 ? (
          <EmptyState
            title={isRtl ? 'لا توجد نتائج' : 'No Results Found'}
            description={isRtl ? 'جرّب تغيير معايير البحث' : 'Try adjusting your search filters'}
          />
        ) : (
          <>
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(min(100%, 280px), 1fr))', gap: '1rem', marginBottom: '2rem' }}>
              {candidates.map(candidate => (
                <CandidateCard
                  key={candidate._id || candidate.id}
                  candidate={candidate}
                  onViewDetails={() => setSelectedCandidate(candidate)}
                  onClick={() => setSelectedCandidate(candidate)}
                  onContact={handleContact}
                />
              ))}
            </div>
            <Pagination
              currentPage={page}
              totalPages={Math.ceil(total / 12)}
              onPageChange={handlePageChange}
            />
          </>
        )}
      </div>

      {selectedCandidate && (
        <CandidateDetailModal
          candidate={selectedCandidate}
          isOpen={Boolean(selectedCandidate)}
          onClose={() => setSelectedCandidate(null)}
          onContact={handleContact}
        />
      )}
    </div>
  )
}
