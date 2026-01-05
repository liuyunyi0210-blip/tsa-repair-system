
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
  Info,
  MapPin,
  Camera
} from 'lucide-react';
import { MOCK_HALLS } from '../constants';
import { DisasterReport, DisasterType, HallSecurityStatus, HallDisasterStatus, Language, Hall } from '../types';
import { storageService } from '../services/storageService';

interface DisasterReportingProps {
  onDirtyChange?: (isDirty: boolean) => void;
  onDisasterUpdate?: () => void;
  language: Language;
}

const DisasterReporting: React.FC<DisasterReportingProps> = ({ onDirtyChange, onDisasterUpdate, language }) => {
  const [reports, setReports] = useState<DisasterReport[]>([]);
  const [view, setView] = useState<'LIST' | 'DETAIL'>('LIST');
  const [selectedReport, setSelectedReport] = useState<DisasterReport | null>(null);
  const [isPublishing, setIsPublishing] = useState(false);
  const [selectedPhoto, setSelectedPhoto] = useState<string | null>(null);
  const [publishForm, setPublishForm] = useState({
    type: DisasterType.EARTHQUAKE,
    name: '',
    date: new Date().toISOString().split('T')[0]
  });
  const [halls, setHalls] = useState<Hall[]>([]);

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
      remarkEmpty: '暫無具體回報內容',
      reporterLabel: '回報人',
      positionLabel: '職稱',
      phoneLabel: '手機',
      reportedAtLabel: '回報時間',
      hallNameHeader: '會館名稱',
      statusHeader: '狀況',
      remarkHeader: '狀況說明',
      reporterHeader: '回報人資訊'
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
      remarkEmpty: '具體的な報告はありません',
      reporterLabel: '報告者',
      positionLabel: '役職',
      phoneLabel: '携帯電話',
      reportedAtLabel: '報告時間',
      hallNameHeader: '会館名称',
      statusHeader: '状況',
      remarkHeader: '状況説明',
      reporterHeader: '報告者情報'
    }
  };

  const t = translations[language];

  useEffect(() => {
    if (onDirtyChange) onDirtyChange(isPublishing);
  }, [isPublishing, onDirtyChange]);

  useEffect(() => {
    const loadData = async () => {
      const saved = await storageService.loadDisasterReports();
      const savedHalls = await storageService.loadHalls();
      if (saved) setReports(saved);
      setHalls(savedHalls || MOCK_HALLS);
    };
    loadData();
  }, []);

  const handlePublish = async () => {
    if (!publishForm.name.trim()) {
      alert('請輸入災害名稱');
      return;
    }

    const newReport: DisasterReport = {
      id: `DIS-${Date.now()}`,
      type: publishForm.type,
      name: publishForm.name,
      createdAt: new Date().toISOString(),
      hallsStatus: halls.map(hall => ({
        hallId: hall.id,
        hallName: hall.name,
        status: HallSecurityStatus.NONE,
        remark: ''
      }))
    };

    const updatedReports = [newReport, ...reports];
    setReports(updatedReports);
    await storageService.saveDisasterReports(updatedReports);
    setIsPublishing(false);
    setPublishForm({
      type: DisasterType.EARTHQUAKE,
      name: '',
      date: new Date().toISOString().split('T')[0]
    });
    alert('災害回報已成功發布！');
    if (onDisasterUpdate) {
      onDisasterUpdate();
    }
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
        <div className="bg-white rounded-[40px] border border-slate-200 shadow-sm overflow-hidden">
          {/* Mobile Detail View: Cards */}
          <div className="md:hidden divide-y divide-slate-100">
            {selectedReport.hallsStatus.map((h) => (
              <div key={h.hallId} className="p-6 space-y-4">
                <div className="flex items-center justify-between">
                  <span className="font-black text-slate-900 text-lg">{h.hallName}</span>
                  <span className={`px-3 py-1.5 rounded-full text-[11px] font-black ${h.status === HallSecurityStatus.SAFE
                    ? 'bg-emerald-50 text-emerald-600'
                    : h.status === HallSecurityStatus.LIGHT
                      ? 'bg-amber-50 text-amber-600'
                      : h.status === HallSecurityStatus.HEAVY
                        ? 'bg-rose-50 text-rose-600'
                        : 'bg-slate-50 text-slate-400'
                    }`}>{h.status}</span>
                </div>

                <div className="space-y-3">
                  <div className="bg-slate-50 p-4 rounded-2xl">
                    <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest block mb-1">回報類別 / 備註</label>
                    <div className="flex flex-col gap-1">
                      <span className="text-xs font-bold text-indigo-600">{h.category || '一般狀況'}</span>
                      <p className="text-sm font-medium text-slate-600">{h.remark || t.remarkEmpty}</p>
                    </div>
                  </div>

                  {h.photoUrls && h.photoUrls.length > 0 && (
                    <div className="flex flex-wrap gap-2">
                      {h.photoUrls.map((url, i) => (
                        <img
                          key={i}
                          src={url}
                          className="w-16 h-16 object-cover rounded-xl border border-slate-100"
                          onClick={() => setSelectedPhoto(url)}
                        />
                      ))}
                    </div>
                  )}

                  <div className="grid grid-cols-2 gap-4 pb-2">
                    <div>
                      <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest block mb-1">{t.reporterLabel}</label>
                      <span className="text-sm font-black text-slate-700 block truncate">{h.reporter || '-'}</span>
                    </div>
                    <div className="text-right">
                      <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest block mb-1">回報時間</label>
                      <span className="text-[10px] font-bold text-slate-500 block">{h.reportedAt ? new Date(h.reportedAt).toLocaleDateString() : '-'}</span>
                    </div>
                  </div>
                </div>
              </div>
            ))}
          </div>

          {/* Desktop Detail View: Table - Optimized for one-page view */}
          <div className="hidden md:block overflow-x-auto">
            <table className="w-full text-left table-fixed">
              <thead className="bg-slate-50 text-slate-400 text-[10px] font-black uppercase tracking-widest border-b border-slate-100">
                <tr>
                  <th className="px-4 py-4 w-[120px] lg:w-[150px]">{t.hallNameHeader}</th>
                  <th className="px-4 py-4 w-[110px] lg:w-[130px]">{t.statusHeader}</th>
                  <th className="px-4 py-4">{t.remarkHeader}</th>
                  <th className="px-4 py-4 w-[110px] lg:w-[130px]">現場照片</th>
                  <th className="px-4 py-4 w-[160px] lg:w-[200px]">{t.reporterHeader}</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100">
                {selectedReport.hallsStatus.map((h) => (
                  <tr key={h.hallId} className="hover:bg-slate-50/50 transition-colors">
                    <td className="px-4 py-5">
                      <span className="font-black text-slate-800 text-sm lg:text-base break-words">{h.hallName}</span>
                    </td>
                    <td className="px-4 py-5">
                      <div className="flex flex-col gap-1.5">
                        <span className={`px-2 py-1 rounded-lg text-[10px] font-black w-fit whitespace-nowrap ${h.status === HallSecurityStatus.SAFE
                          ? 'bg-emerald-50 text-emerald-600'
                          : h.status === HallSecurityStatus.LIGHT
                            ? 'bg-amber-50 text-amber-600'
                            : h.status === HallSecurityStatus.HEAVY
                              ? 'bg-rose-50 text-rose-600'
                              : 'bg-slate-50 text-slate-400'
                          }`}>{h.status}</span>
                        <span className="text-[11px] font-bold text-slate-400 truncate" title={h.category || '一般狀況'}>
                          {h.category || '一般狀況'}
                        </span>
                      </div>
                    </td>
                    <td className="px-4 py-5">
                      <p className="text-sm text-slate-600 font-medium line-clamp-3 hover:line-clamp-none transition-all cursor-default" title={h.remark || t.remarkEmpty}>
                        {h.remark || t.remarkEmpty}
                      </p>
                    </td>
                    <td className="px-4 py-5">
                      {h.photoUrls && h.photoUrls.length > 0 ? (
                        <div className="flex flex-wrap gap-1.5">
                          {h.photoUrls.slice(0, 3).map((url, i) => (
                            <div key={i} className="relative group">
                              <img
                                src={url}
                                className="w-8 h-8 lg:w-10 lg:h-10 object-cover rounded-lg cursor-pointer border border-slate-100 hover:border-indigo-500 transition-all"
                                onClick={() => setSelectedPhoto(url)}
                              />
                            </div>
                          ))}
                          {h.photoUrls.length > 3 && (
                            <div
                              className="w-8 h-8 lg:w-10 lg:h-10 bg-slate-100 rounded-lg flex items-center justify-center text-[10px] font-bold text-slate-400 cursor-pointer"
                              onClick={() => setSelectedPhoto(h.photoUrls![0])}
                            >
                              +{h.photoUrls.length - 3}
                            </div>
                          )}
                        </div>
                      ) : (
                        <div className="flex items-center gap-1.5 text-slate-300">
                          <Camera size={14} className="opacity-40" />
                          <span className="text-[10px] font-bold">無</span>
                        </div>
                      )}
                    </td>
                    <td className="px-4 py-5">
                      {h.reporter ? (
                        <div className="space-y-1">
                          <div className="flex flex-col lg:flex-row lg:items-center lg:gap-2">
                            <span className="text-slate-800 font-black text-xs lg:text-sm whitespace-nowrap">{h.reporter}</span>
                            <span className="text-slate-400 font-bold text-[10px] truncate">{h.position}</span>
                          </div>
                          {h.reportedAt && (
                            <div className="text-[10px] text-slate-400 font-bold whitespace-nowrap">
                              {new Date(h.reportedAt).toLocaleString(undefined, {
                                month: 'numeric',
                                day: 'numeric',
                                hour: '2-digit',
                                minute: '2-digit'
                              })}
                            </div>
                          )}
                        </div>
                      ) : (
                        <span className="text-slate-300 text-xs italic">尚未回報</span>
                      )}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
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
              <ShieldAlert className="text-rose-500" /> {t.title}
            </h1>
            <p className="text-slate-500 font-medium">{t.subtitle}</p>
          </div>
        </div>
        <div className="flex flex-col md:flex-row md:items-center gap-3 md:justify-end">
          <button
            onClick={() => setIsPublishing(true)}
            className="flex items-center justify-center gap-2 px-8 py-4 bg-indigo-600 text-white rounded-[24px] font-black shadow-lg hover:bg-indigo-700 transition-all w-full md:w-auto"
          >
            <Plus size={20} /> {t.publishBtn}
          </button>
        </div>
      </div>
      <div className="bg-white rounded-[40px] border border-slate-200 shadow-sm overflow-hidden">
        {/* Mobile View: Cards */}
        <div className="md:hidden divide-y divide-slate-100">
          {reports.map((r) => {
            const reportedCount = r.hallsStatus.filter(h => {
              const hasReportedAt = h.reportedAt && h.reportedAt.trim() !== '';
              const hasReporter = h.reporter && h.reporter.trim() !== '';
              const hasStatus = h.status && h.status !== HallSecurityStatus.NONE;
              return hasReportedAt || (hasReporter && hasStatus);
            }).length;
            const progress = r.hallsStatus.length > 0 ? (reportedCount / r.hallsStatus.length) * 100 : 0;
            return (
              <div key={r.id} className="p-6 space-y-4 active:bg-slate-50 transition-all" onClick={async () => {
                const saved = await storageService.loadDisasterReports();
                if (saved) {
                  const updated = saved.find(report => report.id === r.id);
                  setSelectedReport(updated || r);
                } else {
                  setSelectedReport(r);
                }
                setView('DETAIL');
              }}>
                <div className="flex items-center justify-between">
                  <span className="px-3 py-1 rounded-xl text-[10px] font-black text-white bg-indigo-500">{r.type}</span>
                  <span className="text-[10px] font-bold text-slate-400">{new Date(r.createdAt).toLocaleDateString()}</span>
                </div>
                <h3 className="font-black text-slate-900 text-xl">{r.name}</h3>
                <div className="flex items-center gap-4">
                  <div className="flex-1 h-2 bg-slate-100 rounded-full">
                    <div className="h-full bg-indigo-500 rounded-full transition-all" style={{ width: `${progress}%` }}></div>
                  </div>
                  <span className="text-xs font-black text-slate-500">{reportedCount}/{r.hallsStatus.length}</span>
                </div>
              </div>
            );
          })}
        </div>

        {/* Desktop View: Table */}
        <div className="hidden md:block overflow-x-auto">
          <table className="w-full text-left table-fixed">
            <thead className="bg-slate-50 text-slate-400 text-[10px] font-black uppercase tracking-widest border-b border-slate-100">
              <tr>
                <th className="px-4 md:px-6 py-5 w-[100px] lg:w-[120px]">{t.headerType}</th>
                <th className="px-4 md:px-6 py-5">{t.headerName}</th>
                <th className="px-4 md:px-6 py-5 w-[140px] lg:w-[180px]">{t.headerTime}</th>
                <th className="px-4 md:px-6 py-5 w-[120px] lg:w-[150px]">{t.headerProgress}</th>
                <th className="px-4 md:px-6 py-5 text-right w-[80px] lg:w-[120px]">{t.actionView}</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100">
              {reports.map(r => {
                // 只計算有實際回報的會館
                const reportedCount = r.hallsStatus.filter(h => {
                  const hasReportedAt = h.reportedAt && h.reportedAt.trim() !== '';
                  const hasReporter = h.reporter && h.reporter.trim() !== '';
                  const hasStatus = h.status && h.status !== HallSecurityStatus.NONE;
                  return hasReportedAt || (hasReporter && hasStatus);
                }).length;
                const progress = r.hallsStatus.length > 0 ? (reportedCount / r.hallsStatus.length) * 100 : 0;
                return (
                  <tr key={r.id} className="hover:bg-slate-50/50 transition-colors group">
                    <td className="px-4 md:px-6 py-5">
                      <span className="px-3 py-1 rounded-xl text-[10px] font-black text-white bg-indigo-500 whitespace-nowrap">{r.type}</span>
                    </td>
                    <td className="px-4 md:px-6 py-5">
                      <div className="font-black text-slate-900 text-base lg:text-lg truncate" title={r.name}>{r.name}</div>
                    </td>
                    <td className="px-4 md:px-6 py-5 text-xs lg:text-sm font-medium text-slate-500 whitespace-nowrap">{new Date(r.createdAt).toLocaleString()}</td>
                    <td className="px-4 md:px-6 py-5">
                      <div className="flex items-center gap-2">
                        <div className="flex-1 h-1.5 bg-slate-100 rounded-full">
                          <div className="h-full bg-indigo-500 rounded-full transition-all" style={{ width: `${progress}%` }}></div>
                        </div>
                        <span className="text-[10px] font-black text-slate-400 whitespace-nowrap">{reportedCount}/{r.hallsStatus.length}</span>
                      </div>
                    </td>
                    <td className="px-4 md:px-6 py-5 text-right">
                      <button
                        onClick={async () => {
                          const saved = await storageService.loadDisasterReports();
                          if (saved) {
                            const updated = saved.find(report => report.id === r.id);
                            setSelectedReport(updated || r);
                          } else {
                            setSelectedReport(r);
                          }
                          setView('DETAIL');
                        }}
                        className="inline-flex items-center gap-2 px-3 lg:px-6 py-2 bg-white text-indigo-600 font-black rounded-2xl border border-indigo-100 shadow-sm hover:bg-indigo-50 transition-all text-sm"
                      >
                        <Eye size={16} className="lg:hidden" />
                        <span className="hidden lg:inline">{t.actionView}</span>
                        <span className="lg:hidden">檢視</span>
                      </button>
                    </td>
                  </tr>
                );
              })}
              {reports.length === 0 && <tr><td colSpan={5} className="px-8 py-24 text-center text-slate-300 font-black">{t.noData}</td></tr>}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );

  return (
    <>
      {view === 'DETAIL' ? <DetailView /> : <ListView />}

      {/* 發布回報 Modal */}
      {isPublishing && (
        <div className="fixed inset-0 z-[120] flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-sm">
          <div className="bg-white w-full max-w-2xl rounded-[40px] p-8 shadow-2xl animate-in zoom-in-95">
            <div className="flex justify-between items-start border-b border-slate-100 pb-6 mb-6">
              <h3 className="text-2xl font-black text-slate-900 flex items-center gap-2">
                <ShieldAlert className="text-rose-500" size={24} />
                {t.modalTitle}
              </h3>
              <button onClick={() => setIsPublishing(false)} className="p-2 hover:bg-slate-100 rounded-full transition-colors">
                <X size={24} className="text-slate-400" />
              </button>
            </div>

            <div className="space-y-6">
              <div className="space-y-2">
                <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest">{t.step1}</label>
                <div className="grid grid-cols-2 gap-3">
                  {Object.values(DisasterType).map((type) => (
                    <button
                      key={type}
                      onClick={() => setPublishForm(prev => ({ ...prev, type }))}
                      className={`px-4 py-3 rounded-2xl font-black transition-all ${publishForm.type === type
                        ? 'bg-indigo-600 text-white shadow-lg'
                        : 'bg-slate-50 text-slate-600 hover:bg-slate-100'
                        }`}
                    >
                      {type}
                    </button>
                  ))}
                </div>
              </div>

              <div className="space-y-2">
                <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest">{t.step2}</label>
                <input
                  type="text"
                  placeholder="例如：2024年1月1日地震"
                  className="w-full px-4 py-3 bg-slate-50 border border-slate-100 rounded-2xl outline-none focus:ring-2 focus:ring-indigo-500 focus:bg-white font-bold"
                  value={publishForm.name}
                  onChange={e => setPublishForm(prev => ({ ...prev, name: e.target.value }))}
                />
              </div>

              <div className="space-y-2">
                <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest">災害日期</label>
                <div className="relative">
                  <Calendar className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400" size={18} />
                  <input
                    type="date"
                    className="w-full pl-12 pr-4 py-3 bg-slate-50 border border-slate-100 rounded-2xl outline-none focus:ring-2 focus:ring-indigo-500 focus:bg-white font-bold"
                    value={publishForm.date}
                    onChange={e => setPublishForm(prev => ({ ...prev, date: e.target.value }))}
                  />
                </div>
              </div>
            </div>

            <div className="pt-8 mt-6 border-t border-slate-100 flex gap-4">
              <button
                onClick={() => setIsPublishing(false)}
                className="flex-1 py-4 rounded-3xl font-black text-slate-500 bg-slate-50 hover:bg-slate-100 transition-colors"
              >
                {t.cancel}
              </button>
              <button
                onClick={handlePublish}
                className="flex-1 py-4 rounded-3xl font-black text-white bg-indigo-600 hover:bg-indigo-700 shadow-xl shadow-indigo-200 transition-all active:scale-95"
              >
                {t.publishNow}
              </button>
            </div>
          </div>
        </div>
      )}
      {/* 照片查看器 Modal */}
      {selectedPhoto && (
        <div
          className="fixed inset-0 z-[200] flex items-center justify-center p-4 bg-slate-900/90 backdrop-blur-md animate-in fade-in duration-200"
          onClick={() => setSelectedPhoto(null)}
        >
          <button
            className="absolute top-6 right-6 p-3 bg-white/10 hover:bg-white/20 text-white rounded-full backdrop-blur-md transition-colors"
            onClick={() => setSelectedPhoto(null)}
          >
            <X size={24} />
          </button>
          <img
            src={selectedPhoto}
            className="max-w-full max-h-full object-contain rounded-3xl shadow-2xl animate-in zoom-in-95 duration-200"
            alt="放大照片"
          />
        </div>
      )}
    </>
  );
};

export default DisasterReporting;
