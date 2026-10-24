import React, { useEffect, useState } from 'react'
import { useParams, useNavigate, Link } from 'react-router-dom'
import { useLanguage } from '../../context/LanguageContext'
import { useToast } from '../../context/ToastContext'
import { adminApi } from '../../api/admin.api'
import {
  ArrowLeft,
  Building2,
  Phone,
  Mail,
  MapPin,
  CheckCircle,
  XCircle,
  ShieldAlert,
  ShieldCheck,
  CreditCard,
  Save,
  MessageCircle,
  KeyRound,
  UserCheck,
  Receipt,
  RotateCcw
} from 'lucide-react'
import LoadingSpinner from '../../components/ui/LoadingSpinner'
import StatusBadge from '../../components/ui/StatusBadge'
import ConfirmModal from '../../components/modals/ConfirmModal'

export default function AdminCompanyDetail() {
  const { id } = useParams()
  const navigate = useNavigate()
  const { isRtl } = useLanguage()
  const { showToast } = useToast()

  const [company, setCompany] = useState(null)
  const [loading, setLoading] = useState(true)
  const [orders, setOrders] = useState([])
  const [loadingOrders, setLoadingOrders] = useState(false)
  const [processingOrder, setProcessingOrder] = useState(null)
  const [savingSub, setSavingSub] = useState(false)
  const [subForm, setSubForm] = useState({ plan: 'Basic', priceEgp: 500, status: 'active' })
  const [confirmModal, setConfirmModal] = useState({ open: false, title: '', message: '', action: null })

  const fetchOrders = () => {
    setLoadingOrders(true)
    adminApi.getCompanyOrders(id)
      .then(res => {
        setOrders(res.data?.data || [])
      })
      .catch(() => {})
      .finally(() => setLoadingOrders(false))
  }

  const fetchCompany = () => {
    setLoading(true)
    adminApi.getCompanyById(id)
      .then(res => {
        const comp = res.data?.data
        setCompany(comp)
        setSubForm({
          plan: comp?.subscriptionPlan || comp?.subscription?.plan || 'Basic',
          priceEgp: comp?.subscriptionPriceEgp || comp?.monthlyPriceEgp || 500,
          status: comp?.accountStatus || comp?.subscription?.status || 'active'
        })
      })
      .catch(err => {
        showToast(err.response?.data?.message || 'Failed to load company', 'error')
      })
      .finally(() => setLoading(false))
  }

  useEffect(() => {
    fetchCompany()
    fetchOrders()
  }, [id])

  const handleUpdateOrderStatus = (orderId, newStatus) => {
    const isRefund = newStatus === 'refunded'
    setConfirmModal({
      open: true,
      title: isRefund
        ? (isRtl ? 'تحويل حالة المعاملة إلى مسترد (Refund)' : 'Mark Payment as Refunded')
        : (isRtl ? 'إعادة تعيين الحالة إلى مدفوع' : 'Mark Payment as Paid'),
      message: isRefund
        ? (isRtl
            ? 'هل قمت باسترداد المبلغ يدوياً للعميل وتريد تعيين المعاملة كـ "مسترد"؟ سيتم تعطيل اشتراك الشركة النشط تلقائياً لحين تجديده.'
            : 'Have you processed the refund manually? This will mark the order as refunded and deactivate the active subscription.')
        : (isRtl
            ? 'هل تريد إعادة تفعيل هذا الدفع وتنشيط اشتراك الشركة؟'
            : 'Restore payment status to paid and activate subscription?'),
      confirmText: isRefund ? (isRtl ? 'تأكيد الاسترداد' : 'Confirm Refund') : (isRtl ? 'تأكيد' : 'Confirm'),
      danger: isRefund,
      action: async () => {
        try {
          setProcessingOrder(orderId)
          await adminApi.updateCompanyOrderStatus(company._id, orderId, newStatus, 'Updated manually by admin')
          showToast(isRtl ? 'تم تحديث حالة المعاملة بنجاح' : 'Order status updated successfully', 'success')
          fetchOrders()
          fetchCompany()
        } catch (err) {
          showToast(err.response?.data?.message || 'Failed to update order status', 'error')
        } finally {
          setProcessingOrder(null)
        }
      }
    })
  }

  if (loading) return <LoadingSpinner />
  if (!company) {
    return (
      <div className="container" style={{ padding: '3rem 0', textAlign: 'center' }}>
        <p>{isRtl ? 'الشركة غير موجودة' : 'Company not found'}</p>
        <Link to="/admin/companies" className="btn btn-primary" style={{ marginTop: '1rem' }}>
          {isRtl ? 'العودة للشركات' : 'Back to Companies'}
        </Link>
      </div>
    )
  }

  const isBlocked = company.isBlocked || company.userId?.isBlocked

  const handleApprove = () => {
    adminApi.approveCompany(company._id)
      .then(() => {
        showToast(isRtl ? 'تم اعتماد الشركة وتفعيل البحث بنجاح' : 'Company approved successfully', 'success')
        fetchCompany()
      })
      .catch(err => showToast(err.response?.data?.message || 'Error approving', 'error'))
  }

  const handleReject = () => {
    adminApi.rejectCompany(company._id, 'Does not meet requirements')
      .then(() => {
        showToast(isRtl ? 'تم رفض الشركة' : 'Company rejected', 'success')
        fetchCompany()
      })
      .catch(err => showToast(err.response?.data?.message || 'Error rejecting', 'error'))
  }

  const handleSaveSubscription = async (e) => {
    e.preventDefault()
    try {
      setSavingSub(true)
      await adminApi.updateEmployerSubscription(company._id, {
        plan: subForm.plan,
        priceEgp: Number(subForm.priceEgp)
      })
      if (subForm.status && subForm.status !== company.accountStatus) {
        await adminApi.updateEmployerStatus(company._id, subForm.status, 'Admin updated status in detail view')
      }
      showToast(isRtl ? 'تم تحديث بيانات باقة واشتراك الحساب بنجاح' : 'Subscription updated successfully', 'success')
      fetchCompany()
    } catch (err) {
      showToast(err.response?.data?.message || 'Update failed', 'error')
    } finally {
      setSavingSub(false)
    }
  }

  const handleResetPassword = () => {
    setConfirmModal({
      open: true,
      title: isRtl ? 'إعادة تعيين كلمة المرور' : 'Reset Password',
      message: isRtl
        ? `هل أنت متأكد من إعادة تعيين كلمة المرور لحساب "${company.companyName}" وتوليد كلمة مرور مؤقتة؟ سيُلزم المستخدم بتغييرها فور تسجيل الدخول.`
        : `Reset password for "${company.companyName}" to a new temporary password?`,
      confirmText: isRtl ? 'تأكيد إعادة التعيين' : 'Reset Password',
      danger: true,
      action: async () => {
        try {
          const res = await adminApi.resetEmployerPassword(company._id)
          showToast(res.data?.message || 'تم إعادة تعيين كلمة المرور بنجاح!', 'success')
          fetchCompany()
        } catch (err) {
          showToast(err.response?.data?.message || 'Reset failed', 'error')
        }
      }
    })
  }

  const handleToggleBlock = () => {
    const newBlocked = !isBlocked
    setConfirmModal({
      open: true,
      title: newBlocked ? (isRtl ? 'حظر حساب الشركة' : 'Block Company') : (isRtl ? 'إلغاء حظر الشركة' : 'Unblock Company'),
      message: newBlocked
        ? (isRtl ? 'لن تتمكن الشركة من تسجيل الدخول أو البحث في قاعدة البيانات.' : 'The company will be blocked from logging in.')
        : (isRtl ? 'إعادة تفعيل وصول الشركة للنظام؟' : 'Restore company access?'),
      confirmText: newBlocked ? (isRtl ? 'حظر' : 'Block') : (isRtl ? 'إلغاء الحظر' : 'Unblock'),
      danger: newBlocked,
      action: async () => {
        try {
          await adminApi.toggleBlockCompany(company._id, newBlocked, 'Admin action')
          showToast(newBlocked ? (isRtl ? 'تم حظر الشركة' : 'Company blocked') : (isRtl ? 'تم رفع الحظر' : 'Company unblocked'), 'success')
          fetchCompany()
        } catch (err) {
          showToast(err.response?.data?.message || 'Action failed', 'error')
        }
      }
    })
  }

  return (
    <div style={{ padding: 'clamp(1.25rem, 3vw, 2rem) 0 3rem', background: 'var(--bg-page)', minHeight: '85vh' }}>
      <div className="container" style={{ maxWidth: 900 }}>
        {/* Back Link */}
        <Link
          to="/admin/companies"
          style={{
            display: 'inline-flex',
            alignItems: 'center',
            gap: '0.5rem',
            color: 'var(--slate-500)',
            fontSize: '0.875rem',
            fontWeight: 600,
            marginBottom: '1.25rem'
          }}
        >
          <ArrowLeft size={16} style={{ transform: isRtl ? 'rotate(180deg)' : 'none' }} />
          {isRtl ? 'العودة إلى قائمة الشركات' : 'Back to Companies'}
        </Link>

        {/* Header Card */}
        <div className="card card-responsive" style={{ marginBottom: '1.5rem' }}>
          <div style={{ display: 'flex', flexWrap: 'wrap', justifyContent: 'space-between', alignItems: 'flex-start', gap: '1rem' }}>
            <div style={{ display: 'flex', gap: '1.25rem', alignItems: 'center' }}>
              <div
                style={{
                  width: 64,
                  height: 64,
                  borderRadius: 'var(--radius-md)',
                  background: 'var(--primary-light)',
                  color: 'var(--primary)',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center'
                }}
              >
                <Building2 size={32} />
              </div>

              <div>
                <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem' }}>
                  <h1 style={{ fontSize: '1.5rem', fontWeight: 800, color: 'var(--slate-900)', margin: 0 }}>
                    {company.companyName}
                  </h1>
                  <StatusBadge status={company.verificationStatus} />
                </div>
                <div style={{ color: 'var(--slate-500)', fontSize: '0.9375rem', marginTop: '0.25rem' }}>
                  {company.industry || (isRtl ? 'منشأة صناعية' : 'Industrial Company')} • {company.area || (isRtl ? 'العاشر من رمضان' : '10th of Ramadan')}
                </div>
              </div>
            </div>

            {/* Quick Verification Actions */}
            <div style={{ display: 'flex', gap: '0.5rem', flexWrap: 'wrap' }}>
              {company.verificationStatus !== 'Approved' && (
                <button onClick={handleApprove} className="btn btn-emerald" style={{ fontWeight: 600 }}>
                  <CheckCircle size={16} />
                  {isRtl ? 'اعتماد الشركة' : 'Approve'}
                </button>
              )}

              {company.verificationStatus !== 'Rejected' && (
                <button onClick={handleReject} className="btn" style={{ background: 'var(--rose-light)', color: 'var(--rose)', fontWeight: 600 }}>
                  <XCircle size={16} />
                  {isRtl ? 'رفض الطلب' : 'Reject'}
                </button>
              )}

              <button
                onClick={handleToggleBlock}
                className="btn"
                style={{
                  background: isBlocked ? 'var(--emerald-light)' : 'var(--amber-light)',
                  color: isBlocked ? 'var(--emerald)' : 'var(--amber)',
                  fontWeight: 600
                }}
              >
                {isBlocked ? <ShieldCheck size={16} /> : <ShieldAlert size={16} />}
                {isBlocked ? (isRtl ? 'إلغاء الحظر' : 'Unblock') : (isRtl ? 'حظر الحساب' : 'Block')}
              </button>
            </div>
          </div>
        </div>

        {/* Company Info & Subscription Grid */}
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(min(100%, 280px), 1fr))', gap: '1.5rem' }}>
          {/* Company Details */}
          <div className="card card-responsive">
            <h2 style={{ fontSize: '1rem', fontWeight: 800, color: 'var(--slate-900)', marginBottom: '1.25rem' }}>
              {isRtl ? 'بيانات المنشأة والمسؤول' : 'Company Details'}
            </h2>

            <div style={{ display: 'flex', flexDirection: 'column', gap: '0.875rem', fontSize: '0.9375rem' }}>
              <div>
                <span style={{ color: 'var(--slate-500)', fontSize: '0.8125rem' }}>{isRtl ? 'مسؤول التوظيف / الموارد البشرية:' : 'Contact Person:'}</span>
                <div style={{ fontWeight: 700, color: 'var(--slate-800)', marginTop: '0.15rem' }}>{company.contactPerson || '—'}</div>
              </div>

              <div>
                <span style={{ color: 'var(--slate-500)', fontSize: '0.8125rem' }}>{isRtl ? 'رقم الهاتف:' : 'Phone:'}</span>
                <div style={{ marginTop: '0.15rem' }}>
                  <a href={`tel:${company.phone}`} dir="ltr" style={{ fontWeight: 700, color: 'var(--accent)' }}>
                    {company.phone}
                  </a>
                </div>
              </div>

              <div>
                <span style={{ color: 'var(--slate-500)', fontSize: '0.8125rem' }}>{isRtl ? 'البريد الإلكتروني:' : 'Email:'}</span>
                <div style={{ fontWeight: 600, color: 'var(--slate-800)', marginTop: '0.15rem' }}>
                  {company.contactEmail || company.email || '—'}
                </div>
              </div>

              <div>
                <span style={{ color: 'var(--slate-500)', fontSize: '0.8125rem' }}>{isRtl ? 'السجل التجاري / الرقم الضريبي:' : 'Commercial Reg. / Tax ID:'}</span>
                <div style={{ fontWeight: 600, color: 'var(--slate-700)', marginTop: '0.15rem' }}>
                  {company.commercialRegister || (isRtl ? 'غير مدرج' : 'Not provided')}
                </div>
              </div>

              <div>
                <span style={{ color: 'var(--slate-500)', fontSize: '0.8125rem' }}>{isRtl ? 'الموقع بالمدينة:' : 'Address in 10th of Ramadan:'}</span>
                <div style={{ fontWeight: 600, color: 'var(--slate-700)', marginTop: '0.15rem' }}>
                  {company.address || company.area || (isRtl ? 'المنطقة الصناعية' : 'Industrial Zone')}
                </div>
              </div>

              {/* WhatsApp direct button */}
              <div style={{ marginTop: '0.5rem' }}>
                <a
                  href={`https://wa.me/2${company.phone?.replace(/\D/g, '')}`}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="btn btn-emerald"
                  style={{ width: '100%', fontSize: '0.875rem' }}
                >
                  <MessageCircle size={16} />
                  {isRtl ? 'محادثة واتساب مباشرة' : 'WhatsApp Contact'}
                </a>
              </div>
            </div>
          </div>

          {/* Subscription Manager */}
          <div className="card card-responsive">
            <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', marginBottom: '1.25rem' }}>
              <CreditCard size={18} color="var(--accent)" />
              <h2 style={{ fontSize: '1rem', fontWeight: 800, color: 'var(--slate-900)', margin: 0 }}>
                {isRtl ? 'إدارة الباقة والحدود' : 'Subscription & Quota'}
              </h2>
            </div>

            <form onSubmit={handleSaveSubscription}>
              <div className="form-group">
                <label className="form-label">{isRtl ? 'نوع الباقة' : 'Plan Tier'}</label>
                <select
                  className="form-control"
                  value={subForm.plan}
                  onChange={(e) => {
                    const newPlan = e.target.value;
                    let defaultPrice = 500;
                    if (newPlan === 'Gold') defaultPrice = 1000;
                    if (newPlan === 'Platinum') defaultPrice = 2000;
                    setSubForm(prev => ({ ...prev, plan: newPlan, priceEgp: defaultPrice }));
                  }}
                >
                  <option value="Basic">{isRtl ? 'الباقة الأساسية (Basic - 500 ج.م)' : 'Basic Plan'}</option>
                  <option value="Gold">{isRtl ? 'الباقة الذهبية (Gold - 1000 ج.م)' : 'Gold Plan'}</option>
                  <option value="Platinum">{isRtl ? 'الباقة البلاتينية (Platinum - 2000 ج.م)' : 'Platinum Plan'}</option>
                </select>
              </div>

              <div className="form-group">
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '0.35rem' }}>
                  <label className="form-label" style={{ margin: 0 }}>{isRtl ? 'سعر الاشتراك الشهري (EGP)' : 'Monthly Price (EGP)'}</label>
                  <div style={{ fontSize: '0.75rem', color: 'var(--slate-500)' }}>
                    {isRtl ? 'خصم سريع:' : 'Quick Discount:'}
                    {[10, 20, 30, 50].map(pct => {
                      const base = subForm.plan === 'Platinum' ? 2000 : subForm.plan === 'Gold' ? 1000 : 500;
                      const discPrice = Math.round(base * (1 - pct / 100));
                      return (
                        <button
                          key={pct}
                          type="button"
                          onClick={() => setSubForm(prev => ({ ...prev, priceEgp: discPrice }))}
                          style={{
                            marginLeft: '0.3rem',
                            padding: '0.1rem 0.35rem',
                            fontSize: '0.7rem',
                            border: '1px solid var(--border)',
                            borderRadius: '4px',
                            background: 'var(--slate-100)',
                            cursor: 'pointer'
                          }}
                        >
                          -{pct}%
                        </button>
                      );
                    })}
                  </div>
                </div>
                <input
                  type="number"
                  className="form-control"
                  value={subForm.priceEgp}
                  onChange={(e) => setSubForm(prev => ({ ...prev, priceEgp: Number(e.target.value) }))}
                  required
                />
              </div>

              <div className="form-group" style={{ marginBottom: '1.5rem' }}>
                <label className="form-label">{isRtl ? 'حالة الحساب' : 'Account Status'}</label>
                <select
                  className="form-control"
                  value={subForm.status}
                  onChange={(e) => setSubForm(prev => ({ ...prev, status: e.target.value }))}
                >
                  <option value="active">{isRtl ? 'نشط (Active)' : 'Active'}</option>
                  <option value="on_hold">{isRtl ? 'معلق مؤقتاً (On Hold)' : 'On Hold'}</option>
                  <option value="suspended">{isRtl ? 'موقوف (Suspended)' : 'Suspended'}</option>
                  <option value="banned">{isRtl ? 'محظور (Banned)' : 'Banned'}</option>
                </select>
              </div>

              <button type="submit" disabled={savingSub} className="btn btn-primary" style={{ width: '100%', fontWeight: 700 }}>
                <Save size={16} />
                {isRtl ? (savingSub ? 'جاري الحفظ...' : 'حفظ بيانات الاشتراك') : (savingSub ? 'Updating...' : 'Save Subscription')}
              </button>
            </form>

            <div style={{ marginTop: '1.25rem', paddingTop: '1.25rem', borderTop: '1px solid var(--border)' }}>
              <button
                type="button"
                onClick={handleResetPassword}
                className="btn btn-outline-amber"
                style={{ width: '100%', fontSize: '0.84rem', fontWeight: 700 }}
              >
                <KeyRound size={16} />
                {isRtl ? 'إعادة تعيين كلمة المرور (توليد كلمة مؤقتة)' : 'Reset Password (Generate Temp)'}
              </button>
            </div>
          </div>
        </div>

        {/* Payment History & Manual Refund Section */}
        <div className="card card-responsive" style={{ marginTop: '1.5rem', padding: '1.25rem 1.5rem' }}>
          <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '1.25rem', flexWrap: 'wrap', gap: '0.5rem' }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
              <Receipt size={20} color="var(--primary)" />
              <h2 style={{ fontSize: '1.05rem', fontWeight: 800, color: 'var(--slate-900)', margin: 0 }}>
                {isRtl ? 'سجل مدفوعات واشتراكات الشركة (Paymob)' : 'Payment Transactions & Invoices'}
              </h2>
            </div>
            <span style={{ fontSize: '0.8rem', color: 'var(--slate-500)', fontWeight: 600 }}>
              {isRtl ? `إجمالي العمليات: ${orders.length}` : `Total: ${orders.length}`}
            </span>
          </div>

          {loadingOrders ? (
            <div style={{ padding: '2rem 0', textAlign: 'center' }}>
              <LoadingSpinner />
            </div>
          ) : orders.length === 0 ? (
            <div style={{ textAlign: 'center', padding: '2rem 1rem', color: 'var(--slate-400)', fontSize: '0.9rem' }}>
              {isRtl ? 'لا توجد عمليات دفع مسجلة لهذه الشركة حتى الآن.' : 'No payment transactions recorded for this company.'}
            </div>
          ) : (
            <div className="table-responsive">
              <table className="data-table">
                <thead>
                  <tr>
                    <th>{isRtl ? 'الباقة' : 'Plan'}</th>
                    <th>{isRtl ? 'المدة' : 'Duration'}</th>
                    <th>{isRtl ? 'المبلغ' : 'Amount'}</th>
                    <th>{isRtl ? 'حالة الدفع' : 'Payment Status'}</th>
                    <th>{isRtl ? 'تاريخ العملية' : 'Date'}</th>
                    <th>{isRtl ? 'الإجراءات (سوبر أدمن)' : 'Actions'}</th>
                  </tr>
                </thead>
                <tbody>
                  {orders.map(order => {
                    const isPaid = order.status === 'paid'
                    const isRefunded = order.status === 'refunded'
                    const isPending = order.status === 'pending'
                    const isFailed = order.status === 'failed'

                    return (
                      <tr key={order._id}>
                        <td>
                          <div style={{ fontWeight: 800, color: 'var(--slate-900)' }}>
                            {order.planName === 'Platinum' ? (isRtl ? 'البلاتينية' : 'Platinum') : order.planName === 'Gold' ? (isRtl ? 'الذهبية' : 'Gold') : (isRtl ? 'الأساسية' : 'Basic')}
                          </div>
                          {order.paymobTransactionId && (
                            <div style={{ fontSize: '0.72rem', color: 'var(--slate-400)', fontFamily: 'monospace' }}>
                              Tx: {order.paymobTransactionId}
                            </div>
                          )}
                        </td>
                        <td style={{ fontSize: '0.85rem' }}>
                          {order.billingMonths} {order.billingMonths === 1 ? (isRtl ? 'شهر' : 'Month') : (isRtl ? 'أشهر' : 'Months')}
                        </td>
                        <td style={{ fontWeight: 800, fontSize: '0.95rem' }}>
                          {order.amountEgp?.toLocaleString()} {isRtl ? 'ج.م' : 'EGP'}
                        </td>
                        <td>
                          {isPaid && (
                            <span style={{
                              display: 'inline-flex', alignItems: 'center', gap: '0.3rem',
                              padding: '0.2rem 0.6rem', borderRadius: 'var(--radius-full)',
                              fontSize: '0.75rem', fontWeight: 800,
                              background: '#000', color: '#fff'
                            }}>
                              <CheckCircle size={12} /> {isRtl ? 'مدفوع / مكتمل' : 'Completed'}
                            </span>
                          )}
                          {isRefunded && (
                            <span style={{
                              display: 'inline-flex', alignItems: 'center', gap: '0.3rem',
                              padding: '0.2rem 0.6rem', borderRadius: 'var(--radius-full)',
                              fontSize: '0.75rem', fontWeight: 800,
                              background: 'var(--slate-200)', color: 'var(--slate-800)'
                            }}>
                              <RotateCcw size={12} /> {isRtl ? 'مسترد (Refunded)' : 'Refunded'}
                            </span>
                          )}
                          {isPending && (
                            <span style={{
                              display: 'inline-flex', alignItems: 'center', gap: '0.3rem',
                              padding: '0.2rem 0.6rem', borderRadius: 'var(--radius-full)',
                              fontSize: '0.75rem', fontWeight: 700,
                              background: 'var(--amber-light)', color: 'var(--amber)'
                            }}>
                              {isRtl ? 'قيد الدفع' : 'Pending'}
                            </span>
                          )}
                          {isFailed && (
                            <span style={{
                              display: 'inline-flex', alignItems: 'center', gap: '0.3rem',
                              padding: '0.2rem 0.6rem', borderRadius: 'var(--radius-full)',
                              fontSize: '0.75rem', fontWeight: 700,
                              background: 'var(--rose-light)', color: 'var(--rose)'
                            }}>
                              {isRtl ? 'فشل' : 'Failed'}
                            </span>
                          )}
                        </td>
                        <td style={{ fontSize: '0.8rem', color: 'var(--slate-500)' }}>
                          <div>{new Date(order.createdAt).toLocaleDateString(isRtl ? 'ar-EG' : 'en-US')}</div>
                          {order.refundedAt && (
                            <div style={{ fontSize: '0.72rem', color: 'var(--slate-400)' }}>
                              {isRtl ? `استرداد: ${new Date(order.refundedAt).toLocaleDateString('ar-EG')}` : `Refunded: ${new Date(order.refundedAt).toLocaleDateString('en-US')}`}
                            </div>
                          )}
                        </td>
                        <td>
                          {isPaid && (
                            <button
                              type="button"
                              disabled={processingOrder === order._id}
                              onClick={() => handleUpdateOrderStatus(order._id, 'refunded')}
                              className="btn btn-outline"
                              style={{
                                padding: '0.3rem 0.65rem',
                                fontSize: '0.78rem',
                                fontWeight: 700,
                                color: 'var(--rose)',
                                borderColor: 'var(--rose-light)',
                                display: 'inline-flex',
                                alignItems: 'center',
                                gap: '0.35rem'
                              }}
                            >
                              <RotateCcw size={13} />
                              {isRtl ? 'تحويل إلى مسترد' : 'Mark as Refunded'}
                            </button>
                          )}
                          {isRefunded && (
                            <button
                              type="button"
                              disabled={processingOrder === order._id}
                              onClick={() => handleUpdateOrderStatus(order._id, 'paid')}
                              className="btn btn-outline"
                              style={{
                                padding: '0.3rem 0.65rem',
                                fontSize: '0.78rem',
                                fontWeight: 700,
                                color: '#000',
                                borderColor: 'var(--border)',
                                display: 'inline-flex',
                                alignItems: 'center',
                                gap: '0.35rem'
                              }}
                            >
                              {isRtl ? 'إعادة كـ مدفوع' : 'Restore to Paid'}
                            </button>
                          )}
                          {(isPending || isFailed) && (
                            <span style={{ fontSize: '0.75rem', color: 'var(--slate-400)' }}>—</span>
                          )}
                        </td>
                      </tr>
                    )
                  })}
                </tbody>
              </table>
            </div>
          )}
        </div>
      </div>

      <ConfirmModal
        isOpen={confirmModal.open}
        title={confirmModal.title}
        message={confirmModal.message}
        confirmText={confirmModal.confirmText}
        isDanger={confirmModal.danger}
        onConfirm={confirmModal.action}
        onClose={() => setConfirmModal(prev => ({ ...prev, open: false }))}
      />
    </div>
  )
}
