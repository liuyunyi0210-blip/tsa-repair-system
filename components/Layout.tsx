import React, { useState } from 'react';
import {
  ClipboardList,
  Menu,
  X as CloseIcon,
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
  Briefcase,
  Calendar,
  FileSignature,
  RefreshCw
} from 'lucide-react';
import { User, Role } from '../types';

interface LayoutProps {
  children: React.ReactNode;
  activeTab: string;
  setActiveTab: (tab: string) => void;
  onSimulateVolunteer: () => void;
  onLogout: () => void;
  hasPermission?: (moduleId: string, action?: string) => boolean;
  currentUser?: User | null;
  currentRole?: Role | null;
}

const Layout: React.FC<LayoutProps> = ({
  children,
  activeTab,
  setActiveTab,
  onSimulateVolunteer,
  onLogout,
  hasPermission,
  currentUser,
  currentRole
}) => {
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);

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
    monthlySubmission: '月報表回報',
    monthlyManagement: '月報表管理',
    settings: '系統設定',
    volunteer: 'LINE 報修模擬',
    logout: '登出系統',
    admin: '測試管理員'
  };

  const allMenuItems = [
    { id: 'dashboard', label: t.dashboard, icon: <Home size={18} />, module: 'dashboard' },
    { id: 'halls', label: t.halls, icon: <Building size={18} />, module: 'halls' },
    { id: 'reports', label: t.reports, icon: <MessageSquare size={18} />, module: 'reports' },
    { id: 'requests', label: t.requests, icon: <ClipboardList size={18} />, module: 'requests' },
    { id: 'contract', label: t.contract, icon: <FileText size={18} />, module: 'contract' },
    { id: 'equipment', label: t.equipment, icon: <Box size={18} />, module: 'equipment' },
    { id: 'water', label: t.water, icon: <Droplets size={18} />, module: 'water' },
    { id: 'aed', label: t.aed, icon: <HeartPulse size={18} />, module: 'aed' },
    { id: 'vehicle', label: t.vehicle, icon: <Car size={18} />, module: 'vehicle' },
    { id: 'disaster', label: t.disaster, icon: <ShieldAlert size={18} />, module: 'disaster' },
    { id: 'monthly_submission', label: t.monthlySubmission, icon: <FileSignature size={18} />, module: 'reports' },
    { id: 'monthly_management', label: t.monthlyManagement, icon: <Calendar size={18} />, module: 'reports' },
  ];

  // 根據權限過濾選單項目
  const menuItems = hasPermission
    ? allMenuItems.filter(item => hasPermission(item.module, 'view'))
    : allMenuItems;

  return (
    <div className="flex h-screen overflow-hidden bg-slate-50 relative">
      {/* Mobile Backdrop */}
      {isMobileMenuOpen && (
        <div
          className="fixed inset-0 bg-slate-900/60 backdrop-blur-sm z-[100] md:hidden"
          onClick={() => setIsMobileMenuOpen(false)}
        />
      )}

      {/* Sidebar - Desktop & Mobile */}
      <aside className={`fixed inset-y-0 left-0 z-[110] md:relative md:flex flex-col w-72 bg-slate-900 text-white shrink-0 transition-transform duration-300 transform ${isMobileMenuOpen ? 'translate-x-0' : '-translate-x-full md:translate-x-0'}`}>
        <div className="p-6 flex items-center justify-between md:justify-start gap-3 shrink-0">
          <div className="flex items-center gap-3">
            <div className="bg-indigo-600 p-2 rounded-lg">
              <Wrench size={24} className="text-white" />
            </div>
            <span className="font-bold text-lg tracking-tight leading-tight">{t.title}</span>
          </div>
          <button onClick={() => setIsMobileMenuOpen(false)} className="md:hidden p-2 text-slate-400 hover:text-white">
            <CloseIcon size={24} />
          </button>
        </div>

        <nav className="flex-1 px-4 py-4 overflow-y-auto scrollbar-hide space-y-1">
          {menuItems.map((item) => (
            <button
              key={item.id}
              onClick={() => {
                setActiveTab(item.id);
                setIsMobileMenuOpen(false);
              }}
              className={`w-full flex items-center gap-3 px-4 py-3 rounded-xl transition-all ${activeTab === item.id
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
              onClick={() => {
                setActiveTab('settings');
                setIsMobileMenuOpen(false);
              }}
              className={`w-full flex items-center gap-3 px-4 py-3 rounded-xl transition-all ${activeTab === 'settings' ? 'bg-slate-800 text-white' : 'text-slate-500 hover:text-white'
                }`}
            >
              <Settings size={18} />
              <span className="font-medium text-sm">{t.settings}</span>
            </button>
          </div>
        </nav>

        <div className="p-6 border-t border-slate-800">
          <button
            onClick={() => {
              onSimulateVolunteer();
              setIsMobileMenuOpen(false);
            }}
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
        <header className="h-16 bg-white border-b border-slate-200 flex items-center justify-between px-4 md:px-8 shrink-0">
          <div className="flex items-center gap-3">
            <button onClick={() => setIsMobileMenuOpen(true)} className="md:hidden p-2 text-slate-500 hover:bg-slate-50 rounded-lg">
              <Menu size={24} />
            </button>
            <span className="text-xs font-black text-slate-400 uppercase tracking-widest truncate">
              {menuItems.find(m => m.id === activeTab)?.label || activeTab}
            </span>
          </div>
          <div className="flex items-center gap-3 md:gap-4">
            <div className="text-right hidden sm:block">
              <p className="text-xs font-black text-slate-900">
                {currentUser?.name || t.admin}
              </p>
              <p className="text-[10px] font-bold text-slate-400 uppercase">
                {currentRole?.name || 'System Operator'}
              </p>
            </div>
            <button
              onClick={() => (window as any).refreshData?.()}
              className="p-2 md:p-2.5 bg-slate-50 text-slate-400 hover:text-indigo-600 hover:bg-indigo-50 rounded-xl transition-all flex items-center gap-2 group"
              title="同步雲端資料"
            >
              <div className="group-active:animate-spin">
                <RefreshCw size={18} />
              </div>
              <span className="text-xs font-black uppercase hidden lg:inline">同步資料</span>
            </button>
            <div className="w-8 h-8 md:w-10 md:h-10 rounded-full bg-indigo-100 text-indigo-600 flex items-center justify-center font-black shadow-sm text-sm shrink-0">
              {currentUser?.name ? currentUser.name.charAt(0) : 'TSA'}
            </div>
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
