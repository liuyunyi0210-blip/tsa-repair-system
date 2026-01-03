
import React, { useState } from 'react';
import { 
  MessageSquare, 
  CheckCircle2, 
  Trash2, 
  Search, 
  Calendar, 
  MapPin, 
  User, 
  ChevronRight,
  ShieldCheck,
  AlertCircle,
  Clock,
  ExternalLink,
  Check
} from 'lucide-react';
import { RepairRequest, RepairStatus, Category, OrderType, Language } from '../types';
import { CATEGORY_ICONS, MOCK_HALLS } from '../constants';

interface ReportManagementProps {
  requests: RepairRequest[];
  onVerify: (id: string) => void;
  onDelete: (id: string) => void;
  language: Language;
}

const ReportManagement: React.FC<ReportManagementProps> = ({ requests, onVerify, onDelete, language }) => {
  const [searchTerm, setSearchTerm] = useState('');
  
  // 篩選出尚未審核的回報 (來自手機端的 VOLUNTEER 類型)
  const unverifiedReports = requests.filter(r => r.type === OrderType.VOLUNTEER && !r.isDeleted);

  const filteredReports = unverifiedReports.filter(r => 
    r.title.toLowerCase().includes(searchTerm.toLowerCase()) || 
    r.hallName.includes(searchTerm) ||
    r.reporter.includes(searchTerm)
  );

  return (
    <div className="space-y-8 animate-in fade-in duration-500 pb-20">
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <h1 className="text-3xl font-extrabold text-slate-900 tracking-tight flex items-center gap-3">
            <MessageSquare className="text-indigo-600" /> 手機端回報管理
          </h1>
          <p className="text-slate-500 font-medium">審核由 LINE 或手機瀏覽器送出的初步報修資料</p>
        </div>
        <div className="relative w-full md:w-80">
          <Search className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400" size={18} />
          <input 
            type="text" 
            placeholder="搜尋回報人或會館..." 
            className="w-full pl-12 pr-4 py-3 bg-white border border-slate-200 rounded-2xl outline-none focus:ring-2 focus:ring-indigo-600 font-bold"
            value={searchTerm}
            onChange={e => setSearchTerm(e.target.value)}
          />
        </div>
      </div>

      <div className="bg-white rounded-[40px] border border-slate-200 shadow-sm overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-left">
            <thead className="bg-slate-50 text-slate-400 text-[10px] font-black uppercase tracking-widest border-b border-slate-100">
              <tr>
                <th className="px-8 py-5">回報內容</th>
                <th className="px-8 py-5">會館</th>
                <th className="px-8 py-5">提報人</th>
                <th className="px-8 py-5">日期</th>
                <th className="px-8 py-5">狀態</th>
                <th className="px-8 py-5 text-right">核實操作</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100">
              {filteredReports.map((report) => (
                <tr key={report.id} className={`group transition-all ${report.isVerified ? 'bg-slate-50 opacity-60' : 'hover:bg-slate-50/50'}`}>
                  <td className="px-8 py-6">
                    <div className="flex items-center gap-4">
                      <div className={`p-3 rounded-2xl ${report.isVerified ? 'bg-slate-200 text-slate-400' : 'bg-indigo-50 text-indigo-600'}`}>
                        {CATEGORY_ICONS[report.category] || <AlertCircle size={20} />}
                      </div>
                      <div className="flex flex-col gap-0.5">
                        <span className={`font-black text-lg ${report.isVerified ? 'text-slate-400' : 'text-slate-900'}`}>{report.title}</span>
                        <span className="text-xs font-bold text-slate-400 line-clamp-1">{report.description}</span>
                      </div>
                    </div>
                  </td>
                  <td className="px-8 py-6">
                    <div className="flex items-center gap-2 text-sm font-bold text-slate-600">
                      <MapPin size={14} className="text-slate-300" />
                      {report.hallName}
                    </div>
                  </td>
                  <td className="px-8 py-6">
                    <div className="flex items-center gap-2 text-sm font-bold text-slate-600">
                      <User size={14} className="text-slate-300" />
                      {report.reporter}
                    </div>
                  </td>
                  <td className="px-8 py-6">
                    <div className="flex items-center gap-2 text-[10px] font-black text-slate-400">
                      <Calendar size={12} />
                      {new Date(report.createdAt).toLocaleDateString()}
                    </div>
                  </td>
                  <td className="px-8 py-6">
                    {report.isVerified ? (
                      <span className="inline-flex items-center gap-1.5 px-3 py-1 bg-slate-200 text-slate-500 rounded-full text-[10px] font-black uppercase tracking-wider">
                        <Check size={12} /> 已轉工單
                      </span>
                    ) : (
                      <span className="inline-flex items-center gap-1.5 px-3 py-1 bg-amber-50 text-amber-600 rounded-full text-[10px] font-black uppercase tracking-wider animate-pulse">
                        <Clock size={12} /> 待核實
                      </span>
                    )}
                  </td>
                  <td className="px-8 py-6 text-right">
                    {!report.isVerified ? (
                      <div className="flex items-center justify-end gap-2">
                        <button 
                          onClick={() => onVerify(report.id)}
                          className="flex items-center gap-2 px-5 py-2.5 bg-indigo-600 text-white font-black rounded-2xl shadow-lg shadow-indigo-100 hover:bg-indigo-700 transition-all active:scale-95"
                        >
                          <ShieldCheck size={16} /> 確認核實
                        </button>
                        <button 
                          onClick={() => onDelete(report.id)}
                          className="p-2.5 text-rose-400 hover:bg-rose-50 hover:text-rose-600 rounded-2xl transition-all"
                        >
                          <Trash2 size={20} />
                        </button>
                      </div>
                    ) : (
                      <div className="text-slate-300 font-black text-xs italic pr-4">
                        審核完畢
                      </div>
                    )}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
          {filteredReports.length === 0 && (
            <div className="py-32 text-center space-y-4">
              <div className="flex justify-center"><MessageSquare size={64} className="text-slate-100" /></div>
              <p className="text-slate-300 font-black text-xl">目前尚無待審核的回報項目</p>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default ReportManagement;
