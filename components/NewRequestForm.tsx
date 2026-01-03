
import React, { useState } from 'react';
import { 
  Send, 
  Sparkles, 
  Loader2, 
  X,
  Camera,
  Upload,
  Calendar,
  User,
  MapPin,
  ClipboardList
} from 'lucide-react';
import { Category, Urgency, RepairRequest, RepairStatus, OrderType, Language } from '../types';
import { MOCK_HALLS } from '../constants';
import { analyzeRepairRequest } from '../services/geminiService';

interface NewRequestFormProps {
  onSubmit: (request: Partial<RepairRequest>) => void;
  onCancel: () => void;
  initialType?: OrderType;
  language: Language;
}

const NewRequestForm: React.FC<NewRequestFormProps> = ({ onSubmit, onCancel, initialType = OrderType.VOLUNTEER, language }) => {
  const translations = {
    [Language.ZH]: {
      routineTitle: '新增例行性工單', volunteerTitle: '新增報修工單',
      routineDesc: '建立固定週期的維護計畫', volunteerDesc: '記錄臨時故障維修需求',
      titleLabel: '工單標題 / 項目名稱', reporterLabel: '提報人',
      hallLabel: '會館', catLabel: '類別', urgencyLabel: '優先權',
      lastDate: '上次執行日期', cycleLabel: '保養週期 (天)', staffLabel: '責任區域職員',
      descLabel: '工單說明 / 描述', aiBtn: 'Gemini 診斷分析',
      photoLabel: '附件或照片', photoBtn: '拍照', fileBtn: '附件',
      submit: '提交工單', cancel: '取消'
    },
    [Language.JA]: {
      routineTitle: '定期点検依頼追加', volunteerTitle: '修繕依頼追加',
      routineDesc: '定期的なメンテナンス計画を作成', volunteerDesc: '突発的な故障修理を記録',
      titleLabel: '依頼タイトル / 項目名', reporterLabel: '報告者',
      hallLabel: '会館', catLabel: 'カテゴリー', urgencyLabel: '優先度',
      lastDate: '前回実施日', cycleLabel: '点検周期 (日)', staffLabel: '担当職員',
      descLabel: '依頼内容の詳細', aiBtn: 'AI 診断分析',
      photoLabel: '添付資料または写真', photoBtn: '撮影', fileBtn: '添付',
      submit: '依頼を送信', cancel: 'キャンセル'
    }
  };

  const t = translations[language];

  const [formData, setFormData] = useState({
    type: initialType,
    title: '',
    hallName: MOCK_HALLS[0].name,
    category: Category.AC,
    urgency: Urgency.MEDIUM,
    description: '',
    reporter: '',
    lastExecutedDate: new Date().toISOString().split('T')[0],
    maintenanceCycle: 30,
    staffInCharge: '',
  });

  const [analyzing, setAnalyzing] = useState(false);
  const [aiAnalysis, setAiAnalysis] = useState<any>(null);

  const handleAIAnalyze = async () => {
    if (!formData.description) return;
    setAnalyzing(true);
    const result = await analyzeRepairRequest(formData.description, formData.category);
    if (result) {
      setAiAnalysis(result);
      setFormData(prev => ({ ...prev, urgency: result.suggestedUrgency as Urgency }));
    }
    setAnalyzing(false);
  };

  return (
    <div className="max-w-4xl mx-auto animate-in slide-in-from-bottom-4 duration-500 pb-20">
      <div className="flex items-center justify-between mb-8">
        <div>
          <h1 className="text-2xl font-bold text-slate-900">{formData.type === OrderType.ROUTINE ? t.routineTitle : t.volunteerTitle}</h1>
          <p className="text-slate-500 text-sm">{formData.type === OrderType.ROUTINE ? t.routineDesc : t.volunteerDesc}</p>
        </div>
        <button onClick={onCancel} className="p-2 text-slate-400 hover:bg-slate-100 rounded-full"><X size={24} /></button>
      </div>

      <form onSubmit={(e) => { e.preventDefault(); onSubmit({...formData, status: RepairStatus.PENDING}); }} className="space-y-6">
        <div className="bg-white p-8 rounded-3xl border border-slate-200 shadow-sm space-y-6">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div className="space-y-2">
              <label className="text-xs font-black text-slate-400 uppercase tracking-widest">{t.titleLabel}</label>
              <div className="relative"><ClipboardList className="absolute left-3 top-3 text-slate-400" size={18} /><input required className="w-full pl-10 pr-4 py-3 bg-slate-50 border border-slate-100 rounded-2xl outline-none" value={formData.title} onChange={e => setFormData(prev => ({...prev, title: e.target.value}))} /></div>
            </div>
            <div className="space-y-2">
              <label className="text-xs font-black text-slate-400 uppercase tracking-widest">{t.reporterLabel}</label>
              <div className="relative"><User className="absolute left-3 top-3 text-slate-400" size={18} /><input required className="w-full pl-10 pr-4 py-3 bg-slate-50 border border-slate-100 rounded-2xl outline-none" value={formData.reporter} onChange={e => setFormData(prev => ({...prev, reporter: e.target.value}))} /></div>
            </div>
          </div>
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-6">
            <div className="space-y-2"><label className="text-xs font-black text-slate-400 uppercase tracking-widest">{t.hallLabel}</label><select className="w-full px-4 py-3 bg-slate-50 border border-slate-100 rounded-2xl outline-none" value={formData.hallName} onChange={e => setFormData(prev => ({...prev, hallName: e.target.value}))}>{MOCK_HALLS.map(h => <option key={h.id} value={h.name}>{h.name}</option>)}</select></div>
            <div className="space-y-2"><label className="text-xs font-black text-slate-400 uppercase tracking-widest">{t.catLabel}</label><select className="w-full px-4 py-3 bg-slate-50 border border-slate-100 rounded-2xl outline-none" value={formData.category} onChange={e => setFormData(prev => ({...prev, category: e.target.value as Category}))}>{Object.values(Category).map(cat => <option key={cat} value={cat}>{cat}</option>)}</select></div>
            <div className="space-y-2"><label className="text-xs font-black text-slate-400 uppercase tracking-widest">{t.urgencyLabel}</label><select className="w-full px-4 py-3 bg-slate-50 border border-slate-100 rounded-2xl outline-none" value={formData.urgency} onChange={e => setFormData(prev => ({...prev, urgency: e.target.value as Urgency}))}>{Object.values(Urgency).map(u => <option key={u} value={u}>{u}</option>)}</select></div>
          </div>
          {formData.type === OrderType.ROUTINE && (
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-6 p-6 bg-indigo-50 rounded-2xl border border-indigo-100">
              <div className="space-y-2"><label className="text-xs font-black text-indigo-400 uppercase tracking-widest">{t.lastDate}</label><input type="date" className="w-full px-4 py-2 bg-white border border-indigo-100 rounded-xl" value={formData.lastExecutedDate} onChange={e => setFormData(prev => ({...prev, lastExecutedDate: e.target.value}))} /></div>
              <div className="space-y-2"><label className="text-xs font-black text-indigo-400 uppercase tracking-widest">{t.cycleLabel}</label><input type="number" className="w-full px-4 py-2 bg-white border border-indigo-100 rounded-xl" value={formData.maintenanceCycle} onChange={e => setFormData(prev => ({...prev, maintenanceCycle: parseInt(e.target.value)}))} /></div>
              <div className="space-y-2"><label className="text-xs font-black text-indigo-400 uppercase tracking-widest">{t.staffLabel}</label><input className="w-full px-4 py-2 bg-white border border-indigo-100 rounded-xl" value={formData.staffInCharge} onChange={e => setFormData(prev => ({...prev, staffInCharge: e.target.value}))} /></div>
            </div>
          )}
          <div className="space-y-2">
            <div className="flex items-center justify-between"><label className="text-xs font-black text-slate-400 uppercase tracking-widest">{t.descLabel}</label><button type="button" onClick={handleAIAnalyze} disabled={!formData.description || analyzing} className="flex items-center gap-1.5 text-xs font-bold text-indigo-600">{analyzing ? <Loader2 size={14} className="animate-spin" /> : <Sparkles size={14} />} {t.aiBtn}</button></div>
            <textarea required rows={4} className="w-full px-4 py-3 bg-slate-50 border border-slate-100 rounded-2xl outline-none resize-none" value={formData.description} onChange={e => setFormData(prev => ({...prev, description: e.target.value}))} />
          </div>
        </div>
        <div className="flex gap-4">
          <button type="submit" className="flex-1 bg-indigo-600 text-white font-black py-4 rounded-3xl shadow-xl hover:bg-indigo-700 flex items-center justify-center gap-2"><Send size={18} /> {t.submit}</button>
          <button type="button" onClick={onCancel} className="px-10 bg-white text-slate-500 font-bold py-4 rounded-3xl border border-slate-200">{t.cancel}</button>
        </div>
      </form>
    </div>
  );
};

export default NewRequestForm;
