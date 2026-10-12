import React, { useState, useEffect, useCallback } from 'react';
import { Link } from 'react-router-dom';
import { useLanguage } from '../../context/LanguageContext';
import { useToast } from '../../context/ToastContext';
import { companyApi } from '../../api/company.api';
import {
  ShoppingCart,
  FileSpreadsheet,
  Trash2,
  Download,
  AlertCircle,
  Building,
  User,
  Phone,
  Mail,
  MapPin,
  Briefcase,
  Layers,
  ArrowRight
} from 'lucide-react';
import LoadingSpinner from '../../components/ui/LoadingSpinner';
import EmptyState from '../../components/ui/EmptyState';

export default function CompanyCart() {
  const { isRtl } = useLanguage();
  const { showToast } = useToast();

  const [cart, setCart] = useState([]);
  const [entitlements, setEntitlements] = useState(null);
  const [loading, setLoading] = useState(true);
  const [exporting, setExporting] = useState(false);
  const [exportFormat, setExportFormat] = useState('multi_sheet');

  const fetchData = useCallback(async () => {
    setLoading(true);
    try {
      const [cartRes, entRes] = await Promise.all([
        companyApi.getCart(),
        companyApi.getEntitlements()
      ]);
      setCart(cartRes.data?.data || []);
      setEntitlements(entRes.data?.data || null);
    } catch (err) {
      showToast(err.response?.data?.message || 'فشل تحميل بيانات السلة', 'error');
    } finally {
      setLoading(false);
    }
  }, [showToast]);

  useEffect(() => {
    fetchData();
  }, [fetchData]);

  const handleRemoveItem = async (jobId) => {
    try {
      await companyApi.removeCartItem(jobId);
      showToast('تم حذف المسمى الوظيفي من السلة', 'success');
      fetchData();
    } catch (err) {
      showToast(err.response?.data?.message || 'فشل الحذف', 'error');
    }
  };

  const handleClearCart = async () => {
    if (!window.confirm('هل أنت متأكد من تفريغ سلة المرشحين بالكامل؟')) return;
    try {
      await companyApi.clearCart();
      showToast('تم تفريغ السلة بنجاح', 'success');
      fetchData();
    } catch (err) {
      showToast(err.response?.data?.message || 'فشل تفريغ السلة', 'error');
    }
  };

  const handleExport = async () => {
    if (cart.length === 0) return;
    setExporting(true);
    try {
      const res = await companyApi.exportCart(exportFormat);
      const blob = new Blob([res.data], {
        type: 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet'
      });
      const url = URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url;
      a.download = `candidate_cart_${exportFormat}_${Date.now()}.xlsx`;
      a.click();
      URL.revokeObjectURL(url);
      showToast('تم تصدير ملف الإكسيل بنجاح!', 'success');
      fetchData();
    } catch (err) {
      let errMsg = 'فشل تصدير السلة';
      if (err.response?.data instanceof Blob) {
        try {
          const text = await err.response.data.text();
          const json = JSON.parse(text);
          if (json.message) errMsg = json.message;
        } catch (_) {}
      } else if (err.response?.data?.message) {
        errMsg = err.response.data.message;
      }
      showToast(errMsg, 'error');
    } finally {
      setExporting(false);
    }
  };

  if (loading) {
    return (
      <div className="py-20 flex justify-center">
        <LoadingSpinner />
      </div>
    );
  }

  const isCartEligible = entitlements?.limits?.cartEnabled;
  const totalCandidatesCount = cart.reduce((acc, item) => acc + (item.candidates?.length || 0), 0);

  if (!isCartEligible) {
    return (
      <div className="py-12 bg-slate-50 min-h-[80vh]" dir={isRtl ? 'rtl' : 'ltr'}>
        <div className="max-w-3xl mx-auto px-4">
          <div className="bg-white rounded-2xl border border-amber-200 p-8 shadow-sm text-center">
            <div className="w-16 h-16 bg-amber-100 text-amber-600 rounded-full flex items-center justify-center mx-auto mb-4">
              <ShoppingCart className="w-8 h-8" />
            </div>
            <h2 className="text-2xl font-bold text-slate-800 mb-2">
              سلة المرشحين متعددة المسميات الوظيفية
            </h2>
            <p className="text-slate-600 mb-6 max-w-lg mx-auto">
              خاصية سلة المرشحين وتصدير ملفات الإكسيل المتعددة متاحة حصرياً لمشتركي
              <span className="font-bold text-amber-600"> الباقة الذهبية (Gold) </span>
              و
              <span className="font-bold text-indigo-600"> الباقة البلاتينية (Platinum)</span>.
            </p>
            <Link
              to="/company/subscription"
              className="inline-flex items-center gap-2 px-6 py-3 rounded-xl bg-gradient-to-r from-amber-500 to-amber-600 text-white font-bold hover:shadow-lg transition-all"
            >
              <span>ترقية الباقة الآن</span>
              <ArrowRight className="w-4 h-4" />
            </Link>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="py-8 bg-slate-50 min-h-[85vh]" dir={isRtl ? 'rtl' : 'ltr'}>
      <div className="max-w-6xl mx-auto px-4">
        {/* Header */}
        <div className="flex flex-wrap items-center justify-between gap-4 mb-6">
          <div>
            <div className="flex items-center gap-3">
              <div className="p-2.5 bg-blue-100 text-blue-700 rounded-xl">
                <ShoppingCart className="w-6 h-6" />
              </div>
              <h1 className="text-2xl font-bold text-slate-900">
                سلة المرشحين (تصدير مجمع متعدد المسميات)
              </h1>
            </div>
            <p className="text-sm text-slate-500 mt-1">
              إجمالي {cart.length} مسمى وظيفي • {totalCandidatesCount} مرشح مختار (بحد أقصى 10 لكل مسمى)
            </p>
          </div>

          {cart.length > 0 && (
            <button
              onClick={handleClearCart}
              className="px-4 py-2 text-sm text-red-600 hover:text-red-700 hover:bg-red-50 rounded-lg border border-red-200 transition-colors flex items-center gap-1.5"
            >
              <Trash2 className="w-4 h-4" />
              <span>تفريغ السلة</span>
            </button>
          )}
        </div>

        {/* Quota & Reset Banner */}
        {entitlements && (
          <div className="bg-white rounded-xl border border-slate-200 p-4 mb-6 shadow-sm flex flex-wrap items-center justify-between gap-4">
            <div className="flex items-center gap-3">
              <span className="px-3 py-1 bg-amber-100 text-amber-800 text-xs font-bold rounded-full">
                باقة: {entitlements.plan}
              </span>
              <span className="text-sm text-slate-600">
                تاريخ القاهرة: <span className="font-semibold text-slate-800">{entitlements.cairoDate}</span>
              </span>
              <span className="text-sm text-slate-600">
                مرات التحميل اليومية لكل مسمى: <span className="font-semibold text-blue-600">{entitlements.limits?.dailyDownloadLimitPerTitle}</span>
              </span>
            </div>
            <div className="text-xs text-slate-500">
              ⚡ تتجدد الحصص اليومية تلقائياً الساعة 00:00 بتوقيت القاهرة
            </div>
          </div>
        )}

        {cart.length === 0 ? (
          <div className="bg-white rounded-2xl border border-slate-200 p-12 text-center shadow-sm">
            <div className="w-16 h-16 bg-slate-100 text-slate-400 rounded-full flex items-center justify-center mx-auto mb-4">
              <ShoppingCart className="w-8 h-8" />
            </div>
            <h3 className="text-lg font-bold text-slate-800 mb-2">سلة المرشحين فارغة حالياً</h3>
            <p className="text-sm text-slate-500 mb-6 max-w-md mx-auto">
              يمكنك إضافة المرشحين حسب المسمى الوظيفي مباشرة من صفحة البحث لتجميعهم وتصديرهم في ملف إكسيل موحد أو متعدد الصفحات.
            </p>
            <Link
              to="/company/search"
              className="inline-flex items-center gap-2 px-6 py-2.5 rounded-xl bg-blue-600 text-white text-sm font-semibold hover:bg-blue-700 transition-colors"
            >
              <span>الانتقال لصفحة البحث</span>
              <ArrowRight className="w-4 h-4" />
            </Link>
          </div>
        ) : (
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
            {/* Cart Items List (2 cols) */}
            <div className="lg:col-span-2 space-y-6">
              {cart.map((item) => (
                <div
                  key={item._id || item.jobId?._id}
                  className="bg-white rounded-xl border border-slate-200 shadow-sm overflow-hidden"
                >
                  <div className="px-5 py-4 bg-slate-50 border-b border-slate-200 flex items-center justify-between">
                    <div className="flex items-center gap-2.5">
                      <Briefcase className="w-5 h-5 text-blue-600" />
                      <h3 className="font-bold text-slate-800 text-base">
                        {item.jobId?.title || 'مسمى وظيفي'}
                      </h3>
                      <span className="px-2.5 py-0.5 text-xs font-semibold rounded-full bg-blue-100 text-blue-800">
                        {item.candidates?.length || 0} / 10 مرشحين
                      </span>
                    </div>

                    <button
                      onClick={() => handleRemoveItem(item.jobId?._id)}
                      className="text-xs text-red-600 hover:text-red-700 hover:bg-red-50 p-1.5 rounded transition-colors"
                      title="حذف هذا المسمى من السلة"
                    >
                      <Trash2 className="w-4 h-4" />
                    </button>
                  </div>

                  <div className="p-4 divide-y divide-slate-100">
                    {item.candidates?.map((candidate) => (
                      <div
                        key={candidate._id}
                        className="py-3 first:pt-0 last:pb-0 flex items-center justify-between gap-4"
                      >
                        <div className="flex items-center gap-3">
                          <div className="w-10 h-10 rounded-full bg-slate-100 text-slate-600 flex items-center justify-center font-bold text-sm">
                            {candidate.fullName?.charAt(0) || 'م'}
                          </div>
                          <div>
                            <h4 className="text-sm font-bold text-slate-900">{candidate.fullName}</h4>
                            <div className="flex flex-wrap items-center gap-3 text-xs text-slate-500 mt-0.5">
                              {candidate.phone && (
                                <span className="flex items-center gap-1">
                                  <Phone className="w-3 h-3 text-emerald-600" />
                                  <span dir="ltr">{candidate.phone}</span>
                                </span>
                              )}
                              {candidate.governorate && (
                                <span className="flex items-center gap-1">
                                  <MapPin className="w-3 h-3 text-slate-400" />
                                  <span>{candidate.governorate}</span>
                                </span>
                              )}
                              {candidate.yearsOfExperience !== undefined && (
                                <span>خبرة: {candidate.yearsOfExperience} سنوات</span>
                              )}
                            </div>
                          </div>
                        </div>

                        <span className="text-xs px-2.5 py-1 bg-emerald-50 text-emerald-700 font-semibold rounded-md border border-emerald-200">
                          جاهز للتصدير
                        </span>
                      </div>
                    ))}
                  </div>
                </div>
              ))}
            </div>

            {/* Export Configuration Card (1 col) */}
            <div className="lg:col-span-1">
              <div className="bg-white rounded-2xl border border-slate-200 shadow-sm p-6 sticky top-24">
                <div className="flex items-center gap-2 mb-4 pb-3 border-b border-slate-100">
                  <FileSpreadsheet className="w-5 h-5 text-emerald-600" />
                  <h3 className="font-bold text-slate-900 text-base">خيارات تصدير ملف الإكسيل</h3>
                </div>

                <div className="space-y-3 mb-6">
                  <label
                    className={`block p-3.5 rounded-xl border-2 cursor-pointer transition-all ${
                      exportFormat === 'multi_sheet'
                        ? 'border-blue-600 bg-blue-50/50'
                        : 'border-slate-200 hover:border-slate-300'
                    }`}
                  >
                    <div className="flex items-start gap-3">
                      <input
                        type="radio"
                        name="exportFormat"
                        value="multi_sheet"
                        checked={exportFormat === 'multi_sheet'}
                        onChange={() => setExportFormat('multi_sheet')}
                        className="mt-1"
                      />
                      <div>
                        <div className="font-bold text-sm text-slate-800">
                          ملف متعدد الصفحات (Multi-Sheet)
                        </div>
                        <div className="text-xs text-slate-500 mt-0.5">
                          ورقة عمل (Sheet) منفصلة ومستقلة لكل مسمى وظيفي داخل نفس الملف.
                        </div>
                      </div>
                    </div>
                  </label>

                  <label
                    className={`block p-3.5 rounded-xl border-2 cursor-pointer transition-all ${
                      exportFormat === 'single_sheet_categorized'
                        ? 'border-blue-600 bg-blue-50/50'
                        : 'border-slate-200 hover:border-slate-300'
                    }`}
                  >
                    <div className="flex items-start gap-3">
                      <input
                        type="radio"
                        name="exportFormat"
                        value="single_sheet_categorized"
                        checked={exportFormat === 'single_sheet_categorized'}
                        onChange={() => setExportFormat('single_sheet_categorized')}
                        className="mt-1"
                      />
                      <div>
                        <div className="font-bold text-sm text-slate-800">
                          ملف موحد ومصنف (Single-Sheet)
                        </div>
                        <div className="text-xs text-slate-500 mt-0.5">
                          صفحة واحدة مجمعة تحتوي كافة المرشحين مصنفين ومفرزين حسب التخصص.
                        </div>
                      </div>
                    </div>
                  </label>
                </div>

                <div className="bg-slate-50 rounded-xl p-3.5 text-xs text-slate-600 mb-6 space-y-1.5 border border-slate-100">
                  <div className="flex justify-between">
                    <span>عدد التخصصات:</span>
                    <span className="font-bold text-slate-800">{cart.length}</span>
                  </div>
                  <div className="flex justify-between">
                    <span>إجمالي المرشحين:</span>
                    <span className="font-bold text-slate-800">{totalCandidatesCount}</span>
                  </div>
                  <div className="flex justify-between">
                    <span>صيغة الملف:</span>
                    <span className="font-bold text-emerald-700">Microsoft Excel (.xlsx)</span>
                  </div>
                </div>

                <button
                  onClick={handleExport}
                  disabled={exporting || cart.length === 0}
                  className="w-full py-3.5 px-4 rounded-xl bg-gradient-to-r from-emerald-600 to-teal-600 hover:from-emerald-700 hover:to-teal-700 text-white font-bold text-sm shadow-md hover:shadow-lg transition-all flex items-center justify-center gap-2 disabled:opacity-50"
                >
                  {exporting ? (
                    <span className="inline-block w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin" />
                  ) : (
                    <>
                      <Download className="w-4 h-4" />
                      <span>تصدير ملف الإكسيل الآن</span>
                    </>
                  )}
                </button>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
