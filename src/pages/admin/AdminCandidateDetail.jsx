import React, { useEffect, useState } from 'react'
import { useParams, useNavigate, Link } from 'react-router-dom'
import { useLanguage } from '../../context/LanguageContext'
import { useToast } from '../../context/ToastContext'
import { adminApi } from '../../api/admin.api'
import { jobsApi } from '../../api/jobs.api'
import {
  ArrowLeft,
  User,
  Phone,
  Mail,
  MapPin,
  Briefcase,
  GraduationCap,
  Calendar,
  FileText,
  ShieldAlert,
  ShieldCheck,
  Edit,
  Save,
  Trash2,
  Share2,
  ExternalLink
} from 'lucide-react'
import LoadingSpinner from '../../components/ui/LoadingSpinner'
import StatusBadge from '../../components/ui/StatusBadge'
import ConfirmModal from '../../components/modals/ConfirmModal'

export default function AdminCandidateDetail() {
  const { id } = useParams()
  const navigate = useNavigate()
  const { isRtl } = useLanguage()
  const { showToast } = useToast()

  const [candidate, setCandidate] = useState(null)
  const [loading, setLoading] = useState(true)
  const [editing, setEditing] = useState(false)
  const [form, setForm] = useState({})
  const [saving, setSaving] = useState(false)
  const [jobs, setJobs] = useState([])
  const [categories, setCategories] = useState([])
  const [confirmModal, setConfirmModal] = useState({ open: false, title: '', message: '', action: null })

  const fetchCandidate = () => {
    setLoading(true)
    adminApi.getCandidateById(id)
      .then(res => {
        const c = res.data?.data
        setCandidate(c)
        setForm({
          fullName: c.fullName || '',
          phone: c.phone || '',
          email: c.email || '',
          governorate: c.governorate || '',
          area: c.area || '',
          desiredJobId: c.desiredJobId?._id || c.desiredJobId || '',
          categoryId: c.categoryId?._id || c.categoryId || '',
          yearsOfExperience: c.yearsOfExperience || 0,
          qualification: c.qualification || '',
          skills: Array.isArray(c.skills) ? c.skills.join(', ') : (c.skills || ''),
          availabilityStatus: c.availabilityStatus || 'Available'
        })
      })
      .catch(err => {
        showToast(err.response?.data?.message || 'Failed to load candidate', 'error')
      })
      .finally(() => setLoading(false))
  }

  useEffect(() => {
    fetchCandidate()
    jobsApi.getJobs().then(res => setJobs(res.data?.data || [])).catch(() => {})
    jobsApi.getCategories().then(res => setCategories(res.data?.data || [])).catch(() => {})
  }, [id])

  if (loading) return <LoadingSpinner />
  if (!candidate) {
    return (
      <div className="container" style={{ padding: '3rem 0', textAlign: 'center' }}>
        <p>{isRtl ? 'المرشح غير موجود' : 'Candidate not found'}</p>
        <Link to="/admin/candidates" className="btn btn-primary" style={{ marginTop: '1rem' }}>
          {isRtl ? 'العودة للمرشحين' : 'Back to Candidates'}
        </Link>
      </div>
    )
  }

  const isBlocked = candidate.accountStatus === 'blocked' || candidate.userId?.isBlocked

  const handleSave = async (e) => {
    e.preventDefault()
    try {
      setSaving(true)
      const payload = {
        ...form,
        skills: form.skills ? form.skills.split(',').map(s => s.trim()).filter(Boolean) : []
      }
      await adminApi.updateCandidate(candidate._id, payload)
      showToast(isRtl ? 'تم تحديث بيانات المرشح بنجاح' : 'Candidate updated successfully', 'success')
      setEditing(false)
      fetchCandidate()
    } catch (err) {
      showToast(err.response?.data?.message || 'Update failed', 'error')
    } finally {
      setSaving(false)
    }
  }

  const handleToggleBlock = () => {
    const newBlocked = !isBlocked
    setConfirmModal({
      open: true,
      title: newBlocked ? (isRtl ? 'حظر حساب المرشح' : 'Block Candidate') : (isRtl ? 'إلغاء حظر المرشح' : 'Unblock Candidate'),
      message: newBlocked
        ? (isRtl ? 'سيتم منع المرشح من تسجيل الدخول أو الظهور في نتائج البحث.' : 'The candidate will be blocked from logging in.')
        : (isRtl ? 'سيتم إعادة تفعيل الحساب فوراً.' : 'Restore candidate account access?'),
      confirmText: newBlocked ? (isRtl ? 'حظر الحساب' : 'Block') : (isRtl ? 'تفعيل' : 'Unblock'),
      danger: newBlocked,
      action: async () => {
        try {
          await adminApi.toggleBlockCandidate(candidate._id, newBlocked, 'Admin action')
          showToast(newBlocked ? (isRtl ? 'تم حظر المرشح' : 'Candidate blocked') : (isRtl ? 'تم رفع الحظر' : 'Candidate unblocked'), 'success')
          fetchCandidate()
        } catch (err) {
          showToast(err.response?.data?.message || 'Action failed', 'error')
        }
      }
    })
  }

  const handleDelete = () => {
    setConfirmModal({
      open: true,
      title: isRtl ? 'حذف ملف المرشح نهائياً' : 'Delete Candidate Profile',
      message: isRtl ? 'هل أنت متأكد من حذف هذا السجل من المنصة؟' : 'Are you sure you want to delete this profile?',
      confirmText: isRtl ? 'حذف' : 'Delete',
      danger: true,
      action: async () => {
        try {
          await adminApi.deleteCandidate(candidate._id)
          showToast(isRtl ? 'تم حذف الملف' : 'Profile deleted', 'success')
          navigate('/admin/candidates')
        } catch (err) {
          showToast(err.response?.data?.message || 'Delete failed', 'error')
        }
      }
    })
  }

  return (
    <div style={{ padding: 'clamp(1.25rem, 3vw, 2rem) 0 3rem', background: 'var(--bg-page)', minHeight: '85vh' }}>
      <div className="container" style={{ maxWidth: 900 }}>
        {/* Back Link */}
        <Link
          to="/admin/candidates"
          style={{
            display: 'inline-flex',
            alignItems: 'center',
            gap: '0.5rem',
            color: 'var(--slate-500)',
            fontSize: '0.875rem',
            fontWeight: 600,
            marginBottom: '1.25rem'
          }}
        >
          <ArrowLeft size={16} style={{ transform: isRtl ? 'rotate(180deg)' : 'none' }} />
          {isRtl ? 'العودة إلى قائمة المرشحين' : 'Back to Candidates'}
        </Link>

        {/* Profile Card Header */}
        <div className="card card-responsive" style={{ marginBottom: '1.5rem' }}>
          <div style={{ display: 'flex', flexWrap: 'wrap', justifyContent: 'space-between', alignItems: 'flex-start', gap: '1rem' }}>
            <div style={{ display: 'flex', gap: '1.25rem', alignItems: 'center' }}>
              <div
                style={{
                  width: 64,
                  height: 64,
                  borderRadius: '50%',
                  background: 'var(--accent-light)',
                  color: 'var(--accent)',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  fontWeight: 800,
                  fontSize: '1.5rem'
                }}
              >
                {candidate.fullName?.charAt(0) || <User size={32} />}
              </div>

              <div>
                <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem' }}>
                  <h1 style={{ fontSize: '1.5rem', fontWeight: 800, color: 'var(--slate-900)', margin: 0 }}>
                    {candidate.fullName}
                  </h1>
                  <StatusBadge status={candidate.availabilityStatus} />
                  {isBlocked && (
                    <span style={{ fontSize: '0.75rem', padding: '0.2rem 0.6rem', borderRadius: 'var(--radius-full)', background: 'var(--rose-light)', color: 'var(--rose)', fontWeight: 700 }}>
                      {isRtl ? 'محظور' : 'Blocked'}
                    </span>
                  )}
                </div>

                <div style={{ color: 'var(--accent)', fontWeight: 600, fontSize: '1rem', marginTop: '0.25rem' }}>
                  {isRtl ? (candidate.desiredJobId?.nameAr || candidate.desiredJobId?.name) : (candidate.desiredJobId?.name || candidate.desiredJobId?.nameAr)}
                  <span style={{ color: 'var(--slate-400)', margin: '0 0.5rem' }}>•</span>
                  <span style={{ color: 'var(--slate-500)', fontSize: '0.875rem' }}>
                    {isRtl ? (candidate.categoryId?.nameAr || candidate.categoryId?.name) : (candidate.categoryId?.name || candidate.categoryId?.nameAr)}
                  </span>
                </div>
              </div>
            </div>

            {/* Header Action Buttons */}
            <div style={{ display: 'flex', gap: '0.5rem', flexWrap: 'wrap' }}>
              <button
                onClick={() => setEditing(!editing)}
                className="btn"
                style={{ background: editing ? 'var(--slate-200)' : 'var(--slate-100)', color: 'var(--slate-800)', fontWeight: 600 }}
              >
                <Edit size={16} />
                {editing ? (isRtl ? 'إلغاء التعديل' : 'Cancel') : (isRtl ? 'تعديل البيانات' : 'Edit')}
              </button>

              <button
                onClick={handleToggleBlock}
                className="btn"
                style={{
                  background: isBlocked ? 'var(--emerald-light)' : 'var(--amber-light)',
                  color: isBlocked ? 'var(--emerald)' : 'var(--amber)',
                  fontWeight: 600
                }}
              >
                {isBlocked ? <ShieldCheck size={16} /> : <ShieldAlert size={16} />}
                {isBlocked ? (isRtl ? 'إلغاء الحظر' : 'Unblock') : (isRtl ? 'حظر الحساب' : 'Block')}
              </button>

              <button
                onClick={handleDelete}
                className="btn"
                style={{ background: 'var(--rose-light)', color: 'var(--rose)', fontWeight: 600 }}
              >
                <Trash2 size={16} />
                {isRtl ? 'حذف' : 'Delete'}
              </button>
            </div>
          </div>
        </div>

        {/* Edit Form or Detail View */}
        {editing ? (
          <form onSubmit={handleSave} className="card card-responsive" style={{ marginBottom: '1.5rem' }}>
            <h2 style={{ fontSize: '1.125rem', fontWeight: 800, marginBottom: '1.25rem' }}>
              {isRtl ? 'تعديل ملف المرشح' : 'Edit Candidate Profile'}
            </h2>

            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(min(100%, 240px), 1fr))', gap: '1rem', marginBottom: '1rem' }}>
              <div className="form-group">
                <label className="form-label">{isRtl ? 'الاسم الكامل' : 'Full Name'}</label>
                <input
                  type="text"
                  className="form-control"
                  value={form.fullName}
                  onChange={(e) => setForm(prev => ({ ...prev, fullName: e.target.value }))}
                  required
                />
              </div>

              <div className="form-group">
                <label className="form-label">{isRtl ? 'رقم الهاتف' : 'Phone'}</label>
                <input
                  type="text"
                  className="form-control"
                  value={form.phone}
                  onChange={(e) => setForm(prev => ({ ...prev, phone: e.target.value }))}
                  required
                />
              </div>

              <div className="form-group">
                <label className="form-label">{isRtl ? 'البريد الإلكتروني' : 'Email'}</label>
                <input
                  type="email"
                  className="form-control"
                  value={form.email}
                  onChange={(e) => setForm(prev => ({ ...prev, email: e.target.value }))}
                />
              </div>

              <div className="form-group">
                <label className="form-label">{isRtl ? 'سنوات الخبرة' : 'Years of Experience'}</label>
                <input
                  type="number"
                  className="form-control"
                  value={form.yearsOfExperience}
                  onChange={(e) => setForm(prev => ({ ...prev, yearsOfExperience: e.target.value }))}
                />
              </div>

              <div className="form-group">
                <label className="form-label">{isRtl ? 'المحافظة' : 'Governorate'}</label>
                <input
                  type="text"
                  className="form-control"
                  value={form.governorate}
                  onChange={(e) => setForm(prev => ({ ...prev, governorate: e.target.value }))}
                />
              </div>

              <div className="form-group">
                <label className="form-label">{isRtl ? 'المدينة / المنطقة' : 'Area / City'}</label>
                <input
                  type="text"
                  className="form-control"
                  value={form.area}
                  onChange={(e) => setForm(prev => ({ ...prev, area: e.target.value }))}
                />
              </div>

              <div className="form-group">
                <label className="form-label">{isRtl ? 'المؤهل الدراسي' : 'Qualification'}</label>
                <input
                  type="text"
                  className="form-control"
                  value={form.qualification}
                  onChange={(e) => setForm(prev => ({ ...prev, qualification: e.target.value }))}
                />
              </div>

              <div className="form-group">
                <label className="form-label">{isRtl ? 'حالة التوفر' : 'Availability Status'}</label>
                <select
                  className="form-control"
                  value={form.availabilityStatus}
                  onChange={(e) => setForm(prev => ({ ...prev, availabilityStatus: e.target.value }))}
                >
                  <option value="Available">{isRtl ? 'متاح للعمل (Available)' : 'Available'}</option>
                  <option value="Employed">{isRtl ? 'يعمل حالياً (Employed)' : 'Employed'}</option>
                  <option value="NotLooking">{isRtl ? 'غير مهتم (Not Looking)' : 'Not Looking'}</option>
                </select>
              </div>
            </div>

            <div className="form-group" style={{ marginBottom: '1.5rem' }}>
              <label className="form-label">{isRtl ? 'المهارات (مفصولة بفواصل)' : 'Skills (comma separated)'}</label>
              <input
                type="text"
                className="form-control"
                value={form.skills}
                onChange={(e) => setForm(prev => ({ ...prev, skills: e.target.value }))}
              />
            </div>

            <button type="submit" disabled={saving} className="btn btn-primary" style={{ fontWeight: 600 }}>
              <Save size={16} />
              {isRtl ? (saving ? 'جاري الحفظ...' : 'حفظ التعديلات') : (saving ? 'Saving...' : 'Save Changes')}
            </button>
          </form>
        ) : (
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(min(100%, 280px), 1fr))', gap: '1.5rem' }}>
            {/* Contact & Personal */}
            <div className="card card-responsive">
              <h2 style={{ fontSize: '1rem', fontWeight: 800, color: 'var(--slate-900)', marginBottom: '1rem' }}>
                {isRtl ? 'بيانات التواصل والعنوان' : 'Contact & Location'}
              </h2>
              <div style={{ display: 'flex', flexDirection: 'column', gap: '0.75rem', fontSize: '0.9375rem' }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                  <Phone size={16} color="var(--slate-400)" />
                  <span style={{ color: 'var(--slate-500)' }}>{isRtl ? 'الهاتف:' : 'Phone:'}</span>
                  <a href={`tel:${candidate.phone}`} dir="ltr" style={{ fontWeight: 700, color: 'var(--accent)' }}>
                    {candidate.phone}
                  </a>
                </div>

                <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                  <Mail size={16} color="var(--slate-400)" />
                  <span style={{ color: 'var(--slate-500)' }}>{isRtl ? 'البريد:' : 'Email:'}</span>
                  <span style={{ fontWeight: 600, color: 'var(--slate-800)' }}>{candidate.email || '—'}</span>
                </div>

                <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                  <MapPin size={16} color="var(--slate-400)" />
                  <span style={{ color: 'var(--slate-500)' }}>{isRtl ? 'الموقع:' : 'Location:'}</span>
                  <span style={{ fontWeight: 600, color: 'var(--slate-800)' }}>
                    {candidate.governorate} — {candidate.area || (isRtl ? 'العاشر من رمضان' : '10th of Ramadan')}
                  </span>
                </div>

                <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                  <Calendar size={16} color="var(--slate-400)" />
                  <span style={{ color: 'var(--slate-500)' }}>{isRtl ? 'تاريخ التسجيل:' : 'Registered:'}</span>
                  <span style={{ fontWeight: 600, color: 'var(--slate-700)' }}>
                    {new Date(candidate.createdAt).toLocaleDateString(isRtl ? 'ar-EG' : 'en-US')}
                  </span>
                </div>

                {/* Direct quick action buttons */}
                <div style={{ display: 'flex', gap: '0.5rem', marginTop: '0.75rem' }}>
                  <a
                    href={`https://wa.me/2${candidate.phone?.replace(/\D/g, '')}`}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="btn btn-emerald"
                    style={{ flex: 1, fontSize: '0.8125rem', padding: '0.4rem' }}
                  >
                    {isRtl ? 'واتساب' : 'WhatsApp'}
                  </a>
                  <a
                    href={`tel:${candidate.phone}`}
                    className="btn btn-accent"
                    style={{ flex: 1, fontSize: '0.8125rem', padding: '0.4rem' }}
                  >
                    {isRtl ? 'اتصال مباشر' : 'Call'}
                  </a>
                </div>
              </div>
            </div>

            {/* Professional Info */}
            <div className="card card-responsive">
              <h2 style={{ fontSize: '1rem', fontWeight: 800, color: 'var(--slate-900)', marginBottom: '1rem' }}>
                {isRtl ? 'الخبرة والمؤهلات' : 'Experience & Qualifications'}
              </h2>
              <div style={{ display: 'flex', flexDirection: 'column', gap: '0.75rem', fontSize: '0.9375rem' }}>
                <div>
                  <span style={{ color: 'var(--slate-500)' }}>{isRtl ? 'المؤهل العلمي:' : 'Qualification:'}</span>
                  <div style={{ fontWeight: 700, color: 'var(--slate-800)', marginTop: '0.15rem' }}>
                    {candidate.qualification || '—'}
                  </div>
                </div>

                <div>
                  <span style={{ color: 'var(--slate-500)' }}>{isRtl ? 'سنوات الخبرة:' : 'Years of Experience:'}</span>
                  <div style={{ fontWeight: 700, color: 'var(--slate-800)', marginTop: '0.15rem' }}>
                    {candidate.yearsOfExperience || 0} {isRtl ? 'سنة في المجال' : 'years'}
                  </div>
                </div>

                <div>
                  <span style={{ color: 'var(--slate-500)' }}>{isRtl ? 'الموقف التجنيدي:' : 'Military Status:'}</span>
                  <div style={{ fontWeight: 600, color: 'var(--slate-700)', marginTop: '0.15rem' }}>
                    {candidate.militaryStatus || '—'}
                  </div>
                </div>

                <div>
                  <span style={{ color: 'var(--slate-500)' }}>{isRtl ? 'المهارات المسجلة:' : 'Skills:'}</span>
                  <div style={{ display: 'flex', flexWrap: 'wrap', gap: '0.35rem', marginTop: '0.35rem' }}>
                    {candidate.skills && candidate.skills.length > 0 ? (
                      candidate.skills.map((s, idx) => (
                        <span
                          key={idx}
                          style={{
                            background: 'var(--slate-100)',
                            color: 'var(--slate-700)',
                            padding: '0.2rem 0.5rem',
                            borderRadius: 'var(--radius-sm)',
                            fontSize: '0.8125rem'
                          }}
                        >
                          {s}
                        </span>
                      ))
                    ) : (
                      <span style={{ color: 'var(--slate-400)' }}>—</span>
                    )}
                  </div>
                </div>
              </div>
            </div>

            {/* CV & Referral Details */}
            <div className="card" style={{ padding: '1.5rem', gridColumn: '1 / -1' }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: '1rem' }}>
                <div>
                  <h3 style={{ fontSize: '0.9375rem', fontWeight: 800, color: 'var(--slate-900)' }}>
                    {isRtl ? 'ملف السيرة الذاتية (CV)' : 'Curriculum Vitae (CV)'}
                  </h3>
                  <p style={{ color: 'var(--slate-500)', fontSize: '0.875rem' }}>
                    {candidate.cvUrl
                      ? (isRtl ? 'تم رفع ملف السيرة الذاتية بواسطة المرشح' : 'CV file is uploaded and available')
                      : (isRtl ? 'لم يقم المرشح برفع ملف CV ورقي' : 'No CV document attached')}
                  </p>
                </div>

                {candidate.cvUrl && (
                  <a
                    href={`/api/candidates/cv/${candidate._id}`}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="btn btn-primary"
                    style={{ fontSize: '0.875rem', fontWeight: 600 }}
                  >
                    <FileText size={16} />
                    {isRtl ? 'تحميل السيرة الذاتية' : 'Download CV'}
                  </a>
                )}
              </div>

              {candidate.invitedBy && (
                <div style={{ marginTop: '1rem', paddingTop: '1rem', borderTop: '1px solid var(--border)', fontSize: '0.875rem', color: 'var(--slate-600)' }}>
                  <Share2 size={14} style={{ display: 'inline', marginLeft: isRtl ? '0.35rem' : 0, marginRight: isRtl ? 0 : '0.35rem' }} />
                  {isRtl ? 'تمت دعوة المرشح بواسطة:' : 'Invited by:'}{' '}
                  <strong style={{ color: 'var(--slate-900)' }}>{candidate.invitedBy.fullName}</strong> ({candidate.invitedBy.phone})
                </div>
              )}
            </div>
          </div>
        )}
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
