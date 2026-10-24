import React, { useState, useEffect, useCallback } from 'react';
import { Link } from 'react-router-dom';
import { useLanguage } from '../../context/LanguageContext';
import { useToast } from '../../context/ToastContext';
import { companyApi } from '../../api/company.api';
import { jobsApi } from '../../api/jobs.api';
import { useAuth } from '../../context/AuthContext';
import {
  Sparkles,
  Search,
  SlidersHorizontal,
  Download,
  Eye,
  MapPin,
  Briefcase,
  Calendar,
  Phone,
  Mail,
  FileText,
  CheckCircle2,
  Lock,
  ArrowRight,
  ShieldCheck,
  Award
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
            {/* Top Black Accent Bar */}
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

            {/* Black Icon Container */}
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

            {/* VIP Tier Badge */}
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

            {/* Title */}
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

            {/* Description */}
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

            {/* VIP Highlights Grid */}
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

            {/* Action Buttons */}
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
    <div className="py-8 bg-slate-50 min-h-[85vh]" dir={isRtl ? 'rtl' : 'ltr'}>
      <div className="max-w-7xl mx-auto px-4 sm:px-6">
        {/* Header */}
        <div className="flex flex-wrap items-center justify-between gap-4 mb-6">
          <div>
            <div className="flex items-center gap-3">
              <div className="p-2.5 bg-gradient-to-tr from-indigo-500 to-purple-600 text-white rounded-xl shadow-sm">
                <Sparkles className="w-6 h-6" />
              </div>
              <div>
                <div className="flex items-center gap-2">
                  <h1 className="text-2xl font-black text-slate-900">
                    بوابة التصفح الحصرية لقاعدة بيانات المرشحين
                  </h1>
                  <span className="px-3 py-0.5 rounded-full text-xs font-bold bg-indigo-100 text-indigo-800 border border-indigo-200">
                    Platinum VIP
                  </span>
                </div>
                <p className="text-sm text-slate-500 mt-0.5">
                  تصفح شامل ومباشر لجميع الكفاءات • استعراض وتحميل فردي مباشر (Strictly 1 candidate at a time)
                </p>
              </div>
            </div>
          </div>

          <div className="flex items-center gap-2">
            <Link
              to="/company/cart"
              className="px-4 py-2 rounded-xl bg-white border border-slate-200 text-slate-700 text-sm font-semibold hover:bg-slate-50 transition-colors shadow-sm"
            >
              سلة المرشحين
            </Link>
            <Link
              to="/company/search"
              className="px-4 py-2 rounded-xl bg-white border border-slate-200 text-slate-700 text-sm font-semibold hover:bg-slate-50 transition-colors shadow-sm"
            >
              البحث العادي
            </Link>
          </div>
        </div>

        {/* Cairo Entitlements Bar */}
        {entitlements && (
          <div className="bg-gradient-to-r from-indigo-900 to-slate-900 text-white rounded-2xl p-4 sm:p-5 mb-8 shadow-md flex flex-wrap items-center justify-between gap-4">
            <div className="flex items-center gap-4">
              <div className="w-12 h-12 rounded-xl bg-white/10 flex items-center justify-center text-indigo-300">
                <Award className="w-6 h-6" />
              </div>
              <div>
                <div className="text-xs text-indigo-200 font-medium">الباقة المفعلة الحالية</div>
                <div className="text-base font-bold text-white">
                  الباقة البلاتينية • تصفح غير محدود لقاعدة البيانات
                </div>
              </div>
            </div>

            <div className="flex items-center gap-4 text-xs sm:text-sm">
              <div className="bg-white/10 px-3.5 py-1.5 rounded-lg">
                <span className="text-indigo-200">توقيت القاهرة: </span>
                <span className="font-bold text-white">{entitlements.cairoDate || entitlements.quota?.cairoDate}</span>
              </div>
              <div className="text-indigo-200">
                ⚡ تتجدد الحصص اليومية تلقائياً 00:00 بتوقيت القاهرة
              </div>
            </div>
          </div>
        )}

        {/* Filter Toolbar */}
        <div className="bg-white rounded-2xl border border-slate-200 p-5 mb-6 shadow-sm">
          <form onSubmit={handleFilterSubmit} className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
            <div>
              <label className="block text-xs font-bold text-slate-700 mb-1.5">
                التخصص / المسمى الوظيفي
              </label>
              <select
                value={desiredJobId}
                onChange={(e) => setDesiredJobId(e.target.value)}
                className="w-full px-3 py-2 rounded-xl border border-slate-200 text-sm bg-slate-50 focus:outline-none focus:ring-2 focus:ring-indigo-500"
              >
                <option value="">جميع التخصصات والمسميات</option>
                {jobs.map((j) => (
                  <option key={j._id} value={j._id}>
                    {j.title}
                  </option>
                ))}
              </select>
            </div>

            <div>
              <label className="block text-xs font-bold text-slate-700 mb-1.5">المحافظة</label>
              <select
                value={governorate}
                onChange={(e) => setGovernorate(e.target.value)}
                className="w-full px-3 py-2 rounded-xl border border-slate-200 text-sm bg-slate-50 focus:outline-none focus:ring-2 focus:ring-indigo-500"
              >
                <option value="">جميع المحافظات</option>
                {GOVERNORATES.filter(Boolean).map((gov) => (
                  <option key={gov} value={gov}>
                    {gov}
                  </option>
                ))}
              </select>
            </div>

            <div>
              <label className="block text-xs font-bold text-slate-700 mb-1.5">سنوات الخبرة</label>
              <select
                value={expRange}
                onChange={(e) => setExpRange(e.target.value)}
                className="w-full px-3 py-2 rounded-xl border border-slate-200 text-sm bg-slate-50 focus:outline-none focus:ring-2 focus:ring-indigo-500"
              >
                {EXP_RANGES.map((r) => (
                  <option key={r.value} value={r.value}>
                    {r.label}
                  </option>
                ))}
              </select>
            </div>

            <div className="flex items-end gap-2">
              <button
                type="submit"
                className="flex-1 py-2.5 px-4 rounded-xl bg-indigo-600 hover:bg-indigo-700 text-white font-bold text-sm shadow-sm transition-colors flex items-center justify-center gap-1.5"
              >
                <Search className="w-4 h-4" />
                <span>تصفية النتائج</span>
              </button>
              <button
                type="button"
                onClick={() => {
                  setDesiredJobId('');
                  setGovernorate('');
                  setExpRange('');
                  setKeyword('');
                }}
                className="py-2.5 px-3 rounded-xl bg-slate-100 hover:bg-slate-200 text-slate-700 text-xs font-semibold transition-colors"
              >
                إعادة ضبط
              </button>
            </div>
          </form>
        </div>

        {/* Candidate Cards Grid */}
        {loading ? (
          <div className="py-20 flex justify-center">
            <LoadingSpinner />
          </div>
        ) : candidates.length === 0 ? (
          <div className="bg-white rounded-2xl border border-slate-200 p-12 text-center shadow-sm">
            <h3 className="text-lg font-bold text-slate-800 mb-2">لا توجد نتائج مطابقة</h3>
            <p className="text-sm text-slate-500">جرب تغيير خيارات التصفية للوصول لمرشحين أكثر.</p>
          </div>
        ) : (
          <>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 mb-8">
              {candidates.map((c) => (
                <div
                  key={c._id}
                  className="bg-white rounded-2xl border border-slate-200 shadow-sm hover:shadow-md transition-all overflow-hidden flex flex-col justify-between"
                >
                  <div className="p-5">
                    <div className="flex items-start justify-between gap-3 mb-3">
                      <div className="flex items-center gap-3">
                        <div className="w-12 h-12 rounded-full bg-gradient-to-tr from-indigo-100 to-purple-100 text-indigo-700 font-bold text-base flex items-center justify-center">
                          {c.fullName?.charAt(0) || 'م'}
                        </div>
                        <div>
                          <h3 className="font-bold text-slate-900 text-base">{c.fullName}</h3>
                          <div className="text-xs text-indigo-600 font-semibold flex items-center gap-1">
                            <Briefcase className="w-3.5 h-3.5" />
                            <span>
                              {c.primaryJobTitle?.title ||
                                c.desiredJobs?.[0]?.jobId?.title ||
                                'مرشح'}
                            </span>
                          </div>
                        </div>
                      </div>
                    </div>

                    <div className="space-y-1.5 text-xs text-slate-600 mb-4 pt-2 border-t border-slate-100">
                      {c.governorate && (
                        <div className="flex items-center gap-1.5">
                          <MapPin className="w-3.5 h-3.5 text-slate-400" />
                          <span>{c.governorate} {c.area ? `• ${c.area}` : ''}</span>
                        </div>
                      )}
                      <div className="flex items-center gap-1.5">
                        <Calendar className="w-3.5 h-3.5 text-slate-400" />
                        <span>سنوات الخبرة: {c.yearsOfExperience || 0} سنوات</span>
                      </div>
                      {c.careerLevel && (
                        <div className="flex items-center gap-1.5">
                          <Award className="w-3.5 h-3.5 text-slate-400" />
                          <span>المستوى المهني: {c.careerLevel}</span>
                        </div>
                      )}
                    </div>
                  </div>

                  {/* Strictly 1 Candidate Action Buttons */}
                  <div className="p-4 bg-slate-50 border-t border-slate-100 flex items-center gap-2">
                    <button
                      onClick={() => handleViewCandidate(c._id)}
                      className="flex-1 py-2 px-3 rounded-xl bg-white border border-slate-200 hover:border-indigo-400 hover:bg-indigo-50/50 text-slate-800 hover:text-indigo-700 font-semibold text-xs transition-colors flex items-center justify-center gap-1.5"
                    >
                      <Eye className="w-3.5 h-3.5 text-indigo-600" />
                      <span>عرض التفاصيل</span>
                    </button>

                    <button
                      onClick={() => handleDownloadSingleCandidate(c._id, c.fullName)}
                      disabled={downloadingId === c._id}
                      className="py-2 px-3 rounded-xl bg-emerald-600 hover:bg-emerald-700 text-white font-semibold text-xs transition-colors flex items-center justify-center gap-1.5 disabled:opacity-50"
                      title="تحميل ملف إكسيل فردي لهذا المرشح"
                    >
                      {downloadingId === c._id ? (
                        <span className="inline-block w-3.5 h-3.5 border-2 border-white border-t-transparent rounded-full animate-spin" />
                      ) : (
                        <>
                          <Download className="w-3.5 h-3.5" />
                          <span>تحميل Excel</span>
                        </>
                      )}
                    </button>
                  </div>
                </div>
              ))}
            </div>

            {totalPages > 1 && (
              <div className="bg-white rounded-2xl border border-slate-200 p-4 shadow-sm">
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
          <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-sm">
            <div className="w-full max-w-2xl bg-white rounded-3xl shadow-2xl border border-slate-200 overflow-hidden" dir="rtl">
              {detailModal.loading ? (
                <div className="p-16 flex justify-center">
                  <LoadingSpinner />
                </div>
              ) : detailModal.candidate ? (
                <>
                  <div className="p-6 bg-gradient-to-r from-indigo-700 to-purple-800 text-white flex items-center justify-between">
                    <div className="flex items-center gap-3">
                      <div className="w-12 h-12 rounded-full bg-white/20 flex items-center justify-center text-white font-black text-lg">
                        {detailModal.candidate.fullName?.charAt(0) || 'م'}
                      </div>
                      <div>
                        <h2 className="text-xl font-bold">{detailModal.candidate.fullName}</h2>
                        <p className="text-xs text-indigo-200">
                          {detailModal.candidate.primaryJobTitle?.title || 'مرشح'}
                        </p>
                      </div>
                    </div>
                    <button
                      onClick={() => setDetailModal({ open: false, candidate: null, loading: false })}
                      className="text-white/80 hover:text-white p-2 rounded-lg hover:bg-white/10"
                    >
                      ✕
                    </button>
                  </div>

                  <div className="p-6 space-y-4 max-h-[70vh] overflow-y-auto">
                    {/* Contacts */}
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 p-4 bg-slate-50 rounded-xl border border-slate-100 text-sm">
                      <div className="flex items-center gap-2">
                        <Phone className="w-4 h-4 text-emerald-600" />
                        <span className="font-semibold" dir="ltr">
                          {detailModal.candidate.phone || 'غير محدد'}
                        </span>
                      </div>
                      <div className="flex items-center gap-2">
                        <Mail className="w-4 h-4 text-blue-600" />
                        <span>{detailModal.candidate.email || 'غير محدد'}</span>
                      </div>
                      <div className="flex items-center gap-2">
                        <MapPin className="w-4 h-4 text-slate-400" />
                        <span>
                          {detailModal.candidate.governorate} • {detailModal.candidate.area || 'غير محدد'}
                        </span>
                      </div>
                      <div className="flex items-center gap-2">
                        <Calendar className="w-4 h-4 text-slate-400" />
                        <span>الخبرة: {detailModal.candidate.yearsOfExperience || 0} سنوات</span>
                      </div>
                    </div>

                    {/* Desired Titles */}
                    {detailModal.candidate.desiredJobs?.length > 0 && (
                      <div>
                        <h4 className="text-xs font-bold text-slate-500 uppercase mb-2">
                          المسميات الوظيفية والمستويات
                        </h4>
                        <div className="space-y-2">
                          {detailModal.candidate.desiredJobs.map((dj, idx) => (
                            <div
                              key={idx}
                              className="p-3 bg-white border border-slate-200 rounded-xl flex items-center justify-between text-xs"
                            >
                              <span className="font-bold text-slate-800">
                                #{idx + 1} {dj.jobId?.title || dj.customTitle || 'مسمى وظيفي'}
                              </span>
                              <span className="px-2 py-0.5 bg-slate-100 text-slate-700 rounded-md font-medium">
                                {dj.careerLevel || 'غير محدد'}
                              </span>
                            </div>
                          ))}
                        </div>
                      </div>
                    )}

                    {/* Notes / Bio */}
                    {detailModal.candidate.bio && (
                      <div>
                        <h4 className="text-xs font-bold text-slate-500 uppercase mb-1">نبذة عن المرشح</h4>
                        <p className="text-sm text-slate-700 bg-slate-50 p-3 rounded-xl border border-slate-100">
                          {detailModal.candidate.bio}
                        </p>
                      </div>
                    )}
                  </div>

                  <div className="p-4 bg-slate-50 border-t border-slate-100 flex items-center justify-end gap-3">
                    <button
                      onClick={() => setDetailModal({ open: false, candidate: null, loading: false })}
                      className="px-4 py-2 rounded-xl bg-white border border-slate-200 text-slate-700 text-xs font-semibold hover:bg-slate-100"
                    >
                      إغلاق
                    </button>
                    <button
                      onClick={() =>
                        handleDownloadSingleCandidate(
                          detailModal.candidate._id,
                          detailModal.candidate.fullName
                        )
                      }
                      className="px-5 py-2 rounded-xl bg-emerald-600 hover:bg-emerald-700 text-white font-bold text-xs shadow-sm flex items-center gap-1.5"
                    >
                      <Download className="w-3.5 h-3.5" />
                      <span>تحميل Excel فردي</span>
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
