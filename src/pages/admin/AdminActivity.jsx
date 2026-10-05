import React, { useEffect, useState, useCallback } from 'react'
import { useLanguage } from '../../context/LanguageContext'
import { useToast } from '../../context/ToastContext'
import { adminApi } from '../../api/admin.api'
import {
  Activity,
  User,
  Building2,
  Shield,
  Search,
  Clock,
  Filter
} from 'lucide-react'
import LoadingSpinner from '../../components/ui/LoadingSpinner'
import Pagination from '../../components/ui/Pagination'
import EmptyState from '../../components/ui/EmptyState'

export default function AdminActivity() {
  const { isRtl } = useLanguage()
  const { showToast } = useToast()

  const [logs, setLogs] = useState([])
  const [total, setTotal] = useState(0)
  const [page, setPage] = useState(1)
  const [totalPages, setTotalPages] = useState(1)
  const [loading, setLoading] = useState(true)

  // Filter
  const [roleFilter, setRoleFilter] = useState('')

  const fetchLogs = useCallback((targetPage = 1) => {
    setLoading(true)
    const params = { page: targetPage, limit: 20 }
    if (roleFilter) params.actorRole = roleFilter

    adminApi.listActivity(params)
      .then(res => {
        setLogs(res.data?.data || [])
        setTotal(res.data?.pagination?.total || 0)
        setTotalPages(res.data?.pagination?.totalPages || 1)
        setPage(targetPage)
      })
      .catch(err => {
        showToast(err.response?.data?.message || 'Failed to load activity logs', 'error')
      })
      .finally(() => setLoading(false))
  }, [roleFilter, showToast])

  useEffect(() => {
    fetchLogs(1)
  }, [fetchLogs])

  return (
    <div style={{ padding: '2rem 0 3rem', background: 'var(--bg-page)', minHeight: '85vh' }}>
      <div className="container">
        {/* Header */}
        <div style={{ display: 'flex', flexWrap: 'wrap', justifyContent: 'space-between', alignItems: 'center', gap: '1rem', marginBottom: '1.75rem' }}>
          <div>
            <h1 style={{ fontSize: '1.625rem', fontWeight: 800, color: 'var(--slate-900)' }}>
              {isRtl ? 'سجل النشاط والأمان (Audit Log)' : 'Security & Activity Audit Log'}
            </h1>
            <p style={{ color: 'var(--slate-500)', fontSize: '0.9375rem', marginTop: '0.25rem' }}>
              {isRtl ? 'سجل العمليات الإدارية، وعمليات البحث، وتفاعلات الشركات بالمنصة' : 'Track admin actions, employer searches, and platform events'}
            </p>
          </div>

          <div>
            <select
              className="form-control"
              value={roleFilter}
              onChange={(e) => setRoleFilter(e.target.value)}
              style={{ minWidth: 160 }}
            >
              <option value="">{isRtl ? 'جميع الفئات' : 'All Roles'}</option>
              <option value="admin">{isRtl ? 'الإدارة فقط (Admin)' : 'Admin Only'}</option>
              <option value="company">{isRtl ? 'المصانع والشركات (Company)' : 'Companies Only'}</option>
              <option value="candidate">{isRtl ? 'المرشحون (Candidate)' : 'Candidates Only'}</option>
            </select>
          </div>
        </div>

        {/* Logs Table */}
        <div className="card" style={{ padding: 0, overflow: 'hidden' }}>
          {loading ? (
            <div style={{ padding: '3rem' }}>
              <LoadingSpinner />
            </div>
          ) : logs.length === 0 ? (
            <EmptyState
              icon={Activity}
              title={isRtl ? 'لا يوجد سجل نشاط مسجل' : 'No activity logs found'}
              description={isRtl ? 'العمليات والتفاعلات الجديدة ستظهر هنا تلقائياً.' : 'New events will be recorded here.'}
            />
          ) : (
            <div style={{ overflowX: 'auto' }}>
              <table style={{ width: '100%', borderCollapse: 'collapse', textAlign: isRtl ? 'right' : 'left', fontSize: '0.875rem' }}>
                <thead>
                  <tr style={{ background: 'var(--slate-50)', borderBottom: '1px solid var(--border)' }}>
                    <th style={{ padding: '0.875rem 1rem', fontWeight: 700, color: 'var(--slate-600)' }}>
                      {isRtl ? 'الوقت والتاريخ' : 'Timestamp'}
                    </th>
                    <th style={{ padding: '0.875rem 1rem', fontWeight: 700, color: 'var(--slate-600)' }}>
                      {isRtl ? 'الدور' : 'Role'}
                    </th>
                    <th style={{ padding: '0.875rem 1rem', fontWeight: 700, color: 'var(--slate-600)' }}>
                      {isRtl ? 'الحدث / الإجراء' : 'Action'}
                    </th>
                    <th style={{ padding: '0.875rem 1rem', fontWeight: 700, color: 'var(--slate-600)' }}>
                      {isRtl ? 'الهدف / الكيان' : 'Target Entity'}
                    </th>
                    <th style={{ padding: '0.875rem 1rem', fontWeight: 700, color: 'var(--slate-600)' }}>
                      {isRtl ? 'تفاصيل إضافية' : 'Details'}
                    </th>
                  </tr>
                </thead>
                <tbody>
                  {logs.map((log) => {
                    const isAdm = log.actorRole === 'admin'
                    const isCmp = log.actorRole === 'company'

                    return (
                      <tr key={log._id} style={{ borderBottom: '1px solid var(--border)' }}>
                        <td style={{ padding: '0.875rem 1rem', color: 'var(--slate-500)', fontSize: '0.8125rem', whiteSpace: 'nowrap' }}>
                          {new Date(log.createdAt).toLocaleString(isRtl ? 'ar-EG' : 'en-US')}
                        </td>

                        <td style={{ padding: '0.875rem 1rem' }}>
                          <span
                            style={{
                              fontSize: '0.75rem',
                              fontWeight: 700,
                              padding: '0.2rem 0.5rem',
                              borderRadius: 'var(--radius-full)',
                              background: isAdm ? 'var(--primary-light)' : isCmp ? 'var(--accent-light)' : 'var(--slate-100)',
                              color: isAdm ? 'var(--primary)' : isCmp ? 'var(--accent)' : 'var(--slate-700)'
                            }}
                          >
                            {log.actorRole}
                          </span>
                        </td>

                        <td style={{ padding: '0.875rem 1rem', fontWeight: 700, color: 'var(--slate-900)' }}>
                          {log.action}
                        </td>

                        <td style={{ padding: '0.875rem 1rem', color: 'var(--slate-700)' }}>
                          {log.entityType ? `${log.entityType}` : '—'}
                        </td>

                        <td style={{ padding: '0.875rem 1rem', color: 'var(--slate-600)', fontSize: '0.8125rem' }}>
                          {log.metadata ? (
                            <code style={{ background: 'var(--slate-100)', padding: '0.15rem 0.35rem', borderRadius: 'var(--radius-sm)' }}>
                              {typeof log.metadata === 'object' ? JSON.stringify(log.metadata) : String(log.metadata)}
                            </code>
                          ) : '—'}
                        </td>
                      </tr>
                    )
                  })}
                </tbody>
              </table>
            </div>
          )}

          {totalPages > 1 && (
            <div style={{ padding: '1rem', borderTop: '1px solid var(--border)' }}>
              <Pagination
                currentPage={page}
                totalPages={totalPages}
                onPageChange={(p) => fetchLogs(p)}
              />
            </div>
          )}
        </div>
      </div>
    </div>
  )
}
