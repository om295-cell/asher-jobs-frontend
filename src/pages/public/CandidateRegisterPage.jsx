import React, { useState, useEffect } from 'react'
import { Link, useNavigate, useSearchParams } from 'react-router-dom'
import { UserPlus, CheckCircle } from 'lucide-react'
import { useAuth } from '../../context/AuthContext'
import { useToast } from '../../context/ToastContext'
import { useLanguage } from '../../context/LanguageContext'
import { jobsApi } from '../../api/jobs.api'

const GOVERNORATES = ['الشرقية', 'القاهرة', 'الجيزة', 'الإسكندرية', 'الغربية', 'المنوفية', 'القليوبية', 'الدقهلية', 'كفر الشيخ', 'البحيرة', 'أسيوط', 'سوهاج', 'المنيا', 'بني سويف', 'الفيوم', 'قنا', 'الأقصر', 'أسوان', 'دمياط', 'بور سعيد', 'الإسماعيلية', 'السويس']
const QUALIFICATIONS = ['دبلوم فني صناعي (وسط صناعي)', 'معهد تقني متوسط', 'مؤهل عالي (بكالوريوس)', 'دراسات عليا (ماجستير/دكتوراه)', 'ثانوية عامة', 'دون ثانوية']

export default function CandidateRegisterPage() {
  const { registerCandidate } = useAuth()
  const { showToast } = useToast()
  const { t, isRtl } = useLanguage()
  const navigate = useNavigate()
  const [searchParams] = useSearchParams()

  const [jobs, setJobs] = useState([])
  const [categories, setCategories] = useState([])
  const [selectedCategory, setSelectedCategory] = useState('')
  const [filteredJobs, setFilteredJobs] = useState([])
  const [loading, setLoading] = useState(false)
  const [step, setStep] = useState(1)

  const [form, setForm] = useState({
    fullName: '',
    phone: '',
    email: '',
    desiredJobId: '',
    governorate: 'الشرقية',
    area: 'العاشر من رمضان',
    yearsOfExperience: '0',
    qualification: 'دبلوم فني صناعي (وسط صناعي)',
    skills: '',
    password: '',
    passwordConfirm: '',
    consentGiven: false,
    refCode: searchParams.get('ref') || ''
  })

  useEffect(() => {
    jobsApi.getCategories().then(res => {
      if (res.data?.success) setCategories(res.data.data)
    }).catch(() => {})
    jobsApi.getJobs().then(res => {
      if (res.data?.success) setJobs(res.data.data)
    }).catch(() => {})
  }, [])

  useEffect(() => {
    if (selectedCategory) {
      setFilteredJobs(jobs.filter(j => String(j.categoryId?._id || j.categoryId) === selectedCategory))
    } else {
      setFilteredJobs(jobs)
    }
  }, [selectedCategory, jobs])

  const handleChange = (e) => {
    const { name, value, type, checked } = e.target
    setForm(prev => ({ ...prev, [name]: type === 'checkbox' ? checked : value }))
  }

  const handleSubmit = async (e) => {
    e.preventDefault()
    if (!form.consentGiven) {
      showToast('يجب الموافقة على شروط استخدام البيانات لإتمام التسجيل', 'warning')
      return
    }
    if (form.password !== form.passwordConfirm) {
      showToast('كلمتا المرور غير متطابقتين', 'warning')
      return
    }
    if (!form.desiredJobId) {
      showToast('يرجى اختيار المهنة المطلوبة من القائمة', 'warning')
      return
    }
    try {
      setLoading(true)
      await registerCandidate({
        ...form,
        yearsOfExperience: Number(form.yearsOfExperience)
      })
      showToast('تم التسجيل بنجاح! مرحباً بك في عاشر جوبز', 'success')
      navigate('/candidate/dashboard')
    } catch (err) {
      showToast(err.response?.data?.message || err.message || 'حدث خطأ أثناء التسجيل', 'error')
    } finally {
      setLoading(false)
    }
  }

  return (
    <div style={{ minHeight: '80vh', padding: '3rem 1rem', background: 'var(--bg-page)' }}>
      <div style={{ maxWidth: 600, margin: '0 auto' }}>
        <div style={{ textAlign: 'center', marginBottom: '2rem' }}>
          <div style={{ width: 56, height: 56, borderRadius: '14px', background: 'var(--accent)', color: '#fff', display: 'flex', alignItems: 'center', justifyContent: 'center', margin: '0 auto 1rem' }}>
            <UserPlus size={26} />
          </div>
          <h1 style={{ fontSize: '1.75rem', fontWeight: 800, color: 'var(--slate-900)', marginBottom: '0.375rem' }}>
            {isRtl ? 'تسجيل باحث عن عمل' : 'Job Seeker Registration'}
          </h1>
          <p style={{ color: 'var(--slate-500)', fontSize: '0.9375rem' }}>
            {isRtl ? 'سجّل بياناتك مرة واحدة وابق متاحاً لكل مصانع وشركات العاشر من رمضان' : 'Register once and stay visible to all employers in 10th of Ramadan'}
          </p>
        </div>

        <div className="card" style={{ padding: '2.5rem' }}>
          <form onSubmit={handleSubmit}>
            {/* Personal Info */}
            <h3 style={{ fontSize: '1rem', fontWeight: 700, color: 'var(--slate-700)', marginBottom: '1.25rem', borderBottom: '1px solid var(--border)', paddingBottom: '0.5rem' }}>
              {isRtl ? '١. البيانات الشخصية' : '1. Personal Information'}
            </h3>

            <div className="form-group">
              <label className="form-label">{t('fullName')} *</label>
              <input type="text" name="fullName" className="form-control" placeholder={isRtl ? 'الاسم ثلاثي أو رباعي كاملاً' : 'Full name'} value={form.fullName} onChange={handleChange} required />
            </div>

            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1rem' }}>
              <div className="form-group">
                <label className="form-label">{t('phone')} *</label>
                <input type="tel" name="phone" className="form-control" placeholder="01XXXXXXXXX" value={form.phone} onChange={handleChange} required dir="ltr" />
              </div>
              <div className="form-group">
                <label className="form-label">{t('email')} ({isRtl ? 'اختياري' : 'Optional'})</label>
                <input type="email" name="email" className="form-control" placeholder="email@example.com" value={form.email} onChange={handleChange} dir="ltr" />
              </div>
            </div>

            {/* Job Selection */}
            <h3 style={{ fontSize: '1rem', fontWeight: 700, color: 'var(--slate-700)', margin: '1.5rem 0 1.25rem', borderBottom: '1px solid var(--border)', paddingBottom: '0.5rem' }}>
              {isRtl ? '٢. المهنة والخبرة' : '2. Job Title & Experience'}
            </h3>

            <div className="form-group">
              <label className="form-label">{isRtl ? 'القسم / التخصص' : 'Job Category'} ({isRtl ? 'اختياري للتصفية' : 'Optional filter'})</label>
              <select className="form-control" value={selectedCategory} onChange={e => setSelectedCategory(e.target.value)}>
                <option value="">{isRtl ? '-- كل التخصصات --' : '-- All Categories --'}</option>
                {categories.map(cat => (
                  <option key={cat._id} value={cat._id}>{isRtl ? cat.nameAr : cat.name}</option>
                ))}
              </select>
            </div>

            <div className="form-group">
              <label className="form-label">{t('desiredJob')} *</label>
              <select name="desiredJobId" className="form-control" value={form.desiredJobId} onChange={handleChange} required>
                <option value="">{t('selectJobPlaceholder')}</option>
                {filteredJobs.map(job => (
                  <option key={job._id} value={job._id}>{isRtl ? job.nameAr : job.name}</option>
                ))}
              </select>
              <p style={{ fontSize: '0.75rem', color: 'var(--slate-500)', marginTop: '0.375rem' }}>
                {isRtl ? '⚠ اختر من القائمة فقط — لا تكتب اسماً بحرية لضمان دقة نتائج البحث' : '⚠ Select from list only — free-text titles break search accuracy'}
              </p>
            </div>

            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1rem' }}>
              <div className="form-group">
                <label className="form-label">{t('yearsOfExp')}</label>
                <input type="number" name="yearsOfExperience" className="form-control" min="0" max="50" value={form.yearsOfExperience} onChange={handleChange} />
              </div>
              <div className="form-group">
                <label className="form-label">{t('qualification')}</label>
                <select name="qualification" className="form-control" value={form.qualification} onChange={handleChange}>
                  {QUALIFICATIONS.map(q => <option key={q} value={q}>{q}</option>)}
                </select>
              </div>
            </div>

            <div className="form-group">
              <label className="form-label">{t('skills')} ({isRtl ? 'اختياري — افصل بفاصلة' : 'Optional — comma separated'})</label>
              <input type="text" name="skills" className="form-control" placeholder={isRtl ? 'مثال: أتمتة صناعية، صيانة PLC، لحام' : 'e.g. PLC Programming, Welding, Quality Inspection'} value={form.skills} onChange={handleChange} />
            </div>

            {/* Location */}
            <h3 style={{ fontSize: '1rem', fontWeight: 700, color: 'var(--slate-700)', margin: '1.5rem 0 1.25rem', borderBottom: '1px solid var(--border)', paddingBottom: '0.5rem' }}>
              {isRtl ? '٣. موقع الإقامة' : '3. Location'}
            </h3>

            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1rem' }}>
              <div className="form-group">
                <label className="form-label">{t('governorate')}</label>
                <select name="governorate" className="form-control" value={form.governorate} onChange={handleChange}>
                  {GOVERNORATES.map(g => <option key={g} value={g}>{g}</option>)}
                </select>
              </div>
              <div className="form-group">
                <label className="form-label">{t('area')}</label>
                <input type="text" name="area" className="form-control" placeholder={isRtl ? 'العاشر من رمضان' : '10th of Ramadan'} value={form.area} onChange={handleChange} />
              </div>
            </div>

            {/* Password & Consent */}
            <h3 style={{ fontSize: '1rem', fontWeight: 700, color: 'var(--slate-700)', margin: '1.5rem 0 1.25rem', borderBottom: '1px solid var(--border)', paddingBottom: '0.5rem' }}>
              {isRtl ? '٤. كلمة المرور والموافقة' : '4. Password & Consent'}
            </h3>

            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1rem' }}>
              <div className="form-group">
                <label className="form-label">{t('password')} *</label>
                <input type="password" name="password" className="form-control" placeholder="6 أحرف على الأقل" value={form.password} onChange={handleChange} required minLength={6} dir="ltr" />
              </div>
              <div className="form-group">
                <label className="form-label">{t('passwordConfirm')} *</label>
                <input type="password" name="passwordConfirm" className="form-control" placeholder="أعد كتابة كلمة المرور" value={form.passwordConfirm} onChange={handleChange} required dir="ltr" />
              </div>
            </div>

            {form.refCode && (
              <div className="form-group">
                <label className="form-label">{t('referralCodeOptional')}</label>
                <input type="text" name="refCode" className="form-control" value={form.refCode} onChange={handleChange} dir="ltr" readOnly style={{ background: 'var(--slate-50)', color: 'var(--emerald)' }} />
              </div>
            )}

            <div style={{ background: 'var(--slate-50)', border: '1px solid var(--border)', borderRadius: 'var(--radius-md)', padding: '1.25rem', marginBottom: '1.25rem' }}>
              <label style={{ display: 'flex', gap: '0.875rem', cursor: 'pointer', alignItems: 'flex-start' }}>
                <input type="checkbox" name="consentGiven" checked={form.consentGiven} onChange={handleChange}
                  style={{ width: 20, height: 20, marginTop: '0.15rem', flexShrink: 0, cursor: 'pointer' }} />
                <span style={{ fontSize: '0.9375rem', color: 'var(--slate-700)', lineHeight: 1.6 }}>
                  {isRtl
                    ? 'أوافق على استخدام بياناتي الشخصية للأغراض التوظيفية والتواصل معي من قِبل الشركات المعتمدة لدى منصة عاشر جوبز وفقاً لسياسة الخصوصية المعمول بها.'
                    : 'I agree that Asher Jobs may use my personal information for recruitment purposes and share it with approved employers according to the platform privacy policy.'}
                  <strong style={{ color: 'var(--rose)' }}> *</strong>
                </span>
              </label>
            </div>

            <button type="submit" className="btn btn-accent" disabled={loading} style={{ width: '100%', padding: '0.9375rem', fontSize: '1.0625rem' }}>
              {loading
                ? (isRtl ? 'جاري إنشاء الحساب...' : 'Creating account...')
                : (isRtl ? 'إنشاء حسابي وتسجيل بياناتي' : 'Create My Account')}
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
