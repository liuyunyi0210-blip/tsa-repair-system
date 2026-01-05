
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
        <div className="bg-white rounded-[40px] border border-slate-200 shadow-sm overflow-x-auto">
          <table className="w-full text-left min-w-[1000px]">
            <thead className="bg-slate-50 text-slate-400 text-[10px] font-black uppercase tracking-widest border-b border-slate-100">
              <tr>
                <th className="px-6 py-4 whitespace-nowrap">{t.hallNameHeader}</th>
                <th className="px-6 py-4 whitespace-nowrap">{t.statusHeader}</th>
                <th className="px-6 py-4 whitespace-nowrap">回報類別</th>
                <th className="px-6 py-4 whitespace-nowrap">{t.remarkHeader}</th>
                <th className="px-6 py-4 whitespace-nowrap">現場照片</th>
                <th className="px-6 py-4 whitespace-nowrap">{t.reporterHeader}</th>
                <th className="px-6 py-4 whitespace-nowrap">{t.reportedAtLabel}</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100">
              {selectedReport.hallsStatus.map((h) => (
                <tr key={h.hallId} className="hover:bg-slate-50/50 transition-colors">
                  <td className="px-6 py-5 whitespace-nowrap">
                    <span className="font-black text-slate-800 text-base">{h.hallName}</span>
                  </td>
                  <td className="px-6 py-5 whitespace-nowrap">
                    <span className={`px-3 py-1.5 rounded-full text-[11px] font-black ${h.status === HallSecurityStatus.SAFE
                      ? 'bg-emerald-50 text-emerald-600'
                      : h.status === HallSecurityStatus.LIGHT
                        ? 'bg-amber-50 text-amber-600'
                        : h.status === HallSecurityStatus.HEAVY
                          ? 'bg-rose-50 text-rose-600'
                          : 'bg-slate-50 text-slate-400'
                      }`}>{h.status}</span>
                  </td>
                  <td className="px-6 py-5 whitespace-nowrap">
                    <span className="font-bold text-slate-700">{h.category || '一般狀況'}</span>
                  </td>
                  <td className="px-6 py-5">
                    <p className="text-sm text-slate-600 font-medium max-w-md">{h.remark || t.remarkEmpty}</p>
                  </td>
                  <td className="px-6 py-5">
                    {h.photoUrls && h.photoUrls.length > 0 ? (
                      <div className="flex flex-wrap gap-2 max-w-[200px]">
                        {h.photoUrls.map((url, i) => (
                          <div key={i} className="relative group">
                            <img
                              src={url}
                              className="w-12 h-12 object-cover rounded-xl cursor-pointer border-2 border-slate-100 hover:border-indigo-500 transition-all"
                              onClick={() => setSelectedPhoto(url)}
                            />
                            {h.photoMetadata && h.photoMetadata[i] && (
                              <div className="absolute hidden group-hover:block bottom-full left-0 mb-2 p-2 bg-slate-900 text-white text-[8px] rounded-lg whitespace-nowrap z-20">
                                {h.photoMetadata[i].timestamp && <div>時間: {new Date(h.photoMetadata[i].timestamp).toLocaleString()}</div>}
                                {h.photoMetadata[i].location && <div>地點: {h.photoMetadata[i].location.latitude.toFixed(4)}, {h.photoMetadata[i].location.longitude.toFixed(4)}</div>}
                              </div>
                            )}
                          </div>
                        ))}
                      </div>
                    ) : (
                      <div className="flex flex-col items-center gap-1 text-slate-300">
                        <Camera size={16} className="opacity-50" />
                        <span className="text-[10px] font-bold">無照片</span>
                      </div>
                    )}
                  </td>
                  <td className="px-6 py-5">
                    {h.reporter ? (
                      <div className="space-y-1.5 text-sm">
                        <div className="flex items-center gap-2">
                          <span className="text-slate-400 font-bold">{t.reporterLabel}:</span>
                          <span className="text-slate-700 font-black">{h.reporter}</span>
                        </div>
                        {h.position && (
                          <div className="flex items-center gap-2">
                            <span className="text-slate-400 font-bold">{t.positionLabel}:</span>
                            <span className="text-slate-700 font-black">{h.position}</span>
                          </div>
                        )}
                        {h.phone && (
                          <div className="flex items-center gap-2">
                            <span className="text-slate-400 font-bold">{t.phoneLabel}:</span>
                            <span className="text-slate-700 font-black">{h.phone}</span>
                          </div>
                        )}
                      </div>
                    ) : (
                      <span className="text-slate-300 text-sm italic">尚未回報</span>
                    )}
                  </td>
                  <td className="px-6 py-5 whitespace-nowrap">
                    {h.reportedAt ? (
                      <span className="text-sm text-slate-500 font-medium">{new Date(h.reportedAt).toLocaleString()}</span>
                    ) : (
                      <span className="text-slate-300 text-sm">-</span>
                    )}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
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
      <div className="bg-white rounded-[40px] border border-slate-200 shadow-sm overflow-x-auto">
        <table className="w-full text-left min-w-[800px]">
          <thead className="bg-slate-50 text-slate-400 text-[10px] font-black uppercase tracking-widest border-b border-slate-100">
            <tr>
              <th className="px-4 md:px-8 py-5 whitespace-nowrap">{t.headerType}</th>
              <th className="px-4 md:px-8 py-5 whitespace-nowrap">{t.headerName}</th>
              <th className="px-4 md:px-8 py-5 whitespace-nowrap">{t.headerTime}</th>
              <th className="px-4 md:px-8 py-5 whitespace-nowrap">{t.headerProgress}</th>
              <th className="px-4 md:px-8 py-5 text-right whitespace-nowrap">{t.actionView}</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-slate-100">
            {reports.map(r => {
              // 只計算有實際回報的會館
              // 檢查條件：有回報時間（reportedAt）或有回報人資訊（reporter）
              // 這樣可以兼容舊資料（只有 reporter）和新資料（有 reportedAt）
              const reportedCount = r.hallsStatus.filter(h => {
                const hasReportedAt = h.reportedAt && h.reportedAt.trim() !== '';
                const hasReporter = h.reporter && h.reporter.trim() !== '';
                const hasStatus = h.status && h.status !== HallSecurityStatus.NONE;
                // 只要有回報時間，或者（有回報人且狀態不是「尚未回報」），就視為已回報
                return hasReportedAt || (hasReporter && hasStatus);
              }).length;
              const progress = r.hallsStatus.length > 0 ? (reportedCount / r.hallsStatus.length) * 100 : 0;
              return (
                <tr key={r.id} className="hover:bg-slate-50/50 transition-colors group">
                  <td className="px-4 md:px-8 py-5 whitespace-nowrap">
                    <span className="px-3 py-1 rounded-xl text-[10px] font-black text-white bg-indigo-500 whitespace-nowrap">{r.type}</span>
                  </td>
                  <td className="px-4 md:px-8 py-5 font-black text-slate-900 text-lg whitespace-nowrap">{r.name}</td>
                  <td className="px-4 md:px-8 py-5 text-sm font-medium text-slate-500 whitespace-nowrap">{new Date(r.createdAt).toLocaleString()}</td>
                  <td className="px-4 md:px-8 py-5 whitespace-nowrap">
                    <div className="flex items-center gap-2 min-w-[120px]">
                      <div className="flex-1 h-1.5 bg-slate-100 rounded-full">
                        <div className="h-full bg-indigo-500 rounded-full transition-all" style={{ width: `${progress}%` }}></div>
                      </div>
                      <span className="text-[10px] font-black text-slate-400">{reportedCount}/{r.hallsStatus.length}</span>
                    </div>
                  </td>
                  <td className="px-4 md:px-8 py-5 text-right whitespace-nowrap">
                    <button
                      onClick={async () => {
                        // 在切換視圖前重新載入資料以確保顯示最新資訊
                        const saved = await storageService.loadDisasterReports();
                        if (saved) {
                          const updated = saved.find(report => report.id === r.id);
                          setSelectedReport(updated || r);
                        } else {
                          setSelectedReport(r);
                        }
                        setView('DETAIL');
                      }}
                      className="inline-flex items-center gap-2 px-4 md:px-6 py-2 md:py-2.5 bg-white text-indigo-600 font-black rounded-2xl border border-indigo-100 shadow-sm hover:bg-indigo-50 transition-all text-sm md:text-base"
                    >
                      <Eye size={16} className="md:hidden" />
                      <span className="hidden md:inline">{t.actionView}</span>
                      <span className="md:hidden">檢視</span>
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
