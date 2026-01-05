
import React, { useState } from 'react';
import {
  MessageSquare,
  CheckCircle2,
  Trash2,
  Search,
  Calendar,
  MapPin,
  User,
  ChevronRight,
  ChevronDown,
  ShieldCheck,
  AlertCircle,
  Clock,
  ExternalLink,
  Check,
  Image as ImageIcon,
  X,
  FileText,
  AlertTriangle
} from 'lucide-react';
import { RepairRequest, RepairStatus, Category, OrderType, Language, Urgency } from '../types';
import { CATEGORY_ICONS, MOCK_HALLS, URGENCY_CONFIG } from '../constants';

interface ReportManagementProps {
  requests: RepairRequest[];
  onVerify: (id: string, formData?: { title: string; category: Category; urgency: Urgency }) => void;
  onDelete: (id: string) => void;
  onRestore: (id: string) => void;
  onPermanentDelete: (id: string) => void;
  language: Language;
}

const ReportManagement: React.FC<ReportManagementProps> = ({ requests, onVerify, onDelete, onRestore, onPermanentDelete, language }) => {
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedPhotos, setSelectedPhotos] = useState<string[] | null>(null);
  const [selectedReport, setSelectedReport] = useState<RepairRequest | null>(null);
  const [showTrash, setShowTrash] = useState(false);
  const [verifyFormData, setVerifyFormData] = useState<{
    title: string;
    category: Category;
    urgency: Urgency;
  } | null>(null);

  // 篩選出回報 (來自手機端的 VOLUNTEER 類型)
  const unverifiedReports = requests.filter(r => r.type === OrderType.VOLUNTEER && r.isDeleted === showTrash);

  const filteredReports = unverifiedReports.filter(r =>
    r.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
    r.hallName.includes(searchTerm) ||
    r.reporter.includes(searchTerm)
  );

  return (
    <div className="space-y-8 animate-in fade-in duration-500 pb-20">
      <div className="space-y-4 md:space-y-0">
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
          <div>
            <h1 className="text-3xl font-extrabold text-slate-900 tracking-tight flex items-center gap-3">
              <MessageSquare className="text-indigo-600" /> 手機端回報管理
            </h1>
            <p className="text-slate-500 font-medium">審核由 LINE 或手機瀏覽器送出的初步報修資料</p>
          </div>
        </div>
        <div className="flex flex-col md:flex-row md:items-center gap-3 md:justify-end">
          <div className="relative w-full md:w-80">
            <Search className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400" size={18} />
            <input
              type="text"
              placeholder="搜尋回報人或會館..."
              className="w-full pl-12 pr-4 py-3 bg-white border border-slate-200 rounded-2xl outline-none focus:ring-2 focus:ring-indigo-600 font-bold"
              value={searchTerm}
              onChange={e => setSearchTerm(e.target.value)}
            />
          </div>
          <button
            onClick={() => setShowTrash(!showTrash)}
            className={`flex items-center justify-center gap-2 px-5 py-3 rounded-2xl font-black transition-all w-full md:w-auto ${showTrash
              ? 'bg-rose-500 text-white shadow-lg shadow-rose-200'
              : 'bg-white text-slate-400 border border-slate-200 hover:border-rose-300 hover:text-rose-500'
              }`}
          >
            <Trash2 size={20} />
            {showTrash ? '回到列表' : '查看回收桶'}
          </button>
        </div>
      </div>

      {/* 手機端卡片式佈局 */}
      <div className="md:hidden space-y-4">
        {filteredReports.map((report) => (
          <div key={report.id} className={`bg-white rounded-[32px] border border-slate-200 shadow-sm p-6 space-y-4 ${report.isVerified ? 'opacity-60' : ''}`}>
            <div className="flex items-start gap-4">
              <div className={`p-3 rounded-2xl flex-shrink-0 ${report.isVerified ? 'bg-slate-200 text-slate-400' : 'bg-indigo-50 text-indigo-600'}`}>
                {CATEGORY_ICONS[report.category] || <AlertCircle size={20} />}
              </div>
              <div className="flex-1 min-w-0">
                <h3 className={`font-black text-lg mb-1 ${report.isVerified ? 'text-slate-400' : 'text-slate-900'}`}>{report.title}</h3>
                <p className="text-xs font-bold text-slate-400 line-clamp-2 mb-2">{report.description}</p>
                {report.photoUrls && report.photoUrls.length > 0 && (
                  <div className="flex items-center gap-1 text-xs font-bold text-indigo-500 cursor-pointer hover:underline" onClick={() => setSelectedPhotos(report.photoUrls || [])}>
                    <ImageIcon size={12} />
                    <span>查看 {report.photoUrls.length} 張照片</span>
                  </div>
                )}
              </div>
            </div>

            <div className="grid grid-cols-2 gap-3 pt-3 border-t border-slate-100">
              <div className="flex items-center gap-2 text-xs font-bold text-slate-600">
                <MapPin size={14} className="text-slate-300" />
                <span className="truncate">{report.hallName}</span>
              </div>
              <div className="flex items-center gap-2 text-xs font-bold text-slate-600">
                <User size={14} className="text-slate-300" />
                <span className="truncate">{report.reporter}</span>
              </div>
            </div>

            <div className="flex items-center justify-between pt-2">
              <div className="flex items-center gap-2 text-[10px] font-black text-slate-400">
                <Calendar size={12} />
                {new Date(report.createdAt).toLocaleDateString()}
              </div>
              {report.isVerified ? (
                <span className="inline-flex items-center gap-1.5 px-3 py-1 bg-slate-200 text-slate-500 rounded-full text-[10px] font-black uppercase tracking-wider">
                  <Check size={12} /> 已轉工單
                </span>
              ) : (
                <span className="inline-flex items-center gap-1.5 px-3 py-1 bg-amber-50 text-amber-600 rounded-full text-[10px] font-black uppercase tracking-wider animate-pulse">
                  <Clock size={12} /> 待核實
                </span>
              )}
            </div>

            <div className="pt-3 border-t border-slate-100">
              {showTrash ? (
                <div className="flex items-center justify-end gap-2">
                  <button
                    onClick={() => onRestore(report.id)}
                    className="flex-1 flex items-center justify-center gap-2 px-4 py-3 bg-indigo-50 text-indigo-600 rounded-xl hover:bg-indigo-600 hover:text-white transition-all shadow-sm font-black text-sm"
                  >
                    <Clock size={18} /> 復原
                  </button>
                  <button
                    onClick={() => onPermanentDelete(report.id)}
                    className="flex-1 flex items-center justify-center gap-2 px-4 py-3 bg-rose-50 text-rose-600 rounded-xl hover:bg-rose-600 hover:text-white transition-all shadow-sm font-black text-sm"
                  >
                    <Trash2 size={18} /> 永久刪除
                  </button>
                </div>
              ) : !report.isVerified ? (
                <button
                  onClick={() => {
                    setSelectedReport(report);
                    setVerifyFormData({
                      title: report.title,
                      category: report.category,
                      urgency: report.urgency || Urgency.MEDIUM,
                    });
                  }}
                  className="w-full flex items-center justify-center gap-1.5 px-4 py-2 bg-indigo-600 text-white font-black rounded-xl shadow-lg shadow-indigo-100 hover:bg-indigo-700 transition-all active:scale-95 text-sm"
                >
                  <FileText size={14} /> 審核案件
                </button>
              ) : (
                <div className="flex items-center justify-between">
                  <span className="text-slate-300 font-black text-xs italic">審核完畢</span>
                  <button
                    onClick={() => onDelete(report.id)}
                    className="p-2 text-slate-400 hover:text-rose-600 hover:bg-rose-50 rounded-xl transition-all"
                    title="移至回收桶"
                  >
                    <Trash2 size={16} />
                  </button>
                </div>
              )}
            </div>
          </div>
        ))}
        {filteredReports.length === 0 && (
          <div className="py-32 text-center space-y-4">
            <div className="flex justify-center">
              {showTrash ? <Trash2 size={64} className="text-slate-100" /> : <MessageSquare size={64} className="text-slate-100" />}
            </div>
            <p className="text-slate-300 font-black text-xl">
              {showTrash ? '回收桶內空空如也' : '目前尚無待審核的回報項目'}
            </p>
          </div>
        )}
      </div>

      {/* 桌面端表格佈局 */}
      <div className="hidden md:block bg-white rounded-[40px] border border-slate-200 shadow-sm overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-left">
            <thead className="bg-slate-50 text-slate-400 text-[10px] font-black uppercase tracking-widest border-b border-slate-100">
              <tr>
                <th className="px-8 py-5 whitespace-nowrap">回報內容</th>
                <th className="px-8 py-5 whitespace-nowrap">會館</th>
                <th className="px-8 py-5 whitespace-nowrap">提報人</th>
                <th className="px-8 py-5 whitespace-nowrap">日期</th>
                <th className="px-8 py-5 whitespace-nowrap">狀態</th>
                <th className="px-8 py-5 text-right whitespace-nowrap">{showTrash ? '回收操作' : '核實操作'}</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100">
              {filteredReports.map((report) => (
                <tr key={report.id} className={`group transition-all ${report.isVerified ? 'bg-slate-50 opacity-60' : 'hover:bg-slate-50/50'}`}>
                  <td className="px-8 py-6">
                    <div className="flex items-center gap-4">
                      <div className={`p-3 rounded-2xl flex-shrink-0 ${report.isVerified ? 'bg-slate-200 text-slate-400' : 'bg-indigo-50 text-indigo-600'}`}>
                        {CATEGORY_ICONS[report.category] || <AlertCircle size={20} />}
                      </div>
                      <div className="flex flex-col gap-0.5 min-w-0">
                        <span className={`font-black text-lg whitespace-nowrap ${report.isVerified ? 'text-slate-400' : 'text-slate-900'}`}>{report.title}</span>
                        <span className="text-xs font-bold text-slate-400 line-clamp-1">{report.description}</span>
                        {report.photoUrls && report.photoUrls.length > 0 && (
                          <div className="flex items-center gap-1 mt-1 text-xs font-bold text-indigo-500 cursor-pointer hover:underline whitespace-nowrap" onClick={() => setSelectedPhotos(report.photoUrls || [])}>
                            <ImageIcon size={12} />
                            <span>查看 {report.photoUrls.length} 張照片</span>
                          </div>
                        )}
                      </div>
                    </div>
                  </td>
                  <td className="px-8 py-6 whitespace-nowrap">
                    <div className="flex items-center gap-2 text-sm font-bold text-slate-600">
                      <MapPin size={14} className="text-slate-300 flex-shrink-0" />
                      <span className="whitespace-nowrap">{report.hallName}</span>
                    </div>
                  </td>
                  <td className="px-8 py-6 whitespace-nowrap">
                    <div className="flex items-center gap-2 text-sm font-bold text-slate-600">
                      <User size={14} className="text-slate-300 flex-shrink-0" />
                      <span className="whitespace-nowrap">{report.reporter}</span>
                    </div>
                  </td>
                  <td className="px-8 py-6 whitespace-nowrap">
                    <div className="flex items-center gap-2 text-[10px] font-black text-slate-400">
                      <Calendar size={12} className="flex-shrink-0" />
                      <span className="whitespace-nowrap">{new Date(report.createdAt).toLocaleDateString()}</span>
                    </div>
                  </td>
                  <td className="px-8 py-6 whitespace-nowrap">
                    {report.isVerified ? (
                      <span className="inline-flex items-center gap-1.5 px-3 py-1 bg-slate-200 text-slate-500 rounded-full text-[10px] font-black uppercase tracking-wider whitespace-nowrap">
                        <Check size={12} /> 已轉工單
                      </span>
                    ) : (
                      <span className="inline-flex items-center gap-1.5 px-3 py-1 bg-amber-50 text-amber-600 rounded-full text-[10px] font-black uppercase tracking-wider animate-pulse whitespace-nowrap">
                        <Clock size={12} /> 待核實
                      </span>
                    )}
                  </td>
                  <td className="px-8 py-6 text-right">
                    {showTrash ? (
                      <div className="flex items-center justify-end gap-2">
                        <button
                          onClick={() => onRestore(report.id)}
                          className="p-2.5 bg-indigo-50 text-indigo-600 rounded-xl hover:bg-indigo-600 hover:text-white transition-all shadow-sm"
                          title="復原"
                        >
                          <Clock size={18} />
                        </button>
                        <button
                          onClick={() => onPermanentDelete(report.id)}
                          className="p-2.5 bg-rose-50 text-rose-600 rounded-xl hover:bg-rose-600 hover:text-white transition-all shadow-sm"
                          title="永久刪除"
                        >
                          <Trash2 size={18} />
                        </button>
                      </div>
                    ) : !report.isVerified ? (
                      <div className="flex items-center justify-end gap-2">
                        <button
                          onClick={() => {
                            setSelectedReport(report);
                            setVerifyFormData({
                              title: report.title,
                              category: report.category,
                              urgency: report.urgency || Urgency.MEDIUM,
                            });
                          }}
                          className="flex items-center gap-1.5 px-4 py-1.5 bg-indigo-600 text-white font-black rounded-xl shadow-lg shadow-indigo-100 hover:bg-indigo-700 transition-all active:scale-95 text-xs"
                        >
                          <FileText size={14} /> 審核案件
                        </button>
                      </div>
                    ) : (
                      <div className="flex items-center justify-end gap-3 pr-4">
                        <span className="text-slate-300 font-black text-xs italic">審核完畢</span>
                        <button
                          onClick={() => onDelete(report.id)}
                          className="p-2 text-slate-400 hover:text-rose-600 hover:bg-rose-50 rounded-xl transition-all"
                          title="移至回收桶"
                        >
                          <Trash2 size={16} />
                        </button>
                      </div>
                    )}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
          {filteredReports.length === 0 && (
            <div className="py-32 text-center space-y-4">
              <div className="flex justify-center">
                {showTrash ? <Trash2 size={64} className="text-slate-100" /> : <MessageSquare size={64} className="text-slate-100" />}
              </div>
              <p className="text-slate-300 font-black text-xl">
                {showTrash ? '回收桶內空空如也' : '目前尚無待審核的回報項目'}
              </p>
            </div>
          )}
        </div>
      </div>
      {selectedPhotos && (
        <div className="fixed inset-0 z-[150] bg-slate-900/90 backdrop-blur-sm flex items-center justify-center p-4" onClick={() => setSelectedPhotos(null)}>
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

      {/* 詳細審核 Modal */}
      {selectedReport && (
        <div className="fixed inset-0 z-[120] flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-sm">
          <div className="bg-white w-full max-w-2xl rounded-[40px] p-8 shadow-2xl animate-in zoom-in-95 flex flex-col max-h-[90vh]">
            <div className="flex justify-between items-start border-b border-slate-100 pb-6 mb-6">
              <div>
                <h3 className="text-2xl font-black text-slate-900 flex items-center gap-2">
                  {CATEGORY_ICONS[selectedReport.category] || <AlertCircle size={24} />}
                  {selectedReport.title}
                </h3>
                <div className="flex items-center gap-3 mt-2 text-sm font-bold text-slate-500">
                  <span className="flex items-center gap-1"><MapPin size={14} /> {selectedReport.hallName}</span>
                  <span className="w-1 h-1 bg-slate-300 rounded-full"></span>
                  <span className="flex items-center gap-1"><User size={14} /> {selectedReport.reporter}</span>
                  <span className="w-1 h-1 bg-slate-300 rounded-full"></span>
                  <span className="flex items-center gap-1"><Calendar size={14} /> {new Date(selectedReport.createdAt).toLocaleDateString()}</span>
                </div>
              </div>
              <button onClick={() => {
                setSelectedReport(null);
                setVerifyFormData(null);
              }} className="p-2 hover:bg-slate-100 rounded-full transition-colors"><X size={24} className="text-slate-400" /></button>
            </div>

            <div className="flex-1 overflow-y-auto space-y-6 pr-2 custom-scrollbar">
              {verifyFormData && (
                <div className="space-y-4 p-6 bg-indigo-50 rounded-3xl border border-indigo-100">
                  <h4 className="text-sm font-black text-indigo-900 uppercase tracking-widest mb-4">核實資訊補充</h4>

                  <div className="space-y-2">
                    <label className="text-[10px] font-black text-indigo-400 uppercase tracking-widest">工單標題 *</label>
                    <input
                      type="text"
                      required
                      className="w-full px-4 py-3 bg-white border border-indigo-200 rounded-2xl outline-none font-bold focus:ring-2 focus:ring-indigo-500"
                      value={verifyFormData.title}
                      onChange={e => setVerifyFormData(prev => prev ? { ...prev, title: e.target.value } : null)}
                    />
                  </div>

                  <div className="grid grid-cols-2 gap-4">
                    <div className="space-y-2">
                      <label className="text-[10px] font-black text-indigo-400 uppercase tracking-widest">類別 *</label>
                      <div className="relative">
                        <select
                          required
                          className="w-full px-4 py-3 bg-white border border-indigo-200 rounded-2xl outline-none font-bold appearance-none cursor-pointer focus:ring-2 focus:ring-indigo-500"
                          value={verifyFormData.category}
                          onChange={e => {
                            const newCategory = e.target.value as Category;
                            setVerifyFormData(prev => prev ? {
                              ...prev,
                              category: newCategory,
                              title: `${newCategory} - ${selectedReport.hallName} 報修`
                            } : null);
                          }}
                        >
                          {Object.values(Category).map(cat => (
                            <option key={cat} value={cat}>{cat}</option>
                          ))}
                        </select>
                        <ChevronDown className="absolute right-4 top-1/2 -translate-y-1/2 text-indigo-400 pointer-events-none" size={20} />
                      </div>
                    </div>

                    <div className="space-y-2">
                      <label className="text-[10px] font-black text-indigo-400 uppercase tracking-widest">優先權 *</label>
                      <div className="relative">
                        <select
                          required
                          className="w-full px-4 py-3 bg-white border border-indigo-200 rounded-2xl outline-none font-bold appearance-none cursor-pointer focus:ring-2 focus:ring-indigo-500"
                          value={verifyFormData.urgency}
                          onChange={e => setVerifyFormData(prev => prev ? { ...prev, urgency: e.target.value as Urgency } : null)}
                        >
                          {Object.values(Urgency).map(urgency => (
                            <option key={urgency} value={urgency}>
                              {URGENCY_CONFIG[urgency].label} ({urgency})
                            </option>
                          ))}
                        </select>
                        <ChevronDown className="absolute right-4 top-1/2 -translate-y-1/2 text-indigo-400 pointer-events-none" size={20} />
                      </div>
                    </div>
                  </div>
                </div>
              )}

              <div className="space-y-2">
                <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest">狀況描述</label>
                <p className="text-slate-700 font-bold leading-relaxed bg-slate-50 p-4 rounded-2xl">
                  {selectedReport.description}
                </p>
              </div>

              {selectedReport.photoUrls && selectedReport.photoUrls.length > 0 && (
                <div className="space-y-2">
                  <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest">現場照片 ({selectedReport.photoUrls.length})</label>
                  <div className="grid grid-cols-3 gap-3">
                    {selectedReport.photoUrls.map((url, i) => (
                      <div key={i} className="space-y-1">
                        <div className="aspect-square rounded-xl overflow-hidden border border-slate-100 cursor-pointer hover:opacity-80 transition-opacity" onClick={() => setSelectedPhotos(selectedReport.photoUrls || [])}>
                          <img src={url} className="w-full h-full object-cover" />
                        </div>
                        {selectedReport.photoMetadata?.[i] && (
                          <div className="text-[10px] text-slate-400 font-bold px-1">
                            {selectedReport.photoMetadata[i].timestamp && (
                              <div className="flex items-center gap-1">
                                <Calendar size={10} />
                                {new Date(selectedReport.photoMetadata[i].timestamp!).toLocaleString()}
                              </div>
                            )}
                            {selectedReport.photoMetadata[i].location && (
                              <div className="flex items-center gap-1 truncate">
                                <MapPin size={10} />
                                {selectedReport.photoMetadata[i].location!.latitude.toFixed(6)}, {selectedReport.photoMetadata[i].location!.longitude.toFixed(6)}
                              </div>
                            )}
                          </div>
                        )}
                      </div>
                    ))}
                  </div>
                </div>
              )}
            </div>

            <div className="pt-8 mt-4 border-t border-slate-100 grid grid-cols-2 gap-4">
              <button
                onClick={() => {
                  onDelete(selectedReport.id);
                  setSelectedReport(null);
                  setVerifyFormData(null);
                }}
                className="flex items-center justify-center gap-2 py-4 rounded-3xl font-black text-rose-500 bg-rose-50 hover:bg-rose-100 transition-colors"
              >
                <Trash2 size={20} /> 移至回收桶
              </button>
              <button
                onClick={() => {
                  if (verifyFormData && verifyFormData.title.trim()) {
                    onVerify(selectedReport.id, verifyFormData);
                    setSelectedReport(null);
                    setVerifyFormData(null);
                  } else {
                    alert('請填寫工單標題');
                  }
                }}
                className="flex items-center justify-center gap-2 py-4 rounded-3xl font-black text-white bg-indigo-600 hover:bg-indigo-700 shadow-xl shadow-indigo-200 transition-all active:scale-95"
              >
                <ShieldCheck size={20} /> 確認導入
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default ReportManagement;
