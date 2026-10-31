import React, { useEffect, useState, useCallback } from 'react';
import { useSearchParams } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';
import { companyApi } from '../../api/company.api';
import { smartCache } from '../../utils/smartCache';
import {
  Search, Download, ShoppingCart, Eye, CheckCircle,
  CreditCard, Clock, AlertCircle, ChevronDown, ChevronUp,
  RefreshCw, Shield, Zap, Star
} from 'lucide-react';
import LoadingSpinner from '../../components/ui/LoadingSpinner';

// ── Billing cycle options with discounts ─────────────────────
const BILLING_CYCLES = [
  { months: 1,  label: 'شهر واحد',          discount: 0  },
  { months: 3,  label: '3 أشهر',            discount: 5  },
  { months: 6,  label: '6 أشهر',            discount: 10 },
  { months: 9,  label: '9 أشهر',            discount: 15 },
  { months: 12, label: 'سنة (12 شهر)',       discount: 20 },
];

// ── Plan icon and feature helpers ────────────────────────────
const PLAN_META = {
  Basic:    { icon: <Shield size={22} strokeWidth={2.2} />,  rank: 1 },
  Gold:     { icon: <Star size={22} strokeWidth={2.2} />,    rank: 2 },
  Platinum: { icon: <Zap size={22} strokeWidth={2.2} />,     rank: 3 },
};

function PlanFeatures({ plan }) {
  const isGold = plan.planName === 'Gold';
  const isPlatinum = plan.planName === 'Platinum';

  const features = [
    {
      icon: <Search size={16} />,
      text: `بحث بالمسميات الوظيفية — ${plan.dailySearchLimit} مسمى / يوم`,
      highlight: false
    },
    {
      icon: <Download size={16} />,
      text: `تحميل بيانات المرشحين — حتى ${plan.dailyDownloadLimitPerTitle} مرات لكل مسمى / يوم`,
      highlight: isGold || isPlatinum
    },
    {
      icon: <Eye size={16} />,
      text: `عرض حتى ${plan.maxCandidatesPerTitle} مرشح لكل مسمى وظيفي`,
      highlight: isPlatinum
    },
    ...(plan.cartEnabled ? [{
      icon: <ShoppingCart size={16} />,
      text: 'سلة المرشحين والبحث المجمع المتعدد — جمع عدة تخصصات وتنزيلها إكسيل متعدد الصفحات أو ZIP',
      highlight: true,
      badge: isGold ? '⭐ ميزة حصرية' : null
    }] : []),
    ...(plan.platinumBrowseEnabled ? [{
      icon: <Zap size={16} />,
      text: 'تصفح قاعدة البيانات الحية بحرية — استعراض وتحميل المرشحين فرادى بضغطة زر واحدة (Platinum Portal)',
      highlight: true,
      badge: '👑 ميزة VIP حصرية'
    }] : []),
  ];

  return (
    <ul style={{ listStyle: 'none', padding: 0, margin: 0, display: 'flex', flexDirection: 'column', gap: '0.75rem' }}>
      {features.map((f, i) => (
        <li
          key={i}
          style={{
            display: 'flex',
            alignItems: 'flex-start',
            gap: '0.65rem',
            fontSize: '0.825rem',
            lineHeight: 1.5,
            color: f.highlight ? '#09090b' : '#334155',
            fontWeight: f.highlight ? 700 : 500,
            background: f.highlight
              ? (isPlatinum ? '#f8fafc' : isGold ? '#fffdf0' : '#f8fafc')
              : 'transparent',
            padding: f.highlight ? '0.45rem 0.65rem' : '0.15rem 0',
            borderRadius: f.highlight ? '8px' : '0',
            border: f.highlight
              ? (isPlatinum ? '1px solid #e2e8f0' : isGold ? '1px solid #fef3c7' : 'none')
              : 'none'
          }}
        >
          <span
            style={{
              flexShrink: 0,
              marginTop: '0.15rem',
              color: isPlatinum && f.highlight ? '#09090b' : isGold && f.highlight ? '#d97706' : '#000'
            }}
          >
            {f.icon}
          </span>
          <div style={{ flex: 1 }}>
            <span>{f.text}</span>
            {f.badge && (
              <span
                style={{
                  display: 'inline-block',
                  marginInlineStart: '0.4rem',
                  fontSize: '0.7rem',
                  fontWeight: 800,
                  padding: '0.1rem 0.45rem',
                  borderRadius: '4px',
                  background: isPlatinum ? '#09090b' : '#f59e0b',
                  color: '#ffffff',
                  verticalAlign: 'middle'
                }}
              >
                {f.badge}
              </span>
            )}
          </div>
        </li>
      ))}
    </ul>
  );
}

function formatRemainingTime(endsAt) {
  if (!endsAt) return null;
  const diffMs = new Date(endsAt) - new Date();
  if (diffMs <= 0) return null;
  const diffHours = Math.floor(diffMs / (1000 * 60 * 60));
  const diffDays = Math.floor(diffHours / 24);
  const remHours = diffHours % 24;
  if (diffDays > 0) {
    return `${diffDays} يوم ${remHours > 0 ? `و ${remHours} س` : ''}`;
  }
  const diffMins = Math.floor((diffMs / (1000 * 60)) % 60);
  return `${diffHours} س و ${diffMins} د`;
}

// planDiscountPct = admin-set promo discount on the plan itself
// cycleDiscountPct = loyalty discount based on billing duration
function calcPrice(basePricePerMonth, months, planDiscountPct = 0) {
  const cycle = BILLING_CYCLES.find(c => c.months === months) || BILLING_CYCLES[0];
  // Apply plan-level discount first
  const afterPlanDiscount = basePricePerMonth * (1 - planDiscountPct / 100);
  const total = afterPlanDiscount * months;
  // Then apply billing cycle discount
  const cycleDiscount = Math.round(total * cycle.discount / 100);
  const finalTotal = Math.max(0, Math.round(total - cycleDiscount));
  const originalTotal = basePricePerMonth * months; // fully undiscounted
  const totalDiscountAmount = Math.max(0, originalTotal - finalTotal);
  const effectiveDiscountPct = originalTotal > 0 ? Math.round((totalDiscountAmount / originalTotal) * 100) : 0;
  return {
    total: finalTotal,
    originalTotal,
    discount: totalDiscountAmount,
    discountPct: effectiveDiscountPct,
    planDiscountPct,
    cycleDiscountPct: cycle.discount,
    monthly: basePricePerMonth,
    effectiveMonthly: Math.round(afterPlanDiscount)
  };
}

// ── Status banner after Paymob redirect ─────────────────────
function PaymentResultBanner({ result, onDismiss }) {
  if (!result) return null;
  const isSuccess = result === 'success';
  return (
    <div style={{
      display: 'flex', alignItems: 'center', justifyContent: 'space-between',
      gap: '1rem', flexWrap: 'wrap',
      padding: '0.875rem 1.25rem',
      borderRadius: 'var(--radius-md)',
      marginBottom: '1.5rem',
      border: isSuccess ? '1.5px solid #000' : '1.5px dashed #71717a',
      background: isSuccess ? '#000' : 'var(--slate-100)',
      color: isSuccess ? '#fff' : '#000'
    }}>
      <div style={{ display: 'flex', alignItems: 'center', gap: '0.65rem', fontWeight: 700 }}>
        {isSuccess
          ? <><CheckCircle size={18} /> تم الدفع بنجاح! تم تفعيل باقتك.</>
          : <><AlertCircle size={18} /> فشلت عملية الدفع. يرجى المحاولة مرة أخرى.</>
        }
      </div>
      <button
        type="button"
        onClick={onDismiss}
        style={{ background: 'none', border: 'none', cursor: 'pointer', color: 'inherit', fontSize: '1.1rem', lineHeight: 1 }}
      >×</button>
    </div>
  );
}

export default function CompanySubscription() {
  const { profile, refreshProfile } = useAuth();
  const [searchParams, setSearchParams] = useSearchParams();

  // Instant hydration from cache for 0ms initial render
  const cachedPlans = smartCache.get('plans_catalog', 180);
  const [plans, setPlans] = useState(() => cachedPlans?.data || []);
  const [orders, setOrders] = useState([]);
  const [loading, setLoading] = useState(() => !cachedPlans?.data?.length);
  const [selectedMonths, setSelectedMonths] = useState(1);
  const [initiating, setInitiating] = useState(''); // plan name being initiated
  const [showHistory, setShowHistory] = useState(false);
  const [paymentResult, setPaymentResult] = useState(searchParams.get('payment') || null);

  const currentPlan = profile?.subscriptionPlan || null;
  const subscriptionStatus = profile?.subscriptionStatus || 'inactive';
  const subscriptionEndDate = profile?.subscriptionEndDate;

  const load = useCallback(async () => {
    if (!cachedPlans?.data?.length) setLoading(true);
    try {
      const [plansRes, ordersRes] = await Promise.allSettled([
        companyApi.getPlans(),
        companyApi.getPaymentHistory()
      ]);
      if (plansRes.status === 'fulfilled') {
        const freshPlans = plansRes.value.data?.data || [];
        setPlans(freshPlans);
        smartCache.set('plans_catalog', freshPlans);
      }
      if (ordersRes.status === 'fulfilled') {
        setOrders(ordersRes.value.data?.data || []);
      }
    } catch (e) {}
    setLoading(false);
  }, [cachedPlans]);

  useEffect(() => {
    load();
    if (paymentResult === 'success') {
      // Refresh auth profile to get updated plan
      if (refreshProfile) refreshProfile();
    }
  }, []);

  // Clear payment result from URL
  const dismissResult = () => {
    setPaymentResult(null);
    setSearchParams({});
  };

  const handleSubscribe = async (planName) => {
    setInitiating(planName);
    try {
      const res = await companyApi.initiatePayment(planName, selectedMonths);
      const { iframeUrl } = res.data?.data || {};
      if (iframeUrl) {
        window.location.href = iframeUrl; // redirect to Paymob iframe
      }
    } catch (err) {
      alert(err.response?.data?.message || 'فشل بدء عملية الدفع. حاول مرة أخرى.');
    }
    setInitiating('');
  };

  const isExpired = subscriptionEndDate && new Date(subscriptionEndDate) < new Date();
  const hasActiveSub = subscriptionStatus === 'active' && !isExpired && currentPlan;

  // ── Render ──────────────────────────────────────────────────
  if (loading) {
    return (
      <div style={{ padding: '4rem 0', display: 'flex', justifyContent: 'center' }}>
        <LoadingSpinner />
      </div>
    );
  }

  return (
    <div dir="rtl" style={{ padding: 'clamp(1.25rem, 3vw, 2rem) 0 3rem', background: 'var(--bg-page)', minHeight: '80vh' }}>
      <div className="container">

        {/* ── Page Header ── */}
        <div style={{ marginBottom: '1.75rem' }}>
          <h1 style={{ fontSize: 'clamp(1.2rem, 3vw, 1.5rem)', fontWeight: 900, color: '#000', display: 'flex', alignItems: 'center', gap: '0.6rem', margin: 0 }}>
            <CreditCard size={22} strokeWidth={2.5} />
            الاشتراك والباقات
          </h1>
          <p style={{ fontSize: '0.8125rem', color: 'var(--slate-500)', marginTop: '0.35rem' }}>
            اختر الباقة المناسبة — يتم الدفع عبر بوابة Paymob الآمنة
          </p>
        </div>

        {/* ── Payment Result Banner ── */}
        <PaymentResultBanner result={paymentResult} onDismiss={dismissResult} />

        {/* ── Current Subscription Status ── */}
        <div className="card" style={{ marginBottom: '1.75rem', padding: '1.25rem 1.5rem' }}>
          <div style={{ display: 'flex', flexWrap: 'wrap', justifyContent: 'space-between', alignItems: 'center', gap: '1rem' }}>
            <div>
              <div style={{ fontSize: '0.75rem', fontWeight: 700, color: 'var(--slate-500)', marginBottom: '0.25rem', textTransform: 'uppercase', letterSpacing: '0.05em' }}>
                الباقة الحالية
              </div>
              {hasActiveSub ? (
                <div>
                  <span style={{ fontSize: '1.25rem', fontWeight: 900, color: '#000' }}>
                    {currentPlan === 'Platinum' ? 'البلاتينية' : currentPlan === 'Gold' ? 'الذهبية' : 'الأساسية'} ({currentPlan})
                  </span>
                  {subscriptionEndDate && (
                    <div style={{ fontSize: '0.8rem', color: 'var(--slate-500)', marginTop: '0.2rem', display: 'flex', alignItems: 'center', gap: '0.35rem' }}>
                      <Clock size={13} />
                      تنتهي في {new Date(subscriptionEndDate).toLocaleDateString('ar-EG', { year: 'numeric', month: 'long', day: 'numeric' })}
                    </div>
                  )}
                </div>
              ) : (
                <div>
                  <span style={{ fontSize: '1rem', fontWeight: 700, color: 'var(--slate-500)' }}>
                    {isExpired ? '⚠ انتهت صلاحية اشتراكك' : 'لا يوجد اشتراك نشط'}
                  </span>
                  <div style={{ fontSize: '0.8rem', color: 'var(--slate-400)', marginTop: '0.2rem' }}>
                    اختر باقة أدناه لتفعيل وصولك لقاعدة البيانات
                  </div>
                </div>
              )}
            </div>

            {hasActiveSub && (
              <span style={{
                display: 'inline-flex', alignItems: 'center', gap: '0.35rem',
                padding: '0.3rem 0.75rem', borderRadius: 'var(--radius-full)',
                fontSize: '0.75rem', fontWeight: 800,
                background: '#000', color: '#fff'
              }}>
                <CheckCircle size={13} /> نشط
              </span>
            )}
          </div>
        </div>

        {/* ── Billing Cycle Selector ── */}
        <div style={{ marginBottom: '1.75rem' }}>
          <div style={{ fontSize: '0.9rem', fontWeight: 800, color: '#09090b', marginBottom: '0.75rem' }}>
            مدة الاشتراك — اختر للحصول على خصم أكبر:
          </div>
          <div
            style={{
              display: 'grid',
              gridTemplateColumns: 'repeat(auto-fit, minmax(min(100%, 140px), 1fr))',
              gap: '0.6rem'
            }}
          >
            {BILLING_CYCLES.map(cycle => {
              const isSelected = selectedMonths === cycle.months;
              return (
                <button
                  key={cycle.months}
                  type="button"
                  onClick={() => setSelectedMonths(cycle.months)}
                  style={{
                    padding: '0.65rem 0.75rem',
                    borderRadius: '10px',
                    fontSize: '0.85rem',
                    fontWeight: 700,
                    cursor: 'pointer',
                    border: isSelected ? '2px solid #000' : '1.5px solid var(--border)',
                    background: isSelected ? '#000' : '#fff',
                    color: isSelected ? '#fff' : '#1e293b',
                    transition: 'all 0.15s ease',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    gap: '0.5rem',
                    minHeight: '44px'
                  }}
                >
                  <span>{cycle.label}</span>
                  {cycle.discount > 0 && (
                    <span
                      style={{
                        background: isSelected ? '#fff' : '#dcfce7',
                        color: isSelected ? '#000' : '#15803d',
                        fontSize: '0.72rem',
                        fontWeight: 900,
                        padding: '0.15rem 0.4rem',
                        borderRadius: '4px',
                        lineHeight: 1.1,
                        whiteSpace: 'nowrap'
                      }}
                    >
                      -{cycle.discount}%
                    </span>
                  )}
                </button>
              );
            })}
          </div>
        </div>

        {/* ── Plans Grid ── */}
        {plans.length === 0 ? (
          <div className="card" style={{ padding: '2rem', textAlign: 'center', color: 'var(--slate-500)' }}>
            لا توجد باقات متاحة حالياً. تواصل مع الإدارة.
          </div>
        ) : (
          <div
            style={{
              display: 'grid',
              gridTemplateColumns: 'repeat(auto-fit, minmax(min(100%, 300px), 1fr))',
              gap: '2rem',
              marginBottom: '2.5rem',
              paddingTop: '0.5rem',
              alignItems: 'stretch'
            }}
          >
            {plans.map((plan) => {
              const meta = PLAN_META[plan.planName] || {};
              const now = new Date();
              const hasConfig = (plan.discountPct || 0) > 0;
              const isExpired = hasConfig && plan.discountEndsAt && new Date(plan.discountEndsAt) < now;
              const isUpcoming = hasConfig && plan.discountStartsAt && new Date(plan.discountStartsAt) > now;
              const isDiscountActive = hasConfig && !isExpired && !isUpcoming;
              const effectivePlanDiscountPct = isDiscountActive ? Number(plan.discountPct) : 0;
              const remainingTime = isDiscountActive && plan.discountEndsAt ? formatRemainingTime(plan.discountEndsAt) : null;

              const pricing = calcPrice(plan.priceEgp || plan.priceMonthlyEgp, selectedMonths, effectivePlanDiscountPct);
              const isCurrent = currentPlan === plan.planName && hasActiveSub;
              const isGold = plan.planName === 'Gold';
              const isPlatinum = plan.planName === 'Platinum';
              const isMostChosen = Boolean(plan.isMostChosen) || isGold;
              const isInitiating = initiating === plan.planName;

              return (
                <div
                  key={plan._id}
                  className="card"
                  style={{
                    padding: 'clamp(1.25rem, 3.5vw, 1.75rem)',
                    display: 'flex',
                    flexDirection: 'column',
                    gap: '1.25rem',
                    border: isPlatinum
                      ? '2.5px solid #09090b'
                      : isGold
                      ? '2.5px solid #d97706'
                      : '1.5px solid #cbd5e1',
                    borderRadius: '16px',
                    position: 'relative',
                    transition: 'all 0.2s ease',
                    background: isPlatinum
                      ? 'linear-gradient(180deg, #f8fafc 0%, #ffffff 180px)'
                      : isGold
                      ? 'linear-gradient(180deg, #fffdf0 0%, #ffffff 180px)'
                      : '#ffffff',
                    boxShadow: isPlatinum
                      ? '0 12px 30px -5px rgba(0, 0, 0, 0.12)'
                      : isGold
                      ? '0 10px 25px -5px rgba(217, 119, 6, 0.12)'
                      : '0 4px 12px rgba(0, 0, 0, 0.04)'
                  }}
                >
                  {/* Popular / VIP badge */}
                  {isPlatinum ? (
                    <div
                      style={{
                        position: 'absolute',
                        top: '-14px',
                        left: '50%',
                        transform: 'translateX(-50%)',
                        background: '#09090b',
                        color: '#ffffff',
                        fontSize: '0.72rem',
                        fontWeight: 900,
                        padding: '0.25rem 1rem',
                        borderRadius: 'var(--radius-full)',
                        letterSpacing: '0.03em',
                        boxShadow: '0 4px 12px rgba(0,0,0,0.25)',
                        border: '1.5px solid #27272a',
                        whiteSpace: 'nowrap',
                        zIndex: 3,
                        display: 'inline-flex',
                        alignItems: 'center',
                        gap: '0.4rem'
                      }}
                    >
                      <Zap size={12} fill="#ffffff" strokeWidth={0} />
                      VIP — الباقة الشاملة الأعلى
                    </div>
                  ) : isMostChosen ? (
                    <div
                      style={{
                        position: 'absolute',
                        top: '-14px',
                        left: '50%',
                        transform: 'translateX(-50%)',
                        background: 'linear-gradient(135deg, #b45309 0%, #d97706 50%, #f59e0b 100%)',
                        color: '#ffffff',
                        fontSize: '0.72rem',
                        fontWeight: 900,
                        padding: '0.25rem 1rem',
                        borderRadius: 'var(--radius-full)',
                        letterSpacing: '0.03em',
                        boxShadow: '0 4px 12px rgba(217, 119, 6, 0.35)',
                        border: '1.5px solid #f59e0b',
                        whiteSpace: 'nowrap',
                        zIndex: 3,
                        display: 'inline-flex',
                        alignItems: 'center',
                        gap: '0.4rem'
                      }}
                    >
                      <Star size={12} fill="#ffffff" strokeWidth={0} />
                      الأكثر اختياراً وطلباً
                    </div>
                  ) : null}

                  {/* Plan header */}
                  <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem', marginTop: isPlatinum || isMostChosen ? '0.35rem' : '0' }}>
                    <div
                      style={{
                        width: 44,
                        height: 44,
                        borderRadius: '12px',
                        background: isPlatinum
                          ? '#09090b'
                          : isGold
                          ? 'linear-gradient(135deg, #d97706, #f59e0b)'
                          : '#0f172a',
                        color: '#ffffff',
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'center',
                        flexShrink: 0,
                        boxShadow: isPlatinum ? '0 4px 12px rgba(0,0,0,0.2)' : isGold ? '0 4px 12px rgba(217, 119, 6, 0.25)' : 'none'
                      }}
                    >
                      {meta.icon}
                    </div>
                    <div>
                      <div style={{ fontWeight: 900, fontSize: '1.15rem', color: '#09090b' }}>
                        {plan.displayNameAr || plan.displayName}
                      </div>
                      <div
                        style={{
                          fontSize: '0.75rem',
                          color: isGold ? '#b45309' : isPlatinum ? '#52525b' : '#64748b',
                          fontWeight: 700
                        }}
                      >
                        {isPlatinum ? 'صلاحيات غير محدودة + تصفح مباشر' : isGold ? 'سلة المرشحين + بحث مجمع' : 'البحث والتحميل الأساسي'}
                      </div>
                    </div>
                  </div>

                  {/* Plan Discount & Countdown Banner */}
                  {isDiscountActive && (
                    <div
                      style={{
                        background: isGold ? '#fffbeb' : '#09090b',
                        color: isGold ? '#92400e' : '#ffffff',
                        borderRadius: '10px',
                        padding: '0.75rem 0.85rem',
                        display: 'flex',
                        flexDirection: 'column',
                        gap: '0.45rem',
                        border: isGold ? '1.5px solid #fde68a' : '1px solid #27272a'
                      }}
                    >
                      <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', flexWrap: 'wrap' }}>
                        <span
                          style={{
                            background: isGold ? '#d97706' : '#ffffff',
                            color: isGold ? '#ffffff' : '#09090b',
                            padding: '0.15rem 0.45rem',
                            borderRadius: '4px',
                            fontSize: '0.75rem',
                            fontWeight: 900,
                            lineHeight: 1.2
                          }}
                        >
                          خصم {plan.discountPct}%
                        </span>
                        {plan.discountLabel && (
                          <span style={{ fontSize: '0.82rem', fontWeight: 700, color: isGold ? '#78350f' : '#f4f4f5' }}>
                            {plan.discountLabel}
                          </span>
                        )}
                      </div>
                      {remainingTime && (
                        <div
                          style={{
                            display: 'inline-flex',
                            alignItems: 'center',
                            gap: '0.35rem',
                            fontSize: '0.72rem',
                            fontWeight: 700,
                            color: isGold ? '#b45309' : '#a1a1aa'
                          }}
                        >
                          <Clock size={12} style={{ color: isGold ? '#d97706' : '#d4d4d8' }} />
                          <span>باقي على انتهاء العرض: {remainingTime}</span>
                        </div>
                      )}
                    </div>
                  )}

                  {/* Pricing */}
                  <div style={{ borderTop: '1px solid var(--border)', borderBottom: '1px solid var(--border)', padding: '0.85rem 0' }}>
                    <div style={{ display: 'flex', alignItems: 'baseline', gap: '0.35rem', flexWrap: 'wrap' }}>
                      <span style={{ fontSize: 'clamp(1.6rem, 5vw, 2rem)', fontWeight: 900, color: '#09090b' }}>
                        {pricing.total.toLocaleString()}
                      </span>
                      <span style={{ fontSize: '0.9rem', fontWeight: 800, color: '#64748b' }}>
                        ج.م
                      </span>
                      {selectedMonths > 1 && (
                        <span style={{ fontSize: '0.78rem', color: '#64748b', marginRight: 'auto', fontWeight: 600 }}>
                          / {selectedMonths} أشهر
                        </span>
                      )}
                    </div>
                    {pricing.discountPct > 0 && (
                      <div style={{ fontSize: '0.78rem', color: '#09090b', marginTop: '0.4rem', display: 'flex', alignItems: 'center', gap: '0.5rem', flexWrap: 'wrap' }}>
                        <s style={{ color: '#94a3b8', fontWeight: 500 }}>{pricing.originalTotal.toLocaleString()} ج.م</s>
                        <span style={{ fontWeight: 800, color: '#15803d', background: '#dcfce7', padding: '0.1rem 0.4rem', borderRadius: '4px' }}>
                          وفر {pricing.discount.toLocaleString()} ج.م ({pricing.discountPct}% خصم)
                        </span>
                      </div>
                    )}
                    {selectedMonths > 1 && (
                      <div style={{ fontSize: '0.75rem', color: '#64748b', marginTop: '0.25rem', fontWeight: 600 }}>
                        يعادل {Math.round(pricing.total / selectedMonths).toLocaleString()} ج.م / شهر
                      </div>
                    )}
                  </div>

                  {/* Features */}
                  <div style={{ flex: 1 }}>
                    <PlanFeatures plan={plan} />
                  </div>

                  {/* CTA Button */}
                  <div>
                    {isCurrent ? (
                      <div
                        style={{
                          padding: '0.85rem',
                          textAlign: 'center',
                          background: '#f1f5f9',
                          color: '#09090b',
                          borderRadius: '10px',
                          fontWeight: 800,
                          fontSize: '0.9rem',
                          border: '1.5px dashed #94a3b8'
                        }}
                      >
                        ✓ باقتك الحالية النشطة
                      </div>
                    ) : (
                      <button
                        type="button"
                        disabled={!!initiating}
                        onClick={() => handleSubscribe(plan.planName)}
                        className="btn"
                        style={{
                          width: '100%',
                          minHeight: '48px',
                          fontWeight: 800,
                          fontSize: '0.925rem',
                          gap: '0.5rem',
                          borderRadius: '10px',
                          background: isPlatinum
                            ? '#09090b'
                            : isGold
                            ? 'linear-gradient(135deg, #d97706 0%, #b45309 100%)'
                            : '#0f172a',
                          color: '#ffffff',
                          border: isPlatinum ? '1.5px solid #09090b' : isGold ? '1.5px solid #d97706' : '1.5px solid #0f172a',
                          boxShadow: isPlatinum ? '0 4px 12px rgba(0,0,0,0.2)' : isGold ? '0 4px 12px rgba(217, 119, 6, 0.25)' : 'none',
                          cursor: initiating ? 'not-allowed' : 'pointer'
                        }}
                      >
                        {isInitiating ? (
                          <>
                            <RefreshCw size={16} style={{ animation: 'spin 1s linear infinite' }} />
                            <span>جاري التوجيه للدفع...</span>
                          </>
                        ) : (
                          <>
                            <CreditCard size={17} />
                            <span>{isPlatinum ? 'اشترك في باقة VIP الآن' : isGold ? 'اشترك في الباقة الذهبية' : 'اشترك في الباقة الأساسية'}</span>
                          </>
                        )}
                      </button>
                    )}
                  </div>
                </div>
              );
            })}
          </div>
        )}

        {/* ── Payment History (Only Paid and Refunded) ── */}
        {(() => {
          const completedOrders = orders.filter(o => o.status === 'paid' || o.status === 'refunded');
          if (completedOrders.length === 0) return null;

          return (
            <div className="card" style={{ padding: 0, overflow: 'hidden' }}>
              <button
                type="button"
                onClick={() => setShowHistory(h => !h)}
                style={{
                  width: '100%', padding: '1rem 1.25rem',
                  display: 'flex', justifyContent: 'space-between', alignItems: 'center',
                  background: 'none', border: 'none', cursor: 'pointer',
                  fontSize: '0.9rem', fontWeight: 700, color: '#000'
                }}
              >
                <span style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                  <Clock size={16} /> سجل المدفوعات والاشتراكات ({completedOrders.length})
                </span>
                {showHistory ? <ChevronUp size={16} /> : <ChevronDown size={16} />}
              </button>

              {showHistory && (
                <div className="table-responsive" style={{ borderTop: '1px solid #000' }}>
                  <table className="data-table">
                    <thead>
                      <tr>
                        <th>الباقة</th>
                        <th>المدة</th>
                        <th>المبلغ</th>
                        <th>الحالة</th>
                        <th>التاريخ</th>
                      </tr>
                    </thead>
                    <tbody>
                      {completedOrders.map(order => (
                        <tr key={order._id}>
                          <td style={{ fontWeight: 700 }}>
                            {order.planName === 'Platinum' ? 'البلاتينية' : order.planName === 'Gold' ? 'الذهبية' : 'الأساسية'}
                          </td>
                          <td>{order.billingMonths} {order.billingMonths === 1 ? 'شهر' : 'أشهر'}</td>
                          <td style={{ fontWeight: 800 }}>{order.amountEgp?.toLocaleString()} ج.م</td>
                          <td>
                            {order.status === 'paid' && (
                              <span style={{
                                display: 'inline-flex', alignItems: 'center', gap: '0.3rem',
                                padding: '0.2rem 0.6rem', borderRadius: 'var(--radius-full)',
                                fontSize: '0.75rem', fontWeight: 800,
                                background: '#000', color: '#fff'
                              }}>
                                <CheckCircle size={12} /> مدفوع / مكتمل
                              </span>
                            )}
                            {order.status === 'refunded' && (
                              <span style={{
                                display: 'inline-flex', alignItems: 'center', gap: '0.3rem',
                                padding: '0.2rem 0.6rem', borderRadius: 'var(--radius-full)',
                                fontSize: '0.75rem', fontWeight: 800,
                                background: 'var(--slate-200)', color: 'var(--slate-800)'
                              }}>
                                مسترد (Refunded)
                              </span>
                            )}
                          </td>
                          <td style={{ fontSize: '0.8rem', color: 'var(--slate-500)' }}>
                            {new Date(order.paidAt || order.createdAt).toLocaleDateString('ar-EG')}
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              )}
            </div>
          );
        })()}

        {/* ── Info note ── */}
        <div style={{
          marginTop: '1.5rem', padding: '0.875rem 1.1rem',
          background: 'var(--slate-100)', borderRadius: 'var(--radius-md)',
          fontSize: '0.8rem', color: 'var(--slate-600)',
          display: 'flex', alignItems: 'flex-start', gap: '0.5rem'
        }}>
          <Shield size={14} style={{ flexShrink: 0, marginTop: '0.1rem' }} />
          <span>
            جميع المدفوعات تتم عبر بوابة <strong>Paymob</strong> المعتمدة. بطاقات Visa وMastercard مقبولة.
            تبدأ الباقة فور تأكيد الدفع. لا يوجد تجديد تلقائي — ستتلقى تذكيراً قبل انتهاء الاشتراك.
          </span>
        </div>

      </div>

      <style>{`
        @keyframes spin { from { transform: rotate(0deg); } to { transform: rotate(360deg); } }
      `}</style>
    </div>
  );
}
