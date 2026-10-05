import React, { useEffect, useState, useCallback } from 'react'
import { useLanguage } from '../../context/LanguageContext'
import { useToast } from '../../context/ToastContext'
import { searchApi } from '../../api/search.api'
import { jobsApi } from '../../api/jobs.api'
import { companyApi } from '../../api/company.api'
import { Search, SlidersHorizontal, Download, Phone, MessageCircle, Star, X } from 'lucide-react'
import CandidateCard from '../../components/ui/CandidateCard'
import CandidateDetailModal from '../../components/modals/CandidateDetailModal'
import Pagination from '../../components/ui/Pagination'
import LoadingSpinner from '../../components/ui/LoadingSpinner'
import EmptyState from '../../components/ui/EmptyState'

const GOVERNORATES = ['', 'الشرقية', 'القاهرة', 'الجيزة', 'الإسكندرية', 'الغربية', 'المنوفية', 'القليوبية', 'الدقهلية', 'كفر الشيخ', 'البحيرة', 'أسيوط']
const EXP_RANGES = [
  { label: 'الكل', value: '' },
  { label: '0 - 2 سنة', value: '0-2' },
  { label: '3 - 5 سنوات', value: '3-5' },
  { label: '6 - 10 سنوات', value: '6-10' },
  { label: 'أكثر من 10 سنوات', value: '10+' },
]

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

  const [filters, setFilters] = useState({
    desiredJobId: '',
    governorate: '',
    expRange: '',
    isOpenToWork: true
  })

  useEffect(() => {
    jobsApi.getJobs().then(res => setJobs(res.data?.data || [])).catch(() => {})
  }, [])

  const doSearch = useCallback((currentPage = 1) => {
    setLoading(true)
    const params = { page: currentPage, limit: 12, isOpenToWork: filters.isOpenToWork || undefined }
    if (filters.desiredJobId) params.desiredJobId = filters.desiredJobId
    if (filters.governorate) params.governorate = filters.governorate
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
          <div style={{ display: 'flex', gap: '0.75rem' }}>
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

        {/* Filters */}
        {showFilters && (
          <div className="card" style={{ padding: '1.5rem', marginBottom: '1.5rem' }}>
            <form onSubmit={handleSearch}>
              <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))', gap: '1rem', marginBottom: '1rem' }}>
                <div className="form-group" style={{ margin: 0 }}>
                  <label className="form-label">{isRtl ? 'المهنة' : 'Job Title'}</label>
                  <select className="form-control" value={filters.desiredJobId} onChange={e => setFilters(p => ({ ...p, desiredJobId: e.target.value }))}>
                    <option value="">{isRtl ? '-- كل المهن --' : '-- All Jobs --'}</option>
                    {jobs.map(j => <option key={j._id} value={j._id}>{isRtl ? j.nameAr : j.name}</option>)}
                  </select>
                </div>
                <div className="form-group" style={{ margin: 0 }}>
                  <label className="form-label">{isRtl ? 'المحافظة' : 'Governorate'}</label>
                  <select className="form-control" value={filters.governorate} onChange={e => setFilters(p => ({ ...p, governorate: e.target.value }))}>
                    {GOVERNORATES.map(g => <option key={g} value={g}>{g || (isRtl ? 'كل المحافظات' : 'All')}</option>)}
                  </select>
                </div>
                <div className="form-group" style={{ margin: 0 }}>
                  <label className="form-label">{isRtl ? 'سنوات الخبرة' : 'Experience Range'}</label>
                  <select className="form-control" value={filters.expRange} onChange={e => setFilters(p => ({ ...p, expRange: e.target.value }))}>
                    {EXP_RANGES.map(r => <option key={r.value} value={r.value}>{r.label}</option>)}
                  </select>
                </div>
              </div>
              <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', flexWrap: 'wrap', gap: '0.75rem' }}>
                <label style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', cursor: 'pointer' }}>
                  <input type="checkbox" checked={filters.isOpenToWork} onChange={e => setFilters(p => ({ ...p, isOpenToWork: e.target.checked }))} style={{ width: 16, height: 16 }} />
                  <span style={{ fontSize: '0.9375rem', color: 'var(--slate-700)', fontWeight: 600 }}>
                    {isRtl ? 'المتاحون لعروض العمل فقط' : 'Open to work only'}
                  </span>
                </label>
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
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(280px, 1fr))', gap: '1rem', marginBottom: '2rem' }}>
              {candidates.map(candidate => (
                <CandidateCard
                  key={candidate._id}
                  candidate={candidate}
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
          onClose={() => setSelectedCandidate(null)}
          onContact={handleContact}
        />
      )}
    </div>
  )
}
