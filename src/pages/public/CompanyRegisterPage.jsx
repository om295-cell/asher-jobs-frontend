import React, { useState } from 'react'
import { Link, useNavigate } from 'react-router-dom'
import { Building2 } from 'lucide-react'
import { useAuth } from '../../context/AuthContext'
import { useToast } from '../../context/ToastContext'
import { useLanguage } from '../../context/LanguageContext'

const GOVERNORATES = ['الشرقية', 'القاهرة', 'الجيزة', 'الإسكندرية', 'الغربية', 'المنوفية', 'القليوبية', 'الدقهلية', 'كفر الشيخ', 'البحيرة', 'أسيوط', 'سوهاج', 'المنيا', 'بني سويف']
const INDUSTRIES = ['تصنيع وهندسة صناعية', 'نسيج وملابس', 'غذاء ومشروبات', 'كيماويات وبلاستيك', 'مواد بناء', 'تعبئة وتغليف', 'لوجستيات وتوزيع', 'خدمات ومقاولات', 'تكنولوجيا ومعلومات', 'رعاية صحية', 'أخرى']

export default function CompanyRegisterPage() {
  const { registerCompany } = useAuth()
  const { showToast } = useToast()
  const { t, isRtl } = useLanguage()
  const navigate = useNavigate()

  const [form, setForm] = useState({
    companyName: '',
    email: '',
    phone: '',
    password: '',
    passwordConfirm: '',
    address: '',
    governorate: 'الشرقية',
    area: 'العاشر من رمضان',
    industry: 'تصنيع وهندسة صناعية',
    website: '',
    contactPerson: '',
    contactPersonPhone: ''
  })
  const [loading, setLoading] = useState(false)

  const handleChange = (e) => setForm(prev => ({ ...prev, [e.target.name]: e.target.value }))

  const handleSubmit = async (e) => {
    e.preventDefault()
    if (form.password !== form.passwordConfirm) {
      showToast('كلمتا المرور غير متطابقتين', 'warning')
      return
    }
    try {
      setLoading(true)
      const data = await registerCompany(form)
      showToast('تم إنشاء حساب شركتك بنجاح. في انتظار موافقة الإدارة.', 'success')
      navigate('/company/pending')
    } catch (err) {
      showToast(err.response?.data?.message || err.message || 'حدث خطأ أثناء التسجيل', 'error')
    } finally {
      setLoading(false)
    }
  }

  return (
    <div style={{ minHeight: '80vh', padding: '3rem 1rem', background: 'var(--bg-page)' }}>
      <div style={{ maxWidth: 640, margin: '0 auto' }}>
        <div style={{ textAlign: 'center', marginBottom: '2rem' }}>
          <div style={{ width: 56, height: 56, borderRadius: '14px', background: 'var(--emerald)', color: '#fff', display: 'flex', alignItems: 'center', justifyContent: 'center', margin: '0 auto 1rem' }}>
            <Building2 size={26} />
          </div>
          <h1 style={{ fontSize: '1.75rem', fontWeight: 800, color: 'var(--slate-900)', marginBottom: '0.375rem' }}>
            {isRtl ? 'تسجيل شركة أو مصنع' : 'Employer / Factory Registration'}
          </h1>
          <p style={{ color: 'var(--slate-500)', fontSize: '0.9375rem' }}>
            {isRtl ? 'سيتم مراجعة بيانات شركتك قبل منح الوصول لقاعدة بيانات المرشحين' : 'Company details will be reviewed before granting candidate database access'}
          </p>
          <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: '0.5rem', marginTop: '0.75rem' }}>
            <div style={{
              display: 'inline-flex', alignItems: 'center', gap: '0.5rem',
              background: '#ecfdf5', border: '1px solid #10b981', color: '#065f46',
              padding: '0.45rem 1.1rem', borderRadius: '9999px', fontSize: '0.9rem', fontWeight: 800
            }}>
              <span>💰 {isRtl ? 'اشتراك رمزي: 50 ج.م شهرياً فقط (بدلاً من 1100 ج.م)' : 'Nominal Subscription: Only 50 EGP / month (instead of 1100 EGP)'}</span>
            </div>
            <div style={{ display: 'inline-flex', alignItems: 'center', gap: '0.5rem', background: 'var(--amber-light)', color: 'var(--amber)', padding: '0.35rem 0.875rem', borderRadius: '9999px', fontSize: '0.8125rem', fontWeight: 600 }}>
              ⏳ {isRtl ? 'يتطلب موافقة إدارية قبل الوصول للمرشحين' : 'Requires admin approval before candidate access'}
            </div>
          </div>
        </div>

        <div className="card card-responsive">
          <form onSubmit={handleSubmit}>
            <h3 style={{ fontSize: '1rem', fontWeight: 700, color: 'var(--slate-700)', marginBottom: '1.25rem', borderBottom: '1px solid var(--border)', paddingBottom: '0.5rem' }}>
              {isRtl ? '١. بيانات الشركة' : '1. Company Details'}
            </h3>

            <div className="form-group">
              <label className="form-label">{isRtl ? 'اسم الشركة أو المصنع' : 'Company / Factory Name'} *</label>
              <input type="text" name="companyName" className="form-control" placeholder={isRtl ? 'الاسم التجاري الرسمي' : 'Official trading name'} value={form.companyName} onChange={handleChange} required />
            </div>

            <div className="grid-2">
              <div className="form-group">
                <label className="form-label">{t('email')} *</label>
                <input type="email" name="email" className="form-control" placeholder="company@example.com" value={form.email} onChange={handleChange} required dir="ltr" />
              </div>
              <div className="form-group">
                <label className="form-label">{t('phone')} *</label>
                <input type="tel" name="phone" className="form-control" placeholder="01XXXXXXXXX" value={form.phone} onChange={handleChange} required dir="ltr" />
              </div>
            </div>

            <div className="grid-2">
              <div className="form-group">
                <label className="form-label">{isRtl ? 'قطاع النشاط الصناعي' : 'Industry Sector'}</label>
                <select name="industry" className="form-control" value={form.industry} onChange={handleChange}>
                  {INDUSTRIES.map(i => <option key={i} value={i}>{i}</option>)}
                </select>
              </div>
              <div className="form-group">
                <label className="form-label">{isRtl ? 'الموقع الإلكتروني' : 'Website'} ({isRtl ? 'اختياري' : 'Optional'})</label>
                <input type="url" name="website" className="form-control" placeholder="https://company.com" value={form.website} onChange={handleChange} dir="ltr" />
              </div>
            </div>

            <h3 style={{ fontSize: '1rem', fontWeight: 700, color: 'var(--slate-700)', margin: '1.5rem 0 1.25rem', borderBottom: '1px solid var(--border)', paddingBottom: '0.5rem' }}>
              {isRtl ? '٢. العنوان' : '2. Address'}
            </h3>

            <div className="grid-2">
              <div className="form-group">
                <label className="form-label">{t('governorate')}</label>
                <select name="governorate" className="form-control" value={form.governorate} onChange={handleChange}>
                  {GOVERNORATES.map(g => <option key={g} value={g}>{g}</option>)}
                </select>
              </div>
              <div className="form-group">
                <label className="form-label">{isRtl ? 'المنطقة الصناعية / المدينة' : 'Industrial Zone / City'}</label>
                <input type="text" name="area" className="form-control" placeholder={isRtl ? 'العاشر من رمضان' : '10th of Ramadan'} value={form.area} onChange={handleChange} />
              </div>
            </div>

            <div className="form-group">
              <label className="form-label">{isRtl ? 'العنوان التفصيلي' : 'Detailed Address'} ({isRtl ? 'اختياري' : 'Optional'})</label>
              <input type="text" name="address" className="form-control" placeholder={isRtl ? 'المنطقة الصناعية أ، رقم القطعة...' : 'Industrial Zone A, Block No...'} value={form.address} onChange={handleChange} />
            </div>

            <h3 style={{ fontSize: '1rem', fontWeight: 700, color: 'var(--slate-700)', margin: '1.5rem 0 1.25rem', borderBottom: '1px solid var(--border)', paddingBottom: '0.5rem' }}>
              {isRtl ? '٣. المسؤول عن التواصل' : '3. Contact Person'} ({isRtl ? 'اختياري' : 'Optional'})
            </h3>

            <div className="grid-2">
              <div className="form-group">
                <label className="form-label">{isRtl ? 'اسم الشخص المسؤول' : 'Contact Person Name'}</label>
                <input type="text" name="contactPerson" className="form-control" placeholder={isRtl ? 'م. أحمد محمد' : 'Eng. Ahmed Mohamed'} value={form.contactPerson} onChange={handleChange} />
              </div>
              <div className="form-group">
                <label className="form-label">{isRtl ? 'هاتف المسؤول' : 'Contact Person Phone'}</label>
                <input type="tel" name="contactPersonPhone" className="form-control" placeholder="01XXXXXXXXX" value={form.contactPersonPhone} onChange={handleChange} dir="ltr" />
              </div>
            </div>

            <h3 style={{ fontSize: '1rem', fontWeight: 700, color: 'var(--slate-700)', margin: '1.5rem 0 1.25rem', borderBottom: '1px solid var(--border)', paddingBottom: '0.5rem' }}>
              {isRtl ? '٤. كلمة المرور' : '4. Account Password'}
            </h3>

            <div className="grid-2">
              <div className="form-group">
                <label className="form-label">{t('password')} *</label>
                <input type="password" name="password" className="form-control" placeholder="6 أحرف على الأقل" value={form.password} onChange={handleChange} required minLength={6} dir="ltr" />
              </div>
              <div className="form-group">
                <label className="form-label">{t('passwordConfirm')} *</label>
                <input type="password" name="passwordConfirm" className="form-control" value={form.passwordConfirm} onChange={handleChange} required dir="ltr" />
              </div>
            </div>

            <button type="submit" className="btn btn-emerald" disabled={loading} style={{ width: '100%', padding: '0.9375rem', fontSize: '1.0625rem', fontWeight: 700 }}>
              {loading
                ? (isRtl ? 'جاري إنشاء الحساب...' : 'Creating account...')
                : (isRtl ? 'إرسال طلب التسجيل (50 ج.م شهرياً)' : 'Submit Registration (50 EGP/mo)')}
            </button>
          </form>

          <p style={{ textAlign: 'center', marginTop: '1.25rem', color: 'var(--slate-600)', fontSize: '0.9375rem' }}>
            {t('haveAccount')}{' '}
            <Link to="/login" style={{ color: 'var(--accent)', fontWeight: 700 }}>{t('loginNow')}</Link>
          </p>
        </div>
      </div>
    </div>
  )
}
