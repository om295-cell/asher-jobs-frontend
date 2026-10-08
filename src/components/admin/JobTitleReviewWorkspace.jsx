import React, { useEffect, useState } from 'react';
import { Archive, Check, Edit3, Eye, FileUp, Loader2, Plus, RefreshCw, Send, Trash2, X, XCircle } from 'lucide-react';
import { adminApi } from '../../api/admin.api';
import { useToast } from '../../context/ToastContext';
import EmptyState from '../ui/EmptyState';
import LoadingSpinner from '../ui/LoadingSpinner';

const STATUS_COLORS = {
  'Pending Review': ['#92400e', '#fef3c7'],
  Processing: ['#1d4ed8', '#dbeafe'],
  Approved: ['#166534', '#dcfce7'],
  Edited: ['#6b21a8', '#f3e8ff'],
  Rejected: ['#991b1b', '#fee2e2'],
  Failed: ['#991b1b', '#fee2e2']
};
const STATUS_LABELS = {
  'Pending Review': 'قيد المراجعة',
  Processing: 'جارٍ المعالجة',
  Approved: 'معتمد',
  Edited: 'تم التعديل',
  Rejected: 'مرفوض',
  Failed: 'فشل'
};

function Badge({ status }) {
  const [color, background] = STATUS_COLORS[status] || ['#475569', '#f1f5f9'];
  return <span style={{ color, background, borderRadius: 999, padding: '0.22rem 0.55rem', fontSize: '0.75rem', fontWeight: 750, whiteSpace: 'nowrap' }}>{STATUS_LABELS[status] || status}</span>;
}

function readableDate(value) {
  return value ? new Date(value).toLocaleString() : '—';
}

export default function JobTitleReviewWorkspace({ categories, onCatalogChanged }) {
  const { showToast } = useToast();
  const [reviews, setReviews] = useState([]);
  const [batches, setBatches] = useState([]);
  const [pagination, setPagination] = useState(null);
  const [loading, setLoading] = useState(true);
  const [submitting, setSubmitting] = useState(false);
  const [page, setPage] = useState(1);
  const [filters, setFilters] = useState({ status: '', batchId: '', search: '', archived: '' });
  const [submission, setSubmission] = useState({ open: false, mode: 'manual', text: '', file: null });
  const [selected, setSelected] = useState(null);
  const [edit, setEdit] = useState(null);
  const [saving, setSaving] = useState(false);
  const [rejecting, setRejecting] = useState(null);
  const [rejectionReason, setRejectionReason] = useState('');
  const [bulkRejecting, setBulkRejecting] = useState(false);
  const [bulkRejectReason, setBulkRejectReason] = useState('');

  const load = async (targetPage = page, overrideFilters) => {
    setLoading(true);
    try {
      const activeFilters = overrideFilters || filters;
      const params = { page: targetPage, limit: 25, ...activeFilters };
      Object.keys(params).forEach((key) => !params[key] && delete params[key]);
      const [reviewRes, batchRes] = await Promise.all([
        adminApi.listTitleReviews(params),
        adminApi.listTitleBatches({ limit: 100 })
      ]);
      setReviews(reviewRes.data?.data || []);
      setPagination(reviewRes.data?.pagination || null);
      setBatches(batchRes.data?.data || []);
    } catch (error) {
      showToast(error.response?.data?.message || 'تعذر تحميل قائمة مراجعة المسميات.', 'error');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => { load(1); }, []);

  const applyFilters = () => { setPage(1); load(1); };

  const openSubmission = (mode) => setSubmission({
    open: true,
    mode,
    text: '',
    file: null,
    idempotencyKey: `${Date.now()}-${Math.random().toString(36).slice(2)}`
  });

  const submitBatch = async (event) => {
    event.preventDefault();
    if (submission.mode === 'manual' && !submission.text.trim()) return showToast('أدخل مسمى وظيفيًا واحدًا على الأقل.', 'warning');
    if (submission.mode === 'file' && !submission.file) return showToast('اختر ملفًا للاستيراد.', 'warning');
    setSubmitting(true);
    try {
      let response;
      if (submission.mode === 'manual') {
        response = await adminApi.createManualTitleBatch({ text: submission.text, idempotencyKey: submission.idempotencyKey });
      } else {
        const formData = new FormData();
        formData.append('file', submission.file);
        formData.append('idempotencyKey', submission.idempotencyKey);
        response = await adminApi.createFileTitleBatch(formData);
      }
      const batch = response.data?.data;
      showToast(`تم إنشاء الدفعة ${batch?.batchNumber || ''}: ${batch?.totalTitles || 0} سجلًا مستقلًا، منها ${batch?.failedCount || 0} فشل.`, 'success');
      setSubmission((value) => ({ ...value, open: false }));
      setPage(1);
      if (onCatalogChanged) onCatalogChanged();
      await load(1);
    } catch (error) {
      showToast(error.response?.data?.message || 'تعذر إنشاء دفعة المراجعة.', 'error');
    } finally {
      setSubmitting(false);
    }
  };

  const refreshAfterAction = async () => {
    await load(page);
    if (onCatalogChanged) onCatalogChanged();
  };

  const approve = async (review) => {
    setSaving(true);
    try {
      const response = await adminApi.approveTitleReview(review._id, {});
      const updated = response.data?.data;
      if (updated?.status === 'Failed') showToast(updated.errorMessage || 'تعذر اعتماد المسمى.', 'error');
      else showToast('تم اعتماد المسمى وإضافته إلى الكتالوج.', 'success');
      setSelected(updated || review);
      await refreshAfterAction();
    } catch (error) {
      showToast(error.response?.data?.message || 'فشل اعتماد المسمى.', 'error');
    } finally { setSaving(false); }
  };

  const saveEdit = async (event) => {
    event.preventDefault();
    setSaving(true);
    try {
      const response = await adminApi.editTitleReview(edit._id, { finalTitle: edit.finalTitle, categoryId: edit.categoryId?._id || edit.categoryId });
      setEdit(null);
      setSelected(response.data?.data || null);
      showToast('تم حفظ التعديل. يمكنك الاعتماد عند الجاهزية.', 'success');
      await refreshAfterAction();
    } catch (error) {
      showToast(error.response?.data?.message || 'تعذر حفظ التعديل.', 'error');
    } finally { setSaving(false); }
  };

  const reject = async (event) => {
    event.preventDefault();
    setSaving(true);
    try {
      await adminApi.rejectTitleReview(rejecting._id, rejectionReason);
      setRejecting(null);
      setRejectionReason('');
      showToast('تم رفض المسمى.', 'info');
      await refreshAfterAction();
    } catch (error) {
      showToast(error.response?.data?.message || 'تعذر رفض المسمى.', 'error');
    } finally { setSaving(false); }
  };

  const retry = async (review) => {
    setSaving(true);
    try {
      const response = await adminApi.retryTitleReview(review._id);
      const updated = response.data?.data;
      showToast(updated?.status === 'Failed' ? updated.errorMessage : 'تمت إعادة المسمى إلى قائمة المراجعة.', updated?.status === 'Failed' ? 'error' : 'success');
      await refreshAfterAction();
    } catch (error) {
      showToast(error.response?.data?.message || 'فشلت إعادة المحاولة.', 'error');
    } finally { setSaving(false); }
  };

  const deleteArchived = async (review) => {
    if (!window.confirm(`حذف نهائي: "${review.finalTitle || review.originalTitle}"؟`)) return;
    setSaving(true);
    try {
      await adminApi.deleteArchivedTitleReview(review._id);
      showToast('تم الحذف النهائي.', 'info');
      await refreshAfterAction();
    } catch (error) {
      showToast(error.response?.data?.message || 'تعذر الحذف.', 'error');
    } finally { setSaving(false); }
  };

  const deleteAllArchived = async () => {
    if (!window.confirm('حذف جميع سجلات الأرشيف نهائيًا؟ لا يمكن التراجع.')) return;
    setSaving(true);
    try {
      const response = await adminApi.deleteAllArchivedTitleReviews(filters.batchId || undefined);
      const { deletedCount } = response.data?.data || {};
      showToast(`تم حذف ${deletedCount} سجل نهائيًا.`, 'info');
      await refreshAfterAction();
    } catch (error) {
      showToast(error.response?.data?.message || 'تعذر الحذف الجماعي.', 'error');
    } finally { setSaving(false); }
  };

  const bulkReject = async (event) => {
    event.preventDefault();
    setSaving(true);
    try {
      const response = await adminApi.bulkRejectTitleReviews(bulkRejectReason, filters.batchId || undefined);
      const { rejectedCount } = response.data?.data || {};
      setBulkRejecting(false);
      setBulkRejectReason('');
      showToast(`تم رفض ${rejectedCount} مسمى.`, 'info');
      await refreshAfterAction();
    } catch (error) {
      showToast(error.response?.data?.message || 'تعذر تنفيذ الرفض الجماعي.', 'error');
    } finally { setSaving(false); }
  };

  const allPendingHaveIssues = reviews.length > 0 &&
    reviews.filter((r) => ['Pending Review', 'Edited', 'Failed'].includes(r.status))
           .every((r) => r.errorMessage);

  return <div dir="rtl" style={{ textAlign: 'right' }}>
    <div className="card" style={{ marginBottom: '1rem', padding: '1rem' }}>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', gap: '1rem', flexWrap: 'wrap' }}>
        <div>
          <h2 style={{ fontSize: '1rem', fontWeight: 800, margin: 0 }}>مراجعة المسميات الوظيفية</h2>
          <p style={{ margin: '0.25rem 0 0', color: 'var(--slate-500)', fontSize: '0.85rem' }}>لكل مسمى سجل مراجعة مستقل. الدفعة للتجميع فقط، ولا يؤدي فشل مسمى واحد إلى إيقاف بقية المسميات.</p>
        </div>
        <div style={{ display: 'flex', gap: '0.5rem', flexWrap: 'wrap' }}>
          {allPendingHaveIssues && <button className="btn btn-danger" onClick={() => { setBulkRejecting(true); setBulkRejectReason(''); }}><XCircle size={16} /> رفض الكل</button>}
          {reviews.some((r) => r.isArchived || r.status === 'Rejected') && <button className="btn btn-danger" onClick={deleteAllArchived} disabled={saving}><Trash2 size={16} /> حذف الكل</button>}
          <button
            className={`btn ${filters.archived === 'true' ? 'btn-primary' : 'btn-outline'}`}
            onClick={() => { const next = filters.archived === 'true' ? '' : 'true'; const updated = { ...filters, archived: next, status: '' }; setFilters(updated); setPage(1); load(1, updated); }}
          ><Archive size={16} /> {filters.archived === 'true' ? 'عرض النشطة' : 'الأرشيف'}</button>
          <button className="btn btn-outline" onClick={() => openSubmission('file')}><FileUp size={16} /> استيراد ملف</button>
          <button className="btn btn-primary" onClick={() => openSubmission('manual')}><Plus size={16} /> إضافة مسميات للمراجعة</button>
        </div>
      </div>
    </div>

    <div className="card" style={{ marginBottom: '1rem', padding: '1rem' }}>
      <div style={{ display: 'grid', gridTemplateColumns: 'minmax(180px, 1fr) minmax(160px, .65fr) minmax(180px, .75fr) auto', gap: '0.75rem', alignItems: 'end' }}>
        <label style={{ fontSize: '0.82rem', fontWeight: 700 }}>بحث
          <input className="form-control" value={filters.search} onChange={(e) => setFilters({ ...filters, search: e.target.value })} placeholder="المسمى الأصلي أو النهائي" />
        </label>
        <label style={{ fontSize: '0.82rem', fontWeight: 700 }}>الحالة
          <select className="form-control" value={filters.status} onChange={(e) => setFilters({ ...filters, status: e.target.value })}>
            <option value="">كل الحالات</option>{Object.keys(STATUS_COLORS).map((status) => <option key={status} value={status}>{STATUS_LABELS[status]}</option>)}
          </select>
        </label>
        <label style={{ fontSize: '0.82rem', fontWeight: 700 }}>الدفعة
          <select className="form-control" value={filters.batchId} onChange={(e) => setFilters({ ...filters, batchId: e.target.value })}>
            <option value="">كل الدفعات</option>{batches.map((batch) => <option key={batch._id} value={batch._id}>{batch.batchNumber} ({batch.totalTitles})</option>)}
          </select>
        </label>
        <button className="btn btn-outline" onClick={applyFilters}><RefreshCw size={16} /> تصفية</button>
      </div>
    </div>

    <div className="card" style={{ padding: 0, overflow: 'hidden' }}>
      {loading ? <div style={{ padding: '3rem' }}><LoadingSpinner /></div> : reviews.length === 0 ? <EmptyState icon={FileUp} title="لا توجد سجلات مراجعة" description="أضف المسميات يدويًا أو استورد ملفًا مدعومًا لإنشاء دفعة مراجعة." /> :
        <div className="table-responsive"><table className="data-table" style={{ minWidth: 1200, width: '100%', fontSize: '0.82rem' }}>
          <thead><tr><th>المسمى</th><th>المسمى الأصلي</th><th>المصدر</th><th>الحالة</th><th>الدفعة</th><th>تاريخ الإنشاء</th><th>الخطأ / سبب الرفض</th><th>راجعه</th><th style={{ textAlign: 'center' }}>الإجراءات</th></tr></thead>
          <tbody>{reviews.map((review) => <tr key={review._id}>
            <td style={{ fontWeight: 750 }}>{review.finalTitle || '—'}</td><td>{review.originalTitle}</td><td>{review.source === 'file' ? 'ملف' : 'إدخال يدوي'}</td><td><Badge status={review.status} /></td>
            <td>{review.batchId?.batchNumber || '—'}</td><td>{readableDate(review.createdAt)}</td><td style={{ color: review.errorMessage || review.rejectionReason ? '#b91c1c' : 'inherit', maxWidth: 220 }}>{review.errorMessage || review.rejectionReason || '—'}</td>
            <td>{review.reviewedBy?.email || '—'}</td>
            <td><div style={{ display: 'flex', gap: '0.35rem', justifyContent: 'center' }}>
              <button className="btn" onClick={() => setSelected(review)} title="عرض" style={{ padding: '0.35rem' }}><Eye size={15} /></button>
              {!['Approved', 'Rejected'].includes(review.status) && <button className="btn" onClick={() => setEdit({ ...review })} title="تعديل" style={{ padding: '0.35rem' }}><Edit3 size={15} /></button>}
              {['Pending Review', 'Edited'].includes(review.status) && <button className="btn" onClick={() => approve(review)} disabled={saving} title="اعتماد" style={{ padding: '0.35rem', color: '#15803d' }}><Check size={15} /></button>}
              {!['Approved', 'Rejected'].includes(review.status) && <button className="btn" onClick={() => { setRejecting(review); setRejectionReason(''); }} title="رفض" style={{ padding: '0.35rem', color: '#b91c1c' }}><XCircle size={15} /></button>}
              {review.status === 'Failed' && <button className="btn" onClick={() => retry(review)} disabled={saving} title="إعادة المحاولة" style={{ padding: '0.35rem', color: '#1d4ed8' }}><RefreshCw size={15} /></button>}
              {review.isArchived && <button className="btn" onClick={() => deleteArchived(review)} disabled={saving} title="حذف نهائي" style={{ padding: '0.35rem', color: '#b91c1c' }}><Trash2 size={15} /></button>}
            </div></td>
          </tr>)}</tbody>
        </table></div>}
    </div>
    {pagination?.pages > 1 && <div style={{ display: 'flex', justifyContent: 'center', gap: '0.75rem', alignItems: 'center', padding: '1rem 0' }}><button className="btn btn-outline" disabled={pagination.page <= 1} onClick={() => { const nextPage = pagination.page - 1; setPage(nextPage); load(nextPage); }}>السابق</button><span>{pagination.page} / {pagination.pages}</span><button className="btn btn-outline" disabled={pagination.page >= pagination.pages} onClick={() => { const nextPage = pagination.page + 1; setPage(nextPage); load(nextPage); }}>التالي</button></div>}

    {submission.open && <div className="modal-overlay"><form className="modal-content" onSubmit={submitBatch} style={{ maxWidth: 640, padding: '1.5rem' }} dir="rtl">
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1rem' }}><h3 style={{ margin: 0 }}>{submission.mode === 'manual' ? 'إضافة مسميات للمراجعة' : 'استيراد مسميات للمراجعة'}</h3><button type="button" className="btn" onClick={() => setSubmission({ ...submission, open: false })}><X size={18} /></button></div>
      <p style={{ color: 'var(--slate-600)', fontSize: '0.88rem' }}>{submission.mode === 'manual' ? 'أدخل مسمى واحدًا في كل سطر. ينشئ كل سطر سجل مراجعة مستقلًا.' : 'الصيغ المدعومة: TXT وCSV وXLS/XLSX وDOC/DOCX وPDF، حتى 15 ميجابايت. ينشئ كل مسمى مستخرج سجل مراجعة مستقلًا.'}</p>
      <p style={{ color: 'var(--slate-600)', fontSize: '0.82rem' }}>سيتم إنشاء وتصنيف المسميات الجديدة تلقائيًا ضمن «غير مصنف»، ويمكنك تغيير التصنيف لاحقًا من شاشة المراجعة.</p>
      {submission.mode === 'manual' ? <textarea className="form-control" value={submission.text} onChange={(e) => setSubmission({ ...submission, text: e.target.value })} rows={10} placeholder={'كهربائي\nمشغل ماكينات\nمفتش جودة'} /> : <input className="form-control" type="file" accept=".txt,.csv,.xls,.xlsx,.doc,.docx,.pdf" onChange={(e) => setSubmission({ ...submission, file: e.target.files?.[0] || null })} />}
      <div style={{ display: 'flex', justifyContent: 'flex-end', gap: '0.5rem', marginTop: '1.25rem' }}><button type="button" className="btn btn-outline" onClick={() => setSubmission({ ...submission, open: false })}>إلغاء</button><button className="btn btn-primary" disabled={submitting}>{submitting ? <Loader2 size={16} className="spin" /> : <Send size={16} />}{submitting ? 'جارٍ إنشاء السجلات...' : 'إنشاء دفعة المراجعة'}</button></div>
    </form></div>}

    {selected && <div className="modal-overlay" onClick={() => setSelected(null)}><div className="modal-content" onClick={(event) => event.stopPropagation()} style={{ maxWidth: 580, padding: '1.5rem' }} dir="rtl"><div style={{ display: 'flex', justifyContent: 'space-between' }}><h3 style={{ margin: 0 }}>تفاصيل مراجعة المسمى</h3><button className="btn" onClick={() => setSelected(null)}><X size={18} /></button></div><div style={{ display: 'grid', gap: '0.75rem', marginTop: '1rem', fontSize: '0.9rem' }}><div><strong>الأصلي:</strong> {selected.originalTitle}</div><div><strong>النهائي:</strong> {selected.finalTitle || '—'}</div><div><strong>الحالة:</strong> <Badge status={selected.status} /></div><div><strong>الدفعة:</strong> {selected.batchId?.batchNumber || '—'}</div><div><strong>التصنيف:</strong> {selected.categoryId?.nameAr || selected.categoryId?.name || '—'}</div><div><strong>الخطأ / سبب الرفض:</strong> {selected.errorMessage || selected.rejectionReason || '—'}</div><div><strong>راجعه:</strong> {selected.reviewedBy?.email || '—'} {selected.reviewedAt ? ` بتاريخ ${readableDate(selected.reviewedAt)}` : ''}</div>
              {selected.isArchived && <div style={{ color: '#b91c1c', fontSize: '0.82rem' }}><strong>الأرشيف:</strong> تم الأرشفة {readableDate(selected.archivedAt)} — يُحذف تلقائيًا بعد 60 يومًا.</div>}</div></div></div>}

    {edit && <div className="modal-overlay"><form className="modal-content" onSubmit={saveEdit} style={{ maxWidth: 560, padding: '1.5rem' }} dir="rtl"><div style={{ display: 'flex', justifyContent: 'space-between' }}><h3 style={{ margin: 0 }}>تعديل المسمى قبل الاعتماد</h3><button type="button" className="btn" onClick={() => setEdit(null)}><X size={18} /></button></div><label style={{ display: 'block', fontWeight: 700, marginTop: '1rem' }}>المسمى النهائي<input className="form-control" value={edit.finalTitle || ''} onChange={(e) => setEdit({ ...edit, finalTitle: e.target.value })} /></label><label style={{ display: 'block', fontWeight: 700, marginTop: '1rem' }}>التصنيف<select className="form-control" value={edit.categoryId?._id || edit.categoryId || ''} onChange={(e) => setEdit({ ...edit, categoryId: e.target.value })}>{categories.map((category) => <option key={category._id} value={category._id}>{category.nameAr || category.name}</option>)}</select></label><div style={{ display: 'flex', justifyContent: 'flex-end', gap: '0.5rem', marginTop: '1.25rem' }}><button type="button" className="btn btn-outline" onClick={() => setEdit(null)}>إلغاء</button><button className="btn btn-primary" disabled={saving}>{saving ? 'جارٍ الحفظ...' : 'حفظ التعديل'}</button></div></form></div>}

    {bulkRejecting && <div className="modal-overlay"><form className="modal-content" onSubmit={bulkReject} style={{ maxWidth: 520, padding: '1.5rem' }} dir="rtl"><div style={{ display: 'flex', justifyContent: 'space-between' }}><h3 style={{ margin: 0 }}>رفض جميع المسميات ذات المشكلات</h3><button type="button" className="btn" onClick={() => setBulkRejecting(false)}><X size={18} /></button></div><p style={{ color: 'var(--slate-600)', fontSize: '0.88rem', margin: '0.75rem 0' }}>سيتم رفض جميع السجلات في حالة «قيد المراجعة» أو «تم التعديل» أو «فشل» التي تحتوي على خطأ.</p><textarea className="form-control" required rows={4} value={bulkRejectReason} onChange={(e) => setBulkRejectReason(e.target.value)} placeholder="سبب الرفض الجماعي" /><div style={{ display: 'flex', justifyContent: 'flex-end', gap: '0.5rem', marginTop: '1.25rem' }}><button type="button" className="btn btn-outline" onClick={() => setBulkRejecting(false)}>إلغاء</button><button className="btn btn-danger" disabled={saving}>رفض الكل</button></div></form></div>}

    {rejecting && <div className="modal-overlay"><form className="modal-content" onSubmit={reject} style={{ maxWidth: 520, padding: '1.5rem' }} dir="rtl"><div style={{ display: 'flex', justifyContent: 'space-between' }}><h3 style={{ margin: 0 }}>رفض المسمى</h3><button type="button" className="btn" onClick={() => setRejecting(null)}><X size={18} /></button></div><p>{rejecting.finalTitle || rejecting.originalTitle}</p><textarea className="form-control" required rows={4} value={rejectionReason} onChange={(e) => setRejectionReason(e.target.value)} placeholder="سبب الرفض" /><div style={{ display: 'flex', justifyContent: 'flex-end', gap: '0.5rem', marginTop: '1.25rem' }}><button type="button" className="btn btn-outline" onClick={() => setRejecting(null)}>إلغاء</button><button className="btn btn-danger" disabled={saving}>رفض المسمى</button></div></form></div>}
  </div>;
}
