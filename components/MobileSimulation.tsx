
import React, { useState, useRef } from 'react';
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
import { Category, OrderType, RepairRequest, DisasterReport } from '../types';

interface MobileSimulationProps {
  onClose: () => void;
  onSubmitReport: (data: Partial<RepairRequest>) => void;
  activeDisaster?: DisasterReport | null;
}

const MobileSimulation: React.FC<MobileSimulationProps> = ({ onClose, onSubmitReport, activeDisaster }) => {
  const [activeForm, setActiveForm] = useState<'NONE' | 'REPAIR' | 'FINISH' | 'DISASTER'>('NONE');
  const [formData, setFormData] = useState({
    hallName: MOCK_HALLS[0].name,
    reporter: '',
    description: '',
    date: new Date().toISOString().split('T')[0],
    category: Category.AC,
  });
  const [images, setImages] = useState<string[]>([]);
  const fileInputRef = useRef<HTMLInputElement>(null);

  // Fix: Explicitly type 'file' as 'File' to resolve assignability error to 'Blob' (line 52 area)
  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = e.target.files;
    if (files) {
      Array.from(files).forEach((file: File) => {
        const reader = new FileReader();
        reader.onloadend = () => {
          setImages(prev => [...prev, reader.result as string]);
        };
        reader.readAsDataURL(file);
      });
    }
  };

  const removeImage = (index: number) => {
    setImages(prev => prev.filter((_, i) => i !== index));
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    onSubmitReport({
      ...formData,
      type: OrderType.VOLUNTEER,
      title: `${formData.category} - ${formData.hallName} 報修`,
      photoUrls: images, // 將照片數據傳回主系統
    });
    alert('感謝您的回報，工單已建立！照片已同步上傳至系統。');
    setActiveForm('NONE');
    setImages([]);
  };

  const MobileForm = ({ title, type }: { title: string, type: string }) => (
    <div className="absolute inset-x-0 bottom-0 top-16 bg-white z-20 flex flex-col animate-in slide-in-from-bottom duration-300 rounded-t-[40px] shadow-2xl border-t border-slate-100">
      <div className="p-6 flex items-center justify-between border-b border-slate-50">
        <div className="flex items-center gap-3">
          <button onClick={() => { setActiveForm('NONE'); setImages([]); }} className="p-2 text-slate-400 hover:bg-slate-50 rounded-full transition-colors">
            <ArrowLeft size={20} />
          </button>
          <h3 className="text-lg font-black text-slate-800">{title}</h3>
        </div>
        <button onClick={() => { setActiveForm('NONE'); setImages([]); }} className="p-2 text-slate-400 hover:bg-slate-50 rounded-full transition-colors">
          <X size={20} />
        </button>
      </div>
      <form onSubmit={handleSubmit} className="p-8 space-y-6 overflow-y-auto flex-1 pb-32 custom-scrollbar">
        <div className="space-y-1">
          <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest">選擇會館</label>
          <select className="w-full px-4 py-4 bg-slate-50 rounded-2xl border-none outline-none font-bold" value={formData.hallName} onChange={e => setFormData({...formData, hallName: e.target.value})}>
            {MOCK_HALLS.map(h => <option key={h.id} value={h.name}>{h.name}</option>)}
          </select>
        </div>
        <div className="space-y-1">
          <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest">姓名 / 職稱</label>
          <input required className="w-full px-4 py-4 bg-slate-50 rounded-2xl border-none outline-none font-bold" value={formData.reporter} onChange={e => setFormData({...formData, reporter: e.target.value})} />
        </div>
        <div className="space-y-1">
          <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest">狀況描述</label>
          <textarea required rows={4} className="w-full px-4 py-4 bg-slate-50 rounded-2xl border-none outline-none font-bold resize-none" value={formData.description} onChange={e => setFormData({...formData, description: e.target.value})} />
        </div>
        
        <div className="space-y-3">
          <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest">現場照片回報 ({images.length})</label>
          
          {/* 照片預覽區 */}
          {images.length > 0 && (
            <div className="grid grid-cols-3 gap-2 mb-2">
              {images.map((img, idx) => (
                <div key={idx} className="relative aspect-square rounded-xl overflow-hidden border border-slate-100 group">
                  <img src={img} className="w-full h-full object-cover" />
                  <button 
                    type="button"
                    onClick={() => removeImage(idx)}
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
            onChange={handleFileChange} 
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

        <button type="submit" className="w-full py-5 bg-indigo-600 text-white font-black rounded-3xl shadow-xl shadow-indigo-100 flex items-center justify-center gap-2 transition-transform active:scale-95">
          <Send size={18} /> 送出報修資料
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
                 <br/><br/>
                 請點擊下方選單進行相關操作，如有緊急故障請直接報修。
              </div>
           </div>

           {activeDisaster && (
             <div className="flex gap-2 animate-in slide-in-from-left duration-500 delay-300">
                <div className="w-10 h-10 bg-indigo-600 rounded-full flex items-center justify-center text-white font-bold text-[10px] shrink-0 shadow-lg ring-2 ring-white/10">TSA</div>
                <div className="bg-rose-50 border border-rose-100 p-4 rounded-3xl rounded-tl-none text-[11px] shadow-sm max-w-[85%] space-y-2">
                   <p className="font-black text-rose-600 flex items-center gap-1.5"><ShieldAlert size={14}/> 緊急災害通報：{activeDisaster.name}</p>
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
           <div className="w-9 h-9 rounded-full bg-slate-100 flex items-center justify-center text-slate-400 hover:bg-slate-200 transition-colors"><Plus size={20}/></div>
           <div className="flex-1 bg-slate-50 border border-slate-100 rounded-full px-5 py-2.5 text-[11px] font-bold text-slate-400 italic">請輸入訊息...</div>
           <ImageIcon size={22} className="text-slate-300" />
        </div>

        {/* 表單 Modal 容器 */}
        {activeForm === 'REPAIR' && <MobileForm title="會館線上報修" type="REPAIR" />}
        {activeForm === 'FINISH' && <MobileForm title="修繕完工回報" type="FINISH" />}
        {activeForm === 'DISASTER' && <MobileForm title="災害受損現狀回報" type="DISASTER" />}
      </div>
      
      {/* 底部裝飾物 (Home Indicator) */}
      <div className="absolute bottom-10 left-1/2 -translate-x-1/2 w-32 h-1.5 bg-white/20 rounded-full"></div>
    </div>
  );
};

export default MobileSimulation;
