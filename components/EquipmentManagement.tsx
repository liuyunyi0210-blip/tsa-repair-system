
import React, { useState, useEffect } from 'react';
import { 
  PackagePlus, 
  RefreshCw, 
  History, 
  Search, 
  ArrowLeft, 
  Camera, 
  Upload, 
  Save, 
  X, 
  ChevronRight,
  Download,
  QrCode,
  ShieldCheck,
  ShieldAlert,
  MapPin,
  Trash2,
  Printer,
  Image as ImageIcon
} from 'lucide-react';
import { MOCK_HALLS, EQUIPMENT_CODES, EQUIPMENT_CATEGORIES } from '../constants';
import { Equipment, EquipmentChange, EquipmentChangeType, Language } from '../types';
import { storageService } from '../services/storageService';

interface EquipmentManagementProps {
  onDirtyChange?: (isDirty: boolean) => void;
  language: Language;
}

const EquipmentManagement: React.FC<EquipmentManagementProps> = ({ onDirtyChange, language }) => {
  const [view, setView] = useState<'HOME' | 'ADD' | 'CHANGE' | 'HISTORY' | 'LIST'>('HOME');
  const [equipments, setEquipments] = useState<Equipment[]>([]);
  const [changes, setChanges] = useState<EquipmentChange[]>([]);
  const [prefilledData, setPrefilledData] = useState<Partial<Equipment> | null>(null);
  const [initialChangeMode, setInitialChangeMode] = useState<'TRANSFER' | 'SCRAP'>('TRANSFER');
  const [showQrModal, setShowQrModal] = useState<string | null>(null);

  const translations = {
    [Language.ZH]: {
      addTitle: '新增會館設施', addDesc: '建立新資產檔案，自動計算購入批次序號',
      listTitle: '會館設施管理、查詢', listDesc: '完整資產清單、移動位置與標籤列印',
      historyTitle: '異動歷史查詢', historyDesc: '追蹤所有設施的流向與變動紀錄',
      enter: '進入功能',
      hallLabel: '會館別', locLabel: '位置 (如: 3F講堂)', prodName: '品名',
      modelLabel: '型號', qtyLabel: '數量', buyDate: '購買日期', priceLabel: '價格',
      warranty: '保固年限', photoLabel: '品項照片', uploadBtn: '拍攝或上傳照片',
      saveBtn: '保存設施並生成標籤', cancel: '取消',
      transfer: '移動位置', scrap: '報廢', reason: '原因說明', reporter: '經辦人/提報人',
      saveChange: '保存變動', historyHeader: ['執行日期', '類型', '設施型號', '來源會館', '目的會館', '提報人'],
      qrPrint: '設施標籤列印', qrBtn: '列印標籤', noData: '尚未建立任何資產設施資料',
      warrantyOk: '保固中', warrantyEnd: '已過期'
    },
    [Language.JA]: {
      addTitle: '施設備品追加', addDesc: '新しい資産ファイルを作成し、ロット番号を自動計算',
      listTitle: '施設備品管理・検索', listDesc: '全資産リスト、設置場所変更、ラベル印刷',
      historyTitle: '異動履歴検索', historyDesc: 'すべての設備の移動と変更履歴を追跡',
      enter: '機能へ',
      hallLabel: '会館', locLabel: '場所 (例: 3F講堂)', prodName: '品名',
      modelLabel: '型式', qtyLabel: '数量', buyDate: '購入日', priceLabel: '価格',
      warranty: '保証期間', photoLabel: '写真', uploadBtn: '写真を撮影・アップロード',
      saveBtn: 'データを保存しラベル生成', cancel: 'キャンセル',
      transfer: '設置場所変更', scrap: '廃棄', reason: '理由', reporter: '担当者',
      saveChange: '変更を保存', historyHeader: ['日付', 'タイプ', '型式', '元会館', '移動先', '報告者'],
      qrPrint: '設備ラベル印刷', qrBtn: 'ラベル印刷', noData: '資産データが登録されていません',
      warrantyOk: '保証内', warrantyEnd: '保証切れ'
    }
  };

  const t = translations[language];

  useEffect(() => {
    if (onDirtyChange) onDirtyChange(view === 'ADD' || view === 'CHANGE');
  }, [view, onDirtyChange]);

  useEffect(() => {
    const loadData = async () => {
      const savedEquip = await storageService.loadEquipments();
      const savedChanges = await storageService.loadEquipmentChanges();
      if (savedEquip) setEquipments(savedEquip);
      if (savedChanges) setChanges(savedChanges);
    };
    loadData();
  }, []);

  const saveEquip = async (data: Equipment[]) => {
    setEquipments(data);
    await storageService.saveEquipments(data);
  };

  const saveChange = async (data: EquipmentChange[]) => {
    setChanges(data);
    await storageService.saveEquipmentChanges(data);
  };

  const isWarrantyValid = (purchaseDate: string, years: number) => {
    const pDate = new Date(purchaseDate);
    const expireDate = new Date(pDate.setFullYear(pDate.getFullYear() + years));
    return expireDate > new Date();
  };

  const generateId = (hallName: string, productName: string, purchaseDate: string, currentEquipments: Equipment[]) => {
    const hallPrefix = hallName.substring(0, 2);
    const itemCode = EQUIPMENT_CODES[productName] || '999';
    const year = new Date(purchaseDate).getFullYear();
    const idPrefix = `${hallPrefix}-${itemCode}-${year}-`;
    const sameBatchEquipments = currentEquipments.filter(eq => eq.id.startsWith(idPrefix));
    let nextBatchNumber = 1;
    if (sameBatchEquipments.length > 0) {
      const batchNumbers = sameBatchEquipments.map(eq => {
        const parts = eq.id.split('-');
        return parseInt(parts[parts.length - 1], 10) || 0;
      });
      nextBatchNumber = Math.max(...batchNumbers) + 1;
    }
    return `${idPrefix}${nextBatchNumber}`;
  };

  const Home = () => (
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8 animate-in fade-in">
      {[
        { id: 'ADD', title: t.addTitle, desc: t.addDesc, icon: <PackagePlus size={48} />, color: 'bg-indigo-600' },
        { id: 'LIST', title: t.listTitle, desc: t.listDesc, icon: <Search size={48} />, color: 'bg-slate-700' },
        { id: 'HISTORY', title: t.historyTitle, desc: t.historyDesc, icon: <History size={48} />, color: 'bg-emerald-500' },
      ].map(card => (
        <button key={card.id} onClick={() => setView(card.id as any)} className="bg-white p-8 rounded-[40px] border border-slate-200 shadow-sm hover:shadow-2xl hover:-translate-y-1 transition-all text-left flex flex-col gap-6 group">
          <div className={`p-6 rounded-3xl text-white shadow-lg ${card.color} group-hover:scale-110 transition-transform w-fit`}>{card.icon}</div>
          <div className="flex-1"><h3 className="text-2xl font-black text-slate-900 mb-2">{card.title}</h3><p className="text-slate-500 font-medium leading-relaxed">{card.desc}</p></div>
          <div className="flex items-center gap-2 text-indigo-600 font-black text-sm uppercase tracking-widest mt-auto">{t.enter} <ChevronRight size={18} /></div>
        </button>
      ))}
    </div>
  );

  const AddForm = () => {
    const [form, setForm] = useState<Partial<Equipment>>({
      hallName: MOCK_HALLS[0].name, location: '', category: '一般', productName: Object.keys(EQUIPMENT_CODES)[0], model: '',
      quantity: 1, purchaseDate: new Date().toISOString().split('T')[0], price: 0, warrantyYears: 1, photoUrl: ''
    });
    const handleSubmit = async (e: React.FormEvent) => {
      e.preventDefault();
      const id = generateId(form.hallName!, form.productName!, form.purchaseDate!, equipments);
      await saveEquip([{...form as Equipment, id, createdAt: new Date().toISOString()}, ...equipments]);
      setView('HOME');
    };
    return (
      <div className="max-w-4xl mx-auto space-y-8 animate-in slide-in-from-bottom-10 pb-20">
        <div className="bg-white p-8 rounded-[40px] border border-slate-200 shadow-xl space-y-8">
          <div className="flex items-center justify-between border-b border-slate-100 pb-6"><h2 className="text-2xl font-black text-slate-900 flex items-center gap-3"><PackagePlus className="text-indigo-600" /> {t.addTitle}</h2><button onClick={() => setView('HOME')} className="p-2 hover:bg-slate-100 rounded-full text-slate-400"><X /></button></div>
          <form onSubmit={handleSubmit} className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div className="space-y-1"><label className="text-[10px] font-black text-slate-400 uppercase">{t.hallLabel} *</label><select className="w-full px-4 py-3 bg-slate-50 border border-slate-100 rounded-2xl" value={form.hallName} onChange={e => setForm({...form, hallName: e.target.value})}>{MOCK_HALLS.map(h => <option key={h.id} value={h.name}>{h.name}</option>)}</select></div>
            <div className="space-y-1"><label className="text-[10px] font-black text-slate-400 uppercase">{t.locLabel} *</label><input required className="w-full px-4 py-3 bg-slate-50 border border-slate-100 rounded-2xl" value={form.location} onChange={e => setForm({...form, location: e.target.value})} /></div>
            <div className="space-y-1"><label className="text-[10px] font-black text-slate-400 uppercase">{t.prodName} *</label><select className="w-full px-4 py-3 bg-slate-50 border border-slate-100 rounded-2xl" value={form.productName} onChange={e => setForm({...form, productName: e.target.value})}>{Object.keys(EQUIPMENT_CODES).map(name => <option key={name} value={name}>{name}</option>)}</select></div>
            <div className="space-y-1"><label className="text-[10px] font-black text-slate-400 uppercase">{t.modelLabel} *</label><input required className="w-full px-4 py-3 bg-slate-50 border border-slate-100 rounded-2xl" value={form.model} onChange={e => setForm({...form, model: e.target.value})} /></div>
            <div className="space-y-1"><label className="text-[10px] font-black text-slate-400 uppercase">{t.buyDate} *</label><input required type="date" className="w-full px-4 py-3 bg-slate-50 border border-slate-100 rounded-2xl" value={form.purchaseDate} onChange={e => setForm({...form, purchaseDate: e.target.value})} /></div>
            <div className="space-y-1"><label className="text-[10px] font-black text-slate-400 uppercase">{t.priceLabel} *</label><input required type="number" className="w-full px-4 py-3 bg-slate-50 border border-slate-100 rounded-2xl" value={form.price} onChange={e => setForm({...form, price: parseInt(e.target.value)})} /></div>
            <div className="md:col-span-2 pt-6 flex gap-4"><button type="submit" className="flex-1 bg-indigo-600 text-white font-black py-4 rounded-3xl shadow-xl hover:bg-indigo-700 transition-all">{t.saveBtn}</button><button type="button" onClick={() => setView('HOME')} className="px-10 bg-white text-slate-500 font-bold py-4 rounded-3xl border border-slate-200">{t.cancel}</button></div>
          </form>
        </div>
      </div>
    );
  };

  const ListView = () => (
    <div className="space-y-6 animate-in fade-in duration-500 pb-20">
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4"><h2 className="text-2xl font-black text-slate-900 flex items-center gap-3"><Search className="text-slate-700" /> {t.listTitle}</h2><button onClick={() => setView('HOME')} className="flex items-center gap-2 px-4 py-2 text-slate-500 hover:bg-white rounded-xl border border-transparent hover:border-slate-200 transition-all"><ArrowLeft size={18} /> {t.cancel}</button></div>
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
        {equipments.map(eq => (
          <div key={eq.id} className="bg-white p-6 rounded-3xl border border-slate-200 shadow-sm flex flex-col sm:flex-row gap-6 hover:shadow-md transition-shadow">
            <div className="w-full sm:w-32 h-32 bg-slate-100 rounded-2xl flex flex-col items-center justify-center text-slate-300 relative overflow-hidden group">{eq.photoUrl ? <img src={eq.photoUrl} className="w-full h-full object-cover" /> : <ImageIcon size={40} className="opacity-20" />}</div>
            <div className="flex-1 space-y-2">
              <div className="flex items-center justify-between"><span className="text-[10px] font-black text-indigo-600 bg-indigo-50 px-2 py-0.5 rounded-lg">{eq.id}</span><span className={`flex items-center gap-1 text-[10px] font-black px-2 py-0.5 rounded-lg ${isWarrantyValid(eq.purchaseDate, eq.warrantyYears) ? 'bg-emerald-50 text-emerald-600' : 'bg-rose-50 text-rose-600'}`}>{isWarrantyValid(eq.purchaseDate, eq.warrantyYears) ? t.warrantyOk : t.warrantyEnd}</span></div>
              <h3 className="text-lg font-black text-slate-900 leading-none">{eq.productName} <span className="text-slate-400 font-medium text-sm">({eq.model})</span></h3>
              <p className="text-xs font-medium text-slate-500">{eq.hallName} • {eq.location}</p>
              <div className="pt-2 flex flex-wrap gap-2">
                <button onClick={() => {setPrefilledData(eq); setInitialChangeMode('TRANSFER'); setView('CHANGE');}} className="text-[10px] font-black text-amber-600 bg-amber-50 px-3 py-1.5 rounded-lg hover:bg-amber-100">{t.transfer}</button>
                <button onClick={() => {setPrefilledData(eq); setInitialChangeMode('SCRAP'); setView('CHANGE');}} className="text-[10px] font-black text-rose-600 bg-rose-50 px-3 py-1.5 rounded-lg hover:bg-rose-100">{t.scrap}</button>
                <button onClick={() => setShowQrModal(eq.id)} className="text-[10px] font-black text-slate-600 bg-slate-50 px-3 py-1.5 rounded-lg hover:bg-slate-200">{t.qrBtn}</button>
              </div>
            </div>
          </div>
        ))}
        {equipments.length === 0 && <div className="lg:col-span-2 py-20 text-center text-slate-300 font-bold">{t.noData}</div>}
      </div>
      {showQrModal && (
        <div className="fixed inset-0 z-[100] flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-sm animate-in fade-in">
          <div className="bg-white p-8 rounded-[40px] shadow-2xl max-w-sm w-full text-center space-y-6">
            <div className="flex justify-between items-center mb-4"><h3 className="text-xl font-black text-slate-900">{t.qrPrint}</h3><button onClick={() => setShowQrModal(null)} className="p-2 hover:bg-slate-100 rounded-full text-slate-400"><X/></button></div>
            <div className="bg-slate-50 p-6 rounded-3xl flex flex-col items-center gap-4"><QrCode size={200} /><div className="space-y-1"><p className="text-[10px] font-black text-indigo-600">{showQrModal}</p></div></div>
            <button className="w-full bg-indigo-600 text-white font-black py-4 rounded-3xl flex items-center justify-center gap-2 hover:bg-indigo-700 transition-all" onClick={() => window.print()}><Printer size={18} /> {t.qrBtn}</button>
          </div>
        </div>
      )}
    </div>
  );

  switch (view) {
    case 'ADD': return <AddForm />;
    case 'LIST': return <ListView />;
    case 'HISTORY': return <div className="p-20 text-center">異動歷史功能開發中</div>;
    case 'CHANGE': return <div className="p-20 text-center">異動編輯功能開發中</div>;
    default: return <Home />;
  }
};

export default EquipmentManagement;
