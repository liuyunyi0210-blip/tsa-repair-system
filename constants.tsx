
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
    name: '至善文化會館',
    area: '台北一區',
    district: '台北圈',
    address: '11143 台北市士林區至善路二段250號',
    builtDate: '1995-03-24',
    phoneEntries: [{ id: 'h1-p1', value: '02-28881777', taxId: '04146458' }],
    networkEntries: [{ id: 'h1-n1', value: 'TSA-TPE-ZS-001', taxId: '04146458' }],
    photoUrl: 'https://images.unsplash.com/photo-1577083165633-14ebcdb0f658?w=800&q=80',
    electricalLayoutUrls: ['https://images.unsplash.com/photo-1581094794329-c8112a89af12?w=1200&q=80'],
    floorPlanUrls: ['https://images.unsplash.com/photo-1503387762-592dea58ef23?w=1200&q=80']
  },
  {
    id: 'h2',
    name: '花蓮文化會館',
    area: '東部一區',
    district: '花蓮圈',
    address: '97057 花蓮縣花蓮市富裕五街71號',
    builtDate: '2000-01-01',
    phoneEntries: [{ id: 'h2-p1', value: '03-8571101', taxId: '04146458' }],
    networkEntries: [],
    electricalLayoutUrls: [],
    floorPlanUrls: []
  },
  {
    id: 'h3',
    name: '宜蘭文化會館',
    area: '台北二區',
    district: '宜蘭圈',
    address: '26057 宜蘭市陽明路131巷99號',
    builtDate: '2000-01-01',
    phoneEntries: [{ id: 'h3-p1', value: '03-9372363', taxId: '04146458' }],
    networkEntries: [],
    electricalLayoutUrls: [],
    floorPlanUrls: []
  },
  {
    id: 'h4',
    name: '基隆文化會館',
    area: '台北三區',
    district: '基隆圈',
    address: '20442 基隆市安樂路1段150號1、2樓',
    builtDate: '2000-01-01',
    phoneEntries: [{ id: 'h4-p1', value: '02-24294999', taxId: '04146458' }],
    networkEntries: [],
    electricalLayoutUrls: [],
    floorPlanUrls: []
  },
  {
    id: 'h5',
    name: '淡水文化會館',
    area: '新北一區',
    district: '台北圈',
    address: '25147 新北市淡水區中正東路1段3巷9號3樓',
    builtDate: '2000-01-01',
    phoneEntries: [{ id: 'h5-p1', value: '02-26283511', taxId: '04146458' }],
    networkEntries: [],
    electricalLayoutUrls: [],
    floorPlanUrls: []
  },
  {
    id: 'h6',
    name: '汐止文化會館',
    area: '新北二區',
    district: '台北圈',
    address: '22178 新北市汐止區大安街50號3樓',
    builtDate: '2000-01-01',
    phoneEntries: [{ id: 'h6-p1', value: '02-86478998', taxId: '04146458' }],
    networkEntries: [],
    electricalLayoutUrls: [],
    floorPlanUrls: []
  },
  {
    id: 'h7',
    name: '瑞光文化會館',
    area: '台北一區',
    district: '台北圈',
    address: '11466 台北市內湖區瑞光路26巷20弄25號2樓',
    builtDate: '2000-01-01',
    phoneEntries: [{ id: 'h7-p1', value: '02-87920266', taxId: '04146458' }],
    networkEntries: [],
    electricalLayoutUrls: [],
    floorPlanUrls: []
  },
  {
    id: 'h8',
    name: '玉成文化會館',
    area: '台北二區',
    district: '台北圈',
    address: '11561 台北市南港區八德路四段768巷5號B1樓',
    builtDate: '2000-01-01',
    phoneEntries: [{ id: 'h8-p1', value: '02-27828721', taxId: '04146458' }],
    networkEntries: [],
    electricalLayoutUrls: [],
    floorPlanUrls: []
  },
  {
    id: 'h9',
    name: '錦州文化會館',
    area: '台北一區',
    district: '台北圈',
    address: '10491 台北市中山區中山北路二段137巷24-1號',
    builtDate: '2000-01-01',
    phoneEntries: [],
    networkEntries: [],
    electricalLayoutUrls: [],
    floorPlanUrls: []
  },
  {
    id: 'h10',
    name: '藝文會堂',
    area: '台北一區',
    district: '台北圈',
    address: '10450 台北市中山區中山北路二段137巷24-1號',
    builtDate: '2000-01-01',
    phoneEntries: [{ id: 'h10-p1', value: '02-25234100', taxId: '04146458' }],
    networkEntries: [],
    electricalLayoutUrls: [],
    floorPlanUrls: []
  },
  {
    id: 'h11',
    name: '文化會堂',
    area: '台北一區',
    district: '台北圈',
    address: '10450 台北市中山區中山北路二段115巷39號B1',
    builtDate: '2000-01-01',
    phoneEntries: [{ id: 'h11-p1', value: '02-25237451', taxId: '04146458' }],
    networkEntries: [],
    electricalLayoutUrls: [],
    floorPlanUrls: []
  },
  {
    id: 'h12',
    name: '中興文化會館',
    area: '台北二區',
    district: '台北圈',
    address: '10847 台北市萬華區成都路110號2、3樓',
    builtDate: '2000-01-01',
    phoneEntries: [{ id: 'h12-p1', value: '02-23831747', taxId: '04146458' }],
    networkEntries: [],
    electricalLayoutUrls: [],
    floorPlanUrls: []
  },
  {
    id: 'h13',
    name: '景美文化會館',
    area: '台北三區',
    district: '台北圈',
    address: '23146 新北市新店區中正路542之3號5樓',
    builtDate: '2000-01-01',
    phoneEntries: [{ id: 'h13-p1', value: '02-86676739', taxId: '04146458' }],
    networkEntries: [],
    electricalLayoutUrls: [],
    floorPlanUrls: []
  },
  {
    id: 'h14',
    name: '雙和文化會館',
    area: '新北一區',
    district: '台北圈',
    address: '23557 新北市中和區中山路二段362號2樓',
    builtDate: '2000-01-01',
    phoneEntries: [{ id: 'h14-p1', value: '02-82421767', taxId: '04146458' }],
    networkEntries: [],
    electricalLayoutUrls: [],
    floorPlanUrls: []
  },
  {
    id: 'h15',
    name: '板橋文化會館',
    area: '新北二區',
    district: '台北圈',
    address: '22041 新北市板橋區民生路二段232號3樓',
    builtDate: '2008-11-12',
    phoneEntries: [{ id: 'h15-p1', value: '02-22575012', taxId: '04146458' }],
    networkEntries: [{ id: 'h15-n1', value: 'TSA-NTPC-PC-022', taxId: '04146458' }],
    photoUrl: 'https://images.unsplash.com/photo-1541888946425-d81bb19480c5?w=800&q=80',
    electricalLayoutUrls: ['https://images.unsplash.com/photo-1517646287270-a5a9ca602e5c?w=1200&q=80'],
    floorPlanUrls: ['https://images.unsplash.com/photo-1497366216548-37526070297c?w=1200&q=80']
  },
  {
    id: 'h16',
    name: '三重文化會館',
    area: '新北三區',
    district: '台北圈',
    address: '24159 新北市三重區重新路五段609巷2號3樓之1',
    builtDate: '2000-01-01',
    phoneEntries: [{ id: 'h16-p1', value: '02-22783373', taxId: '04146458' }],
    networkEntries: [],
    electricalLayoutUrls: [],
    floorPlanUrls: []
  },
  {
    id: 'h17',
    name: '新莊文化會館',
    area: '新北三區',
    district: '台北圈',
    address: '24257 新北市新莊區中正路657之10號3樓',
    builtDate: '2000-01-01',
    phoneEntries: [{ id: 'h17-p1', value: '02-29016617', taxId: '04146458' }],
    networkEntries: [],
    electricalLayoutUrls: [],
    floorPlanUrls: []
  },
  {
    id: 'h18',
    name: '桃園文化會館',
    area: '桃園一區',
    district: '桃園圈',
    address: '33743 桃園市大園區高鐵北路二段140號',
    builtDate: '2015-05-20',
    phoneEntries: [{ id: 'h18-p1', value: '03-3816871', taxId: '04146458' }],
    networkEntries: [{ id: 'h18-n1', value: 'TSA-TY-TY-015', taxId: '04146458' }],
    photoUrl: 'https://images.unsplash.com/photo-1486406146926-c627a92ad1ab?w=800&q=80',
    electricalLayoutUrls: [],
    floorPlanUrls: []
  },
  {
    id: 'h19',
    name: '新竹文化會館',
    area: '桃園二區',
    district: '新竹圈',
    address: '30050 新竹市國華街68號',
    builtDate: '2000-01-01',
    phoneEntries: [{ id: 'h19-p1', value: '03-5439850', taxId: '04146458' }],
    networkEntries: [],
    electricalLayoutUrls: [],
    floorPlanUrls: []
  },
  {
    id: 'h20',
    name: '台中文化會館',
    area: '台中一區',
    district: '台中圈',
    address: '40758 台中市西屯區大容東街90號2、4樓',
    builtDate: '1988-12-05',
    phoneEntries: [{ id: 'h20-p1', value: '04-23270259', taxId: '04146458' }],
    networkEntries: [{ id: 'h20-n1', value: 'TSA-TC-W-009', taxId: '04146458' }],
    photoUrl: 'https://images.unsplash.com/photo-1564013799919-ab600027ffc6?w=800&q=80',
    electricalLayoutUrls: [],
    floorPlanUrls: []
  },
  {
    id: 'h21',
    name: '霧峰文化會館',
    area: '台中二區',
    district: '台中圈',
    address: '41355 台中市霧峰區四德里中投西路二段76號',
    builtDate: '2000-01-01',
    phoneEntries: [{ id: 'h21-p1', value: '04-23391600', taxId: '04146458' }],
    networkEntries: [],
    electricalLayoutUrls: [],
    floorPlanUrls: []
  },
  {
    id: 'h22',
    name: '彰化文化會館',
    area: '彰化一區',
    district: '彰化圈',
    address: '50447 彰化縣秀水鄉安溪村平安五街61號',
    builtDate: '2000-01-01',
    phoneEntries: [{ id: 'h22-p1', value: '04-7633643', taxId: '04146458' }],
    networkEntries: [],
    electricalLayoutUrls: [],
    floorPlanUrls: []
  },
  {
    id: 'h23',
    name: '雲林文化會館',
    area: '雲林一區',
    district: '雲林圈',
    address: '64052 雲林縣斗六市北平路46巷5號',
    builtDate: '2000-01-01',
    phoneEntries: [{ id: 'h23-p1', value: '05-5353600', taxId: '04146458' }],
    networkEntries: [],
    electricalLayoutUrls: [],
    floorPlanUrls: []
  },
  {
    id: 'h24',
    name: '雲林東勢會館',
    area: '雲林二區',
    district: '雲林圈',
    address: '63555 雲林縣東勢鄉東南村20鄰康安路269號',
    builtDate: '2000-01-01',
    phoneEntries: [{ id: 'h24-p1', value: '05-6998153', taxId: '04146458' }],
    networkEntries: [],
    electricalLayoutUrls: [],
    floorPlanUrls: []
  },
  {
    id: 'h25',
    name: '西螺文化會館',
    area: '雲林一區',
    district: '雲林圈',
    address: '64848 雲林縣西螺鎮中山路225號3樓',
    builtDate: '2000-01-01',
    phoneEntries: [{ id: 'h25-p1', value: '05-5860209', taxId: '04146458' }],
    networkEntries: [],
    electricalLayoutUrls: [],
    floorPlanUrls: []
  },
  {
    id: 'h26',
    name: '友愛文化會館',
    area: '嘉義一區',
    district: '嘉義圈',
    address: '60088 嘉義市友愛路288號7樓3',
    builtDate: '2000-01-01',
    phoneEntries: [{ id: 'h26-p1', value: '05-2313211', taxId: '04146458' }],
    networkEntries: [],
    electricalLayoutUrls: [],
    floorPlanUrls: []
  },
  {
    id: 'h27',
    name: '佳里文化會館',
    area: '台南二區',
    district: '台南圈',
    address: '72241 台南市佳里區延平路351號4樓',
    builtDate: '2000-01-01',
    phoneEntries: [{ id: 'h27-p1', value: '06-7230951', taxId: '04146458' }],
    networkEntries: [],
    electricalLayoutUrls: [],
    floorPlanUrls: []
  },
  {
    id: 'h28',
    name: '安南文化會館',
    area: '台南一區',
    district: '台南圈',
    address: '70958 台南市安南區郡安路四段65號1樓',
    builtDate: '2000-01-01',
    phoneEntries: [{ id: 'h28-p1', value: '06-2814683', taxId: '04146458' }],
    networkEntries: [],
    electricalLayoutUrls: [],
    floorPlanUrls: []
  },
  {
    id: 'h29',
    name: '高雄文化會館',
    area: '高雄一區',
    district: '高雄圈',
    address: '811027 高雄市楠梓區金富街1號',
    builtDate: '2002-07-15',
    phoneEntries: [{ id: 'h29-p1', value: '07-361-7990', taxId: '04146458' }],
    networkEntries: [{ id: 'h29-n1', value: 'TSA-KH-M-003', taxId: '04146458' }],
    photoUrl: 'https://images.unsplash.com/photo-1554435493-93422e8220c8?w=800&q=80',
    electricalLayoutUrls: [],
    floorPlanUrls: []
  },
  {
    id: 'h30',
    name: '鼓山文化會館',
    area: '高雄二區',
    district: '高雄圈',
    address: '80458 高雄市鼓山區裕誠路1093號3、4樓',
    builtDate: '2000-01-01',
    phoneEntries: [{ id: 'h30-p1', value: '07-5537007', taxId: '04146458' }],
    networkEntries: [],
    electricalLayoutUrls: [],
    floorPlanUrls: []
  },
  {
    id: 'h31',
    name: '鹽埕文化會館',
    area: '高雄二區',
    district: '高雄圈',
    address: '80341 高雄市鹽埕區莒光街197號',
    builtDate: '2000-01-01',
    phoneEntries: [{ id: 'h31-p1', value: '07-5615633', taxId: '04146458' }],
    networkEntries: [],
    electricalLayoutUrls: [],
    floorPlanUrls: []
  },
  {
    id: 'h32',
    name: '前鎮文化會館',
    area: '高雄三區',
    district: '高雄圈',
    address: '80661 高雄市前鎮區沱江街110巷1號',
    builtDate: '2000-01-01',
    phoneEntries: [{ id: 'h32-p1', value: '07-3366985', taxId: '04146458' }],
    networkEntries: [],
    electricalLayoutUrls: [],
    floorPlanUrls: []
  },
  {
    id: 'h33',
    name: '鳳山文化會館',
    area: '高雄四區',
    district: '高雄圈',
    address: '83348 高雄市鳥松區鳥松里中正路2巷17號',
    builtDate: '2000-01-01',
    phoneEntries: [{ id: 'h33-p1', value: '07-7332301', taxId: '04146458' }],
    networkEntries: [],
    electricalLayoutUrls: [],
    floorPlanUrls: []
  },
  {
    id: 'h34',
    name: '旗山文化會館',
    area: '高雄四區',
    district: '高雄圈',
    address: '842042 高雄市旗山區太平里復新街73號',
    builtDate: '2000-01-01',
    phoneEntries: [],
    networkEntries: [],
    electricalLayoutUrls: [],
    floorPlanUrls: []
  },
  {
    id: 'h35',
    name: '屏東文化會館',
    area: '屏東一區',
    district: '屏東圈',
    address: '91141 屏東縣竹田鄉大湖村大成路46號',
    builtDate: '2000-01-01',
    phoneEntries: [{ id: 'h35-p1', value: '08-788-0208', taxId: '04146458' }],
    networkEntries: [],
    electricalLayoutUrls: [],
    floorPlanUrls: []
  },
  {
    id: 'h36',
    name: '大龍峒會館',
    area: '台北二區',
    district: '台北圈',
    address: '10368 台北市大同區哈密街70巷9之3號1樓',
    builtDate: '2000-01-01',
    phoneEntries: [],
    networkEntries: [],
    electricalLayoutUrls: [],
    floorPlanUrls: []
  },
  {
    id: 'h37',
    name: '永康會館',
    area: '台南一區',
    district: '台南圈',
    address: '71043 台南市永康區中正路279巷1之2號',
    builtDate: '2000-01-01',
    phoneEntries: [{ id: 'h37-p1', value: '06-2336762', taxId: '04146458' }],
    networkEntries: [],
    electricalLayoutUrls: [],
    floorPlanUrls: []
  },
  {
    id: 'h38',
    name: '生爨會館',
    area: '台南二區',
    district: '台南圈',
    address: '70047 台南市中區開山路184號',
    builtDate: '2000-01-01',
    phoneEntries: [],
    networkEntries: [],
    electricalLayoutUrls: [],
    floorPlanUrls: []
  },
  {
    id: 'h39',
    name: '忠義會館',
    area: '台南二區',
    district: '台南圈',
    address: '70050 台南市忠義路二段187號',
    builtDate: '2000-01-01',
    phoneEntries: [],
    networkEntries: [],
    electricalLayoutUrls: [],
    floorPlanUrls: []
  },
  {
    id: 'h40',
    name: '存孝會館',
    area: '離島一區',
    district: '馬公圈',
    address: '88048 馬公市陽明里永和街11巷14號',
    builtDate: '2000-01-01',
    phoneEntries: [],
    networkEntries: [],
    electricalLayoutUrls: [],
    floorPlanUrls: []
  },
  {
    id: 'h41',
    name: '安明會館',
    area: '高雄一區',
    district: '高雄圈',
    address: '80780 高雄市三民區大昌二路212巷90、92號2、3、4樓',
    builtDate: '2000-01-01',
    phoneEntries: [],
    networkEntries: [],
    electricalLayoutUrls: [],
    floorPlanUrls: []
  },
  {
    id: 'h42',
    name: '大溪文化中心',
    area: '桃園二區',
    district: '桃園圈',
    address: '33560 桃園市大溪區美山路一段151巷60號',
    builtDate: '2000-01-01',
    phoneEntries: [{ id: 'h42-p1', value: '03-3874261', taxId: '04146458' }],
    networkEntries: [],
    electricalLayoutUrls: [],
    floorPlanUrls: []
  },
  {
    id: 'h43',
    name: '華山文化中心',
    area: '雲林二區',
    district: '雲林圈',
    address: '64646 雲林縣古坑鄉華山村2鄰華山19號之16',
    builtDate: '2000-01-01',
    phoneEntries: [{ id: 'h43-p1', value: '05-5901900', taxId: '04146458' }],
    networkEntries: [],
    electricalLayoutUrls: [],
    floorPlanUrls: []
  },
  {
    id: 'h44',
    name: '華山慈恩堂',
    area: '雲林二區',
    district: '雲林圈',
    address: '64647 雲林縣古坑鄉華山村11鄰松林路79號',
    builtDate: '2000-01-01',
    phoneEntries: [{ id: 'h44-p1', value: '05-5900390', taxId: '04146458' }],
    networkEntries: [],
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
  { id: 'equipment', name: '會館設備', nameEn: 'Equipment' },
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
