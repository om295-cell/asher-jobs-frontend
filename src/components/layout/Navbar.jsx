import React, { useState } from 'react';
import { Link, useNavigate, useLocation } from 'react-router-dom';
import {
  Briefcase,
  Globe,
  User,
  LogOut,
  Menu,
  X,
  Search,
  Users,
  Building2,
  FileCheck,
  Shield,
  Layers
} from 'lucide-react';
import { useAuth } from '../../context/AuthContext';
import { useLanguage } from '../../context/LanguageContext';

export default function Navbar() {
  const { user, profile, isAuthenticated, role, logout } = useAuth();
  const { t, lang, toggleLang, isRtl } = useLanguage();
  const navigate = useNavigate();
  const location = useLocation();
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);

  const handleLogout = async () => {
    await logout();
    navigate('/');
  };

  const isActive = (path) => location.pathname === path;

  // Automatically close mobile menu on route change
  useEffect(() => {
    setMobileMenuOpen(false);
  }, [location.pathname]);

  return (
    <header
      style={{
        backgroundColor: '#ffffff',
        borderBottom: '2px solid #000000',
        position: 'sticky',
        top: 0,
        zIndex: 100,
      }}
    >
      <div
        className="container"
        style={{
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'space-between',
          height: '70px',
          gap: '0.75rem'
        }}
      >
        {/* Brand Logo */}
        <Link to="/" style={{ display: 'flex', alignItems: 'center', gap: '0.75rem', textDecoration: 'none', flexShrink: 0 }}>
          <img
            src="/logo.png"
            alt={t('brandName')}
            style={{
              height: '40px',
              width: 'auto',
              maxHeight: '40px',
              objectFit: 'contain',
              display: 'block'
            }}
          />
          <div>
            <div style={{ fontSize: 'clamp(1.05rem, 3vw, 1.25rem)', fontWeight: 900, color: '#000000', lineHeight: 1.1 }}>
              {t('brandName')}
            </div>
            <div className="brand-subtitle" style={{ fontSize: '0.7rem', color: '#52525b', fontWeight: 600 }}>
              {isRtl ? 'العاشر من رمضان والمدن الصناعية' : '10th of Ramadan Industrial Jobs'}
            </div>
          </div>
        </Link>

        {/* Desktop Navigation */}
        <nav style={{ display: 'none', gap: '1.25rem', alignItems: 'center' }} className="desktop-nav">
          <Link
            to="/"
            style={{
              fontSize: '0.9375rem',
              fontWeight: 700,
              color: isActive('/') ? '#000000' : '#52525b',
              borderBottom: isActive('/') ? '2px solid #000000' : '2px solid transparent',
              paddingBottom: '2px',
              transition: 'all 0.15s'
            }}
          >
            {t('navHome')}
          </Link>
          <Link
            to="/how-it-works"
            style={{
              fontSize: '0.9375rem',
              fontWeight: 700,
              color: isActive('/how-it-works') ? '#000000' : '#52525b',
              borderBottom: isActive('/how-it-works') ? '2px solid #000000' : '2px solid transparent',
              paddingBottom: '2px',
            }}
          >
            {t('navHowItWorks')}
          </Link>
          <Link
            to="/about"
            style={{
              fontSize: '0.9375rem',
              fontWeight: 700,
              color: isActive('/about') ? '#000000' : '#52525b',
              borderBottom: isActive('/about') ? '2px solid #000000' : '2px solid transparent',
              paddingBottom: '2px',
            }}
          >
            {t('navAbout')}
          </Link>
          <Link
            to="/recommend"
            style={{
              fontSize: '0.9375rem',
              fontWeight: 700,
              color: isActive('/recommend') ? '#000000' : '#52525b',
              borderBottom: isActive('/recommend') ? '2px solid #000000' : '2px solid transparent',
              paddingBottom: '2px',
            }}
          >
            {isRtl ? 'ترشيح كوادر (11 كادر)' : 'Nominate Candidates'}
          </Link>

          {isAuthenticated && role === 'company' && (
            <>
              <Link
                to="/company/search"
                style={{
                  fontSize: '0.9375rem',
                  fontWeight: 700,
                  color: isActive('/company/search') ? '#000000' : '#52525b',
                  borderBottom: isActive('/company/search') ? '2px solid #000000' : '2px solid transparent',
                  paddingBottom: '2px',
                  display: 'flex',
                  alignItems: 'center',
                  gap: '0.35rem'
                }}
              >
                <Search size={16} />
                <span>{t('navFindCandidates')}</span>
              </Link>
              <Link
                to="/company/requests"
                style={{
                  fontSize: '0.9375rem',
                  fontWeight: 700,
                  color: isActive('/company/requests') ? '#000000' : '#52525b',
                  borderBottom: isActive('/company/requests') ? '2px solid #000000' : '2px solid transparent',
                  paddingBottom: '2px',
                }}
              >
                {t('navRequests')}
              </Link>
            </>
          )}

          {isAuthenticated && role === 'candidate' && (
            <>
              <Link
                to="/candidate/profile"
                style={{
                  fontSize: '0.9375rem',
                  fontWeight: 700,
                  color: isActive('/candidate/profile') ? '#000000' : '#52525b',
                  borderBottom: isActive('/candidate/profile') ? '2px solid #000000' : '2px solid transparent',
                  paddingBottom: '2px',
                }}
              >
                {t('navProfile')}
              </Link>
              <Link
                to="/candidate/referrals"
                style={{
                  fontSize: '0.9375rem',
                  fontWeight: 700,
                  color: isActive('/candidate/referrals') ? '#000000' : '#52525b',
                  borderBottom: isActive('/candidate/referrals') ? '2px solid #000000' : '2px solid transparent',
                  paddingBottom: '2px',
                }}
              >
                {t('navReferrals')}
              </Link>
            </>
          )}

          {isAuthenticated && role === 'admin' && (
            <>
              <Link
                to="/admin/candidates"
                style={{
                  fontSize: '0.9375rem',
                  fontWeight: 700,
                  color: isActive('/admin/candidates') ? '#000000' : '#52525b',
                  borderBottom: isActive('/admin/candidates') ? '2px solid #000000' : '2px solid transparent',
                  paddingBottom: '2px',
                }}
              >
                {t('navCandidates')}
              </Link>
              <Link
                to="/admin/companies"
                style={{
                  fontSize: '0.9375rem',
                  fontWeight: 700,
                  color: isActive('/admin/companies') ? '#000000' : '#52525b',
                  borderBottom: isActive('/admin/companies') ? '2px solid #000000' : '2px solid transparent',
                  paddingBottom: '2px',
                }}
              >
                {t('navCompanies')}
              </Link>
              <Link
                to="/admin/recommendations"
                style={{
                  fontSize: '0.9375rem',
                  fontWeight: 700,
                  color: isActive('/admin/recommendations') ? '#000000' : '#52525b',
                  borderBottom: isActive('/admin/recommendations') ? '2px solid #000000' : '2px solid transparent',
                  paddingBottom: '2px',
                }}
              >
                {isRtl ? 'طلبات الترشيح' : 'Nominations'}
              </Link>
            </>
          )}
        </nav>

        {/* Right Controls */}
        <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', flexShrink: 0 }}>
          <button
            className="btn btn-outline btn-sm"
            onClick={toggleLang}
            title={lang === 'ar' ? 'Switch to English' : 'التحويل للعربية'}
            style={{ padding: '0.35rem 0.6rem', fontSize: '0.8125rem' }}
          >
            <Globe size={15} />
            <span style={{ fontWeight: 700 }}>{lang === 'ar' ? 'English' : 'عربي'}</span>
          </button>

          {/* Desktop Auth State */}
          {!isAuthenticated ? (
            <div className="desktop-auth-actions" style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
              <Link to="/login" className="btn btn-outline btn-sm">
                {t('navLogin')}
              </Link>
              <Link to="/register/candidate" className="btn btn-primary btn-sm">
                {t('btnLookingForJob')}
              </Link>
            </div>
          ) : (
            <div className="desktop-auth-actions" style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
              <Link
                to={
                  role === 'admin'
                    ? '/admin/dashboard'
                    : role === 'company'
                    ? '/company/dashboard'
                    : '/candidate/dashboard'
                }
                className="btn btn-primary btn-sm"
                style={{ display: 'flex', alignItems: 'center', gap: '0.35rem' }}
              >
                <User size={15} />
                <span>{t('navDashboard')}</span>
              </Link>
              <button
                className="btn btn-outline btn-sm"
                onClick={handleLogout}
                title={t('navLogout')}
                style={{ padding: '0.35rem 0.5rem' }}
              >
                <LogOut size={16} />
              </button>
            </div>
          )}

          {/* Mobile hamburger menu toggle */}
          <button
            className="btn btn-outline btn-sm mobile-toggle"
            onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
            aria-label="Toggle navigation menu"
            style={{ padding: '0.4rem 0.5rem' }}
          >
            {mobileMenuOpen ? <X size={20} /> : <Menu size={20} />}
          </button>
        </div>
      </div>

      {/* Mobile Drawer Backdrop & Menu */}
      {mobileMenuOpen && (
        <>
          <div
            onClick={() => setMobileMenuOpen(false)}
            style={{
              position: 'fixed',
              inset: 0,
              top: '70px',
              backgroundColor: 'rgba(0, 0, 0, 0.5)',
              backdropFilter: 'blur(2px)',
              zIndex: 99
            }}
          />
          <div
            style={{
              position: 'absolute',
              top: '70px',
              left: 0,
              right: 0,
              backgroundColor: '#ffffff',
              borderBottom: '2px solid #000000',
              padding: '1.25rem',
              display: 'flex',
              flexDirection: 'column',
              gap: '0.5rem',
              maxHeight: 'calc(100vh - 70px)',
              overflowY: 'auto',
              zIndex: 100,
              boxShadow: 'var(--shadow-xl)',
              animation: 'modalIn 0.15s ease-out'
            }}
          >
            {/* Core Links */}
            <div style={{ display: 'flex', flexDirection: 'column', gap: '0.25rem', borderBottom: '1px solid #e4e4e7', paddingBottom: '0.75rem' }}>
              <Link to="/" onClick={() => setMobileMenuOpen(false)} style={{ padding: '0.5rem 0.75rem', fontWeight: 700, color: '#000000', borderRadius: '6px', background: isActive('/') ? '#f4f4f5' : 'transparent' }}>
                {t('navHome')}
              </Link>
              <Link to="/how-it-works" onClick={() => setMobileMenuOpen(false)} style={{ padding: '0.5rem 0.75rem', fontWeight: 700, color: '#000000', borderRadius: '6px', background: isActive('/how-it-works') ? '#f4f4f5' : 'transparent' }}>
                {t('navHowItWorks')}
              </Link>
              <Link to="/about" onClick={() => setMobileMenuOpen(false)} style={{ padding: '0.5rem 0.75rem', fontWeight: 700, color: '#000000', borderRadius: '6px', background: isActive('/about') ? '#f4f4f5' : 'transparent' }}>
                {t('navAbout')}
              </Link>
              <Link to="/recommend" onClick={() => setMobileMenuOpen(false)} style={{ padding: '0.5rem 0.75rem', fontWeight: 700, color: '#000000', borderRadius: '6px', background: isActive('/recommend') ? '#f4f4f5' : 'transparent' }}>
                {isRtl ? 'ترشيح كوادر (11 كادر)' : 'Nominate Candidates'}
              </Link>
            </div>

            {/* Role Links */}
            {isAuthenticated && (
              <div style={{ display: 'flex', flexDirection: 'column', gap: '0.25rem', borderBottom: '1px solid #e4e4e7', paddingBottom: '0.75rem' }}>
                {role === 'company' && (
                  <>
                    <Link to="/company/search" onClick={() => setMobileMenuOpen(false)} style={{ padding: '0.5rem 0.75rem', fontWeight: 700, color: '#000000', borderRadius: '6px', display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                      <Search size={16} />
                      {t('navFindCandidates')}
                    </Link>
                    <Link to="/company/requests" onClick={() => setMobileMenuOpen(false)} style={{ padding: '0.5rem 0.75rem', fontWeight: 700, color: '#000000', borderRadius: '6px' }}>
                      {t('navRequests')}
                    </Link>
                  </>
                )}
                {role === 'candidate' && (
                  <>
                    <Link to="/candidate/profile" onClick={() => setMobileMenuOpen(false)} style={{ padding: '0.5rem 0.75rem', fontWeight: 700, color: '#000000', borderRadius: '6px' }}>
                      {t('navProfile')}
                    </Link>
                    <Link to="/candidate/cv" onClick={() => setMobileMenuOpen(false)} style={{ padding: '0.5rem 0.75rem', fontWeight: 700, color: '#000000', borderRadius: '6px' }}>
                      {isRtl ? 'السيرة الذاتية (CV)' : 'View CV'}
                    </Link>
                    <Link to="/candidate/referrals" onClick={() => setMobileMenuOpen(false)} style={{ padding: '0.5rem 0.75rem', fontWeight: 700, color: '#000000', borderRadius: '6px' }}>
                      {t('navReferrals')}
                    </Link>
                  </>
                )}
                {role === 'admin' && (
                  <>
                    <Link to="/admin/candidates" onClick={() => setMobileMenuOpen(false)} style={{ padding: '0.5rem 0.75rem', fontWeight: 700, color: '#000000', borderRadius: '6px' }}>
                      {t('navCandidates')}
                    </Link>
                    <Link to="/admin/companies" onClick={() => setMobileMenuOpen(false)} style={{ padding: '0.5rem 0.75rem', fontWeight: 700, color: '#000000', borderRadius: '6px' }}>
                      {t('navCompanies')}
                    </Link>
                    <Link to="/admin/recommendations" onClick={() => setMobileMenuOpen(false)} style={{ padding: '0.5rem 0.75rem', fontWeight: 700, color: '#000000', borderRadius: '6px' }}>
                      {isRtl ? 'طلبات الترشيح' : 'Nominations'}
                    </Link>
                  </>
                )}
              </div>
            )}

            {/* Auth Actions in Drawer */}
            {!isAuthenticated ? (
              <div style={{ display: 'flex', flexDirection: 'column', gap: '0.625rem', marginTop: '0.5rem' }}>
                <Link to="/login" onClick={() => setMobileMenuOpen(false)} className="btn btn-outline" style={{ width: '100%' }}>
                  {t('navLogin')}
                </Link>
                <Link to="/register/candidate" onClick={() => setMobileMenuOpen(false)} className="btn btn-primary" style={{ width: '100%' }}>
                  {t('navRegisterCandidate')}
                </Link>
                <Link to="/register/company" onClick={() => setMobileMenuOpen(false)} className="btn btn-outline" style={{ width: '100%' }}>
                  {t('navRegisterCompany')}
                </Link>
              </div>
            ) : (
              <div style={{ display: 'flex', flexDirection: 'column', gap: '0.625rem', marginTop: '0.5rem' }}>
                <Link
                  to={role === 'admin' ? '/admin/dashboard' : role === 'company' ? '/company/dashboard' : '/candidate/dashboard'}
                  onClick={() => setMobileMenuOpen(false)}
                  className="btn btn-primary"
                  style={{ width: '100%' }}
                >
                  <User size={16} />
                  <span>{t('navDashboard')}</span>
                </Link>
                <button onClick={handleLogout} className="btn btn-outline" style={{ width: '100%' }}>
                  <LogOut size={16} />
                  <span>{t('navLogout')}</span>
                </button>
              </div>
            )}
          </div>
        </>
      )}

      <style>{`
        @media (min-width: 1024px) {
          .desktop-nav {
            display: flex !important;
          }
          .mobile-toggle {
            display: none !important;
          }
          .desktop-auth-actions {
            display: flex !important;
          }
        }
        @media (max-width: 1023px) {
          .desktop-nav {
            display: none !important;
          }
          .mobile-toggle {
            display: inline-flex !important;
          }
        }
        @media (max-width: 768px) {
          .desktop-auth-actions {
            display: none !important;
          }
        }
        @media (max-width: 440px) {
          .brand-subtitle {
            display: none !important;
          }
        }
      `}</style>
    </header>
  );
}
