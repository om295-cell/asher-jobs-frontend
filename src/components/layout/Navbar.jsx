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
          height: '70px'
        }}
      >
        {/* Brand Logo */}
        <Link to="/" style={{ display: 'flex', alignItems: 'center', gap: '0.75rem', textDecoration: 'none' }}>
          <img
            src="/logo.png"
            alt={t('brandName')}
            style={{
              height: '42px',
              width: 'auto',
              maxHeight: '42px',
              objectFit: 'contain',
              display: 'block'
            }}
          />
          <div>
            <div style={{ fontSize: '1.25rem', fontWeight: 900, color: '#000000', lineHeight: 1.1 }}>
              {t('brandName')}
            </div>
            <div style={{ fontSize: '0.7rem', color: '#52525b', fontWeight: 600 }}>
              {isRtl ? 'العاشر من رمضان والمدن الصناعية' : '10th of Ramadan Industrial Jobs'}
            </div>
          </div>
        </Link>

        {/* Desktop Navigation */}
        <nav style={{ display: 'none', gap: '1.5rem', alignItems: 'center' }} className="desktop-nav">
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
        <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem' }}>
          <button
            className="btn btn-outline btn-sm"
            onClick={toggleLang}
            title={lang === 'ar' ? 'Switch to English' : 'التحويل للعربية'}
            style={{ padding: '0.4rem 0.65rem' }}
          >
            <Globe size={16} />
            <span style={{ fontWeight: 700 }}>{lang === 'ar' ? 'English' : 'عربي'}</span>
          </button>

          {/* Auth State */}
          {!isAuthenticated ? (
            <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
              <Link to="/login" className="btn btn-outline btn-sm">
                {t('navLogin')}
              </Link>
              <Link to="/register/candidate" className="btn btn-primary btn-sm">
                {t('btnLookingForJob')}
              </Link>
            </div>
          ) : (
            <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
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
              >
                <LogOut size={16} />
              </button>
            </div>
          )}

          {/* Mobile hamburger menu toggle */}
          <button
            className="btn btn-outline btn-sm mobile-toggle"
            onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
            style={{ display: 'none', padding: '0.4rem 0.5rem' }}
          >
            {mobileMenuOpen ? <X size={20} /> : <Menu size={20} />}
          </button>
        </div>
      </div>

      {/* Mobile Drawer */}
      {mobileMenuOpen && (
        <div
          style={{
            backgroundColor: '#ffffff',
            borderTop: '1px solid #000000',
            padding: '1rem 1.25rem',
            display: 'flex',
            flexDirection: 'column',
            gap: '0.75rem'
          }}
        >
          <Link to="/" onClick={() => setMobileMenuOpen(false)} style={{ padding: '0.5rem 0', fontWeight: 700, color: '#000000' }}>
            {t('navHome')}
          </Link>
          <Link to="/how-it-works" onClick={() => setMobileMenuOpen(false)} style={{ padding: '0.5rem 0', fontWeight: 700, color: '#000000' }}>
            {t('navHowItWorks')}
          </Link>
          <Link to="/about" onClick={() => setMobileMenuOpen(false)} style={{ padding: '0.5rem 0', fontWeight: 700, color: '#000000' }}>
            {t('navAbout')}
          </Link>
          <Link to="/recommend" onClick={() => setMobileMenuOpen(false)} style={{ padding: '0.5rem 0', fontWeight: 700, color: '#000000' }}>
            {isRtl ? 'ترشيح كوادر (11 كادر)' : 'Nominate Candidates'}
          </Link>

          {!isAuthenticated ? (
            <div style={{ display: 'flex', flexDirection: 'column', gap: '0.5rem', marginTop: '0.5rem' }}>
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
            <div style={{ display: 'flex', flexDirection: 'column', gap: '0.5rem', marginTop: '0.5rem' }}>
              <Link
                to={role === 'admin' ? '/admin/dashboard' : role === 'company' ? '/company/dashboard' : '/candidate/dashboard'}
                onClick={() => setMobileMenuOpen(false)}
                className="btn btn-primary"
                style={{ width: '100%' }}
              >
                {t('navDashboard')}
              </Link>
              <button onClick={handleLogout} className="btn btn-outline" style={{ width: '100%' }}>
                {t('navLogout')}
              </button>
            </div>
          )}
        </div>
      )}

      <style>{`
        @media (min-width: 768px) {
          .desktop-nav {
            display: flex !important;
          }
          .mobile-toggle {
            display: none !important;
          }
        }
        @media (max-width: 767px) {
          .mobile-toggle {
            display: inline-flex !important;
          }
        }
      `}</style>
    </header>
  );
}
