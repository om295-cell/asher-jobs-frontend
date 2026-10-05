import React, { useEffect, useState } from 'react'
import { Link } from 'react-router-dom'
import { useLanguage } from '../../context/LanguageContext'
import { useToast } from '../../context/ToastContext'
import { adminApi } from '../../api/admin.api'
import {
  Layers,
  Plus,
  Edit,
  Trash2,
  CheckCircle,
  XCircle,
  Save,
  X
} from 'lucide-react'
import LoadingSpinner from '../../components/ui/LoadingSpinner'
import ConfirmModal from '../../components/modals/ConfirmModal'
import EmptyState from '../../components/ui/EmptyState'

export default function AdminCategories() {
  const { isRtl } = useLanguage()
  const { showToast } = useToast()

  const [categories, setCategories] = useState([])
  const [loading, setLoading] = useState(true)

  // Create / Edit modal
  const [modalOpen, setModalOpen] = useState(false)
  const [editingCat, setEditingCat] = useState(null)
  const [form, setForm] = useState({ name: '', nameAr: '', description: '', isActive: true, sortOrder: 0 })
  const [saving, setSaving] = useState(false)

  // Confirm delete modal
  const [confirmModal, setConfirmModal] = useState({ open: false, title: '', message: '', action: null })

  const loadCategories = () => {
    setLoading(true)
    adminApi.listCategories()
      .then(res => setCategories(res.data?.data || []))
      .catch(err => showToast(err.response?.data?.message || 'Failed to load categories', 'error'))
      .finally(() => setLoading(false))
  }

  useEffect(() => {
    loadCategories()
  }, [])

  const handleOpenCreate = () => {
    setEditingCat(null)
    setForm({
      name: '',
      nameAr: '',
      description: '',
      isActive: true,
      sortOrder: categories.length + 1
    })
    setModalOpen(true)
  }

  const handleOpenEdit = (cat) => {
    setEditingCat(cat)
    setForm({
      name: cat.name || '',
      nameAr: cat.nameAr || '',
      description: cat.description || '',
      isActive: cat.isActive !== false,
      sortOrder: cat.sortOrder || 0
    })
    setModalOpen(true)
  }

  const handleSubmit = async (e) => {
    e.preventDefault()
    if (!form.nameAr.trim()) {
      showToast(isRtl ? 'اسم القطاع بالعربية مطلوب' : 'Arabic category name is required', 'warning')
      return
    }

    try {
      setSaving(true)
      const payload = {
        name: form.name.trim() || form.nameAr.trim(),
        nameAr: form.nameAr.trim(),
        description: form.description.trim(),
        isActive: form.isActive,
        sortOrder: Number(form.sortOrder) || 0
      }

      if (editingCat) {
        await adminApi.updateCategory(editingCat._id, payload)
        showToast(isRtl ? 'تم تحديث القطاع بنجاح' : 'Category updated', 'success')
      } else {
        await adminApi.createCategory(payload)
        showToast(isRtl ? 'تم إضافة القطاع بنجاح' : 'Category created', 'success')
      }
      setModalOpen(false)
      loadCategories()
    } catch (err) {
      showToast(err.response?.data?.message || 'Save failed', 'error')
    } finally {
      setSaving(false)
    }
  }

  const handleDelete = (cat) => {
    setConfirmModal({
      open: true,
      title: isRtl ? 'حذف القطاع الوظيفي' : 'Delete Job Category',
      message: isRtl
        ? `هل أنت متأكد من حذف قطاع "${cat.nameAr || cat.name}"؟`
        : `Delete category "${cat.nameAr || cat.name}"?`,
      confirmText: isRtl ? 'حذف' : 'Delete',
      danger: true,
      action: async () => {
        try {
          await adminApi.deleteCategory(cat._id)
          showToast(isRtl ? 'تم حذف القطاع' : 'Category deleted', 'success')
          loadCategories()
        } catch (err) {
          showToast(err.response?.data?.message || 'Delete failed', 'error')
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
              {isRtl ? 'القطاعات والتخصصات الوظيفية' : 'Job Sectors & Categories'}
            </h1>
            <p style={{ color: 'var(--slate-500)', fontSize: '0.9375rem', marginTop: '0.25rem' }}>
              {isRtl ? 'تصنيف المهن لتسهيل الفلترة والبحث للمصانع والباحثين عن عمل' : 'Classify jobs to ease employer search in 10th of Ramadan'}
            </p>
          </div>

          <button onClick={handleOpenCreate} className="btn btn-primary" style={{ fontWeight: 600 }}>
            <Plus size={18} />
            {isRtl ? 'إضافة قطاع جديد' : 'New Category'}
          </button>
        </div>

        {/* Categories Table */}
        <div className="card" style={{ padding: 0, overflow: 'hidden' }}>
          {loading ? (
            <div style={{ padding: '3rem' }}>
              <LoadingSpinner />
            </div>
          ) : categories.length === 0 ? (
            <EmptyState
              icon={Layers}
              title={isRtl ? 'لا توجد قطاعات مسجلة' : 'No categories found'}
              description={isRtl ? 'اضغط على زر "إضافة قطاع جديد" للبدء.' : 'Click "New Category" to add one.'}
            />
          ) : (
            <div style={{ overflowX: 'auto' }}>
              <table style={{ width: '100%', borderCollapse: 'collapse', textAlign: isRtl ? 'right' : 'left', fontSize: '0.875rem' }}>
                <thead>
                  <tr style={{ background: 'var(--slate-50)', borderBottom: '1px solid var(--border)' }}>
                    <th style={{ padding: '0.875rem 1rem', fontWeight: 700, color: 'var(--slate-600)' }}>
                      {isRtl ? 'القطاع (عربي)' : 'Category (Arabic)'}
                    </th>
                    <th style={{ padding: '0.875rem 1rem', fontWeight: 700, color: 'var(--slate-600)' }}>
                      {isRtl ? 'القطاع (إنجليزي)' : 'Category (English)'}
                    </th>
                    <th style={{ padding: '0.875rem 1rem', fontWeight: 700, color: 'var(--slate-600)' }}>
                      {isRtl ? 'الوصف' : 'Description'}
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
                  {categories.map((cat) => (
                    <tr key={cat._id} style={{ borderBottom: '1px solid var(--border)' }}>
                      <td style={{ padding: '0.875rem 1rem', fontWeight: 700, color: 'var(--slate-900)' }}>
                        {cat.nameAr}
                      </td>

                      <td style={{ padding: '0.875rem 1rem', color: 'var(--slate-700)' }}>
                        {cat.name}
                      </td>

                      <td style={{ padding: '0.875rem 1rem', color: 'var(--slate-500)', fontSize: '0.8125rem' }}>
                        {cat.description || '—'}
                      </td>

                      <td style={{ padding: '0.875rem 1rem' }}>
                        {cat.isActive !== false ? (
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
                            onClick={() => handleOpenEdit(cat)}
                            className="btn"
                            style={{ padding: '0.35rem', background: 'var(--slate-100)', color: 'var(--slate-700)' }}
                            title={isRtl ? 'تعديل' : 'Edit'}
                          >
                            <Edit size={15} />
                          </button>

                          <button
                            onClick={() => handleDelete(cat)}
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
      </div>

      {/* Create / Edit Modal */}
      {modalOpen && (
        <div style={{ position: 'fixed', inset: 0, background: 'rgba(0,0,0,0.5)', display: 'flex', alignItems: 'center', justifyContent: 'center', zIndex: 1000, padding: '1rem' }}>
          <div className="card" style={{ maxWidth: 480, width: '100%', padding: '1.75rem' }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1.25rem' }}>
              <h2 style={{ fontSize: '1.25rem', fontWeight: 800, color: 'var(--slate-900)', margin: 0 }}>
                {editingCat ? (isRtl ? 'تعديل القطاع' : 'Edit Category') : (isRtl ? 'إضافة قطاع جديد' : 'New Category')}
              </h2>
              <button onClick={() => setModalOpen(false)} style={{ background: 'none', border: 'none', cursor: 'pointer', color: 'var(--slate-400)' }}>
                <X size={20} />
              </button>
            </div>

            <form onSubmit={handleSubmit}>
              <div className="form-group">
                <label className="form-label">{isRtl ? 'اسم القطاع بالعربية *' : 'Category Name (Arabic) *'}</label>
                <input
                  type="text"
                  className="form-control"
                  placeholder={isRtl ? 'مثال: فنيين وتشغيل خطوط إنتاج' : 'e.g. Technicians & Operators'}
                  value={form.nameAr}
                  onChange={(e) => setForm(prev => ({ ...prev, nameAr: e.target.value }))}
                  required
                />
              </div>

              <div className="form-group">
                <label className="form-label">{isRtl ? 'اسم القطاع بالإنجليزية' : 'Category Name (English)'}</label>
                <input
                  type="text"
                  className="form-control"
                  placeholder="e.g. Technicians & Production"
                  value={form.name}
                  onChange={(e) => setForm(prev => ({ ...prev, name: e.target.value }))}
                />
              </div>

              <div className="form-group">
                <label className="form-label">{isRtl ? 'الوصف' : 'Description'}</label>
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
                  id="isActiveCat"
                  checked={form.isActive}
                  onChange={(e) => setForm(prev => ({ ...prev, isActive: e.target.checked }))}
                />
                <label htmlFor="isActiveCat" style={{ fontSize: '0.9375rem', fontWeight: 600, color: 'var(--slate-800)', cursor: 'pointer' }}>
                  {isRtl ? 'مفعّل ويظهر في خيارات التسجيل والبحث' : 'Active and available in filters'}
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
    </div>
  )
}
