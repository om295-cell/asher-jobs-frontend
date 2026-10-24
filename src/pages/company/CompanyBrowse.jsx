import React, { useState, useEffect, useCallback } from 'react';
import { Link } from 'react-router-dom';
import { useLanguage } from '../../context/LanguageContext';
import { useToast } from '../../context/ToastContext';
import { useAuth } from '../../context/AuthContext';
import { companyApi } from '../../api/company.api';
import { jobsApi } from '../../api/jobs.api';
import {
  Sparkles,
  Search,
  Download,
  Eye,
  MapPin,
  Briefcase,
  Calendar,
  Phone,
  Mail,
  FileSpreadsheet,
  RotateCcw,
  ShoppingCart,
  Award,
  ShieldCheck,
  X,
  FileText
} from 'lucide-react';
import LoadingSpinner from '../../components/ui/LoadingSpinner';
import Pagination from '../../components/ui/Pagination';

const GOVERNORATES = ['', 'الشرقية', 'القاهرة', 'الجيزة', 'الإسكندرية', 'الغربية', 'المنوفية', 'القليوبية', 'الدقهلية', 'كفر الشيخ', 'البحيرة', 'أسيوط'];
const EXP_RANGES = [
  { label: 'الكل', value: '' },
  { label: '0 - 2 سنة', value: '0-2' },
  { label: '3 - 5 سنوات', value: '3-5' },
  { label: '6 - 10 سنوات', value: '6-10' },
  { label: 'أكثر من 10 سنوات', value: '10+' },
];

export default function CompanyBrowse() {
  const { isRtl } = useLanguage();
  const { showToast } = useToast();
  const { profile } = useAuth();

  const [jobs, setJobs] = useState([]);
  const [candidates, setCandidates] = useState([]);
  const [total, setTotal] = useState(0);
  const [page, setPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [loading, setLoading] = useState(true);
  const [entitlements, setEntitlements] = useState(null);
  const [isPlatinum, setIsPlatinum] = useState(() => profile?.subscriptionPlan === 'Platinum');

  // Single candidate detail modal state
  const [detailModal, setDetailModal] = useState({ open: false, candidate: null, loading: false });
  const [downloadingId, setDownloadingId] = useState(null);

  // Filters
  const [desiredJobId, setDesiredJobId] = useState('');
  const [governorate, setGovernorate] = useState('');
  const [expRange, setExpRange] = useState('');
  const [keyword, setKeyword] = useState('');

  const isPlatinumEligible = (ent, prof) => {
    return Boolean(
      prof?.subscriptionPlan === 'Platinum' ||
      ent?.planLimits?.platinumBrowseEnabled ||
      ent?.limits?.platinumBrowseEnabled ||
      ent?.company?.subscriptionPlan === 'Platinum' ||
      ent?.plan === 'Platinum'
    );
  };

  // Initial load
  useEffect(() => {
    if (profile?.subscriptionPlan === 'Platinum') {
      setIsPlatinum(true);
    }
    jobsApi.getJobs().then((res) => setJobs(res.data?.data || [])).catch(() => {});
    companyApi
      .getEntitlements()
      .then((res) => {
        const ent = res.data?.data;
        setEntitlements(ent);
        if (isPlatinumEligible(ent, profile)) {
          setIsPlatinum(true);
        }
      })
      .catch(() => {});
  }, [profile]);

  const fetchBrowseResults = useCallback(
    async (currentPage = 1) => {
      setLoading(true);
      try {
        const params = { page: currentPage, limit: 12 };
        if (desiredJobId) params.desiredJobId = desiredJobId;
        if (governorate) params.governorate = governorate;
        if (keyword) params.keyword = keyword;
        if (expRange) {
          const parts = expRange.split('-');
          if (parts.length === 2) {
            params.minExp = parts[0];
            params.maxExp = parts[1];
          } else if (expRange === '10+') {
            params.minExp = 10;
          }
        }

        const res = await companyApi.browsePlatinumCandidates(params);
        setCandidates(res.data?.data || []);
        setTotal(res.data?.pagination?.total || 0);
        setTotalPages(res.data?.pagination?.totalPages || 1);
        setPage(currentPage);
        setIsPlatinum(true);
      } catch (err) {
        if (err.response?.status === 403 && err.response?.data?.code === 'PLATINUM_REQUIRED') {
          setIsPlatinum(false);
        } else {
          showToast(err.response?.data?.message || 'فشل تحميل بيانات التصفح', 'error');
        }
      } finally {
        setLoading(false);
      }
    },
    [desiredJobId, governorate, expRange, keyword, showToast]
  );

  useEffect(() => {
    fetchBrowseResults(1);
  }, [fetchBrowseResults]);

  const handleFilterSubmit = (e) => {
    e.preventDefault();
    fetchBrowseResults(1);
  };

  // Strictly 1 Candidate View
  const handleViewCandidate = async (candidateId) => {
    setDetailModal({ open: true, candidate: null, loading: true });
    try {
      const res = await companyApi.getPlatinumCandidate(candidateId);
      setDetailModal({ open: true, candidate: res.data?.data, loading: false });
    } catch (err) {
      showToast(err.response?.data?.message || 'فشل عرض بيانات المرشح', 'error');
      setDetailModal({ open: false, candidate: null, loading: false });
    }
  };

  // Strictly 1 Candidate Download
  const handleDownloadSingleCandidate = async (candidateId, candidateName) => {
    setDownloadingId(candidateId);
    try {
      const res = await companyApi.downloadPlatinumCandidate(candidateId);
      const blob = new Blob([res.data], {
        type: 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet'
      });
      const url = URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url;
      a.download = `platinum_candidate_${candidateName || candidateId}.xlsx`;
      a.click();
      URL.revokeObjectURL(url);
      showToast('تم تحميل ملف بيانات المرشح بنجاح!', 'success');
    } catch (err) {
      let errMsg = 'فشل تحميل المرشح';
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
      setDownloadingId(null);
    }
  };

  // Locked Banner for non-Platinum users
  if (!isPlatinum && !loading) {
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
        <div style={{ maxWidth: 680, width: '100%', margin: '0 auto' }}>
          <div
            style={{
              background: '#ffffff',
              borderRadius: '16px',
              border: '1.5px solid #000000',
              boxShadow: '0 10px 30px rgba(0, 0, 0, 0.06)',
              padding: 'clamp(2rem, 5vw, 3rem)',
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
              <Sparkles size={34} color="#ffffff" />
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
                <Award size={14} color="#000000" />
                <span>{isRtl ? 'بوابة VIP الحصرية لمشتركي البلاتينيوم' : 'Exclusive Platinum VIP Portal'}</span>
              </span>
            </div>

            <h1
              style={{
                fontSize: 'clamp(1.35rem, 3vw, 1.85rem)',
                fontWeight: 800,
                color: '#000000',
                marginBottom: '0.85rem',
                lineHeight: 1.3
              }}
            >
              {isRtl ? 'بوابة تصفح قاعدة البيانات المباشرة (Platinum Portal)' : 'Direct Database Browse Portal (Platinum Portal)'}
            </h1>

            <p
              style={{
                color: '#3f3f46',
                fontSize: '0.975rem',
                lineHeight: 1.7,
                marginBottom: '1.75rem',
                maxWidth: 560,
                marginLeft: 'auto',
                marginRight: 'auto'
              }}
            >
              {isRtl ? (
                <>
                  هذه البوابة تقدم تجربة تصفح غير محدودة لقاعدة بيانات المرشحين بالكامل، مع إمكانية استعراض وتحميل المرشحين فرادى بضغطة زر واحدة. الميزة متاحة حصرياً لمشتركي{' '}
                  <strong style={{ color: '#000000', fontWeight: 800 }}>الباقة البلاتينية (Platinum)</strong>.
                </>
              ) : (
                <>
                  This portal provides an unlimited direct browsing experience across the candidate database with 1-click single profile downloads. Available exclusively to{' '}
                  <strong style={{ color: '#000000', fontWeight: 800 }}>Platinum</strong> subscribers.
                </>
              )}
            </p>

            <div
              style={{
                display: 'grid',
                gridTemplateColumns: 'repeat(auto-fit, minmax(180px, 1fr))',
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
                  <Eye size={16} color="#000000" />
                  <span style={{ fontSize: '0.85rem', fontWeight: 700, color: '#000000' }}>
                    {isRtl ? 'تصفح حي مباشر' : 'Live Direct Browsing'}
                  </span>
                </div>
                <div style={{ fontSize: '0.75rem', color: '#52525b', lineHeight: 1.4 }}>
                  {isRtl ? 'استعراض المرشحين وتفاصيل الخبرات والأرقام فوراً' : 'Full access to verified candidate pool in 10th of Ramadan'}
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
                  <Download size={16} color="#000000" />
                  <span style={{ fontSize: '0.85rem', fontWeight: 700, color: '#000000' }}>
                    {isRtl ? 'تحميل فوري بضغطة زر' : '1-Click Profile Download'}
                  </span>
                </div>
                <div style={{ fontSize: '0.75rem', color: '#52525b', lineHeight: 1.4 }}>
                  {isRtl ? 'تنزيل السير الذاتية الفردية بسرعة وكفاءة' : 'Download candidate contacts and CVs instantly'}
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
                  <ShieldCheck size={16} color="#000000" />
                  <span style={{ fontSize: '0.85rem', fontWeight: 700, color: '#000000' }}>
                    {isRtl ? 'أولوية ودعم VIP' : 'VIP Priority & Limits'}
                  </span>
                </div>
                <div style={{ fontSize: '0.75rem', color: '#52525b', lineHeight: 1.4 }}>
                  {isRtl ? 'أعلى سعة تحميل يومية واستجابة استثنائية' : 'Maximum daily quotas and specialized employer support'}
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
                <Sparkles size={18} color="#ffffff" />
                <span>{isRtl ? 'الترقية إلى الباقة البلاتينية' : 'Upgrade to Platinum'}</span>
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
                <span>{isRtl ? 'العودة إلى البحث العادي' : 'Back to Standard Search'}</span>
              </Link>
            </div>
          </div>
        </div>
      </div>
    );
  }

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
        {/* Page Top Header */}
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
                <Sparkles size={20} />
              </div>
              <h1 style={{ fontSize: 'clamp(1.35rem, 3vw, 1.75rem)', fontWeight: 850, margin: 0, color: 'var(--slate-900)' }}>
                {isRtl ? 'بوابة التصفح الحصرية لقاعدة بيانات المرشحين' : 'Exclusive Candidate Database Browsing'}
              </h1>
              <span
                style={{
                  fontSize: '0.72rem',
                  fontWeight: 800,
                  padding: '0.2rem 0.6rem',
                  borderRadius: '999px',
                  background: '#000000',
                  color: '#ffffff'
                }}
              >
                Platinum VIP
              </span>
            </div>
            <p style={{ margin: 0, fontSize: '0.875rem', color: 'var(--slate-600)', lineHeight: 1.5 }}>
              {isRtl
                ? 'تصفح شامل ومباشر لجميع الكفاءات • استعراض وتحميل فردي مباشر (Strictly 1 candidate at a time)'
                : 'Direct pool exploration • 1-by-1 detailed inspection & single Excel download'}
            </p>
          </div>

          {/* Quick Links Header */}
          <div style={{ display: 'flex', gap: '0.6rem', flexWrap: 'wrap' }}>
            <Link
              to="/company/cart"
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
              <ShoppingCart size={16} />
              <span>{isRtl ? 'سلة المرشحين' : 'Candidate Cart'}</span>
            </Link>
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
              <span>{isRtl ? 'البحث العادي' : 'Standard Search'}</span>
            </Link>
          </div>
        </div>

        {/* Cairo Entitlements Bar */}
        {entitlements && (
          <div
            style={{
              background: '#000000',
              color: '#ffffff',
              borderRadius: '12px',
              padding: '1rem 1.25rem',
              marginBottom: '1.5rem',
              display: 'flex',
              flexWrap: 'wrap',
              justifyContent: 'space-between',
              alignItems: 'center',
              gap: '1rem',
              boxShadow: 'var(--shadow-md)'
            }}
          >
            <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem' }}>
              <div
                style={{
                  width: 40,
                  height: 40,
                  borderRadius: '8px',
                  background: 'rgba(255,255,255,0.15)',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  color: '#ffffff'
                }}
              >
                <Award size={22} />
              </div>
              <div>
                <div style={{ fontSize: '0.72rem', color: '#a1a1aa', fontWeight: 600 }}>
                  {isRtl ? 'الباقة المفعلة الحالية' : 'Active Subscription'}
                </div>
                <div style={{ fontSize: '0.95rem', fontWeight: 800, color: '#ffffff' }}>
                  {isRtl
                    ? 'الباقة البلاتينية • تصفح غير محدود لقاعدة البيانات'
                    : 'Platinum Tier • Unlimited Database Browsing'}
                </div>
              </div>
            </div>

            <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem', flexWrap: 'wrap', fontSize: '0.8125rem' }}>
              <div
                style={{
                  background: 'rgba(255,255,255,0.1)',
                  padding: '0.35rem 0.75rem',
                  borderRadius: '6px',
                  border: '1px solid rgba(255,255,255,0.15)',
                  fontWeight: 600
                }}
              >
                <span style={{ color: '#d4d4d8' }}>{isRtl ? 'توقيت القاهرة: ' : 'Cairo Time: '}</span>
                <span style={{ color: '#ffffff', fontWeight: 800 }}>
                  {entitlements.cairoDate || entitlements.quota?.cairoDate || '2026-10-24'}
                </span>
              </div>
              <div style={{ color: '#d4d4d8', fontSize: '0.78rem' }}>
                {isRtl
                  ? '⚡ تتجدد الحصص اليومية تلقائياً 00:00 بتوقيت القاهرة'
                  : '⚡ Quotas renew automatically at 00:00 Cairo time'}
              </div>
            </div>
          </div>
        )}

        {/* Filter Toolbar Card */}
        <div
          className="card"
          style={{
            padding: '1.25rem',
            borderRadius: '12px',
            marginBottom: '1.75rem',
            border: '1px solid var(--border)',
            boxShadow: 'var(--shadow-sm)'
          }}
        >
          <form
            onSubmit={handleFilterSubmit}
            style={{
              display: 'grid',
              gridTemplateColumns: 'repeat(auto-fit, minmax(min(100%, 220px), 1fr))',
              gap: '1rem',
              alignItems: 'flex-end'
            }}
          >
            {/* Job Title Dropdown */}
            <div className="form-group" style={{ margin: 0 }}>
              <label className="form-label" style={{ fontSize: '0.8125rem', fontWeight: 700, marginBottom: '0.35rem' }}>
                {isRtl ? 'التخصص / المسمى الوظيفي' : 'Job Title / Specialization'}
              </label>
              <select
                className="form-control"
                value={desiredJobId}
                onChange={(e) => setDesiredJobId(e.target.value)}
                style={{ fontSize: '0.875rem' }}
              >
                <option value="">{isRtl ? 'جميع التخصصات والمسميات' : 'All Job Titles'}</option>
                {jobs.map((j) => (
                  <option key={j._id} value={j._id}>
                    {j.title || (isRtl ? j.nameAr || j.name : j.name || j.nameAr)}
                  </option>
                ))}
              </select>
            </div>

            {/* Governorate Dropdown */}
            <div className="form-group" style={{ margin: 0 }}>
              <label className="form-label" style={{ fontSize: '0.8125rem', fontWeight: 700, marginBottom: '0.35rem' }}>
                {isRtl ? 'المحافظة' : 'Governorate'}
              </label>
              <select
                className="form-control"
                value={governorate}
                onChange={(e) => setGovernorate(e.target.value)}
                style={{ fontSize: '0.875rem' }}
              >
                <option value="">{isRtl ? 'جميع المحافظات' : 'All Governorates'}</option>
                {GOVERNORATES.filter(Boolean).map((gov) => (
                  <option key={gov} value={gov}>
                    {gov}
                  </option>
                ))}
              </select>
            </div>

            {/* Experience Dropdown */}
            <div className="form-group" style={{ margin: 0 }}>
              <label className="form-label" style={{ fontSize: '0.8125rem', fontWeight: 700, marginBottom: '0.35rem' }}>
                {isRtl ? 'سنوات الخبرة' : 'Years of Experience'}
              </label>
              <select
                className="form-control"
                value={expRange}
                onChange={(e) => setExpRange(e.target.value)}
                style={{ fontSize: '0.875rem' }}
              >
                {EXP_RANGES.map((r) => (
                  <option key={r.value} value={r.value}>
                    {r.label}
                  </option>
                ))}
              </select>
            </div>

            {/* Submit & Reset Buttons */}
            <div style={{ display: 'flex', gap: '0.5rem', width: '100%' }}>
              <button
                type="submit"
                className="btn btn-primary"
                style={{
                  flex: 1,
                  display: 'inline-flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  gap: '0.45rem',
                  fontWeight: 700,
                  fontSize: '0.875rem',
                  padding: '0.625rem 1rem'
                }}
              >
                <Search size={16} />
                <span>{isRtl ? 'تصفية النتائج' : 'Filter'}</span>
              </button>
              <button
                type="button"
                onClick={() => {
                  setDesiredJobId('');
                  setGovernorate('');
                  setExpRange('');
                  setKeyword('');
                }}
                className="btn btn-outline"
                style={{
                  display: 'inline-flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  padding: '0.625rem 0.85rem',
                  fontSize: '0.8125rem',
                  fontWeight: 600
                }}
                title={isRtl ? 'إعادة ضبط الخيارات' : 'Reset filters'}
              >
                <RotateCcw size={15} />
                <span style={{ marginInlineStart: '0.25rem' }}>{isRtl ? 'إعادة ضبط' : 'Reset'}</span>
              </button>
            </div>
          </form>
        </div>

        {/* Candidate Cards Grid */}
        {loading ? (
          <div style={{ padding: '5rem 0', display: 'flex', justifyContent: 'center' }}>
            <LoadingSpinner />
          </div>
        ) : candidates.length === 0 ? (
          <div
            className="card"
            style={{
              padding: '3.5rem 1.5rem',
              textAlign: 'center',
              borderRadius: '12px',
              border: '1px solid var(--border)'
            }}
          >
            <h3 style={{ fontSize: '1.15rem', fontWeight: 800, color: 'var(--slate-900)', marginBottom: '0.5rem' }}>
              {isRtl ? 'لا توجد نتائج مطابقة' : 'No Candidates Found'}
            </h3>
            <p style={{ margin: 0, fontSize: '0.875rem', color: 'var(--slate-500)' }}>
              {isRtl
                ? 'جرب تعديل خيارات التصفية للوصول لمرشحين أكثر في قاعدة البيانات.'
                : 'Try adjusting your filters to find more candidates.'}
            </p>
          </div>
        ) : (
          <>
            <div
              style={{
                display: 'grid',
                gridTemplateColumns: 'repeat(auto-fill, minmax(min(100%, 330px), 1fr))',
                gap: '1.25rem',
                marginBottom: '2rem'
              }}
            >
              {candidates.map((c) => {
                const initial = (c.fullName || 'م').trim().charAt(0);
                const jobTitleText =
                  c.primaryJobTitle?.title ||
                  c.desiredJobs?.[0]?.jobId?.title ||
                  (isRtl ? 'مرشح' : 'Candidate');

                return (
                  <div
                    key={c._id}
                    className="card"
                    style={{
                      padding: 0,
                      borderRadius: '12px',
                      border: '1px solid var(--border)',
                      display: 'flex',
                      flexDirection: 'column',
                      justifyContent: 'space-between',
                      overflow: 'hidden',
                      boxShadow: 'var(--shadow-sm)',
                      transition: 'transform 0.15s ease, box-shadow 0.15s ease'
                    }}
                  >
                    {/* Card Body */}
                    <div style={{ padding: '1.25rem' }}>
                      {/* Avatar & Header */}
                      <div style={{ display: 'flex', alignItems: 'center', gap: '0.85rem', marginBottom: '1rem' }}>
                        <div
                          style={{
                            width: 48,
                            height: 48,
                            borderRadius: '50%',
                            background: '#000000',
                            color: '#ffffff',
                            fontWeight: 800,
                            fontSize: '1.15rem',
                            display: 'flex',
                            alignItems: 'center',
                            justifyContent: 'center',
                            flexShrink: 0
                          }}
                        >
                          {initial}
                        </div>
                        <div style={{ flex: 1, minWidth: 0 }}>
                          <h3
                            style={{
                              margin: '0 0 0.25rem',
                              fontSize: '1rem',
                              fontWeight: 800,
                              color: 'var(--slate-900)',
                              whiteSpace: 'nowrap',
                              overflow: 'hidden',
                              textOverflow: 'ellipsis'
                            }}
                          >
                            {c.fullName}
                          </h3>
                          <div
                            style={{
                              display: 'inline-flex',
                              alignItems: 'center',
                              gap: '0.35rem',
                              background: 'var(--slate-100)',
                              color: '#000000',
                              padding: '0.15rem 0.55rem',
                              borderRadius: '4px',
                              fontSize: '0.75rem',
                              fontWeight: 700,
                              maxWidth: '100%',
                              overflow: 'hidden',
                              textOverflow: 'ellipsis',
                              whiteSpace: 'nowrap'
                            }}
                          >
                            <Briefcase size={12} />
                            <span style={{ overflow: 'hidden', textOverflow: 'ellipsis' }}>{jobTitleText}</span>
                          </div>
                        </div>
                      </div>

                      {/* Candidate Meta Info */}
                      <div
                        style={{
                          display: 'flex',
                          flexDirection: 'column',
                          gap: '0.45rem',
                          fontSize: '0.8125rem',
                          color: 'var(--slate-700)',
                          paddingTop: '0.75rem',
                          borderTop: '1px solid var(--border)'
                        }}
                      >
                        {(c.governorate || c.area) && (
                          <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                            <MapPin size={14} style={{ color: 'var(--slate-400)', flexShrink: 0 }} />
                            <span>
                              {c.governorate || 'الشرقية'} {c.area ? `• ${c.area}` : ''}
                            </span>
                          </div>
                        )}
                        <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                          <Calendar size={14} style={{ color: 'var(--slate-400)', flexShrink: 0 }} />
                          <span>
                            {isRtl ? 'سنوات الخبرة: ' : 'Experience: '}
                            <strong style={{ color: '#000000' }}>
                              {c.yearsOfExperience || 0} {isRtl ? 'سنوات' : 'years'}
                            </strong>
                          </span>
                        </div>
                        {c.careerLevel && (
                          <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                            <Award size={14} style={{ color: 'var(--slate-400)', flexShrink: 0 }} />
                            <span>
                              {isRtl ? 'المستوى المهني: ' : 'Career Level: '}
                              <strong>{c.careerLevel}</strong>
                            </span>
                          </div>
                        )}
                      </div>
                    </div>

                    {/* Card Actions Footer */}
                    <div
                      style={{
                        padding: '0.85rem 1.25rem',
                        background: 'var(--slate-50)',
                        borderTop: '1px solid var(--border)',
                        display: 'flex',
                        alignItems: 'center',
                        gap: '0.65rem'
                      }}
                    >
                      <button
                        type="button"
                        onClick={() => handleViewCandidate(c._id)}
                        className="btn btn-outline btn-sm"
                        style={{
                          flex: 1,
                          display: 'inline-flex',
                          alignItems: 'center',
                          justifyContent: 'center',
                          gap: '0.4rem',
                          fontWeight: 700,
                          fontSize: '0.8125rem',
                          padding: '0.5rem 0.75rem',
                          borderRadius: '6px'
                        }}
                      >
                        <Eye size={15} />
                        <span>{isRtl ? 'عرض التفاصيل' : 'View Details'}</span>
                      </button>

                      <button
                        type="button"
                        onClick={() => handleDownloadSingleCandidate(c._id, c.fullName)}
                        disabled={downloadingId === c._id}
                        className="btn btn-primary btn-sm"
                        style={{
                          display: 'inline-flex',
                          alignItems: 'center',
                          justifyContent: 'center',
                          gap: '0.4rem',
                          fontWeight: 700,
                          fontSize: '0.8125rem',
                          padding: '0.5rem 0.85rem',
                          borderRadius: '6px'
                        }}
                        title={isRtl ? 'تحميل ملف Excel فردي لهذا المرشح' : 'Download single candidate Excel'}
                      >
                        {downloadingId === c._id ? (
                          <LoadingSpinner size="sm" />
                        ) : (
                          <>
                            <FileSpreadsheet size={15} />
                            <span>{isRtl ? 'تحميل Excel' : 'Excel'}</span>
                          </>
                        )}
                      </button>
                    </div>
                  </div>
                );
              })}
            </div>

            {/* Pagination */}
            {totalPages > 1 && (
              <div
                style={{
                  display: 'flex',
                  justifyContent: 'center',
                  marginTop: '1.5rem',
                  padding: '1rem',
                  background: '#ffffff',
                  borderRadius: '12px',
                  border: '1px solid var(--border)'
                }}
              >
                <Pagination
                  currentPage={page}
                  totalPages={totalPages}
                  onPageChange={(p) => fetchBrowseResults(p)}
                />
              </div>
            )}
          </>
        )}

        {/* Single Candidate Detail Modal */}
        {detailModal.open && (
          <div
            style={{
              position: 'fixed',
              inset: 0,
              background: 'rgba(0, 0, 0, 0.65)',
              backdropFilter: 'blur(3px)',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              zIndex: 1000,
              padding: '1rem'
            }}
            onClick={() => setDetailModal({ open: false, candidate: null, loading: false })}
          >
            <div
              style={{
                width: '100%',
                maxWidth: 640,
                background: '#ffffff',
                borderRadius: '16px',
                border: '1.5px solid #000000',
                boxShadow: '0 20px 40px rgba(0, 0, 0, 0.25)',
                overflow: 'hidden',
                maxHeight: '90vh',
                display: 'flex',
                flexDirection: 'column'
              }}
              dir={isRtl ? 'rtl' : 'ltr'}
              onClick={(e) => e.stopPropagation()}
            >
              {detailModal.loading ? (
                <div style={{ padding: '4rem 0', display: 'flex', justifyContent: 'center' }}>
                  <LoadingSpinner />
                </div>
              ) : detailModal.candidate ? (
                <>
                  {/* Modal Header */}
                  <div
                    style={{
                      padding: '1.25rem 1.5rem',
                      background: '#000000',
                      color: '#ffffff',
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'space-between',
                      borderBottom: '1px solid #000000'
                    }}
                  >
                    <div style={{ display: 'flex', alignItems: 'center', gap: '0.85rem' }}>
                      <div
                        style={{
                          width: 44,
                          height: 44,
                          borderRadius: '50%',
                          background: '#ffffff',
                          color: '#000000',
                          fontWeight: 900,
                          fontSize: '1.2rem',
                          display: 'flex',
                          alignItems: 'center',
                          justifyContent: 'center'
                        }}
                      >
                        {detailModal.candidate.fullName?.charAt(0) || 'م'}
                      </div>
                      <div>
                        <h2 style={{ margin: 0, fontSize: '1.15rem', fontWeight: 800, color: '#ffffff' }}>
                          {detailModal.candidate.fullName}
                        </h2>
                        <div style={{ fontSize: '0.78rem', color: '#a1a1aa', marginTop: '0.15rem' }}>
                          {detailModal.candidate.primaryJobTitle?.title || (isRtl ? 'مرشح معتمد' : 'Verified Candidate')}
                        </div>
                      </div>
                    </div>

                    <button
                      type="button"
                      onClick={() => setDetailModal({ open: false, candidate: null, loading: false })}
                      style={{
                        background: 'none',
                        border: 'none',
                        color: '#ffffff',
                        cursor: 'pointer',
                        padding: '0.35rem',
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'center'
                      }}
                    >
                      <X size={20} />
                    </button>
                  </div>

                  {/* Modal Body */}
                  <div
                    style={{
                      padding: '1.5rem',
                      overflowY: 'auto',
                      display: 'flex',
                      flexDirection: 'column',
                      gap: '1.25rem'
                    }}
                  >
                    {/* Contact & Meta Grid */}
                    <div
                      style={{
                        display: 'grid',
                        gridTemplateColumns: 'repeat(auto-fit, minmax(220px, 1fr))',
                        gap: '0.85rem',
                        padding: '1rem',
                        background: 'var(--slate-100)',
                        borderRadius: '10px',
                        border: '1px solid var(--border)',
                        fontSize: '0.875rem'
                      }}
                    >
                      <div style={{ display: 'flex', alignItems: 'center', gap: '0.65rem' }}>
                        <Phone size={16} style={{ color: '#000000' }} />
                        <span style={{ fontWeight: 700 }} dir="ltr">
                          {detailModal.candidate.phone || '—'}
                        </span>
                      </div>

                      <div style={{ display: 'flex', alignItems: 'center', gap: '0.65rem' }}>
                        <Mail size={16} style={{ color: '#000000' }} />
                        <span style={{ wordBreak: 'break-all' }}>
                          {detailModal.candidate.email || '—'}
                        </span>
                      </div>

                      <div style={{ display: 'flex', alignItems: 'center', gap: '0.65rem' }}>
                        <MapPin size={16} style={{ color: '#000000' }} />
                        <span>
                          {detailModal.candidate.governorate || 'الشرقية'} • {detailModal.candidate.area || 'العاشر من رمضان'}
                        </span>
                      </div>

                      <div style={{ display: 'flex', alignItems: 'center', gap: '0.65rem' }}>
                        <Calendar size={16} style={{ color: '#000000' }} />
                        <span>
                          {isRtl ? 'سنوات الخبرة: ' : 'Experience: '}
                          <strong>{detailModal.candidate.yearsOfExperience || 0} {isRtl ? 'سنوات' : 'years'}</strong>
                        </span>
                      </div>
                    </div>

                    {/* Desired Titles */}
                    {detailModal.candidate.desiredJobs?.length > 0 && (
                      <div>
                        <h4 style={{ fontSize: '0.8125rem', fontWeight: 800, color: 'var(--slate-800)', marginBottom: '0.5rem' }}>
                          {isRtl ? 'المسميات الوظيفية والمستويات المهنية' : 'Desired Job Titles & Levels'}
                        </h4>
                        <div style={{ display: 'flex', flexDirection: 'column', gap: '0.4rem' }}>
                          {detailModal.candidate.desiredJobs.map((dj, idx) => (
                            <div
                              key={idx}
                              style={{
                                padding: '0.65rem 0.85rem',
                                background: '#ffffff',
                                border: '1px solid var(--border)',
                                borderRadius: '8px',
                                display: 'flex',
                                justifyContent: 'space-between',
                                alignItems: 'center',
                                fontSize: '0.8125rem'
                              }}
                            >
                              <span style={{ fontWeight: 700, color: 'var(--slate-900)' }}>
                                #{idx + 1} {dj.jobId?.title || dj.customTitle || (isRtl ? 'مسمى وظيفي' : 'Job Title')}
                              </span>
                              <span
                                style={{
                                  padding: '0.15rem 0.5rem',
                                  background: 'var(--slate-100)',
                                  borderRadius: '4px',
                                  fontSize: '0.75rem',
                                  fontWeight: 600
                                }}
                              >
                                {dj.careerLevel || '—'}
                              </span>
                            </div>
                          ))}
                        </div>
                      </div>
                    )}

                    {/* Bio / Summary */}
                    {detailModal.candidate.bio && (
                      <div>
                        <h4 style={{ fontSize: '0.8125rem', fontWeight: 800, color: 'var(--slate-800)', marginBottom: '0.35rem' }}>
                          {isRtl ? 'نبذة عن المرشح' : 'Bio / Summary'}
                        </h4>
                        <p
                          style={{
                            margin: 0,
                            padding: '0.85rem',
                            background: 'var(--slate-100)',
                            borderRadius: '8px',
                            fontSize: '0.875rem',
                            color: 'var(--slate-700)',
                            lineHeight: 1.6
                          }}
                        >
                          {detailModal.candidate.bio}
                        </p>
                      </div>
                    )}
                  </div>

                  {/* Modal Footer */}
                  <div
                    style={{
                      padding: '1rem 1.5rem',
                      background: 'var(--slate-50)',
                      borderTop: '1px solid var(--border)',
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'flex-end',
                      gap: '0.75rem'
                    }}
                  >
                    <button
                      type="button"
                      onClick={() => setDetailModal({ open: false, candidate: null, loading: false })}
                      className="btn btn-outline"
                      style={{ fontSize: '0.85rem', fontWeight: 700, padding: '0.5rem 1rem' }}
                    >
                      {isRtl ? 'إغلاق' : 'Close'}
                    </button>
                    <button
                      type="button"
                      onClick={() =>
                        handleDownloadSingleCandidate(
                          detailModal.candidate._id,
                          detailModal.candidate.fullName
                        )
                      }
                      className="btn btn-primary"
                      style={{
                        display: 'inline-flex',
                        alignItems: 'center',
                        gap: '0.45rem',
                        fontSize: '0.85rem',
                        fontWeight: 700,
                        padding: '0.5rem 1.25rem'
                      }}
                    >
                      <FileSpreadsheet size={16} />
                      <span>{isRtl ? 'تحميل Excel فردي' : 'Download Excel'}</span>
                    </button>
                  </div>
                </>
              ) : null}
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
