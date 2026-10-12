import React, { useState } from 'react';
import { useAuth } from '../../context/AuthContext';
import { useToast } from '../../context/ToastContext';
import { authApi } from '../../api/auth.api';
import { Lock, KeyRound, ShieldAlert, Check, Eye, EyeOff, LogOut } from 'lucide-react';

export default function ForcedPasswordChangeModal() {
  const { user, refreshProfile, logout } = useAuth();
  const { showToast } = useToast();

  const [currentPassword, setCurrentPassword] = useState('');
  const [newPassword, setNewPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [showCurrent, setShowCurrent] = useState(false);
  const [showNew, setShowNew] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');

    if (!currentPassword) {
      setError('يرجى إدخال كلمة المرور الحالية (المؤقتة).');
      return;
    }

    if (newPassword.length < 6) {
      setError('كلمة المرور الجديدة يجب أن لا تقل عن 6 أحرف أو أرقام.');
      return;
    }

    if (newPassword === 'Temp@1234') {
      setError('لا يمكن استخدام كلمة المرور المؤقتة (Temp@1234) ككلمة مرور دائمة.');
      return;
    }

    if (newPassword !== confirmPassword) {
      setError('كلمة المرور الجديدة وتأكيدها غير متطابقين.');
      return;
    }

    setLoading(true);
    try {
      const res = await authApi.changeInitialPassword(currentPassword, newPassword);
      if (res.data?.success) {
        showToast('تم تغيير كلمة المرور بنجاح وتفعيل حسابك!', 'success');
        await refreshProfile();
      } else {
        setError(res.data?.message || 'حدث خطأ أثناء تغيير كلمة المرور.');
      }
    } catch (err) {
      setError(err.response?.data?.message || 'فشل تحديث كلمة المرور. تأكد من صحة كلمة المرور الحالية.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/80 backdrop-blur-md">
      <div className="w-full max-w-md bg-white dark:bg-slate-900 rounded-2xl shadow-2xl border border-slate-200 dark:border-slate-800 p-6 md:p-8 animate-fadeIn" dir="rtl">
        <div className="flex items-center justify-center w-14 h-14 mx-auto mb-4 rounded-full bg-amber-100 dark:bg-amber-950/50 text-amber-600 dark:text-amber-400">
          <KeyRound className="w-7 h-7" />
        </div>

        <h2 className="text-xl font-bold text-center text-slate-800 dark:text-slate-100 mb-2">
          تغيير كلمة المرور المؤقتة
        </h2>
        
        <p className="text-sm text-center text-slate-600 dark:text-slate-400 mb-6">
          لأسباب أمنية وحماية لحسابك، يجب تعيين كلمة مرور شخصية جديدة قبل التمكن من الوصول إلى النظام وقاعدة البيانات.
        </p>

        {error && (
          <div className="mb-4 p-3 rounded-lg bg-red-50 dark:bg-red-950/40 border border-red-200 dark:border-red-800/60 flex items-start gap-2 text-sm text-red-700 dark:text-red-300">
            <ShieldAlert className="w-5 h-5 flex-shrink-0 mt-0.5" />
            <span>{error}</span>
          </div>
        )}

        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1">
              كلمة المرور الحالية (المؤقتة)
            </label>
            <div className="relative">
              <input
                type={showCurrent ? 'text' : 'password'}
                value={currentPassword}
                onChange={(e) => setCurrentPassword(e.target.value)}
                placeholder="أدخل كلمة المرور الحالية أو Temp@1234"
                className="w-full px-3 py-2.5 rounded-lg border border-slate-300 dark:border-slate-700 bg-slate-50 dark:bg-slate-800/50 text-slate-800 dark:text-slate-100 text-sm focus:outline-none focus:ring-2 focus:ring-primary-500"
                required
              />
              <button
                type="button"
                onClick={() => setShowCurrent(!showCurrent)}
                className="absolute left-3 top-2.5 text-slate-400 hover:text-slate-600 dark:hover:text-slate-300"
              >
                {showCurrent ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
              </button>
            </div>
          </div>

          <div>
            <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1">
              كلمة المرور الجديدة (6 أحرف على الأقل)
            </label>
            <div className="relative">
              <input
                type={showNew ? 'text' : 'password'}
                value={newPassword}
                onChange={(e) => setNewPassword(e.target.value)}
                placeholder="أدخل كلمة المرور الجديدة"
                className="w-full px-3 py-2.5 rounded-lg border border-slate-300 dark:border-slate-700 bg-slate-50 dark:bg-slate-800/50 text-slate-800 dark:text-slate-100 text-sm focus:outline-none focus:ring-2 focus:ring-primary-500"
                required
              />
              <button
                type="button"
                onClick={() => setShowNew(!showNew)}
                className="absolute left-3 top-2.5 text-slate-400 hover:text-slate-600 dark:hover:text-slate-300"
              >
                {showNew ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
              </button>
            </div>
          </div>

          <div>
            <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1">
              تأكيد كلمة المرور الجديدة
            </label>
            <input
              type="password"
              value={confirmPassword}
              onChange={(e) => setConfirmPassword(e.target.value)}
              placeholder="أعد إدخال كلمة المرور الجديدة"
              className="w-full px-3 py-2.5 rounded-lg border border-slate-300 dark:border-slate-700 bg-slate-50 dark:bg-slate-800/50 text-slate-800 dark:text-slate-100 text-sm focus:outline-none focus:ring-2 focus:ring-primary-500"
              required
            />
          </div>

          <button
            type="submit"
            disabled={loading}
            className="w-full mt-2 py-3 px-4 rounded-xl font-medium text-sm text-white bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-700 hover:to-indigo-700 shadow-md hover:shadow-lg transition-all duration-200 flex items-center justify-center gap-2 disabled:opacity-50"
          >
            {loading ? (
              <span className="inline-block w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin" />
            ) : (
              <>
                <Check className="w-4 h-4" />
                <span>حفظ كلمة المرور وتفعيل الحساب</span>
              </>
            )}
          </button>
        </form>

        <div className="mt-5 pt-4 border-t border-slate-200 dark:border-slate-800 flex justify-center">
          <button
            type="button"
            onClick={logout}
            className="flex items-center gap-1.5 text-xs text-slate-500 hover:text-red-600 dark:text-slate-400 dark:hover:text-red-400 transition-colors"
          >
            <LogOut className="w-3.5 h-3.5" />
            <span>تسجيل الخروج الآن</span>
          </button>
        </div>
      </div>
    </div>
  );
}
