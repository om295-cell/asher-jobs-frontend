import React, { useEffect, useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { useLanguage } from '../../context/LanguageContext'
import { useToast } from '../../context/ToastContext'
import { candidateApi } from '../../api/candidate.api'
import { jobsApi } from '../../api/jobs.api'
import { Save } from 'lucide-react'
import LoadingSpinner from '../../components/ui/LoadingSpinner'

const GOVERNORATES = ['الشرقية', 'القاهرة', 'الجيزة', 'الإسكندرية', 'الغربية', 'المنوفية', 'القليوبية', 'الدقهلية', 'كفر الشيخ', 'البحيرة', 'أسيوط', 'سوهاج', 'المنيا', 'بني سويف', 'الفيوم', 'قنا', 'الأقصر', 'أسوان', 'دمياط', 'بور سعيد', 'الإسماعيلية', 'السويس']
const QUALIFICATIONS = ['دبلوم فني صناعي (وسط صناعي)', 'معهد تقني متوسط', 'مؤهل عالي (بكالوريوس)', 'دراسات عليا (ماجستير/دكتوراه)', 'ثانوية عامة', 'دون ثانوية']

export default function CandidateEditProfile() {
  const { isRtl } = useLanguage()
  const { showToast } = useToast()
  const navigate = useNavigate()
  const [jobs, setJobs] = useState([])
  const [loading, setLoading] = useState(true)
  const [saving, setSaving] = useState(false)

  const [form, setForm] = useState({
    fullName: '',
    desiredJobId: '',
    yearsOfExperience: 0,
    qualification: QUALIFICATIONS[0],
    governorate: 'الشرقية',
    area: 'العاشر من رمضان',
    skills: '',
    notes: '',
    isOpenToWork: true
  })

  useEffect(() => {
    Promise.all([candidateApi.getMyProfile(), jobsApi.getJobs()]).then(([profileRes, jobsRes]) => {
      const p = profileRes.data?.data
      if (p) {
        setForm({
          fullName: p.fullName || '',
          desiredJobId: p.desiredJob?._id || '',
          yearsOfExperience: p.yearsOfExperience ?? 0,
          qualification: p.qualification || QUALIFICATIONS[0],
          governorate: p.governorate || 'الشرقية',
          area: p.area || 'العاشر من رمضان',
          skills: (p.skills || []).join(', '),
          notes: p.notes || '',
          isOpenToWork: p.isOpenToWork !== false
        })
      }
      if (jobsRes.data?.success) setJobs(jobsRes.data.data)
    }).catch(() => {}).finally(() => setLoading(false))
  }, [])

  const handleChange = (e) => {
    const { name, value, type, checked } = e.target
    setForm(prev => ({ ...prev, [name]: type === 'checkbox' ? checked : value }))
  }

  const handleSubmit = async (e) => {
    e.preventDefault()
    if (!form.desiredJobId) {
      showToast(isRtl ? 'يرجى اختيار المهنة من القائمة' : 'Please select a job title from the list', 'warning')
      return
    }
    try {
      setSaving(true)
      const payload = {
        ...form,
        skills: form.skills.split(',').map(s => s.trim()).filter(Boolean),
        yearsOfExperience: Number(form.yearsOfExperience)
      }
      await candidateApi.updateMyProfile(payload)
      showToast(isRtl ? 'تم حفظ الملف بنجاح' : 'Profile updated successfully', 'success')
      navigate('/candidate/profile')
    } catch (err) {
      showToast(err.response?.data?.message || (isRtl ? 'خطأ في حفظ البيانات' : 'Error saving profile'), 'error')
    } finally {
      setSaving(false)
    }
  }

  if (loading) return <LoadingSpinner />

  return (
    <div style={{ padding: '2rem 0', background: 'var(--bg-page)', minHeight: '80vh' }}>
      <div className="container" style={{ maxWidth: 640 }}>
        <h1 style={{ fontSize: '1.5rem', fontWeight: 800, color: 'var(--slate-900)', marginBottom: '2rem' }}>
          {isRtl ? 'تعديل الملف المهني' : 'Edit Professional Profile'}
        </h1>

        <div className="card card-responsive">
          <form onSubmit={handleSubmit}>
            <div className="form-group">
              <label className="form-label">{isRtl ? 'الاسم الكامل' : 'Full Name'} *</label>
              <input type="text" name="fullName" className="form-control" value={form.fullName} onChange={handleChange} required />
            </div>

            <div className="form-group">
              <label className="form-label">{isRtl ? 'المهنة المطلوبة' : 'Desired Job Title'} *</label>
              <select name="desiredJobId" className="form-control" value={form.desiredJobId} onChange={handleChange} required>
                <option value="">{isRtl ? '-- اختر من القائمة --' : '-- Select from list --'}</option>
                {jobs.map(job => (
                  <option key={job._id} value={job._id}>{isRtl ? job.nameAr : job.name}</option>
                ))}
              </select>
            </div>

            <div className="grid-2">
              <div className="form-group">
                <label className="form-label">{isRtl ? 'سنوات الخبرة' : 'Years of Experience'}</label>
                <input type="number" name="yearsOfExperience" className="form-control" min="0" max="50" value={form.yearsOfExperience} onChange={handleChange} />
              </div>
              <div className="form-group">
                <label className="form-label">{isRtl ? 'المؤهل الدراسي' : 'Qualification'}</label>
                <select name="qualification" className="form-control" value={form.qualification} onChange={handleChange}>
                  {QUALIFICATIONS.map(q => <option key={q} value={q}>{q}</option>)}
                </select>
              </div>
            </div>

            <div className="grid-2">
              <div className="form-group">
                <label className="form-label">{isRtl ? 'المحافظة' : 'Governorate'}</label>
                <select name="governorate" className="form-control" value={form.governorate} onChange={handleChange}>
                  {GOVERNORATES.map(g => <option key={g} value={g}>{g}</option>)}
                </select>
              </div>
              <div className="form-group">
                <label className="form-label">{isRtl ? 'المنطقة / المدينة' : 'Area / City'}</label>
                <input type="text" name="area" className="form-control" value={form.area} onChange={handleChange} />
              </div>
            </div>

            <div className="form-group">
              <label className="form-label">{isRtl ? 'المهارات (افصل بفاصلة)' : 'Skills (comma separated)'}</label>
              <input type="text" name="skills" className="form-control" value={form.skills} onChange={handleChange} placeholder={isRtl ? 'مثال: صيانة PLC، لحام، أتمتة' : 'e.g. PLC Maintenance, Welding, Automation'} />
            </div>

            <div className="form-group">
              <label className="form-label">{isRtl ? 'ملاحظات إضافية (اختياري)' : 'Additional Notes (Optional)'}</label>
              <textarea name="notes" className="form-control" rows={3} value={form.notes} onChange={handleChange} placeholder={isRtl ? 'معلومات إضافية تريد إضافتها لملفك...' : 'Any additional info you want to include...'} />
            </div>

            <label style={{ display: 'flex', gap: '0.75rem', alignItems: 'center', cursor: 'pointer', marginBottom: '1.5rem', padding: '0.875rem', background: 'var(--slate-50)', borderRadius: 'var(--radius-md)', border: '1px solid var(--border)' }}>
              <input type="checkbox" name="isOpenToWork" checked={form.isOpenToWork} onChange={handleChange} style={{ width: 18, height: 18, cursor: 'pointer' }} />
              <div>
                <div style={{ fontWeight: 700, fontSize: '0.9375rem', color: 'var(--slate-800)' }}>{isRtl ? 'أنا متاح لعروض العمل' : 'I am open to job offers'}</div>
                <div style={{ fontSize: '0.8125rem', color: 'var(--slate-500)' }}>{isRtl ? 'إذا أُلغي الاختيار لن تظهر في نتائج البحث' : 'Unchecking will hide you from company searches'}</div>
              </div>
            </label>

            <button type="submit" className="btn btn-accent" disabled={saving} style={{ width: '100%', padding: '0.875rem', display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '0.5rem' }}>
              <Save size={18} />
              {saving ? (isRtl ? 'جاري الحفظ...' : 'Saving...') : (isRtl ? 'حفظ التغييرات' : 'Save Changes')}
            </button>
          </form>
        </div>
      </div>
    </div>
  )
}
