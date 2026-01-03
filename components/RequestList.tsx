
import React, { useState } from 'react';
import {
  Eye,
  Trash2,
  ClipboardList,
  Plus,
  QrCode,
  AlertTriangle,
  RefreshCcw,
  XCircle,
  Wind,
  Zap,
  ShieldCheck,
  CheckSquare,
  Square,
  Download,
  Wrench,
  CheckCircle2,
  X,
  Calendar,
  Building2,
  FileText,
  ChevronRight,
  Search,
  Hammer,
  ChevronDown,
  HeartPulse,
  Image as ImageIcon
} from 'lucide-react';
import { RepairRequest, RepairStatus, OrderType, Urgency, Category, Language } from '../types';
import { STATUS_CONFIG, CATEGORY_ICONS, MOCK_HALLS } from '../constants';

interface RequestListProps {
  requests: RepairRequest[];
  language: Language;
  onView: (id: string) => void;
  onDelete: (id: string) => void;
  onRestore: (id: string) => void;
  onPermanentDelete: (id: string) => void;
  onNewRoutine: () => void;
  onBulkReport: (ids: string[]) => void;
}

const RequestList: React.FC<RequestListProps> = ({
  requests,
  language,
  onView,
  onDelete,
  onRestore,
  onPermanentDelete,
  onNewRoutine,
  onBulkReport
}) => {
  const [filter, setFilter] = useState<RepairStatus | 'ALL' | 'DELETED'>('ALL');
  const [categoryFilter, setCategoryFilter] = useState<Category | 'VOLUNTEER_ONLY' | 'ALL'>('ALL');
  const [hallFilter, setHallFilter] = useState<string>('ALL');
  const [searchTerm, setSearchTerm] = useState('');
  const [isSearchFocused, setIsSearchFocused] = useState(false);
  const [selectedIds, setSelectedIds] = useState<Set<string>>(new Set());
  const [selectedPhotos, setSelectedPhotos] = useState<string[] | null>(null);

  const translations = {
    [Language.ZH]: {
      title: '工單管理',
      description: '管理所有報修工單與例行性維護工單',
      all: '全部顯示',
      deleted: '已刪除',
      allHalls: '全部會館清單',
      search: '關鍵字搜尋...',
      headerTitle: '工單描述 / 報修者',
      headerHall: '會館名稱',
      headerCat: '類別',
      headerStatus: '當前狀態',
      headerDetail: '詳情',
      noData: '尚無符合條件的工單項目',
      bulkSelect: '筆工單已勾選',
      bulkUpdate: '批量保養',
      export: '匯出勾選清單',
      routine: '例行',
      addRoutine: '新增例行工單',
      catAc: '空調設備',
      catElec: '機電設備',
      catFire: '消防設備',
      catAed: 'AED 設備',
      catRepair: '修繕報修'
    },
    [Language.JA]: {
      title: '工單管理',
      description: 'すべての修理依頼と定期メンテナンス案件を管理',
      all: 'すべて表示',
      deleted: '削除済み',
      allHalls: '全会館リスト',
      search: 'キーワード検索...',
      headerTitle: '内容 / 報告者',
      headerHall: '会館名',
      headerCat: 'カテゴリー',
      headerStatus: 'ステータス',
      headerDetail: '詳細',
      noData: '条件に一致する案件はありません',
      bulkSelect: '件選択済み',
      bulkUpdate: '一括点検',
      export: 'エクスポート',
      routine: '定期',
      addRoutine: '定期案件追加',
      catAc: '空調設備',
      catElec: '機電設備',
      catFire: '消防設備',
      catAed: 'AED 設備',
      catRepair: '修繕報告'
    }
  };

  const t = translations[language];

  const filteredRequests = requests.filter(req => {
    const matchesDeletedStatus = filter === 'DELETED' ? req.isDeleted : !req.isDeleted;
    const matchesStatus = filter === 'ALL' || filter === 'DELETED' || req.status === filter;

    let matchesCategory = true;
    if (categoryFilter === 'VOLUNTEER_ONLY') {
      matchesCategory = req.type === OrderType.VOLUNTEER;
    } else if (categoryFilter !== 'ALL') {
      matchesCategory = req.category === categoryFilter;
    }

    const matchesHall = hallFilter === 'ALL' || req.hallName === hallFilter;
    const matchesSearch = req.title.toLowerCase().includes(searchTerm.toLowerCase());

    return matchesDeletedStatus && matchesStatus && matchesSearch && matchesCategory && matchesHall;
  });

  // 尚未完工的工單（用於完工回報選擇）
  const unfinishedRequests = filteredRequests.filter(req => req.status !== RepairStatus.CLOSED);

  const toggleSelectAll = () => {
    // 只選擇尚未完工的工單
    const selectableIds = unfinishedRequests.map(r => r.id);
    if (selectedIds.size === selectableIds.length && selectableIds.length > 0) {
      setSelectedIds(new Set());
    } else {
      setSelectedIds(new Set(selectableIds));
    }
  };

  const toggleSelection = (id: string, e: React.MouseEvent) => {
    e.stopPropagation();
    const newSet = new Set(selectedIds);
    if (newSet.has(id)) newSet.delete(id);
    else newSet.add(id);
    setSelectedIds(newSet);
  };

  const handleBulkExport = () => {
    const selectedRequests = requests.filter(r => selectedIds.has(r.id));
    const headers = language === Language.ZH
      ? ['工單編號', '會館', '類別', '標題', '狀態', '報修人', '金額', '廠商']
      : ['依頼番号', '会館', 'タイプ', 'タイトル', '状態', '報告者', '金額', '業者'];
    const rows = selectedRequests.map(r => [
      r.id, r.hallName, r.category, r.title, r.status, r.reporter, r.amount || 0, r.vendor || ''
    ]);
    const csvContent = "\uFEFF" + [headers, ...rows].map(e => e.join(",")).join("\n");
    const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
    const link = document.createElement("a");
    link.href = URL.createObjectURL(blob);
    link.download = `TSA_Export_${new Date().getTime()}.csv`;
    link.click();
  };

  const CategoryTab = ({ id, icon, color, label, count }: { id: any, icon: React.ReactNode, color: string, label: string, count: number }) => {
    const isActive = categoryFilter === id;
    return (
      <button
        onClick={() => setCategoryFilter(isActive ? 'ALL' : id)}
        className={`flex items-center gap-4 px-6 py-4 rounded-[28px] border transition-all relative overflow-hidden ${isActive ? `bg-white border-transparent shadow-xl ring-2 ring-indigo-500` : 'bg-white border-slate-100 hover:border-indigo-200'
          }`}
      >
        <div className={`p-3 rounded-2xl ${color} text-white shadow-lg`}>
          {icon}
        </div>
        <div className="text-left">
          <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest leading-none mb-1">{label}</p>
          <p className="text-xl font-black text-slate-900 leading-none">{count}</p>
        </div>
      </button>
    );
  };

  const getStatusLabel = (status: RepairStatus) => {
    if (language === Language.ZH) return STATUS_CONFIG[status].label;
    const jaLabels: Record<string, string> = {
      PENDING: '未着手',
      IN_PROGRESS: '進行中',
      SIGNED: '申請済み',
      CONSTRUCTION_DONE: '施工完了',
      CLOSED: '完了済み'
    };
    return jaLabels[status];
  };

  return (
    <div className="space-y-8 animate-in fade-in duration-500 pb-20">
      <div className="space-y-4 md:space-y-0">
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
          <div>
            <h1 className="text-3xl font-extrabold text-slate-900 tracking-tight flex items-center gap-3">
              <ClipboardList className="text-indigo-600" /> {t.title}
            </h1>
            <p className="text-slate-500 font-medium">{t.description}</p>
          </div>
        </div>
      </div>

      <div className="flex flex-col xl:flex-row items-start xl:items-center justify-between gap-6">
        <div className="flex flex-wrap gap-3">
          <CategoryTab id={Category.AC} icon={<Wind size={20} />} color="bg-cyan-500" label={t.catAc} count={requests.filter(r => r.category === Category.AC && !r.isDeleted && r.status !== RepairStatus.CLOSED).length} />
          <CategoryTab id={Category.ELECTRICAL} icon={<Zap size={20} />} color="bg-amber-500" label={t.catElec} count={requests.filter(r => r.category === Category.ELECTRICAL && !r.isDeleted && r.status !== RepairStatus.CLOSED).length} />
          <CategoryTab id={Category.FIRE} icon={<ShieldCheck size={20} />} color="bg-rose-500" label={t.catFire} count={requests.filter(r => r.category === Category.FIRE && !r.isDeleted && r.status !== RepairStatus.CLOSED).length} />
          <CategoryTab id="VOLUNTEER_ONLY" icon={<Hammer size={20} />} color="bg-indigo-500" label={t.catRepair} count={requests.filter(r => r.type === OrderType.VOLUNTEER && !r.isDeleted && r.status !== RepairStatus.CLOSED).length} />
        </div>
        <button onClick={onNewRoutine} className="flex items-center justify-center gap-2 bg-indigo-600 text-white px-8 py-4 rounded-[24px] font-black hover:bg-indigo-700 transition-all shadow-xl shadow-indigo-100">
          <Plus size={18} /> {t.addRoutine}
        </button>
      </div>

      <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-4 bg-white p-3 rounded-[32px] border border-slate-200 shadow-sm">
        <div className="flex items-center gap-2 overflow-x-auto pb-2 lg:pb-0 scrollbar-hide">
          <button onClick={() => { setFilter('ALL'); setCategoryFilter('ALL'); setHallFilter('ALL'); }} className={`px-4 py-2 rounded-xl text-xs font-black uppercase tracking-widest transition-all whitespace-nowrap ${filter === 'ALL' && categoryFilter === 'ALL' && hallFilter === 'ALL' ? 'bg-slate-900 text-white' : 'text-slate-400 hover:bg-slate-50'}`}>{t.all}</button>
          {(Object.keys(STATUS_CONFIG) as RepairStatus[]).map((status) => (
            <button key={status} onClick={() => setFilter(status)} className={`px-4 py-2 rounded-xl text-xs font-black uppercase tracking-widest transition-all whitespace-nowrap ${filter === status ? 'bg-indigo-600 text-white shadow-md' : 'text-slate-400 hover:bg-slate-50'}`}>{getStatusLabel(status)}</button>
          ))}
          <button onClick={() => setFilter('DELETED')} className={`px-4 py-2 rounded-xl text-xs font-black uppercase tracking-widest flex items-center gap-2 transition-all whitespace-nowrap ${filter === 'DELETED' ? 'bg-rose-600 text-white' : 'text-rose-400 hover:bg-rose-50'}`}><Trash2 size={14} /> {t.deleted}</button>
        </div>
        <div className="flex items-center gap-3 flex-1 lg:max-w-xl">
          <div className="relative flex-1">
            <Building2 size={18} className="absolute left-4 top-1/2 -translate-y-1/2 text-indigo-500 pointer-events-none z-10" />
            <select className="w-full pl-12 pr-10 py-3 bg-slate-50 border border-slate-100 rounded-[20px] text-sm outline-none focus:ring-2 focus:ring-indigo-500 transition-all font-black text-slate-800 appearance-none cursor-pointer" value={hallFilter} onChange={(e) => setHallFilter(e.target.value)}>
              <option value="ALL">{t.allHalls}</option>
              {MOCK_HALLS.map(h => <option key={h.id} value={h.name}>{h.name}</option>)}
            </select>
          </div>
          <div className={`relative transition-all duration-300 ${isSearchFocused || searchTerm ? 'w-64' : 'w-12'}`}>
            <div className="absolute left-0 top-0 bottom-0 flex items-center justify-center w-12 text-slate-400"><Search size={18} /></div>
            <input type="text" placeholder={t.search} className={`w-full h-12 bg-slate-50 border border-slate-100 rounded-[20px] text-sm outline-none focus:ring-2 focus:ring-indigo-500 transition-all font-bold ${isSearchFocused || searchTerm ? 'pl-12 pr-4 opacity-100' : 'pl-12 pr-0 opacity-0'}`} value={searchTerm} onFocus={() => setIsSearchFocused(true)} onBlur={() => setIsSearchFocused(false)} onChange={(e) => setSearchTerm(e.target.value)} />
          </div>
        </div>
      </div>

      <div className="bg-white rounded-[40px] border border-slate-200 shadow-sm overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-left">
            <thead>
              <tr className="bg-slate-50 text-slate-400 text-[10px] font-black uppercase tracking-widest border-b border-slate-100">
                <th className="px-6 py-5 w-16 text-center whitespace-nowrap">#</th>
                <th className="px-6 py-5 whitespace-nowrap">{t.headerTitle}</th>
                <th className="px-6 py-5 whitespace-nowrap">{t.headerHall}</th>
                <th className="px-6 py-5 whitespace-nowrap">{t.headerCat}</th>
                <th className="px-6 py-5 whitespace-nowrap">{t.headerStatus}</th>
                <th className="px-6 py-5 text-right whitespace-nowrap">{t.headerDetail}</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100">
              {filteredRequests.map((req) => {
                const isFinished = req.status === RepairStatus.CLOSED;
                const canSelect = !isFinished;
                return (
                <tr key={req.id} onClick={() => onView(req.id)} className={`group cursor-pointer hover:bg-slate-50 transition-all ${isFinished ? 'opacity-50' : ''}`}>
                  <td className="px-6 py-5 text-center" onClick={(e) => {
                    if (canSelect) {
                      toggleSelection(req.id, e as any);
                    } else {
                      e.stopPropagation();
                    }
                  }}>
                    <div className={selectedIds.has(req.id) ? 'text-indigo-600' : canSelect ? 'text-slate-200' : 'text-slate-100'}>
                      {selectedIds.has(req.id) ? <CheckSquare size={20} /> : <Square size={20} />}
                    </div>
                  </td>
                  <td className="px-6 py-5">
                    <div className="flex flex-col gap-1">
                      <span className="font-black text-slate-900 flex items-center gap-2">{req.title} {req.type === OrderType.ROUTINE && <span className="text-[8px] px-1.5 py-0.5 rounded bg-purple-50 text-purple-600 border border-purple-100 uppercase font-black">{t.routine}</span>}</span>
                      <span className="text-[10px] text-slate-400 font-bold uppercase tracking-widest">#{req.id} • {req.reporter}</span>
                      {req.photoUrls && req.photoUrls.length > 0 && (
                        <div
                          className="flex items-center gap-1 mt-1 text-xs font-bold text-indigo-500 cursor-pointer hover:underline w-fit"
                          onClick={(e) => { e.stopPropagation(); setSelectedPhotos(req.photoUrls || []); }}
                        >
                          <ImageIcon size={12} />
                          <span>{req.photoUrls.length} 張照片</span>
                        </div>
                      )}
                    </div>
                  </td>
                  <td className="px-6 py-5 font-bold text-slate-600 whitespace-nowrap">{req.hallName}</td>
                  <td className="px-6 py-5 whitespace-nowrap">
                    <div className="flex items-center gap-2">
                      {CATEGORY_ICONS[req.category]}
                      <span className="text-[10px] font-black text-slate-500 uppercase">{req.category}</span>
                    </div>
                  </td>
                  <td className="px-6 py-5 whitespace-nowrap"><span className={`px-2.5 py-1 rounded-xl text-[10px] font-black border ${STATUS_CONFIG[req.status].color}`}>{getStatusLabel(req.status)}</span></td>
                  <td className="px-6 py-5 text-right"><ChevronRight size={18} className="text-slate-300 opacity-0 group-hover:opacity-100 inline" /></td>
                </tr>
              );
              })}
            </tbody>
          </table>
          {filteredRequests.length === 0 && <div className="py-20 text-center text-slate-300 font-black">{t.noData}</div>}
        </div>
      </div>

      {selectedIds.size > 0 && (
        <div className="fixed top-32 right-8 z-[100] w-72 bg-slate-900 rounded-[32px] p-8 shadow-2xl space-y-8 border border-slate-800 text-white animate-in slide-in-from-right-10">
          <div className="flex items-center justify-between">
            <div className="p-3 bg-indigo-600 rounded-2xl"><CheckSquare size={24} /></div>
            <button onClick={() => setSelectedIds(new Set())} className="text-slate-500 hover:text-white"><X size={20} /></button>
          </div>
          <div><p className="text-3xl font-black">{selectedIds.size}</p><p className="text-[10px] text-slate-400 uppercase tracking-widest">{t.bulkSelect}</p></div>
          <div className="space-y-3">
            <button 
              onClick={() => {
                // 只傳遞尚未完工的工單 ID
                const unfinishedIds = Array.from(selectedIds).filter(id => {
                  const req = requests.find(r => r.id === id);
                  return req && req.status !== RepairStatus.CLOSED;
                });
                if (unfinishedIds.length > 0) {
                  onBulkReport(unfinishedIds);
                } else {
                  alert('請選擇尚未完工的工單進行回報');
                }
              }} 
              className="w-full flex items-center justify-between px-6 py-4 bg-indigo-600 rounded-[20px] font-black hover:bg-indigo-700 transition-all"
            >
              <span>{t.bulkUpdate}</span><Wrench size={18} />
            </button>
            <button onClick={handleBulkExport} className="w-full flex items-center justify-between px-6 py-4 bg-white/10 border border-white/10 rounded-[20px] font-black hover:bg-white/20 transition-all"><span>{t.export}</span><Download size={18} /></button>
          </div>
        </div>
      )}

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
    </div>
  );
};

export default RequestList;
