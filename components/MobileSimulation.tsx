
import React, { useState, useRef, useEffect, useMemo } from 'react';
import exifr from 'exifr';
import {
  X,
  Send,
  Camera,
  User,
  Calendar,
  Wrench,
  CheckCircle2,
  ShieldAlert,
  ChevronDown,
  Image as ImageIcon,
  MessageCircle,
  MoreHorizontal,
  Home,
  Plus,
  LogOut,
  ArrowLeft,
  Trash2,
  Phone,
  MapPin,
  Briefcase
} from 'lucide-react';
import { MOCK_HALLS } from '../constants';
import { Category, OrderType, RepairRequest, DisasterReport, RepairStatus, HallSecurityStatus } from '../types';

interface MobileSimulationProps {
  onClose: () => void;
  onSubmitReport: (data: Partial<RepairRequest>) => void;
  onDisasterReport?: (disasterId: string, hallId: string, status: string, remark: string, reporter: string, position: string, phone: string) => void;
  activeDisaster?: DisasterReport | null;
  requests?: RepairRequest[];
  liffProfile?: { displayName: string; userId: string; pictureUrl?: string } | null;
}

const MobileSimulation: React.FC<MobileSimulationProps> = ({ onClose, onSubmitReport, onDisasterReport, activeDisaster, requests = [], liffProfile }) => {
  const [activeForm, setActiveForm] = useState<'NONE' | 'REPAIR' | 'FINISH' | 'DISASTER'>('NONE');

  // 分離不同表單的數據
  const [repairFormData, setRepairFormData] = useState({
    hallName: MOCK_HALLS[0].name,
    name: '',
    mission: '',
    phone: '',
    description: '',
    category: Category.AC,
  });

  const [finishFormData, setFinishFormData] = useState({
    selectedRequestId: '',
    hallName: MOCK_HALLS[0].name,
    name: '',
    position: '',
    phone: '',
    workDescription: '',
    completionDate: new Date().toISOString().split('T')[0],
  });

  // 圖片數據結構：包含 URL、拍攝時間和地點
  interface ImageData {
    url: string;
    timestamp?: string;
    location?: {
      latitude: number;
      longitude: number;
      address?: string;
    };
  }

  const [repairImages, setRepairImages] = useState<ImageData[]>([]);
  const [finishImages, setFinishImages] = useState<ImageData[]>([]);
  const [repairErrors, setRepairErrors] = useState<{ name?: string; mission?: string; phone?: string; description?: string }>({});
  const [finishErrors, setFinishErrors] = useState<{ selectedRequestId?: string; name?: string; position?: string; phone?: string; workDescription?: string }>({});

  const [disasterFormData, setDisasterFormData] = useState({
    hallName: MOCK_HALLS[0].name,
    status: HallSecurityStatus.SAFE,
    remark: '',
    reporter: '',
    position: '',
    phone: ''
  });
  const [disasterErrors, setDisasterErrors] = useState<{ reporter?: string; position?: string; phone?: string; remark?: string }>({});

  const repairFileInputRef = useRef<HTMLInputElement>(null);
  const finishFileInputRef = useRef<HTMLInputElement>(null);
  const reporterInputRef = useRef<HTMLInputElement>(null);
  const descriptionInputRef = useRef<HTMLTextAreaElement>(null);
  const [isProcessingImages, setIsProcessingImages] = useState(false);

  // 字數限制
  const NAME_MAX_LENGTH = 50;
  const MISSION_MAX_LENGTH = 50;
  const PHONE_MAX_LENGTH = 20;
  const REPORTER_MAX_LENGTH = 50; // 完工表單使用
  const DESCRIPTION_MAX_LENGTH = 500;

  // 獲取當前地理位置
  const getCurrentLocation = (): Promise<{ latitude: number; longitude: number } | null> => {
    return new Promise((resolve) => {
      if (!navigator.geolocation) {
        resolve(null);
        return;
      }
      navigator.geolocation.getCurrentPosition(
        (position) => {
          resolve({
            latitude: position.coords.latitude,
            longitude: position.coords.longitude,
          });
        },
        () => resolve(null),
        { timeout: 5000, maximumAge: 60000 }
      );
    });
  };

  // 圖片壓縮工具函數
  const compressImage = (file: File): Promise<string> => {
    return new Promise((resolve) => {
      const reader = new FileReader();
      reader.onload = (e) => {
        const img = new Image();
        img.onload = () => {
          const canvas = document.createElement('canvas');
          let width = img.width;
          let height = img.height;
          const MAX_SIZE = 1200; // 最大尺寸

          if (width > height) {
            if (width > MAX_SIZE) {
              height *= MAX_SIZE / width;
              width = MAX_SIZE;
            }
          } else {
            if (height > MAX_SIZE) {
              width *= MAX_SIZE / height;
              height = MAX_SIZE;
            }
          }
          canvas.width = width;
          canvas.height = height;
          const ctx = canvas.getContext('2d');
          ctx?.drawImage(img, 0, 0, width, height);
          resolve(canvas.toDataURL('image/jpeg', 0.7)); // 壓縮為 0.7 品質的 jpeg
        };
        img.src = e.target?.result as string;
      };
      reader.readAsDataURL(file);
    });
  };

  // 處理文件上傳
  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>, formType: 'REPAIR' | 'FINISH') => {
    const files = e.target.files;
    if (!files || files.length === 0) return;

    const fileArray = Array.from(files);

    fileArray.forEach(async (file: any) => {
      try {
        const reader = new FileReader();
        reader.onload = async (event: any) => {
          const imageUrl = event.target.result as string;
          const initialData: ImageData = {
            url: imageUrl,
            timestamp: file.lastModified ? new Date(file.lastModified).toISOString() : new Date().toISOString(),
            location: undefined
          };

          // 立即更新畫面顯示圖片
          if (formType === 'REPAIR') {
            setRepairImages(prev => [...prev, initialData]);
          } else {
            setFinishImages(prev => [...prev, initialData]);
          }

          // 背景讀取 EXIF，讀到再更新資料，不影響圖片顯示
          exifr.parse(file, { gps: true, exif: true }).then(exifData => {
            if (exifData) {
              const updatedTime = exifData.DateTimeOriginal ? new Date(exifData.DateTimeOriginal).toISOString() : initialData.timestamp;
              const updatedLoc = (exifData.latitude && exifData.longitude) ? { latitude: exifData.latitude, longitude: exifData.longitude } : undefined;

              const updateFn = (prev: ImageData[]) => prev.map(img =>
                img.url === imageUrl ? { ...img, timestamp: updatedTime, location: updatedLoc } : img
              );

              if (formType === 'REPAIR') setRepairImages(updateFn);
              else setFinishImages(updateFn);
            }
          }).catch(() => { });
        };
        reader.readAsDataURL(file);
      } catch (err) {
        console.error('圖片處理錯誤:', err);
      }
    });

    e.target.value = '';
  };

  const removeImage = (index: number, formType: 'REPAIR' | 'FINISH') => {
    if (formType === 'REPAIR') {
      setRepairImages(prev => prev.filter((_, i) => i !== index));
    } else {
      setFinishImages(prev => prev.filter((_, i) => i !== index));
    }
  };

  // 格式化時間顯示
  const formatTimestamp = (timestamp?: string) => {
    if (!timestamp) return '未知時間';
    const date = new Date(timestamp);
    return date.toLocaleString('zh-TW', {
      year: 'numeric',
      month: '2-digit',
      day: '2-digit',
      hour: '2-digit',
      minute: '2-digit',
      second: '2-digit',
    });
  };

  // 格式化位置顯示
  const formatLocation = (location?: { latitude: number; longitude: number }) => {
    if (!location) return '未知地點';
    return `${location.latitude.toFixed(6)}, ${location.longitude.toFixed(6)}`;
  };

  // 驗證報修表單
  const validateRepairForm = () => {
    const newErrors: { name?: string; mission?: string; phone?: string; description?: string } = {};

    if (!repairFormData.name.trim()) {
      newErrors.name = '請輸入姓名';
    } else if (repairFormData.name.length > NAME_MAX_LENGTH) {
      newErrors.name = `姓名不能超過 ${NAME_MAX_LENGTH} 個字`;
    }

    if (!repairFormData.mission.trim()) {
      newErrors.mission = '請輸入學會使命';
    } else if (repairFormData.mission.length > MISSION_MAX_LENGTH) {
      newErrors.mission = `學會使命不能超過 ${MISSION_MAX_LENGTH} 個字`;
    }

    if (!repairFormData.phone.trim()) {
      newErrors.phone = '請輸入聯絡電話';
    } else if (repairFormData.phone.length > PHONE_MAX_LENGTH) {
      newErrors.phone = `聯絡電話不能超過 ${PHONE_MAX_LENGTH} 個字`;
    }

    if (!repairFormData.description.trim()) {
      newErrors.description = '請輸入狀況描述';
    } else if (repairFormData.description.length > DESCRIPTION_MAX_LENGTH) {
      newErrors.description = `狀況描述不能超過 ${DESCRIPTION_MAX_LENGTH} 個字`;
    } else if (repairFormData.description.trim().length < 1) {
      newErrors.description = '狀況描述至少需要 1 個字';
    }

    setRepairErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  // 驗證完工表單
  const validateFinishForm = () => {
    const newErrors: { selectedRequestId?: string; name?: string; position?: string; phone?: string; workDescription?: string } = {};

    if (!finishFormData.selectedRequestId) {
      newErrors.selectedRequestId = '請選擇要回報的工單';
    }

    if (!finishFormData.name.trim()) {
      newErrors.name = '請輸入姓名';
    } else if (finishFormData.name.length > NAME_MAX_LENGTH) {
      newErrors.name = `姓名不能超過 ${NAME_MAX_LENGTH} 個字`;
    }

    if (!finishFormData.position.trim()) {
      newErrors.position = '請輸入職稱';
    } else if (finishFormData.position.length > MISSION_MAX_LENGTH) {
      newErrors.position = `職稱不能超過 ${MISSION_MAX_LENGTH} 個字`;
    }

    if (!finishFormData.phone.trim()) {
      newErrors.phone = '請輸入電話號碼';
    } else if (finishFormData.phone.length > PHONE_MAX_LENGTH) {
      newErrors.phone = `電話號碼不能超過 ${PHONE_MAX_LENGTH} 個字`;
    } else if (!/^[0-9-+()]+$/.test(finishFormData.phone)) {
      newErrors.phone = '電話號碼格式不正確';
    }

    if (!finishFormData.workDescription.trim()) {
      newErrors.workDescription = '請輸入完工說明';
    } else if (finishFormData.workDescription.length > DESCRIPTION_MAX_LENGTH) {
      newErrors.workDescription = `完工說明不能超過 ${DESCRIPTION_MAX_LENGTH} 個字`;
    }

    setFinishErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  // 處理報修表單提交
  const handleRepairSubmit = (e: React.FormEvent) => {
    e.preventDefault();

    if (!validateRepairForm()) {
      if (repairErrors.name) {
        reporterInputRef.current?.focus();
      } else if (repairErrors.mission) {
        // 可以添加 mission 輸入框的 ref
      } else if (repairErrors.phone) {
        // 可以添加 phone 輸入框的 ref
      } else if (repairErrors.description) {
        descriptionInputRef.current?.focus();
      }
      return;
    }

    onSubmitReport({
      ...repairFormData,
      type: OrderType.VOLUNTEER,
      title: `${repairFormData.category} - ${repairFormData.hallName} 報修`,
      reporter: `${repairFormData.name} / ${repairFormData.mission}`,
      photoUrls: repairImages.map(img => img.url),
      photoMetadata: repairImages.map(img => ({
        timestamp: img.timestamp,
        location: img.location,
      })),
    });
    alert('感謝您的回報，工單已建立！照片已同步上傳至系統。');
    setActiveForm('NONE');
    setRepairImages([]);
    setRepairFormData({
      hallName: MOCK_HALLS[0].name,
      name: '',
      mission: '',
      phone: '',
      description: '',
      category: Category.AC,
    });
    setRepairErrors({});
  };

  // 處理完工表單提交
  const handleFinishSubmit = (e: React.FormEvent) => {
    e.preventDefault();

    if (!validateFinishForm()) {
      return;
    }


    onSubmitReport({
      ...finishFormData,
      id: finishFormData.selectedRequestId,
      type: OrderType.VOLUNTEER,
      title: `${finishFormData.hallName} 修繕完工回報`,
      reporter: `${finishFormData.name} (${finishFormData.position})`,
      processingDescription: finishFormData.workDescription,
      photoUrls: finishImages.map(img => img.url),
      photoMetadata: finishImages.map(img => ({
        timestamp: img.timestamp,
        location: img.location,
      })),
    });
    alert('完工回報已提交！感謝您的回報。');
    setActiveForm('NONE');
    setFinishImages([]);
    setFinishFormData({
      selectedRequestId: '',
      hallName: MOCK_HALLS[0].name,
      name: '',
      position: '',
      phone: '',
      workDescription: '',
      completionDate: new Date().toISOString().split('T')[0],
    });
    setFinishErrors({});
  };

  // 驗證災害回報表單
  const validateDisasterForm = () => {
    const newErrors: { reporter?: string; position?: string; phone?: string; remark?: string } = {};

    if (!disasterFormData.reporter.trim()) {
      newErrors.reporter = '請輸入姓名';
    } else if (disasterFormData.reporter.length > NAME_MAX_LENGTH) {
      newErrors.reporter = `姓名不能超過 ${NAME_MAX_LENGTH} 個字`;
    }

    if (!disasterFormData.position.trim()) {
      newErrors.position = '請輸入職稱';
    } else if (disasterFormData.position.length > REPORTER_MAX_LENGTH) {
      newErrors.position = `職稱不能超過 ${REPORTER_MAX_LENGTH} 個字`;
    }

    if (!disasterFormData.phone.trim()) {
      newErrors.phone = '請輸入手機號碼';
    } else if (disasterFormData.phone.length > PHONE_MAX_LENGTH) {
      newErrors.phone = `手機號碼不能超過 ${PHONE_MAX_LENGTH} 個字`;
    } else if (!/^[0-9-+()]+$/.test(disasterFormData.phone)) {
      newErrors.phone = '手機號碼格式不正確';
    }

    setDisasterErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  // 處理災害回報提交
  const handleDisasterSubmit = (e: React.FormEvent) => {
    e.preventDefault();

    if (!validateDisasterForm()) {
      return;
    }

    if (!activeDisaster) {
      alert('目前無進行中之災情報告');
      return;
    }

    const selectedHall = MOCK_HALLS.find(h => h.name === disasterFormData.hallName);
    if (!selectedHall) {
      alert('請選擇會館');
      return;
    }

    if (onDisasterReport) {
      onDisasterReport(
        activeDisaster.id,
        selectedHall.id,
        disasterFormData.status,
        disasterFormData.remark,
        disasterFormData.reporter,
        disasterFormData.position,
        disasterFormData.phone
      );
      alert('災害回報已提交！感謝您的回報。');
      setActiveForm('NONE');
      setDisasterFormData({
        hallName: MOCK_HALLS[0].name,
        status: HallSecurityStatus.SAFE,
        remark: '',
        reporter: '',
        position: '',
        phone: ''
      });
      setDisasterErrors({});
    }
  };

  // 獲取尚未完工的工單
  const unfinishedRequests = requests.filter(req => req.status !== RepairStatus.CLOSED && req.isVerified);

  // 當有 LINE 個人資料時，自動填充表單
  useEffect(() => {
    if (liffProfile) {
      setRepairFormData(prev => ({ ...prev, name: liffProfile.displayName }));
      setFinishFormData(prev => ({ ...prev, name: liffProfile.displayName }));
      setDisasterFormData(prev => ({ ...prev, reporter: liffProfile.displayName }));
    }
  }, [liffProfile]);

  // 當表單打開時自動聚焦
  useEffect(() => {
    if (activeForm === 'REPAIR' || activeForm === 'FINISH') {
      setTimeout(() => {
        reporterInputRef.current?.focus();
      }, 300);
    }
  }, [activeForm]);

  // 報修表單 JSX
  const repairFormJSX = (
    <div className="absolute inset-x-0 bottom-0 top-16 bg-white z-[30] flex flex-col animate-in slide-in-from-bottom duration-300 rounded-t-[40px] shadow-2xl border-t border-slate-100">
      <div className="p-6 flex items-center justify-between border-b border-slate-50">
        <div className="flex items-center gap-3">
          <button onClick={() => { setActiveForm('NONE'); setRepairImages([]); }} className="p-2 text-slate-400 hover:bg-slate-50 rounded-full transition-colors">
            <ArrowLeft size={20} />
          </button>
          <h3 className="text-lg font-black text-slate-800">會館線上報修</h3>
        </div>
        <button onClick={() => { setActiveForm('NONE'); setRepairImages([]); }} className="p-2 text-slate-400 hover:bg-slate-50 rounded-full transition-colors">
          <X size={20} />
        </button>
      </div>
      <form onSubmit={handleRepairSubmit} className="p-8 space-y-6 overflow-y-auto flex-1 pb-32 custom-scrollbar">
        <div className="space-y-1">
          <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest">選擇會館</label>
          <div className="relative">
            <select
              className="w-full px-4 py-4 bg-slate-50 rounded-2xl border-none outline-none font-bold appearance-none cursor-pointer focus:ring-2 focus:ring-indigo-500 focus:bg-white transition-all"
              value={repairFormData.hallName}
              onChange={e => setRepairFormData(prev => ({ ...prev, hallName: e.target.value }))}
            >
              {MOCK_HALLS.map(h => <option key={h.id} value={h.name}>{h.name}</option>)}
            </select>
            <ChevronDown className="absolute right-4 top-1/2 -translate-y-1/2 text-slate-400 pointer-events-none" size={20} />
          </div>
        </div>

        <div className="space-y-1">
          <div className="flex items-center justify-between">
            <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest">姓名</label>
            <span className={`text-[10px] font-bold ${(repairFormData.name?.length || 0) > NAME_MAX_LENGTH ? 'text-rose-500' : 'text-slate-400'}`}>
              {repairFormData.name?.length || 0}/{NAME_MAX_LENGTH}
            </span>
          </div>
          <div className="relative">
            <User className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400" size={18} />
            <input
              ref={reporterInputRef}
              required
              maxLength={NAME_MAX_LENGTH}
              placeholder="請輸入您的姓名"
              className={`w-full pl-12 pr-4 py-4 bg-slate-50 rounded-2xl border-none outline-none font-bold transition-all focus:ring-2 focus:ring-indigo-500 focus:bg-white ${repairErrors.name ? 'ring-2 ring-rose-500 bg-rose-50' : ''
                }`}
              value={repairFormData.name || ''}
              onChange={e => setRepairFormData(prev => ({ ...prev, name: e.target.value }))}
            />
          </div>
          {repairErrors.name && (
            <p className="text-[10px] text-rose-500 font-bold mt-1 flex items-center gap-1">
              <X size={12} /> {repairErrors.name}
            </p>
          )}
        </div>

        <div className="space-y-1">
          <div className="flex items-center justify-between">
            <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest">學會使命</label>
            <span className={`text-[10px] font-bold ${(repairFormData.mission?.length || 0) > MISSION_MAX_LENGTH ? 'text-rose-500' : 'text-slate-400'}`}>
              {repairFormData.mission?.length || 0}/{MISSION_MAX_LENGTH}
            </span>
          </div>
          <div className="relative">
            <User className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400" size={18} />
            <input
              required
              maxLength={MISSION_MAX_LENGTH}
              placeholder="請輸入學會使命"
              className={`w-full pl-12 pr-4 py-4 bg-slate-50 rounded-2xl border-none outline-none font-bold transition-all focus:ring-2 focus:ring-indigo-500 focus:bg-white ${repairErrors.mission ? 'ring-2 ring-rose-500 bg-rose-50' : ''
                }`}
              value={repairFormData.mission || ''}
              onChange={e => setRepairFormData(prev => ({ ...prev, mission: e.target.value }))}
            />
          </div>
          {repairErrors.mission && (
            <p className="text-[10px] text-rose-500 font-bold mt-1 flex items-center gap-1">
              <X size={12} /> {repairErrors.mission}
            </p>
          )}
        </div>

        <div className="space-y-1">
          <div className="flex items-center justify-between">
            <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest">聯絡電話</label>
            <span className={`text-[10px] font-bold ${(repairFormData.phone?.length || 0) > PHONE_MAX_LENGTH ? 'text-rose-500' : 'text-slate-400'}`}>
              {repairFormData.phone?.length || 0}/{PHONE_MAX_LENGTH}
            </span>
          </div>
          <div className="relative">
            <Phone className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400" size={18} />
            <input
              type="tel"
              required
              maxLength={PHONE_MAX_LENGTH}
              placeholder="請輸入聯絡電話"
              className={`w-full pl-12 pr-4 py-4 bg-slate-50 rounded-2xl border-none outline-none font-bold transition-all focus:ring-2 focus:ring-indigo-500 focus:bg-white ${repairErrors.phone ? 'ring-2 ring-rose-500 bg-rose-50' : ''
                }`}
              value={repairFormData.phone || ''}
              onChange={e => setRepairFormData(prev => ({ ...prev, phone: e.target.value }))}
            />
          </div>
          {repairErrors.phone && (
            <p className="text-[10px] text-rose-500 font-bold mt-1 flex items-center gap-1">
              <X size={12} /> {repairErrors.phone}
            </p>
          )}
        </div>

        <div className="space-y-1">
          <div className="flex items-center justify-between">
            <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest">狀況描述</label>
            <span className={`text-[10px] font-bold ${repairFormData.description.length > DESCRIPTION_MAX_LENGTH ? 'text-rose-500' : 'text-slate-400'}`}>
              {repairFormData.description.length}/{DESCRIPTION_MAX_LENGTH}
            </span>
          </div>
          <div className="relative">
            <MessageCircle className="absolute left-4 top-4 text-slate-400" size={18} />
            <textarea
              ref={descriptionInputRef}
              required
              maxLength={DESCRIPTION_MAX_LENGTH}
              rows={5}
              placeholder="請詳細描述故障或需要維修的狀況..."
              className={`w-full pl-12 pr-4 py-4 bg-slate-50 rounded-2xl border-none outline-none font-bold resize-none transition-all focus:ring-2 focus:ring-indigo-500 focus:bg-white ${repairErrors.description ? 'ring-2 ring-rose-500 bg-rose-50' : ''
                }`}
              value={repairFormData.description}
              onChange={e => setRepairFormData(prev => ({ ...prev, description: e.target.value }))}
            />
          </div>
          {repairErrors.description && (
            <p className="text-[10px] text-rose-500 font-bold mt-1 flex items-center gap-1">
              <X size={12} /> {repairErrors.description}
            </p>
          )}
        </div>

        <div className="space-y-3">
          <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest">現場照片回報 ({repairImages.length})</label>

          {/* 照片預覽區 */}
          {repairImages.length > 0 && (
            <div className="space-y-3 mb-2">
              {repairImages.map((img, idx) => (
                <div key={idx} className="relative rounded-xl overflow-hidden border border-slate-100 group bg-slate-50">
                  <div className="grid grid-cols-3 gap-2">
                    <div className="col-span-1 relative aspect-square">
                      <img src={img.url} className="w-full h-full object-cover" />
                      <button
                        type="button"
                        onClick={() => removeImage(idx, 'REPAIR')}
                        className="absolute top-1 right-1 p-1 bg-rose-500 text-white rounded-full opacity-0 group-hover:opacity-100 transition-opacity"
                      >
                        <X size={12} />
                      </button>
                    </div>
                    <div className="col-span-2 p-3 flex flex-col justify-center">
                      <div className="text-[10px] text-slate-600 space-y-1">
                        <div className="flex items-center gap-1">
                          <Calendar size={10} />
                          <span className="font-bold">拍攝時間：</span>
                          <span>{formatTimestamp(img.timestamp)}</span>
                        </div>
                        <div className="flex items-center gap-1">
                          <MapPin size={10} />
                          <span className="font-bold">拍攝地點：</span>
                          <span className="text-xs">{formatLocation(img.location)}</span>
                        </div>
                      </div>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          )}

          <input
            type="file"
            ref={repairFileInputRef}
            onChange={e => handleFileChange(e, 'REPAIR')}
            accept="image/*"
            multiple
            style={{ position: 'fixed', top: '-1000px', left: '-1000px', visibility: 'hidden' }}
          />

          <button
            type="button"
            onClick={() => repairFileInputRef.current?.click()}
            className={`w-full p-6 border-2 border-dashed rounded-[32px] flex flex-col items-center gap-2 transition-all ${isProcessingImages ? 'bg-slate-50 border-slate-200' : 'border-slate-200 text-slate-400 hover:border-indigo-300 hover:bg-indigo-50'
              }`}
          >
            {isProcessingImages ? (
              <div className="flex flex-col items-center gap-2">
                <div className="w-8 h-8 border-4 border-indigo-500 border-t-transparent rounded-full animate-spin"></div>
                <p className="text-xs font-black text-indigo-500">正在處理照片，請稍候...</p>
              </div>
            ) : (
              <>
                <Camera size={32} />
                <p className="text-xs font-black">點擊開啟相機或上傳照片</p>
                <p className="text-[10px] opacity-60">支援連選多張照片</p>
              </>
            )}
          </button>
        </div>

        <button
          type="submit"
          disabled={!repairFormData.name.trim() || !repairFormData.mission.trim() || !repairFormData.phone.trim() || !repairFormData.description.trim()}
          className="w-full py-5 bg-indigo-600 text-white font-black rounded-3xl shadow-xl shadow-indigo-100 flex items-center justify-center gap-2 transition-all active:scale-95 disabled:opacity-50 disabled:cursor-not-allowed disabled:active:scale-100"
        >
          <Send size={18} /> 送出報修資料
        </button>
      </form>
    </div>
  );

  // 完工回報表單 JSX
  const finishFormJSX = (
    <div className="absolute inset-x-0 bottom-0 top-16 bg-white z-[30] flex flex-col animate-in slide-in-from-bottom duration-300 rounded-t-[40px] shadow-2xl border-t border-slate-100">
      <div className="p-6 flex items-center justify-between border-b border-slate-50">
        <div className="flex items-center gap-3">
          <button onClick={() => {
            setActiveForm('NONE');
            setFinishImages([]);
            setFinishFormData({
              selectedRequestId: '',
              hallName: MOCK_HALLS[0].name,
              reporter: '',
              workDescription: '',
              completionDate: new Date().toISOString().split('T')[0],
            });
            setFinishErrors({});
          }} className="p-2 text-slate-400 hover:bg-slate-50 rounded-full transition-colors">
            <ArrowLeft size={20} />
          </button>
          <h3 className="text-lg font-black text-slate-800">修繕完工回報</h3>
        </div>
        <button onClick={() => {
          setActiveForm('NONE');
          setFinishImages([]);
          setFinishFormData({
            selectedRequestId: '',
            hallName: MOCK_HALLS[0].name,
            name: '',
            position: '',
            phone: '',
            workDescription: '',
            completionDate: new Date().toISOString().split('T')[0],
          });
          setFinishErrors({});
        }} className="p-2 text-slate-400 hover:bg-slate-50 rounded-full transition-colors">
          <X size={20} />
        </button>
      </div>
      <form onSubmit={handleFinishSubmit} className="p-8 space-y-6 overflow-y-auto flex-1 pb-32 custom-scrollbar">
        {unfinishedRequests.length === 0 ? (
          <div className="text-center py-12 space-y-4">
            <div className="p-6 bg-slate-50 rounded-2xl inline-block">
              <CheckCircle2 size={48} className="text-slate-300" />
            </div>
            <p className="text-slate-400 font-bold">目前沒有尚未完工的工單</p>
            <p className="text-xs text-slate-300">所有工單皆已完成</p>
          </div>
        ) : (
          <>
            <div className="space-y-1">
              <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest">選擇工單 *</label>
              <div className="relative">
                <select
                  required
                  className="w-full px-4 py-4 bg-slate-50 rounded-2xl border-none outline-none font-bold appearance-none cursor-pointer focus:ring-2 focus:ring-indigo-500 focus:bg-white transition-all"
                  value={finishFormData.selectedRequestId}
                  onChange={e => {
                    const selectedRequest = unfinishedRequests.find(r => r.id === e.target.value);
                    setFinishFormData(prev => ({
                      ...prev,
                      selectedRequestId: e.target.value,
                      hallName: selectedRequest?.hallName || prev.hallName
                    }));
                  }}
                >
                  <option value="">請選擇要回報的工單</option>
                  {unfinishedRequests.map(req => (
                    <option key={req.id} value={req.id}>
                      {req.id} - {req.title} ({req.hallName})
                    </option>
                  ))}
                </select>
                <ChevronDown className="absolute right-4 top-1/2 -translate-y-1/2 text-slate-400 pointer-events-none" size={20} />
              </div>
              {finishErrors.selectedRequestId && (
                <p className="text-[10px] text-rose-500 font-bold mt-1 flex items-center gap-1">
                  <X size={12} /> {finishErrors.selectedRequestId}
                </p>
              )}
            </div>

            <div className="space-y-1">
              <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest">會館</label>
              <div className="relative">
                <input
                  type="text"
                  readOnly
                  className="w-full px-4 py-4 bg-slate-100 rounded-2xl border-none outline-none font-bold text-slate-600"
                  value={finishFormData.hallName}
                />
              </div>
            </div>

            <div className="space-y-1">
              <div className="flex items-center justify-between">
                <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest">姓名 *</label>
                <span className={`text-[10px] font-bold ${finishFormData.name.length > NAME_MAX_LENGTH ? 'text-rose-500' : 'text-slate-400'}`}>
                  {finishFormData.name.length}/{NAME_MAX_LENGTH}
                </span>
              </div>
              <div className="relative">
                <User className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400" size={18} />
                <input
                  required
                  maxLength={NAME_MAX_LENGTH}
                  placeholder="請輸入您的姓名"
                  className={`w-full pl-12 pr-4 py-4 bg-slate-50 rounded-2xl border-none outline-none font-bold transition-all focus:ring-2 focus:ring-indigo-500 focus:bg-white ${finishErrors.name ? 'ring-2 ring-rose-500 bg-rose-50' : ''
                    }`}
                  value={finishFormData.name}
                  onChange={e => setFinishFormData(prev => ({ ...prev, name: e.target.value }))}
                />
              </div>
              {finishErrors.name && (
                <p className="text-[10px] text-rose-500 font-bold mt-1 flex items-center gap-1">
                  <X size={12} /> {finishErrors.name}
                </p>
              )}
            </div>

            <div className="space-y-1">
              <div className="flex items-center justify-between">
                <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest">職稱 *</label>
                <span className={`text-[10px] font-bold ${finishFormData.position.length > MISSION_MAX_LENGTH ? 'text-rose-500' : 'text-slate-400'}`}>
                  {finishFormData.position.length}/{MISSION_MAX_LENGTH}
                </span>
              </div>
              <div className="relative">
                <User className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400" size={18} />
                <input
                  required
                  maxLength={MISSION_MAX_LENGTH}
                  placeholder="請輸入您的職稱"
                  className={`w-full pl-12 pr-4 py-4 bg-slate-50 rounded-2xl border-none outline-none font-bold transition-all focus:ring-2 focus:ring-indigo-500 focus:bg-white ${finishErrors.position ? 'ring-2 ring-rose-500 bg-rose-50' : ''
                    }`}
                  value={finishFormData.position}
                  onChange={e => setFinishFormData(prev => ({ ...prev, position: e.target.value }))}
                />
              </div>
              {finishErrors.position && (
                <p className="text-[10px] text-rose-500 font-bold mt-1 flex items-center gap-1">
                  <X size={12} /> {finishErrors.position}
                </p>
              )}
            </div>

            <div className="space-y-1">
              <div className="flex items-center justify-between">
                <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest">電話號碼 *</label>
                <span className={`text-[10px] font-bold ${finishFormData.phone.length > PHONE_MAX_LENGTH ? 'text-rose-500' : 'text-slate-400'}`}>
                  {finishFormData.phone.length}/{PHONE_MAX_LENGTH}
                </span>
              </div>
              <div className="relative">
                <Phone className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400" size={18} />
                <input
                  required
                  type="tel"
                  maxLength={PHONE_MAX_LENGTH}
                  placeholder="請輸入電話號碼"
                  className={`w-full pl-12 pr-4 py-4 bg-slate-50 rounded-2xl border-none outline-none font-bold transition-all focus:ring-2 focus:ring-indigo-500 focus:bg-white ${finishErrors.phone ? 'ring-2 ring-rose-500 bg-rose-50' : ''
                    }`}
                  value={finishFormData.phone}
                  onChange={e => setFinishFormData(prev => ({ ...prev, phone: e.target.value }))}
                />
              </div>
              {finishErrors.phone && (
                <p className="text-[10px] text-rose-500 font-bold mt-1 flex items-center gap-1">
                  <X size={12} /> {finishErrors.phone}
                </p>
              )}
            </div>

            <div className="space-y-1">
              <div className="flex items-center justify-between">
                <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest">完工日期</label>
              </div>
              <div className="relative">
                <Calendar className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400" size={18} />
                <input
                  type="date"
                  className="w-full pl-12 pr-4 py-4 bg-slate-50 rounded-2xl border-none outline-none font-bold transition-all focus:ring-2 focus:ring-indigo-500 focus:bg-white"
                  value={finishFormData.completionDate}
                  onChange={e => setFinishFormData(prev => ({ ...prev, completionDate: e.target.value }))}
                />
              </div>
            </div>

            <div className="space-y-1">
              <div className="flex items-center justify-between">
                <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest">完工說明</label>
                <span className={`text-[10px] font-bold ${finishFormData.workDescription.length > DESCRIPTION_MAX_LENGTH ? 'text-rose-500' : 'text-slate-400'}`}>
                  {finishFormData.workDescription.length}/{DESCRIPTION_MAX_LENGTH}
                </span>
              </div>
              <div className="relative">
                <MessageCircle className="absolute left-4 top-4 text-slate-400" size={18} />
                <textarea
                  required
                  maxLength={DESCRIPTION_MAX_LENGTH}
                  rows={5}
                  placeholder="請說明修繕完成的工作內容..."
                  className={`w-full pl-12 pr-4 py-4 bg-slate-50 rounded-2xl border-none outline-none font-bold resize-none transition-all focus:ring-2 focus:ring-indigo-500 focus:bg-white ${finishErrors.workDescription ? 'ring-2 ring-rose-500 bg-rose-50' : ''
                    }`}
                  value={finishFormData.workDescription}
                  onChange={e => setFinishFormData(prev => ({ ...prev, workDescription: e.target.value }))}
                />
              </div>
              {finishErrors.workDescription && (
                <p className="text-[10px] text-rose-500 font-bold mt-1 flex items-center gap-1">
                  <X size={12} /> {finishErrors.workDescription}
                </p>
              )}
            </div>

            <div className="space-y-3">
              <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest">完工照片 ({finishImages.length})</label>

              {finishImages.length > 0 && (
                <div className="space-y-3 mb-2">
                  {finishImages.map((img, idx) => (
                    <div key={idx} className="relative rounded-xl overflow-hidden border border-slate-100 group bg-slate-50">
                      <div className="grid grid-cols-3 gap-2">
                        <div className="col-span-1 relative aspect-square">
                          <img src={img.url} className="w-full h-full object-cover" />
                          <button
                            type="button"
                            onClick={() => removeImage(idx, 'FINISH')}
                            className="absolute top-1 right-1 p-1 bg-rose-500 text-white rounded-full opacity-0 group-hover:opacity-100 transition-opacity"
                          >
                            <X size={12} />
                          </button>
                        </div>
                        <div className="col-span-2 p-3 flex flex-col justify-center">
                          <div className="text-[10px] text-slate-600 space-y-1">
                            <div className="flex items-center gap-1">
                              <Calendar size={10} />
                              <span className="font-bold">拍攝時間：</span>
                              <span>{formatTimestamp(img.timestamp)}</span>
                            </div>
                            <div className="flex items-center gap-1">
                              <MapPin size={10} />
                              <span className="font-bold">拍攝地點：</span>
                              <span className="text-xs">{formatLocation(img.location)}</span>
                            </div>
                          </div>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              )}

              <input
                type="file"
                ref={finishFileInputRef}
                onChange={e => handleFileChange(e, 'FINISH')}
                accept="image/*"
                multiple
                style={{ position: 'fixed', top: '-1000px', left: '-1000px', visibility: 'hidden' }}
              />

              <button
                type="button"
                onClick={() => finishFileInputRef.current?.click()}
                className={`w-full p-6 border-2 border-dashed rounded-[32px] flex flex-col items-center gap-2 transition-all ${isProcessingImages ? 'bg-slate-50 border-slate-200' : 'border-slate-200 text-slate-400 hover:border-indigo-300 hover:bg-indigo-50'
                  }`}
              >
                {isProcessingImages ? (
                  <div className="flex flex-col items-center gap-2">
                    <div className="w-8 h-8 border-4 border-emerald-500 border-t-transparent rounded-full animate-spin"></div>
                    <p className="text-xs font-black text-emerald-500">正在處理照片，請稍候...</p>
                  </div>
                ) : (
                  <>
                    <Camera size={32} />
                    <p className="text-xs font-black">點擊開啟相機或上傳照片</p>
                    <p className="text-[10px] opacity-60">支援連選多張照片</p>
                  </>
                )}
              </button>
            </div>

            <button
              type="submit"
              disabled={!finishFormData.selectedRequestId || !finishFormData.name.trim() || !finishFormData.position.trim() || !finishFormData.phone.trim() || !finishFormData.workDescription.trim()}
              className="w-full py-5 bg-emerald-600 text-white font-black rounded-3xl shadow-xl shadow-emerald-100 flex items-center justify-center gap-2 transition-all active:scale-95 disabled:opacity-50 disabled:cursor-not-allowed disabled:active:scale-100"
            >
              <CheckCircle2 size={18} /> 送出完工回報
            </button>
          </>
        )}
      </form>
    </div>
  );

  // 災害回報表單 JSX
  const disasterFormJSX = (
    <div className="absolute inset-x-0 bottom-0 top-16 bg-white z-[30] flex flex-col animate-in slide-in-from-bottom duration-300 rounded-t-[40px] shadow-2xl border-t border-slate-100">
      <div className="p-6 flex items-center justify-between border-b border-slate-50">
        <div className="flex items-center gap-3">
          <button onClick={() => {
            setActiveForm('NONE');
            setDisasterFormData({
              hallName: MOCK_HALLS[0].name,
              status: HallSecurityStatus.SAFE,
              remark: '',
              reporter: '',
              position: '',
              phone: ''
            });
            setDisasterErrors({});
          }} className="p-2 text-slate-400 hover:bg-slate-50 rounded-full transition-colors">
            <ArrowLeft size={20} />
          </button>
          <h3 className="text-lg font-black text-slate-800">災害狀況回報</h3>
        </div>
        <button onClick={() => {
          setActiveForm('NONE');
          setDisasterFormData({
            hallName: MOCK_HALLS[0].name,
            status: HallSecurityStatus.SAFE,
            remark: '',
            reporter: '',
            position: '',
            phone: ''
          });
          setDisasterErrors({});
        }} className="p-2 text-slate-400 hover:bg-slate-50 rounded-full transition-colors">
          <X size={20} />
        </button>
      </div>
      <form onSubmit={handleDisasterSubmit} className="p-8 space-y-6 overflow-y-auto flex-1 pb-32 custom-scrollbar">
        {!activeDisaster ? (
          <div className="text-center py-12 space-y-4">
            <div className="p-6 bg-slate-50 rounded-2xl inline-block">
              <ShieldAlert size={48} className="text-slate-300" />
            </div>
            <p className="text-slate-400 font-bold">目前沒有進行中的災害回報</p>
            <p className="text-xs text-slate-300">請等待總務局發布災害回報要求</p>
          </div>
        ) : (
          <>
            <div className="bg-rose-50 border border-rose-100 p-4 rounded-2xl space-y-2">
              <div className="flex items-center gap-2">
                <ShieldAlert size={18} className="text-rose-600" />
                <span className="font-black text-rose-600">緊急災害通報</span>
              </div>
              <p className="text-sm font-bold text-rose-800">{activeDisaster.name}</p>
              <p className="text-xs text-rose-600">災害種類：{activeDisaster.type}</p>
            </div>

            <div className="space-y-1">
              <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest">選擇會館 *</label>
              <div className="relative">
                <select
                  required
                  className="w-full px-4 py-4 bg-slate-50 rounded-2xl border-none outline-none font-bold appearance-none cursor-pointer focus:ring-2 focus:ring-indigo-500 focus:bg-white transition-all"
                  value={disasterFormData.hallName}
                  onChange={e => setDisasterFormData(prev => ({ ...prev, hallName: e.target.value }))}
                >
                  {MOCK_HALLS.map(h => <option key={h.id} value={h.name}>{h.name}</option>)}
                </select>
                <ChevronDown className="absolute right-4 top-1/2 -translate-y-1/2 text-slate-400 pointer-events-none" size={20} />
              </div>
            </div>

            <div className="space-y-1">
              <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest">會館狀況 *</label>
              <div className="grid grid-cols-2 gap-3">
                {Object.values(HallSecurityStatus).filter(s => s !== HallSecurityStatus.NONE).map((status) => (
                  <button
                    key={status}
                    type="button"
                    onClick={() => setDisasterFormData(prev => ({ ...prev, status }))}
                    className={`px-4 py-3 rounded-2xl font-black transition-all ${disasterFormData.status === status
                      ? status === HallSecurityStatus.SAFE
                        ? 'bg-emerald-600 text-white shadow-lg'
                        : status === HallSecurityStatus.LIGHT
                          ? 'bg-amber-600 text-white shadow-lg'
                          : 'bg-rose-600 text-white shadow-lg'
                      : 'bg-slate-50 text-slate-600 hover:bg-slate-100'
                      }`}
                  >
                    {status}
                  </button>
                ))}
              </div>
            </div>

            <div className="space-y-1">
              <div className="flex items-center justify-between">
                <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest">姓名 *</label>
                <span className={`text-[10px] font-bold ${disasterFormData.reporter.length > NAME_MAX_LENGTH ? 'text-rose-500' : 'text-slate-400'}`}>
                  {disasterFormData.reporter.length}/{NAME_MAX_LENGTH}
                </span>
              </div>
              <div className="relative">
                <User className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400" size={18} />
                <input
                  required
                  maxLength={NAME_MAX_LENGTH}
                  placeholder="請輸入您的姓名"
                  className={`w-full pl-12 pr-4 py-4 bg-slate-50 rounded-2xl border-none outline-none font-bold transition-all focus:ring-2 focus:ring-indigo-500 focus:bg-white ${disasterErrors.reporter ? 'ring-2 ring-rose-500 bg-rose-50' : ''
                    }`}
                  value={disasterFormData.reporter}
                  onChange={e => setDisasterFormData(prev => ({ ...prev, reporter: e.target.value }))}
                />
              </div>
              {disasterErrors.reporter && (
                <p className="text-[10px] text-rose-500 font-bold mt-1 flex items-center gap-1">
                  <X size={12} /> {disasterErrors.reporter}
                </p>
              )}
            </div>

            <div className="space-y-1">
              <div className="flex items-center justify-between">
                <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest">職稱 *</label>
                <span className={`text-[10px] font-bold ${disasterFormData.position.length > REPORTER_MAX_LENGTH ? 'text-rose-500' : 'text-slate-400'}`}>
                  {disasterFormData.position.length}/{REPORTER_MAX_LENGTH}
                </span>
              </div>
              <div className="relative">
                <Briefcase className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400" size={18} />
                <input
                  required
                  maxLength={REPORTER_MAX_LENGTH}
                  placeholder="請輸入您的職稱"
                  className={`w-full pl-12 pr-4 py-4 bg-slate-50 rounded-2xl border-none outline-none font-bold transition-all focus:ring-2 focus:ring-indigo-500 focus:bg-white ${disasterErrors.position ? 'ring-2 ring-rose-500 bg-rose-50' : ''
                    }`}
                  value={disasterFormData.position}
                  onChange={e => setDisasterFormData(prev => ({ ...prev, position: e.target.value }))}
                />
              </div>
              {disasterErrors.position && (
                <p className="text-[10px] text-rose-500 font-bold mt-1 flex items-center gap-1">
                  <X size={12} /> {disasterErrors.position}
                </p>
              )}
            </div>

            <div className="space-y-1">
              <div className="flex items-center justify-between">
                <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest">手機號碼 *</label>
                <span className={`text-[10px] font-bold ${disasterFormData.phone.length > PHONE_MAX_LENGTH ? 'text-rose-500' : 'text-slate-400'}`}>
                  {disasterFormData.phone.length}/{PHONE_MAX_LENGTH}
                </span>
              </div>
              <div className="relative">
                <Phone className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400" size={18} />
                <input
                  required
                  type="tel"
                  maxLength={PHONE_MAX_LENGTH}
                  placeholder="請輸入手機號碼"
                  className={`w-full pl-12 pr-4 py-4 bg-slate-50 rounded-2xl border-none outline-none font-bold transition-all focus:ring-2 focus:ring-indigo-500 focus:bg-white ${disasterErrors.phone ? 'ring-2 ring-rose-500 bg-rose-50' : ''
                    }`}
                  value={disasterFormData.phone}
                  onChange={e => setDisasterFormData(prev => ({ ...prev, phone: e.target.value }))}
                />
              </div>
              {disasterErrors.phone && (
                <p className="text-[10px] text-rose-500 font-bold mt-1 flex items-center gap-1">
                  <X size={12} /> {disasterErrors.phone}
                </p>
              )}
            </div>

            <div className="space-y-1">
              <div className="flex items-center justify-between">
                <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest">狀況說明</label>
                <span className={`text-[10px] font-bold ${disasterFormData.remark.length > DESCRIPTION_MAX_LENGTH ? 'text-rose-500' : 'text-slate-400'}`}>
                  {disasterFormData.remark.length}/{DESCRIPTION_MAX_LENGTH}
                </span>
              </div>
              <div className="relative">
                <MessageCircle className="absolute left-4 top-4 text-slate-400" size={18} />
                <textarea
                  maxLength={DESCRIPTION_MAX_LENGTH}
                  rows={4}
                  placeholder="請說明會館目前的狀況..."
                  className={`w-full pl-12 pr-4 py-4 bg-slate-50 rounded-2xl border-none outline-none font-bold resize-none transition-all focus:ring-2 focus:ring-indigo-500 focus:bg-white ${disasterErrors.remark ? 'ring-2 ring-rose-500 bg-rose-50' : ''
                    }`}
                  value={disasterFormData.remark}
                  onChange={e => setDisasterFormData(prev => ({ ...prev, remark: e.target.value }))}
                />
              </div>
              {disasterErrors.remark && (
                <p className="text-[10px] text-rose-500 font-bold mt-1 flex items-center gap-1">
                  <X size={12} /> {disasterErrors.remark}
                </p>
              )}
            </div>

            <button
              type="submit"
              disabled={!disasterFormData.reporter.trim() || !disasterFormData.phone.trim()}
              className="w-full py-5 bg-rose-600 text-white font-black rounded-3xl shadow-xl shadow-rose-100 flex items-center justify-center gap-2 transition-all active:scale-95 disabled:opacity-50 disabled:cursor-not-allowed disabled:active:scale-100"
            >
              <ShieldAlert size={18} /> 送出災害回報
            </button>
          </>
        )}
      </form>
    </div>
  );

  return (
    <div className="fixed inset-0 z-[200] bg-slate-50 flex flex-col overflow-hidden">
      {/* 頂部導覽列 */}
      <div className="h-16 bg-indigo-700 flex items-center justify-between px-6 text-white shrink-0 shadow-lg">
        <div className="flex items-center gap-3">
          <div className="w-8 h-8 bg-white/20 rounded-lg flex items-center justify-center">
            <Wrench size={18} className="text-white" />
          </div>
          <span className="font-black text-lg tracking-tight">會館設施維護系統</span>
        </div>
        <button
          onClick={onClose}
          className="p-2 hover:bg-white/10 rounded-full transition-all active:scale-95"
        >
          <X size={24} />
        </button>
      </div>

      {/* 主選單區 - 改為垂直大按鈕 */}
      <div className="flex-1 overflow-y-auto p-6 space-y-4 bg-slate-50 custom-scrollbar">
        <div className="mb-8 mt-2">
          <h2 className="text-2xl font-black text-slate-800 mb-2">您好，{liffProfile?.displayName || '志工伙伴'}</h2>
          <p className="text-slate-500 font-bold">請選擇下方功能開始通報或回報進度</p>
        </div>

        {/* 垂直按鈕清單 */}
        <div className="grid grid-cols-1 gap-4">
          <button
            onClick={() => setActiveForm('REPAIR')}
            className="w-full bg-white p-6 rounded-[32px] flex items-center gap-6 shadow-sm border border-slate-200 hover:border-indigo-300 hover:bg-indigo-50/50 transition-all active:scale-[0.98] group text-left"
          >
            <div className="p-5 bg-indigo-100 rounded-3xl group-hover:bg-indigo-200 transition-colors">
              <Wrench size={32} className="text-indigo-600" />
            </div>
            <div>
              <span className="block text-xl font-black text-slate-800 mb-1">線上報修通報</span>
              <span className="text-sm text-slate-500 font-bold">填寫新的設施損壞報修申請</span>
            </div>
          </button>

          <button
            onClick={() => setActiveForm('FINISH')}
            className="w-full bg-white p-6 rounded-[32px] flex items-center gap-6 shadow-sm border border-slate-200 hover:border-emerald-300 hover:bg-emerald-50/50 transition-all active:scale-[0.98] group text-left"
          >
            <div className="p-5 bg-emerald-100 rounded-3xl group-hover:bg-emerald-200 transition-colors">
              <CheckCircle2 size={32} className="text-emerald-600" />
            </div>
            <div>
              <span className="block text-xl font-black text-slate-800 mb-1">修繕完工回報</span>
              <span className="text-sm text-slate-500 font-bold">回報已完成的維修工作進度</span>
            </div>
          </button>

          <button
            onClick={(e) => {
              e.preventDefault();
              if (activeDisaster) {
                setActiveForm('DISASTER');
              } else {
                alert('目前無進行中之災情報告');
              }
            }}
            className={`w-full bg-white p-6 rounded-[32px] flex items-center gap-6 shadow-sm border border-slate-200 hover:border-rose-300 hover:bg-rose-50/50 transition-all active:scale-[0.98] group text-left ${!activeDisaster ? 'opacity-50 grayscale' : ''}`}
          >
            <div className="p-5 bg-rose-100 rounded-3xl group-hover:bg-rose-200 transition-colors">
              <ShieldAlert size={32} className="text-rose-600" />
            </div>
            <div>
              <div className="flex items-center gap-2 mb-1">
                <span className="text-xl font-black text-slate-800">災害狀況回報</span>
                {activeDisaster && <span className="px-2 py-0.5 bg-rose-600 text-white text-[10px] rounded-full animate-pulse">緊急</span>}
              </div>
              <span className="text-sm text-slate-500 font-bold">
                {activeDisaster ? `針對「${activeDisaster.name}」進行通報` : '目前無進行中之災害通報項目'}
              </span>
            </div>
          </button>
        </div>

        {/* 底部資訊 */}
        <div className="pt-12 pb-6 text-center">
          <p className="text-slate-300 text-[10px] font-black uppercase tracking-widest">TSA Facility Management System</p>
          <p className="text-slate-300 text-[10px] mt-1">Version 2.0.0 (LINE LIFF)</p>
        </div>
      </div>

      {/* 表單內容 - 滿版顯示 */}
      {activeForm === 'REPAIR' && <div className="fixed inset-0 z-[210]">{repairFormJSX}</div>}
      {activeForm === 'FINISH' && <div className="fixed inset-0 z-[210]">{finishFormJSX}</div>}
      {activeForm === 'DISASTER' && <div className="fixed inset-0 z-[210]">{disasterFormJSX}</div>}
    </div>
  );
};

export default MobileSimulation;
