import React, { useEffect, useState } from 'react';
import { Check, Edit3, Eye, FileUp, Loader2, Plus, RefreshCw, Send, X, XCircle } from 'lucide-react';
import { adminApi } from '../../api/admin.api';
import { useToast } from '../../context/ToastContext';
import EmptyState from '../ui/EmptyState';
import LoadingSpinner from '../ui/LoadingSpinner';
import Pagination from '../ui/Pagination';

const STATUS_COLORS = {
  'Pending Review': ['#92400e', '#fef3c7'],
  Processing: ['#1d4ed8', '#dbeafe'],
  Approved: ['#166534', '#dcfce7'],
  Edited: ['#6b21a8', '#f3e8ff'],
  Rejected: ['#991b1b', '#fee2e2'],
  Failed: ['#991b1b', '#fee2e2']
};

function Badge({ status }) {
  const [color, background] = STATUS_COLORS[status] || ['#475569', '#f1f5f9'];
  return <span style={{ color, background, borderRadius: 999, padding: '0.22rem 0.55rem', fontSize: '0.75rem', fontWeight: 750, whiteSpace: 'nowrap' }}>{status}</span>;
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
  const [filters, setFilters] = useState({ status: '', batchId: '', search: '' });
  const [submission, setSubmission] = useState({ open: false, mode: 'manual', text: '', file: null, categoryId: '' });
  const [selected, setSelected] = useState(null);
  const [edit, setEdit] = useState(null);
  const [saving, setSaving] = useState(false);
  const [rejecting, setRejecting] = useState(null);
  const [rejectionReason, setRejectionReason] = useState('');

  const load = async (targetPage = page) => {
    setLoading(true);
    try {
      const params = { page: targetPage, limit: 25, ...filters };
      Object.keys(params).forEach((key) => !params[key] && delete params[key]);
      const [reviewRes, batchRes] = await Promise.all([
        adminApi.listTitleReviews(params),
        adminApi.listTitleBatches({ limit: 100 })
      ]);
      setReviews(reviewRes.data?.data || []);
      setPagination(reviewRes.data?.pagination || null);
      setBatches(batchRes.data?.data || []);
    } catch (error) {
      showToast(error.response?.data?.message || 'Could not load the title review queue.', 'error');
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
    categoryId: categories[0]?._id || '',
    idempotencyKey: `${Date.now()}-${Math.random().toString(36).slice(2)}`
  });

  const submitBatch = async (event) => {
    event.preventDefault();
    if (!submission.categoryId) return showToast('Choose a category before submitting titles.', 'warning');
    if (submission.mode === 'manual' && !submission.text.trim()) return showToast('Enter at least one job title.', 'warning');
    if (submission.mode === 'file' && !submission.file) return showToast('Choose a file to import.', 'warning');
    setSubmitting(true);
    try {
      let response;
      if (submission.mode === 'manual') {
        response = await adminApi.createManualTitleBatch({ text: submission.text, categoryId: submission.categoryId, idempotencyKey: submission.idempotencyKey });
      } else {
        const formData = new FormData();
        formData.append('file', submission.file);
        formData.append('categoryId', submission.categoryId);
        formData.append('idempotencyKey', submission.idempotencyKey);
        response = await adminApi.createFileTitleBatch(formData);
      }
      const batch = response.data?.data;
      showToast(`Batch ${batch?.batchNumber || ''}: ${batch?.totalTitles || 0} independent title records created; ${batch?.failedCount || 0} failed.`, 'success');
      setSubmission((value) => ({ ...value, open: false }));
      setPage(1);
      await load(1);
    } catch (error) {
      showToast(error.response?.data?.message || 'Unable to create the review batch.', 'error');
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
      if (updated?.status === 'Failed') showToast(updated.errorMessage || 'The title could not be approved.', 'error');
      else showToast('Job title approved and added to the catalog.', 'success');
      setSelected(updated || review);
      await refreshAfterAction();
    } catch (error) {
      showToast(error.response?.data?.message || 'Approval failed.', 'error');
    } finally { setSaving(false); }
  };

  const saveEdit = async (event) => {
    event.preventDefault();
    setSaving(true);
    try {
      const response = await adminApi.editTitleReview(edit._id, { finalTitle: edit.finalTitle, categoryId: edit.categoryId?._id || edit.categoryId });
      setEdit(null);
      setSelected(response.data?.data || null);
      showToast('Title saved as edited. Approve it when ready.', 'success');
      await refreshAfterAction();
    } catch (error) {
      showToast(error.response?.data?.message || 'Could not save the edit.', 'error');
    } finally { setSaving(false); }
  };

  const reject = async (event) => {
    event.preventDefault();
    setSaving(true);
    try {
      await adminApi.rejectTitleReview(rejecting._id, rejectionReason);
      setRejecting(null);
      setRejectionReason('');
      showToast('Job title rejected.', 'info');
      await refreshAfterAction();
    } catch (error) {
      showToast(error.response?.data?.message || 'Could not reject the title.', 'error');
    } finally { setSaving(false); }
  };

  const retry = async (review) => {
    setSaving(true);
    try {
      const response = await adminApi.retryTitleReview(review._id);
      const updated = response.data?.data;
      showToast(updated?.status === 'Failed' ? updated.errorMessage : 'Failed title returned to the review queue.', updated?.status === 'Failed' ? 'error' : 'success');
      await refreshAfterAction();
    } catch (error) {
      showToast(error.response?.data?.message || 'Retry failed.', 'error');
    } finally { setSaving(false); }
  };

  return <>
    <div className="card" style={{ marginBottom: '1rem', padding: '1rem' }}>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', gap: '1rem', flexWrap: 'wrap' }}>
        <div>
          <h2 style={{ fontSize: '1rem', fontWeight: 800, margin: 0 }}>Super Admin Title Review</h2>
          <p style={{ margin: '0.25rem 0 0', color: 'var(--slate-500)', fontSize: '0.85rem' }}>Every submitted title has its own review record. File batches are groups only—one failure never stops other titles.</p>
        </div>
        <div style={{ display: 'flex', gap: '0.5rem', flexWrap: 'wrap' }}>
          <button className="btn btn-outline" onClick={() => openSubmission('file')}><FileUp size={16} /> Import file</button>
          <button className="btn btn-primary" onClick={() => openSubmission('manual')}><Plus size={16} /> Add titles for review</button>
        </div>
      </div>
    </div>

    <div className="card" style={{ marginBottom: '1rem', padding: '1rem' }}>
      <div style={{ display: 'grid', gridTemplateColumns: 'minmax(180px, 1fr) minmax(160px, .65fr) minmax(180px, .75fr) auto', gap: '0.75rem', alignItems: 'end' }}>
        <label style={{ fontSize: '0.82rem', fontWeight: 700 }}>Search
          <input className="form-control" value={filters.search} onChange={(e) => setFilters({ ...filters, search: e.target.value })} placeholder="Original or final title" />
        </label>
        <label style={{ fontSize: '0.82rem', fontWeight: 700 }}>Status
          <select className="form-control" value={filters.status} onChange={(e) => setFilters({ ...filters, status: e.target.value })}>
            <option value="">All statuses</option>{Object.keys(STATUS_COLORS).map((status) => <option key={status}>{status}</option>)}
          </select>
        </label>
        <label style={{ fontSize: '0.82rem', fontWeight: 700 }}>Batch
          <select className="form-control" value={filters.batchId} onChange={(e) => setFilters({ ...filters, batchId: e.target.value })}>
            <option value="">All batches</option>{batches.map((batch) => <option key={batch._id} value={batch._id}>{batch.batchNumber} ({batch.totalTitles})</option>)}
          </select>
        </label>
        <button className="btn btn-outline" onClick={applyFilters}><RefreshCw size={16} /> Filter</button>
      </div>
    </div>

    <div className="card" style={{ padding: 0, overflow: 'hidden' }}>
      {loading ? <div style={{ padding: '3rem' }}><LoadingSpinner /></div> : reviews.length === 0 ? <EmptyState icon={FileUp} title="No review records found" description="Submit titles manually or import a supported file to start a review batch." /> :
        <div className="table-responsive"><table className="data-table" style={{ minWidth: 1200, width: '100%', fontSize: '0.82rem' }}>
          <thead><tr><th>Title</th><th>Original title</th><th>Source</th><th>Status</th><th>Batch</th><th>Created</th><th>Error / rejection</th><th>Reviewed by</th><th style={{ textAlign: 'center' }}>Actions</th></tr></thead>
          <tbody>{reviews.map((review) => <tr key={review._id}>
            <td style={{ fontWeight: 750 }}>{review.finalTitle || '—'}</td><td>{review.originalTitle}</td><td>{review.source}</td><td><Badge status={review.status} /></td>
            <td>{review.batchId?.batchNumber || '—'}</td><td>{readableDate(review.createdAt)}</td><td style={{ color: review.errorMessage || review.rejectionReason ? '#b91c1c' : 'inherit', maxWidth: 220 }}>{review.errorMessage || review.rejectionReason || '—'}</td>
            <td>{review.reviewedBy?.email || '—'}</td>
            <td><div style={{ display: 'flex', gap: '0.35rem', justifyContent: 'center' }}>
              <button className="btn" onClick={() => setSelected(review)} title="View" style={{ padding: '0.35rem' }}><Eye size={15} /></button>
              {!['Approved', 'Rejected'].includes(review.status) && <button className="btn" onClick={() => setEdit({ ...review })} title="Edit" style={{ padding: '0.35rem' }}><Edit3 size={15} /></button>}
              {['Pending Review', 'Edited'].includes(review.status) && <button className="btn" onClick={() => approve(review)} disabled={saving} title="Approve" style={{ padding: '0.35rem', color: '#15803d' }}><Check size={15} /></button>}
              {!['Approved', 'Rejected'].includes(review.status) && <button className="btn" onClick={() => { setRejecting(review); setRejectionReason(''); }} title="Reject" style={{ padding: '0.35rem', color: '#b91c1c' }}><XCircle size={15} /></button>}
              {review.status === 'Failed' && <button className="btn" onClick={() => retry(review)} disabled={saving} title="Retry" style={{ padding: '0.35rem', color: '#1d4ed8' }}><RefreshCw size={15} /></button>}
            </div></td>
          </tr>)}</tbody>
        </table></div>}
    </div>
    <Pagination pagination={pagination} onPageChange={(nextPage) => { setPage(nextPage); load(nextPage); }} />

    {submission.open && <div className="modal-overlay"><form className="modal-content" onSubmit={submitBatch} style={{ maxWidth: 640, padding: '1.5rem' }}>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1rem' }}><h3 style={{ margin: 0 }}>{submission.mode === 'manual' ? 'Add job titles for review' : 'Import job titles for review'}</h3><button type="button" className="btn" onClick={() => setSubmission({ ...submission, open: false })}><X size={18} /></button></div>
      <p style={{ color: 'var(--slate-600)', fontSize: '0.88rem' }}>{submission.mode === 'manual' ? 'Enter one title per line. Each line becomes an independent review record.' : 'Supported formats: TXT, CSV, XLS/XLSX, DOC/DOCX, and PDF (up to 15 MB). Each extracted title becomes an independent review record.'}</p>
      <label style={{ display: 'block', fontWeight: 700, marginBottom: '1rem' }}>Default category<select className="form-control" value={submission.categoryId} onChange={(e) => setSubmission({ ...submission, categoryId: e.target.value })}>{categories.map((category) => <option key={category._id} value={category._id}>{category.nameAr || category.name}</option>)}</select></label>
      {submission.mode === 'manual' ? <textarea className="form-control" value={submission.text} onChange={(e) => setSubmission({ ...submission, text: e.target.value })} rows={10} placeholder={'Electrician\nMachine operator\nQuality inspector'} /> : <input className="form-control" type="file" accept=".txt,.csv,.xls,.xlsx,.doc,.docx,.pdf" onChange={(e) => setSubmission({ ...submission, file: e.target.files?.[0] || null })} />}
      <div style={{ display: 'flex', justifyContent: 'flex-end', gap: '0.5rem', marginTop: '1.25rem' }}><button type="button" className="btn btn-outline" onClick={() => setSubmission({ ...submission, open: false })}>Cancel</button><button className="btn btn-primary" disabled={submitting}>{submitting ? <Loader2 size={16} className="spin" /> : <Send size={16} />}{submitting ? 'Creating records...' : 'Create review batch'}</button></div>
    </form></div>}

    {selected && <div className="modal-overlay" onClick={() => setSelected(null)}><div className="modal-content" onClick={(event) => event.stopPropagation()} style={{ maxWidth: 580, padding: '1.5rem' }}><div style={{ display: 'flex', justifyContent: 'space-between' }}><h3 style={{ margin: 0 }}>Job title review details</h3><button className="btn" onClick={() => setSelected(null)}><X size={18} /></button></div><div style={{ display: 'grid', gap: '0.75rem', marginTop: '1rem', fontSize: '0.9rem' }}><div><strong>Original:</strong> {selected.originalTitle}</div><div><strong>Final:</strong> {selected.finalTitle || '—'}</div><div><strong>Status:</strong> <Badge status={selected.status} /></div><div><strong>Batch:</strong> {selected.batchId?.batchNumber || '—'}</div><div><strong>Category:</strong> {selected.categoryId?.nameAr || selected.categoryId?.name || '—'}</div><div><strong>Error / rejection:</strong> {selected.errorMessage || selected.rejectionReason || '—'}</div><div><strong>Reviewed:</strong> {selected.reviewedBy?.email || '—'} {selected.reviewedAt ? `on ${readableDate(selected.reviewedAt)}` : ''}</div></div></div></div>}

    {edit && <div className="modal-overlay"><form className="modal-content" onSubmit={saveEdit} style={{ maxWidth: 560, padding: '1.5rem' }}><div style={{ display: 'flex', justifyContent: 'space-between' }}><h3 style={{ margin: 0 }}>Edit title before approval</h3><button type="button" className="btn" onClick={() => setEdit(null)}><X size={18} /></button></div><label style={{ display: 'block', fontWeight: 700, marginTop: '1rem' }}>Final title<input className="form-control" value={edit.finalTitle || ''} onChange={(e) => setEdit({ ...edit, finalTitle: e.target.value })} /></label><label style={{ display: 'block', fontWeight: 700, marginTop: '1rem' }}>Category<select className="form-control" value={edit.categoryId?._id || edit.categoryId || ''} onChange={(e) => setEdit({ ...edit, categoryId: e.target.value })}>{categories.map((category) => <option key={category._id} value={category._id}>{category.nameAr || category.name}</option>)}</select></label><div style={{ display: 'flex', justifyContent: 'flex-end', gap: '0.5rem', marginTop: '1.25rem' }}><button type="button" className="btn btn-outline" onClick={() => setEdit(null)}>Cancel</button><button className="btn btn-primary" disabled={saving}>{saving ? 'Saving...' : 'Save edit'}</button></div></form></div>}

    {rejecting && <div className="modal-overlay"><form className="modal-content" onSubmit={reject} style={{ maxWidth: 520, padding: '1.5rem' }}><div style={{ display: 'flex', justifyContent: 'space-between' }}><h3 style={{ margin: 0 }}>Reject title</h3><button type="button" className="btn" onClick={() => setRejecting(null)}><X size={18} /></button></div><p>{rejecting.finalTitle || rejecting.originalTitle}</p><textarea className="form-control" required rows={4} value={rejectionReason} onChange={(e) => setRejectionReason(e.target.value)} placeholder="Reason for rejection" /><div style={{ display: 'flex', justifyContent: 'flex-end', gap: '0.5rem', marginTop: '1.25rem' }}><button type="button" className="btn btn-outline" onClick={() => setRejecting(null)}>Cancel</button><button className="btn btn-danger" disabled={saving}>Reject title</button></div></form></div>}
  </>;
}
