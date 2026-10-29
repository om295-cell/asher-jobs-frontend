import React, { useState, useEffect, useCallback, useMemo, useRef } from 'react';
import { Link } from 'react-router-dom';
import { useLanguage } from '../../context/LanguageContext';
import { useToast } from '../../context/ToastContext';
import { useAuth } from '../../context/AuthContext';
import { companyApi } from '../../api/company.api';
import { jobsApi } from '../../api/jobs.api';
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
  Layers,
  Plus,
  FolderArchive,
  ChevronDown,
  RefreshCw,
  X,
  AlertCircle,
  Users
} from 'lucide-react';
import LoadingSpinner from '../../components/ui/LoadingSpinner';

const CAREER_LEVELS = [
  'مبتدئ (1-3 سنوات)',
  'متوسط (3-5 سنوات)',
  'متقدم (5-7 سنوات)',
  'صاحب خبره كبيره (أكثر من 7 سنوات)'
];

// Smart Searchable Job Dropdown Component
function SearchableJobSelect({ jobs, selectedJobId, onSelect, isRtl, placeholder }) {
  const [open, setOpen] = useState(false);
  const [search, setSearch] = useState('');
  const wrapperRef = useRef(null);

  const selectedJob = useMemo(
    () => jobs.find((j) => String(j._id) === String(selectedJobId)),
    [jobs, selectedJobId]
  );

  const filteredJobs = useMemo(() => {
    if (!search.trim()) return jobs;
    const q = search.trim().toLowerCase();
    return jobs.filter((j) => {
      const name = (j.name || '').toLowerCase();
      const nameAr = (j.nameAr || '').toLowerCase();
      const cat = (j.categoryId?.nameAr || j.categoryId?.name || '').toLowerCase();
      return name.includes(q) || nameAr.includes(q) || cat.includes(q);
    });
  }, [jobs, search]);

  useEffect(() => {
    function handleClickOutside(e) {
      if (wrapperRef.current && !wrapperRef.current.contains(e.target)) {
        setOpen(false);
      }
    }
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  return (
    <div ref={wrapperRef} style={{ position: 'relative', width: '100%' }}>
      <button
        type="button"
        onClick={() => setOpen(!open)}
        style={{
          width: '100%',
          padding: '0.65rem 0.85rem',
          borderRadius: '8px',
          border: selectedJob ? '1.5px solid #000000' : '1px solid #cbd5e1',
          background: '#ffffff',
          color: selectedJob ? '#09090b' : '#94a3b8',
          fontSize: '0.875rem',
          fontWeight: selectedJob ? 700 : 500,
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'space-between',
          cursor: 'pointer',
          textAlign: isRtl ? 'right' : 'left'
        }}
      >
        <span style={{ overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>
          {selectedJob
            ? (isRtl ? selectedJob.nameAr || selectedJob.name : selectedJob.name || selectedJob.nameAr)
            : (placeholder || (isRtl ? 'اختر المسمى الوظيفي المطلوب...' : 'Select job title...'))}
        </span>
        <ChevronDown size={15} style={{ color: '#71717a', flexShrink: 0, marginInlineStart: 8 }} />
      </button>

      {open && (
        <div
          style={{
            position: 'absolute',
            top: 'calc(100% + 4px)',
            left: 0,
            right: 0,
            zIndex: 60,
            background: '#ffffff',
            border: '1.5px solid #000000',
            borderRadius: '10px',
            boxShadow: '0 10px 25px -5px rgba(0, 0, 0, 0.15)',
            padding: '0.5rem',
            maxHeight: '260px',
            display: 'flex',
            flexDirection: 'column'
          }}
        >
          <div style={{ position: 'relative', marginBottom: '0.5rem' }}>
            <Search
              size={14}
              style={{
                position: 'absolute',
                top: '50%',
                [isRtl ? 'right' : 'left']: '10px',
                transform: 'translateY(-50%)',
                color: '#a1a1aa'
              }}
            />
            <input
              type="text"
              autoFocus
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              placeholder={isRtl ? 'ابحث عن مسمى وظيفي...' : 'Search job title...'}
              style={{
                width: '100%',
                padding: isRtl ? '0.45rem 2rem 0.45rem 0.75rem' : '0.45rem 0.75rem 0.45rem 2rem',
                borderRadius: '6px',
                border: '1px solid #d4d4d8',
                fontSize: '0.85rem',
                outline: 'none'
              }}
            />
          </div>

          <div style={{ overflowY: 'auto', flex: 1 }}>
            {filteredJobs.length === 0 ? (
              <div style={{ padding: '0.85rem', textAlign: 'center', color: '#a1a1aa', fontSize: '0.85rem' }}>
                {isRtl ? 'لا توجد وظائف مطابقة للبحث' : 'No matching jobs found'}
              </div>
            ) : (
              filteredJobs.map((j) => (
                <div
                  key={j._id}
                  onClick={() => {
                    onSelect(j);
                    setOpen(false);
                    setSearch('');
                  }}
                  style={{
                    padding: '0.5rem 0.75rem',
                    borderRadius: '6px',
                    cursor: 'pointer',
                    fontSize: '0.85rem',
                    color: String(j._id) === String(selectedJobId) ? '#000000' : '#27272a',
                    fontWeight: String(j._id) === String(selectedJobId) ? 800 : 500,
                    background: String(j._id) === String(selectedJobId) ? '#f4f4f5' : 'transparent',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'space-between',
                    transition: 'background 0.1s'
                  }}
                  onMouseEnter={(e) => (e.currentTarget.style.background = '#f4f4f5')}
                  onMouseLeave={(e) => {
                    if (String(j._id) !== String(selectedJobId)) {
                      e.currentTarget.style.background = 'transparent';
                    }
                  }}
                >
                  <span>{isRtl ? j.nameAr || j.name : j.name || j.nameAr}</span>
                  {j.categoryId && (
                    <span
                      style={{
                        fontSize: '0.72rem',
                        padding: '0.15rem 0.5rem',
                        borderRadius: '4px',
                        background: '#e4e4e7',
                        color: '#52525b'
                      }}
                    >
                      {isRtl ? j.categoryId.nameAr || j.categoryId.name : j.categoryId.name || j.categoryId.nameAr}
                    </span>
                  )}
                </div>
              ))
            )}
          </div>
        </div>
      )}
    </div>
  );
}

function createEmptySearchRow(id) {
  return {
    id: id || String(Date.now() + Math.random()),
    jobId: '',
    quantity: 5,
    careerLevel: ''
  };
}

export default function CompanyCart() {
  const { isRtl } = useLanguage();
  const { showToast } = useToast();
  const { profile } = useAuth();

  const [cart, setCart] = useState([]);
  const [jobs, setJobs] = useState([]);
  const [entitlements, setEntitlements] = useState(null);
  const [loading, setLoading] = useState(true);
  const [exporting, setExporting] = useState(false);
  const [searching, setSearching] = useState(false);
  const [exportFormat, setExportFormat] = useState('multi_sheet'); // 'multi_sheet' | 'zip' | 'single_sheet_categorized'

  // Multi-Search criteria builder state
  const [searchRows, setSearchRows] = useState([
    createEmptySearchRow('1'),
    createEmptySearchRow('2')
  ]);
  const [showBuilder, setShowBuilder] = useState(true);

  // Fetch Jobs and Cart
  const fetchData = useCallback(async () => {
    setLoading(true);
    try {
      const [cartRes, entRes, jobsRes] = await Promise.all([
        companyApi.getCart(),
        companyApi.getEntitlements(),
        jobsApi.getJobs()
      ]);

      const rawCart = cartRes.data?.data;
      const cartItems = Array.isArray(rawCart)
        ? rawCart
        : Array.isArray(rawCart?.items)
        ? rawCart.items
        : [];

      setCart(cartItems);
      setEntitlements(entRes.data?.data || null);

      if (jobsRes.data?.data) {
        setJobs(jobsRes.data.data);
      }
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

  // Multi-Search builder row handlers
  const handleAddSearchRow = () => {
    if (searchRows.length >= 10) {
      showToast(isRtl ? 'الحد الأقصى لعمليات البحث المجمعة هو 10 تخصصات' : 'Maximum 10 titles per bulk search', 'warning');
      return;
    }
    setSearchRows((prev) => [...prev, createEmptySearchRow()]);
  };

  const handleRemoveSearchRow = (id) => {
    if (searchRows.length <= 1) {
      setSearchRows([createEmptySearchRow()]);
      return;
    }
    setSearchRows((prev) => prev.filter((r) => r.id !== id));
  };

  const handleRowFieldChange = (id, field, value) => {
    setSearchRows((prev) =>
      prev.map((r) => (r.id === id ? { ...r, [field]: value } : r))
    );
  };

  // Run Bulk Multi-Search and add candidates into cart
  const handleExecuteMultiSearch = async (replace = false) => {
    const validRows = searchRows.filter((r) => r.jobId);
    if (validRows.length === 0) {
      showToast(
        isRtl
          ? 'يرجى اختيار مسمى وظيفي واحد على الأقل للبحث'
          : 'Please select at least one job title to search',
        'warning'
      );
      return;
    }

    setSearching(true);
    try {
      const payloadItems = validRows.map((r) => ({
        jobId: r.jobId,
        quantity: Math.max(1, Math.min(10, parseInt(r.quantity, 10) || 5)),
        careerLevel: r.careerLevel || ''
      }));

      await companyApi.bulkUpdateCart(payloadItems, replace);
      showToast(
        isRtl
          ? `تم تنفيذ البحث وإضافة مرشحي ${payloadItems.length} تخصصات إلى السلة بنجاح!`
          : `Searched and added candidates for ${payloadItems.length} titles to cart!`,
        'success'
      );
      await fetchData();
    } catch (err) {
      showToast(
        err.response?.data?.message || (isRtl ? 'فشل تنفيذ البحث المجمع' : 'Failed to execute multi-search'),
        'error'
      );
    } finally {
      setSearching(false);
    }
  };

  // Remove specific title from cart
  const handleRemoveItem = async (jobId) => {
    try {
      await companyApi.removeCartItem(jobId);
      showToast(isRtl ? 'تم حذف المسمى الوظيفي من السلة' : 'Removed from cart', 'success');
      fetchData();
    } catch (err) {
      showToast(err.response?.data?.message || 'فشل الحذف', 'error');
    }
  };

  // Clear all cart items
  const handleClearCart = async () => {
    if (!window.confirm(isRtl ? 'هل أنت متأكد من تفريغ سلة المرشحين بالكامل؟' : 'Are you sure you want to clear the entire cart?')) return;
    try {
      await companyApi.clearCart();
      showToast(isRtl ? 'تم تفريغ السلة بنجاح' : 'Cart cleared', 'success');
      fetchData();
    } catch (err) {
      showToast(err.response?.data?.message || 'فشل تفريغ السلة', 'error');
    }
  };

  // Export Cart (Multi-Sheet Excel or ZIP file of Excels)
  const handleExport = async () => {
    const currentItems = Array.isArray(cart) ? cart : [];
    if (currentItems.length === 0) {
      showToast(isRtl ? 'السلة فارغة. يرجى إضافة مسميات وظيفية أولاً.' : 'Cart is empty. Add job titles first.', 'warning');
      return;
    }

    setExporting(true);
    try {
      const res = await companyApi.exportCart(exportFormat);
      const isZip = exportFormat === 'zip';
      const mimeType = isZip
        ? 'application/zip'
        : 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet';
      const fileExt = isZip ? 'zip' : 'xlsx';

      const blob = new Blob([res.data], { type: mimeType });
      const url = URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url;
      const dateStr = new Date().toISOString().slice(0, 10);
      a.download = isZip
        ? `asher_candidates_archive_${dateStr}.zip`
        : `asher_candidates_${exportFormat}_${dateStr}.${fileExt}`;
      document.body.appendChild(a);
      a.click();
      document.body.removeChild(a);
      URL.revokeObjectURL(url);

      showToast(
        isZip
          ? (isRtl ? 'تم تحميل الأرشيف المضغوط (ZIP) بنجاح!' : 'ZIP archive downloaded successfully!')
          : (isRtl ? 'تم تصدير ملف الإكسيل بنجاح!' : 'Excel export downloaded successfully!'),
        'success'
      );
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
              {isRtl ? 'سلة المرشحين والبحث المجمع المتعدد' : 'Multi-Title Candidate Cart & Bulk Search'}
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
                  خاصية البحث المتعدد في وقت واحد وتصدير ملفات الإكسيل والأرشيف المضغوط متاحة حصرياً لمشتركي{' '}
                  <strong style={{ color: '#000000', fontWeight: 800 }}>الباقة الذهبية (Gold)</strong> و{' '}
                  <strong style={{ color: '#000000', fontWeight: 800 }}>الباقة البلاتينية (Platinum)</strong>.
                </>
              ) : (
                <>
                  Multi-title bulk search and Excel/ZIP export features are available exclusively to{' '}
                  <strong style={{ color: '#000000', fontWeight: 800 }}>Gold</strong> and{' '}
                  <strong style={{ color: '#000000', fontWeight: 800 }}>Platinum</strong> subscribers.
                </>
              )}
            </p>

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
                <span>{isRtl ? 'البحث عن المرشحين' : 'Search Candidates'}</span>
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
        background: '#f8fafc',
        minHeight: '85vh'
      }}
      dir={isRtl ? 'rtl' : 'ltr'}
    >
      <div className="container" style={{ maxWidth: '1240px' }}>
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
              <h1 style={{ fontSize: 'clamp(1.35rem, 3vw, 1.75rem)', fontWeight: 900, margin: 0, color: '#09090b' }}>
                {isRtl ? 'سلة المرشحين والبحث المجمع المتعدد' : 'Multi-Title Candidate Cart & Bulk Search'}
              </h1>
            </div>
            <p style={{ margin: 0, fontSize: '0.875rem', color: '#64748b', lineHeight: 1.5 }}>
              {isRtl
                ? `تحديد عدة تخصصات ومستويات خبرة في نفس الوقت، وتجميع المرشحين وتنزيلهم في ملف إكسيل بصفحات مستقلة أو أرشيف ZIP مضغوط.`
                : `Run multiple searches simultaneously, select career levels, and export into multi-sheet Excel or ZIP archive.`}
            </p>
          </div>

          <div style={{ display: 'flex', alignItems: 'center', gap: '0.6rem', flexWrap: 'wrap' }}>
            <button
              type="button"
              onClick={() => setShowBuilder(!showBuilder)}
              style={{
                display: 'inline-flex',
                alignItems: 'center',
                gap: '0.45rem',
                fontSize: '0.85rem',
                fontWeight: 700,
                padding: '0.55rem 1rem',
                borderRadius: '8px',
                background: showBuilder ? '#000000' : '#ffffff',
                color: showBuilder ? '#ffffff' : '#000000',
                border: '1.5px solid #000000',
                cursor: 'pointer',
                transition: 'all 0.15s ease'
              }}
            >
              <Plus size={16} />
              <span>{showBuilder ? (isRtl ? 'إخفاء منشئ البحث' : 'Hide Search Builder') : (isRtl ? 'إضافة / بحث متعدد' : 'Add / Multi-Search')}</span>
            </button>

            {cartList.length > 0 && (
              <button
                type="button"
                onClick={handleClearCart}
                style={{
                  display: 'inline-flex',
                  alignItems: 'center',
                  gap: '0.45rem',
                  fontSize: '0.85rem',
                  fontWeight: 700,
                  padding: '0.55rem 1rem',
                  borderRadius: '8px',
                  color: '#dc2626',
                  borderColor: '#fca5a5',
                  background: '#ffffff',
                  border: '1px solid #fca5a5',
                  cursor: 'pointer'
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
            background: '#09090b',
            color: '#ffffff',
            borderRadius: '12px',
            padding: '0.9rem 1.25rem',
            marginBottom: '1.75rem',
            display: 'flex',
            flexWrap: 'wrap',
            justifyContent: 'space-between',
            alignItems: 'center',
            gap: '1rem',
            boxShadow: '0 4px 12px rgba(0,0,0,0.06)'
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

        {/* ========================================================================= */}
        {/* MULTI-SEARCH BUILDER (Run several searches at the same time directly in cart) */}
        {/* ========================================================================= */}
        {showBuilder && (
          <div
            style={{
              background: '#ffffff',
              borderRadius: '16px',
              border: '2px solid #000000',
              padding: '1.5rem',
              marginBottom: '2rem',
              boxShadow: '0 8px 24px rgba(0, 0, 0, 0.05)'
            }}
          >
            <div
              style={{
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'space-between',
                flexWrap: 'wrap',
                gap: '1rem',
                marginBottom: '1.25rem',
                paddingBottom: '1rem',
                borderBottom: '1px solid #f1f5f9'
              }}
            >
              <div style={{ display: 'flex', alignItems: 'center', gap: '0.65rem' }}>
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
                  <Search size={18} />
                </div>
                <div>
                  <h3 style={{ margin: 0, fontSize: '1.15rem', fontWeight: 900, color: '#09090b' }}>
                    {isRtl ? 'إجراء عدة عمليات بحث في نفس الوقت وتجميع المرشحين' : 'Multi-Title Search & Cart Builder'}
                  </h3>
                  <p style={{ margin: 0, fontSize: '0.8rem', color: '#64748b' }}>
                    {isRtl
                      ? 'حدد المسميات الوظيفية، عدد المرشحين، ومستوى الخبرة لكل وظيفة واضغط تنفيذ البحث لإضافتهم فوراً إلى السلة.'
                      : 'Configure titles, candidate quantity, and career level, then click run to populate your cart.'}
                  </p>
                </div>
              </div>

              <button
                type="button"
                onClick={handleAddSearchRow}
                style={{
                  display: 'inline-flex',
                  alignItems: 'center',
                  gap: '0.4rem',
                  padding: '0.45rem 0.9rem',
                  borderRadius: '8px',
                  background: '#f8fafc',
                  border: '1.5px solid #000000',
                  color: '#000000',
                  fontSize: '0.825rem',
                  fontWeight: 800,
                  cursor: 'pointer',
                  transition: 'all 0.15s ease'
                }}
              >
                <Plus size={15} />
                <span>{isRtl ? '+ إضافة مسمى وظيفي آخر' : '+ Add Another Title'}</span>
              </button>
            </div>

            {/* Criteria Rows */}
            <div style={{ display: 'flex', flexDirection: 'column', gap: '0.85rem', marginBottom: '1.5rem' }}>
              {searchRows.map((row, idx) => (
                <div
                  key={row.id}
                  style={{
                    background: '#f8fafc',
                    border: '1px solid #e2e8f0',
                    borderRadius: '12px',
                    padding: '1rem',
                    display: 'grid',
                    gridTemplateColumns: 'auto minmax(200px, 2fr) minmax(130px, 1fr) minmax(170px, 1.5fr) auto',
                    gap: '0.85rem',
                    alignItems: 'center'
                  }}
                >
                  {/* Row Number Badge */}
                  <div
                    style={{
                      width: '28px',
                      height: '28px',
                      borderRadius: '6px',
                      background: '#09090b',
                      color: '#ffffff',
                      fontSize: '0.8rem',
                      fontWeight: 800,
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'center'
                    }}
                  >
                    {idx + 1}
                  </div>

                  {/* 1. Job Title Select */}
                  <div>
                    <label style={{ display: 'block', fontSize: '0.75rem', fontWeight: 700, color: '#334155', marginBottom: '0.3rem' }}>
                      {isRtl ? 'المسمى الوظيفي المطلوب' : 'Job Title'} *
                    </label>
                    <SearchableJobSelect
                      jobs={jobs}
                      selectedJobId={row.jobId}
                      onSelect={(job) => handleRowFieldChange(row.id, 'jobId', job._id)}
                      isRtl={isRtl}
                      placeholder={isRtl ? 'اختر المسمى الوظيفي...' : 'Select job title...'}
                    />
                  </div>

                  {/* 2. Number of people (Quantity: 1 to 10) */}
                  <div>
                    <label style={{ display: 'block', fontSize: '0.75rem', fontWeight: 700, color: '#334155', marginBottom: '0.3rem' }}>
                      {isRtl ? 'عدد الكوادر المطلوبة' : 'Number of People'} *
                    </label>
                    <select
                      value={row.quantity}
                      onChange={(e) => handleRowFieldChange(row.id, 'quantity', parseInt(e.target.value, 10))}
                      style={{
                        width: '100%',
                        padding: '0.65rem 0.75rem',
                        borderRadius: '8px',
                        border: '1px solid #cbd5e1',
                        background: '#ffffff',
                        fontSize: '0.875rem',
                        fontWeight: 700,
                        outline: 'none'
                      }}
                    >
                      {[1, 2, 3, 4, 5, 6, 7, 8, 9, 10].map((num) => (
                        <option key={num} value={num}>
                          {num} {isRtl ? 'مرشحين' : 'candidates'}
                        </option>
                      ))}
                    </select>
                  </div>

                  {/* 3. Career Level */}
                  <div>
                    <label style={{ display: 'block', fontSize: '0.75rem', fontWeight: 700, color: '#334155', marginBottom: '0.3rem' }}>
                      {isRtl ? 'مستوى الخبرة' : 'Career Level'}
                    </label>
                    <select
                      value={row.careerLevel}
                      onChange={(e) => handleRowFieldChange(row.id, 'careerLevel', e.target.value)}
                      style={{
                        width: '100%',
                        padding: '0.65rem 0.75rem',
                        borderRadius: '8px',
                        border: '1px solid #cbd5e1',
                        background: '#ffffff',
                        fontSize: '0.875rem',
                        fontWeight: row.careerLevel ? 700 : 500,
                        color: row.careerLevel ? '#09090b' : '#64748b',
                        outline: 'none'
                      }}
                    >
                      <option value="">{isRtl ? 'الكل (أي مستوى خبرة)' : 'All Career Levels'}</option>
                      {CAREER_LEVELS.map((lvl) => (
                        <option key={lvl} value={lvl}>
                          {lvl}
                        </option>
                      ))}
                    </select>
                  </div>

                  {/* 4. Remove Button */}
                  <div>
                    <button
                      type="button"
                      onClick={() => handleRemoveSearchRow(row.id)}
                      title={isRtl ? 'حذف هذا المسمى من البحث' : 'Remove title row'}
                      style={{
                        background: '#fee2e2',
                        border: '1px solid #fecaca',
                        color: '#dc2626',
                        width: '36px',
                        height: '36px',
                        borderRadius: '8px',
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'center',
                        cursor: 'pointer',
                        transition: 'all 0.15s ease'
                      }}
                    >
                      <Trash2 size={16} />
                    </button>
                  </div>
                </div>
              ))}
            </div>

            {/* Execute Bulk Search Actions */}
            <div
              style={{
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'space-between',
                flexWrap: 'wrap',
                gap: '1rem',
                paddingTop: '1rem',
                borderTop: '1px solid #f1f5f9'
              }}
            >
              <div style={{ fontSize: '0.825rem', color: '#64748b' }}>
                {isRtl
                  ? `سيتم البحث عن وإضافة ${searchRows.filter((r) => r.jobId).length} تخصصات إلى السلة`
                  : `Configured ${searchRows.filter((r) => r.jobId).length} titles to search`}
              </div>

              <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem', flexWrap: 'wrap' }}>
                <button
                  type="button"
                  onClick={() => handleExecuteMultiSearch(false)}
                  disabled={searching}
                  style={{
                    padding: '0.75rem 1.75rem',
                    borderRadius: '8px',
                    background: '#000000',
                    color: '#ffffff',
                    border: 'none',
                    fontWeight: 800,
                    fontSize: '0.925rem',
                    cursor: searching ? 'not-allowed' : 'pointer',
                    display: 'inline-flex',
                    alignItems: 'center',
                    gap: '0.5rem',
                    boxShadow: '0 4px 12px rgba(0,0,0,0.1)'
                  }}
                >
                  {searching ? (
                    <>
                      <LoadingSpinner size="sm" />
                      <span>{isRtl ? 'جاري البحث وتجميع الكوادر...' : 'Searching & populating...'}</span>
                    </>
                  ) : (
                    <>
                      <Search size={17} />
                      <span>{isRtl ? 'تنفيذ البحث وإضافة المرشحين للسلة' : 'Run Search & Populate Cart'}</span>
                    </>
                  )}
                </button>
              </div>
            </div>
          </div>
        )}

        {/* ========================================================================= */}
        {/* POPULATED CART & EXPORT SECTION */}
        {/* ========================================================================= */}
        {cartList.length === 0 ? (
          <div
            style={{
              padding: '3rem 1.5rem',
              borderRadius: '16px',
              border: '2px dashed #cbd5e1',
              background: '#ffffff',
              textAlign: 'center'
            }}
          >
            <div
              style={{
                width: 60,
                height: 60,
                borderRadius: '50%',
                background: '#f1f5f9',
                color: '#64748b',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                margin: '0 auto 1.25rem'
              }}
            >
              <ShoppingCart size={28} />
            </div>

            <h3 style={{ fontSize: '1.25rem', fontWeight: 800, color: '#09090b', margin: '0 0 0.5rem' }}>
              {isRtl ? 'سلة المرشحين فارغة حالياً' : 'Your Candidate Cart is Empty'}
            </h3>

            <p style={{ margin: '0 auto 1.5rem', fontSize: '0.9rem', color: '#64748b', maxWidth: 480, lineHeight: 1.6 }}>
              {isRtl
                ? 'استخدم منشئ البحث المجمع بالأعلى لاختيار التخصصات ومستويات الخبرة المطلوبة، واضغط "تنفيذ البحث وإضافة المرشحين للسلة".'
                : 'Use the multi-search builder above to choose titles and experience levels, then click Run Search to populate.'}
            </p>

            <button
              type="button"
              onClick={() => {
                setShowBuilder(true);
                window.scrollTo({ top: 0, behavior: 'smooth' });
              }}
              style={{
                display: 'inline-flex',
                alignItems: 'center',
                gap: '0.5rem',
                fontSize: '0.925rem',
                fontWeight: 800,
                padding: '0.75rem 1.5rem',
                borderRadius: '8px',
                background: '#000000',
                color: '#ffffff',
                border: 'none',
                cursor: 'pointer'
              }}
            >
              <Plus size={16} />
              <span>{isRtl ? 'البدء في إضافة التخصصات للبحث' : 'Start Adding Titles to Search'}</span>
            </button>
          </div>
        ) : (
          <div
            style={{
              display: 'grid',
              gridTemplateColumns: 'repeat(auto-fit, minmax(min(100%, 340px), 1fr))',
              gap: '1.75rem',
              alignItems: 'start'
            }}
          >
            {/* Left 2-col area: Candidate Buckets by Job Title */}
            <div style={{ display: 'flex', flexDirection: 'column', gap: '1.25rem', gridColumn: 'span 2' }}>
              <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '0.25rem' }}>
                <h2 style={{ fontSize: '1.25rem', fontWeight: 900, color: '#09090b', margin: 0, display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                  <span>{isRtl ? 'الكوادر المتطابقة في السلة' : 'Matched Candidates in Cart'}</span>
                  <span style={{ fontSize: '0.8rem', background: '#09090b', color: '#ffffff', padding: '0.15rem 0.55rem', borderRadius: '999px', fontWeight: 800 }}>
                    {cartList.length} {isRtl ? 'تخصصات' : 'titles'}
                  </span>
                </h2>

                <button
                  type="button"
                  onClick={fetchData}
                  style={{
                    display: 'inline-flex',
                    alignItems: 'center',
                    gap: '0.35rem',
                    fontSize: '0.78rem',
                    fontWeight: 700,
                    padding: '0.35rem 0.75rem',
                    borderRadius: '6px',
                    background: '#ffffff',
                    border: '1px solid #cbd5e1',
                    color: '#334155',
                    cursor: 'pointer'
                  }}
                >
                  <RefreshCw size={13} />
                  <span>{isRtl ? 'تحديث النتائج' : 'Refresh'}</span>
                </button>
              </div>

              {cartList.map((item) => {
                const titleText = item.jobId?.nameAr || item.jobId?.name || (isRtl ? 'مسمى وظيفي' : 'Job Title');
                const categoryText = item.jobId?.categoryId?.nameAr || item.jobId?.categoryId?.name || '';
                const candidates = item.candidates || [];
                const candCount = candidates.length;
                const requestedQty = item.quantity || 1;
                const careerLevel = item.careerLevel || '';

                return (
                  <div
                    key={item._id || item.jobId?._id || item.jobId}
                    style={{
                      background: '#ffffff',
                      borderRadius: '14px',
                      border: '1.5px solid #e2e8f0',
                      overflow: 'hidden',
                      boxShadow: '0 2px 8px rgba(0,0,0,0.03)'
                    }}
                  >
                    {/* Header Row */}
                    <div
                      style={{
                        padding: '1rem 1.25rem',
                        background: '#f8fafc',
                        borderBottom: '1px solid #e2e8f0',
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
                            width: 34,
                            height: 34,
                            borderRadius: '8px',
                            background: '#09090b',
                            color: '#ffffff',
                            display: 'flex',
                            alignItems: 'center',
                            justifyContent: 'center'
                          }}
                        >
                          <Briefcase size={17} />
                        </div>
                        <div>
                          <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', flexWrap: 'wrap' }}>
                            <h3 style={{ margin: 0, fontSize: '1.05rem', fontWeight: 800, color: '#09090b' }}>
                              {titleText}
                            </h3>
                            {categoryText && (
                              <span style={{ fontSize: '0.72rem', background: '#e2e8f0', color: '#475569', padding: '0.15rem 0.5rem', borderRadius: '4px', fontWeight: 600 }}>
                                {categoryText}
                              </span>
                            )}
                          </div>
                          <div style={{ display: 'flex', alignItems: 'center', gap: '0.6rem', marginTop: '0.2rem', fontSize: '0.78rem', color: '#64748b' }}>
                            <span>
                              {isRtl ? 'مستوى الخبرة: ' : 'Level: '}
                              <strong style={{ color: '#09090b' }}>{careerLevel || (isRtl ? 'الكل (أي خبرة)' : 'All')}</strong>
                            </span>
                            <span>•</span>
                            <span>
                              {isRtl ? 'المطلوب: ' : 'Requested: '}
                              <strong style={{ color: '#09090b' }}>{requestedQty}</strong>
                            </span>
                          </div>
                        </div>
                      </div>

                      <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                        <span
                          style={{
                            fontSize: '0.78rem',
                            fontWeight: 800,
                            padding: '0.25rem 0.65rem',
                            borderRadius: '6px',
                            background: candCount >= requestedQty ? '#dcfce7' : '#fef3c7',
                            color: candCount >= requestedQty ? '#15803d' : '#b45309',
                            border: `1px solid ${candCount >= requestedQty ? '#bbf7d0' : '#fde68a'}`
                          }}
                        >
                          {candCount} {isRtl ? 'مرشحين متوفرين' : 'candidates found'}
                        </span>

                        <button
                          type="button"
                          onClick={() => handleRemoveItem(item.jobId?._id || item.jobId)}
                          style={{
                            color: '#dc2626',
                            background: '#fee2e2',
                            border: '1px solid #fecaca',
                            padding: '0.35rem 0.65rem',
                            borderRadius: '6px',
                            fontSize: '0.75rem',
                            fontWeight: 700,
                            display: 'inline-flex',
                            alignItems: 'center',
                            gap: '0.35rem',
                            cursor: 'pointer'
                          }}
                          title={isRtl ? 'حذف هذا المسمى من السلة' : 'Remove title from cart'}
                        >
                          <Trash2 size={13} />
                          <span>{isRtl ? 'حذف' : 'Remove'}</span>
                        </button>
                      </div>
                    </div>

                    {/* Candidates in Bucket */}
                    <div style={{ padding: '0.75rem 1.25rem' }}>
                      {candidates.length > 0 ? (
                        <div style={{ display: 'flex', flexDirection: 'column' }}>
                          {candidates.map((cand, idx) => (
                            <div
                              key={cand._id || idx}
                              style={{
                                padding: '0.75rem 0',
                                borderBottom: idx < candidates.length - 1 ? '1px solid #f1f5f9' : 'none',
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
                                    background: '#f1f5f9',
                                    color: '#09090b',
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
                                  <h4 style={{ margin: 0, fontSize: '0.925rem', fontWeight: 800, color: '#09090b' }}>
                                    {cand.fullName}
                                  </h4>
                                  <div style={{ display: 'flex', flexWrap: 'wrap', alignItems: 'center', gap: '0.75rem', fontSize: '0.75rem', color: '#64748b', marginTop: '0.2rem' }}>
                                    {cand.phone && (
                                      <span style={{ display: 'inline-flex', alignItems: 'center', gap: '0.25rem', fontWeight: 700, color: '#09090b' }} dir="ltr">
                                        <Phone size={12} />
                                        <span>{cand.phone}</span>
                                      </span>
                                    )}
                                    {cand.careerLevel && (
                                      <span style={{ background: '#f1f5f9', padding: '0.1rem 0.45rem', borderRadius: '4px', fontWeight: 600 }}>
                                        {cand.careerLevel}
                                      </span>
                                    )}
                                    {cand.governorate && (
                                      <span style={{ display: 'inline-flex', alignItems: 'center', gap: '0.25rem' }}>
                                        <MapPin size={12} />
                                        <span>{cand.governorate}{cand.area ? ` - ${cand.area}` : ''}</span>
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
                                  background: '#dcfce7',
                                  color: '#16a34a',
                                  padding: '0.25rem 0.6rem',
                                  borderRadius: '6px',
                                  border: '1px solid #bbf7d0'
                                }}
                              >
                                <CheckCircle2 size={13} />
                                <span>{isRtl ? 'جاهز للتصدير' : 'Ready'}</span>
                              </span>
                            </div>
                          ))}
                        </div>
                      ) : (
                        <div style={{ padding: '1.25rem 0', textAlign: 'center', color: '#64748b', fontSize: '0.85rem' }}>
                          <AlertCircle size={20} style={{ color: '#d97706', margin: '0 auto 0.5rem', display: 'block' }} />
                          <div>
                            {isRtl
                              ? `لا توجد كوادر متاحة حالياً تطابق مسمى "${titleText}"${careerLevel ? ` بمستوى ${careerLevel}` : ''}.`
                              : `No available candidates currently match this title and level.`}
                          </div>
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
                style={{
                  position: 'sticky',
                  top: '2rem',
                  padding: '1.5rem',
                  borderRadius: '16px',
                  border: '2px solid #000000',
                  boxShadow: '0 8px 24px rgba(0, 0, 0, 0.06)',
                  background: '#ffffff'
                }}
              >
                <div style={{ display: 'flex', alignItems: 'center', gap: '0.65rem', paddingBottom: '1rem', borderBottom: '1px solid #e2e8f0', marginBottom: '1.25rem' }}>
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
                    <Download size={18} />
                  </div>
                  <div>
                    <h3 style={{ margin: 0, fontSize: '1.05rem', fontWeight: 800, color: '#09090b' }}>
                      {isRtl ? 'خيارات تنزيل وتصدير البيانات' : 'Export & Download Options'}
                    </h3>
                    <div style={{ fontSize: '0.75rem', color: '#64748b' }}>
                      {isRtl ? 'اختر طريقة التصدير المفضلة لديك' : 'Choose preferred export structure'}
                    </div>
                  </div>
                </div>

                {/* Format Radio Options */}
                <div style={{ display: 'flex', flexDirection: 'column', gap: '0.85rem', marginBottom: '1.5rem' }}>
                  {/* Option 1: Multi-Sheet in 1 Excel File */}
                  <label
                    onClick={() => setExportFormat('multi_sheet')}
                    style={{
                      display: 'flex',
                      alignItems: 'flex-start',
                      gap: '0.75rem',
                      padding: '0.9rem',
                      borderRadius: '10px',
                      border: exportFormat === 'multi_sheet' ? '2px solid #000000' : '1px solid #cbd5e1',
                      background: exportFormat === 'multi_sheet' ? '#f4f4f5' : '#ffffff',
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
                      <div style={{ display: 'flex', alignItems: 'center', gap: '0.45rem' }}>
                        <Layers size={15} style={{ color: '#09090b' }} />
                        <span style={{ fontSize: '0.875rem', fontWeight: 800, color: '#000000' }}>
                          {isRtl ? 'ملف إكسيل واحد متعدد الصفحات (Multi-Sheet)' : '1 Excel File with Multiple Pages'}
                        </span>
                      </div>
                      <div style={{ fontSize: '0.75rem', color: '#52525b', marginTop: '0.25rem', lineHeight: 1.4 }}>
                        {isRtl
                          ? 'ملف إكسيل واحد (.xlsx) يحتوي على ورقة عمل (Sheet/Page) مستقلة لكل مسمى وظيفي.'
                          : 'Single .xlsx workbook with a separate page/sheet tab for each job title.'}
                      </div>
                    </div>
                  </label>

                  {/* Option 2: ZIP Archive of Separate Excel Files */}
                  <label
                    onClick={() => setExportFormat('zip')}
                    style={{
                      display: 'flex',
                      alignItems: 'flex-start',
                      gap: '0.75rem',
                      padding: '0.9rem',
                      borderRadius: '10px',
                      border: exportFormat === 'zip' ? '2px solid #000000' : '1px solid #cbd5e1',
                      background: exportFormat === 'zip' ? '#f4f4f5' : '#ffffff',
                      cursor: 'pointer',
                      transition: 'all 0.15s ease'
                    }}
                  >
                    <input
                      type="radio"
                      name="exportFormat"
                      value="zip"
                      checked={exportFormat === 'zip'}
                      onChange={() => setExportFormat('zip')}
                      style={{ marginTop: '0.2rem', accentColor: '#000000' }}
                    />
                    <div>
                      <div style={{ display: 'flex', alignItems: 'center', gap: '0.45rem' }}>
                        <FolderArchive size={15} style={{ color: '#09090b' }} />
                        <span style={{ fontSize: '0.875rem', fontWeight: 800, color: '#000000' }}>
                          {isRtl ? 'أرشيف مضغوط يحتوي على ملف إكسيل لكل تخصص (ZIP)' : 'ZIP Archive with bunch of Excel sheets'}
                        </span>
                      </div>
                      <div style={{ fontSize: '0.75rem', color: '#52525b', marginTop: '0.25rem', lineHeight: 1.4 }}>
                        {isRtl
                          ? 'ملف مضغوط (.zip) يحتوي على ملفات إكسيل مستقلة، بحيث يتضمن كل ملف مسمى وظيفي واحد منفصل.'
                          : 'ZIP file containing multiple independent Excel files, each file dedicated to 1 job title.'}
                      </div>
                    </div>
                  </label>

                  {/* Option 3: Single Categorized Sheet */}
                  <label
                    onClick={() => setExportFormat('single_sheet_categorized')}
                    style={{
                      display: 'flex',
                      alignItems: 'flex-start',
                      gap: '0.75rem',
                      padding: '0.9rem',
                      borderRadius: '10px',
                      border: exportFormat === 'single_sheet_categorized' ? '2px solid #000000' : '1px solid #cbd5e1',
                      background: exportFormat === 'single_sheet_categorized' ? '#f4f4f5' : '#ffffff',
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
                      <div style={{ display: 'flex', alignItems: 'center', gap: '0.45rem' }}>
                        <FileSpreadsheet size={15} style={{ color: '#09090b' }} />
                        <span style={{ fontSize: '0.875rem', fontWeight: 800, color: '#000000' }}>
                          {isRtl ? 'ملف إكسيل موحد ومصنف (Single Combined Sheet)' : 'Single Combined Sheet'}
                        </span>
                      </div>
                      <div style={{ fontSize: '0.75rem', color: '#52525b', marginTop: '0.25rem', lineHeight: 1.4 }}>
                        {isRtl
                          ? 'صفحة إكسيل واحدة مجمعة تحتوي كافة المرشحين مصنفين ومفرزين حسب التخصص.'
                          : 'Single sheet listing all candidates grouped together by job title.'}
                      </div>
                    </div>
                  </label>
                </div>

                {/* Summary Box */}
                <div
                  style={{
                    padding: '0.85rem 1rem',
                    background: '#f8fafc',
                    borderRadius: '8px',
                    border: '1px solid #e2e8f0',
                    fontSize: '0.8125rem',
                    color: '#334155',
                    display: 'flex',
                    flexDirection: 'column',
                    gap: '0.45rem',
                    marginBottom: '1.25rem'
                  }}
                >
                  <div style={{ display: 'flex', justifyContent: 'space-between' }}>
                    <span>{isRtl ? 'عدد التخصصات بالسلة:' : 'Job Titles in Cart:'}</span>
                    <strong style={{ color: '#09090b' }}>{cartList.length}</strong>
                  </div>
                  <div style={{ display: 'flex', justifyContent: 'space-between' }}>
                    <span>{isRtl ? 'إجمالي المرشحين الجاهزين:' : 'Total Ready Candidates:'}</span>
                    <strong style={{ color: '#09090b' }}>{totalCandidatesCount}</strong>
                  </div>
                  <div style={{ display: 'flex', justifyContent: 'space-between' }}>
                    <span>{isRtl ? 'صيغة التنزيل:' : 'Download Format:'}</span>
                    <strong style={{ color: '#09090b' }}>
                      {exportFormat === 'zip'
                        ? (isRtl ? 'أرشيف مضغوط (.zip)' : 'ZIP Archive (.zip)')
                        : 'Microsoft Excel (.xlsx)'}
                    </strong>
                  </div>
                </div>

                {/* Download Button */}
                <button
                  type="button"
                  onClick={handleExport}
                  disabled={exporting || cartList.length === 0}
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
                    background: '#000000',
                    color: '#ffffff',
                    border: 'none',
                    cursor: exporting || cartList.length === 0 ? 'not-allowed' : 'pointer',
                    opacity: exporting || cartList.length === 0 ? 0.6 : 1,
                    boxShadow: '0 4px 12px rgba(0,0,0,0.15)'
                  }}
                >
                  {exporting ? (
                    <>
                      <LoadingSpinner size="sm" />
                      <span>{isRtl ? 'جاري تجهيز وتصدير الملف...' : 'Preparing export...'}</span>
                    </>
                  ) : (
                    <>
                      <Download size={18} />
                      <span>
                        {exportFormat === 'zip'
                          ? (isRtl ? 'تحميل الأرشيف المضغوط الآن (.zip)' : 'Download ZIP Archive Now')
                          : (isRtl ? 'تصدير وتحميل ملف الإكسيل الآن' : 'Download Excel File Now')}
                      </span>
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
