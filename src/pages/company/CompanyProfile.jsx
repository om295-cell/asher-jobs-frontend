import React, { useEffect, useState } from 'react'
import { useAuth } from '../../context/AuthContext'
import { useLanguage } from '../../context/LanguageContext'
import { useToast } from '../../context/ToastContext'
import { companyApi } from '../../api/company.api'
import { Save } from 'lucide-react'
import StatusBadge from '../../components/ui/StatusBadge'
import LoadingSpinner from '../../components/ui/LoadingSpinner'

export default function CompanyProfile() {
  const { profile: authProfile } = useAuth()
  const { isRtl } = useLanguage()
  const { showToast } = useToast()
  const [profile, setProfile] = useState(null)
  const [loading, setLoading] = useState(true)
  const [saving, setSaving] = useState(false)
  const [form, setForm] = useState({ address: '', website: '', contactPerson: '', contactPersonPhone: '' })

  useEffect(() => {
    companyApi.getMyProfile().then(res => {
      const p = res.data?.data
      setProfile(p)
      if (p) setForm({ address: p.address || '', website: p.website || '', contactPerson: p.contactPerson || '', contactPersonPhone: p.contactPersonPhone || '' })
    }).catch(() => {}).finally(() => setLoading(false))
  }, [])

  const handleSubmit = async (e) => {
    e.preventDefault()
    try {
      setSaving(true)
      await companyApi.updateMyProfile(form)
      showToast(isRtl ? 'تم حفظ بيانات الشركة' : 'Company profile saved', 'success')
    } catch (err) {
      showToast(err.response?.data?.message || 'Error', 'error')
    } finally {
      setSaving(false)
    }
  }

  if (loading) return <LoadingSpinner />

  return (
    <div style={{ padding: '2rem 0', background: 'var(--bg-page)', minHeight: '80vh' }}>
      <div className="container" style={{ maxWidth: 680 }}>
        <div style={{ marginBottom: '2rem' }}>
          <h1 style={{ fontSize: '1.5rem', fontWeight: 800, color: 'var(--slate-900)', marginBottom: '0.375rem' }}>
            {isRtl ? 'ملف الشركة' : 'Company Profile'}
          </h1>
          {profile && <StatusBadge status={profile.verificationStatus} />}
        </div>

        {/* Read-only info */}
        <div className="card" style={{ padding: '1.75rem', marginBottom: '1.5rem' }}>
          <h3 style={{ fontWeight: 700, color: 'var(--slate-700)', marginBottom: '1rem', fontSize: '0.9375rem' }}>{isRtl ? 'بيانات التسجيل (غير قابلة للتعديل)' : 'Registration Data (Read-only)'}</h3>
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))', gap: '0.875rem' }}>
            {[
              { label: isRtl ? 'اسم الشركة' : 'Company Name', value: profile?.companyName },
              { label: isRtl ? 'البريد الإلكتروني' : 'Email', value: profile?.user?.email },
              { label: isRtl ? 'الهاتف' : 'Phone', value: profile?.user?.phone },
              { label: isRtl ? 'المحافظة' : 'Governorate', value: profile?.governorate },
              { label: isRtl ? 'المنطقة' : 'Area', value: profile?.area },
              { label: isRtl ? 'القطاع' : 'Industry', value: profile?.industry },
            ].map(({ label, value }) => (
              <div key={label}>
                <div style={{ fontSize: '0.75rem', color: 'var(--slate-500)', fontWeight: 700 }}>{label}</div>
                <div style={{ fontSize: '0.9375rem', fontWeight: 600, color: 'var(--slate-800)' }}>{value || '—'}</div>
              </div>
            ))}
          </div>
        </div>

        {/* Editable fields */}
        <div className="card card-responsive">
          <h3 style={{ fontWeight: 700, color: 'var(--slate-700)', marginBottom: '1.25rem', fontSize: '0.9375rem' }}>{isRtl ? 'معلومات إضافية (قابلة للتعديل)' : 'Additional Info (Editable)'}</h3>
          <form onSubmit={handleSubmit}>
            <div className="form-group">
              <label className="form-label">{isRtl ? 'العنوان التفصيلي' : 'Detailed Address'}</label>
              <input type="text" className="form-control" value={form.address} onChange={e => setForm(p => ({ ...p, address: e.target.value }))} />
            </div>
            <div className="form-group">
              <label className="form-label">{isRtl ? 'الموقع الإلكتروني' : 'Website'}</label>
              <input type="url" className="form-control" value={form.website} onChange={e => setForm(p => ({ ...p, website: e.target.value }))} dir="ltr" placeholder="https://" />
            </div>
            <div className="grid-2">
              <div className="form-group">
                <label className="form-label">{isRtl ? 'اسم مسؤول التواصل' : 'Contact Person'}</label>
                <input type="text" className="form-control" value={form.contactPerson} onChange={e => setForm(p => ({ ...p, contactPerson: e.target.value }))} />
              </div>
              <div className="form-group">
                <label className="form-label">{isRtl ? 'هاتف مسؤول التواصل' : 'Contact Phone'}</label>
                <input type="tel" className="form-control" value={form.contactPersonPhone} onChange={e => setForm(p => ({ ...p, contactPersonPhone: e.target.value }))} dir="ltr" />
              </div>
            </div>
            <button type="submit" className="btn btn-primary" disabled={saving} style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
              <Save size={18} />
              {saving ? (isRtl ? 'جاري الحفظ...' : 'Saving...') : (isRtl ? 'حفظ التغييرات' : 'Save Changes')}
            </button>
          </form>
        </div>
      </div>
    </div>
  )
}
