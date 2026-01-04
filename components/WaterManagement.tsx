
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
  Save,
  Trash2,
  Calendar,
  ChevronDown,
  FileText,
  AlertCircle
} from 'lucide-react';
import { MOCK_HALLS, WATER_PRICE_LIST } from '../constants';
import { WaterDispenser, WaterMaintenanceRecord, Language, FilterInfo, WaterMaintenancePart, Hall } from '../types';
import { storageService } from '../services/storageService';

interface WaterManagementProps {
  onDirtyChange?: (isDirty: boolean) => void;
  language: Language;
}

const DEFAULT_FILTERS: FilterInfo[] = [
  { name: '第一道 PP 濾心', lastReplacementDate: new Date().toISOString().split('T')[0], reminderCycleDays: 90 },
  { name: '第二道 活性碳濾心', lastReplacementDate: new Date().toISOString().split('T')[0], reminderCycleDays: 180 },
  { name: '第三道 活性碳濾心', lastReplacementDate: new Date().toISOString().split('T')[0], reminderCycleDays: 180 },
  { name: '第四道 RO 膜', lastReplacementDate: new Date().toISOString().split('T')[0], reminderCycleDays: 365 },
  { name: '第五道 後置碳', lastReplacementDate: new Date().toISOString().split('T')[0], reminderCycleDays: 365 },
];

const WaterManagement: React.FC<WaterManagementProps> = ({ language }) => {
  const [view, setView] = useState<'LIST' | 'ADD'>('LIST');
  const [dispensers, setDispensers] = useState<WaterDispenser[]>([]);
  const [maintenanceHistory, setMaintenanceHistory] = useState<WaterMaintenanceRecord[]>([]);
  const [halls, setHalls] = useState<Hall[]>([]);

  const [selectedHall, setSelectedHall] = useState<string>('ALL');
  const [searchTerm, setSearchTerm] = useState('');

  // 維修與歷史狀態
  const [showHistoryDispenser, setShowHistoryDispenser] = useState<WaterDispenser | null>(null);
  const [showMaintenanceForm, setShowMaintenanceForm] = useState<WaterDispenser | null>(null);
  const [mForm, setMForm] = useState<{
    date: string;
    parts: WaterMaintenancePart[];
    description: string;
    replacedFilterIndexes: number[];
  }>({
    date: new Date().toISOString().split('T')[0],
    parts: [],
    description: '',
    replacedFilterIndexes: []
  });

  // 批量新增狀態
  const [batchList, setBatchList] = useState<Partial<WaterDispenser>[]>([{
    hallName: halls.length > 0 ? halls[0].name : (MOCK_HALLS[0].name),
    location: '',
    model: '',
    installDate: new Date().toISOString().split('T')[0],
    filters: JSON.parse(JSON.stringify(DEFAULT_FILTERS))
  }]);

  useEffect(() => {
    const loadData = async () => {
      const savedD = await storageService.loadWaterDispensers();
      const savedH = await storageService.loadWaterHistory();
      const savedHalls = await storageService.loadHalls();
      if (savedD) setDispensers(savedD);
      if (savedH) setMaintenanceHistory(savedH);
      setHalls(savedHalls || MOCK_HALLS);
    };
    loadData();
  }, []);

  const saveData = async (d: WaterDispenser[], h: WaterMaintenanceRecord[]) => {
    setDispensers(d);
    setMaintenanceHistory(h);
    await storageService.saveWaterDispensers(d);
    await storageService.saveWaterHistory(h);
  };

  const handleSaveAll = async () => {
    const newDispensers: WaterDispenser[] = batchList.map((item, idx) => ({
      id: `WD-${Date.now()}-${idx}`,
      hallName: item.hallName || (halls.length > 0 ? halls[0].name : MOCK_HALLS[0].name),
      location: item.location || '未指定位置',
      model: item.model || '未指定型號',
      installDate: item.installDate || new Date().toISOString().split('T')[0],
      filters: item.filters || []
    }));

    const updated = [...dispensers, ...newDispensers];
    await saveData(updated, maintenanceHistory);
    setView('LIST');
    setBatchList([{
      hallName: halls.length > 0 ? halls[0].name : (MOCK_HALLS[0].name),
      location: '',
      model: '',
      installDate: new Date().toISOString().split('T')[0],
      filters: JSON.parse(JSON.stringify(DEFAULT_FILTERS))
    }]);
    alert(`成功新增 ${newDispensers.length} 台飲水機！`);
  };

  const addMoreToBatch = () => {
    setBatchList([...batchList, {
      hallName: MOCK_HALLS[0].name,
      location: '',
      model: '',
      installDate: new Date().toISOString().split('T')[0],
      filters: JSON.parse(JSON.stringify(DEFAULT_FILTERS))
    }]);
  };

  const removeFromBatch = (index: number) => {
    if (batchList.length > 1) {
      setBatchList(batchList.filter((_, i) => i !== index));
    }
  };

  const updateBatchItem = (index: number, field: keyof WaterDispenser, value: any) => {
    const newList = [...batchList];
    newList[index] = { ...newList[index], [field]: value };
    setBatchList(newList);
  };

  const updateFilter = (batchIdx: number, filterIdx: number, field: keyof FilterInfo, value: any) => {
    const newList = [...batchList];
    const filters = [...(newList[batchIdx].filters || [])];
    filters[filterIdx] = { ...filters[filterIdx], [field]: value };
    newList[batchIdx].filters = filters;
    setBatchList(newList);
  };

  const handleMaintenanceSubmit = async () => {
    if (!showMaintenanceForm) return;

    const total = mForm.parts.reduce((sum, p) => sum + p.price, 0);
    const newRecord: WaterMaintenanceRecord = {
      id: `MR-${Date.now()}`,
      dispenserId: showMaintenanceForm.id,
      date: mForm.date,
      parts: mForm.parts,
      description: mForm.description,
      totalAmount: total,
      replacedFilterIndexes: mForm.replacedFilterIndexes
    };

    // 更新飲水機濾心時間
    const updatedDispensers = dispensers.map(d => {
      if (d.id === showMaintenanceForm.id) {
        const newFilters = [...d.filters];
        mForm.replacedFilterIndexes.forEach(idx => {
          newFilters[idx] = { ...newFilters[idx], lastReplacementDate: mForm.date };
        });
        return { ...d, filters: newFilters };
      }
      return d;
    });

    const updatedHistory = [newRecord, ...maintenanceHistory];
    await saveData(updatedDispensers, updatedHistory);

    setShowMaintenanceForm(null);
    setMForm({
      date: new Date().toISOString().split('T')[0],
      parts: [],
      description: '',
      replacedFilterIndexes: []
    });
    alert('保養紀錄已儲存！');
  };

  const addPartToMForm = (name: string, price: number, filterIndex?: number) => {
    setMForm(prev => ({
      ...prev,
      parts: [...prev.parts, { name, price }],
      replacedFilterIndexes: filterIndex !== undefined ? [...prev.replacedFilterIndexes, filterIndex] : prev.replacedFilterIndexes
    }));
  };

  const removePartFromMForm = (index: number) => {
    // 這裡比較複雜，如果要追蹤哪一個零件是對應哪一個濾心
    // 簡化處理：目前的 replacedFilterIndexes 先不與零件強耦合
    setMForm(prev => ({
      ...prev,
      parts: prev.parts.filter((_, i) => i !== index)
    }));
  };

  const calculateRemainingDays = (lastDate: string, cycle: number) => {
    const last = new Date(lastDate);
    const next = new Date(last);
    next.setDate(last.getDate() + cycle);
    const diff = next.getTime() - new Date().getTime();
    return Math.ceil(diff / (1000 * 60 * 60 * 24));
  };

  const getStatusColor = (remaining: number) => {
    if (remaining <= 7) return 'bg-rose-500';
    if (remaining <= 30) return 'bg-amber-500';
    return 'bg-emerald-500';
  };

  const filteredDispensers = dispensers.filter(d =>
    (selectedHall === 'ALL' || d.hallName === selectedHall) &&
    (d.location.toLowerCase().includes(searchTerm.toLowerCase()) || d.model.toLowerCase().includes(searchTerm.toLowerCase()))
  );

  return (
    <div className="space-y-8 animate-in fade-in pb-20">
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <h1 className="text-3xl font-extrabold text-slate-900 flex items-center gap-3"><Droplets className="text-blue-500" /> 飲水機維運管理</h1>
          <p className="text-slate-500 mt-1 font-medium">追蹤各會館飲水機濾心壽命與保養週期</p>
        </div>
        <div className="flex gap-3">
          <button onClick={() => setView('ADD')} className="flex items-center gap-2 px-8 py-4 bg-blue-600 text-white rounded-[24px] font-black shadow-lg hover:bg-blue-700 transition-all"><Plus size={20} /> 批量新增設備</button>
        </div>
      </div>

      <div className="flex flex-col md:flex-row gap-4">
        <div className="relative flex-1">
          <Search className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400" size={18} />
          <input
            type="text"
            placeholder="搜尋位置或型號..."
            className="w-full pl-12 pr-4 py-3 bg-white border border-slate-200 rounded-2xl outline-none focus:ring-2 focus:ring-blue-500 font-bold"
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
          />
        </div>
        <select
          className="px-6 py-3 bg-white border border-slate-200 rounded-2xl font-bold outline-none"
          value={selectedHall}
          onChange={(e) => setSelectedHall(e.target.value)}
        >
          <option value="ALL">所有會館</option>
          {halls.map(h => <option key={h.id} value={h.name}>{h.name}</option>)}
        </select>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {filteredDispensers.map(d => (
          <div key={d.id} className="bg-white rounded-[40px] border border-slate-200 shadow-sm hover:shadow-xl transition-all p-8 space-y-6 flex flex-col">
            <div className="flex justify-between items-start">
              <div>
                <span className="px-3 py-1 bg-blue-50 text-blue-600 rounded-xl text-[10px] font-black uppercase tracking-widest">{d.hallName}</span>
                <h3 className="text-2xl font-black text-slate-900 mt-2">{d.location}</h3>
                <p className="text-sm text-slate-400 font-bold">{d.model}</p>
              </div>
              <div className="p-4 bg-blue-50 text-blue-600 rounded-3xl"><Droplets size={32} /></div>
            </div>

            <div className="space-y-3 pt-4 border-t border-slate-50 flex-1">
              {d.filters.map((f, i) => {
                const remaining = calculateRemainingDays(f.lastReplacementDate, f.reminderCycleDays);
                const progress = Math.max(0, Math.min(100, (remaining / f.reminderCycleDays) * 100));
                return (
                  <div key={i} className="space-y-1">
                    <div className="flex justify-between text-[10px] font-black uppercase tracking-wider">
                      <span className="text-slate-500">{f.name}</span>
                      <span className={remaining <= 7 ? 'text-rose-500 animate-pulse' : 'text-slate-400'}>
                        還剩 {remaining} 天
                      </span>
                    </div>
                    <div className="w-full h-2 bg-slate-100 rounded-full overflow-hidden">
                      <div
                        className={`h-full transition-all duration-1000 ${getStatusColor(remaining)}`}
                        style={{ width: `${progress}%` }}
                      ></div>
                    </div>
                  </div>
                );
              })}
            </div>

            <div className="grid grid-cols-2 gap-3 pt-4">
              <button
                onClick={() => setShowHistoryDispenser(d)}
                className="flex items-center justify-center gap-2 py-3 bg-slate-50 text-slate-600 rounded-2xl font-black text-sm hover:bg-slate-100 transition-all"
              >
                <History size={16} /> 歷史紀錄
              </button>
              <button
                onClick={() => setShowMaintenanceForm(d)}
                className="flex items-center justify-center gap-2 py-3 bg-blue-600 text-white rounded-2xl font-black text-sm hover:bg-blue-700 shadow-lg shadow-blue-100 transition-all"
              >
                <Wrench size={16} /> 執行保養
              </button>
            </div>
          </div>
        ))}
        {filteredDispensers.length === 0 && <div className="lg:col-span-3 py-24 text-center text-slate-300 font-black">尚未建立符合條件的飲水機設備</div>}
      </div>

      {/* 歷史紀錄 Modal */}
      {showHistoryDispenser && (
        <div className="fixed inset-0 z-[150] bg-slate-900/60 backdrop-blur-md flex items-center justify-center p-4">
          <div className="bg-white w-full max-w-2xl rounded-[48px] overflow-hidden flex flex-col animate-in zoom-in-95 max-h-[85vh]">
            <div className="p-8 border-b border-slate-100 flex justify-between items-center bg-slate-50/50">
              <div>
                <h3 className="text-2xl font-black text-slate-900">保養紀錄查詢</h3>
                <p className="text-sm text-slate-400 font-bold">{showHistoryDispenser.hallName} - {showHistoryDispenser.location}</p>
              </div>
              <button onClick={() => setShowHistoryDispenser(null)} className="p-3 hover:bg-slate-100 rounded-full transition-all"><X size={24} /></button>
            </div>

            <div className="flex-1 overflow-y-auto p-8 space-y-4">
              {maintenanceHistory.filter(h => h.dispenserId === showHistoryDispenser.id).length === 0 ? (
                <div className="py-20 text-center text-slate-300 font-black">尚無保養紀錄</div>
              ) : (
                maintenanceHistory.filter(h => h.dispenserId === showHistoryDispenser.id).map(record => (
                  <div key={record.id} className="p-6 bg-slate-50 rounded-3xl space-y-4 border border-slate-100">
                    <div className="flex justify-between items-center">
                      <div className="flex items-center gap-2 text-indigo-600 font-black">
                        <Calendar size={18} />
                        {record.date}
                      </div>
                      <div className="text-lg font-black text-slate-900">
                        ${record.totalAmount.toLocaleString()}
                      </div>
                    </div>
                    {record.description && (
                      <p className="text-sm font-bold text-slate-600 bg-white p-3 rounded-xl border border-slate-100">
                        {record.description}
                      </p>
                    )}
                    <div className="flex flex-wrap gap-2">
                      {record.parts.map((p, i) => (
                        <span key={i} className="px-3 py-1 bg-white border border-slate-200 rounded-full text-[10px] font-black text-slate-500">
                          {p.name} (${p.price})
                        </span>
                      ))}
                    </div>
                  </div>
                ))
              )}
            </div>
          </div>
        </div>
      )}

      {/* 執行保養 Modal */}
      {showMaintenanceForm && (
        <div className="fixed inset-0 z-[150] bg-slate-900/60 backdrop-blur-md flex items-center justify-center p-4">
          <div className="bg-white w-full max-w-4xl rounded-[48px] overflow-hidden flex flex-col animate-in slide-in-from-bottom-8 max-h-[90vh]">
            <div className="p-8 bg-blue-600 text-white flex justify-between items-center">
              <div>
                <h3 className="text-2xl font-black">執行飲水機保養</h3>
                <p className="text-sm opacity-80 font-bold">{showMaintenanceForm.hallName} - {showMaintenanceForm.location} ({showMaintenanceForm.model})</p>
              </div>
              <button onClick={() => setShowMaintenanceForm(null)} className="p-3 hover:bg-white/10 rounded-full transition-all text-white"><X size={24} /></button>
            </div>

            <div className="flex-1 overflow-y-auto p-8 grid grid-cols-1 md:grid-cols-2 gap-8">
              {/* 左側：保養內容 */}
              <div className="space-y-6">
                <div className="space-y-1">
                  <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest">保養日期</label>
                  <input
                    type="date"
                    className="w-full px-5 py-3 bg-slate-50 rounded-2xl font-bold border-none"
                    value={mForm.date}
                    onChange={(e) => setMForm(prev => ({ ...prev, date: e.target.value }))}
                  />
                </div>

                <div className="space-y-3">
                  <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest flex justify-between">
                    <span>已選零件明細</span>
                    <span className="text-blue-600">總計: ${mForm.parts.reduce((sum, p) => sum + p.price, 0).toLocaleString()}</span>
                  </label>
                  <div className="space-y-2 max-h-60 overflow-y-auto pr-2">
                    {mForm.parts.length === 0 && <div className="py-10 text-center text-slate-300 font-bold bg-slate-50 rounded-2xl">尚未選擇零件</div>}
                    {mForm.parts.map((p, i) => (
                      <div key={i} className="flex items-center justify-between p-3 bg-slate-50 rounded-xl">
                        <span className="font-bold text-slate-700 text-sm">{p.name}</span>
                        <div className="flex items-center gap-3">
                          <span className="font-black text-slate-900 font-mono">${p.price}</span>
                          <button onClick={() => removePartFromMForm(i)} className="text-slate-300 hover:text-rose-500 transition-colors"><Trash2 size={16} /></button>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>

                <div className="space-y-1">
                  <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest">保養備註 (選填)</label>
                  <textarea
                    rows={3}
                    className="w-full px-5 py-4 bg-slate-50 rounded-2xl font-bold border-none"
                    placeholder="請描述機台狀況或額外維修項目..."
                    value={mForm.description}
                    onChange={(e) => setMForm(prev => ({ ...prev, description: e.target.value }))}
                  />
                </div>
              </div>

              {/* 右側：選擇零件 */}
              <div className="space-y-6 border-l border-slate-100 pl-8">
                <h4 className="text-sm font-black text-slate-900 flex items-center gap-2"><Plus size={18} className="text-blue-600" /> 選擇更換零件</h4>

                <div className="space-y-4">
                  {/* 此飲水機的濾心快捷鍵 */}
                  <div className="space-y-2">
                    <p className="text-[10px] font-black text-blue-600 uppercase tracking-widest">濾心更換 (連動週期)</p>
                    <div className="grid grid-cols-1 gap-2">
                      {showMaintenanceForm.filters.map((f, i) => (
                        <button
                          key={i}
                          onClick={() => {
                            // 這裡簡易假設濾心價格
                            addPartToMForm(f.name, 500, i);
                          }}
                          className="flex items-center justify-between p-3 bg-blue-50 border border-blue-100 text-blue-700 rounded-xl hover:bg-blue-600 hover:text-white transition-all text-xs font-black group"
                        >
                          <span>{f.name}</span>
                          <span className="opacity-60 group-hover:opacity-100">$500</span>
                        </button>
                      ))}
                    </div>
                  </div>

                  {/* 其他零件與耗材 */}
                  <div className="space-y-2">
                    <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest">常用硬體零件 (程控/RO)</p>
                    <div className="grid grid-cols-2 gap-2">
                      {[...WATER_PRICE_LIST['程控機'], ...WATER_PRICE_LIST['RO機']].filter((p: any) => !p.isFilter).slice(0, 8).map((p, i) => (
                        <button
                          key={i}
                          onClick={() => addPartToMForm(p.name, p.price)}
                          className="p-3 bg-slate-50 border border-slate-100 text-slate-600 rounded-xl hover:border-indigo-600 hover:text-indigo-600 transition-all text-[10px] font-black text-left"
                        >
                          <div className="truncate">{p.name}</div>
                          <div className="text-slate-400 font-mono mt-0.5">${p.price}</div>
                        </button>
                      ))}
                    </div>
                  </div>

                  {/* 自訂零件按鈕 */}
                  <button
                    onClick={() => {
                      const name = window.prompt('請輸入零件名稱:');
                      const priceStr = window.prompt('請輸入金額:');
                      if (name && priceStr) {
                        addPartToMForm(name, parseInt(priceStr) || 0);
                      }
                    }}
                    className="w-full py-4 border-2 border-dashed border-slate-200 rounded-2xl text-slate-400 font-black text-sm flex items-center justify-center gap-2 hover:bg-slate-50 transition-all"
                  >
                    <Settings2 size={18} /> 新增自訂零件項目
                  </button>
                </div>
              </div>
            </div>

            <div className="p-8 bg-white border-t border-slate-100 flex gap-4">
              <button onClick={() => setShowMaintenanceForm(null)} className="px-12 py-5 bg-white border border-slate-200 rounded-[24px] font-black text-slate-400 hover:bg-slate-50 transition-all">取消</button>
              <button
                onClick={handleMaintenanceSubmit}
                className="flex-1 bg-emerald-600 text-white font-black py-5 rounded-[24px] shadow-2xl shadow-emerald-100 flex items-center justify-center gap-3 hover:bg-emerald-700 transition-all active:scale-95"
              >
                <CheckCircle2 size={24} />
                送出保養紀錄並結帳
              </button>
            </div>
          </div>
        </div>
      )}

      {/* 批量新增 Modal (原有功能) */}
      {view === 'ADD' && (
        <div className="fixed inset-0 z-[150] bg-slate-900/60 backdrop-blur-md flex items-center justify-center p-4">
          <div className="bg-slate-50 w-full max-w-5xl h-[90vh] rounded-[48px] overflow-hidden flex flex-col animate-in slide-in-from-bottom-8">
            <div className="p-8 bg-white border-b border-slate-100 flex justify-between items-center">
              <div>
                <h3 className="text-2xl font-black text-slate-900">批量新增飲水機資料</h3>
                <p className="text-sm text-slate-400 font-bold">請輸入各機台的詳細資訊與濾心保養週期</p>
              </div>
              <button onClick={() => setView('LIST')} className="p-3 hover:bg-slate-100 rounded-full transition-all"><X size={24} /></button>
            </div>

            <div className="flex-1 overflow-y-auto p-8 space-y-8">
              {batchList.map((item, bIdx) => (
                <div key={bIdx} className="bg-white p-8 rounded-[40px] border border-slate-200 shadow-sm relative group">
                  <button
                    onClick={() => removeFromBatch(bIdx)}
                    className="absolute -top-3 -right-3 w-10 h-10 bg-rose-500 text-white rounded-full flex items-center justify-center opacity-0 group-hover:opacity-100 transition-all hover:scale-110 shadow-lg"
                  >
                    <Trash2 size={18} />
                  </button>

                  <div className="grid grid-cols-1 md:grid-cols-4 gap-6 mb-8">
                    <div className="space-y-1">
                      <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest">會館 *</label>
                      <select
                        className="w-full px-5 py-3 bg-slate-50 rounded-2xl font-bold border-none"
                        value={item.hallName}
                        onChange={(e) => updateBatchItem(bIdx, 'hallName', e.target.value)}
                      >
                        {halls.map(h => <option key={h.id} value={h.name}>{h.name}</option>)}
                      </select>
                    </div>
                    <div className="space-y-1">
                      <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest">安裝位置 *</label>
                      <input
                        className="w-full px-5 py-3 bg-slate-50 rounded-2xl font-bold border-none"
                        placeholder="如: 1F 門廳"
                        value={item.location}
                        onChange={(e) => updateBatchItem(bIdx, 'location', e.target.value)}
                      />
                    </div>
                    <div className="space-y-1">
                      <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest">設備型號 *</label>
                      <input
                        className="w-full px-5 py-3 bg-slate-50 rounded-2xl font-bold border-none"
                        placeholder="如: WD-102"
                        value={item.model}
                        onChange={(e) => updateBatchItem(bIdx, 'model', e.target.value)}
                      />
                    </div>
                    <div className="space-y-1">
                      <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest">安裝日期</label>
                      <input
                        type="date"
                        className="w-full px-5 py-3 bg-slate-50 rounded-2xl font-bold border-none"
                        value={item.installDate}
                        onChange={(e) => updateBatchItem(bIdx, 'installDate', e.target.value)}
                      />
                    </div>
                  </div>

                  <div className="space-y-4">
                    <h4 className="text-xs font-black text-slate-900 border-l-4 border-blue-500 pl-3">濾心保養設定 (五道)</h4>
                    <div className="grid grid-cols-1 md:grid-cols-5 gap-4">
                      {item.filters?.map((f, fIdx) => (
                        <div key={fIdx} className="p-4 bg-slate-50 rounded-3xl space-y-4">
                          <div className="space-y-1">
                            <label className="text-[10px] font-black text-slate-400">濾心名稱</label>
                            <input
                              className="w-full px-3 py-2 bg-white rounded-xl text-xs font-bold"
                              value={f.name}
                              onChange={(e) => updateFilter(bIdx, fIdx, 'name', e.target.value)}
                            />
                          </div>
                          <div className="space-y-1">
                            <label className="text-[10px] font-black text-slate-400">上次更換日</label>
                            <input
                              type="date"
                              className="w-full px-3 py-2 bg-white rounded-xl text-[10px] font-bold"
                              value={f.lastReplacementDate}
                              onChange={(e) => updateFilter(bIdx, fIdx, 'lastReplacementDate', e.target.value)}
                            />
                          </div>
                          <div className="space-y-1">
                            <label className="text-[10px] font-black text-slate-400">提醒週期 (天)</label>
                            <input
                              type="number"
                              className="w-full px-3 py-2 bg-white rounded-xl text-xs font-bold"
                              value={f.reminderCycleDays}
                              onChange={(e) => updateFilter(bIdx, fIdx, 'reminderCycleDays', parseInt(e.target.value) || 0)}
                            />
                          </div>
                        </div>
                      ))}
                    </div>
                  </div>
                </div>
              ))}

              <button
                onClick={addMoreToBatch}
                className="w-full py-8 border-4 border-dashed border-slate-200 rounded-[40px] text-slate-400 flex flex-col items-center justify-center gap-2 hover:bg-white hover:border-blue-300 hover:text-blue-500 transition-all font-black text-lg"
              >
                <Plus size={32} />
                再新增一台機台資料
              </button>
            </div>

            <div className="p-8 bg-white border-t border-slate-100 flex gap-4">
              <button onClick={() => setView('LIST')} className="px-12 py-5 bg-white border border-slate-200 rounded-[24px] font-black text-slate-400 hover:bg-slate-50 transition-all">取消</button>
              <button
                onClick={handleSaveAll}
                className="flex-1 bg-blue-600 text-white font-black py-5 rounded-[24px] shadow-2xl shadow-blue-100 flex items-center justify-center gap-3 hover:bg-blue-700 transition-all active:scale-95"
              >
                <Save size={24} />
                儲存所有新增資料 ({batchList.length} 台)
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default WaterManagement;
