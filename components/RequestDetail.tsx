
import React from 'react';
import {
  X,
  Calendar,
  User,
  MapPin,
  Wrench,
  Sparkles,
  ArrowLeft,
  Check,
  ClipboardCheck,
  FileText,
  Image as ImageIcon
} from 'lucide-react';
// Import Language type
import { RepairRequest, RepairStatus, Language, Category, Urgency } from '../types';
import { STATUS_CONFIG, URGENCY_CONFIG, CATEGORY_ICONS, STATUS_ORDER } from '../constants';

interface RequestDetailProps {
  request: RepairRequest;
  onClose: () => void;
  onUpdateStatus: (id: string, status: RepairStatus) => void;
  onReportWork: (id: string) => void;
  onUpdateCategoryAndUrgency?: (id: string, category: Category, urgency: Urgency) => void;
  // Add language to props
  language: Language;
}

// Destructure language from props
const RequestDetail: React.FC<RequestDetailProps> = ({ request, onClose, onUpdateStatus, onReportWork, onUpdateCategoryAndUrgency, language }) => {
  const currentStatusIndex = STATUS_ORDER.indexOf(request.status);
  const [selectedPhotos, setSelectedPhotos] = React.useState<string[] | null>(null);
  const [isSaving, setIsSaving] = React.useState(false);

  const handleCategoryChange = async (e: React.ChangeEvent<HTMLSelectElement>) => {
    const newCategory = e.target.value as Category;
    if (onUpdateCategoryAndUrgency && newCategory !== request.category) {
      setIsSaving(true);
      try {
        await onUpdateCategoryAndUrgency(request.id, newCategory, request.urgency);
      } catch (error) {
        console.error('更新失敗:', error);
        alert('更新失敗，請稍後再試');
      } finally {
        setIsSaving(false);
      }
    }
  };

  const handleUrgencyChange = async (e: React.ChangeEvent<HTMLSelectElement>) => {
    const newUrgency = e.target.value as Urgency;
    if (onUpdateCategoryAndUrgency && newUrgency !== request.urgency) {
      setIsSaving(true);
      try {
        await onUpdateCategoryAndUrgency(request.id, request.category, newUrgency);
      } catch (error) {
        console.error('更新失敗:', error);
        alert('更新失敗，請稍後再試');
      } finally {
        setIsSaving(false);
      }
    }
  };

  return (
    <>
      <div className="fixed inset-0 z-[300] flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-sm">
        <div className="bg-white w-full max-w-3xl rounded-3xl shadow-2xl overflow-hidden flex flex-col max-h-[95vh] animate-in zoom-in-95 duration-200">
          {/* Header */}
          <div className="p-6 border-b border-slate-100 flex items-center justify-between bg-white sticky top-0 z-10">
            <div className="flex items-center gap-3">
              <div className={`p-2 rounded-xl bg-slate-100`}>
                {CATEGORY_ICONS[request.category]}
              </div>
              <div>
                <h2 className="text-xl font-bold text-slate-900">{request.title}</h2>
                <p className="text-sm text-slate-500">工單編號：{request.id}</p>
              </div>
            </div>
            <button onClick={onClose} className="p-2 hover:bg-slate-100 rounded-full text-slate-400 transition-colors">
              <X size={20} />
            </button>
          </div>

          {/* Progress Bar Area */}
          <div className="px-10 py-8 bg-slate-50 border-b border-slate-100">
            <div className="relative flex justify-between">
              <div className="absolute top-1/2 left-0 w-full h-0.5 bg-slate-200 -translate-y-1/2 z-0"></div>
              <div
                className="absolute top-1/2 left-0 h-0.5 bg-indigo-600 -translate-y-1/2 z-0 transition-all duration-500"
                style={{ width: `${(currentStatusIndex / (STATUS_ORDER.length - 1)) * 100}%` }}
              ></div>

              {STATUS_ORDER.map((status, index) => {
                const isActive = index <= currentStatusIndex;
                const isCurrent = index === currentStatusIndex;
                return (
                  <div key={status} className="relative z-10 flex flex-col items-center">
                    <div className={`w-8 h-8 rounded-full flex items-center justify-center border-2 transition-all duration-300 ${isCurrent ? 'bg-indigo-600 border-indigo-600 text-white' :
                      isActive ? 'bg-indigo-50 border-indigo-600 text-indigo-600' :
                        'bg-white border-slate-200 text-slate-300'
                      }`}>
                      {isActive ? <Check size={14} /> : <span className="text-[10px] font-bold">{index + 1}</span>}
                    </div>
                    <span className={`absolute -bottom-6 whitespace-nowrap text-[10px] font-black uppercase tracking-widest ${isActive ? 'text-indigo-600' : 'text-slate-400'
                      }`}>
                      {STATUS_CONFIG[status as RepairStatus].label}
                    </span>
                  </div>
                );
              })}
            </div>
          </div>

          {/* Content */}
          <div className="flex-1 overflow-y-auto p-8 space-y-8">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
              <div className="space-y-6">
                <div className="flex items-start gap-3">
                  <MapPin size={20} className="text-slate-400 shrink-0 mt-1" />
                  <div>
                    <p className="text-[10px] text-slate-400 font-black uppercase tracking-wider mb-1">會館與區域</p>
                    <p className="text-base font-bold text-slate-800">{request.hallName}</p>
                    <p className="text-xs text-slate-500">{request.hallArea || '尚未指定區域'}</p>
                  </div>
                </div>
                <div className="flex items-start gap-3">
                  <Calendar size={20} className="text-slate-400 shrink-0 mt-1" />
                  <div>
                    <p className="text-[10px] text-slate-400 font-black uppercase tracking-wider mb-1">報修日期</p>
                    <p className="text-base font-bold text-slate-800">
                      {new Date(request.createdAt).toLocaleString('zh-TW')}
                    </p>
                  </div>
                </div>
              </div>
              <div className="space-y-6">
                <div className="flex items-start gap-3">
                  <User size={20} className="text-slate-400 shrink-0 mt-1" />
                  <div>
                    <p className="text-[10px] text-slate-400 font-black uppercase tracking-wider mb-1">提報人</p>
                    <p className="text-base font-bold text-slate-800">{request.reporter}</p>
                  </div>
                </div>
                <div className="flex items-start gap-3">
                  <Wrench size={20} className="text-slate-400 shrink-0 mt-1" />
                  <div className="flex-1">
                    <p className="text-[10px] text-slate-400 font-black uppercase tracking-wider mb-1">優先權等級</p>
                    {onUpdateCategoryAndUrgency ? (
                      <select
                        value={request.urgency}
                        onChange={handleUrgencyChange}
                        disabled={isSaving}
                        className="w-full px-3 py-2 bg-white border-2 border-indigo-300 rounded-xl text-sm font-bold text-slate-800 focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 disabled:opacity-50 disabled:cursor-not-allowed cursor-pointer hover:border-indigo-400 transition-colors appearance-none bg-[url('data:image/svg+xml;charset=UTF-8,%3Csvg xmlns=%22http://www.w3.org/2000/svg%22 viewBox=%220 0 24 24%22 fill=%22none%22 stroke=%22currentColor%22 stroke-width=%222%22 stroke-linecap=%22round%22 stroke-linejoin=%22round%22%3E%3Cpolyline points=%226 9 12 15 18 9%22%3E%3C/polyline%3E%3C/svg%3E')] bg-no-repeat bg-right pr-8"
                        style={{ backgroundPosition: 'right 0.5rem center', paddingRight: '2rem' }}
                      >
                        <option value={Urgency.LOW}>低</option>
                        <option value={Urgency.MEDIUM}>中</option>
                        <option value={Urgency.HIGH}>高</option>
                        <option value={Urgency.EMERGENCY}>緊急</option>
                      </select>
                    ) : (
                      <div className={`inline-flex px-2 py-0.5 rounded text-xs font-black uppercase ${URGENCY_CONFIG[request.urgency].color}`}>
                        {URGENCY_CONFIG[request.urgency].label}
                      </div>
                    )}
                  </div>
                </div>
              </div>
            </div>

            {/* 類別選擇區域 */}
            <div className="bg-slate-50 p-6 rounded-3xl border border-slate-100">
              <h4 className="text-[10px] text-slate-400 font-black uppercase tracking-wider mb-3">工單類別</h4>
              {onUpdateCategoryAndUrgency ? (
                <div className="flex items-center gap-3">
                  <div className="p-3 rounded-xl bg-white border border-slate-200 shrink-0">
                    {CATEGORY_ICONS[request.category]}
                  </div>
                  <select
                    value={request.category}
                    onChange={handleCategoryChange}
                    disabled={isSaving}
                    className="flex-1 px-4 py-3 bg-white border-2 border-indigo-300 rounded-xl text-base font-bold text-slate-800 focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 disabled:opacity-50 disabled:cursor-not-allowed cursor-pointer hover:border-indigo-400 transition-colors appearance-none bg-[url('data:image/svg+xml;charset=UTF-8,%3Csvg xmlns=%22http://www.w3.org/2000/svg%22 viewBox=%220 0 24 24%22 fill=%22none%22 stroke=%22currentColor%22 stroke-width=%222%22 stroke-linecap=%22round%22 stroke-linejoin=%22round%22%3E%3Cpolyline points=%226 9 12 15 18 9%22%3E%3C/polyline%3E%3C/svg%3E')] bg-no-repeat bg-right pr-10"
                    style={{ backgroundPosition: 'right 0.75rem center', paddingRight: '2.5rem' }}
                  >
                    <option value={Category.AC}>空調</option>
                    <option value={Category.ELECTRICAL}>機電</option>
                    <option value={Category.FIRE}>消防</option>
                    <option value={Category.AED}>AED</option>
                    <option value={Category.WEAK_CURRENT}>弱電</option>
                    <option value={Category.PLUMBING}>衛生系統</option>
                    <option value={Category.WATER}>飲水機</option>
                    <option value={Category.GARDENING}>園藝</option>
                    <option value={Category.DECO}>裝潢</option>
                    <option value={Category.OTHER}>其他</option>
                  </select>
                </div>
              ) : (
                <div className="flex items-center gap-3">
                  <div className="p-3 rounded-xl bg-white border border-slate-200">
                    {CATEGORY_ICONS[request.category]}
                  </div>
                  <span className="text-base font-bold text-slate-800">{request.category}</span>
                </div>
              )}
            </div>

            <div className="bg-slate-50 p-6 rounded-3xl border border-slate-100">
              <h4 className="text-[10px] text-slate-400 font-black uppercase tracking-wider mb-3">詳細狀況描述</h4>
              <p className="text-sm text-slate-700 leading-relaxed font-medium">{request.description}</p>
            </div>

            {/* Photo Gallery */}
            {request.photoUrls && request.photoUrls.length > 0 && (
              <div className="bg-slate-50 p-6 rounded-3xl border border-slate-100">
                <h4 className="text-[10px] text-slate-400 font-black uppercase tracking-wider mb-3 flex items-center gap-2">
                  <ImageIcon size={14} /> 現場照片
                </h4>
                <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                  {request.photoUrls.map((url, i) => (
                    <div key={i} className="space-y-1">
                      <div
                        className="aspect-square rounded-2xl overflow-hidden border border-slate-200 cursor-pointer hover:shadow-lg transition-all active:scale-95 group relative"
                        onClick={() => setSelectedPhotos(request.photoUrls || [])}
                      >
                        <img src={url} className="w-full h-full object-cover" />
                        <div className="absolute inset-0 bg-black/0 group-hover:bg-black/10 transition-colors"></div>
                      </div>
                      {request.photoMetadata?.[i] && (
                        <div className="text-[10px] text-slate-400 font-bold px-1">
                          {request.photoMetadata[i].timestamp && (
                            <div className="flex items-center gap-1">
                              <Calendar size={10} />
                              {new Date(request.photoMetadata[i].timestamp!).toLocaleString()}
                            </div>
                          )}
                          {request.photoMetadata[i].location && (
                            <div className="flex items-center gap-1 truncate">
                              <MapPin size={10} />
                              {request.photoMetadata[i].location!.latitude.toFixed(6)}, {request.photoMetadata[i].location!.longitude.toFixed(6)}
                            </div>
                          )}
                        </div>
                      )}
                    </div>
                  ))}
                </div>
              </div>
            )}

            {request.aiAnalysis && (
              <div className="bg-indigo-50 border border-indigo-100 p-6 rounded-3xl space-y-4">
                <div className="flex items-center gap-2 text-indigo-700">
                  <Sparkles size={18} />
                  <h4 className="font-bold">Gemini AI 智能分析</h4>
                </div>
                <div className="grid grid-cols-1 gap-6">
                  <div>
                    <p className="text-[10px] text-indigo-400 font-black uppercase tracking-widest mb-2">可能原因探討</p>
                    <div className="flex flex-wrap gap-2">
                      {request.aiAnalysis.potentialCauses.map((cause, i) => (
                        <span key={i} className="text-xs bg-white text-indigo-600 px-3 py-1 rounded-full border border-indigo-100 shadow-sm font-bold">
                          {cause}
                        </span>
                      ))}
                    </div>
                  </div>
                  <div>
                    <p className="text-[10px] text-indigo-400 font-black uppercase tracking-widest mb-2">現場緊急處置建議</p>
                    <p className="text-sm text-indigo-800 leading-relaxed bg-white/60 p-4 rounded-2xl border border-indigo-50 font-medium">
                      {request.aiAnalysis.maintenanceTips}
                    </p>
                  </div>
                </div>
              </div>
            )}
          </div>

          {/* Footer Actions */}
          <div className="p-8 border-t border-slate-100 bg-slate-50 grid grid-cols-3 gap-4">
            <button
              onClick={onClose}
              className="flex items-center justify-center gap-2 px-6 py-4 bg-white text-slate-600 font-black rounded-3xl border border-slate-200 hover:bg-slate-50 transition-all active:scale-95"
            >
              <ArrowLeft size={18} />
              返回
            </button>

            <button
              onClick={() => onUpdateStatus(request.id, RepairStatus.IN_PROGRESS)}
              disabled={request.status !== RepairStatus.PENDING}
              className={`flex items-center justify-center gap-2 px-6 py-4 font-black rounded-3xl shadow-xl transition-all active:scale-95 ${request.status === RepairStatus.PENDING
                ? 'bg-emerald-600 text-white shadow-emerald-200 hover:bg-emerald-700'
                : 'bg-slate-200 text-slate-400 shadow-none cursor-not-allowed'
                }`}
            >
              <Check size={18} />
              確認
            </button>

            <button
              onClick={() => onReportWork(request.id)}
              disabled={request.status === RepairStatus.PENDING || request.status === RepairStatus.CLOSED}
              className={`flex items-center justify-center gap-2 px-6 py-4 font-black rounded-3xl shadow-xl transition-all active:scale-95 ${request.status !== RepairStatus.PENDING && request.status !== RepairStatus.CLOSED
                ? 'bg-indigo-600 text-white shadow-indigo-200 hover:bg-indigo-700'
                : 'bg-slate-200 text-slate-400 shadow-none cursor-not-allowed'
                }`}
            >
              <FileText size={18} />
              回報工單
            </button>
          </div>
        </div>
      </div>
      {selectedPhotos && (
        <div className="fixed inset-0 z-[60] bg-slate-900/90 backdrop-blur-sm flex items-center justify-center p-4" onClick={() => setSelectedPhotos(null)}>
          <button className="absolute top-8 right-8 text-white hover:text-rose-400 transition-colors">
            <X size={32} />
          </button>
          <div className="w-full max-w-5xl h-[80vh] flex gap-4 overflow-x-auto snap-x snap-mandatory p-4" onClick={e => e.stopPropagation()}>
            {selectedPhotos.map((url, i) => (
              <div key={i} className="flex-shrink-0 w-full h-full flex items-center justify-center snap-center relative">
                <img src={url} alt={`Photo ${i + 1}`} className="max-w-full max-h-full object-contain rounded-lg shadow-2xl" />
                <span className="absolute bottom-4 left-1/2 -translate-x-1/2 bg-black/50 text-white px-3 py-1 rounded-full text-sm font-bold">
                  {i + 1} / {selectedPhotos.length}
                </span>
              </div>
            ))}
          </div>
        </div>
      )}
    </>
  );
};

export default RequestDetail;
