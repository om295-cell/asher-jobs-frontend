import React, { useState, useRef } from 'react';
import { useLanguage } from '../../context/LanguageContext';
import { useToast } from '../../context/ToastContext';
import { adminApi } from '../../api/admin.api';
import {
  Upload,
  FileText,
  CheckCircle2,
  AlertCircle,
  XCircle,
  RefreshCw,
  Search,
  Trash2,
  X,
  FileSpreadsheet,
  Check,
  AlertTriangle
} from 'lucide-react';

export default function JobTitleImportModal({ isOpen, onClose, categories, onFinished }) {
  const { isRtl } = useLanguage();
  const { showToast } = useToast();

  // Mode: 'file' or 'text'
  const [inputMode, setInputMode] = useState('file');
  const [file, setFile] = useState(null);
  const [rawText, setRawText] = useState('');
  const [selectedDefaultCategory, setSelectedDefaultCategory] = useState(categories[0]?._id || '');

  // Step: 1 = Input, 2 = Review, 3 = Processing
  const [step, setStep] = useState(1);
  const [extracting, setExtracting] = useState(false);

  // Extracted items for review
  const [items, setItems] = useState([]);
  const [reviewSearch, setReviewSearch] = useState('');
  const [summary, setSummary] = useState({ total: 0, unique: 0, duplicates: 0 });

  // Multi-process execution tracking
  const [processing, setProcessing] = useState(false);
  const [processProgress, setProcessProgress] = useState({ current: 0, total: 0, success: 0, failed: 0, duplicate: 0 });
  const [itemStatuses, setItemStatuses] = useState({}); // { [id]: { status: 'pending'|'processing'|'success'|'duplicate'|'failed', error?: string } }
  const [isDone, setIsDone] = useState(false);

  const fileInputRef = useRef(null);

  if (!isOpen) return null;

  const handleReset = () => {
    setStep(1);
    setFile(null);
    setRawText('');
    setItems([]);
    setItemStatuses({});
    setIsDone(false);
    setProcessing(false);
  };

  const handleFileChange = (e) => {
    const selected = e.target.files?.[0];
    if (selected) {
      setFile(selected);
    }
  };

  // Step 1 -> Step 2: Extract Titles
  const handleExtract = async () => {
    if (inputMode === 'file' && !file) {
      showToast(isRtl ? 'يرجى اختيار ملف لاستخراج المسميات' : 'Please select a file to extract', 'warning');
      return;
    }
    if (inputMode === 'text' && !rawText.trim()) {
      showToast(isRtl ? 'يرجى إدخال نص المسميات الوظيفية' : 'Please enter job titles text', 'warning');
      return;
    }
    if (!selectedDefaultCategory) {
      showToast(isRtl ? 'يرجى اختيار القطاع الوظيفي الافتراضي' : 'Please select a default category', 'warning');
      return;
    }

    try {
      setExtracting(true);
      const formData = new FormData();
      if (inputMode === 'file' && file) {
        formData.append('file', file);
      } else {
        formData.append('text', rawText);
      }
      formData.append('defaultCategoryId', selectedDefaultCategory);

      const res = await adminApi.extractJobTitles(formData);
      const data = res.data?.data;

      if (!data || !data.items || data.items.length === 0) {
        showToast(isRtl ? 'لم يتم العثور على أي مسميات صالحة في المدخلات' : 'No valid job titles found', 'warning');
        return;
      }

      setItems(data.items);
      setSummary({
        total: data.totalFound,
        unique: data.uniqueCount,
        duplicates: data.duplicateCount
      });
      setStep(2);
      showToast(
        isRtl
          ? `تم استخراج ${data.totalFound} مسمى (${data.uniqueCount} جديد مؤهل، ${data.duplicateCount} مكرر)`
          : `Extracted ${data.totalFound} titles (${data.uniqueCount} new, ${data.duplicateCount} duplicates)`,
        'success'
      );
    } catch (err) {
      showToast(err.response?.data?.message || 'Extraction failed', 'error');
    } finally {
      setExtracting(false);
    }
  };

  // Selection toggles
  const handleToggleSelectAll = (select) => {
    setItems((prev) =>
      prev.map((item) => ({
        ...item,
        selected: select && !item.isDuplicate
      }))
    );
  };

  const handleToggleItem = (id) => {
    setItems((prev) =>
      prev.map((item) => (item.id === id ? { ...item, selected: !item.selected } : item))
    );
  };

  const handleUpdateItem = (id, field, value) => {
    setItems((prev) =>
      prev.map((item) => (item.id === id ? { ...item, [field]: value } : item))
    );
  };

  const handleRemoveItem = (id) => {
    setItems((prev) => prev.filter((item) => item.id !== id));
  };

  // Step 2 -> Step 3: Run Multi-Process Title Addition
  const handleConfirmAndRun = async () => {
    const selectedItems = items.filter((item) => item.selected);
    if (selectedItems.length === 0) {
      showToast(isRtl ? 'لم يتم تحديد أي مسمى وظيفي للحفظ' : 'No titles selected for saving', 'warning');
      return;
    }

    setStep(3);
    setProcessing(true);
    setIsDone(false);

    // Initialize per-item statuses
    const initialStatuses = {};
    selectedItems.forEach((it) => {
      initialStatuses[it.id] = { status: 'pending' };
    });
    setItemStatuses(initialStatuses);

    let successCount = 0;
    let failedCount = 0;
    let dupCount = 0;
    const totalCount = selectedItems.length;

    setProcessProgress({ current: 0, total: totalCount, success: 0, failed: 0, duplicate: 0 });

    // Process each title as an isolated independent process
    // Using a concurrency pool of 3 to run swiftly while allowing clean tracking of each process
    const CONCURRENCY = 3;
    let currentIndex = 0;

    async function processItem(item) {
      // Mark item as processing
      setItemStatuses((prev) => ({
        ...prev,
        [item.id]: { status: 'processing' }
      }));

      try {
        const payload = {
          name: (item.name || item.title || '').trim(),
          nameAr: (item.nameAr || item.title || '').trim(),
          categoryId: item.categoryId || selectedDefaultCategory,
          description: item.description || ''
        };

        const res = await adminApi.confirmSingleJobTitle(payload);

        if (res.data?.success) {
          successCount++;
          setItemStatuses((prev) => ({
            ...prev,
            [item.id]: { status: 'success', job: res.data.data }
          }));
        }
      } catch (err) {
        const errMsg = err.response?.data?.message || err.message || 'Failed';
        const isDuplicate =
          err.response?.status === 409 ||
          errMsg.toLowerCase().includes('duplicate') ||
          errMsg.toLowerCase().includes('already exists');

        if (isDuplicate) {
          dupCount++;
          setItemStatuses((prev) => ({
            ...prev,
            [item.id]: { status: 'duplicate', error: errMsg }
          }));
        } else {
          failedCount++;
          setItemStatuses((prev) => ({
            ...prev,
            [item.id]: { status: 'failed', error: errMsg }
          }));
        }
      } finally {
        currentIndex++;
        setProcessProgress({
          current: currentIndex,
          total: totalCount,
          success: successCount,
          failed: failedCount,
          duplicate: dupCount
        });
      }
    }

    // Worker pool loop
    const queue = [...selectedItems];
    const workers = Array.from({ length: Math.min(CONCURRENCY, queue.length) }, async () => {
      while (queue.length > 0) {
        const item = queue.shift();
        if (item) {
          await processItem(item);
        }
      }
    });

    await Promise.all(workers);

    setProcessing(false);
    setIsDone(true);
    showToast(
      isRtl
        ? `اكتملت العمليات: تم حفظ ${successCount}، فشل ${failedCount}، مكرر ${dupCount}`
        : `Processes completed: ${successCount} saved, ${failedCount} failed, ${dupCount} duplicate`,
      failedCount > 0 ? 'warning' : 'success'
    );
  };

  // Retry only failed items
  const handleRetryFailed = async () => {
    const failedItems = items.filter(
      (item) => item.selected && itemStatuses[item.id]?.status === 'failed'
    );
    if (failedItems.length === 0) return;

    setProcessing(true);
    setIsDone(false);

    for (const item of failedItems) {
      setItemStatuses((prev) => ({
        ...prev,
        [item.id]: { status: 'processing' }
      }));

      try {
        const payload = {
          name: (item.name || item.title || '').trim(),
          nameAr: (item.nameAr || item.title || '').trim(),
          categoryId: item.categoryId || selectedDefaultCategory,
          description: item.description || ''
        };
        const res = await adminApi.confirmSingleJobTitle(payload);
        if (res.data?.success) {
          setProcessProgress((prev) => ({
            ...prev,
            success: prev.success + 1,
            failed: Math.max(0, prev.failed - 1)
          }));
          setItemStatuses((prev) => ({
            ...prev,
            [item.id]: { status: 'success', job: res.data.data }
          }));
        }
      } catch (err) {
        const errMsg = err.response?.data?.message || err.message;
        setItemStatuses((prev) => ({
          ...prev,
          [item.id]: { status: 'failed', error: errMsg }
        }));
      }
    }

    setProcessing(false);
    setIsDone(true);
  };

  // Filtered review list
  const filteredItems = items.filter((it) => {
    if (!reviewSearch) return true;
    const term = reviewSearch.toLowerCase();
    return (
      it.title?.toLowerCase().includes(term) ||
      it.nameAr?.includes(term) ||
      it.name?.toLowerCase().includes(term)
    );
  });

  const selectedCount = items.filter((it) => it.selected).length;

  return (
    <div
      style={{
        position: 'fixed',
        inset: 0,
        zIndex: 1050,
        background: 'rgba(0,0,0,0.65)',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        padding: '1rem',
        backdropFilter: 'blur(3px)'
      }}
    >
      <div
        className="card"
        style={{
          width: '100%',
          maxWidth: '960px',
          maxHeight: '92vh',
          display: 'flex',
          flexDirection: 'column',
          padding: 0,
          borderRadius: '14px',
          boxShadow: '0 20px 40px rgba(0,0,0,0.3)',
          overflow: 'hidden'
        }}
      >
        {/* Modal Header */}
        <div
          style={{
            padding: '1.25rem 1.5rem',
            borderBottom: '1px solid var(--border)',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'space-between',
            background: 'var(--slate-50)'
          }}
        >
          <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem' }}>
            <div
              style={{
                width: 40,
                height: 40,
                borderRadius: '10px',
                background: 'var(--primary-subtle)',
                color: 'var(--primary)',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center'
              }}
            >
              <FileSpreadsheet size={22} />
            </div>
            <div>
              <h2 style={{ fontSize: '1.15rem', fontWeight: 800, margin: 0, color: 'var(--slate-900)' }}>
                {isRtl ? 'استيراد وفحص المسميات الوظيفية' : 'Import & Extract Job Titles'}
              </h2>
              <p style={{ margin: 0, fontSize: '0.8125rem', color: 'var(--slate-500)' }}>
                {step === 1 && (isRtl ? 'الخطوة 1: رفع ملف أو إدخال نص لاستخراج المسميات' : 'Step 1: Upload document or paste text')}
                {step === 2 && (isRtl ? 'الخطوة 2: مراجعة المسميات وتفادي التكرار قبل التأكيد' : 'Step 2: Review and verify unique titles before saving')}
                {step === 3 && (isRtl ? 'الخطوة 3: معالجة وحفظ كل مسمى كعملية مستقلة ومتابعة النتائج' : 'Step 3: Multi-process independent execution and progress tracker')}
              </p>
            </div>
          </div>

          <button
            onClick={() => {
              if (isDone && onFinished) onFinished();
              onClose();
            }}
            disabled={processing}
            style={{
              background: 'none',
              border: 'none',
              cursor: processing ? 'not-allowed' : 'pointer',
              color: 'var(--slate-400)',
              padding: '0.5rem',
              borderRadius: '8px'
            }}
          >
            <X size={20} />
          </button>
        </div>

        {/* Modal Body */}
        <div style={{ flex: 1, overflowY: 'auto', padding: '1.5rem' }}>
          {/* STEP 1: INPUT */}
          {step === 1 && (
            <div style={{ display: 'flex', flexDirection: 'column', gap: '1.25rem' }}>
              {/* Category selector */}
              <div>
                <label style={{ display: 'block', fontWeight: 700, fontSize: '0.875rem', marginBottom: '0.4rem' }}>
                  {isRtl ? 'القطاع الوظيفي الافتراضي للدفعة' : 'Default Job Category for Batch'} *
                </label>
                <select
                  className="form-control"
                  value={selectedDefaultCategory}
                  onChange={(e) => setSelectedDefaultCategory(e.target.value)}
                  style={{ fontWeight: 600 }}
                >
                  {categories.map((c) => (
                    <option key={c._id} value={c._id}>
                      {isRtl ? c.nameAr || c.name : c.name || c.nameAr}
                    </option>
                  ))}
                </select>
                <span style={{ fontSize: '0.78rem', color: 'var(--slate-500)', marginTop: '0.25rem', display: 'block' }}>
                  {isRtl
                    ? 'سيتم تعيين هذا القطاع لكافة المسميات المستخرجة تلقائياً، مع إمكانية تعديل قطاع أي مسمى أثناء المراجعة.'
                    : 'All extracted titles will default to this category; you can customize individual categories in review.'}
                </span>
              </div>

              {/* Mode Switcher Tabs */}
              <div
                style={{
                  display: 'flex',
                  gap: '0.5rem',
                  borderBottom: '1px solid var(--border)',
                  paddingBottom: '0.5rem'
                }}
              >
                <button
                  type="button"
                  onClick={() => setInputMode('file')}
                  className={`btn ${inputMode === 'file' ? 'btn-primary' : 'btn-outline'}`}
                  style={{ fontSize: '0.875rem', padding: '0.5rem 1rem' }}
                >
                  <Upload size={16} />
                  {isRtl ? 'رفع ملف (Excel, Word, PDF, CSV, TXT)' : 'Upload File (Excel, Word, PDF, CSV, TXT)'}
                </button>
                <button
                  type="button"
                  onClick={() => setInputMode('text')}
                  className={`btn ${inputMode === 'text' ? 'btn-primary' : 'btn-outline'}`}
                  style={{ fontSize: '0.875rem', padding: '0.5rem 1rem' }}
                >
                  <FileText size={16} />
                  {isRtl ? 'إدخال نص مباشر أو قائمة' : 'Direct Text / List Paste'}
                </button>
              </div>

              {/* File Input */}
              {inputMode === 'file' ? (
                <div
                  onClick={() => fileInputRef.current?.click()}
                  style={{
                    border: '2px dashed var(--border)',
                    borderRadius: '12px',
                    padding: '2.5rem 1.5rem',
                    textAlign: 'center',
                    cursor: 'pointer',
                    background: file ? 'rgba(37,99,235,0.03)' : 'var(--slate-50)',
                    transition: 'all 0.2s'
                  }}
                >
                  <input
                    ref={fileInputRef}
                    type="file"
                    style={{ display: 'none' }}
                    accept=".xlsx,.xls,.csv,.docx,.doc,.pdf,.txt"
                    onChange={handleFileChange}
                  />
                  <div
                    style={{
                      width: 54,
                      height: 54,
                      borderRadius: '50%',
                      background: 'rgba(37,99,235,0.1)',
                      color: 'var(--primary)',
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'center',
                      margin: '0 auto 1rem'
                    }}
                  >
                    <Upload size={26} />
                  </div>
                  {file ? (
                    <div>
                      <div style={{ fontWeight: 700, fontSize: '1rem', color: 'var(--slate-800)' }}>
                        {file.name}
                      </div>
                      <div style={{ fontSize: '0.8125rem', color: 'var(--slate-500)', marginTop: '0.25rem' }}>
                        {(file.size / 1024).toFixed(1)} KB — {isRtl ? 'اضغط لتغيير الملف' : 'Click to change file'}
                      </div>
                    </div>
                  ) : (
                    <div>
                      <div style={{ fontWeight: 700, fontSize: '1rem', color: 'var(--slate-800)' }}>
                        {isRtl ? 'انقر هنا لاختيار الملف أو قم بسحبه وإفلاته' : 'Click to choose file or drag and drop'}
                      </div>
                      <div style={{ fontSize: '0.8125rem', color: 'var(--slate-500)', marginTop: '0.35rem' }}>
                        {isRtl
                          ? 'يدعم جميع الأنواع: Excel (.xlsx, .xls), Word (.docx), PDF (.pdf), CSV, TXT'
                          : 'Supports all formats: Excel (.xlsx, .xls), Word (.docx), PDF (.pdf), CSV, TXT'}
                      </div>
                    </div>
                  )}
                </div>
              ) : (
                /* Text Area Input */
                <div>
                  <label style={{ display: 'block', fontWeight: 700, fontSize: '0.875rem', marginBottom: '0.4rem' }}>
                    {isRtl ? 'الصق قائمة المسميات الوظيفية (كل مسمى في سطر أو مفصولة بفاصلة)' : 'Paste job titles list (one per line or comma-separated)'}
                  </label>
                  <textarea
                    rows={8}
                    className="form-control"
                    placeholder={
                      isRtl
                        ? 'محاسب تكاليف\nمهندس كهرباء صيانة\nفني جودة نسيج\nمندوب مبيعات تجزئة\nمدير مشتريات'
                        : 'Accountant\nElectrical Maintenance Engineer\nQuality Technician\nSales Representative'
                    }
                    value={rawText}
                    onChange={(e) => setRawText(e.target.value)}
                    style={{ lineHeight: 1.6, fontSize: '0.9rem' }}
                  />
                </div>
              )}
            </div>
          )}

          {/* STEP 2: REVIEW EXTRACTED TITLES */}
          {step === 2 && (
            <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
              {/* Summary Stats Badges */}
              <div
                style={{
                  display: 'grid',
                  gridTemplateColumns: 'repeat(auto-fit, minmax(180px, 1fr))',
                  gap: '0.75rem'
                }}
              >
                <div
                  style={{
                    padding: '0.75rem 1rem',
                    background: 'var(--slate-100)',
                    borderRadius: '8px',
                    display: 'flex',
                    alignItems: 'center',
                    gap: '0.75rem'
                  }}
                >
                  <FileText size={20} color="var(--slate-600)" />
                  <div>
                    <div style={{ fontSize: '1.25rem', fontWeight: 800 }}>{summary.total}</div>
                    <div style={{ fontSize: '0.75rem', color: 'var(--slate-500)' }}>{isRtl ? 'إجمالي المستخرج' : 'Total Extracted'}</div>
                  </div>
                </div>

                <div
                  style={{
                    padding: '0.75rem 1rem',
                    background: 'rgba(22,163,74,0.08)',
                    borderRadius: '8px',
                    display: 'flex',
                    alignItems: 'center',
                    gap: '0.75rem'
                  }}
                >
                  <CheckCircle2 size={20} color="#16a34a" />
                  <div>
                    <div style={{ fontSize: '1.25rem', fontWeight: 800, color: '#16a34a' }}>{summary.unique}</div>
                    <div style={{ fontSize: '0.75rem', color: '#15803d' }}>{isRtl ? 'جديد مؤهل للحفظ' : 'Ready Unique Titles'}</div>
                  </div>
                </div>

                <div
                  style={{
                    padding: '0.75rem 1rem',
                    background: 'rgba(234,88,12,0.08)',
                    borderRadius: '8px',
                    display: 'flex',
                    alignItems: 'center',
                    gap: '0.75rem'
                  }}
                >
                  <AlertTriangle size={20} color="#ea580c" />
                  <div>
                    <div style={{ fontSize: '1.25rem', fontWeight: 800, color: '#ea580c' }}>{summary.duplicates}</div>
                    <div style={{ fontSize: '0.75rem', color: '#c2410c' }}>{isRtl ? 'مكرر تم كشفه (غير محدد)' : 'Duplicates Detected'}</div>
                  </div>
                </div>
              </div>

              {/* Action and Search Bar */}
              <div
                style={{
                  display: 'flex',
                  flexWrap: 'wrap',
                  justifyContent: 'space-between',
                  alignItems: 'center',
                  gap: '0.75rem',
                  paddingTop: '0.5rem'
                }}
              >
                <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', flex: 1, minWidth: '220px' }}>
                  <div style={{ position: 'relative', width: '100%' }}>
                    <input
                      type="text"
                      className="form-control"
                      placeholder={isRtl ? 'بحث في المسميات المستخرجة...' : 'Filter extracted titles...'}
                      value={reviewSearch}
                      onChange={(e) => setReviewSearch(e.target.value)}
                      style={{ fontSize: '0.85rem' }}
                    />
                  </div>
                </div>

                <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                  <button
                    type="button"
                    onClick={() => handleToggleSelectAll(true)}
                    className="btn btn-outline"
                    style={{ fontSize: '0.8rem', padding: '0.4rem 0.75rem' }}
                  >
                    <Check size={14} />
                    {isRtl ? 'تحديد المؤهلة' : 'Select Eligible'}
                  </button>
                  <button
                    type="button"
                    onClick={() => handleToggleSelectAll(false)}
                    className="btn btn-outline"
                    style={{ fontSize: '0.8rem', padding: '0.4rem 0.75rem' }}
                  >
                    {isRtl ? 'إلغاء التحديد' : 'Deselect All'}
                  </button>
                </div>
              </div>

              {/* Review Table */}
              <div
                style={{
                  maxHeight: '380px',
                  overflowY: 'auto',
                  border: '1px solid var(--border)',
                  borderRadius: '10px'
                }}
              >
                <table style={{ width: '100%', borderCollapse: 'collapse', fontSize: '0.85rem', textAlign: isRtl ? 'right' : 'left' }}>
                  <thead>
                    <tr style={{ background: 'var(--slate-100)', borderBottom: '1px solid var(--border)', position: 'sticky', top: 0, zIndex: 1 }}>
                      <th style={{ padding: '0.75rem 0.5rem', width: '40px', textAlign: 'center' }}>#</th>
                      <th style={{ padding: '0.75rem' }}>{isRtl ? 'المسمى الوظيفي' : 'Job Title'}</th>
                      <th style={{ padding: '0.75rem', width: '220px' }}>{isRtl ? 'القطاع الوظيفي' : 'Category'}</th>
                      <th style={{ padding: '0.75rem', width: '160px' }}>{isRtl ? 'حالة الفحص' : 'Duplicate Check'}</th>
                      <th style={{ padding: '0.75rem 0.5rem', width: '40px', textAlign: 'center' }}></th>
                    </tr>
                  </thead>
                  <tbody>
                    {filteredItems.map((item, idx) => (
                      <tr
                        key={item.id}
                        style={{
                          borderBottom: '1px solid var(--border)',
                          background: item.isDuplicate
                            ? 'rgba(234,88,12,0.03)'
                            : item.selected
                            ? 'rgba(37,99,235,0.02)'
                            : '#fff'
                        }}
                      >
                        {/* Checkbox */}
                        <td style={{ padding: '0.5rem', textAlign: 'center' }}>
                          <input
                            type="checkbox"
                            checked={Boolean(item.selected)}
                            disabled={item.isDuplicate}
                            onChange={() => handleToggleItem(item.id)}
                            style={{ cursor: item.isDuplicate ? 'not-allowed' : 'pointer', width: 16, height: 16 }}
                          />
                        </td>

                        {/* Title Input */}
                        <td style={{ padding: '0.5rem 0.75rem' }}>
                          <input
                            type="text"
                            value={item.name}
                            onChange={(e) => {
                              handleUpdateItem(item.id, 'name', e.target.value);
                              handleUpdateItem(item.id, 'nameAr', e.target.value);
                            }}
                            className="form-control"
                            style={{
                              fontSize: '0.85rem',
                              padding: '0.35rem 0.6rem',
                              fontWeight: 600,
                              borderColor: item.isDuplicate ? '#fdba74' : undefined
                            }}
                          />
                        </td>

                        {/* Category Selector */}
                        <td style={{ padding: '0.5rem 0.75rem' }}>
                          <select
                            value={item.categoryId || selectedDefaultCategory}
                            onChange={(e) => handleUpdateItem(item.id, 'categoryId', e.target.value)}
                            className="form-control"
                            style={{ fontSize: '0.8125rem', padding: '0.35rem 0.5rem' }}
                          >
                            {categories.map((c) => (
                              <option key={c._id} value={c._id}>
                                {isRtl ? c.nameAr || c.name : c.name || c.nameAr}
                              </option>
                            ))}
                          </select>
                        </td>

                        {/* Duplicate / Validation Status */}
                        <td style={{ padding: '0.5rem 0.75rem' }}>
                          {item.isDuplicate ? (
                            <span
                              style={{
                                display: 'inline-flex',
                                alignItems: 'center',
                                gap: '0.3rem',
                                color: '#c2410c',
                                background: '#ffedd5',
                                padding: '0.25rem 0.5rem',
                                borderRadius: '6px',
                                fontSize: '0.72rem',
                                fontWeight: 700
                              }}
                              title={item.duplicateReason}
                            >
                              <AlertTriangle size={13} />
                              {isRtl ? 'مكرر - لن يضاف' : 'Duplicate - Excluded'}
                            </span>
                          ) : (
                            <span
                              style={{
                                display: 'inline-flex',
                                alignItems: 'center',
                                gap: '0.3rem',
                                color: '#15803d',
                                background: '#dcfce7',
                                padding: '0.25rem 0.5rem',
                                borderRadius: '6px',
                                fontSize: '0.72rem',
                                fontWeight: 700
                              }}
                            >
                              <CheckCircle2 size={13} />
                              {isRtl ? 'مؤهل كجديد' : 'Eligible'}
                            </span>
                          )}
                        </td>

                        {/* Discard button */}
                        <td style={{ padding: '0.5rem', textAlign: 'center' }}>
                          <button
                            type="button"
                            onClick={() => handleRemoveItem(item.id)}
                            style={{
                              background: 'none',
                              border: 'none',
                              color: 'var(--slate-400)',
                              cursor: 'pointer',
                              padding: '0.25rem'
                            }}
                            title={isRtl ? 'حذف من المراجعة' : 'Remove'}
                          >
                            <Trash2 size={15} />
                          </button>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>
          )}

          {/* STEP 3: MULTI-PROCESS PROGRESS & RESULT TRACKER */}
          {step === 3 && (
            <div style={{ display: 'flex', flexDirection: 'column', gap: '1.25rem' }}>
              {/* Progress Bar & Counters */}
              <div className="card" style={{ padding: '1.25rem', background: 'var(--slate-50)' }}>
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '0.5rem' }}>
                  <div style={{ fontWeight: 700, fontSize: '0.95rem' }}>
                    {processing
                      ? isRtl ? 'جارٍ تنفيذ عمليات الحفظ المستقلة...' : 'Executing independent title addition processes...'
                      : isRtl ? 'اكتملت جميع العمليات' : 'All processes completed'}
                  </div>
                  <div style={{ fontWeight: 800, fontSize: '0.95rem', color: 'var(--primary)' }}>
                    {processProgress.current} / {processProgress.total} (
                    {processProgress.total > 0
                      ? Math.round((processProgress.current / processProgress.total) * 100)
                      : 0}
                    %)
                  </div>
                </div>

                {/* Progress bar line */}
                <div style={{ width: '100%', height: '8px', background: 'var(--slate-200)', borderRadius: '4px', overflow: 'hidden' }}>
                  <div
                    style={{
                      height: '100%',
                      background: processProgress.failed > 0 ? '#f59e0b' : '#16a34a',
                      width: `${processProgress.total > 0 ? (processProgress.current / processProgress.total) * 100 : 0}%`,
                      transition: 'width 0.2s'
                    }}
                  />
                </div>

                {/* Status Counters Strip */}
                <div style={{ display: 'flex', gap: '1.5rem', marginTop: '1rem', fontSize: '0.85rem' }}>
                  <div style={{ display: 'flex', alignItems: 'center', gap: '0.35rem', color: '#16a34a', fontWeight: 700 }}>
                    <CheckCircle2 size={16} />
                    <span>{isRtl ? 'نجح الحفظ:' : 'Success:'} {processProgress.success}</span>
                  </div>
                  <div style={{ display: 'flex', alignItems: 'center', gap: '0.35rem', color: '#ef4444', fontWeight: 700 }}>
                    <XCircle size={16} />
                    <span>{isRtl ? 'فشل:' : 'Failed:'} {processProgress.failed}</span>
                  </div>
                  <div style={{ display: 'flex', alignItems: 'center', gap: '0.35rem', color: '#ea580c', fontWeight: 700 }}>
                    <AlertCircle size={16} />
                    <span>{isRtl ? 'مكرر تم استبعاده:' : 'Duplicate:'} {processProgress.duplicate}</span>
                  </div>
                </div>
              </div>

              {/* Per-Item Live Status Log */}
              <div
                style={{
                  maxHeight: '340px',
                  overflowY: 'auto',
                  border: '1px solid var(--border)',
                  borderRadius: '10px'
                }}
              >
                <table style={{ width: '100%', borderCollapse: 'collapse', fontSize: '0.85rem', textAlign: isRtl ? 'right' : 'left' }}>
                  <thead>
                    <tr style={{ background: 'var(--slate-100)', borderBottom: '1px solid var(--border)', position: 'sticky', top: 0, zIndex: 1 }}>
                      <th style={{ padding: '0.6rem 0.75rem', width: '60px' }}>#</th>
                      <th style={{ padding: '0.6rem 0.75rem' }}>{isRtl ? 'المسمى الوظيفي' : 'Job Title'}</th>
                      <th style={{ padding: '0.6rem 0.75rem', width: '140px' }}>{isRtl ? 'حالة العملية' : 'Process Status'}</th>
                      <th style={{ padding: '0.6rem 0.75rem' }}>{isRtl ? 'تفاصيل النتيجة / الخطأ' : 'Details / Error Note'}</th>
                    </tr>
                  </thead>
                  <tbody>
                    {items
                      .filter((it) => it.selected)
                      .map((item, idx) => {
                        const st = itemStatuses[item.id] || { status: 'pending' };
                        return (
                          <tr key={item.id} style={{ borderBottom: '1px solid var(--border)' }}>
                            <td style={{ padding: '0.5rem 0.75rem', color: 'var(--slate-400)' }}>{idx + 1}</td>
                            <td style={{ padding: '0.5rem 0.75rem', fontWeight: 600 }}>{item.name || item.title}</td>
                            <td style={{ padding: '0.5rem 0.75rem' }}>
                              {st.status === 'pending' && (
                                <span style={{ color: 'var(--slate-500)', fontSize: '0.75rem' }}>
                                  ⏳ {isRtl ? 'في الانتظار' : 'Pending'}
                                </span>
                              )}
                              {st.status === 'processing' && (
                                <span style={{ color: 'var(--primary)', fontWeight: 700, fontSize: '0.75rem' }}>
                                  🔄 {isRtl ? 'جارٍ التنفيذ...' : 'Processing...'}
                                </span>
                              )}
                              {st.status === 'success' && (
                                <span
                                  style={{
                                    display: 'inline-flex',
                                    alignItems: 'center',
                                    gap: '0.25rem',
                                    color: '#15803d',
                                    background: '#dcfce7',
                                    padding: '0.2rem 0.45rem',
                                    borderRadius: '5px',
                                    fontWeight: 700,
                                    fontSize: '0.75rem'
                                  }}
                                >
                                  <CheckCircle2 size={13} /> {isRtl ? 'تم بنجاح' : 'Success'}
                                </span>
                              )}
                              {st.status === 'duplicate' && (
                                <span
                                  style={{
                                    display: 'inline-flex',
                                    alignItems: 'center',
                                    gap: '0.25rem',
                                    color: '#c2410c',
                                    background: '#ffedd5',
                                    padding: '0.2rem 0.45rem',
                                    borderRadius: '5px',
                                    fontWeight: 700,
                                    fontSize: '0.75rem'
                                  }}
                                >
                                  <AlertCircle size={13} /> {isRtl ? 'مكرر' : 'Duplicate'}
                                </span>
                              )}
                              {st.status === 'failed' && (
                                <span
                                  style={{
                                    display: 'inline-flex',
                                    alignItems: 'center',
                                    gap: '0.25rem',
                                    color: '#b91c1c',
                                    background: '#fee2e2',
                                    padding: '0.2rem 0.45rem',
                                    borderRadius: '5px',
                                    fontWeight: 700,
                                    fontSize: '0.75rem'
                                  }}
                                >
                                  <XCircle size={13} /> {isRtl ? 'فشلت' : 'Failed'}
                                </span>
                              )}
                            </td>
                            <td style={{ padding: '0.5rem 0.75rem', fontSize: '0.78rem', color: st.error ? '#dc2626' : 'var(--slate-500)' }}>
                              {st.error || (st.status === 'success' ? (isRtl ? 'تم إنشاء المسمى في الكتالوج' : 'Created in catalog') : '—')}
                            </td>
                          </tr>
                        );
                      })}
                  </tbody>
                </table>
              </div>
            </div>
          )}
        </div>

        {/* Modal Footer */}
        <div
          style={{
            padding: '1rem 1.5rem',
            borderTop: '1px solid var(--border)',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'space-between',
            background: 'var(--slate-50)'
          }}
        >
          {step === 1 && (
            <>
              <button type="button" onClick={onClose} className="btn btn-outline">
                {isRtl ? 'إلغاء' : 'Cancel'}
              </button>
              <button
                type="button"
                onClick={handleExtract}
                disabled={extracting}
                className="btn btn-primary"
                style={{ fontWeight: 700 }}
              >
                {extracting ? (
                  <>
                    <RefreshCw size={16} className="spin" />
                    {isRtl ? 'جارٍ قراءة الملف واستخراج المسميات...' : 'Reading & Extracting...'}
                  </>
                ) : (
                  <>
                    <FileSpreadsheet size={16} />
                    {isRtl ? 'استخراج وفحص المسميات' : 'Extract & Analyze Titles'}
                  </>
                )}
              </button>
            </>
          )}

          {step === 2 && (
            <>
              <button type="button" onClick={() => setStep(1)} className="btn btn-outline">
                {isRtl ? 'تراجع / تغيير الملف' : 'Back / Change File'}
              </button>
              <button
                type="button"
                onClick={handleConfirmAndRun}
                disabled={selectedCount === 0}
                className="btn btn-primary"
                style={{ fontWeight: 700 }}
              >
                <CheckCircle2 size={16} />
                {isRtl ? `تأكيد وحفظ المسميات المحددة (${selectedCount} مسمى)` : `Confirm & Save Selected (${selectedCount})`}
              </button>
            </>
          )}

          {step === 3 && (
            <>
              <div>
                {isDone && processProgress.failed > 0 && (
                  <button
                    type="button"
                    onClick={handleRetryFailed}
                    disabled={processing}
                    className="btn btn-outline"
                    style={{ color: '#ea580c', borderColor: '#fdba74' }}
                  >
                    <RefreshCw size={14} />
                    {isRtl ? `إعادة محاولة الفاشلة فقط (${processProgress.failed})` : `Retry Failed (${processProgress.failed})`}
                  </button>
                )}
              </div>
              <div style={{ display: 'flex', gap: '0.5rem' }}>
                {isDone && (
                  <button
                    type="button"
                    onClick={() => {
                      if (onFinished) onFinished();
                      onClose();
                    }}
                    className="btn btn-primary"
                    style={{ fontWeight: 700 }}
                  >
                    {isRtl ? 'إنهاء وتحديث الكتالوج' : 'Done & Refresh Catalog'}
                  </button>
                )}
              </div>
            </>
          )}
        </div>
      </div>
    </div>
  );
}
