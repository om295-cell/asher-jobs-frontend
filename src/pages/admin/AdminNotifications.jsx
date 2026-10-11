import React, { useState, useEffect, useCallback } from 'react';
import {
  Bell,
  Archive,
  AlertTriangle,
  Link as LinkIcon,
  CheckCircle2,
  XCircle,
  Clock,
  Phone,
  User,
  Users,
  Search,
  Filter,
  RefreshCw,
  Eye,
  Check,
  ChevronDown,
  ChevronUp,
  Inbox,
  ArrowRight,
  ShieldAlert,
  FileCheck,
  HelpCircle,
  ExternalLink
} from 'lucide-react';
import { useLanguage } from '../../context/LanguageContext';
import { useToast } from '../../context/ToastContext';
import { adminNotificationApi } from '../../api/adminNotification.api';
import LoadingSpinner from '../../components/ui/LoadingSpinner';
import Pagination from '../../components/ui/Pagination';

export default function AdminNotifications() {
  const { isRtl } = useLanguage();
  const { showToast } = useToast();

  const [activeTab, setActiveTab] = useState('active'); // 'active' | 'archive'
  const [typeFilter, setTypeFilter] = useState(''); // '' | 'PHONE_CONFLICT_DIFFERENT_NAMES' | 'CHAIN_LINKED_RECOMMENDATION'
  const [notifications, setNotifications] = useState([]);
  const [unreadCount, setUnreadCount] = useState(0);
  const [activeCount, setActiveCount] = useState(0);
  const [archivedCount, setArchivedCount] = useState(0);
  const [loading, setLoading] = useState(true);
  const [page, setPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [total, setTotal] = useState(0);

  // Resolution modal or expanded card state
  const [expandedCards, setExpandedCards] = useState({});
  const [actionLoading, setActionLoading] = useState({});
  const [resolutionNotes, setResolutionNotes] = useState({});

  // Fetch Notifications
  const fetchNotifications = useCallback(
    (targetPage = 1) => {
      setLoading(true);
      const params = {
        page: targetPage,
        limit: 12,
        archived: activeTab === 'archive'
      };
      if (typeFilter) params.type = typeFilter;

      adminNotificationApi
        .list(params)
        .then((res) => {
          setNotifications(res.data?.data || []);
          setUnreadCount(res.data?.unreadCount || 0);
          setActiveCount(res.data?.activeCount || 0);
          setArchivedCount(res.data?.archivedCount || 0);
          setTotal(res.data?.pagination?.total || 0);
          setTotalPages(res.data?.pagination?.totalPages || 1);
          setPage(targetPage);
        })
        .catch((err) => {
          showToast(err.response?.data?.message || 'فشل تحميل الإشعارات', 'error');
        })
        .finally(() => setLoading(false));
    },
    [activeTab, typeFilter, showToast]
  );

  useEffect(() => {
    fetchNotifications(1);
  }, [fetchNotifications]);

  const toggleExpand = (id) => {
    setExpandedCards((prev) => ({ ...prev, [id]: !prev[id] }));
  };

  const handleMarkRead = async (id, e) => {
    e?.stopPropagation();
    try {
      await adminNotificationApi.markRead(id);
      setNotifications((prev) =>
        prev.map((n) => (n._id === id ? { ...n, status: 'read' } : n))
      );
      setUnreadCount((prev) => Math.max(0, prev - 1));
      showToast('تم تحديد الإشعار كمقروء', 'success');
    } catch (err) {
      showToast(err.response?.data?.message || 'فشل تحديث الإشعار', 'error');
    }
  };

  const handleMarkAllRead = async () => {
    try {
      await adminNotificationApi.markAllRead();
      setNotifications((prev) => prev.map((n) => ({ ...n, status: 'read' })));
      setUnreadCount(0);
      showToast('تم تحديد جميع الإشعارات كمقروءة', 'success');
    } catch (err) {
      showToast(err.response?.data?.message || 'فشل تحديث الإشعارات', 'error');
    }
  };

  const handleArchive = async (id, e) => {
    e?.stopPropagation();
    try {
      await adminNotificationApi.archive(id);
      showToast('تم نقل الإشعار إلى صندوق الأرشيف', 'success');
      fetchNotifications(page);
    } catch (err) {
      showToast(err.response?.data?.message || 'فشل أرشفة الإشعار', 'error');
    }
  };

  const handleUnarchive = async (id, e) => {
    e?.stopPropagation();
    try {
      await adminNotificationApi.unarchive(id);
      showToast('تمت استعادة الإشعار من صندوق الأرشيف', 'success');
      fetchNotifications(page);
    } catch (err) {
      showToast(err.response?.data?.message || 'فشل استعادة الإشعار', 'error');
    }
  };

  // Resolve Phone Conflict Action
  const handleResolveConflict = async (notificationId, action) => {
    const notes = resolutionNotes[notificationId] || '';
    setActionLoading((prev) => ({ ...prev, [notificationId]: true }));

    try {
      await adminNotificationApi.resolve(notificationId, { action, notes });
      let successMsg = 'تمت تسوية الإشعار بنجاح';
      if (action === 'approve_both') successMsg = 'تم اعتماد الطلبين معاً برقم الهاتف المشترك وإتاحة الكوادر للشركات';
      else if (action === 'reject_main_keep_recommendations')
        successMsg = 'تم استبعاد الرقم الأساسي واعتماد الـ 10 ترشيحات بنجاح للشركات';
      else if (action === 'reject_whole_listing') successMsg = 'تم رفض الطلب بالكامل';

      showToast(successMsg, 'success');
      fetchNotifications(page);
    } catch (err) {
      showToast(err.response?.data?.message || 'حدث خطأ أثناء تنفيذ الإجراء', 'error');
    } finally {
      setActionLoading((prev) => ({ ...prev, [notificationId]: false }));
    }
  };

  return (
    <div className="container" style={{ padding: '2rem 1rem 5rem', maxWidth: '1280px' }}>
      {/* Top Header */}
      <div
        style={{
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'space-between',
          marginBottom: '2rem',
          flexWrap: 'wrap',
          gap: '1rem'
        }}
      >
        <div>
          <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem' }}>
            <h1
              style={{
                fontSize: 'clamp(1.4rem, 2.8vw, 1.85rem)',
                fontWeight: 900,
                color: '#09090b',
                margin: 0
              }}
            >
              {isRtl ? 'مركز الإشعارات والتدقيق' : 'Admin Notification & Audit Center'}
            </h1>
            {unreadCount > 0 && (
              <span
                style={{
                  background: '#ef4444',
                  color: '#ffffff',
                  fontSize: '0.8rem',
                  fontWeight: 800,
                  padding: '0.2rem 0.65rem',
                  borderRadius: '999px',
                  display: 'inline-flex',
                  alignItems: 'center'
                }}
              >
                {unreadCount} {isRtl ? 'جديد' : 'new'}
              </span>
            )}
          </div>
          <p style={{ color: '#64748b', fontSize: '0.9rem', marginTop: '0.35rem', margin: '0.35rem 0 0' }}>
            {isRtl
              ? 'متابعة تضاربات أرقام الهواتف، سلاسل الترشيح الشبكية، وإدارة اعتمادات الكوادر.'
              : 'Audit phone conflicts, referral chains, and manage candidate approvals.'}
          </p>
        </div>

        <div style={{ display: 'flex', gap: '0.5rem', flexWrap: 'wrap' }}>
          {unreadCount > 0 && activeTab === 'active' && (
            <button
              type="button"
              onClick={handleMarkAllRead}
              className="btn"
              style={{
                background: '#ffffff',
                border: '1.5px solid #e4e4e7',
                padding: '0.5rem 1rem',
                fontSize: '0.825rem',
                fontWeight: 700,
                display: 'inline-flex',
                alignItems: 'center',
                gap: '0.4rem',
                cursor: 'pointer'
              }}
            >
              <Check size={16} />
              <span>{isRtl ? 'تحديد الكل كمقروء' : 'Mark all read'}</span>
            </button>
          )}

          <button
            type="button"
            onClick={() => fetchNotifications(page)}
            className="btn"
            style={{
              background: '#09090b',
              color: '#ffffff',
              padding: '0.5rem 1rem',
              fontSize: '0.825rem',
              fontWeight: 700,
              display: 'inline-flex',
              alignItems: 'center',
              gap: '0.4rem',
              cursor: 'pointer'
            }}
          >
            <RefreshCw size={15} />
            <span>{isRtl ? 'تحديث' : 'Refresh'}</span>
          </button>
        </div>
      </div>

      {/* Main Tabs (Active vs Archive Box) */}
      <div
        style={{
          display: 'flex',
          borderBottom: '2px solid #e4e4e7',
          gap: '1rem',
          marginBottom: '1.5rem'
        }}
      >
        <button
          type="button"
          onClick={() => {
            setActiveTab('active');
            setPage(1);
          }}
          style={{
            background: 'none',
            border: 'none',
            borderBottom: activeTab === 'active' ? '3px solid #000000' : '3px solid transparent',
            padding: '0.75rem 1.25rem',
            fontSize: '1rem',
            fontWeight: 800,
            color: activeTab === 'active' ? '#000000' : '#71717a',
            cursor: 'pointer',
            display: 'inline-flex',
            alignItems: 'center',
            gap: '0.5rem',
            marginBottom: '-2px',
            transition: 'all 0.15s'
          }}
        >
          <Bell size={18} />
          <span>{isRtl ? 'الإشعارات النشطة' : 'Active Notifications'}</span>
          <span
            style={{
              background: activeTab === 'active' ? '#09090b' : '#e4e4e7',
              color: activeTab === 'active' ? '#ffffff' : '#71717a',
              fontSize: '0.75rem',
              padding: '0.15rem 0.5rem',
              borderRadius: '999px',
              fontWeight: 700
            }}
          >
            {activeCount}
          </span>
        </button>

        <button
          type="button"
          onClick={() => {
            setActiveTab('archive');
            setPage(1);
          }}
          style={{
            background: 'none',
            border: 'none',
            borderBottom: activeTab === 'archive' ? '3px solid #000000' : '3px solid transparent',
            padding: '0.75rem 1.25rem',
            fontSize: '1rem',
            fontWeight: 800,
            color: activeTab === 'archive' ? '#000000' : '#71717a',
            cursor: 'pointer',
            display: 'inline-flex',
            alignItems: 'center',
            gap: '0.5rem',
            marginBottom: '-2px',
            transition: 'all 0.15s'
          }}
        >
          <Archive size={18} />
          <span>{isRtl ? 'صندوق الأرشيف' : 'Archive Box'}</span>
          <span
            style={{
              background: activeTab === 'archive' ? '#09090b' : '#e4e4e7',
              color: activeTab === 'archive' ? '#ffffff' : '#71717a',
              fontSize: '0.75rem',
              padding: '0.15rem 0.5rem',
              borderRadius: '999px',
              fontWeight: 700
            }}
          >
            {archivedCount}
          </span>
        </button>
      </div>

      {/* Filter Row */}
      <div
        style={{
          display: 'flex',
          gap: '0.5rem',
          marginBottom: '1.75rem',
          flexWrap: 'wrap',
          alignItems: 'center'
        }}
      >
        <span style={{ fontSize: '0.85rem', fontWeight: 700, color: '#71717a', marginInlineEnd: '0.25rem' }}>
          {isRtl ? 'تصفية حسب النوع:' : 'Filter:'}
        </span>

        {[
          { key: '', label: isRtl ? 'الكل' : 'All' },
          { key: 'PHONE_CONFLICT_DIFFERENT_NAMES', label: isRtl ? '⚠️ تضارب أرقام الهواتف (24h)' : 'Phone Conflicts' },
          { key: 'CHAIN_LINKED_RECOMMENDATION', label: isRtl ? '🔗 سلاسل الترشيح الشبكية' : 'Referral Chains' }
        ].map((f) => (
          <button
            key={f.key}
            type="button"
            onClick={() => {
              setTypeFilter(f.key);
              setPage(1);
            }}
            style={{
              padding: '0.4rem 0.85rem',
              borderRadius: '8px',
              fontSize: '0.825rem',
              fontWeight: 700,
              cursor: 'pointer',
              border: typeFilter === f.key ? '1.5px solid #000000' : '1px solid #e4e4e7',
              background: typeFilter === f.key ? '#f4f4f5' : '#ffffff',
              color: typeFilter === f.key ? '#000000' : '#52525b',
              transition: 'all 0.15s'
            }}
          >
            {f.label}
          </button>
        ))}
      </div>

      {/* Loading state */}
      {loading ? (
        <div style={{ padding: '4rem 0' }}>
          <LoadingSpinner />
        </div>
      ) : notifications.length === 0 ? (
        /* Empty State */
        <div
          style={{
            background: '#ffffff',
            border: '2px dashed #e4e4e7',
            borderRadius: '16px',
            padding: '4rem 2rem',
            textAlign: 'center',
            maxWidth: '560px',
            margin: '2rem auto'
          }}
        >
          {activeTab === 'active' ? (
            <Inbox size={48} style={{ color: '#a1a1aa', margin: '0 auto 1rem' }} />
          ) : (
            <Archive size={48} style={{ color: '#a1a1aa', margin: '0 auto 1rem' }} />
          )}
          <h3 style={{ fontSize: '1.25rem', fontWeight: 800, color: '#27272a', marginBottom: '0.5rem' }}>
            {activeTab === 'active'
              ? isRtl
                ? 'لا توجد إشعارات نشطة حالياً'
                : 'No active notifications'
              : isRtl
              ? 'صندوق الأرشيف فارغ'
              : 'Archive box is empty'}
          </h3>
          <p style={{ color: '#71717a', fontSize: '0.9rem', margin: 0 }}>
            {activeTab === 'active'
              ? isRtl
                ? 'سوف تظهر هنا إشعارات تضارب الهواتف وسلاسل الترشيح فور حدوثها على الموقع.'
                : 'New conflicts and chained registrations will appear here in real-time.'
              : isRtl
              ? 'الإشعارات التي تقوم بنقلها للأرشيف ستكون محفوظة هنا للرجوع إليها مستقبلاً.'
              : 'Resolved and archived items will be preserved here for audit history.'}
          </p>
        </div>
      ) : (
        /* Notifications List */
        <div style={{ display: 'flex', flexDirection: 'column', gap: '1.25rem' }}>
          {notifications.map((notif) => {
            const isUnread = notif.status === 'unread';
            const isConflict = notif.type === 'PHONE_CONFLICT_DIFFERENT_NAMES';
            const isChain = notif.type === 'CHAIN_LINKED_RECOMMENDATION';
            const isExpanded = Boolean(expandedCards[notif._id]);
            const isResolving = Boolean(actionLoading[notif._id]);
            const resolution = notif.data?.resolution;
            const isResolved = resolution && resolution.action && resolution.action !== 'none';

            return (
              <div
                key={notif._id}
                style={{
                  background: '#ffffff',
                  border: isUnread ? '2px solid #000000' : '1px solid #e4e4e7',
                  borderRadius: '16px',
                  padding: 'clamp(1.25rem, 3vw, 1.75rem)',
                  boxShadow: isUnread
                    ? '0 4px 12px rgba(0,0,0,0.06)'
                    : '0 1px 3px rgba(0,0,0,0.02)',
                  position: 'relative',
                  transition: 'all 0.15s'
                }}
              >
                {/* Unread indicator badge */}
                {isUnread && (
                  <div
                    style={{
                      position: 'absolute',
                      top: '1.25rem',
                      [isRtl ? 'left' : 'right']: '1.25rem',
                      display: 'flex',
                      alignItems: 'center',
                      gap: '0.35rem',
                      background: '#09090b',
                      color: '#ffffff',
                      fontSize: '0.725rem',
                      fontWeight: 800,
                      padding: '0.2rem 0.6rem',
                      borderRadius: '999px'
                    }}
                  >
                    <span>{isRtl ? 'غير مقروء' : 'Unread'}</span>
                  </div>
                )}

                {/* Card Header */}
                <div style={{ display: 'flex', alignItems: 'flex-start', gap: '1rem', flexWrap: 'wrap' }}>
                  {/* Type Icon Badge */}
                  <div
                    style={{
                      width: '44px',
                      height: '44px',
                      borderRadius: '12px',
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'center',
                      flexShrink: 0,
                      background: isConflict ? '#fef3c7' : isChain ? '#e0e7ff' : '#f4f4f5',
                      color: isConflict ? '#b45309' : isChain ? '#4338ca' : '#27272a'
                    }}
                  >
                    {isConflict ? <AlertTriangle size={24} /> : isChain ? <LinkIcon size={24} /> : <Bell size={24} />}
                  </div>

                  <div style={{ flex: 1, minWidth: '240px' }}>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '0.65rem', flexWrap: 'wrap', marginBottom: '0.35rem' }}>
                      <span
                        style={{
                          fontSize: '0.75rem',
                          fontWeight: 800,
                          padding: '0.2rem 0.6rem',
                          borderRadius: '6px',
                          background: isConflict ? '#fffbeb' : isChain ? '#eef2ff' : '#f4f4f5',
                          color: isConflict ? '#b45309' : isChain ? '#4338ca' : '#52525b',
                          border: isConflict ? '1px solid #fde68a' : isChain ? '1px solid #c7d2fe' : '1px solid #e4e4e7'
                        }}
                      >
                        {isConflict
                          ? isRtl ? '⚠️ تضارب هاتف (24 ساعة)' : 'Phone Conflict (24h)'
                          : isChain
                          ? isRtl ? '🔗 ارتباط شبكي' : 'Referral Chain'
                          : isRtl ? 'إشعار إداري' : 'System Notice'}
                      </span>

                      {notif.requestNumber && (
                        <span
                          style={{
                            fontFamily: 'monospace',
                            fontWeight: 800,
                            fontSize: '0.825rem',
                            color: '#09090b',
                            background: '#f4f4f5',
                            padding: '0.15rem 0.5rem',
                            borderRadius: '4px'
                          }}
                        >
                          {notif.requestNumber}
                        </span>
                      )}

                      <span style={{ fontSize: '0.75rem', color: '#a1a1aa' }}>
                        {new Date(notif.createdAt).toLocaleString(isRtl ? 'ar-EG' : 'en-US')}
                      </span>
                    </div>

                    <h3 style={{ fontSize: '1.15rem', fontWeight: 800, color: '#09090b', margin: '0 0 0.35rem' }}>
                      {notif.title}
                    </h3>
                    <p style={{ color: '#52525b', fontSize: '0.925rem', margin: 0, lineHeight: 1.5 }}>
                      {notif.message}
                    </p>
                  </div>
                </div>

                {/* ========================================================= */}
                {/* CASE 2 DETAIL: Phone Conflict Comparison View            */}
                {/* ========================================================= */}
                {isConflict && notif.data && (
                  <div
                    style={{
                      marginTop: '1.25rem',
                      background: '#fafafa',
                      border: '1.5px solid #f4f4f5',
                      borderRadius: '12px',
                      padding: '1.25rem'
                    }}
                  >
                    <div style={{ fontSize: '0.8rem', fontWeight: 800, color: '#71717a', marginBottom: '0.85rem' }}>
                      {isRtl ? 'مقارنة الطلبين المسجلين بنفس رقم الهاتف:' : 'Comparison of conflicting listings:'}
                    </div>

                    <div
                      style={{
                        display: 'grid',
                        gridTemplateColumns: 'repeat(auto-fit, minmax(280px, 1fr))',
                        gap: '1rem',
                        marginBottom: '1rem'
                      }}
                    >
                      {/* Listing 1 (First entry) */}
                      <div
                        style={{
                          background: '#ffffff',
                          border: '1px solid #e4e4e7',
                          borderRadius: '10px',
                          padding: '1rem'
                        }}
                      >
                        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '0.5rem' }}>
                          <span style={{ fontSize: '0.75rem', fontWeight: 800, color: '#16a34a', background: '#dcfce7', padding: '0.15rem 0.5rem', borderRadius: '4px' }}>
                            {isRtl ? 'الطلب الأول (المسجل مسبقاً)' : 'First Listing (Existing)'}
                          </span>
                          <span style={{ fontFamily: 'monospace', fontSize: '0.75rem', fontWeight: 700, color: '#52525b' }}>
                            {notif.data.firstListing?.requestNumber || '-'}
                          </span>
                        </div>
                        <div style={{ fontSize: '1rem', fontWeight: 800, color: '#09090b', marginBottom: '0.25rem' }}>
                          {notif.data.firstListing?.submitterName || '-'}
                        </div>
                        <div style={{ fontSize: '0.825rem', color: '#52525b', direction: 'ltr', textAlign: isRtl ? 'right' : 'left' }}>
                          📞 {notif.data.conflictingPhone || notif.data.firstListing?.submitterPhone}
                        </div>
                        <div style={{ fontSize: '0.75rem', color: '#a1a1aa', marginTop: '0.35rem' }}>
                          {isRtl ? 'الحالة: معتمد ونشط في قاعدة البيانات' : 'Status: Active in database'}
                        </div>
                      </div>

                      {/* Listing 2 (Second entry - In Conflict) */}
                      <div
                        style={{
                          background: '#ffffff',
                          border: '2px solid #f59e0b',
                          borderRadius: '10px',
                          padding: '1rem'
                        }}
                      >
                        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '0.5rem' }}>
                          <span style={{ fontSize: '0.75rem', fontWeight: 800, color: '#b45309', background: '#fef3c7', padding: '0.15rem 0.5rem', borderRadius: '4px' }}>
                            {isRtl ? 'الطلب الثاني (المعلق للمراجعة)' : 'Second Listing (Pending 24h)'}
                          </span>
                          <span style={{ fontFamily: 'monospace', fontSize: '0.75rem', fontWeight: 700, color: '#09090b' }}>
                            {notif.data.secondListing?.requestNumber || notif.requestNumber}
                          </span>
                        </div>
                        <div style={{ fontSize: '1rem', fontWeight: 900, color: '#09090b', marginBottom: '0.25rem' }}>
                          {notif.data.secondListing?.submitterName || '-'}
                        </div>
                        <div style={{ fontSize: '0.825rem', color: '#b45309', fontWeight: 700, direction: 'ltr', textAlign: isRtl ? 'right' : 'left' }}>
                          ⚠️ {notif.data.conflictingPhone || notif.data.secondListing?.submitterPhone} (نفس الرقم)
                        </div>
                        <div style={{ fontSize: '0.75rem', color: '#b45309', marginTop: '0.35rem', fontWeight: 600 }}>
                          {isRtl
                            ? `يتضمن 10 كوادر موصى بهم — طلب من المستخدم المتابعة بعد 24 ساعة`
                            : `Contains 10 recommendations — follow-up requested after 24h`}
                        </div>
                      </div>
                    </div>

                    {/* Recommendations List Toggle */}
                    {notif.data.secondListing?.people && notif.data.secondListing.people.length > 0 && (
                      <div style={{ marginBottom: '1rem' }}>
                        <button
                          type="button"
                          onClick={() => toggleExpand(notif._id)}
                          style={{
                            background: 'none',
                            border: 'none',
                            color: '#0284c7',
                            fontSize: '0.825rem',
                            fontWeight: 700,
                            cursor: 'pointer',
                            display: 'inline-flex',
                            alignItems: 'center',
                            gap: '0.35rem',
                            padding: 0
                          }}
                        >
                          {isExpanded ? <ChevronUp size={16} /> : <ChevronDown size={16} />}
                          <span>
                            {isExpanded
                              ? isRtl ? 'إخفاء تفاصيل الكوادر الـ 10 المرفقة' : 'Hide 10 attached candidates'
                              : isRtl ? `عرض تفاصيل الكوادر الـ 10 المرفقة مع الطلب الثاني (${notif.data.secondListing.people.length})` : 'Show 10 attached candidates'}
                          </span>
                        </button>

                        {isExpanded && (
                          <div style={{ marginTop: '0.75rem', border: '1px solid #e4e4e7', borderRadius: '8px', overflowX: 'auto', background: '#ffffff' }}>
                            <table style={{ width: '100%', borderCollapse: 'collapse', fontSize: '0.825rem', textAlign: isRtl ? 'right' : 'left' }}>
                              <thead>
                                <tr style={{ background: '#f8fafc', borderBottom: '1px solid #e4e4e7' }}>
                                  <th style={{ padding: '0.5rem 0.75rem', color: '#64748b' }}>#</th>
                                  <th style={{ padding: '0.5rem 0.75rem', color: '#64748b' }}>{isRtl ? 'الاسم' : 'Name'}</th>
                                  <th style={{ padding: '0.5rem 0.75rem', color: '#64748b' }}>{isRtl ? 'الهاتف' : 'Phone'}</th>
                                  <th style={{ padding: '0.5rem 0.75rem', color: '#64748b' }}>{isRtl ? 'الوظيفة' : 'Job Title'}</th>
                                  <th style={{ padding: '0.5rem 0.75rem', color: '#64748b' }}>{isRtl ? 'مستوى الخبرة' : 'Level'}</th>
                                </tr>
                              </thead>
                              <tbody>
                                {notif.data.secondListing.people.map((p, pIdx) => (
                                  <tr key={pIdx} style={{ borderBottom: '1px solid #f1f5f9' }}>
                                    <td style={{ padding: '0.5rem 0.75rem', fontWeight: 700, color: '#71717a' }}>{pIdx + 1}</td>
                                    <td style={{ padding: '0.5rem 0.75rem', fontWeight: 700, color: '#09090b' }}>{p.fullName}</td>
                                    <td style={{ padding: '0.5rem 0.75rem', color: '#52525b', direction: 'ltr', textAlign: isRtl ? 'right' : 'left' }}>{p.phone}</td>
                                    <td style={{ padding: '0.5rem 0.75rem', color: '#09090b' }}>{p.jobTitle || '-'}</td>
                                    <td style={{ padding: '0.5rem 0.75rem', color: '#64748b' }}>{p.careerLevel || '-'}</td>
                                  </tr>
                                ))}
                              </tbody>
                            </table>
                          </div>
                        )}
                      </div>
                    )}

                    {/* Resolution Section (If already resolved) */}
                    {isResolved ? (
                      <div
                        style={{
                          background: '#f0fdf4',
                          border: '1px solid #bbf7d0',
                          borderRadius: '8px',
                          padding: '0.85rem 1rem',
                          display: 'flex',
                          alignItems: 'center',
                          gap: '0.75rem'
                        }}
                      >
                        <CheckCircle2 size={20} style={{ color: '#16a34a', flexShrink: 0 }} />
                        <div style={{ fontSize: '0.85rem', color: '#166534' }}>
                          <span style={{ fontWeight: 800 }}>
                            {resolution.action === 'approve_both'
                              ? isRtl ? 'تم تنفيذ الإجراء: قبول واعتماد الطلبين معاً' : 'Action taken: Approved both listings'
                              : resolution.action === 'reject_main_keep_recommendations'
                              ? isRtl ? 'تم تنفيذ الإجراء: استبعاد الرقم الأساسي وقبول الـ 10 ترشيحات للشركات' : 'Action taken: Rejected main & kept recommendations'
                              : isRtl ? 'تم تنفيذ الإجراء: رفض الطلب بالكامل' : 'Action taken: Rejected whole listing'}
                          </span>
                          {resolution.notes && <div style={{ fontSize: '0.8rem', marginTop: '0.2rem' }}>{resolution.notes}</div>}
                        </div>
                      </div>
                    ) : (
                      /* Admin Resolution Action Buttons (Options 1, 2, 3) */
                      <div style={{ marginTop: '1rem', borderTop: '1px solid #e4e4e7', paddingTop: '1rem' }}>
                        <div style={{ fontSize: '0.85rem', fontWeight: 800, color: '#09090b', marginBottom: '0.75rem' }}>
                          {isRtl ? 'خيارات الإدارة لتسوية هذا التضارب:' : 'Select administrative resolution:'}
                        </div>

                        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(260px, 1fr))', gap: '0.75rem' }}>
                          {/* Option 1: Approve Both */}
                          <button
                            type="button"
                            disabled={isResolving}
                            onClick={() => handleResolveConflict(notif._id, 'approve_both')}
                            style={{
                              background: '#ffffff',
                              border: '1.5px solid #22c55e',
                              color: '#15803d',
                              borderRadius: '10px',
                              padding: '0.85rem 1rem',
                              textAlign: isRtl ? 'right' : 'left',
                              cursor: 'pointer',
                              display: 'flex',
                              flexDirection: 'column',
                              gap: '0.25rem',
                              transition: 'all 0.15s'
                            }}
                          >
                            <div style={{ display: 'flex', alignItems: 'center', gap: '0.4rem', fontWeight: 800, fontSize: '0.9rem' }}>
                              <CheckCircle2 size={16} />
                              <span>{isRtl ? '1. قبول الطلبين معاً' : '1. Approve Both Listings'}</span>
                            </div>
                            <span style={{ fontSize: '0.75rem', color: '#166534', lineHeight: 1.4 }}>
                              {isRtl
                                ? 'اعتماد الحسابين برقم الهاتف المشترك وإتاحة جميع الكوادر للشركات.'
                                : 'Approve both listings under the shared phone number.'}
                            </span>
                          </button>

                          {/* Option 2: Reject Main, Add Recommendations */}
                          <button
                            type="button"
                            disabled={isResolving}
                            onClick={() => handleResolveConflict(notif._id, 'reject_main_keep_recommendations')}
                            style={{
                              background: '#fffbeb',
                              border: '1.5px solid #f59e0b',
                              color: '#b45309',
                              borderRadius: '10px',
                              padding: '0.85rem 1rem',
                              textAlign: isRtl ? 'right' : 'left',
                              cursor: 'pointer',
                              display: 'flex',
                              flexDirection: 'column',
                              gap: '0.25rem',
                              transition: 'all 0.15s'
                            }}
                          >
                            <div style={{ display: 'flex', alignItems: 'center', gap: '0.4rem', fontWeight: 800, fontSize: '0.9rem' }}>
                              <AlertTriangle size={16} />
                              <span>{isRtl ? '2. استبعاد الرقم وقبول الترشيحات' : '2. Reject Main & Add Recommendations'}</span>
                            </div>
                            <span style={{ fontSize: '0.75rem', color: '#92400e', lineHeight: 1.4 }}>
                              {isRtl
                                ? 'إضافة الـ 10 ترشيحات للشركات مسجلة تحت رقم الهاتف المستبعد مع إخفاء حسابه الرئيسي.'
                                : 'Add 10 recommendations to company database, hide rejected main name.'}
                            </span>
                          </button>

                          {/* Option 3: Reject Whole Listing */}
                          <button
                            type="button"
                            disabled={isResolving}
                            onClick={() => handleResolveConflict(notif._id, 'reject_whole_listing')}
                            style={{
                              background: '#ffffff',
                              border: '1.5px solid #ef4444',
                              color: '#b91c1c',
                              borderRadius: '10px',
                              padding: '0.85rem 1rem',
                              textAlign: isRtl ? 'right' : 'left',
                              cursor: 'pointer',
                              display: 'flex',
                              flexDirection: 'column',
                              gap: '0.25rem',
                              transition: 'all 0.15s'
                            }}
                          >
                            <div style={{ display: 'flex', alignItems: 'center', gap: '0.4rem', fontWeight: 800, fontSize: '0.9rem' }}>
                              <XCircle size={16} />
                              <span>{isRtl ? '3. رفض الطلب بالكامل' : '3. Reject Whole Listing'}</span>
                            </div>
                            <span style={{ fontSize: '0.75rem', color: '#991b1b', lineHeight: 1.4 }}>
                              {isRtl
                                ? 'رفض الطلب الثاني بالكامل وعدم إضافة أي ترشيحات منه للنظام.'
                                : 'Reject entire second request; no candidates added.'}
                            </span>
                          </button>
                        </div>
                      </div>
                    )}
                  </div>
                )}

                {/* ========================================================= */}
                {/* CASE 1 DETAIL: Chain Linked Referral Flow View           */}
                {/* ========================================================= */}
                {isChain && notif.data?.chain && (
                  <div
                    style={{
                      marginTop: '1.25rem',
                      background: '#f8fafc',
                      border: '1px solid #e2e8f0',
                      borderRadius: '12px',
                      padding: '1.25rem'
                    }}
                  >
                    <div style={{ fontSize: '0.8rem', fontWeight: 800, color: '#4338ca', marginBottom: '0.85rem' }}>
                      {isRtl ? 'تسلسل سلسلة الترشيح الشبكية (Chain Link):' : 'Referral Chain Architecture:'}
                    </div>

                    <div
                      style={{
                        display: 'flex',
                        alignItems: 'center',
                        gap: '1rem',
                        flexWrap: 'wrap',
                        background: '#ffffff',
                        border: '1px solid #cbd5e1',
                        borderRadius: '10px',
                        padding: '1rem'
                      }}
                    >
                      {/* Parent Submitter */}
                      <div style={{ flex: 1, minWidth: '200px' }}>
                        <div style={{ fontSize: '0.75rem', color: '#64748b', fontWeight: 700 }}>
                          {isRtl ? 'مقدم الطلب الأصلي (المرشِّح)' : 'Original Submitter'}
                        </div>
                        <div style={{ fontSize: '1rem', fontWeight: 900, color: '#09090b' }}>
                          {notif.data.chain.parentSubmitterName}
                        </div>
                        <div style={{ fontSize: '0.8rem', color: '#64748b', direction: 'ltr', textAlign: isRtl ? 'right' : 'left' }}>
                          {notif.data.chain.parentSubmitterPhone}
                        </div>
                        <div style={{ fontFamily: 'monospace', fontSize: '0.75rem', fontWeight: 700, color: '#4338ca', marginTop: '0.2rem' }}>
                          [{notif.data.chain.parentRequestNumber}]
                        </div>
                      </div>

                      {/* Arrow / Connection */}
                      <div
                        style={{
                          display: 'flex',
                          flexDirection: 'column',
                          alignItems: 'center',
                          color: '#4338ca',
                          fontWeight: 800,
                          fontSize: '0.75rem'
                        }}
                      >
                        <ArrowRight size={22} style={{ transform: isRtl ? 'rotate(180deg)' : 'none' }} />
                        <span>{isRtl ? 'قام بترشيحه' : 'Referred'}</span>
                      </div>

                      {/* Child Submitter (Now Main) */}
                      <div style={{ flex: 1, minWidth: '200px' }}>
                        <div style={{ fontSize: '0.75rem', color: '#4338ca', fontWeight: 800 }}>
                          {isRtl ? 'سجل كمرشح رئيسي جديد' : 'Now Registered as Main'}
                        </div>
                        <div style={{ fontSize: '1rem', fontWeight: 900, color: '#09090b' }}>
                          {notif.data.chain.newSubmitterName}
                        </div>
                        <div style={{ fontSize: '0.8rem', color: '#64748b', direction: 'ltr', textAlign: isRtl ? 'right' : 'left' }}>
                          {notif.data.chain.newSubmitterPhone}
                        </div>
                        <div style={{ fontFamily: 'monospace', fontSize: '0.75rem', fontWeight: 700, color: '#09090b', marginTop: '0.2rem' }}>
                          [{notif.data.chain.newRequestNumber}]
                        </div>
                      </div>

                      {/* Attached Recommendations Pill */}
                      <div
                        style={{
                          background: '#e0e7ff',
                          borderRadius: '8px',
                          padding: '0.75rem 1rem',
                          textAlign: 'center'
                        }}
                      >
                        <div style={{ fontSize: '1.25rem', fontWeight: 900, color: '#4338ca' }}>
                          +10
                        </div>
                        <div style={{ fontSize: '0.75rem', fontWeight: 700, color: '#3730a3' }}>
                          {isRtl ? 'ترشيحات جديدة مرتبطة' : 'New linked referrals'}
                        </div>
                      </div>
                    </div>
                  </div>
                )}

                {/* Card Bottom Actions */}
                <div
                  style={{
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'space-between',
                    marginTop: '1.25rem',
                    paddingTop: '1rem',
                    borderTop: '1px solid #f4f4f5',
                    flexWrap: 'wrap',
                    gap: '0.75rem'
                  }}
                >
                  <div style={{ display: 'flex', gap: '0.5rem', alignItems: 'center' }}>
                    {isUnread && (
                      <button
                        type="button"
                        onClick={(e) => handleMarkRead(notif._id, e)}
                        className="btn"
                        style={{
                          background: '#f4f4f5',
                          border: 'none',
                          padding: '0.35rem 0.75rem',
                          fontSize: '0.775rem',
                          fontWeight: 700,
                          color: '#27272a',
                          cursor: 'pointer',
                          display: 'inline-flex',
                          alignItems: 'center',
                          gap: '0.3rem'
                        }}
                      >
                        <Check size={14} />
                        <span>{isRtl ? 'تحديد كمقروء' : 'Mark as read'}</span>
                      </button>
                    )}

                    {notif.requestId && (
                      <a
                        href={`/admin/recommendations?search=${encodeURIComponent(notif.requestNumber || '')}`}
                        style={{
                          textDecoration: 'none',
                          color: '#0284c7',
                          fontSize: '0.775rem',
                          fontWeight: 700,
                          display: 'inline-flex',
                          alignItems: 'center',
                          gap: '0.3rem',
                          padding: '0.35rem 0.75rem',
                          borderRadius: '6px',
                          background: '#f0f9ff'
                        }}
                      >
                        <Eye size={14} />
                        <span>{isRtl ? 'فحص الطلب في جدول الترشيحات' : 'View in nominations table'}</span>
                      </a>
                    )}
                  </div>

                  <div>
                    {activeTab === 'active' ? (
                      <button
                        type="button"
                        onClick={(e) => handleArchive(notif._id, e)}
                        style={{
                          background: 'none',
                          border: 'none',
                          color: '#71717a',
                          fontSize: '0.8rem',
                          fontWeight: 700,
                          cursor: 'pointer',
                          display: 'inline-flex',
                          alignItems: 'center',
                          gap: '0.35rem',
                          padding: '0.35rem 0.65rem'
                        }}
                      >
                        <Archive size={15} />
                        <span>{isRtl ? 'نقل إلى الأرشيف' : 'Archive'}</span>
                      </button>
                    ) : (
                      <button
                        type="button"
                        onClick={(e) => handleUnarchive(notif._id, e)}
                        style={{
                          background: 'none',
                          border: 'none',
                          color: '#0284c7',
                          fontSize: '0.8rem',
                          fontWeight: 700,
                          cursor: 'pointer',
                          display: 'inline-flex',
                          alignItems: 'center',
                          gap: '0.35rem',
                          padding: '0.35rem 0.65rem'
                        }}
                      >
                        <RefreshCw size={15} />
                        <span>{isRtl ? 'استعادة من الأرشيف' : 'Restore from archive'}</span>
                      </button>
                    )}
                  </div>
                </div>
              </div>
            );
          })}

          {/* Pagination */}
          {totalPages > 1 && (
            <div style={{ marginTop: '1.5rem', display: 'flex', justifyContent: 'center' }}>
              <Pagination
                currentPage={page}
                totalPages={totalPages}
                onPageChange={(newPage) => fetchNotifications(newPage)}
              />
            </div>
          )}
        </div>
      )}
    </div>
  );
}
