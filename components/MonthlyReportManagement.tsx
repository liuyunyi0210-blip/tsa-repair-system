
import React, { useState } from 'react';
import {
    Search,
    Calendar,
    Building2,
    FileText,
    User,
    Trash2,
    MoreVertical,
    ChevronRight,
    Filter,
    Download
} from 'lucide-react';
import { Document, Packer, Paragraph, Table, TableRow, TableCell, WidthType, AlignmentType, ImageRun, Media, TableLayoutType } from 'docx';
import { MonthlyReport } from '../types';

interface MonthlyReportManagementProps {
    reports: MonthlyReport[];
    onDelete: (id: string) => void;
    onUpdate: (id: string, updates: Partial<MonthlyReport>) => void;
}

const MonthlyReportManagement: React.FC<MonthlyReportManagementProps> = ({ reports, onDelete, onUpdate }) => {
    const [searchTerm, setSearchTerm] = useState('');
    const [filterMonth, setFilterMonth] = useState('');
    const [selectedIds, setSelectedIds] = useState<string[]>([]);
    const [editingRemarkId, setEditingRemarkId] = useState<string | null>(null);
    const [tempRemark, setTempRemark] = useState('');

    const filteredReports = reports.filter(r =>
        !r.isDeleted &&
        (r.hallName.toLowerCase().includes(searchTerm.toLowerCase()) ||
            r.content.toLowerCase().includes(searchTerm.toLowerCase())) &&
        (filterMonth === '' || r.yearMonth === filterMonth)
    ).sort((a, b) => b.createdAt.localeCompare(a.createdAt));

    const toggleSelect = (id: string) => {
        setSelectedIds(prev =>
            prev.includes(id) ? prev.filter(i => i !== id) : [...prev, id]
        );
    };

    const toggleSelectAll = () => {
        if (selectedIds.length === filteredReports.length) {
            setSelectedIds([]);
        } else {
            setSelectedIds(filteredReports.map(r => r.id));
        }
    };

    const generateWord = async (selectedReports: MonthlyReport[]) => {
        if (selectedReports.length === 0) return;

        const reporters = Array.from(new Set(selectedReports.map(r => r.reporter)));
        const reporterDisplay = reporters.join(', ');
        const monthDisplay = selectedReports[0].yearMonth;

        // 使用絕對寬度（twips）確保在 Pages 和 Word 中都能正確顯示
        // 1 cm = 567 twips，使用稍大的值確保不會太窄
        // A4 紙寬度約 11906 twips (21cm)，減去左右邊距 1440 twips (1 inch * 2) = 10026 twips 可用
        // 設置欄寬：4cm / 12cm / 6cm (比原本稍大，確保不會太窄)
        const col1Width = 4 * 567;   // 4cm = 2268 twips
        const col2Width = 12 * 567;  // 12cm = 6804 twips
        const col3Width = 6 * 567;    // 6cm = 3402 twips
        const totalTableWidth = col1Width + col2Width + col3Width; // 12474 twips

        // 處理圖片：將 base64 轉換為可以嵌入的格式
        const processImage = async (url: string): Promise<ImageRun | null> => {
            if (!url.startsWith('data:image')) {
                return null; // 外部 URL 無法直接嵌入
            }

            try {
                // 提取 base64 數據和圖片類型
                const matches = url.match(/^data:image\/(\w+);base64,(.+)$/);
                if (!matches) return null;
                
                const imageType = matches[1];
                const base64Data = matches[2];
                
                // 轉換 base64 為 Buffer (Uint8Array)
                const binaryString = atob(base64Data);
                const bytes = new Uint8Array(binaryString.length);
                for (let i = 0; i < binaryString.length; i++) {
                    bytes[i] = binaryString.charCodeAt(i);
                }

                // 創建圖片，設置適當的尺寸（約 3cm 寬度，保持比例）
                // 3cm ≈ 113 pixels (96 DPI) 或 85 points
                return new ImageRun({
                    data: bytes,
                    transformation: {
                        width: 340,  // 約 3cm (1cm = 113 pixels)
                        height: 340, // 保持正方形，或根據實際圖片比例調整
                    },
                });
            } catch (e) {
                console.error('處理圖片失敗:', e);
                return null;
            }
        };

        // 創建表格行
        const tableRows = [
            // 表頭
            new TableRow({
                children: [
                    new TableCell({
                        children: [new Paragraph({
                            text: '會館',
                            alignment: AlignmentType.CENTER,
                        })],
                        width: { size: col1Width, type: WidthType.DXA },
                        shading: { fill: 'FFFFFF' },
                    }),
                    new TableCell({
                        children: [new Paragraph({
                            text: '回報內容（包含照片）',
                            alignment: AlignmentType.CENTER,
                        })],
                        width: { size: col2Width, type: WidthType.DXA },
                        shading: { fill: 'FFFFFF' },
                    }),
                    new TableCell({
                        children: [new Paragraph({
                            text: '主管備注',
                            alignment: AlignmentType.CENTER,
                        })],
                        width: { size: col3Width, type: WidthType.DXA },
                        shading: { fill: 'FFFFFF' },
                    }),
                ],
            }),
            // 資料行
            ...await Promise.all(selectedReports.map(async (r) => {
                const contentParagraphs: Paragraph[] = [
                    new Paragraph({
                        text: r.content,
                        alignment: AlignmentType.LEFT,
                    }),
                ];

                if (r.photoUrls && r.photoUrls.length > 0) {
                    contentParagraphs.push(
                        new Paragraph({
                            text: '現場照片回報：',
                            alignment: AlignmentType.LEFT,
                            spacing: { before: 200 },
                        })
                    );
                    
                    // 處理每張照片
                    for (let idx = 0; idx < r.photoUrls.length; idx++) {
                        const url = r.photoUrls[idx];
                        const imageRun = await processImage(url);
                        
                        if (imageRun) {
                            // 嵌入圖片
                            contentParagraphs.push(
                                new Paragraph({
                                    children: [imageRun],
                                    alignment: AlignmentType.LEFT,
                                    spacing: { before: 100 },
                                })
                            );
                        } else {
                            // 如果無法嵌入，顯示文字說明
                            const photoInfo = url.startsWith('data:image') 
                                ? `照片 ${idx + 1}（已上傳）`
                                : `照片 ${idx + 1}: ${url}`;
                            contentParagraphs.push(
                                new Paragraph({
                                    text: photoInfo,
                                    alignment: AlignmentType.LEFT,
                                    spacing: { before: 100 },
                                })
                            );
                        }
                    }
                }

                return new TableRow({
                    children: [
                        new TableCell({
                            children: [new Paragraph({
                                text: r.hallName,
                                alignment: AlignmentType.CENTER,
                            })],
                            width: { size: col1Width, type: WidthType.DXA },
                        }),
                        new TableCell({
                            children: contentParagraphs,
                            width: { size: col2Width, type: WidthType.DXA },
                        }),
                        new TableCell({
                            children: [new Paragraph({
                                text: r.managerRemark || '',
                                alignment: AlignmentType.LEFT,
                            })],
                            width: { size: col3Width, type: WidthType.DXA },
                        }),
                    ],
                });
            })),
        ];

        // 創建 Word 文件
        // 設置頁面邊距，確保表格有足夠空間且能在 Pages 中正確顯示
        const doc = new Document({
            sections: [{
                properties: {
                    page: {
                        margin: {
                            top: 1440, // 1 inch = 1440 twips
                            right: 720, // 0.5 inch
                            bottom: 1440,
                            left: 720, // 0.5 inch
                        },
                    },
                },
                children: [
                    // 標題
                    new Paragraph({
                        text: `月報表 ${monthDisplay}`,
                        alignment: AlignmentType.CENTER,
                        spacing: { after: 400 },
                        heading: 'Heading1',
                    }),
                    // 表格（使用固定佈局和欄寬，確保在 Pages 和 Word 中都能正確顯示）
                    new Table({
                        rows: tableRows,
                        width: {
                            size: totalTableWidth,
                            type: WidthType.DXA,
                        },
                        columnWidths: [col1Width, col2Width, col3Width], // 設置每欄的固定寬度
                        layout: TableLayoutType.FIXED, // 使用固定佈局
                    }),
                ],
            }],
        });

        // 生成並下載文件
        const blob = await Packer.toBlob(doc);
        const url = URL.createObjectURL(blob);
        const link = document.createElement('a');
        link.href = url;
        link.download = `管理局月報表_${monthDisplay}.docx`;
        document.body.appendChild(link);
        link.click();
        document.body.removeChild(link);
        URL.revokeObjectURL(url);
    };

    const handleExportSelected = async () => {
        if (selectedIds.length === 0) {
            alert('請先勾選要匯出的報表');
            return;
        }
        const selectedReports = reports.filter(r => selectedIds.includes(r.id));
        await generateWord(selectedReports);
    };

    const handleExportAll = async () => {
        if (filteredReports.length === 0) {
            alert('目前沒有可以匯出的報表');
            return;
        }
        await generateWord(filteredReports);
    };

    const startEditingRemark = (report: MonthlyReport) => {
        setEditingRemarkId(report.id);
        setTempRemark(report.managerRemark || '');
    };

    const saveRemark = (id: string) => {
        onUpdate(id, { managerRemark: tempRemark });
        setEditingRemarkId(null);
    };

    return (
        <div className="space-y-8 animate-in fade-in">
            <div className="flex flex-col md:flex-row md:items-center justify-between gap-6">
                <div>
                    <h1 className="text-3xl font-black text-slate-900 tracking-tight">月報表管理</h1>
                    <p className="text-slate-500 font-medium">查看、搜尋與管理所有已提交的會館月報表紀錄</p>
                </div>
                <div className="flex items-center gap-3">
                    <button
                        onClick={handleExportSelected}
                        disabled={selectedIds.length === 0}
                        className="flex items-center gap-2 px-6 py-3 bg-white border border-slate-200 rounded-2xl font-black text-slate-600 hover:bg-slate-50 transition-all shadow-sm disabled:opacity-30"
                    >
                        <Download size={18} />
                        匯出所選 ({selectedIds.length})
                    </button>
                    <button
                        onClick={handleExportAll}
                        className="flex items-center gap-2 px-6 py-3 bg-indigo-600 text-white rounded-2xl font-black hover:bg-indigo-700 transition-all shadow-lg shadow-indigo-100"
                    >
                        <Download size={18} />
                        匯出所有
                    </button>
                </div>
            </div>

            <div className="flex flex-col md:flex-row gap-4">
                <div className="flex-1 relative">
                    <Search className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400" size={18} />
                    <input
                        type="text"
                        placeholder="搜尋會館名稱或報表內容..."
                        value={searchTerm}
                        onChange={(e) => setSearchTerm(e.target.value)}
                        className="w-full pl-12 pr-4 py-4 bg-white border border-slate-200 rounded-2xl focus:ring-2 focus:ring-indigo-600 focus:border-transparent outline-none font-medium transition-all"
                    />
                </div>
                <div className="flex items-center gap-2 bg-white border border-slate-200 px-4 py-4 rounded-2xl">
                    <Filter size={18} className="text-slate-400" />
                    <input
                        type="month"
                        value={filterMonth}
                        onChange={(e) => setFilterMonth(e.target.value)}
                        className="border-none focus:ring-0 font-bold text-slate-700 bg-transparent text-sm"
                    />
                    {filterMonth && (
                        <button onClick={() => setFilterMonth('')} className="text-xs font-bold text-indigo-600 hover:text-indigo-700">清除</button>
                    )}
                </div>
            </div>

            <div className="flex items-center justify-between px-6 py-2 bg-slate-100/50 rounded-2xl border border-slate-100">
                <label className="flex items-center gap-3 cursor-pointer">
                    <input
                        type="checkbox"
                        className="w-5 h-5 rounded-lg accent-indigo-600"
                        checked={filteredReports.length > 0 && selectedIds.length === filteredReports.length}
                        onChange={toggleSelectAll}
                    />
                    <span className="text-xs font-black text-slate-500 uppercase tracking-widest">全選現有報表</span>
                </label>
                <span className="text-[10px] font-black text-slate-400 uppercase tracking-widest">共 {filteredReports.length} 筆資料</span>
            </div>

            <div className="grid grid-cols-1 gap-6">
                {filteredReports.length > 0 ? (
                    filteredReports.map((report) => (
                        <div key={report.id} className={`bg-white rounded-[32px] border transition-all group relative ${selectedIds.includes(report.id) ? 'border-indigo-600 bg-indigo-50/5' : 'border-slate-200 p-6 hover:shadow-xl hover:border-indigo-100'}`}>
                            <div className="flex gap-6 p-6">
                                {/* Checkbox area */}
                                <div className="pt-1">
                                    <input
                                        type="checkbox"
                                        className="w-6 h-6 rounded-xl accent-indigo-600 cursor-pointer"
                                        checked={selectedIds.includes(report.id)}
                                        onChange={() => toggleSelect(report.id)}
                                    />
                                </div>

                                <div className="flex-1 space-y-6">
                                    <div className="flex items-start justify-between">
                                        <div className="flex items-center gap-3">
                                            <span className="px-4 py-1.5 bg-indigo-50 text-indigo-700 rounded-full text-xs font-black ring-1 ring-indigo-100">
                                                {report.yearMonth}
                                            </span>
                                            <h3 className="text-xl font-black text-slate-900 flex items-center gap-2">
                                                <Building2 size={20} className="text-slate-400" />
                                                {report.hallName}
                                            </h3>
                                        </div>
                                        <div className="flex items-center gap-2">
                                            <button
                                                onClick={() => {
                                                    if (window.confirm('確定要刪除此報表嗎？')) {
                                                        onDelete(report.id);
                                                    }
                                                }}
                                                className="p-3 text-rose-400 hover:bg-rose-50 rounded-2xl transition-colors"
                                            >
                                                <Trash2 size={18} />
                                            </button>
                                        </div>
                                    </div>

                                    <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                                        <div className="space-y-4">
                                            <div className="bg-slate-50/50 p-6 rounded-[24px] border border-slate-100">
                                                <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest mb-3 block">回報內容</label>
                                                <p className="text-slate-600 leading-relaxed font-medium whitespace-pre-wrap">
                                                    {report.content}
                                                </p>
                                            </div>

                                            {report.photoUrls && report.photoUrls.length > 0 && (
                                                <div className="space-y-3">
                                                    <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest block">附帶現場照片</label>
                                                    <div className="flex flex-wrap gap-3">
                                                        {report.photoUrls.map((url, idx) => (
                                                            <div key={idx} className="w-24 h-24 rounded-2xl overflow-hidden border border-slate-200 shadow-sm hover:scale-105 transition-transform cursor-pointer">
                                                                <img
                                                                    src={url}
                                                                    className="w-full h-full object-cover"
                                                                    onClick={() => window.open(url, '_blank')}
                                                                />
                                                            </div>
                                                        ))}
                                                    </div>
                                                </div>
                                            )}
                                        </div>

                                        <div className={`p-6 rounded-[24px] border border-dashed transition-all ${editingRemarkId === report.id ? 'bg-indigo-50/30 border-indigo-300' : 'bg-white border-slate-200'}`}>
                                            <div className="flex items-center justify-between mb-3">
                                                <label className="text-[10px] font-black text-indigo-600 uppercase tracking-widest block">主管備註/回饋項目</label>
                                                {editingRemarkId !== report.id && (
                                                    <button
                                                        onClick={() => startEditingRemark(report)}
                                                        className="text-[10px] font-black text-indigo-400 hover:text-indigo-600"
                                                    >
                                                        {report.managerRemark ? '編輯備註' : '+ 新增備註'}
                                                    </button>
                                                )}
                                            </div>

                                            {editingRemarkId === report.id ? (
                                                <div className="space-y-3">
                                                    <textarea
                                                        className="w-full bg-white border border-indigo-200 rounded-xl p-3 text-sm font-medium focus:ring-2 focus:ring-indigo-600 outline-none"
                                                        rows={3}
                                                        value={tempRemark}
                                                        onChange={(e) => setTempRemark(e.target.value)}
                                                        placeholder="請輸入主管回饋內容..."
                                                    />
                                                    <div className="flex justify-end gap-2">
                                                        <button
                                                            onClick={() => setEditingRemarkId(null)}
                                                            className="px-3 py-1.5 text-xs font-black text-slate-400"
                                                        >
                                                            取消
                                                        </button>
                                                        <button
                                                            onClick={() => saveRemark(report.id)}
                                                            className="px-4 py-1.5 bg-indigo-600 text-white rounded-lg text-xs font-black"
                                                        >
                                                            儲存備註
                                                        </button>
                                                    </div>
                                                </div>
                                            ) : (
                                                <p className={`text-sm font-medium italic ${report.managerRemark ? 'text-slate-700' : 'text-slate-300'}`}>
                                                    {report.managerRemark || '尚無主管備註...'}
                                                </p>
                                            )}
                                        </div>
                                    </div>

                                    <div className="flex flex-wrap items-center gap-6 text-sm pt-4 border-t border-slate-50">
                                        <div className="flex items-center gap-2 text-slate-400 font-bold">
                                            <User size={16} />
                                            提報者：{report.reporter}
                                        </div>
                                        <div className="flex items-center gap-2 text-slate-400 font-bold">
                                            <Calendar size={16} />
                                            提報時間：{new Date(report.createdAt).toLocaleString()}
                                        </div>
                                    </div>
                                </div>
                            </div>
                        </div>
                    ))
                ) : (
                    <div className="py-24 text-center bg-white rounded-[40px] border-2 border-dashed border-slate-100">
                        <div className="w-24 h-24 bg-slate-50 rounded-full flex items-center justify-center mx-auto mb-6">
                            <FileText size={40} className="text-slate-300" />
                        </div>
                        <h4 className="text-xl font-black text-slate-900 mb-2">尚無報表資料</h4>
                        <p className="text-slate-400 font-medium whitespace-pre-line">
                            目前沒有符合過濾條件的月報表紀錄，{"\n"}請更換關鍵字或選擇其他月份。
                        </p>
                    </div>
                )}
            </div>
        </div>
    );
};

export default MonthlyReportManagement;
