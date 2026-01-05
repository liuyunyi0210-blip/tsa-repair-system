
import React, { useState, useEffect } from 'react';
import Layout from './components/Layout';
import Dashboard from './components/Dashboard';
import RequestList from './components/RequestList';
import ReportManagement from './components/ReportManagement';
import NewRequestForm from './components/NewRequestForm';
import RequestDetail from './components/RequestDetail';
import WorkReportForm from './components/WorkReportForm';
import EquipmentManagement from './components/EquipmentManagement';
import ContractManagement from './components/ContractManagement';
import DisasterReporting from './components/DisasterReporting';
import WaterManagement from './components/WaterManagement';
import HallManagement from './components/HallManagement';
import AEDManagement from './components/AEDManagement';
import VehicleManagement from './components/VehicleManagement';
import Login from './components/Login';
import MobileSimulation from './components/MobileSimulation';
import PermissionManagement from './components/PermissionManagement';
import UserManagement from './components/UserManagement';
import StorageSettings from './components/StorageSettings';
import MonthlyReportSubmission from './components/MonthlyReportSubmission';
import MonthlyReportManagement from './components/MonthlyReportManagement';
import PrivacyPolicy from './components/PrivacyPolicy';
import TermsOfService from './components/TermsOfService';
import { RepairRequest, RepairStatus, Category, Urgency, OrderType, DisasterReport, Language, OperationLog, MonthlyReport, User, Role, HallSecurityStatus } from './types';
import { storageService } from './services/storageService';
import { MOCK_HALLS } from './constants';
import liff from '@line/liff';
import { Database, ShieldCheck, Users } from 'lucide-react';

const INITIAL_REQUESTS: RepairRequest[] = [
  {
    id: 'ORD-2024-001',
    type: OrderType.ROUTINE,
    title: '頂樓冷卻水塔定期清洗',
    hallName: '台北至善文化會館',
    hallArea: '台北一區',
    category: Category.AC,
    urgency: Urgency.MEDIUM,
    status: RepairStatus.PENDING,
    description: '每季一次的水塔清洗工程，需包含藥劑除垢與水質檢測。',
    reporter: '系統自動',
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString(),
    lastExecutedDate: '2024-04-01',
    maintenanceCycle: 30,
    staffInCharge: '李組長',
    isDeleted: false,
    isVerified: true
  },
  {
    id: 'ORD-2024-002',
    type: OrderType.VOLUNTEER,
    title: '2F 洗手間洗手台漏水',
    hallName: '台中文化會館',
    hallArea: '台中一區',
    category: Category.PLUMBING,
    urgency: Urgency.EMERGENCY,
    status: RepairStatus.IN_PROGRESS,
    description: '志工報修：感應式水龍頭關閉後仍持續滴水，需更換止水閥。',
    reporter: '王志工',
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString(),
    isDeleted: false,
    isVerified: true
  }
];

const App: React.FC = () => {
  const [isAuthenticated, setIsAuthenticated] = useState<boolean>(false);
  const [activeTab, setActiveTab] = useState('dashboard');
  const [language, setLanguage] = useState<Language>(Language.ZH);
  const [requests, setRequests] = useState<RepairRequest[]>([]);
  const [disasterReports, setDisasterReports] = useState<DisasterReport[]>([]);
  const [monthlyReports, setMonthlyReports] = useState<MonthlyReport[]>([]);
  const [selectedRequestId, setSelectedRequestId] = useState<string | null>(null);
  const [reportingRequestId, setReportingRequestId] = useState<string | null>(null);
  const [bulkReportingIds, setBulkReportingIds] = useState<string[] | null>(null);
  const [showForm, setShowForm] = useState<{ show: boolean, type: OrderType }>({ show: false, type: OrderType.VOLUNTEER });
  const [showMobileSim, setShowMobileSim] = useState(() => {
    // 預先偵測是否在 LINE 瀏覽器中
    return /Line/i.test(navigator.userAgent);
  });
  const [resetKey, setResetKey] = useState(0);
  const [showPermissionPanel, setShowPermissionPanel] = useState(false);
  const [showUserPanel, setShowUserPanel] = useState(false);
  const [showStorageSettings, setShowStorageSettings] = useState(false);
  const [operationLogs, setOperationLogs] = useState<OperationLog[]>([]);
  const [currentUser, setCurrentUser] = useState<User | null>(null);
  const [currentRole, setCurrentRole] = useState<Role | null>(null);
  const [roles, setRoles] = useState<Role[]>([]);
  const [publicView, setPublicView] = useState<'privacy' | 'terms' | null>(null);
  const [liffProfile, setLiffProfile] = useState<{ displayName: string; userId: string; pictureUrl?: string } | null>(null);
  const [storageType, setStorageType] = useState<any>(storageService.getStorageType());

  // 暴露設定介面給全局，讓 MobileSimulation 可以呼叫
  useEffect(() => {
    (window as any).showStorageSettings = () => setShowStorageSettings(true);
  }, []);


  // 當打開 MobileSimulation 時，重新載入災害回報資料
  useEffect(() => {
    if (showMobileSim) {
      const reloadDisasters = async () => {
        const savedDisasters = await storageService.loadDisasterReports();
        if (savedDisasters) {
          setDisasterReports(savedDisasters);
        }
      };
      reloadDisasters();
    }
  }, [showMobileSim]);

  useEffect(() => {
    const token = localStorage.getItem('tsa_auth_token');

    const loadData = async () => {
      // 1. 優先處理 URL 參數中的儲存設定 (用於免輸入 Token 登入)
      const params = new URLSearchParams(window.location.search);
      const urlToken = params.get('token');
      const urlGistId = params.get('gistId');

      if (urlToken) {
        storageService.init({
          type: 'gist',
          gistToken: urlToken,
          gistId: urlGistId || undefined
        });

        // 清除 URL 中的敏感資訊
        const url = new URL(window.location.href);
        url.searchParams.delete('token');
        url.searchParams.delete('gistId');
        window.history.replaceState({}, document.title, url.toString());

        console.log('已透過 URL 自動載入雲端儲存設定');
      }

      // 2. 刷新儲存類型狀態
      const currentType = storageService.getStorageType();
      setStorageType(currentType);

      // 3. 載入各類資料
      const savedRequests = await storageService.loadRepairRequests();
      if (savedRequests) setRequests(savedRequests);
      else setRequests(INITIAL_REQUESTS);

      const savedDisasters = await storageService.loadDisasterReports();
      if (savedDisasters) setDisasterReports(savedDisasters);

      const savedLogs = await storageService.loadLogs();
      if (savedLogs) setOperationLogs(savedLogs);

      const savedMonthly = await storageService.loadMonthlyReports();
      if (savedMonthly) setMonthlyReports(savedMonthly);

      // 載入用戶和角色資料
      const savedUsers = await storageService.loadUsers();
      const savedRoles = await storageService.loadRoles();

      if (token) {
        // 從 token 中提取用戶 ID（格式：token-${userId}）
        const userId = token.startsWith('token-') ? token.replace('token-', '') : null;
        const userIdFromMock = token === 'mock-token-12345' ? 'user-admin' : null;
        const targetUserId = userId || userIdFromMock;

        if (targetUserId && savedUsers) {
          const user = savedUsers.find(u => u.id === targetUserId);
          if (user) {
            setCurrentUser(user);
            setIsAuthenticated(true);

            // 載入對應的角色
            if (savedRoles) {
              setRoles(savedRoles);
              const role = savedRoles.find(r => r.id === user.roleId);
              if (role) {
                setCurrentRole(role);
              }
            } else {
              // 如果沒有角色資料，載入預設角色
              const { DEFAULT_ROLES } = await import('./constants');
              setRoles(DEFAULT_ROLES);
              const role = DEFAULT_ROLES.find(r => r.id === user.roleId);
              if (role) {
                setCurrentRole(role);
              }
            }
            return;
          }
        }
      }

      // 如果沒有 token 或找不到用戶，使用預設邏輯
      if (savedRoles) {
        setRoles(savedRoles);
        // 預設使用系統管理員角色（如果沒有用戶資料）
        if (savedUsers && savedUsers.length > 0) {
          const adminUser = savedUsers.find(u => u.account === 'admin') || savedUsers[0];
          setCurrentUser(adminUser);
          const userRole = savedRoles.find(r => r.id === adminUser.roleId);
          if (userRole) setCurrentRole(userRole);
        } else {
          // 如果沒有用戶資料，使用預設的系統管理員角色
          const adminRole = savedRoles.find(r => r.id === 'admin') || savedRoles[0];
          if (adminRole) setCurrentRole(adminRole);
        }
      } else {
        // 如果沒有角色資料，使用預設角色
        const { DEFAULT_ROLES } = await import('./constants');
        setRoles(DEFAULT_ROLES);
        const adminRole = DEFAULT_ROLES.find(r => r.id === 'admin');
        if (adminRole) setCurrentRole(adminRole);
      }
    };
    loadData();

    // 暴露重新整理功能
    (window as any).refreshData = loadData;
    (window as any).showStorageSettings = () => setShowStorageSettings(true);

    // 初始化 LIFF
    const initLiff = async () => {
      try {
        await liff.init({ liffId: '2008818149-3JrTOKeE' });

        // 只要是在 LINE 裡面，就開啟報修畫面
        if (liff.isInClient()) {
          setShowMobileSim(true);
        }

        if (liff.isLoggedIn()) {
          const profile = await liff.getProfile();
          setLiffProfile({
            displayName: profile.displayName,
            userId: profile.userId,
            pictureUrl: profile.pictureUrl
          });
        } else if (liff.isInClient()) {
          // 在 LINE 裡面但沒登入，強制登入以取得名字
          liff.login();
        }
      } catch (err) {
        console.error('LIFF Initialization failed', err);
      }
    };
    initLiff();
  }, []);

  const handleLogOperation = async (logData: Omit<OperationLog, 'id' | 'createdAt'>) => {
    const newLog: OperationLog = {
      id: `log-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`,
      ...logData,
      createdAt: new Date().toISOString()
    };
    const updatedLogs = [newLog, ...operationLogs].slice(0, 1000); // 保留最近1000筆
    setOperationLogs(updatedLogs);
    await storageService.saveLogs(updatedLogs);
  };

  const saveRequests = async (newRequests: RepairRequest[]) => {
    setRequests(newRequests);
    await storageService.saveRepairRequests(newRequests);
  };

  const saveMonthlyReports = async (newReports: MonthlyReport[]) => {
    setMonthlyReports(newReports);
    await storageService.saveMonthlyReports(newReports);
  };

  const handleLogin = async (token: string, userId: string) => {
    localStorage.setItem('tsa_auth_token', token);

    // 載入用戶和角色資料
    const savedUsers = await storageService.loadUsers();
    const savedRoles = await storageService.loadRoles();

    if (savedUsers) {
      const user = savedUsers.find(u => u.id === userId);
      if (user) {
        setCurrentUser(user);

        // 載入對應的角色
        if (savedRoles) {
          const role = savedRoles.find(r => r.id === user.roleId);
          if (role) {
            setCurrentRole(role);
          }
        } else {
          // 如果沒有角色資料，載入預設角色
          const { DEFAULT_ROLES } = await import('./constants');
          const role = DEFAULT_ROLES.find(r => r.id === user.roleId);
          if (role) {
            setCurrentRole(role);
            setRoles(DEFAULT_ROLES);
          }
        }
      }
    }

    setIsAuthenticated(true);
  };

  const handleLogout = () => {
    if (window.confirm('確定要登出系統嗎？')) {
      localStorage.removeItem('tsa_auth_token');
      setIsAuthenticated(false);
      setCurrentUser(null);
      setCurrentRole(null);
    }
  };

  const handleTabChangeRequest = (newTab: string) => {
    setReportingRequestId(null);
    setBulkReportingIds(null);
    setSelectedRequestId(null);
    setShowForm({ show: false, type: OrderType.VOLUNTEER });

    if (activeTab === newTab) {
      setResetKey(prev => prev + 1);
    } else {
      setActiveTab(newTab);
      setResetKey(prev => prev + 1);
    }
  };

  const handleWorkReportSubmit = async (finalIds: string[], updates: Partial<RepairRequest>, shouldClose: boolean) => {
    const updated = requests.map(req => {
      if (finalIds.includes(req.id)) {
        return { ...req, ...updates, updatedAt: new Date().toISOString() };
      }
      return req;
    });
    await saveRequests(updated);

    if (shouldClose) {
      // 結案後的關鍵跳轉邏輯
      setReportingRequestId(null);
      setBulkReportingIds(null);
      setActiveTab('requests'); // 強制跳回工單管理
      setResetKey(prev => prev + 1); // 強制重新渲染列表
    }
  };

  const handleAddRequest = async (data: Partial<RepairRequest>) => {
    const newReq: RepairRequest = {
      id: `ORD-${new Date().getFullYear()}-${Math.floor(1000 + Math.random() * 9000)}`,
      type: data.type || OrderType.VOLUNTEER,
      title: data.title || '未命名項目',
      hallName: data.hallName || '未指定會館',
      hallArea: data.hallArea || '',
      category: data.category || Category.OTHER,
      urgency: data.urgency || Urgency.MEDIUM,
      status: RepairStatus.PENDING,
      description: data.description || '',
      reporter: data.reporter || '測試人員',
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
      isDeleted: false,
      isVerified: data.isVerified ?? (data.type === OrderType.ROUTINE),
      photoUrls: data.photoUrls || [],
      photoMetadata: data.photoMetadata || []
    };

    await saveRequests([newReq, ...requests]);
    setShowForm({ show: false, type: OrderType.VOLUNTEER });

    if (newReq.isVerified) {
      setActiveTab('requests');
    } else {
      setActiveTab('reports');
    }
    setResetKey(prev => prev + 1);
  };

  const handleVerifyReport = async (id: string, formData?: { title: string; category: Category; urgency: Urgency }) => {
    await saveRequests(requests.map(r => {
      if (r.id === id) {
        return {
          ...r,
          isVerified: true,
          updatedAt: new Date().toISOString(),
          ...(formData && {
            title: formData.title,
            category: formData.category,
            urgency: formData.urgency,
          }),
        };
      }
      return r;
    }));
    alert('已成功核實回報並轉入工單管理！');
  };

  const handleDisasterReport = async (
    disasterId: string,
    hallId: string,
    status: string,
    remark: string,
    reporter: string,
    position: string,
    phone: string,
    photoUrls?: string[],
    photoMetadata?: any[]
  ) => {
    const disaster = disasterReports.find(d => d.id === disasterId);
    if (!disaster) {
      alert('找不到對應的災害回報');
      return;
    }

    const hall = MOCK_HALLS.find(h => h.id === hallId);
    if (!hall) {
      alert('找不到對應的會館');
      return;
    }

    // 更新或添加會館狀態
    const updatedHallsStatus = [...disaster.hallsStatus];
    const existingIndex = updatedHallsStatus.findIndex(h => h.hallId === hallId);

    if (existingIndex >= 0) {
      // 更新現有狀態
      updatedHallsStatus[existingIndex] = {
        ...updatedHallsStatus[existingIndex],
        status: status as HallSecurityStatus,
        remark: remark || undefined,
        reporter: reporter || undefined,
        position: position || undefined,
        phone: phone || undefined,
        reportedAt: new Date().toISOString(),
        photoUrls: photoUrls || updatedHallsStatus[existingIndex].photoUrls,
        photoMetadata: photoMetadata || updatedHallsStatus[existingIndex].photoMetadata
      };
    } else {
      // 添加新狀態
      updatedHallsStatus.push({
        hallId,
        hallName: hall.name,
        status: status as HallSecurityStatus,
        remark: remark || undefined,
        reporter: reporter || undefined,
        position: position || undefined,
        phone: phone || undefined,
        reportedAt: new Date().toISOString(),
        photoUrls: photoUrls || [],
        photoMetadata: photoMetadata || []
      });
    }

    const updatedDisaster: DisasterReport = {
      ...disaster,
      hallsStatus: updatedHallsStatus
    };

    try {
      const updatedDisasters = disasterReports.map(d => d.id === disasterId ? updatedDisaster : d);
      setDisasterReports(updatedDisasters);
      await storageService.saveDisasterReports(updatedDisasters);

      // 重新載入以確保資料同步
      const reloadedDisasters = await storageService.loadDisasterReports();
      if (reloadedDisasters) setDisasterReports(reloadedDisasters);
    } catch (err: any) {
      alert(`災害回報儲存失敗：${err.message || '未知錯誤'}。您的資料已暫存於本機，但可能未同步至雲端。`);
    }
  };

  const renderContent = () => {
    if (bulkReportingIds || reportingRequestId) {
      const targetIds = bulkReportingIds || [reportingRequestId!];
      const templateRequest = requests.find(r => r.id === targetIds[0]) || requests[0];
      return (
        <WorkReportForm
          key="work-report-form"
          request={templateRequest}
          allRequests={requests}
          isBulk={targetIds.length > 1}
          initialBulkIds={targetIds}
          onSubmit={handleWorkReportSubmit}
          onCancel={() => {
            setBulkReportingIds(null);
            setReportingRequestId(null);
          }}
        />
      );
    }

    if (showForm.show) {
      return (
        <NewRequestForm
          key="new-request-form"
          initialType={showForm.type}
          onSubmit={handleAddRequest}
          onCancel={() => setShowForm({ show: false, type: OrderType.VOLUNTEER })}
          language={language}
        />
      );
    }

    switch (activeTab) {
      case 'dashboard':
        return <Dashboard key={`dash-${resetKey}`} requests={requests.filter(r => !r.isDeleted && r.isVerified)} monthlyReports={monthlyReports.filter(r => !r.isDeleted)} language={language} />;
      case 'halls':
        return <HallManagement key={`hall-${resetKey}`} />;
      case 'reports':
        return (
          <ReportManagement
            key={`report-${resetKey}`}
            requests={requests}
            language={language}
            onVerify={handleVerifyReport}
            onRestore={async (id) => await saveRequests(requests.map(r => r.id === id ? { ...r, isDeleted: false } : r))}
            onDelete={async (id) => {
              if (window.confirm('確定要將此回報移至回收桶嗎？')) {
                await saveRequests(requests.map(r => r.id === id ? { ...r, isDeleted: true } : r));
              }
            }}
            onPermanentDelete={async (id) => {
              if (window.confirm('確定要永久刪除此回報嗎？此操作無法復原。')) {
                await saveRequests(requests.filter(r => r.id !== id));
              }
            }}
          />
        );
      case 'requests':
        return (
          <RequestList
            key={`req-${resetKey}`}
            requests={requests.filter(r => r.isVerified)}
            language={language}
            onView={(id) => setSelectedRequestId(id)}
            onDelete={async (id) => {
              if (window.confirm('確定要移至回收站？')) {
                await saveRequests(requests.map(r => r.id === id ? { ...r, isDeleted: true } : r));
              }
            }}
            onRestore={async (id) => await saveRequests(requests.map(r => r.id === id ? { ...r, isDeleted: false } : r))}
            onPermanentDelete={async (id) => {
              if (window.confirm('永久刪除？')) {
                await saveRequests(requests.filter(r => r.id !== id));
              }
            }}
            onNewRoutine={() => setShowForm({ show: true, type: OrderType.ROUTINE })}
            onBulkReport={(ids) => setBulkReportingIds(ids)}
          />
        );
      case 'equipment': return <EquipmentManagement key={`equip-${resetKey}`} language={language} />;
      case 'water': return <WaterManagement key={`water-${resetKey}`} language={language} />;
      case 'aed': return <AEDManagement key={`aed-${resetKey}`} language={language} />;
      case 'vehicle': return <VehicleManagement key={`vehicle-${resetKey}`} language={language} />;
      case 'contract': return <ContractManagement key={`contract-${resetKey}`} language={language} />;
      case 'disaster': return <DisasterReporting key={`disaster-${resetKey}`} language={language} onDisasterUpdate={async () => {
        const savedDisasters = await storageService.loadDisasterReports();
        if (savedDisasters) setDisasterReports(savedDisasters);
      }} />;
      case 'monthly_submission': return (
        <MonthlyReportSubmission
          key={`monthly-sub-${resetKey}`}
          reports={monthlyReports}
          onSubmit={async (newReports) => {
            const formatted: MonthlyReport[] = newReports.map(r => ({
              ...r,
              id: `MNR-${Date.now()}-${Math.random().toString(36).substr(2, 5)}`,
              createdAt: new Date().toISOString(),
              updatedAt: new Date().toISOString()
            }));
            await saveMonthlyReports([...formatted, ...monthlyReports]);
            alert('月報表已成功提交！');
            setActiveTab('monthly_management');
          }}
          onUpdate={async (id, updates) => {
            await saveMonthlyReports(monthlyReports.map(r => r.id === id ? { ...r, ...updates, updatedAt: new Date().toISOString() } : r));
          }}
        />
      );
      case 'monthly_management': return (
        <MonthlyReportManagement
          key={`monthly-mg-${resetKey}`}
          reports={monthlyReports}
          onDelete={async (id) => {
            await saveMonthlyReports(monthlyReports.map(r => r.id === id ? { ...r, isDeleted: true } : r));
          }}
          onUpdate={async (id, updates) => {
            await saveMonthlyReports(monthlyReports.map(r => r.id === id ? { ...r, ...updates, updatedAt: new Date().toISOString() } : r));
          }}
        />
      );
      case 'settings': return (
        <div className="space-y-6">
          <h1 className="text-2xl font-black text-slate-900">系統設定</h1>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <button
              onClick={() => setShowUserPanel(true)}
              className="p-6 bg-white rounded-2xl shadow-sm border border-slate-200 hover:border-indigo-300 hover:shadow-md transition-all text-left"
            >
              <div className="flex items-center gap-4">
                <div className="p-3 bg-indigo-100 rounded-xl">
                  <Users className="w-6 h-6 text-indigo-600" />
                </div>
                <div>
                  <h3 className="font-black text-slate-900 mb-1">帳號管理</h3>
                  <p className="text-sm text-slate-500">管理系統使用者帳號、密碼與角色設定</p>
                </div>
              </div>
            </button>
            <button
              onClick={() => setShowPermissionPanel(true)}
              className="p-6 bg-white rounded-2xl shadow-sm border border-slate-200 hover:border-indigo-300 hover:shadow-md transition-all text-left"
            >
              <div className="flex items-center gap-4">
                <div className="p-3 bg-purple-100 rounded-xl">
                  <ShieldCheck className="w-6 h-6 text-purple-600" />
                </div>
                <div>
                  <h3 className="font-black text-slate-900 mb-1">角色權限設定</h3>
                  <p className="text-sm text-slate-500">設定各角色的模組存取權限</p>
                </div>
              </div>
            </button>
            <button
              onClick={() => setShowStorageSettings(true)}
              className="p-6 bg-white rounded-2xl shadow-sm border border-slate-200 hover:border-indigo-300 hover:shadow-md transition-all text-left"
            >
              <div className="flex items-center gap-4">
                <div className="p-3 bg-emerald-100 rounded-xl">
                  <Database className="w-6 h-6 text-emerald-600" />
                </div>
                <div>
                  <h3 className="font-black text-slate-900 mb-1">資料儲存設定</h3>
                  <p className="text-sm text-slate-500">選擇本地儲存或 GitHub Gist 雲端同步</p>
                  <p className="text-xs text-slate-400 mt-1">
                    目前：{storageService.getStorageType() === 'gist' ? 'GitHub Gist' : '本地儲存'}
                  </p>
                </div>
              </div>
            </button>
          </div>
        </div>
      );
      default: return <div className="text-slate-400 text-center py-20">頁面開發中</div>;
    }
  };

  // 檢查用戶是否有特定模組的權限
  const hasPermission = (moduleId: string, action: string = 'view'): boolean => {
    if (!currentRole) return true; // 如果沒有角色，預設允許（向後兼容）
    const permissionId = `${moduleId}:${action}`;
    return currentRole.permissions.includes(permissionId);
  };

  // 定義 Modal 元件列
  const Modals = (
    <>
      {selectedRequestId && (
        <RequestDetail
          request={requests.find(r => r.id === selectedRequestId)!}
          onClose={() => setSelectedRequestId(null)}
          onUpdateStatus={async (id, status) => {
            await saveRequests(requests.map(r => r.id === id ? { ...r, status, updatedAt: new Date().toISOString() } : r));
          }}
          onUpdateCategoryAndUrgency={async (id, category, urgency) => {
            await saveRequests(requests.map(r => r.id === id ? { ...r, category, urgency, updatedAt: new Date().toISOString() } : r));
          }}
          onReportWork={(id) => {
            const req = requests.find(r => r.id === id);
            if (req) {
              if (req.status !== RepairStatus.CLOSED) {
                setSelectedRequestId(null);
                setReportingRequestId(id);
              } else {
                alert('此工單已完成，無法進行完工回報');
              }
            }
          }}
          language={language}
        />
      )}

      <UserManagement
        language={language}
        isOpen={showUserPanel}
        onClose={() => setShowUserPanel(false)}
        onLogOperation={handleLogOperation}
      />

      <PermissionManagement
        language={language}
        isOpen={showPermissionPanel}
        onClose={() => {
          setShowPermissionPanel(false);
          const reloadRoles = async () => {
            const savedRoles = await storageService.loadRoles();
            if (savedRoles) {
              setRoles(savedRoles);
              if (currentUser) {
                const userRole = savedRoles.find(r => r.id === currentUser.roleId);
                if (userRole) setCurrentRole(userRole);
              }
            }
          };
          reloadRoles();
        }}
        onLogOperation={handleLogOperation}
      />

      <StorageSettings
        language={language}
        isOpen={showStorageSettings}
        onClose={() => {
          setShowStorageSettings(false);
          const currentType = storageService.getStorageType();
          setStorageType(currentType);
          // 如果換了儲存方式，重刷資料
          if ((window as any).refreshData) (window as any).refreshData();
        }}
      />
    </>
  );

  // 優先顯示手機報修畫面 (針對 LINE 志工)
  if (showMobileSim) {
    return (
      <div className="bg-slate-950 min-h-screen">
        <div className="flex items-center justify-center p-0">
          <MobileSimulation
            key={`mobile-sim-${disasterReports.length}`}
            activeDisaster={disasterReports && disasterReports.length > 0 ? disasterReports[0] : null}
            requests={requests}
            liffProfile={liffProfile}
            onClose={() => {
              setShowMobileSim(false);
              if (liff.isInClient()) {
                liff.closeWindow();
              }
            }}
            onDisasterReport={handleDisasterReport}
            onSubmitReport={async (data) => {
              if (data.id) {
                await handleWorkReportSubmit([data.id], {
                  ...data,
                  status: RepairStatus.CLOSED,
                  isWorkFinished: true,
                  completionDate: data.completionDate
                }, true);
              } else {
                await handleAddRequest({ ...data, isVerified: false });
              }
              if (liff.isInClient()) {
                setTimeout(() => liff.closeWindow(), 2000);
              }
            }}
          />
        </div>
        {Modals}
      </div>
    );
  }

  if (!isAuthenticated) {
    if (publicView === 'privacy') return <div className="bg-slate-950 min-h-screen"><PrivacyPolicy onBack={() => setPublicView(null)} /></div>;
    if (publicView === 'terms') return <div className="bg-slate-950 min-h-screen"><TermsOfService onBack={() => setPublicView(null)} /></div>;
    return (
      <div className="bg-slate-950 min-h-screen">
        <Login
          key={`login-${storageType}`}
          onLogin={handleLogin}
          language={language}
          onLanguageChange={setLanguage}
          onShowPrivacy={() => setPublicView('privacy')}
          onShowTerms={() => setPublicView('terms')}
          onShowStorage={() => setShowStorageSettings(true)}
          storageType={storageType}
        />
        {Modals}
      </div>
    );
  }

  return (
    <Layout
      activeTab={activeTab}
      setActiveTab={handleTabChangeRequest}
      onSimulateVolunteer={() => setShowMobileSim(true)}
      onLogout={handleLogout}
      hasPermission={hasPermission}
      currentUser={currentUser}
      currentRole={currentRole}
    >
      {renderContent()}
      {Modals}
    </Layout>
  );
};

export default App;
