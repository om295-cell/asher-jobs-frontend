import React, { useEffect, useState } from 'react'
import { useParams, useNavigate, Link } from 'react-router-dom'
import { useLanguage } from '../../context/LanguageContext'
import { useToast } from '../../context/ToastContext'
import { adminApi } from '../../api/admin.api'
import {
  ArrowLeft,
  Building2,
  Phone,
  Mail,
  MapPin,
  CheckCircle,
  XCircle,
  ShieldAlert,
  ShieldCheck,
  CreditCard,
  Save,
  MessageCircle,
  Clock
} from 'lucide-react'
import LoadingSpinner from '../../components/ui/LoadingSpinner'
import StatusBadge from '../../components/ui/StatusBadge'
import ConfirmModal from '../../components/modals/ConfirmModal'

export default function AdminCompanyDetail() {
  const { id } = useParams()
  const navigate = useNavigate()
  const { isRtl } = useLanguage()
  const { showToast } = useToast()

  const [company, setCompany] = useState(null)
  const [loading, setLoading] = useState(true)
  const [savingSub, setSavingSub] = useState(false)
  const [subForm, setSubForm] = useState({ plan: 'Standard', searchLimit: 500, exportLimit: 100, status: 'active' })
  const [confirmModal, setConfirmModal] = useState({ open: false, title: '', message: '', action: null })

  const fetchCompany = () => {
    setLoading(true)
    adminApi.getCompanyById(id)
      .then(res => {
        const comp = res.data?.data
        setCompany(comp)
        if (comp?.subscription) {
          setSubForm({
            plan: comp.subscription.plan || 'Standard',
            searchLimit: comp.subscription.searchLimit || 500,
            exportLimit: comp.subscription.exportLimit || 100,
            status: comp.subscription.status || 'active'
          })
        }
      })
      .catch(err => {
        showToast(err.response?.data?.message || 'Failed to load company', 'error')
      })
      .finally(() => setLoading(false))
  }

  useEffect(() => {
    fetchCompany()
  }, [id])

  if (loading) return <LoadingSpinner />
  if (!company) {
    return (
      <div className="container" style={{ padding: '3rem 0', textAlign: 'center' }}>
        <p>{isRtl ? 'الشركة غير موجودة' : 'Company not found'}</p>
        <Link to="/admin/companies" className="btn btn-primary" style={{ marginTop: '1rem' }}>
          {isRtl ? 'العودة للشركات' : 'Back to Companies'}
        </Link>
      </div>
    )
  }

  const isBlocked = company.isBlocked || company.userId?.isBlocked

  const handleApprove = () => {
    adminApi.approveCompany(company._id)
      .then(() => {
        showToast(isRtl ? 'تم اعتماد الشركة وتفعيل البحث بنجاح' : 'Company approved successfully', 'success')
        fetchCompany()
      })
      .catch(err => showToast(err.response?.data?.message || 'Error approving', 'error'))
  }

  const handleReject = () => {
    adminApi.rejectCompany(company._id, 'Does not meet requirements')
      .then(() => {
        showToast(isRtl ? 'تم رفض الشركة' : 'Company rejected', 'success')
        fetchCompany()
      })
      .catch(err => showToast(err.response?.data?.message || 'Error rejecting', 'error'))
  }

  const handleSaveSubscription = async (e) => {
    e.preventDefault()
    try {
      setSavingSub(true)
      await adminApi.updateCompanySubscription(company._id, subForm)
      showToast(isRtl ? 'تم تحديث بيانات باقة الشركة' : 'Subscription updated successfully', 'success')
      fetchCompany()
    } catch (err) {
      showToast(err.response?.data?.message || 'Update failed', 'error')
    } finally {
      setSavingSub(false)
    }
  }

  const handleToggleBlock = () => {
    const newBlocked = !isBlocked
    setConfirmModal({
      open: true,
      title: newBlocked ? (isRtl ? 'حظر حساب الشركة' : 'Block Company') : (isRtl ? 'إلغاء حظر الشركة' : 'Unblock Company'),
      message: newBlocked
        ? (isRtl ? 'لن تتمكن الشركة من تسجيل الدخول أو البحث في قاعدة البيانات.' : 'The company will be blocked from logging in.')
        : (isRtl ? 'إعادة تفعيل وصول الشركة للنظام؟' : 'Restore company access?'),
      confirmText: newBlocked ? (isRtl ? 'حظر' : 'Block') : (isRtl ? 'إلغاء الحظر' : 'Unblock'),
      danger: newBlocked,
      action: async () => {
        try {
          await adminApi.toggleBlockCompany(company._id, newBlocked, 'Admin action')
          showToast(newBlocked ? (isRtl ? 'تم حظر الشركة' : 'Company blocked') : (isRtl ? 'تم رفع الحظر' : 'Company unblocked'), 'success')
          fetchCompany()
        } catch (err) {
          showToast(err.response?.data?.message || 'Action failed', 'error')
        }
      }
    })
  }

  return (
    <div style={{ padding: 'clamp(1.25rem, 3vw, 2rem) 0 3rem', background: 'var(--bg-page)', minHeight: '85vh' }}>
      <div className="container" style={{ maxWidth: 900 }}>
        {/* Back Link */}
        <Link
          to="/admin/companies"
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
          {isRtl ? 'العودة إلى قائمة الشركات' : 'Back to Companies'}
        </Link>

        {/* Header Card */}
        <div className="card card-responsive" style={{ marginBottom: '1.5rem' }}>
          <div style={{ display: 'flex', flexWrap: 'wrap', justifyContent: 'space-between', alignItems: 'flex-start', gap: '1rem' }}>
            <div style={{ display: 'flex', gap: '1.25rem', alignItems: 'center' }}>
              <div
                style={{
                  width: 64,
                  height: 64,
                  borderRadius: 'var(--radius-md)',
                  background: 'var(--primary-light)',
                  color: 'var(--primary)',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center'
                }}
              >
                <Building2 size={32} />
              </div>

              <div>
                <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem' }}>
                  <h1 style={{ fontSize: '1.5rem', fontWeight: 800, color: 'var(--slate-900)', margin: 0 }}>
                    {company.companyName}
                  </h1>
                  <StatusBadge status={company.verificationStatus} />
                </div>
                <div style={{ color: 'var(--slate-500)', fontSize: '0.9375rem', marginTop: '0.25rem' }}>
                  {company.industry || (isRtl ? 'منشأة صناعية' : 'Industrial Company')} • {company.area || (isRtl ? 'العاشر من رمضان' : '10th of Ramadan')}
                </div>
              </div>
            </div>

            {/* Quick Verification Actions */}
            <div style={{ display: 'flex', gap: '0.5rem', flexWrap: 'wrap' }}>
              {company.verificationStatus !== 'Approved' && (
                <button onClick={handleApprove} className="btn btn-emerald" style={{ fontWeight: 600 }}>
                  <CheckCircle size={16} />
                  {isRtl ? 'اعتماد الشركة' : 'Approve'}
                </button>
              )}

              {company.verificationStatus !== 'Rejected' && (
                <button onClick={handleReject} className="btn" style={{ background: 'var(--rose-light)', color: 'var(--rose)', fontWeight: 600 }}>
                  <XCircle size={16} />
                  {isRtl ? 'رفض الطلب' : 'Reject'}
                </button>
              )}

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
            </div>
          </div>
        </div>

        {/* Company Info & Subscription Grid */}
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(min(100%, 280px), 1fr))', gap: '1.5rem' }}>
          {/* Company Details */}
          <div className="card card-responsive">
            <h2 style={{ fontSize: '1rem', fontWeight: 800, color: 'var(--slate-900)', marginBottom: '1.25rem' }}>
              {isRtl ? 'بيانات المنشأة والمسؤول' : 'Company Details'}
            </h2>

            <div style={{ display: 'flex', flexDirection: 'column', gap: '0.875rem', fontSize: '0.9375rem' }}>
              <div>
                <span style={{ color: 'var(--slate-500)', fontSize: '0.8125rem' }}>{isRtl ? 'مسؤول التوظيف / الموارد البشرية:' : 'Contact Person:'}</span>
                <div style={{ fontWeight: 700, color: 'var(--slate-800)', marginTop: '0.15rem' }}>{company.contactPerson || '—'}</div>
              </div>

              <div>
                <span style={{ color: 'var(--slate-500)', fontSize: '0.8125rem' }}>{isRtl ? 'رقم الهاتف:' : 'Phone:'}</span>
                <div style={{ marginTop: '0.15rem' }}>
                  <a href={`tel:${company.phone}`} dir="ltr" style={{ fontWeight: 700, color: 'var(--accent)' }}>
                    {company.phone}
                  </a>
                </div>
              </div>

              <div>
                <span style={{ color: 'var(--slate-500)', fontSize: '0.8125rem' }}>{isRtl ? 'البريد الإلكتروني:' : 'Email:'}</span>
                <div style={{ fontWeight: 600, color: 'var(--slate-800)', marginTop: '0.15rem' }}>
                  {company.contactEmail || company.email || '—'}
                </div>
              </div>

              <div>
                <span style={{ color: 'var(--slate-500)', fontSize: '0.8125rem' }}>{isRtl ? 'السجل التجاري / الرقم الضريبي:' : 'Commercial Reg. / Tax ID:'}</span>
                <div style={{ fontWeight: 600, color: 'var(--slate-700)', marginTop: '0.15rem' }}>
                  {company.commercialRegister || (isRtl ? 'غير مدرج' : 'Not provided')}
                </div>
              </div>

              <div>
                <span style={{ color: 'var(--slate-500)', fontSize: '0.8125rem' }}>{isRtl ? 'الموقع بالمدينة:' : 'Address in 10th of Ramadan:'}</span>
                <div style={{ fontWeight: 600, color: 'var(--slate-700)', marginTop: '0.15rem' }}>
                  {company.address || company.area || (isRtl ? 'المنطقة الصناعية' : 'Industrial Zone')}
                </div>
              </div>

              {/* WhatsApp direct button */}
              <div style={{ marginTop: '0.5rem' }}>
                <a
                  href={`https://wa.me/2${company.phone?.replace(/\D/g, '')}`}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="btn btn-emerald"
                  style={{ width: '100%', fontSize: '0.875rem' }}
                >
                  <MessageCircle size={16} />
                  {isRtl ? 'محادثة واتساب مباشرة' : 'WhatsApp Contact'}
                </a>
              </div>
            </div>
          </div>

          {/* Subscription Manager */}
          <div className="card card-responsive">
            <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', marginBottom: '1.25rem' }}>
              <CreditCard size={18} color="var(--accent)" />
              <h2 style={{ fontSize: '1rem', fontWeight: 800, color: 'var(--slate-900)', margin: 0 }}>
                {isRtl ? 'إدارة الباقة والحدود' : 'Subscription & Quota'}
              </h2>
            </div>

            <form onSubmit={handleSaveSubscription}>
              <div className="form-group">
                <label className="form-label">{isRtl ? 'نوع الباقة' : 'Plan Tier'}</label>
                <select
                  className="form-control"
                  value={subForm.plan}
                  onChange={(e) => setSubForm(prev => ({ ...prev, plan: e.target.value }))}
                >
                  <option value="Starter">{isRtl ? 'باقة أساسية (Starter)' : 'Starter'}</option>
                  <option value="Standard">{isRtl ? 'باقة المصانع (Standard)' : 'Standard'}</option>
                  <option value="Enterprise">{isRtl ? 'باقة كبرى (Enterprise)' : 'Enterprise'}</option>
                </select>
              </div>

              <div className="form-group">
                <label className="form-label">{isRtl ? 'حالة الباقة' : 'Subscription Status'}</label>
                <select
                  className="form-control"
                  value={subForm.status}
                  onChange={(e) => setSubForm(prev => ({ ...prev, status: e.target.value }))}
                >
                  <option value="active">{isRtl ? 'مفعلة (Active)' : 'Active'}</option>
                  <option value="expired">{isRtl ? 'منتهية (Expired)' : 'Expired'}</option>
                  <option value="cancelled">{isRtl ? 'ملغاة (Cancelled)' : 'Cancelled'}</option>
                </select>
              </div>

              <div className="form-group">
                <label className="form-label">{isRtl ? 'حد عمليات البحث شهرياً' : 'Monthly Search Limit'}</label>
                <input
                  type="number"
                  className="form-control"
                  value={subForm.searchLimit}
                  onChange={(e) => setSubForm(prev => ({ ...prev, searchLimit: parseInt(e.target.value, 10) }))}
                />
              </div>

              <div className="form-group" style={{ marginBottom: '1.5rem' }}>
                <label className="form-label">{isRtl ? 'حد تصدير السير الذاتية (CSV)' : 'Monthly Export Limit'}</label>
                <input
                  type="number"
                  className="form-control"
                  value={subForm.exportLimit}
                  onChange={(e) => setSubForm(prev => ({ ...prev, exportLimit: parseInt(e.target.value, 10) }))}
                />
              </div>

              <button type="submit" disabled={savingSub} className="btn btn-primary" style={{ width: '100%', fontWeight: 600 }}>
                <Save size={16} />
                {isRtl ? (savingSub ? 'جاري الحفظ...' : 'تحديث الباقة') : (savingSub ? 'Updating...' : 'Update Subscription')}
              </button>
            </form>
          </div>
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
