import React, { useState, useEffect, useMemo, useRef } from 'react';
import { useLocation, useNavigate } from 'react-router-dom';
import {
  Users,
  UserCheck,
  ShieldAlert,
  AlertTriangle,
  CheckCircle2,
  Clock,
  Search,
  Copy,
  Check,
  ArrowRight,
  Briefcase,
  Phone,
  FileCheck,
  ChevronDown,
  Info,
  XCircle,
  ExternalLink
} from 'lucide-react';
import { useLanguage } from '../../context/LanguageContext';
import { useToast } from '../../context/ToastContext';
import { jobsApi } from '../../api/jobs.api';
import { recommendationApi } from '../../api/recommendation.api';
import LoadingSpinner from '../../components/ui/LoadingSpinner';

const CAREER_LEVELS = [
  'مبتدئ (1-3 سنوات)',
  'متوسط (3-5 سنوات)',
  'متقدم (5-7 سنوات)',
  'صاحب خبره كبيره (أكثر من 7 سنوات)'
];

// Name regex: Letters and spaces only, at least one space
const NAME_REGEX = /^[a-zA-Z\u0600-\u06FF]+(?:\s+[a-zA-Z\u0600-\u06FF]+)+$/;

// Egyptian Mobile: 11 digits starting with 010, 011, 012, or 015
const PHONE_REGEX = /^01[0125][0-9]{8}$/;

function createInitialPeople() {
  return Array.from({ length: 11 }).map((_, index) => ({
    index,
    isPrimary: index === 0,
    fullName: '',
    phone: '',
    jobId: '',
    jobTitle: '',
    careerLevel: '',
    // Validation state
    nameError: '',
    phoneError: '',
    jobError: '',
    levelError: '',
    phoneChecking: false,
    phoneExists: false
  }));
}

// Smart Searchable Job Dropdown Component
function SearchableJobSelect({ jobs, selectedJobId, onSelect, error, isRtl }) {
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
          border: error ? '1.5px solid #ef4444' : '1px solid #d4d4d8',
          background: '#ffffff',
          color: selectedJob ? '#09090b' : '#a1a1aa',
          fontSize: '0.9rem',
          fontWeight: selectedJob ? 600 : 400,
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
            : (isRtl ? 'اختر التخصص والمهنة (بحث ذكي)...' : 'Select job title (smart search)...')}
        </span>
        <ChevronDown size={16} style={{ color: '#71717a', flexShrink: 0, marginLeft: 8 }} />
      </button>

      {open && (
        <div
          style={{
            position: 'absolute',
            top: 'calc(100% + 4px)',
            left: 0,
            right: 0,
            zIndex: 50,
            background: '#ffffff',
            border: '1px solid #e4e4e7',
            borderRadius: '10px',
            boxShadow: '0 10px 25px -5px rgba(0, 0, 0, 0.1), 0 8px 10px -6px rgba(0, 0, 0, 0.1)',
            padding: '0.5rem',
            maxHeight: '260px',
            display: 'flex',
            flexDirection: 'column'
          }}
        >
          <div style={{ position: 'relative', marginBottom: '0.5rem' }}>
            <Search
              size={15}
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
              placeholder={isRtl ? 'ابحث عن مهنة (مثال: كهرباء، محاسب، إنتاج)...' : 'Search job title...'}
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
              <div style={{ padding: '1rem', textAlign: 'center', color: '#a1a1aa', fontSize: '0.85rem' }}>
                {isRtl ? 'لا توجد مهن مطابقة لبحثك' : 'No matching jobs found'}
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
                    fontSize: '0.875rem',
                    color: String(j._id) === String(selectedJobId) ? '#000000' : '#27272a',
                    fontWeight: String(j._id) === String(selectedJobId) ? 700 : 500,
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
                        fontSize: '0.75rem',
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

export default function RecommendationPage() {
  const { isRtl } = useLanguage();
  const { showToast } = useToast();
  const location = useLocation();
  const navigate = useNavigate();

  // Tab: 'form' or 'track'
  const [activeTab, setActiveTab] = useState('form');

  // Available jobs for dropdown
  const [jobs, setJobs] = useState([]);
  const [jobsLoading, setJobsLoading] = useState(true);

  // Form state (11 persons)
  const [people, setPeople] = useState(createInitialPeople);
  const [legalAccepted, setLegalAccepted] = useState(false);
  const [submitting, setSubmitting] = useState(false);
  const [submittedData, setSubmittedData] = useState(null);
  const [copied, setCopied] = useState(false);

  // Tracking state
  const [trackReqNumber, setTrackReqNumber] = useState('');
  const [trackPhone, setTrackPhone] = useState('');
  const [trackLoading, setTrackLoading] = useState(false);
  const [trackResult, setTrackResult] = useState(null);
  const [trackError, setTrackError] = useState('');

  // Fetch jobs on mount
  useEffect(() => {
    jobsApi
      .getJobs()
      .then((res) => {
        if (res.data?.data) {
          setJobs(res.data.data);
        }
      })
      .catch(() => {})
      .finally(() => setJobsLoading(false));
  }, []);

  // Check URL params for pre-filling tracking (e.g. /recommend?req=REC-123456)
  useEffect(() => {
    const params = new URLSearchParams(location.search);
    const req = params.get('req');
    if (req) {
      setTrackReqNumber(req);
      setActiveTab('track');
    }
  }, [location.search]);

  // Handle single field change
  const handleFieldChange = (index, field, value) => {
    setPeople((prev) => {
      const updated = [...prev];
      const person = { ...updated[index], [field]: value };

      // Reset specific errors on change
      if (field === 'fullName') {
        person.nameError = '';
      }
      if (field === 'phone') {
        // Enforce digits only
        const digits = value.replace(/\D/g, '').slice(0, 11);
        person.phone = digits;
        person.phoneError = '';
        person.phoneExists = false;
      }
      if (field === 'jobId') {
        person.jobError = '';
      }
      if (field === 'careerLevel') {
        person.levelError = '';
      }

      updated[index] = person;
      return updated;
    });
  };

  // Validate Name on Blur
  const handleNameBlur = (index) => {
    setPeople((prev) => {
      const updated = [...prev];
      const person = { ...updated[index] };
      const trimmed = person.fullName.trim();
      if (!trimmed) {
        person.nameError = 'الاسم بالكامل مطلوب';
      } else if (!NAME_REGEX.test(trimmed)) {
        person.nameError = 'الاسم يجب أن يحتوي على حروف فقط وبينهما مسافة واحدة على الأقل (اسم ثنائي أو أكثر)';
      } else {
        person.nameError = '';
      }
      updated[index] = person;
      return updated;
    });
  };

  // Validate Phone on Blur & Check Duplicates
  const handlePhoneBlur = async (index) => {
    const person = people[index];
    const phone = (person.phone || '').trim();

    if (!phone) {
      setPeople((prev) => {
        const u = [...prev];
        u[index] = { ...u[index], phoneError: 'رقم الهاتف مطلوب', phoneExists: false };
        return u;
      });
      return;
    }

    if (!PHONE_REGEX.test(phone)) {
      setPeople((prev) => {
        const u = [...prev];
        u[index] = {
          ...u[index],
          phoneError: 'رقم الهاتف يجب أن يتكون من 11 رقماً ويبدأ بـ (010 أو 011 أو 012 أو 015)',
          phoneExists: false
        };
        return u;
      });
      return;
    }

    // 1. Check intra-form duplicates
    const duplicateInForm = people.some(
      (p, i) => i !== index && p.phone && p.phone.trim() === phone
    );

    if (duplicateInForm) {
      setPeople((prev) => {
        const u = [...prev];
        u[index] = {
          ...u[index],
          phoneError: 'رقم الهاتف مكرر داخل نفس النموذج',
          phoneExists: true
        };
        return u;
      });
      return;
    }

    // 2. Check DB via API
    setPeople((prev) => {
      const u = [...prev];
      u[index] = { ...u[index], phoneChecking: true, phoneError: '' };
      return u;
    });

    try {
      const res = await recommendationApi.checkPhone(phone);
      const data = res.data?.data;
      setPeople((prev) => {
        const u = [...prev];
        if (!data?.isAvailable) {
          u[index] = {
            ...u[index],
            phoneChecking: false,
            phoneError: data?.message || 'رقم الهاتف مسجل بالفعل في قاعدة البيانات',
            phoneExists: true
          };
        } else {
          u[index] = {
            ...u[index],
            phoneChecking: false,
            phoneError: '',
            phoneExists: false
          };
        }
        return u;
      });
    } catch (err) {
      setPeople((prev) => {
        const u = [...prev];
        u[index] = { ...u[index], phoneChecking: false };
        return u;
      });
    }
  };

  // Progress metrics: count completed persons
  const completedCount = useMemo(() => {
    return people.filter((p) => {
      const nameValid = p.fullName.trim() && NAME_REGEX.test(p.fullName.trim());
      const phoneValid = p.phone.trim() && PHONE_REGEX.test(p.phone.trim()) && !p.phoneError;
      return nameValid && phoneValid && p.jobId && p.careerLevel;
    }).length;
  }, [people]);

  // Form validity
  const isFormValid = useMemo(() => {
    return completedCount === 11 && legalAccepted && !submitting;
  }, [completedCount, legalAccepted, submitting]);

  // Submit Handler
  const handleSubmit = async (e) => {
    e.preventDefault();

    if (!legalAccepted) {
      showToast('يجب الموافقة والإقرار بالمسؤولية القانونية لتقديم الطلب', 'error');
      return;
    }

    // Comprehensive client-side re-validation
    let hasErrors = false;
    const validatedPeople = people.map((p, index) => {
      const copy = { ...p };
      const nameTrimmed = (copy.fullName || '').trim();
      const phoneTrimmed = (copy.phone || '').trim();

      if (!nameTrimmed) {
        copy.nameError = 'الاسم بالكامل مطلوب';
        hasErrors = true;
      } else if (!NAME_REGEX.test(nameTrimmed)) {
        copy.nameError = 'الاسم يجب أن يحتوي على حروف فقط وبينهما مسافة واحدة على الأقل';
        hasErrors = true;
      }

      if (!phoneTrimmed) {
        copy.phoneError = 'رقم الهاتف مطلوب';
        hasErrors = true;
      } else if (!PHONE_REGEX.test(phoneTrimmed)) {
        copy.phoneError = 'رقم الهاتف يجب أن يكون 11 رقماً (010, 011, 012, 015)';
        hasErrors = true;
      }

      if (!copy.jobId) {
        copy.jobError = 'يرجى اختيار المسمى الوظيفي';
        hasErrors = true;
      }

      if (!copy.careerLevel) {
        copy.levelError = 'يرجى اختيار مستوى الخبرة';
        hasErrors = true;
      }

      return copy;
    });

    if (hasErrors) {
      setPeople(validatedPeople);
      showToast('يرجى تصحيح الأخطاء الموضحة باللون الأحمر في النموذج', 'error');
      return;
    }

    setSubmitting(true);

    try {
      const payload = {
        legalAccepted: true,
        people: people.map((p, i) => ({
          isPrimary: i === 0,
          fullName: p.fullName.trim(),
          phone: p.phone.trim(),
          jobId: p.jobId,
          careerLevel: p.careerLevel
        }))
      };

      const res = await recommendationApi.submitRecommendation(payload);
      setSubmittedData(res.data?.data);
      showToast('تم إرسال الطلب بنجاح وهو الآن قيد المراجعة والتدقيق', 'success');
    } catch (err) {
      const errData = err.response?.data;
      if (errData?.code === 'DUPLICATE_PHONE') {
        const dupIndices = errData.duplicateIndices || [];
        setPeople((prev) => {
          return prev.map((p, idx) => {
            if (dupIndices.includes(idx)) {
              return {
                ...p,
                phoneError: 'هذا الرقم مسجل بالفعل مسبقاً في قاعدة البيانات',
                phoneExists: true
              };
            }
            return p;
          });
        });
        showToast(errData.message || 'يوجد أرقام هواتف مسجلة مسبقاً، تم تمييزها باللون الأحمر', 'error');
      } else {
        showToast(errData?.message || 'حدث خطأ أثناء إرسال الطلب. يرجى المحاولة مرة أخرى.', 'error');
      }
    } finally {
      setSubmitting(false);
    }
  };

  // Copy Request Number to Clipboard
  const handleCopyReqNumber = () => {
    if (submittedData?.requestNumber) {
      navigator.clipboard.writeText(submittedData.requestNumber);
      setCopied(true);
      showToast('تم نسخ رقم الطلب بنجاح', 'success');
      setTimeout(() => setCopied(false), 2500);
    }
  };

  // Handle Track Status Query
  const handleTrackSubmit = async (e) => {
    e.preventDefault();
    if (!trackReqNumber.trim()) {
      showToast('يرجى إدخال رقم الطلب للاستعلام', 'error');
      return;
    }

    setTrackLoading(true);
    setTrackError('');
    setTrackResult(null);

    try {
      const res = await recommendationApi.trackStatus(trackReqNumber.trim(), trackPhone.trim());
      setTrackResult(res.data?.data);
    } catch (err) {
      const msg = err.response?.data?.message || 'لم يتم العثور على طلب بهذا الرقم. تأكد من صحة رقم الطلب.';
      setTrackError(msg);
      showToast(msg, 'error');
    } finally {
      setTrackLoading(false);
    }
  };

  return (
    <div style={{ background: '#f8fafc', minHeight: '100vh', padding: '2.5rem 0 5rem' }}>
      <div className="container" style={{ maxWidth: '960px' }}>
        {/* Header */}
        <div style={{ textAlign: 'center', marginBottom: '2.5rem' }}>
          <div
            style={{
              display: 'inline-flex',
              alignItems: 'center',
              gap: '0.5rem',
              padding: '0.35rem 0.9rem',
              borderRadius: '9999px',
              background: '#09090b',
              color: '#ffffff',
              fontSize: '0.8125rem',
              fontWeight: 700,
              marginBottom: '1rem'
            }}
          >
            <Users size={15} />
            {isRtl ? 'منظومة ترشيح وتوثيق الكوادر' : 'Candidate Nomination System'}
          </div>

          <h1 style={{ fontSize: 'clamp(1.75rem, 4vw, 2.5rem)', fontWeight: 900, color: '#09090b', marginBottom: '0.75rem' }}>
            {isRtl ? 'نموذج ترشيح الكوادر المعتمدة' : 'Verified Candidate Recommendation Form'}
          </h1>
          <p style={{ fontSize: '1rem', color: '#64748b', maxWidth: '620px', margin: '0 auto' }}>
            {isRtl
              ? 'سجّل بياناتك وأضف 10 ترشيحات لكوادر مؤهلة في العاشر من رمضان والمناطق الصناعية، وسيتم فحصها واعتمادها عبر رقم طلب رسمي.'
              : 'Submit your profile along with 10 candidate recommendations for 10th of Ramadan industrial zones.'}
          </p>

          {/* Tab Selector */}
          <div
            style={{
              display: 'inline-flex',
              gap: '0.5rem',
              background: '#e2e8f0',
              padding: '0.35rem',
              borderRadius: '12px',
              marginTop: '1.75rem'
            }}
          >
            <button
              type="button"
              onClick={() => setActiveTab('form')}
              style={{
                padding: '0.6rem 1.5rem',
                borderRadius: '8px',
                border: 'none',
                fontWeight: 700,
                fontSize: '0.925rem',
                cursor: 'pointer',
                background: activeTab === 'form' ? '#ffffff' : 'transparent',
                color: activeTab === 'form' ? '#09090b' : '#64748b',
                boxShadow: activeTab === 'form' ? '0 2px 4px rgba(0,0,0,0.06)' : 'none',
                transition: 'all 0.15s'
              }}
            >
              {isRtl ? 'تقديم طلب ترشيح (11 كادر)' : 'Submit Recommendation (11 People)'}
            </button>
            <button
              type="button"
              onClick={() => setActiveTab('track')}
              style={{
                padding: '0.6rem 1.5rem',
                borderRadius: '8px',
                border: 'none',
                fontWeight: 700,
                fontSize: '0.925rem',
                cursor: 'pointer',
                background: activeTab === 'track' ? '#ffffff' : 'transparent',
                color: activeTab === 'track' ? '#09090b' : '#64748b',
                boxShadow: activeTab === 'track' ? '0 2px 4px rgba(0,0,0,0.06)' : 'none',
                transition: 'all 0.15s'
              }}
            >
              {isRtl ? 'متابعة حالة الطلب برقم الطلب' : 'Track Request Status'}
            </button>
          </div>
        </div>

        {/* ========================================================================= */}
        {/* TAB 1: FORM OR SUBMISSION SUCCESS */}
        {/* ========================================================================= */}
        {activeTab === 'form' && (
          <div>
            {submittedData ? (
              /* Success Screen */
              <div
                style={{
                  background: '#ffffff',
                  borderRadius: '16px',
                  border: '1.5px solid #22c55e',
                  padding: '3rem 2rem',
                  textAlign: 'center',
                  boxShadow: '0 10px 30px rgba(34, 197, 94, 0.1)'
                }}
              >
                <div
                  style={{
                    width: '68px',
                    height: '68px',
                    borderRadius: '50%',
                    background: '#dcfce7',
                    color: '#16a34a',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    margin: '0 auto 1.5rem'
                  }}
                >
                  <CheckCircle2 size={38} />
                </div>

                <h2 style={{ fontSize: '1.75rem', fontWeight: 800, color: '#09090b', marginBottom: '0.5rem' }}>
                  {isRtl ? 'تم تقديم طلب الترشيحات بنجاح!' : 'Recommendation Request Submitted!'}
                </h2>
                <p style={{ fontSize: '0.95rem', color: '#64748b', marginBottom: '2rem' }}>
                  {isRtl
                    ? 'تم حفظ بيانات الـ 11 كادراً بنجاح، وطلبك الآن قيد المراجعة والتدقيق الإداري.'
                    : 'All 11 candidate profiles have been recorded and are pending review.'}
                </p>

                {/* Request Number Box */}
                <div
                  style={{
                    background: '#f8fafc',
                    border: '2px dashed #09090b',
                    borderRadius: '12px',
                    padding: '1.5rem',
                    maxWidth: '440px',
                    margin: '0 auto 2rem'
                  }}
                >
                  <div style={{ fontSize: '0.85rem', color: '#64748b', marginBottom: '0.5rem', fontWeight: 600 }}>
                    {isRtl ? 'رقم الطلب الرسمي الخاص بك' : 'Your Official Request Number'}
                  </div>
                  <div
                    style={{
                      fontSize: '2rem',
                      fontWeight: 900,
                      color: '#09090b',
                      letterSpacing: '2px',
                      marginBottom: '1rem',
                      fontFamily: 'monospace'
                    }}
                  >
                    {submittedData.requestNumber}
                  </div>
                  <button
                    type="button"
                    onClick={handleCopyReqNumber}
                    style={{
                      display: 'inline-flex',
                      alignItems: 'center',
                      gap: '0.5rem',
                      padding: '0.5rem 1.25rem',
                      borderRadius: '8px',
                      border: '1px solid #09090b',
                      background: copied ? '#22c55e' : '#09090b',
                      color: '#ffffff',
                      fontWeight: 700,
                      fontSize: '0.875rem',
                      cursor: 'pointer',
                      transition: 'all 0.15s'
                    }}
                  >
                    {copied ? <Check size={16} /> : <Copy size={16} />}
                    {copied ? (isRtl ? 'تم النسخ!' : 'Copied!') : (isRtl ? 'نسخ رقم الطلب' : 'Copy Request Number')}
                  </button>
                </div>

                <div style={{ display: 'flex', justifyContent: 'center', gap: '1rem', flexWrap: 'wrap' }}>
                  <button
                    type="button"
                    onClick={() => {
                      setTrackReqNumber(submittedData.requestNumber);
                      setActiveTab('track');
                    }}
                    style={{
                      padding: '0.75rem 1.75rem',
                      borderRadius: '10px',
                      background: '#09090b',
                      color: '#ffffff',
                      fontWeight: 700,
                      border: 'none',
                      cursor: 'pointer'
                    }}
                  >
                    {isRtl ? 'متابعة حالة هذا الطلب' : 'Track This Request'}
                  </button>
                  <button
                    type="button"
                    onClick={() => {
                      setSubmittedData(null);
                      setPeople(createInitialPeople());
                      setLegalAccepted(false);
                    }}
                    style={{
                      padding: '0.75rem 1.75rem',
                      borderRadius: '10px',
                      background: '#f1f5f9',
                      color: '#334155',
                      fontWeight: 700,
                      border: '1px solid #cbd5e1',
                      cursor: 'pointer'
                    }}
                  >
                    {isRtl ? 'تقديم طلب جديد' : 'Submit Another Request'}
                  </button>
                </div>
              </div>
            ) : (
              /* The Form */
              <form onSubmit={handleSubmit}>
                {/* Legal Warning Notice */}
                <div
                  style={{
                    background: '#fffbeb',
                    border: '1.5px solid #f59e0b',
                    borderRadius: '12px',
                    padding: '1.25rem 1.5rem',
                    marginBottom: '2rem',
                    display: 'flex',
                    gap: '1rem',
                    alignItems: 'flex-start'
                  }}
                >
                  <ShieldAlert size={28} style={{ color: '#d97706', flexShrink: 0, marginTop: '2px' }} />
                  <div>
                    <h3 style={{ fontSize: '1rem', fontWeight: 800, color: '#92400e', margin: '0 0 0.35rem' }}>
                      {isRtl ? 'إقرار وتحذير قانوني رسمي هام' : 'Official Legal Notice & Warning'}
                    </h3>
                    <p style={{ fontSize: '0.875rem', color: '#b45309', margin: 0, lineHeight: 1.6 }}>
                      {isRtl
                        ? 'يرجى العلم بأن جميع الترشيحات الـ 10 المسجلة مرتبطة ارتباطاً تاماً برقم هاتف مقدم الطلب الأساسي. يُحظر تماماً إدخال بيانات وهمية أو تضليل، وأي ضرر أو إساءة استخدام يعرّض صاحب الرقم الأساسي للمساءلة القانونية واتخاذ الإجراءات الجنائية اللازمة.'
                        : 'All 10 recommendations are legally attached to the primary submitter phone number. False information, damage, or misuse will lead to legal action.'}
                    </p>
                  </div>
                </div>

                {/* Progress Bar Header */}
                <div
                  style={{
                    background: '#ffffff',
                    border: '1px solid #e2e8f0',
                    borderRadius: '12px',
                    padding: '1rem 1.5rem',
                    marginBottom: '2rem',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'space-between',
                    flexWrap: 'wrap',
                    gap: '1rem'
                  }}
                >
                  <div>
                    <div style={{ fontSize: '0.85rem', color: '#64748b', fontWeight: 600 }}>
                      {isRtl ? 'نسبة اكتمال بيانات المرشحين الـ 11' : '11 Candidate Profiles Progress'}
                    </div>
                    <div style={{ fontSize: '1.25rem', fontWeight: 800, color: '#09090b' }}>
                      {completedCount} {isRtl ? 'من 11 كادر مكتمل' : 'of 11 completed'}
                    </div>
                  </div>

                  <div style={{ display: 'flex', gap: '0.35rem', flexWrap: 'wrap' }}>
                    {people.map((p, idx) => {
                      const isComplete =
                        p.fullName.trim() &&
                        NAME_REGEX.test(p.fullName.trim()) &&
                        p.phone.trim() &&
                        PHONE_REGEX.test(p.phone.trim()) &&
                        !p.phoneError &&
                        p.jobId &&
                        p.careerLevel;

                      return (
                        <div
                          key={idx}
                          title={idx === 0 ? 'مقدم الطلب' : `مرشح ${idx}`}
                          style={{
                            width: '28px',
                            height: '28px',
                            borderRadius: '6px',
                            background: isComplete ? '#22c55e' : p.phoneError ? '#ef4444' : '#e2e8f0',
                            color: isComplete || p.phoneError ? '#ffffff' : '#64748b',
                            fontSize: '0.75rem',
                            fontWeight: 700,
                            display: 'flex',
                            alignItems: 'center',
                            justifyContent: 'center',
                            cursor: 'pointer'
                          }}
                          onClick={() => {
                            const el = document.getElementById(`person-card-${idx}`);
                            if (el) el.scrollIntoView({ behavior: 'smooth', block: 'center' });
                          }}
                        >
                          {idx === 0 ? '★' : idx}
                        </div>
                      );
                    })}
                  </div>
                </div>

                {/* 11 People Cards */}
                <div style={{ display: 'flex', flexDirection: 'column', gap: '1.5rem' }}>
                  {people.map((person, index) => {
                    const isPrimary = index === 0;

                    return (
                      <div
                        id={`person-card-${index}`}
                        key={index}
                        style={{
                          background: '#ffffff',
                          border: isPrimary ? '2px solid #09090b' : '1px solid #e2e8f0',
                          borderRadius: '14px',
                          padding: '1.5rem',
                          boxShadow: isPrimary
                            ? '0 4px 15px rgba(0, 0, 0, 0.05)'
                            : '0 1px 3px rgba(0, 0, 0, 0.02)',
                          position: 'relative'
                        }}
                      >
                        {/* Card Header Badge */}
                        <div
                          style={{
                            display: 'flex',
                            alignItems: 'center',
                            justifyContent: 'space-between',
                            marginBottom: '1.25rem',
                            paddingBottom: '0.75rem',
                            borderBottom: '1px solid #f1f5f9'
                          }}
                        >
                          <div style={{ display: 'flex', alignItems: 'center', gap: '0.65rem' }}>
                            <div
                              style={{
                                width: '32px',
                                height: '32px',
                                borderRadius: '8px',
                                background: isPrimary ? '#09090b' : '#f1f5f9',
                                color: isPrimary ? '#ffffff' : '#475569',
                                fontWeight: 800,
                                fontSize: '0.9rem',
                                display: 'flex',
                                alignItems: 'center',
                                justifyContent: 'center'
                              }}
                            >
                              {isPrimary ? '1' : index + 1}
                            </div>
                            <div>
                              <h4 style={{ margin: 0, fontSize: '1.05rem', fontWeight: 800, color: '#09090b' }}>
                                {isPrimary
                                  ? (isRtl ? 'بيانات مقدم الطلب الأساسي' : 'Primary Submitter Profile')
                                  : (isRtl ? `المرشح رقم ${index} (موصى به)` : `Candidate Recommendation #${index}`)}
                              </h4>
                              {isPrimary && (
                                <div style={{ fontSize: '0.75rem', color: '#64748b', fontWeight: 600 }}>
                                  {isRtl
                                    ? 'هذا الرقم هو المرجع المعتمد المسؤول قانونياً عن كافة الترشيحات أدناه'
                                    : 'Primary reference responsible for all attached recommendations'}
                                </div>
                              )}
                            </div>
                          </div>

                          <div
                            style={{
                              padding: '0.25rem 0.65rem',
                              borderRadius: '6px',
                              background: isPrimary ? '#09090b' : '#f8fafc',
                              color: isPrimary ? '#ffffff' : '#64748b',
                              fontSize: '0.75rem',
                              fontWeight: 700
                            }}
                          >
                            {isPrimary
                              ? (isRtl ? 'صاحب الطلب' : 'Submitter')
                              : (isRtl ? `ترشيح ${index}/10` : `Nomination ${index}/10`)}
                          </div>
                        </div>

                        {/* Grid Fields */}
                        <div
                          style={{
                            display: 'grid',
                            gridTemplateColumns: 'repeat(auto-fit, minmax(220px, 1fr))',
                            gap: '1rem'
                          }}
                        >
                          {/* 1. Full Name */}
                          <div>
                            <label
                              style={{
                                display: 'block',
                                fontSize: '0.85rem',
                                fontWeight: 700,
                                color: '#1e293b',
                                marginBottom: '0.35rem'
                              }}
                            >
                              {isRtl ? 'الاسم بالكامل' : 'Full Name'} *
                            </label>
                            <input
                              type="text"
                              value={person.fullName}
                              onChange={(e) => handleFieldChange(index, 'fullName', e.target.value)}
                              onBlur={() => handleNameBlur(index)}
                              placeholder={isRtl ? 'مثال: أحمد محمد علي' : 'e.g. Ahmed Mohamed Ali'}
                              style={{
                                width: '100%',
                                padding: '0.65rem 0.85rem',
                                borderRadius: '8px',
                                border: person.nameError ? '1.5px solid #ef4444' : '1px solid #cbd5e1',
                                outline: 'none',
                                fontSize: '0.9rem',
                                background: '#ffffff',
                                color: '#09090b'
                              }}
                            />
                            {person.nameError ? (
                              <div style={{ color: '#ef4444', fontSize: '0.75rem', marginTop: '0.3rem', fontWeight: 600 }}>
                                {person.nameError}
                              </div>
                            ) : (
                              <div style={{ color: '#94a3b8', fontSize: '0.72rem', marginTop: '0.25rem' }}>
                                {isRtl ? 'حروف فقط، ومسافة واحدة على الأقل' : 'Letters only, at least one space'}
                              </div>
                            )}
                          </div>

                          {/* 2. Phone Number */}
                          <div>
                            <label
                              style={{
                                display: 'block',
                                fontSize: '0.85rem',
                                fontWeight: 700,
                                color: '#1e293b',
                                marginBottom: '0.35rem'
                              }}
                            >
                              {isRtl ? 'رقم الهاتف (المحمول)' : 'Phone Number'} *
                            </label>
                            <div style={{ position: 'relative' }}>
                              <input
                                type="tel"
                                maxLength={11}
                                value={person.phone}
                                onChange={(e) => handleFieldChange(index, 'phone', e.target.value)}
                                onBlur={() => handlePhoneBlur(index)}
                                placeholder="01012345678"
                                style={{
                                  width: '100%',
                                  padding: '0.65rem 0.85rem',
                                  borderRadius: '8px',
                                  border: person.phoneError ? '1.5px solid #ef4444' : '1px solid #cbd5e1',
                                  outline: 'none',
                                  fontSize: '0.9rem',
                                  background: '#ffffff',
                                  color: '#09090b',
                                  direction: 'ltr',
                                  textAlign: isRtl ? 'right' : 'left'
                                }}
                              />
                              {person.phoneChecking && (
                                <span
                                  style={{
                                    position: 'absolute',
                                    top: '50%',
                                    [isRtl ? 'left' : 'right']: '10px',
                                    transform: 'translateY(-50%)',
                                    fontSize: '0.75rem',
                                    color: '#64748b'
                                  }}
                                >
                                  جاري التحقق...
                                </span>
                              )}
                            </div>
                            {person.phoneError ? (
                              <div
                                style={{
                                  color: '#ef4444',
                                  fontSize: '0.75rem',
                                  marginTop: '0.3rem',
                                  fontWeight: 700,
                                  display: 'flex',
                                  alignItems: 'center',
                                  gap: '0.25rem'
                                }}
                              >
                                <XCircle size={13} />
                                {person.phoneError}
                              </div>
                            ) : (
                              <div style={{ color: '#94a3b8', fontSize: '0.72rem', marginTop: '0.25rem' }}>
                                {isRtl ? '11 رقماً يبدأ بـ 010 أو 011 أو 012 أو 015' : '11 digits starting with 010, 011, 012, or 015'}
                              </div>
                            )}
                          </div>

                          {/* 3. Job Title (Searchable) */}
                          <div>
                            <label
                              style={{
                                display: 'block',
                                fontSize: '0.85rem',
                                fontWeight: 700,
                                color: '#1e293b',
                                marginBottom: '0.35rem'
                              }}
                            >
                              {isRtl ? 'المسمى الوظيفي / التخصص' : 'Job Title'} *
                            </label>
                            <SearchableJobSelect
                              jobs={jobs}
                              selectedJobId={person.jobId}
                              onSelect={(job) => {
                                handleFieldChange(index, 'jobId', job._id);
                                handleFieldChange(index, 'jobTitle', job.nameAr || job.name);
                              }}
                              error={person.jobError}
                              isRtl={isRtl}
                            />
                            {person.jobError && (
                              <div style={{ color: '#ef4444', fontSize: '0.75rem', marginTop: '0.3rem', fontWeight: 600 }}>
                                {person.jobError}
                              </div>
                            )}
                          </div>

                          {/* 4. Career Level */}
                          <div>
                            <label
                              style={{
                                display: 'block',
                                fontSize: '0.85rem',
                                fontWeight: 700,
                                color: '#1e293b',
                                marginBottom: '0.35rem'
                              }}
                            >
                              {isRtl ? 'مستوى الخبرة المهنية' : 'Career Level'} *
                            </label>
                            <select
                              value={person.careerLevel}
                              onChange={(e) => handleFieldChange(index, 'careerLevel', e.target.value)}
                              style={{
                                width: '100%',
                                padding: '0.65rem 0.85rem',
                                borderRadius: '8px',
                                border: person.levelError ? '1.5px solid #ef4444' : '1px solid #cbd5e1',
                                outline: 'none',
                                fontSize: '0.9rem',
                                background: '#ffffff',
                                color: person.careerLevel ? '#09090b' : '#a1a1aa'
                              }}
                            >
                              <option value="">{isRtl ? 'اختر مستوى الخبرة...' : 'Select career level...'}</option>
                              {CAREER_LEVELS.map((lvl) => (
                                <option key={lvl} value={lvl}>
                                  {lvl}
                                </option>
                              ))}
                            </select>
                            {person.levelError && (
                              <div style={{ color: '#ef4444', fontSize: '0.75rem', marginTop: '0.3rem', fontWeight: 600 }}>
                                {person.levelError}
                              </div>
                            )}
                          </div>
                        </div>
                      </div>
                    );
                  })}
                </div>

                {/* Legal Checkbox & Submit */}
                <div
                  style={{
                    background: '#ffffff',
                    border: '1px solid #e2e8f0',
                    borderRadius: '14px',
                    padding: '1.75rem',
                    marginTop: '2rem',
                    boxShadow: '0 4px 15px rgba(0, 0, 0, 0.03)'
                  }}
                >
                  <label
                    style={{
                      display: 'flex',
                      alignItems: 'flex-start',
                      gap: '0.75rem',
                      cursor: 'pointer',
                      fontSize: '0.925rem',
                      color: '#0f172a',
                      fontWeight: 600,
                      lineHeight: 1.6
                    }}
                  >
                    <input
                      type="checkbox"
                      checked={legalAccepted}
                      onChange={(e) => setLegalAccepted(e.target.checked)}
                      style={{
                        width: '20px',
                        height: '20px',
                        marginTop: '3px',
                        cursor: 'pointer',
                        accentColor: '#09090b'
                      }}
                    />
                    <span>
                      {isRtl
                        ? 'أقر أنا مقدم الطلب بأن جميع البيانات والترشيحات المسجلة (11 كادراً) صحيحة ومربوطة برقم هاتفي الشخصي، وأتحمل كامل المسؤولية القانونية عن دقة هذه البيانات وأعلم أن أي تلاعب أو أرقام وهمية يعرّضني للمساءلة القانونية والإجراءات الجنائية المباشرة.'
                        : 'I hereby declare that all 11 submitted profiles are accurate and legally attached to my personal phone number.'}
                    </span>
                  </label>

                  <div
                    style={{
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'space-between',
                      marginTop: '1.75rem',
                      paddingTop: '1.25rem',
                      borderTop: '1px solid #f1f5f9',
                      flexWrap: 'wrap',
                      gap: '1rem'
                    }}
                  >
                    <div style={{ fontSize: '0.875rem', color: '#64748b' }}>
                      {completedCount === 11 ? (
                        <span style={{ color: '#16a34a', fontWeight: 700, display: 'inline-flex', alignItems: 'center', gap: '0.35rem' }}>
                          <CheckCircle2 size={16} />
                          {isRtl ? 'اكتملت بيانات الـ 11 كادراً بنجاح' : 'All 11 profiles completed'}
                        </span>
                      ) : (
                        <span style={{ color: '#d97706', fontWeight: 600, display: 'inline-flex', alignItems: 'center', gap: '0.35rem' }}>
                          <AlertTriangle size={16} />
                          {isRtl
                            ? `يتبقى استكمال بيانات ${11 - completedCount} مرشحاً`
                            : `${11 - completedCount} profiles remaining`}
                        </span>
                      )}
                    </div>

                    <button
                      type="submit"
                      disabled={!isFormValid || submitting}
                      style={{
                        padding: '0.875rem 2.5rem',
                        borderRadius: '10px',
                        background: isFormValid ? '#09090b' : '#94a3b8',
                        color: '#ffffff',
                        fontWeight: 800,
                        fontSize: '1rem',
                        border: 'none',
                        cursor: isFormValid ? 'pointer' : 'not-allowed',
                        transition: 'all 0.15s',
                        display: 'inline-flex',
                        alignItems: 'center',
                        gap: '0.5rem'
                      }}
                    >
                      {submitting ? (
                        <>
                          <div
                            style={{
                              width: '18px',
                              height: '18px',
                              border: '2px solid #ffffff',
                              borderTopColor: 'transparent',
                              borderRadius: '50%',
                              animation: 'spin 0.8s linear infinite'
                            }}
                          />
                          {isRtl ? 'جاري الإرسال والتدقيق...' : 'Submitting...'}
                        </>
                      ) : (
                        <>
                          <FileCheck size={18} />
                          {isRtl ? 'إرسال طلب الترشيحات (11 كادر)' : 'Submit Nominations (11 People)'}
                        </>
                      )}
                    </button>
                  </div>
                </div>
              </form>
            )}
          </div>
        )}

        {/* ========================================================================= */}
        {/* TAB 2: TRACK STATUS BY REQUEST NUMBER */}
        {/* ========================================================================= */}
        {activeTab === 'track' && (
          <div style={{ maxWidth: '720px', margin: '0 auto' }}>
            <div
              style={{
                background: '#ffffff',
                border: '1px solid #e2e8f0',
                borderRadius: '16px',
                padding: '2rem',
                boxShadow: '0 4px 15px rgba(0, 0, 0, 0.03)',
                marginBottom: '2rem'
              }}
            >
              <h3 style={{ fontSize: '1.25rem', fontWeight: 800, color: '#09090b', marginBottom: '0.5rem' }}>
                {isRtl ? 'الاستعلام عن حالة طلب الترشيح' : 'Check Request Status'}
              </h3>
              <p style={{ fontSize: '0.875rem', color: '#64748b', marginBottom: '1.5rem' }}>
                {isRtl
                  ? 'أدخل رقم الطلب المسلّم إليك عند التسجيل (مثال: REC-123456) لمعرفة حالة المراجعة.'
                  : 'Enter your official request number (e.g. REC-123456) to check review status.'}
              </p>

              <form onSubmit={handleTrackSubmit}>
                <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(240px, 1fr))', gap: '1rem', marginBottom: '1.25rem' }}>
                  <div>
                    <label style={{ display: 'block', fontSize: '0.85rem', fontWeight: 700, color: '#1e293b', marginBottom: '0.35rem' }}>
                      {isRtl ? 'رقم الطلب' : 'Request Number'} *
                    </label>
                    <input
                      type="text"
                      value={trackReqNumber}
                      onChange={(e) => setTrackReqNumber(e.target.value.toUpperCase())}
                      placeholder="REC-XXXXXX"
                      style={{
                        width: '100%',
                        padding: '0.75rem 1rem',
                        borderRadius: '8px',
                        border: '1.5px solid #cbd5e1',
                        fontSize: '1rem',
                        fontWeight: 700,
                        letterSpacing: '1px',
                        outline: 'none',
                        direction: 'ltr',
                        textAlign: isRtl ? 'right' : 'left'
                      }}
                    />
                  </div>

                  <div>
                    <label style={{ display: 'block', fontSize: '0.85rem', fontWeight: 700, color: '#1e293b', marginBottom: '0.35rem' }}>
                      {isRtl ? 'رقم هاتف مقدم الطلب (اختياري للتحقق)' : 'Submitter Phone (Optional verification)'}
                    </label>
                    <input
                      type="tel"
                      value={trackPhone}
                      onChange={(e) => setTrackPhone(e.target.value)}
                      placeholder="01012345678"
                      style={{
                        width: '100%',
                        padding: '0.75rem 1rem',
                        borderRadius: '8px',
                        border: '1px solid #cbd5e1',
                        fontSize: '0.95rem',
                        outline: 'none',
                        direction: 'ltr',
                        textAlign: isRtl ? 'right' : 'left'
                      }}
                    />
                  </div>
                </div>

                <button
                  type="submit"
                  disabled={trackLoading || !trackReqNumber.trim()}
                  style={{
                    padding: '0.75rem 2rem',
                    borderRadius: '8px',
                    background: '#09090b',
                    color: '#ffffff',
                    fontWeight: 700,
                    border: 'none',
                    cursor: trackReqNumber.trim() ? 'pointer' : 'not-allowed',
                    display: 'inline-flex',
                    alignItems: 'center',
                    gap: '0.5rem'
                  }}
                >
                  {trackLoading ? (
                    <>
                      <div
                        style={{
                          width: '16px',
                          height: '16px',
                          border: '2px solid #ffffff',
                          borderTopColor: 'transparent',
                          borderRadius: '50%',
                          animation: 'spin 0.8s linear infinite'
                        }}
                      />
                      {isRtl ? 'جاري البحث...' : 'Checking...'}
                    </>
                  ) : (
                    <>
                      <Search size={16} />
                      {isRtl ? 'استعلام عن النتيجة' : 'Check Status'}
                    </>
                  )}
                </button>
              </form>

              {trackError && (
                <div
                  style={{
                    marginTop: '1.25rem',
                    padding: '0.85rem 1rem',
                    borderRadius: '8px',
                    background: '#fef2f2',
                    border: '1px solid #fecaca',
                    color: '#dc2626',
                    fontSize: '0.875rem',
                    fontWeight: 600,
                    display: 'flex',
                    alignItems: 'center',
                    gap: '0.5rem'
                  }}
                >
                  <XCircle size={18} />
                  {trackError}
                </div>
              )}
            </div>

            {/* Results Display */}
            {trackResult && (
              <div
                style={{
                  background: '#ffffff',
                  border: '1px solid #e2e8f0',
                  borderRadius: '16px',
                  padding: '2rem',
                  boxShadow: '0 4px 15px rgba(0, 0, 0, 0.03)'
                }}
              >
                <div
                  style={{
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'space-between',
                    marginBottom: '1.5rem',
                    paddingBottom: '1rem',
                    borderBottom: '1px solid #f1f5f9',
                    flexWrap: 'wrap',
                    gap: '0.5rem'
                  }}
                >
                  <div>
                    <div style={{ fontSize: '0.8rem', color: '#64748b', fontWeight: 600 }}>
                      {isRtl ? 'رقم الطلب' : 'Request Number'}
                    </div>
                    <div style={{ fontSize: '1.4rem', fontWeight: 900, color: '#09090b', fontFamily: 'monospace' }}>
                      {trackResult.requestNumber}
                    </div>
                  </div>

                  {/* Status Badge */}
                  <div>
                    {trackResult.status === 'pending' && (
                      <span
                        style={{
                          display: 'inline-flex',
                          alignItems: 'center',
                          gap: '0.4rem',
                          padding: '0.45rem 1rem',
                          borderRadius: '9999px',
                          background: '#fef3c7',
                          color: '#92400e',
                          fontWeight: 800,
                          fontSize: '0.9rem'
                        }}
                      >
                        <Clock size={16} />
                        {isRtl ? 'قيد المراجعة والتدقيق' : 'Pending Review'}
                      </span>
                    )}
                    {trackResult.status === 'approved' && (
                      <span
                        style={{
                          display: 'inline-flex',
                          alignItems: 'center',
                          gap: '0.4rem',
                          padding: '0.45rem 1rem',
                          borderRadius: '9999px',
                          background: '#dcfce7',
                          color: '#16a34a',
                          fontWeight: 800,
                          fontSize: '0.9rem'
                        }}
                      >
                        <CheckCircle2 size={16} />
                        {isRtl ? 'تم القبول والاعتماد' : 'Approved'}
                      </span>
                    )}
                    {trackResult.status === 'rejected' && (
                      <span
                        style={{
                          display: 'inline-flex',
                          alignItems: 'center',
                          gap: '0.4rem',
                          padding: '0.45rem 1rem',
                          borderRadius: '9999px',
                          background: '#fee2e2',
                          color: '#dc2626',
                          fontWeight: 800,
                          fontSize: '0.9rem'
                        }}
                      >
                        <XCircle size={16} />
                        {isRtl ? 'مرفوض' : 'Rejected'}
                      </span>
                    )}
                  </div>
                </div>

                {/* Submitter & Meta Details */}
                <div
                  style={{
                    display: 'grid',
                    gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))',
                    gap: '1rem',
                    marginBottom: '1.5rem',
                    background: '#f8fafc',
                    padding: '1rem',
                    borderRadius: '10px'
                  }}
                >
                  <div>
                    <div style={{ fontSize: '0.75rem', color: '#64748b' }}>{isRtl ? 'مقدم الطلب' : 'Submitter'}</div>
                    <div style={{ fontSize: '0.95rem', fontWeight: 700, color: '#0f172a' }}>
                      {trackResult.submitterName}
                    </div>
                  </div>
                  <div>
                    <div style={{ fontSize: '0.75rem', color: '#64748b' }}>{isRtl ? 'تاريخ التقديم' : 'Submitted Date'}</div>
                    <div style={{ fontSize: '0.95rem', fontWeight: 700, color: '#0f172a' }}>
                      {trackResult.createdAt ? new Date(trackResult.createdAt).toLocaleDateString(isRtl ? 'ar-EG' : 'en-US') : '-'}
                    </div>
                  </div>
                </div>

                {/* Admin Note if any */}
                {trackResult.adminNotes && (
                  <div
                    style={{
                      background: '#f1f5f9',
                      border: '1px solid #cbd5e1',
                      borderRadius: '10px',
                      padding: '1rem',
                      marginBottom: '1.5rem'
                    }}
                  >
                    <div style={{ fontSize: '0.8rem', fontWeight: 700, color: '#334155', marginBottom: '0.25rem' }}>
                      {isRtl ? 'ملاحظات الإدارة:' : 'Admin Notes:'}
                    </div>
                    <p style={{ margin: 0, fontSize: '0.9rem', color: '#475569' }}>{trackResult.adminNotes}</p>
                  </div>
                )}

                {/* Candidates List Preview */}
                <h4 style={{ fontSize: '0.95rem', fontWeight: 800, color: '#09090b', marginBottom: '0.75rem' }}>
                  {isRtl ? 'الكوادر المدرجة في هذا الطلب (11 كادر):' : 'Submitted Candidates (11 Profiles):'}
                </h4>
                <div style={{ display: 'flex', flexDirection: 'column', gap: '0.5rem' }}>
                  {trackResult.people?.map((p, idx) => (
                    <div
                      key={p._id || idx}
                      style={{
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'space-between',
                        padding: '0.65rem 0.85rem',
                        borderRadius: '8px',
                        background: p.isPrimary ? '#f4f4f5' : '#ffffff',
                        border: '1px solid #e2e8f0',
                        fontSize: '0.85rem'
                      }}
                    >
                      <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                        <span
                          style={{
                            fontSize: '0.75rem',
                            fontWeight: 700,
                            padding: '0.15rem 0.45rem',
                            borderRadius: '4px',
                            background: p.isPrimary ? '#09090b' : '#e2e8f0',
                            color: p.isPrimary ? '#ffffff' : '#475569'
                          }}
                        >
                          {p.isPrimary ? (isRtl ? 'المسجل' : 'Primary') : idx}
                        </span>
                        <span style={{ fontWeight: 700, color: '#09090b' }}>{p.fullName}</span>
                        <span style={{ color: '#64748b', fontSize: '0.8rem', direction: 'ltr' }}>
                          ({p.maskedPhone})
                        </span>
                      </div>

                      <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                        <span style={{ color: '#27272a', fontWeight: 600 }}>{p.jobTitle}</span>
                        <span
                          style={{
                            fontSize: '0.75rem',
                            padding: '0.15rem 0.5rem',
                            borderRadius: '4px',
                            background: '#f1f5f9',
                            color: '#64748b'
                          }}
                        >
                          {p.careerLevel}
                        </span>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            )}
          </div>
        )}
      </div>
    </div>
  );
}
