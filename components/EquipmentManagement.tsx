
import React, { useState, useEffect, useMemo } from 'react';
import { QRCodeSVG } from 'qrcode.react';
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
import { Equipment, EquipmentChange, EquipmentChangeType, Language, Hall } from '../types';
import { storageService } from '../services/storageService';
import { compressImage } from '../services/imageService';

interface EquipmentManagementProps {
  onDirtyChange?: (isDirty: boolean) => void;
  language: Language;
}

const EquipmentManagement: React.FC<EquipmentManagementProps> = ({ onDirtyChange, language }) => {
  const [view, setView] = useState<'HOME' | 'ADD' | 'CHANGE' | 'HISTORY' | 'LIST'>('HOME');
  const [equipments, setEquipments] = useState<Equipment[]>([]);
  const [changes, setChanges] = useState<EquipmentChange[]>([]);
  const [halls, setHalls] = useState<Hall[]>([]);
  const [prefilledData, setPrefilledData] = useState<Partial<Equipment> | null>(null);
  const [initialChangeMode, setInitialChangeMode] = useState<'TRANSFER' | 'SCRAP'>('TRANSFER');
  const [showQrModal, setShowQrModal] = useState<string | null>(null);
  const [searchQuery, setSearchQuery] = useState('');

  const translations = {
    [Language.ZH]: {
      addTitle: '新增會館設備', addDesc: '建立新資產檔案，自動計算購入批次序號',
      listTitle: '會館設備管理、查詢', listDesc: '完整資產清單、移動位置與標籤列印',
      historyTitle: '異動歷史查詢', historyDesc: '追蹤所有設備的流動與變動紀錄',
      enter: '進入功能',
      hallLabel: '會館別', locLabel: '位置 (如: 3F講堂)', prodName: '品名',
      modelLabel: '型號', qtyLabel: '數量', buyDate: '購買日期', priceLabel: '價格',
      warranty: '保固年限', photoLabel: '品項照片', uploadBtn: '拍攝或上傳照片',
      saveBtn: '保存設備並生成標籤', cancel: '取消',
      transfer: '移動位置', scrap: '報廢', reason: '原因說明', reporter: '經辦人/提報人',
      saveChange: '保存變動', historyHeader: ['執行日期', '類型', '設備型號', '來源會館', '目的會館', '提報人'],
      qrPrint: '設備標籤列印', qrBtn: '列印標籤', noData: '尚未建立任何資產設備資料',
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
      const savedHalls = await storageService.loadHalls();
      if (savedEquip) setEquipments(savedEquip);
      if (savedChanges) setChanges(savedChanges);
      setHalls(savedHalls || MOCK_HALLS);
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
      hallName: halls.length > 0 ? halls[0].name : (MOCK_HALLS[0].name), location: '', category: '一般', productName: Object.keys(EQUIPMENT_CODES)[0], model: '',
      quantity: 1, purchaseDate: new Date().toISOString().split('T')[0], price: 0, warrantyYears: 1, photoUrl: ''
    });

    useEffect(() => {
      if (halls.length > 0 && !form.hallName) {
        setForm(prev => ({ ...prev, hallName: halls[0].name }));
      }
    }, [halls]);
    const handleSubmit = async (e: React.FormEvent) => {
      e.preventDefault();
      const id = generateId(form.hallName!, form.productName!, form.purchaseDate!, equipments);
      await saveEquip([{ ...form as Equipment, id, createdAt: new Date().toISOString() }, ...equipments]);
      setView('HOME');
    };
    return (
      <div className="max-w-4xl mx-auto space-y-8 animate-in slide-in-from-bottom-10 pb-20">
        <div className="bg-white p-8 rounded-[40px] border border-slate-200 shadow-xl space-y-8">
          <div className="flex items-center justify-between border-b border-slate-100 pb-6"><h2 className="text-2xl font-black text-slate-900 flex items-center gap-3"><PackagePlus className="text-indigo-600" /> {t.addTitle}</h2><button onClick={() => setView('HOME')} className="p-2 hover:bg-slate-100 rounded-full text-slate-400"><X /></button></div>
          <form onSubmit={handleSubmit} className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div className="space-y-1"><label className="text-[10px] font-black text-slate-400 uppercase">{t.hallLabel} *</label><select className="w-full px-4 py-3 bg-slate-50 border border-slate-100 rounded-2xl" value={form.hallName} onChange={e => setForm({ ...form, hallName: e.target.value })}>{halls.map(h => <option key={h.id} value={h.name}>{h.name}</option>)}</select></div>
            <div className="space-y-1"><label className="text-[10px] font-black text-slate-400 uppercase">{t.locLabel} *</label><input required className="w-full px-4 py-3 bg-slate-50 border border-slate-100 rounded-2xl" value={form.location} onChange={e => setForm({ ...form, location: e.target.value })} /></div>
            <div className="space-y-1"><label className="text-[10px] font-black text-slate-400 uppercase">{t.prodName} *</label><select className="w-full px-4 py-3 bg-slate-50 border border-slate-100 rounded-2xl" value={form.productName} onChange={e => setForm({ ...form, productName: e.target.value })}>{Object.keys(EQUIPMENT_CODES).map(name => <option key={name} value={name}>{name}</option>)}</select></div>
            <div className="space-y-1"><label className="text-[10px] font-black text-slate-400 uppercase">{t.modelLabel} *</label><input required className="w-full px-4 py-3 bg-slate-50 border border-slate-100 rounded-2xl" value={form.model} onChange={e => setForm({ ...form, model: e.target.value })} /></div>
            <div className="space-y-1"><label className="text-[10px] font-black text-slate-400 uppercase">{t.buyDate} *</label><input required type="date" className="w-full px-4 py-3 bg-slate-50 border border-slate-100 rounded-2xl" value={form.purchaseDate} onChange={e => setForm({ ...form, purchaseDate: e.target.value })} /></div>
            <div className="space-y-1"><label className="text-[10px] font-black text-slate-400 uppercase">{t.priceLabel} *</label><input required type="number" className="w-full px-4 py-3 bg-slate-50 border border-slate-100 rounded-2xl" value={form.price} onChange={e => setForm({ ...form, price: parseInt(e.target.value) })} /></div>

            <div className="md:col-span-2 space-y-3">
              <label className="text-[10px] font-black text-slate-400 uppercase">{t.photoLabel}</label>
              <div className="flex items-center gap-4">
                <div className="w-24 h-24 bg-slate-50 rounded-2xl border-2 border-dashed border-slate-200 flex items-center justify-center overflow-hidden">
                  {form.photoUrl ? (
                    <img src={form.photoUrl} className="w-full h-full object-cover" />
                  ) : (
                    <ImageIcon className="text-slate-300" size={32} />
                  )}
                </div>
                <div className="flex-1">
                  <input
                    type="file"
                    accept="image/*"
                    id="equip-photo"
                    className="hidden"
                    onChange={async (e) => {
                      const file = e.target.files?.[0];
                      if (file) {
                        try {
                          const base64 = await compressImage(file, { maxWidth: 600, quality: 0.5 });
                          setForm({ ...form, photoUrl: base64 });
                        } catch (err) {
                          console.error('圖片處理失敗', err);
                        }
                      }
                    }}
                  />
                  <label htmlFor="equip-photo" className="inline-flex items-center gap-2 px-6 py-3 bg-white border-2 border-slate-200 rounded-2xl font-black text-xs cursor-pointer hover:bg-slate-50 transition-all">
                    <Camera size={16} /> {t.uploadBtn}
                  </label>
                  {form.photoUrl && (
                    <button type="button" onClick={() => setForm({ ...form, photoUrl: '' })} className="ml-4 text-[10px] font-black text-rose-500 underline">移除照片</button>
                  )}
                </div>
              </div>
            </div>

            <div className="md:col-span-2 pt-6 flex gap-4"><button type="submit" className="flex-1 bg-indigo-600 text-white font-black py-4 rounded-3xl shadow-xl hover:bg-indigo-700 transition-all">{t.saveBtn}</button><button type="button" onClick={() => setView('HOME')} className="px-10 bg-white text-slate-500 font-bold py-4 rounded-3xl border border-slate-200">{t.cancel}</button></div>
          </form>
        </div>
      </div>
    );
  };

  const ChangeForm = () => {
    const [mode, setMode] = useState<'TRANSFER' | 'SCRAP'>(initialChangeMode);
    const [form, setForm] = useState({
      reason: '',
      reporter: '',
      targetHallName: mode === 'TRANSFER' ? (prefilledData?.hallName || '') : '',
      targetLocation: mode === 'TRANSFER' ? (prefilledData?.location || '') : ''
    });

    const handleSubmit = async (e: React.FormEvent) => {
      e.preventDefault();
      if (!prefilledData?.id) return;

      const newChange: EquipmentChange = {
        id: crypto.randomUUID(),
        type: mode === 'TRANSFER' ? EquipmentChangeType.TRANSFER : EquipmentChangeType.SCRAP,
        equipmentId: prefilledData.id,
        equipmentName: prefilledData.productName || '',
        date: new Date().toISOString(),
        reason: form.reason,
        reporter: form.reporter,
        fromHall: prefilledData.hallName,
        fromLocation: prefilledData.location,
        toHall: mode === 'TRANSFER' ? form.targetHallName : undefined,
        toLocation: mode === 'TRANSFER' ? form.targetLocation : undefined
      };

      await saveChange([newChange, ...changes]);

      if (mode === 'SCRAP') {
        const updatedEquips = equipments.map(eq =>
          eq.id === prefilledData.id ? { ...eq, isScrapped: true } : eq
        );
        await saveEquip(updatedEquips);
      } else {
        const updatedEquips = equipments.map(eq =>
          eq.id === prefilledData.id ? { ...eq, hallName: form.targetHallName, location: form.targetLocation } : eq
        );
        await saveEquip(updatedEquips);
      }

      setView('LIST');
    };

    return (
      <div className="max-w-4xl mx-auto space-y-8 animate-in slide-in-from-bottom-10 pb-20">
        <div className="bg-white p-8 rounded-[40px] border border-slate-200 shadow-xl space-y-8">
          <div className="flex items-center justify-between border-b border-slate-100 pb-6">
            <h2 className="text-2xl font-black text-slate-900 flex items-center gap-3">
              {mode === 'TRANSFER' ? <RefreshCw className="text-amber-500" /> : <Trash2 className="text-rose-500" />}
              {mode === 'TRANSFER' ? t.transfer : t.scrap} - {prefilledData?.productName}
            </h2>
            <button onClick={() => setView('LIST')} className="p-2 hover:bg-slate-100 rounded-full text-slate-400"><X /></button>
          </div>

          <div className="flex gap-4 p-1 bg-slate-100 rounded-2xl w-fit">
            <button
              onClick={() => setMode('TRANSFER')}
              className={`px-6 py-2 rounded-xl font-black text-sm transition-all ${mode === 'TRANSFER' ? 'bg-white shadow-sm text-amber-600' : 'text-slate-500'}`}
            >
              {t.transfer}
            </button>
            <button
              onClick={() => setMode('SCRAP')}
              className={`px-6 py-2 rounded-xl font-black text-sm transition-all ${mode === 'SCRAP' ? 'bg-white shadow-sm text-rose-600' : 'text-slate-500'}`}
            >
              {t.scrap}
            </button>
          </div>

          <form onSubmit={handleSubmit} className="space-y-6">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              {mode === 'TRANSFER' && (
                <>
                  <div className="space-y-1">
                    <label className="text-[10px] font-black text-slate-400 uppercase">目的會館 *</label>
                    <select
                      className="w-full px-4 py-3 bg-slate-50 border border-slate-100 rounded-2xl font-bold"
                      value={form.targetHallName}
                      onChange={e => setForm({ ...form, targetHallName: e.target.value })}
                      required
                    >
                      {halls.map(h => <option key={h.id} value={h.name}>{h.name}</option>)}
                    </select>
                  </div>
                  <div className="space-y-1">
                    <label className="text-[10px] font-black text-slate-400 uppercase">新位置 *</label>
                    <input
                      required
                      className="w-full px-4 py-3 bg-slate-50 border border-slate-100 rounded-2xl font-bold"
                      value={form.targetLocation}
                      onChange={e => setForm({ ...form, targetLocation: e.target.value })}
                    />
                  </div>
                </>
              )}
              <div className="space-y-1 md:col-span-2">
                <label className="text-[10px] font-black text-slate-400 uppercase">{t.reason} *</label>
                <textarea
                  required
                  className="w-full px-4 py-3 bg-slate-50 border border-slate-100 rounded-2xl font-bold min-h-[100px]"
                  value={form.reason}
                  onChange={e => setForm({ ...form, reason: e.target.value })}
                />
              </div>
              <div className="space-y-1 md:col-span-2">
                <label className="text-[10px] font-black text-slate-400 uppercase">{t.reporter} *</label>
                <input
                  required
                  className="w-full px-4 py-3 bg-slate-50 border border-slate-100 rounded-2xl font-bold"
                  value={form.reporter}
                  onChange={e => setForm({ ...form, reporter: e.target.value })}
                />
              </div>
            </div>

            <div className="pt-6 flex gap-4">
              <button type="submit" className={`flex-1 text-white font-black py-4 rounded-3xl shadow-xl transition-all ${mode === 'TRANSFER' ? 'bg-amber-500 hover:bg-amber-600' : 'bg-rose-600 hover:bg-rose-700'}`}>
                {mode === 'TRANSFER' ? '確認移轉' : '確認報廢'}
              </button>
              <button type="button" onClick={() => setView('LIST')} className="px-10 bg-white text-slate-500 font-bold py-4 rounded-3xl border border-slate-200">
                {t.cancel}
              </button>
            </div>
          </form>
        </div>
      </div>
    );
  };

  const HistoryView = () => (
    <div className="space-y-6 animate-in fade-in duration-500 pb-20">
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <h2 className="text-2xl font-black text-slate-900 flex items-center gap-3"><History className="text-emerald-500" /> {t.historyTitle}</h2>
        <button onClick={() => setView('HOME')} className="flex items-center gap-2 px-4 py-2 text-slate-500 hover:bg-white rounded-xl border border-transparent hover:border-slate-200 transition-all"><ArrowLeft size={18} /> {t.cancel}</button>
      </div>

      <div className="bg-white rounded-[40px] border border-slate-200 shadow-sm overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-left border-collapse">
            <thead>
              <tr className="bg-slate-50 border-b border-slate-100">
                {t.historyHeader.map((h, i) => (
                  <th key={i} className="px-6 py-4 text-[10px] font-black text-slate-400 uppercase tracking-wider">{h}</th>
                ))}
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100">
              {changes.map((change) => (
                <tr key={change.id} className="hover:bg-slate-50 transition-colors">
                  <td className="px-6 py-4">
                    <div className="text-sm font-bold text-slate-900">{new Date(change.date).toLocaleDateString()}</div>
                    <div className="text-[10px] text-slate-400">{new Date(change.date).toLocaleTimeString()}</div>
                  </td>
                  <td className="px-6 py-4">
                    <span className={`px-3 py-1 rounded-full text-[10px] font-black ${change.type === EquipmentChangeType.TRANSFER ? 'bg-amber-50 text-amber-600' : 'bg-rose-50 text-rose-600'}`}>
                      {change.type === EquipmentChangeType.TRANSFER ? t.transfer : t.scrap}
                    </span>
                  </td>
                  <td className="px-6 py-4">
                    <div className="text-sm font-bold text-slate-900">{change.equipmentName}</div>
                    <div className="text-[10px] text-slate-400">{change.equipmentId}</div>
                  </td>
                  <td className="px-6 py-4">
                    <div className="text-sm font-medium text-slate-600">{change.fromHall || '-'}</div>
                    <div className="text-[10px] text-slate-400">{change.fromLocation}</div>
                  </td>
                  <td className="px-6 py-4">
                    <div className="text-sm font-medium text-slate-600">{change.toHall || '-'}</div>
                    <div className="text-[10px] text-slate-400">{change.toLocation}</div>
                  </td>
                  <td className="px-6 py-4 text-sm font-bold text-slate-700">{change.reporter}</td>
                </tr>
              ))}
              {changes.length === 0 && (
                <tr>
                  <td colSpan={6} className="px-6 py-20 text-center text-slate-300 font-bold">尚無異動紀錄</td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );

  const ListView = () => {
    const filteredEquipments = useMemo(() => {
      return equipments
        .filter(eq => !eq.isScrapped)
        .filter(eq =>
          eq.productName.toLowerCase().includes(searchQuery.toLowerCase()) ||
          eq.model.toLowerCase().includes(searchQuery.toLowerCase()) ||
          eq.id.toLowerCase().includes(searchQuery.toLowerCase()) ||
          eq.hallName.toLowerCase().includes(searchQuery.toLowerCase()) ||
          eq.location.toLowerCase().includes(searchQuery.toLowerCase())
        );
    }, [equipments, searchQuery]);

    const qrValue = useMemo(() => {
      if (!showQrModal) return '';
      const eq = equipments.find(e => e.id === showQrModal);
      if (!eq) return '';
      // 包含基本資訊的 JSON 字串，手機掃描後可以看到
      return JSON.stringify({
        id: eq.id,
        name: eq.productName,
        model: eq.model,
        hall: eq.hallName,
        loc: eq.location
      }, null, 2);
    }, [showQrModal, equipments]);

    return (
      <div className="space-y-6 animate-in fade-in duration-500 pb-20">
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
          <h2 className="text-2xl font-black text-slate-900 flex items-center gap-3"><Search className="text-slate-700" /> {t.listTitle}</h2>
          <div className="flex items-center gap-4">
            <div className="relative">
              <Search className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400" size={18} />
              <input
                type="text"
                placeholder="搜尋設備、編號或會館..."
                className="pl-12 pr-4 py-2 bg-white border border-slate-200 rounded-xl w-64 focus:ring-2 focus:ring-indigo-500 outline-none transition-all font-bold text-sm"
                value={searchQuery}
                onChange={e => setSearchQuery(e.target.value)}
              />
            </div>
            <button onClick={() => setView('HOME')} className="flex items-center gap-2 px-4 py-2 text-slate-500 hover:bg-white rounded-xl border border-transparent hover:border-slate-200 transition-all font-bold text-sm"><ArrowLeft size={18} /> {t.cancel}</button>
          </div>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
          {filteredEquipments.map(eq => (
            <div key={eq.id} className="bg-white p-6 rounded-3xl border border-slate-200 shadow-sm flex flex-col sm:flex-row gap-6 hover:shadow-md transition-shadow">
              <div className="w-full sm:w-32 h-32 bg-slate-100 rounded-2xl flex flex-col items-center justify-center text-slate-300 relative overflow-hidden group">
                {eq.photoUrl ? <img src={eq.photoUrl} className="w-full h-full object-cover" /> : <ImageIcon size={40} className="opacity-20" />}
              </div>
              <div className="flex-1 space-y-2">
                <div className="flex items-center justify-between">
                  <span className="text-[10px] font-black text-indigo-600 bg-indigo-50 px-2 py-0.5 rounded-lg">{eq.id}</span>
                  <span className={`flex items-center gap-1 text-[10px] font-black px-2 py-0.5 rounded-lg ${isWarrantyValid(eq.purchaseDate, eq.warrantyYears) ? 'bg-emerald-50 text-emerald-600' : 'bg-rose-50 text-rose-600'}`}>
                    {isWarrantyValid(eq.purchaseDate, eq.warrantyYears) ? t.warrantyOk : t.warrantyEnd}
                  </span>
                </div>
                <h3 className="text-lg font-black text-slate-900 leading-none">{eq.productName} <span className="text-slate-400 font-medium text-sm">({eq.model})</span></h3>
                <p className="text-xs font-medium text-slate-500">{eq.hallName} • {eq.location}</p>
                <div className="pt-2 flex flex-wrap gap-2">
                  <button onClick={() => { setPrefilledData(eq); setInitialChangeMode('TRANSFER'); setView('CHANGE'); }} className="text-[10px] font-black text-amber-600 bg-amber-50 px-3 py-1.5 rounded-lg hover:bg-amber-100">{t.transfer}</button>
                  <button onClick={() => { setPrefilledData(eq); setInitialChangeMode('SCRAP'); setView('CHANGE'); }} className="text-[10px] font-black text-rose-600 bg-rose-50 px-3 py-1.5 rounded-lg hover:bg-rose-100">{t.scrap}</button>
                  <button onClick={() => setShowQrModal(eq.id)} className="text-[10px] font-black text-slate-600 bg-slate-50 px-3 py-1.5 rounded-lg hover:bg-slate-200">{t.qrBtn}</button>
                </div>
              </div>
            </div>
          ))}
          {filteredEquipments.length === 0 && <div className="lg:col-span-2 py-20 text-center text-slate-300 font-bold">{t.noData}</div>}
        </div>

        {showQrModal && (
          <div className="fixed inset-0 z-[100] flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-sm animate-in fade-in">
            <div className="bg-white p-8 rounded-[40px] shadow-2xl max-w-sm w-full text-center space-y-6">
              <div className="flex justify-between items-center mb-4">
                <h3 className="text-xl font-black text-slate-900">{t.qrPrint}</h3>
                <button onClick={() => setShowQrModal(null)} className="p-2 hover:bg-slate-100 rounded-full text-slate-400"><X /></button>
              </div>
              <div className="bg-white p-6 rounded-3xl flex flex-col items-center gap-4 border border-slate-100 shadow-inner">
                <QRCodeSVG
                  value={qrValue}
                  size={200}
                  level="H"
                  includeMargin={true}
                />
                <div className="space-y-1">
                  <p className="text-[10px] font-black text-indigo-600">{showQrModal}</p>
                  <p className="text-[12px] font-bold text-slate-500">{equipments.find(e => e.id === showQrModal)?.productName}</p>
                </div>
              </div>
              <button
                className="w-full bg-indigo-600 text-white font-black py-4 rounded-3xl flex items-center justify-center gap-2 hover:bg-indigo-700 transition-all shadow-lg"
                onClick={() => window.print()}
              >
                <Printer size={18} /> {t.qrBtn}
              </button>
            </div>
          </div>
        )}
      </div>
    );
  };

  switch (view) {
    case 'ADD': return <AddForm />;
    case 'LIST': return <ListView />;
    case 'HISTORY': return <HistoryView />;
    case 'CHANGE': return <ChangeForm />;
    default: return <Home />;
  }
};

export default EquipmentManagement;
