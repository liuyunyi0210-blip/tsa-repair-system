
import React, { useState, useEffect } from 'react';
import { 
  Car, Plus, X, User, MapPin, 
  Wrench, ShieldAlert, AlertTriangle, 
  History, DollarSign, Calendar, ClipboardList 
} from 'lucide-react';
import { MOCK_HALLS } from '../constants';
// Add Language to imports from types
import { OfficialVehicle, VehicleRecord, Language } from '../types';

// Define props interface to include language
interface VehicleManagementProps {
  language: Language;
}

// Update component to accept props including language
const VehicleManagement: React.FC<VehicleManagementProps> = ({ language }) => {
  const [vehicles, setVehicles] = useState<OfficialVehicle[]>([]);
  const [showModal, setShowModal] = useState(false);
  const [showRecordModal, setShowRecordModal] = useState<OfficialVehicle | null>(null);
  
  const [formData, setFormData] = useState<Partial<OfficialVehicle>>({
    hallName: MOCK_HALLS[0].name,
    brand: '',
    model: '',
    plateNumber: '',
    manager: '',
    mileage: 0
  });

  const [recordForm, setRecordForm] = useState<Partial<VehicleRecord>>({
    type: 'MAINTENANCE',
    date: new Date().toISOString().split('T')[0],
    description: '',
    personInCharge: ''
  });

  useEffect(() => {
    const saved = localStorage.getItem('tsa_vehicles_v6');
    if (saved) setVehicles(JSON.parse(saved));
  }, []);

  const saveVehicles = (data: OfficialVehicle[]) => {
    setVehicles(data);
    localStorage.setItem('tsa_vehicles_v6', JSON.stringify(data));
  };

  const handleAddVehicle = (e: React.FormEvent) => {
    e.preventDefault();
    const newV: OfficialVehicle = { ...formData as OfficialVehicle, id: `V-${Date.now()}`, purchaseDate: new Date().toISOString().split('T')[0], records: [] };
    saveVehicles([newV, ...vehicles]);
    setShowModal(false);
  };

  const handleAddRecord = (e: React.FormEvent) => {
    e.preventDefault();
    if (!showRecordModal) return;
    const newRecord: VehicleRecord = { ...recordForm as VehicleRecord, id: `R-${Date.now()}` };
    const updated = vehicles.map(v => v.id === showRecordModal.id ? { ...v, records: [newRecord, ...v.records] } : v);
    saveVehicles(updated);
    setShowRecordModal(null);
  };

  return (
    <div className="space-y-8 animate-in fade-in pb-20">
      <div className="flex items-center justify-between">
        <h1 className="text-3xl font-extrabold text-slate-900 tracking-tight flex items-center gap-3"><Car className="text-indigo-600" /> 公務車管理系統</h1>
        <button onClick={() => setShowModal(true)} className="px-8 py-4 bg-indigo-600 text-white rounded-[24px] font-black shadow-lg">新增車輛</button>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
        {vehicles.map(v => (
          <div key={v.id} className="bg-white rounded-[40px] border border-slate-200 overflow-hidden flex flex-col group shadow-sm hover:shadow-xl transition-all">
            <div className="bg-slate-900 p-8 text-white">
               <div className="flex justify-between items-start mb-4">
                  <div className="p-3 bg-white/10 rounded-2xl"><Car size={32} /></div>
                  <span className="text-[10px] font-black uppercase bg-indigo-500 px-3 py-1 rounded-xl">{v.hallName}</span>
               </div>
               <h3 className="text-3xl font-black">{v.plateNumber}</h3>
               <p className="text-indigo-300 font-bold mt-1">{v.brand} {v.model}</p>
            </div>
            
            <div className="p-8 space-y-6 flex-1">
               <div className="grid grid-cols-2 gap-4">
                  <div className="space-y-1">
                     <label className="text-[10px] font-black text-slate-400">管理人</label>
                     <p className="font-bold flex items-center gap-2"><User size={14}/> {v.manager}</p>
                  </div>
                  <div className="space-y-1">
                     <label className="text-[10px] font-black text-slate-400">里程數</label>
                     <p className="font-black text-xl">{v.mileage?.toLocaleString()} KM</p>
                  </div>
               </div>

               <div className="pt-4 border-t border-slate-50 space-y-2">
                  <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest">最近三筆紀錄</p>
                  {v.records.slice(0, 3).map(r => (
                    <div key={r.id} className="flex items-center justify-between text-xs">
                       <span className={`font-black ${r.type === 'MAINTENANCE' ? 'text-indigo-600' : 'text-rose-500'}`}>{r.type === 'MAINTENANCE' ? '保養' : r.type === 'ACCIDENT' ? '事故' : '出險'}</span>
                       <span className="text-slate-400">{r.date}</span>
                    </div>
                  ))}
               </div>
            </div>

            <div className="px-8 py-6 bg-slate-50 border-t border-slate-100 grid grid-cols-3 gap-2">
               <button onClick={() => { setRecordForm({ type: 'MAINTENANCE' }); setShowRecordModal(v); }} className="p-2 bg-white rounded-xl border border-indigo-100 text-indigo-600 font-black text-[10px] flex flex-col items-center gap-1 hover:bg-indigo-600 hover:text-white"><Wrench size={16}/> 保養</button>
               <button onClick={() => { setRecordForm({ type: 'INSURANCE_CLAIM' }); setShowRecordModal(v); }} className="p-2 bg-white rounded-xl border border-emerald-100 text-emerald-600 font-black text-[10px] flex flex-col items-center gap-1 hover:bg-emerald-600 hover:text-white"><ShieldAlert size={16}/> 出險</button>
               <button onClick={() => { setRecordForm({ type: 'ACCIDENT' }); setShowRecordModal(v); }} className="p-2 bg-white rounded-xl border border-rose-100 text-rose-600 font-black text-[10px] flex flex-col items-center gap-1 hover:bg-rose-600 hover:text-white"><AlertTriangle size={16}/> 車禍</button>
            </div>
          </div>
        ))}
      </div>

      {showModal && (
        <div className="fixed inset-0 z-[120] flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-sm">
           <div className="bg-white w-full max-w-xl rounded-[40px] p-10 space-y-8 animate-in zoom-in-95">
              <h3 className="text-2xl font-black">新增公務車</h3>
              <form onSubmit={handleAddVehicle} className="grid grid-cols-2 gap-6">
                <div className="space-y-1"><label className="text-xs font-black text-slate-400">會館</label><select className="w-full px-4 py-3 bg-slate-50 rounded-2xl" value={formData.hallName} onChange={e => setFormData({...formData, hallName: e.target.value})}>{MOCK_HALLS.map(h => <option key={h.id}>{h.name}</option>)}</select></div>
                <div className="space-y-1"><label className="text-xs font-black text-slate-400">車牌</label><input required className="w-full px-4 py-3 bg-slate-50 rounded-2xl" value={formData.plateNumber} onChange={e => setFormData({...formData, plateNumber: e.target.value})} /></div>
                <div className="space-y-1"><label className="text-xs font-black text-slate-400">品牌</label><input required className="w-full px-4 py-3 bg-slate-50 rounded-2xl" value={formData.brand} onChange={e => setFormData({...formData, brand: e.target.value})} /></div>
                <div className="space-y-1"><label className="text-xs font-black text-slate-400">型號</label><input required className="w-full px-4 py-3 bg-slate-50 rounded-2xl" value={formData.model} onChange={e => setFormData({...formData, model: e.target.value})} /></div>
                <div className="space-y-1"><label className="text-xs font-black text-slate-400">管理人</label><input required className="w-full px-4 py-3 bg-slate-50 rounded-2xl" value={formData.manager} onChange={e => setFormData({...formData, manager: e.target.value})} /></div>
                <div className="space-y-1"><label className="text-xs font-black text-slate-400">里程數</label><input type="number" className="w-full px-4 py-3 bg-slate-50 rounded-2xl" value={formData.mileage} onChange={e => setFormData({...formData, mileage: parseInt(e.target.value)})} /></div>
                <div className="col-span-2 flex gap-4 pt-4"><button className="flex-1 bg-indigo-600 text-white font-black py-4 rounded-3xl">建立車輛資產</button><button onClick={() => setShowModal(false)} type="button" className="px-10 font-bold">取消</button></div>
              </form>
           </div>
        </div>
      )}

      {showRecordModal && (
        <div className="fixed inset-0 z-[120] flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-sm">
           <div className="bg-white w-full max-w-lg rounded-[40px] p-10 space-y-8 animate-in zoom-in-95">
              <h3 className="text-2xl font-black">輸入紀錄 - {showRecordModal.plateNumber}</h3>
              <form onSubmit={handleAddRecord} className="space-y-6">
                <div className="grid grid-cols-2 gap-4">
                   <div className="space-y-1"><label className="text-xs font-black text-slate-400">日期</label><input type="date" className="w-full px-4 py-3 bg-slate-50 rounded-2xl" value={recordForm.date} onChange={e => setRecordForm({...recordForm, date: e.target.value})} /></div>
                   <div className="space-y-1"><label className="text-xs font-black text-slate-400">{recordForm.type === 'MAINTENANCE' ? '保養人' : '駕駛人'}</label><input required className="w-full px-4 py-3 bg-slate-50 rounded-2xl" value={recordForm.personInCharge} onChange={e => setRecordForm({...recordForm, personInCharge: e.target.value})} /></div>
                </div>
                <div className="space-y-1"><label className="text-xs font-black text-slate-400">說明描述</label><textarea required rows={3} className="w-full px-4 py-3 bg-slate-50 rounded-2xl" value={recordForm.description} onChange={e => setRecordForm({...recordForm, description: e.target.value})} /></div>
                <div className="space-y-1"><label className="text-xs font-black text-slate-400">金額 (選填)</label><input type="number" className="w-full px-4 py-3 bg-slate-50 rounded-2xl" value={recordForm.amount} onChange={e => setRecordForm({...recordForm, amount: parseInt(e.target.value)})} /></div>
                <div className="flex gap-4 pt-4"><button className="flex-1 bg-indigo-600 text-white font-black py-4 rounded-3xl shadow-xl">提交紀錄</button><button onClick={() => setShowRecordModal(null)} type="button" className="px-10 font-bold">取消</button></div>
              </form>
           </div>
        </div>
      )}
    </div>
  );
};

export default VehicleManagement;
