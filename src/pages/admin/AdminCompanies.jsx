import React, { useEffect, useState, useCallback } from 'react';
import { Link, useSearchParams } from 'react-router-dom';
import { useLanguage } from '../../context/LanguageContext';
import { useToast } from '../../context/ToastContext';
import { adminApi } from '../../api/admin.api';
import {
  Building2,
  UserCheck,
  Search,
  Filter,
  Plus,
  KeyRound,
  RotateCcw,
  Shield,
  ShieldAlert,
  ShieldCheck,
  TrendingUp,
  BarChart3,
  CreditCard,
  Eye,
  Phone,
  Mail,
  MapPin,
  CheckCircle,
  XCircle,
  Clock,
  Award,
  Layers,
  ArrowUpDown,
  Download,
  Activity,
  FileSpreadsheet,
  X,
  Save,
  Check
} from 'lucide-react';
import LoadingSpinner from '../../components/ui/LoadingSpinner';
import Pagination from '../../components/ui/Pagination';
import ConfirmModal from '../../components/modals/ConfirmModal';
import EmptyState from '../../components/ui/EmptyState';

const GOVERNORATES = ['', 'الشرقية', 'القاهرة', 'الجيزة', 'الإسكندرية', 'الغربية', 'المنوفية', 'القليوبية', 'الدقهلية', 'كفر الشيخ', 'البحيرة', 'أسيوط'];

function toDatetimeLocal(dateStr) {
  if (!dateStr) return '';
  const d = new Date(dateStr);
  if (isNaN(d.getTime())) return '';
  const pad = (n) => String(n).padStart(2, '0');
  const Y = d.getFullYear();
  const M = pad(d.getMonth() + 1);
  const D = pad(d.getDate());
  const h = pad(d.getHours());
  const m = pad(d.getMinutes());
  return `${Y}-${M}-${D}T${h}:${m}`;
}

function formatRemainingTime(endsAt, startsAt = null) {
  if (!endsAt && !startsAt) return null;
  const now = new Date();
  if (startsAt && new Date(startsAt) > now) {
    const startDiff = new Date(startsAt) - now;
    const days = Math.floor(startDiff / (1000 * 60 * 60 * 24));
    const hours = Math.floor((startDiff / (1000 * 60 * 60)) % 24);
    return `يبدأ بعد ${days > 0 ? `${days} يوم و ` : ''}${hours} س`;
  }
  if (endsAt) {
    const diff = new Date(endsAt) - now;
    if (diff <= 0) return 'منتهي الصلاحية';
    const days = Math.floor(diff / (1000 * 60 * 60 * 24));
    const hours = Math.floor((diff / (1000 * 60 * 60)) % 24);
    const mins = Math.floor((diff / (1000 * 60)) % 60);
    if (days > 0) return `${days} يوم و ${hours} س`;
    if (hours > 0) return `${hours} س و ${mins} د`;
    return `${mins} دقيقة`;
  }
  return null;
}

export default function AdminCompanies() {
  const { isRtl } = useLanguage();
  const { showToast } = useToast();
  const [searchParams, setSearchParams] = useSearchParams();

  // Active Tab: 'accounts' | 'rankings' | 'bulk_analytics' | 'plans'
  const [activeTab, setActiveTab] = useState(searchParams.get('tab') || 'accounts');

  // Accounts List State
  const [accounts, setAccounts] = useState([]);
  const [total, setTotal] = useState(0);
  const [page, setPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [loading, setLoading] = useState(true);

  // Filters State
  const [keyword, setKeyword] = useState('');
  const [accountTypeFilter, setAccountTypeFilter] = useState('');
  const [verificationMethodFilter, setVerificationMethodFilter] = useState('');
  const [planFilter, setPlanFilter] = useState('');
  const [statusFilter, setStatusFilter] = useState('');

  // Eligible Verifiers for C1 / C2
  const [eligibleVerifiers, setEligibleVerifiers] = useState([]);

  // Modals
  const [createModalOpen, setCreateModalOpen] = useState(false);
  const [createFormData, setCreateFormData] = useState({
    category: 'A', // 'A' | 'B' | 'C1' | 'C2'
    companyName: '',
    contactPerson: '',
    email: '',
    phone: '',
    governorate: 'الشرقية',
    area: 'العاشر من رمضان',
    verifiedByCompanyId: '',
    subscriptionPlan: 'Basic',
    customPriceEgp: '',
    subscriptionDurationDays: '30',
    paymentMethod: 'cash'
  });
  const [createSubmitting, setCreateSubmitting] = useState(false);

  // Status Change Modal
  const [statusModal, setStatusModal] = useState({ open: false, companyId: null, companyName: '', status: 'active', reason: '' });

  // Plan Edit Modal
  const [planModal, setPlanModal] = useState({ open: false, companyId: null, companyName: '', plan: 'Basic', priceEgp: 500, durationDays: 30, paymentMethod: 'cash', status: 'active', notes: '' });

  // Individual Analytics Modal
  const [analyticsModal, setAnalyticsModal] = useState({ open: false, data: null, loading: false });

  // Confirm Modal
  const [confirmModal, setConfirmModal] = useState({ open: false, title: '', message: '', action: null, danger: false, confirmText: '' });

  // Activity Rankings State
  const [rankings, setRankings] = useState([]);
  const [rankingsMetric, setRankingsMetric] = useState('activityScore');
  const [rankingsLoading, setRankingsLoading] = useState(false);

  // Bulk Analytics State
  const [bulkAnalytics, setBulkAnalytics] = useState(null);
  const [bulkLoading, setBulkLoading] = useState(false);

  // Platform Subscription Plans State
  const [platformPlans, setPlatformPlans] = useState([]);
  const [plansLoading, setPlansLoading] = useState(false);
  const [editingPlan, setEditingPlan] = useState(null);
  const [discountModal, setDiscountModal] = useState({ open: false, plan: null, discountPct: 0, discountLabel: '', discountStartsAt: '', discountEndsAt: '' });

  // Fetch Eligible Verifiers on Mount
  useEffect(() => {
    adminApi.getEligibleVerifiers().then((res) => {
      setEligibleVerifiers(res.data?.data || []);
    }).catch(() => {});
  }, []);

  // Fetch Accounts List
  const fetchAccounts = useCallback((targetPage = 1) => {
    setLoading(true);
    const params = { page: targetPage, limit: 15 };
    if (keyword) params.keyword = keyword;
    if (accountTypeFilter) params.accountType = accountTypeFilter;
    if (verificationMethodFilter) params.verificationMethod = verificationMethodFilter;
    if (planFilter) params.subscriptionPlan = planFilter;
    if (statusFilter) params.accountStatus = statusFilter;

    adminApi
      .listEmployerAccounts(params)
      .then((res) => {
        setAccounts(res.data?.data || []);
        setTotal(res.data?.pagination?.total || 0);
        setTotalPages(res.data?.pagination?.totalPages || 1);
        setPage(targetPage);
      })
      .catch((err) => {
        showToast(err.response?.data?.message || 'فشل تحميل بيانات الحسابات', 'error');
      })
      .finally(() => setLoading(false));
  }, [keyword, accountTypeFilter, verificationMethodFilter, planFilter, statusFilter, showToast]);

  // Fetch Rankings
  const fetchRankings = useCallback(() => {
    setRankingsLoading(true);
    adminApi
      .getEmployerActivityRankings({ metric: rankingsMetric, limit: 30 })
      .then((res) => {
        setRankings(res.data?.data || []);
      })
      .catch(() => {})
      .finally(() => setRankingsLoading(false));
  }, [rankingsMetric]);

  // Fetch Bulk Analytics
  const fetchBulkAnalytics = useCallback(() => {
    setBulkLoading(true);
    adminApi
      .getBulkEmployerAnalytics()
      .then((res) => {
        setBulkAnalytics(res.data?.data || null);
      })
      .catch(() => {})
      .finally(() => setBulkLoading(false));
  }, []);

  // Fetch Platform Plans
  const fetchPlatformPlans = useCallback(() => {
    setPlansLoading(true);
    adminApi
      .listSubscriptionPlans()
      .then((res) => {
        setPlatformPlans(res.data?.data || []);
      })
      .catch(() => {})
      .finally(() => setPlansLoading(false));
  }, []);

  useEffect(() => {
    if (activeTab === 'accounts') fetchAccounts(1);
    else if (activeTab === 'rankings') fetchRankings();
    else if (activeTab === 'bulk_analytics') fetchBulkAnalytics();
    else if (activeTab === 'plans') fetchPlatformPlans();
  }, [activeTab, fetchAccounts, fetchRankings, fetchBulkAnalytics, fetchPlatformPlans]);

  // Create Employer Account Handler
  const handleCreateAccount = async (e) => {
    e.preventDefault();
    setCreateSubmitting(true);

    try {
      let accountType = 'company';
      let verificationMethod = 'manual';
      let verifiedByCompanyId = null;

      if (createFormData.category === 'A') {
        accountType = 'company';
        verificationMethod = 'manual';
      } else if (createFormData.category === 'B') {
        accountType = 'individual_hr';
        verificationMethod = 'manual';
      } else if (createFormData.category === 'C1') {
        accountType = 'company';
        verificationMethod = 'verified_by_company';
        verifiedByCompanyId = createFormData.verifiedByCompanyId;
      } else if (createFormData.category === 'C2') {
        accountType = 'individual_hr';
        verificationMethod = 'verified_by_company';
        verifiedByCompanyId = createFormData.verifiedByCompanyId;
      }

      if ((createFormData.category === 'C1' || createFormData.category === 'C2') && !verifiedByCompanyId) {
        showToast('يرجى اختيار الشركة الموثقة المعتمدة.', 'error');
        setCreateSubmitting(false);
        return;
      }

      const payload = {
        accountType,
        verificationMethod,
        verifiedByCompanyId,
        companyName: (createFormData.category === 'B' || createFormData.category === 'C2')
          ? createFormData.contactPerson
          : createFormData.companyName,
        contactPerson: createFormData.contactPerson,
        email: createFormData.email,
        phone: createFormData.phone,
        governorate: createFormData.governorate,
        area: createFormData.area,
        subscriptionPlan: createFormData.subscriptionPlan,
        subscriptionDurationDays: Number(createFormData.subscriptionDurationDays) || 30,
        paymentMethod: createFormData.paymentMethod,
        customPriceEgp: createFormData.customPriceEgp ? Number(createFormData.customPriceEgp) : undefined
      };

      const res = await adminApi.createEmployerAccount(payload);
      if (res.data?.success) {
        showToast(res.data?.message || (res.data?.data?.tempPassword ? `تم إنشاء الحساب بكلمة مرور مؤقتة: (${res.data.data.tempPassword})` : 'تم إنشاء الحساب بنجاح بكلمة مرور مؤقتة!'), 'success');
        setCreateModalOpen(false);
        setCreateFormData({
          category: 'A',
          companyName: '',
          contactPerson: '',
          email: '',
          phone: '',
          governorate: 'الشرقية',
          area: 'العاشر من رمضان',
          verifiedByCompanyId: '',
          subscriptionPlan: 'Basic',
          customPriceEgp: '',
          subscriptionDurationDays: '30',
          paymentMethod: 'cash'
        });
        fetchAccounts(1);
        adminApi.getEligibleVerifiers().then((r) => setEligibleVerifiers(r.data?.data || []));
      }
    } catch (err) {
      showToast(err.response?.data?.message || 'فشل إنشاء الحساب', 'error');
    } finally {
      setCreateSubmitting(false);
    }
  };

  // Reset Password Handler
  const handleResetPassword = (comp) => {
    setConfirmModal({
      open: true,
      title: 'إعادة تعيين كلمة المرور',
      message: `هل أنت متأكد من إعادة تعيين كلمة المرور لحساب "${comp.companyName}" وتوليد كلمة مرور مؤقتة جديدة؟ سيُلزم المستخدم بتغييرها فور تسجيل الدخول.`,
      confirmText: 'تأكيد إعادة التعيين',
      danger: true,
      action: async () => {
        try {
          const res = await adminApi.resetEmployerPassword(comp._id);
          showToast(res.data?.message || 'تم إعادة تعيين كلمة المرور بنجاح!', 'success');
          fetchAccounts(page);
        } catch (err) {
          showToast(err.response?.data?.message || 'فشل إعادة التعيين', 'error');
        }
      }
    });
  };

  // Status Change Submit
  const handleStatusSubmit = async (e) => {
    e.preventDefault();
    try {
      await adminApi.updateEmployerStatus(statusModal.companyId, statusModal.status, statusModal.reason);
      showToast('تم تحديث حالة الحساب بنجاح', 'success');
      setStatusModal({ open: false, companyId: null, companyName: '', status: 'active', reason: '' });
      fetchAccounts(page);
    } catch (err) {
      showToast(err.response?.data?.message || 'فشل تحديث الحالة', 'error');
    }
  };

  // Plan Edit Submit
  const handlePlanSubmit = async (e) => {
    e.preventDefault();
    try {
      await adminApi.updateEmployerSubscription(planModal.companyId, {
        plan: planModal.plan,
        priceEgp: Number(planModal.priceEgp),
        durationDays: Number(planModal.durationDays) || 30,
        paymentMethod: planModal.paymentMethod,
        status: planModal.status,
        notes: planModal.notes
      });
      showToast('تم تحديث خطة الاشتراك بنجاح', 'success');
      setPlanModal({ open: false, companyId: null, companyName: '', plan: 'Basic', priceEgp: 500, durationDays: 30, paymentMethod: 'cash', status: 'active', notes: '' });
      fetchAccounts(page);
    } catch (err) {
      showToast(err.response?.data?.message || 'فشل تحديث الاشتراك', 'error');
    }
  };

  // Individual Analytics Handler
  const handleViewAnalytics = async (comp) => {
    setAnalyticsModal({ open: true, data: null, loading: true });
    try {
      const res = await adminApi.getEmployerAccountAnalytics(comp._id);
      setAnalyticsModal({ open: true, data: res.data?.data, loading: false });
    } catch (err) {
      showToast(err.response?.data?.message || 'فشل تحميل تحليلات الحساب', 'error');
      setAnalyticsModal({ open: false, data: null, loading: false });
    }
  };

  // Update Platform Plan (pricing in EGP)
  const handleSavePlatformPlan = async (e) => {
    e.preventDefault();
    if (!editingPlan) return;
    try {
      await adminApi.updateSubscriptionPlan(editingPlan._id, {
        priceEgp: editingPlan.priceEgp,
        dailySearchLimit: editingPlan.dailySearchLimit,
        dailyDownloadLimitPerTitle: editingPlan.dailyDownloadLimitPerTitle,
        maxCandidatesPerTitle: editingPlan.maxCandidatesPerTitle,
        cartEnabled: editingPlan.cartEnabled,
        platinumBrowseEnabled: editingPlan.platinumBrowseEnabled,
        discountPct: editingPlan.discountPct || 0,
        discountLabel: editingPlan.discountLabel || '',
        discountStartsAt: editingPlan.discountStartsAt ? new Date(editingPlan.discountStartsAt).toISOString() : null,
        discountEndsAt: editingPlan.discountEndsAt ? new Date(editingPlan.discountEndsAt).toISOString() : null
      });
      showToast('تم تحديث بيانات خطة الاشتراك في المنصة بنجاح!', 'success');
      setEditingPlan(null);
      fetchPlatformPlans();
    } catch (err) {
      showToast(err.response?.data?.message || 'فشل حفظ الخطة', 'error');
    }
  };

  // Quick Update Package Discount
  const handleSaveDiscount = async (e) => {
    e.preventDefault();
    if (!discountModal.plan) return;
    try {
      await adminApi.updateSubscriptionPlan(discountModal.plan._id, {
        discountPct: Number(discountModal.discountPct) || 0,
        discountLabel: discountModal.discountLabel || '',
        discountStartsAt: discountModal.discountStartsAt ? new Date(discountModal.discountStartsAt).toISOString() : null,
        discountEndsAt: discountModal.discountEndsAt ? new Date(discountModal.discountEndsAt).toISOString() : null
      });
      showToast(
        discountModal.discountPct > 0
          ? `تم تفعيل خصم ${discountModal.discountPct}% على باقة ${discountModal.plan.displayNameAr || discountModal.plan.planName} بنجاح!`
          : `تم إلغاء الخصم على باقة ${discountModal.plan.displayNameAr || discountModal.plan.planName}`,
        'success'
      );
      setDiscountModal({ open: false, plan: null, discountPct: 0, discountLabel: '', discountStartsAt: '', discountEndsAt: '' });
      fetchPlatformPlans();
    } catch (err) {
      showToast(err.response?.data?.message || 'فشل تحديث الخصم', 'error');
    }
  };

  return (
    <div style={{ padding: 'clamp(1.25rem, 3vw, 2rem) 0 3rem', background: 'var(--bg-page)', minHeight: '85vh' }} dir="rtl">
      <div className="container">

        {/* ══ Page Header ══ */}
        <div style={{ display: 'flex', flexWrap: 'wrap', justifyContent: 'space-between', alignItems: 'flex-start', gap: '1rem', marginBottom: '1.75rem' }}>
          <div>
            <h1 style={{ fontSize: 'clamp(1.2rem, 3vw, 1.5rem)', fontWeight: 900, color: '#000000', display: 'flex', alignItems: 'center', gap: '0.6rem', margin: 0 }}>
              <Building2 size={24} strokeWidth={2.5} />
              إدارة وتوثيق حسابات الشركات وأصحاب العمل
            </h1>
            <p style={{ color: 'var(--slate-500)', fontSize: '0.8125rem', marginTop: '0.35rem', display: 'flex', flexWrap: 'wrap', gap: '0.4rem', alignItems: 'center' }}>
              <span>التحكم الشامل بحسابات الشركات ومسؤولي الـ HR</span>
              <span style={{ color: 'var(--slate-300)' }}>•</span>
              <span>التوثيق اليدوي وعبر الشركات</span>
              <span style={{ color: 'var(--slate-300)' }}>•</span>
              <span>الاشتراكات والحصص اليومية بتوقيت القاهرة</span>
            </p>
          </div>

          <button
            type="button"
            onClick={() => setCreateModalOpen(true)}
            className="btn btn-primary"
            style={{ fontSize: '0.875rem', padding: '0.6rem 1.1rem', flexShrink: 0 }}
          >
            <Plus size={16} />
            إنشاء حساب موثق جديد
          </button>
        </div>

        {/* ══ Tab Navigation ══ */}
        <div style={{ display: 'flex', gap: 0, marginBottom: '1.75rem', borderBottom: '2px solid #000000', overflowX: 'auto' }}>
          {[
            { key: 'accounts',       icon: <Building2 size={15} />,    label: `قائمة الحسابات (${total})` },
            { key: 'rankings',       icon: <TrendingUp size={15} />,   label: 'ترتيب النشاط' },
            { key: 'bulk_analytics', icon: <BarChart3 size={15} />,    label: 'الإحصائيات الشاملة' },
            { key: 'plans',          icon: <CreditCard size={15} />,   label: 'خطط الاشتراكات' },
          ].map((tab) => (
            <button
              key={tab.key}
              type="button"
              onClick={() => setActiveTab(tab.key)}
              style={{
                display: 'inline-flex',
                alignItems: 'center',
                gap: '0.4rem',
                padding: '0.55rem 1.1rem',
                fontSize: '0.8125rem',
                fontWeight: 700,
                background: 'none',
                border: 'none',
                borderBottom: activeTab === tab.key ? '2.5px solid #000000' : '2.5px solid transparent',
                marginBottom: '-2px',
                cursor: 'pointer',
                color: activeTab === tab.key ? '#000000' : 'var(--slate-500)',
                whiteSpace: 'nowrap',
                transition: 'color 0.15s ease, border-color 0.15s ease'
              }}
            >
              {tab.icon}
              {tab.label}
            </button>
          ))}
        </div>

        {/* ══ TAB 1: ACCOUNTS LIST ══ */}
        {activeTab === 'accounts' && (
          <>
            {/* Filter Toolbar */}
            <div className="card" style={{ marginBottom: '1.5rem', padding: '1rem 1.25rem' }}>
              {/* Search row */}
              <div style={{ marginBottom: '0.75rem' }}>
                <div style={{ position: 'relative' }}>
                  <input
                    type="text"
                    className="form-control"
                    value={keyword}
                    onChange={(e) => setKeyword(e.target.value)}
                    placeholder="بحث بالاسم أو الهاتف أو البريد الإلكتروني..."
                    style={{ paddingInlineStart: '2.5rem', fontSize: '0.9rem' }}
                  />
                  <Search
                    size={16}
                    style={{
                      position: 'absolute',
                      right: '0.875rem',
                      top: '50%',
                      transform: 'translateY(-50%)',
                      color: 'var(--slate-400)',
                      pointerEvents: 'none'
                    }}
                  />
                </div>
              </div>

              {/* Filters row */}
              <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(min(100%, 160px), 1fr))', gap: '0.65rem' }}>
                <div>
                  <label style={{ display: 'block', fontSize: '0.75rem', fontWeight: 700, color: 'var(--slate-500)', marginBottom: '0.25rem' }}>نوع الحساب</label>
                  <select
                    className="form-control"
                    style={{ padding: '0.45rem 0.75rem', fontSize: '0.8125rem' }}
                    value={accountTypeFilter}
                    onChange={(e) => setAccountTypeFilter(e.target.value)}
                  >
                    <option value="">جميع الأنواع</option>
                    <option value="company">منشأة / شركة</option>
                    <option value="individual_hr">مسؤول توظيف فردي</option>
                  </select>
                </div>

                <div>
                  <label style={{ display: 'block', fontSize: '0.75rem', fontWeight: 700, color: 'var(--slate-500)', marginBottom: '0.25rem' }}>طريقة التوثيق</label>
                  <select
                    className="form-control"
                    style={{ padding: '0.45rem 0.75rem', fontSize: '0.8125rem' }}
                    value={verificationMethodFilter}
                    onChange={(e) => setVerificationMethodFilter(e.target.value)}
                  >
                    <option value="">جميع الطرق</option>
                    <option value="manual">توثيق يدوي</option>
                    <option value="verified_by_company">موثق عبر شركة</option>
                  </select>
                </div>

                <div>
                  <label style={{ display: 'block', fontSize: '0.75rem', fontWeight: 700, color: 'var(--slate-500)', marginBottom: '0.25rem' }}>خطة الاشتراك</label>
                  <select
                    className="form-control"
                    style={{ padding: '0.45rem 0.75rem', fontSize: '0.8125rem' }}
                    value={planFilter}
                    onChange={(e) => setPlanFilter(e.target.value)}
                  >
                    <option value="">جميع الباقات</option>
                    <option value="Basic">الأساسية (Basic)</option>
                    <option value="Gold">الذهبية (Gold)</option>
                    <option value="Platinum">البلاتينية (Platinum)</option>
                  </select>
                </div>

                <div>
                  <label style={{ display: 'block', fontSize: '0.75rem', fontWeight: 700, color: 'var(--slate-500)', marginBottom: '0.25rem' }}>حالة الحساب</label>
                  <select
                    className="form-control"
                    style={{ padding: '0.45rem 0.75rem', fontSize: '0.8125rem' }}
                    value={statusFilter}
                    onChange={(e) => setStatusFilter(e.target.value)}
                  >
                    <option value="">جميع الحالات</option>
                    <option value="active">نشط</option>
                    <option value="on_hold">معلق مؤقتاً</option>
                    <option value="suspended">موقوف</option>
                    <option value="banned">محظور</option>
                  </select>
                </div>
              </div>
            </div>

            {/* Accounts Table or Empty State */}
            {loading ? (
              <div style={{ padding: '4rem 0', display: 'flex', justifyContent: 'center' }}>
                <LoadingSpinner />
              </div>
            ) : accounts.length === 0 ? (
              <EmptyState
                title={isRtl ? 'لا توجد حسابات مطابقة لمعايير البحث' : 'No Accounts Found'}
                description={isRtl ? 'يمكنك تعديل خيارات التصفية أو البدء بإنشاء حساب موثق جديد من زر الإضافة أعلاه.' : 'Try adjusting your search filters or create a new account.'}
              />
            ) : (
              <div className="table-responsive" style={{ marginBottom: '1.5rem' }}>
                <table className="data-table">
                  <thead>
                    <tr>
                      <th>{isRtl ? 'المنشأة / صاحب العمل' : 'Employer'}</th>
                      <th>{isRtl ? 'التصنيف والتوثيق' : 'Classification'}</th>
                      <th>{isRtl ? 'الباقة والسعر' : 'Plan & Price'}</th>
                      <th>{isRtl ? 'الحالة' : 'Status'}</th>
                      <th>{isRtl ? 'نشاط الحساب' : 'Activity'}</th>
                      <th style={{ textAlign: 'center' }}>{isRtl ? 'الإجراءات' : 'Actions'}</th>
                    </tr>
                  </thead>
                  <tbody>
                    {accounts.map((comp) => {
                      const isHr = comp.accountType === 'individual_hr';
                      const isVerifiedByComp = comp.verificationMethod === 'verified_by_company';

                      let categoryLabel = 'Type A: شركة موثقة يدوياً';
                      let badgeStyle = { background: '#f4f4f5', color: '#000000', border: '1px solid #000000' };
                      if (isHr && !isVerifiedByComp) {
                        categoryLabel = 'Type B: مسؤول HR موثق يدوياً';
                        badgeStyle = { background: '#f4f4f5', color: '#000000', border: '1px solid #52525b' };
                      } else if (!isHr && isVerifiedByComp) {
                        categoryLabel = 'Type C1: شركة موثقة عبر شركة';
                        badgeStyle = { background: '#ffffff', color: '#000000', border: '1.5px solid #000000' };
                      } else if (isHr && isVerifiedByComp) {
                        categoryLabel = 'Type C2: HR موثق عبر شركة';
                        badgeStyle = { background: '#ffffff', color: '#000000', border: '1.5px dashed #000000' };
                      }

                      let statusBadge = (
                        <span className="badge badge-available">
                          نشط
                        </span>
                      );
                      if (comp.accountStatus === 'on_hold') {
                        statusBadge = <span className="badge badge-pending">معلق</span>;
                      } else if (comp.accountStatus === 'suspended') {
                        statusBadge = <span className="badge badge-rejected">موقوف</span>;
                      } else if (comp.accountStatus === 'banned') {
                        statusBadge = <span className="badge badge-rejected">محظور</span>;
                      }

                      return (
                        <tr key={comp._id}>
                          {/* Account Details */}
                          <td>
                            <div style={{ display: 'flex', alignItems: 'center', gap: '0.65rem' }}>
                              <div
                                style={{
                                  width: 38,
                                  height: 38,
                                  borderRadius: 'var(--radius-md)',
                                  background: 'var(--slate-100)',
                                  display: 'flex',
                                  alignItems: 'center',
                                  justifyContent: 'center',
                                  fontWeight: 800,
                                  fontSize: '0.9rem',
                                  color: 'var(--slate-800)',
                                  flexShrink: 0
                                }}
                              >
                                {comp.companyName?.charAt(0) || 'ش'}
                              </div>
                              <div>
                                <div style={{ fontWeight: 800, color: 'var(--slate-900)', fontSize: '0.9375rem' }}>
                                  {comp.companyName}
                                </div>
                                <div style={{ fontSize: '0.78rem', color: 'var(--slate-500)', display: 'flex', alignItems: 'center', gap: '0.4rem', marginTop: '0.15rem' }}>
                                  <span>{comp.contactPerson}</span>
                                  <span>•</span>
                                  <span dir="ltr">{comp.phone}</span>
                                </div>
                                {comp.mustChangePassword && (
                                  <span
                                    style={{
                                      display: 'inline-block',
                                      marginTop: '0.25rem',
                                      fontSize: '0.68rem',
                                      fontWeight: 700,
                                      padding: '0.1rem 0.45rem',
                                      borderRadius: '4px',
                                      background: 'var(--slate-100)',
                                      color: 'var(--slate-600)',
                                      border: '1px dashed var(--slate-400)'
                                    }}
                                  >
                                    ! تغيير كلمة المرور مطلوب
                                  </span>
                                )}
                              </div>
                            </div>
                          </td>

                          {/* Classification */}
                          <td>
                            <div style={{ display: 'flex', flexDirection: 'column', gap: '0.25rem', alignItems: 'flex-start' }}>
                              <span
                                style={{
                                  fontSize: '0.72rem',
                                  fontWeight: 800,
                                  padding: '0.2rem 0.5rem',
                                  borderRadius: '4px',
                                  ...badgeStyle
                                }}
                              >
                                {categoryLabel}
                              </span>
                              {isVerifiedByComp && comp.verifiedByCompanyId && (
                                <span
                                  style={{
                                    fontSize: '0.72rem',
                                    color: 'var(--slate-500)',
                                    background: 'var(--slate-100)',
                                    padding: '0.15rem 0.45rem',
                                    borderRadius: '4px',
                                    maxWidth: '200px',
                                    overflow: 'hidden',
                                    textOverflow: 'ellipsis',
                                    whiteSpace: 'nowrap'
                                  }}
                                  title={`الموثق: ${comp.verifiedByCompanyId.companyName}`}
                                >
                                  🏢 الموثق: {comp.verifiedByCompanyId.companyName}
                                </span>
                              )}
                            </div>
                          </td>

                          {/* Subscription Plan & Price */}
                          <td>
                            <div style={{ fontWeight: 800, color: 'var(--slate-900)' }}>
                              {comp.subscriptionPlan === 'Platinum'
                                ? 'بلاتينية (Platinum)'
                                : comp.subscriptionPlan === 'Gold'
                                ? 'ذهبية (Gold)'
                                : 'أساسية (Basic)'}
                            </div>
                            <div style={{ fontSize: '0.8125rem', color: '#000000', fontWeight: 700 }}>
                              {comp.subscriptionPriceEgp || comp.monthlyPriceEgp || 0} ج.م
                            </div>
                            <div style={{ marginTop: '0.2rem', display: 'flex', gap: '0.25rem', flexWrap: 'wrap' }}>
                              {comp.paymentMethod === 'cash' && (
                                <span style={{ fontSize: '0.68rem', fontWeight: 700, padding: '0.1rem 0.4rem', borderRadius: '4px', background: '#f4f4f5', color: '#000', border: '1px solid #d4d4d8' }}>💵 نقدي</span>
                              )}
                              {comp.paymentMethod === 'free' && (
                                <span style={{ fontSize: '0.68rem', fontWeight: 700, padding: '0.1rem 0.4rem', borderRadius: '4px', background: '#f4f4f5', color: '#000', border: '1px solid #d4d4d8' }}>🎁 مجاني</span>
                              )}
                              {comp.paymentMethod === 'online' && (
                                <span style={{ fontSize: '0.68rem', fontWeight: 700, padding: '0.1rem 0.4rem', borderRadius: '4px', background: '#f4f4f5', color: '#000', border: '1px solid #d4d4d8' }}>💳 أونلاين</span>
                              )}
                              {comp.subscriptionEndDate && (
                                <span style={{ fontSize: '0.68rem', color: 'var(--slate-500)', padding: '0.1rem 0.4rem', borderRadius: '4px', background: 'var(--slate-50)', border: '1px dashed var(--slate-300)' }}>
                                  ⏳ {formatRemainingTime(comp.subscriptionEndDate)}
                                </span>
                              )}
                            </div>
                          </td>

                          {/* Status */}
                          <td>{statusBadge}</td>

                          {/* Activity Metrics */}
                          <td>
                            <div style={{ fontSize: '0.78rem', color: 'var(--slate-600)', lineHeight: 1.6 }}>
                              <div>بحث: <strong style={{ color: '#000' }}>{comp.metrics?.searches || 0}</strong></div>
                              <div>تنزيل: <strong style={{ color: '#000' }}>{comp.metrics?.downloads || 0}</strong></div>
                              <div style={{ marginTop: '0.1rem' }}>
                                <span
                                  style={{
                                    display: 'inline-block',
                                    fontSize: '0.72rem',
                                    fontWeight: 800,
                                    background: '#000',
                                    color: '#fff',
                                    padding: '0.1rem 0.45rem',
                                    borderRadius: '4px'
                                  }}
                                >
                                  {comp.metrics?.activityScore || 0} نقطة
                                </span>
                              </div>
                            </div>
                          </td>

                          {/* Actions */}
                          <td style={{ textAlign: 'center' }}>
                            <div style={{ display: 'inline-flex', gap: '0.35rem', alignItems: 'center' }}>
                              {/* Reset Password */}
                              <button
                                type="button"
                                onClick={() => handleResetPassword(comp)}
                                className="btn btn-outline btn-sm"
                                style={{ padding: '0.35rem', color: '#000000' }}
                                title="إعادة تعيين كلمة المرور وتوليد كلمة مؤقتة"
                              >
                                <KeyRound size={15} />
                              </button>

                              {/* Change Status */}
                              <button
                                type="button"
                                onClick={() =>
                                  setStatusModal({
                                    open: true,
                                    companyId: comp._id,
                                    companyName: comp.companyName,
                                    status: comp.accountStatus || 'active',
                                    reason: ''
                                  })
                                }
                                className="btn btn-outline btn-sm"
                                style={{ padding: '0.35rem' }}
                                title="تعديل حالة الحساب"
                              >
                                <Shield size={15} />
                              </button>

                              {/* Edit Plan */}
                              <button
                                type="button"
                                onClick={() =>
                                  setPlanModal({
                                    open: true,
                                    companyId: comp._id,
                                    companyName: comp.companyName,
                                    plan: comp.subscriptionPlan || 'Basic',
                                    priceEgp: comp.subscriptionPriceEgp || 500,
                                    durationDays: 30,
                                    paymentMethod: comp.paymentMethod || 'cash',
                                    status: comp.subscriptionStatus || 'active',
                                    notes: ''
                                  })
                                }
                                className="btn btn-outline btn-sm"
                                style={{ padding: '0.35rem' }}
                                title="تعديل باقة الاشتراك والسعر"
                              >
                                <CreditCard size={15} />
                              </button>

                              {/* View Analytics */}
                              <button
                                type="button"
                                onClick={() => handleViewAnalytics(comp)}
                                className="btn btn-outline btn-sm"
                                style={{ padding: '0.35rem' }}
                                title="عرض التحليلات وسجل الاستخدام"
                              >
                                <BarChart3 size={15} />
                              </button>

                              {/* View Company Detail Link */}
                              <Link
                                to={`/admin/companies/${comp._id}`}
                                className="btn btn-outline btn-sm"
                                style={{ padding: '0.35rem' }}
                                title="تفاصيل المنشأة الكاملة"
                              >
                                <Eye size={15} />
                              </Link>
                            </div>
                          </td>
                        </tr>
                      );
                    })}
                  </tbody>
                </table>
              </div>
            )}

            {totalPages > 1 && (
              <div style={{ marginTop: '1.25rem' }}>
                <Pagination currentPage={page} totalPages={totalPages} onPageChange={(p) => fetchAccounts(p)} />
              </div>
            )}
          </>
        )}

        {/* TAB 2: ACTIVITY RANKINGS */}
        {activeTab === 'rankings' && (
          <div className="card" style={{ padding: '1.5rem' }}>
            <div style={{ display: 'flex', flexWrap: 'wrap', justifyContent: 'space-between', alignItems: 'center', gap: '1rem', marginBottom: '1.5rem', paddingBottom: '1rem', borderBottom: '1px solid var(--border)' }}>
              <div>
                <h3 style={{ fontSize: '1.125rem', fontWeight: 800, color: 'var(--slate-900)', display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                  <TrendingUp size={20} />
                  <span>ترتيب نشاط وتفاعل أصحاب العمل (Activity Rankings)</span>
                </h3>
                <p style={{ fontSize: '0.8125rem', color: 'var(--slate-500)', marginTop: '0.2rem' }}>
                  معادلة التفاعل: (البحث × 1) + (المشاهدات × 2) + (التحميل × 5) + (الاتصالات × 3)
                </p>
              </div>

              <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                <span style={{ fontSize: '0.8125rem', fontWeight: 700, color: 'var(--slate-700)' }}>فرز حسب:</span>
                <select
                  className="form-control"
                  style={{ width: 'auto', minWidth: '220px', padding: '0.4rem 0.75rem', fontSize: '0.8125rem' }}
                  value={rankingsMetric}
                  onChange={(e) => setRankingsMetric(e.target.value)}
                >
                  <option value="activityScore">السكور الكلي للنشاط (Activity Score)</option>
                  <option value="searches">عدد عمليات البحث</option>
                  <option value="downloads">عدد مرات التنزيل</option>
                  <option value="views">عدد المشاهدات</option>
                  <option value="contacts">عدد الاتصالات والتواصل</option>
                </select>
              </div>
            </div>

            {rankingsLoading ? (
              <div style={{ padding: '3rem 0', display: 'flex', justifyContent: 'center' }}>
                <LoadingSpinner />
              </div>
            ) : rankings.length === 0 ? (
              <EmptyState title="لا يوجد نشاط مسجل حتى الآن" description="ستظهر هنا الحسابات الأكثر تفاعلاً ونشاطاً في قاعدة البيانات." />
            ) : (
              <div className="table-responsive">
                <table className="data-table">
                  <thead>
                    <tr>
                      <th style={{ textAlign: 'center', width: 60 }}>الترتيب</th>
                      <th>الشركة / المسؤول</th>
                      <th>الباقة</th>
                      <th>عمليات البحث</th>
                      <th>المشاهدات</th>
                      <th>التحميلات</th>
                      <th>الاتصالات</th>
                      <th style={{ textAlign: 'center' }}>السكور الإجمالي</th>
                    </tr>
                  </thead>
                  <tbody>
                    {rankings.map((r, idx) => (
                      <tr key={r.id}>
                        <td style={{ textAlign: 'center', fontWeight: 800 }}>
                          #{idx + 1}
                        </td>
                        <td style={{ fontWeight: 800, color: 'var(--slate-900)' }}>
                          {r.companyName}
                        </td>
                        <td>
                          <span className="badge badge-pending">
                            {r.subscriptionPlan}
                          </span>
                        </td>
                        <td><strong>{r.searches}</strong></td>
                        <td><strong>{r.views}</strong></td>
                        <td><strong>{r.downloads}</strong></td>
                        <td><strong>{r.contacts}</strong></td>
                        <td style={{ textAlign: 'center' }}>
                          <span style={{ fontWeight: 900, background: 'var(--slate-100)', padding: '0.25rem 0.65rem', borderRadius: '4px', border: '1px solid #000' }}>
                            {r.activityScore} نقطة
                          </span>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            )}
          </div>
        )}

        {/* TAB 3: BULK ANALYTICS */}
        {activeTab === 'bulk_analytics' && (
          <div>
            {bulkLoading ? (
              <div style={{ padding: '4rem 0', display: 'flex', justifyContent: 'center' }}>
                <LoadingSpinner />
              </div>
            ) : bulkAnalytics ? (
              <div>
                {/* Metric Summary Cards */}
                <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))', gap: '1rem', marginBottom: '1.5rem' }}>
                  <div className="card" style={{ padding: '1.25rem' }}>
                    <div style={{ fontSize: '0.8125rem', color: 'var(--slate-500)', fontWeight: 700, marginBottom: '0.25rem' }}>
                      إجمالي عمليات البحث
                    </div>
                    <div style={{ fontSize: '1.75rem', fontWeight: 900, color: 'var(--slate-900)' }}>
                      {bulkAnalytics.totals?.totalSearches || 0}
                    </div>
                  </div>

                  <div className="card" style={{ padding: '1.25rem' }}>
                    <div style={{ fontSize: '0.8125rem', color: 'var(--slate-500)', fontWeight: 700, marginBottom: '0.25rem' }}>
                      إجمالي ملفات التحميل
                    </div>
                    <div style={{ fontSize: '1.75rem', fontWeight: 900, color: 'var(--slate-900)' }}>
                      {bulkAnalytics.totals?.totalDownloads || 0}
                    </div>
                  </div>

                  <div className="card" style={{ padding: '1.25rem' }}>
                    <div style={{ fontSize: '0.8125rem', color: 'var(--slate-500)', fontWeight: 700, marginBottom: '0.25rem' }}>
                      مشاهدات المرشحين
                    </div>
                    <div style={{ fontSize: '1.75rem', fontWeight: 900, color: 'var(--slate-900)' }}>
                      {bulkAnalytics.totals?.totalViews || 0}
                    </div>
                  </div>

                  <div className="card" style={{ padding: '1.25rem' }}>
                    <div style={{ fontSize: '0.8125rem', color: 'var(--slate-500)', fontWeight: 700, marginBottom: '0.25rem' }}>
                      إجمالي الاتصالات
                    </div>
                    <div style={{ fontSize: '1.75rem', fontWeight: 900, color: 'var(--slate-900)' }}>
                      {bulkAnalytics.totals?.totalContacts || 0}
                    </div>
                  </div>

                  <div className="card" style={{ padding: '1.25rem' }}>
                    <div style={{ fontSize: '0.8125rem', color: 'var(--slate-500)', fontWeight: 700, marginBottom: '0.25rem' }}>
                      إجمالي الاشتراكات (ج.م)
                    </div>
                    <div style={{ fontSize: '1.75rem', fontWeight: 900, color: 'var(--slate-900)' }}>
                      {(bulkAnalytics.totals?.totalRevenueEgp || 0).toLocaleString()} ج.م
                    </div>
                  </div>
                </div>

                {/* Distributions */}
                <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(280px, 1fr))', gap: '1.25rem' }}>
                  {/* By Plan */}
                  <div className="card" style={{ padding: '1.25rem' }}>
                    <h4 style={{ fontSize: '0.9375rem', fontWeight: 800, marginBottom: '1rem', borderBottom: '1px solid var(--border)', paddingBottom: '0.5rem' }}>
                      توزيع الحسابات حسب باقة الاشتراك
                    </h4>
                    <div style={{ display: 'flex', flexDirection: 'column', gap: '0.65rem' }}>
                      {Object.entries(bulkAnalytics.planCounts || {}).map(([plan, count]) => (
                        <div key={plan} style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                          <span style={{ fontWeight: 700, fontSize: '0.875rem' }}>{plan}</span>
                          <span className="badge badge-available">{count} حساب</span>
                        </div>
                      ))}
                    </div>
                  </div>

                  {/* By Type */}
                  <div className="card" style={{ padding: '1.25rem' }}>
                    <h4 style={{ fontSize: '0.9375rem', fontWeight: 800, marginBottom: '1rem', borderBottom: '1px solid var(--border)', paddingBottom: '0.5rem' }}>
                      توزيع الحسابات حسب نوع الكيان
                    </h4>
                    <div style={{ display: 'flex', flexDirection: 'column', gap: '0.65rem' }}>
                      {Object.entries(bulkAnalytics.typeCounts || {}).map(([type, count]) => (
                        <div key={type} style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                          <span style={{ fontWeight: 700, fontSize: '0.875rem' }}>
                            {type === 'individual_hr' ? 'مسؤول توظيف فردي' : 'شركة / مصنع'}
                          </span>
                          <span className="badge badge-available">{count} حساب</span>
                        </div>
                      ))}
                    </div>
                  </div>

                  {/* By Verification Method */}
                  <div className="card" style={{ padding: '1.25rem' }}>
                    <h4 style={{ fontSize: '0.9375rem', fontWeight: 800, marginBottom: '1rem', borderBottom: '1px solid var(--border)', paddingBottom: '0.5rem' }}>
                      توزيع الحسابات حسب طريقة التوثيق
                    </h4>
                    <div style={{ display: 'flex', flexDirection: 'column', gap: '0.65rem' }}>
                      {Object.entries(bulkAnalytics.methodCounts || {}).map(([method, count]) => (
                        <div key={method} style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                          <span style={{ fontWeight: 700, fontSize: '0.875rem' }}>
                            {method === 'manual' ? 'يدوي من الإدارة' : 'موثق عبر شركة معتمدة'}
                          </span>
                          <span className="badge badge-available">{count} حساب</span>
                        </div>
                      ))}
                    </div>
                  </div>
                </div>
              </div>
            ) : null}
          </div>
        )}

        {/* TAB 4: SUBSCRIPTION PLANS & PRICING */}
        {activeTab === 'plans' && (
          <div>
            <div style={{ marginBottom: '1.5rem' }}>
              <h3 style={{ fontSize: '1.125rem', fontWeight: 800, color: 'var(--slate-900)' }}>
                إدارة خطط الاشتراكات والحصص اليومية والأسعار (بالجنيه المصري EGP)
              </h3>
              <p style={{ fontSize: '0.875rem', color: 'var(--slate-500)', marginTop: '0.2rem' }}>
                تحديد الحصص اليومية بتوقيت القاهرة وأسعار الباقات الثلاث (Basic, Gold, Platinum).
              </p>
            </div>

            {plansLoading ? (
              <div style={{ padding: '3rem 0', display: 'flex', justifyContent: 'center' }}>
                <LoadingSpinner />
              </div>
            ) : (
              <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(290px, 1fr))', gap: '1.5rem' }}>
                {platformPlans.map((plan) => {
                  const basePrice = Number(plan.priceEgp || plan.priceMonthlyEgp || 0);
                  const now = new Date();
                  const hasDiscountConfig = (plan.discountPct || 0) > 0;
                  const isExpired = hasDiscountConfig && plan.discountEndsAt && new Date(plan.discountEndsAt) < now;
                  const isUpcoming = hasDiscountConfig && plan.discountStartsAt && new Date(plan.discountStartsAt) > now;
                  const isDiscountActive = hasDiscountConfig && !isExpired && !isUpcoming;
                  const discountedPrice = Math.round(basePrice * (1 - (isDiscountActive ? plan.discountPct : 0) / 100));
                  const savings = basePrice - discountedPrice;
                  const timeBadge = hasDiscountConfig ? formatRemainingTime(plan.discountEndsAt, plan.discountStartsAt) : null;

                  return (
                    <div
                      key={plan._id}
                      className="card"
                      style={{
                        padding: '1.5rem',
                        display: 'flex',
                        flexDirection: 'column',
                        justifyContent: 'space-between',
                        border: isDiscountActive ? '2px solid #86efac' : isExpired ? '1.5px dashed #fca5a5' : '1px solid var(--border)',
                        position: 'relative'
                      }}
                    >
                      {/* Discount Badges */}
                      {isDiscountActive && (
                        <div style={{
                          position: 'absolute',
                          top: '-12px',
                          left: '1.25rem',
                          background: '#16a34a',
                          color: '#fff',
                          fontSize: '0.72rem',
                          fontWeight: 800,
                          padding: '0.2rem 0.65rem',
                          borderRadius: '9999px',
                          boxShadow: '0 2px 4px rgba(22, 163, 74, 0.3)',
                          display: 'flex',
                          alignItems: 'center',
                          gap: '0.3rem'
                        }}>
                          <span>🏷️ خصم {plan.discountPct}% مفعّل</span>
                          {timeBadge && (
                            <span style={{ background: '#14532d', padding: '0.1rem 0.35rem', borderRadius: '4px', fontSize: '0.65rem' }}>
                              ⏳ باقي {timeBadge}
                            </span>
                          )}
                        </div>
                      )}

                      {isExpired && (
                        <div style={{
                          position: 'absolute',
                          top: '-12px',
                          left: '1.25rem',
                          background: '#dc2626',
                          color: '#fff',
                          fontSize: '0.72rem',
                          fontWeight: 800,
                          padding: '0.2rem 0.65rem',
                          borderRadius: '9999px',
                          boxShadow: '0 2px 4px rgba(220, 38, 38, 0.25)'
                        }}>
                          ⚠️ خصم منتهي الصلاحية ({plan.discountPct}%)
                        </div>
                      )}

                      {isUpcoming && (
                        <div style={{
                          position: 'absolute',
                          top: '-12px',
                          left: '1.25rem',
                          background: '#4f46e5',
                          color: '#fff',
                          fontSize: '0.72rem',
                          fontWeight: 800,
                          padding: '0.2rem 0.65rem',
                          borderRadius: '9999px',
                          boxShadow: '0 2px 4px rgba(79, 70, 229, 0.25)'
                        }}>
                          🕒 خصم مجدول ({timeBadge})
                        </div>
                      )}

                      <div>
                        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: '0.75rem', gap: '0.5rem' }}>
                          <span className="badge badge-pending" style={{ fontSize: '0.8125rem' }}>
                            {plan.planName}
                          </span>
                          <div style={{ textAlign: 'left' }}>
                            {isDiscountActive ? (
                              <div>
                                <div style={{ fontSize: '0.85rem', color: '#94a3b8', textDecoration: 'line-through' }}>
                                  {basePrice.toLocaleString()} ج.م
                                </div>
                                <div style={{ fontSize: '1.375rem', fontWeight: 900, color: '#16a34a' }}>
                                  {discountedPrice.toLocaleString()} <span style={{ fontSize: '0.75rem', color: 'var(--slate-500)', fontWeight: 600 }}>ج.م/شهر</span>
                                </div>
                              </div>
                            ) : (
                              <div style={{ fontSize: '1.375rem', fontWeight: 900 }}>
                                {basePrice.toLocaleString()} <span style={{ fontSize: '0.75rem', color: 'var(--slate-500)', fontWeight: 600 }}>ج.م/شهر</span>
                              </div>
                            )}
                          </div>
                        </div>

                        <h4 style={{ fontSize: '1.0625rem', fontWeight: 800, color: 'var(--slate-900)', marginBottom: '0.35rem' }}>
                          {plan.displayNameAr || plan.displayName}
                        </h4>

                        {hasDiscountConfig && (
                          <div style={{ marginBottom: '0.65rem', display: 'flex', flexWrap: 'wrap', gap: '0.35rem', alignItems: 'center' }}>
                            {plan.discountLabel && (
                              <span style={{ fontSize: '0.75rem', color: '#15803d', fontWeight: 700, background: '#f0fdf4', padding: '0.2rem 0.5rem', borderRadius: '4px' }}>
                                🎉 {plan.discountLabel}
                              </span>
                            )}
                            {plan.discountEndsAt && (
                              <span style={{ fontSize: '0.72rem', color: isExpired ? '#dc2626' : 'var(--slate-500)', background: isExpired ? '#fef2f2' : 'var(--slate-100)', padding: '0.2rem 0.5rem', borderRadius: '4px' }}>
                                {isExpired ? 'انتهى في: ' : 'ينتهي: '}
                                {new Date(plan.discountEndsAt).toLocaleDateString('ar-EG', { month: 'short', day: 'numeric', hour: '2-digit', minute: '2-digit' })}
                              </span>
                            )}
                            {!plan.discountEndsAt && isDiscountActive && (
                              <span style={{ fontSize: '0.72rem', color: 'var(--slate-500)', background: 'var(--slate-100)', padding: '0.2rem 0.5rem', borderRadius: '4px' }}>
                                ♾️ خصم دائم ومستمر
                              </span>
                            )}
                          </div>
                        )}

                        <div style={{ display: 'flex', flexDirection: 'column', gap: '0.5rem', fontSize: '0.8125rem', color: 'var(--slate-700)', marginBottom: '1.5rem', marginTop: '0.5rem' }}>
                          <div style={{ display: 'flex', justifyContent: 'space-between', borderBottom: '1px solid var(--border)', paddingBottom: '0.35rem' }}>
                            <span>عمليات البحث اليومية:</span>
                            <strong>{plan.dailySearchLimit} بحث/يوم</strong>
                          </div>
                          <div style={{ display: 'flex', justifyContent: 'space-between', borderBottom: '1px solid var(--border)', paddingBottom: '0.35rem' }}>
                            <span>تنزيل لكل مسمى وظيفي:</span>
                            <strong>{plan.dailyDownloadLimitPerTitle} مرات/يوم</strong>
                          </div>
                          <div style={{ display: 'flex', justifyContent: 'space-between', borderBottom: '1px solid var(--border)', paddingBottom: '0.35rem' }}>
                            <span>المرشحين لكل مسمى:</span>
                            <strong>بحد أقصى {plan.maxCandidatesPerTitle}</strong>
                          </div>
                          <div style={{ display: 'flex', justifyContent: 'space-between', borderBottom: '1px solid var(--border)', paddingBottom: '0.35rem' }}>
                            <span>سلة المرشحين (Cart):</span>
                            <strong>{plan.cartEnabled ? '✓ مفعلة' : '✕ غير مفعلة'}</strong>
                          </div>
                          <div style={{ display: 'flex', justifyContent: 'space-between', borderBottom: '1px solid var(--border)', paddingBottom: '0.35rem' }}>
                            <span>تصفح قاعدة البيانات (VIP):</span>
                            <strong>{plan.platinumBrowseEnabled ? '✓ مفعلة (Platinum)' : '✕ غير مفعلة'}</strong>
                          </div>
                        </div>
                      </div>

                      <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '0.5rem', marginTop: '0.5rem' }}>
                        <button
                          type="button"
                          onClick={() => setDiscountModal({
                            open: true,
                            plan,
                            discountPct: plan.discountPct || 0,
                            discountLabel: plan.discountLabel || '',
                            discountStartsAt: toDatetimeLocal(plan.discountStartsAt),
                            discountEndsAt: toDatetimeLocal(plan.discountEndsAt)
                          })}
                          className="btn btn-outline"
                          style={{
                            fontSize: '0.8125rem',
                            fontWeight: 700,
                            borderColor: isDiscountActive ? '#16a34a' : 'var(--border)',
                            color: isDiscountActive ? '#15803d' : 'inherit',
                            background: isDiscountActive ? '#f0fdf4' : 'transparent',
                            gap: '0.3rem'
                          }}
                        >
                          🏷️ {hasDiscountConfig ? 'التحكم بالخصم والمدة' : 'تطبيق خصم'}
                        </button>
                        <button
                          type="button"
                          onClick={() => setEditingPlan({
                            ...plan,
                            discountStartsAt: toDatetimeLocal(plan.discountStartsAt),
                            discountEndsAt: toDatetimeLocal(plan.discountEndsAt)
                          })}
                          className="btn btn-outline"
                          style={{ fontSize: '0.8125rem', fontWeight: 700 }}
                        >
                          ⚙️ السعر والحصص
                        </button>
                      </div>
                    </div>
                  );
                })}
              </div>
            )}
          </div>
        )}

        {/* MODAL 1: CREATE EMPLOYER ACCOUNT */}
        {createModalOpen && (
          <div className="modal-overlay" onClick={() => setCreateModalOpen(false)}>
            <div className="modal-content" onClick={(e) => e.stopPropagation()} style={{ maxWidth: 580, padding: '1.75rem' }}>
              <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '1.25rem', borderBottom: '1px solid var(--border)', paddingBottom: '0.75rem' }}>
                <h3 style={{ fontSize: '1.125rem', fontWeight: 800, color: 'var(--slate-900)', display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                  <UserCheck size={20} />
                  <span>إنشاء حساب موثق جديد (Super Admin Only)</span>
                </h3>
                <button type="button" onClick={() => setCreateModalOpen(false)} style={{ background: 'none', border: 'none', cursor: 'pointer', color: 'var(--slate-400)' }}>
                  <X size={20} />
                </button>
              </div>

              <form onSubmit={handleCreateAccount}>
                {/* Category Selection */}
                <div className="form-group">
                  <label className="form-label">
                    تصنيف الحساب وطريقة التوثيق *
                  </label>
                  <select
                    className="form-control"
                    value={createFormData.category}
                    onChange={(e) => setCreateFormData({ ...createFormData, category: e.target.value })}
                  >
                    <option value="A">Type A: شركة موثقة يدوياً من الإدارة</option>
                    <option value="B">Type B: مسؤول توظيف فردي موثق يدوياً (Individual HR)</option>
                    <option value="C1">Type C1: شركة موثقة بواسطة شركة أخرى معتمدة</option>
                    <option value="C2">Type C2: مسؤول HR موثق بواسطة شركة أخرى معتمدة</option>
                  </select>
                </div>

                {/* If C1 or C2, show verifier company dropdown */}
                {(createFormData.category === 'C1' || createFormData.category === 'C2') && (
                  <div className="card" style={{ padding: '1rem', marginBottom: '1.25rem', background: 'var(--slate-50)' }}>
                    <label className="form-label">
                      الشركة المعتمدة الموثقة للطلب (Eligible Verifiers Only) *
                    </label>
                    <p style={{ fontSize: '0.75rem', color: 'var(--slate-600)', marginBottom: '0.5rem' }}>
                      ملاحظة: تظهر فقط الشركات الموثقة يدوياً من الإدارة وتظل علاقة التوثيق ظاهرة حصرياً للإدارة.
                    </p>
                    <select
                      className="form-control"
                      value={createFormData.verifiedByCompanyId}
                      onChange={(e) => setCreateFormData({ ...createFormData, verifiedByCompanyId: e.target.value })}
                      required
                    >
                      <option value="">-- اختر الشركة الموثقة --</option>
                      {eligibleVerifiers.map((v) => (
                        <option key={v._id} value={v._id}>
                          {v.companyName} ({v.contactPerson})
                        </option>
                      ))}
                    </select>
                  </div>
                )}

                {/* Account Details */}
                {(createFormData.category === 'B' || createFormData.category === 'C2') ? (
                  <div className="form-group">
                    <label className="form-label">اسم مسؤول التوظيف (HR) *</label>
                    <input
                      type="text"
                      required
                      className="form-control"
                      value={createFormData.contactPerson}
                      onChange={(e) => setCreateFormData({ ...createFormData, contactPerson: e.target.value })}
                      placeholder="مثال: أ. أحمد علي"
                    />
                  </div>
                ) : (
                  <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1rem' }}>
                    <div className="form-group">
                      <label className="form-label">اسم المنشأة / الاسم التجاري *</label>
                      <input
                        type="text"
                        required
                        className="form-control"
                        value={createFormData.companyName}
                        onChange={(e) => setCreateFormData({ ...createFormData, companyName: e.target.value })}
                        placeholder="مثال: مصنع النور للصناعات"
                      />
                    </div>

                    <div className="form-group">
                      <label className="form-label">اسم المسؤول / ممثل التوظيف *</label>
                      <input
                        type="text"
                        required
                        className="form-control"
                        value={createFormData.contactPerson}
                        onChange={(e) => setCreateFormData({ ...createFormData, contactPerson: e.target.value })}
                        placeholder="مثال: أ. أحمد علي"
                      />
                    </div>
                  </div>
                )}

                <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1rem' }}>
                  <div className="form-group">
                    <label className="form-label">البريد الإلكتروني للولوج *</label>
                    <input
                      type="email"
                      required
                      className="form-control"
                      value={createFormData.email}
                      onChange={(e) => setCreateFormData({ ...createFormData, email: e.target.value })}
                      placeholder="hr@example.com"
                    />
                  </div>

                  <div className="form-group">
                    <label className="form-label">رقم الهاتف / الواتساب *</label>
                    <input
                      type="text"
                      required
                      className="form-control"
                      value={createFormData.phone}
                      onChange={(e) => setCreateFormData({ ...createFormData, phone: e.target.value })}
                      placeholder="010XXXXXXXX"
                    />
                  </div>
                </div>

                <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1rem' }}>
                  <div className="form-group">
                    <label className="form-label">المحافظة</label>
                    <select
                      className="form-control"
                      value={createFormData.governorate}
                      onChange={(e) => setCreateFormData({ ...createFormData, governorate: e.target.value })}
                    >
                      {GOVERNORATES.filter(Boolean).map((g) => (
                        <option key={g} value={g}>{g}</option>
                      ))}
                    </select>
                  </div>

                  <div className="form-group">
                    <label className="form-label">المنطقة / المدينة</label>
                    <input
                      type="text"
                      className="form-control"
                      value={createFormData.area}
                      onChange={(e) => setCreateFormData({ ...createFormData, area: e.target.value })}
                      placeholder="العاشر من رمضان..."
                    />
                  </div>
                </div>

                {/* Subscription Plan & Price & Duration */}
                <div style={{ borderTop: '1px solid var(--border)', paddingTop: '1rem', marginBottom: '0.5rem' }}>
                  <div style={{ fontWeight: 800, fontSize: '0.875rem', color: 'var(--slate-800)', marginBottom: '0.75rem', display: 'flex', alignItems: 'center', gap: '0.4rem' }}>
                    <CreditCard size={15} />
                    بيانات الاشتراك الأولي
                  </div>
                  <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1rem' }}>
                    <div className="form-group">
                      <label className="form-label">خطة الاشتراك *</label>
                      <select
                        className="form-control"
                        value={createFormData.subscriptionPlan}
                        onChange={(e) => setCreateFormData({ ...createFormData, subscriptionPlan: e.target.value })}
                      >
                        <option value="Basic">الأساسية (Basic - 500 ج.م)</option>
                        <option value="Gold">الذهبية (Gold - 1000 ج.م)</option>
                        <option value="Platinum">البلاتينية (Platinum - 2000 ج.م)</option>
                      </select>
                    </div>

                    <div className="form-group">
                      <label className="form-label">سعر مخصص (ج.م) (اختياري)</label>
                      <input
                        type="number"
                        className="form-control"
                        value={createFormData.customPriceEgp}
                        onChange={(e) => setCreateFormData({ ...createFormData, customPriceEgp: e.target.value })}
                        placeholder="السعر الافتراضي للخطة..."
                      />
                    </div>

                    <div className="form-group">
                      <label className="form-label">مدة الاشتراك (أيام) *</label>
                      <select
                        className="form-control"
                        value={createFormData.subscriptionDurationDays}
                        onChange={(e) => setCreateFormData({ ...createFormData, subscriptionDurationDays: e.target.value })}
                      >
                        <option value="30">30 يوم (شهر واحد)</option>
                        <option value="60">60 يوم (شهران)</option>
                        <option value="90">90 يوم (3 أشهر)</option>
                        <option value="180">180 يوم (6 أشهر)</option>
                        <option value="365">365 يوم (سنة كاملة)</option>
                        <option value="3650">مدى الحياة (10 سنوات)</option>
                      </select>
                    </div>

                    <div className="form-group">
                      <label className="form-label">طريقة الدفع *</label>
                      <select
                        className="form-control"
                        value={createFormData.paymentMethod}
                        onChange={(e) => setCreateFormData({ ...createFormData, paymentMethod: e.target.value })}
                      >
                        <option value="cash">💵 نقدي (Cash) - دفع خارجي</option>
                        <option value="free">🎁 مجاني (Free) - تفعيل مجاني</option>
                        <option value="online">💳 أونلاين (Online) - عبر المنصة</option>
                      </select>
                    </div>
                  </div>
                </div>

                <div className="card" style={{ padding: '0.875rem', marginBottom: '1.25rem', fontSize: '0.8125rem', lineHeight: 1.5, background: 'var(--slate-50)' }}>
                  <div style={{ fontWeight: 800, marginBottom: '0.2rem' }}>🔒 الأمان وكلمات المرور:</div>
                  <div>
                    سيتم إنشاء الحساب بكلمة مرور مؤقتة آمنة عشوائية، وسيتم عرضها لك فور الإنشاء.
                  </div>
                  <div>
                    سيُلزم صاحب الحساب بتعيين كلمة مرور شخصية جديدة فور تسجيل الدخول الأول قبل التمكن من استخدام أي خاصية.
                  </div>
                </div>

                <div style={{ display: 'flex', justifyContent: 'flex-end', gap: '0.75rem' }}>
                  <button
                    type="button"
                    onClick={() => setCreateModalOpen(false)}
                    className="btn btn-outline"
                  >
                    إلغاء
                  </button>
                  <button
                    type="submit"
                    disabled={createSubmitting}
                    className="btn btn-primary"
                  >
                    {createSubmitting ? 'جاري الإنشاء...' : 'إنشاء الحساب وتفعيله'}
                  </button>
                </div>
              </form>
            </div>
          </div>
        )}

        {/* MODAL 2: STATUS CHANGE */}
        {statusModal.open && (
          <div className="modal-overlay" onClick={() => setStatusModal({ open: false, companyId: null, companyName: '', status: 'active', reason: '' })}>
            <div className="modal-content" onClick={(e) => e.stopPropagation()} style={{ maxWidth: 460, padding: '1.75rem' }}>
              <h3 style={{ fontSize: '1.125rem', fontWeight: 800, color: 'var(--slate-900)', marginBottom: '1rem' }}>
                تعديل حالة حساب "{statusModal.companyName}"
              </h3>
              <form onSubmit={handleStatusSubmit}>
                <div className="form-group">
                  <label className="form-label">الحالة الجديدة</label>
                  <select
                    className="form-control"
                    value={statusModal.status}
                    onChange={(e) => setStatusModal({ ...statusModal, status: e.target.value })}
                  >
                    <option value="active">نشط (Active)</option>
                    <option value="on_hold">معلق مؤقتاً (On Hold)</option>
                    <option value="suspended">موقوف (Suspended)</option>
                    <option value="banned">محظور (Banned)</option>
                    <option value="removed">محذوف نهائياً (Removed)</option>
                  </select>
                </div>

                <div className="form-group">
                  <label className="form-label">السبب / الملاحظات</label>
                  <textarea
                    rows={3}
                    className="form-control"
                    value={statusModal.reason}
                    onChange={(e) => setStatusModal({ ...statusModal, reason: e.target.value })}
                    placeholder="اكتب سبب تغيير الحالة..."
                  />
                </div>

                <div style={{ display: 'flex', justifyContent: 'flex-end', gap: '0.75rem' }}>
                  <button
                    type="button"
                    onClick={() => setStatusModal({ open: false, companyId: null, companyName: '', status: 'active', reason: '' })}
                    className="btn btn-outline"
                  >
                    إلغاء
                  </button>
                  <button type="submit" className="btn btn-primary">
                    حفظ التغييرات
                  </button>
                </div>
              </form>
            </div>
          </div>
        )}

        {/* MODAL 3: PLAN EDIT */}
        {planModal.open && (
          <div className="modal-overlay" onClick={() => setPlanModal({ open: false, companyId: null, companyName: '', plan: 'Basic', priceEgp: 500, durationDays: 30, paymentMethod: 'cash', status: 'active', notes: '' })}>
            <div className="modal-content" onClick={(e) => e.stopPropagation()} style={{ maxWidth: 520, padding: '1.75rem' }}>
              <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '1.25rem', borderBottom: '1px solid var(--border)', paddingBottom: '0.75rem' }}>
                <h3 style={{ fontSize: '1.125rem', fontWeight: 800, color: 'var(--slate-900)', margin: 0, display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                  <CreditCard size={20} />
                  تجديد / تعديل اشتراك
                </h3>
                <button type="button" onClick={() => setPlanModal({ open: false, companyId: null, companyName: '', plan: 'Basic', priceEgp: 500, durationDays: 30, paymentMethod: 'cash', status: 'active', notes: '' })} style={{ background: 'none', border: 'none', cursor: 'pointer', color: 'var(--slate-400)' }}>
                  <X size={20} />
                </button>
              </div>
              <p style={{ fontSize: '0.8125rem', color: 'var(--slate-600)', marginBottom: '1rem', padding: '0.6rem 0.875rem', background: 'var(--slate-50)', borderRadius: '6px', border: '1px solid var(--border)' }}>
                الحساب: <strong>{planModal.companyName}</strong>
              </p>
              <form onSubmit={handlePlanSubmit}>
                <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1rem' }}>
                  <div className="form-group">
                    <label className="form-label">الباقة *</label>
                    <select
                      className="form-control"
                      value={planModal.plan}
                      onChange={(e) => {
                        const p = e.target.value;
                        let price = 500;
                        if (p === 'Gold') price = 1000;
                        if (p === 'Platinum') price = 2000;
                        setPlanModal({ ...planModal, plan: p, priceEgp: price });
                      }}
                    >
                      <option value="Basic">الأساسية (Basic)</option>
                      <option value="Gold">الذهبية (Gold)</option>
                      <option value="Platinum">البلاتينية (Platinum)</option>
                    </select>
                  </div>

                  <div className="form-group">
                    <label className="form-label" style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                      <span>السعر (ج.م) *</span>
                      <span style={{ fontSize: '0.7rem', color: 'var(--slate-500)', display: 'flex', gap: '0.2rem' }}>
                        {[10, 20, 50].map(pct => {
                          const base = planModal.plan === 'Platinum' ? 2000 : planModal.plan === 'Gold' ? 1000 : 500;
                          return (
                            <button key={pct} type="button"
                              onClick={() => setPlanModal(prev => ({ ...prev, priceEgp: Math.round(base * (1 - pct / 100)) }))}
                              style={{ padding: '0.1rem 0.3rem', fontSize: '0.68rem', border: '1px solid var(--border)', borderRadius: '3px', background: 'var(--slate-100)', cursor: 'pointer' }}
                            >-{pct}%</button>
                          );
                        })}
                      </span>
                    </label>
                    <input
                      type="number"
                      className="form-control"
                      value={planModal.priceEgp}
                      onChange={(e) => setPlanModal({ ...planModal, priceEgp: Number(e.target.value) })}
                      required
                    />
                  </div>

                  <div className="form-group">
                    <label className="form-label">مدة التجديد (أيام) *</label>
                    <select
                      className="form-control"
                      value={planModal.durationDays}
                      onChange={(e) => setPlanModal({ ...planModal, durationDays: e.target.value })}
                    >
                      <option value="30">30 يوم (شهر واحد)</option>
                      <option value="60">60 يوم (شهران)</option>
                      <option value="90">90 يوم (3 أشهر)</option>
                      <option value="180">180 يوم (6 أشهر)</option>
                      <option value="365">365 يوم (سنة كاملة)</option>
                      <option value="3650">مدى الحياة (10 سنوات)</option>
                    </select>
                  </div>

                  <div className="form-group">
                    <label className="form-label">طريقة الدفع *</label>
                    <select
                      className="form-control"
                      value={planModal.paymentMethod}
                      onChange={(e) => setPlanModal({ ...planModal, paymentMethod: e.target.value })}
                    >
                      <option value="cash">💵 نقدي (Cash) - دفع خارجي</option>
                      <option value="free">🎁 مجاني (Free) - تفعيل مجاني</option>
                      <option value="online">💳 أونلاين (Online) - عبر المنصة</option>
                    </select>
                  </div>

                  <div className="form-group" style={{ gridColumn: '1 / -1' }}>
                    <label className="form-label">حالة الاشتراك *</label>
                    <select
                      className="form-control"
                      value={planModal.status}
                      onChange={(e) => setPlanModal({ ...planModal, status: e.target.value })}
                    >
                      <option value="active">نشط (Active) - مفعّل الآن</option>
                      <option value="inactive">غير نشط (Inactive) - معلق</option>
                    </select>
                  </div>

                  <div className="form-group" style={{ gridColumn: '1 / -1' }}>
                    <label className="form-label">ملاحظات (اختياري)</label>
                    <textarea
                      rows={2}
                      className="form-control"
                      value={planModal.notes}
                      onChange={(e) => setPlanModal({ ...planModal, notes: e.target.value })}
                      placeholder="مثال: دفع نقدي عبر المندوب - الدفع تم بتاريخ ..."
                      style={{ resize: 'vertical' }}
                    />
                  </div>
                </div>

                <div style={{ display: 'flex', justifyContent: 'flex-end', gap: '0.75rem', marginTop: '0.5rem' }}>
                  <button
                    type="button"
                    onClick={() => setPlanModal({ open: false, companyId: null, companyName: '', plan: 'Basic', priceEgp: 500, durationDays: 30, paymentMethod: 'cash', status: 'active', notes: '' })}
                    className="btn btn-outline"
                  >
                    إلغاء
                  </button>
                  <button type="submit" className="btn btn-primary">
                    <Save size={15} /> حفظ وتجديد الاشتراك
                  </button>
                </div>
              </form>
            </div>
          </div>
        )}

        {/* MODAL 4: INDIVIDUAL ANALYTICS */}
        {analyticsModal.open && (
          <div className="modal-overlay" onClick={() => setAnalyticsModal({ open: false, data: null, loading: false })}>
            <div className="modal-content" onClick={(e) => e.stopPropagation()} style={{ maxWidth: 640, padding: '1.75rem' }}>
              <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '1.25rem', borderBottom: '1px solid var(--border)', paddingBottom: '0.75rem' }}>
                <h3 style={{ fontSize: '1.125rem', fontWeight: 800, color: 'var(--slate-900)' }}>
                  تحليلات واستخدام الحساب: {analyticsModal.data?.account?.companyName}
                </h3>
                <button
                  type="button"
                  onClick={() => setAnalyticsModal({ open: false, data: null, loading: false })}
                  style={{ background: 'none', border: 'none', cursor: 'pointer', color: 'var(--slate-400)' }}
                >
                  <X size={20} />
                </button>
              </div>

              {analyticsModal.loading ? (
                <div style={{ padding: '3rem 0', display: 'flex', justifyContent: 'center' }}>
                  <LoadingSpinner />
                </div>
              ) : analyticsModal.data ? (
                <div>
                  {/* Metrics Summary */}
                  <div style={{ display: 'grid', gridTemplateColumns: 'repeat(4, 1fr)', gap: '0.75rem', textAlign: 'center', marginBottom: '1.5rem' }}>
                    <div className="card" style={{ padding: '0.75rem' }}>
                      <div style={{ fontSize: '0.75rem', color: 'var(--slate-500)', fontWeight: 700 }}>عمليات البحث</div>
                      <div style={{ fontSize: '1.25rem', fontWeight: 900 }}>{analyticsModal.data.metrics?.searches || 0}</div>
                    </div>
                    <div className="card" style={{ padding: '0.75rem' }}>
                      <div style={{ fontSize: '0.75rem', color: 'var(--slate-500)', fontWeight: 700 }}>المشاهدات</div>
                      <div style={{ fontSize: '1.25rem', fontWeight: 900 }}>{analyticsModal.data.metrics?.views || 0}</div>
                    </div>
                    <div className="card" style={{ padding: '0.75rem' }}>
                      <div style={{ fontSize: '0.75rem', color: 'var(--slate-500)', fontWeight: 700 }}>التنزيل والتحميل</div>
                      <div style={{ fontSize: '1.25rem', fontWeight: 900 }}>{analyticsModal.data.metrics?.downloads || 0}</div>
                    </div>
                    <div className="card" style={{ padding: '0.75rem' }}>
                      <div style={{ fontSize: '0.75rem', color: 'var(--slate-500)', fontWeight: 700 }}>الاتصالات</div>
                      <div style={{ fontSize: '1.25rem', fontWeight: 900 }}>{analyticsModal.data.metrics?.contacts || 0}</div>
                    </div>
                  </div>

                  {/* 30-Day Cairo Daily Usage Table */}
                  <h4 style={{ fontSize: '0.875rem', fontWeight: 800, marginBottom: '0.5rem' }}>
                    سجل الاستخدام اليومي (توقيت القاهرة)
                  </h4>
                  <div className="table-responsive" style={{ maxHeight: 220, overflowY: 'auto' }}>
                    <table className="data-table">
                      <thead>
                        <tr>
                          <th>التاريخ (Cairo)</th>
                          <th>البحث</th>
                          <th>التحميل بالوظائف</th>
                          <th>تصفح VIP</th>
                        </tr>
                      </thead>
                      <tbody>
                        {(analyticsModal.data.dailyHistory || []).map((dh) => (
                          <tr key={dh._id}>
                            <td style={{ fontFamily: 'monospace', fontWeight: 700 }}>{dh.cairoDate}</td>
                            <td>{dh.searchesCount}</td>
                            <td>{Object.keys(dh.downloadsByJobTitle || {}).length} مسمى</td>
                            <td>{dh.platinumSingleViewsCount || 0} مشاهدة / {dh.platinumSingleDownloadsCount || 0} تنزيل</td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  </div>
                </div>
              ) : null}
            </div>
          </div>
        )}

        {/* MODAL 5: EDIT PLATFORM PLAN */}
        {editingPlan && (
          <div className="modal-overlay" onClick={() => setEditingPlan(null)}>
            <div className="modal-content" onClick={(e) => e.stopPropagation()} style={{ maxWidth: 480, padding: '1.75rem' }}>
              <h3 style={{ fontSize: '1.125rem', fontWeight: 800, color: 'var(--slate-900)', marginBottom: '1.25rem' }}>
                تعديل خطة: {editingPlan.displayNameAr || editingPlan.planName}
              </h3>
              <form onSubmit={handleSavePlatformPlan}>
                <div className="form-group">
                  <label className="form-label">السعر الشهري (EGP)</label>
                  <input
                    type="number"
                    className="form-control"
                    value={editingPlan.priceEgp}
                    onChange={(e) => setEditingPlan({ ...editingPlan, priceEgp: Number(e.target.value) })}
                    required
                  />
                </div>

                <div className="form-group">
                  <label className="form-label">الحد اليومي لعمليات البحث</label>
                  <input
                    type="number"
                    className="form-control"
                    value={editingPlan.dailySearchLimit}
                    onChange={(e) => setEditingPlan({ ...editingPlan, dailySearchLimit: Number(e.target.value) })}
                    required
                  />
                </div>

                <div className="form-group">
                  <label className="form-label">الحد اليومي لتنزيل الملفات لكل مسمى</label>
                  <input
                    type="number"
                    className="form-control"
                    value={editingPlan.dailyDownloadLimitPerTitle}
                    onChange={(e) => setEditingPlan({ ...editingPlan, dailyDownloadLimitPerTitle: Number(e.target.value) })}
                    required
                  />
                </div>

                <div className="form-group">
                  <label className="form-label">الحد الأقصى للمرشحين لكل مسمى</label>
                  <input
                    type="number"
                    className="form-control"
                    value={editingPlan.maxCandidatesPerTitle}
                    onChange={(e) => setEditingPlan({ ...editingPlan, maxCandidatesPerTitle: Number(e.target.value) })}
                    required
                  />
                </div>

                <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', marginBottom: '0.75rem' }}>
                  <input
                    type="checkbox"
                    id="cartEnabled"
                    checked={editingPlan.cartEnabled}
                    onChange={(e) => setEditingPlan({ ...editingPlan, cartEnabled: e.target.checked })}
                    style={{ width: 16, height: 16 }}
                  />
                  <label htmlFor="cartEnabled" style={{ fontSize: '0.875rem', fontWeight: 700, cursor: 'pointer' }}>
                    تفعيل سلة المرشحين المتعددة (Candidate Cart)
                  </label>
                </div>

                <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', marginBottom: '1.25rem' }}>
                  <input
                    type="checkbox"
                    id="platinumBrowseEnabled"
                    checked={editingPlan.platinumBrowseEnabled}
                    onChange={(e) => setEditingPlan({ ...editingPlan, platinumBrowseEnabled: e.target.checked })}
                    style={{ width: 16, height: 16 }}
                  />
                  <label htmlFor="platinumBrowseEnabled" style={{ fontSize: '0.875rem', fontWeight: 700, cursor: 'pointer' }}>
                    تفعيل بوابة التصفح المباشر (VIP Platinum Browse)
                  </label>
                </div>

                {/* Discount Section */}
                <div style={{ borderTop: '1px solid var(--border)', paddingTop: '1rem', marginTop: '0.5rem', marginBottom: '1.25rem' }}>
                  <div style={{ fontSize: '0.875rem', fontWeight: 800, color: 'var(--slate-800)', marginBottom: '0.5rem' }}>
                    🏷 خصم ترويجي على الباقة
                  </div>

                  {/* Preset discount buttons */}
                  <div style={{ display: 'flex', flexWrap: 'wrap', gap: '0.4rem', marginBottom: '0.75rem' }}>
                    {[0, 5, 10, 15, 20, 25, 30, 50].map((pct) => (
                      <button
                        key={pct}
                        type="button"
                        onClick={() => setEditingPlan({ ...editingPlan, discountPct: pct })}
                        style={{
                          padding: '0.25rem 0.6rem',
                          fontSize: '0.75rem',
                          fontWeight: 700,
                          borderRadius: '6px',
                          border: (editingPlan.discountPct || 0) === pct ? '1.5px solid #16a34a' : '1px solid var(--border)',
                          background: (editingPlan.discountPct || 0) === pct ? '#dcfce7' : 'var(--slate-50)',
                          color: (editingPlan.discountPct || 0) === pct ? '#15803d' : 'inherit',
                          cursor: 'pointer'
                        }}
                      >
                        {pct === 0 ? 'بدون خصم (0%)' : `${pct}%`}
                      </button>
                    ))}
                  </div>

                  <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '0.75rem', marginBottom: '0.75rem' }}>
                    <div className="form-group" style={{ margin: 0 }}>
                      <label className="form-label">نسبة الخصم (%)</label>
                      <input
                        type="number"
                        className="form-control"
                        min="0" max="100"
                        value={editingPlan.discountPct || 0}
                        onChange={(e) => setEditingPlan({ ...editingPlan, discountPct: Math.min(100, Math.max(0, Number(e.target.value))) })}
                        placeholder="0"
                      />
                    </div>
                    <div className="form-group" style={{ margin: 0 }}>
                      <label className="form-label">وصف الخصم</label>
                      <input
                        type="text"
                        className="form-control"
                        value={editingPlan.discountLabel || ''}
                        onChange={(e) => setEditingPlan({ ...editingPlan, discountLabel: e.target.value })}
                        placeholder="مثال: عرض رمضان، خصم الصيف"
                      />
                    </div>
                  </div>

                  {/* Time bounds in edit plan modal */}
                  <div style={{ marginBottom: '0.75rem' }}>
                    <label className="form-label" style={{ fontSize: '0.8125rem', fontWeight: 700, marginBottom: '0.35rem' }}>
                      مدة سريان الخصم (اختر المدة بنقرة واحدة):
                    </label>
                    <div style={{ display: 'flex', flexWrap: 'wrap', gap: '0.3rem', marginBottom: '0.5rem' }}>
                      {[
                        { label: 'دائم', days: 0 },
                        { label: '24 ساعة', days: 1 },
                        { label: '3 أيام', days: 3 },
                        { label: 'أسبوع', days: 7 },
                        { label: 'شهر', days: 30 }
                      ].map((item) => (
                        <button
                          key={item.label}
                          type="button"
                          onClick={() => {
                            if (item.days === 0) {
                              setEditingPlan(prev => ({ ...prev, discountEndsAt: '', discountStartsAt: '' }));
                            } else {
                              const d = new Date();
                              d.setTime(d.getTime() + item.days * 24 * 60 * 60 * 1000);
                              setEditingPlan(prev => ({ ...prev, discountEndsAt: toDatetimeLocal(d) }));
                            }
                          }}
                          style={{
                            padding: '0.2rem 0.5rem',
                            fontSize: '0.7rem',
                            borderRadius: '4px',
                            border: '1px solid var(--border)',
                            background: (!editingPlan.discountEndsAt && item.days === 0) ? '#dcfce7' : 'var(--slate-50)',
                            color: (!editingPlan.discountEndsAt && item.days === 0) ? '#15803d' : 'inherit',
                            cursor: 'pointer'
                          }}
                        >
                          {item.label}
                        </button>
                      ))}
                    </div>
                    <div className="form-group" style={{ margin: 0 }}>
                      <label className="form-label" style={{ fontSize: '0.75rem' }}>تاريخ ووقت انتهاء الخصم</label>
                      <input
                        type="datetime-local"
                        className="form-control"
                        value={editingPlan.discountEndsAt || ''}
                        onChange={(e) => setEditingPlan({ ...editingPlan, discountEndsAt: e.target.value })}
                      />
                    </div>
                  </div>

                  {(editingPlan.discountPct > 0) && (
                    <div style={{ marginTop: '0.6rem', padding: '0.5rem 0.75rem', background: '#f0fdf4', border: '1px solid #86efac', borderRadius: '6px', fontSize: '0.8125rem', color: '#15803d', fontWeight: 700 }}>
                      السعر بعد الخصم: <s style={{ color: '#94a3b8', fontWeight: 500 }}>{Number(editingPlan.priceEgp).toLocaleString()} ج.م</s>{' '}
                      ← {Math.round(editingPlan.priceEgp * (1 - editingPlan.discountPct / 100)).toLocaleString()} ج.م / شهر
                      {' '}(توفير: {Math.round(editingPlan.priceEgp * (editingPlan.discountPct / 100)).toLocaleString()} ج.م)
                      {editingPlan.discountEndsAt && (
                        <div style={{ fontSize: '0.72rem', color: 'var(--slate-600)', marginTop: '0.2rem' }}>
                          ⏳ العرض ساري حتى: {new Date(editingPlan.discountEndsAt).toLocaleString('ar-EG')}
                        </div>
                      )}
                    </div>
                  )}
                  {editingPlan.discountPct > 0 && (
                    <button
                      type="button"
                      onClick={() => setEditingPlan({ ...editingPlan, discountPct: 0, discountLabel: '', discountEndsAt: '', discountStartsAt: '' })}
                      style={{ marginTop: '0.5rem', background: 'none', border: 'none', color: '#dc2626', fontSize: '0.8rem', cursor: 'pointer', padding: 0, fontWeight: 700 }}
                    >
                      ✕ إلغاء الخصم تماماً
                    </button>
                  )}
                </div>

                <div style={{ display: 'flex', justifyContent: 'flex-end', gap: '0.75rem' }}>
                  <button
                    type="button"
                    onClick={() => setEditingPlan(null)}
                    className="btn btn-outline"
                  >
                    إلغاء
                  </button>
                  <button type="submit" className="btn btn-primary">
                    حفظ التغييرات
                  </button>
                </div>
              </form>
            </div>
          </div>
        )}

        {/* MODAL 5: DEDICATED PACKAGE DISCOUNT & DURATION MODAL */}
        {discountModal.open && discountModal.plan && (() => {
          const basePrice = Number(discountModal.plan.priceEgp || discountModal.plan.priceMonthlyEgp || 0);
          const currentPct = Number(discountModal.discountPct) || 0;
          const finalPrice = Math.round(basePrice * (1 - currentPct / 100));
          const savings = basePrice - finalPrice;
          const timeRemaining = formatRemainingTime(discountModal.discountEndsAt, discountModal.discountStartsAt);

          return (
            <div className="modal-overlay" onClick={() => setDiscountModal({ open: false, plan: null, discountPct: 0, discountLabel: '', discountStartsAt: '', discountEndsAt: '' })}>
              <div className="modal-content" onClick={(e) => e.stopPropagation()} style={{ maxWidth: 540, padding: '1.75rem' }}>
                <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '1.25rem', borderBottom: '1px solid var(--border)', paddingBottom: '0.75rem' }}>
                  <h3 style={{ fontSize: '1.15rem', fontWeight: 900, color: 'var(--slate-900)', display: 'flex', alignItems: 'center', gap: '0.5rem', margin: 0 }}>
                    🏷️ التحكم في نسبة ومدة خصم باقة {discountModal.plan.displayNameAr || discountModal.plan.planName}
                  </h3>
                  <button
                    type="button"
                    onClick={() => setDiscountModal({ open: false, plan: null, discountPct: 0, discountLabel: '', discountStartsAt: '', discountEndsAt: '' })}
                    style={{ background: 'none', border: 'none', fontSize: '1.25rem', cursor: 'pointer', color: 'var(--slate-400)' }}
                  >
                    ✕
                  </button>
                </div>

                <form onSubmit={handleSaveDiscount}>
                  {/* Base plan summary card */}
                  <div style={{ background: 'var(--slate-50)', border: '1px solid var(--border)', borderRadius: '8px', padding: '0.875rem 1rem', marginBottom: '1.25rem', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                    <div>
                      <div style={{ fontSize: '0.75rem', color: 'var(--slate-500)', fontWeight: 600 }}>السعر الأساسي الحالي للباقة</div>
                      <div style={{ fontSize: '1.15rem', fontWeight: 900, color: 'var(--slate-900)' }}>
                        {basePrice.toLocaleString()} ج.م <span style={{ fontSize: '0.75rem', fontWeight: 600, color: 'var(--slate-500)' }}>/ شهر</span>
                      </div>
                    </div>
                    <span className="badge badge-pending">{discountModal.plan.planName}</span>
                  </div>

                  {/* SECTION 1: DISCOUNT PERCENTAGE */}
                  <div style={{ marginBottom: '1.25rem' }}>
                    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '0.5rem' }}>
                      <label className="form-label" style={{ fontWeight: 800, margin: 0 }}>
                        1. نسبة الخصم (%):
                      </label>
                      <span style={{ fontSize: '0.8rem', fontWeight: 800, color: currentPct > 0 ? '#15803d' : 'var(--slate-500)' }}>
                        {currentPct}% خصم
                      </span>
                    </div>

                    {/* Presets */}
                    <div style={{ display: 'flex', flexWrap: 'wrap', gap: '0.4rem', marginBottom: '0.75rem' }}>
                      {[0, 5, 10, 15, 20, 25, 30, 40, 50, 70].map((pct) => (
                        <button
                          key={pct}
                          type="button"
                          onClick={() => setDiscountModal(prev => ({ ...prev, discountPct: pct }))}
                          style={{
                            padding: '0.35rem 0.65rem',
                            fontSize: '0.8rem',
                            fontWeight: 800,
                            borderRadius: '6px',
                            border: currentPct === pct ? '1.5px solid #16a34a' : '1px solid var(--border)',
                            background: currentPct === pct ? '#dcfce7' : '#fff',
                            color: currentPct === pct ? '#15803d' : 'var(--slate-700)',
                            cursor: 'pointer',
                            boxShadow: currentPct === pct ? '0 1px 3px rgba(22, 163, 74, 0.2)' : 'none',
                            transition: 'all 0.15s ease'
                          }}
                        >
                          {pct === 0 ? 'بدون (0%)' : `${pct}%`}
                        </button>
                      ))}
                    </div>

                    <div style={{ display: 'grid', gridTemplateColumns: '1fr 1.3fr', gap: '0.75rem' }}>
                      <div className="form-group" style={{ margin: 0 }}>
                        <label className="form-label" style={{ fontSize: '0.78rem' }}>إدخال نسبة مخصصة (%)</label>
                        <input
                          type="number"
                          className="form-control"
                          min="0"
                          max="100"
                          value={discountModal.discountPct}
                          onChange={(e) => setDiscountModal(prev => ({ ...prev, discountPct: Math.min(100, Math.max(0, Number(e.target.value))) }))}
                          placeholder="0"
                          required
                        />
                      </div>
                      <div className="form-group" style={{ margin: 0 }}>
                        <label className="form-label" style={{ fontSize: '0.78rem' }}>مسمى / سبب الخصم</label>
                        <input
                          type="text"
                          className="form-control"
                          value={discountModal.discountLabel}
                          onChange={(e) => setDiscountModal(prev => ({ ...prev, discountLabel: e.target.value }))}
                          placeholder="مثال: عرض رمضان، خصم خاص"
                        />
                      </div>
                    </div>
                  </div>

                  {/* SECTION 2: DISCOUNT TIME & DURATION */}
                  <div style={{ borderTop: '1px solid var(--border)', paddingTop: '1rem', marginBottom: '1.25rem' }}>
                    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '0.5rem' }}>
                      <label className="form-label" style={{ fontWeight: 800, margin: 0 }}>
                        2. مدة وسريان الخصم (لأي وقت يكون الخصم متاحاً؟):
                      </label>
                      {discountModal.discountEndsAt && (
                        <span style={{ fontSize: '0.72rem', color: '#15803d', fontWeight: 700, background: '#f0fdf4', padding: '0.15rem 0.45rem', borderRadius: '4px' }}>
                          ⏳ {timeRemaining}
                        </span>
                      )}
                    </div>

                    {/* Quick duration presets */}
                    <div style={{ display: 'flex', flexWrap: 'wrap', gap: '0.35rem', marginBottom: '0.75rem' }}>
                      {[
                        { label: 'دائم (بدون انتهاء)', days: 0 },
                        { label: '24 ساعة (يوم)', days: 1 },
                        { label: '3 أيام', days: 3 },
                        { label: 'أسبوع (7 أيام)', days: 7 },
                        { label: 'أسبوعين (14 يوم)', days: 14 },
                        { label: 'شهر (30 يوم)', days: 30 }
                      ].map((item) => (
                        <button
                          key={item.label}
                          type="button"
                          onClick={() => {
                            if (item.days === 0) {
                              setDiscountModal(prev => ({ ...prev, discountEndsAt: '', discountStartsAt: '' }));
                            } else {
                              const d = new Date();
                              d.setTime(d.getTime() + item.days * 24 * 60 * 60 * 1000);
                              setDiscountModal(prev => ({ ...prev, discountEndsAt: toDatetimeLocal(d) }));
                            }
                          }}
                          style={{
                            padding: '0.3rem 0.6rem',
                            fontSize: '0.75rem',
                            fontWeight: 700,
                            borderRadius: '6px',
                            border: '1px solid var(--border)',
                            background: (!discountModal.discountEndsAt && item.days === 0) ? '#dcfce7' : 'var(--slate-50)',
                            color: (!discountModal.discountEndsAt && item.days === 0) ? '#15803d' : 'var(--slate-700)',
                            cursor: 'pointer'
                          }}
                        >
                          {item.label}
                        </button>
                      ))}
                    </div>

                    <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '0.75rem' }}>
                      <div className="form-group" style={{ margin: 0 }}>
                        <label className="form-label" style={{ fontSize: '0.78rem' }}>
                          تاريخ ووقت انتهاء الخصم
                        </label>
                        <input
                          type="datetime-local"
                          className="form-control"
                          value={discountModal.discountEndsAt || ''}
                          onChange={(e) => setDiscountModal(prev => ({ ...prev, discountEndsAt: e.target.value }))}
                        />
                      </div>
                      <div className="form-group" style={{ margin: 0 }}>
                        <label className="form-label" style={{ fontSize: '0.78rem' }}>
                          تاريخ ووقت بدء الخصم (اختياري)
                        </label>
                        <input
                          type="datetime-local"
                          className="form-control"
                          value={discountModal.discountStartsAt || ''}
                          onChange={(e) => setDiscountModal(prev => ({ ...prev, discountStartsAt: e.target.value }))}
                        />
                      </div>
                    </div>
                  </div>

                  {/* Live calculation card */}
                  <div style={{
                    padding: '0.875rem 1rem',
                    background: currentPct > 0 ? '#f0fdf4' : 'var(--slate-50)',
                    border: currentPct > 0 ? '1.5px solid #86efac' : '1px solid var(--border)',
                    borderRadius: '8px',
                    marginBottom: '1.25rem'
                  }}>
                    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '0.35rem' }}>
                      <span style={{ fontSize: '0.85rem', color: 'var(--slate-600)' }}>السعر بعد الخصم للمشتركين:</span>
                      <strong style={{ fontSize: '1.25rem', color: currentPct > 0 ? '#15803d' : 'var(--slate-900)' }}>
                        {finalPrice.toLocaleString()} ج.م / شهر
                      </strong>
                    </div>
                    {currentPct > 0 ? (
                      <div>
                        <div style={{ fontSize: '0.78rem', color: '#16a34a', fontWeight: 700, display: 'flex', justifyContent: 'space-between', borderTop: '1px solid #bbf7d0', paddingTop: '0.35rem', marginTop: '0.35rem' }}>
                          <span>توفير المشترك:</span>
                          <span>{savings.toLocaleString()} ج.م ({currentPct}% خصم)</span>
                        </div>
                        {discountModal.discountEndsAt && (
                          <div style={{ fontSize: '0.72rem', color: '#15803d', marginTop: '0.25rem' }}>
                            ⏳ ساري حتى: {new Date(discountModal.discountEndsAt).toLocaleString('ar-EG')} ({timeRemaining})
                          </div>
                        )}
                        {!discountModal.discountEndsAt && (
                          <div style={{ fontSize: '0.72rem', color: 'var(--slate-500)', marginTop: '0.25rem' }}>
                            ♾️ هذا الخصم دائم ومستمر حتى تقوم بإلغائه يدوياً.
                          </div>
                        )}
                      </div>
                    ) : (
                      <div style={{ fontSize: '0.75rem', color: 'var(--slate-500)' }}>
                        لا يوجد خصم مفعّل. سيتم احتساب السعر الأصلي بالكامل ({basePrice.toLocaleString()} ج.م).
                      </div>
                    )}
                  </div>

                  {/* Modal Actions */}
                  <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                    {currentPct > 0 ? (
                      <button
                        type="button"
                        onClick={() => setDiscountModal(prev => ({ ...prev, discountPct: 0, discountLabel: '', discountStartsAt: '', discountEndsAt: '' }))}
                        style={{ background: 'none', border: 'none', color: '#dc2626', fontSize: '0.8125rem', cursor: 'pointer', fontWeight: 700, padding: 0 }}
                      >
                        ✕ مسح الخصم وإلغاء المدة
                      </button>
                    ) : <span />}

                    <div style={{ display: 'flex', gap: '0.75rem' }}>
                      <button
                        type="button"
                        onClick={() => setDiscountModal({ open: false, plan: null, discountPct: 0, discountLabel: '', discountStartsAt: '', discountEndsAt: '' })}
                        className="btn btn-outline"
                      >
                        إلغاء
                      </button>
                      <button type="submit" className="btn btn-primary" style={{ fontWeight: 800 }}>
                        {currentPct > 0 ? `حفظ وتفعيل خصم ${currentPct}%` : 'حفظ التعديلات'}
                      </button>
                    </div>
                  </div>
                </form>
              </div>
            </div>
          );
        })()}

        <ConfirmModal
          isOpen={confirmModal.open}
          title={confirmModal.title}
          message={confirmModal.message}
          confirmText={confirmModal.confirmText}
          isDanger={confirmModal.danger}
          onConfirm={confirmModal.action}
          onClose={() => setConfirmModal((prev) => ({ ...prev, open: false }))}
        />
      </div>
    </div>
  );
}
