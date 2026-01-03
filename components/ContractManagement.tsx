
import React, { useState, useEffect } from 'react';
import { 
  FilePlus, 
  Search, 
  FileText, 
  Download, 
  X, 
  ArrowLeft, 
  Upload, 
  Save, 
  Calendar, 
  User, 
  Building2, 
  DollarSign,
  ChevronRight,
  Filter,
  CheckCircle2,
  Clock,
  AlertCircle,
  Tag,
  LayoutGrid,
  List as ListIcon,
  ShieldCheck,
  ExternalLink
} from 'lucide-react';
import { MOCK_HALLS, CATEGORY_ICONS } from '../constants';
// Import Language type
import { Contract, ContractStatus, Category, Language } from '../types';
import { storageService } from '../services/storageService';

interface ContractManagementProps {
  onDirtyChange?: (isDirty: boolean) => void;
  // Add language to props
  language: Language;
}

const CONTRACT_CATEGORIES = ['保全', '空調', '清潔', '機電', '消防', '園藝', '其他'];

const CATEGORY_COLORS: Record<string, string> = {
  '保全': 'bg-purple-50 text-purple-600 border-purple-100',
  '空調': 'bg-cyan-50 text-cyan-600 border-cyan-100',
  '清潔': 'bg-emerald-50 text-emerald-600 border-emerald-100',
  '機電': 'bg-amber-50 text-amber-600 border-amber-100',
  '消防': 'bg-rose-50 text-rose-600 border-rose-100',
  '園藝': 'bg-lime-50 text-lime-600 border-lime-100',
  '其他': 'bg-slate-50 text-slate-600 border-slate-100',
};

// 輔助函式：對應合約文字到 Category Enum 
const mapStringToCategory = (catStr: string): Category => {
  if (catStr === '空調') return Category.AC;
  if (catStr === '機電') return Category.ELECTRICAL;
  if (catStr === '消防') return Category.FIRE;
  return Category.OTHER;
};

// Destructure language from props
const ContractManagement: React.FC<ContractManagementProps> = ({ onDirtyChange, language }) => {
  const [view, setView] = useState<'LIST' | 'ADD'>('LIST');
  const [viewMode, setViewMode] = useState<'TABLE' | 'VENDOR_MAP'>('TABLE');
  const [contracts, setContracts] = useState<Contract[]>([]);
  const [filters, setFilters] = useState({ hall: '', vendor: '', status: 'ALL', category: 'ALL' });
  const [isUploading, setIsUploading] = useState(false);

  useEffect(() => {
    if (onDirtyChange) {
      onDirtyChange(view === 'ADD');
    }
  }, [view, onDirtyChange]);

  useEffect(() => {
    const loadData = async () => {
      const saved = await storageService.loadContracts();
      if (saved) {
        setContracts(saved);
      } else {
        const initial: Contract[] = [
        {
          id: 'CTR-2024-001',
          category: '空調',
          vendor: '大金空調工程',
          hallName: '台北至善文化會館',
          summary: '全館空調系統年度保養合約',
          startDate: '2024-01-01',
          endDate: '2024-12-31',
          fee: 120000,
          reporter: '林組長',
          createdAt: new Date().toISOString()
        },
        {
          id: 'CTR-2024-003',
          category: '空調',
          vendor: '大金空調工程',
          hallName: '板橋文化會館',
          summary: '分體式冷氣定期保養',
          startDate: '2024-02-01',
          endDate: '2025-01-31',
          fee: 45000,
          reporter: '林組長',
          createdAt: new Date().toISOString()
        },
        {
          id: 'CTR-2024-002',
          category: '保全',
          vendor: '中興保全',
          hallName: '板橋文化會館',
          summary: '年度安全維護服務合約',
          startDate: '2024-03-01',
          endDate: '2025-02-28',
          fee: 85000,
          reporter: '陳主任',
          createdAt: new Date().toISOString()
        }
      ];
      setContracts(initial);
      await storageService.saveContracts(initial);
      }
    };
    loadData();
  }, []);

  const saveContracts = async (data: Contract[]) => {
    setContracts(data);
    await storageService.saveContracts(data);
  };

  const getContractStatus = (start: string, end: string): ContractStatus => {
    const today = new Date().toISOString().split('T')[0];
    if (today < start) return ContractStatus.NOT_STARTED;
    if (today > end) return ContractStatus.ENDED;
    return ContractStatus.IN_PROGRESS;
  };

  const filteredContracts = contracts.filter(c => {
    const matchesHall = !filters.hall || c.hallName.includes(filters.hall);
    const matchesVendor = !filters.vendor || c.vendor.toLowerCase().includes(filters.vendor.toLowerCase());
    const matchesCategory = filters.category === 'ALL' || c.category === filters.category;
    const status = getContractStatus(c.startDate, c.endDate);
    const matchesStatus = filters.status === 'ALL' || status === filters.status;
    return matchesHall && matchesVendor && matchesStatus && matchesCategory;
  });

  // 廠商分組邏輯：將合約按廠商名稱進行歸類
  const vendorGroups = filteredContracts.reduce((acc: Record<string, Contract[]>, contract) => {
    if (!acc[contract.vendor]) acc[contract.vendor] = [];
    acc[contract.vendor].push(contract);
    return acc;
  }, {});

  const stats = {
    inProgress: contracts.filter(c => getContractStatus(c.startDate, c.endDate) === ContractStatus.IN_PROGRESS).length,
    ended: contracts.filter(c => getContractStatus(c.startDate, c.endDate) === ContractStatus.ENDED).length,
    notStarted: contracts.filter(c => getContractStatus(c.startDate, c.endDate) === ContractStatus.NOT_STARTED).length,
  };

  const AddForm = () => {
    const [form, setForm] = useState<Partial<Contract>>({
      category: '空調',
      vendor: '',
      hallName: MOCK_HALLS[0].name,
      summary: '',
      startDate: new Date().toISOString().split('T')[0],
      endDate: '',
      fee: 0,
      reporter: '',
      remarks: ''
    });

    const handleSubmit = async (e: React.FormEvent) => {
      e.preventDefault();
      const newContract: Contract = {
        ...form as Contract,
        id: `CTR-${new Date().getFullYear()}-${Math.floor(100 + Math.random() * 900)}`,
        createdAt: new Date().toISOString()
      };
      saveContracts([newContract, ...contracts]);
      setView('LIST');
    };

    return (
      <div className="max-w-4xl mx-auto space-y-8 animate-in slide-in-from-bottom-10 pb-20">
        <div className="bg-white p-8 rounded-[40px] border border-slate-200 shadow-xl space-y-8">
          <div className="flex items-center justify-between border-b border-slate-100 pb-6">
            <h2 className="text-2xl font-black text-slate-900 flex items-center gap-3">
              <FilePlus className="text-indigo-600" /> 新增合約資料
            </h2>
            <button onClick={() => setView('LIST')} className="p-2 hover:bg-slate-100 rounded-full text-slate-400"><X /></button>
          </div>

          <form onSubmit={handleSubmit} className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div className="space-y-1">
              <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest">合約類別 *</label>
              <select className="w-full px-4 py-3 bg-slate-50 border border-slate-100 rounded-2xl outline-none" value={form.category} onChange={e => setForm({...form, category: e.target.value})}>
                {CONTRACT_CATEGORIES.map(cat => <option key={cat} value={cat}>{cat}</option>)}
              </select>
            </div>
            <div className="space-y-1">
              <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest">所屬會館 *</label>
              <select className="w-full px-4 py-3 bg-slate-50 border border-slate-100 rounded-2xl outline-none" value={form.hallName} onChange={e => setForm({...form, hallName: e.target.value})}>
                {MOCK_HALLS.map(h => <option key={h.id} value={h.name}>{h.name}</option>)}
              </select>
            </div>
            <div className="space-y-1">
              <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest">廠商名稱 *</label>
              <div className="relative">
                <Building2 className="absolute left-3 top-3 text-slate-300" size={18} />
                <input required className="w-full pl-10 pr-4 py-3 bg-slate-50 border border-slate-100 rounded-2xl outline-none focus:ring-2 focus:ring-indigo-500" value={form.vendor} onChange={e => setForm({...form, vendor: e.target.value})} />
              </div>
            </div>
            <div className="space-y-1">
              <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest">提報者 *</label>
              <div className="relative">
                <User className="absolute left-3 top-3 text-slate-300" size={18} />
                <input required className="w-full pl-10 pr-4 py-3 bg-slate-50 border border-slate-100 rounded-2xl outline-none" value={form.reporter} onChange={e => setForm({...form, reporter: e.target.value})} />
              </div>
            </div>
            <div className="md:col-span-2 space-y-1">
              <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest">項目 / 合約概述 *</label>
              <div className="relative">
                <FileText className="absolute left-3 top-3 text-slate-300" size={18} />
                <input required placeholder="例如：113年度機電設施保養合約" className="w-full pl-10 pr-4 py-3 bg-slate-50 border border-slate-100 rounded-2xl outline-none" value={form.summary} onChange={e => setForm({...form, summary: e.target.value})} />
              </div>
            </div>
            <div className="space-y-1">
              <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest">合約開始日期 *</label>
              <input required type="date" className="w-full px-4 py-3 bg-slate-50 border border-slate-100 rounded-2xl outline-none" value={form.startDate} onChange={e => setForm({...form, startDate: e.target.value})} />
            </div>
            <div className="space-y-1">
              <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest">合約結束日期 *</label>
              <input required type="date" className="w-full px-4 py-3 bg-slate-50 border border-slate-100 rounded-2xl outline-none" value={form.endDate} onChange={e => setForm({...form, endDate: e.target.value})} />
            </div>
            <div className="space-y-1">
              <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest">合約總費用 *</label>
              <div className="relative">
                <DollarSign className="absolute left-3 top-3 text-slate-300" size={18} />
                <input required type="number" className="w-full pl-10 pr-4 py-3 bg-slate-50 border border-slate-100 rounded-2xl outline-none" value={form.fee} onChange={e => setForm({...form, fee: parseInt(e.target.value)})} />
              </div>
            </div>
            <div className="md:col-span-2 space-y-1">
              <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest">合約書附件</label>
              <button type="button" onClick={() => {setIsUploading(true); setTimeout(() => {setIsUploading(false); setForm({...form, attachment: 'contract_file.pdf'})}, 1000)}} className={`w-full py-6 border-2 border-dashed rounded-3xl flex flex-col items-center justify-center transition-all ${form.attachment ? 'bg-emerald-50 border-emerald-200 text-emerald-600' : 'bg-slate-50 border-slate-200 text-slate-400 hover:border-indigo-400 hover:text-indigo-600'}`}>
                {isUploading ? (
                  <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-indigo-600"></div>
                ) : form.attachment ? (
                  <>
                    <CheckCircle2 size={32} />
                    <span className="text-xs font-black mt-2">已選取合約書：{form.attachment}</span>
                  </>
                ) : (
                  <>
                    <Upload size={32} />
                    <span className="text-xs font-black mt-2">點擊或拖曳上傳 PDF 合約掃描檔</span>
                  </>
                )}
              </button>
            </div>

            <div className="md:col-span-2 pt-6 flex gap-4">
              <button type="submit" className="flex-1 bg-indigo-600 text-white font-black py-4 rounded-3xl shadow-xl shadow-indigo-100 hover:bg-indigo-700 transition-all flex items-center justify-center gap-2">
                <Save size={18} /> 保存合約
              </button>
              <button type="button" onClick={() => setView('LIST')} className="px-10 bg-white text-slate-500 font-bold py-4 rounded-3xl border border-slate-200 hover:bg-slate-50 transition-all">取消</button>
            </div>
          </form>
        </div>
      </div>
    );
  };

  const ListView = () => (
    <div className="space-y-8 animate-in fade-in duration-500 pb-20">
      <div className="space-y-4 md:space-y-0">
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
          <div>
            <h1 className="text-3xl font-extrabold text-slate-900 tracking-tight flex items-center gap-3">
              <FileText className="text-indigo-600" /> 會館合約管理
            </h1>
            <p className="text-slate-500 font-medium">追蹤各會館外包廠商年度合約狀態、種類與進度</p>
          </div>
        </div>
        <div className="flex flex-col md:flex-row md:items-center gap-3 md:justify-end">
          <div className="bg-white p-1 rounded-2xl border border-slate-200 flex shadow-sm">
             <button onClick={() => setViewMode('TABLE')} className={`p-2 rounded-xl transition-all ${viewMode === 'TABLE' ? 'bg-indigo-600 text-white' : 'text-slate-400 hover:bg-slate-50'}`}>
                <ListIcon size={20} />
             </button>
             <button onClick={() => setViewMode('VENDOR_MAP')} className={`p-2 rounded-xl transition-all ${viewMode === 'VENDOR_MAP' ? 'bg-indigo-600 text-white' : 'text-slate-400 hover:bg-slate-50'}`}>
                <LayoutGrid size={20} />
             </button>
          </div>
          <button onClick={() => setView('ADD')} className="flex items-center justify-center gap-2 px-6 py-3 bg-indigo-600 text-white rounded-2xl font-black shadow-lg shadow-indigo-100 hover:bg-indigo-700 transition-all w-full md:w-auto">
            <FilePlus size={18} /> 新增合約
          </button>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        {[
          { label: '進行中合約', value: stats.inProgress, color: 'bg-indigo-600', icon: <CheckCircle2 size={24} /> },
          { label: '已結束合約', value: stats.ended, color: 'bg-slate-500', icon: <Clock size={24} /> },
          { label: '尚未開始合約', value: stats.notStarted, color: 'bg-amber-500', icon: <AlertCircle size={24} /> },
        ].map((stat, i) => (
          <div key={i} className="bg-white p-6 rounded-[32px] border border-slate-200 shadow-sm flex items-center gap-6">
            <div className={`p-4 rounded-2xl text-white ${stat.color} shadow-lg`}>
              {stat.icon}
            </div>
            <div>
              <p className="text-slate-400 text-[10px] font-black opacity-60 uppercase tracking-widest">{stat.label}</p>
              <p className="text-3xl font-black text-slate-900">{stat.value} <span className="text-sm font-bold text-slate-300">筆</span></p>
            </div>
          </div>
        ))}
      </div>

      <div className="bg-white p-8 rounded-[40px] border border-slate-200 shadow-sm space-y-6">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2 text-slate-400 text-[10px] font-black uppercase tracking-widest">
            <Filter size={14} /> 進階篩選查詢
          </div>
        </div>
        <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
          <div className="space-y-1">
            <label className="text-[10px] font-bold text-slate-400">合約種類 (如空調、消防)</label>
            <select className="w-full px-4 py-2 bg-slate-50 border border-slate-100 rounded-xl text-sm outline-none" value={filters.category} onChange={e => setFilters({...filters, category: e.target.value})}>
              <option value="ALL">全部種類</option>
              {CONTRACT_CATEGORIES.map(cat => <option key={cat} value={cat}>{cat}</option>)}
            </select>
          </div>
          <div className="space-y-1">
            <label className="text-[10px] font-bold text-slate-400">會館名稱</label>
            <input placeholder="搜尋會館..." className="w-full px-4 py-2 bg-slate-50 border border-slate-100 rounded-xl text-sm outline-none" value={filters.hall} onChange={e => setFilters({...filters, hall: e.target.value})} />
          </div>
          <div className="space-y-1">
            <label className="text-[10px] font-bold text-slate-400">廠商名稱</label>
            <input placeholder="搜尋廠商..." className="w-full px-4 py-2 bg-slate-50 border border-slate-100 rounded-xl text-sm outline-none" value={filters.vendor} onChange={e => setFilters({...filters, vendor: e.target.value})} />
          </div>
          <div className="space-y-1">
            <label className="text-[10px] font-bold text-slate-400">履約進度</label>
            <select className="w-full px-4 py-2 bg-slate-50 border border-slate-100 rounded-xl text-sm outline-none" value={filters.status} onChange={e => setFilters({...filters, status: e.target.value})}>
              <option value="ALL">全部狀態</option>
              <option value={ContractStatus.IN_PROGRESS}>{ContractStatus.IN_PROGRESS}</option>
              <option value={ContractStatus.NOT_STARTED}>{ContractStatus.NOT_STARTED}</option>
              <option value={ContractStatus.ENDED}>{ContractStatus.ENDED}</option>
            </select>
          </div>
        </div>
      </div>

      {viewMode === 'TABLE' ? (
        <div className="bg-white rounded-[32px] border border-slate-200 overflow-hidden shadow-sm">
          <div className="overflow-x-auto">
            <table className="w-full text-left">
              <thead className="bg-slate-50 text-slate-400 text-[10px] font-black uppercase tracking-widest border-b border-slate-100">
                <tr>
                  <th className="px-6 py-4 whitespace-nowrap">廠商與概述</th>
                  <th className="px-6 py-4 whitespace-nowrap">會館</th>
                  <th className="px-6 py-4 whitespace-nowrap">日期區間</th>
                  <th className="px-6 py-4 whitespace-nowrap">合約費用</th>
                  <th className="px-6 py-4 whitespace-nowrap">狀態</th>
                  <th className="px-6 py-4 text-right whitespace-nowrap">操作</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100">
                {filteredContracts.map(c => {
                  const status = getContractStatus(c.startDate, c.endDate);
                  return (
                    <tr key={c.id} className="hover:bg-slate-50/50 transition-colors group">
                      <td className="px-6 py-4">
                        <div className="flex flex-col gap-1.5">
                          <div className="flex items-center gap-2">
                            <span className={`px-2 py-0.5 rounded border text-[9px] font-black ${CATEGORY_COLORS[c.category]}`}>
                              {c.category}
                            </span>
                            <span className="font-bold text-slate-900 group-hover:text-indigo-600 transition-colors">{c.vendor}</span>
                          </div>
                          <span className="text-xs text-slate-500">{c.summary}</span>
                        </div>
                      </td>
                      <td className="px-6 py-4 text-sm font-medium text-slate-600 whitespace-nowrap">{c.hallName}</td>
                      <td className="px-6 py-4 text-xs font-medium text-slate-500 whitespace-nowrap">
                        <div className="flex items-center gap-2">
                          <Calendar size={12} className="text-slate-300 flex-shrink-0"/>
                          <span>{c.startDate}</span>
                          <span className="text-slate-300">~</span>
                          <span>{c.endDate}</span>
                        </div>
                      </td>
                      <td className="px-6 py-4 font-black text-slate-900 whitespace-nowrap">${c.fee.toLocaleString()}</td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <span className={`px-2 py-1 rounded-lg text-[10px] font-black whitespace-nowrap ${
                          status === ContractStatus.IN_PROGRESS ? 'bg-indigo-600 text-white' :
                          status === ContractStatus.NOT_STARTED ? 'bg-amber-100 text-amber-700' :
                          'bg-slate-200 text-slate-400'
                        }`}>
                          {status}
                        </span>
                      </td>
                      <td className="px-6 py-4 text-right">
                        <button className="p-2 text-slate-400 hover:text-indigo-600 hover:bg-white rounded-xl transition-all">
                          <ChevronRight size={18} />
                        </button>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        </div>
      ) : (
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
          {/* Fix: Explicitly cast Object.entries result to resolve unknown type issues for vendorContracts */}
          {(Object.entries(vendorGroups) as [string, Contract[]][]).map(([vendorName, vendorContracts]) => (
            <div key={vendorName} className="bg-white p-8 rounded-[40px] border border-slate-200 shadow-sm hover:shadow-xl transition-all">
               <div className="flex items-start justify-between mb-6">
                  <div className="flex items-center gap-4">
                     <div className="p-4 bg-slate-900 text-white rounded-2xl shadow-lg">
                        <Building2 size={24} />
                     </div>
                     <div>
                        <h3 className="text-xl font-black text-slate-900">{vendorName}</h3>
                        {/* Fix: vendorContracts is now correctly typed as Contract[] */}
                        <p className="text-xs text-slate-400 font-bold uppercase tracking-widest mt-1">目前承攬 {vendorContracts.length} 項服務</p>
                     </div>
                  </div>
                  <button className="p-2 text-slate-300 hover:text-indigo-600"><ExternalLink size={18}/></button>
               </div>
               
               <div className="space-y-4">
                  <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest border-b border-slate-50 pb-2">覆蓋會館清單</p>
                  <div className="grid grid-cols-1 gap-3">
                     {/* Fix: vendorContracts is now correctly typed as Contract[] */}
                     {vendorContracts.map(c => {
                        const status = getContractStatus(c.startDate, c.endDate);
                        const catEnum = mapStringToCategory(c.category);
                        return (
                          <div key={c.id} className="flex items-center justify-between p-4 bg-slate-50 rounded-2xl group/item hover:bg-white border border-transparent hover:border-indigo-100 transition-all">
                             <div className="flex items-center gap-3">
                                <div className={`p-2 rounded-lg bg-white border border-slate-100 text-indigo-600 shadow-sm`}>
                                   {CATEGORY_ICONS[catEnum]}
                                </div>
                                <div>
                                   <p className="text-sm font-bold text-slate-800">{c.hallName}</p>
                                   <p className="text-[10px] text-slate-400 font-medium">{c.summary}</p>
                                </div>
                             </div>
                             <div className="text-right">
                                <p className={`text-[10px] font-black mb-1 ${
                                   status === ContractStatus.ENDED ? 'text-rose-500' : 'text-emerald-500'
                                }`}>{status}</p>
                                <p className="text-[10px] text-slate-400 font-bold uppercase tracking-widest">至 {c.endDate}</p>
                             </div>
                          </div>
                        );
                     })}
                  </div>
               </div>
            </div>
          ))}
          {Object.keys(vendorGroups).length === 0 && (
             <div className="lg:col-span-2 py-20 text-center text-slate-300 font-black">
                查無符合條件的廠商覆蓋資料
             </div>
          )}
        </div>
      )}
    </div>
  );

  return view === 'ADD' ? <AddForm /> : <ListView />;
};

export default ContractManagement;
