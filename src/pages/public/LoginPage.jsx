import React, { useState } from 'react'
import { Link, useNavigate, useSearchParams } from 'react-router-dom'
import { LogIn, Eye, EyeOff } from 'lucide-react'
import { useAuth } from '../../context/AuthContext'
import { useToast } from '../../context/ToastContext'
import { useLanguage } from '../../context/LanguageContext'

export default function LoginPage() {
  const { login } = useAuth()
  const { showToast } = useToast()
  const { t, isRtl } = useLanguage()
  const navigate = useNavigate()
  const [searchParams] = useSearchParams()

  const [form, setForm] = useState({ credential: '', password: '' })
  const [showPass, setShowPass] = useState(false)
  const [loading, setLoading] = useState(false)

  const handleChange = (e) => setForm(prev => ({ ...prev, [e.target.name]: e.target.value }))

  const handleSubmit = async (e) => {
    e.preventDefault()
    if (!form.credential.trim() || !form.password) {
      showToast('يرجى إدخال رقم الهاتف أو البريد الإلكتروني وكلمة المرور', 'warning')
      return
    }
    try {
      setLoading(true)
      const data = await login(form.credential.trim(), form.password)
      showToast('تم تسجيل الدخول بنجاح', 'success')
      const role = data.user?.role
      if (role === 'admin') navigate('/admin/dashboard')
      else if (role === 'company') {
        const status = data.profile?.verificationStatus
        if (status === 'Approved') navigate('/company/dashboard')
        else navigate('/company/pending')
      } else {
        navigate('/candidate/dashboard')
      }
    } catch (err) {
      showToast(err.response?.data?.message || err.message || 'بيانات الدخول غير صحيحة', 'error')
    } finally {
      setLoading(false)
    }
  }

  return (
    <div style={{ minHeight: '70vh', display: 'flex', alignItems: 'center', justifyContent: 'center', padding: 'clamp(1.5rem, 4vw, 3rem) 1rem', background: 'var(--bg-page)' }}>
      <div style={{ width: '100%', maxWidth: 440 }}>
        <div className="card card-responsive">
          <div style={{ textAlign: 'center', marginBottom: '2rem' }}>
            <Link to="/" style={{ display: 'inline-block', marginBottom: '1rem' }}>
              <img
                src="/logo.png"
                alt={t('brandName')}
                style={{ height: '52px', width: 'auto', objectFit: 'contain', margin: '0 auto', display: 'block' }}
              />
            </Link>
            <h1 style={{ fontSize: '1.625rem', fontWeight: 800, color: 'var(--slate-900)', marginBottom: '0.25rem' }}>
              {isRtl ? 'تسجيل الدخول' : 'Login to Your Account'}
            </h1>
            <p style={{ fontSize: '0.9375rem', color: 'var(--slate-500)' }}>
              {isRtl ? 'أدخل رقم هاتفك أو بريدك الإلكتروني وكلمة المرور' : 'Enter your phone/email and password'}
            </p>
          </div>

          <form onSubmit={handleSubmit}>
            <div className="form-group">
              <label className="form-label">{isRtl ? 'رقم الهاتف أو البريد الإلكتروني' : 'Phone Number or Email'}</label>
              <input
                type="text"
                name="credential"
                className="form-control"
                placeholder={isRtl ? 'مثال: 01012345678 أو admin@asherjobs.com' : 'e.g. 01012345678 or email@example.com'}
                value={form.credential}
                onChange={handleChange}
                autoComplete="username"
                required
                dir="ltr"
                style={{ textAlign: isRtl ? 'right' : 'left' }}
              />
            </div>
            <div className="form-group">
              <label className="form-label">{t('password')}</label>
              <div style={{ position: 'relative' }}>
                <input
                  type={showPass ? 'text' : 'password'}
                  name="password"
                  className="form-control"
                  placeholder={isRtl ? '••••••••' : '••••••••'}
                  value={form.password}
                  onChange={handleChange}
                  autoComplete="current-password"
                  required
                  dir="ltr"
                  style={{ paddingInlineEnd: '2.75rem' }}
                />
                <button
                  type="button"
                  onClick={() => setShowPass(!showPass)}
                  style={{ position: 'absolute', top: '50%', [isRtl ? 'left' : 'right']: '0.75rem', transform: 'translateY(-50%)', background: 'none', border: 'none', cursor: 'pointer', color: 'var(--slate-400)' }}
                >
                  {showPass ? <EyeOff size={18} /> : <Eye size={18} />}
                </button>
              </div>
            </div>

            <button type="submit" className="btn btn-primary" disabled={loading} style={{ width: '100%', padding: '0.875rem', marginTop: '0.5rem', fontSize: '1rem' }}>
              {loading ? (isRtl ? 'جاري تسجيل الدخول...' : 'Logging in...') : (isRtl ? 'تسجيل الدخول' : 'Login')}
            </button>
          </form>

          <div style={{ marginTop: '1.5rem', textAlign: 'center', fontSize: '0.9375rem' }}>
            <p style={{ color: 'var(--slate-600)', marginBottom: '0.5rem' }}>
              {isRtl ? 'ليس لديك حساب؟' : "Don't have an account?"}
            </p>
            <div style={{ display: 'flex', justifyContent: 'center', gap: '1.5rem' }}>
              <Link to="/register/candidate" style={{ color: 'var(--accent)', fontWeight: 700 }}>
                {isRtl ? 'تسجيل كباحث عن عمل' : 'Job Seeker'}
              </Link>
              <Link to="/register/company" style={{ color: 'var(--emerald)', fontWeight: 700 }}>
                {isRtl ? 'تسجيل شركة' : 'Employer'}
              </Link>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}
