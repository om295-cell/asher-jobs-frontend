import React, { useState, useEffect } from 'react'
import { ShieldAlert, Globe, RefreshCw, MapPin } from 'lucide-react'

export default function GeoGuard({ children }) {
  const [checking, setChecking] = useState(true)
  const [isAllowed, setIsAllowed] = useState(true)
  const [detectedCountry, setDetectedCountry] = useState(null)
  const [detectedIp, setDetectedIp] = useState(null)

  const checkCountry = async () => {
    setChecking(true)

    // Support query param testing/simulation (e.g. ?test_country=US or ?test_country=EG)
    const urlParams = new URLSearchParams(window.location.search)
    const testCountry = urlParams.get('test_country')
    const bypassGeo = urlParams.get('bypass_geo')

    if (bypassGeo === '1') {
      setIsAllowed(true)
      setChecking(false)
      return
    }

    if (testCountry) {
      const allowed = testCountry.toUpperCase() === 'EG'
      setIsAllowed(allowed)
      setDetectedCountry(testCountry.toUpperCase())
      setChecking(false)
      return
    }

    // Check cached country in sessionStorage
    const cachedCountry = sessionStorage.getItem('asher_geo_country')
    if (cachedCountry) {
      const allowed = cachedCountry === 'EG'
      setIsAllowed(allowed)
      setDetectedCountry(cachedCountry)
      setChecking(false)
      if (allowed) return
    }

    try {
      // Primary check: api.country.is (fast HTTPS lookup)
      let country = null
      let ip = null

      try {
        const res = await fetch('https://api.country.is', { cache: 'no-cache' })
        if (res.ok) {
          const data = await res.json()
          country = data.country
          ip = data.ip
        }
      } catch (e) {
        // Fallback to ipwho.is
        try {
          const fbRes = await fetch('https://ipwho.is/', { cache: 'no-cache' })
          if (fbRes.ok) {
            const fbData = await fbRes.json()
            country = fbData.country_code
            ip = fbData.ip
          }
        } catch (fbErr) {
          console.warn('[GeoGuard] Failed to fetch geo info:', fbErr)
        }
      }

      if (country) {
        const normalized = country.toUpperCase()
        sessionStorage.setItem('asher_geo_country', normalized)
        setDetectedCountry(normalized)
        setDetectedIp(ip)
        setIsAllowed(normalized === 'EG')
      } else {
        // If geo-lookup service is completely unreachable (e.g. offline dev), allow access
        setIsAllowed(true)
      }
    } catch (err) {
      console.error('[GeoGuard] Unexpected error:', err)
      setIsAllowed(true)
    } finally {
      setChecking(false)
    }
  }

  useEffect(() => {
    checkCountry()
  }, [])

  if (checking) {
    return (
      <div style={{
        minHeight: '100vh',
        backgroundColor: '#0a0a0a',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        color: '#ffffff',
        fontFamily: 'system-ui, -apple-system, sans-serif'
      }}>
        <div style={{ textAlign: 'center' }}>
          <div style={{
            width: '40px',
            height: '40px',
            border: '3px solid rgba(255,255,255,0.1)',
            borderTopColor: '#ffffff',
            borderRadius: '50%',
            animation: 'spin 0.8s linear infinite',
            margin: '0 auto 1rem'
          }} />
          <style>{`@keyframes spin { 0% { transform: rotate(0deg); } 100% { transform: rotate(360deg); } }`}</style>
          <p style={{ color: '#a1a1aa', fontSize: '0.875rem' }}>جاري التحقق من الموقع الجغرافي...</p>
        </div>
      </div>
    )
  }

  if (!isAllowed) {
    return (
      <div dir="rtl" style={{
        minHeight: '100vh',
        backgroundColor: '#000000',
        color: '#ffffff',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        padding: '2rem 1rem',
        fontFamily: 'system-ui, -apple-system, "Segoe UI", Roboto, sans-serif',
        position: 'relative',
        overflow: 'hidden'
      }}>
        {/* Subtle background glow */}
        <div style={{
          position: 'absolute',
          top: '-20%',
          left: '50%',
          transform: 'translateX(-50%)',
          width: '600px',
          height: '600px',
          background: 'radial-gradient(circle, rgba(239, 68, 68, 0.12) 0%, rgba(0, 0, 0, 0) 70%)',
          pointerEvents: 'none'
        }} />

        <div style={{
          maxWidth: '540px',
          width: '100%',
          backgroundColor: '#111111',
          border: '1px solid rgba(255, 255, 255, 0.12)',
          borderRadius: '20px',
          padding: '3rem 2.5rem',
          textAlign: 'center',
          boxShadow: '0 25px 50px -12px rgba(0, 0, 0, 0.7)',
          position: 'relative',
          zIndex: 1
        }}>
          {/* Logo / Badge */}
          <div style={{ display: 'flex', justifyContent: 'center', alignItems: 'center', gap: '0.5rem', marginBottom: '1.75rem' }}>
            <img
              src="/A1 Jobs Monogram Logo.png"
              alt="Asher Jobs Logo"
              style={{ height: '48px', objectFit: 'contain' }}
              onError={(e) => { e.currentTarget.style.display = 'none' }}
            />
            <span style={{ fontSize: '1.4rem', fontWeight: 800, letterSpacing: '-0.5px' }}>
              عاشر <span style={{ color: '#38bdf8' }}>جوبز</span>
            </span>
          </div>

          {/* Restriction Icon */}
          <div style={{
            width: '76px',
            height: '76px',
            borderRadius: '50%',
            background: 'rgba(239, 68, 68, 0.12)',
            border: '2px solid rgba(239, 68, 68, 0.35)',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            margin: '0 auto 1.5rem',
            color: '#ef4444'
          }}>
            <ShieldAlert size={38} />
          </div>

          {/* Heading */}
          <h1 style={{
            fontSize: '1.65rem',
            fontWeight: 800,
            marginBottom: '0.75rem',
            lineHeight: 1.3
          }}>
            الموقع متاح داخل جمهورية مصر العربية فقط
          </h1>

          <p style={{
            fontSize: '1.1rem',
            color: '#e4e4e7',
            marginBottom: '1rem',
            direction: 'ltr',
            fontWeight: 600
          }}>
            Service Available in Egypt Only 🇪🇬
          </p>

          {/* Description */}
          <p style={{
            fontSize: '0.95rem',
            color: '#a1a1aa',
            lineHeight: 1.7,
            marginBottom: '2rem'
          }}>
            نعتذر منك، منصة <strong style={{ color: '#ffffff' }}>عاشر جوبز</strong> مخصصة حصرياً لخدمة الباحثين عن عمل والشركات والمصانع داخل جمهورية مصر العربية. تم تقييد الوصول من خارج مصر.
          </p>

          {/* Info pill */}
          {detectedCountry && (
            <div style={{
              display: 'inline-flex',
              alignItems: 'center',
              gap: '0.5rem',
              padding: '0.5rem 1rem',
              borderRadius: '9999px',
              backgroundColor: 'rgba(255, 255, 255, 0.05)',
              border: '1px solid rgba(255, 255, 255, 0.1)',
              fontSize: '0.85rem',
              color: '#d4d4d8',
              marginBottom: '2rem'
            }}>
              <Globe size={16} color="#71717a" />
              <span>الدولة المكتشفة: <strong>{detectedCountry}</strong></span>
              {detectedIp && <span style={{ color: '#71717a' }}>({detectedIp})</span>}
            </div>
          )}

          {/* Retry Button */}
          <div>
            <button
              onClick={() => {
                sessionStorage.removeItem('asher_geo_country')
                checkCountry()
              }}
              style={{
                display: 'inline-flex',
                alignItems: 'center',
                gap: '0.5rem',
                backgroundColor: '#ffffff',
                color: '#000000',
                border: 'none',
                padding: '0.75rem 1.75rem',
                borderRadius: '10px',
                fontWeight: 700,
                fontSize: '0.95rem',
                cursor: 'pointer',
                transition: 'opacity 0.2s'
              }}
              onMouseEnter={(e) => { e.currentTarget.style.opacity = '0.9' }}
              onMouseLeave={(e) => { e.currentTarget.style.opacity = '1' }}
            >
              <RefreshCw size={16} />
              إعادة التحقق من الموقع
            </button>
          </div>
        </div>
      </div>
    )
  }

  return children
}
