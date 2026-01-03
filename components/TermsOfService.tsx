
import React from 'react';
import { ArrowLeft, FileText } from 'lucide-react';

interface TermsOfServiceProps {
    onBack?: () => void;
}

const TermsOfService: React.FC<TermsOfServiceProps> = ({ onBack }) => {
    return (
        <div className="max-w-4xl mx-auto py-8 px-4 font-['Inter','Noto_Sans_TC']">
            <div className="bg-white rounded-[32px] shadow-sm border border-slate-100 overflow-hidden">
                <div className="p-8 border-b border-slate-50 bg-slate-50/50 flex items-center justify-between">
                    <div className="flex items-center gap-4">
                        <div className="p-3 bg-indigo-600 text-white rounded-2xl shadow-lg shadow-indigo-100">
                            <FileText size={24} />
                        </div>
                        <div>
                            <h1 className="text-2xl font-black text-slate-900">服務條款</h1>
                            <p className="text-sm text-slate-500 font-bold uppercase tracking-widest mt-1">Terms of Service</p>
                        </div>
                    </div>
                    {onBack && (
                        <button
                            onClick={onBack}
                            className="px-4 py-2 bg-white border border-slate-200 rounded-xl text-slate-600 font-bold text-sm hover:bg-slate-50 transition-all flex items-center gap-2"
                        >
                            <ArrowLeft size={16} />
                            返回
                        </button>
                    )}
                </div>

                <div className="p-10 prose prose-slate max-w-none">
                    <p className="text-slate-600 mb-6">歡迎您使用「TSA會館修繕暨設施管理系統」（以下簡稱「本服務」）。在使用本服務前，請仔細閱讀以下條款。當您開始使用本服務，即視為您已同意並接受本條款之所有內容。</p>

                    <h2 className="text-lg font-black text-slate-800 mt-8 mb-4">一、服務內容</h2>
                    <p className="text-slate-600 mb-6">本服務提供 TSA 會館設施報修、例行性維護記錄、設備管理及 AI 故障診斷分析功能。本服務旨在協助 TSA 管理團隊與志工維持會館設施之運作。</p>

                    <h2 className="text-lg font-black text-slate-800 mt-8 mb-4">二、使用者責任與義務</h2>
                    <ul className="list-disc pl-5 text-slate-600 space-y-3 mb-6">
                        <li>使用者應保證所提供之個人資料及報修資訊內容真實及正確。</li>
                        <li>嚴禁利用本服務發布違法、侵權、騷擾或不實資訊。</li>
                        <li>使用者應妥善保管其 LINE 帳號，任何使用該帳號進行之行為皆視為使用者本人之行為。</li>
                    </ul>

                    <h2 className="text-lg font-black text-slate-800 mt-8 mb-4">三、權利與限制</h2>
                    <ul className="list-disc pl-5 text-slate-600 space-y-3 mb-6">
                        <li>本服務之所有內容（包括軟體、圖片、文字等）版權歸 TSA 團隊或相關授權人所有。</li>
                        <li>我們保留隨時修改、暫停或終止本服務部分或全部功能之權利，且不需事先通知。</li>
                    </ul>

                    <h2 className="text-lg font-black text-slate-800 mt-8 mb-4">四、免責聲明</h2>
                    <ul className="list-disc pl-5 text-slate-600 space-y-3 mb-6">
                        <li>本服務提供之 AI 診斷建議僅供參考，不代表最終維修判斷。使用者應依實際專業判斷進行處理。</li>
                        <li>對於因不可抗力、網路問題或不可歸責於本服務之事由導致的資料遺失 or 服務中斷，本服務不負賠償責任。</li>
                    </ul>

                    <h2 className="text-lg font-black text-slate-800 mt-8 mb-4">五、法律適用與管轄</h2>
                    <p className="text-slate-600 mb-6">本服務條款之解釋與適用，悉依中華民國相關法律辦理。如有爭議，以台灣台北地方法院為第一審管轄法院。</p>
                </div>

                <div className="p-8 bg-slate-50 border-t border-slate-100 flex justify-between items-center text-slate-400 text-xs font-bold">
                    <p>© 2026 TSA 台灣創價學會</p>
                    <p>最後更新日期：2026年1月3日</p>
                </div>
            </div>
        </div>
    );
};

export default TermsOfService;
