
import React, { useState, useEffect } from 'react';
import {
  HeartPulse,
  Plus,
  X,
  Calendar,
  Settings,
  History,
  RefreshCw,
  Phone,
  User,
  ShieldCheck,
  Clock,
  Zap,
  Tag,
  Search,
  CheckCircle2,
  Trash2
} from 'lucide-react';
import { MOCK_HALLS } from '../constants';
import { AED, Language, AEDHistoryItem, Hall } from '../types';
import { storageService } from '../services/storageService';

interface AEDManagementProps {
  language: Language;
}

const AEDManagement: React.FC<AEDManagementProps> = ({ language }) => {
  const [aeds, setAeds] = useState<AED[]>([]);
  const [showModal, setShowModal] = useState(false);
  const [showHistoryModal, setShowHistoryModal] = useState<AED | null>(null);
  const [showUpdateModal, setShowUpdateModal] = useState<{ aed: AED; type: 'BATTERY' | 'PADS' } | null>(null);
  const [halls, setHalls] = useState<Hall[]>([]);

  const [formData, setFormData] = useState<Partial<AED>>({
    hallName: '',
    location: '',
    brand: '',
    model: '',
    serialNumber: '',
    batteryExpiry: '',
    padsExpiry: '',
    vendorName: '',
    vendorPhone: ''
  });

  useEffect(() => {
    const loadHalls = async () => {
      const savedHalls = await storageService.loadHalls();
      const list = savedHalls || MOCK_HALLS;
      setHalls(list);
      if (list.length > 0) {
        setFormData(prev => ({ ...prev, hallName: list[0].name }));
      }
    };
    loadHalls();
  }, []);

  useEffect(() => {
    const loadData = async () => {
      const saved = await storageService.loadAEDs();
      if (saved) setAeds(saved);
    };
    loadData();
  }, []);

  const saveAeds = async (data: AED[]) => {
    setAeds(data);
    await storageService.saveAEDs(data);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    const newAed: AED = {
      ...formData as AED,
      id: `AED-${Date.now()}`,
      purchaseDate: new Date().toISOString().split('T')[0],
      lastInspectedDate: new Date().toISOString().split('T')[0],
      history: [
        {
          id: `H-${Date.now()}`,
          type: 'INSPECTION',
          date: new Date().toISOString().split('T')[0],
          cost: 0,
          remark: '設備初始建立'
        }
      ]
    };
    await saveAeds([newAed, ...aeds]);
    setShowModal(false);
    setFormData({ hallName: halls.length > 0 ? halls[0].name : '' });
  };

  const handleUpdateExpiry = async (aedId: string, type: 'BATTERY' | 'PADS', newDate: string, cost: number) => {
    const updated = aeds.map(a => {
      if (a.id === aedId) {
        const historyItem: AEDHistoryItem = {
          id: `H-${Date.now()}`,
          type,
          date: new Date().toISOString().split('T')[0],
          cost,
          remark: `更新${type === 'BATTERY' ? '電池' : '貼片'}效期至 ${newDate}`
        };
        return {
          ...a,
          [type === 'BATTERY' ? 'batteryExpiry' : 'padsExpiry']: newDate,
          history: [historyItem, ...a.history]
        };
      }
      return a;
    });
    await saveAeds(updated);
    setShowUpdateModal(null);
  };

  const handleDelete = async (aedId: string) => {
    if (window.confirm('確定要刪除這筆 AED 資料嗎？此操作無法還原。')) {
      const updated = aeds.filter(a => a.id !== aedId);
      await saveAeds(updated);
    }
  };

  const isNearExpiry = (dateStr: string) => {
    if (!dateStr) return false;
    const expiry = new Date(dateStr);
    const today = new Date();
    const diffTime = expiry.getTime() - today.getTime();
    const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));
    return diffDays < 90;
  };

  return (
    <div className="space-y-8 animate-in fade-in pb-24">
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <h1 className="text-3xl font-extrabold text-slate-900 tracking-tight flex items-center gap-3">
            <HeartPulse className="text-rose-500" /> AED 設施管理系統
          </h1>
          <p className="text-slate-500 font-medium tracking-tight">會館 AED 設備清單、耗材效期追蹤與廠商維護紀錄</p>
        </div>
        <button onClick={() => setShowModal(true)} className="px-8 py-4 bg-slate-900 text-white rounded-[24px] font-black shadow-xl hover:bg-indigo-600 transition-all flex items-center gap-2">
          <Plus size={20} /> 新增設備檔案
        </button>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
        {aeds.map(aed => (
          <div key={aed.id} className="bg-white rounded-[48px] border border-slate-200 shadow-sm hover:shadow-2xl transition-all p-8 flex flex-col group relative overflow-hidden">
            <button
              onClick={() => handleDelete(aed.id)}
              className="absolute top-8 right-8 p-3 text-slate-300 hover:text-rose-500 hover:bg-rose-50 rounded-full transition-all opacity-0 group-hover:opacity-100 z-10"
              title="刪除資料"
            >
              <Trash2 size={20} />
            </button>
            <div className="space-y-6 flex-1">
              <div className="flex justify-between items-start">
                <div className="p-4 bg-rose-50 text-rose-600 rounded-3xl"><HeartPulse size={32} /></div>
                <div className="text-right">
                  <span className="text-[10px] font-black uppercase text-slate-400 bg-slate-100 px-3 py-1 rounded-xl block mb-1">
                    {aed.hallName}
                  </span>
                  <span className="text-[10px] font-black text-indigo-500 bg-indigo-50 px-2.5 py-1 rounded-lg">
                    S/N: {aed.serialNumber}
                  </span>
                </div>
              </div>

              <div>
                <h3 className="text-2xl font-black text-slate-900 leading-tight">{aed.location}</h3>
                <div className="flex items-center gap-2 mt-2">
                  <span className="text-[10px] font-black bg-slate-100 text-slate-500 px-2 py-0.5 rounded-lg uppercase">{aed.brand}</span>
                  <span className="text-sm font-bold text-slate-400">{aed.model}</span>
                </div>
              </div>

              <div className="grid grid-cols-2 gap-4 py-5 border-y border-slate-50">
                <div className="space-y-1.5">
                  <div className="flex items-center gap-1.5 text-slate-400">
                    <Zap size={12} />
                    <p className="text-[10px] font-black uppercase tracking-widest">電池效期</p>
                  </div>
                  <p className={`text-sm font-black ${isNearExpiry(aed.batteryExpiry) ? 'text-rose-600' : 'text-slate-700'}`}>
                    {aed.batteryExpiry || '未設定'}
                  </p>
                </div>
                <div className="space-y-1.5">
                  <div className="flex items-center gap-1.5 text-slate-400">
                    <Tag size={12} />
                    <p className="text-[10px] font-black uppercase tracking-widest">貼片效期</p>
                  </div>
                  <p className={`text-sm font-black ${isNearExpiry(aed.padsExpiry) ? 'text-rose-600' : 'text-slate-700'}`}>
                    {aed.padsExpiry || '未設定'}
                  </p>
                </div>
              </div>

              <div className="space-y-2.5">
                <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest flex items-center gap-2">
                  <ShieldCheck size={14} /> 維護廠商資訊
                </p>
                <div className="bg-slate-50 rounded-2xl p-4 space-y-2">
                  <div className="flex items-center gap-2 text-xs font-bold text-slate-700">
                    <User size={14} className="text-slate-300" /> 聯絡人：{aed.vendorName || '--'}
                  </div>
                  <div className="flex items-center gap-2 text-xs font-bold text-slate-700">
                    <Phone size={14} className="text-slate-300" /> 電話：{aed.vendorPhone || '--'}
                  </div>
                </div>
              </div>
            </div>

            <div className="pt-8 space-y-3">
              <div className="grid grid-cols-2 gap-3">
                <button
                  onClick={() => setShowUpdateModal({ aed, type: 'BATTERY' })}
                  className="flex items-center justify-center gap-2 py-4 bg-indigo-50 text-indigo-600 rounded-[20px] font-black text-xs hover:bg-indigo-600 hover:text-white transition-all"
                >
                  <RefreshCw size={14} /> 更新電池
                </button>
                <button
                  onClick={() => setShowUpdateModal({ aed, type: 'PADS' })}
                  className="flex items-center justify-center gap-2 py-4 bg-rose-50 text-rose-600 rounded-[20px] font-black text-xs hover:bg-rose-600 hover:text-white transition-all"
                >
                  <Tag size={14} /> 更新貼片
                </button>
              </div>
              <button
                onClick={() => setShowHistoryModal(aed)}
                className="w-full flex items-center justify-center gap-2 py-4 bg-slate-900 text-white rounded-[20px] font-black text-xs shadow-lg shadow-slate-200 hover:bg-slate-800 transition-all"
              >
                <History size={14} /> 查詢維護紀錄
              </button>
            </div>
          </div>
        ))}
      </div>

      {/* 新增 AED Modal */}
      {showModal && (
        <div className="fixed inset-0 z-[120] flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-sm animate-in fade-in">
          <div className="bg-white w-full max-w-2xl rounded-[48px] p-10 space-y-8 animate-in zoom-in-95 max-h-[90vh] overflow-y-auto shadow-2xl">
            <div className="flex justify-between items-center">
              <h3 className="text-2xl font-black text-slate-900">建立 AED 設備資產</h3>
              <button onClick={() => setShowModal(false)} className="p-3 text-slate-400 hover:bg-slate-100 rounded-full transition-colors"><X /></button>
            </div>

            <form onSubmit={handleSubmit} className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div className="md:col-span-2 space-y-1">
                <label className="text-xs font-black text-slate-400 uppercase tracking-widest">會館別 *</label>
                <select className="w-full px-5 py-4 bg-slate-50 rounded-[20px] border-none outline-none font-bold" value={formData.hallName} onChange={e => setFormData({ ...formData, hallName: e.target.value })}>
                  {halls.map(h => <option key={h.id} value={h.name}>{h.name}</option>)}
                </select>
              </div>
              <div className="space-y-1">
                <label className="text-xs font-black text-slate-400 uppercase tracking-widest">具體安裝位置 *</label>
                <input required placeholder="如: 1F 服務台後方" className="w-full px-5 py-4 bg-slate-50 rounded-[20px] border-none outline-none font-bold" value={formData.location} onChange={e => setFormData({ ...formData, location: e.target.value })} />
              </div>
              <div className="space-y-1">
                <label className="text-xs font-black text-slate-400 uppercase tracking-widest">機身序列號 (S/N) *</label>
                <input required placeholder="Serial Number" className="w-full px-5 py-4 bg-slate-50 rounded-[20px] border-none outline-none font-bold" value={formData.serialNumber} onChange={e => setFormData({ ...formData, serialNumber: e.target.value })} />
              </div>

              <div className="space-y-1">
                <label className="text-xs font-black text-slate-400 uppercase tracking-widest">品牌 *</label>
                <input required placeholder="如: Philips / ZOLL" className="w-full px-5 py-4 bg-slate-50 rounded-[20px] border-none outline-none font-bold" value={formData.brand} onChange={e => setFormData({ ...formData, brand: e.target.value })} />
              </div>
              <div className="space-y-1">
                <label className="text-xs font-black text-slate-400 uppercase tracking-widest">型號 *</label>
                <input required placeholder="如: HeartStart / AED Plus" className="w-full px-5 py-4 bg-slate-50 rounded-[20px] border-none outline-none font-bold" value={formData.model} onChange={e => setFormData({ ...formData, model: e.target.value })} />
              </div>

              <div className="md:col-span-2 p-8 bg-rose-50 rounded-[32px] space-y-5 border border-rose-100 shadow-inner">
                <p className="text-xs font-black text-rose-600 uppercase tracking-widest flex items-center gap-2"><Calendar size={14} /> 耗材效期預設</p>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <div className="space-y-1">
                    <label className="text-[10px] font-black text-slate-400 uppercase">電池到期日</label>
                    <input required type="date" className="w-full px-4 py-3 bg-white rounded-xl border border-rose-200 outline-none font-bold" value={formData.batteryExpiry} onChange={e => setFormData({ ...formData, batteryExpiry: e.target.value })} />
                  </div>
                  <div className="space-y-1">
                    <label className="text-[10px] font-black text-slate-400 uppercase">貼片到期日</label>
                    <input required type="date" className="w-full px-4 py-3 bg-white rounded-xl border border-rose-200 outline-none font-bold" value={formData.padsExpiry} onChange={e => setFormData({ ...formData, padsExpiry: e.target.value })} />
                  </div>
                </div>
              </div>

              <div className="md:col-span-2 space-y-5 pt-2">
                <p className="text-xs font-black text-slate-400 uppercase tracking-widest flex items-center gap-2"><ShieldCheck size={14} /> 維護廠商資訊</p>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <div className="space-y-1">
                    <label className="text-[10px] font-black text-slate-400 uppercase">廠商名稱 / 聯絡人</label>
                    <input placeholder="輸入公司名或負責人" className="w-full px-5 py-4 bg-slate-50 rounded-[20px] border-none outline-none font-bold" value={formData.vendorName} onChange={e => setFormData({ ...formData, vendorName: e.target.value })} />
                  </div>
                  <div className="space-y-1">
                    <label className="text-[10px] font-black text-slate-400 uppercase">廠商聯絡電話</label>
                    <input placeholder="輸入電話號碼" className="w-full px-5 py-4 bg-slate-50 rounded-[20px] border-none outline-none font-bold" value={formData.vendorPhone} onChange={e => setFormData({ ...formData, vendorPhone: e.target.value })} />
                  </div>
                </div>
              </div>

              <div className="md:col-span-2 flex gap-4 pt-8">
                <button type="submit" className="flex-1 bg-indigo-600 text-white font-black py-5 rounded-[24px] shadow-2xl shadow-indigo-100 hover:bg-indigo-700 transition-all">完成建立並存檔</button>
                <button type="button" onClick={() => setShowModal(false)} className="px-10 bg-white border border-slate-200 rounded-[24px] font-black text-slate-500">取消</button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* 更新效期 Modal */}
      {showUpdateModal && (
        <div className="fixed inset-0 z-[130] flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-sm animate-in fade-in">
          <div className="bg-white w-full max-w-sm rounded-[40px] shadow-2xl p-10 space-y-8">
            <div className="space-y-2">
              <h3 className="text-2xl font-black text-slate-900 leading-tight">
                更新{showUpdateModal.type === 'BATTERY' ? '電池' : '貼片'}
              </h3>
              <p className="text-xs font-bold text-slate-400">更換耗材後請輸入新的有效截止日期</p>
            </div>
            <div className="space-y-5">
              <div className="space-y-1">
                <label className="text-[10px] font-black text-slate-400 uppercase">新的到期日</label>
                <input type="date" className="w-full px-5 py-4 bg-slate-50 rounded-2xl font-bold border-none outline-none ring-2 ring-transparent focus:ring-indigo-600 transition-all" id="new-expiry" defaultValue={new Date().toISOString().split('T')[0]} />
              </div>
              <div className="space-y-1">
                <label className="text-[10px] font-black text-slate-400 uppercase">更換成本 (元)</label>
                <div className="relative">
                  <span className="absolute left-5 top-1/2 -translate-y-1/2 text-slate-400 font-black">$</span>
                  <input type="number" className="w-full pl-10 pr-5 py-4 bg-slate-50 rounded-2xl font-bold border-none outline-none ring-2 ring-transparent focus:ring-indigo-600 transition-all" id="update-cost" defaultValue="0" />
                </div>
              </div>
            </div>
            <div className="flex gap-4">
              <button
                onClick={() => {
                  const date = (document.getElementById('new-expiry') as HTMLInputElement).value;
                  const cost = parseInt((document.getElementById('update-cost') as HTMLInputElement).value);
                  handleUpdateExpiry(showUpdateModal.aed.id, showUpdateModal.type, date, cost);
                }}
                className="flex-1 bg-indigo-600 text-white font-black py-4 rounded-2xl shadow-xl shadow-indigo-100"
              >確認更換</button>
              <button onClick={() => setShowUpdateModal(null)} className="px-6 py-4 text-slate-400 font-bold">取消</button>
            </div>
          </div>
        </div>
      )}

      {/* 歷史紀錄 Modal */}
      {showHistoryModal && (
        <div className="fixed inset-0 z-[130] flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-sm animate-in fade-in">
          <div className="bg-white w-full max-w-lg rounded-[48px] shadow-2xl p-10 space-y-8 max-h-[80vh] flex flex-col">
            <div className="flex justify-between items-start">
              <div>
                <h3 className="text-2xl font-black text-slate-900">設備維護軌跡</h3>
                <p className="text-xs font-bold text-slate-400 mt-1">{showHistoryModal.hallName} • {showHistoryModal.location}</p>
              </div>
              <button onClick={() => setShowHistoryModal(null)} className="p-3 text-slate-400 hover:bg-slate-100 rounded-full transition-colors"><X /></button>
            </div>

            <div className="flex-1 overflow-y-auto space-y-4 pr-3 custom-scrollbar">
              {showHistoryModal.history.map(item => (
                <div key={item.id} className="flex items-start gap-5 p-5 bg-slate-50 rounded-[28px] border border-slate-100 hover:bg-white transition-all">
                  <div className={`p-3 rounded-2xl text-white shadow-lg ${item.type === 'BATTERY' ? 'bg-indigo-500' :
                    item.type === 'PADS' ? 'bg-rose-500' : 'bg-emerald-500'
                    }`}>
                    {item.type === 'BATTERY' ? <RefreshCw size={20} /> :
                      item.type === 'PADS' ? <Tag size={20} /> : <CheckCircle2 size={20} />}
                  </div>
                  <div className="flex-1 min-w-0">
                    <div className="flex justify-between items-center mb-1">
                      <span className="text-[10px] font-black uppercase text-slate-400 tracking-widest">{item.date}</span>
                      <span className="text-sm font-black text-slate-900">${item.cost.toLocaleString()}</span>
                    </div>
                    <p className="text-sm font-bold text-slate-700 truncate">{item.remark}</p>
                  </div>
                </div>
              ))}
              {showHistoryModal.history.length === 0 && (
                <div className="py-20 text-center space-y-4">
                  <div className="flex justify-center"><Search size={48} className="text-slate-100" /></div>
                  <p className="text-slate-300 font-black">目前尚無異動紀錄</p>
                </div>
              )}
            </div>

            <button onClick={() => setShowHistoryModal(null)} className="w-full bg-slate-900 text-white font-black py-5 rounded-[24px] shadow-xl">關閉紀錄視窗</button>
          </div>
        </div>
      )}
    </div>
  );
};

export default AEDManagement;
