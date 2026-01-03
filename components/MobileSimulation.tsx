
import React, { useState, useRef, useEffect, useMemo } from 'react';
import {
  X,
  Send,
  Camera,
  User,
  Calendar,
  Wrench,
  CheckCircle2,
  ShieldAlert,
  ChevronDown,
  Image as ImageIcon,
  MessageCircle,
  MoreHorizontal,
  Home,
  Plus,
  LogOut,
  ArrowLeft,
  Trash2
} from 'lucide-react';
import { MOCK_HALLS } from '../constants';
import { Category, OrderType, RepairRequest, DisasterReport, RepairStatus } from '../types';

interface MobileSimulationProps {
  onClose: () => void;
  onSubmitReport: (data: Partial<RepairRequest>) => void;
  activeDisaster?: DisasterReport | null;
  requests?: RepairRequest[];
}

const MobileSimulation: React.FC<MobileSimulationProps> = ({ onClose, onSubmitReport, activeDisaster, requests = [] }) => {
  const [activeForm, setActiveForm] = useState<'NONE' | 'REPAIR' | 'FINISH' | 'DISASTER'>('NONE');
  const [showPendingSelectModal, setShowPendingSelectModal] = useState(false);

  // 分離不同表單的數據
  const [repairFormData, setRepairFormData] = useState({
    hallName: MOCK_HALLS[0].name,
    reporter: '',
    description: '',
    category: Category.AC,
  });

  const [finishFormData, setFinishFormData] = useState({
    hallName: MOCK_HALLS[0].name,
    reporter: '',
    workDescription: '',
    completionDate: new Date().toISOString().split('T')[0],
  });

  const [repairImages, setRepairImages] = useState<string[]>([]);
  const [finishImages, setFinishImages] = useState<string[]>([]);
  const [repairErrors, setRepairErrors] = useState<{ reporter?: string; description?: string }>({});
  const [finishErrors, setFinishErrors] = useState<{ reporter?: string; workDescription?: string }>({});
  const [selectedRequestId, setSelectedRequestId] = useState<string | null>(null);

  const fileInputRef = useRef<HTMLInputElement>(null);
  const reporterInputRef = useRef<HTMLInputElement>(null);
  const descriptionInputRef = useRef<HTMLTextAreaElement>(null);

  // 字數限制
  const REPORTER_MAX_LENGTH = 50;
  const DESCRIPTION_MAX_LENGTH = 500;

  // 處理文件上傳
  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>, formType: 'REPAIR' | 'FINISH') => {
    const files = e.target.files;
    if (files) {
      Array.from(files).forEach((file: File) => {
        const reader = new FileReader();
        reader.onloadend = () => {
          if (formType === 'REPAIR') {
            setRepairImages(prev => [...prev, reader.result as string]);
          } else {
            setFinishImages(prev => [...prev, reader.result as string]);
          }
        };
        reader.readAsDataURL(file);
      });
    }
  };

  const removeImage = (index: number, formType: 'REPAIR' | 'FINISH') => {
    if (formType === 'REPAIR') {
      setRepairImages(prev => prev.filter((_, i) => i !== index));
    } else {
      setFinishImages(prev => prev.filter((_, i) => i !== index));
    }
  };

  // 驗證報修表單
  const validateRepairForm = () => {
    const newErrors: { reporter?: string; description?: string } = {};

    if (!repairFormData.reporter.trim()) {
      newErrors.reporter = '請輸入姓名或職稱';
    } else if (repairFormData.reporter.length > REPORTER_MAX_LENGTH) {
      newErrors.reporter = `姓名或職稱不能超過 ${REPORTER_MAX_LENGTH} 個字`;
    }

    if (!repairFormData.description.trim()) {
      newErrors.description = '請輸入狀況描述';
    } else if (repairFormData.description.length > DESCRIPTION_MAX_LENGTH) {
      newErrors.description = `狀況描述不能超過 ${DESCRIPTION_MAX_LENGTH} 個字`;
    } else if (repairFormData.description.trim().length < 10) {
      newErrors.description = '狀況描述至少需要 10 個字';
    }

    setRepairErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  // 驗證完工表單
  const validateFinishForm = () => {
    const newErrors: { reporter?: string; workDescription?: string } = {};

    if (!finishFormData.reporter.trim()) {
      newErrors.reporter = '請輸入姓名或職稱';
    } else if (finishFormData.reporter.length > REPORTER_MAX_LENGTH) {
      newErrors.reporter = `姓名或職稱不能超過 ${REPORTER_MAX_LENGTH} 個字`;
    }

    if (!finishFormData.workDescription.trim()) {
      newErrors.workDescription = '請輸入完工說明';
    } else if (finishFormData.workDescription.length > DESCRIPTION_MAX_LENGTH) {
      newErrors.workDescription = `完工說明不能超過 ${DESCRIPTION_MAX_LENGTH} 個字`;
    }

    setFinishErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  // 處理報修表單提交
  const handleRepairSubmit = (e: React.FormEvent) => {
    e.preventDefault();

    if (!validateRepairForm()) {
      if (repairErrors.reporter) {
        reporterInputRef.current?.focus();
      } else if (repairErrors.description) {
        descriptionInputRef.current?.focus();
      }
      return;
    }

    onSubmitReport({
      ...repairFormData,
      type: OrderType.VOLUNTEER,
      title: `${repairFormData.category} - ${repairFormData.hallName} 報修`,
      photoUrls: repairImages,
    });
    alert('感謝您的回報，工單已建立！照片已同步上傳至系統。');
    setActiveForm('NONE');
    setRepairImages([]);
    setRepairFormData({
      hallName: MOCK_HALLS[0].name,
      reporter: '',
      description: '',
      category: Category.AC,
    });
    setRepairErrors({});
  };

  // 處理完工表單提交
  const handleFinishSubmit = (e: React.FormEvent) => {
    e.preventDefault();

    if (!validateFinishForm()) {
      return;
    }

    onSubmitReport({
      ...finishFormData,
      id: selectedRequestId || undefined,
      type: OrderType.VOLUNTEER,
      title: `${finishFormData.hallName} 修繕完工回報`,
      processingDescription: finishFormData.workDescription,
      photoUrls: finishImages,
    });
    alert(selectedRequestId ? '工單修繕資料已更新並結案！' : '完工回報已提交！感謝您的回報。');
    setActiveForm('NONE');
    setFinishImages([]);
    setSelectedRequestId(null);
    setFinishFormData({
      hallName: MOCK_HALLS[0].name,
      reporter: '',
      workDescription: '',
      completionDate: new Date().toISOString().split('T')[0],
    });
    setFinishErrors({});
  };

  // 當表單打開時自動聚焦
  useEffect(() => {
    if (activeForm === 'REPAIR' || activeForm === 'FINISH') {
      setTimeout(() => {
        reporterInputRef.current?.focus();
      }, 300);
    }
  }, [activeForm]);

  // 報修表單 JSX
  const repairFormJSX = (
    <div className="absolute inset-x-0 bottom-0 top-16 bg-white z-20 flex flex-col animate-in slide-in-from-bottom duration-300 rounded-t-[40px] shadow-2xl border-t border-slate-100">
      <div className="p-6 flex items-center justify-between border-b border-slate-50">
        <div className="flex items-center gap-3">
          <button onClick={() => { setActiveForm('NONE'); setRepairImages([]); }} className="p-2 text-slate-400 hover:bg-slate-50 rounded-full transition-colors">
            <ArrowLeft size={20} />
          </button>
          <h3 className="text-lg font-black text-slate-800">會館線上報修</h3>
        </div>
        <button onClick={() => { setActiveForm('NONE'); setRepairImages([]); }} className="p-2 text-slate-400 hover:bg-slate-50 rounded-full transition-colors">
          <X size={20} />
        </button>
      </div>
      <form onSubmit={handleRepairSubmit} className="p-8 space-y-6 overflow-y-auto flex-1 pb-32 custom-scrollbar">
        <div className="space-y-1">
          <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest">選擇會館</label>
          <div className="relative">
            <select
              className="w-full px-4 py-4 bg-slate-50 rounded-2xl border-none outline-none font-bold appearance-none cursor-pointer focus:ring-2 focus:ring-indigo-500 focus:bg-white transition-all"
              value={repairFormData.hallName}
              onChange={e => setRepairFormData(prev => ({ ...prev, hallName: e.target.value }))}
            >
              {MOCK_HALLS.map(h => <option key={h.id} value={h.name}>{h.name}</option>)}
            </select>
            <ChevronDown className="absolute right-4 top-1/2 -translate-y-1/2 text-slate-400 pointer-events-none" size={20} />
          </div>
        </div>

        {/* Unfinished Requests List */}
        {requests.length > 0 && requests.filter(r =>
          r.hallName === finishFormData.hallName &&
          r.status !== RepairStatus.CLOSED &&
          !r.isDeleted
        ).length > 0 && (
            <div className="space-y-2 animate-in slide-in-from-right-4 duration-500">
              <label className="text-[10px] font-black text-indigo-500 uppercase tracking-widest flex items-center gap-1">
                <ShieldAlert size={12} /> 尚有未完工項目 (點擊帶入)
              </label>
              <div className="flex gap-3 overflow-x-auto pb-2 snap-x snap-mandatory custom-scrollbar">
                {requests
                  .filter(r =>
                    r.hallName === finishFormData.hallName &&
                    r.status !== RepairStatus.CLOSED &&
                    !r.isDeleted
                  )
                  .map(req => (
                    <div
                      key={req.id}
                      onClick={() => {
                        if (window.confirm('是否載入此報修單內容與照片？\n(這將覆蓋目前的輸入內容)')) {
                          setFinishFormData(prev => ({
                            ...prev,
                            reporter: req.reporter,
                            workDescription: `[原報修內容]\n${req.description}\n\n[完工說明]\n`,
                          }));
                          setFinishImages(req.photoUrls || []);
                        }
                      }}
                      className="min-w-[200px] p-3 bg-indigo-50 border border-indigo-100 rounded-2xl cursor-pointer hover:bg-indigo-100 transition-colors snap-center group relative overflow-hidden"
                    >
                      <div className="absolute top-0 right-0 p-2 opacity-0 group-hover:opacity-100 transition-opacity">
                        <div className="bg-indigo-600 text-white text-[10px] px-2 py-0.5 rounded-full font-bold">載入</div>
                      </div>
                      <h4 className="font-bold text-xs text-indigo-900 line-clamp-1 mb-1">{req.title}</h4>
                      <p className="text-[10px] text-indigo-700 line-clamp-2 mb-2 bg-white/50 p-1.5 rounded-lg">{req.description}</p>
                      <div className="flex items-center gap-2 text-[10px] text-indigo-400 font-bold">
                        <User size={10} /> {req.reporter}
                        <span className="w-0.5 h-0.5 bg-indigo-300 rounded-full"></span>
                        <span>{new Date(req.createdAt).toLocaleDateString()}</span>
                      </div>
                    </div>
                  ))}
              </div>
            </div>
          )}

        <div className="space-y-1">
          <div className="flex items-center justify-between">
            <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest">姓名 / 職稱</label>
            <span className={`text-[10px] font-bold ${repairFormData.reporter.length > REPORTER_MAX_LENGTH ? 'text-rose-500' : 'text-slate-400'}`}>
              {repairFormData.reporter.length}/{REPORTER_MAX_LENGTH}
            </span>
          </div>
          <div className="relative">
            <User className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400" size={18} />
            <input
              ref={reporterInputRef}
              required
              maxLength={REPORTER_MAX_LENGTH}
              placeholder="請輸入您的姓名或職稱"
              className={`w-full pl-12 pr-4 py-4 bg-slate-50 rounded-2xl border-none outline-none font-bold transition-all focus:ring-2 focus:ring-indigo-500 focus:bg-white ${repairErrors.reporter ? 'ring-2 ring-rose-500 bg-rose-50' : ''
                }`}
              value={repairFormData.reporter}
              onChange={e => setRepairFormData(prev => ({ ...prev, reporter: e.target.value }))}
            />
          </div>
          {repairErrors.reporter && (
            <p className="text-[10px] text-rose-500 font-bold mt-1 flex items-center gap-1">
              <X size={12} /> {repairErrors.reporter}
            </p>
          )}
        </div>

        <div className="space-y-1">
          <div className="flex items-center justify-between">
            <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest">狀況描述</label>
            <span className={`text-[10px] font-bold ${repairFormData.description.length > DESCRIPTION_MAX_LENGTH ? 'text-rose-500' : repairFormData.description.length < 10 ? 'text-amber-500' : 'text-slate-400'}`}>
              {repairFormData.description.length}/{DESCRIPTION_MAX_LENGTH}
            </span>
          </div>
          <div className="relative">
            <MessageCircle className="absolute left-4 top-4 text-slate-400" size={18} />
            <textarea
              ref={descriptionInputRef}
              required
              maxLength={DESCRIPTION_MAX_LENGTH}
              rows={5}
              placeholder="請詳細描述故障或需要維修的狀況，至少 10 個字..."
              className={`w-full pl-12 pr-4 py-4 bg-slate-50 rounded-2xl border-none outline-none font-bold resize-none transition-all focus:ring-2 focus:ring-indigo-500 focus:bg-white ${repairErrors.description ? 'ring-2 ring-rose-500 bg-rose-50' : ''
                }`}
              value={repairFormData.description}
              onChange={e => setRepairFormData(prev => ({ ...prev, description: e.target.value }))}
            />
          </div>
          {repairErrors.description && (
            <p className="text-[10px] text-rose-500 font-bold mt-1 flex items-center gap-1">
              <X size={12} /> {repairErrors.description}
            </p>
          )}
          {!repairErrors.description && repairFormData.description.length > 0 && repairFormData.description.length < 10 && (
            <p className="text-[10px] text-amber-500 font-bold mt-1">
              ⚠️ 建議至少輸入 10 個字以提供更詳細的資訊
            </p>
          )}
        </div>

        <div className="space-y-3">
          <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest">現場照片回報 ({repairImages.length})</label>

          {/* 照片預覽區 */}
          {repairImages.length > 0 && (
            <div className="grid grid-cols-3 gap-2 mb-2">
              {repairImages.map((img, idx) => (
                <div key={idx} className="relative aspect-square rounded-xl overflow-hidden border border-slate-100 group">
                  <img src={img} className="w-full h-full object-cover" />
                  <button
                    type="button"
                    onClick={() => removeImage(idx, 'REPAIR')}
                    className="absolute top-1 right-1 p-1 bg-rose-500 text-white rounded-full opacity-0 group-hover:opacity-100 transition-opacity"
                  >
                    <X size={12} />
                  </button>
                </div>
              ))}
            </div>
          )}

          <input
            type="file"
            ref={fileInputRef}
            onChange={e => handleFileChange(e, 'REPAIR')}
            accept="image/*"
            multiple
            className="hidden"
          />

          <button
            type="button"
            onClick={() => fileInputRef.current?.click()}
            className="w-full p-6 border-2 border-dashed border-slate-200 rounded-[32px] flex flex-col items-center gap-2 text-slate-400 hover:border-indigo-300 hover:bg-indigo-50 transition-all"
          >
            <Camera size={32} />
            <p className="text-xs font-black">點擊開啟相機或上傳照片</p>
          </button>
        </div>

        <button
          type="submit"
          disabled={!repairFormData.reporter.trim() || !repairFormData.description.trim()}
          className="w-full py-5 bg-indigo-600 text-white font-black rounded-3xl shadow-xl shadow-indigo-100 flex items-center justify-center gap-2 transition-all active:scale-95 disabled:opacity-50 disabled:cursor-not-allowed disabled:active:scale-100"
        >
          <Send size={18} /> 送出報修資料
        </button>
      </form>
    </div>
  );

  // 完工回報表單 JSX
  const finishFormJSX = (
    <div className="absolute inset-x-0 bottom-0 top-16 bg-white z-20 flex flex-col animate-in slide-in-from-bottom duration-300 rounded-t-[40px] shadow-2xl border-t border-slate-100">
      <div className="p-6 flex items-center justify-between border-b border-slate-50">
        <div className="flex items-center gap-3">
          <button onClick={() => { setActiveForm('NONE'); setFinishImages([]); }} className="p-2 text-slate-400 hover:bg-slate-50 rounded-full transition-colors">
            <ArrowLeft size={20} />
          </button>
          <h3 className="text-lg font-black text-slate-800">修繕完工回報</h3>
        </div>
        <button onClick={() => { setActiveForm('NONE'); setFinishImages([]); }} className="p-2 text-slate-400 hover:bg-slate-50 rounded-full transition-colors">
          <X size={20} />
        </button>
      </div>
      <form onSubmit={handleFinishSubmit} className="p-8 space-y-6 overflow-y-auto flex-1 pb-32 custom-scrollbar">
        <div className="space-y-1">
          <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest">選擇會館</label>
          <div className="relative">
            <select
              className="w-full px-4 py-4 bg-slate-50 rounded-2xl border-none outline-none font-bold appearance-none cursor-pointer focus:ring-2 focus:ring-indigo-500 focus:bg-white transition-all"
              value={finishFormData.hallName}
              onChange={e => {
                const newHall = e.target.value;
                setFinishFormData(prev => ({ ...prev, hallName: newHall }));

                // Auto-open modal if there are pending requests
                const hasPending = requests.some(r =>
                  r.hallName === newHall &&
                  r.status !== RepairStatus.CLOSED &&
                  r.status !== RepairStatus.CONSTRUCTION_DONE &&
                  !r.isDeleted
                );
                if (hasPending) {
                  setShowPendingSelectModal(true);
                }
              }}
            >
              {MOCK_HALLS.map(h => <option key={h.id} value={h.name}>{h.name}</option>)}
            </select>
            <ChevronDown className="absolute right-4 top-1/2 -translate-y-1/2 text-slate-400 pointer-events-none" size={20} />
          </div>
        </div>

        {/* Unfinished Requests Button */}
        {requests.length > 0 && requests.filter(r =>
          r.hallName === finishFormData.hallName &&
          r.status !== RepairStatus.CLOSED &&
          r.status !== RepairStatus.CONSTRUCTION_DONE &&
          !r.isDeleted
        ).length > 0 && (
            <div className="animate-in slide-in-from-right-4 duration-500">
              <button
                type="button"
                onClick={() => setShowPendingSelectModal(true)}
                className="w-full mt-2 py-3 px-4 bg-indigo-50 text-indigo-600 rounded-xl font-bold flex items-center justify-center gap-2 hover:bg-indigo-100 transition-colors border border-indigo-100 placeholder:animate-in fade-in"
              >
                <ShieldAlert size={16} />
                尚有 {requests.filter(r => r.hallName === finishFormData.hallName && r.status !== RepairStatus.CLOSED && r.status !== RepairStatus.CONSTRUCTION_DONE && !r.isDeleted).length} 筆未完工項目 (點擊選擇)
              </button>
            </div>
          )}

        <div className="space-y-1">
          <div className="flex items-center justify-between">
            <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest">姓名 / 職稱</label>
            <span className={`text-[10px] font-bold ${finishFormData.reporter.length > REPORTER_MAX_LENGTH ? 'text-rose-500' : 'text-slate-400'}`}>
              {finishFormData.reporter.length}/{REPORTER_MAX_LENGTH}
            </span>
          </div>
          <div className="relative">
            <User className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400" size={18} />
            <input
              required
              maxLength={REPORTER_MAX_LENGTH}
              placeholder="請輸入您的姓名或職稱"
              className={`w-full pl-12 pr-4 py-4 bg-slate-50 rounded-2xl border-none outline-none font-bold transition-all focus:ring-2 focus:ring-indigo-500 focus:bg-white ${finishErrors.reporter ? 'ring-2 ring-rose-500 bg-rose-50' : ''
                }`}
              value={finishFormData.reporter}
              onChange={e => setFinishFormData(prev => ({ ...prev, reporter: e.target.value }))}
            />
          </div>
          {finishErrors.reporter && (
            <p className="text-[10px] text-rose-500 font-bold mt-1 flex items-center gap-1">
              <X size={12} /> {finishErrors.reporter}
            </p>
          )}
        </div>

        <div className="space-y-1">
          <div className="flex items-center justify-between">
            <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest">完工日期</label>
          </div>
          <div className="relative">
            <Calendar className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400" size={18} />
            <input
              type="date"
              className="w-full pl-12 pr-4 py-4 bg-slate-50 rounded-2xl border-none outline-none font-bold transition-all focus:ring-2 focus:ring-indigo-500 focus:bg-white"
              value={finishFormData.completionDate}
              onChange={e => setFinishFormData(prev => ({ ...prev, completionDate: e.target.value }))}
            />
          </div>
        </div>

        <div className="space-y-1">
          <div className="flex items-center justify-between">
            <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest">完工說明</label>
            <span className={`text-[10px] font-bold ${finishFormData.workDescription.length > DESCRIPTION_MAX_LENGTH ? 'text-rose-500' : 'text-slate-400'}`}>
              {finishFormData.workDescription.length}/{DESCRIPTION_MAX_LENGTH}
            </span>
          </div>
          <div className="relative">
            <MessageCircle className="absolute left-4 top-4 text-slate-400" size={18} />
            <textarea
              required
              maxLength={DESCRIPTION_MAX_LENGTH}
              rows={5}
              placeholder="請說明修繕完成的工作內容..."
              className={`w-full pl-12 pr-4 py-4 bg-slate-50 rounded-2xl border-none outline-none font-bold resize-none transition-all focus:ring-2 focus:ring-indigo-500 focus:bg-white ${finishErrors.workDescription ? 'ring-2 ring-rose-500 bg-rose-50' : ''
                }`}
              value={finishFormData.workDescription}
              onChange={e => setFinishFormData(prev => ({ ...prev, workDescription: e.target.value }))}
            />
          </div>
          {finishErrors.workDescription && (
            <p className="text-[10px] text-rose-500 font-bold mt-1 flex items-center gap-1">
              <X size={12} /> {finishErrors.workDescription}
            </p>
          )}
        </div>

        <div className="space-y-3">
          <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest">完工照片 ({finishImages.length})</label>

          {finishImages.length > 0 && (
            <div className="grid grid-cols-3 gap-2 mb-2">
              {finishImages.map((img, idx) => (
                <div key={idx} className="relative aspect-square rounded-xl overflow-hidden border border-slate-100 group">
                  <img src={img} className="w-full h-full object-cover" />
                  <button
                    type="button"
                    onClick={() => removeImage(idx, 'FINISH')}
                    className="absolute top-1 right-1 p-1 bg-rose-500 text-white rounded-full opacity-0 group-hover:opacity-100 transition-opacity"
                  >
                    <X size={12} />
                  </button>
                </div>
              ))}
            </div>
          )}

          <input
            type="file"
            ref={fileInputRef}
            onChange={e => handleFileChange(e, 'FINISH')}
            accept="image/*"
            multiple
            className="hidden"
          />

          <button
            type="button"
            onClick={() => fileInputRef.current?.click()}
            className="w-full p-6 border-2 border-dashed border-slate-200 rounded-[32px] flex flex-col items-center gap-2 text-slate-400 hover:border-indigo-300 hover:bg-indigo-50 transition-all"
          >
            <Camera size={32} />
            <p className="text-xs font-black">點擊開啟相機或上傳照片</p>
          </button>
        </div>

        <button
          type="submit"
          disabled={!finishFormData.reporter.trim() || !finishFormData.workDescription.trim()}
          className="w-full py-5 bg-emerald-600 text-white font-black rounded-3xl shadow-xl shadow-emerald-100 flex items-center justify-center gap-2 transition-all active:scale-95 disabled:opacity-50 disabled:cursor-not-allowed disabled:active:scale-100"
        >
          <CheckCircle2 size={18} /> 送出完工回報
        </button>
      </form>
    </div>
  );

  return (
    <div className="fixed inset-0 z-[200] bg-slate-950/90 backdrop-blur-xl flex items-center justify-center p-4 overflow-hidden">

      {/* 全域退出按鈕 (手機框架外) */}
      <button
        onClick={onClose}
        className="absolute top-8 right-8 z-[210] flex items-center gap-2 px-6 py-3 bg-white/10 hover:bg-rose-600 text-white rounded-full font-black text-sm border border-white/10 shadow-2xl transition-all group"
      >
        <LogOut size={18} className="group-hover:-translate-x-1 transition-transform" />
        退出手機模擬模式
      </button>

      {/* 手機框架 */}
      <div className="relative w-full max-w-[380px] h-[800px] bg-[#8c9fb6] rounded-[60px] border-[12px] border-slate-900 shadow-[0_0_100px_rgba(0,0,0,0.5)] overflow-hidden flex flex-col animate-in zoom-in-95 duration-300">

        {/* Phone Header - LINE Style */}
        <div className="h-16 bg-[#2a303c] flex items-center justify-between px-6 text-white shrink-0 border-b border-white/5">
          <div className="flex items-center gap-2">
            <div className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse"></div>
            <span className="font-black text-[11px] tracking-tight text-white/90">TSA 會館維護系統</span>
          </div>

          <div className="flex items-center gap-3">
            <button
              onClick={onClose}
              className="flex items-center gap-1.5 px-3 py-1.5 bg-white/10 hover:bg-rose-500 rounded-full transition-all group active:scale-90"
            >
              <span className="text-[10px] font-black uppercase tracking-tighter">Exit</span>
              <X size={14} className="group-hover:rotate-90 transition-transform" />
            </button>
            <MoreHorizontal size={18} className="opacity-40" />
          </div>
        </div>

        {/* Chat Area */}
        <div className="flex-1 overflow-y-auto p-4 space-y-4 flex flex-col custom-scrollbar">
          <div className="flex gap-2 animate-in slide-in-from-left duration-500">
            <div className="w-10 h-10 bg-indigo-600 rounded-full flex items-center justify-center text-white font-bold text-[10px] shrink-0 shadow-lg ring-2 ring-white/10">TSA</div>
            <div className="bg-white p-4 rounded-3xl rounded-tl-none text-[11px] font-bold text-slate-700 shadow-sm max-w-[85%] leading-relaxed border border-slate-100">
              您好！歡迎使用會館設施維護系統 LINE 官方帳號。
              <br /><br />
              請點擊下方選單進行相關操作，如有緊急故障請直接報修。
            </div>
          </div>

          {activeDisaster && (
            <div className="flex gap-2 animate-in slide-in-from-left duration-500 delay-300">
              <div className="w-10 h-10 bg-indigo-600 rounded-full flex items-center justify-center text-white font-bold text-[10px] shrink-0 shadow-lg ring-2 ring-white/10">TSA</div>
              <div className="bg-rose-50 border border-rose-100 p-4 rounded-3xl rounded-tl-none text-[11px] shadow-sm max-w-[85%] space-y-2">
                <p className="font-black text-rose-600 flex items-center gap-1.5"><ShieldAlert size={14} /> 緊急災害通報：{activeDisaster.name}</p>
                <p className="text-slate-600 leading-relaxed font-bold">請相關會館負責人立即點擊下方「災害回報」更新會館現狀，以利總務局彙整。</p>
              </div>
            </div>
          )}
        </div>

        {/* LINE Rich Menu (選單區) */}
        <div className="bg-[#2a303c] p-0.5 border-t border-slate-800 grid grid-cols-3 h-48 gap-0.5">
          <button onClick={() => setActiveForm('REPAIR')} className="bg-[#3a4455] text-white flex flex-col items-center justify-center gap-3 hover:bg-[#4a5568] transition-all active:scale-95 group">
            <div className="p-4 bg-indigo-500/20 rounded-2xl group-hover:bg-indigo-500/30 transition-colors">
              <Wrench size={28} className="text-indigo-400" />
            </div>
            <span className="text-[10px] font-black tracking-widest uppercase">線上報修</span>
          </button>
          <button onClick={() => setActiveForm('FINISH')} className="bg-[#3a4455] text-white flex flex-col items-center justify-center gap-3 hover:bg-[#4a5568] transition-all active:scale-95 group">
            <div className="p-4 bg-emerald-500/20 rounded-2xl group-hover:bg-emerald-500/30 transition-colors">
              <CheckCircle2 size={28} className="text-emerald-400" />
            </div>
            <span className="text-[10px] font-black tracking-widest uppercase">完工回報</span>
          </button>
          <button
            onClick={() => activeDisaster ? setActiveForm('DISASTER') : alert('目前無進行中之災情報告')}
            className={`bg-[#3a4455] text-white flex flex-col items-center justify-center gap-3 hover:bg-[#4a5568] transition-all active:scale-95 group ${!activeDisaster ? 'opacity-30' : ''}`}
          >
            <div className="p-4 bg-rose-500/20 rounded-2xl group-hover:bg-rose-500/30 transition-colors">
              <ShieldAlert size={28} className="text-rose-400" />
            </div>
            <span className="text-[10px] font-black tracking-widest uppercase">災害回報</span>
          </button>
        </div>

        {/* Input Bar (LINE 底欄) */}
        <div className="h-16 bg-white border-t border-slate-200 flex items-center px-5 gap-4 shrink-0">
          <div className="w-9 h-9 rounded-full bg-slate-100 flex items-center justify-center text-slate-400 hover:bg-slate-200 transition-colors"><Plus size={20} /></div>
          <div className="flex-1 bg-slate-50 border border-slate-100 rounded-full px-5 py-2.5 text-[11px] font-bold text-slate-400 italic">請輸入訊息...</div>
          <ImageIcon size={22} className="text-slate-300" />
        </div>

        {/* 表單 Modal 容器 */}
        {activeForm === 'REPAIR' && repairFormJSX}
        {activeForm === 'FINISH' && finishFormJSX}
        {activeForm === 'DISASTER' && repairFormJSX}
      </div>

      {/* 底部裝飾物 (Home Indicator) */}
      <div className="absolute bottom-10 left-1/2 -translate-x-1/2 w-32 h-1.5 bg-white/20 rounded-full"></div>

      {/* Pending Request Selection Modal */}
      {showPendingSelectModal && (
        <div className="absolute inset-0 z-[220] bg-slate-900/50 backdrop-blur-sm rounded-[60px] flex items-end animate-in fade-in duration-200">
          <div className="w-full bg-white rounded-t-[40px] p-6 space-y-4 max-h-[70%] overflow-y-auto animate-in slide-in-from-bottom duration-300">
            <div className="flex justify-between items-center pb-4 border-b border-slate-100">
              <h3 className="font-black text-lg text-slate-800">選擇未完工項目</h3>
              <button onClick={() => setShowPendingSelectModal(false)} className="p-2 bg-slate-100 rounded-full"><X size={20} /></button>
            </div>
            <div className="space-y-3">
              {requests.filter(r => r.hallName === finishFormData.hallName && r.status !== RepairStatus.CLOSED && r.status !== RepairStatus.CONSTRUCTION_DONE && !r.isDeleted).map(req => (
                <button
                  key={req.id}
                  onClick={() => {
                    if (window.confirm('是否載入此報修單內容與照片？\n(這將覆蓋目前的輸入內容)')) {
                      setFinishFormData(prev => ({
                        ...prev,
                        reporter: req.reporter,
                        workDescription: `[原報修內容]\n${req.description}\n\n[完工說明]\n`,
                      }));
                      setFinishImages(req.photoUrls || []);
                      setSelectedRequestId(req.id);
                      setShowPendingSelectModal(false);
                    }
                  }}
                  className="w-full p-4 bg-slate-50 border border-slate-200 rounded-2xl text-left hover:bg-indigo-50 hover:border-indigo-200 transition-all group"
                >
                  <div className="flex justify-between items-start mb-2">
                    <span className="text-[10px] font-black bg-white text-indigo-600 px-2 py-0.5 rounded border border-indigo-100">{Category[req.category] || '其他'}</span>
                    <span className="text-[10px] font-bold text-slate-400">{new Date(req.createdAt).toLocaleDateString()}</span>
                  </div>
                  <h4 className="font-bold text-base text-slate-800 mb-1">{req.title}</h4>
                  <p className="text-xs text-slate-500 line-clamp-2">{req.description}</p>
                </button>
              ))}
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default MobileSimulation;
