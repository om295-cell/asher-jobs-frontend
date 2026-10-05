import React from 'react';
import { Loader2 } from 'lucide-react';
import { useLanguage } from '../../context/LanguageContext';

export default function LoadingSpinner({ message, fullScreen = false }) {
  const { t } = useLanguage();

  const content = (
    <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', gap: '0.75rem', padding: '2rem' }}>
      <Loader2 style={{ width: 36, height: 36, animation: 'spin 1s linear infinite', color: '#000000' }} />
      <span style={{ fontSize: '0.9375rem', color: 'var(--slate-600)', fontWeight: 500 }}>
        {message || t('loading')}
      </span>
      <style>{`
        @keyframes spin {
          from { transform: rotate(0deg); }
          to { transform: rotate(360deg); }
        }
      `}</style>
    </div>
  );

  if (fullScreen) {
    return (
      <div style={{ minHeight: '60vh', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
        {content}
      </div>
    );
  }

  return content;
}
