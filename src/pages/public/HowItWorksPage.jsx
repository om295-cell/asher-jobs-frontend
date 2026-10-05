import React from 'react'
import { useLanguage } from '../../context/LanguageContext'
import { Users, Building2, ShieldCheck, Search, FileText, Phone } from 'lucide-react'

export default function HowItWorksPage() {
  const { isRtl } = useLanguage()
  const steps = isRtl ? [
    { icon: Users, title: 'سجّل بياناتك كباحث عن عمل', desc: 'أنشئ ملفك المهني مرة واحدة. أدخل اسمك، رقم هاتفك، اختر مهنتك من القائمة الموحّدة وأضف سنوات خبرتك.' },
    { icon: ShieldCheck, title: 'انتظر أن يتواصل معك أصحاب العمل', desc: 'بعد التسجيل، تصبح بياناتك مرئية للشركات المعتمدة الباحثة عن موظفين في مهنتك وموقعك.' },
    { icon: Building2, title: 'للشركات: سجّل باشتراك 50 ج.م شهرياً', desc: 'تقدّم بطلب تسجيل شركتك باشتراك رمزي 50 ج.م شهرياً فقط (بدلاً من 1100 ج.م). بعد مراجعة بيانات الشركة وموافقة الإدارة، تحصل على وصول كامل لقاعدة البيانات.' },
    { icon: Search, title: 'ابحث بدقة في قاعدة البيانات', desc: 'صفّح قاعدة المرشحين وابحث بالمهنة، المحافظة، سنوات الخبرة، والمؤهل الدراسي. صفحة متعددة المرشحين.' },
    { icon: Phone, title: 'تواصل مباشرة بالهاتف أو الواتساب', desc: 'عند العثور على مرشح مناسب، احصل على رقم هاتفه وتواصل معه مباشرة. بدون وسيط.' },
    { icon: FileText, title: 'صدّر النتائج أو اطلب دفعات من المرشحين', desc: 'صدّر قائمة المرشحين لملف Excel. أو أرسل طلباً مفتوحاً لعدد محدد من العمال في مهنة بعينها.' },
  ] : [
    { icon: Users, title: 'Register as Job Seeker', desc: 'Create your profile once. Enter your name, phone, choose your job title from the standardized list, and add years of experience.' },
    { icon: ShieldCheck, title: 'Wait for Employers to Contact You', desc: 'After registration, your data becomes visible to approved companies searching for candidates in your job title and location.' },
    { icon: Building2, title: 'For Companies: Register (50 EGP/mo)', desc: 'Submit your company registration for only 50 EGP/month (instead of 1100 EGP). After admin review and approval, you get full access to the candidate database.' },
    { icon: Search, title: 'Search the Database Precisely', desc: 'Browse the candidate database and filter by job title, governorate, years of experience, and qualification.' },
    { icon: Phone, title: 'Contact Directly via Phone or WhatsApp', desc: 'When you find a suitable candidate, get their phone number and contact them directly. No intermediaries.' },
    { icon: FileText, title: 'Export Results or Request Batches', desc: 'Export candidate lists to Excel, or submit an open request for a specific number of workers in a given job title.' },
  ]

  return (
    <div style={{ padding: '4rem 0', background: 'var(--bg-page)' }}>
      <div className="container" style={{ maxWidth: 760 }}>
        <div style={{ textAlign: 'center', marginBottom: '3rem' }}>
          <h1 style={{ fontSize: '2.25rem', fontWeight: 800, color: 'var(--slate-900)', marginBottom: '1rem' }}>
            {isRtl ? 'كيف تعمل منصة عاشر جوبز؟' : 'How Does Asher Jobs Work?'}
          </h1>
          <p style={{ fontSize: '1.0625rem', color: 'var(--slate-500)', maxWidth: 520, margin: '0 auto' }}>
            {isRtl ? 'دليل خطوة بخطوة لكل من باحثي العمل والشركات والمصانع.' : 'A step-by-step guide for both job seekers and employers.'}
          </p>
        </div>
        <div style={{ display: 'flex', flexDirection: 'column', gap: '1.5rem' }}>
          {steps.map((step, i) => (
            <div key={i} className="card" style={{ display: 'flex', gap: '1.5rem', alignItems: 'flex-start', padding: '1.75rem' }}>
              <div style={{ flexShrink: 0, width: 52, height: 52, borderRadius: '14px', background: 'var(--primary)', color: '#fff', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                <step.icon size={24} />
              </div>
              <div style={{ flex: 1 }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem', marginBottom: '0.5rem' }}>
                  <span style={{ fontWeight: 800, fontSize: '0.8125rem', color: 'var(--accent)', background: 'var(--accent-light)', padding: '0.2rem 0.6rem', borderRadius: '6px' }}>
                    {isRtl ? `${i + 1}` : `Step ${i + 1}`}
                  </span>
                  <h3 style={{ fontWeight: 700, fontSize: '1.0625rem', color: 'var(--slate-800)' }}>{step.title}</h3>
                </div>
                <p style={{ fontSize: '0.9375rem', color: 'var(--slate-600)', lineHeight: 1.7 }}>{step.desc}</p>
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  )
}
