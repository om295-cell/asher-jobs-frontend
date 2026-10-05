import React from 'react';
import { Phone, MessageSquare, FileText, MapPin, Briefcase, Award, Eye, Flag } from 'lucide-react';
import StatusBadge from './StatusBadge';
import { useLanguage } from '../../context/LanguageContext';
import { candidateApi } from '../../api/candidate.api';

export default function CandidateCard({ candidate, onViewDetails, onReport, onRequestCv }) {
  const { t, isRtl } = useLanguage();

  const handleCall = () => {
    candidateApi.recordInteraction(candidate.id || candidate._id, { action: 'CALL_CLICKED' }).catch(() => {});
    window.location.href = `tel:${candidate.phone}`;
  };

  const handleWhatsApp = () => {
    candidateApi.recordInteraction(candidate.id || candidate._id, { action: 'WHATSAPP_CLICKED' }).catch(() => {});
    // Clean phone number for WhatsApp wa.me
    const cleanPhone = (candidate.phone || '').replace(/[\s\-\+]/g, '');
    const waNumber = cleanPhone.startsWith('0') ? '20' + cleanPhone.substring(1) : cleanPhone;
    const msg = encodeURIComponent(`مرحباً أستاذ ${candidate.fullName}، نتواصل معك بخصوص فرصة عمل عبر منصة عاشر جوبز.`);
    window.open(`https://wa.me/${waNumber}?text=${msg}`, '_blank');
  };

  return (
    <div className="card card-hover" style={{ display: 'flex', flexDirection: 'column', justifyContent: 'space-between', height: '100%' }}>
      <div>
        {/* Header */}
        <div style={{ display: 'flex', alignItems: 'flex-start', justifyContent: 'space-between', gap: '0.75rem', marginBottom: '0.75rem' }}>
          <div>
            <h4 style={{ fontSize: '1.0625rem', fontWeight: 700, color: 'var(--slate-900)' }}>
              {candidate.fullName}
            </h4>
            <div style={{ display: 'flex', alignItems: 'center', gap: '0.375rem', color: '#000000', fontWeight: 600, fontSize: '0.9375rem' }}>
              <Briefcase size={16} />
              <span>{isRtl && candidate.desiredJob?.nameAr ? candidate.desiredJob.nameAr : candidate.desiredJob?.name || candidate.desiredJob}</span>
            </div>
          </div>
          <StatusBadge status={candidate.availabilityStatus} />
        </div>

        {/* Info Grid */}
        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '0.5rem', margin: '0.75rem 0', fontSize: '0.8125rem', color: 'var(--slate-600)' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '0.375rem' }}>
            <MapPin size={15} style={{ color: 'var(--slate-400)' }} />
            <span>{candidate.area || 'العاشر من رمضان'}</span>
          </div>
          <div style={{ display: 'flex', alignItems: 'center', gap: '0.375rem' }}>
            <Award size={15} style={{ color: 'var(--slate-400)' }} />
            <span>{candidate.yearsOfExperience} {t('years')} {t('experience')}</span>
          </div>
        </div>

        {candidate.qualification && (
          <div style={{ fontSize: '0.8125rem', color: 'var(--slate-500)', marginBottom: '0.75rem' }}>
            <strong>{t('qualification')}:</strong> {candidate.qualification}
          </div>
        )}

        {/* Skills */}
        {candidate.skills && candidate.skills.length > 0 && (
          <div style={{ display: 'flex', flexWrap: 'wrap', gap: '0.375rem', marginBottom: '1rem' }}>
            {candidate.skills.slice(0, 4).map((skill, idx) => (
              <span
                key={idx}
                style={{
                  fontSize: '0.75rem',
                  padding: '0.2rem 0.5rem',
                  background: 'var(--slate-100)',
                  borderRadius: 'var(--radius-sm)',
                  color: 'var(--slate-700)'
                }}
              >
                {skill}
              </span>
            ))}
            {candidate.skills.length > 4 && (
              <span style={{ fontSize: '0.75rem', color: 'var(--slate-400)', alignSelf: 'center' }}>
                +{candidate.skills.length - 4}
              </span>
            )}
          </div>
        )}
      </div>

      {/* Action Buttons */}
      <div style={{ borderTop: '1px solid var(--border)', paddingTop: '0.875rem', marginTop: '0.5rem' }}>
        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '0.5rem', marginBottom: '0.5rem' }}>
          <button className="btn btn-outline btn-sm" onClick={handleCall} style={{ width: '100%', color: 'var(--slate-800)' }}>
            <Phone size={14} style={{ color: '#000000' }} />
            <span>{t('call')}</span>
          </button>
          <button className="btn btn-outline btn-sm" onClick={handleWhatsApp} style={{ width: '100%' }}>
            <MessageSquare size={14} />
            <span>{t('whatsapp')}</span>
          </button>
        </div>

        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', gap: '0.5rem' }}>
          <button
            className="btn btn-primary btn-sm"
            style={{ flex: 1 }}
            onClick={() => onViewDetails && onViewDetails(candidate)}
          >
            <Eye size={14} />
            <span>{t('view')}</span>
          </button>

          {onReport && (
            <button
              className="btn btn-outline btn-sm"
              onClick={() => onReport(candidate)}
              title={t('reportCandidate')}
              style={{ color: 'var(--slate-400)', padding: '0.375rem 0.5rem' }}
            >
              <Flag size={14} />
            </button>
          )}
        </div>
      </div>
    </div>
  );
}
