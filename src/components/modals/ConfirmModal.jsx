import React from 'react';
import { AlertTriangle, X } from 'lucide-react';
import { useLanguage } from '../../context/LanguageContext';

export default function ConfirmModal({
  isOpen,
  title,
  message,
  confirmText,
  cancelText,
  confirmVariant = 'danger',
  onConfirm,
  onClose,
  loading = false
}) {
  const { t, isRtl } = useLanguage();

  if (!isOpen) return null;

  return (
    <div className="modal-overlay" onClick={onClose}>
      <div className="modal-content" onClick={(e) => e.stopPropagation()} style={{ maxWidth: 480, padding: '1.5rem' }}>
        <div style={{ display: 'flex', alignItems: 'flex-start', justifyContent: 'space-between', marginBottom: '1rem' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem' }}>
            <div
              style={{
                width: 40,
                height: 40,
                borderRadius: '50%',
                backgroundColor: confirmVariant === 'danger' ? 'var(--rose-light)' : 'var(--amber-light)',
                color: confirmVariant === 'danger' ? 'var(--rose)' : 'var(--amber)',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center'
              }}
            >
              <AlertTriangle size={20} />
            </div>
            <h3 style={{ fontSize: '1.125rem', fontWeight: 700, color: 'var(--slate-900)' }}>{title}</h3>
          </div>
          <button
            onClick={onClose}
            style={{ background: 'none', border: 'none', cursor: 'pointer', color: 'var(--slate-400)' }}
          >
            <X size={20} />
          </button>
        </div>

        <p style={{ fontSize: '0.9375rem', color: 'var(--slate-600)', marginBottom: '1.5rem', lineHeight: 1.6 }}>
          {message}
        </p>

        <div style={{ display: 'flex', justifyContent: 'flex-end', gap: '0.75rem' }}>
          <button className="btn btn-outline" onClick={onClose} disabled={loading}>
            {cancelText || t('cancel')}
          </button>
          <button
            className={`btn btn-${confirmVariant === 'danger' ? 'danger' : 'accent'}`}
            onClick={onConfirm}
            disabled={loading}
          >
            {loading ? t('loading') : confirmText || t('save')}
          </button>
        </div>
      </div>
    </div>
  );
}
