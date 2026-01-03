
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
import { RepairRequest, RepairStatus, Category, Urgency, OrderType, DisasterReport, Language, OperationLog } from './types';
import { storageService } from './services/storageService';

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
  const [selectedRequestId, setSelectedRequestId] = useState<string | null>(null);
  const [reportingRequestId, setReportingRequestId] = useState<string | null>(null);
  const [bulkReportingIds, setBulkReportingIds] = useState<string[] | null>(null); 
  const [showForm, setShowForm] = useState<{show: boolean, type: OrderType}>({show: false, type: OrderType.VOLUNTEER});
  const [showMobileSim, setShowMobileSim] = useState(false);
  const [resetKey, setResetKey] = useState(0);
  const [showPermissionPanel, setShowPermissionPanel] = useState(false);
  const [showUserPanel, setShowUserPanel] = useState(false);
  const [showStorageSettings, setShowStorageSettings] = useState(false);
  const [operationLogs, setOperationLogs] = useState<OperationLog[]>([]);
  
  useEffect(() => {
    const token = localStorage.getItem('tsa_auth_token');
    if (token) setIsAuthenticated(true);

    const loadData = async () => {
      const savedRequests = await storageService.loadRepairRequests();
      if (savedRequests) setRequests(savedRequests);
      else setRequests(INITIAL_REQUESTS);

      const savedDisasters = await storageService.loadDisasterReports();
      if (savedDisasters) setDisasterReports(savedDisasters);

      const savedLogs = await storageService.loadLogs();
      if (savedLogs) setOperationLogs(savedLogs);
    };
    loadData();
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

  const handleLogin = (token: string) => {
    localStorage.setItem('tsa_auth_token', token);
    setIsAuthenticated(true);
  };

  const handleLogout = () => {
    if (window.confirm('確定要登出系統嗎？')) {
      localStorage.removeItem('tsa_auth_token');
      setIsAuthenticated(false);
    }
  };

  const handleTabChangeRequest = (newTab: string) => {
    setReportingRequestId(null);
    setBulkReportingIds(null);
    setSelectedRequestId(null);
    setShowForm({show: false, type: OrderType.VOLUNTEER});
    
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
      isVerified: data.isVerified ?? (data.type === OrderType.ROUTINE)
    };
    
    await saveRequests([newReq, ...requests]);
    setShowForm({show: false, type: OrderType.VOLUNTEER});
    
    if (newReq.isVerified) {
      setActiveTab('requests');
    } else {
      setActiveTab('reports');
    }
    setResetKey(prev => prev + 1);
  };

  const handleVerifyReport = async (id: string) => {
    await saveRequests(requests.map(r => r.id === id ? { ...r, isVerified: true, updatedAt: new Date().toISOString() } : r));
    alert('已成功核實回報並轉入工單管理！');
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
          onCancel={() => setShowForm({show: false, type: OrderType.VOLUNTEER})} 
          language={language}
        />
      );
    }

    switch (activeTab) {
      case 'dashboard':
        return <Dashboard key={`dash-${resetKey}`} requests={requests.filter(r => !r.isDeleted && r.isVerified)} language={language} />;
      case 'halls':
        return <HallManagement key={`hall-${resetKey}`} />;
      case 'reports':
        return (
          <ReportManagement 
            key={`report-${resetKey}`}
            requests={requests}
            language={language}
            onVerify={handleVerifyReport}
            onDelete={async (id) => {
              if (window.confirm('確定要刪除此回報嗎？')) {
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
                 await saveRequests(requests.map(r => r.id === id ? {...r, isDeleted: true} : r));
               }
            }}
            onRestore={async (id) => await saveRequests(requests.map(r => r.id === id ? {...r, isDeleted: false} : r))}
            onPermanentDelete={async (id) => {
              if (window.confirm('永久刪除？')) {
                await saveRequests(requests.filter(r => r.id !== id));
              }
            }}
            onNewRoutine={() => setShowForm({show: true, type: OrderType.ROUTINE})}
            onBulkReport={(ids) => setBulkReportingIds(ids)}
          />
        );
      case 'equipment': return <EquipmentManagement key={`equip-${resetKey}`} language={language} />;
      case 'water': return <WaterManagement key={`water-${resetKey}`} language={language} />;
      case 'aed': return <AEDManagement key={`aed-${resetKey}`} language={language} />;
      case 'vehicle': return <VehicleManagement key={`vehicle-${resetKey}`} language={language} />;
      case 'contract': return <ContractManagement key={`contract-${resetKey}`} language={language} />;
      case 'disaster': return <DisasterReporting key={`disaster-${resetKey}`} language={language} />;
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
                  <svg className="w-6 h-6 text-indigo-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" />
                  </svg>
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
                  <svg className="w-6 h-6 text-purple-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m5.618-4.016A11.955 11.955 0 0112 2.944a11.955 11.955 0 01-8.618 3.04A12.02 12.02 0 003 9c0 5.591 3.824 10.29 9 11.622 5.176-1.332 9-6.03 9-11.622 0-1.042-.133-2.052-.382-3.016z" />
                  </svg>
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
                  <svg className="w-6 h-6 text-emerald-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 7v10c0 2.21 3.582 4 8 4s8-1.79 8-4V7M4 7c0 2.21 3.582 4 8 4s8-1.79 8-4M4 7c0-2.21 3.582-4 8-4s8 1.79 8 4m0 5c0 2.21-3.582 4-8 4s-8-1.79-8-4" />
                  </svg>
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

  if (!isAuthenticated) {
    return <Login onLogin={handleLogin} language={language} onLanguageChange={setLanguage} />;
  }

  return (
    <Layout 
      activeTab={activeTab} 
      setActiveTab={handleTabChangeRequest} 
      onSimulateVolunteer={() => setShowMobileSim(true)}
      onLogout={handleLogout}
    >
      {renderContent()}
      
      {selectedRequestId && (
        <RequestDetail 
          request={requests.find(r => r.id === selectedRequestId)!}
          onClose={() => setSelectedRequestId(null)}
          onUpdateStatus={async (id, status) => {
             await saveRequests(requests.map(r => r.id === id ? {...r, status} : r));
          }}
          onReportWork={(id) => {
            setSelectedRequestId(null);
            setReportingRequestId(id);
          }}
          language={language}
        />
      )}

      {showMobileSim && (
        <MobileSimulation 
          activeDisaster={disasterReports.length > 0 ? disasterReports[0] : null}
          onClose={() => setShowMobileSim(false)}
          onSubmitReport={(data) => handleAddRequest({ ...data, isVerified: false })}
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
        onClose={() => setShowPermissionPanel(false)}
        onLogOperation={handleLogOperation}
      />

      <StorageSettings
        language={language}
        isOpen={showStorageSettings}
        onClose={() => setShowStorageSettings(false)}
      />
    </Layout>
  );
};

export default App;
