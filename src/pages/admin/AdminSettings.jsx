import React, { useEffect, useState } from 'react'
import { useLanguage } from '../../context/LanguageContext'
import { useToast } from '../../context/ToastContext'
import { adminApi } from '../../api/admin.api'
import {
  Settings,
  Shield,
  Save,
  Phone,
  Mail,
  CheckCircle,
  ToggleLeft,
  ToggleRight,
  Database
} from 'lucide-react'
import LoadingSpinner from '../../components/ui/LoadingSpinner'

export default function AdminSettings() {
  const { isRtl } = useLanguage()
  const { showToast } = useToast()

  const [loading, setLoading] = useState(true)
  const [saving, setSaving] = useState(false)
  const [settings, setSettings] = useState({
    supportPhone: '01012345678',
    supportEmail: 'support@asherjobs.com',
    cityTarget: 'العاشر من رمضان',
    requireCompanyVerification: true,
    allowCandidateRegistration: true,
    starterSearchLimit: 50,
    starterExportLimit: 10
  })

  useEffect(() => {
    adminApi.getSettings()
      .then(res => {
        const list = res.data?.data || []
        const mapped = {}
        list.forEach(item => {
          mapped[item.key] = item.value
        })
        if (Object.keys(mapped).length > 0) {
          setSettings(prev => ({ ...prev, ...mapped }))
        }
      })
      .catch(() => {})
      .finally(() => setLoading(false))
  }, [])

  const handleChange = (key, value) => {
    setSettings(prev => ({ ...prev, [key]: value }))
  }

  const handleSave = async (e) => {
    e.preventDefault()
    try {
      setSaving(true)
      const promises = Object.entries(settings).map(([k, v]) =>
        adminApi.updateSetting(k, v, `Setting for ${k}`)
      )
      await Promise.all(promises)
      showToast(isRtl ? 'تم حفظ إعدادات النظام بنجاح' : 'System settings saved', 'success')
    } catch (err) {
      showToast(err.response?.data?.message || 'Save failed', 'error')
    } finally {
      setSaving(false)
    }
  }

  if (loading) return <LoadingSpinner />

  return (
    <div style={{ padding: 'clamp(1.25rem, 3vw, 2rem) 0 3rem', background: 'var(--bg-page)', minHeight: '85vh' }}>
      <div className="container" style={{ maxWidth: 760 }}>
        {/* Header */}
        <div style={{ marginBottom: '2rem' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', marginBottom: '0.25rem' }}>
            <Settings size={20} color="var(--primary)" />
            <span style={{ fontSize: '0.875rem', fontWeight: 700, color: 'var(--slate-500)' }}>
              {isRtl ? 'إعدادات المنصة العامة' : 'System Configuration'}
            </span>
          </div>
          <h1 style={{ fontSize: 'clamp(1.25rem, 3vw, 1.625rem)', fontWeight: 800, color: 'var(--slate-900)' }}>
            {isRtl ? 'إعدادات عاشر جوبز' : 'Asher Jobs Platform Settings'}
          </h1>
        </div>

        <form onSubmit={handleSave}>
          {/* Security & Access Controls */}
          <div className="card card-responsive" style={{ marginBottom: '1.5rem' }}>
            <h2 style={{ fontSize: '1.125rem', fontWeight: 800, color: 'var(--slate-900)', marginBottom: '1.25rem' }}>
              {isRtl ? 'سياسات الأمان واعتماد الحسابات' : 'Security & Access Policies'}
            </h2>

            <div style={{ display: 'flex', flexDirection: 'column', gap: '1.25rem' }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', gap: '1rem' }}>
                <div>
                  <div style={{ fontWeight: 700, color: 'var(--slate-800)' }}>
                    {isRtl ? 'مراجعة واعتماد الشركات يدوياً' : 'Mandatory Manual Company Approval'}
                  </div>
                  <div style={{ fontSize: '0.8125rem', color: 'var(--slate-500)', marginTop: '0.15rem' }}>
                    {isRtl ? 'إلزام الشركات بانتظار موافقة الإدارة قبل تصفح المرشحين' : 'Companies cannot search candidates until verified by admin'}
                  </div>
                </div>
                <input
                  type="checkbox"
                  style={{ width: 20, height: 20 }}
                  checked={settings.requireCompanyVerification !== false}
                  onChange={(e) => handleChange('requireCompanyVerification', e.target.checked)}
                />
              </div>

              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', gap: '1rem', paddingTop: '1rem', borderTop: '1px solid var(--border)' }}>
                <div>
                  <div style={{ fontWeight: 700, color: 'var(--slate-800)' }}>
                    {isRtl ? 'السماح بتسجيل الباحثين عن عمل' : 'Allow Candidate Self-Registration'}
                  </div>
                  <div style={{ fontSize: '0.8125rem', color: 'var(--slate-500)', marginTop: '0.15rem' }}>
                    {isRtl ? 'إتاحة استمارة التسجيل العامة للمرشحين بالمدينة' : 'Open public registration form for job seekers'}
                  </div>
                </div>
                <input
                  type="checkbox"
                  style={{ width: 20, height: 20 }}
                  checked={settings.allowCandidateRegistration !== false}
                  onChange={(e) => handleChange('allowCandidateRegistration', e.target.checked)}
                />
              </div>
            </div>
          </div>

          {/* Contact & Support Channels */}
          <div className="card card-responsive" style={{ marginBottom: '1.5rem' }}>
            <h2 style={{ fontSize: '1.125rem', fontWeight: 800, color: 'var(--slate-900)', marginBottom: '1.25rem' }}>
              {isRtl ? 'قنوات الدعم الفني والتواصل' : 'Support Channels'}
            </h2>

            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(min(100%, 240px), 1fr))', gap: '1rem' }}>
              <div className="form-group">
                <label className="form-label">{isRtl ? 'رقم هاتف / واتساب الدعم' : 'Support Phone / WhatsApp'}</label>
                <input
                  type="text"
                  className="form-control"
                  value={settings.supportPhone || ''}
                  onChange={(e) => handleChange('supportPhone', e.target.value)}
                  dir="ltr"
                />
              </div>

              <div className="form-group">
                <label className="form-label">{isRtl ? 'البريد الإلكتروني للإدارة' : 'Support Email'}</label>
                <input
                  type="email"
                  className="form-control"
                  value={settings.supportEmail || ''}
                  onChange={(e) => handleChange('supportEmail', e.target.value)}
                />
              </div>

              <div className="form-group">
                <label className="form-label">{isRtl ? 'المدينة المستهدفة' : 'Target Region / City'}</label>
                <input
                  type="text"
                  className="form-control"
                  value={settings.cityTarget || ''}
                  onChange={(e) => handleChange('cityTarget', e.target.value)}
                />
              </div>
            </div>
          </div>

          {/* Default Quotas for New Companies */}
          <div className="card card-responsive" style={{ marginBottom: '1.5rem' }}>
            <h2 style={{ fontSize: '1.125rem', fontWeight: 800, color: 'var(--slate-900)', marginBottom: '1.25rem' }}>
              {isRtl ? 'الحصة الافتراضية للشركات الجديدة' : 'Default Quotas for New Companies'}
            </h2>

            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(min(100%, 220px), 1fr))', gap: '1rem' }}>
              <div className="form-group">
                <label className="form-label">{isRtl ? 'حد عمليات البحث الأولي' : 'Starter Search Limit'}</label>
                <input
                  type="number"
                  className="form-control"
                  value={settings.starterSearchLimit || 50}
                  onChange={(e) => handleChange('starterSearchLimit', parseInt(e.target.value, 10))}
                />
              </div>

              <div className="form-group">
                <label className="form-label">{isRtl ? 'حد تصدير السير الذاتية (CSV)' : 'Starter Export Limit'}</label>
                <input
                  type="number"
                  className="form-control"
                  value={settings.starterExportLimit || 10}
                  onChange={(e) => handleChange('starterExportLimit', parseInt(e.target.value, 10))}
                />
              </div>
            </div>
          </div>

          <div style={{ display: 'flex', justifyContent: 'flex-end' }}>
            <button
              type="submit"
              disabled={saving}
              className="btn btn-primary"
              style={{ padding: '0.75rem 2rem', fontWeight: 700, fontSize: '0.9375rem' }}
            >
              <Save size={18} />
              {isRtl ? (saving ? 'جاري الحفظ...' : 'حفظ الإعدادات') : (saving ? 'Saving...' : 'Save Settings')}
            </button>
          </div>
        </form>
      </div>
    </div>
  )
}
