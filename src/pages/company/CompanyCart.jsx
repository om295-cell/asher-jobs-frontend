import React, { useState, useEffect, useCallback } from 'react';
import { Link } from 'react-router-dom';
import { useLanguage } from '../../context/LanguageContext';
import { useToast } from '../../context/ToastContext';
import { useAuth } from '../../context/AuthContext';
import { companyApi } from '../../api/company.api';
import {
  ShoppingCart,
  FileSpreadsheet,
  Trash2,
  Download,
  Phone,
  MapPin,
  Briefcase,
  ArrowRight,
  Crown,
  Sparkles,
  Search,
  CheckCircle2,
  Calendar,
  Layers,
  Award
} from 'lucide-react';
import LoadingSpinner from '../../components/ui/LoadingSpinner';

export default function CompanyCart() {
  const { isRtl } = useLanguage();
  const { showToast } = useToast();
  const { profile } = useAuth();

  const [cart, setCart] = useState([]);
  const [entitlements, setEntitlements] = useState(null);
  const [loading, setLoading] = useState(true);
  const [exporting, setExporting] = useState(false);
  const [exportFormat, setExportFormat] = useState('multi_sheet');

  const fetchData = useCallback(async () => {
    setLoading(true);
    try {
      const [cartRes, entRes] = await Promise.all([
        companyApi.getCart(),
        companyApi.getEntitlements()
      ]);
      const rawCart = cartRes.data?.data;
      const cartItems = Array.isArray(rawCart)
        ? rawCart
        : Array.isArray(rawCart?.items)
          ? rawCart.items
          : [];
      setCart(cartItems);
      setEntitlements(entRes.data?.data || null);
    } catch (err) {
      showToast(err.response?.data?.message || 'فشل تحميل بيانات السلة', 'error');
      setCart([]);
    } finally {
      setLoading(false);
    }
  }, [showToast]);

  useEffect(() => {
    fetchData();
  }, [fetchData]);

  const handleRemoveItem = async (jobId) => {
    try {
      await companyApi.removeCartItem(jobId);
      showToast('تم حذف المسمى الوظيفي من السلة', 'success');
      fetchData();
    } catch (err) {
      showToast(err.response?.data?.message || 'فشل الحذف', 'error');
    }
  };

  const handleClearCart = async () => {
    if (!window.confirm(isRtl ? 'هل أنت متأكد من تفريغ سلة المرشحين بالكامل؟' : 'Are you sure you want to clear the entire cart?')) return;
    try {
      await companyApi.clearCart();
      showToast('تم تفريغ السلة بنجاح', 'success');
      fetchData();
    } catch (err) {
      showToast(err.response?.data?.message || 'فشل تفريغ السلة', 'error');
    }
  };

  const handleExport = async () => {
    const currentItems = Array.isArray(cart) ? cart : [];
    if (currentItems.length === 0) return;
    setExporting(true);
    try {
      const res = await companyApi.exportCart(exportFormat);
      const blob = new Blob([res.data], {
        type: 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet'
      });
      const url = URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url;
      a.download = `candidate_cart_${exportFormat}_${Date.now()}.xlsx`;
      a.click();
      URL.revokeObjectURL(url);
      showToast(isRtl ? 'تم تصدير ملف الإكسيل بنجاح!' : 'Excel export downloaded successfully!', 'success');
      fetchData();
    } catch (err) {
      let errMsg = isRtl ? 'فشل تصدير السلة' : 'Cart export failed';
      if (err.response?.data instanceof Blob) {
        try {
          const text = await err.response.data.text();
          const json = JSON.parse(text);
          if (json.message) errMsg = json.message;
        } catch (_) {}
      } else if (err.response?.data?.message) {
        errMsg = err.response.data.message;
      }
      showToast(errMsg, 'error');
    } finally {
      setExporting(false);
    }
  };

  if (loading) {
    return (
      <div style={{ padding: '6rem 0', display: 'flex', justifyContent: 'center' }}>
        <LoadingSpinner />
      </div>
    );
  }

  const isCartEligible = Boolean(
    entitlements?.planLimits?.cartEnabled ||
    entitlements?.limits?.cartEnabled ||
    ['Gold', 'Platinum'].includes(entitlements?.company?.subscriptionPlan || entitlements?.plan || profile?.subscriptionPlan)
  );
  const cartList = Array.isArray(cart) ? cart : [];
  const totalCandidatesCount = cartList.reduce((acc, item) => acc + (item.candidates?.length || item.quantity || 0), 0);

  // Locked State for Basic Subscribers
  if (!isCartEligible) {
    return (
      <div
        style={{
          padding: '3.5rem 1rem',
          background: '#ffffff',
          minHeight: '80vh',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center'
        }}
        dir={isRtl ? 'rtl' : 'ltr'}
      >
        <div style={{ maxWidth: 640, width: '100%', margin: '0 auto' }}>
          <div
            style={{
              background: '#ffffff',
              borderRadius: '16px',
              border: '1.5px solid #000000',
              boxShadow: '0 10px 30px rgba(0, 0, 0, 0.06)',
              padding: 'clamp(2rem, 5vw, 2.75rem)',
              textAlign: 'center',
              position: 'relative',
              overflow: 'hidden'
            }}
          >
            <div
              style={{
                position: 'absolute',
                top: 0,
                left: 0,
                right: 0,
                height: 4,
                background: '#000000'
              }}
            />

            <div
              style={{
                width: 72,
                height: 72,
                borderRadius: '50%',
                background: '#000000',
                color: '#ffffff',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                margin: '0 auto 1.5rem',
                border: '2px solid #000000'
              }}
            >
              <ShoppingCart size={32} />
            </div>

            <div style={{ marginBottom: '1.25rem' }}>
              <span
                style={{
                  display: 'inline-flex',
                  alignItems: 'center',
                  gap: '0.4rem',
                  padding: '0.35rem 0.9rem',
                  borderRadius: '9999px',
                  background: '#ffffff',
                  color: '#000000',
                  fontSize: '0.8125rem',
                  fontWeight: 700,
                  border: '1.5px solid #000000'
                }}
              >
                <Crown size={14} color="#000000" />
                <span>{isRtl ? 'خاصية حصرية للباقة الذهبية والبلاتينية' : 'Gold & Platinum Exclusive'}</span>
              </span>
            </div>

            <h1
              style={{
                fontSize: 'clamp(1.35rem, 3vw, 1.75rem)',
                fontWeight: 800,
                color: '#000000',
                marginBottom: '0.85rem',
                lineHeight: 1.3
              }}
            >
              {isRtl ? 'سلة المرشحين متعددة المسميات الوظيفية' : 'Multi-Title Candidate Cart'}
            </h1>

            <p
              style={{
                color: '#3f3f46',
                fontSize: '0.975rem',
                lineHeight: 1.7,
                marginBottom: '1.75rem',
                maxWidth: 520,
                marginLeft: 'auto',
                marginRight: 'auto'
              }}
            >
              {isRtl ? (
                <>
                  خاصية سلة المرشحين وتصدير ملفات الإكسيل المتعددة متاحة حصرياً لمشتركي{' '}
                  <strong style={{ color: '#000000', fontWeight: 800 }}>الباقة الذهبية (Gold)</strong> و{' '}
                  <strong style={{ color: '#000000', fontWeight: 800 }}>الباقة البلاتينية (Platinum)</strong>.
                </>
              ) : (
                <>
                  The Multi-Title Candidate Cart and bulk Excel export features are available exclusively to{' '}
                  <strong style={{ color: '#000000', fontWeight: 800 }}>Gold</strong> and{' '}
                  <strong style={{ color: '#000000', fontWeight: 800 }}>Platinum</strong> subscribers.
                </>
              )}
            </p>

            <div
              style={{
                display: 'grid',
                gridTemplateColumns: 'repeat(auto-fit, minmax(170px, 1fr))',
                gap: '0.75rem',
                marginBottom: '2rem',
                textAlign: isRtl ? 'right' : 'left'
              }}
            >
              <div
                style={{
                  background: '#ffffff',
                  border: '1px solid #000000',
                  borderRadius: '10px',
                  padding: '0.875rem'
                }}
              >
                <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', marginBottom: '0.35rem' }}>
                  <FileSpreadsheet size={16} color="#000000" />
                  <span style={{ fontSize: '0.85rem', fontWeight: 700, color: '#000000' }}>
                    {isRtl ? 'تصدير إكسيل متعدد' : 'Multi-Sheet Excel'}
                  </span>
                </div>
                <div style={{ fontSize: '0.75rem', color: '#52525b', lineHeight: 1.4 }}>
                  {isRtl ? 'تصدير عدة تخصصات في ملف موحد أو صفحات منفصلة' : 'Export multiple job titles in one combined sheet'}
                </div>
              </div>

              <div
                style={{
                  background: '#ffffff',
                  border: '1px solid #000000',
                  borderRadius: '10px',
                  padding: '0.875rem'
                }}
              >
                <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', marginBottom: '0.35rem' }}>
                  <Briefcase size={16} color="#000000" />
                  <span style={{ fontSize: '0.85rem', fontWeight: 700, color: '#000000' }}>
                    {isRtl ? 'حتى 10 لكل مسمى' : 'Up to 10 per Title'}
                  </span>
                </div>
                <div style={{ fontSize: '0.75rem', color: '#52525b', lineHeight: 1.4 }}>
                  {isRtl ? 'تجميع احتياجات المصنع بالكامل قبل التصدير' : 'Collect candidates across all factory departments'}
                </div>
              </div>

              <div
                style={{
                  background: '#ffffff',
                  border: '1px solid #000000',
                  borderRadius: '10px',
                  padding: '0.875rem'
                }}
              >
                <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', marginBottom: '0.35rem' }}>
                  <Sparkles size={16} color="#000000" />
                  <span style={{ fontSize: '0.85rem', fontWeight: 700, color: '#000000' }}>
                    {isRtl ? 'توفير الوقت والميزانية' : 'Save Time & Effort'}
                  </span>
                </div>
                <div style={{ fontSize: '0.75rem', color: '#52525b', lineHeight: 1.4 }}>
                  {isRtl ? 'إدارة التوظيف السريع بضغطة زر واحدة' : 'Instant bulk hiring and full pipeline control'}
                </div>
              </div>
            </div>

            <div
              style={{
                display: 'flex',
                flexWrap: 'wrap',
                gap: '0.75rem',
                justifyContent: 'center',
                alignItems: 'center'
              }}
            >
              <Link
                to="/company/subscription"
                className="btn btn-primary"
                style={{
                  padding: '0.75rem 1.75rem',
                  borderRadius: '8px',
                  fontSize: '0.95rem',
                  fontWeight: 700,
                  display: 'inline-flex',
                  alignItems: 'center',
                  gap: '0.5rem',
                  textDecoration: 'none',
                  background: '#000000',
                  color: '#ffffff',
                  borderColor: '#000000'
                }}
              >
                <Crown size={18} color="#ffffff" />
                <span>{isRtl ? 'ترقية الباقة الآن' : 'Upgrade Plan Now'}</span>
              </Link>

              <Link
                to="/company/search"
                className="btn btn-outline"
                style={{
                  padding: '0.75rem 1.5rem',
                  borderRadius: '8px',
                  fontSize: '0.95rem',
                  fontWeight: 700,
                  display: 'inline-flex',
                  alignItems: 'center',
                  gap: '0.5rem',
                  textDecoration: 'none',
                  background: '#ffffff',
                  color: '#000000',
                  borderColor: '#000000'
                }}
              >
                <span>{isRtl ? 'العودة إلى البحث عن المرشحين' : 'Back to Search'}</span>
              </Link>
            </div>
          </div>
        </div>
      </div>
    );
  }

  const planName = entitlements?.plan || entitlements?.company?.subscriptionPlan || profile?.subscriptionPlan || 'Platinum';
  const cairoDate = entitlements?.cairoDate || entitlements?.quota?.cairoDate || '2026-10-24';
  const dailyDownloadLimit = entitlements?.limits?.dailyDownloadLimitPerTitle || entitlements?.planLimits?.dailyDownloadLimitPerTitle || 6;

  return (
    <div
      style={{
        padding: 'clamp(1.5rem, 3vw, 2.5rem) 0 4rem',
        background: 'var(--bg-page)',
        minHeight: '85vh'
      }}
      dir={isRtl ? 'rtl' : 'ltr'}
    >
      <div className="container">
        {/* Header Bar */}
        <div
          style={{
            display: 'flex',
            flexWrap: 'wrap',
            justifyContent: 'space-between',
            alignItems: 'center',
            gap: '1rem',
            marginBottom: '1.5rem'
          }}
        >
          <div>
            <div style={{ display: 'flex', alignItems: 'center', gap: '0.65rem', marginBottom: '0.35rem' }}>
              <div
                style={{
                  width: 38,
                  height: 38,
                  borderRadius: '8px',
                  background: '#000000',
                  color: '#ffffff',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center'
                }}
              >
                <ShoppingCart size={20} />
              </div>
              <h1 style={{ fontSize: 'clamp(1.35rem, 3vw, 1.75rem)', fontWeight: 850, margin: 0, color: 'var(--slate-900)' }}>
                {isRtl ? 'سلة المرشحين (تصدير مجمع متعدد المسميات)' : 'Candidate Cart (Bulk Export)'}
              </h1>
            </div>
            <p style={{ margin: 0, fontSize: '0.875rem', color: 'var(--slate-600)', lineHeight: 1.5 }}>
              {isRtl
                ? `إجمالي ${cartList.length} مسمى وظيفي • ${totalCandidatesCount} مرشح مختار (بحد أقصى 10 لكل مسمى)`
                : `Total ${cartList.length} titles • ${totalCandidatesCount} selected candidates (max 10 per title)`}
            </p>
          </div>

          <div style={{ display: 'flex', alignItems: 'center', gap: '0.6rem', flexWrap: 'wrap' }}>
            <Link
              to="/company/search"
              className="btn btn-outline"
              style={{
                display: 'inline-flex',
                alignItems: 'center',
                gap: '0.45rem',
                fontSize: '0.85rem',
                fontWeight: 700,
                padding: '0.5rem 0.9rem',
                borderRadius: '8px'
              }}
            >
              <Search size={16} />
              <span>{isRtl ? 'البحث عن المرشحين' : 'Search Candidates'}</span>
            </Link>

            <Link
              to="/company/browse"
              className="btn btn-outline"
              style={{
                display: 'inline-flex',
                alignItems: 'center',
                gap: '0.45rem',
                fontSize: '0.85rem',
                fontWeight: 700,
                padding: '0.5rem 0.9rem',
                borderRadius: '8px'
              }}
            >
              <Sparkles size={16} />
              <span>{isRtl ? 'بوابة التصفح VIP' : 'VIP Browse'}</span>
            </Link>

            {cartList.length > 0 && (
              <button
                type="button"
                onClick={handleClearCart}
                className="btn btn-outline"
                style={{
                  display: 'inline-flex',
                  alignItems: 'center',
                  gap: '0.45rem',
                  fontSize: '0.85rem',
                  fontWeight: 700,
                  padding: '0.5rem 0.9rem',
                  borderRadius: '8px',
                  color: '#dc2626',
                  borderColor: '#fca5a5'
                }}
              >
                <Trash2 size={16} />
                <span>{isRtl ? 'تفريغ السلة' : 'Clear Cart'}</span>
              </button>
            )}
          </div>
        </div>

        {/* Cairo Quota & Info Banner */}
        <div
          style={{
            background: '#000000',
            color: '#ffffff',
            borderRadius: '12px',
            padding: '1rem 1.25rem',
            marginBottom: '1.75rem',
            display: 'flex',
            flexWrap: 'wrap',
            justifyContent: 'space-between',
            alignItems: 'center',
            gap: '1rem',
            boxShadow: 'var(--shadow-md)'
          }}
        >
          <div style={{ display: 'flex', alignItems: 'center', gap: '0.65rem', flexWrap: 'wrap' }}>
            <span
              style={{
                display: 'inline-flex',
                alignItems: 'center',
                gap: '0.35rem',
                fontSize: '0.78rem',
                fontWeight: 800,
                background: '#ffffff',
                color: '#000000',
                padding: '0.2rem 0.65rem',
                borderRadius: '999px'
              }}
            >
              <Crown size={13} />
              <span>{isRtl ? `باقة: ${planName}` : `Plan: ${planName}`}</span>
            </span>

            <span
              style={{
                fontSize: '0.8125rem',
                color: '#d4d4d8',
                background: 'rgba(255,255,255,0.1)',
                padding: '0.2rem 0.65rem',
                borderRadius: '6px',
                border: '1px solid rgba(255,255,255,0.15)'
              }}
            >
              {isRtl ? 'تاريخ القاهرة: ' : 'Cairo Date: '}
              <strong style={{ color: '#ffffff' }}>{cairoDate}</strong>
            </span>

            <span
              style={{
                fontSize: '0.8125rem',
                color: '#d4d4d8',
                background: 'rgba(255,255,255,0.1)',
                padding: '0.2rem 0.65rem',
                borderRadius: '6px',
                border: '1px solid rgba(255,255,255,0.15)'
              }}
            >
              {isRtl ? 'مرات التحميل اليومية لكل مسمى: ' : 'Daily downloads per title: '}
              <strong style={{ color: '#ffffff' }}>{dailyDownloadLimit}</strong>
            </span>
          </div>

          <div style={{ fontSize: '0.78rem', color: '#a1a1aa' }}>
            {isRtl
              ? '⚡ تتجدد الحصص اليومية تلقائياً الساعة 00:00 بتوقيت القاهرة'
              : '⚡ Quotas reset automatically at 00:00 Cairo time'}
          </div>
        </div>

        {/* Empty State */}
        {cartList.length === 0 ? (
          <div
            className="card"
            style={{
              padding: '4rem 1.5rem',
              borderRadius: '16px',
              border: '1px solid var(--border)',
              textAlign: 'center',
              boxShadow: 'var(--shadow-sm)'
            }}
          >
            <div
              style={{
                width: 68,
                height: 68,
                borderRadius: '50%',
                background: 'var(--slate-100)',
                color: 'var(--slate-400)',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                margin: '0 auto 1.25rem'
              }}
            >
              <ShoppingCart size={34} />
            </div>

            <h3 style={{ fontSize: '1.25rem', fontWeight: 850, color: 'var(--slate-900)', margin: '0 0 0.5rem' }}>
              {isRtl ? 'سلة المرشحين فارغة حالياً' : 'Your Candidate Cart is Empty'}
            </h3>

            <p style={{ margin: '0 auto 1.75rem', fontSize: '0.9375rem', color: 'var(--slate-600)', maxWidth: 500, lineHeight: 1.6 }}>
              {isRtl
                ? 'يمكنك إضافة المرشحين حسب المسمى الوظيفي مباشرة من صفحة البحث لتجميعهم وتصديرهم في ملف إكسيل موحد أو متعدد الصفحات.'
                : 'You can add candidates by job title directly from the search page to compile and export them in a unified or multi-sheet Excel file.'}
            </p>

            <Link
              to="/company/search"
              className="btn btn-primary"
              style={{
                display: 'inline-flex',
                alignItems: 'center',
                gap: '0.5rem',
                fontSize: '0.925rem',
                fontWeight: 700,
                padding: '0.75rem 1.75rem',
                borderRadius: '8px'
              }}
            >
              <span>{isRtl ? 'الانتقال لصفحة البحث' : 'Go to Search Page'}</span>
              <ArrowRight size={16} style={{ transform: isRtl ? 'rotate(180deg)' : 'none' }} />
            </Link>
          </div>
        ) : (
          /* Populated Cart Grid */
          <div
            style={{
              display: 'grid',
              gridTemplateColumns: 'repeat(auto-fit, minmax(min(100%, 340px), 1fr))',
              gap: '1.75rem',
              alignItems: 'start'
            }}
          >
            {/* Left 2-col area: Job Title Buckets */}
            <div style={{ display: 'flex', flexDirection: 'column', gap: '1.25rem', gridColumn: 'span 2' }}>
              {cartList.map((item) => {
                const titleText = item.jobId?.nameAr || item.jobId?.name || item.jobId?.title || (isRtl ? 'مسمى وظيفي' : 'Job Title');
                const candCount = item.candidates?.length || 0;

                return (
                  <div
                    key={item._id || item.jobId?._id || item.jobId}
                    className="card"
                    style={{
                      padding: 0,
                      borderRadius: '12px',
                      border: '1px solid var(--border)',
                      overflow: 'hidden',
                      boxShadow: 'var(--shadow-sm)'
                    }}
                  >
                    {/* Header Row */}
                    <div
                      style={{
                        padding: '1rem 1.25rem',
                        background: 'var(--slate-50)',
                        borderBottom: '1px solid var(--border)',
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'space-between',
                        flexWrap: 'wrap',
                        gap: '0.75rem'
                      }}
                    >
                      <div style={{ display: 'flex', alignItems: 'center', gap: '0.65rem' }}>
                        <div
                          style={{
                            width: 32,
                            height: 32,
                            borderRadius: '6px',
                            background: '#000000',
                            color: '#ffffff',
                            display: 'flex',
                            alignItems: 'center',
                            justifyContent: 'center'
                          }}
                        >
                          <Briefcase size={16} />
                        </div>
                        <div>
                          <h3 style={{ margin: 0, fontSize: '1rem', fontWeight: 800, color: 'var(--slate-900)' }}>
                            {titleText}
                          </h3>
                        </div>
                        <span
                          style={{
                            fontSize: '0.75rem',
                            fontWeight: 700,
                            padding: '0.2rem 0.6rem',
                            borderRadius: '999px',
                            background: '#000000',
                            color: '#ffffff'
                          }}
                        >
                          {candCount ? `${candCount} / 10 ${isRtl ? 'مرشحين' : 'candidates'}` : `${item.quantity || 1} ${isRtl ? 'مطلوب' : 'requested'}`}
                        </span>
                      </div>

                      <button
                        type="button"
                        onClick={() => handleRemoveItem(item.jobId?._id || item.jobId)}
                        className="btn btn-outline btn-sm"
                        style={{
                          color: '#dc2626',
                          borderColor: '#fca5a5',
                          padding: '0.35rem 0.65rem',
                          fontSize: '0.75rem',
                          display: 'inline-flex',
                          alignItems: 'center',
                          gap: '0.35rem'
                        }}
                        title={isRtl ? 'حذف هذا المسمى من السلة' : 'Remove title from cart'}
                      >
                        <Trash2 size={14} />
                        <span>{isRtl ? 'حذف' : 'Remove'}</span>
                      </button>
                    </div>

                    {/* Candidates in Bucket */}
                    <div style={{ padding: '0.75rem 1.25rem' }}>
                      {item.candidates && item.candidates.length > 0 ? (
                        <div style={{ display: 'flex', flexDirection: 'column' }}>
                          {item.candidates.map((cand, idx) => (
                            <div
                              key={cand._id || idx}
                              style={{
                                padding: '0.75rem 0',
                                borderBottom: idx < item.candidates.length - 1 ? '1px solid var(--border)' : 'none',
                                display: 'flex',
                                alignItems: 'center',
                                justifyContent: 'space-between',
                                flexWrap: 'wrap',
                                gap: '0.75rem'
                              }}
                            >
                              <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem' }}>
                                <div
                                  style={{
                                    width: 36,
                                    height: 36,
                                    borderRadius: '50%',
                                    background: 'var(--slate-100)',
                                    color: '#000000',
                                    fontWeight: 800,
                                    fontSize: '0.9rem',
                                    display: 'flex',
                                    alignItems: 'center',
                                    justifyContent: 'center',
                                    flexShrink: 0
                                  }}
                                >
                                  {(cand.fullName || 'م').trim().charAt(0)}
                                </div>
                                <div>
                                  <h4 style={{ margin: 0, fontSize: '0.925rem', fontWeight: 800, color: 'var(--slate-900)' }}>
                                    {cand.fullName}
                                  </h4>
                                  <div style={{ display: 'flex', flexWrap: 'wrap', alignItems: 'center', gap: '0.75rem', fontSize: '0.75rem', color: 'var(--slate-500)', marginTop: '0.2rem' }}>
                                    {cand.phone && (
                                      <span style={{ display: 'inline-flex', alignItems: 'center', gap: '0.25rem', fontWeight: 600, color: 'var(--slate-800)' }} dir="ltr">
                                        <Phone size={12} />
                                        <span>{cand.phone}</span>
                                      </span>
                                    )}
                                    {cand.governorate && (
                                      <span style={{ display: 'inline-flex', alignItems: 'center', gap: '0.25rem' }}>
                                        <MapPin size={12} />
                                        <span>{cand.governorate}</span>
                                      </span>
                                    )}
                                    {cand.yearsOfExperience !== undefined && (
                                      <span>
                                        {isRtl ? 'خبرة: ' : 'Exp: '}
                                        <strong>{cand.yearsOfExperience} {isRtl ? 'سنوات' : 'yrs'}</strong>
                                      </span>
                                    )}
                                  </div>
                                </div>
                              </div>

                              <span
                                style={{
                                  display: 'inline-flex',
                                  alignItems: 'center',
                                  gap: '0.3rem',
                                  fontSize: '0.72rem',
                                  fontWeight: 700,
                                  background: 'var(--slate-100)',
                                  color: '#000000',
                                  padding: '0.25rem 0.6rem',
                                  borderRadius: '6px',
                                  border: '1px solid var(--border)'
                                }}
                              >
                                <CheckCircle2 size={13} />
                                <span>{isRtl ? 'جاهز للتصدير' : 'Ready'}</span>
                              </span>
                            </div>
                          ))}
                        </div>
                      ) : (
                        <div style={{ padding: '0.75rem 0', fontSize: '0.875rem', color: 'var(--slate-600)', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                          <div>
                            <span>{isRtl ? 'الكمية المطلوبة: ' : 'Quantity: '}</span>
                            <strong style={{ color: '#000000' }}>{item.quantity || 1}</strong>
                            {item.notes && <span style={{ color: 'var(--slate-400)', marginInlineStart: '0.5rem' }}>({item.notes})</span>}
                          </div>
                          <span
                            style={{
                              fontSize: '0.72rem',
                              fontWeight: 700,
                              padding: '0.2rem 0.6rem',
                              borderRadius: '4px',
                              background: item.isSufficient !== false ? '#ecfdf5' : '#fffbeb',
                              color: item.isSufficient !== false ? '#065f46' : '#92400e',
                              border: `1px solid ${item.isSufficient !== false ? '#a7f3d0' : '#fde68a'}`
                            }}
                          >
                            {item.isSufficient !== false ? (isRtl ? 'متوفر في قاعدة البيانات' : 'Available') : (isRtl ? 'أقل من المطلوب' : 'Partially Available')}
                          </span>
                        </div>
                      )}
                    </div>
                  </div>
                );
              })}
            </div>

            {/* Right 1-col area: Export Configuration Sidebar */}
            <div>
              <div
                className="card"
                style={{
                  position: 'sticky',
                  top: '2rem',
                  padding: '1.5rem',
                  borderRadius: '16px',
                  border: '1.5px solid #000000',
                  boxShadow: 'var(--shadow-md)',
                  background: '#ffffff'
                }}
              >
                <div style={{ display: 'flex', alignItems: 'center', gap: '0.65rem', paddingBottom: '1rem', borderBottom: '1px solid var(--border)', marginBottom: '1.25rem' }}>
                  <div
                    style={{
                      width: 36,
                      height: 36,
                      borderRadius: '8px',
                      background: '#000000',
                      color: '#ffffff',
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'center'
                    }}
                  >
                    <FileSpreadsheet size={20} />
                  </div>
                  <h3 style={{ margin: 0, fontSize: '1.05rem', fontWeight: 800, color: 'var(--slate-900)' }}>
                    {isRtl ? 'خيارات تصدير ملف الإكسيل' : 'Excel Export Options'}
                  </h3>
                </div>

                {/* Format Radio Options */}
                <div style={{ display: 'flex', flexDirection: 'column', gap: '0.75rem', marginBottom: '1.25rem' }}>
                  <label
                    onClick={() => setExportFormat('multi_sheet')}
                    style={{
                      display: 'flex',
                      alignItems: 'flex-start',
                      gap: '0.75rem',
                      padding: '0.85rem',
                      borderRadius: '10px',
                      border: exportFormat === 'multi_sheet' ? '2px solid #000000' : '1px solid var(--border)',
                      background: exportFormat === 'multi_sheet' ? 'var(--slate-100)' : '#ffffff',
                      cursor: 'pointer',
                      transition: 'all 0.15s ease'
                    }}
                  >
                    <input
                      type="radio"
                      name="exportFormat"
                      value="multi_sheet"
                      checked={exportFormat === 'multi_sheet'}
                      onChange={() => setExportFormat('multi_sheet')}
                      style={{ marginTop: '0.2rem', accentColor: '#000000' }}
                    />
                    <div>
                      <div style={{ fontSize: '0.875rem', fontWeight: 800, color: '#000000' }}>
                        {isRtl ? 'ملف متعدد الصفحات (Multi-Sheet)' : 'Multi-Sheet File'}
                      </div>
                      <div style={{ fontSize: '0.75rem', color: 'var(--slate-600)', marginTop: '0.2rem', lineHeight: 1.4 }}>
                        {isRtl
                          ? 'ورقة عمل (Sheet) منفصلة ومستقلة لكل مسمى وظيفي داخل نفس الملف.'
                          : 'Separate independent sheet per job title inside one Excel workbook.'}
                      </div>
                    </div>
                  </label>

                  <label
                    onClick={() => setExportFormat('single_sheet_categorized')}
                    style={{
                      display: 'flex',
                      alignItems: 'flex-start',
                      gap: '0.75rem',
                      padding: '0.85rem',
                      borderRadius: '10px',
                      border: exportFormat === 'single_sheet_categorized' ? '2px solid #000000' : '1px solid var(--border)',
                      background: exportFormat === 'single_sheet_categorized' ? 'var(--slate-100)' : '#ffffff',
                      cursor: 'pointer',
                      transition: 'all 0.15s ease'
                    }}
                  >
                    <input
                      type="radio"
                      name="exportFormat"
                      value="single_sheet_categorized"
                      checked={exportFormat === 'single_sheet_categorized'}
                      onChange={() => setExportFormat('single_sheet_categorized')}
                      style={{ marginTop: '0.2rem', accentColor: '#000000' }}
                    />
                    <div>
                      <div style={{ fontSize: '0.875rem', fontWeight: 800, color: '#000000' }}>
                        {isRtl ? 'ملف موحد ومصنف (Single-Sheet)' : 'Single Combined Sheet'}
                      </div>
                      <div style={{ fontSize: '0.75rem', color: 'var(--slate-600)', marginTop: '0.2rem', lineHeight: 1.4 }}>
                        {isRtl
                          ? 'صفحة واحدة مجمعة تحتوي كافة المرشحين مصنفين ومفرزين حسب التخصص.'
                          : 'Single sheet listing all candidates grouped by specialization.'}
                      </div>
                    </div>
                  </label>
                </div>

                {/* Summary Box */}
                <div
                  style={{
                    padding: '0.85rem 1rem',
                    background: 'var(--slate-100)',
                    borderRadius: '8px',
                    fontSize: '0.8125rem',
                    color: 'var(--slate-700)',
                    display: 'flex',
                    flexDirection: 'column',
                    gap: '0.45rem',
                    marginBottom: '1.25rem'
                  }}
                >
                  <div style={{ display: 'flex', justifyContent: 'space-between' }}>
                    <span>{isRtl ? 'عدد التخصصات:' : 'Job Titles:'}</span>
                    <strong style={{ color: '#000000' }}>{cartList.length}</strong>
                  </div>
                  <div style={{ display: 'flex', justifyContent: 'space-between' }}>
                    <span>{isRtl ? 'إجمالي المرشحين:' : 'Total Candidates:'}</span>
                    <strong style={{ color: '#000000' }}>{totalCandidatesCount}</strong>
                  </div>
                  <div style={{ display: 'flex', justifyContent: 'space-between' }}>
                    <span>{isRtl ? 'صيغة الملف:' : 'File Format:'}</span>
                    <strong style={{ color: '#000000' }}>Microsoft Excel (.xlsx)</strong>
                  </div>
                </div>

                {/* Download Button */}
                <button
                  type="button"
                  onClick={handleExport}
                  disabled={exporting || cartList.length === 0}
                  className="btn btn-primary"
                  style={{
                    width: '100%',
                    padding: '0.85rem 1rem',
                    borderRadius: '8px',
                    fontSize: '0.925rem',
                    fontWeight: 800,
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    gap: '0.5rem',
                    cursor: exporting || cartList.length === 0 ? 'not-allowed' : 'pointer',
                    opacity: exporting || cartList.length === 0 ? 0.6 : 1
                  }}
                >
                  {exporting ? (
                    <LoadingSpinner size="sm" />
                  ) : (
                    <>
                      <Download size={18} />
                      <span>{isRtl ? 'تصدير ملف الإكسيل الآن' : 'Export Excel File Now'}</span>
                    </>
                  )}
                </button>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
