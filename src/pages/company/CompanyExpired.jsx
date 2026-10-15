import React, { useEffect, useState } from 'react';
import { useAuth } from '../../context/AuthContext';
import { companyApi } from '../../api/company.api';
import { Lock, RefreshCw, Phone, Mail, LogOut, CreditCard, AlertTriangle } from 'lucide-react';

export default function CompanyExpired() {
  const { profile, logout, refreshProfile } = useAuth();
  const [entitlements, setEntitlements] = useState(null);
  const [refreshing, setRefreshing] = useState(false);

  useEffect(() => {
    companyApi.getEntitlements().then(res => {
      setEntitlements(res.data?.data || null);
    }).catch(() => {});
  }, []);

  const handleRefresh = async () => {
    setRefreshing(true);
    try {
      await refreshProfile();
    } catch (e) {
      // ignore
    } finally {
      setRefreshing(false);
    }
  };

  const handleLogout = async () => {
    await logout();
    window.location.href = '/login';
  };

  const subInfo = entitlements?.company || profile;
  const endDate = subInfo?.subscriptionEndDate ? new Date(subInfo.subscriptionEndDate) : null;
  const isInactive = subInfo?.subscriptionStatus === 'inactive';
  const expiredDaysAgo = endDate ? Math.floor((new Date() - endDate) / (1000 * 60 * 60 * 24)) : null;

  return (
    <div
      dir="rtl"
      style={{
        minHeight: '100vh',
        background: '#000000',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        padding: '2rem',
        fontFamily: "'Cairo', 'Tajawal', sans-serif"
      }}
    >
      <div style={{ width: '100%', maxWidth: 520, textAlign: 'center' }}>

        {/* Lock Icon */}
        <div style={{
          width: 80, height: 80, borderRadius: '50%',
          background: '#ffffff',
          display: 'flex', alignItems: 'center', justifyContent: 'center',
          margin: '0 auto 2rem',
          boxShadow: '0 0 0 12px rgba(255,255,255,0.08)'
        }}>
          <Lock size={36} strokeWidth={2.5} color="#000000" />
        </div>

        <h1 style={{
          color: '#ffffff',
          fontSize: 'clamp(1.4rem, 4vw, 1.875rem)',
          fontWeight: 900,
          marginBottom: '0.75rem',
          lineHeight: 1.25
        }}>
          {isInactive ? 'الحساب موقوف مؤقتاً' : 'انتهت صلاحية الاشتراك'}
        </h1>

        <p style={{
          color: 'rgba(255,255,255,0.6)',
          fontSize: '0.9375rem',
          lineHeight: 1.7,
          marginBottom: '2rem'
        }}>
          {isInactive
            ? 'تم إيقاف اشتراكك مؤقتاً من قِبل الإدارة. يُرجى التواصل مع فريق عاشر جوبز لإعادة التفعيل.'
            : 'لقد انتهت مدة اشتراكك في منصة عاشر جوبز. يُرجى تجديد اشتراكك للاستمرار في الوصول إلى قاعدة بيانات المرشحين.'
          }
        </p>

        {/* Info Card */}
        <div style={{
          background: 'rgba(255,255,255,0.06)',
          border: '1px solid rgba(255,255,255,0.12)',
          borderRadius: '12px',
          padding: '1.25rem',
          marginBottom: '1.75rem',
          textAlign: 'right'
        }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', marginBottom: '0.875rem' }}>
            <AlertTriangle size={16} color="rgba(255,255,255,0.5)" />
            <span style={{ color: 'rgba(255,255,255,0.5)', fontSize: '0.78rem', fontWeight: 700 }}>تفاصيل الحساب</span>
          </div>
          <div style={{ display: 'flex', flexDirection: 'column', gap: '0.5rem' }}>
            {subInfo?.companyName && (
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                <span style={{ color: 'rgba(255,255,255,0.45)', fontSize: '0.8125rem' }}>المنشأة</span>
                <span style={{ color: '#ffffff', fontSize: '0.8125rem', fontWeight: 700 }}>{subInfo.companyName}</span>
              </div>
            )}
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
              <span style={{ color: 'rgba(255,255,255,0.45)', fontSize: '0.8125rem' }}>الباقة</span>
              <span style={{ color: '#ffffff', fontSize: '0.8125rem', fontWeight: 700 }}>
                {subInfo?.subscriptionPlan === 'Platinum' ? 'البلاتينية'
                  : subInfo?.subscriptionPlan === 'Gold' ? 'الذهبية' : 'الأساسية'}
              </span>
            </div>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
              <span style={{ color: 'rgba(255,255,255,0.45)', fontSize: '0.8125rem' }}>الحالة</span>
              <span style={{
                fontSize: '0.78rem', fontWeight: 800,
                padding: '0.2rem 0.6rem', borderRadius: '4px',
                background: isInactive ? 'rgba(255,200,0,0.15)' : 'rgba(255,60,60,0.15)',
                color: isInactive ? '#ffd700' : '#ff6b6b',
                border: `1px solid ${isInactive ? 'rgba(255,200,0,0.3)' : 'rgba(255,60,60,0.3)'}`
              }}>
                {isInactive ? 'موقوف' : 'منتهي الصلاحية'}
              </span>
            </div>
            {endDate && (
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                <span style={{ color: 'rgba(255,255,255,0.45)', fontSize: '0.8125rem' }}>انتهى في</span>
                <span style={{ color: '#ff6b6b', fontSize: '0.8125rem', fontWeight: 700 }}>
                  {endDate.toLocaleDateString('ar-EG', { year: 'numeric', month: 'long', day: 'numeric' })}
                  {expiredDaysAgo > 0 && !isInactive && (
                    <span style={{ color: 'rgba(255,255,255,0.35)', fontWeight: 400 }}> (منذ {expiredDaysAgo} يوم)</span>
                  )}
                </span>
              </div>
            )}
          </div>
        </div>

        {/* Contact Card */}
        <div style={{
          background: 'rgba(255,255,255,0.04)',
          border: '1px solid rgba(255,255,255,0.1)',
          borderRadius: '12px',
          padding: '1.25rem',
          marginBottom: '1.75rem',
          textAlign: 'right'
        }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', marginBottom: '0.875rem' }}>
            <CreditCard size={16} color="rgba(255,255,255,0.5)" />
            <span style={{ color: 'rgba(255,255,255,0.5)', fontSize: '0.78rem', fontWeight: 700 }}>
              لتجديد الاشتراك — تواصل مع الإدارة
            </span>
          </div>
          <div style={{ display: 'flex', flexDirection: 'column', gap: '0.6rem' }}>
            <a
              href="tel:+201000000000"
              style={{
                display: 'flex', alignItems: 'center', gap: '0.6rem',
                color: '#ffffff', textDecoration: 'none',
                fontSize: '0.9rem', fontWeight: 600,
                padding: '0.5rem 0.75rem', borderRadius: '8px',
                background: 'rgba(255,255,255,0.06)'
              }}
            >
              <Phone size={16} />
              <span dir="ltr">01000000000</span>
            </a>
            <a
              href="mailto:support@asherjobs.com"
              style={{
                display: 'flex', alignItems: 'center', gap: '0.6rem',
                color: '#ffffff', textDecoration: 'none',
                fontSize: '0.9rem', fontWeight: 600,
                padding: '0.5rem 0.75rem', borderRadius: '8px',
                background: 'rgba(255,255,255,0.06)'
              }}
            >
              <Mail size={16} />
              <span dir="ltr">support@asherjobs.com</span>
            </a>
          </div>
        </div>

        {/* Buttons */}
        <div style={{ display: 'flex', flexDirection: 'column', gap: '0.75rem' }}>
          <button
            onClick={handleRefresh}
            disabled={refreshing}
            style={{
              width: '100%', padding: '0.875rem',
              background: '#ffffff', color: '#000000',
              border: 'none', borderRadius: '10px',
              fontSize: '0.9375rem', fontWeight: 800,
              cursor: refreshing ? 'not-allowed' : 'pointer',
              display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '0.5rem',
              opacity: refreshing ? 0.6 : 1, transition: 'opacity 0.2s'
            }}
          >
            <RefreshCw size={18} style={{ animation: refreshing ? 'spin 1s linear infinite' : 'none' }} />
            {refreshing ? 'جاري التحقق...' : 'تحقق من تجديد الاشتراك'}
          </button>

          <button
            onClick={handleLogout}
            style={{
              width: '100%', padding: '0.875rem',
              background: 'transparent', color: 'rgba(255,255,255,0.5)',
              border: '1px solid rgba(255,255,255,0.12)', borderRadius: '10px',
              fontSize: '0.875rem', fontWeight: 700,
              cursor: 'pointer',
              display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '0.5rem'
            }}
          >
            <LogOut size={16} />
            تسجيل الخروج
          </button>
        </div>

        <p style={{ color: 'rgba(255,255,255,0.2)', fontSize: '0.75rem', marginTop: '2rem', lineHeight: 1.6 }}>
          بعد تجديد اشتراكك من قِبل الإدارة، اضغط على "تحقق من تجديد الاشتراك" للدخول فوراً.
        </p>

        <style>{`@keyframes spin { from { transform: rotate(0deg); } to { transform: rotate(360deg); } }`}</style>
      </div>
    </div>
  );
}
