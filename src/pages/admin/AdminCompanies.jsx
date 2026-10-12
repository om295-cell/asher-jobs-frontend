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
    customPriceEgp: ''
  });
  const [createSubmitting, setCreateSubmitting] = useState(false);

  // Status Change Modal
  const [statusModal, setStatusModal] = useState({ open: false, companyId: null, companyName: '', status: 'active', reason: '' });

  // Plan Edit Modal
  const [planModal, setPlanModal] = useState({ open: false, companyId: null, companyName: '', plan: 'Basic', priceEgp: 500 });

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
        companyName: createFormData.companyName,
        contactPerson: createFormData.contactPerson,
        email: createFormData.email,
        phone: createFormData.phone,
        governorate: createFormData.governorate,
        area: createFormData.area,
        subscriptionPlan: createFormData.subscriptionPlan,
        customPriceEgp: createFormData.customPriceEgp ? Number(createFormData.customPriceEgp) : undefined
      };

      const res = await adminApi.createEmployerAccount(payload);
      if (res.data?.success) {
        showToast('تم إنشاء الحساب بنجاح بكلمة مرور مؤقتة (Temp@1234)!', 'success');
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
          customPriceEgp: ''
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

  // Reset Password Handler (Temp@1234)
  const handleResetPassword = (comp) => {
    setConfirmModal({
      open: true,
      title: 'إعادة تعيين كلمة المرور',
      message: `هل أنت متأكد من إعادة تعيين كلمة المرور لحساب "${comp.companyName}" إلى كلمة المرور المؤقتة (Temp@1234)؟ سيُلزم المستخدم بتغييرها فور تسجيل الدخول.`,
      confirmText: 'تأكيد إعادة التعيين إلى Temp@1234',
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
        subscriptionPlan: planModal.plan,
        subscriptionPriceEgp: Number(planModal.priceEgp)
      });
      showToast('تم تحديث خطة الاشتراك وسعرها بنجاح', 'success');
      setPlanModal({ open: false, companyId: null, companyName: '', plan: 'Basic', priceEgp: 500 });
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
        displayNameAr: editingPlan.displayNameAr
      });
      showToast('تم تحديث بيانات خطة الاشتراك في المنصة بنجاح!', 'success');
      setEditingPlan(null);
      fetchPlatformPlans();
    } catch (err) {
      showToast(err.response?.data?.message || 'فشل حفظ الخطة', 'error');
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
                                title="إعادة تعيين كلمة المرور إلى Temp@1234"
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
                                    priceEgp: comp.subscriptionPriceEgp || 500
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
              <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(280px, 1fr))', gap: '1.5rem' }}>
                {platformPlans.map((plan) => (
                  <div
                    key={plan._id}
                    className="card"
                    style={{ padding: '1.5rem', display: 'flex', flexDirection: 'column', justifyContent: 'space-between' }}
                  >
                    <div>
                      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '0.75rem' }}>
                        <span className="badge badge-pending" style={{ fontSize: '0.8125rem' }}>
                          {plan.planName}
                        </span>
                        <div style={{ fontSize: '1.375rem', fontWeight: 900 }}>
                          {plan.priceEgp || plan.priceMonthlyEgp} ج.م
                        </div>
                      </div>

                      <h4 style={{ fontSize: '1.0625rem', fontWeight: 800, color: 'var(--slate-900)', marginBottom: '1rem' }}>
                        {plan.displayNameAr || plan.displayName}
                      </h4>

                      <div style={{ display: 'flex', flexDirection: 'column', gap: '0.5rem', fontSize: '0.8125rem', color: 'var(--slate-700)', marginBottom: '1.5rem' }}>
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

                    <button
                      type="button"
                      onClick={() => setEditingPlan({ ...plan })}
                      className="btn btn-outline"
                      style={{ width: '100%', fontSize: '0.875rem' }}
                    >
                      تعديل السعر والحصص
                    </button>
                  </div>
                ))}
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

                {/* Subscription Plan & Price */}
                <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1rem', borderTop: '1px solid var(--border)', paddingTop: '1rem' }}>
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
                    <label className="form-label">سعر مخصص (EGP) (اختياري)</label>
                    <input
                      type="number"
                      className="form-control"
                      value={createFormData.customPriceEgp}
                      onChange={(e) => setCreateFormData({ ...createFormData, customPriceEgp: e.target.value })}
                      placeholder="السعر الافتراضي للخطة..."
                    />
                  </div>
                </div>

                <div className="card" style={{ padding: '0.875rem', marginBottom: '1.25rem', fontSize: '0.8125rem', lineHeight: 1.5, background: 'var(--slate-50)' }}>
                  <div style={{ fontWeight: 800, marginBottom: '0.2rem' }}>🔒 الأمان وكلمات المرور:</div>
                  <div>
                    سيتم إنشاء الحساب بكلمة مرور مؤقتة موحدة: <code style={{ fontWeight: 800, background: '#fff', border: '1px solid #000', padding: '0.1rem 0.35rem', borderRadius: 4 }}>Temp@1234</code>.
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
          <div className="modal-overlay" onClick={() => setPlanModal({ open: false, companyId: null, companyName: '', plan: 'Basic', priceEgp: 500 })}>
            <div className="modal-content" onClick={(e) => e.stopPropagation()} style={{ maxWidth: 460, padding: '1.75rem' }}>
              <h3 style={{ fontSize: '1.125rem', fontWeight: 800, color: 'var(--slate-900)', marginBottom: '1rem' }}>
                تعديل خطة اشتراك "{planModal.companyName}"
              </h3>
              <form onSubmit={handlePlanSubmit}>
                <div className="form-group">
                  <label className="form-label">الخطة</label>
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
                    <option value="Basic">الأساسية (Basic - 500 ج.م)</option>
                    <option value="Gold">الذهبية (Gold - 1000 ج.م)</option>
                    <option value="Platinum">البلاتينية (Platinum - 2000 ج.م)</option>
                  </select>
                </div>

                <div className="form-group">
                  <label className="form-label">السعر الشهري (EGP)</label>
                  <input
                    type="number"
                    className="form-control"
                    value={planModal.priceEgp}
                    onChange={(e) => setPlanModal({ ...planModal, priceEgp: Number(e.target.value) })}
                    required
                  />
                </div>

                <div style={{ display: 'flex', justifyContent: 'flex-end', gap: '0.75rem' }}>
                  <button
                    type="button"
                    onClick={() => setPlanModal({ open: false, companyId: null, companyName: '', plan: 'Basic', priceEgp: 500 })}
                    className="btn btn-outline"
                  >
                    إلغاء
                  </button>
                  <button type="submit" className="btn btn-primary">
                    حفظ الاشتراك
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
