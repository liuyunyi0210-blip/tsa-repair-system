
import React from 'react';
import { ArrowLeft, Shield } from 'lucide-react';

interface PrivacyPolicyProps {
    onBack?: () => void;
}

const PrivacyPolicy: React.FC<PrivacyPolicyProps> = ({ onBack }) => {
    return (
        <div className="max-w-4xl mx-auto py-8 px-4 font-['Inter','Noto_Sans_TC']">
            <div className="bg-white rounded-[32px] shadow-sm border border-slate-100 overflow-hidden">
                <div className="p-8 border-b border-slate-50 bg-slate-50/50 flex items-center justify-between">
                    <div className="flex items-center gap-4">
                        <div className="p-3 bg-indigo-600 text-white rounded-2xl shadow-lg shadow-indigo-100">
                            <Shield size={24} />
                        </div>
                        <div>
                            <h1 className="text-2xl font-black text-slate-900">隱私權政策</h1>
                            <p className="text-sm text-slate-500 font-bold uppercase tracking-widest mt-1">Privacy Policy</p>
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
                    <p className="text-slate-600 mb-6">歡迎使用「TSA會館修繕暨設施管理系統」（以下簡稱「本服務」）。本服務由 TSA 管理團隊提供。為了讓您能夠安心使用本服務的各項資訊及服務，特此向您說明本服務的隱私權保護政策，以保障您的權益，請您詳閱下列內容：</p>

                    <h2 className="text-lg font-black text-slate-800 mt-8 mb-4">一、隱私權保護政策的適用範圍</h2>
                    <p className="text-slate-600 mb-6">隱私權保護政策內容，包括本服務如何處理在您使用網頁/LINE 介面服務時收集到的個人識別資料。隱私權保護政策不適用於本服務以外的相關連結網站，也不適用於非本服務所委託或參與管理的人員。</p>

                    <h2 className="text-lg font-black text-slate-800 mt-8 mb-4">二、個人資料的收集、處理及利用方式</h2>
                    <ul className="list-disc pl-5 text-slate-600 space-y-3 mb-6">
                        <li>當您透過 LINE 登陸或使用本服務時，我們將視業務性質請您提供必要的個人資料，包括：LINE 顯示名稱、LINE 帳戶唯一識別碼（User ID）、個人頭像及您主動上傳的報修相關資訊（如文字描述、照片、位置資訊）。</li>
                        <li>我們將在特定目的範圍內處理及利用您的個人資料，主要用於：
                            <ul className="list-circle pl-5 mt-2 space-y-1">
                                <li>確認報修人員身份。</li>
                                <li>處理與追蹤維修工單。</li>
                                <li>提供 AI 故障分析與維護建議。</li>
                                <li>內部管理與統計分析。</li>
                            </ul>
                        </li>
                        <li>除非取得您的同意或其他法令之特別規定，本服務絕不會將您的個人資料揭露予第三人或使用於上述目的以外之其他用途。</li>
                    </ul>

                    <h2 className="text-lg font-black text-slate-800 mt-8 mb-4">三、資料之保護</h2>
                    <p className="text-slate-600 mb-6">本服務主機均設有防火牆、防毒系統等相關的各項資訊安全設備及必要的安全防護措施，加以保護網站及您的個人資料。採用嚴格的保護措施，只有經過授權的人員才能接觸您的個人資料。</p>

                    <h2 className="text-lg font-black text-slate-800 mt-8 mb-4">四、對外相關連結</h2>
                    <p className="text-slate-600 mb-6">本服務可能包含其他網站或服務（如 LINE 官方功能）的連結。當您點擊這些連結進入其他網站時，請參考該網站的隱私權保護政策，與本服務之隱私權保護政策無涉。</p>

                    <h2 className="text-lg font-black text-slate-800 mt-8 mb-4">五、Cookie 之使用</h2>
                    <p className="text-slate-600 mb-6">為了提供您最佳的服務，本服務可能會在您的瀏覽器或設備中放置並取用我們的 Cookie，若您不願接受 Cookie 的寫入，您可在您使用的瀏覽器或設備功能項中設定隱私權等級為高，即可拒絕 Cookie 的寫入，但可能會導至部分功能無法正常執行。</p>

                    <h2 className="text-lg font-black text-slate-800 mt-8 mb-4">六、隱私權保護政策之修正</h2>
                    <p className="text-slate-600 mb-6">本服務隱私權保護政策將因應需求隨時進行修正，修正後的條款將刊登於本服務介面中。</p>
                </div>

                <div className="p-8 bg-slate-50 border-t border-slate-100 flex justify-between items-center text-slate-400 text-xs font-bold">
                    <p>© 2026 TSA 台灣創價學會</p>
                    <p>最後更新日期：2026年1月3日</p>
                </div>
            </div>
        </div>
    );
};

export default PrivacyPolicy;
