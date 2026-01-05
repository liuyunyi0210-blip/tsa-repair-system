
import React, { useState, useEffect } from 'react';
import {
    Send,
    Trash2,
    Plus,
    Building2,
    Calendar,
    FileText,
    CheckCircle2,
    AlertCircle,
    Edit2,
    Camera,
    X,
    Image as ImageIcon
} from 'lucide-react';
import { MonthlyReport, Hall } from '../types';
import { MOCK_HALLS } from '../constants';
import { storageService } from '../services/storageService';
import { compressImage } from '../services/imageService';

interface MonthlyReportSubmissionProps {
    reports: MonthlyReport[];
    onSubmit: (reports: Omit<MonthlyReport, 'id' | 'createdAt' | 'updatedAt'>[]) => void;
    onUpdate: (id: string, updates: Partial<MonthlyReport>) => void;
}

const MonthlyReportSubmission: React.FC<MonthlyReportSubmissionProps> = ({ reports, onSubmit, onUpdate }) => {
    const [yearMonth, setYearMonth] = useState(new Date().toISOString().substring(0, 7));
    const [halls, setHalls] = useState<Hall[]>([]);
    const [submissionReports, setSubmissionReports] = useState<{ hallName: string; content: string; photoUrls: string[] }[]>([
        { hallName: '', content: '', photoUrls: [] }
    ]);

    useEffect(() => {
        const loadHalls = async () => {
            const savedHalls = await storageService.loadHalls();
            setHalls(savedHalls || MOCK_HALLS);
        };
        loadHalls();
    }, []);
    const [editingReportId, setEditingReportId] = useState<string | null>(null);
    const [editContent, setEditContent] = useState('');

    // 過濾目前使用者的近期回報
    const myRecentReports = reports.filter(r => !r.isDeleted).slice(0, 5);

    const startEditing = (report: MonthlyReport) => {
        setEditingReportId(report.id);
        setEditContent(report.content);
    };

    const handleUpdateExisting = async (id: string) => {
        if (!editContent.trim()) {
            alert('內容不能為空');
            return;
        }
        await onUpdate(id, { content: editContent });
        setEditingReportId(null);
        alert('報表內容已更新！');
    };

    const handleAddReport = () => {
        setSubmissionReports([...submissionReports, { hallName: '', content: '', photoUrls: [] }]);
    };

    const handleRemoveReport = (index: number) => {
        if (submissionReports.length > 1) {
            setSubmissionReports(submissionReports.filter((_, i) => i !== index));
        }
    };

    const handleUpdateReport = (index: number, field: string, value: any) => {
        const newReports = [...submissionReports];
        (newReports[index] as any)[field] = value;
        setSubmissionReports(newReports);
    };

    const handleFileChange = async (index: number, e: React.ChangeEvent<HTMLInputElement>) => {
        const files = e.target.files;
        if (files) {
            const fileList = Array.from(files) as File[];
            for (const file of fileList) {
                try {
                    const compressedBase64 = await compressImage(file);
                    const newReports = [...submissionReports];
                    newReports[index].photoUrls = [...newReports[index].photoUrls, compressedBase64];
                    setSubmissionReports(newReports);
                } catch (error) {
                    console.error('圖片壓縮失敗:', error);
                }
            }
        }
    };

    const removePhoto = (reportIndex: number, photoIndex: number) => {
        const newReports = [...submissionReports];
        newReports[reportIndex].photoUrls = newReports[reportIndex].photoUrls.filter((_, i) => i !== photoIndex);
        setSubmissionReports(newReports);
    };

    const handleSubmit = () => {
        const validReports = submissionReports.filter(r => r.hallName && r.content);
        if (validReports.length === 0) {
            alert('請填寫至少一個完整的會館月報表內容');
            return;
        }

        if (window.confirm(`確定要提交 ${validReports.length} 筆月報表嗎？`)) {
            onSubmit(validReports.map(r => ({
                ...r,
                yearMonth,
                reporter: '測試管理員' // 實際應用中應從登入資訊取得
            })));
            setSubmissionReports([{ hallName: '', content: '', photoUrls: [] }]);
        }
    };

    return (
        <div className="max-w-5xl mx-auto space-y-12 pb-20 animate-in fade-in slide-in-from-bottom-4">
            <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
                <div>
                    <h1 className="text-3xl font-black text-slate-900 tracking-tight">月報表回報</h1>
                    <p className="text-slate-500 font-medium">填寫並提交各會館的每月維護與營運工作摘要</p>
                </div>
                <div className="flex items-center gap-3 bg-white p-2 rounded-2xl shadow-sm border border-slate-200">
                    <Calendar className="text-indigo-600 ml-2" size={20} />
                    <input
                        type="month"
                        value={yearMonth}
                        onChange={(e) => setYearMonth(e.target.value)}
                        className="border-none focus:ring-0 font-bold text-slate-700 bg-transparent"
                    />
                </div>
            </div>

            {/* 近期回報查看區域 - 移動到上方 */}
            <div className="p-8 bg-slate-50 rounded-[40px] border border-slate-200/60">
                <h3 className="text-xl font-black text-slate-900 mb-6 flex items-center gap-2">
                    <CheckCircle2 className="text-emerald-500" />
                    您的近期回報紀錄
                </h3>
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                    {myRecentReports.length > 0 ? (
                        myRecentReports.map(report => (
                            <div key={report.id} className={`p-6 bg-white rounded-3xl border transition-all ${editingReportId === report.id ? 'ring-2 ring-indigo-500 border-transparent shadow-xl' : 'border-slate-100 shadow-sm hover:shadow-md'}`}>
                                <div className="flex items-center justify-between mb-3">
                                    <span className="text-[10px] font-black bg-slate-100 px-3 py-1 rounded-full text-slate-500">{report.yearMonth}</span>
                                    <div className="flex items-center gap-2">
                                        {editingReportId !== report.id && (
                                            <button
                                                onClick={() => startEditing(report)}
                                                className="p-1.5 text-slate-400 hover:text-indigo-600 hover:bg-indigo-50 rounded-lg transition-all"
                                                title="編輯內容"
                                            >
                                                <Edit2 size={14} />
                                            </button>
                                        )}
                                        <span className="text-[10px] font-bold text-slate-400">{new Date(report.createdAt).toLocaleDateString()}</span>
                                    </div>
                                </div>
                                <h4 className="font-black text-slate-800 mb-2">{report.hallName}</h4>

                                {editingReportId === report.id ? (
                                    <div className="space-y-3">
                                        <textarea
                                            className="w-full bg-slate-50 border border-slate-200 rounded-xl p-3 text-xs font-medium focus:ring-2 focus:ring-indigo-600 outline-none resize-none"
                                            rows={4}
                                            value={editContent}
                                            onChange={(e) => setEditContent(e.target.value)}
                                        />
                                        <div className="flex justify-end gap-2">
                                            <button
                                                onClick={() => setEditingReportId(null)}
                                                className="px-3 py-1.5 text-[10px] font-black text-slate-400"
                                            >
                                                取消
                                            </button>
                                            <button
                                                onClick={() => handleUpdateExisting(report.id)}
                                                className="px-4 py-1.5 bg-indigo-600 text-white rounded-lg text-[10px] font-black"
                                            >
                                                儲存更新
                                            </button>
                                        </div>
                                    </div>
                                ) : (
                                    <div className="space-y-3">
                                        <p className="text-xs text-slate-500 line-clamp-2">{report.content}</p>

                                        {report.photoUrls && report.photoUrls.length > 0 && (
                                            <div className="flex flex-wrap gap-2">
                                                {report.photoUrls.map((url, idx) => (
                                                    <div key={idx} className="w-12 h-12 rounded-lg overflow-hidden border border-slate-100 shadow-sm">
                                                        <img
                                                            src={url}
                                                            className="w-full h-full object-cover cursor-pointer hover:opacity-80 transition-opacity"
                                                            onClick={() => window.open(url, '_blank')}
                                                        />
                                                    </div>
                                                ))}
                                            </div>
                                        )}

                                        {report.managerRemark && (
                                            <div className="mt-3 pt-3 border-t border-slate-50">
                                                <p className="text-[10px] font-black text-indigo-600">主管回饋：</p>
                                                <p className="text-[10px] text-indigo-400 italic">{report.managerRemark}</p>
                                            </div>
                                        )}
                                    </div>
                                )}
                            </div>
                        ))
                    ) : (
                        <div className="col-span-full py-10 text-center bg-white/50 rounded-3xl border-2 border-dashed border-slate-200 text-slate-400 font-bold">
                            尚無近期回報紀錄
                        </div>
                    )}
                </div>
            </div>

            <div className="space-y-6">
                {submissionReports.map((report, index) => (
                    <div key={index} className="bg-white rounded-[32px] border-2 border-slate-100 shadow-sm hover:shadow-xl transition-all overflow-hidden group">
                        <div className="p-6 border-b border-slate-50 flex items-center justify-between bg-slate-50/50">
                            <div className="flex items-center gap-3">
                                <div className="w-10 h-10 rounded-xl bg-indigo-600 flex items-center justify-center text-white font-black">
                                    {index + 1}
                                </div>
                                <h3 className="font-black text-slate-700">區段內容撰寫</h3>
                            </div>
                            {submissionReports.length > 1 && (
                                <button
                                    onClick={() => handleRemoveReport(index)}
                                    className="p-2 text-rose-400 hover:bg-rose-50 rounded-xl transition-colors"
                                >
                                    <Trash2 size={18} />
                                </button>
                            )}
                        </div>

                        <div className="p-8 grid grid-cols-1 lg:grid-cols-12 gap-8">
                            <div className="lg:col-span-4 space-y-4">
                                <div className="space-y-2">
                                    <label className="text-xs font-black text-slate-400 uppercase tracking-widest flex items-center gap-2">
                                        <Building2 size={14} /> 選擇負責會館
                                    </label>
                                    <select
                                        value={report.hallName}
                                        onChange={(e) => handleUpdateReport(index, 'hallName', e.target.value)}
                                        className="w-full px-5 py-4 bg-slate-50 border-2 border-transparent focus:border-indigo-600 focus:bg-white rounded-2xl font-bold transition-all outline-none"
                                    >
                                        <option value="">-- 請選擇會館 --</option>
                                        {halls.map(hall => (
                                            <option key={hall.id} value={hall.name}>{hall.name}</option>
                                        ))}
                                    </select>
                                </div>

                                <div className="p-5 bg-indigo-50 rounded-2xl border border-indigo-100">
                                    <div className="flex items-center gap-2 text-indigo-700 mb-2">
                                        <AlertCircle size={16} />
                                        <span className="text-xs font-black">撰寫提示</span>
                                    </div>
                                    <ul className="text-xs text-indigo-600/80 space-y-1 font-medium list-disc pl-4">
                                        <li>本月重大維修項目總結</li>
                                        <li>設施運行狀況說明</li>
                                        <li>異常狀況與後續追蹤</li>
                                        <li>志工報修處理進度</li>
                                    </ul>
                                </div>
                            </div>

                            <div className="lg:col-span-8 space-y-4">
                                <div className="space-y-2">
                                    <label className="text-xs font-black text-slate-400 uppercase tracking-widest flex items-center gap-2">
                                        <FileText size={14} /> 回報內容詳述
                                    </label>
                                    <textarea
                                        rows={8}
                                        placeholder="請在此處撰寫該會館本月的詳細工作內容與報表摘要..."
                                        value={report.content}
                                        onChange={(e) => handleUpdateReport(index, 'content', e.target.value)}
                                        className="w-full px-6 py-5 bg-slate-50 border-2 border-transparent focus:border-indigo-600 focus:bg-white rounded-2xl font-medium transition-all outline-none resize-none"
                                    />
                                </div>

                                <div className="space-y-3">
                                    <label className="text-xs font-black text-slate-400 uppercase tracking-widest flex items-center gap-2">
                                        <Camera size={14} /> 現場照片上傳 ({report.photoUrls.length}/5)
                                    </label>

                                    <div className="grid grid-cols-2 md:grid-cols-5 gap-4">
                                        {report.photoUrls.map((url, pIdx) => (
                                            <div key={pIdx} className="relative aspect-square rounded-2xl overflow-hidden border-2 border-slate-100 group">
                                                <img src={url} className="w-full h-full object-cover" />
                                                <button
                                                    onClick={() => removePhoto(index, pIdx)}
                                                    className="absolute top-2 right-2 p-1.5 bg-rose-500 text-white rounded-xl opacity-0 group-hover:opacity-100 transition-all shadow-lg"
                                                >
                                                    <X size={14} />
                                                </button>
                                            </div>
                                        ))}

                                        {report.photoUrls.length < 5 && (
                                            <div className="relative aspect-square">
                                                <input
                                                    type="file"
                                                    accept="image/*"
                                                    multiple
                                                    onChange={(e) => handleFileChange(index, e)}
                                                    className="absolute inset-0 opacity-0 cursor-pointer z-10"
                                                />
                                                <div className="absolute inset-0 border-2 border-dashed border-slate-200 rounded-2xl flex flex-col items-center justify-center text-slate-400 group-hover:border-indigo-400 group-hover:text-indigo-600 transition-all">
                                                    <Plus size={24} />
                                                    <span className="text-[10px] font-black mt-1">新增照片</span>
                                                </div>
                                            </div>
                                        )}
                                    </div>
                                    <p className="text-[10px] text-slate-400 font-medium italic">提示：支援多張照片上傳，直接點擊「新增照片」按鈕即可。</p>
                                </div>
                            </div>
                        </div>
                    </div>
                ))}

                <button
                    onClick={handleAddReport}
                    className="w-full py-6 border-2 border-dashed border-slate-200 rounded-[32px] text-slate-400 font-black flex items-center justify-center gap-2 hover:bg-white hover:border-indigo-400 hover:text-indigo-600 transition-all group"
                >
                    <div className="p-2 bg-slate-100 group-hover:bg-indigo-100 rounded-xl transition-colors">
                        <Plus size={20} />
                    </div>
                    新增負責會館區塊
                </button>
            </div>

            <div className="flex justify-end pt-4">
                <button
                    onClick={handleSubmit}
                    className="px-12 py-5 bg-indigo-600 text-white font-black rounded-3xl shadow-2xl shadow-indigo-200 flex items-center gap-3 hover:bg-indigo-700 active:scale-95 transition-all"
                >
                    <Send size={20} />
                    提交所有月報表
                </button>
            </div>
        </div>

    );
};

export default MonthlyReportSubmission;
