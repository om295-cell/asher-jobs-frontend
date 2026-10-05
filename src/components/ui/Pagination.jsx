import React from 'react';
import { ChevronLeft, ChevronRight } from 'lucide-react';
import { useLanguage } from '../../context/LanguageContext';

export default function Pagination({ pagination, onPageChange }) {
  const { isRtl } = useLanguage();

  if (!pagination || pagination.pages <= 1) return null;

  const { page, pages, total } = pagination;

  const PrevIcon = isRtl ? ChevronRight : ChevronLeft;
  const NextIcon = isRtl ? ChevronLeft : ChevronRight;

  return (
    <div
      style={{
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'space-between',
        flexWrap: 'wrap',
        gap: '1rem',
        padding: '1rem 0'
      }}
    >
      <div style={{ fontSize: '0.875rem', color: 'var(--slate-500)' }}>
        {isRtl ? (
          <>
            إجمالي <strong>{total}</strong> سجل • الصفحة <strong>{page}</strong> من <strong>{pages}</strong>
          </>
        ) : (
          <>
            Total <strong>{total}</strong> records • Page <strong>{page}</strong> of <strong>{pages}</strong>
          </>
        )}
      </div>

      <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
        <button
          className="btn btn-outline btn-sm"
          disabled={page <= 1}
          onClick={() => onPageChange(page - 1)}
          style={{ opacity: page <= 1 ? 0.5 : 1, cursor: page <= 1 ? 'not-allowed' : 'pointer' }}
        >
          <PrevIcon size={16} />
          <span>{isRtl ? 'السابق' : 'Previous'}</span>
        </button>

        <span style={{ fontSize: '0.875rem', fontWeight: 600, padding: '0 0.5rem' }}>
          {page} / {pages}
        </span>

        <button
          className="btn btn-outline btn-sm"
          disabled={page >= pages}
          onClick={() => onPageChange(page + 1)}
          style={{ opacity: page >= pages ? 0.5 : 1, cursor: page >= pages ? 'not-allowed' : 'pointer' }}
        >
          <span>{isRtl ? 'التالي' : 'Next'}</span>
          <NextIcon size={16} />
        </button>
      </div>
    </div>
  );
}
