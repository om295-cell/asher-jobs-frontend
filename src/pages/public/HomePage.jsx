import React, { useState, useRef, useEffect } from 'react'
import { Link } from 'react-router-dom'
import { useLanguage } from '../../context/LanguageContext'
import { useAuth } from '../../context/AuthContext'
import {
  Users, Building2, ShieldCheck,
  ArrowLeft, ArrowRight, MapPin, TrendingUp, Eye, Mail, MessageCircle, X,
  Calculator, Truck, Zap, Wrench, Cpu, Factory, Package, Sparkles, Search, Briefcase, CheckCircle2,
  ChevronDown, ChevronUp
} from 'lucide-react'
import { statsApi } from '../../api/stats.api'
import { jobsApi } from '../../api/jobs.api'

// 14 existing valid landscape videos for desktop/tablet (excluding missing 4 & 6)
const HERO_VIDEOS = [1, 2, 3, 5, 7, 8, 9, 10, 11, 12, 13, 14, 15, 16].map((i) => `/hero-videos/${i}.mp4`)


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

function getJobsForCategory(cat, allJobs) {
  if (!allJobs || allJobs.length === 0) return []
  const catText = `${cat.nameAr || ''} ${cat.name || ''}`.toLowerCase()
  const isAccounting = catText.includes('حساب') || catText.includes('مالي') || catText.includes('account')
  const isWarehousing = catText.includes('مخزن') || catText.includes('مخازن') || catText.includes('wareh') || catText.includes('لوجست')
  const isHR = catText.includes('بشر') || catText.includes('موارد') || catText.includes('hr') || catText.includes('إدار')
  const isEngineering = catText.includes('هندس') || catText.includes('engineer')
  const isQuality = catText.includes('جود') || catText.includes('فحص') || catText.includes('qual')
  const isMaintenance = catText.includes('صيان') || catText.includes('فني') || catText.includes('maint')
  const isProduction = catText.includes('إنتاج') || catText.includes('تصنيع') || catText.includes('product')
  const isSales = catText.includes('بيع') || catText.includes('تسويق') || catText.includes('sale') || catText.includes('market')
  const isDrivers = catText.includes('سائق') || catText.includes('driv')

  const inferCategory = (job) => {
    const title = `${job.name || ''} ${job.nameAr || ''}`.toLowerCase()
    if (/مخازن|مشتريات|توريد|تصدير|استيراد|جمرك|شحن|مستودع|warehouse|storekeeper|procurement|purchas|shipping|logistics|customs|import|export/.test(title)) {
      return 'warehousing'
    }
    if (/مهندس|مطور|مبرمج|شبكات|\bit\b|software|hardware|developer|programmer|engineer|flutter|bim|autocad|civil|mechanical|electrical/.test(title)) {
      return 'engineering'
    }
    if (/\bhr\b|موارد بشرية|شؤون عاملين|شئون عاملين|شؤن|موظف إداري|استقبال|سكرتارية|personnel|recruitment|admin|reception/.test(title)) {
      return 'hr'
    }
    if (/مبيعات|تسويق|سلاسل|sales|marketing|telemarketing|telesales|retail|b2b/.test(title) && !/محاسب|حسابات|accounting|accountant/.test(title)) {
      return 'sales'
    }
    if (/سائق|كلارك|ريتش تراك|driver|forklift/.test(title)) {
      return 'drivers'
    }
    if (/فني|صيانة|كهربا|تبريد|تكييف|سباك|لحام|technician|maintenance|mechanic/.test(title) && !/مهندس/.test(title)) {
      return 'maintenance'
    }
    if (/جودة|معمل|كيميائي|quality|lab|chemist/.test(title) && !/مهندس/.test(title)) {
      return 'quality'
    }
    if (/إنتاج|عمال|تصنيع|نظافة|بوفيه|security|production|worker/.test(title) && !/مهندس|محاسب/.test(title)) {
      return 'production'
    }
    if (/محاسب|حسابات|مالي|تكاليف|مراجع|خزينة|كاشير|صراف|مدفوعات|accountant|accounting|auditor|cashier|finance|financial|treasury|payroll|tax|cpa/.test(title)) {
      return 'accounting'
    }
    return null
  }

  const matching = allJobs.filter((job) => {
    const rawCatId = String(job.categoryId?._id || job.categoryId)
    const matchesId = rawCatId === String(cat._id)
    const inferred = inferCategory(job)

    if (isAccounting) {
      if (inferred && inferred !== 'accounting') return false
      return matchesId || inferred === 'accounting'
    }
    if (isWarehousing) {
      if (inferred === 'warehousing') return true
      return matchesId && inferred !== 'accounting' && inferred !== 'engineering'
    }
    if (isHR) {
      if (inferred === 'hr') return true
      return matchesId && inferred !== 'accounting'
    }
    if (isEngineering) {
      if (inferred === 'engineering') return true
      return matchesId && inferred !== 'accounting'
    }
    if (isSales) {
      if (inferred === 'sales') return true
      return matchesId && inferred !== 'accounting'
    }
    if (isDrivers) {
      if (inferred === 'drivers') return true
      return matchesId && inferred !== 'accounting'
    }
    if (isMaintenance) {
      if (inferred === 'maintenance') return true
      return matchesId && inferred !== 'accounting'
    }
    if (isQuality) {
      if (inferred === 'quality') return true
      return matchesId && inferred !== 'accounting'
    }
    if (isProduction) {
      if (inferred === 'production') return true
      return matchesId && inferred !== 'accounting'
    }
    return matchesId
  })

  // Deduplicate within the category
  const seen = new Set()
  const deduped = []
  for (const job of matching) {
    const key = (job.nameAr || job.name || '').trim().toLowerCase().replace(/[\s\-_()]/g, '')
    if (seen.has(key)) continue
    seen.add(key)
    deduped.push(job)
  }

  return deduped.sort((a, b) => (a.sortOrder ?? 0) - (b.sortOrder ?? 0))
}

export default function HomePage() {
  const { t, isRtl } = useLanguage()
  const { isAuthenticated, role } = useAuth()
  const ArrowIcon = isRtl ? ArrowLeft : ArrowRight

  const [currentVideoIndex, setCurrentVideoIndex] = useState(0)
  const [showCompanyModal, setShowCompanyModal] = useState(false)
  const videoRef = useRef(null)
  const [isDesktop, setIsDesktop] = useState(() => {
    if (typeof window !== 'undefined') {
      return window.innerWidth >= 768
    }
    return true
  })

  // Detect desktop vs mobile viewport dynamically
  useEffect(() => {
    if (typeof window === 'undefined') return
    const mediaQuery = window.matchMedia('(min-width: 768px)')
    const handler = (e) => setIsDesktop(e.matches)
    setIsDesktop(mediaQuery.matches)
    mediaQuery.addEventListener('change', handler)
    return () => mediaQuery.removeEventListener('change', handler)
  }, [])

  const [stats, setStats] = useState({
    candidates: null,
    companies: null,
    visitors: null,
    loading: true
  })
  const visitRecordedRef = useRef(false)
  const [categories, setCategories] = useState([])
  const [jobs, setJobs] = useState([])
  const [sectorsLoading, setSectorsLoading] = useState(true)
  const [expandedCategories, setExpandedCategories] = useState({})

  const toggleExpandCategory = (catId) => {
    setExpandedCategories(prev => ({
      ...prev,
      [catId]: !prev[catId]
    }))
  }

  useEffect(() => {
    let isMounted = true;

    // Clean up any old cached visitor session/storage
    try {
      localStorage.removeItem('asher_site_visitors');
      sessionStorage.removeItem('asher_visit_session');
    } catch (e) {}

    // 1. Record visit on every visit / reload
    if (!visitRecordedRef.current) {
      visitRecordedRef.current = true;
      statsApi.recordVisit()
        .then((res) => {
          if (isMounted && res?.data?.data?.visitors !== undefined) {
            setStats((prev) => ({
              ...prev,
              visitors: res.data.data.visitors
            }));
          }
        })
        .catch((err) => {
          console.error('Failed to record visit', err);
        });
    }

    // 2. Fetch current live platform stats directly from database
    statsApi.getStats()
      .then((res) => {
        if (isMounted && res?.data?.data) {
          setStats((prev) => ({
            candidates: res.data.data.candidates ?? 0,
            companies: res.data.data.companies ?? 0,
            visitors: prev.visitors !== null
              ? Math.max(prev.visitors, res.data.data.visitors ?? 0)
              : (res.data.data.visitors ?? 0),
            loading: false
          }));
        }
      })
      .catch((err) => {
        console.error('Failed to load stats', err);
        if (isMounted) {
          setStats((prev) => ({ ...prev, loading: false }));
        }
      });

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
          const validCats = catsRes.data.data.filter(
            (c) => c.name !== 'Uncategorized' && c.nameAr !== 'غير مصنف'
          )
          const sortedCats = [...validCats].sort((a, b) => (a.sortOrder ?? 0) - (b.sortOrder ?? 0))
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
    if (isDesktop && videoRef.current) {
      videoRef.current.load()
      videoRef.current.play().catch(() => {})
    }
  }, [currentVideoIndex, isDesktop])
  return (
    <div>
      {/* Hero Section */}
      <section style={{
        backgroundColor: '#050507',
        color: '#ffffff',
        padding: 'clamp(3rem, 6vw, 5rem) 0 clamp(3.5rem, 7vw, 6rem)',
        position: 'relative',
        overflow: 'hidden',
        minHeight: isDesktop ? 'auto' : '620px',
        display: 'flex',
        alignItems: 'center'
      }}>
        {/* DESKTOP BACKGROUND: High-definition cinematic video player */}
        {isDesktop ? (
          <>
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
          </>
        ) : (
          /* MOBILE BACKGROUND: 60fps High-Performance UI Motion Layer (Zero Video Bandwidth) */
          <div style={{ position: 'absolute', inset: 0, overflow: 'hidden', pointerEvents: 'none', zIndex: 0 }}>
            {/* Tech grid mesh overlay */}
            <div style={{
              position: 'absolute',
              inset: 0,
              backgroundImage: 'radial-gradient(rgba(255, 255, 255, 0.08) 1px, transparent 1px)',
              backgroundSize: '24px 24px',
              opacity: 0.7
            }} />
            {/* Animated Aurora Orb 1: Emerald Pulse */}
            <div
              className="hero-aurora-orb-1"
              style={{
                position: 'absolute',
                top: '-15%',
                right: isRtl ? 'auto' : '-10%',
                left: isRtl ? '-10%' : 'auto',
                width: '340px',
                height: '340px',
                borderRadius: '50%',
                background: 'radial-gradient(circle, rgba(16, 185, 129, 0.25) 0%, rgba(16, 185, 129, 0.05) 50%, transparent 70%)',
                filter: 'blur(35px)'
              }}
            />
            {/* Animated Aurora Orb 2: Sapphire / Indigo Drift */}
            <div
              className="hero-aurora-orb-2"
              style={{
                position: 'absolute',
                bottom: '-10%',
                left: isRtl ? 'auto' : '-15%',
                right: isRtl ? '-15%' : 'auto',
                width: '320px',
                height: '320px',
                borderRadius: '50%',
                background: 'radial-gradient(circle, rgba(59, 130, 246, 0.20) 0%, rgba(99, 102, 241, 0.04) 55%, transparent 70%)',
                filter: 'blur(40px)'
              }}
            />
            {/* Subtle dark vignette */}
            <div style={{
              position: 'absolute',
              inset: 0,
              background: 'linear-gradient(180deg, rgba(5,5,7,0.3) 0%, rgba(5,5,7,0.85) 100%)'
            }} />
          </div>
        )}

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
                <span>{isRtl ? 'رشّح شخصاً يبحث عن عمل' : 'Recommend a Job Seeker'}</span>
              </Link>
              <Link
                to="/login"
                style={{
                  display: 'inline-flex', alignItems: 'center', justifyContent: 'center', gap: '0.75rem',
                  padding: '0.75rem 1.25rem', borderRadius: '10px',
                  minHeight: '64px', flex: '1 1 270px', maxWidth: '340px', boxSizing: 'border-box',
                  background: 'rgba(255,255,255,0.08)', border: '2px solid rgba(255,255,255,0.35)',
                  color: '#ffffff', fontWeight: 700, fontSize: '0.95rem',
                  lineHeight: 1.2, transition: 'all 0.15s', textDecoration: 'none'
                }}
              >
                <Building2 size={20} style={{ flexShrink: 0 }} />
                <span>{isRtl ? 'تسجيل دخول شركة أو مصنع' : 'Employer Login'}</span>
              </Link>
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
              gridTemplateColumns: 'repeat(auto-fill, minmax(min(100%, 340px), 1fr))',
              gap: '1.25rem',
              alignItems: 'start'
            }}>
              {categories.map((cat) => {
                const CatIcon = getCategoryIcon(cat.nameAr, cat.name)
                const sortedJobs = getJobsForCategory(cat, jobs)
                const isExpanded = !!expandedCategories[cat._id]
                const INITIAL_LIMIT = 8
                const displayedJobs = isExpanded ? sortedJobs : sortedJobs.slice(0, INITIAL_LIMIT)
                const hasMore = sortedJobs.length > INITIAL_LIMIT

                return (
                  <div
                    key={cat._id}
                    style={{
                      background: '#ffffff',
                      border: '1.5px solid #e4e4e7',
                      borderRadius: '16px',
                      padding: '1.25rem 1.4rem',
                      display: 'flex',
                      flexDirection: 'column',
                      justifyContent: 'flex-start',
                      gap: '0.85rem',
                      boxShadow: '0 2px 8px rgba(0,0,0,0.03)',
                      height: 'fit-content'
                    }}
                  >
                    <div style={{
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'space-between',
                      gap: '0.75rem',
                      paddingBottom: '0.6rem',
                      borderBottom: '1px solid #f4f4f5'
                    }}>
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
                      <span style={{
                        fontSize: '0.75rem',
                        fontWeight: 700,
                        color: '#71717a',
                        background: '#f4f4f5',
                        padding: '0.2rem 0.6rem',
                        borderRadius: '999px',
                        whiteSpace: 'nowrap'
                      }}>
                        {sortedJobs.length} {isRtl ? 'مهنة' : 'jobs'}
                      </span>
                    </div>

                    {sortedJobs.length > 0 ? (
                      <div style={{ display: 'flex', flexWrap: 'wrap', gap: '0.45rem' }}>
                        {displayedJobs.map((job) => (
                          <span
                            key={job._id}
                            style={{
                              padding: '0.35rem 0.7rem',
                              borderRadius: '8px',
                              background: '#f4f4f5',
                              color: '#18181b',
                              fontWeight: 600,
                              fontSize: '0.825rem',
                              border: '1px solid #e4e4e7'
                            }}
                          >
                            {isRtl ? job.nameAr : job.name}
                          </span>
                        ))}
                      </div>
                    ) : (
                      <p style={{ fontSize: '0.85rem', color: '#a1a1aa', margin: 0 }}>
                        {isRtl ? 'لا توجد مهن مسجلة حالياً' : 'No jobs currently listed'}
                      </p>
                    )}

                    {hasMore && (
                      <button
                        type="button"
                        onClick={() => toggleExpandCategory(cat._id)}
                        style={{
                          alignSelf: 'flex-start',
                          background: 'transparent',
                          border: 'none',
                          padding: '0.3rem 0',
                          color: '#2563eb',
                          fontSize: '0.825rem',
                          fontWeight: 700,
                          cursor: 'pointer',
                          display: 'inline-flex',
                          alignItems: 'center',
                          gap: '0.35rem',
                          marginTop: '0.2rem'
                        }}
                      >
                        {isExpanded ? (
                          <>
                            {isRtl ? 'عرض أقل' : 'Show less'}
                            <ChevronUp size={15} />
                          </>
                        ) : (
                          <>
                            {isRtl
                              ? `+ عرض باقي المهن (${sortedJobs.length - INITIAL_LIMIT})`
                              : `+ Show more (${sortedJobs.length - INITIAL_LIMIT})`}
                            <ChevronDown size={15} />
                          </>
                        )}
                      </button>
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
            <Link
              to="/recommend"
              style={{ display: 'inline-flex', alignItems: 'center', justifyContent: 'center', gap: '0.5rem', padding: '0.875rem 1.75rem', background: '#ffffff', color: '#000000', borderRadius: '10px', fontWeight: 700, fontSize: '0.95rem', textDecoration: 'none', border: '2px solid #ffffff' }}
            >
              <Users size={20} />
              {isRtl ? 'رشّح شخصاً يبحث عن عمل' : 'Recommend a Job Seeker'}
            </Link>
            <Link
              to="/login"
              style={{ display: 'inline-flex', alignItems: 'center', justifyContent: 'center', gap: '0.75rem', padding: '0.75rem 1.5rem', background: 'rgba(255,255,255,0.08)', border: '2px solid rgba(255,255,255,0.35)', color: '#fff', borderRadius: '10px', fontWeight: 700, fontSize: '0.95rem', textDecoration: 'none', lineHeight: 1 }}
            >
              <Building2 size={20} style={{ flexShrink: 0 }} />
              <span>{isRtl ? 'تسجيل دخول شركة أو مصنع' : 'Employer Login'}</span>
            </Link>
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
                href="mailto:omarhassan@asher-jobs.com?subject=%D8%AA%D8%B3%D8%AC%D9%8A%D9%84%20%D8%B4%D8%B1%D9%83%D8%A9&body=%D8%A3%D8%B1%D9%8A%D8%AF%20%D8%AA%D8%B3%D8%AC%D9%8A%D9%84%20%D8%B4%D8%B1%D9%83%D8%A9"
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
                  <span style={{ fontSize: '0.8rem', fontWeight: 400, opacity: 0.65 }}>omarhassan@asher-jobs.com</span>
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
