
// 儲存服務 - 支援 localStorage 和 GitHub Gist
import {
  User,
  Role,
  OperationLog,
  RepairRequest,
  Hall,
  Equipment,
  EquipmentChange,
  WaterDispenser,
  WaterMaintenanceRecord,
  AED,
  OfficialVehicle,
  Contract,
  DisasterReport,
  MonthlyReport
} from '../types';
import { pruneLargeData } from './imageService';

export type StorageType = 'local' | 'gist';

interface StorageConfig {
  type: StorageType;
  gistToken?: string;
  gistId?: string;
}

class StorageService {
  private config: StorageConfig = {
    type: 'local'
  };

  // 初始化儲存配置
  init(config: StorageConfig) {
    this.config = config;
    if (config.type === 'gist' && config.gistToken) {
      localStorage.setItem('tsa_storage_type', 'gist');
      localStorage.setItem('tsa_gist_token', config.gistToken);
      if (config.gistId) {
        localStorage.setItem('tsa_gist_id', config.gistId);
      }
    } else {
      localStorage.setItem('tsa_storage_type', 'local');
    }
  }

  // 獲取當前儲存類型
  getStorageType(): StorageType {
    return (localStorage.getItem('tsa_storage_type') as StorageType) || 'local';
  }

  // 獲取 Gist Token
  getGistToken(): string | null {
    return localStorage.getItem('tsa_gist_token');
  }

  // 獲取 Gist ID
  getGistId(): string | null {
    return localStorage.getItem('tsa_gist_id');
  }

  // 儲存資料到 Gist
  private async saveToGist(data: any, filename: string): Promise<string> {
    const token = this.getGistToken();
    if (!token) {
      throw new Error('GitHub Token 未設定');
    }

    const gistId = this.getGistId();
    const url = gistId
      ? `https://api.github.com/gists/${gistId}`
      : 'https://api.github.com/gists';

    const files: Record<string, { content: string }> = {};
    files[filename] = { content: JSON.stringify(data, null, 2) };

    const response = await fetch(url, {
      method: gistId ? 'PATCH' : 'POST',
      headers: {
        'Authorization': `token ${token}`,
        'Accept': 'application/vnd.github.v3+json',
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        description: 'TSA 會館設施維護系統資料',
        public: false,
        files
      })
    });

    if (!response.ok) {
      const error = await response.json();
      const message = error.message || '儲存失敗';
      console.error(`Gist API Error [${filename}]:`, message, error);
      throw new Error(message);
    }

    const result = await response.json();
    if (!gistId && result.id) {
      localStorage.setItem('tsa_gist_id', result.id);
    }
    return result.id;
  }

  // 從 Gist 讀取資料
  private async loadFromGist(filename: string): Promise<any> {
    const gistId = this.getGistId();
    if (!gistId) {
      return null;
    }

    const token = this.getGistToken();
    const response = await fetch(`https://api.github.com/gists/${gistId}`, {
      headers: {
        'Authorization': `token ${token}`,
        'Accept': 'application/vnd.github.v3+json',
      }
    });

    if (!response.ok) {
      if (response.status === 404) {
        return null;
      }
      throw new Error('讀取失敗');
    }

    const result = await response.json();
    const file = result.files[filename];
    if (!file) {
      return null;
    }

    return JSON.parse(file.content);
  }

  // 儲存用戶資料
  async saveUsers(users: User[]): Promise<void> {
    if (this.getStorageType() === 'gist') {
      try {
        await this.saveToGist(users, 'users.json');
      } catch (error) {
        console.error('Gist 儲存失敗，改用 localStorage:', error);
        localStorage.setItem('tsa_users_v1', JSON.stringify(users));
      }
    } else {
      localStorage.setItem('tsa_users_v1', JSON.stringify(users));
    }
  }

  // 讀取用戶資料
  async loadUsers(): Promise<User[] | null> {
    if (this.getStorageType() === 'gist') {
      try {
        return await this.loadFromGist('users.json');
      } catch (error) {
        console.error('Gist 讀取失敗，改用 localStorage:', error);
        const saved = localStorage.getItem('tsa_users_v1');
        return saved ? JSON.parse(saved) : null;
      }
    } else {
      const saved = localStorage.getItem('tsa_users_v1');
      return saved ? JSON.parse(saved) : null;
    }
  }

  // 儲存角色資料
  async saveRoles(roles: Role[]): Promise<void> {
    if (this.getStorageType() === 'gist') {
      try {
        await this.saveToGist(roles, 'roles.json');
      } catch (error) {
        console.error('Gist 儲存失敗，改用 localStorage:', error);
        localStorage.setItem('tsa_roles_v1', JSON.stringify(roles));
      }
    } else {
      localStorage.setItem('tsa_roles_v1', JSON.stringify(roles));
    }
  }

  // 讀取角色資料
  async loadRoles(): Promise<Role[] | null> {
    if (this.getStorageType() === 'gist') {
      try {
        return await this.loadFromGist('roles.json');
      } catch (error) {
        console.error('Gist 讀取失敗，改用 localStorage:', error);
        const saved = localStorage.getItem('tsa_roles_v1');
        return saved ? JSON.parse(saved) : null;
      }
    } else {
      const saved = localStorage.getItem('tsa_roles_v1');
      return saved ? JSON.parse(saved) : null;
    }
  }

  // 儲存操作日誌
  async saveLogs(logs: OperationLog[]): Promise<void> {
    if (this.getStorageType() === 'gist') {
      try {
        await this.saveToGist(logs, 'logs.json');
      } catch (error) {
        console.error('Gist 儲存失敗，改用 localStorage:', error);
        localStorage.setItem('tsa_operation_logs_v1', JSON.stringify(logs));
      }
    } else {
      localStorage.setItem('tsa_operation_logs_v1', JSON.stringify(logs));
    }
  }

  // 讀取操作日誌
  async loadLogs(): Promise<OperationLog[] | null> {
    if (this.getStorageType() === 'gist') {
      try {
        return await this.loadFromGist('logs.json');
      } catch (error) {
        console.error('Gist 讀取失敗，改用 localStorage:', error);
        const saved = localStorage.getItem('tsa_operation_logs_v1');
        return saved ? JSON.parse(saved) : null;
      }
    } else {
      const saved = localStorage.getItem('tsa_operation_logs_v1');
      return saved ? JSON.parse(saved) : null;
    }
  }

  // 通用儲存方法
  private async saveData(key: string, data: any, filename: string): Promise<void> {
    if (this.getStorageType() === 'gist') {
      try {
        await this.saveToGist(data, filename);
      } catch (error) {
        console.error(`Gist 儲存失敗 (${key})，改用 localStorage:`, error);
        localStorage.setItem(key, JSON.stringify(data));
        throw error;
      }
    } else {
      try {
        localStorage.setItem(key, JSON.stringify(data));
      } catch (e: any) {
        if (e.name === 'QuotaExceededError') {
          console.error('LocalStorage Quota Exceeded!');
          throw new Error('儲存空間已滿 (The quota has been exceeded)。請嘗試刪除舊資料或減少照片數量。');
        }
        throw e;
      }
    }
  }

  // 通用讀取方法
  private async loadData(key: string, filename: string): Promise<any> {
    if (this.getStorageType() === 'gist') {
      try {
        return await this.loadFromGist(filename);
      } catch (error) {
        console.error(`Gist 讀取失敗 (${key})，改用 localStorage:`, error);
        const saved = localStorage.getItem(key);
        return saved ? JSON.parse(saved) : null;
      }
    } else {
      const saved = localStorage.getItem(key);
      return saved ? JSON.parse(saved) : null;
    }
  }

  // 工單資料
  async saveRepairRequests(requests: RepairRequest[]): Promise<void> {
    // 儲存前先檢查大小並適度清理已結案件的照片
    const pruned = pruneLargeData(requests, 900 * 1024); // 預留空間給其他欄位，限制在 900KB 以下
    await this.saveData('tsa_repair_orders_v6', pruned, 'repair_requests.json');
  }

  async loadRepairRequests(): Promise<RepairRequest[] | null> {
    return await this.loadData('tsa_repair_orders_v6', 'repair_requests.json');
  }

  // 會館資料
  async saveHalls(halls: Hall[]): Promise<void> {
    await this.saveData('tsa_halls_v3', halls, 'halls.json');
  }

  async loadHalls(): Promise<Hall[] | null> {
    return await this.loadData('tsa_halls_v3', 'halls.json');
  }

  // 設施資料
  async saveEquipments(equipments: Equipment[]): Promise<void> {
    await this.saveData('tsa_equipments_v1', equipments, 'equipments.json');
  }

  async loadEquipments(): Promise<Equipment[] | null> {
    return await this.loadData('tsa_equipments_v1', 'equipments.json');
  }

  // 設施異動記錄
  async saveEquipmentChanges(changes: EquipmentChange[]): Promise<void> {
    await this.saveData('tsa_equip_changes_v1', changes, 'equipment_changes.json');
  }

  async loadEquipmentChanges(): Promise<EquipmentChange[] | null> {
    return await this.loadData('tsa_equip_changes_v1', 'equipment_changes.json');
  }

  // 飲水機資料
  async saveWaterDispensers(dispensers: WaterDispenser[]): Promise<void> {
    await this.saveData('tsa_water_dispensers_v3', dispensers, 'water_dispensers.json');
  }

  async loadWaterDispensers(): Promise<WaterDispenser[] | null> {
    return await this.loadData('tsa_water_dispensers_v3', 'water_dispensers.json');
  }

  // 飲水機保養歷史
  async saveWaterHistory(history: WaterMaintenanceRecord[]): Promise<void> {
    await this.saveData('tsa_water_history_v3', history, 'water_history.json');
  }

  async loadWaterHistory(): Promise<WaterMaintenanceRecord[] | null> {
    return await this.loadData('tsa_water_history_v3', 'water_history.json');
  }

  // AED 資料
  async saveAEDs(aeds: AED[]): Promise<void> {
    await this.saveData('tsa_aeds_v16', aeds, 'aeds.json');
  }

  async loadAEDs(): Promise<AED[] | null> {
    return await this.loadData('tsa_aeds_v16', 'aeds.json');
  }

  // 公務車資料
  async saveVehicles(vehicles: OfficialVehicle[]): Promise<void> {
    await this.saveData('tsa_vehicles_v6', vehicles, 'vehicles.json');
  }

  async loadVehicles(): Promise<OfficialVehicle[] | null> {
    return await this.loadData('tsa_vehicles_v6', 'vehicles.json');
  }

  // 合約資料
  async saveContracts(contracts: Contract[]): Promise<void> {
    await this.saveData('tsa_contracts_v2', contracts, 'contracts.json');
  }

  async loadContracts(): Promise<Contract[] | null> {
    return await this.loadData('tsa_contracts_v2', 'contracts.json');
  }

  // 災害回報資料
  async saveDisasterReports(reports: DisasterReport[]): Promise<void> {
    await this.saveData('tsa_disaster_reports_v1', reports, 'disaster_reports.json');
  }

  async loadDisasterReports(): Promise<DisasterReport[] | null> {
    return await this.loadData('tsa_disaster_reports_v1', 'disaster_reports.json');
  }

  // 月報表資料
  async saveMonthlyReports(reports: MonthlyReport[]): Promise<void> {
    const pruned = pruneLargeData(reports, 900 * 1024);
    await this.saveData('tsa_monthly_reports_v1', pruned, 'monthly_reports.json');
  }

  async loadMonthlyReports(): Promise<MonthlyReport[] | null> {
    return await this.loadData('tsa_monthly_reports_v1', 'monthly_reports.json');
  }
}

export const storageService = new StorageService();

