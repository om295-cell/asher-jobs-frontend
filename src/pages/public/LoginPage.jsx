import React, { useState, useEffect, useRef, useCallback } from 'react'
import { Link, useNavigate } from 'react-router-dom'
import { LogIn, Eye, EyeOff, ShieldAlert, Clock } from 'lucide-react'
import { useAuth } from '../../context/AuthContext'
import { useToast } from '../../context/ToastContext'
import { useLanguage } from '../../context/LanguageContext'

// ─── Client-side brute-force / DDoS protection constants ─────────────────────
const MAX_ATTEMPTS_BEFORE_LOCKOUT = 3   // lock after 3 consecutive failures
const BASE_LOCKOUT_SECONDS = 30         // 30s → 60s → 120s → 240s (exponential)
const MAX_LOCKOUT_SECONDS = 600         // cap at 10 minutes

function getLockoutSeconds(failCount) {
  if (failCount <= MAX_ATTEMPTS_BEFORE_LOCKOUT) return 0
  const tier = failCount - MAX_ATTEMPTS_BEFORE_LOCKOUT
  return Math.min(BASE_LOCKOUT_SECONDS * Math.pow(2, tier - 1), MAX_LOCKOUT_SECONDS)
}

export default function LoginPage() {
  const { login } = useAuth()
  const { showToast } = useToast()
  const { t, isRtl } = useLanguage()
  const navigate = useNavigate()

  const [form, setForm] = useState({ credential: '', password: '' })
  const [showPass, setShowPass] = useState(false)
  const [loading, setLoading] = useState(false)

  // ── Brute-force tracking ────────────────────────────────────────────────────
  const [failCount, setFailCount]       = useState(0)
  const [lockoutEnd, setLockoutEnd]     = useState(null)   // Date timestamp
  const [countdown, setCountdown]       = useState(0)      // remaining seconds
  const timerRef = useRef(null)

  // Countdown ticker
  useEffect(() => {
    if (!lockoutEnd) return
    timerRef.current = setInterval(() => {
      const remaining = Math.ceil((lockoutEnd - Date.now()) / 1000)
      if (remaining <= 0) {
        setCountdown(0)
        setLockoutEnd(null)
        clearInterval(timerRef.current)
      } else {
        setCountdown(remaining)
      }
    }, 500)
    return () => clearInterval(timerRef.current)
  }, [lockoutEnd])

  const isLockedOut = lockoutEnd && Date.now() < lockoutEnd

  const handleChange = (e) => setForm(prev => ({ ...prev, [e.target.name]: e.target.value }))

  const handleSubmit = useCallback(async (e) => {
    e.preventDefault()

    // Client-side lockout gate — reject without hitting the server
    if (isLockedOut) {
      showToast(
        isRtl
          ? `محاولات كثيرة جداً. يرجى الانتظار ${countdown} ثانية.`
          : `Too many attempts. Wait ${countdown}s before trying again.`,
        'error'
      )
      return
    }

    if (!form.credential.trim() || !form.password) {
      showToast(
        isRtl ? 'يرجى إدخال رقم الهاتف أو البريد الإلكتروني وكلمة المرور' : 'Please enter your phone/email and password',
        'warning'
      )
      return
    }

    try {
      setLoading(true)
      const data = await login(form.credential.trim(), form.password)

      // Successful login — clear failure counters
      setFailCount(0)
      setLockoutEnd(null)
      setCountdown(0)

      showToast(isRtl ? 'تم تسجيل الدخول بنجاح' : 'Logged in successfully', 'success')
      const role = data.user?.role
      if (role === 'admin') navigate('/admin/dashboard')
      else if (role === 'company') {
        const status = data.profile?.verificationStatus
        if (status === 'Approved') navigate('/company/search')
        else navigate('/company/pending')
      } else {
        navigate('/candidate/dashboard')
      }

    } catch (err) {
      // Track failure and apply progressive lockout
      const newFail = failCount + 1
      setFailCount(newFail)

      const lockSecs = getLockoutSeconds(newFail)
      if (lockSecs > 0) {
        setLockoutEnd(Date.now() + lockSecs * 1000)
        setCountdown(lockSecs)
        showToast(
          isRtl
            ? `محاولات متكررة. يتم حظر الجهاز لمدة ${lockSecs} ثانية.`
            : `Too many failed attempts. Device locked for ${lockSecs}s.`,
          'error'
        )
      } else {
        const attemptsLeft = MAX_ATTEMPTS_BEFORE_LOCKOUT - newFail
        const msg = err.response?.data?.message || err.message || (isRtl ? 'بيانات الدخول غير صحيحة' : 'Invalid credentials')
        showToast(
          attemptsLeft > 0
            ? `${msg} (${isRtl ? `تبقى ${attemptsLeft} محاولة` : `${attemptsLeft} attempt${attemptsLeft !== 1 ? 's' : ''} left`})`
            : msg,
          'error'
        )
      }
    } finally {
      setLoading(false)
    }
  }, [form, failCount, isLockedOut, countdown, isRtl, login, navigate, showToast])

  const isDisabled = loading || !!isLockedOut

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

          {/* ── Lockout warning banner ─────────────────────────────────────── */}
          {isLockedOut && (
            <div style={{
              display: 'flex', alignItems: 'center', gap: '0.6rem',
              background: '#fff1f2', border: '1px solid #fecdd3', borderRadius: '0.5rem',
              padding: '0.75rem 1rem', marginBottom: '1.25rem', color: '#be123c'
            }}>
              <ShieldAlert size={18} style={{ flexShrink: 0 }} />
              <span style={{ fontSize: '0.875rem', fontWeight: 600, flex: 1 }}>
                {isRtl
                  ? `تم تأمين النموذج مؤقتاً بسبب المحاولات المتكررة`
                  : `Form temporarily locked due to repeated failed attempts`}
              </span>
              <span style={{ display: 'flex', alignItems: 'center', gap: '0.25rem', fontWeight: 700, fontSize: '0.9rem', flexShrink: 0 }}>
                <Clock size={15} />
                {countdown}s
              </span>
            </div>
          )}

          {/* ── Failure warning (below threshold) ─────────────────────────── */}
          {!isLockedOut && failCount > 0 && failCount <= MAX_ATTEMPTS_BEFORE_LOCKOUT && (
            <div style={{
              display: 'flex', alignItems: 'center', gap: '0.5rem',
              background: '#fffbeb', border: '1px solid #fde68a', borderRadius: '0.5rem',
              padding: '0.65rem 1rem', marginBottom: '1rem', color: '#92400e',
              fontSize: '0.8125rem', fontWeight: 500
            }}>
              <ShieldAlert size={15} style={{ flexShrink: 0 }} />
              {isRtl
                ? `تحذير: تبقى ${MAX_ATTEMPTS_BEFORE_LOCKOUT - failCount} محاولة قبل الحظر المؤقت`
                : `Warning: ${MAX_ATTEMPTS_BEFORE_LOCKOUT - failCount} attempt${MAX_ATTEMPTS_BEFORE_LOCKOUT - failCount !== 1 ? 's' : ''} left before temporary lockout`}
            </div>
          )}

          <form onSubmit={handleSubmit} noValidate>
            <div className="form-group">
              <label className="form-label">{isRtl ? 'رقم الهاتف أو البريد الإلكتروني' : 'Phone Number or Email'}</label>
              <input
                type="text"
                name="credential"
                className="form-control"
                placeholder={isRtl ? 'مثال: 01012345678 أو user@example.com' : 'e.g. 01012345678 or email@example.com'}
                value={form.credential}
                onChange={handleChange}
                autoComplete="username"
                required
                disabled={isDisabled}
                dir="ltr"
                style={{ textAlign: isRtl ? 'right' : 'left', opacity: isDisabled ? 0.6 : 1 }}
              />
            </div>
            <div className="form-group">
              <label className="form-label">{t('password')}</label>
              <div style={{ position: 'relative' }}>
                <input
                  type={showPass ? 'text' : 'password'}
                  name="password"
                  className="form-control"
                  placeholder="••••••••"
                  value={form.password}
                  onChange={handleChange}
                  autoComplete="current-password"
                  required
                  disabled={isDisabled}
                  dir="ltr"
                  style={{ paddingInlineEnd: '2.75rem', opacity: isDisabled ? 0.6 : 1 }}
                />
                <button
                  type="button"
                  onClick={() => setShowPass(!showPass)}
                  disabled={isDisabled}
                  style={{ position: 'absolute', top: '50%', [isRtl ? 'left' : 'right']: '0.75rem', transform: 'translateY(-50%)', background: 'none', border: 'none', cursor: isDisabled ? 'not-allowed' : 'pointer', color: 'var(--slate-400)' }}
                >
                  {showPass ? <EyeOff size={18} /> : <Eye size={18} />}
                </button>
              </div>
            </div>

            <button
              type="submit"
              className="btn btn-primary"
              disabled={isDisabled}
              style={{ width: '100%', padding: '0.875rem', marginTop: '0.5rem', fontSize: '1rem', opacity: isDisabled ? 0.7 : 1, cursor: isDisabled ? 'not-allowed' : 'pointer', transition: 'opacity 0.2s' }}
            >
              {loading
                ? (isRtl ? 'جاري تسجيل الدخول...' : 'Logging in...')
                : isLockedOut
                  ? (isRtl ? `محظور لمدة ${countdown}s` : `Locked for ${countdown}s`)
                  : (isRtl ? 'تسجيل الدخول' : 'Login')}
            </button>
          </form>
        </div>
      </div>
    </div>
  )
}
