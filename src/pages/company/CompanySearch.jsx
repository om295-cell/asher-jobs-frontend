import React, { useEffect, useState, useCallback, useRef, useMemo } from 'react'
import { useLanguage } from '../../context/LanguageContext'
import { useToast } from '../../context/ToastContext'
import { searchApi } from '../../api/search.api'
import { jobsApi } from '../../api/jobs.api'
import { companyApi } from '../../api/company.api'
import { Link } from 'react-router-dom'
import {
  Search,
  SlidersHorizontal,
  Download,
  Phone,
  MessageCircle,
  Eye,
  X,
  ChevronDown,
  Check,
  FileSpreadsheet
} from 'lucide-react'
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
  const [hasSearched, setHasSearched] = useState(false)
  const [selectedCandidate, setSelectedCandidate] = useState(null)
  const [showFilters, setShowFilters] = useState(true)
  const [filters, setFilters] = useState({
    desiredJobId: '',
    expRange: ''
  })

  useEffect(() => {
    jobsApi.getJobs().then(res => setJobs(res.data?.data || [])).catch(() => {})
  }, [])

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
    }).catch(() => showToast(isRtl ? 'خطأ في البحث' : 'Search error', 'error'))
      .finally(() => setLoading(false))
  }, [filters, isRtl, showToast])

  const handleSearch = (e) => {
    if (e && e.preventDefault) e.preventDefault()
    setHasSearched(true)
    setPage(1)
    doSearch(1)
  }

  const handlePageChange = (p) => {
    setPage(p)
    doSearch(p)
  }

  const handleContact = async (candidateId, type) => {
    try {
      const res = await companyApi.recordInteraction(candidateId, type)
      showToast(isRtl ? `تم تسجيل ${type === 'Phone' ? 'الاتصال' : 'واتساب'} بنجاح` : `${type} contact recorded`, 'success')
      return res.data?.data
    } catch (err) {
      showToast(err.response?.data?.message || 'Error', 'error')
    }
  }

  const handleExport = async (format = 'xlsx') => {
    try {
      const params = { format }
      if (filters.desiredJobId) params.desiredJobId = filters.desiredJobId
      if (filters.governorate) params.governorate = filters.governorate
      const res = await companyApi.exportCandidates(params)
      const mime = format === 'xlsx'
        ? 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet'
        : 'text/csv;charset=utf-8;'
      const blob = new Blob([res.data], { type: mime })
      const url = URL.createObjectURL(blob)
      const a = document.createElement('a')
      a.href = url
      a.download = `candidates-${Date.now()}.${format}`
      a.click()
      URL.revokeObjectURL(url)
      showToast(
        isRtl
          ? 'تم تصدير أول 10 مرشحين بنجاح كملف إكسيل'
          : 'Export successful (first 10 candidates)',
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
        {/* Page Header */}
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1.5rem', flexWrap: 'wrap', gap: '1rem' }}>
          <div>
            <h1 style={{ fontSize: '1.65rem', fontWeight: 900, color: 'var(--slate-900)', margin: '0 0 0.35rem' }}>
              {isRtl ? 'البحث عن مرشحين' : 'Search Candidates'}
            </h1>
            <p style={{ color: 'var(--slate-500)', fontSize: '0.9rem', margin: 0 }}>
              {isRtl
                ? 'ابحث بالمهنة وسنوات الخبرة واستعرض المرشحين في جدول منسق مع إمكانية تحميل شيت إكسيل'
                : 'Search by profession and experience, view in Excel-style table, and export.'}
            </p>
          </div>
          <div style={{ display: 'flex', gap: '0.75rem', flexWrap: 'wrap', alignItems: 'center' }}>
            <button
              onClick={() => setShowFilters(!showFilters)}
              style={{
                display: 'inline-flex',
                alignItems: 'center',
                gap: '0.4rem',
                padding: '0.6rem 1rem',
                background: '#fff',
                border: '1px solid var(--border)',
                borderRadius: '8px',
                fontWeight: 600,
                cursor: 'pointer',
                fontSize: '0.875rem',
                color: 'var(--slate-700)'
              }}
            >
              <SlidersHorizontal size={16} />
              {isRtl ? (showFilters ? 'إخفاء الفلاتر' : 'إظهار الفلاتر') : (showFilters ? 'Hide Filters' : 'Show Filters')}
            </button>
            {hasSearched && candidates.length > 0 && (
              <button
                onClick={() => handleExport('xlsx')}
                title={isRtl ? 'تصدير أول 10 مرشحين كملف إكسيل Excel' : 'Export top 10 candidates as Excel (.xlsx)'}
                style={{
                  display: 'inline-flex',
                  alignItems: 'center',
                  gap: '0.5rem',
                  padding: '0.65rem 1.25rem',
                  background: '#059669',
                  color: '#ffffff',
                  border: 'none',
                  borderRadius: '8px',
                  fontWeight: 800,
                  cursor: 'pointer',
                  fontSize: '0.875rem',
                  boxShadow: '0 2px 6px rgba(5, 150, 105, 0.25)'
                }}
              >
                <FileSpreadsheet size={16} />
                <span>{isRtl ? 'تصدير إكسيل (أول 10)' : 'Export Excel (Top 10)'}</span>
              </button>
            )}
          </div>
        </div>

        {/* Filters Box */}
        {showFilters && (
          <div className="card card-responsive" style={{ marginBottom: '1.5rem', border: '1px solid var(--border)', borderRadius: '12px' }}>
            <form onSubmit={handleSearch}>
              <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(min(100%, 260px), 1fr))', gap: '1.25rem', marginBottom: '1.25rem' }}>
                <div className="form-group" style={{ margin: 0 }}>
                  <label className="form-label" style={{ fontWeight: 700, marginBottom: '0.4rem' }}>
                    {isRtl ? 'المهنة المطلوبة' : 'Required Profession'}
                  </label>
                  <SearchableJobFilter
                    jobs={jobs}
                    selectedJobId={filters.desiredJobId}
                    onSelect={(jobId) => setFilters(p => ({ ...p, desiredJobId: jobId }))}
                    isRtl={isRtl}
                  />
                </div>
                <div className="form-group" style={{ margin: 0 }}>
                  <label className="form-label" style={{ fontWeight: 700, marginBottom: '0.4rem' }}>
                    {isRtl ? 'سنوات الخبرة' : 'Experience Range'}
                  </label>
                  <select
                    className="form-control"
                    value={filters.expRange}
                    onChange={e => setFilters(p => ({ ...p, expRange: e.target.value }))}
                    style={{ borderColor: '#000000', minHeight: '42px', fontWeight: 600 }}
                  >
                    {EXP_RANGES.map(r => <option key={r.value} value={r.value}>{r.label}</option>)}
                  </select>
                </div>
              </div>
              <div style={{ display: 'flex', alignItems: 'center', justifyContent: isRtl ? 'flex-start' : 'flex-end', gap: '0.75rem' }}>
                <button
                  type="submit"
                  className="btn btn-primary"
                  style={{
                    display: 'inline-flex',
                    alignItems: 'center',
                    gap: '0.5rem',
                    padding: '0.65rem 2rem',
                    fontWeight: 800,
                    fontSize: '0.95rem'
                  }}
                >
                  <Search size={18} />
                  <span>{isRtl ? 'بحث' : 'Search'}</span>
                </button>
              </div>
            </form>
          </div>
        )}

        {/* Results Area (ONLY displays after search) */}
        {!hasSearched ? (
          <div
            style={{
              textAlign: 'center',
              padding: '4rem 1.5rem',
              background: '#ffffff',
              borderRadius: '16px',
              border: '1.5px dashed #cbd5e1',
              margin: '1.5rem 0'
            }}
          >
            <div
              style={{
                width: 64,
                height: 64,
                borderRadius: '50%',
                background: '#f1f5f9',
                display: 'inline-flex',
                alignItems: 'center',
                justifyContent: 'center',
                marginBottom: '1rem',
                color: '#0f172a'
              }}
            >
              <Search size={30} />
            </div>
            <h3 style={{ fontSize: '1.3rem', fontWeight: 800, color: '#0f172a', margin: '0 0 0.5rem' }}>
              {isRtl ? 'ابحث عن الكوادر المطلوبة' : 'Search for Required Candidates'}
            </h3>
            <p style={{ color: '#64748b', fontSize: '0.95rem', maxWidth: '520px', margin: '0 auto 1.5rem', lineHeight: 1.6 }}>
              {isRtl
                ? 'اختر المهنة المطلوبة والخبرة من الفلاتر أعلاه ثم اضغط على زر "بحث" لعرض جدول المرشحين بصيغة إكسيل وتحميل الشيت مباشرة.'
                : 'Select the required job title and experience from the filters above, then click "Search" to view the Excel-style table and download the sheet directly.'}
            </p>
            <button
              type="button"
              onClick={handleSearch}
              className="btn btn-primary"
              style={{ display: 'inline-flex', alignItems: 'center', gap: '0.5rem', padding: '0.65rem 1.75rem', fontWeight: 700 }}
            >
              <Search size={18} />
              <span>{isRtl ? 'عرض الكوادر المتاحة حالياً' : 'Show Currently Available Candidates'}</span>
            </button>
          </div>
        ) : loading ? (
          <div style={{ padding: '4rem 0', textAlign: 'center' }}>
            <LoadingSpinner />
          </div>
        ) : candidates.length === 0 ? (
          <EmptyState
            title={isRtl ? 'لا توجد نتائج مطابقة' : 'No Results Found'}
            description={isRtl ? 'جرّب اختيار مسمى وظيفي آخر أو إزالة فلتر سنوات الخبرة' : 'Try selecting another job title or clearing experience filter'}
          />
        ) : (
          <div
            style={{
              background: '#ffffff',
              borderRadius: '14px',
              border: '1px solid #e2e8f0',
              boxShadow: '0 4px 15px rgba(0,0,0,0.04)',
              overflow: 'hidden',
              marginBottom: '2rem'
            }}
          >
            {/* Prominent Action Bar with Download Button */}
            <div
              style={{
                display: 'flex',
                justifyContent: 'space-between',
                alignItems: 'center',
                padding: '1.1rem 1.5rem',
                borderBottom: '2px solid #e2e8f0',
                background: '#f8fafc',
                flexWrap: 'wrap',
                gap: '1rem'
              }}
            >
              <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem' }}>
                <span style={{ fontWeight: 900, color: '#0f172a', fontSize: '1.1rem' }}>
                  {isRtl ? `نتائج البحث (${total} مرشح متاح)` : `Search Results (${total} Available)`}
                </span>
                <span
                  style={{
                    fontSize: '0.75rem',
                    fontWeight: 800,
                    padding: '0.2rem 0.55rem',
                    borderRadius: '6px',
                    background: '#e2e8f0',
                    color: '#334155'
                  }}
                >
                  {isRtl ? 'جدول بنظام الإكسيل' : 'Excel Row View'}
                </span>
              </div>

              {/* VERY PROMINENT EXCEL DOWNLOAD BUTTON */}
              <button
                onClick={() => handleExport('xlsx')}
                style={{
                  display: 'inline-flex',
                  alignItems: 'center',
                  gap: '0.6rem',
                  padding: '0.75rem 1.5rem',
                  background: '#059669',
                  color: '#ffffff',
                  border: 'none',
                  borderRadius: '10px',
                  fontWeight: 900,
                  fontSize: '0.95rem',
                  cursor: 'pointer',
                  boxShadow: '0 3px 8px rgba(5, 150, 105, 0.35)',
                  transition: 'background 0.15s ease'
                }}
                onMouseEnter={(e) => (e.currentTarget.style.background = '#047857')}
                onMouseLeave={(e) => (e.currentTarget.style.background = '#059669')}
                title={isRtl ? 'تحميل أول 10 مرشحين كشيت إكسيل منسق (.xlsx)' : 'Download top 10 candidates as Excel (.xlsx)'}
              >
                <Download size={20} />
                <span>{isRtl ? 'تحميل شيت إكسيل (أول 10 مرشحين)' : 'Download Excel Sheet (Top 10)'}</span>
              </button>
            </div>

            {/* Excel-Style Table View */}
            <div style={{ overflowX: 'auto' }}>
              <table
                style={{
                  width: '100%',
                  borderCollapse: 'collapse',
                  textAlign: isRtl ? 'right' : 'left',
                  fontSize: '0.875rem'
                }}
              >
                <thead>
                  <tr
                    style={{
                      background: '#f1f5f9',
                      color: '#334155',
                      borderBottom: '2px solid #cbd5e1',
                      fontSize: '0.825rem',
                      fontWeight: 800
                    }}
                  >
                    <th style={{ padding: '0.85rem 1rem', width: '45px', textAlign: 'center' }}>#</th>
                    <th style={{ padding: '0.85rem 1rem' }}>{isRtl ? 'اسم المرشح' : 'Candidate Name'}</th>
                    <th style={{ padding: '0.85rem 1rem' }}>{isRtl ? 'رقم الهاتف والتواصل' : 'Phone & Contact'}</th>
                    <th style={{ padding: '0.85rem 1rem' }}>{isRtl ? 'المسمى الأساسي' : 'Primary Job'}</th>
                    <th style={{ padding: '0.85rem 1rem' }}>{isRtl ? 'مستوى الخبرة' : 'Career Level'}</th>
                    <th style={{ padding: '0.85rem 1rem' }}>{isRtl ? 'مسمى إضافي 2' : 'Secondary Job'}</th>
                    <th style={{ padding: '0.85rem 1rem' }}>{isRtl ? 'مسمى إضافي 3' : 'Tertiary Job'}</th>
                    <th style={{ padding: '0.85rem 1rem', textAlign: 'center', width: '90px' }}>{isRtl ? 'عرض' : 'View'}</th>
                  </tr>
                </thead>
                <tbody>
                  {candidates.map((c, idx) => {
                    const rowNumber = (page - 1) * 12 + idx + 1
                    const primaryJobTitle = c.desiredJobId
                      ? (isRtl ? c.desiredJobId.nameAr || c.desiredJobId.name : c.desiredJobId.name || c.desiredJobId.nameAr)
                      : (isRtl ? 'غير محدد' : 'N/A')
                    const secondJobTitle = c.secondJobId
                      ? (isRtl ? c.secondJobId.nameAr || c.secondJobId.name : c.secondJobId.name || c.secondJobId.nameAr)
                      : '—'
                    const thirdJobTitle = c.thirdJobId
                      ? (isRtl ? c.thirdJobId.nameAr || c.thirdJobId.name : c.thirdJobId.name || c.thirdJobId.nameAr)
                      : '—'

                    return (
                      <tr
                        key={c._id || c.id || idx}
                        style={{
                          borderBottom: '1px solid #e2e8f0',
                          background: idx % 2 === 0 ? '#ffffff' : '#fcfcfd',
                          transition: 'background 0.12s ease'
                        }}
                        onMouseEnter={(e) => (e.currentTarget.style.background = '#f1f5f9')}
                        onMouseLeave={(e) => (e.currentTarget.style.background = idx % 2 === 0 ? '#ffffff' : '#fcfcfd')}
                      >
                        <td style={{ padding: '0.85rem 1rem', textAlign: 'center', color: '#64748b', fontWeight: 700 }}>
                          {rowNumber}
                        </td>
                        <td style={{ padding: '0.85rem 1rem' }}>
                          <div
                            onClick={() => setSelectedCandidate(c)}
                            style={{ fontWeight: 800, color: '#0f172a', cursor: 'pointer' }}
                            onMouseEnter={(e) => (e.currentTarget.style.textDecoration = 'underline')}
                            onMouseLeave={(e) => (e.currentTarget.style.textDecoration = 'none')}
                          >
                            {c.fullName}
                          </div>
                        </td>
                        <td style={{ padding: '0.85rem 1rem' }}>
                          <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                            <span style={{ fontWeight: 700, color: '#09090b', direction: 'ltr', fontFamily: 'monospace', fontSize: '0.9rem' }}>
                              {c.phone}
                            </span>
                            <div style={{ display: 'inline-flex', gap: '0.3rem' }}>
                              <a
                                href={`tel:${c.phone}`}
                                onClick={() => handleContact(c._id, 'Phone')}
                                title={isRtl ? 'اتصال هاتف' : 'Call'}
                                style={{
                                  display: 'inline-flex',
                                  alignItems: 'center',
                                  justifyContent: 'center',
                                  width: '28px',
                                  height: '28px',
                                  borderRadius: '6px',
                                  background: '#eff6ff',
                                  color: '#2563eb',
                                  textDecoration: 'none'
                                }}
                              >
                                <Phone size={14} />
                              </a>
                              <a
                                href={`https://wa.me/20${(c.phone || '').replace(/^0/, '')}`}
                                target="_blank"
                                rel="noreferrer"
                                onClick={() => handleContact(c._id, 'WhatsApp')}
                                title={isRtl ? 'مراسلة واتساب' : 'WhatsApp'}
                                style={{
                                  display: 'inline-flex',
                                  alignItems: 'center',
                                  justifyContent: 'center',
                                  width: '28px',
                                  height: '28px',
                                  borderRadius: '6px',
                                  background: '#ecfdf5',
                                  color: '#059669',
                                  textDecoration: 'none'
                                }}
                              >
                                <MessageCircle size={14} />
                              </a>
                            </div>
                          </div>
                        </td>
                        <td style={{ padding: '0.85rem 1rem' }}>
                          <div style={{ display: 'flex', alignItems: 'center', gap: '0.4rem', flexWrap: 'wrap' }}>
                            <span style={{ fontWeight: 700, color: '#1e293b' }}>
                              {primaryJobTitle}
                            </span>
                            {c.matchPriority && (
                              <span
                                style={{
                                  fontSize: '0.7rem',
                                  fontWeight: 800,
                                  padding: '0.1rem 0.4rem',
                                  borderRadius: '4px',
                                  background: c.matchPriority === 1 ? '#dcfce7' : c.matchPriority === 2 ? '#dbeafe' : '#fef3c7',
                                  color: c.matchPriority === 1 ? '#15803d' : c.matchPriority === 2 ? '#1d4ed8' : '#b45309'
                                }}
                              >
                                {isRtl ? `أولوية ${c.matchPriority}` : `Priority ${c.matchPriority}`}
                              </span>
                            )}
                          </div>
                        </td>
                        <td style={{ padding: '0.85rem 1rem', color: '#334155', fontWeight: 600 }}>
                          {c.careerLevel || '—'}
                        </td>
                        <td style={{ padding: '0.85rem 1rem', color: '#475569' }}>
                          <div>{secondJobTitle}</div>
                          {c.secondCareerLevel && (
                            <div style={{ fontSize: '0.75rem', color: '#94a3b8' }}>{c.secondCareerLevel}</div>
                          )}
                        </td>
                        <td style={{ padding: '0.85rem 1rem', color: '#475569' }}>
                          <div>{thirdJobTitle}</div>
                          {c.thirdCareerLevel && (
                            <div style={{ fontSize: '0.75rem', color: '#94a3b8' }}>{c.thirdCareerLevel}</div>
                          )}
                        </td>
                        <td style={{ padding: '0.85rem 1rem', textAlign: 'center' }}>
                          <button
                            onClick={() => setSelectedCandidate(c)}
                            style={{
                              display: 'inline-flex',
                              alignItems: 'center',
                              gap: '0.35rem',
                              padding: '0.4rem 0.75rem',
                              borderRadius: '6px',
                              background: '#f1f5f9',
                              border: '1px solid #cbd5e1',
                              color: '#1e293b',
                              fontSize: '0.8rem',
                              fontWeight: 700,
                              cursor: 'pointer'
                            }}
                            title={isRtl ? 'عرض تفاصيل المرشح' : 'View Profile'}
                          >
                            <Eye size={14} />
                            <span>{isRtl ? 'عرض' : 'View'}</span>
                          </button>
                        </td>
                      </tr>
                    )
                  })}
                </tbody>
              </table>
            </div>

            {/* Table Pagination Footer */}
            <div style={{ padding: '1rem', borderTop: '1px solid #e2e8f0', background: '#f8fafc', display: 'flex', justifyContent: 'center' }}>
              <Pagination
                currentPage={page}
                totalPages={Math.ceil(total / 12)}
                onPageChange={handlePageChange}
              />
            </div>
          </div>
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
