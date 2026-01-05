
import React, { useState, useMemo, useEffect } from 'react';
import {
  Building2,
  MapPin,
  Phone,
  Wifi,
  Search,
  X,
  ChevronRight,
  Download,
  CheckSquare,
  Square,
  Edit2,
  Plus,
  Trash2,
  FileText,
  Upload,
  ExternalLink,
  Check,
  CheckCircle2,
  RefreshCw
} from 'lucide-react';
import { MOCK_HALLS } from '../constants';
import { Hall, TechnicalEntry } from '../types';
import { storageService } from '../services/storageService';

const HallManagement: React.FC = () => {
  const [halls, setHalls] = useState<Hall[]>([]);
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedDistrict, setSelectedDistrict] = useState('ALL');
  const [selectedIds, setSelectedIds] = useState<Set<string>>(new Set());
  const [isSelectMode, setIsSelectMode] = useState(false);
  const [editingHallId, setEditingHallId] = useState<string | null>(null);
  const [showExportModal, setShowExportModal] = useState(false);
  const [exportFields, setExportFields] = useState<Set<string>>(new Set(['name', 'address']));
  const [showDeleted, setShowDeleted] = useState(false);

  useEffect(() => {
    const loadData = async () => {
      const saved = await storageService.loadHalls();
      if (saved) setHalls(saved);
      else setHalls(MOCK_HALLS);
    };
    loadData();
  }, []);

  const saveHalls = async (updated: Hall[]) => {
    setHalls(updated);
    await storageService.saveHalls(updated);
  };

  const filteredHalls = halls.filter(hall => {
    const matchesSearch = hall.name.includes(searchTerm) || hall.address.includes(searchTerm);
    const matchesDistrict = selectedDistrict === 'ALL' || hall.district === selectedDistrict;
    const matchesStatus = showDeleted ? !!hall.isDeleted : !hall.isDeleted;
    return matchesSearch && matchesDistrict && matchesStatus;
  });

  const toggleSelection = (id: string) => {
    const newSet = new Set(selectedIds);
    if (newSet.has(id)) newSet.delete(id); else newSet.add(id);
    setSelectedIds(newSet);
  };

  const handleExportCSV = () => {
    const targets = isSelectMode ? halls.filter(h => selectedIds.has(h.id)) : filteredHalls;
    if (targets.length === 0) return alert('請選擇會館');

    const headers: string[] = [];
    if (exportFields.has('name')) headers.push('會館名稱');
    if (exportFields.has('address')) headers.push('地址');
    if (exportFields.has('phone')) headers.push('電話(全部)');
    if (exportFields.has('network')) headers.push('網路號碼(全部)');

    const rows = targets.map(h => {
      const row: string[] = [];
      if (exportFields.has('name')) row.push(h.name);
      if (exportFields.has('address')) row.push(h.address);
      if (exportFields.has('phone')) row.push(h.phoneEntries.map(p => p.value).join(' / '));
      if (exportFields.has('network')) row.push(h.networkEntries.map(n => n.value).join(' / '));
      return row;
    });

    const csvContent = "\uFEFF" + [headers, ...rows].map(e => e.join(",")).join("\n");
    const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
    const link = document.createElement("a");
    link.href = URL.createObjectURL(blob);
    link.download = `TSA會館資料_${new Date().getTime()}.csv`;
    link.click();
    setShowExportModal(false);
  };

  const handleDeleteHall = async (id: string) => {
    if (!confirm('確定要將此會館移至回收桶嗎？')) return;
    const updated = halls.map(h => h.id === id ? { ...h, isDeleted: true } : h);
    await saveHalls(updated);
  };

  const handleRestoreHall = async (id: string) => {
    const updated = halls.map(h => h.id === id ? { ...h, isDeleted: false } : h);
    await saveHalls(updated);
  };

  const handlePermanentDelete = async (id: string) => {
    if (!confirm('永久刪除後將無法復原，確定要執行嗎？')) return;
    const updated = halls.filter(h => h.id !== id);
    await saveHalls(updated);
  };

  const handleResetData = async () => {
    if (!confirm('確定要將會館資料重設為系統預設值嗎？這將會覆蓋您目前的修改，並載入全部 44 間會館資料。')) return;
    await saveHalls(MOCK_HALLS);
    alert('資料已重設成功！');
  };

  const HallDetailModal = () => {
    const isNew = editingHallId === 'NEW_HALL';
    const hall = isNew ? {
      id: `H-${Date.now()}`,
      name: '',
      address: '',
      builtDate: '',
      district: '',
      area: '',
      phoneEntries: [],
      networkEntries: [],
      photoUrl: '',
      electricalLayoutUrls: [],
      floorPlanUrls: [],
      isDeleted: false
    } as Hall : halls.find(h => h.id === editingHallId);

    if (!hall) return null;
    const [temp, setTemp] = useState<Hall>({ ...hall });

    const addTechnicalEntry = (type: 'phone' | 'network') => {
      const newEntry: TechnicalEntry = { id: `E-${Date.now()}`, value: '', taxId: '' };
      if (type === 'phone') setTemp({ ...temp, phoneEntries: [...temp.phoneEntries, newEntry] });
      else setTemp({ ...temp, networkEntries: [...temp.networkEntries, newEntry] });
    };

    const updateTechnicalEntry = (type: 'phone' | 'network', id: string, field: 'value' | 'taxId', val: string) => {
      const entries = type === 'phone' ? [...temp.phoneEntries] : [...temp.networkEntries];
      const idx = entries.findIndex(e => e.id === id);
      if (idx > -1) {
        entries[idx] = { ...entries[idx], [field]: val };
        if (type === 'phone') setTemp({ ...temp, phoneEntries: entries });
        else setTemp({ ...temp, networkEntries: entries });
      }
    };

    return (
      <div className="fixed inset-0 z-[110] flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-sm">
        <div className="bg-white w-full max-w-4xl rounded-[40px] p-10 space-y-8 shadow-2xl animate-in zoom-in-95 max-h-[90vh] overflow-y-auto">
          <div className="flex justify-between items-start border-b border-slate-100 pb-4 gap-4">
            <div className="flex-1">
              <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest mb-1 block">會館名稱</label>
              <input
                className="text-2xl font-black w-full bg-transparent border-none outline-none placeholder:text-slate-200"
                value={temp.name}
                onChange={e => setTemp({ ...temp, name: e.target.value })}
                placeholder="請輸入會館名稱"
              />
            </div>
            <button onClick={() => setEditingHallId(null)} className="p-2 hover:bg-slate-100 rounded-full transition-colors"><X /></button>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-10">
            <div className="space-y-6">
              <div className="space-y-2">
                <label className="text-xs font-black text-slate-400 uppercase tracking-widest">基本資訊</label>
                <div className="bg-slate-50 p-4 rounded-2xl space-y-3">
                  <div className="flex items-center gap-2">
                    <MapPin size={16} className="text-indigo-600 shrink-0" />
                    <input className="font-bold bg-transparent w-full outline-none placeholder:text-slate-400" value={temp.address} onChange={e => setTemp({ ...temp, address: e.target.value })} placeholder="請輸入地址" />
                  </div>
                  <div className="flex items-center gap-2 font-bold text-sm text-slate-500">
                    <span className="shrink-0">落成於:</span>
                    <input className="bg-transparent w-full outline-none placeholder:text-slate-400" value={temp.builtDate} onChange={e => setTemp({ ...temp, builtDate: e.target.value })} placeholder="例如: 2020/01/01" />
                  </div>
                </div>
              </div>

              <div className="space-y-4">
                <div className="flex justify-between items-center"><label className="text-xs font-black text-slate-400 uppercase tracking-widest">電話號碼管理</label><button onClick={() => addTechnicalEntry('phone')} className="text-indigo-600 hover:scale-110"><Plus size={18} /></button></div>
                {temp.phoneEntries.map(p => (
                  <div key={p.id} className="flex gap-2 animate-in slide-in-from-right-2">
                    <input className="flex-1 px-4 py-2 bg-slate-50 rounded-xl font-bold" value={p.value} placeholder="電話號碼" onChange={e => updateTechnicalEntry('phone', p.id, 'value', e.target.value)} />
                    <input className="w-24 px-4 py-2 bg-slate-50 rounded-xl font-bold" value={p.taxId} placeholder="統編" onChange={e => updateTechnicalEntry('phone', p.id, 'taxId', e.target.value)} />
                    <button onClick={() => setTemp({ ...temp, phoneEntries: temp.phoneEntries.filter(i => i.id !== p.id) })} className="text-rose-400"><Trash2 size={16} /></button>
                  </div>
                ))}
              </div>

              <div className="space-y-4">
                <div className="flex justify-between items-center"><label className="text-xs font-black text-slate-400 uppercase tracking-widest">網路號碼管理</label><button onClick={() => addTechnicalEntry('network')} className="text-indigo-600 hover:scale-110"><Plus size={18} /></button></div>
                {temp.networkEntries.map(n => (
                  <div key={n.id} className="flex gap-2">
                    <input className="flex-1 px-4 py-2 bg-slate-50 rounded-xl font-bold" value={n.value} placeholder="網路帳號" onChange={e => updateTechnicalEntry('network', n.id, 'value', e.target.value)} />
                    <input className="w-24 px-4 py-2 bg-slate-50 rounded-xl font-bold" value={n.taxId} placeholder="統編" onChange={e => updateTechnicalEntry('network', n.id, 'taxId', e.target.value)} />
                    <button onClick={() => setTemp({ ...temp, networkEntries: temp.networkEntries.filter(i => i.id !== n.id) })} className="text-rose-400"><Trash2 size={16} /></button>
                  </div>
                ))}
              </div>
            </div>

            <div className="space-y-6">
              <div className="space-y-4">
                <label className="text-xs font-black text-slate-400 uppercase tracking-widest">平面圖與配線圖管理</label>
                <div className="grid grid-cols-2 gap-4">
                  <div className="p-4 bg-slate-50 rounded-2xl border-2 border-dashed border-slate-200 flex flex-col items-center justify-center text-slate-400"><Upload size={24} /><span className="text-[10px] font-black mt-2">上傳平面圖</span></div>
                  <div className="p-4 bg-slate-50 rounded-2xl border-2 border-dashed border-slate-200 flex flex-col items-center justify-center text-slate-400"><Upload size={24} /><span className="text-[10px] font-black mt-2">上傳配線圖</span></div>
                </div>
                <div className="space-y-2 max-h-60 overflow-y-auto">
                  {temp.floorPlanUrls.map((url, i) => (
                    <div key={i} className="flex items-center justify-between p-3 bg-indigo-50 rounded-xl">
                      <div className="flex items-center gap-2"><FileText size={16} className="text-indigo-600" /><span className="text-xs font-bold">平面圖 #{i + 1}</span></div>
                      <div className="flex gap-2"><button className="text-slate-400 hover:text-indigo-600"><Download size={16} /></button><button className="text-slate-400 hover:text-rose-500"><X size={16} /></button></div>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          </div>

          <div className="flex gap-4 pt-4">
            <button onClick={async () => {
              if (isNew) await saveHalls([...halls, temp]);
              else await saveHalls(halls.map(h => h.id === temp.id ? temp : h));
              setEditingHallId(null);
            }} className="flex-1 bg-indigo-600 text-white font-black py-4 rounded-3xl shadow-xl">儲存所有變更</button>
            <button onClick={() => setEditingHallId(null)} className="px-10 bg-white border border-slate-200 rounded-3xl font-bold">取消</button>
          </div>
        </div>
      </div>
    );
  };

  return (
    <div className="space-y-8 animate-in fade-in pb-20">
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div><h1 className="text-3xl font-extrabold text-slate-900 tracking-tight flex items-center gap-3"><Building2 className="text-indigo-600" /> 會館資料管理</h1></div>
        <div className="flex items-center gap-3">
          <button onClick={() => setShowDeleted(!showDeleted)} className={`flex items-center gap-2 px-6 py-3 rounded-2xl text-xs font-black transition-all ${showDeleted ? 'bg-rose-500 text-white shadow-lg' : 'bg-white text-slate-600 border border-slate-200 shadow-sm'}`}>
            <Trash2 size={18} /> {showDeleted ? '返回列表' : '回收桶'}
          </button>
          <button onClick={() => { setIsSelectMode(!isSelectMode); setSelectedIds(new Set()); }} className={`px-6 py-3 rounded-2xl text-xs font-black transition-all ${isSelectMode ? 'bg-indigo-600 text-white shadow-lg' : 'bg-white text-slate-600 border border-slate-200 shadow-sm'}`}>
            {isSelectMode ? '結束選擇' : '進入勾選模式'}
          </button>
          <button onClick={handleResetData} className="flex items-center gap-2 px-6 py-3 bg-slate-100 text-slate-600 rounded-2xl text-xs font-black shadow-sm hover:bg-slate-200 transition-all" title="同步最新的 44 間會館資料">
            <RefreshCw size={18} /> 重設為預設資料
          </button>
          <button onClick={() => setEditingHallId('NEW_HALL')} className="flex items-center gap-2 px-6 py-3 bg-indigo-600 text-white rounded-2xl font-black shadow-lg hover:brightness-110 transition-all">
            <Plus size={18} /> 新增資料
          </button>
          <button onClick={() => setShowExportModal(true)} className="flex items-center gap-2 px-6 py-3 bg-emerald-600 text-white rounded-2xl font-black shadow-lg">
            <Download size={18} /> 自訂匯出資料
          </button>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        {filteredHalls.map(hall => (
          <div key={hall.id} className={`bg-white rounded-[40px] border transition-all overflow-hidden flex flex-col group ${selectedIds.has(hall.id) ? 'ring-4 ring-indigo-500 border-transparent shadow-2xl' : 'border-slate-200 shadow-sm hover:shadow-xl'}`}>
            <div className="p-8 relative space-y-4 flex-1">
              {isSelectMode && (
                <button onClick={() => toggleSelection(hall.id)} className="absolute top-8 right-8 z-10">
                  {selectedIds.has(hall.id) ? <CheckCircle2 className="text-indigo-600" size={24} /> : <Square className="text-slate-200" size={24} />}
                </button>
              )}
              <h3 className="font-black text-2xl text-slate-900 leading-tight pr-8">{hall.name}</h3>
              <div className="flex items-center gap-2 text-slate-400">
                <MapPin size={16} className="text-slate-300" />
                <span className="text-xs font-bold line-clamp-1">{hall.address}</span>
              </div>
            </div>
            <div className="px-8 pb-8">
              <div className="pt-4 border-t border-slate-50 flex items-center justify-between">
                {showDeleted ? (
                  <div className="flex gap-2 w-full">
                    <button onClick={() => handleRestoreHall(hall.id)} className="flex-1 text-xs font-black text-emerald-600 hover:bg-emerald-50 py-2 rounded-xl transition-colors flex items-center justify-center gap-1">
                      <Check size={12} /> 復原
                    </button>
                    <button onClick={() => handlePermanentDelete(hall.id)} className="flex-1 text-xs font-black text-rose-600 hover:bg-rose-50 py-2 rounded-xl transition-colors flex items-center justify-center gap-1">
                      <X size={12} /> 永久刪除
                    </button>
                  </div>
                ) : (
                  <>
                    <button onClick={() => setEditingHallId(hall.id)} className="text-xs font-black text-indigo-600 hover:underline flex items-center gap-1"><Edit2 size={12} /> 管理細節與圖資</button>
                    <button onClick={() => handleDeleteHall(hall.id)} className="p-2 text-slate-400 hover:text-rose-500 hover:bg-rose-50 rounded-lg transition-all" title="移至回收桶">
                      <Trash2 size={14} />
                    </button>
                    <ChevronRight size={14} className="text-indigo-600 group-hover:translate-x-1 transition-transform" />
                  </>
                )}
              </div>
            </div>
          </div>
        ))}
      </div>

      {editingHallId && <HallDetailModal />}

      {showExportModal && (
        <div className="fixed inset-0 z-[120] flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-sm">
          <div className="bg-white w-full max-w-md rounded-[40px] p-8 space-y-6 shadow-2xl animate-in zoom-in-95">
            <h3 className="text-xl font-black">自訂匯出設定</h3>
            <div className="space-y-4">
              <p className="text-xs font-bold text-slate-400">選擇匯出欄位：</p>
              <div className="grid grid-cols-2 gap-3">
                {['name', 'address', 'phone', 'network'].map(f => (
                  <button key={f} onClick={() => { const s = new Set(exportFields); s.has(f) ? s.delete(f) : s.add(f); setExportFields(s); }} className={`flex items-center gap-2 px-4 py-2 rounded-xl border text-sm font-bold ${exportFields.has(f) ? 'bg-indigo-50 border-indigo-600 text-indigo-600' : 'bg-slate-50 border-slate-100 text-slate-400'}`}>
                    {exportFields.has(f) ? <CheckSquare size={16} /> : <Square size={16} />} {f === 'name' ? '名稱' : f === 'address' ? '地址' : f === 'phone' ? '電話' : '網路號碼'}
                  </button>
                ))}
              </div>
            </div>
            <div className="flex gap-4 pt-4">
              <button onClick={handleExportCSV} className="flex-1 bg-emerald-600 text-white font-black py-4 rounded-3xl shadow-xl">確定匯出 ({isSelectMode ? selectedIds.size : filteredHalls.length} 筆)</button>
              <button onClick={() => setShowExportModal(false)} className="px-8 bg-white border border-slate-200 rounded-3xl font-bold">取消</button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default HallManagement;
