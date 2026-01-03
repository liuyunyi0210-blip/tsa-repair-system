
import React from 'react';
import { 
  ClipboardList, 
  Settings, 
  LogOut,
  Wrench,
  Box,
  FileText,
  ShieldAlert,
  Home,
  Droplets,
  Smartphone,
  Building,
  HeartPulse,
  Car,
  MessageSquare,
  Hammer,
  Briefcase
} from 'lucide-react';

interface LayoutProps {
  children: React.ReactNode;
  activeTab: string;
  setActiveTab: (tab: string) => void;
  onSimulateVolunteer: () => void;
  onLogout: () => void;
}

const Layout: React.FC<LayoutProps> = ({ 
  children, 
  activeTab, 
  setActiveTab, 
  onSimulateVolunteer,
  onLogout
}) => {
  const t = {
    title: 'TSA會館設施維護系統',
    dashboard: '首頁',
    halls: '會館基本資料',
    reports: '回報管理',
    requests: '工單管理',
    equipment: '會館設施',
    water: '飲水機保養',
    aed: 'AED 管理',
    vehicle: '公務車管理',
    contract: '合約管理',
    disaster: '災害回報',
    settings: '系統設定',
    volunteer: 'LINE 報修模擬',
    logout: '登出系統',
    admin: '測試管理員'
  };

  const menuItems = [
    { id: 'dashboard', label: t.dashboard, icon: <Home size={18} /> },
    { id: 'halls', label: t.halls, icon: <Building size={18} /> },
    { id: 'reports', label: t.reports, icon: <MessageSquare size={18} /> },
    { id: 'requests', label: t.requests, icon: <ClipboardList size={18} /> },
    { id: 'contract', label: t.contract, icon: <FileText size={18} /> },
    { id: 'equipment', label: t.equipment, icon: <Box size={18} /> },
    { id: 'water', label: t.water, icon: <Droplets size={18} /> },
    { id: 'aed', label: t.aed, icon: <HeartPulse size={18} /> },
    { id: 'vehicle', label: t.vehicle, icon: <Car size={18} /> },
    { id: 'disaster', label: t.disaster, icon: <ShieldAlert size={18} /> },
  ];

  return (
    <div className="flex h-screen overflow-hidden bg-slate-50">
      <aside className="hidden md:flex flex-col w-72 bg-slate-900 text-white shrink-0">
        <div className="p-6 flex items-center gap-3 shrink-0">
          <div className="bg-indigo-600 p-2 rounded-lg">
            <Wrench size={24} className="text-white" />
          </div>
          <span className="font-bold text-lg tracking-tight leading-tight">{t.title}</span>
        </div>

        <nav className="flex-1 px-4 py-4 overflow-y-auto scrollbar-hide space-y-1">
          {menuItems.map((item) => (
            <button
              key={item.id}
              onClick={() => setActiveTab(item.id)}
              className={`w-full flex items-center gap-3 px-4 py-3 rounded-xl transition-all ${
                activeTab === item.id 
                  ? 'bg-indigo-600 text-white shadow-lg shadow-indigo-600/20' 
                  : 'text-slate-400 hover:bg-slate-800 hover:text-white'
              }`}
            >
              {item.icon}
              <span className="font-medium text-sm">{item.label}</span>
            </button>
          ))}

          <div className="pt-4 border-t border-slate-800 mt-4">
            <button
              onClick={() => setActiveTab('settings')}
              className={`w-full flex items-center gap-3 px-4 py-3 rounded-xl transition-all ${
                activeTab === 'settings' ? 'bg-slate-800 text-white' : 'text-slate-500 hover:text-white'
              }`}
            >
              <Settings size={18} />
              <span className="font-medium text-sm">{t.settings}</span>
            </button>
          </div>
        </nav>

        <div className="p-6 border-t border-slate-800">
          <button 
            onClick={onSimulateVolunteer}
            className="w-full flex items-center justify-center gap-2 py-3 bg-white/5 hover:bg-white/10 text-white rounded-2xl font-black text-xs transition-all mb-4 border border-white/5"
          >
            <Smartphone size={14} /> {t.volunteer}
          </button>
          
          <button onClick={onLogout} className="flex items-center gap-3 text-slate-500 hover:text-rose-400 transition-colors px-4">
            <LogOut size={18} />
            <span className="text-sm font-bold">{t.logout}</span>
          </button>
        </div>
      </aside>

      <main className="flex-1 flex flex-col min-w-0 overflow-hidden">
        <header className="h-16 bg-white border-b border-slate-200 flex items-center justify-between px-8 shrink-0">
          <div className="flex items-center gap-2">
            <span className="text-xs font-black text-slate-400 uppercase tracking-widest">
              {menuItems.find(m => m.id === activeTab)?.label || activeTab}
            </span>
          </div>
          <div className="flex items-center gap-4">
            <div className="text-right">
              <p className="text-xs font-black text-slate-900">{t.admin}</p>
              <p className="text-[10px] font-bold text-slate-400 uppercase">System Operator</p>
            </div>
            <div className="w-10 h-10 rounded-full bg-indigo-100 text-indigo-600 flex items-center justify-center font-black shadow-sm">TSA</div>
          </div>
        </header>

        <div className="flex-1 overflow-y-auto p-4 md:p-8">
          {children}
        </div>
      </main>
    </div>
  );
};

export default Layout;
