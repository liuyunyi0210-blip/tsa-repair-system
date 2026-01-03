
export enum Urgency {
  LOW = 'LOW',
  MEDIUM = 'MEDIUM',
  HIGH = 'HIGH',
  EMERGENCY = 'EMERGENCY'
}

export enum RepairStatus {
  PENDING = 'PENDING',
  IN_PROGRESS = 'IN_PROGRESS',
  SIGNED = 'SIGNED',
  CONSTRUCTION_DONE = 'CONSTRUCTION_DONE',
  CLOSED = 'CLOSED'
}

export enum OrderType {
  ROUTINE = 'ROUTINE',
  VOLUNTEER = 'VOLUNTEER'
}

export enum Language {
  ZH = 'ZH',
  JA = 'JA'
}

export enum ProcessingMethod {
  INTERNAL = '組織、職員自行處理',
  LEGAL = '法人協助'
}

export enum Category {
  AC = '空調',
  ELECTRICAL = '機電',
  FIRE = '消防',
  AED = 'AED',
  WEAK_CURRENT = '弱電',
  PLUMBING = '衛生系統',
  WATER = '飲水機',
  GARDENING = '園藝',
  DECO = '裝潢',
  OTHER = '其他'
}

export interface TechnicalEntry {
  id: string;
  value: string;
  taxId: string;
}

export interface Hall {
  id: string;
  name: string;
  address: string;
  builtDate: string;
  district: string;
  area: string;
  phoneEntries: TechnicalEntry[];
  networkEntries: TechnicalEntry[];
  photoUrl?: string;
  electricalLayoutUrls: string[];
  floorPlanUrls: string[];
}

export interface AEDHistoryItem {
  id: string;
  type: 'BATTERY' | 'PADS' | 'INSPECTION';
  date: string;
  cost: number;
  remark?: string;
}

export interface AED {
  id: string;
  hallName: string;
  location: string;
  brand: string;
  model: string;
  serialNumber: string;
  purchaseDate: string;
  batteryExpiry: string;
  padsExpiry: string;
  vendorName?: string;
  vendorPhone?: string;
  lastInspectedDate?: string;
  history: AEDHistoryItem[];
}

export interface RepairRequest {
  id: string;
  type: OrderType;
  title: string;
  hallName: string;
  hallArea?: string;
  category: Category;
  urgency: Urgency;
  status: RepairStatus;
  description: string;
  reporter: string;
  createdAt: string;
  updatedAt: string;
  isDeleted?: boolean;
  isVerified?: boolean;
  lastExecutedDate?: string;
  maintenanceCycle?: number;
  staffInCharge?: string;
  processingMethod?: ProcessingMethod;
  processingDescription?: string;
  isSignedSent?: boolean;
  signedSentDate?: string;
  signedFileUrl?: string;
  isWorkFinished?: boolean;
  completionDate?: string;
  photoUrls?: string[];
  isPaymentSent?: boolean;
  isNoPaymentRequired?: boolean;
  paymentDate?: string;
  isInvoiceConfirmed?: boolean;
  paymentEntity?: string;
  vendor?: string;
  amount?: number;
  remarks?: string;
  aiAnalysis?: {
    suggestedUrgency: Urgency;
    potentialCauses: string[];
    maintenanceTips: string;
  };
}

export interface OfficialVehicle {
  id: string;
  hallName: string;
  brand: string;
  model: string;
  plateNumber: string;
  manager: string;
  mileage: number;
  purchaseDate: string;
  records: VehicleRecord[];
}

export interface VehicleRecord {
  id: string;
  type: 'MAINTENANCE' | 'ACCIDENT' | 'INSURANCE_CLAIM';
  date: string;
  description: string;
  personInCharge: string;
  amount?: number;
}

export interface FilterInfo {
  name: string;
  lastReplacementDate: string;
  reminderCycleDays: number;
}

export interface WaterDispenser {
  id: string;
  hallName: string;
  location: string;
  model: string;
  installDate: string;
  filters: FilterInfo[];
}

export interface Equipment {
  id: string;
  hallName: string;
  location: string;
  category: string;
  productName: string;
  model: string;
  quantity: number;
  purchaseDate: string;
  price: number;
  warrantyYears: number;
  photoUrl?: string;
  createdAt: string;
}

export enum EquipmentChangeType {
  TRANSFER = 'TRANSFER',
  SCRAP = 'SCRAP'
}

export interface EquipmentChange {
  id: string;
  type: EquipmentChangeType;
  equipmentId: string;
  date: string;
  reason: string;
  reporter: string;
}

export enum ContractStatus {
  NOT_STARTED = '尚未開始',
  IN_PROGRESS = '進行中',
  ENDED = '已結束'
}

export interface Contract {
  id: string;
  category: string;
  vendor: string;
  hallName: string;
  summary: string;
  startDate: string;
  endDate: string;
  fee: number;
  reporter: string;
  createdAt: string;
  remarks?: string;
  attachment?: string;
}

export enum DisasterType {
  EARTHQUAKE = '地震',
  FIRE = '火災',
  TYPHOON = '颱風',
  OTHER = '其他'
}

export enum HallSecurityStatus {
  SAFE = '安全',
  LIGHT = '輕微受損',
  HEAVY = '嚴重損壞',
  NONE = '尚未回報'
}

export interface HallDisasterStatus {
  hallId: string;
  hallName: string;
  status: HallSecurityStatus;
  remark?: string;
}

export interface DisasterReport {
  id: string;
  name: string;
  type: DisasterType;
  hallsStatus: HallDisasterStatus[];
  createdAt: string;
}

export interface WaterMaintenancePart {
  name: string;
  price: number;
}

export interface WaterMaintenanceRecord {
  id: string;
  dispenserId: string;
  date: string;
  parts: WaterMaintenancePart[];
  description: string;
  totalAmount: number;
  replacedFilterIndexes: number[]; // 哪些濾心被更換了 (0-4)
}

// 權限管理相關類型
export type PermissionAction = 'view' | 'create' | 'edit' | 'delete' | 'verify' | 'manage';

export interface Permission {
  id: string; // 格式：'module:action'，例如：'dashboard:view'
  name: string;
  module: string;
  action: PermissionAction;
  description?: string;
}

export interface Role {
  id: string;
  name: string;
  description?: string;
  permissions: string[]; // Permission ID 列表
  isSystem: boolean; // 是否為系統預設角色
  createdAt: string;
  updatedAt?: string;
}

export interface User {
  id: string;
  account: string;
  password: string; // 加密後的密碼（實際應用中應該加密）
  name: string;
  email?: string;
  roleId: string;
  hallName?: string; // 所屬會館限制
  allowedHalls?: string[]; // 允許存取的會館列表（空陣列表示全部）
  isActive: boolean;
  createdAt: string;
  updatedAt: string;
  lastLoginAt?: string;
}

export interface OperationLog {
  id: string;
  userId: string;
  userName: string;
  userAccount: string;
  module: string; // 操作的模組
  action: string; // 操作類型
  targetType?: string; // 目標類型（如：'user', 'role', 'request'）
  targetId?: string; // 目標ID
  targetName?: string; // 目標名稱
  description: string; // 操作描述
  ipAddress?: string;
  userAgent?: string;
  createdAt: string;
  changes?: { // 變更記錄
    field: string;
    oldValue: any;
    newValue: any;
  }[];
}

export interface MonthlyReport {
  id: string;
  yearMonth: string;
  hallName: string;
  content: string;
  reporter: string;
  managerRemark?: string;
  createdAt: string;
  updatedAt: string;
  isDeleted?: boolean;
}

