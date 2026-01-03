
import React from 'react';
import { 
  Wrench, 
  Clock, 
  FileText,
  Hammer,
  Archive,
  Zap,
  Flame,
  Plus,
  Wind,
  HeartPulse,
  Wifi,
  Droplets,
  Coffee,
  Sprout,
  Paintbrush,
  ShieldCheck
} from 'lucide-react';
import { RepairStatus, Urgency, Category, Hall, Permission, PermissionAction } from './types';

export const STATUS_CONFIG = {
  [RepairStatus.PENDING]: { label: '待處理', color: 'bg-amber-100 text-amber-700 border-amber-200', icon: <Clock size={14} /> },
  [RepairStatus.IN_PROGRESS]: { label: '進行中', color: 'bg-blue-100 text-blue-700 border-blue-200', icon: <Wrench size={14} /> },
  [RepairStatus.SIGNED]: { label: '已送簽呈', color: 'bg-purple-100 text-purple-700 border-purple-200', icon: <FileText size={14} /> },
  [RepairStatus.CONSTRUCTION_DONE]: { label: '施工完畢', color: 'bg-indigo-100 text-indigo-700 border-indigo-200', icon: <Hammer size={14} /> },
  [RepairStatus.CLOSED]: { label: '已結案', color: 'bg-emerald-100 text-emerald-700 border-emerald-200', icon: <Archive size={14} /> },
};

export const URGENCY_CONFIG = {
  [Urgency.LOW]: { label: '低', color: 'text-slate-500 bg-slate-100' },
  [Urgency.MEDIUM]: { label: '中', color: 'text-blue-600 bg-blue-50' },
  [Urgency.HIGH]: { label: '高', color: 'text-orange-600 bg-orange-50' },
  [Urgency.EMERGENCY]: { label: '緊急', color: 'text-red-600 bg-red-50 font-bold border border-red-200' },
};

export const CATEGORY_ICONS: Record<Category, React.ReactNode> = {
  [Category.AC]: <Wind size={18} className="text-cyan-500" />,
  [Category.ELECTRICAL]: <Zap size={18} className="text-yellow-500" />,
  [Category.FIRE]: <Flame size={18} className="text-red-500" />,
  [Category.AED]: <HeartPulse size={18} className="text-rose-500" />,
  [Category.WEAK_CURRENT]: <Wifi size={18} className="text-indigo-500" />,
  [Category.PLUMBING]: <Droplets size={18} className="text-blue-500" />,
  [Category.WATER]: <Coffee size={18} className="text-amber-600" />,
  [Category.GARDENING]: <Sprout size={18} className="text-emerald-500" />,
  [Category.DECO]: <Paintbrush size={18} className="text-stone-500" />,
  [Category.OTHER]: <Plus size={18} className="text-slate-500" />,
};

export const HEALTH_CHECK_CONFIG = [
  { key: Category.AC, label: '空調', icon: <Wind size={14} /> },
  { key: Category.ELECTRICAL, label: '機電', icon: <Zap size={14} /> },
  { key: Category.FIRE, label: '消防', icon: <ShieldCheck size={14} /> },
  { key: Category.WATER, label: '飲水機', icon: <Droplets size={14} /> },
  { key: Category.AED, label: 'AED', icon: <HeartPulse size={14} /> },
];

export const MOCK_HALLS: Hall[] = [
  { 
    id: 'h1', 
    name: '台北至善文化會館', 
    area: '台北一區', 
    district: '台北圈', 
    address: '台北市士林區至善路二段250號',
    builtDate: '1995-03-24',
    phoneEntries: [
      { id: 'h1-p1', value: '02-2881-1234', taxId: '04146458' },
      { id: 'h1-p2', value: '02-2881-5678', taxId: '12345678' }
    ],
    networkEntries: [
      { id: 'h1-n1', value: 'TSA-TPE-ZS-001', taxId: '04146458' },
      { id: 'h1-n2', value: 'TSA-TPE-ZS-002', taxId: '12345678' }
    ],
    photoUrl: 'https://images.unsplash.com/photo-1577083165633-14ebcdb0f658?w=800&q=80',
    electricalLayoutUrls: [
      'https://images.unsplash.com/photo-1581094794329-c8112a89af12?w=1200&q=80',
      'https://images.unsplash.com/photo-1544724569-5f546fd6f2b5?w=1200&q=80'
    ],
    floorPlanUrls: [
      'https://images.unsplash.com/photo-1503387762-592dea58ef23?w=1200&q=80',
      'https://images.unsplash.com/photo-1531834363041-041bd4174ad3?w=1200&q=80'
    ]
  },
  { 
    id: 'h2', 
    name: '板橋文化會館', 
    area: '新北一區', 
    district: '台北圈', 
    address: '新北市板橋區中正路100號',
    builtDate: '2008-11-12',
    phoneEntries: [
      { id: 'h2-p1', value: '02-2968-5678', taxId: '04146458' }
    ],
    networkEntries: [
      { id: 'h2-n1', value: 'TSA-NTPC-PC-022', taxId: '04146458' }
    ],
    photoUrl: 'https://images.unsplash.com/photo-1541888946425-d81bb19480c5?w=800&q=80',
    electricalLayoutUrls: ['https://images.unsplash.com/photo-1517646287270-a5a9ca602e5c?w=1200&q=80'],
    floorPlanUrls: ['https://images.unsplash.com/photo-1497366216548-37526070297c?w=1200&q=80']
  },
  { 
    id: 'h3', 
    name: '桃園文化會館', 
    area: '桃園一區', 
    district: '桃園圈', 
    address: '桃園市桃園區文中路',
    builtDate: '2015-05-20',
    phoneEntries: [{ id: 'h3-p1', value: '03-332-9988', taxId: '04146458' }],
    networkEntries: [{ id: 'h3-n1', value: 'TSA-TY-TY-015', taxId: '04146458' }],
    photoUrl: 'https://images.unsplash.com/photo-1486406146926-c627a92ad1ab?w=800&q=80',
    electricalLayoutUrls: [],
    floorPlanUrls: []
  },
  { 
    id: 'h4', 
    name: '台中文化會館', 
    area: '台中一區', 
    district: '台中圈', 
    address: '台中市西區五權西路',
    builtDate: '1988-12-05',
    phoneEntries: [{ id: 'h4-p1', value: '04-2372-1122', taxId: '04146458' }],
    networkEntries: [{ id: 'h4-n1', value: 'TSA-TC-W-009', taxId: '04146458' }],
    photoUrl: 'https://images.unsplash.com/photo-1564013799919-ab600027ffc6?w=800&q=80',
    electricalLayoutUrls: [],
    floorPlanUrls: []
  },
  { 
    id: 'h5', 
    name: '高雄文化會館', 
    area: '高雄一區', 
    district: '高雄圈', 
    address: '高雄市前金區民生二路',
    builtDate: '2002-07-15',
    phoneEntries: [{ id: 'h5-p1', value: '07-211-3344', taxId: '04146458' }],
    networkEntries: [{ id: 'h5-n1', value: 'TSA-KH-M-003', taxId: '04146458' }],
    photoUrl: 'https://images.unsplash.com/photo-1554435493-93422e8220c8?w=800&q=80',
    electricalLayoutUrls: [],
    floorPlanUrls: []
  },
];

export const PAYMENT_ENTITIES = ['TSA法人', '地區組織', '個人捐款', '其他'];

export const STATUS_ORDER = [
  RepairStatus.PENDING,
  RepairStatus.IN_PROGRESS,
  RepairStatus.SIGNED,
  RepairStatus.CONSTRUCTION_DONE,
  RepairStatus.CLOSED
];

export const EQUIPMENT_CODES: Record<string, string> = {
  '會堂椅': '001', '辦公椅': '002', '冰箱': '006', '投影機': '007', '電視': '008', '紅龍': '016',
};

export const EQUIPMENT_CATEGORIES = ['家具', '家電', '資訊設備', '影音設備', '事務機', '其他'];

export const WATER_PRICE_LIST = {
  '程控機': [
    { name: '微電腦基板', price: 3200 },
    { name: '微電腦PC板-顯示面板', price: 1500 },
    { name: '微電腦PC板-按鍵機板', price: 700 },
    { name: '電熱管-單支', price: 1500 },
    { name: '冰/溫缸電熱管', price: 1200 },
    { name: '熱缸組合(含電熱管)', price: 5200 },
    { name: '交換缸組合', price: 6500 },
    { name: '冰缸組合', price: 5200 },
    { name: '出水龍頭', price: 850 },
    { name: '水位器-1組', price: 1200 },
    { name: '溫度感知器', price: 450 },
    { name: '水位感知線', price: 450 },
    { name: '清缸保養', price: 3500 },
  ],
  'RO機': [
    { name: '5微米PP濾芯', price: 300, isFilter: true, filterKey: 'f1_pp5' },
    { name: '顆粒活性碳濾芯', price: 300, isFilter: true, filterKey: 'f2_granular' },
    { name: '塊狀活性碳濾芯', price: 500, isFilter: true, filterKey: 'f3_block' },
    { name: '逆滲透薄膜(RO)', price: 1800, isFilter: true, filterKey: 'f4_ro' },
    { name: '後置活性碳濾芯', price: 500, isFilter: true, filterKey: 'f5_post' },
    { name: '變壓器', price: 500 },
    { name: '高壓開關', price: 450 },
    { name: '低壓開關', price: 450 },
    { name: '加壓馬達(含變壓器)', price: 2200 },
    { name: '廢水比', price: 350 },
  ],
  '全系列': [
    { name: '壓縮機', price: 6200 },
    { name: '冷媒', price: 2800 },
    { name: '漏電斷路器', price: 1000 },
    { name: '電磁閥-出水', price: 800 },
    { name: '電磁閥-進水', price: 1000 },
    { name: '風扇葉片', price: 350 },
    { name: '風扇馬達組合(含葉片)', price: 1200 },
    { name: '熱敏/熱顯', price: 0 },
    { name: '排線組', price: 0 },
    { name: '水質檢驗', price: 1200 },
  ]
};

// 權限管理相關常數
export const MODULES = [
  { id: 'dashboard', name: '首頁', nameEn: 'Dashboard' },
  { id: 'halls', name: '會館基本資料', nameEn: 'Halls' },
  { id: 'reports', name: '回報管理', nameEn: 'Reports' },
  { id: 'requests', name: '工單管理', nameEn: 'Requests' },
  { id: 'equipment', name: '會館設施', nameEn: 'Equipment' },
  { id: 'water', name: '飲水機保養', nameEn: 'Water' },
  { id: 'aed', name: 'AED管理', nameEn: 'AED' },
  { id: 'vehicle', name: '公務車管理', nameEn: 'Vehicle' },
  { id: 'contract', name: '合約管理', nameEn: 'Contract' },
  { id: 'disaster', name: '災害回報', nameEn: 'Disaster' },
  { id: 'settings', name: '系統設定', nameEn: 'Settings' },
  { id: 'permissions', name: '權限管理', nameEn: 'Permissions' },
];

export const PERMISSION_ACTIONS = [
  { id: 'view', name: '查看', nameEn: 'View' },
  { id: 'create', name: '新增', nameEn: 'Create' },
  { id: 'edit', name: '編輯', nameEn: 'Edit' },
  { id: 'delete', name: '刪除', nameEn: 'Delete' },
  { id: 'verify', name: '核實', nameEn: 'Verify' },
  { id: 'manage', name: '管理', nameEn: 'Manage' },
];

// 生成所有權限
export const ALL_PERMISSIONS: Permission[] = MODULES.flatMap(module =>
  PERMISSION_ACTIONS.map(action => ({
    id: `${module.id}:${action.id}`,
    name: `${module.name} - ${action.name}`,
    module: module.id,
    action: action.id as PermissionAction,
    description: `${module.nameEn} ${action.nameEn} permission`
  }))
);

// 預設角色
export const DEFAULT_ROLES = [
  {
    id: 'admin',
    name: '系統管理員',
    description: '擁有所有模組的完整權限',
    permissions: ALL_PERMISSIONS.map(p => p.id),
    isSystem: true,
    createdAt: new Date().toISOString()
  },
  {
    id: 'manager',
    name: '總務管理員',
    description: '可管理所有會館的工單、設施、合約等',
    permissions: [
      ...MODULES.filter(m => ['dashboard', 'halls', 'reports', 'requests', 'equipment', 'water', 'aed', 'vehicle', 'contract', 'disaster'].includes(m.id))
        .flatMap(m => PERMISSION_ACTIONS.filter(a => a.id !== 'manage').map(a => `${m.id}:${a.id}`)),
      'settings:view'
    ],
    isSystem: true,
    createdAt: new Date().toISOString()
  },
  {
    id: 'hall_manager',
    name: '執行秘書',
    description: '僅能管理所屬會館的資料',
    permissions: [
      'dashboard:view',
      'halls:view',
      'reports:view',
      'reports:create',
      'reports:verify',
      'requests:view',
      'requests:create',
      'requests:edit',
      'equipment:view',
      'equipment:create',
      'equipment:edit',
      'water:view',
      'water:create',
      'water:edit',
      'aed:view',
      'aed:create',
      'aed:edit',
      'vehicle:view',
      'contract:view',
      'disaster:view',
      'disaster:create',
    ],
    isSystem: true,
    createdAt: new Date().toISOString()
  },
  {
    id: 'user',
    name: '一般使用者',
    description: '僅能查看和新增回報',
    permissions: [
      'dashboard:view',
      'reports:view',
      'reports:create',
      'requests:view',
      'equipment:view',
      'water:view',
      'aed:view',
      'vehicle:view',
      'contract:view',
      'disaster:view',
      'disaster:create',
    ],
    isSystem: true,
    createdAt: new Date().toISOString()
  },
  {
    id: 'tester',
    name: '系統測試員',
    description: '可查看除系統設定外的所有畫面',
    permissions: [
      'dashboard:view',
      'halls:view',
      'reports:view',
      'reports:create',
      'reports:edit',
      'reports:verify',
      'requests:view',
      'requests:create',
      'requests:edit',
      'equipment:view',
      'equipment:create',
      'equipment:edit',
      'water:view',
      'water:create',
      'water:edit',
      'aed:view',
      'aed:create',
      'aed:edit',
      'vehicle:view',
      'vehicle:create',
      'vehicle:edit',
      'contract:view',
      'contract:create',
      'contract:edit',
      'disaster:view',
      'disaster:create',
      'disaster:edit',
    ],
    isSystem: true,
    createdAt: new Date().toISOString()
  }
];
