import React from 'react';
import { Inbox } from 'lucide-react';

export default function EmptyState({ icon: Icon = Inbox, title, description, action }) {
  return (
    <div
      style={{
        display: 'flex',
        flexDirection: 'column',
        alignItems: 'center',
        justifyContent: 'center',
        textAlign: 'center',
        padding: '3.5rem 1.5rem',
        background: '#ffffff',
        border: '1px dashed var(--slate-300)',
        borderRadius: 'var(--radius-lg)',
        margin: '1rem 0'
      }}
    >
      <div
        style={{
          width: 56,
          height: 56,
          borderRadius: '50%',
          backgroundColor: 'var(--slate-100)',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          marginBottom: '1rem',
          color: 'var(--slate-500)'
        }}
      >
        <Icon size={28} />
      </div>
      <h3 style={{ fontSize: '1.125rem', fontWeight: 700, color: 'var(--slate-800)', marginBottom: '0.375rem' }}>
        {title}
      </h3>
      {description && (
        <p style={{ fontSize: '0.875rem', color: 'var(--slate-500)', maxWidth: 440, marginBottom: action ? '1.25rem' : '0' }}>
          {description}
        </p>
      )}
      {action && <div>{action}</div>}
    </div>
  );
}
