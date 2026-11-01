// v2 - includes JobTitleImportModal with file/text extraction
import React, { useEffect, useState } from 'react'
import { Link } from 'react-router-dom'
import { useLanguage } from '../../context/LanguageContext'
import { useToast } from '../../context/ToastContext'
import { adminApi } from '../../api/admin.api'
import {
  Briefcase,
  Plus,
  Edit,
  Trash2,
  CheckCircle,
  XCircle,
  Search,
  Filter,
  Save,
  X,
  FileSpreadsheet,
  Building2,
  Check,
  Clock,
  Users,
  AlertTriangle,
  Download,
  ArrowUpDown,
  ExternalLink
} from 'lucide-react'
import LoadingSpinner from '../../components/ui/LoadingSpinner'
import ConfirmModal from '../../components/modals/ConfirmModal'
import EmptyState from '../../components/ui/EmptyState'
import JobTitleImportModal from '../../components/modals/JobTitleImportModal'
import JobTitleReviewWorkspace from '../../components/admin/JobTitleReviewWorkspace'

export default function AdminJobs() {
  const { isRtl } = useLanguage()
  const { showToast } = useToast()

  const [jobs, setJobs] = useState([])
  const [categories, setCategories] = useState([])
  const [loading, setLoading] = useState(true)

  // Tabs: 'catalog' | 'review' | 'suggestions'
  const [activeTab, setActiveTab] = useState('catalog')
  const [suggestions, setSuggestions] = useState([])
  const [loadingSuggestions, setLoadingSuggestions] = useState(false)

  // Import Modal State
  const [importModalOpen, setImportModalOpen] = useState(false)

  // Filters
  const [search, setSearch] = useState('')
  const [selectedCat, setSelectedCat] = useState('')
  const [candidateFilter, setCandidateFilter] = useState('all') // 'all' | 'zero' | 'less_10' | 'less_20' | 'less_50' | 'between_1_9' | 'between_10_19' | 'twenty_plus' | 'custom'
  const [customMax, setCustomMax] = useState('')
  const [sortBy, setSortBy] = useState('default') // 'default' | 'least_candidates' | 'most_candidates' | 'title_asc'
  const [summary, setSummary] = useState(null)

  // Create / Edit Modal
  const [modalOpen, setModalOpen] = useState(false)
  const [editingJob, setEditingJob] = useState(null)
  const [form, setForm] = useState({ name: '', nameAr: '', categoryId: '', description: '', isActive: true, sortOrder: 0 })
  const [saving, setSaving] = useState(false)

  // Confirm delete modal
  const [confirmModal, setConfirmModal] = useState({ open: false, title: '', message: '', action: null })

  const loadData = () => {
    setLoading(true)
    Promise.all([adminApi.listJobs(), adminApi.listCategories()])
      .then(([jobsRes, catsRes]) => {
        const raw = jobsRes.data?.data
        const jobsList = Array.isArray(raw) ? raw : (raw?.jobs || [])
        const summaryData = raw?.summary || null
        setJobs(jobsList)
        if (summaryData) {
          setSummary(summaryData)
        } else {
          let z = 0, l10 = 0, l20 = 0, l50 = 0, tp = 0
          jobsList.forEach(j => {
            const cnt = j.candidateCount || 0
            if (cnt === 0) z++
            if (cnt < 10) l10++
            if (cnt < 20) l20++
            if (cnt < 50) l50++
            if (cnt >= 20) tp++
          })
          setSummary({
            total: jobsList.length,
            zeroCandidates: z,
            lessThan10: l10,
            lessThan20: l20,
            lessThan50: l50,
            twentyPlus: tp
          })
        }
        setCategories(catsRes.data?.data || [])
      })
      .catch(err => {
        showToast(err.response?.data?.message || 'Failed to load jobs', 'error')
      })
      .finally(() => setLoading(false))
  }

  const loadSuggestions = () => {
    setLoadingSuggestions(true)
    adminApi.listJobSuggestions()
      .then((res) => {
        setSuggestions(res.data?.data || [])
      })
      .catch((err) => {
        console.error('Failed to load suggestions:', err)
      })
      .finally(() => setLoadingSuggestions(false))
  }

  useEffect(() => {
    loadData()
    loadSuggestions()
  }, [])

  const handleOpenCreate = () => {
    setEditingJob(null)
    setForm({
      name: '',
      nameAr: '',
      categoryId: categories[0]?._id || '',
      description: '',
      isActive: true,
      sortOrder: jobs.length + 1
    })
    setModalOpen(true)
  }

  const handleOpenEdit = (job) => {
    setEditingJob(job)
    setForm({
      name: job.name || '',
      nameAr: job.nameAr || '',
      categoryId: job.categoryId?._id || job.categoryId || '',
      description: job.description || '',
      isActive: job.isActive !== false,
      sortOrder: job.sortOrder || 0
    })
    setModalOpen(true)
  }

  const handleSubmit = async (e) => {
    e.preventDefault()
    if (!form.nameAr.trim()) {
      showToast(isRtl ? 'يرجى إدخال اسم الوظيفة بالعربية' : 'Arabic job title is required', 'warning')
      return
    }
    if (!form.categoryId) {
      showToast(isRtl ? 'يرجى تحديد القطاع الوظيفي' : 'Category is required', 'warning')
      return
    }

    try {
      setSaving(true)
      const payload = {
        name: form.name.trim() || form.nameAr.trim(),
        nameAr: form.nameAr.trim(),
        categoryId: form.categoryId,
        description: form.description.trim(),
        isActive: form.isActive,
        sortOrder: Number(form.sortOrder) || 0
      }

      if (editingJob) {
        await adminApi.updateJob(editingJob._id, payload)
        showToast(isRtl ? 'تم تحديث المسمى الوظيفي بنجاح' : 'Job title updated', 'success')
      } else {
        await adminApi.createJob(payload)
        showToast(isRtl ? 'تم إضافة المسمى الوظيفي بنجاح' : 'Job title created', 'success')
      }
      setModalOpen(false)
      loadData()
    } catch (err) {
      showToast(err.response?.data?.message || 'Save failed', 'error')
    } finally {
      setSaving(false)
    }
  }

  const handleDelete = (job) => {
    setConfirmModal({
      open: true,
      title: isRtl ? 'حذف المسمى الوظيفي' : 'Delete Job Title',
      message: isRtl
        ? `هل أنت متأكد من حذف "${job.nameAr || job.name}"؟ لن يظهر للمرشحين الجدد في قائمة الاختيار.`
        : `Delete "${job.nameAr || job.name}" from job catalog?`,
      confirmText: isRtl ? 'حذف المسمى' : 'Delete',
      danger: true,
      action: async () => {
        try {
          await adminApi.deleteJob(job._id)
          showToast(isRtl ? 'تم حذف المسمى الوظيفي' : 'Job deleted', 'success')
          loadData()
        } catch (err) {
          showToast(err.response?.data?.message || 'Delete failed', 'error')
        }
      }
    })
  }

  const handleApproveSuggestion = async (sug) => {
    try {
      // Find matching category or fallback to first
      const matchedCat = categories.find(
        (c) =>
          c.name?.toLowerCase() === sug.category?.toLowerCase() ||
          c.nameAr === sug.category
      );
      const catId = matchedCat?._id || categories[0]?._id;

      await adminApi.reviewJobSuggestion(sug._id, {
        status: 'Approved',
        categoryId: catId
      });
      showToast(
        isRtl
          ? 'تمت الموافقة وإضافة المسمى الوظيفي إلى الكتالوج بنجاح'
          : 'Suggestion approved and added to catalog',
        'success'
      );
      loadData();
      loadSuggestions();
    } catch (err) {
      showToast(err.response?.data?.message || 'Approval failed', 'error');
    }
  };

  const handleRejectSuggestion = async (sug) => {
    try {
      await adminApi.reviewJobSuggestion(sug._id, { status: 'Rejected' });
      showToast(isRtl ? 'تم رفض المسمى المقترح' : 'Suggestion rejected', 'info');
      loadSuggestions();
    } catch (err) {
      showToast(err.response?.data?.message || 'Reject failed', 'error');
    }
  };

  // Export to CSV
  const handleExportCSV = () => {
    if (!filteredJobs || filteredJobs.length === 0) {
      showToast(isRtl ? 'لا توجد وظائف لتصديرها' : 'No jobs to export', 'warning');
      return;
    }

    const headers = [
      isRtl ? 'المسمى الوظيفي بالعربية' : 'Job Title (AR)',
      isRtl ? 'المسمى بالإنجليزية' : 'Job Title (EN)',
      isRtl ? 'القطاع' : 'Category',
      isRtl ? 'عدد المرشحين الإجمالي' : 'Total Candidates',
      isRtl ? 'مرشحو الرغبة الأولى' : 'Primary Desired Count',
      isRtl ? 'الحالة' : 'Status'
    ];

    const rows = filteredJobs.map((j) => {
      const catName = isRtl
        ? (j.categoryId?.nameAr || j.categoryId?.name || '')
        : (j.categoryId?.name || j.categoryId?.nameAr || '');
      const statusText = j.isActive !== false ? (isRtl ? 'نشط' : 'Active') : (isRtl ? 'معطّل' : 'Inactive');
      return [
        `"${(j.nameAr || '').replace(/"/g, '""')}"`,
        `"${(j.name || '').replace(/"/g, '""')}"`,
        `"${catName.replace(/"/g, '""')}"`,
        j.candidateCount || 0,
        j.primaryCandidateCount || 0,
        `"${statusText}"`
      ];
    });

    const csvContent = '\uFEFF' + [headers.join(','), ...rows.map((r) => r.join(','))].join('\r\n');
    const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.setAttribute('download', `positions-report-${candidateFilter}-${new Date().toISOString().slice(0, 10)}.csv`);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    URL.revokeObjectURL(url);
    showToast(isRtl ? 'تم تصدير ملف الإكسل بنجاح' : 'Positions exported to CSV', 'success');
  };

  // Filter jobs
  const filteredJobs = jobs.filter(j => {
    const matchesSearch = !search ||
      j.name?.toLowerCase().includes(search.toLowerCase()) ||
      j.nameAr?.includes(search)
    const matchesCat = !selectedCat ||
      (j.categoryId?._id === selectedCat || j.categoryId === selectedCat)

    const count = j.candidateCount || 0
    let matchesCandidateCount = true
    if (candidateFilter === 'zero') {
      matchesCandidateCount = count === 0
    } else if (candidateFilter === 'less_10') {
      matchesCandidateCount = count < 10
    } else if (candidateFilter === 'less_20') {
      matchesCandidateCount = count < 20
    } else if (candidateFilter === 'less_50') {
      matchesCandidateCount = count < 50
    } else if (candidateFilter === 'between_1_9') {
      matchesCandidateCount = count >= 1 && count < 10
    } else if (candidateFilter === 'between_10_19') {
      matchesCandidateCount = count >= 10 && count < 20
    } else if (candidateFilter === 'twenty_plus') {
      matchesCandidateCount = count >= 20
    } else if (candidateFilter === 'custom' && customMax !== '') {
      matchesCandidateCount = count <= Number(customMax)
    }

    return matchesSearch && matchesCat && matchesCandidateCount
  })

  // Sort jobs
  if (sortBy === 'least_candidates') {
    filteredJobs.sort((a, b) => (a.candidateCount || 0) - (b.candidateCount || 0) || (a.nameAr || '').localeCompare(b.nameAr || ''))
  } else if (sortBy === 'most_candidates') {
    filteredJobs.sort((a, b) => (b.candidateCount || 0) - (a.candidateCount || 0) || (a.nameAr || '').localeCompare(b.nameAr || ''))
  } else if (sortBy === 'title_asc') {
    filteredJobs.sort((a, b) => (a.nameAr || '').localeCompare(b.nameAr || ''))
  }

  const pendingSuggestionsCount = suggestions.filter(s => s.status === 'Pending').length;

  return (
    <div style={{ padding: 'clamp(1.25rem, 3vw, 2rem) 0 3rem', background: 'var(--bg-page)', minHeight: '85vh' }}>
      <div className="container">
        {/* Header */}
        <div style={{ display: 'flex', flexWrap: 'wrap', justifyContent: 'space-between', alignItems: 'center', gap: '1rem', marginBottom: '1.5rem' }}>
          <div>
            <h1 style={{ fontSize: 'clamp(1.25rem, 3vw, 1.625rem)', fontWeight: 800, color: 'var(--slate-900)' }}>
              {activeTab === 'review' ? 'مراجعة المسميات الوظيفية' : (isRtl ? 'كتالوج المسميات الوظيفية المعتمدة' : 'Standard Job Titles Catalog')}
            </h1>
            <p style={{ color: 'var(--slate-500)', fontSize: '0.9375rem', marginTop: '0.25rem' }}>
              {activeTab === 'review' ? 'إضافة ومراجعة واعتماد المسميات الوظيفية بصورة مستقلة.' : (isRtl ? 'إدارة المسميات واستخراجها من الملفات وفحص عدم التكرار' : 'Manage standard job titles, extract from documents, and prevent duplicates')}
            </p>
          </div>

          <div style={{ display: 'flex', gap: '0.625rem', flexWrap: 'wrap' }}>
            <button
              onClick={() => setActiveTab('review')}
              className="btn btn-outline"
              style={{ fontWeight: 700, borderColor: 'var(--primary)', color: 'var(--primary)', background: '#fff' }}
            >
              <FileSpreadsheet size={18} />
              استيراد مسميات للمراجعة
            </button>
            <button onClick={() => setActiveTab('review')} className="btn btn-primary" style={{ fontWeight: 600 }}>
              <Plus size={18} />
              إضافة مسميات للمراجعة
            </button>
          </div>
        </div>

        {/* Navigation Tabs */}
        <div style={{ display: 'flex', gap: '0.5rem', marginBottom: '1.25rem', borderBottom: '1px solid var(--border)', paddingBottom: '0.5rem' }}>
          <button
            onClick={() => setActiveTab('catalog')}
            className={`btn ${activeTab === 'catalog' ? 'btn-primary' : 'btn-outline'}`}
            style={{ fontSize: '0.875rem', fontWeight: 700 }}
          >
            <Briefcase size={16} />
            {isRtl ? `كتالوج المسميات المعتمدة (${jobs.length})` : `Approved Catalog (${jobs.length})`}
          </button>
          <button
            onClick={() => setActiveTab('review')}
            className={`btn ${activeTab === 'review' ? 'btn-primary' : 'btn-outline'}`}
            style={{ fontSize: '0.875rem', fontWeight: 700 }}
          >
            <FileSpreadsheet size={16} />
            قائمة مراجعة المسميات
          </button>
          <button
            onClick={() => {
              setActiveTab('suggestions');
              loadSuggestions();
            }}
            className={`btn ${activeTab === 'suggestions' ? 'btn-primary' : 'btn-outline'}`}
            style={{ fontSize: '0.875rem', fontWeight: 700, position: 'relative' }}
          >
            <Building2 size={16} />
            {isRtl ? 'طلبات مسميات الشركات' : 'Company Title Requests'}
            {pendingSuggestionsCount > 0 && (
              <span
                style={{
                  background: '#ef4444',
                  color: '#fff',
                  fontSize: '0.7rem',
                  fontWeight: 800,
                  borderRadius: '999px',
                  padding: '0.1rem 0.45rem',
                  marginRight: isRtl ? '0.35rem' : 0,
                  marginLeft: !isRtl ? '0.35rem' : 0
                }}
              >
                {pendingSuggestionsCount} {isRtl ? 'جديد' : 'new'}
              </span>
            )}
          </button>
        </div>

        {/* CATALOG TAB */}
        {activeTab === 'catalog' && (
          <>
            {/* KPI Summary Cards */}
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(180px, 1fr))', gap: '0.875rem', marginBottom: '1.25rem' }}>
              {/* All */}
              <div
                onClick={() => setCandidateFilter('all')}
                style={{
                  background: candidateFilter === 'all' ? '#eff6ff' : '#fff',
                  border: `2px solid ${candidateFilter === 'all' ? '#2563eb' : '#e2e8f0'}`,
                  borderRadius: '12px',
                  padding: '0.875rem 1rem',
                  cursor: 'pointer',
                  transition: 'all 0.15s ease',
                  boxShadow: candidateFilter === 'all' ? '0 4px 12px rgba(37,99,235,0.15)' : 'none'
                }}
              >
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                  <span style={{ fontSize: '0.8125rem', color: '#64748b', fontWeight: 600 }}>
                    {isRtl ? 'إجمالي المسميات' : 'Total Positions'}
                  </span>
                  <Briefcase size={16} color="#64748b" />
                </div>
                <div style={{ fontSize: '1.5rem', fontWeight: 800, color: '#1e293b', marginTop: '0.35rem' }}>
                  {summary ? summary.total : jobs.length}
                </div>
                <span style={{ fontSize: '0.72rem', color: '#64748b' }}>
                  {isRtl ? 'عرض كل الكتالوج' : 'View all'}
                </span>
              </div>

              {/* Zero Candidates (Empty) */}
              <div
                onClick={() => setCandidateFilter('zero')}
                style={{
                  background: candidateFilter === 'zero' ? '#fef2f2' : '#fff',
                  border: `2px solid ${candidateFilter === 'zero' ? '#ef4444' : '#fee2e2'}`,
                  borderRadius: '12px',
                  padding: '0.875rem 1rem',
                  cursor: 'pointer',
                  transition: 'all 0.15s ease',
                  boxShadow: candidateFilter === 'zero' ? '0 4px 12px rgba(239,68,68,0.2)' : 'none'
                }}
              >
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                  <span style={{ fontSize: '0.8125rem', color: '#b91c1c', fontWeight: 700 }}>
                    {isRtl ? 'بدون أي مرشح (0)' : '0 Candidates (Empty)'}
                  </span>
                  <AlertTriangle size={16} color="#ef4444" />
                </div>
                <div style={{ fontSize: '1.5rem', fontWeight: 800, color: '#dc2626', marginTop: '0.35rem' }}>
                  {summary ? summary.zeroCandidates : jobs.filter(j => (j.candidateCount || 0) === 0).length}
                </div>
                <span style={{ fontSize: '0.72rem', color: '#ef4444', fontWeight: 700 }}>
                  {isRtl ? '⚠️ مسميات شاغرة تحتاج مرشحين' : '⚠️ Vacant positions'}
                </span>
              </div>

              {/* Less than 10 */}
              <div
                onClick={() => setCandidateFilter('less_10')}
                style={{
                  background: candidateFilter === 'less_10' ? '#fffbeb' : '#fff',
                  border: `2px solid ${candidateFilter === 'less_10' ? '#f59e0b' : '#fef3c7'}`,
                  borderRadius: '12px',
                  padding: '0.875rem 1rem',
                  cursor: 'pointer',
                  transition: 'all 0.15s ease',
                  boxShadow: candidateFilter === 'less_10' ? '0 4px 12px rgba(245,158,11,0.2)' : 'none'
                }}
              >
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                  <span style={{ fontSize: '0.8125rem', color: '#b45309', fontWeight: 700 }}>
                    {isRtl ? 'أقل من 10 مرشحين' : '< 10 Candidates'}
                  </span>
                  <Users size={16} color="#f59e0b" />
                </div>
                <div style={{ fontSize: '1.5rem', fontWeight: 800, color: '#d97706', marginTop: '0.35rem' }}>
                  {summary ? summary.lessThan10 : jobs.filter(j => (j.candidateCount || 0) < 10).length}
                </div>
                <span style={{ fontSize: '0.72rem', color: '#d97706', fontWeight: 600 }}>
                  {isRtl ? 'إقبال شحيح (0 إلى 9)' : 'Low supply (0 - 9)'}
                </span>
              </div>

              {/* Less than 20 */}
              <div
                onClick={() => setCandidateFilter('less_20')}
                style={{
                  background: candidateFilter === 'less_20' ? '#f0f9ff' : '#fff',
                  border: `2px solid ${candidateFilter === 'less_20' ? '#0284c7' : '#e0f2fe'}`,
                  borderRadius: '12px',
                  padding: '0.875rem 1rem',
                  cursor: 'pointer',
                  transition: 'all 0.15s ease',
                  boxShadow: candidateFilter === 'less_20' ? '0 4px 12px rgba(2,132,199,0.2)' : 'none'
                }}
              >
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                  <span style={{ fontSize: '0.8125rem', color: '#0369a1', fontWeight: 700 }}>
                    {isRtl ? 'أقل من 20 مرشح' : '< 20 Candidates'}
                  </span>
                  <Users size={16} color="#0284c7" />
                </div>
                <div style={{ fontSize: '1.5rem', fontWeight: 800, color: '#0284c7', marginTop: '0.35rem' }}>
                  {summary ? summary.lessThan20 : jobs.filter(j => (j.candidateCount || 0) < 20).length}
                </div>
                <span style={{ fontSize: '0.72rem', color: '#0284c7', fontWeight: 600 }}>
                  {isRtl ? 'شحيحة ومتوسطة (< 20)' : 'Under 20 candidates'}
                </span>
              </div>

              {/* 20+ Good Supply */}
              <div
                onClick={() => setCandidateFilter('twenty_plus')}
                style={{
                  background: candidateFilter === 'twenty_plus' ? '#f0fdf4' : '#fff',
                  border: `2px solid ${candidateFilter === 'twenty_plus' ? '#10b981' : '#dcfce7'}`,
                  borderRadius: '12px',
                  padding: '0.875rem 1rem',
                  cursor: 'pointer',
                  transition: 'all 0.15s ease',
                  boxShadow: candidateFilter === 'twenty_plus' ? '0 4px 12px rgba(16,185,129,0.2)' : 'none'
                }}
              >
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                  <span style={{ fontSize: '0.8125rem', color: '#15803d', fontWeight: 700 }}>
                    {isRtl ? '20 مرشحاً فأكثر' : '20+ Candidates'}
                  </span>
                  <CheckCircle size={16} color="#10b981" />
                </div>
                <div style={{ fontSize: '1.5rem', fontWeight: 800, color: '#16a34a', marginTop: '0.35rem' }}>
                  {summary ? summary.twentyPlus : jobs.filter(j => (j.candidateCount || 0) >= 20).length}
                </div>
                <span style={{ fontSize: '0.72rem', color: '#16a34a', fontWeight: 600 }}>
                  {isRtl ? 'قاعدة مرشحين جيدة' : 'Well populated'}
                </span>
              </div>
            </div>

            {/* Filter Bar */}
            <div className="card card-responsive" style={{ marginBottom: '1.25rem' }}>
              <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(min(100%, 200px), 1fr))', gap: '0.875rem', alignItems: 'flex-end' }}>
                {/* Search */}
                <div>
                  <label className="form-label" style={{ fontSize: '0.8125rem', fontWeight: 600 }}>
                    {isRtl ? 'بحث باسم الوظيفة' : 'Search Job'}
                  </label>
                  <input
                    type="text"
                    className="form-control"
                    placeholder={isRtl ? 'عربي / English...' : 'Search title...'}
                    value={search}
                    onChange={(e) => setSearch(e.target.value)}
                  />
                </div>

                {/* Category */}
                <div>
                  <label className="form-label" style={{ fontSize: '0.8125rem', fontWeight: 600 }}>
                    {isRtl ? 'القطاع الوظيفي' : 'Category'}
                  </label>
                  <select className="form-control" value={selectedCat} onChange={(e) => setSelectedCat(e.target.value)}>
                    <option value="">{isRtl ? 'جميع القطاعات الوظيفية' : 'All Categories'}</option>
                    {categories.map((c) => (
                      <option key={c._id} value={c._id}>
                        {isRtl ? (c.nameAr || c.name) : (c.name || c.nameAr)}
                      </option>
                    ))}
                  </select>
                </div>

                {/* Candidate Count Filter */}
                <div>
                  <label className="form-label" style={{ fontSize: '0.8125rem', fontWeight: 700, color: '#1e40af' }}>
                    {isRtl ? 'تصفية حسب عدد المرشحين' : 'Candidates Count Filter'}
                  </label>
                  <select
                    className="form-control"
                    value={candidateFilter}
                    onChange={(e) => setCandidateFilter(e.target.value)}
                    style={{ fontWeight: 600, borderColor: candidateFilter !== 'all' ? '#2563eb' : undefined }}
                  >
                    <option value="all">{isRtl ? 'جميع المسميات (الكل)' : 'All Positions'}</option>
                    <option value="zero">{isRtl ? '🛑 بدون أي مرشحين (0 مرشح - شاغرة)' : '🛑 0 Candidates (Empty)'}</option>
                    <option value="less_10">{isRtl ? '⚠️ أقل من 10 مرشحين (< 10 شحيحة)' : '⚠️ Less than 10 (< 10)'}</option>
                    <option value="less_20">{isRtl ? '📊 أقل من 20 مرشح (< 20)' : '📊 Less than 20 (< 20)'}</option>
                    <option value="less_50">{isRtl ? '📈 أقل من 50 مرشح (< 50)' : '📈 Less than 50 (< 50)'}</option>
                    <option value="between_1_9">{isRtl ? '🔹 بين 1 إلى 9 مرشحين' : '🔹 1 to 9 candidates'}</option>
                    <option value="between_10_19">{isRtl ? '🔹 بين 10 إلى 19 مرشحاً' : '🔹 10 to 19 candidates'}</option>
                    <option value="twenty_plus">{isRtl ? '✅ 20 مرشحاً فأكثر (20+ متوفرة)' : '✅ 20+ Candidates'}</option>
                    <option value="custom">{isRtl ? '⚙️ تحديد حد أقصى مخصص...' : '⚙️ Custom max...'}</option>
                  </select>
                </div>

                {/* Custom Max Input if chosen */}
                {candidateFilter === 'custom' && (
                  <div>
                    <label className="form-label" style={{ fontSize: '0.8125rem', fontWeight: 600 }}>
                      {isRtl ? 'الحد الأقصى للمرشحين' : 'Max Candidates'}
                    </label>
                    <input
                      type="number"
                      min="0"
                      className="form-control"
                      placeholder={isRtl ? 'مثال: 15' : 'e.g. 15'}
                      value={customMax}
                      onChange={(e) => setCustomMax(e.target.value)}
                    />
                  </div>
                )}

                {/* Sort Order */}
                <div>
                  <label className="form-label" style={{ fontSize: '0.8125rem', fontWeight: 600 }}>
                    {isRtl ? 'ترتيب النتائج' : 'Sort By'}
                  </label>
                  <select className="form-control" value={sortBy} onChange={(e) => setSortBy(e.target.value)}>
                    <option value="default">{isRtl ? 'الترتيب الافتراضي' : 'Default'}</option>
                    <option value="least_candidates">{isRtl ? 'الأقل مرشحين أولاً (0 تصاعدياً)' : 'Least Candidates First'}</option>
                    <option value="most_candidates">{isRtl ? 'الأكثر مرشحين أولاً (تنازلياً)' : 'Most Candidates First'}</option>
                    <option value="title_asc">{isRtl ? 'أبجدياً (أ - ي)' : 'Alphabetical'}</option>
                  </select>
                </div>

                {/* Export Button */}
                <div>
                  <button
                    type="button"
                    onClick={handleExportCSV}
                    className="btn btn-outline"
                    style={{ width: '100%', fontWeight: 700, borderColor: '#0284c7', color: '#0284c7', background: '#fff' }}
                    title={isRtl ? 'تصدير القائمة المعروضة كملف Excel / CSV' : 'Export current list to CSV'}
                  >
                    <Download size={16} />
                    {isRtl ? 'تصدير (Excel / CSV)' : 'Export CSV'}
                  </button>
                </div>
              </div>

              {/* Filter feedback line */}
              {(candidateFilter !== 'all' || search || selectedCat) && (
                <div style={{ marginTop: '0.875rem', paddingTop: '0.75rem', borderTop: '1px solid var(--border)', display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: '0.5rem' }}>
                  <span style={{ fontSize: '0.85rem', color: '#1e40af', fontWeight: 600 }}>
                    {isRtl ? `يتم الآن عرض ${filteredJobs.length} مسمى وظيفي من إجمالي ${jobs.length}` : `Showing ${filteredJobs.length} of ${jobs.length} positions`}
                    {candidateFilter === 'zero' && (isRtl ? ' (المسميات التي ليس بها أي مرشح تماماً)' : ' (Positions with 0 candidates)')}
                    {candidateFilter === 'less_10' && (isRtl ? ' (المسميات التي بها أقل من 10 مرشحين)' : ' (Positions with < 10 candidates)')}
                    {candidateFilter === 'less_20' && (isRtl ? ' (المسميات التي بها أقل من 20 مرشحاً)' : ' (Positions with < 20 candidates)')}
                    {candidateFilter === 'less_50' && (isRtl ? ' (المسميات التي بها أقل من 50 مرشحاً)' : ' (Positions with < 50 candidates)')}
                  </span>
                  <button
                    onClick={() => {
                      setSearch('')
                      setSelectedCat('')
                      setCandidateFilter('all')
                      setCustomMax('')
                      setSortBy('default')
                    }}
                    className="btn btn-sm"
                    style={{ background: '#f1f5f9', color: '#475569', fontSize: '0.75rem', fontWeight: 600 }}
                  >
                    <X size={12} />
                    {isRtl ? 'إعادة ضبط كل الفلاتر' : 'Reset All Filters'}
                  </button>
                </div>
              )}
            </div>

            {/* Jobs List Table */}
            <div className="card" style={{ padding: 0, overflow: 'hidden' }}>
              {loading ? (
                <div style={{ padding: '3rem' }}>
                  <LoadingSpinner />
                </div>
              ) : filteredJobs.length === 0 ? (
                <EmptyState
                  icon={Briefcase}
                  title={isRtl ? 'لا توجد وظائف مطابقة للفلاتر المحددة' : 'No jobs found matching criteria'}
                  description={isRtl ? 'جرّب تغيير خيارات تصفية عدد المرشحين أو البحث.' : 'Try adjusting the candidate count filter or search term.'}
                />
              ) : (
                <div className="table-responsive">
                  <table className="data-table" style={{ width: '100%', minWidth: '750px', borderCollapse: 'collapse', textAlign: isRtl ? 'right' : 'left', fontSize: '0.875rem' }}>
                    <thead>
                      <tr style={{ background: 'var(--slate-50)', borderBottom: '1px solid var(--border)' }}>
                        <th style={{ padding: '0.875rem 1rem', fontWeight: 700, color: 'var(--slate-600)' }}>
                          {isRtl ? 'المسمى الوظيفي (عربي)' : 'Arabic Title'}
                        </th>
                        <th style={{ padding: '0.875rem 1rem', fontWeight: 700, color: 'var(--slate-600)' }}>
                          {isRtl ? 'المسمى (إنجليزي)' : 'English Title'}
                        </th>
                        <th style={{ padding: '0.875rem 1rem', fontWeight: 700, color: 'var(--slate-600)' }}>
                          {isRtl ? 'القطاع' : 'Category'}
                        </th>
                        <th style={{ padding: '0.875rem 1rem', fontWeight: 700, color: '#1e40af' }}>
                          <div style={{ display: 'flex', alignItems: 'center', gap: '0.35rem' }}>
                            <Users size={15} />
                            {isRtl ? 'عدد المرشحين' : 'Candidates'}
                          </div>
                        </th>
                        <th style={{ padding: '0.875rem 1rem', fontWeight: 700, color: 'var(--slate-600)' }}>
                          {isRtl ? 'الحالة' : 'Status'}
                        </th>
                        <th style={{ padding: '0.875rem 1rem', fontWeight: 700, color: 'var(--slate-600)', textAlign: 'center' }}>
                          {isRtl ? 'الإجراءات' : 'Actions'}
                        </th>
                      </tr>
                    </thead>
                    <tbody>
                      {filteredJobs.map((job) => (
                        <tr key={job._id} style={{ borderBottom: '1px solid var(--border)' }}>
                          <td style={{ padding: '0.875rem 1rem', fontWeight: 700, color: 'var(--slate-900)' }}>
                            {job.nameAr}
                          </td>

                          <td style={{ padding: '0.875rem 1rem', color: 'var(--slate-700)' }}>
                            {job.name}
                          </td>

                          <td style={{ padding: '0.875rem 1rem' }}>
                            <span style={{ background: 'var(--slate-100)', color: 'var(--slate-700)', padding: '0.2rem 0.5rem', borderRadius: 'var(--radius-sm)', fontSize: '0.8125rem' }}>
                              {isRtl ? (job.categoryId?.nameAr || job.categoryId?.name || '—') : (job.categoryId?.name || job.categoryId?.nameAr || '—')}
                            </span>
                          </td>

                          {/* Candidate Count Badge */}
                          <td style={{ padding: '0.875rem 1rem' }}>
                            {(() => {
                              const count = job.candidateCount || 0;
                              const primary = job.primaryCandidateCount || 0;

                              if (count === 0) {
                                return (
                                  <span
                                    style={{
                                      display: 'inline-flex',
                                      alignItems: 'center',
                                      gap: '0.35rem',
                                      padding: '0.25rem 0.65rem',
                                      borderRadius: '999px',
                                      fontSize: '0.78rem',
                                      fontWeight: 800,
                                      background: '#fee2e2',
                                      color: '#991b1b',
                                      border: '1px solid #fca5a5'
                                    }}
                                    title={isRtl ? 'لا يوجد أي مرشح مسجل في هذه الوظيفة' : 'No candidates registered'}
                                  >
                                    <AlertTriangle size={13} />
                                    {isRtl ? '0 مرشح (شاغرة)' : '0 Candidates (Empty)'}
                                  </span>
                                );
                              }
                              if (count < 10) {
                                return (
                                  <div style={{ display: 'inline-flex', flexDirection: 'column', gap: '0.15rem' }}>
                                    <span
                                      style={{
                                        display: 'inline-flex',
                                        alignItems: 'center',
                                        gap: '0.35rem',
                                        padding: '0.25rem 0.65rem',
                                        borderRadius: '999px',
                                        fontSize: '0.78rem',
                                        fontWeight: 700,
                                        background: '#ffedd5',
                                        color: '#9a3412',
                                        border: '1px solid #fdba74'
                                      }}
                                    >
                                      <Users size={13} />
                                      {isRtl ? `${count} مرشحين (شحيحة)` : `${count} (Low)`}
                                    </span>
                                    {primary !== count && (
                                      <span style={{ fontSize: '0.68rem', color: 'var(--slate-400)', marginRight: isRtl ? '0.35rem' : 0, marginLeft: !isRtl ? '0.35rem' : 0 }}>
                                        {isRtl ? `(${primary} رغبة أولى)` : `(${primary} 1st choice)`}
                                      </span>
                                    )}
                                  </div>
                                );
                              }
                              if (count < 20) {
                                return (
                                  <div style={{ display: 'inline-flex', flexDirection: 'column', gap: '0.15rem' }}>
                                    <span
                                      style={{
                                        display: 'inline-flex',
                                        alignItems: 'center',
                                        gap: '0.35rem',
                                        padding: '0.25rem 0.65rem',
                                        borderRadius: '999px',
                                        fontSize: '0.78rem',
                                        fontWeight: 700,
                                        background: '#e0f2fe',
                                        color: '#0369a1',
                                        border: '1px solid #7dd3fc'
                                      }}
                                    >
                                      <Users size={13} />
                                      {isRtl ? `${count} مرشحاً` : `${count} Candidates`}
                                    </span>
                                    {primary !== count && (
                                      <span style={{ fontSize: '0.68rem', color: 'var(--slate-400)', marginRight: isRtl ? '0.35rem' : 0, marginLeft: !isRtl ? '0.35rem' : 0 }}>
                                        {isRtl ? `(${primary} رغبة أولى)` : `(${primary} 1st choice)`}
                                      </span>
                                    )}
                                  </div>
                                );
                              }
                              return (
                                <div style={{ display: 'inline-flex', flexDirection: 'column', gap: '0.15rem' }}>
                                  <span
                                    style={{
                                      display: 'inline-flex',
                                      alignItems: 'center',
                                      gap: '0.35rem',
                                      padding: '0.25rem 0.65rem',
                                      borderRadius: '999px',
                                      fontSize: '0.78rem',
                                      fontWeight: 700,
                                      background: '#dcfce7',
                                      color: '#15803d',
                                      border: '1px solid #86efac'
                                    }}
                                  >
                                    <CheckCircle size={13} />
                                    {isRtl ? `${count} مرشحاً` : `${count} Candidates`}
                                  </span>
                                  {primary !== count && (
                                    <span style={{ fontSize: '0.68rem', color: 'var(--slate-400)', marginRight: isRtl ? '0.35rem' : 0, marginLeft: !isRtl ? '0.35rem' : 0 }}>
                                      {isRtl ? `(${primary} رغبة أولى)` : `(${primary} 1st choice)`}
                                    </span>
                                  )}
                                </div>
                              );
                            })()}
                          </td>

                          <td style={{ padding: '0.875rem 1rem' }}>
                            {job.isActive !== false ? (
                              <span style={{ display: 'inline-flex', alignItems: 'center', gap: '0.25rem', color: 'var(--emerald)', fontWeight: 700, fontSize: '0.8125rem' }}>
                                <CheckCircle size={14} />
                                {isRtl ? 'مفعّل' : 'Active'}
                              </span>
                            ) : (
                              <span style={{ display: 'inline-flex', alignItems: 'center', gap: '0.25rem', color: 'var(--slate-400)', fontWeight: 700, fontSize: '0.8125rem' }}>
                                <XCircle size={14} />
                                {isRtl ? 'معطّل' : 'Inactive'}
                              </span>
                            )}
                          </td>

                          <td style={{ padding: '0.875rem 1rem', textAlign: 'center' }}>
                            <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '0.375rem', flexWrap: 'wrap' }}>
                              <Link
                                to={`/admin/candidates?jobId=${job._id}`}
                                className="btn"
                                style={{
                                  padding: '0.32rem 0.6rem',
                                  background: '#eff6ff',
                                  color: '#1d4ed8',
                                  border: '1px solid #bfdbfe',
                                  fontSize: '0.75rem',
                                  fontWeight: 700,
                                  display: 'inline-flex',
                                  alignItems: 'center',
                                  gap: '0.3rem'
                                }}
                                title={isRtl ? 'عرض المرشحين المسجلين في هذا المسمى' : 'View candidates'}
                              >
                                <Users size={13} />
                                {isRtl ? 'المرشحون' : 'Candidates'}
                              </Link>

                              <button
                                onClick={() => handleOpenEdit(job)}
                                className="btn"
                                style={{ padding: '0.35rem', background: 'var(--slate-100)', color: 'var(--slate-700)' }}
                                title={isRtl ? 'تعديل' : 'Edit'}
                              >
                                <Edit size={15} />
                              </button>

                              <button
                                onClick={() => handleDelete(job)}
                                className="btn"
                                style={{ padding: '0.35rem', background: 'var(--rose-light)', color: 'var(--rose)' }}
                                title={isRtl ? 'حذف' : 'Delete'}
                              >
                                <Trash2 size={15} />
                              </button>
                            </div>
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              )}
            </div>
      </>
    )}

    {activeTab === 'review' && (
      <JobTitleReviewWorkspace
        categories={categories}
        onCatalogChanged={loadData}
      />
    )}

    {/* SUGGESTIONS TAB */}
    {activeTab === 'suggestions' && (
      <div className="card" style={{ padding: 0, overflow: 'hidden' }}>
        {loadingSuggestions ? (
          <div style={{ padding: '3rem' }}>
            <LoadingSpinner />
          </div>
        ) : suggestions.length === 0 ? (
          <EmptyState
            icon={Building2}
            title={isRtl ? 'لا توجد طلبات مسميات من الشركات' : 'No company title requests'}
            description={isRtl ? 'عندما تطلب أي شركة إضافة مسمى وظيفي جديد، سيظهر هنا لمراجعته واعتماده وإدراجه في الكتالوج.' : 'When companies suggest new titles, they will appear here for review and catalog addition.'}
          />
        ) : (
          <div className="table-responsive">
            <table className="data-table" style={{ width: '100%', minWidth: '700px', borderCollapse: 'collapse', textAlign: isRtl ? 'right' : 'left', fontSize: '0.875rem' }}>
              <thead>
                <tr style={{ background: 'var(--slate-50)', borderBottom: '1px solid var(--border)' }}>
                  <th style={{ padding: '0.875rem 1rem', fontWeight: 700 }}>{isRtl ? 'المسمى المقترح' : 'Proposed Title'}</th>
                  <th style={{ padding: '0.875rem 1rem', fontWeight: 700 }}>{isRtl ? 'الشركة مقدمة الطلب' : 'Company'}</th>
                  <th style={{ padding: '0.875rem 1rem', fontWeight: 700 }}>{isRtl ? 'القطاع المقترح' : 'Category'}</th>
                  <th style={{ padding: '0.875rem 1rem', fontWeight: 700 }}>{isRtl ? 'ملاحظات' : 'Notes'}</th>
                  <th style={{ padding: '0.875rem 1rem', fontWeight: 700 }}>{isRtl ? 'الحالة' : 'Status'}</th>
                  <th style={{ padding: '0.875rem 1rem', fontWeight: 700, textAlign: 'center' }}>{isRtl ? 'الإجراء' : 'Actions'}</th>
                </tr>
              </thead>
              <tbody>
                {suggestions.map((sug) => (
                  <tr key={sug._id} style={{ borderBottom: '1px solid var(--border)' }}>
                    <td style={{ padding: '0.875rem 1rem', fontWeight: 700 }}>{sug.proposedTitle}</td>
                    <td style={{ padding: '0.875rem 1rem' }}>
                      <div style={{ fontWeight: 600 }}>{sug.companyId?.name || sug.companyId?.nameAr || '—'}</div>
                      <div style={{ fontSize: '0.75rem', color: 'var(--slate-400)' }}>{sug.companyId?.contactPhone || sug.companyId?.email || ''}</div>
                    </td>
                    <td style={{ padding: '0.875rem 1rem' }}>{sug.category || '—'}</td>
                    <td style={{ padding: '0.875rem 1rem', fontSize: '0.8125rem', color: 'var(--slate-600)' }}>{sug.notes || '—'}</td>
                    <td style={{ padding: '0.875rem 1rem' }}>
                      {sug.status === 'Approved' && (
                        <span style={{ color: '#16a34a', fontWeight: 700, background: '#dcfce7', padding: '0.2rem 0.5rem', borderRadius: '4px', fontSize: '0.75rem' }}>
                          {isRtl ? 'تمت الموافقة' : 'Approved'}
                        </span>
                      )}
                      {sug.status === 'Rejected' && (
                        <span style={{ color: '#ef4444', fontWeight: 700, background: '#fee2e2', padding: '0.2rem 0.5rem', borderRadius: '4px', fontSize: '0.75rem' }}>
                          {isRtl ? 'مرفوض' : 'Rejected'}
                        </span>
                      )}
                      {sug.status === 'Pending' && (
                        <span style={{ color: '#ea580c', fontWeight: 700, background: '#ffedd5', padding: '0.2rem 0.5rem', borderRadius: '4px', fontSize: '0.75rem' }}>
                          {isRtl ? 'قيد المراجعة' : 'Pending'}
                        </span>
                      )}
                    </td>
                    <td style={{ padding: '0.875rem 1rem', textAlign: 'center' }}>
                      {sug.status === 'Pending' ? (
                        <div style={{ display: 'flex', gap: '0.35rem', justifyContent: 'center' }}>
                          <button
                            onClick={() => handleApproveSuggestion(sug)}
                            className="btn btn-primary"
                            style={{ padding: '0.3rem 0.6rem', fontSize: '0.75rem', fontWeight: 700 }}
                          >
                            <Check size={13} /> {isRtl ? 'قبول وإضافة' : 'Approve & Add'}
                          </button>
                          <button
                            onClick={() => handleRejectSuggestion(sug)}
                            className="btn btn-outline"
                            style={{ padding: '0.3rem 0.6rem', fontSize: '0.75rem', color: '#ef4444', borderColor: '#fca5a5' }}
                          >
                            {isRtl ? 'رفض' : 'Reject'}
                          </button>
                        </div>
                      ) : (
                        <span style={{ color: 'var(--slate-400)', fontSize: '0.8rem' }}>—</span>
                      )}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>
    )}

      {/* Create / Edit Modal */}
      {modalOpen && (
        <div className="modal-overlay" style={{ position: 'fixed', inset: 0, background: 'rgba(0,0,0,0.5)', display: 'flex', alignItems: 'center', justifyContent: 'center', zIndex: 1000, padding: '1rem' }}>
          <div className="card card-responsive modal-content" style={{ maxWidth: 520, width: '100%', padding: 'clamp(1.25rem, 4vw, 1.75rem)' }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1.25rem' }}>
              <h2 style={{ fontSize: '1.25rem', fontWeight: 800, color: 'var(--slate-900)', margin: 0 }}>
                {editingJob
                  ? (isRtl ? 'تعديل مسمى وظيفي' : 'Edit Job Title')
                  : (isRtl ? 'إضافة مسمى وظيفي جديد' : 'New Standard Job Title')}
              </h2>
              <button
                onClick={() => setModalOpen(false)}
                style={{ background: 'none', border: 'none', cursor: 'pointer', color: 'var(--slate-400)' }}
              >
                <X size={20} />
              </button>
            </div>

            <form onSubmit={handleSubmit}>
              <div className="form-group">
                <label className="form-label">{isRtl ? 'المسمى الوظيفي بالعربية *' : 'Job Title (Arabic) *'}</label>
                <input
                  type="text"
                  className="form-control"
                  placeholder={isRtl ? 'مثال: فني تشغيل ماكينات CNC' : 'e.g. CNC Machine Operator'}
                  value={form.nameAr}
                  onChange={(e) => setForm(prev => ({ ...prev, nameAr: e.target.value }))}
                  required
                />
              </div>

              <div className="form-group">
                <label className="form-label">{isRtl ? 'المسمى الوظيفي بالإنجليزية' : 'Job Title (English)'}</label>
                <input
                  type="text"
                  className="form-control"
                  placeholder="e.g. CNC Operator"
                  value={form.name}
                  onChange={(e) => setForm(prev => ({ ...prev, name: e.target.value }))}
                />
              </div>

              <div className="form-group">
                <label className="form-label">{isRtl ? 'القطاع الوظيفي التابع له *' : 'Category *'}</label>
                <select
                  className="form-control"
                  value={form.categoryId}
                  onChange={(e) => setForm(prev => ({ ...prev, categoryId: e.target.value }))}
                  required
                >
                  <option value="">{isRtl ? 'اختر القطاع' : 'Select Category'}</option>
                  {categories.map((c) => (
                    <option key={c._id} value={c._id}>
                      {isRtl ? (c.nameAr || c.name) : (c.name || c.nameAr)}
                    </option>
                  ))}
                </select>
              </div>

              <div className="form-group">
                <label className="form-label">{isRtl ? 'وصف / متطلبات شائعة (اختياري)' : 'Description (optional)'}</label>
                <textarea
                  className="form-control"
                  rows={2}
                  value={form.description}
                  onChange={(e) => setForm(prev => ({ ...prev, description: e.target.value }))}
                />
              </div>

              <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem', marginBottom: '1.5rem' }}>
                <input
                  type="checkbox"
                  id="isActiveJob"
                  checked={form.isActive}
                  onChange={(e) => setForm(prev => ({ ...prev, isActive: e.target.checked }))}
                />
                <label htmlFor="isActiveJob" style={{ fontSize: '0.9375rem', fontWeight: 600, color: 'var(--slate-800)', cursor: 'pointer' }}>
                  {isRtl ? 'مفعّل ويظهر في استمارة تسجيل المرشحين' : 'Active and selectable by candidates'}
                </label>
              </div>

              <div style={{ display: 'flex', justifyContent: 'flex-end', gap: '0.75rem' }}>
                <button
                  type="button"
                  className="btn"
                  style={{ background: 'var(--slate-100)', color: 'var(--slate-700)' }}
                  onClick={() => setModalOpen(false)}
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

      <ConfirmModal
        isOpen={confirmModal.open}
        title={confirmModal.title}
        message={confirmModal.message}
        confirmText={confirmModal.confirmText}
        isDanger={confirmModal.danger}
        onConfirm={confirmModal.action}
        onClose={() => setConfirmModal(prev => ({ ...prev, open: false }))}
      />

      <JobTitleImportModal
        isOpen={importModalOpen}
        onClose={() => setImportModalOpen(false)}
        categories={categories}
        onFinished={() => {
          loadData();
          loadSuggestions();
        }}
      />
      </div>
    </div>
  )
}
