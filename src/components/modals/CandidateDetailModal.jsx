import React from 'react';
import { X, Phone, MessageSquare, MapPin, Briefcase, Award, CheckCircle, FileText, Download } from 'lucide-react';
import StatusBadge from '../ui/StatusBadge';
import { useLanguage } from '../../context/LanguageContext';
import { candidateApi } from '../../api/candidate.api';

export default function CandidateDetailModal({ candidate, isOpen, onClose, onReport }) {
  const { t, isRtl } = useLanguage();

  if (!isOpen || !candidate) return null;

  const handleCall = () => {
    candidateApi.recordInteraction(candidate.id || candidate._id, { action: 'CALL_CLICKED' }).catch(() => {});
    window.location.href = `tel:${candidate.phone}`;
  };

  const handleWhatsApp = () => {
    candidateApi.recordInteraction(candidate.id || candidate._id, { action: 'WHATSAPP_CLICKED' }).catch(() => {});
    const cleanPhone = (candidate.phone || '').replace(/[\s\-\+]/g, '');
    const waNumber = cleanPhone.startsWith('0') ? '20' + cleanPhone.substring(1) : cleanPhone;
    const msg = encodeURIComponent(`مرحباً أستاذ ${candidate.fullName}، نتواصل معك بخصوص فرصة عمل عبر منصة عاشر جوبز.`);
    window.open(`https://wa.me/${waNumber}?text=${msg}`, '_blank');
  };

  const handleDownloadCv = () => {
    candidateApi.recordInteraction(candidate.id || candidate._id, { action: 'CV_REQUESTED' }).catch(() => {});
    window.open(`http://localhost:5000/api/candidates/cv/${candidate.id || candidate._id}`, '_blank');
  };

  return (
    <div className="modal-overlay" onClick={onClose}>
      <div className="modal-content" onClick={(e) => e.stopPropagation()} style={{ maxWidth: 580, padding: '1.75rem' }}>
        {/* Modal Header */}
        <div style={{ display: 'flex', alignItems: 'flex-start', justifyContent: 'space-between', marginBottom: '1.25rem' }}>
          <div>
            <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', marginBottom: '0.25rem' }}>
              <h2 style={{ fontSize: '1.375rem', fontWeight: 800, color: 'var(--slate-900)' }}>
                {candidate.fullName}
              </h2>
              <StatusBadge status={candidate.availabilityStatus} />
            </div>
            <p style={{ fontSize: '1rem', color: '#000000', fontWeight: 600 }}>
              {isRtl && candidate.desiredJob?.nameAr ? candidate.desiredJob.nameAr : candidate.desiredJob?.name || candidate.desiredJob}
            </p>
          </div>
          <button
            onClick={onClose}
            style={{ background: 'none', border: 'none', cursor: 'pointer', color: 'var(--slate-400)', padding: 4 }}
          >
            <X size={22} />
          </button>
        </div>

        {/* Contact Strip */}
        <div
          style={{
            backgroundColor: 'var(--slate-50)',
            border: '1px solid var(--border)',
            borderRadius: 'var(--radius-md)',
            padding: '1rem',
            marginBottom: '1.5rem',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'space-between',
            flexWrap: 'wrap',
            gap: '0.75rem'
          }}
        >
          <div>
            <div style={{ fontSize: '0.75rem', color: 'var(--slate-500)', fontWeight: 600 }}>{t('phone')}</div>
            <div style={{ fontSize: '1.125rem', fontWeight: 700, color: 'var(--slate-900)', direction: 'ltr' }}>
              {candidate.phone}
            </div>
          </div>
          <div style={{ display: 'flex', gap: '0.5rem' }}>
            <button className="btn btn-primary btn-sm" onClick={handleCall}>
              <Phone size={15} />
              <span>{t('call')}</span>
            </button>
            <button
              className="btn btn-outline btn-sm"
              onClick={handleWhatsApp}
            >
              <MessageSquare size={15} />
              <span>{t('whatsapp')}</span>
            </button>
          </div>
        </div>

        {/* Details Grid */}
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))', gap: '1rem', marginBottom: '1.5rem' }}>
          <div>
            <div style={{ fontSize: '0.75rem', color: 'var(--slate-400)', fontWeight: 600 }}>{t('location')}</div>
            <div style={{ fontSize: '0.9375rem', fontWeight: 600, color: 'var(--slate-800)', marginTop: 2 }}>
              {candidate.area || 'العاشر من رمضان'} - {candidate.governorate || 'الشرقية'}
            </div>
          </div>
          <div>
            <div style={{ fontSize: '0.75rem', color: 'var(--slate-400)', fontWeight: 600 }}>{t('experience')}</div>
            <div style={{ fontSize: '0.9375rem', fontWeight: 600, color: 'var(--slate-800)', marginTop: 2 }}>
              {candidate.yearsOfExperience} {t('years')}
            </div>
          </div>
          <div>
            <div style={{ fontSize: '0.75rem', color: 'var(--slate-400)', fontWeight: 600 }}>{t('qualification')}</div>
            <div style={{ fontSize: '0.9375rem', fontWeight: 600, color: 'var(--slate-800)', marginTop: 2 }}>
              {candidate.qualification || 'مؤهل متوسط / دبلوم فني'}
            </div>
          </div>
          <div>
            <div style={{ fontSize: '0.75rem', color: 'var(--slate-400)', fontWeight: 600 }}>البريد الإلكتروني</div>
            <div style={{ fontSize: '0.9375rem', fontWeight: 600, color: 'var(--slate-800)', marginTop: 2 }}>
              {candidate.email || 'غير مسجل'}
            </div>
          </div>
        </div>

        {/* Skills */}
        {candidate.skills && candidate.skills.length > 0 && (
          <div style={{ marginBottom: '1.5rem' }}>
            <h4 style={{ fontSize: '0.875rem', fontWeight: 700, color: 'var(--slate-700)', marginBottom: '0.5rem' }}>
              {t('skills')} والخبرات الفنية
            </h4>
            <div style={{ display: 'flex', flexWrap: 'wrap', gap: '0.5rem' }}>
              {candidate.skills.map((skill, idx) => (
                <span
                  key={idx}
                  style={{
                    padding: '0.25rem 0.625rem',
                    background: '#f4f4f5',
                    color: '#000000',
                    border: '1px solid #d4d4d8',
                    borderRadius: 'var(--radius-sm)',
                    fontSize: '0.8125rem',
                    fontWeight: 600
                  }}
                >
                  {skill}
                </span>
              ))}
            </div>
          </div>
        )}

        {/* CV Download / Request */}
        <div
          style={{
            border: '1px solid var(--border)',
            borderRadius: 'var(--radius-md)',
            padding: '1rem',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'space-between',
            marginBottom: '1.5rem'
          }}
        >
          <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem' }}>
            <FileText size={24} style={{ color: '#000000' }} />
            <div>
              <div style={{ fontSize: '0.875rem', fontWeight: 700, color: 'var(--slate-800)' }}>
                {candidate.hasCv || candidate.cvOriginalName ? 'السيرة الذاتية (CV) مرفقة' : 'السيرة الذاتية'}
              </div>
              <div style={{ fontSize: '0.75rem', color: 'var(--slate-500)' }}>
                {candidate.hasCv || candidate.cvOriginalName
                  ? candidate.cvOriginalName || 'cv_document.pdf'
                  : 'يمكنك التواصل المباشر مع المرشح أو طلب السيرة الذاتية'}
              </div>
            </div>
          </div>

          {candidate.hasCv || candidate.cvOriginalName ? (
            <button className="btn btn-outline btn-sm" onClick={handleDownloadCv}>
              <Download size={15} />
              <span>تحميل CV</span>
            </button>
          ) : (
            <button
              className="btn btn-outline btn-sm"
              onClick={() => {
                candidateApi.recordInteraction(candidate.id || candidate._id, { action: 'CV_REQUESTED' });
                alert('تم تسجيل طلبك للسيرة الذاتية بنجاح.');
              }}
            >
              <span>{t('requestCv')}</span>
            </button>
          )}
        </div>

        {/* Footer Actions */}
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
          {onReport && (
            <button
              className="btn btn-outline btn-sm"
              onClick={() => {
                onClose();
                onReport(candidate);
              }}
              style={{ color: 'var(--rose)', borderColor: 'var(--border)' }}
            >
              {t('reportCandidate')}
            </button>
          )}
          <button className="btn btn-primary btn-sm" onClick={onClose}>
            إغلاق
          </button>
        </div>
      </div>
    </div>
  );
}
