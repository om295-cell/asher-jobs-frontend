import React from 'react'
import { Link } from 'react-router-dom'
import { Home, AlertCircle } from 'lucide-react'
import { useLanguage } from '../../context/LanguageContext'

export default function NotFoundPage() {
  const { isRtl } = useLanguage()
  return (
    <div style={{ minHeight: '70vh', display: 'flex', alignItems: 'center', justifyContent: 'center', padding: '3rem 1rem', flexDirection: 'column', textAlign: 'center' }}>
      <AlertCircle size={64} style={{ color: 'var(--rose)', marginBottom: '1.5rem', opacity: 0.7 }} />
      <h1 style={{ fontSize: '4rem', fontWeight: 900, color: 'var(--slate-200)', lineHeight: 1 }}>404</h1>
      <h2 style={{ fontSize: '1.5rem', fontWeight: 700, color: 'var(--slate-800)', margin: '0.75rem 0 0.5rem' }}>
        {isRtl ? 'الصفحة غير موجودة' : 'Page Not Found'}
      </h2>
      <p style={{ color: 'var(--slate-500)', marginBottom: '2rem', maxWidth: 400 }}>
        {isRtl ? 'عذراً، الصفحة التي تبحث عنها غير موجودة أو تم نقلها.' : 'The page you are looking for does not exist or has been moved.'}
      </p>
      <Link to="/" style={{ display: 'inline-flex', alignItems: 'center', gap: '0.5rem', padding: '0.75rem 1.5rem', background: 'var(--primary)', color: '#fff', borderRadius: 'var(--radius-md)', fontWeight: 700, textDecoration: 'none' }}>
        <Home size={18} />
        {isRtl ? 'العودة للرئيسية' : 'Back to Home'}
      </Link>
    </div>
  )
}
