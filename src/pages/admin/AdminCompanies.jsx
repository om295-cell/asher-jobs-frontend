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
  FileSpreadsheet
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
        {/* Top Header */}
        <div className="flex flex-wrap items-center justify-between gap-4 mb-6">
          <div>
            <h1 className="text-2xl md:text-3xl font-extrabold text-slate-900 flex items-center gap-2.5">
              <Building2 className="w-8 h-8 text-primary-600" />
              <span>إدارة وتوثيق حسابات الشركات وأصحاب العمل</span>
            </h1>
            <p className="text-sm text-slate-500 mt-1">
              التحكم الشامل بحسابات الشركات ومسؤولي الـ HR • التوثيق اليدوي وعبر الشركات • الاشتراكات والحصص اليومية بتوقيت القاهرة
            </p>
          </div>

          <button
            onClick={() => setCreateModalOpen(true)}
            className="px-5 py-2.5 rounded-xl bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-700 hover:to-indigo-700 text-white font-bold text-sm shadow-md hover:shadow-lg transition-all flex items-center gap-2"
          >
            <Plus className="w-4 h-4" />
            <span>إنشاء حساب موثق جديد</span>
          </button>
        </div>

        {/* Tab Navigation */}
        <div className="flex border-b border-slate-200 mb-6 gap-2 overflow-x-auto pb-1">
          <button
            onClick={() => setActiveTab('accounts')}
            className={`px-5 py-2.5 font-bold text-sm rounded-t-xl transition-all border-b-2 flex items-center gap-2 ${
              activeTab === 'accounts'
                ? 'border-blue-600 text-blue-600 bg-white'
                : 'border-transparent text-slate-500 hover:text-slate-800'
            }`}
          >
            <Building2 className="w-4 h-4" />
            <span>قائمة الحسابات ({total})</span>
          </button>

          <button
            onClick={() => setActiveTab('rankings')}
            className={`px-5 py-2.5 font-bold text-sm rounded-t-xl transition-all border-b-2 flex items-center gap-2 ${
              activeTab === 'rankings'
                ? 'border-blue-600 text-blue-600 bg-white'
                : 'border-transparent text-slate-500 hover:text-slate-800'
            }`}
          >
            <TrendingUp className="w-4 h-4" />
            <span>ترتيب نشاط الحسابات (Rankings)</span>
          </button>

          <button
            onClick={() => setActiveTab('bulk_analytics')}
            className={`px-5 py-2.5 font-bold text-sm rounded-t-xl transition-all border-b-2 flex items-center gap-2 ${
              activeTab === 'bulk_analytics'
                ? 'border-blue-600 text-blue-600 bg-white'
                : 'border-transparent text-slate-500 hover:text-slate-800'
            }`}
          >
            <BarChart3 className="w-4 h-4" />
            <span>الإحصائيات الشاملة (Bulk Analytics)</span>
          </button>

          <button
            onClick={() => setActiveTab('plans')}
            className={`px-5 py-2.5 font-bold text-sm rounded-t-xl transition-all border-b-2 flex items-center gap-2 ${
              activeTab === 'plans'
                ? 'border-blue-600 text-blue-600 bg-white'
                : 'border-transparent text-slate-500 hover:text-slate-800'
            }`}
          >
            <CreditCard className="w-4 h-4" />
            <span>خطط وأسعار الاشتراكات (EGP)</span>
          </button>
        </div>

        {/* TAB 1: ACCOUNTS LIST */}
        {activeTab === 'accounts' && (
          <>
            {/* Filter Toolbar */}
            <div className="bg-white rounded-2xl border border-slate-200 p-4 mb-6 shadow-sm">
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-5 gap-3">
                <div>
                  <label className="block text-xs font-semibold text-slate-600 mb-1">بحث</label>
                  <input
                    type="text"
                    value={keyword}
                    onChange={(e) => setKeyword(e.target.value)}
                    placeholder="الاسم، الهاتف، البريد..."
                    className="w-full px-3 py-2 text-xs rounded-lg border border-slate-200 bg-slate-50 focus:outline-none focus:ring-2 focus:ring-blue-500"
                  />
                </div>

                <div>
                  <label className="block text-xs font-semibold text-slate-600 mb-1">نوع الحساب</label>
                  <select
                    value={accountTypeFilter}
                    onChange={(e) => setAccountTypeFilter(e.target.value)}
                    className="w-full px-3 py-2 text-xs rounded-lg border border-slate-200 bg-slate-50 focus:outline-none focus:ring-2 focus:ring-blue-500"
                  >
                    <option value="">جميع الأنواع</option>
                    <option value="company">منشأة / شركة (Company)</option>
                    <option value="individual_hr">مسؤول توظيف فردي (Individual HR)</option>
                  </select>
                </div>

                <div>
                  <label className="block text-xs font-semibold text-slate-600 mb-1">طريقة التوثيق</label>
                  <select
                    value={verificationMethodFilter}
                    onChange={(e) => setVerificationMethodFilter(e.target.value)}
                    className="w-full px-3 py-2 text-xs rounded-lg border border-slate-200 bg-slate-50 focus:outline-none focus:ring-2 focus:ring-blue-500"
                  >
                    <option value="">جميع الطرق</option>
                    <option value="manual">يدوي من الإدارة (Manual)</option>
                    <option value="verified_by_company">موثق بواسطة شركة (Verified by Company)</option>
                  </select>
                </div>

                <div>
                  <label className="block text-xs font-semibold text-slate-600 mb-1">خطة الاشتراك</label>
                  <select
                    value={planFilter}
                    onChange={(e) => setPlanFilter(e.target.value)}
                    className="w-full px-3 py-2 text-xs rounded-lg border border-slate-200 bg-slate-50 focus:outline-none focus:ring-2 focus:ring-blue-500"
                  >
                    <option value="">جميع الباقات</option>
                    <option value="Basic">الأساسية (Basic)</option>
                    <option value="Gold">الذهبية (Gold)</option>
                    <option value="Platinum">البلاتينية (Platinum)</option>
                  </select>
                </div>

                <div>
                  <label className="block text-xs font-semibold text-slate-600 mb-1">حالة الحساب</label>
                  <select
                    value={statusFilter}
                    onChange={(e) => setStatusFilter(e.target.value)}
                    className="w-full px-3 py-2 text-xs rounded-lg border border-slate-200 bg-slate-50 focus:outline-none focus:ring-2 focus:ring-blue-500"
                  >
                    <option value="">جميع الحالات</option>
                    <option value="active">نشط (Active)</option>
                    <option value="on_hold">معلق مؤقتاً (On Hold)</option>
                    <option value="suspended">موقوف (Suspended)</option>
                    <option value="banned">محظور (Banned)</option>
                  </select>
                </div>
              </div>
            </div>

            {/* Accounts Table */}
            <div className="bg-white rounded-2xl border border-slate-200 shadow-sm overflow-hidden mb-6">
              {loading ? (
                <div className="p-16 flex justify-center">
                  <LoadingSpinner />
                </div>
              ) : accounts.length === 0 ? (
                <div className="p-12 text-center text-slate-500">
                  لا توجد حسابات مطابقة لمعايير البحث.
                </div>
              ) : (
                <div className="overflow-x-auto">
                  <table className="w-full text-right text-xs">
                    <thead className="bg-slate-50 text-slate-600 font-bold border-b border-slate-200">
                      <tr>
                        <th className="py-3 px-4">المنشأة / صاحب العمل</th>
                        <th className="py-3 px-3">التصنيف والتوثيق</th>
                        <th className="py-3 px-3">الباقة والسعر</th>
                        <th className="py-3 px-3">الحالة</th>
                        <th className="py-3 px-3">نشاط الحساب</th>
                        <th className="py-3 px-4 text-center">الإجراءات</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-slate-100">
                      {accounts.map((comp) => {
                        const isHr = comp.accountType === 'individual_hr';
                        const isVerifiedByComp = comp.verificationMethod === 'verified_by_company';

                        let categoryLabel = 'Type A: شركة موثقة يدوياً';
                        let categoryBadgeClass = 'bg-blue-100 text-blue-800';
                        if (isHr && !isVerifiedByComp) {
                          categoryLabel = 'Type B: مسؤول HR موثق يدوياً';
                          categoryBadgeClass = 'bg-purple-100 text-purple-800';
                        } else if (!isHr && isVerifiedByComp) {
                          categoryLabel = 'Type C1: شركة موثقة عبر شركة';
                          categoryBadgeClass = 'bg-teal-100 text-teal-800';
                        } else if (isHr && isVerifiedByComp) {
                          categoryLabel = 'Type C2: HR موثق عبر شركة';
                          categoryBadgeClass = 'bg-amber-100 text-amber-800';
                        }

                        let statusBadge = (
                          <span className="px-2 py-0.5 rounded-full font-bold text-[11px] bg-emerald-100 text-emerald-800">
                            نشط
                          </span>
                        );
                        if (comp.accountStatus === 'on_hold') {
                          statusBadge = <span className="px-2 py-0.5 rounded-full font-bold text-[11px] bg-amber-100 text-amber-800">معلق</span>;
                        } else if (comp.accountStatus === 'suspended') {
                          statusBadge = <span className="px-2 py-0.5 rounded-full font-bold text-[11px] bg-orange-100 text-orange-800">موقوف</span>;
                        } else if (comp.accountStatus === 'banned') {
                          statusBadge = <span className="px-2 py-0.5 rounded-full font-bold text-[11px] bg-red-100 text-red-800">محظور</span>;
                        }

                        return (
                          <tr key={comp._id} className="hover:bg-slate-50/70 transition-colors">
                            {/* Account Details */}
                            <td className="py-3.5 px-4">
                              <div className="flex items-center gap-2.5">
                                <div className="w-9 h-9 rounded-xl bg-slate-100 flex items-center justify-center font-bold text-slate-700 text-sm">
                                  {comp.companyName?.charAt(0) || 'ش'}
                                </div>
                                <div>
                                  <div className="font-bold text-slate-900 text-sm">{comp.companyName}</div>
                                  <div className="text-[11px] text-slate-500 flex items-center gap-2 mt-0.5">
                                    <span>المسؤول: {comp.contactPerson}</span>
                                    <span>•</span>
                                    <span dir="ltr">{comp.phone}</span>
                                  </div>
                                  {comp.mustChangePassword && (
                                    <span className="inline-block mt-1 text-[10px] bg-amber-50 text-amber-700 px-1.5 py-0.5 rounded border border-amber-200">
                                      ⚠️ ملزم بتغيير كلمة المرور
                                    </span>
                                  )}
                                </div>
                              </div>
                            </td>

                            {/* Classification */}
                            <td className="py-3 px-3">
                              <div className="space-y-1">
                                <span className={`inline-block px-2 py-0.5 rounded font-bold text-[10px] ${categoryBadgeClass}`}>
                                  {categoryLabel}
                                </span>
                                {isVerifiedByComp && comp.verifiedByCompanyId && (
                                  <div className="text-[10px] text-slate-500 bg-slate-100 p-1 rounded max-w-[170px] truncate" title={`وثقت بواسطة: ${comp.verifiedByCompanyId.companyName}`}>
                                    🏢 الموثق: {comp.verifiedByCompanyId.companyName}
                                  </div>
                                )}
                              </div>
                            </td>

                            {/* Subscription Plan & Price */}
                            <td className="py-3 px-3">
                              <div className="font-bold text-slate-800">
                                {comp.subscriptionPlan === 'Platinum' ? 'بلاتينية (Platinum)' : comp.subscriptionPlan === 'Gold' ? 'ذهبية (Gold)' : 'أساسية (Basic)'}
                              </div>
                              <div className="text-[11px] text-emerald-700 font-semibold">
                                {comp.subscriptionPriceEgp || comp.monthlyPriceEgp || 0} ج.م
                              </div>
                            </td>

                            {/* Status */}
                            <td className="py-3 px-3">
                              {statusBadge}
                            </td>

                            {/* Activity Metrics */}
                            <td className="py-3 px-3">
                              <div className="text-[11px] space-y-0.5 text-slate-600">
                                <div>بحث: <span className="font-bold text-slate-800">{comp.metrics?.searches || 0}</span></div>
                                <div>تنزيل: <span className="font-bold text-slate-800">{comp.metrics?.downloads || 0}</span></div>
                                <div>سكور: <span className="font-bold text-indigo-600">{comp.metrics?.activityScore || 0}</span></div>
                              </div>
                            </td>

                            {/* Actions */}
                            <td className="py-3 px-4">
                              <div className="flex items-center justify-center gap-1.5 flex-wrap">
                                {/* Reset Password */}
                                <button
                                  onClick={() => handleResetPassword(comp)}
                                  className="p-1.5 bg-amber-50 hover:bg-amber-100 text-amber-700 rounded-lg transition-colors"
                                  title="إعادة تعيين كلمة المرور إلى Temp@1234"
                                >
                                  <KeyRound className="w-4 h-4" />
                                </button>

                                {/* Change Status */}
                                <button
                                  onClick={() => setStatusModal({ open: true, companyId: comp._id, companyName: comp.companyName, status: comp.accountStatus || 'active', reason: '' })}
                                  className="p-1.5 bg-slate-100 hover:bg-slate-200 text-slate-700 rounded-lg transition-colors"
                                  title="تغيير حالة الحساب (Active / Hold / Suspend)"
                                >
                                  <Shield className="w-4 h-4" />
                                </button>

                                {/* Edit Plan */}
                                <button
                                  onClick={() => setPlanModal({ open: true, companyId: comp._id, companyName: comp.companyName, plan: comp.subscriptionPlan || 'Basic', priceEgp: comp.subscriptionPriceEgp || 500 })}
                                  className="p-1.5 bg-blue-50 hover:bg-blue-100 text-blue-700 rounded-lg transition-colors"
                                  title="تعديل خطة الاشتراك والسعر"
                                >
                                  <CreditCard className="w-4 h-4" />
                                </button>

                                {/* View Analytics */}
                                <button
                                  onClick={() => handleViewAnalytics(comp)}
                                  className="p-1.5 bg-indigo-50 hover:bg-indigo-100 text-indigo-700 rounded-lg transition-colors"
                                  title="عرض تحليلات الحساب وسجل الاستخدام"
                                >
                                  <BarChart3 className="w-4 h-4" />
                                </button>

                                {/* View Company Detail */}
                                <Link
                                  to={`/admin/companies/${comp._id}`}
                                  className="p-1.5 bg-slate-100 hover:bg-slate-200 text-slate-700 rounded-lg transition-colors"
                                  title="الملف الكامل"
                                >
                                  <Eye className="w-4 h-4" />
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
                <div className="p-4 border-t border-slate-100">
                  <Pagination currentPage={page} totalPages={totalPages} onPageChange={(p) => fetchAccounts(p)} />
                </div>
              )}
            </div>
          </>
        )}

        {/* TAB 2: ACTIVITY RANKINGS */}
        {activeTab === 'rankings' && (
          <div className="bg-white rounded-2xl border border-slate-200 p-6 shadow-sm">
            <div className="flex flex-wrap items-center justify-between gap-4 mb-6 pb-4 border-b border-slate-100">
              <div>
                <h3 className="text-lg font-bold text-slate-900 flex items-center gap-2">
                  <TrendingUp className="w-5 h-5 text-indigo-600" />
                  <span>ترتيب نشاط وتفاعل أصحاب العمل</span>
                </h3>
                <p className="text-xs text-slate-500 mt-0.5">
                  معادلة التفاعل: (البحث × 1) + (المشاهدات × 2) + (التحميل × 5) + (الاتصالات × 3)
                </p>
              </div>

              <div className="flex items-center gap-2">
                <span className="text-xs font-semibold text-slate-600">فرز حسب:</span>
                <select
                  value={rankingsMetric}
                  onChange={(e) => setRankingsMetric(e.target.value)}
                  className="px-3 py-1.5 text-xs rounded-lg border border-slate-200 bg-slate-50 font-bold focus:outline-none focus:ring-2 focus:ring-blue-500"
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
              <div className="py-16 flex justify-center">
                <LoadingSpinner />
              </div>
            ) : rankings.length === 0 ? (
              <div className="py-12 text-center text-slate-500">لا يوجد نشاط مسجل حتى الآن.</div>
            ) : (
              <div className="overflow-x-auto">
                <table className="w-full text-right text-xs">
                  <thead className="bg-slate-50 text-slate-600 font-bold border-b border-slate-200">
                    <tr>
                      <th className="py-3 px-3 text-center">الترتيب</th>
                      <th className="py-3 px-4">الشركة / المسؤول</th>
                      <th className="py-3 px-3">الباقة</th>
                      <th className="py-3 px-3">عمليات البحث</th>
                      <th className="py-3 px-3">المشاهدات</th>
                      <th className="py-3 px-3">التحميلات</th>
                      <th className="py-3 px-3">الاتصالات</th>
                      <th className="py-3 px-4 text-center">السكور الإجمالي</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-slate-100">
                    {rankings.map((r, idx) => (
                      <tr key={r.id} className="hover:bg-slate-50/70 transition-colors">
                        <td className="py-3 px-3 text-center">
                          <span
                            className={`w-6 h-6 rounded-full inline-flex items-center justify-center font-bold text-xs ${
                              idx === 0
                                ? 'bg-amber-100 text-amber-800'
                                : idx === 1
                                ? 'bg-slate-200 text-slate-800'
                                : idx === 2
                                ? 'bg-amber-50 text-amber-700'
                                : 'text-slate-500'
                            }`}
                          >
                            #{idx + 1}
                          </span>
                        </td>
                        <td className="py-3 px-4 font-bold text-slate-900">{r.companyName}</td>
                        <td className="py-3 px-3">
                          <span className="px-2 py-0.5 rounded font-bold text-[10px] bg-slate-100 text-slate-700">
                            {r.subscriptionPlan}
                          </span>
                        </td>
                        <td className="py-3 px-3 font-semibold text-slate-700">{r.searches}</td>
                        <td className="py-3 px-3 font-semibold text-slate-700">{r.views}</td>
                        <td className="py-3 px-3 font-semibold text-slate-700">{r.downloads}</td>
                        <td className="py-3 px-3 font-semibold text-slate-700">{r.contacts}</td>
                        <td className="py-3 px-4 text-center">
                          <span className="px-2.5 py-1 rounded-lg font-black text-xs bg-indigo-50 text-indigo-700 border border-indigo-200">
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
              <div className="py-16 flex justify-center">
                <LoadingSpinner />
              </div>
            ) : bulkAnalytics ? (
              <div className="space-y-6">
                {/* Metric Summary Cards */}
                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-5 gap-4">
                  <div className="bg-white rounded-2xl border border-slate-200 p-5 shadow-sm">
                    <div className="text-xs text-slate-500 font-semibold mb-1">إجمالي عمليات البحث</div>
                    <div className="text-2xl font-black text-blue-600">
                      {bulkAnalytics.totals?.totalSearches || 0}
                    </div>
                  </div>

                  <div className="bg-white rounded-2xl border border-slate-200 p-5 shadow-sm">
                    <div className="text-xs text-slate-500 font-semibold mb-1">إجمالي ملفات التحميل</div>
                    <div className="text-2xl font-black text-emerald-600">
                      {bulkAnalytics.totals?.totalDownloads || 0}
                    </div>
                  </div>

                  <div className="bg-white rounded-2xl border border-slate-200 p-5 shadow-sm">
                    <div className="text-xs text-slate-500 font-semibold mb-1">مشاهدات المرشحين</div>
                    <div className="text-2xl font-black text-indigo-600">
                      {bulkAnalytics.totals?.totalViews || 0}
                    </div>
                  </div>

                  <div className="bg-white rounded-2xl border border-slate-200 p-5 shadow-sm">
                    <div className="text-xs text-slate-500 font-semibold mb-1">إجمالي الاتصالات</div>
                    <div className="text-2xl font-black text-amber-600">
                      {bulkAnalytics.totals?.totalContacts || 0}
                    </div>
                  </div>

                  <div className="bg-white rounded-2xl border border-slate-200 p-5 shadow-sm">
                    <div className="text-xs text-slate-500 font-semibold mb-1">إجمالي الاشتراكات (ج.م)</div>
                    <div className="text-2xl font-black text-teal-600">
                      {(bulkAnalytics.totals?.totalRevenueEgp || 0).toLocaleString()} ج.م
                    </div>
                  </div>
                </div>

                {/* Distributions */}
                <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                  {/* By Plan */}
                  <div className="bg-white rounded-2xl border border-slate-200 p-5 shadow-sm">
                    <h4 className="font-bold text-sm text-slate-900 mb-4 pb-2 border-b border-slate-100">
                      توزيع الحسابات حسب باقة الاشتراك
                    </h4>
                    <div className="space-y-3 text-xs">
                      {Object.entries(bulkAnalytics.planCounts || {}).map(([plan, count]) => (
                        <div key={plan} className="flex justify-between items-center">
                          <span className="font-semibold text-slate-700">{plan}</span>
                          <span className="px-2.5 py-1 bg-slate-100 rounded-full font-bold">{count} حساب</span>
                        </div>
                      ))}
                    </div>
                  </div>

                  {/* By Type */}
                  <div className="bg-white rounded-2xl border border-slate-200 p-5 shadow-sm">
                    <h4 className="font-bold text-sm text-slate-900 mb-4 pb-2 border-b border-slate-100">
                      توزيع الحسابات حسب نوع الكيان
                    </h4>
                    <div className="space-y-3 text-xs">
                      {Object.entries(bulkAnalytics.typeCounts || {}).map(([type, count]) => (
                        <div key={type} className="flex justify-between items-center">
                          <span className="font-semibold text-slate-700">
                            {type === 'individual_hr' ? 'مسؤول توظيف فردي' : 'شركة / مصنع'}
                          </span>
                          <span className="px-2.5 py-1 bg-slate-100 rounded-full font-bold">{count} حساب</span>
                        </div>
                      ))}
                    </div>
                  </div>

                  {/* By Verification Method */}
                  <div className="bg-white rounded-2xl border border-slate-200 p-5 shadow-sm">
                    <h4 className="font-bold text-sm text-slate-900 mb-4 pb-2 border-b border-slate-100">
                      توزيع الحسابات حسب طريقة التوثيق
                    </h4>
                    <div className="space-y-3 text-xs">
                      {Object.entries(bulkAnalytics.methodCounts || {}).map(([method, count]) => (
                        <div key={method} className="flex justify-between items-center">
                          <span className="font-semibold text-slate-700">
                            {method === 'manual' ? 'يدوي من الإدارة' : 'موثق عبر شركة معتمدة'}
                          </span>
                          <span className="px-2.5 py-1 bg-slate-100 rounded-full font-bold">{count} حساب</span>
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
            <div className="flex items-center justify-between mb-6">
              <div>
                <h3 className="text-lg font-bold text-slate-900">
                  إدارة خطط الاشتراكات والحصص اليومية والأسعار (بالجنيه المصري EGP)
                </h3>
                <p className="text-xs text-slate-500 mt-0.5">
                  تحديد الحصص اليومية بتوقيت القاهرة وأسعار الباقات الثلاث (Basic, Gold, Platinum).
                </p>
              </div>
            </div>

            {plansLoading ? (
              <div className="py-16 flex justify-center">
                <LoadingSpinner />
              </div>
            ) : (
              <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                {platformPlans.map((plan) => (
                  <div
                    key={plan._id}
                    className="bg-white rounded-2xl border border-slate-200 shadow-sm p-6 flex flex-col justify-between"
                  >
                    <div>
                      <div className="flex items-center justify-between mb-3">
                        <span className="text-xs font-bold px-2.5 py-1 rounded-full bg-blue-100 text-blue-800">
                          {plan.planName}
                        </span>
                        <div className="text-xl font-black text-emerald-700">
                          {plan.priceEgp || plan.priceMonthlyEgp} ج.م
                        </div>
                      </div>

                      <h4 className="text-base font-bold text-slate-900 mb-4">
                        {plan.displayNameAr || plan.displayName}
                      </h4>

                      <div className="space-y-2.5 text-xs text-slate-600 mb-6">
                        <div className="flex justify-between pb-1.5 border-b border-slate-100">
                          <span>عمليات البحث اليومية:</span>
                          <span className="font-bold text-slate-900">{plan.dailySearchLimit} بحث/يوم</span>
                        </div>
                        <div className="flex justify-between pb-1.5 border-b border-slate-100">
                          <span>تنزيل لكل مسمى وظيفي:</span>
                          <span className="font-bold text-slate-900">{plan.dailyDownloadLimitPerTitle} مرات/يوم</span>
                        </div>
                        <div className="flex justify-between pb-1.5 border-b border-slate-100">
                          <span>المرشحين لكل مسمى:</span>
                          <span className="font-bold text-slate-900">بحد أقصى {plan.maxCandidatesPerTitle}</span>
                        </div>
                        <div className="flex justify-between pb-1.5 border-b border-slate-100">
                          <span>سلة المرشحين (Cart):</span>
                          <span className={`font-bold ${plan.cartEnabled ? 'text-emerald-600' : 'text-slate-400'}`}>
                            {plan.cartEnabled ? '✓ مفعلة' : '✕ غير مفعلة'}
                          </span>
                        </div>
                        <div className="flex justify-between pb-1.5 border-b border-slate-100">
                          <span>تصفح قاعدة البيانات (VIP):</span>
                          <span className={`font-bold ${plan.platinumBrowseEnabled ? 'text-indigo-600' : 'text-slate-400'}`}>
                            {plan.platinumBrowseEnabled ? '✓ مفعلة (Platinum)' : '✕ غير مفعلة'}
                          </span>
                        </div>
                      </div>
                    </div>

                    <button
                      onClick={() => setEditingPlan({ ...plan })}
                      className="w-full py-2.5 px-4 rounded-xl bg-slate-100 hover:bg-slate-200 text-slate-800 text-xs font-bold transition-colors"
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
          <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-sm">
            <div className="w-full max-w-xl bg-white rounded-3xl shadow-2xl border border-slate-200 p-6 md:p-8 overflow-y-auto max-h-[90vh]">
              <div className="flex items-center justify-between pb-4 mb-4 border-b border-slate-100">
                <h3 className="text-lg font-bold text-slate-900 flex items-center gap-2">
                  <UserCheck className="w-5 h-5 text-blue-600" />
                  <span>إنشاء حساب موثق جديد (Super Admin Only)</span>
                </h3>
                <button onClick={() => setCreateModalOpen(false)} className="text-slate-400 hover:text-slate-600">✕</button>
              </div>

              <form onSubmit={handleCreateAccount} className="space-y-4">
                {/* Category Selection */}
                <div>
                  <label className="block text-xs font-bold text-slate-700 mb-1">
                    تصنيف الحساب وطريقة التوثيق *
                  </label>
                  <select
                    value={createFormData.category}
                    onChange={(e) => setCreateFormData({ ...createFormData, category: e.target.value })}
                    className="w-full px-3 py-2.5 rounded-xl border border-slate-300 text-xs font-semibold bg-slate-50 focus:ring-2 focus:ring-blue-500"
                  >
                    <option value="A">Type A: شركة موثقة يدوياً من الإدارة</option>
                    <option value="B">Type B: مسؤول توظيف فردي موثق يدوياً (Individual HR)</option>
                    <option value="C1">Type C1: شركة موثقة بواسطة شركة أخرى معتمدة</option>
                    <option value="C2">Type C2: مسؤول HR موثق بواسطة شركة أخرى معتمدة</option>
                  </select>
                </div>

                {/* If C1 or C2, show verifier company dropdown */}
                {(createFormData.category === 'C1' || createFormData.category === 'C2') && (
                  <div className="p-3 bg-amber-50 rounded-xl border border-amber-200">
                    <label className="block text-xs font-bold text-amber-900 mb-1">
                      الشركة المعتمدة الموثقة للطلب (Eligible Verifiers Only) *
                    </label>
                    <p className="text-[11px] text-amber-700 mb-2">
                      ملاحظة: تظهر فقط الشركات الموثقة يدوياً من الإدارة وتظل علاقة التوثيق ظاهرة حصرياً للإدارة.
                    </p>
                    <select
                      value={createFormData.verifiedByCompanyId}
                      onChange={(e) => setCreateFormData({ ...createFormData, verifiedByCompanyId: e.target.value })}
                      className="w-full px-3 py-2 rounded-lg border border-amber-300 text-xs bg-white focus:ring-2 focus:ring-amber-500"
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
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                  <div>
                    <label className="block text-xs font-bold text-slate-700 mb-1">
                      اسم المنشأة / الاسم التجاري *
                    </label>
                    <input
                      type="text"
                      required
                      value={createFormData.companyName}
                      onChange={(e) => setCreateFormData({ ...createFormData, companyName: e.target.value })}
                      placeholder="مثال: مصنع النور للصناعات"
                      className="w-full px-3 py-2 rounded-lg border border-slate-300 text-xs"
                    />
                  </div>

                  <div>
                    <label className="block text-xs font-bold text-slate-700 mb-1">
                      اسم المسؤول / ممثل التوظيف *
                    </label>
                    <input
                      type="text"
                      required
                      value={createFormData.contactPerson}
                      onChange={(e) => setCreateFormData({ ...createFormData, contactPerson: e.target.value })}
                      placeholder="مثال: أ. أحمد علي"
                      className="w-full px-3 py-2 rounded-lg border border-slate-300 text-xs"
                    />
                  </div>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                  <div>
                    <label className="block text-xs font-bold text-slate-700 mb-1">
                      البريد الإلكتروني للولوج *
                    </label>
                    <input
                      type="email"
                      required
                      value={createFormData.email}
                      onChange={(e) => setCreateFormData({ ...createFormData, email: e.target.value })}
                      placeholder="hr@example.com"
                      className="w-full px-3 py-2 rounded-lg border border-slate-300 text-xs"
                    />
                  </div>

                  <div>
                    <label className="block text-xs font-bold text-slate-700 mb-1">
                      رقم الهاتف / الواتساب *
                    </label>
                    <input
                      type="text"
                      required
                      value={createFormData.phone}
                      onChange={(e) => setCreateFormData({ ...createFormData, phone: e.target.value })}
                      placeholder="010XXXXXXXX"
                      className="w-full px-3 py-2 rounded-lg border border-slate-300 text-xs"
                    />
                  </div>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                  <div>
                    <label className="block text-xs font-bold text-slate-700 mb-1">المحافظة</label>
                    <select
                      value={createFormData.governorate}
                      onChange={(e) => setCreateFormData({ ...createFormData, governorate: e.target.value })}
                      className="w-full px-3 py-2 rounded-lg border border-slate-300 text-xs"
                    >
                      {GOVERNORATES.filter(Boolean).map((g) => (
                        <option key={g} value={g}>{g}</option>
                      ))}
                    </select>
                  </div>

                  <div>
                    <label className="block text-xs font-bold text-slate-700 mb-1">المنطقة / المدينة</label>
                    <input
                      type="text"
                      value={createFormData.area}
                      onChange={(e) => setCreateFormData({ ...createFormData, area: e.target.value })}
                      placeholder="العاشر من رمضان..."
                      className="w-full px-3 py-2 rounded-lg border border-slate-300 text-xs"
                    />
                  </div>
                </div>

                {/* Subscription Plan & Price */}
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 pt-2 border-t border-slate-100">
                  <div>
                    <label className="block text-xs font-bold text-slate-700 mb-1">خطة الاشتراك *</label>
                    <select
                      value={createFormData.subscriptionPlan}
                      onChange={(e) => setCreateFormData({ ...createFormData, subscriptionPlan: e.target.value })}
                      className="w-full px-3 py-2 rounded-lg border border-slate-300 text-xs font-bold"
                    >
                      <option value="Basic">الأساسية (Basic - 500 ج.م)</option>
                      <option value="Gold">الذهبية (Gold - 1000 ج.م)</option>
                      <option value="Platinum">البلاتينية (Platinum - 2000 ج.م)</option>
                    </select>
                  </div>

                  <div>
                    <label className="block text-xs font-bold text-slate-700 mb-1">
                      سعر مخصص (EGP) (اختياري)
                    </label>
                    <input
                      type="number"
                      value={createFormData.customPriceEgp}
                      onChange={(e) => setCreateFormData({ ...createFormData, customPriceEgp: e.target.value })}
                      placeholder="السعر الافتراضي للخطة..."
                      className="w-full px-3 py-2 rounded-lg border border-slate-300 text-xs"
                    />
                  </div>
                </div>

                <div className="p-3 bg-blue-50 text-blue-800 rounded-xl text-xs space-y-1">
                  <div className="font-bold">🔒 الأمان وكلمات المرور:</div>
                  <div>
                    سيتم إنشاء الحساب بكلمة مرور مؤقتة موحدة: <code className="font-mono font-bold bg-white px-1.5 py-0.5 rounded">Temp@1234</code>.
                  </div>
                  <div>
                    سيُلزم صاحب الحساب بتعيين كلمة مرور شخصية جديدة فور تسجيل الدخول الأول قبل التمكن من استخدام أي خاصية.
                  </div>
                </div>

                <div className="pt-2 flex justify-end gap-3">
                  <button
                    type="button"
                    onClick={() => setCreateModalOpen(false)}
                    className="px-4 py-2 rounded-xl text-xs font-semibold text-slate-600 bg-slate-100 hover:bg-slate-200"
                  >
                    إلغاء
                  </button>
                  <button
                    type="submit"
                    disabled={createSubmitting}
                    className="px-6 py-2 rounded-xl text-xs font-bold text-white bg-blue-600 hover:bg-blue-700 shadow-sm disabled:opacity-50"
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
          <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-sm">
            <div className="w-full max-w-md bg-white rounded-2xl shadow-xl border border-slate-200 p-6">
              <h3 className="text-base font-bold text-slate-900 mb-2">
                تعديل حالة حساب "{statusModal.companyName}"
              </h3>
              <form onSubmit={handleStatusSubmit} className="space-y-4">
                <div>
                  <label className="block text-xs font-bold text-slate-700 mb-1">الحالة الجديدة</label>
                  <select
                    value={statusModal.status}
                    onChange={(e) => setStatusModal({ ...statusModal, status: e.target.value })}
                    className="w-full px-3 py-2 rounded-lg border border-slate-300 text-xs font-semibold"
                  >
                    <option value="active">نشط (Active)</option>
                    <option value="on_hold">معلق مؤقتاً (On Hold)</option>
                    <option value="suspended">موقوف (Suspended)</option>
                    <option value="banned">محظور (Banned)</option>
                    <option value="removed">محذوف نهائياً (Removed)</option>
                  </select>
                </div>

                <div>
                  <label className="block text-xs font-bold text-slate-700 mb-1">السبب / الملاحظات</label>
                  <textarea
                    rows={3}
                    value={statusModal.reason}
                    onChange={(e) => setStatusModal({ ...statusModal, reason: e.target.value })}
                    placeholder="اكتب سبب تغيير الحالة..."
                    className="w-full px-3 py-2 rounded-lg border border-slate-300 text-xs"
                  />
                </div>

                <div className="flex justify-end gap-2">
                  <button
                    type="button"
                    onClick={() => setStatusModal({ open: false, companyId: null, companyName: '', status: 'active', reason: '' })}
                    className="px-4 py-2 rounded-lg text-xs bg-slate-100 text-slate-700"
                  >
                    إلغاء
                  </button>
                  <button type="submit" className="px-5 py-2 rounded-lg text-xs font-bold text-white bg-blue-600 hover:bg-blue-700">
                    حفظ التغييرات
                  </button>
                </div>
              </form>
            </div>
          </div>
        )}

        {/* MODAL 3: PLAN EDIT */}
        {planModal.open && (
          <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-sm">
            <div className="w-full max-w-md bg-white rounded-2xl shadow-xl border border-slate-200 p-6">
              <h3 className="text-base font-bold text-slate-900 mb-2">
                تعديل خطة اشتراك "{planModal.companyName}"
              </h3>
              <form onSubmit={handlePlanSubmit} className="space-y-4">
                <div>
                  <label className="block text-xs font-bold text-slate-700 mb-1">الخطة</label>
                  <select
                    value={planModal.plan}
                    onChange={(e) => setPlanModal({ ...planModal, plan: e.target.value })}
                    className="w-full px-3 py-2 rounded-lg border border-slate-300 text-xs font-semibold"
                  >
                    <option value="Basic">الأساسية (Basic)</option>
                    <option value="Gold">الذهبية (Gold)</option>
                    <option value="Platinum">البلاتينية (Platinum)</option>
                  </select>
                </div>

                <div>
                  <label className="block text-xs font-bold text-slate-700 mb-1">السعر الشهري (EGP)</label>
                  <input
                    type="number"
                    value={planModal.priceEgp}
                    onChange={(e) => setPlanModal({ ...planModal, priceEgp: e.target.value })}
                    className="w-full px-3 py-2 rounded-lg border border-slate-300 text-xs"
                    required
                  />
                </div>

                <div className="flex justify-end gap-2">
                  <button
                    type="button"
                    onClick={() => setPlanModal({ open: false, companyId: null, companyName: '', plan: 'Basic', priceEgp: 500 })}
                    className="px-4 py-2 rounded-lg text-xs bg-slate-100 text-slate-700"
                  >
                    إلغاء
                  </button>
                  <button type="submit" className="px-5 py-2 rounded-lg text-xs font-bold text-white bg-blue-600 hover:bg-blue-700">
                    حفظ الاشتراك
                  </button>
                </div>
              </form>
            </div>
          </div>
        )}

        {/* MODAL 4: INDIVIDUAL ANALYTICS */}
        {analyticsModal.open && (
          <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-sm">
            <div className="w-full max-w-2xl bg-white rounded-3xl shadow-2xl border border-slate-200 p-6 max-h-[85vh] overflow-y-auto">
              <div className="flex items-center justify-between pb-3 mb-4 border-b border-slate-100">
                <h3 className="text-base font-bold text-slate-900">
                  تحليلات واستخدام الحساب: {analyticsModal.data?.account?.companyName}
                </h3>
                <button
                  onClick={() => setAnalyticsModal({ open: false, data: null, loading: false })}
                  className="text-slate-400 hover:text-slate-600"
                >
                  ✕
                </button>
              </div>

              {analyticsModal.loading ? (
                <div className="py-12 flex justify-center">
                  <LoadingSpinner />
                </div>
              ) : analyticsModal.data ? (
                <div className="space-y-6">
                  {/* Metrics Summary */}
                  <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 text-center">
                    <div className="p-3 bg-blue-50 rounded-xl">
                      <div className="text-[11px] text-blue-700">عمليات البحث</div>
                      <div className="text-xl font-bold text-blue-900">{analyticsModal.data.metrics?.searches || 0}</div>
                    </div>
                    <div className="p-3 bg-indigo-50 rounded-xl">
                      <div className="text-[11px] text-indigo-700">المشاهدات</div>
                      <div className="text-xl font-bold text-indigo-900">{analyticsModal.data.metrics?.views || 0}</div>
                    </div>
                    <div className="p-3 bg-emerald-50 rounded-xl">
                      <div className="text-[11px] text-emerald-700">التنزيل والتحميل</div>
                      <div className="text-xl font-bold text-emerald-900">{analyticsModal.data.metrics?.downloads || 0}</div>
                    </div>
                    <div className="p-3 bg-amber-50 rounded-xl">
                      <div className="text-[11px] text-amber-700">الاتصالات</div>
                      <div className="text-xl font-bold text-amber-900">{analyticsModal.data.metrics?.contacts || 0}</div>
                    </div>
                  </div>

                  {/* 30-Day Cairo Daily Usage Table */}
                  <div>
                    <h4 className="text-xs font-bold text-slate-700 mb-2">سجل الاستخدام اليومي (توقيت القاهرة)</h4>
                    <div className="border border-slate-200 rounded-xl overflow-hidden max-h-48 overflow-y-auto">
                      <table className="w-full text-right text-xs">
                        <thead className="bg-slate-50 text-slate-500 font-bold border-b border-slate-200">
                          <tr>
                            <th className="p-2">التاريخ (Cairo)</th>
                            <th className="p-2">البحث</th>
                            <th className="p-2">التحميل بالوظائف</th>
                            <th className="p-2">تصفح VIP</th>
                          </tr>
                        </thead>
                        <tbody className="divide-y divide-slate-100">
                          {(analyticsModal.data.dailyHistory || []).map((dh) => (
                            <tr key={dh._id}>
                              <td className="p-2 font-mono">{dh.cairoDate}</td>
                              <td className="p-2">{dh.searchesCount}</td>
                              <td className="p-2">
                                {Object.keys(dh.downloadsByJobTitle || {}).length} مسمى
                              </td>
                              <td className="p-2">{dh.platinumSingleViewsCount || 0} مشاهدة / {dh.platinumSingleDownloadsCount || 0} تنزيل</td>
                            </tr>
                          ))}
                        </tbody>
                      </table>
                    </div>
                  </div>
                </div>
              ) : null}
            </div>
          </div>
        )}

        {/* MODAL 5: EDIT PLATFORM PLAN */}
        {editingPlan && (
          <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-sm">
            <div className="w-full max-w-md bg-white rounded-2xl shadow-xl border border-slate-200 p-6">
              <h3 className="text-base font-bold text-slate-900 mb-3">
                تعديل خطة: {editingPlan.displayNameAr || editingPlan.planName}
              </h3>
              <form onSubmit={handleSavePlatformPlan} className="space-y-3 text-xs">
                <div>
                  <label className="block font-bold text-slate-700 mb-1">السعر الشهري (EGP)</label>
                  <input
                    type="number"
                    value={editingPlan.priceEgp}
                    onChange={(e) => setEditingPlan({ ...editingPlan, priceEgp: Number(e.target.value) })}
                    className="w-full px-3 py-2 rounded-lg border border-slate-300"
                    required
                  />
                </div>

                <div>
                  <label className="block font-bold text-slate-700 mb-1">الحد اليومي لعمليات البحث</label>
                  <input
                    type="number"
                    value={editingPlan.dailySearchLimit}
                    onChange={(e) => setEditingPlan({ ...editingPlan, dailySearchLimit: Number(e.target.value) })}
                    className="w-full px-3 py-2 rounded-lg border border-slate-300"
                    required
                  />
                </div>

                <div>
                  <label className="block font-bold text-slate-700 mb-1">الحد اليومي لتنزيل الملفات لكل مسمى</label>
                  <input
                    type="number"
                    value={editingPlan.dailyDownloadLimitPerTitle}
                    onChange={(e) => setEditingPlan({ ...editingPlan, dailyDownloadLimitPerTitle: Number(e.target.value) })}
                    className="w-full px-3 py-2 rounded-lg border border-slate-300"
                    required
                  />
                </div>

                <div>
                  <label className="block font-bold text-slate-700 mb-1">الحد الأقصى للمرشحين لكل مسمى</label>
                  <input
                    type="number"
                    value={editingPlan.maxCandidatesPerTitle}
                    onChange={(e) => setEditingPlan({ ...editingPlan, maxCandidatesPerTitle: Number(e.target.value) })}
                    className="w-full px-3 py-2 rounded-lg border border-slate-300"
                    required
                  />
                </div>

                <div className="flex items-center gap-2 pt-2">
                  <input
                    type="checkbox"
                    id="cartEnabled"
                    checked={editingPlan.cartEnabled}
                    onChange={(e) => setEditingPlan({ ...editingPlan, cartEnabled: e.target.checked })}
                    className="rounded"
                  />
                  <label htmlFor="cartEnabled" className="font-bold text-slate-800">
                    تفعيل سلة المرشحين المتعددة (Candidate Cart)
                  </label>
                </div>

                <div className="flex items-center gap-2">
                  <input
                    type="checkbox"
                    id="platinumBrowseEnabled"
                    checked={editingPlan.platinumBrowseEnabled}
                    onChange={(e) => setEditingPlan({ ...editingPlan, platinumBrowseEnabled: e.target.checked })}
                    className="rounded"
                  />
                  <label htmlFor="platinumBrowseEnabled" className="font-bold text-slate-800">
                    تفعيل بوابة التصفح المباشر (VIP Platinum Browse)
                  </label>
                </div>

                <div className="pt-3 flex justify-end gap-2">
                  <button
                    type="button"
                    onClick={() => setEditingPlan(null)}
                    className="px-4 py-2 rounded-lg bg-slate-100 text-slate-700 font-semibold"
                  >
                    إلغاء
                  </button>
                  <button type="submit" className="px-5 py-2 rounded-lg bg-blue-600 hover:bg-blue-700 text-white font-bold">
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
