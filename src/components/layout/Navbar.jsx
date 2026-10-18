import React, { useState, useEffect } from 'react';
import { Link, useNavigate, useLocation } from 'react-router-dom';
import {
  Activity,
  AlertCircle,
  Briefcase,
  Building2,
  ChevronDown,
  ExternalLink,
  FileCheck,
  FileText,
  Globe,
  LayoutDashboard,
  LogOut,
  Menu,
  Search,
  Settings,
  Shield,
  User,
  Users,
  Bell,
  X,
  ShoppingCart,
  Sparkles
} from 'lucide-react';
import { useAuth } from '../../context/AuthContext';
import { useLanguage } from '../../context/LanguageContext';
import { adminNotificationApi } from '../../api/adminNotification.api';

export default function Navbar() {
  const { user, isAuthenticated, role, logout } = useAuth();
  const { t, lang, toggleLang, isRtl } = useLanguage();
  const navigate = useNavigate();
  const location = useLocation();
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const [adminMoreOpen, setAdminMoreOpen] = useState(false);
  const [unreadNotificationsCount, setUnreadNotificationsCount] = useState(0);

  const isAdmin = isAuthenticated && role === 'admin';

  useEffect(() => {
    if (isAdmin) {
      adminNotificationApi
        .getBadgeCounts()
        .then((res) => setUnreadNotificationsCount(res.data?.data?.unreadCount || 0))
        .catch(() => {});
    }
  }, [isAdmin, location.pathname]);

  const handleLogout = async () => {
    await logout();
    navigate('/');
  };

  const isActive = (path) => location.pathname === path;

  // Automatically close menus on route change
  useEffect(() => {
    setMobileMenuOpen(false);
    setAdminMoreOpen(false);
  }, [location.pathname]);

  // Close admin "More" dropdown when clicking outside
  useEffect(() => {
    const handleOutsideClick = (e) => {
      if (adminMoreOpen && !e.target.closest?.('.admin-more-dropdown')) {
        setAdminMoreOpen(false);
      }
    };
    document.addEventListener('click', handleOutsideClick);
    return () => document.removeEventListener('click', handleOutsideClick);
  }, [adminMoreOpen]);

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
          gap: '0.75rem',
          maxWidth: isAdmin ? '1440px' : '1200px'
        }}
      >
        {/* Brand Logo */}
        <Link
          to={isAdmin ? '/admin/dashboard' : '/'}
          style={{ display: 'flex', alignItems: 'center', gap: '0.65rem', textDecoration: 'none', flexShrink: 0 }}
        >
          <img
            src="/logo.png"
            alt={t('brandName')}
            style={{
              height: '38px',
              width: 'auto',
              maxHeight: '38px',
              objectFit: 'contain',
              display: 'block'
            }}
          />
          <div>
            <div style={{ display: 'flex', alignItems: 'center', gap: '0.45rem', lineHeight: 1.1 }}>
              <span style={{ fontSize: 'clamp(1.05rem, 3vw, 1.25rem)', fontWeight: 900, color: '#000000' }}>
                {t('brandName')}
              </span>
              {isAdmin && (
                <span
                  style={{
                    fontSize: '0.68rem',
                    background: '#09090b',
                    color: '#ffffff',
                    padding: '0.15rem 0.45rem',
                    borderRadius: '4px',
                    fontWeight: 800,
                    display: 'inline-flex',
                    alignItems: 'center',
                    gap: '0.25rem',
                    letterSpacing: '0.02em'
                  }}
                >
                  <Shield size={11} /> {isRtl ? 'لوحة الإدارة' : 'Admin'}
                </span>
              )}
            </div>
            <div className="brand-subtitle" style={{ fontSize: '0.7rem', color: '#52525b', fontWeight: 600 }}>
              {isAdmin
                ? (isRtl ? 'الإدارة والتحكم المركزي' : 'Central Admin Portal')
                : (isRtl ? 'العاشر من رمضان والمدن الصناعية' : '10th of Ramadan Industrial Jobs')}
            </div>
          </div>
        </Link>

        {/* Desktop Navigation */}
        {isAdmin ? (
          /* SUPER ADMIN DESKTOP NAVIGATION */
          <nav style={{ display: 'none', gap: '0.35rem', alignItems: 'center' }} className="desktop-nav">
            <Link
              to="/admin/dashboard"
              style={{
                fontSize: '0.84rem',
                fontWeight: 700,
                color: isActive('/admin/dashboard') ? '#000000' : '#52525b',
                background: isActive('/admin/dashboard') ? '#f4f4f5' : 'transparent',
                padding: '0.35rem 0.6rem',
                borderRadius: '6px',
                display: 'flex',
                alignItems: 'center',
                gap: '0.35rem',
                textDecoration: 'none',
                transition: 'all 0.15s'
              }}
            >
              <LayoutDashboard size={15} />
              <span>{isRtl ? 'لوحة التحكم' : 'Dashboard'}</span>
            </Link>

            <Link
              to="/admin/candidates"
              style={{
                fontSize: '0.84rem',
                fontWeight: 700,
                color: location.pathname.startsWith('/admin/candidates') ? '#000000' : '#52525b',
                background: location.pathname.startsWith('/admin/candidates') ? '#f4f4f5' : 'transparent',
                padding: '0.35rem 0.6rem',
                borderRadius: '6px',
                display: 'flex',
                alignItems: 'center',
                gap: '0.35rem',
                textDecoration: 'none',
                transition: 'all 0.15s'
              }}
            >
              <Users size={15} />
              <span>{isRtl ? 'المرشحون' : 'Candidates'}</span>
            </Link>

            <Link
              to="/admin/companies"
              style={{
                fontSize: '0.84rem',
                fontWeight: 700,
                color: location.pathname.startsWith('/admin/companies') ? '#000000' : '#52525b',
                background: location.pathname.startsWith('/admin/companies') ? '#f4f4f5' : 'transparent',
                padding: '0.35rem 0.6rem',
                borderRadius: '6px',
                display: 'flex',
                alignItems: 'center',
                gap: '0.35rem',
                textDecoration: 'none',
                transition: 'all 0.15s'
              }}
            >
              <Building2 size={15} />
              <span>{isRtl ? 'الشركات والمصانع' : 'Companies'}</span>
            </Link>

            <Link
              to="/admin/jobs"
              style={{
                fontSize: '0.84rem',
                fontWeight: 700,
                color: location.pathname.startsWith('/admin/jobs') ? '#000000' : '#52525b',
                background: location.pathname.startsWith('/admin/jobs') ? '#f4f4f5' : 'transparent',
                padding: '0.35rem 0.6rem',
                borderRadius: '6px',
                display: 'flex',
                alignItems: 'center',
                gap: '0.35rem',
                textDecoration: 'none',
                transition: 'all 0.15s'
              }}
            >
              <Briefcase size={15} />
              <span>{isRtl ? 'الوظائف والمراجعة' : 'Jobs & Catalog'}</span>
            </Link>

            <Link
              to="/admin/recommendations"
              style={{
                fontSize: '0.84rem',
                fontWeight: 700,
                color: location.pathname.startsWith('/admin/recommendations') ? '#000000' : '#52525b',
                background: location.pathname.startsWith('/admin/recommendations') ? '#f4f4f5' : 'transparent',
                padding: '0.35rem 0.6rem',
                borderRadius: '6px',
                display: 'flex',
                alignItems: 'center',
                gap: '0.35rem',
                textDecoration: 'none',
                transition: 'all 0.15s'
              }}
            >
              <FileCheck size={15} />
              <span>{isRtl ? 'طلبات الترشيح' : 'Nominations'}</span>
            </Link>

            <Link
              to="/admin/notifications"
              style={{
                fontSize: '0.84rem',
                fontWeight: 700,
                color: location.pathname.startsWith('/admin/notifications') ? '#000000' : '#52525b',
                background: location.pathname.startsWith('/admin/notifications') ? '#f4f4f5' : 'transparent',
                padding: '0.35rem 0.6rem',
                borderRadius: '6px',
                display: 'flex',
                alignItems: 'center',
                gap: '0.35rem',
                textDecoration: 'none',
                transition: 'all 0.15s',
                position: 'relative'
              }}
            >
              <Bell size={15} />
              <span>{isRtl ? 'الإشعارات والتدقيق' : 'Notifications'}</span>
              {unreadNotificationsCount > 0 && (
                <span
                  style={{
                    background: '#ef4444',
                    color: '#ffffff',
                    fontSize: '0.65rem',
                    fontWeight: 900,
                    padding: '0.1rem 0.35rem',
                    borderRadius: '999px',
                    lineHeight: 1
                  }}
                >
                  {unreadNotificationsCount}
                </span>
              )}
            </Link>

            {/* Admin More Dropdown */}
            <div className="admin-more-dropdown" style={{ position: 'relative' }}>
              <button
                type="button"
                onClick={(e) => {
                  e.stopPropagation();
                  setAdminMoreOpen(!adminMoreOpen);
                }}
                className="btn"
                style={{
                  fontSize: '0.84rem',
                  fontWeight: 700,
                  color: ['/admin/recruitment-requests', '/admin/reports', '/admin/activity', '/admin/settings'].some((p) => location.pathname.startsWith(p)) ? '#000000' : '#52525b',
                  background: ['/admin/recruitment-requests', '/admin/reports', '/admin/activity', '/admin/settings'].some((p) => location.pathname.startsWith(p)) ? '#f4f4f5' : 'transparent',
                  padding: '0.35rem 0.6rem',
                  borderRadius: '6px',
                  display: 'flex',
                  alignItems: 'center',
                  gap: '0.25rem',
                  border: 'none',
                  cursor: 'pointer'
                }}
              >
                <Settings size={15} />
                <span>{isRtl ? 'المزيد' : 'More'}</span>
                <ChevronDown size={13} style={{ transform: adminMoreOpen ? 'rotate(180deg)' : 'none', transition: 'transform 0.15s' }} />
              </button>

              {adminMoreOpen && (
                <div
                  onClick={(e) => e.stopPropagation()}
                  style={{
                    position: 'absolute',
                    top: 'calc(100% + 8px)',
                    [isRtl ? 'left' : 'right']: 0,
                    background: '#ffffff',
                    border: '1px solid #e4e4e7',
                    borderRadius: '8px',
                    boxShadow: '0 10px 25px -5px rgba(0,0,0,0.1), 0 8px 10px -6px rgba(0,0,0,0.1)',
                    minWidth: '200px',
                    padding: '0.35rem',
                    zIndex: 150,
                    display: 'flex',
                    flexDirection: 'column',
                    gap: '0.2rem',
                    textAlign: isRtl ? 'right' : 'left'
                  }}
                >
                  <Link
                    to="/admin/recruitment-requests"
                    onClick={() => setAdminMoreOpen(false)}
                    style={{
                      padding: '0.5rem 0.65rem',
                      fontSize: '0.8125rem',
                      fontWeight: 600,
                      color: '#18181b',
                      borderRadius: '5px',
                      textDecoration: 'none',
                      display: 'flex',
                      alignItems: 'center',
                      gap: '0.5rem',
                      background: isActive('/admin/recruitment-requests') ? '#f4f4f5' : 'transparent'
                    }}
                  >
                    <FileText size={15} />
                    <span>{isRtl ? 'طلبات التوظيف' : 'Recruitment Requests'}</span>
                  </Link>
                  <Link
                    to="/admin/reports"
                    onClick={() => setAdminMoreOpen(false)}
                    style={{
                      padding: '0.5rem 0.65rem',
                      fontSize: '0.8125rem',
                      fontWeight: 600,
                      color: '#18181b',
                      borderRadius: '5px',
                      textDecoration: 'none',
                      display: 'flex',
                      alignItems: 'center',
                      gap: '0.5rem',
                      background: isActive('/admin/reports') ? '#f4f4f5' : 'transparent'
                    }}
                  >
                    <AlertCircle size={15} />
                    <span>{isRtl ? 'البلاغات والشكاوى' : 'Issue Reports'}</span>
                  </Link>
                  <Link
                    to="/admin/activity"
                    onClick={() => setAdminMoreOpen(false)}
                    style={{
                      padding: '0.5rem 0.65rem',
                      fontSize: '0.8125rem',
                      fontWeight: 600,
                      color: '#18181b',
                      borderRadius: '5px',
                      textDecoration: 'none',
                      display: 'flex',
                      alignItems: 'center',
                      gap: '0.5rem',
                      background: isActive('/admin/activity') ? '#f4f4f5' : 'transparent'
                    }}
                  >
                    <Activity size={15} />
                    <span>{isRtl ? 'سجل النشاط الإداري' : 'Activity Logs'}</span>
                  </Link>
                  <Link
                    to="/admin/settings"
                    onClick={() => setAdminMoreOpen(false)}
                    style={{
                      padding: '0.5rem 0.65rem',
                      fontSize: '0.8125rem',
                      fontWeight: 600,
                      color: '#18181b',
                      borderRadius: '5px',
                      textDecoration: 'none',
                      display: 'flex',
                      alignItems: 'center',
                      gap: '0.5rem',
                      background: isActive('/admin/settings') ? '#f4f4f5' : 'transparent'
                    }}
                  >
                    <Settings size={15} />
                    <span>{isRtl ? 'إعدادات النظام' : 'System Settings'}</span>
                  </Link>
                </div>
              )}
            </div>

            {/* Preview Public Site */}
            <Link
              to="/"
              target="_blank"
              rel="noopener noreferrer"
              title={isRtl ? 'معاينة الموقع العام في نافذة جديدة' : 'Preview Public Site in New Tab'}
              style={{
                fontSize: '0.8rem',
                fontWeight: 600,
                color: '#71717a',
                padding: '0.35rem 0.55rem',
                borderRadius: '6px',
                display: 'flex',
                alignItems: 'center',
                gap: '0.3rem',
                textDecoration: 'none',
                border: '1px solid #e4e4e7',
                background: '#fafafa',
                marginInlineStart: '0.4rem',
                transition: 'all 0.15s'
              }}
            >
              <ExternalLink size={13} />
              <span>{isRtl ? 'الموقع العام' : 'Public Site'}</span>
            </Link>
          </nav>
        ) : (
          /* PUBLIC / COMPANY / CANDIDATE DESKTOP NAVIGATION */
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
            {!(isAuthenticated && role === 'company') && (
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
                {isRtl ? 'ترشيح كوادر' : 'Nominate Candidates'}
              </Link>
            )}

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
                  to="/company/cart"
                  style={{
                    fontSize: '0.9375rem',
                    fontWeight: 700,
                    color: isActive('/company/cart') ? '#000000' : '#52525b',
                    borderBottom: isActive('/company/cart') ? '2px solid #000000' : '2px solid transparent',
                    paddingBottom: '2px',
                    display: 'flex',
                    alignItems: 'center',
                    gap: '0.35rem'
                  }}
                >
                  <ShoppingCart size={16} />
                  <span>{isRtl ? 'سلة المرشحين' : 'Cart'}</span>
                </Link>
                <Link
                  to="/company/browse"
                  style={{
                    fontSize: '0.9375rem',
                    fontWeight: 700,
                    color: isActive('/company/browse') ? '#4338ca' : '#52525b',
                    borderBottom: isActive('/company/browse') ? '2px solid #4338ca' : '2px solid transparent',
                    paddingBottom: '2px',
                    display: 'flex',
                    alignItems: 'center',
                    gap: '0.35rem'
                  }}
                >
                  <Sparkles size={16} />
                  <span>{isRtl ? 'تصفح VIP' : 'VIP Browse'}</span>
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
          </nav>
        )}

        {/* Right Controls */}
        <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', flexShrink: 0 }}>
          {isAdmin && (
            <Link
              to="/admin/notifications"
              title={isRtl ? 'مركز الإشعارات والتدقيق' : 'Notification Center'}
              style={{
                position: 'relative',
                display: 'inline-flex',
                alignItems: 'center',
                justifyContent: 'center',
                width: '36px',
                height: '36px',
                borderRadius: '8px',
                background: location.pathname === '/admin/notifications' ? '#09090b' : '#f4f4f5',
                color: location.pathname === '/admin/notifications' ? '#ffffff' : '#18181b',
                border: '1px solid #e4e4e7',
                textDecoration: 'none',
                transition: 'all 0.15s'
              }}
            >
              <Bell size={18} />
              {unreadNotificationsCount > 0 && (
                <span
                  style={{
                    position: 'absolute',
                    top: '-4px',
                    [isRtl ? 'left' : 'right']: '-4px',
                    background: '#ef4444',
                    color: '#ffffff',
                    fontSize: '0.65rem',
                    fontWeight: 900,
                    minWidth: '18px',
                    height: '18px',
                    lineHeight: '18px',
                    borderRadius: '999px',
                    textAlign: 'center',
                    padding: '0 4px',
                    boxShadow: '0 0 0 2px #ffffff'
                  }}
                >
                  {unreadNotificationsCount > 9 ? '9+' : unreadNotificationsCount}
                </span>
              )}
            </Link>
          )}

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
              <Link to="/login" className="btn btn-primary btn-sm">
                {t('navLogin')}
              </Link>
            </div>
          ) : isAdmin ? (
            <div className="desktop-auth-actions" style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
              <div
                style={{
                  display: 'flex',
                  alignItems: 'center',
                  gap: '0.4rem',
                  padding: '0.35rem 0.65rem',
                  background: '#f4f4f5',
                  borderRadius: '6px',
                  border: '1px solid #e4e4e7',
                  fontSize: '0.8125rem',
                  fontWeight: 700,
                  color: '#18181b'
                }}
              >
                <Shield size={14} style={{ color: '#000000' }} />
                <span>{user?.email ? user.email.split('@')[0] : (isRtl ? 'مدير النظام' : 'Super Admin')}</span>
              </div>
              <button
                className="btn btn-outline btn-sm"
                onClick={handleLogout}
                title={t('navLogout')}
                style={{
                  padding: '0.35rem 0.6rem',
                  display: 'flex',
                  alignItems: 'center',
                  gap: '0.35rem',
                  color: '#dc2626',
                  borderColor: '#fca5a5'
                }}
              >
                <LogOut size={15} />
                <span style={{ fontWeight: 700 }}>{isRtl ? 'خروج' : 'Logout'}</span>
              </button>
            </div>
          ) : (
            <div className="desktop-auth-actions" style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
              {role === 'candidate' && (
                <Link
                  to="/candidate/dashboard"
                  className="btn btn-primary btn-sm"
                  style={{ display: 'flex', alignItems: 'center', gap: '0.35rem' }}
                >
                  <User size={15} />
                  <span>{t('navDashboard')}</span>
                </Link>
              )}
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
            {isAdmin ? (
              /* SUPER ADMIN MOBILE MENU */
              <div style={{ display: 'flex', flexDirection: 'column', gap: '0.35rem', borderBottom: '1px solid #e4e4e7', paddingBottom: '0.75rem' }}>
                <div style={{ fontSize: '0.75rem', fontWeight: 800, color: '#71717a', padding: '0.25rem 0.5rem', textTransform: 'uppercase' }}>
                  {isRtl ? 'لوحة تحكم مدير النظام' : 'Super Admin Portal'}
                </div>
                <Link to="/admin/dashboard" onClick={() => setMobileMenuOpen(false)} style={{ padding: '0.55rem 0.75rem', fontWeight: 700, color: '#000000', borderRadius: '6px', display: 'flex', alignItems: 'center', gap: '0.5rem', background: isActive('/admin/dashboard') ? '#f4f4f5' : 'transparent' }}>
                  <LayoutDashboard size={16} />
                  <span>{isRtl ? 'لوحة التحكم' : 'Dashboard'}</span>
                </Link>
                <Link to="/admin/candidates" onClick={() => setMobileMenuOpen(false)} style={{ padding: '0.55rem 0.75rem', fontWeight: 700, color: '#000000', borderRadius: '6px', display: 'flex', alignItems: 'center', gap: '0.5rem', background: location.pathname.startsWith('/admin/candidates') ? '#f4f4f5' : 'transparent' }}>
                  <Users size={16} />
                  <span>{isRtl ? 'المرشحون' : 'Candidates'}</span>
                </Link>
                <Link to="/admin/companies" onClick={() => setMobileMenuOpen(false)} style={{ padding: '0.55rem 0.75rem', fontWeight: 700, color: '#000000', borderRadius: '6px', display: 'flex', alignItems: 'center', gap: '0.5rem', background: location.pathname.startsWith('/admin/companies') ? '#f4f4f5' : 'transparent' }}>
                  <Building2 size={16} />
                  <span>{isRtl ? 'الشركات والمصانع' : 'Companies'}</span>
                </Link>
                <Link to="/admin/jobs" onClick={() => setMobileMenuOpen(false)} style={{ padding: '0.55rem 0.75rem', fontWeight: 700, color: '#000000', borderRadius: '6px', display: 'flex', alignItems: 'center', gap: '0.5rem', background: location.pathname.startsWith('/admin/jobs') ? '#f4f4f5' : 'transparent' }}>
                  <Briefcase size={16} />
                  <span>{isRtl ? 'الوظائف والمراجعة' : 'Jobs & Catalog'}</span>
                </Link>
                <Link to="/admin/recommendations" onClick={() => setMobileMenuOpen(false)} style={{ padding: '0.55rem 0.75rem', fontWeight: 700, color: '#000000', borderRadius: '6px', display: 'flex', alignItems: 'center', gap: '0.5rem', background: location.pathname.startsWith('/admin/recommendations') ? '#f4f4f5' : 'transparent' }}>
                  <FileCheck size={16} />
                  <span>{isRtl ? 'طلبات الترشيح' : 'Nominations'}</span>
                </Link>
                <Link to="/admin/recruitment-requests" onClick={() => setMobileMenuOpen(false)} style={{ padding: '0.55rem 0.75rem', fontWeight: 700, color: '#000000', borderRadius: '6px', display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                  <FileText size={16} />
                  <span>{isRtl ? 'طلبات التوظيف' : 'Recruitment Requests'}</span>
                </Link>
                <Link to="/admin/reports" onClick={() => setMobileMenuOpen(false)} style={{ padding: '0.55rem 0.75rem', fontWeight: 700, color: '#000000', borderRadius: '6px', display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                  <AlertCircle size={16} />
                  <span>{isRtl ? 'البلاغات والملاحظات' : 'Reports'}</span>
                </Link>
                <Link to="/admin/activity" onClick={() => setMobileMenuOpen(false)} style={{ padding: '0.55rem 0.75rem', fontWeight: 700, color: '#000000', borderRadius: '6px', display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                  <Activity size={16} />
                  <span>{isRtl ? 'سجل النشاط' : 'Activity'}</span>
                </Link>
                <Link to="/admin/settings" onClick={() => setMobileMenuOpen(false)} style={{ padding: '0.55rem 0.75rem', fontWeight: 700, color: '#000000', borderRadius: '6px', display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                  <Settings size={16} />
                  <span>{isRtl ? 'إعدادات النظام' : 'Settings'}</span>
                </Link>
                <Link to="/" onClick={() => setMobileMenuOpen(false)} target="_blank" rel="noopener noreferrer" style={{ padding: '0.55rem 0.75rem', fontWeight: 600, color: '#71717a', borderRadius: '6px', display: 'flex', alignItems: 'center', gap: '0.5rem', marginTop: '0.25rem' }}>
                  <ExternalLink size={15} />
                  <span>{isRtl ? 'زيارة الموقع العام' : 'Visit Public Site'}</span>
                </Link>
              </div>
            ) : (
              /* PUBLIC / REGULAR USER MOBILE MENU */
              <>
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
                  {!(isAuthenticated && role === 'company') && (
                    <Link to="/recommend" onClick={() => setMobileMenuOpen(false)} style={{ padding: '0.5rem 0.75rem', fontWeight: 700, color: '#000000', borderRadius: '6px', background: isActive('/recommend') ? '#f4f4f5' : 'transparent' }}>
                      {isRtl ? 'ترشيح كوادر' : 'Nominate Candidates'}
                    </Link>
                  )}
                </div>

                {isAuthenticated && (
                  <div style={{ display: 'flex', flexDirection: 'column', gap: '0.25rem', borderBottom: '1px solid #e4e4e7', paddingBottom: '0.75rem' }}>
                    {role === 'company' && (
                      <>
                        <Link to="/company/search" onClick={() => setMobileMenuOpen(false)} style={{ padding: '0.5rem 0.75rem', fontWeight: 700, color: '#000000', borderRadius: '6px', display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                          <Search size={16} />
                          {t('navFindCandidates')}
                        </Link>
                        <Link to="/company/cart" onClick={() => setMobileMenuOpen(false)} style={{ padding: '0.5rem 0.75rem', fontWeight: 700, color: '#000000', borderRadius: '6px', display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                          <ShoppingCart size={16} />
                          {isRtl ? 'سلة المرشحين' : 'Candidate Cart'}
                        </Link>
                        <Link to="/company/browse" onClick={() => setMobileMenuOpen(false)} style={{ padding: '0.5rem 0.75rem', fontWeight: 700, color: '#4338ca', borderRadius: '6px', display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                          <Sparkles size={16} />
                          {isRtl ? 'تصفح قاعدة البيانات (VIP)' : 'VIP Browse'}
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
                  </div>
                )}
              </>
            )}

            {/* Auth Actions in Drawer */}
            {!isAuthenticated ? (
              <div style={{ display: 'flex', flexDirection: 'column', gap: '0.625rem', marginTop: '0.5rem' }}>
                <Link to="/login" onClick={() => setMobileMenuOpen(false)} className="btn btn-primary" style={{ width: '100%' }}>
                  {t('navLogin')}
                </Link>
              </div>
            ) : isAdmin ? (
              <div style={{ display: 'flex', flexDirection: 'column', gap: '0.625rem', marginTop: '0.5rem' }}>
                <div style={{ padding: '0.5rem 0.75rem', background: '#f4f4f5', borderRadius: '6px', fontSize: '0.8125rem', fontWeight: 700, display: 'flex', alignItems: 'center', gap: '0.45rem' }}>
                  <Shield size={15} />
                  <span>{user?.email || (isRtl ? 'مدير النظام' : 'Super Admin')}</span>
                </div>
                <button onClick={handleLogout} className="btn btn-outline" style={{ width: '100%', color: '#dc2626', borderColor: '#fca5a5' }}>
                  <LogOut size={16} />
                  <span>{t('navLogout')}</span>
                </button>
              </div>
            ) : (
              <div style={{ display: 'flex', flexDirection: 'column', gap: '0.625rem', marginTop: '0.5rem' }}>
                {role === 'candidate' && (
                  <Link
                    to="/candidate/dashboard"
                    onClick={() => setMobileMenuOpen(false)}
                    className="btn btn-primary"
                    style={{ width: '100%' }}
                  >
                    <User size={16} />
                    <span>{t('navDashboard')}</span>
                  </Link>
                )}
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
