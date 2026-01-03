
import React, { useState, useEffect } from 'react';
import { 
  Plus, 
  Search, 
  Droplets, 
  History, 
  X, 
  ArrowLeft, 
  Wrench,
  Clock,
  Check,
  CheckCircle2,
  DollarSign,
  Download,
  Settings2,
  CheckSquare,
  Square,
  Save
} from 'lucide-react';
import { MOCK_HALLS, WATER_PRICE_LIST as DEFAULT_PRICE_LIST } from '../constants';
import { WaterDispenser, WaterMaintenanceRecord, Language } from '../types';

interface WaterManagementProps {
  onDirtyChange?: (isDirty: boolean) => void;
  language: Language;
}

// Added language prop to interface and destructured it to resolve parent component type error
const WaterManagement: React.FC<WaterManagementProps> = ({ onDirtyChange, language }) => {
  const [view, setView] = useState<'LIST' | 'ADD' | 'HISTORY' | 'PRICE_ADMIN'>('LIST');
  const [dispensers, setDispensers] = useState<WaterDispenser[]>([]);
  const [maintenanceHistory, setMaintenanceHistory] = useState<WaterMaintenanceRecord[]>([]);
  const [customPriceList, setCustomPriceList] = useState<any>(DEFAULT_PRICE_LIST);
  
  const [selectedHall, setSelectedHall] = useState<string>('ALL');
  const [selectedIds, setSelectedIds] = useState<Set<string>>(new Set());
  const [isSelectMode, setIsSelectMode] = useState(false);
  
  const [selectedDispenser, setSelectedDispenser] = useState<WaterDispenser | null>(null);
  const [showRecordForm, setShowRecordForm] = useState(false);

  useEffect(() => {
    const savedD = localStorage.getItem('tsa_water_dispensers_v3');
    const savedH = localStorage.getItem('tsa_water_history_v3');
    if (savedD) setDispensers(JSON.parse(savedD));
    if (savedH) setMaintenanceHistory(JSON.parse(savedH));
  }, []);

  const saveData = (d: WaterDispenser[], h: WaterMaintenanceRecord[]) => {
    setDispensers(d);
    setMaintenanceHistory(h);
    localStorage.setItem('tsa_water_dispensers_v3', JSON.stringify(d));
    localStorage.setItem('tsa_water_history_v3', JSON.stringify(h));
  };

  const filteredDispensers = dispensers.filter(d => selectedHall === 'ALL' || d.hallName === selectedHall);

  return (
    <div className="space-y-8 animate-in fade-in pb-20">
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <h1 className="text-3xl font-extrabold text-slate-900 flex items-center gap-3"><Droplets className="text-blue-500" /> 飲水機維運管理</h1>
          <p className="text-slate-500 mt-1 font-medium">追蹤各會館飲水機濾心壽命與保養週期</p>
        </div>
        <button onClick={() => setView('ADD')} className="flex items-center gap-2 px-8 py-4 bg-blue-600 text-white rounded-[24px] font-black shadow-lg hover:bg-blue-700 transition-all"><Plus size={20} /> 新增設備</button>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {filteredDispensers.map(d => (
          <div key={d.id} className="bg-white rounded-[40px] border border-slate-200 shadow-sm hover:shadow-xl transition-all p-8 space-y-6">
            <div className="flex justify-between items-start">
              <div>
                <span className="px-3 py-1 bg-blue-50 text-blue-600 rounded-xl text-[10px] font-black uppercase tracking-widest">{d.hallName}</span>
                <h3 className="text-2xl font-black text-slate-900 mt-2">{d.location}</h3>
                <p className="text-sm text-slate-400 font-bold">{d.model}</p>
              </div>
              <div className="p-4 bg-blue-50 text-blue-600 rounded-3xl"><Droplets size={32} /></div>
            </div>
            <div className="grid grid-cols-5 gap-2 pt-4 border-t border-slate-50">
              {Object.entries(d.filterStatus).map(([f, date], i) => (
                <div key={f} className="flex flex-col items-center">
                  <div className="w-full h-1.5 bg-slate-100 rounded-full mb-2"><div className="h-full bg-emerald-500 rounded-full" style={{width: '80%'}}></div></div>
                  <span className="text-[10px] font-black text-slate-400 uppercase">F{i+1}</span>
                </div>
              ))}
            </div>
            <button onClick={() => { setSelectedDispenser(d); setShowRecordForm(true); }} className="w-full bg-slate-900 text-white font-black py-4 rounded-3xl flex items-center justify-center gap-2 hover:bg-indigo-600 transition-all"><Wrench size={18}/> 執行保養回報</button>
          </div>
        ))}
        {filteredDispensers.length === 0 && <div className="lg:col-span-3 py-24 text-center text-slate-300 font-black">尚未建立飲水機設備檔案</div>}
      </div>

      {view === 'ADD' && (
        <div className="fixed inset-0 z-[120] flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-sm">
           <div className="bg-white w-full max-w-xl rounded-[40px] p-10 space-y-8 animate-in zoom-in-95">
              <h3 className="text-2xl font-black">建立飲水機資料</h3>
              <form onSubmit={(e) => { e.preventDefault(); /* 儲存邏輯略 */ setView('LIST'); }} className="grid grid-cols-2 gap-6">
                <div className="space-y-1"><label className="text-xs font-black text-slate-400">會館別</label><select className="w-full px-4 py-3 bg-slate-50 rounded-2xl">{MOCK_HALLS.map(h => <option key={h.id}>{h.name}</option>)}</select></div>
                <div className="space-y-1"><label className="text-xs font-black text-slate-400">安裝位置</label><input className="w-full px-4 py-3 bg-slate-50 rounded-2xl" placeholder="如: 1F 門廳" /></div>
                <div className="col-span-2 space-y-1"><label className="text-xs font-black text-slate-400">設備型號</label><input className="w-full px-4 py-3 bg-slate-50 rounded-2xl" placeholder="輸入機台型號" /></div>
                <div className="flex gap-4 col-span-2 pt-4"><button className="flex-1 bg-blue-600 text-white font-black py-4 rounded-3xl shadow-xl">建立設備</button><button onClick={() => setView('LIST')} className="px-10 bg-white border border-slate-200 rounded-3xl font-bold">取消</button></div>
              </form>
           </div>
        </div>
      )}
    </div>
  );
};

export default WaterManagement;
