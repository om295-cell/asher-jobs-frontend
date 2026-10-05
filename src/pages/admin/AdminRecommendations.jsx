import React, { useEffect, useState, useCallback } from 'react';
import {
  Users,
  Clock,
  CheckCircle2,
  XCircle,
  Search,
  Eye,
  Check,
  X,
  FileCheck,
  Filter,
  RefreshCw,
  Phone,
  Briefcase,
  AlertCircle
} from 'lucide-react';
import { useLanguage } from '../../context/LanguageContext';
import { useToast } from '../../context/ToastContext';
import { recommendationApi } from '../../api/recommendation.api';
import LoadingSpinner from '../../components/ui/LoadingSpinner';
import Pagination from '../../components/ui/Pagination';

export default function AdminRecommendations() {
  const { isRtl } = useLanguage();
  const { showToast } = useToast();

  const [requests, setRequests] = useState([]);
  const [statusCounts, setStatusCounts] = useState({ pending: 0, approved: 0, rejected: 0, total: 0 });
  const [loading, setLoading] = useState(true);
  const [page, setPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [total, setTotal] = useState(0);

  // Filters
  const [statusFilter, setStatusFilter] = useState('');
  const [searchTerm, setSearchTerm] = useState('');

  // Selected Request for Detail Modal
  const [selectedReq, setSelectedReq] = useState(null);
  const [modalLoading, setModalLoading] = useState(false);
  const [adminNotes, setAdminNotes] = useState('');
  const [actionLoading, setActionLoading] = useState(false);

  // Fetch Requests
  const fetchRequests = useCallback((targetPage = 1) => {
    setLoading(true);
    const params = { page: targetPage, limit: 12 };
    if (statusFilter) params.status = statusFilter;
    if (searchTerm) params.search = searchTerm;

    recommendationApi
      .adminList(params)
      .then((res) => {
        setRequests(res.data?.data || []);
        setStatusCounts(res.data?.statusCounts || { pending: 0, approved: 0, rejected: 0, total: 0 });
        setTotal(res.data?.pagination?.total || 0);
        setTotalPages(res.data?.pagination?.totalPages || 1);
        setPage(targetPage);
      })
      .catch((err) => {
        showToast(err.response?.data?.message || 'فشل تحميل طلبات الترشيح', 'error');
      })
      .finally(() => setLoading(false));
  }, [statusFilter, searchTerm, showToast]);

  useEffect(() => {
    fetchRequests(1);
  }, [fetchRequests]);

  // Open Details Modal
  const handleOpenDetails = (req) => {
    setSelectedReq(req);
    setAdminNotes(req.adminNotes || '');
  };

  // Update Status (Approve or Reject)
  const handleUpdateStatus = async (status) => {
    if (!selectedReq) return;
    setActionLoading(true);
    try {
      await recommendationApi.adminUpdateStatus(selectedReq._id, {
        status,
        adminNotes
      });
      showToast(status === 'approved' ? 'تم قبول واعتماد الطلب بنجاح' : 'تم رفض الطلب بنجاح', 'success');
      setSelectedReq(null);
      fetchRequests(page);
    } catch (err) {
      showToast(err.response?.data?.message || 'حدث خطأ أثناء تحديث حالة الطلب', 'error');
    } finally {
      setActionLoading(false);
    }
  };

  return (
    <div className="container" style={{ padding: '2rem 1rem 4rem' }}>
      {/* Title */}
      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '2rem', flexWrap: 'wrap', gap: '1rem' }}>
        <div>
          <h1 style={{ fontSize: '1.75rem', fontWeight: 900, color: '#09090b', margin: '0 0 0.35rem' }}>
            {isRtl ? 'طلبات ترشيح الكوادر (مجموعات الـ 11)' : 'Candidate Recommendation Requests'}
          </h1>
          <p style={{ fontSize: '0.9rem', color: '#64748b', margin: 0 }}>
            {isRtl
              ? 'مراجعة وتدقيق واعتماد طلبات الترشيح الجماعية المقدمة عبر الرابط العام'
              : 'Review and approve public 11-candidate group nomination submissions'}
          </p>
        </div>

        <button
          onClick={() => fetchRequests(page)}
          style={{
            display: 'inline-flex',
            alignItems: 'center',
            gap: '0.5rem',
            padding: '0.5rem 1rem',
            borderRadius: '8px',
            background: '#ffffff',
            border: '1px solid #cbd5e1',
            color: '#334155',
            fontWeight: 700,
            fontSize: '0.875rem',
            cursor: 'pointer'
          }}
        >
          <RefreshCw size={15} />
          {isRtl ? 'تحديث البيانات' : 'Refresh'}
        </button>
      </div>

      {/* KPI Cards */}
      <div
        style={{
          display: 'grid',
          gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))',
          gap: '1rem',
          marginBottom: '2rem'
        }}
      >
        <div
          onClick={() => setStatusFilter('')}
          style={{
            background: '#ffffff',
            borderRadius: '12px',
            padding: '1.25rem',
            border: statusFilter === '' ? '2px solid #09090b' : '1px solid #e2e8f0',
            cursor: 'pointer'
          }}
        >
          <div style={{ fontSize: '0.8rem', color: '#64748b', fontWeight: 600 }}>{isRtl ? 'إجمالي الطلبات' : 'Total Requests'}</div>
          <div style={{ fontSize: '1.75rem', fontWeight: 900, color: '#09090b', marginTop: '0.25rem' }}>
            {statusCounts.total}
          </div>
        </div>

        <div
          onClick={() => setStatusFilter('pending')}
          style={{
            background: '#ffffff',
            borderRadius: '12px',
            padding: '1.25rem',
            border: statusFilter === 'pending' ? '2px solid #f59e0b' : '1px solid #e2e8f0',
            cursor: 'pointer'
          }}
        >
          <div style={{ fontSize: '0.8rem', color: '#d97706', fontWeight: 600 }}>{isRtl ? 'قيد المراجعة' : 'Pending Review'}</div>
          <div style={{ fontSize: '1.75rem', fontWeight: 900, color: '#d97706', marginTop: '0.25rem' }}>
            {statusCounts.pending}
          </div>
        </div>

        <div
          onClick={() => setStatusFilter('approved')}
          style={{
            background: '#ffffff',
            borderRadius: '12px',
            padding: '1.25rem',
            border: statusFilter === 'approved' ? '2px solid #22c55e' : '1px solid #e2e8f0',
            cursor: 'pointer'
          }}
        >
          <div style={{ fontSize: '0.8rem', color: '#16a34a', fontWeight: 600 }}>{isRtl ? 'المعتمدة والمقبولة' : 'Approved'}</div>
          <div style={{ fontSize: '1.75rem', fontWeight: 900, color: '#16a34a', marginTop: '0.25rem' }}>
            {statusCounts.approved}
          </div>
        </div>

        <div
          onClick={() => setStatusFilter('rejected')}
          style={{
            background: '#ffffff',
            borderRadius: '12px',
            padding: '1.25rem',
            border: statusFilter === 'rejected' ? '2px solid #ef4444' : '1px solid #e2e8f0',
            cursor: 'pointer'
          }}
        >
          <div style={{ fontSize: '0.8rem', color: '#dc2626', fontWeight: 600 }}>{isRtl ? 'المرفوضة' : 'Rejected'}</div>
          <div style={{ fontSize: '1.75rem', fontWeight: 900, color: '#dc2626', marginTop: '0.25rem' }}>
            {statusCounts.rejected}
          </div>
        </div>
      </div>

      {/* Filter / Search Bar */}
      <div
        style={{
          display: 'flex',
          gap: '1rem',
          marginBottom: '1.5rem',
          flexWrap: 'wrap',
          alignItems: 'center'
        }}
      >
        <div style={{ position: 'relative', flex: '1', minWidth: '240px' }}>
          <Search
            size={16}
            style={{
              position: 'absolute',
              top: '50%',
              [isRtl ? 'right' : 'left']: '12px',
              transform: 'translateY(-50%)',
              color: '#94a3b8'
            }}
          />
          <input
            type="text"
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            onKeyDown={(e) => e.key === 'Enter' && fetchRequests(1)}
            placeholder={isRtl ? 'بحث برقم الطلب (REC-...) أو اسم مقدم الطلب أو هاتفه...' : 'Search by request #, name, or phone...'}
            style={{
              width: '100%',
              padding: isRtl ? '0.65rem 2.25rem 0.65rem 1rem' : '0.65rem 1rem 0.65rem 2.25rem',
              borderRadius: '8px',
              border: '1px solid #cbd5e1',
              fontSize: '0.9rem',
              outline: 'none',
              background: '#ffffff'
            }}
          />
        </div>

        <select
          value={statusFilter}
          onChange={(e) => setStatusFilter(e.target.value)}
          style={{
            padding: '0.65rem 1rem',
            borderRadius: '8px',
            border: '1px solid #cbd5e1',
            background: '#ffffff',
            fontSize: '0.9rem',
            fontWeight: 600,
            color: '#334155'
          }}
        >
          <option value="">{isRtl ? 'جميع الحالات' : 'All Statuses'}</option>
          <option value="pending">{isRtl ? 'قيد المراجعة' : 'Pending'}</option>
          <option value="approved">{isRtl ? 'تم القبول والاعتماد' : 'Approved'}</option>
          <option value="rejected">{isRtl ? 'مرفوض' : 'Rejected'}</option>
        </select>
      </div>

      {/* Requests Table */}
      {loading ? (
        <LoadingSpinner />
      ) : requests.length === 0 ? (
        <div
          style={{
            background: '#ffffff',
            borderRadius: '12px',
            border: '1px solid #e2e8f0',
            padding: '3.5rem 1rem',
            textAlign: 'center'
          }}
        >
          <Users size={40} style={{ color: '#cbd5e1', marginBottom: '1rem' }} />
          <h3 style={{ fontSize: '1.1rem', fontWeight: 700, color: '#475569', margin: '0 0 0.5rem' }}>
            {isRtl ? 'لا توجد طلبات ترشيح مطابقة' : 'No recommendation requests found'}
          </h3>
          <p style={{ fontSize: '0.875rem', color: '#94a3b8', margin: 0 }}>
            {isRtl ? 'ستظهر هنا كافة طلبات الترشيح فور تقديمها من الرابط العام.' : 'Requests will appear here once submitted.'}
          </p>
        </div>
      ) : (
        <div style={{ background: '#ffffff', borderRadius: '14px', border: '1px solid #e2e8f0', overflow: 'hidden' }}>
          <div style={{ overflowX: 'auto' }}>
            <table style={{ width: '100%', borderCollapse: 'collapse', textAlign: isRtl ? 'right' : 'left' }}>
              <thead>
                <tr style={{ background: '#f8fafc', borderBottom: '1px solid #e2e8f0' }}>
                  <th style={{ padding: '0.85rem 1rem', fontSize: '0.8rem', fontWeight: 800, color: '#475569' }}>
                    {isRtl ? 'رقم الطلب' : 'Request #'}
                  </th>
                  <th style={{ padding: '0.85rem 1rem', fontSize: '0.8rem', fontWeight: 800, color: '#475569' }}>
                    {isRtl ? 'مقدم الطلب (الرئيسي)' : 'Primary Submitter'}
                  </th>
                  <th style={{ padding: '0.85rem 1rem', fontSize: '0.8rem', fontWeight: 800, color: '#475569' }}>
                    {isRtl ? 'الهاتف' : 'Phone'}
                  </th>
                  <th style={{ padding: '0.85rem 1rem', fontSize: '0.8rem', fontWeight: 800, color: '#475569' }}>
                    {isRtl ? 'الوظيفة' : 'Job Title'}
                  </th>
                  <th style={{ padding: '0.85rem 1rem', fontSize: '0.8rem', fontWeight: 800, color: '#475569' }}>
                    {isRtl ? 'تاريخ التقديم' : 'Date'}
                  </th>
                  <th style={{ padding: '0.85rem 1rem', fontSize: '0.8rem', fontWeight: 800, color: '#475569' }}>
                    {isRtl ? 'الحالة' : 'Status'}
                  </th>
                  <th style={{ padding: '0.85rem 1rem', fontSize: '0.8rem', fontWeight: 800, color: '#475569', textAlign: 'center' }}>
                    {isRtl ? 'الإجراءات' : 'Actions'}
                  </th>
                </tr>
              </thead>
              <tbody>
                {requests.map((req) => {
                  const submitter = req.people?.[0] || {};

                  return (
                    <tr key={req._id} style={{ borderBottom: '1px solid #f1f5f9' }}>
                      <td style={{ padding: '0.85rem 1rem', fontWeight: 800, fontFamily: 'monospace', fontSize: '0.95rem' }}>
                        {req.requestNumber}
                      </td>
                      <td style={{ padding: '0.85rem 1rem', fontWeight: 700, color: '#09090b' }}>
                        {submitter.fullName || '-'}
                      </td>
                      <td style={{ padding: '0.85rem 1rem', color: '#475569', direction: 'ltr', textAlign: isRtl ? 'right' : 'left' }}>
                        {submitter.phone || '-'}
                      </td>
                      <td style={{ padding: '0.85rem 1rem', color: '#334155', fontWeight: 600 }}>
                        {submitter.jobTitleAr || submitter.jobTitle || '-'}
                      </td>
                      <td style={{ padding: '0.85rem 1rem', color: '#64748b', fontSize: '0.85rem' }}>
                        {req.createdAt ? new Date(req.createdAt).toLocaleDateString(isRtl ? 'ar-EG' : 'en-US') : '-'}
                      </td>
                      <td style={{ padding: '0.85rem 1rem' }}>
                        {req.status === 'pending' && (
                          <span style={{ padding: '0.25rem 0.65rem', borderRadius: '6px', background: '#fef3c7', color: '#92400e', fontSize: '0.75rem', fontWeight: 800 }}>
                            {isRtl ? 'قيد المراجعة' : 'Pending'}
                          </span>
                        )}
                        {req.status === 'approved' && (
                          <span style={{ padding: '0.25rem 0.65rem', borderRadius: '6px', background: '#dcfce7', color: '#16a34a', fontSize: '0.75rem', fontWeight: 800 }}>
                            {isRtl ? 'معتمد' : 'Approved'}
                          </span>
                        )}
                        {req.status === 'rejected' && (
                          <span style={{ padding: '0.25rem 0.65rem', borderRadius: '6px', background: '#fee2e2', color: '#dc2626', fontSize: '0.75rem', fontWeight: 800 }}>
                            {isRtl ? 'مرفوض' : 'Rejected'}
                          </span>
                        )}
                      </td>
                      <td style={{ padding: '0.85rem 1rem', textAlign: 'center' }}>
                        <button
                          onClick={() => handleOpenDetails(req)}
                          style={{
                            padding: '0.45rem 0.85rem',
                            borderRadius: '6px',
                            background: '#09090b',
                            color: '#ffffff',
                            border: 'none',
                            fontWeight: 700,
                            fontSize: '0.8rem',
                            cursor: 'pointer',
                            display: 'inline-flex',
                            alignItems: 'center',
                            gap: '0.35rem'
                          }}
                        >
                          <Eye size={14} />
                          {isRtl ? 'فحص الـ 11 كادر' : 'Review 11 Profiles'}
                        </button>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>

          {totalPages > 1 && (
            <div style={{ padding: '1rem', borderTop: '1px solid #e2e8f0' }}>
              <Pagination currentPage={page} totalPages={totalPages} onPageChange={(p) => fetchRequests(p)} />
            </div>
          )}
        </div>
      )}

      {/* ========================================================================= */}
      {/* REVIEW DETAILS MODAL */}
      {/* ========================================================================= */}
      {selectedReq && (
        <div
          style={{
            position: 'fixed',
            inset: 0,
            background: 'rgba(0, 0, 0, 0.6)',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            zIndex: 1000,
            padding: '1rem'
          }}
          onClick={() => setSelectedReq(null)}
        >
          <div
            style={{
              background: '#ffffff',
              borderRadius: '16px',
              maxWidth: '850px',
              width: '100%',
              maxHeight: '90vh',
              overflowY: 'auto',
              padding: '2rem',
              boxShadow: '0 20px 25px -5px rgba(0, 0, 0, 0.1)',
              position: 'relative'
            }}
            onClick={(e) => e.stopPropagation()}
          >
            {/* Modal Header */}
            <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '1.5rem', paddingBottom: '1rem', borderBottom: '1px solid #f1f5f9' }}>
              <div>
                <div style={{ fontSize: '0.8rem', color: '#64748b', fontWeight: 600 }}>{isRtl ? 'فحص تفاصيل طلب الترشيح' : 'Review Recommendation Request'}</div>
                <div style={{ fontSize: '1.5rem', fontWeight: 900, color: '#09090b', fontFamily: 'monospace' }}>
                  {selectedReq.requestNumber}
                </div>
              </div>

              <button
                onClick={() => setSelectedReq(null)}
                style={{ background: 'none', border: 'none', color: '#64748b', cursor: 'pointer', padding: '0.35rem' }}
              >
                <X size={22} />
              </button>
            </div>

            {/* Audit / Submitter Card */}
            <div style={{ background: '#f8fafc', padding: '1rem 1.25rem', borderRadius: '10px', marginBottom: '1.5rem', display: 'flex', gap: '1.5rem', flexWrap: 'wrap' }}>
              <div>
                <div style={{ fontSize: '0.75rem', color: '#64748b' }}>{isRtl ? 'عنوان IP لمقدم الطلب' : 'Submitter IP'}</div>
                <div style={{ fontSize: '0.9rem', fontWeight: 700, color: '#0f172a' }}>{selectedReq.submitterIp || '-'}</div>
              </div>
              <div>
                <div style={{ fontSize: '0.75rem', color: '#64748b' }}>{isRtl ? 'تاريخ التقديم' : 'Date Submitted'}</div>
                <div style={{ fontSize: '0.9rem', fontWeight: 700, color: '#0f172a' }}>
                  {selectedReq.createdAt ? new Date(selectedReq.createdAt).toLocaleString(isRtl ? 'ar-EG' : 'en-US') : '-'}
                </div>
              </div>
              <div>
                <div style={{ fontSize: '0.75rem', color: '#64748b' }}>{isRtl ? 'الإقرار القانوني' : 'Legal Acknowledgment'}</div>
                <div style={{ fontSize: '0.9rem', fontWeight: 800, color: '#16a34a' }}>
                  {selectedReq.legalAccepted ? (isRtl ? 'موافق ومُقر رسمياً ✓' : 'Accepted ✓') : '-'}
                </div>
              </div>
            </div>

            {/* 11 People List Table */}
            <h4 style={{ fontSize: '1rem', fontWeight: 800, color: '#09090b', marginBottom: '0.75rem' }}>
              {isRtl ? 'قائمة الكوادر الـ 11 المرفقة في الطلب:' : 'Attached 11 Candidates List:'}
            </h4>

            <div style={{ overflowX: 'auto', marginBottom: '1.5rem', border: '1px solid #e2e8f0', borderRadius: '10px' }}>
              <table style={{ width: '100%', borderCollapse: 'collapse', textAlign: isRtl ? 'right' : 'left' }}>
                <thead>
                  <tr style={{ background: '#f8fafc', borderBottom: '1px solid #e2e8f0' }}>
                    <th style={{ padding: '0.65rem 0.85rem', fontSize: '0.75rem', color: '#475569' }}>#</th>
                    <th style={{ padding: '0.65rem 0.85rem', fontSize: '0.75rem', color: '#475569' }}>{isRtl ? 'الاسم بالكامل' : 'Full Name'}</th>
                    <th style={{ padding: '0.65rem 0.85rem', fontSize: '0.75rem', color: '#475569' }}>{isRtl ? 'رقم الهاتف' : 'Phone'}</th>
                    <th style={{ padding: '0.65rem 0.85rem', fontSize: '0.75rem', color: '#475569' }}>{isRtl ? 'الوظيفة' : 'Job Title'}</th>
                    <th style={{ padding: '0.65rem 0.85rem', fontSize: '0.75rem', color: '#475569' }}>{isRtl ? 'الخبرة' : 'Career Level'}</th>
                  </tr>
                </thead>
                <tbody>
                  {selectedReq.people?.map((p, idx) => (
                    <tr
                      key={p._id || idx}
                      style={{
                        borderBottom: '1px solid #f1f5f9',
                        background: p.isPrimary ? '#f4f4f5' : '#ffffff'
                      }}
                    >
                      <td style={{ padding: '0.65rem 0.85rem', fontWeight: 800, fontSize: '0.8rem' }}>
                        {p.isPrimary ? (
                          <span style={{ padding: '0.15rem 0.45rem', borderRadius: '4px', background: '#09090b', color: '#ffffff', fontSize: '0.7rem' }}>
                            {isRtl ? 'مقدم الطلب' : 'Submitter'}
                          </span>
                        ) : (
                          idx
                        )}
                      </td>
                      <td style={{ padding: '0.65rem 0.85rem', fontWeight: 700, color: '#09090b', fontSize: '0.875rem' }}>
                        {p.fullName}
                      </td>
                      <td style={{ padding: '0.65rem 0.85rem', color: '#475569', fontSize: '0.875rem', direction: 'ltr', textAlign: isRtl ? 'right' : 'left' }}>
                        <a href={`tel:${p.phone}`} style={{ color: '#0284c7', textDecoration: 'none', fontWeight: 600 }}>
                          {p.phone}
                        </a>
                      </td>
                      <td style={{ padding: '0.65rem 0.85rem', color: '#1e293b', fontWeight: 600, fontSize: '0.85rem' }}>
                        {p.jobTitleAr || p.jobTitle || '-'}
                      </td>
                      <td style={{ padding: '0.65rem 0.85rem', fontSize: '0.8rem', color: '#475569' }}>
                        {p.careerLevel}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>

            {/* Admin Notes */}
            <div style={{ marginBottom: '1.5rem' }}>
              <label style={{ display: 'block', fontSize: '0.85rem', fontWeight: 700, color: '#1e293b', marginBottom: '0.35rem' }}>
                {isRtl ? 'ملاحظات الإدارة (تظهر لمقدم الطلب عند الاستعلام):' : 'Admin Notes (visible to submitter):'}
              </label>
              <textarea
                rows={3}
                value={adminNotes}
                onChange={(e) => setAdminNotes(e.target.value)}
                placeholder={isRtl ? 'أدخل ملاحظات أو سبب الرفض/الاعتماد إن وجد...' : 'Add notes or reasons...'}
                style={{
                  width: '100%',
                  padding: '0.65rem 0.85rem',
                  borderRadius: '8px',
                  border: '1px solid #cbd5e1',
                  fontSize: '0.9rem',
                  outline: 'none',
                  resize: 'vertical'
                }}
              />
            </div>

            {/* Action Buttons */}
            <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'flex-end', gap: '0.75rem', flexWrap: 'wrap' }}>
              <button
                type="button"
                onClick={() => setSelectedReq(null)}
                style={{
                  padding: '0.65rem 1.25rem',
                  borderRadius: '8px',
                  background: '#f1f5f9',
                  color: '#475569',
                  border: 'none',
                  fontWeight: 700,
                  fontSize: '0.875rem',
                  cursor: 'pointer'
                }}
              >
                {isRtl ? 'إغلاق' : 'Close'}
              </button>

              <button
                type="button"
                disabled={actionLoading}
                onClick={() => handleUpdateStatus('rejected')}
                style={{
                  padding: '0.65rem 1.25rem',
                  borderRadius: '8px',
                  background: '#fee2e2',
                  color: '#dc2626',
                  border: 'none',
                  fontWeight: 700,
                  fontSize: '0.875rem',
                  cursor: 'pointer',
                  display: 'inline-flex',
                  alignItems: 'center',
                  gap: '0.35rem'
                }}
              >
                <XCircle size={16} />
                {isRtl ? 'رفض الطلب' : 'Reject Request'}
              </button>

              <button
                type="button"
                disabled={actionLoading}
                onClick={() => handleUpdateStatus('approved')}
                style={{
                  padding: '0.65rem 1.5rem',
                  borderRadius: '8px',
                  background: '#16a34a',
                  color: '#ffffff',
                  border: 'none',
                  fontWeight: 800,
                  fontSize: '0.875rem',
                  cursor: 'pointer',
                  display: 'inline-flex',
                  alignItems: 'center',
                  gap: '0.35rem'
                }}
              >
                <CheckCircle2 size={16} />
                {isRtl ? 'قبول واعتماد الطلب' : 'Approve Request'}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
