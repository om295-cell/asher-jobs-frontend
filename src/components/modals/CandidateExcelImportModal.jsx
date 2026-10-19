import React, { useState, useRef, useEffect, useMemo } from 'react';
import { useLanguage } from '../../context/LanguageContext';
import { useToast } from '../../context/ToastContext';
import { adminApi } from '../../api/admin.api';
import { jobsApi } from '../../api/jobs.api';
import { recommendationApi } from '../../api/recommendation.api';
import {
  Upload,
  FileSpreadsheet,
  CheckCircle2,
  AlertTriangle,
  XCircle,
  RefreshCw,
  Search,
  Trash2,
  X,
  UserCheck,
  UserPlus,
  Briefcase,
  Layers,
  ArrowRight,
  ArrowLeft,
  Check,
  Filter,
  Download,
  Phone,
  Info
} from 'lucide-react';
import LoadingSpinner from '../ui/LoadingSpinner';

const CAREER_LEVEL_OPTIONS = [
  'مبتدئ (1-3 سنوات)',
  'متوسط (3-5 سنوات)',
  'متقدم (5-7 سنوات)',
  'صاحب خبره كبيره (أكثر من 7 سنوات)'
];

export default function CandidateExcelImportModal({ isOpen, onClose, categories = [], onFinished }) {
  const { isRtl } = useLanguage();
  const { showToast } = useToast();

  // Step 1: Upload & Main Candidate
  // Step 2: Review & Approval Table
  // Step 3: Execution Progress / Summary
  const [step, setStep] = useState(1);

  // File state
  const [file, setFile] = useState(null);
  const [defaultCategoryId, setDefaultCategoryId] = useState(categories[0]?._id || '');
  const [extracting, setExtracting] = useState(false);
  const fileInputRef = useRef(null);

  // Main Candidate State (Requirement 1)
  const [mainMode, setMainMode] = useState('existing'); // 'existing' | 'new'
  const [mainSearch, setMainSearch] = useState('');
  const [mainCandidatesList, setMainCandidatesList] = useState([]);
  const [searchingMain, setSearchingMain] = useState(false);
  const [selectedMainCandidate, setSelectedMainCandidate] = useState(null);

  // New Main Candidate Form
  const [newMainForm, setNewMainForm] = useState({
    fullName: '',
    phone: '',
    jobTitle: '',
    careerLevel: CAREER_LEVEL_OPTIONS[1],
    categoryId: categories[0]?._id || ''
  });

  // Step 2: Extracted items & Summary
  const [items, setItems] = useState([]);
  const [summary, setSummary] = useState({
    totalRows: 0,
    validRowsCount: 0,
    phoneConflictCount: 0,
    newTitlesCount: 0,
    existingTitlesCount: 0
  });

  // Available system jobs for selection / search
  const [jobs, setJobs] = useState([]);
  const [jobsLoading, setJobsLoading] = useState(false);

  useEffect(() => {
    if (!isOpen) return;
    setJobsLoading(true);
    jobsApi
      .getJobs()
      .then((res) => {
        if (res.data?.data) {
          setJobs(res.data.data);
        }
      })
      .catch(() => {})
      .finally(() => setJobsLoading(false));
  }, [isOpen]);

  // Step 2 Filters & Search
  const [filterTab, setFilterTab] = useState('all'); // 'all' | 'conflicts' | 'newTitles' | 'valid'
  const [tableSearch, setTableSearch] = useState('');

  // Step 3: Processing & Results
  const [processing, setProcessing] = useState(false);
  const [importResult, setImportResult] = useState(null);

  // Quick candidate search for main candidate
  useEffect(() => {
    if (!isOpen || mainMode !== 'existing') return;
    const timer = setTimeout(() => {
      setSearchingMain(true);
      adminApi
        .searchMainCandidates({ search: mainSearch })
        .then((res) => {
          setMainCandidatesList(res.data?.data || []);
        })
        .catch(() => {})
        .finally(() => setSearchingMain(false));
    }, 250);

    return () => clearTimeout(timer);
  }, [mainSearch, mainMode, isOpen]);

  // Filtered Items for Display in Step 2 Table (Hook called unconditionally)
  const filteredItems = useMemo(() => {
    return items.filter((item) => {
      // Tab filter
      if (filterTab === 'conflicts' && !item.phoneExists) return false;
      if (filterTab === 'newTitles' && item.titleExists) return false;
      if (filterTab === 'valid' && (!item.isPhoneValid || !item.name)) return false;

      // Text search
      if (tableSearch.trim()) {
        const query = tableSearch.toLowerCase().trim();
        const nameMatch = item.name?.toLowerCase().includes(query);
        const phoneMatch = item.phone?.includes(query);
        const jobMatch = item.jobTitle?.toLowerCase().includes(query);
        if (!nameMatch && !phoneMatch && !jobMatch) return false;
      }

      return true;
    });
  }, [items, filterTab, tableSearch]);

  const handleReset = () => {
    setStep(1);
    setFile(null);
    setItems([]);
    setImportResult(null);
    setProcessing(false);
    setSelectedMainCandidate(null);
    setMainSearch('');
  };

  const handleClose = () => {
    handleReset();
    onClose();
  };

  const handleFileChange = (e) => {
    const selected = e.target.files?.[0];
    if (selected) {
      setFile(selected);
    }
  };

  // Step 1 -> Step 2: Extract data from Excel
  const handleExtract = async () => {
    if (!file) {
      showToast(isRtl ? 'يرجى اختيار ملف إكسيل (.xlsx أو .xls أو .csv)' : 'Please select an Excel file', 'warning');
      return;
    }

    if (mainMode === 'existing' && !selectedMainCandidate) {
      showToast(isRtl ? 'يرجى اختيار المرشح الرئيسي المسجل أولاً' : 'Please select the main candidate first', 'warning');
      return;
    }

    if (mainMode === 'new') {
      if (!newMainForm.fullName.trim() || !newMainForm.phone.trim() || !newMainForm.jobTitle.trim()) {
        showToast(isRtl ? 'يرجى إكمال بيانات المرشح الرئيسي الجديد (الاسم، الهاتف، المسمى الوظيفي)' : 'Please complete new main candidate details', 'warning');
        return;
      }
    }

    try {
      setExtracting(true);
      const formData = new FormData();
      formData.append('file', file);
      if (defaultCategoryId) {
        formData.append('defaultCategoryId', defaultCategoryId);
      }

      const res = await adminApi.extractCandidatesExcel(formData);
      const data = res.data?.data;

      if (!data || !data.items || data.items.length === 0) {
        showToast(isRtl ? 'لم يتم العثور على أي بيانات صالحة في الملف المرفوع' : 'No valid candidate data found in file', 'warning');
        return;
      }

      const initialized = (data.items || []).map((item) => ({
        ...item,
        titleMode: item.titleExists ? 'existing' : 'new',
        jobId: item.matchedJob?.id || '',
        jobSearch: '',
        phoneChecking: false
      }));

      setItems(initialized);
      setSummary({
        totalRows: data.totalRows || 0,
        validRowsCount: data.validRowsCount || 0,
        phoneConflictCount: data.phoneConflictCount || 0,
        newTitlesCount: data.newTitlesCount || 0,
        existingTitlesCount: data.existingTitlesCount || 0
      });

      setStep(2);
      showToast(isRtl ? `تم استخراج ${data.items.length} مرشح بنجاح للمراجعة` : `Extracted ${data.items.length} candidates for review`, 'success');
    } catch (err) {
      showToast(err.response?.data?.message || (isRtl ? 'فشل استخراج البيانات من الملف' : 'Extraction failed'), 'error');
    } finally {
      setExtracting(false);
    }
  };

  // Step 2 Row handlers
  const handleToggleInclude = (id) => {
    setItems((prev) =>
      prev.map((item) => (item.id === id ? { ...item, includeInImport: !item.includeInImport } : item))
    );
  };

  const handleToggleApproveTitle = (id) => {
    setItems((prev) =>
      prev.map((item) => (item.id === id ? { ...item, approveNewTitle: !item.approveNewTitle } : item))
    );
  };

  const handleReplaceChoiceChange = (id, choice) => {
    setItems((prev) =>
      prev.map((item) => (item.id === id ? { ...item, replaceChoice: choice } : item))
    );
  };

  const handleItemFieldChange = (id, field, value) => {
    setItems((prev) =>
      prev.map((item) => (item.id === id ? { ...item, [field]: value } : item))
    );
  };

  // Handle phone changes with formatting & validation
  const handlePhoneChange = (id, rawValue) => {
    const digits = rawValue.replace(/\D/g, '').slice(0, 11);
    const isValidEgyptian = /^01[0125][0-9]{8}$/.test(digits);

    setItems((prev) => {
      const duplicateInBatch = prev.some((other) => other.id !== id && other.phone === digits);

      return prev.map((item) => {
        if (item.id !== id) return item;

        let phoneError = '';
        if (!digits) {
          phoneError = isRtl ? 'رقم الهاتف مطلوب' : 'Phone is required';
        } else if (digits.length === 11 && !isValidEgyptian) {
          phoneError = isRtl ? 'يجب أن يبدأ بـ 010 أو 011 أو 012 أو 015 وبطول 11 رقماً' : 'Invalid Egyptian mobile';
        } else if (duplicateInBatch) {
          phoneError = isRtl ? 'رقم الهاتف مكرر داخل نفس الملف' : 'Duplicate phone in file';
        }

        const isNowValid = isValidEgyptian && !duplicateInBatch;

        return {
          ...item,
          phone: digits,
          isPhoneValid: isNowValid,
          phoneError,
          phoneExists: item.existingCandidate?.phone === digits ? item.phoneExists : false,
          includeInImport: isNowValid && !!item.name
        };
      });
    });
  };

  // Handle phone blur to check against database
  const handlePhoneBlur = async (id) => {
    const item = items.find((i) => i.id === id);
    if (!item || !item.phone || item.phone.length !== 11 || !item.isPhoneValid) return;

    try {
      setItems((prev) =>
        prev.map((it) => (it.id === id ? { ...it, phoneChecking: true } : it))
      );
      const res = await recommendationApi.checkPhone(item.phone, false, item.name);
      const data = res.data?.data;

      setItems((prev) =>
        prev.map((it) => {
          if (it.id !== id) return it;
          if (data && !data.isAvailable) {
            return {
              ...it,
              phoneChecking: false,
              phoneExists: true,
              existingCandidate: it.existingCandidate || {
                fullName: data.existingName || (isRtl ? 'مرشح مسجل' : 'Registered Candidate'),
                phone: item.phone,
                currentJobTitle: data.existingJob || '',
                careerLevel: ''
              }
            };
          } else {
            return {
              ...it,
              phoneChecking: false,
              phoneExists: false
            };
          }
        })
      );
    } catch (e) {
      setItems((prev) =>
        prev.map((it) => (it.id === id ? { ...it, phoneChecking: false } : it))
      );
    }
  };

  // Switch job title mode between 'existing' (from system) and 'new' (custom/new title)
  const handleTitleModeChange = (id, mode) => {
    setItems((prev) =>
      prev.map((item) => {
        if (item.id !== id) return item;
        if (mode === 'existing') {
          let matched = null;
          if (item.jobId) {
            matched = jobs.find((j) => String(j._id) === String(item.jobId));
          }
          if (!matched && item.jobTitle) {
            const cleanTitle = item.jobTitle.trim().toLowerCase();
            matched = jobs.find(
              (j) =>
                (j.name && j.name.toLowerCase() === cleanTitle) ||
                (j.nameAr && j.nameAr.toLowerCase() === cleanTitle)
            );
          }
          if (!matched && jobs.length > 0) {
            matched = jobs[0];
          }

          return {
            ...item,
            titleMode: 'existing',
            titleExists: true,
            approveNewTitle: false,
            jobId: matched ? matched._id : '',
            jobTitle: matched ? (matched.nameAr || matched.name) : item.jobTitle,
            categoryId: matched ? (matched.categoryId?._id || matched.categoryId) : item.categoryId
          };
        } else {
          return {
            ...item,
            titleMode: 'new',
            titleExists: false,
            approveNewTitle: true,
            jobId: '',
            categoryId: item.categoryId || categories[0]?._id || ''
          };
        }
      })
    );
  };

  // Handle selecting an existing job from system
  const handleSelectExistingJob = (id, selectedJob) => {
    setItems((prev) =>
      prev.map((item) => {
        if (item.id !== id) return item;
        return {
          ...item,
          jobId: selectedJob._id,
          jobTitle: selectedJob.nameAr || selectedJob.name,
          categoryId: selectedJob.categoryId?._id || selectedJob.categoryId,
          categoryName: selectedJob.categoryId?.nameAr || selectedJob.categoryId?.name || '',
          titleExists: true,
          approveNewTitle: false
        };
      })
    );
  };

  const handleDeleteItem = (id) => {
    setItems((prev) => prev.filter((item) => item.id !== id));
  };

  // Bulk actions on Step 2
  const handleBulkSelectAll = (checked) => {
    setItems((prev) => prev.map((item) => ({ ...item, includeInImport: checked })));
  };

  const handleBulkApproveAllNewTitles = () => {
    setItems((prev) =>
      prev.map((item) => (!item.titleExists ? { ...item, approveNewTitle: true } : item))
    );
    showToast(isRtl ? 'تم تفعيل اعتماد جميع المسميات الوظيفية الجديدة' : 'Approved all new job titles', 'success');
  };

  const handleBulkSetReplaceChoice = (choice) => {
    setItems((prev) =>
      prev.map((item) => (item.phoneExists ? { ...item, replaceChoice: choice } : item))
    );
    showToast(
      choice === 'replace'
        ? (isRtl ? 'تم تحديد استبدال البيانات لجميع الأرقام المكررة' : 'Set replace for all duplicate phones')
        : (isRtl ? 'تم تحديد تخطي التعديل لجميع الأرقام المكررة' : 'Set skip for all duplicate phones'),
      'info'
    );
  };


  // Step 2 -> Step 3: Execute Batch Import
  const handleExecuteImport = async () => {
    const includedItems = items.filter((i) => i.includeInImport);
    if (includedItems.length === 0) {
      showToast(isRtl ? 'لم يتم تحديد أي مرشح للاستيراد' : 'No candidates selected for import', 'warning');
      return;
    }

    try {
      setProcessing(true);
      setStep(3);

      const payload = {
        items: includedItems,
        mainCandidate:
          mainMode === 'existing'
            ? { mode: 'existing', candidateId: selectedMainCandidate.id }
            : { mode: 'new', ...newMainForm }
      };

      const res = await adminApi.executeCandidateImport(payload);
      const data = res.data?.data;
      setImportResult(data);
      showToast(isRtl ? 'تم استيراد قاعدة بيانات المرشحين واعتماد المسميات بنجاح!' : 'Candidates imported successfully!', 'success');
      if (onFinished) onFinished();
    } catch (err) {
      showToast(err.response?.data?.message || (isRtl ? 'حدث خطأ أثناء تنفيذ الاستيراد' : 'Import failed'), 'error');
    } finally {
      setProcessing(false);
    }
  };

  // Sample Excel Download Helper
  const downloadSampleExcel = () => {
    const sampleHeaders = ['الاسم', 'الموبايل', 'الوظيفة', 'المستوى المهني'];
    const sampleRows = [
      ['محمد أحمد إبراهيم', '01012345678', 'فني كهرباء صيانة', 'متوسط (3-5 سنوات)'],
      ['محمود علي عثمان', '01123456789', 'مشغل ماكينات إنتاج', 'مبتدئ (1-3 سنوات)'],
      ['كريم سعيد عبد الله', '01234567890', 'مهندس جودة ومطابقة', 'متقدم (5-7 سنوات)'],
      ['حازم حسن الشريف', '01598765432', 'سائق كلارك رافعة', 'صاحب خبره كبيره (أكثر من 7 سنوات)']
    ];

    const csvContent = 'data:text/csv;charset=utf-8,\uFEFF' +
      [sampleHeaders.join(','), ...sampleRows.map(e => e.join(','))].join('\n');
    const encodedUri = encodeURI(csvContent);
    const link = document.createElement('a');
    link.setAttribute('href', encodedUri);
    link.setAttribute('download', 'نموذج_استيراد_قاعدة_بيانات_المرشحين.csv');
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  if (!isOpen) return null;

  return (
    <div
      style={{
        position: 'fixed',
        inset: 0,
        zIndex: 1050,
        background: 'rgba(15, 23, 42, 0.75)',
        backdropFilter: 'blur(5px)',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        padding: '1rem',
        animation: 'fadeIn 0.2s ease-out'
      }}
    >
      <div
        className="card"
        style={{
          width: '100%',
          maxWidth: step === 2 ? '1240px' : '880px',
          maxHeight: '94vh',
          display: 'flex',
          flexDirection: 'column',
          background: 'var(--bg-card, #ffffff)',
          borderRadius: '16px',
          boxShadow: '0 25px 50px -12px rgba(0, 0, 0, 0.25)',
          overflow: 'hidden',
          transition: 'max-width 0.3s ease'
        }}
      >
        {/* Header */}
        <div
          style={{
            padding: '1.25rem 1.75rem',
            borderBottom: '1px solid var(--border-color, #e2e8f0)',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'space-between',
            background: 'linear-gradient(135deg, #1e293b 0%, #0f172a 100%)',
            color: '#ffffff'
          }}
        >
          <div style={{ display: 'flex', alignItems: 'center', gap: '0.85rem' }}>
            <div
              style={{
                width: 44,
                height: 44,
                borderRadius: '12px',
                background: 'rgba(255, 255, 255, 0.1)',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                color: '#38bdf8'
              }}
            >
              <FileSpreadsheet size={24} />
            </div>
            <div>
              <h2 style={{ fontSize: '1.25rem', fontWeight: 800, color: '#ffffff', margin: 0 }}>
                {isRtl ? 'استيراد قاعدة بيانات المرشحين من إكسيل' : 'Excel Candidate Database Import'}
              </h2>
              <p style={{ fontSize: '0.8125rem', color: '#94a3b8', margin: '0.2rem 0 0' }}>
                {isRtl
                  ? 'استخراج بيانات المرشحين، فحص الأرقام المسجلة، واعتماد المسميات الوظيفية الجديدة وربط التوصيات'
                  : 'Extract candidates, inspect phone duplicates, approve new titles & link recommendations'}
              </p>
            </div>
          </div>

          <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem' }}>
            {/* Step Indicator Badges */}
            <div style={{ display: 'flex', gap: '0.4rem', background: 'rgba(255, 255, 255, 0.08)', padding: '0.3rem 0.6rem', borderRadius: '999px', fontSize: '0.75rem', fontWeight: 700 }}>
              <span style={{ color: step === 1 ? '#38bdf8' : '#94a3b8' }}>1. {isRtl ? 'الملف والمرشح' : 'File & Main'}</span>
              <span style={{ color: '#64748b' }}>•</span>
              <span style={{ color: step === 2 ? '#38bdf8' : '#94a3b8' }}>2. {isRtl ? 'المراجعة والاعتماد' : 'Review & Approve'}</span>
              <span style={{ color: '#64748b' }}>•</span>
              <span style={{ color: step === 3 ? '#38bdf8' : '#94a3b8' }}>3. {isRtl ? 'التنفيذ والتقرير' : 'Execute & Report'}</span>
            </div>

            <button
              onClick={handleClose}
              disabled={processing}
              style={{
                background: 'rgba(255, 255, 255, 0.1)',
                border: 'none',
                color: '#ffffff',
                width: 32,
                height: 32,
                borderRadius: '8px',
                cursor: 'pointer',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center'
              }}
            >
              <X size={18} />
            </button>
          </div>
        </div>

        {/* Content Body */}
        <div style={{ padding: '1.5rem', overflowY: 'auto', flex: 1, minHeight: '380px' }}>
          {/* ======================================================== */}
          {/* STEP 1: Upload File & Main Candidate (Requirement 1) */}
          {/* ======================================================== */}
          {step === 1 && (
            <div style={{ display: 'flex', flexDirection: 'column', gap: '1.5rem' }}>
              {/* Info Guide */}
              <div
                style={{
                  background: 'linear-gradient(135deg, #eff6ff 0%, #f0fdf4 100%)',
                  border: '1px solid #bfdbfe',
                  borderRadius: '12px',
                  padding: '1rem 1.25rem',
                  display: 'flex',
                  alignItems: 'flex-start',
                  justifyContent: 'space-between',
                  gap: '1rem'
                }}
              >
                <div style={{ display: 'flex', gap: '0.75rem', alignItems: 'flex-start' }}>
                  <Info size={20} color="#1d4ed8" style={{ marginTop: '0.15rem', flexShrink: 0 }} />
                  <div style={{ fontSize: '0.875rem', color: '#1e3a8a', lineHeight: 1.6 }}>
                    <strong>{isRtl ? 'شروط ملف الإكسيل المطلوب استيراده:' : 'Excel File Requirements:'}</strong>
                    <div style={{ marginTop: '0.25rem', color: '#334155' }}>
                      {isRtl
                        ? 'يحتوي الملف على أعمدة: (الاسم، رقم الموبايل، الوظيفة، المستوى المهني). سيقوم النظام بمقارنة الأرقام والمسميات بقاعدة البيانات لعرض تحذيرات التكرار والمسميات الجديدة للاعتماد.'
                        : 'The sheet should collect: Full Name, Phone Number, Job Title, Career Level. The system will detect duplicate phone numbers and flag new job titles for your approval.'}
                    </div>
                  </div>
                </div>
                <button
                  type="button"
                  onClick={downloadSampleExcel}
                  className="btn btn-outline-secondary"
                  style={{
                    padding: '0.4rem 0.85rem',
                    fontSize: '0.8125rem',
                    fontWeight: 700,
                    display: 'flex',
                    alignItems: 'center',
                    gap: '0.4rem',
                    flexShrink: 0,
                    borderColor: '#93c5fd',
                    color: '#1d4ed8',
                    background: '#ffffff'
                  }}
                >
                  <Download size={15} />
                  {isRtl ? 'تحميل نموذج تجريبي' : 'Download Template'}
                </button>
              </div>

              {/* Requirement 1: Main Candidate Selection/Creation */}
              <div
                style={{
                  background: '#f8fafc',
                  border: '1px solid #e2e8f0',
                  borderRadius: '14px',
                  padding: '1.25rem'
                }}
              >
                <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '1rem' }}>
                  <div style={{ display: 'flex', alignItems: 'center', gap: '0.6rem' }}>
                    <div style={{ width: 32, height: 32, borderRadius: '8px', background: '#dbeafe', color: '#1e40af', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                      <UserCheck size={18} />
                    </div>
                    <div>
                      <h3 style={{ fontSize: '1rem', fontWeight: 800, margin: 0, color: '#0f172a' }}>
                        {isRtl ? '1. تحديد المرشح الرئيسي (مقدم التوصيات)' : '1. Designate Main Candidate (Recommender)'}
                      </h3>
                      <p style={{ fontSize: '0.8125rem', color: '#64748b', margin: 0 }}>
                        {isRtl
                          ? 'سيتم تسجيل كافة المرشحين المستوردين من هذا الملف كتوصيات تحته مباشرة'
                          : 'All imported candidates from this Excel file will be linked as recommendations under this candidate'}
                      </p>
                    </div>
                  </div>

                  {/* Mode Selector Toggle */}
                  <div style={{ display: 'flex', background: '#e2e8f0', padding: '0.25rem', borderRadius: '10px' }}>
                    <button
                      type="button"
                      onClick={() => setMainMode('existing')}
                      style={{
                        padding: '0.4rem 0.85rem',
                        fontSize: '0.8125rem',
                        fontWeight: 700,
                        border: 'none',
                        borderRadius: '8px',
                        cursor: 'pointer',
                        background: mainMode === 'existing' ? '#ffffff' : 'transparent',
                        color: mainMode === 'existing' ? '#0f172a' : '#64748b',
                        boxShadow: mainMode === 'existing' ? '0 1px 3px rgba(0,0,0,0.1)' : 'none',
                        transition: 'all 0.2s'
                      }}
                    >
                      {isRtl ? 'اختيار مرشح مسجل مسبقاً' : 'Select Registered Candidate'}
                    </button>
                    <button
                      type="button"
                      onClick={() => setMainMode('new')}
                      style={{
                        padding: '0.4rem 0.85rem',
                        fontSize: '0.8125rem',
                        fontWeight: 700,
                        border: 'none',
                        borderRadius: '8px',
                        cursor: 'pointer',
                        background: mainMode === 'new' ? '#ffffff' : 'transparent',
                        color: mainMode === 'new' ? '#0f172a' : '#64748b',
                        boxShadow: mainMode === 'new' ? '0 1px 3px rgba(0,0,0,0.1)' : 'none',
                        transition: 'all 0.2s'
                      }}
                    >
                      {isRtl ? 'إضافة مرشح رئيسي جديد' : 'Add New Main Candidate'}
                    </button>
                  </div>
                </div>

                {mainMode === 'existing' ? (
                  <div>
                    {selectedMainCandidate ? (
                      <div
                        style={{
                          background: '#ffffff',
                          border: '2px solid #22c55e',
                          borderRadius: '12px',
                          padding: '1rem 1.25rem',
                          display: 'flex',
                          alignItems: 'center',
                          justifyContent: 'space-between',
                          gap: '1rem'
                        }}
                      >
                        <div style={{ display: 'flex', alignItems: 'center', gap: '0.85rem' }}>
                          <div style={{ width: 40, height: 40, borderRadius: '50%', background: '#dcfce7', color: '#15803d', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                            <Check size={20} />
                          </div>
                          <div>
                            <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                              <span style={{ fontWeight: 800, fontSize: '0.95rem', color: '#0f172a' }}>
                                {selectedMainCandidate.fullName}
                              </span>
                              <span style={{ background: '#dcfce7', color: '#166534', padding: '0.15rem 0.5rem', borderRadius: '6px', fontSize: '0.75rem', fontWeight: 700 }}>
                                {isRtl ? 'تم الاختيار كمرشح رئيسي' : 'Selected Main Candidate'}
                              </span>
                            </div>
                            <div style={{ display: 'flex', gap: '1rem', fontSize: '0.8125rem', color: '#64748b', marginTop: '0.2rem' }}>
                              <span><Phone size={13} style={{ display: 'inline', verticalAlign: 'middle' }} /> {selectedMainCandidate.phone}</span>
                              <span><Briefcase size={13} style={{ display: 'inline', verticalAlign: 'middle' }} /> {selectedMainCandidate.jobTitle}</span>
                              <span>عدد التوصيات الحالية: <strong>{selectedMainCandidate.referralCount || 0}</strong></span>
                            </div>
                          </div>
                        </div>

                        <button
                          type="button"
                          onClick={() => setSelectedMainCandidate(null)}
                          className="btn btn-outline-secondary"
                          style={{ padding: '0.4rem 0.75rem', fontSize: '0.8125rem' }}
                        >
                          {isRtl ? 'تغيير المرشح' : 'Change Candidate'}
                        </button>
                      </div>
                    ) : (
                      <div>
                        <div style={{ position: 'relative', marginBottom: '0.75rem' }}>
                          <Search size={18} style={{ position: 'absolute', top: '50%', transform: 'translateY(-50%)', [isRtl ? 'right' : 'left']: '12px', color: '#94a3b8' }} />
                          <input
                            type="text"
                            className="form-control"
                            placeholder={isRtl ? 'ابحث بالاسم أو رقم الهاتف لاختيار المرشح الرئيسي...' : 'Search by name or phone to choose main candidate...'}
                            value={mainSearch}
                            onChange={(e) => setMainSearch(e.target.value)}
                            style={{ [isRtl ? 'paddingRight' : 'paddingLeft']: '2.5rem' }}
                          />
                        </div>

                        {searchingMain ? (
                          <div style={{ padding: '1rem', textAlign: 'center', color: '#64748b' }}>
                            <LoadingSpinner size={20} />
                          </div>
                        ) : mainCandidatesList.length > 0 ? (
                          <div style={{ maxHeight: '180px', overflowY: 'auto', display: 'flex', flexDirection: 'column', gap: '0.4rem', border: '1px solid #e2e8f0', borderRadius: '10px', padding: '0.5rem', background: '#ffffff' }}>
                            {mainCandidatesList.map((cand) => (
                              <div
                                key={cand.id}
                                onClick={() => setSelectedMainCandidate(cand)}
                                style={{
                                  padding: '0.6rem 0.85rem',
                                  borderRadius: '8px',
                                  cursor: 'pointer',
                                  display: 'flex',
                                  alignItems: 'center',
                                  justifyContent: 'space-between',
                                  background: '#f8fafc',
                                  border: '1px solid #f1f5f9',
                                  transition: 'all 0.15s'
                                }}
                                onMouseEnter={(e) => { e.currentTarget.style.background = '#eff6ff'; e.currentTarget.style.borderColor = '#bfdbfe'; }}
                                onMouseLeave={(e) => { e.currentTarget.style.background = '#f8fafc'; e.currentTarget.style.borderColor = '#f1f5f9'; }}
                              >
                                <div>
                                  <strong style={{ color: '#0f172a', fontSize: '0.875rem' }}>{cand.fullName}</strong>
                                  <span style={{ color: '#64748b', fontSize: '0.8125rem', [isRtl ? 'marginRight' : 'marginLeft']: '0.75rem' }}>{cand.phone}</span>
                                </div>
                                <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                                  <span style={{ fontSize: '0.75rem', background: '#e2e8f0', color: '#334155', padding: '0.15rem 0.5rem', borderRadius: '6px' }}>{cand.jobTitle}</span>
                                  <span style={{ fontSize: '0.75rem', color: '#2563eb', fontWeight: 700 }}>{isRtl ? 'اختيار' : 'Select'}</span>
                                </div>
                              </div>
                            ))}
                          </div>
                        ) : (
                          <div style={{ padding: '0.75rem', textAlign: 'center', fontSize: '0.8125rem', color: '#94a3b8' }}>
                            {isRtl ? 'لا توجد نتائج مطابقة، يمكنك البحث برقم الهاتف أو التبديل إلى "إضافة مرشح رئيسي جديد"' : 'No matching candidates, search by phone or switch to add new.'}
                          </div>
                        )}
                      </div>
                    )}
                  </div>
                ) : (
                  <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))', gap: '0.85rem', background: '#ffffff', padding: '1rem', borderRadius: '10px', border: '1px solid #e2e8f0' }}>
                    <div>
                      <label className="form-label" style={{ fontSize: '0.8125rem', fontWeight: 700 }}>{isRtl ? 'الاسم بالكامل *' : 'Full Name *'}</label>
                      <input
                        type="text"
                        className="form-control"
                        placeholder={isRtl ? 'مثال: أحمد عبد الله سعيد' : 'e.g. Ahmed Abdullah'}
                        value={newMainForm.fullName}
                        onChange={(e) => setNewMainForm({ ...newMainForm, fullName: e.target.value })}
                      />
                    </div>
                    <div>
                      <label className="form-label" style={{ fontSize: '0.8125rem', fontWeight: 700 }}>{isRtl ? 'رقم الموبايل *' : 'Mobile Phone *'}</label>
                      <input
                        type="text"
                        className="form-control"
                        placeholder="01012345678"
                        value={newMainForm.phone}
                        onChange={(e) => setNewMainForm({ ...newMainForm, phone: e.target.value })}
                      />
                    </div>
                    <div>
                      <label className="form-label" style={{ fontSize: '0.8125rem', fontWeight: 700 }}>{isRtl ? 'الوظيفة / المسمى *' : 'Job Title *'}</label>
                      <input
                        type="text"
                        className="form-control"
                        placeholder={isRtl ? 'مثال: فني صيانة عامة' : 'e.g. Maintenance Tech'}
                        value={newMainForm.jobTitle}
                        onChange={(e) => setNewMainForm({ ...newMainForm, jobTitle: e.target.value })}
                      />
                    </div>
                    <div>
                      <label className="form-label" style={{ fontSize: '0.8125rem', fontWeight: 700 }}>{isRtl ? 'المستوى المهني' : 'Career Level'}</label>
                      <select
                        className="form-control"
                        value={newMainForm.careerLevel}
                        onChange={(e) => setNewMainForm({ ...newMainForm, careerLevel: e.target.value })}
                      >
                        {CAREER_LEVEL_OPTIONS.map((lvl) => (
                          <option key={lvl} value={lvl}>{lvl}</option>
                        ))}
                      </select>
                    </div>
                  </div>
                )}
              </div>

              {/* Upload Excel Box */}
              <div
                style={{
                  border: '2px dashed #cbd5e1',
                  borderRadius: '16px',
                  padding: '2.5rem 1.5rem',
                  textAlign: 'center',
                  background: file ? '#f0fdf4' : '#f8fafc',
                  borderColor: file ? '#86efac' : '#cbd5e1',
                  cursor: 'pointer',
                  transition: 'all 0.2s ease'
                }}
                onClick={() => fileInputRef.current?.click()}
              >
                <input
                  type="file"
                  ref={fileInputRef}
                  onChange={handleFileChange}
                  accept=".xlsx, .xls, .csv"
                  style={{ display: 'none' }}
                />

                <div
                  style={{
                    width: 56,
                    height: 56,
                    borderRadius: '50%',
                    background: file ? '#dcfce7' : '#e2e8f0',
                    color: file ? '#16a34a' : '#64748b',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    margin: '0 auto 1rem'
                  }}
                >
                  <Upload size={28} />
                </div>

                {file ? (
                  <div>
                    <h4 style={{ fontSize: '1.05rem', fontWeight: 800, color: '#166534', margin: '0 0 0.25rem' }}>
                      {file.name}
                    </h4>
                    <p style={{ fontSize: '0.8125rem', color: '#15803d', margin: 0 }}>
                      {(file.size / 1024).toFixed(1)} KB — {isRtl ? 'جاهز للاستخراج والفحص' : 'Ready for extraction'}
                    </p>
                  </div>
                ) : (
                  <div>
                    <h4 style={{ fontSize: '1rem', fontWeight: 800, color: '#1e293b', margin: '0 0 0.35rem' }}>
                      {isRtl ? 'اضغط لاختيار ملف إكسيل أو اسحبه هنا' : 'Click to select Excel file or drag & drop here'}
                    </h4>
                    <p style={{ fontSize: '0.8125rem', color: '#64748b', margin: 0 }}>
                      {isRtl ? 'صيغ الملفات المدعومة: .xlsx, .xls, .csv (الحد الأقصى 25 ميجابايت)' : 'Supported: .xlsx, .xls, .csv (Max 25MB)'}
                    </p>
                  </div>
                )}
              </div>

              {/* Default Category Selection */}
              <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', gap: '1rem', background: '#f8fafc', padding: '0.85rem 1.25rem', borderRadius: '10px', border: '1px solid #e2e8f0' }}>
                <label style={{ fontSize: '0.875rem', fontWeight: 700, color: '#334155', margin: 0 }}>
                  {isRtl ? 'القطاع الافتراضي للمسميات الجديدة في حال عدم تعيين قطاع:' : 'Default category for new job titles:'}
                </label>
                <select
                  className="form-control"
                  style={{ maxWidth: '280px' }}
                  value={defaultCategoryId}
                  onChange={(e) => setDefaultCategoryId(e.target.value)}
                >
                  {categories.map((c) => (
                    <option key={c._id} value={c._id}>
                      {isRtl ? (c.nameAr || c.name) : (c.name || c.nameAr)}
                    </option>
                  ))}
                </select>
              </div>
            </div>
          )}

          {/* ======================================================== */}
          {/* STEP 2: Review & Approval Table (Requirements 2 & 3)     */}
          {/* ======================================================== */}
          {step === 2 && (
            <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
              {/* Summary Cards */}
              <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(180px, 1fr))', gap: '0.75rem' }}>
                <div style={{ background: '#f8fafc', border: '1px solid #e2e8f0', borderRadius: '10px', padding: '0.75rem 1rem' }}>
                  <div style={{ fontSize: '0.75rem', color: '#64748b', fontWeight: 600 }}>{isRtl ? 'إجمالي الصفوف' : 'Total Extracted'}</div>
                  <div style={{ fontSize: '1.25rem', fontWeight: 800, color: '#0f172a', marginTop: '0.2rem' }}>{summary.totalRows}</div>
                </div>

                <div style={{ background: '#f0fdf4', border: '1px solid #bbf7d0', borderRadius: '10px', padding: '0.75rem 1rem' }}>
                  <div style={{ fontSize: '0.75rem', color: '#166534', fontWeight: 600 }}>{isRtl ? 'مسميات معتمدة بقاعدة البيانات' : 'Matched Existing Titles'}</div>
                  <div style={{ fontSize: '1.25rem', fontWeight: 800, color: '#16a34a', marginTop: '0.2rem' }}>{summary.existingTitlesCount}</div>
                </div>

                {/* Requirement 3 Counter: New Job Titles */}
                <div style={{ background: summary.newTitlesCount > 0 ? '#fffbeb' : '#f8fafc', border: `1px solid ${summary.newTitlesCount > 0 ? '#fde68a' : '#e2e8f0'}`, borderRadius: '10px', padding: '0.75rem 1rem' }}>
                  <div style={{ fontSize: '0.75rem', color: summary.newTitlesCount > 0 ? '#92400e' : '#64748b', fontWeight: 700, display: 'flex', alignItems: 'center', gap: '0.3rem' }}>
                    <AlertTriangle size={14} />
                    {isRtl ? 'مسميات جديدة بحاجة لاعتماد' : 'New Job Titles'}
                  </div>
                  <div style={{ fontSize: '1.25rem', fontWeight: 800, color: summary.newTitlesCount > 0 ? '#b45309' : '#0f172a', marginTop: '0.2rem' }}>
                    {summary.newTitlesCount}
                  </div>
                </div>

                {/* Requirement 2 Counter: Phone Conflict Warning */}
                <div style={{ background: summary.phoneConflictCount > 0 ? '#fef2f2' : '#f8fafc', border: `1px solid ${summary.phoneConflictCount > 0 ? '#fecaca' : '#e2e8f0'}`, borderRadius: '10px', padding: '0.75rem 1rem' }}>
                  <div style={{ fontSize: '0.75rem', color: summary.phoneConflictCount > 0 ? '#991b1b' : '#64748b', fontWeight: 700, display: 'flex', alignItems: 'center', gap: '0.3rem' }}>
                    <AlertTriangle size={14} />
                    {isRtl ? 'تحذير أرقام مسجلة مسبقاً' : 'Phone Number Conflicts'}
                  </div>
                  <div style={{ fontSize: '1.25rem', fontWeight: 800, color: summary.phoneConflictCount > 0 ? '#dc2626' : '#0f172a', marginTop: '0.2rem' }}>
                    {summary.phoneConflictCount}
                  </div>
                </div>
              </div>

              {/* Quick Actions & Filters Bar */}
              <div style={{ display: 'flex', flexWrap: 'wrap', alignItems: 'center', justifyContent: 'space-between', gap: '0.75rem', background: '#f8fafc', padding: '0.75rem 1rem', borderRadius: '10px', border: '1px solid #e2e8f0' }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: '0.4rem', flexWrap: 'wrap' }}>
                  {/* Tabs */}
                  <button
                    type="button"
                    onClick={() => setFilterTab('all')}
                    style={{
                      padding: '0.35rem 0.75rem',
                      borderRadius: '6px',
                      fontSize: '0.8125rem',
                      fontWeight: 700,
                      border: 'none',
                      cursor: 'pointer',
                      background: filterTab === 'all' ? '#0f172a' : '#e2e8f0',
                      color: filterTab === 'all' ? '#ffffff' : '#475569'
                    }}
                  >
                    {isRtl ? `الكل (${items.length})` : `All (${items.length})`}
                  </button>
                  <button
                    type="button"
                    onClick={() => setFilterTab('conflicts')}
                    style={{
                      padding: '0.35rem 0.75rem',
                      borderRadius: '6px',
                      fontSize: '0.8125rem',
                      fontWeight: 700,
                      border: 'none',
                      cursor: 'pointer',
                      background: filterTab === 'conflicts' ? '#dc2626' : '#fee2e2',
                      color: filterTab === 'conflicts' ? '#ffffff' : '#991b1b'
                    }}
                  >
                    {isRtl ? `أرقام مسجلة مسبقاً (${summary.phoneConflictCount})` : `Phone Conflicts (${summary.phoneConflictCount})`}
                  </button>
                  <button
                    type="button"
                    onClick={() => setFilterTab('newTitles')}
                    style={{
                      padding: '0.35rem 0.75rem',
                      borderRadius: '6px',
                      fontSize: '0.8125rem',
                      fontWeight: 700,
                      border: 'none',
                      cursor: 'pointer',
                      background: filterTab === 'newTitles' ? '#d97706' : '#fef3c7',
                      color: filterTab === 'newTitles' ? '#ffffff' : '#92400e'
                    }}
                  >
                    {isRtl ? `مسميات جديدة (${summary.newTitlesCount})` : `New Titles (${summary.newTitlesCount})`}
                  </button>
                </div>

                <div style={{ display: 'flex', alignItems: 'center', gap: '0.6rem', flexWrap: 'wrap' }}>
                  {/* Bulk Controls */}
                  {summary.newTitlesCount > 0 && (
                    <button
                      type="button"
                      onClick={handleBulkApproveAllNewTitles}
                      className="btn btn-outline-warning"
                      style={{ padding: '0.35rem 0.65rem', fontSize: '0.75rem', fontWeight: 700 }}
                    >
                      <Check size={14} />
                      {isRtl ? 'اعتماد جميع المسميات الجديدة' : 'Approve All New Titles'}
                    </button>
                  )}

                  {summary.phoneConflictCount > 0 && (
                    <div style={{ display: 'flex', alignItems: 'center', gap: '0.3rem' }}>
                      <button
                        type="button"
                        onClick={() => handleBulkSetReplaceChoice('replace')}
                        className="btn btn-outline-danger"
                        style={{ padding: '0.35rem 0.65rem', fontSize: '0.75rem', fontWeight: 700 }}
                      >
                        {isRtl ? 'استبدال كل المكرر' : 'Replace All Duplicates'}
                      </button>
                      <button
                        type="button"
                        onClick={() => handleBulkSetReplaceChoice('skip')}
                        className="btn btn-outline-secondary"
                        style={{ padding: '0.35rem 0.65rem', fontSize: '0.75rem', fontWeight: 700 }}
                      >
                        {isRtl ? 'تخطي كل المكرر' : 'Skip All Duplicates'}
                      </button>
                    </div>
                  )}

                  {/* Search within table */}
                  <div style={{ position: 'relative', width: 180 }}>
                    <Search size={14} style={{ position: 'absolute', top: '50%', transform: 'translateY(-50%)', [isRtl ? 'right' : 'left']: '8px', color: '#94a3b8' }} />
                    <input
                      type="text"
                      className="form-control"
                      placeholder={isRtl ? 'تصفية النتائج...' : 'Filter table...'}
                      value={tableSearch}
                      onChange={(e) => setTableSearch(e.target.value)}
                      style={{ fontSize: '0.75rem', padding: '0.35rem 0.5rem', [isRtl ? 'paddingRight' : 'paddingLeft']: '1.8rem' }}
                    />
                  </div>
                </div>
              </div>

              {/* Data Table */}
              <div style={{ overflowX: 'auto', border: '1px solid #e2e8f0', borderRadius: '12px', maxHeight: '52vh' }}>
                <table style={{ width: '100%', borderCollapse: 'collapse', fontSize: '0.8125rem' }}>
                  <thead style={{ position: 'sticky', top: 0, background: '#f8fafc', zIndex: 1, borderBottom: '2px solid #e2e8f0' }}>
                    <tr style={{ textAlign: isRtl ? 'right' : 'left', color: '#475569' }}>
                      <th style={{ padding: '0.75rem', width: 40, textAlign: 'center' }}>
                        <input
                          type="checkbox"
                          checked={items.length > 0 && items.every((i) => i.includeInImport)}
                          onChange={(e) => handleBulkSelectAll(e.target.checked)}
                        />
                      </th>
                      <th style={{ padding: '0.75rem', width: 45 }}>#</th>
                      <th style={{ padding: '0.75rem', minWidth: 160 }}>{isRtl ? 'اسم المرشح' : 'Name'}</th>
                      <th style={{ padding: '0.75rem', minWidth: 220 }}>{isRtl ? 'رقم الهاتف / فحص التكرار' : 'Phone / Conflict Check'}</th>
                      <th style={{ padding: '0.75rem', minWidth: 240 }}>{isRtl ? 'المسمى الوظيفي / فحص الاعتماد' : 'Job Title / Approval'}</th>
                      <th style={{ padding: '0.75rem', minWidth: 150 }}>{isRtl ? 'المستوى المهني' : 'Career Level'}</th>
                      <th style={{ padding: '0.75rem', width: 50, textAlign: 'center' }}>{isRtl ? 'إجراء' : 'Action'}</th>
                    </tr>
                  </thead>
                  <tbody>
                    {filteredItems.map((item, idx) => (
                      <tr
                        key={item.id}
                        style={{
                          borderBottom: '1px solid #f1f5f9',
                          background: !item.includeInImport
                            ? '#f8fafc'
                            : item.phoneExists
                              ? '#fff5f5'
                              : !item.titleExists
                                ? '#fffbeb'
                                : '#ffffff',
                          opacity: item.includeInImport ? 1 : 0.6,
                          transition: 'background 0.15s'
                        }}
                      >
                        {/* Checkbox */}
                        <td style={{ padding: '0.65rem 0.75rem', textAlign: 'center' }}>
                          <input
                            type="checkbox"
                            checked={item.includeInImport}
                            onChange={() => handleToggleInclude(item.id)}
                          />
                        </td>

                        {/* Row Index */}
                        <td style={{ padding: '0.65rem 0.75rem', color: '#94a3b8', fontWeight: 600 }}>
                          {item.rowIndex || idx + 1}
                        </td>

                        {/* Name */}
                        <td style={{ padding: '0.65rem 0.75rem' }}>
                          <input
                            type="text"
                            value={item.name}
                            onChange={(e) => handleItemFieldChange(item.id, 'name', e.target.value)}
                            className="form-control"
                            style={{ fontSize: '0.8125rem', padding: '0.35rem 0.5rem', fontWeight: 700 }}
                          />
                          {!item.name && (
                            <span style={{ color: '#ef4444', fontSize: '0.7rem' }}>{isRtl ? 'الاسم مطلوب' : 'Name required'}</span>
                          )}
                        </td>

                        {/* Requirement 2: Editable Phone Number & Conflict Warning */}
                        <td style={{ padding: '0.65rem 0.75rem', minWidth: 230 }}>
                          <div style={{ display: 'flex', flexDirection: 'column', gap: '0.35rem' }}>
                            <div style={{ display: 'flex', alignItems: 'center', gap: '0.4rem' }}>
                              <div style={{ position: 'relative', flex: 1 }}>
                                <input
                                  type="text"
                                  value={item.phone || ''}
                                  onChange={(e) => handlePhoneChange(item.id, e.target.value)}
                                  onBlur={() => handlePhoneBlur(item.id)}
                                  className="form-control"
                                  placeholder="01xxxxxxxxx"
                                  maxLength={11}
                                  dir="ltr"
                                  style={{
                                    fontSize: '0.8125rem',
                                    padding: '0.35rem 0.5rem',
                                    fontWeight: 700,
                                    fontFamily: 'monospace',
                                    width: '100%',
                                    border: !item.isPhoneValid ? '1.5px solid #ef4444' : item.phoneExists ? '1.5px solid #f87171' : '1px solid #cbd5e1',
                                    background: '#ffffff'
                                  }}
                                />
                                {item.phoneChecking && (
                                  <span style={{ position: 'absolute', top: '50%', [isRtl ? 'left' : 'right']: '6px', transform: 'translateY(-50%)', fontSize: '0.68rem', color: '#64748b' }}>
                                    ...
                                  </span>
                                )}
                              </div>

                              {item.phoneExists ? (
                                <span style={{ background: '#fee2e2', color: '#b91c1c', padding: '0.15rem 0.45rem', borderRadius: '6px', fontSize: '0.7rem', fontWeight: 800, whiteSpace: 'nowrap', display: 'flex', alignItems: 'center', gap: '0.2rem' }}>
                                  <AlertTriangle size={11} />
                                  {isRtl ? 'مسجل مسبقاً' : 'Exists'}
                                </span>
                              ) : item.isPhoneValid ? (
                                <span style={{ background: '#dcfce7', color: '#15803d', padding: '0.15rem 0.45rem', borderRadius: '6px', fontSize: '0.7rem', fontWeight: 800, whiteSpace: 'nowrap', display: 'flex', alignItems: 'center', gap: '0.2rem' }}>
                                  <CheckCircle2 size={11} />
                                  {isRtl ? 'صالح' : 'Valid'}
                                </span>
                              ) : (
                                <span style={{ background: '#fee2e2', color: '#b91c1c', padding: '0.15rem 0.45rem', borderRadius: '6px', fontSize: '0.7rem', fontWeight: 800, whiteSpace: 'nowrap' }}>
                                  {isRtl ? 'غير صالح' : 'Invalid'}
                                </span>
                              )}
                            </div>

                            {item.phoneError && (
                              <div style={{ color: '#ef4444', fontSize: '0.7rem', fontWeight: 600, display: 'flex', alignItems: 'center', gap: '0.25rem' }}>
                                <XCircle size={11} />
                                <span>{item.phoneError}</span>
                              </div>
                            )}

                            {/* Warning Box for Phone Conflict */}
                            {item.phoneExists && item.existingCandidate && (
                              <div style={{ background: '#fef2f2', border: '1px solid #fecaca', borderRadius: '8px', padding: '0.4rem 0.6rem', fontSize: '0.75rem' }}>
                                <div style={{ color: '#991b1b', fontWeight: 700, marginBottom: '0.25rem' }}>
                                  {isRtl ? `⚠️ مسجل مسبقاً باسم: ${item.existingCandidate.fullName} (${item.existingCandidate.currentJobTitle || 'غير محدد'})` : `⚠️ Belongs to: ${item.existingCandidate.fullName}`}
                                </div>
                                <div style={{ display: 'flex', gap: '0.5rem', alignItems: 'center' }}>
                                  <label style={{ display: 'flex', alignItems: 'center', gap: '0.25rem', cursor: 'pointer', color: item.replaceChoice === 'replace' ? '#b91c1c' : '#64748b', fontWeight: item.replaceChoice === 'replace' ? 800 : 500 }}>
                                    <input
                                      type="radio"
                                      name={`conflict-${item.id}`}
                                      checked={item.replaceChoice === 'replace'}
                                      onChange={() => handleReplaceChoiceChange(item.id, 'replace')}
                                    />
                                    {isRtl ? 'استبدال البيانات القديمة' : 'Replace old data'}
                                  </label>
                                  <label style={{ display: 'flex', alignItems: 'center', gap: '0.25rem', cursor: 'pointer', color: item.replaceChoice === 'skip' ? '#0f172a' : '#64748b', fontWeight: item.replaceChoice === 'skip' ? 800 : 500 }}>
                                    <input
                                      type="radio"
                                      name={`conflict-${item.id}`}
                                      checked={item.replaceChoice === 'skip'}
                                      onChange={() => handleReplaceChoiceChange(item.id, 'skip')}
                                    />
                                    {isRtl ? 'تخطي عدم التعديل' : 'Skip / keep old'}
                                  </label>
                                </div>
                              </div>
                            )}
                          </div>
                        </td>

                        {/* Requirement 3: Job Title & Selection from System vs New Title */}
                        <td style={{ padding: '0.65rem 0.75rem', minWidth: 280 }}>
                          <div style={{ display: 'flex', flexDirection: 'column', gap: '0.4rem' }}>
                            {/* Mode Toggle Pills */}
                            <div style={{ display: 'inline-flex', background: '#f1f5f9', padding: '2px', borderRadius: '6px', width: 'fit-content', border: '1px solid #e2e8f0' }}>
                              <button
                                type="button"
                                onClick={() => handleTitleModeChange(item.id, 'existing')}
                                style={{
                                  padding: '0.2rem 0.55rem',
                                  borderRadius: '4px',
                                  border: 'none',
                                  fontSize: '0.7rem',
                                  fontWeight: 700,
                                  cursor: 'pointer',
                                  background: item.titleMode === 'existing' ? '#0f172a' : 'transparent',
                                  color: item.titleMode === 'existing' ? '#ffffff' : '#64748b',
                                  transition: 'all 0.15s ease'
                                }}
                              >
                                {isRtl ? 'اختر من مسميات النظام' : 'Select from System'}
                              </button>
                              <button
                                type="button"
                                onClick={() => handleTitleModeChange(item.id, 'new')}
                                style={{
                                  padding: '0.2rem 0.55rem',
                                  borderRadius: '4px',
                                  border: 'none',
                                  fontSize: '0.7rem',
                                  fontWeight: 700,
                                  cursor: 'pointer',
                                  background: item.titleMode === 'new' ? '#d97706' : 'transparent',
                                  color: item.titleMode === 'new' ? '#ffffff' : '#64748b',
                                  transition: 'all 0.15s ease'
                                }}
                              >
                                {isRtl ? '+ إضافة مسمى جديد' : '+ Add New Title'}
                              </button>
                            </div>

                            {item.titleMode === 'existing' ? (
                              /* Option A: Select or Search from System Jobs */
                              <div style={{ display: 'flex', flexDirection: 'column', gap: '0.3rem' }}>
                                {/* Search filter for system jobs */}
                                <div style={{ position: 'relative' }}>
                                  <Search size={12} style={{ position: 'absolute', top: '50%', transform: 'translateY(-50%)', [isRtl ? 'right' : 'left']: '6px', color: '#94a3b8' }} />
                                  <input
                                    type="text"
                                    placeholder={isRtl ? 'بحث لتصفية المسميات...' : 'Search jobs...'}
                                    value={item.jobSearch || ''}
                                    onChange={(e) => handleItemFieldChange(item.id, 'jobSearch', e.target.value)}
                                    style={{
                                      width: '100%',
                                      fontSize: '0.72rem',
                                      padding: '0.25rem 0.4rem',
                                      [isRtl ? 'paddingRight' : 'paddingLeft']: '1.5rem',
                                      borderRadius: '5px',
                                      border: '1px solid #cbd5e1',
                                      background: '#f8fafc'
                                    }}
                                  />
                                </div>

                                {/* Select Dropdown */}
                                <select
                                  value={item.jobId || ''}
                                  onChange={(e) => {
                                    const chosenJob = jobs.find((j) => String(j._id) === e.target.value);
                                    if (chosenJob) {
                                      handleSelectExistingJob(item.id, chosenJob);
                                    }
                                  }}
                                  className="form-control"
                                  style={{
                                    fontSize: '0.78rem',
                                    padding: '0.35rem 0.5rem',
                                    fontWeight: 700,
                                    color: item.jobId ? '#0f172a' : '#64748b',
                                    border: item.jobId ? '1.5px solid #22c55e' : '1.5px solid #f59e0b',
                                    background: '#ffffff'
                                  }}
                                >
                                  <option value="">{isRtl ? '-- اختر مسمى وظيفي من النظام --' : '-- Choose job title --'}</option>
                                  {jobs
                                    .filter((j) => {
                                      if (!item.jobSearch?.trim()) return true;
                                      const q = item.jobSearch.trim().toLowerCase();
                                      const name = (j.name || '').toLowerCase();
                                      const nameAr = (j.nameAr || '').toLowerCase();
                                      const cat = (j.categoryId?.nameAr || j.categoryId?.name || '').toLowerCase();
                                      return name.includes(q) || nameAr.includes(q) || cat.includes(q);
                                    })
                                    .map((j) => (
                                      <option key={j._id} value={j._id}>
                                        {isRtl ? j.nameAr || j.name : j.name || j.nameAr} {j.categoryId ? `(${isRtl ? j.categoryId.nameAr || j.categoryId.name : j.categoryId.name})` : ''}
                                      </option>
                                    ))}
                                </select>

                                {item.jobId ? (
                                  <div style={{ display: 'flex', alignItems: 'center', gap: '0.25rem', fontSize: '0.7rem', color: '#166534', fontWeight: 600 }}>
                                    <CheckCircle2 size={12} color="#16a34a" />
                                    <span>{isRtl ? `مسمى معتمد: ${item.jobTitle}` : `Approved: ${item.jobTitle}`}</span>
                                  </div>
                                ) : (
                                  <div style={{ color: '#d97706', fontSize: '0.68rem', fontWeight: 600 }}>
                                    {isRtl ? '⚠️ يرجى اختيار مسمى وظيفي من القائمة' : '⚠️ Please choose a job title'}
                                  </div>
                                )}
                              </div>
                            ) : (
                              /* Option B: Enter Custom Job Title & Add as New Title */
                              <div style={{ background: '#fffbeb', border: '1px solid #fde68a', borderRadius: '8px', padding: '0.45rem', display: 'flex', flexDirection: 'column', gap: '0.35rem' }}>
                                <input
                                  type="text"
                                  value={item.jobTitle || ''}
                                  placeholder={isRtl ? 'اكتب اسم المسمى الوظيفي الجديد...' : 'New job title...'}
                                  onChange={(e) => handleItemFieldChange(item.id, 'jobTitle', e.target.value)}
                                  className="form-control"
                                  style={{ fontSize: '0.8rem', padding: '0.3rem 0.5rem', fontWeight: 700, background: '#ffffff', border: '1px solid #f59e0b' }}
                                />

                                <div style={{ display: 'flex', alignItems: 'center', gap: '0.4rem', flexWrap: 'wrap' }}>
                                  <span style={{ fontSize: '0.7rem', color: '#92400e', fontWeight: 700 }}>
                                    {isRtl ? 'التصنيف:' : 'Category:'}
                                  </span>
                                  <select
                                    className="form-control"
                                    style={{ fontSize: '0.72rem', padding: '0.2rem 0.4rem', height: 'auto', flex: 1, minWidth: 120, background: '#ffffff' }}
                                    value={item.categoryId || ''}
                                    onChange={(e) => handleItemFieldChange(item.id, 'categoryId', e.target.value)}
                                  >
                                    {categories.map((c) => (
                                      <option key={c._id} value={c._id}>
                                        {isRtl ? (c.nameAr || c.name) : (c.name || c.nameAr)}
                                      </option>
                                    ))}
                                  </select>
                                </div>

                                <label style={{ display: 'flex', alignItems: 'center', gap: '0.3rem', cursor: 'pointer', fontSize: '0.72rem', fontWeight: 700, color: item.approveNewTitle ? '#b45309' : '#64748b', margin: 0 }}>
                                  <input
                                    type="checkbox"
                                    checked={Boolean(item.approveNewTitle)}
                                    onChange={() => handleToggleApproveTitle(item.id)}
                                  />
                                  <span>{isRtl ? 'اعتماد وإضافة هذا المسمى لقاعدة بيانات النظام' : 'Approve & add to system'}</span>
                                </label>
                              </div>
                            )}
                          </div>
                        </td>

                        {/* Career Level */}
                        <td style={{ padding: '0.65rem 0.75rem' }}>
                          <select
                            className="form-control"
                            style={{ fontSize: '0.8125rem', padding: '0.35rem 0.5rem' }}
                            value={item.careerLevel}
                            onChange={(e) => handleItemFieldChange(item.id, 'careerLevel', e.target.value)}
                          >
                            {CAREER_LEVEL_OPTIONS.map((lvl) => (
                              <option key={lvl} value={lvl}>{lvl}</option>
                            ))}
                          </select>
                        </td>

                        {/* Actions */}
                        <td style={{ padding: '0.65rem 0.75rem', textAlign: 'center' }}>
                          <button
                            type="button"
                            onClick={() => handleDeleteItem(item.id)}
                            style={{ background: 'transparent', border: 'none', color: '#94a3b8', cursor: 'pointer', padding: '0.25rem' }}
                            title={isRtl ? 'حذف من الاستيراد' : 'Remove from batch'}
                          >
                            <Trash2 size={16} />
                          </button>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>
          )}

          {/* ======================================================== */}
          {/* STEP 3: Execution Progress & Final Summary Report        */}
          {/* ======================================================== */}
          {step === 3 && (
            <div style={{ padding: '2rem 1rem', textAlign: 'center' }}>
              {processing ? (
                <div>
                  <LoadingSpinner size={48} />
                  <h3 style={{ fontSize: '1.25rem', fontWeight: 800, color: '#0f172a', margin: '1.25rem 0 0.5rem' }}>
                    {isRtl ? 'جارٍ تنفيذ الاستيراد والاعتماد...' : 'Executing Import & Approvals...'}
                  </h3>
                  <p style={{ color: '#64748b', fontSize: '0.875rem' }}>
                    {isRtl
                      ? 'يتم الآن إضافة المسميات الجديدة المعتمدة، تحديث أو إنشاء المرشحين، وربطهم كتوصيات تحت المرشح الرئيسي...'
                      : 'Creating approved titles, updating/creating candidates, and linking recommendations...'}
                  </p>
                </div>
              ) : importResult ? (
                <div style={{ maxWidth: '640px', margin: '0 auto', textAlign: 'center' }}>
                  <div
                    style={{
                      width: 64,
                      height: 64,
                      borderRadius: '50%',
                      background: '#dcfce7',
                      color: '#16a34a',
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'center',
                      margin: '0 auto 1.25rem'
                    }}
                  >
                    <CheckCircle2 size={36} />
                  </div>

                  <h3 style={{ fontSize: '1.35rem', fontWeight: 800, color: '#0f172a', margin: '0 0 0.5rem' }}>
                    {isRtl ? 'تم استيراد قاعدة بيانات المرشحين بنجاح!' : 'Candidate Database Imported Successfully!'}
                  </h3>

                  <p style={{ color: '#475569', fontSize: '0.9375rem', marginBottom: '1.5rem' }}>
                    {isRtl
                      ? `تم ربط كافة المرشحين المستوردين كتوصيات رسمية تحت المرشح الرئيسي: ${importResult.mainCandidate?.fullName || ''} (${importResult.mainCandidate?.phone || ''})`
                      : `All candidates have been linked as recommendations under: ${importResult.mainCandidate?.fullName || ''}`}
                  </p>

                  {/* Summary Metric Cards */}
                  <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(130px, 1fr))', gap: '0.75rem', marginBottom: '1.75rem' }}>
                    <div style={{ background: '#f8fafc', border: '1px solid #e2e8f0', borderRadius: '10px', padding: '0.75rem' }}>
                      <div style={{ fontSize: '0.72rem', color: '#64748b', fontWeight: 700 }}>{isRtl ? 'إجمالي المعالجة' : 'Processed'}</div>
                      <div style={{ fontSize: '1.25rem', fontWeight: 800, color: '#0f172a' }}>{importResult.totalProcessed}</div>
                    </div>
                    <div style={{ background: '#f0fdf4', border: '1px solid #bbf7d0', borderRadius: '10px', padding: '0.75rem' }}>
                      <div style={{ fontSize: '0.72rem', color: '#166534', fontWeight: 700 }}>{isRtl ? 'مرشحين جدد' : 'New Candidates'}</div>
                      <div style={{ fontSize: '1.25rem', fontWeight: 800, color: '#16a34a' }}>{importResult.createdCount}</div>
                    </div>
                    <div style={{ background: '#eff6ff', border: '1px solid #bfdbfe', borderRadius: '10px', padding: '0.75rem' }}>
                      <div style={{ fontSize: '0.72rem', color: '#1e40af', fontWeight: 700 }}>{isRtl ? 'تم استبدال بياناتهم' : 'Updated / Replaced'}</div>
                      <div style={{ fontSize: '1.25rem', fontWeight: 800, color: '#2563eb' }}>{importResult.replacedCount}</div>
                    </div>
                    <div style={{ background: '#fffbeb', border: '1px solid #fde68a', borderRadius: '10px', padding: '0.75rem' }}>
                      <div style={{ fontSize: '0.72rem', color: '#92400e', fontWeight: 700 }}>{isRtl ? 'مسميات وظيفية مضافة' : 'New Titles Added'}</div>
                      <div style={{ fontSize: '1.25rem', fontWeight: 800, color: '#d97706' }}>{importResult.newJobsCreatedCount}</div>
                    </div>
                  </div>

                  <button
                    type="button"
                    onClick={handleClose}
                    className="btn btn-primary"
                    style={{ padding: '0.65rem 2rem', fontWeight: 800, fontSize: '0.9375rem' }}
                  >
                    {isRtl ? 'إغلاق وعرض المرشحين' : 'Done & View Candidates'}
                  </button>
                </div>
              ) : null}
            </div>
          )}
        </div>

        {/* Modal Footer Controls */}
        <div
          style={{
            padding: '1rem 1.75rem',
            borderTop: '1px solid var(--border-color, #e2e8f0)',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'space-between',
            background: '#f8fafc'
          }}
        >
          {step === 1 && (
            <>
              <button
                type="button"
                onClick={handleClose}
                className="btn btn-outline-secondary"
                disabled={extracting}
              >
                {isRtl ? 'إلغاء' : 'Cancel'}
              </button>
              <button
                type="button"
                onClick={handleExtract}
                className="btn btn-primary"
                disabled={extracting || !file}
                style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', fontWeight: 800 }}
              >
                {extracting ? <LoadingSpinner size={16} /> : <ArrowLeft size={16} />}
                {isRtl ? 'استخراج وفحص البيانات' : 'Extract & Inspect Sheet'}
              </button>
            </>
          )}

          {step === 2 && (
            <>
              <button
                type="button"
                onClick={() => setStep(1)}
                className="btn btn-outline-secondary"
                style={{ display: 'flex', alignItems: 'center', gap: '0.4rem' }}
              >
                <ArrowRight size={16} />
                {isRtl ? 'الرجوع للملف' : 'Back to File'}
              </button>
              <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem' }}>
                <span style={{ fontSize: '0.8125rem', color: '#64748b' }}>
                  {isRtl
                    ? `المحدد للاستيراد: ${items.filter((i) => i.includeInImport).length} من ${items.length}`
                    : `Selected: ${items.filter((i) => i.includeInImport).length} of ${items.length}`}
                </span>
                <button
                  type="button"
                  onClick={handleExecuteImport}
                  className="btn btn-primary"
                  disabled={items.filter((i) => i.includeInImport).length === 0}
                  style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', fontWeight: 800 }}
                >
                  <Check size={16} />
                  {isRtl ? 'اعتماد واستيراد قاعدة البيانات' : 'Approve & Import Database'}
                </button>
              </div>
            </>
          )}

          {step === 3 && (
            <div style={{ width: '100%', textAlign: 'center' }}>
              <span style={{ fontSize: '0.8125rem', color: '#64748b' }}>
                {processing ? (isRtl ? 'يرجى الانتظار...' : 'Please wait...') : (isRtl ? 'اكتملت العملية' : 'Completed')}
              </span>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
