import React, { useState } from 'react'
import { useAuth } from '../../context/AuthContext'
import { useToast } from '../../context/ToastContext'
import { useLanguage } from '../../context/LanguageContext'
import { authApi } from '../../api/auth.api'
import { Lock, Trash2 } from 'lucide-react'

export default function CandidateSettings() {
  const { user, logout } = useAuth()
  const { showToast } = useToast()
  const { isRtl } = useLanguage()

  const [pwForm, setPwForm] = useState({ currentPassword: '', newPassword: '', confirmPassword: '' })
  const [saving, setSaving] = useState(false)

  const handleChange = (e) => setPwForm(prev => ({ ...prev, [e.target.name]: e.target.value }))

  const handleChangePassword = async (e) => {
    e.preventDefault()
    if (pwForm.newPassword !== pwForm.confirmPassword) {
      showToast(isRtl ? 'كلمتا المرور غير متطابقتين' : 'Passwords do not match', 'warning')
      return
    }
    try {
      setSaving(true)
      await authApi.changePassword({ currentPassword: pwForm.currentPassword, newPassword: pwForm.newPassword })
      showToast(isRtl ? 'تم تغيير كلمة المرور بنجاح' : 'Password changed successfully', 'success')
      setPwForm({ currentPassword: '', newPassword: '', confirmPassword: '' })
    } catch (err) {
      showToast(err.response?.data?.message || (isRtl ? 'خطأ في تغيير كلمة المرور' : 'Error changing password'), 'error')
    } finally {
      setSaving(false)
    }
  }

  return (
    <div style={{ padding: '2rem 0', background: 'var(--bg-page)', minHeight: '80vh' }}>
      <div className="container" style={{ maxWidth: 560 }}>
        <h1 style={{ fontSize: '1.5rem', fontWeight: 800, color: 'var(--slate-900)', marginBottom: '2rem' }}>
          {isRtl ? 'إعدادات الحساب' : 'Account Settings'}
        </h1>

        {/* Account Info */}
        <div className="card" style={{ padding: '1.75rem', marginBottom: '1.5rem' }}>
          <h2 style={{ fontSize: '1rem', fontWeight: 700, color: 'var(--slate-800)', marginBottom: '1.25rem' }}>
            {isRtl ? 'معلومات الحساب' : 'Account Information'}
          </h2>
          <div style={{ display: 'flex', flexDirection: 'column', gap: '0.75rem', fontSize: '0.9375rem' }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', padding: '0.75rem', background: 'var(--slate-50)', borderRadius: 'var(--radius-md)' }}>
              <span style={{ color: 'var(--slate-500)', fontWeight: 600 }}>{isRtl ? 'رقم الهاتف' : 'Phone'}</span>
              <span style={{ color: 'var(--slate-800)', fontWeight: 700 }} dir="ltr">{user?.phone || '—'}</span>
            </div>
            <div style={{ display: 'flex', justifyContent: 'space-between', padding: '0.75rem', background: 'var(--slate-50)', borderRadius: 'var(--radius-md)' }}>
              <span style={{ color: 'var(--slate-500)', fontWeight: 600 }}>{isRtl ? 'البريد الإلكتروني' : 'Email'}</span>
              <span style={{ color: 'var(--slate-800)', fontWeight: 700 }} dir="ltr">{user?.email || '—'}</span>
            </div>
          </div>
        </div>

        {/* Change Password */}
        <div className="card" style={{ padding: '1.75rem', marginBottom: '1.5rem' }}>
          <h2 style={{ fontSize: '1rem', fontWeight: 700, color: 'var(--slate-800)', marginBottom: '1.25rem', display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
            <Lock size={18} style={{ color: 'var(--accent)' }} />
            {isRtl ? 'تغيير كلمة المرور' : 'Change Password'}
          </h2>
          <form onSubmit={handleChangePassword}>
            <div className="form-group">
              <label className="form-label">{isRtl ? 'كلمة المرور الحالية' : 'Current Password'}</label>
              <input type="password" name="currentPassword" className="form-control" value={pwForm.currentPassword} onChange={handleChange} required dir="ltr" />
            </div>
            <div className="form-group">
              <label className="form-label">{isRtl ? 'كلمة المرور الجديدة' : 'New Password'}</label>
              <input type="password" name="newPassword" className="form-control" value={pwForm.newPassword} onChange={handleChange} required minLength={6} dir="ltr" />
            </div>
            <div className="form-group">
              <label className="form-label">{isRtl ? 'تأكيد كلمة المرور الجديدة' : 'Confirm New Password'}</label>
              <input type="password" name="confirmPassword" className="form-control" value={pwForm.confirmPassword} onChange={handleChange} required dir="ltr" />
            </div>
            <button type="submit" className="btn btn-primary" disabled={saving} style={{ width: '100%' }}>
              {saving ? (isRtl ? 'جاري الحفظ...' : 'Saving...') : (isRtl ? 'تغيير كلمة المرور' : 'Change Password')}
            </button>
          </form>
        </div>

        {/* Logout */}
        <div className="card" style={{ padding: '1.75rem' }}>
          <button onClick={logout} style={{ width: '100%', padding: '0.875rem', background: '#ffffff', color: '#000000', border: '1.5px solid #000000', borderRadius: 'var(--radius-md)', fontWeight: 700, fontSize: '0.9375rem', cursor: 'pointer', display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '0.5rem' }}>
            <Trash2 size={18} />
            {isRtl ? 'تسجيل الخروج من الحساب' : 'Logout'}
          </button>
        </div>
      </div>
    </div>
  )
}
