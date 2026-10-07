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
  Clock
} from 'lucide-react'
import LoadingSpinner from '../../components/ui/LoadingSpinner'
import ConfirmModal from '../../components/modals/ConfirmModal'
import EmptyState from '../../components/ui/EmptyState'
import JobTitleImportModal from '../../components/modals/JobTitleImportModal'

export default function AdminJobs() {
  const { isRtl } = useLanguage()
  const { showToast } = useToast()

  const [jobs, setJobs] = useState([])
  const [categories, setCategories] = useState([])
  const [loading, setLoading] = useState(true)

  // Tabs: 'catalog' | 'suggestions'
  const [activeTab, setActiveTab] = useState('catalog')
  const [suggestions, setSuggestions] = useState([])
  const [loadingSuggestions, setLoadingSuggestions] = useState(false)

  // Import Modal State
  const [importModalOpen, setImportModalOpen] = useState(false)

  // Filters
  const [search, setSearch] = useState('')
  const [selectedCat, setSelectedCat] = useState('')

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
        setJobs(jobsRes.data?.data || [])
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

  // Filter jobs
  const filteredJobs = jobs.filter(j => {
    const matchesSearch = !search ||
      j.name?.toLowerCase().includes(search.toLowerCase()) ||
      j.nameAr?.includes(search)
    const matchesCat = !selectedCat ||
      (j.categoryId?._id === selectedCat || j.categoryId === selectedCat)
    return matchesSearch && matchesCat
  })

  const pendingSuggestionsCount = suggestions.filter(s => s.status === 'Pending').length;

  return (
    <div style={{ padding: 'clamp(1.25rem, 3vw, 2rem) 0 3rem', background: 'var(--bg-page)', minHeight: '85vh' }}>
      <div className="container">
        {/* Header */}
        <div style={{ display: 'flex', flexWrap: 'wrap', justifyContent: 'space-between', alignItems: 'center', gap: '1rem', marginBottom: '1.5rem' }}>
          <div>
            <h1 style={{ fontSize: 'clamp(1.25rem, 3vw, 1.625rem)', fontWeight: 800, color: 'var(--slate-900)' }}>
              {isRtl ? 'كتالوج المسميات الوظيفية المعتمدة' : 'Standard Job Titles Catalog'}
            </h1>
            <p style={{ color: 'var(--slate-500)', fontSize: '0.9375rem', marginTop: '0.25rem' }}>
              {isRtl ? 'إدارة المسميات واستخراجها من الملفات وفحص عدم التكرار' : 'Manage standard job titles, extract from documents, and prevent duplicates'}
            </p>
          </div>

          <div style={{ display: 'flex', gap: '0.625rem', flexWrap: 'wrap' }}>
            <button
              onClick={() => setImportModalOpen(true)}
              className="btn btn-outline"
              style={{ fontWeight: 700, borderColor: 'var(--primary)', color: 'var(--primary)', background: '#fff' }}
            >
              <FileSpreadsheet size={18} />
              {isRtl ? 'استيراد وفحص مسميات (ملف / نص)' : 'Import & Extract Titles'}
            </button>
            <button onClick={handleOpenCreate} className="btn btn-primary" style={{ fontWeight: 600 }}>
              <Plus size={18} />
              {isRtl ? 'إضافة مسمى وظيفي جديد' : 'Add New Job Title'}
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
            {/* Filter Bar */}
            <div className="card card-responsive" style={{ marginBottom: '1.5rem' }}>
              <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(min(100%, 220px), 1fr))', gap: '1rem' }}>
                <div style={{ position: 'relative' }}>
                  <input
                    type="text"
                    className="form-control"
                    placeholder={isRtl ? 'بحث باسم الوظيفة (عربي / English)...' : 'Search job title...'}
                    value={search}
                    onChange={(e) => setSearch(e.target.value)}
                  />
                </div>

                <div>
                  <select className="form-control" value={selectedCat} onChange={(e) => setSelectedCat(e.target.value)}>
                    <option value="">{isRtl ? 'جميع القطاعات الوظيفية' : 'All Categories'}</option>
                    {categories.map((c) => (
                      <option key={c._id} value={c._id}>
                        {isRtl ? (c.nameAr || c.name) : (c.name || c.nameAr)}
                      </option>
                    ))}
                  </select>
                </div>
              </div>
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
              title={isRtl ? 'لا توجد وظائف مطابقة' : 'No jobs found'}
              description={isRtl ? 'اضغط على زر "إضافة مسمى وظيفي جديد" لإدراج وظيفة.' : 'Click "Add New Job Title" to register a position.'}
            />
          ) : (
            <div className="table-responsive">
              <table className="data-table" style={{ width: '100%', minWidth: '650px', borderCollapse: 'collapse', textAlign: isRtl ? 'right' : 'left', fontSize: '0.875rem' }}>
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
                        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '0.375rem' }}>
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
  )
}
