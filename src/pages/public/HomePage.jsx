import React, { useState, useRef, useEffect } from 'react'
import { Link } from 'react-router-dom'
import { useLanguage } from '../../context/LanguageContext'
import { useAuth } from '../../context/AuthContext'
import {
  Users, Building2, ShieldCheck,
  ArrowLeft, ArrowRight, MapPin, TrendingUp, Eye, Mail, MessageCircle, X,
  Calculator, Truck, Zap, Wrench, Cpu, Factory, Package, Sparkles, Search, Briefcase, CheckCircle2
} from 'lucide-react'
import { statsApi } from '../../api/stats.api'
import { jobsApi } from '../../api/jobs.api'

const HERO_VIDEOS = Array.from({ length: 17 }, (_, i) => `/hero-videos/${i + 1}.mp4`)

function getCategoryIcon(catNameAr, catName) {
  const text = `${catNameAr || ''} ${catName || ''}`.toLowerCase()
  if (text.includes('حساب') || text.includes('مالي') || text.includes('account')) return Calculator
  if (text.includes('سائق') || text.includes('لوجست') || text.includes('driv') || text.includes('logist')) return Truck
  if (text.includes('كهرب') || text.includes('طاقة') || text.includes('elect')) return Zap
  if (text.includes('بشر') || text.includes('موارد') || text.includes('human') || text.includes('hr')) return Users
  if (text.includes('صيان') || text.includes('تشغيل') || text.includes('maint')) return Wrench
  if (text.includes('ميكانيك') || text.includes('هيدروليك') || text.includes('mechan')) return Cpu
  if (text.includes('إنتاج') || text.includes('تصنيع') || text.includes('product')) return Factory
  if (text.includes('جود') || text.includes('فحص') || text.includes('qual')) return ShieldCheck
  if (text.includes('بيع') || text.includes('تسويق') || text.includes('sale')) return TrendingUp
  if (text.includes('مخزن') || text.includes('مخازن') || text.includes('wareh')) return Package
  return Briefcase
}

export default function HomePage() {
  const { t, isRtl } = useLanguage()
  const { isAuthenticated, role } = useAuth()
  const ArrowIcon = isRtl ? ArrowLeft : ArrowRight

  const [currentVideoIndex, setCurrentVideoIndex] = useState(0)
  const [showCompanyModal, setShowCompanyModal] = useState(false)
  const videoRef = useRef(null)
  const [stats, setStats] = useState({
    candidates: null,
    companies: null,
    visitors: null,
    loading: true
  })
  const [categories, setCategories] = useState([])
  const [jobs, setJobs] = useState([])
  const [sectorsLoading, setSectorsLoading] = useState(true)

  useEffect(() => {
    let isMounted = true;

    // Clean up any old cached dummy visitor count from localStorage
    try {
      const cached = localStorage.getItem('asher_site_visitors');
      if (cached && parseInt(cached, 10) >= 1248) {
        localStorage.removeItem('asher_site_visitors');
      }
    } catch (e) {}

    // 1. Fetch current live stats directly from database
    statsApi.getStats()
      .then((res) => {
        if (isMounted && res?.data?.data) {
          setStats({
            candidates: res.data.data.candidates ?? 0,
            companies: res.data.data.companies ?? 0,
            visitors: res.data.data.visitors ?? 0,
            loading: false
          });
        }
      })
      .catch((err) => {
        console.error('Failed to load stats', err);
        if (isMounted) {
          setStats((prev) => ({ ...prev, loading: false }));
        }
      });

    // 2. Record visit once per unique browser session
    const sessionKey = 'asher_visit_session';
    if (!sessionStorage.getItem(sessionKey)) {
      try { sessionStorage.setItem(sessionKey, '1'); } catch (e) {}
      statsApi.recordVisit()
        .then((res) => {
          if (isMounted && res?.data?.data?.visitors !== undefined) {
            setStats((prev) => ({
              ...prev,
              visitors: res.data.data.visitors
            }));
          }
        })
        .catch(() => {});
    }

    return () => { isMounted = false };
  }, []);

  useEffect(() => {
    let isMounted = true
    Promise.all([
      jobsApi.getCategories().catch(() => ({ data: { data: [] } })),
      jobsApi.getJobs().catch(() => ({ data: { data: [] } }))
    ])
      .then(([catsRes, jobsRes]) => {
        if (!isMounted) return
        if (catsRes?.data?.data) {
          const sortedCats = [...catsRes.data.data].sort((a, b) => (a.sortOrder ?? 0) - (b.sortOrder ?? 0))
          setCategories(sortedCats)
        }
        if (jobsRes?.data?.data) {
          setJobs(jobsRes.data.data)
        }
      })
      .finally(() => {
        if (isMounted) setSectorsLoading(false)
      })
    return () => { isMounted = false }
  }, [])

  const handleVideoEnd = () => {
    setCurrentVideoIndex((prev) => (prev + 1) % HERO_VIDEOS.length)
  }

  const handleVideoError = () => {
    setCurrentVideoIndex((prev) => (prev + 1) % HERO_VIDEOS.length)
  }

  useEffect(() => {
    if (videoRef.current) {
      videoRef.current.load()
      videoRef.current.play().catch(() => {})
    }
  }, [currentVideoIndex])

  return (
    <div>
      {/* Hero Section */}
      <section style={{
        backgroundColor: '#000000',
        color: '#ffffff',
        padding: 'clamp(3rem, 6vw, 5rem) 0 clamp(3.5rem, 7vw, 6rem)',
        position: 'relative',
        overflow: 'hidden',
        minHeight: 'auto',
        display: 'flex',
        alignItems: 'center'
      }}>
        {/* Background Video Player */}
        <video
          ref={videoRef}
          key={HERO_VIDEOS[currentVideoIndex]}
          autoPlay
          muted
          playsInline
          onEnded={handleVideoEnd}
          onError={handleVideoError}
          style={{
            position: 'absolute',
            top: 0,
            left: 0,
            width: '100%',
            height: '100%',
            objectFit: 'cover',
            zIndex: 0,
            pointerEvents: 'none'
          }}
        >
          <source src={HERO_VIDEOS[currentVideoIndex]} type="video/mp4" />
        </video>

        {/* Dark overlay for contrast and legibility */}
        <div style={{
          position: 'absolute',
          inset: 0,
          backgroundColor: 'rgba(0, 0, 0, 0.65)',
          zIndex: 1
        }} />

        <div className="container" style={{ position: 'relative', zIndex: 2, width: '100%' }}>
          <div style={{ maxWidth: 700 }}>
            <div style={{
              display: 'inline-flex', alignItems: 'center', gap: '0.5rem',
              background: 'rgba(255,255,255,0.1)', border: '1px solid rgba(255,255,255,0.25)',
              padding: '0.375rem 1rem', borderRadius: '9999px',
              fontSize: '0.8125rem', fontWeight: 700, color: '#e4e4e7',
              marginBottom: '1.25rem'
            }}>
              <MapPin size={14} />
              {isRtl ? 'العاشر من رمضان — الروبيكي — بدر — العبور' : '10th of Ramadan — El Roubiky — Badr — El Obour'}
            </div>

            <h1 style={{ fontSize: 'clamp(1.75rem, 5.5vw, 3.25rem)', fontWeight: 900, lineHeight: 1.15, marginBottom: '1.25rem' }}>
              {isRtl ? (
                <>أكبر قاعدة بيانات<br /><span style={{ color: '#d4d4d8' }}>للعمال و الموظفين في مصر</span></>
              ) : (
                <>The Largest Database<br /><span style={{ color: '#d4d4d8' }}>of Workers & Employees in Egypt</span></>
              )}
            </h1>

            <p style={{ fontSize: 'clamp(0.95rem, 2.5vw, 1.125rem)', color: '#a1a1aa', lineHeight: 1.7, marginBottom: '2rem', maxWidth: 580 }}>
              {isRtl
                ? 'سجّل بياناتك كباحث عن عمل وابق متاحاً لكبرى الشركات والمصانع المعتمدة، أو ابحث ووظّف أفضل الكفاءات في العاشر من رمضان، الروبيكي، بدر، العبور وكافة أنحاء مصر.'
                : 'Connect with top verified factories and employers, or search and hire qualified workers and professionals across 10th of Ramadan, El Roubiky, Badr, El Obour, and all of Egypt.'}
            </p>

            <div style={{ display: 'flex', flexWrap: 'wrap', gap: '0.875rem', alignItems: 'stretch' }}>
              <Link
                to="/recommend"
                style={{
                  display: 'inline-flex', alignItems: 'center', justifyContent: 'center', gap: '0.625rem',
                  padding: '0.75rem 1.25rem', borderRadius: '10px',
                  minHeight: '64px', flex: '1 1 270px', maxWidth: '340px', boxSizing: 'border-box',
                  background: '#ffffff', color: '#000000', fontWeight: 700, fontSize: '0.95rem',
                  transition: 'all 0.15s', textDecoration: 'none', border: '2px solid #ffffff'
                }}
              >
                <Users size={20} style={{ flexShrink: 0 }} />
                <span>{isRtl ? 'أنا أبحث عن عمل — سجّل مجاناً' : "I'm Job Seeking — Register Free"}</span>
              </Link>
              <button
                onClick={() => setShowCompanyModal(true)}
                style={{
                  display: 'inline-flex', alignItems: 'center', justifyContent: 'center', gap: '0.75rem',
                  padding: '0.75rem 1.25rem', borderRadius: '10px',
                  minHeight: '64px', flex: '1 1 270px', maxWidth: '340px', boxSizing: 'border-box',
                  background: '#ffffff', border: '2px solid #ffffff',
                  color: '#000000', fontWeight: 700, fontSize: '0.95rem', cursor: 'pointer',
                  lineHeight: 1.2, transition: 'all 0.15s'
                }}
              >
                <Building2 size={20} style={{ flexShrink: 0 }} />
                <span style={{ display: 'flex', flexDirection: 'column', alignItems: isRtl ? 'flex-end' : 'flex-start', gap: '0.15rem' }}>
                  <span>{isRtl ? 'تسجيل شركة أو مصنع' : 'Register as Employer'}</span>
                  <span style={{ display: 'flex', alignItems: 'center', gap: '0.4rem' }}>
                    <span style={{ fontSize: '0.95rem', fontWeight: 900, color: '#16a34a' }}>{isRtl ? '50 ج.م/شهر' : '50 EGP/mo'}</span>
                    <span style={{ fontSize: '0.72rem', color: '#71717a', textDecoration: 'line-through', fontWeight: 500 }}>{isRtl ? '1,100 ج.م' : '1,100 EGP'}</span>
                  </span>
                </span>
              </button>
            </div>
          </div>

          {/* Stats strip */}
          <div style={{
            display: 'grid',
            gridTemplateColumns: 'repeat(auto-fit, minmax(min(100%, 180px), 1fr))',
            gap: '1.5rem',
            marginTop: 'clamp(2.5rem, 5vw, 4rem)',
            paddingTop: 'clamp(1.5rem, 4vw, 3rem)',
            borderTop: '1px solid rgba(255,255,255,0.15)'
          }}>
            {[
              {
                label: isRtl ? 'مرشح مسجّل' : 'Registered Candidates',
                value: stats.loading ? '...' : (stats.candidates ?? 0).toLocaleString(),
                icon: Users
              },
              {
                label: isRtl ? 'شركة ومصنع' : 'Companies & Factories',
                value: stats.loading ? '...' : (stats.companies ?? 0).toLocaleString(),
                icon: Building2
              },
              {
                label: isRtl ? 'زائر للموقع' : 'Website Visitors',
                value: stats.loading ? '...' : (stats.visitors ?? 0).toLocaleString(),
                icon: Eye
              },
            ].map(({ label, value, icon: Icon }) => (
              <div key={label} style={{ display: 'flex', alignItems: 'center', gap: '0.75rem' }}>
                <div style={{ width: 42, height: 42, borderRadius: '10px', background: 'rgba(255,255,255,0.1)', border: '1px solid rgba(255,255,255,0.2)', display: 'flex', alignItems: 'center', justifyContent: 'center', color: '#ffffff', flexShrink: 0 }}>
                  <Icon size={20} />
                </div>
                <div>
                  <div style={{ fontSize: '1.5rem', fontWeight: 800, color: '#fff' }}>{value}</div>
                  <div style={{ fontSize: '0.8125rem', color: '#71717a' }}>{label}</div>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* How It Works */}
      <section style={{ padding: 'clamp(3rem, 6vw, 5rem) 0', background: '#f4f4f5' }}>
        <div className="container">
          <div style={{ textAlign: 'center', marginBottom: '2.5rem' }}>
            <h2 style={{ fontSize: 'clamp(1.5rem, 4vw, 2rem)', fontWeight: 800, color: '#000000', marginBottom: '0.75rem' }}>
              {isRtl ? 'كيف تعمل منصة عاشر جوبز؟' : 'How Asher Jobs Works'}
            </h2>
            <p style={{ fontSize: 'clamp(0.95rem, 2vw, 1.0625rem)', color: '#52525b', maxWidth: 560, margin: '0 auto' }}>
              {isRtl ? 'نظام بسيط وفعّال يربط الباحثين عن عمل بالمصانع المعتمدة بشكل آمن ومنظّم.' : 'A simple, effective system connecting verified job seekers with approved industrial employers.'}
            </p>
          </div>

          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(min(100%, 280px), 1fr))', gap: '1.5rem' }}>
            {[
              {
                step: '01', icon: Users,
                title: isRtl ? 'للباحثين عن عمل' : 'For Job Seekers',
                desc: isRtl
                  ? 'تواصل معنا و أضف بياناتك و ترشيحاتك ل 10 من أصدقائك مجانا بحيث يمكن للشركات رؤية بياناتك و التواصل معك'
                  : 'Register your job title, experience, and phone number just once. Pick from a standardized job catalogue. Stay visible to hundreds of employers.',
              },
              {
                step: '02', icon: Building2,
                title: isRtl ? 'للشركات والمصانع' : 'For Employers & Factories',
                desc: isRtl
                  ? 'سجّل شركتك باشتراك رمزي 50 ج.م شهرياً فقط (بدلاً من 1100 ج.م)، نقوم بتوثيق هويتك ثم ننشئ لك حسابا ، ثم ابحث في قاعدة البيانات بالمهنة والخبرة. تواصل مباشرة بالهاتف أو الواتساب مع المرشحين.'
                  : 'Register your company for a nominal fee of only 50 EGP/month (instead of 1100 EGP), await admin approval, then search by job title, area, and experience. Contact directly or make bulk requests and export to Excel.',
              },
            ].map(({ step, icon: Icon, title, desc }) => (
              <div key={step} className="card" style={{ borderTop: '4px solid #000000' }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem', marginBottom: '1rem' }}>
                  <div style={{ width: 44, height: 44, borderRadius: '10px', background: '#000000', color: '#ffffff', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                    <Icon size={22} />
                  </div>
                  <span style={{ fontSize: '0.75rem', fontWeight: 800, color: '#000000', background: '#f4f4f5', padding: '0.2rem 0.5rem', borderRadius: '6px', border: '1px solid #d4d4d8' }}>
                    {isRtl ? `الخطوة ${step}` : `Step ${step}`}
                  </span>
                </div>
                <h3 style={{ fontSize: '1.125rem', fontWeight: 700, color: '#000000', marginBottom: '0.75rem' }}>{title}</h3>
                <p style={{ fontSize: '0.9375rem', color: '#52525b', lineHeight: 1.7 }}>{desc}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Job Sectors */}
      <section style={{ padding: 'clamp(2.5rem, 5vw, 4rem) 0', background: '#ffffff', borderTop: '1px solid #e4e4e7' }}>
        <div className="container">
          <div style={{ textAlign: 'center', maxWidth: '640px', margin: '0 auto 2.5rem' }}>
            <h2 style={{ fontSize: 'clamp(1.5rem, 3.5vw, 1.875rem)', fontWeight: 800, marginBottom: '0.5rem', color: '#09090b' }}>
              {isRtl ? 'التخصصات والمهن المتاحة' : 'Available Job Specializations'}
            </h2>
            <p style={{ fontSize: 'clamp(0.875rem, 2vw, 0.95rem)', color: '#71717a', margin: 0 }}>
              {isRtl
                ? 'دليل موحد لأبرز القطاعات والمهن المعتمدة في العاشر من رمضان والمناطق الصناعية'
                : 'A unified directory of approved sectors and jobs in 10th of Ramadan industrial zones'}
            </p>
          </div>

          {sectorsLoading ? (
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(min(100%, 220px), 1fr))', gap: '1rem' }}>
              {Array.from({ length: 6 }).map((_, i) => (
                <div key={i} style={{ height: '70px', borderRadius: '12px', background: '#f4f4f5' }} />
              ))}
            </div>
          ) : categories.length === 0 ? (
            <div style={{
              textAlign: 'center',
              padding: '3.5rem 1rem',
              background: '#fafafa',
              borderRadius: '16px',
              border: '1.5px dashed #d4d4d8',
              maxWidth: '520px',
              margin: '0 auto'
            }}>
              <Briefcase size={40} style={{ color: '#d4d4d8', marginBottom: '1rem' }} />
              <h3 style={{ fontSize: '1.1rem', fontWeight: 700, color: '#52525b', marginBottom: '0.5rem', margin: '0 0 0.5rem' }}>
                {isRtl ? 'لم تُضَف تخصصات بعد' : 'No specializations added yet'}
              </h3>
              <p style={{ fontSize: '0.9rem', color: '#a1a1aa', margin: 0 }}>
                {isRtl
                  ? 'سيظهر هنا دليل التخصصات والمهن فور إضافتها من لوحة التحكم'
                  : 'Specializations and job titles will appear here once added via the admin dashboard'}
              </p>
            </div>
          ) : (
            <div style={{
              display: 'grid',
              gridTemplateColumns: 'repeat(auto-fill, minmax(min(100%, 250px), 1fr))',
              gap: '1rem'
            }}>
              {categories.map((cat) => {
                const CatIcon = getCategoryIcon(cat.nameAr, cat.name)
                const catJobs = jobs.filter(j => String(j.categoryId?._id || j.categoryId) === String(cat._id))
                const sortedJobs = [...catJobs].sort((a, b) => (a.sortOrder ?? 0) - (b.sortOrder ?? 0))

                return (
                  <div
                    key={cat._id}
                    style={{
                      background: '#ffffff',
                      border: '1.5px solid #e4e4e7',
                      borderRadius: '12px',
                      padding: '1.1rem 1.25rem',
                      display: 'flex',
                      flexDirection: 'column',
                      justifyContent: 'center',
                      gap: '0.75rem',
                      boxShadow: '0 1px 3px rgba(0,0,0,0.02)'
                    }}
                  >
                    <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem' }}>
                      <div style={{
                        width: 40,
                        height: 40,
                        borderRadius: '10px',
                        background: '#09090b',
                        color: '#ffffff',
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'center',
                        flexShrink: 0
                      }}>
                        <CatIcon size={20} />
                      </div>
                      <h3 style={{
                        fontSize: '1.05rem',
                        fontWeight: 700,
                        color: '#09090b',
                        margin: 0,
                        lineHeight: 1.3
                      }}>
                        {isRtl ? cat.nameAr : cat.name}
                      </h3>
                    </div>

                    {sortedJobs.length > 0 && (
                      <div style={{ display: 'flex', flexWrap: 'wrap', gap: '0.4rem' }}>
                        {sortedJobs.map((job) => (
                          <span
                            key={job._id}
                            style={{
                              padding: '0.35rem 0.75rem',
                              borderRadius: '6px',
                              background: '#f4f4f5',
                              color: '#18181b',
                              fontWeight: 600,
                              fontSize: '0.825rem'
                            }}
                          >
                            {isRtl ? job.nameAr : job.name}
                          </span>
                        ))}
                      </div>
                    )}
                  </div>
                )
              })}
            </div>
          )}
        </div>
      </section>

      {/* CTA Section */}
      <section style={{ padding: 'clamp(3rem, 6vw, 5rem) 0', background: '#000000', color: '#fff' }}>
        <div className="container" style={{ textAlign: 'center' }}>
          <TrendingUp size={40} style={{ color: '#ffffff', marginBottom: '1rem' }} />
          <h2 style={{ fontSize: 'clamp(1.5rem, 4vw, 2rem)', fontWeight: 800, marginBottom: '1rem' }}>
            {isRtl ? 'ابدأ التوظيف الذكي اليوم' : 'Start Smart Recruiting Today'}
          </h2>
          <p style={{ fontSize: 'clamp(0.95rem, 2vw, 1.0625rem)', color: '#a1a1aa', marginBottom: '2rem', maxWidth: 500, margin: '0 auto 2rem' }}>
            {isRtl
              ? 'قاعدة بيانات واحدة، موحّدة، موثّقة — تربط كل المصانع والباحثين عن عمل في منطقة العاشر من رمضان.'
              : 'One unified, verified database connecting all factories and job seekers in the 10th of Ramadan industrial zone.'}
          </p>
          <div style={{ display: 'flex', justifyContent: 'center', gap: '1rem', flexWrap: 'wrap' }}>
            <a
              href="https://wa.me/201556454666?text=%D8%A3%D8%B1%D9%8A%D8%AF%20%D8%A7%D9%84%D8%AA%D8%B3%D8%AC%D9%8A%D9%84%20%D9%83%D8%A8%D8%A7%D8%AD%D8%AB%20%D8%B9%D9%86%20%D8%B9%D9%85%D9%84"
              target="_blank"
              rel="noopener noreferrer"
              style={{ display: 'inline-flex', alignItems: 'center', justifyContent: 'center', gap: '0.5rem', padding: '0.875rem 1.75rem', background: '#ffffff', color: '#000000', borderRadius: '10px', fontWeight: 700, fontSize: '0.95rem', textDecoration: 'none', border: '2px solid #ffffff' }}
            >
              <Users size={20} />
              {isRtl ? 'تسجيل كباحث عن عمل' : 'Register as Job Seeker'}
            </a>
            <button
              onClick={() => setShowCompanyModal(true)}
              style={{ display: 'inline-flex', alignItems: 'center', justifyContent: 'center', gap: '0.75rem', padding: '0.75rem 1.5rem', background: 'rgba(255,255,255,0.08)', border: '2px solid rgba(255,255,255,0.35)', color: '#fff', borderRadius: '10px', fontWeight: 700, fontSize: '0.95rem', cursor: 'pointer', lineHeight: 1 }}
            >
              <Building2 size={20} style={{ flexShrink: 0 }} />
              <span style={{ display: 'flex', flexDirection: 'column', alignItems: isRtl ? 'flex-end' : 'flex-start', gap: '0.15rem' }}>
                <span>{isRtl ? 'تسجيل شركة أو مصنع' : 'Register as Employer'}</span>
                <span style={{ display: 'flex', alignItems: 'center', gap: '0.4rem' }}>
                  <span style={{ fontSize: '0.95rem', fontWeight: 900, color: '#4ade80' }}>{isRtl ? '50 ج.م/شهر' : '50 EGP/mo'}</span>
                  <span style={{ fontSize: '0.72rem', color: '#a1a1aa', textDecoration: 'line-through', fontWeight: 500 }}>{isRtl ? '1,100 ج.م' : '1,100 EGP'}</span>
                </span>
              </span>
            </button>
          </div>
        </div>
      </section>
      {/* Company Contact Modal */}
      {showCompanyModal && (
        <div
          onClick={() => setShowCompanyModal(false)}
          style={{
            position: 'fixed', inset: 0, zIndex: 9999,
            background: 'rgba(0,0,0,0.65)', backdropFilter: 'blur(6px)',
            display: 'flex', alignItems: 'center', justifyContent: 'center',
            padding: '1rem'
          }}
        >
          <div
            onClick={e => e.stopPropagation()}
            style={{
              background: '#18181b', border: '1px solid rgba(255,255,255,0.12)',
              borderRadius: '20px', padding: 'clamp(1.25rem, 4vw, 2rem)', width: '100%', maxWidth: '400px',
              boxShadow: '0 25px 60px rgba(0,0,0,0.6)', position: 'relative'
            }}
          >
            {/* Close */}
            <button
              onClick={() => setShowCompanyModal(false)}
              style={{ position: 'absolute', top: '1rem', insetInlineEnd: '1rem', background: 'none', border: 'none', color: '#71717a', cursor: 'pointer', padding: '0.25rem' }}
            >
              <X size={20} />
            </button>

            {/* Header */}
            <div style={{ textAlign: 'center', marginBottom: '1.75rem' }}>
              <div style={{ width: 52, height: 52, borderRadius: '14px', background: 'rgba(255,255,255,0.08)', border: '1px solid rgba(255,255,255,0.15)', display: 'flex', alignItems: 'center', justifyContent: 'center', margin: '0 auto 1rem' }}>
                <Building2 size={26} color="#fff" />
              </div>
              <h3 style={{ color: '#fff', fontWeight: 800, fontSize: '1.2rem', margin: '0 0 0.4rem' }}>
                {isRtl ? 'تسجيل شركة أو مصنع' : 'Register as Employer'}
              </h3>
              <p style={{ color: '#a1a1aa', fontSize: '0.875rem', margin: 0 }}>
                {isRtl ? 'اختر طريقة التواصل المفضلة لديك' : 'Choose your preferred contact method'}
              </p>
            </div>

            {/* Options */}
            <div style={{ display: 'flex', flexDirection: 'column', gap: '0.875rem' }}>
              <a
                href="https://wa.me/201556454666?text=%D8%A3%D8%B1%D9%8A%D8%AF%20%D8%AA%D8%B3%D8%AC%D9%8A%D9%84%20%D8%B4%D8%B1%D9%83%D8%A9"
                target="_blank"
                rel="noopener noreferrer"
                style={{
                  display: 'flex', alignItems: 'center', gap: '1rem',
                  padding: '1rem 1.25rem', borderRadius: '12px',
                  background: '#25D366', color: '#fff',
                  fontWeight: 700, fontSize: '1rem', textDecoration: 'none',
                  transition: 'opacity 0.15s'
                }}
                onMouseEnter={e => e.currentTarget.style.opacity = '0.88'}
                onMouseLeave={e => e.currentTarget.style.opacity = '1'}
              >
                <MessageCircle size={22} style={{ flexShrink: 0 }} />
                <span>
                  <span style={{ display: 'block' }}>{isRtl ? 'تواصل عبر واتساب' : 'Contact via WhatsApp'}</span>
                  <span style={{ fontSize: '0.8rem', fontWeight: 400, opacity: 0.85 }}>+20 155 645 4666</span>
                </span>
              </a>

              <a
                href="mailto:asherjobs@outlook.com?subject=%D8%AA%D8%B3%D8%AC%D9%8A%D9%84%20%D8%B4%D8%B1%D9%83%D8%A9&body=%D8%A3%D8%B1%D9%8A%D8%AF%20%D8%AA%D8%B3%D8%AC%D9%8A%D9%84%20%D8%B4%D8%B1%D9%83%D8%A9"
                style={{
                  display: 'flex', alignItems: 'center', gap: '1rem',
                  padding: '1rem 1.25rem', borderRadius: '12px',
                  background: 'rgba(255,255,255,0.07)', border: '1px solid rgba(255,255,255,0.15)',
                  color: '#fff', fontWeight: 700, fontSize: '1rem', textDecoration: 'none',
                  transition: 'background 0.15s'
                }}
                onMouseEnter={e => e.currentTarget.style.background = 'rgba(255,255,255,0.12)'}
                onMouseLeave={e => e.currentTarget.style.background = 'rgba(255,255,255,0.07)'}
              >
                <Mail size={22} style={{ flexShrink: 0 }} />
                <span>
                  <span style={{ display: 'block' }}>{isRtl ? 'تواصل عبر البريد الإلكتروني' : 'Contact via Email'}</span>
                  <span style={{ fontSize: '0.8rem', fontWeight: 400, opacity: 0.65 }}>asherjobs@outlook.com</span>
                </span>
              </a>
            </div>

            {/* Price note */}
            <p style={{ textAlign: 'center', marginTop: '1.25rem', fontSize: '0.8rem', color: '#52525b' }}>
              {isRtl
                ? <><span style={{ color: '#4ade80', fontWeight: 700 }}>50 ج.م/شهر</span> فقط — بدلاً من <span style={{ textDecoration: 'line-through' }}>1,100 ج.م</span></>
                : <><span style={{ color: '#4ade80', fontWeight: 700 }}>50 EGP/mo</span> only — instead of <span style={{ textDecoration: 'line-through' }}>1,100 EGP</span></>}
            </p>
          </div>
        </div>
      )}
    </div>
  )
}
