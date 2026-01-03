
import React, { useState, useEffect, useMemo } from 'react';
import { 
  ArrowLeft, 
  CheckCircle2, 
  Camera, 
  Send,
  Upload,
  Save,
  Clock,
  Briefcase,
  User,
  Building2,
  DollarSign,
  AlertCircle,
  Check,
  ChevronRight,
  FileText,
  Hammer,
  Receipt,
  Loader2
} from 'lucide-react';
import { RepairRequest, RepairStatus, ProcessingMethod } from '../types';
import { PAYMENT_ENTITIES } from '../constants';

// UI 區段組件 - 移到組件外部避免重新創建
const Section = ({ 
  title, 
  isActive, 
  isDone, 
  children, 
  icon,
}: { 
  title: string, 
  isActive: boolean, 
  isDone: boolean, 
  children?: React.ReactNode,
  icon: React.ReactNode,
}) => (
  <div className={`p-8 rounded-[40px] border-2 transition-all duration-500 ${
    isDone ? 'bg-emerald-50/50 border-emerald-100' : 
    isActive ? 'bg-white border-indigo-600 shadow-2xl' : 
    'bg-slate-50 border-slate-100 opacity-40 grayscale pointer-events-none select-none'
  }`}>
    <div className="flex items-center justify-between mb-6">
      <h3 className={`text-xl font-black flex items-center gap-3 ${isDone ? 'text-emerald-700' : isActive ? 'text-slate-900' : 'text-slate-400'}`}>
        <div className={`p-2 rounded-2xl ${isDone ? 'bg-emerald-600 text-white' : isActive ? 'bg-indigo-600 text-white' : 'bg-slate-200 text-slate-400'}`}>
          {icon}
        </div>
        {title}
      </h3>
      {isDone && <span className="flex items-center gap-1 text-[10px] font-black uppercase text-emerald-600 bg-white px-3 py-1 rounded-full border border-emerald-100">已完成</span>}
    </div>
    <div className="space-y-6">
      {children}
    </div>
  </div>
);

interface WorkReportFormProps {
  request: RepairRequest;
  allRequests: RepairRequest[];
  isBulk?: boolean;
  initialBulkIds?: string[];
  onSubmit: (finalIds: string[], updates: Partial<RepairRequest>, shouldClose?: boolean) => void;
  onCancel: () => void;
}

const WorkReportForm: React.FC<WorkReportFormProps> = ({ 
  request, 
  isBulk = false, 
  initialBulkIds = [], 
  onSubmit, 
  onCancel 
}) => {
  const [formData, setFormData] = useState<Partial<RepairRequest>>({ 
    ...request,
    processingMethod: request.processingMethod || undefined,
    status: request.status || RepairStatus.PENDING
  });
  const [targetIds] = useState<string[]>(isBulk ? initialBulkIds : [request.id]);
  const [isSaving, setIsSaving] = useState(false);

  // 注意：已移除 updateField，所有輸入欄位直接使用 setFormData

  // 判斷是否為「法人協助」的階段 - 使用 useMemo 避免重新計算
  const isInternal = useMemo(() => formData.processingMethod === ProcessingMethod.INTERNAL, [formData.processingMethod]);
  const isLegal = useMemo(() => formData.processingMethod === ProcessingMethod.LEGAL, [formData.processingMethod]);

  // 保存邏輯：不關閉視窗，僅更新狀態與數據
  const handleProgressSave = async (nextStatus?: RepairStatus) => {
    setIsSaving(true);
    const updates = { ...formData };
    if (nextStatus) {
      updates.status = nextStatus;
      setFormData(prev => ({ ...prev, status: nextStatus }));
    }
    await onSubmit(targetIds, updates, false);
    setIsSaving(false);
    alert('進度已成功暫存！');
  };

  // 最終提交邏輯：關閉視窗並回到列表
  const handleFinalSubmit = async () => {
    if (!window.confirm('確定要提交並結案嗎？結案後將無法再修改內容。')) return;
    setIsSaving(true);
    
    const updates = { 
      ...formData, 
      status: RepairStatus.CLOSED,
      updatedAt: new Date().toISOString()
    };
    
    // 強制設定 UI 狀態
    setFormData(prev => ({ ...prev, status: RepairStatus.CLOSED }));

    // 模擬網絡延遲，讓使用者有感覺正在處理
    setTimeout(async () => {
      await onSubmit(targetIds, updates, true);
      setIsSaving(false);
      alert('工單已成功結案！');
    }, 500);
  };


  return (
    <div className="max-w-4xl mx-auto p-4 md:p-8 space-y-10 pb-40 animate-in fade-in slide-in-from-bottom-8">
      {/* Header */}
      <div className="flex items-center gap-6">
        <button onClick={onCancel} className="p-3 text-slate-400 hover:bg-white rounded-full transition-all border border-transparent hover:border-slate-200 shadow-sm"><ArrowLeft size={24} /></button>
        <div>
          <h1 className="text-3xl font-black text-slate-900 tracking-tight">工單回報處理程序</h1>
          <p className="text-xs font-bold text-slate-400 mt-1 uppercase tracking-widest">{isBulk ? `批量處理 ${targetIds.length} 筆` : `案件單號: ${request.id}`}</p>
        </div>
      </div>

      {/* 步驟 1: 選擇處理方式 */}
      <div className="p-8 bg-white rounded-[40px] border-2 border-indigo-600 shadow-xl space-y-6">
        <div className="flex items-center gap-3 text-indigo-600">
           <Briefcase size={24}/>
           <h3 className="text-xl font-black">1. 請選擇處理方式</h3>
        </div>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {Object.values(ProcessingMethod).map((method) => (
            <button
              key={method}
              type="button"
              onClick={() => setFormData(prev => ({ ...prev, processingMethod: method }))}
              className={`p-6 rounded-[32px] border-2 text-left transition-all cursor-pointer ${
                formData.processingMethod === method 
                ? 'bg-indigo-600 border-indigo-600 text-white shadow-lg' 
                : 'bg-slate-50 border-slate-100 text-slate-400 hover:border-indigo-200 hover:bg-white'
              }`}
            >
              <p className="text-[10px] font-black uppercase tracking-widest mb-1 opacity-60">處理途徑</p>
              <p className="text-lg font-black">{method}</p>
            </button>
          ))}
        </div>
      </div>

      {/* --- 分流路徑 2-1: 組織/職員自行處理 --- */}
      {isInternal && (
        <div className="space-y-8 animate-in slide-in-from-right-4">
          <Section title="自行處理詳細報表" isActive={true} isDone={formData.status === RepairStatus.CLOSED} icon={<User size={20}/>}>
             <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
               <div className="space-y-1">
                 <label className="text-[10px] font-black text-slate-400 uppercase">完工日期 *</label>
                 <input required type="date" className="w-full px-5 py-4 bg-slate-50 rounded-2xl font-bold border-none outline-none focus:ring-2 focus:ring-indigo-600 transition-all" value={formData.completionDate || ''} onChange={e => setFormData(prev => ({ ...prev, completionDate: e.target.value }))} />
               </div>
               <div className="space-y-1">
                 <label className="text-[10px] font-black text-slate-400 uppercase">提報人 *</label>
                 <input required className="w-full px-5 py-4 bg-slate-50 rounded-2xl font-bold border-none outline-none focus:ring-2 focus:ring-indigo-600 transition-all" value={formData.reporter || ''} onChange={e => setFormData(prev => ({ ...prev, reporter: e.target.value }))} />
               </div>
               <div className="space-y-1">
                 <label className="text-[10px] font-black text-slate-400 uppercase">處理會館與圈區</label>
                 <input disabled className="w-full px-5 py-4 bg-slate-100 rounded-2xl font-bold text-slate-400" value={`${formData.hallName} / ${formData.hallArea || '未指定'}`} />
               </div>
               <div className="space-y-1">
                 <label className="text-[10px] font-black text-slate-400 uppercase">金額 (選填)</label>
                 <div className="relative">
                   <DollarSign className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-300" size={18}/>
                   <input type="number" className="w-full pl-10 pr-5 py-4 bg-slate-50 rounded-2xl font-bold" value={formData.amount || ''} onChange={e => setFormData(prev => ({ ...prev, amount: parseInt(e.target.value) || 0 }))} />
                 </div>
               </div>
               <div className="md:col-span-2 space-y-1">
                 <label className="text-[10px] font-black text-slate-400 uppercase">處理方式與說明 *</label>
                 <textarea rows={3} className="w-full px-5 py-4 bg-slate-50 rounded-2xl font-bold" value={formData.processingDescription || ''} onChange={e => setFormData(prev => ({ ...prev, processingDescription: e.target.value }))} />
               </div>
               <div className="md:col-span-2 space-y-1">
                 <label className="text-[10px] font-black text-slate-400 uppercase">備註</label>
                 <input className="w-full px-5 py-4 bg-slate-50 rounded-2xl font-bold" value={formData.remarks || ''} onChange={e => setFormData(prev => ({ ...prev, remarks: e.target.value }))} />
               </div>
               <div className="md:col-span-2">
                 <button type="button" className="w-full py-8 border-2 border-dashed border-slate-200 rounded-[32px] text-slate-400 flex flex-col items-center gap-2 hover:bg-slate-50 transition-all">
                    <Camera size={32}/>
                    <span className="text-[10px] font-black uppercase tracking-widest">上傳現場照片 (非必填)</span>
                 </button>
               </div>
             </div>
             
             <div className="flex gap-4 pt-6">
                <button onClick={onCancel} className="px-10 py-5 bg-white border border-slate-200 rounded-[24px] font-black text-slate-400 hover:bg-slate-50 transition-all">返回</button>
                <button 
                  onClick={handleFinalSubmit}
                  disabled={!formData.completionDate || !formData.processingDescription || isSaving}
                  className="flex-1 bg-emerald-600 text-white font-black py-5 rounded-[24px] shadow-2xl shadow-emerald-100 flex items-center justify-center gap-3 disabled:opacity-30 active:scale-95 transition-all"
                >
                  {isSaving ? <Loader2 size={20} className="animate-spin" /> : <Save size={20}/>}
                  {isSaving ? '正在儲存中...' : '保存並提交結案'}
                </button>
             </div>
          </Section>
        </div>
      )}

      {/* --- 分流路徑 2-2: 法人協助 (四階段) --- */}
      {isLegal && (
        <div className="space-y-8 animate-in slide-in-from-right-4">
          
          {/* 階段 1: 基本資料 (狀態: 進行中) */}
          <Section 
            title="1. 廠商與案件基本資料 (進行中)" 
            isActive={formData.status === RepairStatus.PENDING || formData.status === RepairStatus.IN_PROGRESS} 
            isDone={formData.status !== RepairStatus.PENDING && formData.status !== RepairStatus.IN_PROGRESS}
            icon={<Building2 size={20}/>}
          >
             <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
               <div className="space-y-1">
                 <label className="text-[10px] font-black text-slate-400">廠商名稱 *</label>
                 <input className="w-full px-5 py-4 bg-slate-50 rounded-2xl font-bold" value={formData.vendor || ''} onChange={e => setFormData(prev => ({ ...prev, vendor: e.target.value }))} />
               </div>
               <div className="space-y-1">
                 <label className="text-[10px] font-black text-slate-400">核定金額 *</label>
                 <input type="number" className="w-full px-5 py-4 bg-slate-50 rounded-2xl font-bold" value={formData.amount || ''} onChange={e => setFormData(prev => ({ ...prev, amount: parseInt(e.target.value) || 0 }))} />
               </div>
               <div className="md:col-span-2 space-y-1">
                 <label className="text-[10px] font-black text-slate-400">處理方式說明 *</label>
                 <textarea rows={2} className="w-full px-5 py-4 bg-slate-50 rounded-2xl font-bold" value={formData.processingDescription || ''} onChange={e => setFormData(prev => ({ ...prev, processingDescription: e.target.value }))} />
               </div>
               <div className="space-y-1">
                 <label className="text-[10px] font-black text-slate-400">提報人 *</label>
                 <input className="w-full px-5 py-4 bg-slate-50 rounded-2xl font-bold" value={formData.reporter || ''} onChange={e => setFormData(prev => ({ ...prev, reporter: e.target.value }))} />
               </div>
               <div className="space-y-1">
                 <label className="text-[10px] font-black text-slate-400">備註</label>
                 <input className="w-full px-5 py-4 bg-slate-50 rounded-2xl font-bold" value={formData.remarks || ''} onChange={e => setFormData(prev => ({ ...prev, remarks: e.target.value }))} />
               </div>
             </div>
             <button 
               onClick={() => handleProgressSave(RepairStatus.IN_PROGRESS)}
               disabled={!formData.vendor || !formData.processingDescription || !formData.amount || !formData.reporter || isSaving}
               className="w-full bg-slate-900 text-white font-black py-4 rounded-2xl shadow-xl flex items-center justify-center gap-2 disabled:opacity-30 hover:bg-indigo-600 transition-all"
             >
               {isSaving ? <Loader2 size={18} className="animate-spin" /> : <Save size={18}/>}
               保存進度並解鎖下一階段
             </button>
          </Section>

          {/* 階段 2: 簽呈區域 (狀態: 已送簽呈) */}
          <Section 
            title="2. 簽呈送核程序 (已送簽呈)" 
            isActive={formData.status === RepairStatus.IN_PROGRESS || formData.status === RepairStatus.SIGNED} 
            isDone={formData.status === RepairStatus.CONSTRUCTION_DONE || formData.status === RepairStatus.CLOSED}
            icon={<FileText size={20}/>}
          >
             <div className="space-y-6">
                <label className="flex items-center gap-4 p-5 bg-slate-50 rounded-[24px] border border-slate-100 cursor-pointer hover:bg-white transition-all group">
                   <div className={`w-8 h-8 rounded-lg flex items-center justify-center transition-all ${formData.isSignedSent ? 'bg-indigo-600 text-white' : 'bg-white border border-slate-200 text-transparent'}`}>
                      <Check size={16}/>
                   </div>
                   <input type="checkbox" className="hidden" checked={formData.isSignedSent || false} onChange={e => setFormData(prev => ({ ...prev, isSignedSent: e.target.checked }))} />
                   <div className="flex-1">
                      <p className="font-black text-slate-800">簽呈已正式送出</p>
                      <p className="text-[10px] font-bold text-slate-400 uppercase tracking-widest">勾選後啟用附件與日期欄位</p>
                   </div>
                </label>
                
                <div className={`grid grid-cols-1 md:grid-cols-2 gap-6 transition-all duration-500 ${formData.isSignedSent ? 'opacity-100' : 'opacity-20 pointer-events-none scale-95'}`}>
                   <div className="space-y-1">
                     <label className="text-[10px] font-black text-slate-400">簽呈送出日期 *</label>
                     <input type="date" className="w-full px-5 py-4 bg-slate-50 rounded-2xl font-bold" value={formData.signedSentDate || ''} onChange={e => setFormData(prev => ({ ...prev, signedSentDate: e.target.value }))} />
                   </div>
                   <div className="space-y-1">
                     <label className="text-[10px] font-black text-slate-400">簽呈附件影本 *</label>
                     <button className="w-full px-5 py-4 bg-white border-2 border-dashed border-slate-200 rounded-2xl text-slate-400 font-bold flex items-center justify-center gap-2 hover:border-indigo-400 transition-all">
                       <Upload size={18}/> 上傳簽呈 (PDF/JPG)
                     </button>
                   </div>
                </div>

                <button 
                  onClick={() => handleProgressSave(RepairStatus.SIGNED)}
                  disabled={!formData.isSignedSent || !formData.signedSentDate || isSaving}
                  className="w-full bg-indigo-600 text-white font-black py-4 rounded-2xl shadow-xl flex items-center justify-center gap-2 disabled:opacity-30 active:scale-95 transition-all"
                >
                  {isSaving ? <Loader2 size={18} className="animate-spin" /> : <Save size={18}/>}
                  保存簽呈資訊 (狀態: 已送簽呈)
                </button>
             </div>
          </Section>

          {/* 階段 3: 完工區域 (狀態: 施工完畢) */}
          <Section 
            title="3. 工程驗收程序 (施工完畢)" 
            isActive={formData.status === RepairStatus.SIGNED || formData.status === RepairStatus.CONSTRUCTION_DONE} 
            isDone={formData.status === RepairStatus.CLOSED}
            icon={<Hammer size={20}/>}
          >
             <div className="space-y-6">
                <div className="space-y-1">
                   <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest">付款法人對象選擇 *</label>
                   <select className="w-full px-5 py-4 bg-slate-50 rounded-2xl font-bold" value={formData.paymentEntity || ''} onChange={e => setFormData(prev => ({ ...prev, paymentEntity: e.target.value }))}>
                     <option value="">-- 請選擇付款單位 --</option>
                     {PAYMENT_ENTITIES.map(e => <option key={e} value={e}>{e}</option>)}
                   </select>
                </div>

                <label className="flex items-center gap-4 p-5 bg-slate-50 rounded-[24px] border border-slate-100 cursor-pointer hover:bg-white transition-all group">
                   <div className={`w-8 h-8 rounded-lg flex items-center justify-center transition-all ${formData.isWorkFinished ? 'bg-indigo-600 text-white' : 'bg-white border border-slate-200 text-transparent'}`}>
                      <Check size={16}/>
                   </div>
                   <input type="checkbox" className="hidden" checked={formData.isWorkFinished || false} onChange={e => setFormData(prev => ({ ...prev, isWorkFinished: e.target.checked }))} />
                   <div className="flex-1">
                      <p className="font-black text-slate-800">施工已確實完畢</p>
                      <p className="text-[10px] font-bold text-slate-400 uppercase tracking-widest">勾選後啟用完工證明欄位</p>
                   </div>
                </label>

                <div className={`grid grid-cols-1 md:grid-cols-2 gap-6 transition-all duration-500 ${formData.isWorkFinished ? 'opacity-100' : 'opacity-20 pointer-events-none scale-95'}`}>
                   <div className="space-y-1">
                     <label className="text-[10px] font-black text-slate-400">完工日期 *</label>
                     <input type="date" className="w-full px-5 py-4 bg-slate-50 rounded-2xl font-bold" value={formData.completionDate || ''} onChange={e => setFormData(prev => ({ ...prev, completionDate: e.target.value }))} />
                   </div>
                   <div className="space-y-1">
                     <label className="text-[10px] font-black text-slate-400">完工證明照片 *</label>
                     <button className="w-full px-5 py-4 bg-white border-2 border-dashed border-slate-200 rounded-2xl text-slate-400 font-bold flex items-center justify-center gap-2 hover:border-indigo-400 transition-all">
                       <Camera size={18}/> 上傳完工照
                     </button>
                   </div>
                   <div className="md:col-span-2 space-y-1">
                     <label className="text-[10px] font-black text-slate-400">驗收備註說明</label>
                     <input className="w-full px-5 py-4 bg-slate-50 rounded-2xl font-bold" placeholder="輸入任何特殊狀況..." value={formData.remarks || ''} onChange={e => setFormData(prev => ({ ...prev, remarks: e.target.value }))} />
                   </div>
                </div>

                <button 
                  onClick={() => handleProgressSave(RepairStatus.CONSTRUCTION_DONE)} 
                  disabled={!formData.isWorkFinished || !formData.completionDate || !formData.paymentEntity || isSaving}
                  className="w-full bg-indigo-600 text-white font-black py-4 rounded-2xl shadow-xl flex items-center justify-center gap-2 disabled:opacity-30 active:scale-95 transition-all"
                >
                  {isSaving ? <Loader2 size={18} className="animate-spin" /> : <Save size={18}/>}
                  保存完工資訊 (狀態: 施工完畢)
                </button>
             </div>
          </Section>

          {/* 階段 4: 請款區域 (狀態: 已結案) */}
          <Section 
            title="4. 財務核銷與請款程序 (已結案)" 
            isActive={formData.status === RepairStatus.CONSTRUCTION_DONE} 
            isDone={formData.status === RepairStatus.CLOSED}
            icon={<Receipt size={20}/>}
          >
             <div className="space-y-6">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <label className="flex items-center gap-4 p-5 bg-white border border-slate-200 rounded-[24px] cursor-pointer hover:bg-slate-50 transition-all">
                    <input type="checkbox" className="w-7 h-7 rounded-lg accent-emerald-600" checked={formData.isInvoiceConfirmed || false} onChange={e => setFormData(prev => ({ ...prev, isInvoiceConfirmed: e.target.checked }))} />
                    <span className="font-black text-slate-700">發票確認無誤</span>
                  </label>
                  <label className="flex items-center gap-4 p-5 bg-white border border-slate-200 rounded-[24px] cursor-pointer hover:bg-slate-50 transition-all">
                    <input type="checkbox" className="w-7 h-7 rounded-lg accent-emerald-600" checked={formData.isPaymentSent || false} onChange={e => setFormData(prev => ({ ...prev, isPaymentSent: e.target.checked }))} />
                    <span className="font-black text-slate-700">請款單已寄出</span>
                  </label>
                </div>

                <div className={`space-y-1 transition-all duration-500 ${formData.isPaymentSent ? 'opacity-100' : 'opacity-20 pointer-events-none scale-95'}`}>
                   <label className="text-[10px] font-black text-slate-400">請款單寄出日期 *</label>
                   <input type="date" className="w-full px-5 py-4 bg-slate-50 rounded-2xl font-bold" value={formData.paymentDate || ''} onChange={e => setFormData(prev => ({ ...prev, paymentDate: e.target.value }))} />
                </div>

                <div className="flex gap-4 pt-6 border-t border-slate-100">
                   <button onClick={() => handleProgressSave()} disabled={isSaving} className="px-10 py-5 bg-white border border-slate-200 text-slate-500 font-black rounded-[24px] hover:bg-slate-50 transition-all active:scale-95">
                     暫存當前進度
                   </button>
                   <button 
                      onClick={handleFinalSubmit}
                      disabled={!formData.isInvoiceConfirmed || !formData.isPaymentSent || !formData.paymentDate || isSaving}
                      className="flex-1 bg-emerald-600 text-white font-black py-5 rounded-[24px] shadow-2xl shadow-emerald-100 flex items-center justify-center gap-3 disabled:opacity-30 active:scale-95 transition-all"
                    >
                      {isSaving ? <Loader2 size={20} className="animate-spin" /> : <Send size={20}/>}
                      提交最終結案程序
                    </button>
                </div>
             </div>
          </Section>
        </div>
      )}
    </div>
  );
};

export default WorkReportForm;
