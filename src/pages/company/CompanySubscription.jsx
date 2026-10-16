import React, { useEffect, useState, useCallback } from 'react';
import { useSearchParams } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';
import { companyApi } from '../../api/company.api';
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
  { months: 12, label: 'سنة كاملة (12 شهر)', discount: 20 },
];

// ── Plan icon and feature helpers ────────────────────────────
const PLAN_META = {
  Basic:    { icon: <Shield size={22} strokeWidth={2} />,  rank: 1 },
  Gold:     { icon: <Star size={22} strokeWidth={2} />,    rank: 2 },
  Platinum: { icon: <Zap size={22} strokeWidth={2} />,     rank: 3 },
};

function PlanFeatures({ plan }) {
  const features = [
    {
      icon: <Search size={15} />,
      text: `بحث بالمسميات الوظيفية — ${plan.dailySearchLimit} مسمى / يوم`
    },
    {
      icon: <Download size={15} />,
      text: `تحميل بيانات المرشحين — حتى ${plan.dailyDownloadLimitPerTitle} مرات لكل مسمى / يوم`
    },
    {
      icon: <Eye size={15} />,
      text: `عرض حتى ${plan.maxCandidatesPerTitle} مرشح لكل مسمى وظيفي`
    },
    ...(plan.cartEnabled ? [{
      icon: <ShoppingCart size={15} />,
      text: 'سلة المرشحين — جمع عدة مسميات وتحميلها في ملف واحد'
    }] : []),
    ...(plan.platinumBrowseEnabled ? [{
      icon: <Eye size={15} />,
      text: 'تصفح قاعدة البيانات بحرية — مشاهدة وتحميل مرشح واحد في كل مرة'
    }] : []),
  ];

  return (
    <ul style={{ listStyle: 'none', padding: 0, margin: 0, display: 'flex', flexDirection: 'column', gap: '0.6rem' }}>
      {features.map((f, i) => (
        <li key={i} style={{ display: 'flex', alignItems: 'flex-start', gap: '0.5rem', fontSize: '0.8125rem', color: 'var(--slate-700)' }}>
          <span style={{ flexShrink: 0, marginTop: '0.1rem', color: '#000' }}>{f.icon}</span>
          <span>{f.text}</span>
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

  const [plans, setPlans] = useState([]);
  const [orders, setOrders] = useState([]);
  const [loading, setLoading] = useState(true);
  const [selectedMonths, setSelectedMonths] = useState(1);
  const [initiating, setInitiating] = useState(''); // plan name being initiated
  const [showHistory, setShowHistory] = useState(false);
  const [paymentResult, setPaymentResult] = useState(searchParams.get('payment') || null);

  const currentPlan = profile?.subscriptionPlan || null;
  const subscriptionStatus = profile?.subscriptionStatus || 'inactive';
  const subscriptionEndDate = profile?.subscriptionEndDate;

  const load = useCallback(async () => {
    setLoading(true);
    try {
      const [plansRes, ordersRes] = await Promise.allSettled([
        companyApi.getPlans(),
        companyApi.getPaymentHistory()
      ]);
      if (plansRes.status === 'fulfilled') setPlans(plansRes.value.data?.data || []);
      if (ordersRes.status === 'fulfilled') setOrders(ordersRes.value.data?.data || []);
    } catch (e) {}
    setLoading(false);
  }, []);

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
        <div style={{ marginBottom: '1.5rem' }}>
          <div style={{ fontSize: '0.875rem', fontWeight: 700, color: '#000', marginBottom: '0.65rem' }}>
            مدة الاشتراك — اختر للحصول على خصم أكبر:
          </div>
          <div style={{ display: 'flex', flexWrap: 'wrap', gap: '0.5rem' }}>
            {BILLING_CYCLES.map(cycle => (
              <button
                key={cycle.months}
                type="button"
                onClick={() => setSelectedMonths(cycle.months)}
                style={{
                  padding: '0.45rem 0.9rem',
                  borderRadius: 'var(--radius-md)',
                  fontSize: '0.8125rem',
                  fontWeight: 700,
                  cursor: 'pointer',
                  border: selectedMonths === cycle.months ? '2px solid #000' : '1.5px solid var(--border)',
                  background: selectedMonths === cycle.months ? '#000' : '#fff',
                  color: selectedMonths === cycle.months ? '#fff' : 'var(--slate-700)',
                  transition: 'all 0.15s ease',
                  position: 'relative'
                }}
              >
                {cycle.label}
                {cycle.discount > 0 && (
                  <span style={{
                    position: 'absolute', top: '-8px', right: '-6px',
                    background: selectedMonths === cycle.months ? '#fff' : '#000',
                    color: selectedMonths === cycle.months ? '#000' : '#fff',
                    fontSize: '0.6rem', fontWeight: 900, padding: '0.1rem 0.3rem',
                    borderRadius: '4px'
                  }}>
                    -{cycle.discount}%
                  </span>
                )}
              </button>
            ))}
          </div>
        </div>

        {/* ── Plans Grid ── */}
        {plans.length === 0 ? (
          <div className="card" style={{ padding: '2rem', textAlign: 'center', color: 'var(--slate-500)' }}>
            لا توجد باقات متاحة حالياً. تواصل مع الإدارة.
          </div>
        ) : (
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(min(100%, 280px), 1fr))', gap: '1.25rem', marginBottom: '2rem' }}>
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
              const isInitiating = initiating === plan.planName;

              return (
                <div
                  key={plan._id}
                  className="card"
                  style={{
                    padding: '1.5rem',
                    display: 'flex',
                    flexDirection: 'column',
                    gap: '1rem',
                    border: isGold ? '2px solid #000' : '1px solid #000',
                    position: 'relative',
                    transition: 'box-shadow 0.2s ease'
                  }}
                >
                  {/* Popular badge - Centered on top border */}
                  {isGold && (
                    <div style={{
                      position: 'absolute', top: '-13px', left: '50%', transform: 'translateX(-50%)',
                      background: '#000', color: '#fff',
                      fontSize: '0.72rem', fontWeight: 900, padding: '0.22rem 0.9rem',
                      borderRadius: 'var(--radius-full)', letterSpacing: '0.03em',
                      boxShadow: '0 2px 6px rgba(0,0,0,0.15)',
                      border: '1px solid #000',
                      whiteSpace: 'nowrap',
                      zIndex: 2
                    }}>
                      الأكثر اختياراً
                    </div>
                  )}

                  {/* Plan header */}
                  <div style={{ display: 'flex', alignItems: 'center', gap: '0.65rem' }}>
                    <div style={{
                      width: 40, height: 40, borderRadius: 'var(--radius-md)',
                      background: '#000', color: '#fff',
                      display: 'flex', alignItems: 'center', justifyContent: 'center',
                      flexShrink: 0
                    }}>
                      {meta.icon}
                    </div>
                    <div>
                      <div style={{ fontWeight: 900, fontSize: '1.05rem', color: '#000' }}>
                        {plan.displayNameAr || plan.displayName}
                      </div>
                      <div style={{ fontSize: '0.75rem', color: 'var(--slate-500)', fontWeight: 600 }}>
                        {plan.planName}
                      </div>
                    </div>
                  </div>

                  {/* Plan Discount & Countdown Banner - Clean & inside the card */}
                  {isDiscountActive && (
                    <div style={{
                      background: '#000', color: '#fff',
                      borderRadius: 'var(--radius-md)', padding: '0.55rem 0.8rem',
                      display: 'flex', alignItems: 'center', justifyContent: 'space-between',
                      flexWrap: 'wrap', gap: '0.4rem', border: '1px solid #000'
                    }}>
                      <div style={{ display: 'flex', alignItems: 'center', gap: '0.45rem' }}>
                        <span style={{
                          background: '#fff', color: '#000',
                          padding: '0.12rem 0.45rem', borderRadius: '4px',
                          fontSize: '0.72rem', fontWeight: 900
                        }}>
                          خصم {plan.discountPct}%
                        </span>
                        {plan.discountLabel && (
                          <span style={{ fontSize: '0.78rem', fontWeight: 700, color: '#f4f4f5' }}>
                            {plan.discountLabel}
                          </span>
                        )}
                      </div>
                      {remainingTime && (
                        <div style={{
                          display: 'inline-flex', alignItems: 'center', gap: '0.3rem',
                          fontSize: '0.72rem', fontWeight: 700, color: '#a1a1aa'
                        }}>
                          <Clock size={12} />
                          <span>باقي {remainingTime}</span>
                        </div>
                      )}
                    </div>
                  )}

                  {/* Pricing */}
                  <div style={{ borderTop: '1px solid var(--border)', borderBottom: '1px solid var(--border)', padding: '0.75rem 0' }}>
                    <div style={{ display: 'flex', alignItems: 'baseline', gap: '0.35rem' }}>
                      <span style={{ fontSize: '1.75rem', fontWeight: 900, color: '#000' }}>
                        {pricing.total.toLocaleString()}
                      </span>
                      <span style={{ fontSize: '0.875rem', fontWeight: 700, color: 'var(--slate-500)' }}>
                        ج.م
                      </span>
                      {selectedMonths > 1 && (
                        <span style={{ fontSize: '0.75rem', color: 'var(--slate-400)', marginRight: 'auto' }}>
                          / {selectedMonths} أشهر
                        </span>
                      )}
                    </div>
                    {pricing.discountPct > 0 && (
                      <div style={{ fontSize: '0.78rem', color: '#000', marginTop: '0.3rem', display: 'flex', alignItems: 'center', gap: '0.5rem', flexWrap: 'wrap' }}>
                        <s style={{ color: 'var(--slate-400)', fontWeight: 500 }}>{pricing.originalTotal.toLocaleString()} ج.م</s>
                        <span style={{ fontWeight: 800 }}>وفر {pricing.discount.toLocaleString()} ج.م ({pricing.discountPct}% خصم)</span>
                      </div>
                    )}
                    {selectedMonths > 1 && (
                      <div style={{ fontSize: '0.72rem', color: 'var(--slate-400)', marginTop: '0.15rem' }}>
                        يعادل {Math.round(pricing.total / selectedMonths).toLocaleString()} ج.م / شهر
                      </div>
                    )}
                  </div>

                  {/* Features */}
                  <div style={{ flex: 1 }}>
                    <PlanFeatures plan={plan} />
                  </div>

                  {/* CTA */}
                  <div>
                    {isCurrent ? (
                      <div style={{
                        padding: '0.65rem', textAlign: 'center',
                        background: 'var(--slate-100)', color: 'var(--slate-600)',
                        borderRadius: 'var(--radius-md)', fontWeight: 700, fontSize: '0.875rem',
                        border: '1px dashed var(--slate-400)'
                      }}>
                        ✓ باقتك الحالية النشطة
                      </div>
                    ) : (
                      <button
                        type="button"
                        disabled={!!initiating}
                        onClick={() => handleSubscribe(plan.planName)}
                        className="btn btn-primary"
                        style={{ width: '100%', fontWeight: 700, fontSize: '0.9rem', gap: '0.5rem' }}
                      >
                        {isInitiating ? (
                          <><RefreshCw size={15} style={{ animation: 'spin 1s linear infinite' }} /> جاري التوجيه للدفع...</>
                        ) : (
                          <><CreditCard size={15} /> اشترك الآن — ادفع بأمان عبر Paymob</>
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
