import React, { useState } from 'react';
import { useAuth } from '../../context/AuthContext';
import { useToast } from '../../context/ToastContext';
import { authApi } from '../../api/auth.api';
import { KeyRound, ShieldAlert, Check, Eye, EyeOff, LogOut } from 'lucide-react';

export default function ForcedPasswordChangeModal() {
  const { refreshProfile, logout } = useAuth();
  const { showToast } = useToast();

  const [newPassword, setNewPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [showNew, setShowNew] = useState(false);
  const [showConfirm, setShowConfirm] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');

    if (newPassword.length < 6) {
      setError('كلمة المرور الجديدة يجب أن لا تقل عن 6 أحرف أو أرقام.');
      return;
    }

    if (newPassword === 'Temp@1234' || newPassword.toLowerCase().includes('temp')) {
      setError('لا يمكن استخدام كلمة مرور مؤقتة ككلمة مرور دائمة.');
      return;
    }

    if (newPassword !== confirmPassword) {
      setError('كلمة المرور الجديدة وتأكيدها غير متطابقين.');
      return;
    }

    setLoading(true);
    try {
      const res = await authApi.changeInitialPassword(newPassword);
      if (res.data?.success) {
        showToast('تم تغيير كلمة المرور بنجاح وتفعيل حسابك!', 'success');
        await refreshProfile();
      } else {
        setError(res.data?.message || 'حدث خطأ أثناء تغيير كلمة المرور.');
      }
    } catch (err) {
      setError(err.response?.data?.message || 'فشل تحديث كلمة المرور. حاول مرة أخرى.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="modal-overlay" style={{ zIndex: 9999 }}>
      <div className="modal-content" style={{ maxWidth: 440, padding: '2rem' }} dir="rtl">
        <div
          style={{
            width: 52,
            height: 52,
            borderRadius: '50%',
            background: 'var(--slate-100)',
            color: '#000000',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            margin: '0 auto 1rem auto'
          }}
        >
          <KeyRound size={26} />
        </div>

        <h2 style={{ fontSize: '1.25rem', fontWeight: 800, textAlign: 'center', color: 'var(--slate-900)', marginBottom: '0.35rem' }}>
          تعيين كلمة مرور جديدة
        </h2>

        <p style={{ fontSize: '0.84rem', textAlign: 'center', color: 'var(--slate-500)', marginBottom: '1.5rem', lineHeight: 1.5 }}>
          لأسباب أمنية وحماية لحسابك، يجب تعيين كلمة مرور شخصية جديدة قبل التمكن من الوصول إلى النظام.
        </p>

        {error && (
          <div
            style={{
              padding: '0.75rem',
              borderRadius: 'var(--radius-md)',
              background: '#fef2f2',
              border: '1px solid #fecaca',
              color: '#991b1b',
              fontSize: '0.8125rem',
              display: 'flex',
              alignItems: 'center',
              gap: '0.5rem',
              marginBottom: '1rem'
            }}
          >
            <ShieldAlert size={18} style={{ flexShrink: 0 }} />
            <span>{error}</span>
          </div>
        )}

        <form onSubmit={handleSubmit}>
          <div className="form-group">
            <label className="form-label">كلمة المرور الجديدة (6 أحرف على الأقل)</label>
            <div style={{ position: 'relative' }}>
              <input
                type={showNew ? 'text' : 'password'}
                value={newPassword}
                onChange={(e) => setNewPassword(e.target.value)}
                placeholder="أدخل كلمة المرور الجديدة"
                className="form-control"
                style={{ paddingInlineEnd: '2.5rem' }}
                required
                autoFocus
              />
              <button
                type="button"
                onClick={() => setShowNew(!showNew)}
                style={{
                  position: 'absolute',
                  left: '0.75rem',
                  top: '50%',
                  transform: 'translateY(-50%)',
                  background: 'none',
                  border: 'none',
                  color: 'var(--slate-400)',
                  cursor: 'pointer'
                }}
              >
                {showNew ? <EyeOff size={16} /> : <Eye size={16} />}
              </button>
            </div>
          </div>

          <div className="form-group" style={{ marginBottom: '1.5rem' }}>
            <label className="form-label">تأكيد كلمة المرور الجديدة</label>
            <div style={{ position: 'relative' }}>
              <input
                type={showConfirm ? 'text' : 'password'}
                value={confirmPassword}
                onChange={(e) => setConfirmPassword(e.target.value)}
                placeholder="أعد إدخال كلمة المرور الجديدة"
                className="form-control"
                style={{ paddingInlineEnd: '2.5rem' }}
                required
              />
              <button
                type="button"
                onClick={() => setShowConfirm(!showConfirm)}
                style={{
                  position: 'absolute',
                  left: '0.75rem',
                  top: '50%',
                  transform: 'translateY(-50%)',
                  background: 'none',
                  border: 'none',
                  color: 'var(--slate-400)',
                  cursor: 'pointer'
                }}
              >
                {showConfirm ? <EyeOff size={16} /> : <Eye size={16} />}
              </button>
            </div>
          </div>

          <button
            type="submit"
            disabled={loading}
            className="btn btn-primary"
            style={{ width: '100%', padding: '0.75rem', fontSize: '0.9375rem' }}
          >
            {loading ? (
              'جاري الحفظ...'
            ) : (
              <>
                <Check size={18} />
                <span>حفظ كلمة المرور وتفعيل الحساب</span>
              </>
            )}
          </button>
        </form>

        <div style={{ marginTop: '1.25rem', paddingTop: '1rem', borderTop: '1px solid var(--border)', textAlign: 'center' }}>
          <button
            type="button"
            onClick={logout}
            style={{
              background: 'none',
              border: 'none',
              color: 'var(--slate-500)',
              fontSize: '0.8125rem',
              cursor: 'pointer',
              display: 'inline-flex',
              alignItems: 'center',
              gap: '0.35rem'
            }}
          >
            <LogOut size={14} />
            <span>تسجيل الخروج الآن</span>
          </button>
        </div>
      </div>
    </div>
  );
}
