
import React, { useState, useEffect } from 'react';
import { 
  ShieldAlert, 
  Plus, 
  Eye, 
  X, 
  CheckCircle2, 
  AlertTriangle, 
  Flame, 
  CloudRain, 
  Activity,
  ArrowLeft,
  Calendar,
  Building2,
  Info
} from 'lucide-react';
import { MOCK_HALLS } from '../constants';
import { DisasterReport, DisasterType, HallSecurityStatus, HallDisasterStatus, Language } from '../types';

interface DisasterReportingProps {
  onDirtyChange?: (isDirty: boolean) => void;
  language: Language;
}

const DisasterReporting: React.FC<DisasterReportingProps> = ({ onDirtyChange, language }) => {
  const [reports, setReports] = useState<DisasterReport[]>([]);
  const [view, setView] = useState<'LIST' | 'DETAIL'>('LIST');
  const [selectedReport, setSelectedReport] = useState<DisasterReport | null>(null);
  const [isPublishing, setIsPublishing] = useState(false);

  const translations = {
    [Language.ZH]: {
      title: '全台會館災害回報',
      subtitle: '突發災害即時統整各講堂回報狀況',
      publishBtn: '發布回報要求',
      headerType: '災害種類',
      headerName: '災害名稱 / 日期',
      headerTime: '發布時間',
      headerProgress: '回報進度',
      actionView: '檢視',
      noData: '目前尚無災害回報紀錄',
      modalTitle: '發布新的回報',
      step1: '1. 選擇災害種類',
      step2: '2. 災害日期或名稱',
      publishNow: '發布回報',
      cancel: '取消',
      detailTitle: '狀況總覽',
      statusSafe: '安全',
      statusLight: '輕微受損',
      statusHeavy: '嚴重損壞',
      statusNone: '尚未回報',
      remarkEmpty: '暫無具體回報內容'
    },
    [Language.JA]: {
      title: '全会館災害報告システム',
      subtitle: '緊急災害時における各地会館の状況集計',
      publishBtn: '報告リクエストを発行',
      headerType: '災害種別',
      headerName: '災害名称 / 日付',
      headerTime: '発行時間',
      headerProgress: '報告進捗',
      actionView: '詳細',
      noData: '災害報告データがありません',
      modalTitle: '新しい報告リクエスト',
      step1: '1. 災害種別を選択',
      step2: '2. 災害日付または名稱',
      publishNow: 'リクエスト発行',
      cancel: 'キャンセル',
      detailTitle: '状況オーバービュー',
      statusSafe: '安全',
      statusLight: '輕微な損傷',
      statusHeavy: '重大な損傷',
      statusNone: '未報告',
      remarkEmpty: '具體的な報告はありません'
    }
  };

  const t = translations[language];

  useEffect(() => {
    if (onDirtyChange) onDirtyChange(isPublishing);
  }, [isPublishing, onDirtyChange]);

  useEffect(() => {
    const loadData = async () => {
      const saved = await storageService.loadDisasterReports();
      if (saved) setReports(saved);
    };
    loadData();
  }, []);

  const handlePublish = () => {
    // 邏輯略...
    setIsPublishing(false);
  };

  const DetailView = () => {
    if (!selectedReport) return null;
    return (
      <div className="space-y-8 animate-in slide-in-from-right-10 pb-20">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-4">
            <button onClick={() => setView('LIST')} className="p-2 hover:bg-white rounded-full text-slate-400 border border-transparent hover:border-slate-200"><ArrowLeft size={24} /></button>
            <div><h2 className="text-2xl font-black text-slate-900">{selectedReport.name} {t.detailTitle}</h2></div>
          </div>
          <div className="bg-white px-6 py-2 rounded-2xl border border-slate-200 shadow-sm flex items-center gap-6">
             <div className="flex items-center gap-2"><div className="w-3 h-3 rounded-full bg-emerald-500"></div><span className="text-[10px] font-black text-slate-500">{t.statusSafe}</span></div>
             <div className="flex items-center gap-2"><div className="w-3 h-3 rounded-full bg-amber-500"></div><span className="text-[10px] font-black text-slate-500">{t.statusLight}</span></div>
             <div className="flex items-center gap-2"><div className="w-3 h-3 rounded-full bg-rose-500"></div><span className="text-[10px] font-black text-slate-500">{t.statusHeavy}</span></div>
             <div className="flex items-center gap-2"><div className="w-3 h-3 rounded-full bg-slate-200"></div><span className="text-[10px] font-black text-slate-500">{t.statusNone}</span></div>
          </div>
        </div>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {selectedReport.hallsStatus.map((h) => (
            <div key={h.hallId} className="bg-white p-6 rounded-[32px] border border-slate-200 shadow-sm flex flex-col gap-4">
              <div className="flex items-center justify-between"><h4 className="font-black text-slate-800">{h.hallName}</h4><span className={`px-3 py-1 rounded-full text-[10px] font-black ${h.status === HallSecurityStatus.SAFE ? 'bg-emerald-50 text-emerald-600' : 'bg-slate-50 text-slate-400'}`}>{h.status}</span></div>
              <div className="bg-slate-50 p-4 rounded-2xl min-h-[60px] flex items-center justify-center"><p className="text-xs text-slate-600 font-medium italic">{h.remark || t.remarkEmpty}</p></div>
            </div>
          ))}
        </div>
      </div>
    );
  };

  const ListView = () => (
    <div className="space-y-8 animate-in fade-in pb-20">
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div><h1 className="text-3xl font-extrabold text-slate-900 tracking-tight flex items-center gap-3"><ShieldAlert className="text-rose-500" /> {t.title}</h1><p className="text-slate-500 mt-1 font-medium">{t.subtitle}</p></div>
        <button onClick={() => setIsPublishing(true)} className="flex items-center gap-2 px-8 py-4 bg-indigo-600 text-white rounded-[24px] font-black shadow-lg hover:bg-indigo-700 transition-all"><Plus size={20} /> {t.publishBtn}</button>
      </div>
      <div className="bg-white rounded-[40px] border border-slate-200 shadow-sm overflow-hidden">
        <table className="w-full text-left">
          <thead className="bg-slate-50 text-slate-400 text-[10px] font-black uppercase tracking-widest border-b border-slate-100">
            {/* Fix: Replaced undefined 'actionView' with 't.actionView' */}
            <tr><th className="px-8 py-5">{t.headerType}</th><th className="px-8 py-5">{t.headerName}</th><th className="px-8 py-5">{t.headerTime}</th><th className="px-8 py-5">{t.headerProgress}</th><th className="px-8 py-5 text-right">{t.actionView}</th></tr>
          </thead>
          <tbody className="divide-y divide-slate-100">
            {reports.map(r => (
              <tr key={r.id} className="hover:bg-slate-50/50 transition-colors group">
                <td className="px-8 py-5"><span className="px-3 py-1 rounded-xl text-[10px] font-black text-white bg-indigo-500">{r.type}</span></td>
                <td className="px-8 py-5 font-black text-slate-900 text-lg">{r.name}</td>
                <td className="px-8 py-5 text-sm font-medium text-slate-500">{new Date(r.createdAt).toLocaleString()}</td>
                <td className="px-8 py-5"><div className="flex flex-col gap-2 min-w-[120px]"><div className="w-full h-1.5 bg-slate-100 rounded-full"><div className="h-full bg-indigo-500" style={{ width: '50%' }}></div></div></div></td>
                <td className="px-8 py-5 text-right"><button onClick={() => {setSelectedReport(r); setView('DETAIL');}} className="inline-flex items-center gap-2 px-6 py-2.5 bg-white text-indigo-600 font-black rounded-2xl border border-indigo-100 shadow-sm">{t.actionView}</button></td>
              </tr>
            ))}
            {reports.length === 0 && <tr><td colSpan={5} className="px-8 py-24 text-center text-slate-300 font-black">{t.noData}</td></tr>}
          </tbody>
        </table>
      </div>
    </div>
  );

  return view === 'DETAIL' ? <DetailView /> : <ListView />;
};

export default DisasterReporting;
