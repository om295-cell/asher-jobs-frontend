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
  AlertCircle,
  ExternalLink,
  Plus,
  Trash2
} from 'lucide-react';
import { useLanguage } from '../../context/LanguageContext';
import { useToast } from '../../context/ToastContext';
import { useAuth } from '../../context/AuthContext';
import { jobsApi } from '../../api/jobs.api';
import { recommendationApi } from '../../api/recommendation.api';
import LoadingSpinner from '../../components/ui/LoadingSpinner';
import { useSubmitThrottle } from '../../hooks/useSubmitThrottle';

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

function createEmptyPerson(index, isPrimary = false) {
  return {
    index,
    isPrimary,
    fullName: '',
    phone: '',
    jobId: '',
    jobTitle: '',
    careerLevel: '',
    // Up to 3 titles per person, each with their own career level and priority
    titles: [
      {
        id: String(Date.now() + Math.random()),
        jobId: '',
        jobTitle: '',
        careerLevel: '',
        jobError: '',
        levelError: ''
      }
    ],
    // Validation state
    nameError: '',
    phoneError: '',
    jobError: '',
    levelError: '',
    phoneChecking: false,
    phoneExists: false
  };
}

function createInitialPeople() {
  return [
    createEmptyPerson(0, true),
    createEmptyPerson(1, false)
  ];
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
  const { isAuthenticated, role } = useAuth();
  const location = useLocation();
  const navigate = useNavigate();

  useEffect(() => {
    if (isAuthenticated && role === 'company') {
      navigate('/company/search', { replace: true });
    }
  }, [isAuthenticated, role, navigate]);

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

  // Submit throttling / DDoS protection
  const submitThrottle = useSubmitThrottle({ maxAttempts: 5, baseSecs: 60 });
  const trackThrottle = useSubmitThrottle({ maxAttempts: 5, baseSecs: 30 });

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
        updated[index] = person;

        if (digits.length === 11 && PHONE_REGEX.test(digits)) {
          setTimeout(() => {
            handlePhoneBlur(index, digits);
          }, 250);
        }
        return updated;
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

  // Add an extra title (up to 3 titles per candidate)
  const handleAddTitle = (personIndex) => {
    setPeople((prev) => {
      const updated = [...prev];
      const person = { ...updated[personIndex] };
      const currentTitles = Array.isArray(person.titles) ? [...person.titles] : [];

      if (currentTitles.length < 3) {
        currentTitles.push({
          id: String(Date.now() + Math.random()),
          jobId: '',
          jobTitle: '',
          careerLevel: '',
          jobError: '',
          levelError: ''
        });
      }

      person.titles = currentTitles;
      updated[personIndex] = person;
      return updated;
    });
  };

  // Remove extra title (cannot remove title at index 0)
  const handleRemoveTitle = (personIndex, titleIndex) => {
    setPeople((prev) => {
      const updated = [...prev];
      const person = { ...updated[personIndex] };
      if (Array.isArray(person.titles) && person.titles.length > 1 && titleIndex > 0) {
        person.titles = person.titles.filter((_, idx) => idx !== titleIndex);
        // Resync root fields to 1st title
        person.jobId = person.titles[0]?.jobId || '';
        person.jobTitle = person.titles[0]?.jobTitle || '';
        person.careerLevel = person.titles[0]?.careerLevel || '';
        person.jobError = person.titles[0]?.jobError || '';
        person.levelError = person.titles[0]?.levelError || '';
      }
      updated[personIndex] = person;
      return updated;
    });
  };

  // Add another candidate recommendation card
  const handleAddPerson = () => {
    setPeople((prev) => {
      if (prev.length >= 20) {
        showToast(isRtl ? 'الحد الأقصى للمرشحين في الطلب الواحد هو 20 مرشحاً' : 'Maximum 20 candidates per request', 'warning');
        return prev;
      }
      return [...prev, createEmptyPerson(prev.length, false)];
    });
  };

  // Remove a candidate recommendation card
  const handleRemovePerson = (personIndex) => {
    if (personIndex === 0) return; // Cannot remove submitter
    if (people.length <= 2) {
      showToast(isRtl ? 'يجب إدخال مرشح واحد على الأقل بالإضافة إلى بياناتك' : 'At least one candidate recommendation is required', 'warning');
      return;
    }
    setPeople((prev) => {
      const filtered = prev.filter((_, idx) => idx !== personIndex);
      return filtered.map((p, idx) => ({
        ...p,
        index: idx,
        isPrimary: idx === 0
      }));
    });
  };

  // Update specific title field (jobId, jobTitle, careerLevel)
  const handleTitleChange = (personIndex, titleIndex, field, value) => {
    setPeople((prev) => {
      const updated = [...prev];
      const person = { ...updated[personIndex] };
      const currentTitles = Array.isArray(person.titles) ? [...person.titles] : [];
      const titleItem = { ...(currentTitles[titleIndex] || {}), [field]: value };

      if (field === 'jobId') {
        titleItem.jobError = '';
        // Check if this job was already picked in another title for this same person
        const isDuplicate = currentTitles.some(
          (t, idx) => idx !== titleIndex && t.jobId && String(t.jobId) === String(value)
        );
        if (isDuplicate) {
          titleItem.jobError = 'تم اختيار هذا المسمى الوظيفي مسبقاً لهذا الشخص';
        }
      }
      if (field === 'careerLevel') {
        titleItem.levelError = '';
      }

      currentTitles[titleIndex] = titleItem;
      person.titles = currentTitles;

      // Keep root person fields in sync with primary title (index 0)
      if (titleIndex === 0) {
        if (field === 'jobId') {
          person.jobId = value;
          person.jobError = titleItem.jobError;
        }
        if (field === 'jobTitle') {
          person.jobTitle = value;
        }
        if (field === 'careerLevel') {
          person.careerLevel = value;
          person.levelError = titleItem.levelError;
        }
      }

      updated[personIndex] = person;
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

  // Helper to scroll page directly to candidate with an issue and focus their problematic field
  const scrollToPerson = (index, field = null) => {
    setTimeout(() => {
      const cardEl = document.getElementById(`person-card-${index}`);
      if (cardEl) {
        cardEl.scrollIntoView({ behavior: 'smooth', block: 'center' });
      }
      if (field === 'phone') {
        const phoneInput = document.getElementById(`person-phone-input-${index}`);
        if (phoneInput) phoneInput.focus();
      } else if (field === 'name') {
        const nameInput = document.getElementById(`person-name-input-${index}`);
        if (nameInput) nameInput.focus();
      } else {
        const person = people[index];
        if (person?.nameError || !person?.fullName?.trim()) {
          const nameInput = document.getElementById(`person-name-input-${index}`);
          if (nameInput) nameInput.focus();
        } else if (person?.phoneError || person?.phoneExists || !person?.phone?.trim()) {
          const phoneInput = document.getElementById(`person-phone-input-${index}`);
          if (phoneInput) phoneInput.focus();
        }
      }
    }, 120);
  };

  // Validate Phone on Blur & Check Duplicates
  const handlePhoneBlur = async (index, overridePhone = null) => {
    const person = people[index];
    const phone = (overridePhone !== null ? overridePhone : (person?.phone || '')).trim();

    if (!phone) {
      setPeople((prev) => {
        const u = [...prev];
        u[index] = { ...u[index], phoneError: isRtl ? 'رقم الهاتف مطلوب' : 'Phone number is required', phoneExists: false };
        return u;
      });
      return;
    }

    if (!PHONE_REGEX.test(phone)) {
      setPeople((prev) => {
        const u = [...prev];
        u[index] = {
          ...u[index],
          phoneError: isRtl
            ? 'رقم الهاتف يجب أن يتكون من 11 رقماً ويبدأ بـ (010 أو 011 أو 012 أو 015)'
            : 'Phone must be 11 digits starting with 010, 011, 012, or 015',
          phoneExists: false
        };
        return u;
      });
      return;
    }

    // 1. Check intra-form duplicates
    const duplicateInFormIdx = people.findIndex(
      (p, i) => i !== index && p.phone && p.phone.trim() === phone
    );

    if (duplicateInFormIdx !== -1) {
      const otherPerson = people[duplicateInFormIdx];
      const otherLabel = duplicateInFormIdx === 0
        ? (isRtl ? 'مقدم الطلب الأساسي' : 'Primary Submitter')
        : (isRtl ? `المرشح رقم ${duplicateInFormIdx}` : `Candidate #${duplicateInFormIdx}`);
      const otherName = otherPerson?.fullName?.trim() ? ` (${otherPerson.fullName.trim()})` : '';

      const detailedErrMsg = isRtl
        ? `رقم الهاتف مكرر: هذا الرقم مسجل بالفعل لـ ${otherLabel}${otherName}`
        : `Duplicate phone: already entered for ${otherLabel}${otherName}`;

      setPeople((prev) => {
        const u = [...prev];
        u[index] = {
          ...u[index],
          phoneError: detailedErrMsg,
          phoneExists: true
        };
        return u;
      });
      showToast(detailedErrMsg, 'error');
      scrollToPerson(index, 'phone');
      return;
    }

    // 2. Check DB via API
    setPeople((prev) => {
      const u = [...prev];
      u[index] = { ...u[index], phoneChecking: true, phoneError: '' };
      return u;
    });

    try {
      const res = await recommendationApi.checkPhone(phone, index === 0, person?.fullName || '');
      const data = res.data?.data;
      if (!data?.isAvailable) {
        const label = index === 0
          ? (isRtl ? 'مقدم الطلب الأساسي' : 'Primary Submitter')
          : (isRtl ? `المرشح رقم ${index}` : `Candidate #${index}`);
        const errMsg = data?.message || (isRtl
          ? `هذا الرقم مسجل بالفعل مسبقاً في النظام لـ ${label}، يرجى إدخال شخص آخر`
          : `Phone number is already registered for ${label}`);

        setPeople((prev) => {
          const u = [...prev];
          u[index] = {
            ...u[index],
            phoneChecking: false,
            phoneError: errMsg,
            phoneExists: true
          };
          return u;
        });
        showToast(errMsg, 'error');
        scrollToPerson(index, 'phone');
      } else {
        setPeople((prev) => {
          const u = [...prev];
          u[index] = {
            ...u[index],
            phoneChecking: false,
            phoneError: '',
            phoneExists: false
          };
          return u;
        });
      }
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
      const nameValid = p.fullName.trim() && NAME_REGEX.test(p.fullName.trim()) && !p.nameError;
      const phoneValid = p.phone.trim() && PHONE_REGEX.test(p.phone.trim()) && !p.phoneError && !p.phoneExists;
      const titles = p.titles && p.titles.length > 0 ? p.titles : [];
      const titlesValid =
        titles.length > 0 &&
        titles.every((t) => t.jobId && t.careerLevel && !t.jobError && !t.levelError);
      return nameValid && phoneValid && titlesValid;
    }).length;
  }, [people]);

  // List of candidates with issues or incomplete data
  const peopleWithIssues = useMemo(() => {
    return people
      .map((p, idx) => {
        const issues = [];
        const nameTrimmed = (p.fullName || '').trim();
        const phoneTrimmed = (p.phone || '').trim();

        if (!nameTrimmed) {
          issues.push(isRtl ? 'الاسم' : 'Name');
        } else if (!NAME_REGEX.test(nameTrimmed)) {
          issues.push(isRtl ? 'صيغة الاسم' : 'Invalid name');
        } else if (p.nameError) {
          issues.push(p.nameError);
        }

        if (!phoneTrimmed) {
          issues.push(isRtl ? 'رقم الهاتف' : 'Phone');
        } else if (!PHONE_REGEX.test(phoneTrimmed)) {
          issues.push(isRtl ? 'صيغة الهاتف' : 'Invalid phone');
        } else if (p.phoneError) {
          issues.push(p.phoneError);
        } else if (p.phoneExists) {
          issues.push(isRtl ? 'رقم الهاتف (مكرر)' : 'Duplicate phone');
        }

        const titles = p.titles && p.titles.length > 0 ? p.titles : [];
        if (titles.length === 0) {
          if (!p.jobId || p.jobError) issues.push(isRtl ? 'المسمى الوظيفي' : 'Job title');
          if (!p.careerLevel || p.levelError) issues.push(isRtl ? 'مستوى الخبرة' : 'Career level');
        } else {
          titles.forEach((t, tIdx) => {
            const titleLabel = titles.length > 1 ? ` (${tIdx + 1})` : '';
            if (!t.jobId || t.jobError) issues.push(`${isRtl ? 'المسمى الوظيفي' : 'Job'}${titleLabel}`);
            if (!t.careerLevel || t.levelError) issues.push(`${isRtl ? 'مستوى الخبرة' : 'Level'}${titleLabel}`);
          });
        }

        const isComplete = issues.length === 0;
        const hasError = Boolean(
          p.phoneError ||
          p.phoneExists ||
          p.nameError ||
          p.jobError ||
          p.levelError ||
          p.titles?.some((t) => t.jobError || t.levelError)
        );

        const label = idx === 0
          ? (isRtl ? 'مقدم الطلب الأساسي' : 'Primary Submitter')
          : (isRtl ? `المرشح رقم ${idx}` : `Candidate #${idx}`);
        const nameStr = p.fullName?.trim() ? ` (${p.fullName.trim()})` : '';

        return {
          index: idx,
          isPrimary: idx === 0,
          label: `${label}${nameStr}`,
          fullName: p.fullName?.trim() || '',
          issues,
          isComplete,
          hasError
        };
      })
      .filter((p) => !p.isComplete);
  }, [people, isRtl]);

  // Form validity: at least 2 people (submitter + at least 1 recommendation), all completed
  const isFormValid = useMemo(() => {
    return people.length >= 2 && completedCount === people.length && legalAccepted && !submitting;
  }, [people.length, completedCount, legalAccepted, submitting]);

  // Submit Handler
  const handleSubmit = async (e) => {
    e.preventDefault();

    if (submitThrottle.isLockedOut) {
      showToast(isRtl ? `محاولات كثيرة. يرجى الانتظار ${submitThrottle.countdown} ثانية.` : `Too many attempts. Wait ${submitThrottle.countdown}s.`, 'error');
      return;
    }

    if (!legalAccepted) {
      showToast(isRtl ? 'يجب الموافقة والإقرار بالمسؤولية القانونية لتقديم الطلب' : 'You must accept legal responsibility to submit', 'error');
      return;
    }

    // Comprehensive client-side re-validation
    let hasErrors = false;
    const errorsList = [];

    const validatedPeople = people.map((p, index) => {
      const copy = { ...p };
      const nameTrimmed = (copy.fullName || '').trim();
      const phoneTrimmed = (copy.phone || '').trim();
      const personFieldErrors = [];

      if (!nameTrimmed) {
        copy.nameError = isRtl ? 'الاسم بالكامل مطلوب' : 'Full name is required';
        personFieldErrors.push(isRtl ? 'الاسم بالكامل' : 'Full Name');
        hasErrors = true;
      } else if (!NAME_REGEX.test(nameTrimmed)) {
        copy.nameError = isRtl ? 'الاسم يجب أن يحتوي على حروف فقط وبينهما مسافة واحدة على الأقل' : 'Name must contain letters only with at least one space';
        personFieldErrors.push(isRtl ? 'صيغة الاسم' : 'Name format');
        hasErrors = true;
      } else {
        copy.nameError = '';
      }

      if (!phoneTrimmed) {
        copy.phoneError = isRtl ? 'رقم الهاتف مطلوب' : 'Phone is required';
        personFieldErrors.push(isRtl ? 'رقم الهاتف' : 'Phone');
        hasErrors = true;
      } else if (!PHONE_REGEX.test(phoneTrimmed)) {
        copy.phoneError = isRtl ? 'رقم الهاتف يجب أن يكون 11 رقماً (010, 011, 012, 015)' : 'Phone must be 11 digits (010, 011, 012, 015)';
        personFieldErrors.push(isRtl ? 'صيغة رقم الهاتف' : 'Phone format');
        hasErrors = true;
      } else if (copy.phoneExists) {
        copy.phoneError = copy.phoneError || (isRtl ? 'هذا الرقم مسجل مسبقاً' : 'Phone already registered');
        personFieldErrors.push(isRtl ? 'رقم الهاتف (مسجل مسبقاً)' : 'Duplicate phone');
        hasErrors = true;
      } else {
        copy.phoneError = '';
      }

      // Validate all titles
      const currentTitles = copy.titles && copy.titles.length > 0 ? copy.titles : [{ jobId: copy.jobId, careerLevel: copy.careerLevel }];
      const validatedTitles = currentTitles.map((t, tIdx) => {
        const tCopy = { ...t };
        if (!tCopy.jobId) {
          tCopy.jobError = isRtl ? 'يرجى اختيار المسمى الوظيفي' : 'Job title is required';
          personFieldErrors.push(currentTitles.length > 1 ? `${isRtl ? 'المسمى الوظيفي' : 'Job'} (${tIdx + 1})` : (isRtl ? 'المسمى الوظيفي' : 'Job'));
          hasErrors = true;
        } else {
          tCopy.jobError = '';
        }
        if (!tCopy.careerLevel) {
          tCopy.levelError = isRtl ? 'يرجى اختيار مستوى الخبرة' : 'Career level is required';
          personFieldErrors.push(currentTitles.length > 1 ? `${isRtl ? 'مستوى الخبرة' : 'Level'} (${tIdx + 1})` : (isRtl ? 'مستوى الخبرة' : 'Level'));
          hasErrors = true;
        } else {
          tCopy.levelError = '';
        }
        return tCopy;
      });

      copy.titles = validatedTitles;
      copy.jobId = validatedTitles[0]?.jobId || '';
      copy.jobError = validatedTitles[0]?.jobError || '';
      copy.careerLevel = validatedTitles[0]?.careerLevel || '';
      copy.levelError = validatedTitles[0]?.levelError || '';

      if (personFieldErrors.length > 0) {
        const label = index === 0
          ? (isRtl ? 'مقدم الطلب الأساسي' : 'Primary Submitter')
          : (isRtl ? `المرشح رقم ${index}` : `Candidate #${index}`);
        const nameStr = copy.fullName?.trim() ? ` (${copy.fullName.trim()})` : '';
        errorsList.push({
          index,
          label: `${label}${nameStr}`,
          issues: personFieldErrors.join('، ')
        });
      }

      return copy;
    });

    // Check intra-form duplicates across all persons
    const seenPhonesInSubmission = new Map();
    validatedPeople.forEach((p, idx) => {
      const ph = p.phone?.trim();
      if (ph && PHONE_REGEX.test(ph)) {
        if (seenPhonesInSubmission.has(ph)) {
          const prevIdx = seenPhonesInSubmission.get(ph);
          const prevPerson = validatedPeople[prevIdx];
          const prevLabel = prevIdx === 0
            ? (isRtl ? 'مقدم الطلب الأساسي' : 'Primary Submitter')
            : (isRtl ? `المرشح رقم ${prevIdx}` : `Candidate #${prevIdx}`);
          const prevName = prevPerson.fullName?.trim() ? ` (${prevPerson.fullName.trim()})` : '';

          const currLabel = idx === 0
            ? (isRtl ? 'مقدم الطلب الأساسي' : 'Primary Submitter')
            : (isRtl ? `المرشح رقم ${idx}` : `Candidate #${idx}`);
          const currName = p.fullName?.trim() ? ` (${p.fullName.trim()})` : '';

          const dupMsgCurrent = isRtl
            ? `رقم الهاتف مكرر: هذا الرقم مستخدم بالفعل لـ ${prevLabel}${prevName}`
            : `Duplicate phone: already used by ${prevLabel}${prevName}`;

          const dupMsgPrev = isRtl
            ? `رقم الهاتف مكرر: هذا الرقم مستخدم بالفعل لـ ${currLabel}${currName}`
            : `Duplicate phone: already used by ${currLabel}${currName}`;

          p.phoneError = dupMsgCurrent;
          p.phoneExists = true;

          validatedPeople[prevIdx].phoneError = dupMsgPrev;
          validatedPeople[prevIdx].phoneExists = true;
          hasErrors = true;

          if (!errorsList.some((e) => e.index === idx)) {
            errorsList.push({
              index: idx,
              label: `${currLabel}${currName}`,
              issues: isRtl ? `رقم الهاتف مكرر مع ${prevLabel}` : `Duplicate phone with ${prevLabel}`
            });
          }
          if (!errorsList.some((e) => e.index === prevIdx)) {
            errorsList.push({
              index: prevIdx,
              label: `${prevLabel}${prevName}`,
              issues: isRtl ? `رقم الهاتف مكرر مع ${currLabel}` : `Duplicate phone with ${currLabel}`
            });
          }
        } else {
          seenPhonesInSubmission.set(ph, idx);
        }
      }
    });

    if (hasErrors) {
      setPeople(validatedPeople);
      const firstErr = errorsList[0];
      if (firstErr) {
        scrollToPerson(firstErr.index);
      }

      if (errorsList.length === 1) {
        showToast(
          isRtl
            ? `يوجد خطأ في بيانات ${errorsList[0].label}: [${errorsList[0].issues}]. يرجى تصحيحه.`
            : `Issue in ${errorsList[0].label}: [${errorsList[0].issues}]. Please fix it.`,
          'error'
        );
      } else {
        const namesSummary = errorsList.map((e) => e.label).join('، ');
        showToast(
          isRtl
            ? `يوجد أخطاء في بيانات (${errorsList.length} أشخاص): ${namesSummary}. تم تحديدها باللون الأحمر.`
            : `Errors found in (${errorsList.length} profiles): ${namesSummary}. Highlighted in red.`,
          'error'
        );
      }
      return;
    }

    setSubmitting(true);

    try {
      const payload = {
        legalAccepted: true,
        people: validatedPeople.map((p, i) => ({
          isPrimary: i === 0,
          fullName: p.fullName.trim(),
          phone: p.phone.trim(),
          jobId: p.titles[0]?.jobId,
          careerLevel: p.titles[0]?.careerLevel,
          titles: p.titles.map((t, tIdx) => ({
            jobId: t.jobId,
            careerLevel: t.careerLevel,
            priority: tIdx + 1
          }))
        }))
      };

      const res = await recommendationApi.submitRecommendation(payload);
      submitThrottle.recordSuccess();
      setSubmittedData(res.data?.data);
      if (res.data?.data?.isPendingConflict || res.data?.data?.status === 'phone_duplicate_pending') {
        showToast(isRtl ? 'تم تسجيل طلبك برقم مرجعي. الطلب قيد التدقيق الإداري (متابعة بعد 24 ساعة).' : 'Request registered. Under administrative review.', 'warning');
      } else {
        showToast(isRtl ? 'تم إرسال الطلب بنجاح وهو الآن قيد المراجعة والتدقيق' : 'Request submitted successfully and is pending review', 'success');
      }
    } catch (err) {
      submitThrottle.recordFailure();
      const errData = err.response?.data;
      const dupIndices = Array.isArray(errData?.duplicateIndices) ? errData.duplicateIndices : [];
      const dupNames = Array.isArray(errData?.duplicateNames) ? errData.duplicateNames : [];

      if (errData?.code === 'DUPLICATE_PHONE') {
        const errorMsg =
          errData.message ||
          (isRtl
            ? 'هذا الشخص مسجل بالفعل مسبقاً، يرجى إدخال شخص آخر'
            : 'This person is already added, please enter someone else');

        setPeople((prev) => {
          return prev.map((p, idx) => {
            if (dupIndices.includes(idx)) {
              const label = idx === 0
                ? (isRtl ? 'مقدم الطلب الأساسي' : 'Primary Submitter')
                : (isRtl ? `المرشح رقم ${idx}` : `Candidate #${idx}`);
              return {
                ...p,
                phoneError: isRtl
                  ? `هذا الرقم (${p.phone}) مسجل بالفعل مسبقاً في قاعدة البيانات لـ ${label}، يرجى إدخال رقم آخر`
                  : `Phone number (${p.phone}) is already registered in the system for ${label}`,
                phoneExists: true
              };
            }
            return p;
          });
        });

        if (dupIndices.length > 0) {
          scrollToPerson(dupIndices[0], 'phone');
        }

        if (dupNames.length > 0) {
          showToast(
            isRtl
              ? `رقم الهاتف مسجل بالفعل مسبقاً لـ: ${dupNames.join('، ')}. يرجى استبدال الرقم أو المرشح.`
              : `Phone already registered for: ${dupNames.join(', ')}.`,
            'error'
          );
        } else {
          showToast(errorMsg, 'error');
        }
      } else if (errData?.code === 'VALIDATION_FAILED' && errData.errors) {
        setPeople((prev) => {
          return prev.map((p, idx) => {
            const pErrors = errData.errors[idx];
            if (!pErrors) return p;
            return {
              ...p,
              nameError: pErrors.fullName || p.nameError,
              phoneError: pErrors.phone || p.phoneError,
              phoneExists: Boolean(pErrors.phone) || p.phoneExists,
              jobError: pErrors.jobId || p.jobError,
              levelError: pErrors.careerLevel || p.levelError,
              titles: Array.isArray(p.titles) && Array.isArray(pErrors.titles)
                ? p.titles.map((t, tIdx) => ({
                    ...t,
                    jobError: pErrors.titles[tIdx]?.jobId || t.jobError,
                    levelError: pErrors.titles[tIdx]?.careerLevel || t.levelError
                  }))
                : p.titles
            };
          });
        });

        const firstErrIdx = Object.keys(errData.errors)[0];
        if (firstErrIdx !== undefined) {
          scrollToPerson(Number(firstErrIdx));
        }
        showToast(errData.message || (isRtl ? 'يوجد خطأ في بيانات أحد المرشحين' : 'Validation error in candidate data'), 'error');
      } else if (errData?.invalidPersonIndex !== undefined) {
        scrollToPerson(Number(errData.invalidPersonIndex));
        showToast(errData.message || (isRtl ? 'حدث خطأ في بيانات المرشح' : 'Error in candidate data'), 'error');
      } else {
        showToast(errData?.message || (isRtl ? 'حدث خطأ أثناء إرسال الطلب. يرجى المحاولة مرة أخرى.' : 'Error submitting request. Please try again.'), 'error');
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
    if (trackThrottle.isLockedOut) {
      showToast(isRtl ? `محاولات كثيرة. يرجى الانتظار ${trackThrottle.countdown} ثانية.` : `Too many attempts. Wait ${trackThrottle.countdown}s.`, 'error');
      return;
    }
    if (!trackReqNumber.trim()) {
      showToast(isRtl ? 'يرجى إدخال رقم الطلب أو رمز التتبع للاستعلام' : 'Please enter the request number or tracking code', 'error');
      return;
    }
    if (!trackPhone.trim()) {
      showToast(isRtl ? 'يرجى إدخال رقم هاتف مقدم الطلب للتحقق من الهوية' : 'Please enter the submitter phone number to verify identity', 'error');
      return;
    }

    setTrackLoading(true);
    setTrackError('');
    setTrackResult(null);

    try {
      const res = await recommendationApi.trackStatus(trackReqNumber.trim(), trackPhone.trim());
      trackThrottle.recordSuccess();
      setTrackResult(res.data?.data);
    } catch (err) {
      trackThrottle.recordFailure();
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
              ? 'سجّل بياناتك كمرشح رئيسي وأضف ترشيحات لكوادر مؤهلة في العاشر من رمضان والمناطق الصناعية، وسيتم فحصها واعتمادها عبر رقم طلب رسمي.'
              : 'Submit your profile along with qualified candidate recommendations for 10th of Ramadan industrial zones.'}
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
              {isRtl ? 'تقديم طلب ترشيح الكوادر' : 'Submit Recommendations'}
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
                  {submittedData.isPendingConflict || submittedData.status === 'phone_duplicate_pending'
                    ? (isRtl ? 'تم تسجيل طلبك برقم مرجعي — قيد التدقيق الإداري' : 'Request Registered — Pending Verification')
                    : (isRtl ? 'تم تقديم طلب الترشيحات بنجاح!' : 'Recommendation Request Submitted!')}
                </h2>
                <p style={{ fontSize: '0.95rem', color: (submittedData.isPendingConflict || submittedData.status === 'phone_duplicate_pending') ? '#b45309' : '#64748b', marginBottom: '2rem', maxWidth: '600px', margin: '0 auto 2rem', lineHeight: 1.6 }}>
                  {submittedData.isPendingConflict || submittedData.status === 'phone_duplicate_pending'
                    ? (isRtl
                        ? 'نظراً لتطابق رقم الهاتف مع طلب سابق باسم مختلف، تم تحويل الطلب للمراجعة الإدارية للتحقق من صحة البيانات. يُرجى المتابعة بعد 24 ساعة برقم الطلب المرجعي أدناه.'
                        : 'Due to duplicate phone verification, your request is under administrative review. Please follow up after 24 hours using the reference number below.')
                    : (isRtl
                        ? `تم حفظ بيانات الـ ${submittedData.peopleCount || submittedData.people?.length || people.length} كادراً بنجاح، وطلبك الآن قيد المراجعة والتدقيق الإداري.`
                        : 'All candidate profiles have been recorded and are pending review.')}
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
                        ? 'يرجى العلم بأن جميع الترشيحات المسجلة مرتبطة ارتباطاً تاماً برقم هاتف مقدم الطلب الأساسي. يُحظر تماماً إدخال بيانات وهمية أو تضليل، وأي ضرر أو إساءة استخدام يعرّض صاحب الرقم الأساسي للمساءلة القانونية واتخاذ الإجراءات الجنائية اللازمة.'
                        : 'All candidate recommendations are legally attached to the primary submitter phone number. False information, damage, or misuse will lead to legal action.'}
                    </p>
                  </div>
                </div>

                {/* Progress Bar Header */}
                <div
                  style={{
                    background: '#ffffff',
                    border: '1px solid #e2e8f0',
                    borderRadius: '12px',
                    padding: '1.25rem 1.5rem',
                    marginBottom: '2rem',
                    boxShadow: '0 2px 8px rgba(0,0,0,0.03)'
                  }}
                >
                  <div
                    style={{
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'space-between',
                      flexWrap: 'wrap',
                      gap: '1rem'
                    }}
                  >
                    <div>
                      <div style={{ fontSize: '0.85rem', color: '#64748b', fontWeight: 600 }}>
                        {isRtl ? 'نسبة اكتمال بيانات الكوادر والترشيحات' : 'Candidate Profiles Progress'}
                      </div>
                      <div style={{ fontSize: '1.25rem', fontWeight: 800, color: '#09090b', display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                        <span>
                          {completedCount} {isRtl ? `من ${people.length} كادر مكتمل` : `of ${people.length} completed`}
                        </span>
                        {completedCount === people.length && (
                          <span style={{ fontSize: '0.8rem', color: '#16a34a', fontWeight: 700, background: '#dcfce7', padding: '0.15rem 0.5rem', borderRadius: '4px' }}>
                            {isRtl ? 'جاهز للإرسال' : 'Ready'}
                          </span>
                        )}
                      </div>
                    </div>

                    <div style={{ display: 'flex', gap: '0.4rem', flexWrap: 'wrap' }}>
                      {people.map((p, idx) => {
                        const nameValid = p.fullName.trim() && NAME_REGEX.test(p.fullName.trim()) && !p.nameError;
                        const phoneValid = p.phone.trim() && PHONE_REGEX.test(p.phone.trim()) && !p.phoneError && !p.phoneExists;
                        const titles = p.titles && p.titles.length > 0 ? p.titles : [];
                        const titlesValid =
                          titles.length > 0 &&
                          titles.every((t) => t.jobId && t.careerLevel && !t.jobError && !t.levelError);
                        const isComplete = nameValid && phoneValid && titlesValid;
                        const hasError = Boolean(
                          p.phoneError ||
                          p.phoneExists ||
                          p.nameError ||
                          p.jobError ||
                          p.levelError ||
                          p.titles?.some((t) => t.jobError || t.levelError)
                        );

                        return (
                          <button
                            key={idx}
                            type="button"
                            title={
                              idx === 0
                                ? (hasError ? 'مقدم الطلب: يوجد مشكلة في البيانات' : isComplete ? 'مقدم الطلب: مكتمل' : 'مقدم الطلب: غير مكتمل')
                                : (hasError ? `المرشح ${idx}: يوجد مشكلة في البيانات` : isComplete ? `المرشح ${idx}: مكتمل` : `المرشح ${idx}: غير مكتمل`)
                            }
                            style={{
                              width: '32px',
                              height: '32px',
                              borderRadius: '8px',
                              border: hasError ? '2px solid #b91c1c' : isComplete ? '1px solid #16a34a' : '1px solid #cbd5e1',
                              background: hasError ? '#ef4444' : isComplete ? '#22c55e' : '#f1f5f9',
                              color: hasError || isComplete ? '#ffffff' : '#64748b',
                              fontSize: '0.8rem',
                              fontWeight: 800,
                              display: 'flex',
                              alignItems: 'center',
                              justifyContent: 'center',
                              cursor: 'pointer',
                              transition: 'all 0.15s ease',
                              boxShadow: hasError ? '0 0 0 2px rgba(239, 68, 68, 0.25)' : 'none'
                            }}
                            onClick={() => {
                              scrollToPerson(idx);
                            }}
                          >
                            {hasError ? '!' : idx === 0 ? '★' : idx}
                          </button>
                        );
                      })}
                    </div>
                  </div>

                  {/* Issues bar if any candidate has problems */}
                  {peopleWithIssues.length > 0 && (
                    <div
                      style={{
                        marginTop: '1rem',
                        padding: '0.85rem 1rem',
                        background: peopleWithIssues.some((p) => p.hasError) ? '#fef2f2' : '#fffbeb',
                        border: peopleWithIssues.some((p) => p.hasError) ? '1px solid #fecaca' : '1px solid #fde68a',
                        borderRadius: '10px',
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'space-between',
                        flexWrap: 'wrap',
                        gap: '0.75rem'
                      }}
                    >
                      <div
                        style={{
                          display: 'flex',
                          alignItems: 'center',
                          gap: '0.5rem',
                          color: peopleWithIssues.some((p) => p.hasError) ? '#b91c1c' : '#b45309',
                          fontSize: '0.85rem',
                          fontWeight: 700
                        }}
                      >
                        <AlertCircle size={18} style={{ flexShrink: 0 }} />
                        <span>
                          {peopleWithIssues.some((p) => p.hasError)
                            ? (isRtl ? 'يوجد أخطاء في بيانات المرشحين التاليين (انقر للانتقال للمرشح):' : 'Issues detected for the following (click to jump):')
                            : (isRtl ? 'يتبقى استكمال بيانات المرشحين التاليين (انقر للانتقال):' : 'Incomplete profiles (click to jump):')}
                        </span>
                      </div>

                      <div style={{ display: 'flex', gap: '0.4rem', flexWrap: 'wrap' }}>
                        {peopleWithIssues.map((p) => (
                          <button
                            key={p.index}
                            type="button"
                            onClick={() => scrollToPerson(p.index)}
                            style={{
                              padding: '0.35rem 0.75rem',
                              borderRadius: '6px',
                              background: p.hasError ? '#ef4444' : '#ffffff',
                              color: p.hasError ? '#ffffff' : '#b45309',
                              border: p.hasError ? 'none' : '1px solid #fde68a',
                              fontSize: '0.78rem',
                              fontWeight: 700,
                              cursor: 'pointer',
                              display: 'inline-flex',
                              alignItems: 'center',
                              gap: '0.35rem',
                              boxShadow: '0 1px 2px rgba(0,0,0,0.05)',
                              transition: 'all 0.15s ease'
                            }}
                          >
                            <span>{p.label}</span>
                            <span style={{ fontSize: '0.7rem', opacity: 0.85 }}>[{p.issues.join('، ')}]</span>
                          </button>
                        ))}
                      </div>
                    </div>
                  )}
                </div>

                {/* 11 People Cards */}
                <div style={{ display: 'flex', flexDirection: 'column', gap: '1.5rem' }}>
                  {people.map((person, index) => {
                    const isPrimary = index === 0;
                    const hasError = Boolean(
                      person.phoneError ||
                      person.phoneExists ||
                      person.nameError ||
                      person.jobError ||
                      person.levelError ||
                      person.titles?.some((t) => t.jobError || t.levelError)
                    );

                    return (
                      <div
                        id={`person-card-${index}`}
                        key={index}
                        style={{
                          background: hasError ? '#fffbfb' : '#ffffff',
                          border: hasError
                            ? '2px solid #ef4444'
                            : isPrimary
                            ? '2px solid #09090b'
                            : '1px solid #e2e8f0',
                          borderRadius: '14px',
                          padding: '1.5rem',
                          boxShadow: hasError
                            ? '0 0 0 3px rgba(239, 68, 68, 0.15), 0 4px 14px rgba(239, 68, 68, 0.08)'
                            : isPrimary
                            ? '0 4px 15px rgba(0, 0, 0, 0.05)'
                            : '0 1px 3px rgba(0, 0, 0, 0.02)',
                          position: 'relative',
                          transition: 'all 0.2s ease'
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
                                background: hasError ? '#ef4444' : isPrimary ? '#09090b' : '#f1f5f9',
                                color: hasError || isPrimary ? '#ffffff' : '#475569',
                                fontWeight: 800,
                                fontSize: '0.9rem',
                                display: 'flex',
                                alignItems: 'center',
                                justifyContent: 'center',
                                transition: 'all 0.2s ease'
                              }}
                            >
                              {hasError ? '!' : isPrimary ? '★' : index + 1}
                            </div>
                            <div>
                              <h4 style={{ margin: 0, fontSize: '1.05rem', fontWeight: 800, color: hasError ? '#b91c1c' : '#09090b' }}>
                                {isPrimary
                                  ? (isRtl ? 'بيانات مقدم الطلب الأساسي' : 'Primary Submitter Profile')
                                  : (isRtl ? `المرشح رقم ${index} (موصى به)` : `Candidate Recommendation #${index}`)}
                                {person.fullName?.trim() ? ` — ${person.fullName.trim()}` : ''}
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

                          <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                            <div
                              style={{
                                padding: '0.25rem 0.65rem',
                                borderRadius: '6px',
                                background: hasError ? '#fee2e2' : isPrimary ? '#09090b' : '#f8fafc',
                                color: hasError ? '#dc2626' : isPrimary ? '#ffffff' : '#64748b',
                                fontSize: '0.75rem',
                                fontWeight: 700
                              }}
                            >
                              {hasError
                                ? (isRtl ? '⚠️ يوجد مشكلة في البيانات' : '⚠️ Issue in Profile')
                                : isPrimary
                                ? (isRtl ? 'صاحب الطلب (الأساسي)' : 'Submitter')
                                : (isRtl ? `مرشح موصى به رقم ${index}` : `Recommendation #${index}`)}
                            </div>

                            {!isPrimary && people.length > 2 && (
                              <button
                                type="button"
                                onClick={() => handleRemovePerson(index)}
                                title={isRtl ? 'حذف هذا المرشح' : 'Remove candidate'}
                                style={{
                                  display: 'inline-flex',
                                  alignItems: 'center',
                                  gap: '0.3rem',
                                  padding: '0.3rem 0.65rem',
                                  borderRadius: '6px',
                                  background: '#fee2e2',
                                  border: '1px solid #fecaca',
                                  color: '#dc2626',
                                  fontSize: '0.75rem',
                                  fontWeight: 700,
                                  cursor: 'pointer',
                                  transition: 'all 0.15s ease'
                                }}
                                onMouseEnter={(e) => {
                                  e.currentTarget.style.background = '#fca5a5';
                                }}
                                onMouseLeave={(e) => {
                                  e.currentTarget.style.background = '#fee2e2';
                                }}
                              >
                                <Trash2 size={13} />
                                <span>{isRtl ? 'حذف المرشح' : 'Remove'}</span>
                              </button>
                            )}
                          </div>
                        </div>

                        {/* Issue / Duplicate Alert Banner */}
                        {hasError && (
                          <div
                            style={{
                              background: '#fef2f2',
                              border: '1.5px solid #ef4444',
                              borderRadius: '8px',
                              padding: '0.65rem 0.85rem',
                              marginBottom: '1.25rem',
                              display: 'flex',
                              alignItems: 'flex-start',
                              gap: '0.5rem',
                              color: '#b91c1c',
                              fontSize: '0.85rem',
                              fontWeight: 700
                            }}
                          >
                            <AlertCircle size={18} color="#dc2626" style={{ flexShrink: 0, marginTop: '2px' }} />
                            <div>
                              <div style={{ fontWeight: 800 }}>
                                {isRtl
                                  ? `تنبيه في بيانات ${isPrimary ? 'مقدم الطلب الأساسي' : `المرشح رقم ${index}`}:`
                                  : `Issue in ${isPrimary ? 'Primary Submitter' : `Candidate #${index}`}:`}
                              </div>
                              <div style={{ fontSize: '0.8rem', fontWeight: 600, marginTop: '0.2rem', color: '#991b1b' }}>
                                {person.phoneError ||
                                  person.nameError ||
                                  person.jobError ||
                                  person.levelError ||
                                  person.titles?.find((t) => t.jobError || t.levelError)?.jobError ||
                                  person.titles?.find((t) => t.jobError || t.levelError)?.levelError ||
                                  (isRtl ? 'يرجى مراجعة وتصحيح الحقول المحددة باللون الأحمر' : 'Please fix the fields highlighted in red')}
                              </div>
                            </div>
                          </div>
                        )}

                        {/* Grid Fields */}
                        <div
                          style={{
                            display: 'grid',
                            gridTemplateColumns: 'repeat(auto-fit, minmax(min(100%, 220px), 1fr))',
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
                              id={`person-name-input-${index}`}
                              type="text"
                              value={person.fullName}
                              onChange={(e) => handleFieldChange(index, 'fullName', e.target.value)}
                              onBlur={() => handleNameBlur(index)}
                              placeholder={isRtl ? 'مثال: أحمد محمد علي' : 'e.g. Ahmed Mohamed Ali'}
                              style={{
                                width: '100%',
                                padding: '0.65rem 0.85rem',
                                borderRadius: '8px',
                                border: person.nameError
                                  ? '1.5px solid #ef4444'
                                  : '1px solid #cbd5e1',
                                outline: 'none',
                                fontSize: '0.9rem',
                                background: person.nameError ? '#fff5f5' : '#ffffff',
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
                                id={`person-phone-input-${index}`}
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
                                  border: (person.phoneError || person.phoneExists) ? '2px solid #ef4444' : '1px solid #cbd5e1',
                                  outline: 'none',
                                  fontSize: '0.9rem',
                                  background: (person.phoneError || person.phoneExists) ? '#fff5f5' : '#ffffff',
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
                        </div>

                        {/* 3. Titles & Career Levels (Up to 3 per person) */}
                        <div
                          style={{
                            marginTop: '1.25rem',
                            paddingTop: '1.25rem',
                            borderTop: '1px solid #f1f5f9'
                          }}
                        >
                          <div
                            style={{
                              display: 'flex',
                              alignItems: 'center',
                              justifyContent: 'space-between',
                              marginBottom: '0.85rem',
                              flexWrap: 'wrap',
                              gap: '0.5rem'
                            }}
                          >
                            <div
                              style={{
                                fontSize: '0.925rem',
                                fontWeight: 800,
                                color: '#0f172a',
                                display: 'flex',
                                alignItems: 'center',
                                gap: '0.45rem'
                              }}
                            >
                              <Briefcase size={17} style={{ color: '#0f172a' }} />
                              <span>{isRtl ? 'المسميات الوظيفية ومستويات الخبرة (حتى 3 تخصصات)' : 'Job Titles & Career Levels (Up to 3)'}</span>
                            </div>

                            {(!person.titles || person.titles.length < 3) && (
                              <button
                                type="button"
                                onClick={() => handleAddTitle(index)}
                                style={{
                                  display: 'inline-flex',
                                  alignItems: 'center',
                                  gap: '0.4rem',
                                  padding: '0.4rem 0.85rem',
                                  borderRadius: '8px',
                                  background: '#f8fafc',
                                  border: '1px solid #cbd5e1',
                                  color: '#0f172a',
                                  fontSize: '0.78rem',
                                  fontWeight: 700,
                                  cursor: 'pointer',
                                  transition: 'all 0.15s ease',
                                  boxShadow: '0 1px 2px rgba(0,0,0,0.03)'
                                }}
                                onMouseEnter={(e) => {
                                  e.currentTarget.style.background = '#0f172a';
                                  e.currentTarget.style.color = '#ffffff';
                                  e.currentTarget.style.borderColor = '#0f172a';
                                }}
                                onMouseLeave={(e) => {
                                  e.currentTarget.style.background = '#f8fafc';
                                  e.currentTarget.style.color = '#0f172a';
                                  e.currentTarget.style.borderColor = '#cbd5e1';
                                }}
                              >
                                <Plus size={14} />
                                {isRtl
                                  ? `+ إضافة مسمى وظيفي إضافي (${(person.titles?.length || 1) + 1}/3)`
                                  : `+ Add job title (${(person.titles?.length || 1) + 1}/3)`}
                              </button>
                            )}
                          </div>

                          <div style={{ display: 'flex', flexDirection: 'column', gap: '0.75rem' }}>
                            {(person.titles && person.titles.length > 0 ? person.titles : [{ id: '1', jobId: person.jobId, careerLevel: person.careerLevel }]).map((titleItem, titleIdx) => {
                              const isPrimaryTitle = titleIdx === 0;

                              return (
                                <div
                                  key={titleItem.id || titleIdx}
                                  style={{
                                    background: isPrimaryTitle ? '#f8fafc' : '#ffffff',
                                    border: '1px solid #e2e8f0',
                                    borderInlineStart: isPrimaryTitle ? '3.5px solid #0f172a' : '3.5px solid #94a3b8',
                                    borderRadius: '10px',
                                    padding: '0.9rem 1rem',
                                    position: 'relative',
                                    transition: 'all 0.15s ease'
                                  }}
                                >
                                  {/* Title Badge & Remove Action */}
                                  <div
                                    style={{
                                      display: 'flex',
                                      alignItems: 'center',
                                      justifyContent: 'space-between',
                                      marginBottom: '0.75rem'
                                    }}
                                  >
                                    <span
                                      style={{
                                        fontSize: '0.75rem',
                                        fontWeight: 800,
                                        padding: '0.2rem 0.6rem',
                                        borderRadius: '6px',
                                        background: isPrimaryTitle ? '#0f172a' : titleIdx === 1 ? '#e0f2fe' : '#f1f5f9',
                                        color: isPrimaryTitle ? '#ffffff' : titleIdx === 1 ? '#0369a1' : '#475569',
                                        border: isPrimaryTitle ? 'none' : '1px solid #cbd5e1'
                                      }}
                                    >
                                      {titleIdx === 0
                                        ? (isRtl ? 'المسمى الوظيفي الأول (الأساسي)' : 'First Job Title (Primary)')
                                        : titleIdx === 1
                                        ? (isRtl ? 'المسمى الوظيفي الثاني (إضافي)' : 'Second Job Title (Optional)')
                                        : (isRtl ? 'المسمى الوظيفي الثالث (إضافي)' : 'Third Job Title (Optional)')}
                                    </span>

                                    {!isPrimaryTitle && (
                                      <button
                                        type="button"
                                        onClick={() => handleRemoveTitle(index, titleIdx)}
                                        style={{
                                          background: '#fef2f2',
                                          border: '1px solid #fee2e2',
                                          borderRadius: '6px',
                                          color: '#ef4444',
                                          fontSize: '0.75rem',
                                          fontWeight: 700,
                                          cursor: 'pointer',
                                          display: 'inline-flex',
                                          alignItems: 'center',
                                          gap: '0.3rem',
                                          padding: '0.25rem 0.55rem',
                                          transition: 'all 0.15s ease'
                                        }}
                                        onMouseEnter={(e) => {
                                          e.currentTarget.style.background = '#fee2e2';
                                        }}
                                        onMouseLeave={(e) => {
                                          e.currentTarget.style.background = '#fef2f2';
                                        }}
                                      >
                                        <Trash2 size={13} />
                                        {isRtl ? 'حذف هذا المسمى' : 'Remove'}
                                      </button>
                                    )}
                                  </div>

                                  <div
                                    style={{
                                      display: 'grid',
                                      gridTemplateColumns: 'repeat(auto-fit, minmax(min(100%, 220px), 1fr))',
                                      gap: '0.85rem'
                                    }}
                                  >
                                    {/* Job Title Select */}
                                    <div>
                                      <label
                                        style={{
                                          display: 'block',
                                          fontSize: '0.8rem',
                                          fontWeight: 700,
                                          color: '#334155',
                                          marginBottom: '0.3rem'
                                        }}
                                      >
                                        {isRtl ? 'التخصص / المسمى الوظيفي' : 'Job Title'} *
                                      </label>
                                      <SearchableJobSelect
                                        jobs={jobs}
                                        selectedJobId={titleItem.jobId}
                                        onSelect={(job) => {
                                          handleTitleChange(index, titleIdx, 'jobId', job._id);
                                          handleTitleChange(index, titleIdx, 'jobTitle', job.nameAr || job.name);
                                        }}
                                        error={titleItem.jobError}
                                        isRtl={isRtl}
                                      />
                                      {titleItem.jobError && (
                                        <div style={{ color: '#ef4444', fontSize: '0.72rem', marginTop: '0.25rem', fontWeight: 600 }}>
                                          {titleItem.jobError}
                                        </div>
                                      )}
                                    </div>

                                    {/* Career Level Select */}
                                    <div>
                                      <label
                                        style={{
                                          display: 'block',
                                          fontSize: '0.8rem',
                                          fontWeight: 700,
                                          color: '#334155',
                                          marginBottom: '0.3rem'
                                        }}
                                      >
                                        {isRtl ? 'مستوى الخبرة المهنية' : 'Career Level'} *
                                      </label>
                                      <select
                                        value={titleItem.careerLevel}
                                        onChange={(e) => handleTitleChange(index, titleIdx, 'careerLevel', e.target.value)}
                                        style={{
                                          width: '100%',
                                          padding: '0.65rem 0.85rem',
                                          borderRadius: '8px',
                                          border: titleItem.levelError ? '1.5px solid #ef4444' : '1px solid #cbd5e1',
                                          outline: 'none',
                                          fontSize: '0.85rem',
                                          background: '#ffffff',
                                          color: titleItem.careerLevel ? '#09090b' : '#a1a1aa'
                                        }}
                                      >
                                        <option value="">{isRtl ? 'اختر مستوى الخبرة...' : 'Select career level...'}</option>
                                        {CAREER_LEVELS.map((lvl) => (
                                          <option key={lvl} value={lvl}>
                                            {lvl}
                                          </option>
                                        ))}
                                      </select>
                                      {titleItem.levelError && (
                                        <div style={{ color: '#ef4444', fontSize: '0.72rem', marginTop: '0.25rem', fontWeight: 600 }}>
                                          {titleItem.levelError}
                                        </div>
                                      )}
                                    </div>
                                  </div>
                                </div>
                              );
                            })}
                          </div>
                        </div>
                      </div>
                    );
                  })}
                </div>

                {/* Button to Add More Candidate Recommendations */}
                <div style={{ marginTop: '1.5rem', textAlign: 'center' }}>
                  <button
                    type="button"
                    onClick={handleAddPerson}
                    style={{
                      display: 'inline-flex',
                      alignItems: 'center',
                      gap: '0.5rem',
                      padding: '0.85rem 1.75rem',
                      borderRadius: '12px',
                      background: '#ffffff',
                      border: '2px dashed #09090b',
                      color: '#09090b',
                      fontSize: '0.95rem',
                      fontWeight: 800,
                      cursor: 'pointer',
                      transition: 'all 0.15s ease',
                      boxShadow: '0 2px 5px rgba(0, 0, 0, 0.05)'
                    }}
                    onMouseEnter={(e) => {
                      e.currentTarget.style.background = '#09090b';
                      e.currentTarget.style.color = '#ffffff';
                    }}
                    onMouseLeave={(e) => {
                      e.currentTarget.style.background = '#ffffff';
                      e.currentTarget.style.color = '#09090b';
                    }}
                  >
                    <Plus size={18} />
                    <span>{isRtl ? `+ إضافة مرشح موصى به آخر (المرشح رقم ${people.length})` : `+ Add Another Candidate Recommendation (#${people.length})`}</span>
                  </button>
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
                        ? `أقر أنا مقدم الطلب بأن جميع البيانات والترشيحات المسجلة (${people.length} كوادر) صحيحة ومربوطة برقم هاتفي الشخصي، وأتحمل كامل المسؤولية القانونية عن دقة هذه البيانات وأعلم أن أي تلاعب أو أرقام وهمية يعرّضني للمساءلة القانونية والإجراءات الجنائية المباشرة.`
                        : `I hereby declare that all ${people.length} submitted profiles are accurate and legally attached to my personal phone number.`}
                    </span>
                  </label>

                  {peopleWithIssues.length > 0 && (
                    <div
                      style={{
                        marginTop: '1.25rem',
                        padding: '0.75rem 1rem',
                        background: '#fef2f2',
                        border: '1px solid #fecaca',
                        borderRadius: '8px',
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'space-between',
                        flexWrap: 'wrap',
                        gap: '0.5rem'
                      }}
                    >
                      <div style={{ display: 'flex', alignItems: 'center', gap: '0.4rem', color: '#b91c1c', fontSize: '0.85rem', fontWeight: 700 }}>
                        <AlertCircle size={16} />
                        <span>{isRtl ? 'بيانات تحتاج استكمال أو تصحيح (انقر للانتقال):' : 'Profiles needing completion (click to jump):'}</span>
                      </div>
                      <div style={{ display: 'flex', gap: '0.35rem', flexWrap: 'wrap' }}>
                        {peopleWithIssues.map((p) => (
                          <button
                            key={p.index}
                            type="button"
                            onClick={() => scrollToPerson(p.index)}
                            style={{
                              padding: '0.25rem 0.6rem',
                              borderRadius: '6px',
                              background: p.hasError ? '#ef4444' : '#ffffff',
                              color: p.hasError ? '#ffffff' : '#b91c1c',
                              border: '1px solid #f87171',
                              fontSize: '0.75rem',
                              fontWeight: 800,
                              cursor: 'pointer'
                            }}
                          >
                            {p.label}
                          </button>
                        ))}
                      </div>
                    </div>
                  )}

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
                      {completedCount === people.length ? (
                        <span style={{ color: '#16a34a', fontWeight: 700, display: 'inline-flex', alignItems: 'center', gap: '0.35rem' }}>
                          <CheckCircle2 size={16} />
                          {isRtl ? `اكتملت بيانات الـ ${people.length} كادراً بنجاح` : `All ${people.length} profiles completed`}
                        </span>
                      ) : (
                        <span style={{ color: '#d97706', fontWeight: 600, display: 'inline-flex', alignItems: 'center', gap: '0.35rem' }}>
                          <AlertTriangle size={16} />
                          {isRtl
                            ? `يتبقى استكمال بيانات ${people.length - completedCount} مرشحاً`
                            : `${people.length - completedCount} profiles remaining`}
                        </span>
                      )}
                    </div>

                    <button
                      type="submit"
                      disabled={submitting || submitThrottle.isLockedOut}
                      style={{
                        padding: '0.875rem 2.5rem',
                        borderRadius: '10px',
                        background: submitThrottle.isLockedOut
                          ? '#94a3b8'
                          : isFormValid
                          ? '#09090b'
                          : '#1e293b',
                        color: '#ffffff',
                        fontWeight: 800,
                        fontSize: '1rem',
                        border: 'none',
                        cursor: submitThrottle.isLockedOut ? 'not-allowed' : 'pointer',
                        transition: 'all 0.15s',
                        display: 'inline-flex',
                        alignItems: 'center',
                        gap: '0.5rem',
                        boxShadow: isFormValid ? '0 4px 12px rgba(0,0,0,0.15)' : 'none'
                      }}
                    >
                      {submitThrottle.isLockedOut ? (
                        <>
                          <Clock size={18} />
                          {isRtl ? `انتظر ${submitThrottle.countdown} ثانية` : `Wait ${submitThrottle.countdown}s`}
                        </>
                      ) : submitting ? (
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
                          {isRtl ? `إرسال طلب الترشيحات (${people.length} كادر)` : `Submit Nominations (${people.length} People)`}
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
                <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(min(100%, 240px), 1fr))', gap: '1rem', marginBottom: '1.25rem' }}>
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
                      {isRtl ? 'رقم هاتف مقدم الطلب (مطلوب للتحقق من الهوية)' : 'Submitter Phone (Required for verification)'} *
                    </label>
                    <input
                      type="tel"
                      required
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
                  disabled={trackLoading || !trackReqNumber.trim() || !trackPhone.trim() || trackThrottle.isLockedOut}
                  style={{
                    padding: '0.75rem 2rem',
                    borderRadius: '8px',
                    background: (!trackThrottle.isLockedOut && trackReqNumber.trim() && trackPhone.trim()) ? '#09090b' : '#94a3b8',
                    color: '#ffffff',
                    fontWeight: 700,
                    border: 'none',
                    cursor: (trackReqNumber.trim() && trackPhone.trim() && !trackThrottle.isLockedOut) ? 'pointer' : 'not-allowed',
                    display: 'inline-flex',
                    alignItems: 'center',
                    gap: '0.5rem'
                  }}
                >
                  {trackThrottle.isLockedOut ? (
                    <>
                      <Clock size={16} />
                      {isRtl ? `انتظر ${trackThrottle.countdown} ثانية` : `Wait ${trackThrottle.countdown}s`}
                    </>
                  ) : trackLoading ? (
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
                    {trackResult.status === 'phone_duplicate_pending' && (
                      <span
                        style={{
                          display: 'inline-flex',
                          alignItems: 'center',
                          gap: '0.4rem',
                          padding: '0.45rem 1rem',
                          borderRadius: '9999px',
                          background: '#fef3c7',
                          color: '#b45309',
                          border: '1px solid #fde68a',
                          fontWeight: 800,
                          fontSize: '0.85rem'
                        }}
                      >
                        <Clock size={16} />
                        {isRtl ? '⚠️ قيد التدقيق الإداري (متابعة بعد 24 ساعة)' : 'Pending Verification (24h)'}
                      </span>
                    )}
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
                    {(trackResult.status === 'approved' || trackResult.status === 'partially_approved') && (
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
                        {trackResult.status === 'partially_approved'
                          ? isRtl ? 'تم قبول الترشيحات المرفقة' : 'Recommendations Approved'
                          : isRtl ? 'تم القبول والاعتماد' : 'Approved'}
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

                {trackResult.status === 'phone_duplicate_pending' && (
                  <div
                    style={{
                      background: '#fffbeb',
                      border: '1.5px solid #f59e0b',
                      borderRadius: '10px',
                      padding: '1rem 1.25rem',
                      marginBottom: '1.5rem',
                      display: 'flex',
                      gap: '0.75rem',
                      alignItems: 'center'
                    }}
                  >
                    <Clock size={20} style={{ color: '#d97706', flexShrink: 0 }} />
                    <div style={{ fontSize: '0.875rem', color: '#92400e', fontWeight: 600, lineHeight: 1.5 }}>
                      {trackResult.conflictFollowUpMessage ||
                        (isRtl
                          ? 'الطلب قيد المراجعة والتدقيق الإداري للتحقق من تطابق رقم الهاتف. يُرجى المتابعة بعد مرور 24 ساعة برقم الطلب.'
                          : 'This request is pending administrative verification for phone number matching. Please follow up after 24 hours.')}
                    </div>
                  </div>
                )}

                {trackResult.status === 'rejected' && (
                  <div
                    style={{
                      background: '#fef2f2',
                      border: '1.5px solid #ef4444',
                      borderRadius: '10px',
                      padding: '1.25rem',
                      marginBottom: '1.5rem',
                      display: 'flex',
                      flexDirection: 'column',
                      gap: '0.75rem'
                    }}
                  >
                    <div style={{ display: 'flex', gap: '0.75rem', alignItems: 'flex-start' }}>
                      <AlertCircle size={22} style={{ color: '#dc2626', flexShrink: 0, marginTop: '2px' }} />
                      <div>
                        <div style={{ fontSize: '0.95rem', color: '#991b1b', fontWeight: 800, marginBottom: '0.25rem' }}>
                          {isRtl ? 'تم رفض هذا الطلب' : 'This request was rejected'}
                        </div>
                        <div style={{ fontSize: '0.875rem', color: '#7f1d1d', lineHeight: 1.6 }}>
                          {trackResult.adminNotes
                            ? (isRtl ? `ملاحظات الإدارة: ${trackResult.adminNotes}` : `Admin note: ${trackResult.adminNotes}`)
                            : (isRtl
                              ? 'تم رفض هذا الطلب نظراً لعدم صحة بعض البيانات المدخلة. يمكنك الآن إعادة إدخال وتصحيح البيانات وتقديم طلب ترشيح جديد بكل سهولة.'
                              : 'This request was rejected due to inaccurate data. You can now re-enter the correct data and submit a new request without issue.')}
                        </div>
                      </div>
                    </div>
                    <div style={{ display: 'flex', justifyContent: 'flex-end', marginTop: '0.25rem' }}>
                      <button
                        onClick={() => {
                          setActiveTab('form');
                          window.scrollTo({ top: 0, behavior: 'smooth' });
                        }}
                        style={{
                          background: '#dc2626',
                          color: '#ffffff',
                          border: 'none',
                          borderRadius: '8px',
                          padding: '0.5rem 1.25rem',
                          fontSize: '0.875rem',
                          fontWeight: 700,
                          cursor: 'pointer',
                          display: 'inline-flex',
                          alignItems: 'center',
                          gap: '0.5rem'
                        }}
                      >
                        {isRtl ? 'تقديم طلب جديد وتصحيح البيانات' : 'Submit New Corrected Request'}
                      </button>
                    </div>
                  </div>
                )}

                {/* Submitter & Meta Details */}
                <div
                  style={{
                    display: 'grid',
                    gridTemplateColumns: 'repeat(auto-fit, minmax(min(100%, 200px), 1fr))',
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
                  {isRtl ? `الكوادر المدرجة في هذا الطلب (${trackResult.people?.length || 0} كادر):` : `Submitted Candidates (${trackResult.people?.length || 0} Profiles):`}
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
