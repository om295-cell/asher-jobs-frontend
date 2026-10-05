import React, { useState } from 'react';
import { X, Flag, AlertCircle } from 'lucide-react';
import { reportsApi } from '../../api/reports.api';
import { useToast } from '../../context/ToastContext';
import { useLanguage } from '../../context/LanguageContext';

export default function ReportCandidateModal({ candidate, isOpen, onClose }) {
  const { t } = useLanguage();
  const { showToast } = useToast();
  const [type, setType] = useState('INCORRECT_PHONE');
  const [description, setDescription] = useState('');
  const [loading, setLoading] = useState(false);

  if (!isOpen || !candidate) return null;

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!description.trim()) {
      showToast('يرجى كتابة تفاصيل البلاغ أو الملاحظة.', 'warning');
      return;
    }

    try {
      setLoading(true);
      await reportsApi.createReport({
        candidateId: candidate.id || candidate._id,
        type,
        description: description.trim()
      });
      showToast('تم إرسال الملاحظة لإدارة المنصة لمراجعتها وتحديث السجل. شكراً لك.', 'success');
      setDescription('');
      onClose();
    } catch (err) {
      showToast(err.formattedMessage || 'حدث خطأ أثناء إرسال البلاغ.', 'error');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="modal-overlay" onClick={onClose}>
      <div className="modal-content" onClick={(e) => e.stopPropagation()} style={{ maxWidth: 500, padding: '1.5rem' }}>
        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '1rem' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', color: 'var(--rose)' }}>
            <Flag size={20} />
            <h3 style={{ fontSize: '1.125rem', fontWeight: 700, color: 'var(--slate-900)' }}>
              إبلاغ عن بيانات غير صحيحة
            </h3>
          </div>
          <button onClick={onClose} style={{ background: 'none', border: 'none', cursor: 'pointer', color: 'var(--slate-400)' }}>
            <X size={20} />
          </button>
        </div>

        <p style={{ fontSize: '0.875rem', color: 'var(--slate-600)', marginBottom: '1.25rem' }}>
          المرشح: <strong>{candidate.fullName}</strong> ({candidate.phone})
        </p>

        <form onSubmit={handleSubmit}>
          <div className="form-group">
            <label className="form-label">نوع المشكلة أو الملاحظة</label>
            <select
              className="form-control"
              value={type}
              onChange={(e) => setType(e.target.value)}
              required
            >
              <option value="INCORRECT_PHONE">رقم الهاتف غير صحيح أو لا يعمل</option>
              <option value="NOT_AVAILABLE">المرشح غير متاح حالياً / تم توظيفه بالفعل</option>
              <option value="OUTDATED_INFO">بيانات المهنة أو الخبرة قديمة أو غير مطابقة</option>
              <option value="DUPLICATE_CANDIDATE">سجل مكرر لنفس الشخص</option>
              <option value="OTHER">ملاحظة أخرى</option>
            </select>
          </div>

          <div className="form-group">
            <label className="form-label">تفاصيل الملاحظة للإدارة</label>
            <textarea
              className="form-control"
              rows={4}
              placeholder="اكتب توضيحاً مختصراً لمساعدة فريق المنصة على التحقق وتحديث حالة المرشح..."
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              required
            ></textarea>
          </div>

          <div style={{ display: 'flex', justifyContent: 'flex-end', gap: '0.75rem', marginTop: '1.5rem' }}>
            <button type="button" className="btn btn-outline" onClick={onClose} disabled={loading}>
              إلغاء
            </button>
            <button type="submit" className="btn btn-danger" disabled={loading}>
              {loading ? 'جاري الإرسال...' : 'إرسال البلاغ'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
