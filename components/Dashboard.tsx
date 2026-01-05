
import React from 'react';
import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
  PieChart,
  Pie,
  Cell,
  Legend
} from 'recharts';
import {
  Wrench,
  Clock,
  CheckCircle2,
  AlertCircle,
  TrendingUp,
  MapPin,
  CalendarCheck,
  History,
  ShieldCheck,
  Building2,
  ChevronRight,
  AlertTriangle,
  FileText,
  User,
  ChevronDown,
  ChevronUp
} from 'lucide-react';
import { RepairRequest, RepairStatus, OrderType, Category, Language, MonthlyReport, Hall } from '../types';
import { STATUS_CONFIG, MOCK_HALLS, HEALTH_CHECK_CONFIG } from '../constants';
import { storageService } from '../services/storageService';
import { useState, useEffect } from 'react';

interface DashboardProps {
  requests: RepairRequest[];
  monthlyReports?: MonthlyReport[];
  language: Language;
}

const Dashboard: React.FC<DashboardProps> = ({ requests, monthlyReports = [], language }) => {
  const [halls, setHalls] = useState<Hall[]>([]);
  const [expandedAreas, setExpandedAreas] = useState<Record<string, boolean>>({
    '北部': true,
    '中部': true,
    '南部': true,
    '東部': true,
    '離島': true
  });

  useEffect(() => {
    const loadHalls = async () => {
      const savedHalls = await storageService.loadHalls();
      setHalls(savedHalls || MOCK_HALLS);
    };
    loadHalls();
  }, []);

  const toggleArea = (area: string) => {
    setExpandedAreas(prev => ({
      ...prev,
      [area]: !prev[area]
    }));
  };
  const translations = {
    [Language.ZH]: {
      title: '會館設備運維總覽',
      subtitle: '整合機電、消防、空調、飲水機等全項管理數據',
      statTotal: '案件總數',
      statOverdue: '逾期未處理',
      statVolunteer: '志工報修',
      statClosed: '已結案',
      tableTitle: '全台會館設備健康檢查表',
      normal: '運作正常',
      warning: '有待辦/預警',
      critical: '緊急故障',
      hallName: '會館名稱',
      manage: '管理',
      pieTitle: '案件類型分佈',
      barTitle: '工單進度統計',
      monthlyReports: '最新會館月報表'
    },
    [Language.JA]: {
      title: '会館施設運用オーバービュー',
      subtitle: '機電、消防、空調、給水機などの全管理データの統合',
      statTotal: '総件数',
      statOverdue: '期限超過',
      statVolunteer: 'ボランティア報告',
      statClosed: '完了済み',
      tableTitle: '全国会館施設状態チェック表',
      normal: '正常',
      warning: '警告あり',
      critical: '緊急故障',
      hallName: '会館名',
      manage: '管理',
      pieTitle: '案件タイプ分布',
      barTitle: '作業状況統計',
      monthlyReports: '最新の会館月報'
    }
  };

  const t = translations[language];

  const isOverdue = (req: RepairRequest) => {
    if (req.type !== OrderType.ROUTINE || !req.lastExecutedDate || !req.maintenanceCycle) return false;
    if (req.status === RepairStatus.CLOSED) return false;

    const lastDate = new Date(req.lastExecutedDate);
    const nextDate = new Date(lastDate.getTime() + req.maintenanceCycle * 24 * 60 * 60 * 1000);
    return nextDate < new Date();
  };

  const overdueCount = requests.filter(isOverdue).length;

  const stats = [
    { label: t.statTotal, value: requests.length, icon: <CalendarCheck size={24} />, color: 'bg-indigo-600' },
    { label: t.statOverdue, value: overdueCount, icon: <History size={24} />, color: 'bg-rose-600' },
    { label: t.statVolunteer, value: requests.filter(r => r.type === OrderType.VOLUNTEER).length, icon: <AlertCircle size={24} />, color: 'bg-orange-500' },
    { label: t.statClosed, value: requests.filter(r => r.status === RepairStatus.CLOSED).length, icon: <CheckCircle2 size={24} />, color: 'bg-emerald-500' },
  ];

  const categoryData = requests.reduce((acc: any[], req) => {
    const existing = acc.find(item => item.name === req.category);
    if (existing) {
      existing.value += 1;
    } else {
      acc.push({ name: req.category, value: 1 });
    }
    return acc;
  }, []);

  const COLORS = ['#4f46e5', '#3b82f6', '#0ea5e9', '#06b6d4', '#14b8a6', '#10b981', '#f59e0b', '#ef4444', '#8b5cf6', '#64748b'];

  const statusData = Object.keys(STATUS_CONFIG).map(key => ({
    name: language === Language.JA ? (key === 'PENDING' ? '未着手' : key === 'IN_PROGRESS' ? '進行中' : '完了') : STATUS_CONFIG[key as RepairStatus].label,
    count: requests.filter(r => r.status === key).length
  }));

  const getHallFacilityStatus = (hallName: string, category: Category) => {
    const relatedRequests = requests.filter(r => r.hallName === hallName && r.category === category && r.status !== RepairStatus.CLOSED);
    if (relatedRequests.some(r => r.urgency === 'EMERGENCY' || r.urgency === 'HIGH')) return 'RED';
    if (relatedRequests.length > 0) return 'YELLOW';
    return 'GREEN';
  };

  // 區域順序定義
  const areaOrder = ['北部', '中部', '南部', '東部', '離島'];
  const getAreaOrder = (area: string) => {
    const index = areaOrder.indexOf(area);
    return index === -1 ? 999 : index; // 未定義的區域放在最後
  };

  // 依區域排序會館，同區域內按名稱排序
  const sortedHalls = [...halls].sort((a, b) => {
    const areaDiff = getAreaOrder(a.area) - getAreaOrder(b.area);
    if (areaDiff !== 0) return areaDiff;
    return a.name.localeCompare(b.name, 'zh-TW');
  });

  // 計算區域統計
  const getAreaStats = (area: string) => {
    const areaHalls = sortedHalls.filter(hall => hall.area === area);
    let normalCount = 0;
    let warningCount = 0;
    let criticalCount = 0;

    areaHalls.forEach(hall => {
      let hasCritical = false;
      let hasWarning = false;

      HEALTH_CHECK_CONFIG.forEach(facility => {
        const status = getHallFacilityStatus(hall.name, facility.key as Category);
        if (status === 'RED') hasCritical = true;
        if (status === 'YELLOW') hasWarning = true;
      });

      if (hasCritical) criticalCount++;
      else if (hasWarning) warningCount++;
      else normalCount++;
    });

    return { normalCount, warningCount, criticalCount, totalCount: areaHalls.length };
  };

  return (
    <div className="space-y-8 animate-in fade-in duration-500 pb-20">
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <h1 className="text-3xl font-extrabold text-slate-900 tracking-tight">{t.title}</h1>
          <p className="text-slate-500 font-medium">{t.subtitle}</p>
        </div>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
        {stats.map((stat, idx) => (
          <div key={idx} className="bg-white p-6 rounded-3xl border border-slate-100 shadow-sm hover:shadow-xl transition-all">
            <div className="flex items-start justify-between">
              <div className={`p-4 rounded-2xl text-white shadow-lg ${stat.color}`}>
                {stat.icon}
              </div>
            </div>
            <div className="mt-6">
              <h3 className="text-slate-500 text-sm font-bold">{stat.label}</h3>
              <p className="text-3xl font-black text-slate-900 mt-1">{stat.value}</p>
            </div>
          </div>
        ))}
      </div>

      <div className="bg-white p-8 rounded-[40px] border border-slate-100 shadow-sm">
        <div className="flex items-center justify-between mb-8">
          <h3 className="text-xl font-black text-slate-900 flex items-center gap-2">
            <ShieldCheck className="text-indigo-600" /> {t.tableTitle}
          </h3>
          <div className="flex items-center gap-4 text-[10px] font-black uppercase tracking-widest">
            <span className="flex items-center gap-1.5"><div className="w-2 h-2 rounded-full bg-emerald-500"></div> {t.normal}</span>
            <span className="flex items-center gap-1.5"><div className="w-2 h-2 rounded-full bg-amber-500"></div> {t.warning}</span>
            <span className="flex items-center gap-1.5"><div className="w-2 h-2 rounded-full bg-rose-500 animate-pulse"></div> {t.critical}</span>
          </div>
        </div>

        <div className="bg-white rounded-[40px] border border-slate-200 shadow-sm overflow-hidden">
          {/* Mobile View: Cards */}
          <div className="md:hidden divide-y divide-slate-100">
            {areaOrder.map(area => {
              const areaHalls = sortedHalls.filter(hall => hall.area === area);
              if (areaHalls.length === 0) return null;
              const isExpanded = expandedAreas[area];
              const stats = getAreaStats(area);
              return (
                <div key={area}>
                  <button
                    onClick={() => toggleArea(area)}
                    className="w-full px-6 py-4 bg-slate-50 border-b border-slate-200 hover:bg-slate-100 transition-colors"
                  >
                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-2 flex-1">
                        <MapPin size={14} className="text-indigo-600" />
                        <span className="text-xs font-black text-slate-700 uppercase tracking-wider">{area}</span>
                        <span className="text-[10px] text-slate-400">({areaHalls.length} 間)</span>
                      </div>
                      <div className="flex items-center gap-3">
                        {!isExpanded && (
                          <div className="flex items-center gap-2">
                            <div className="flex items-center gap-1">
                              <div className="w-2 h-2 rounded-full bg-emerald-500"></div>
                              <span className="text-[10px] text-slate-600 font-bold">{stats.normalCount}</span>
                            </div>
                            <div className="flex items-center gap-1">
                              <div className="w-2 h-2 rounded-full bg-amber-500"></div>
                              <span className="text-[10px] text-slate-600 font-bold">{stats.warningCount}</span>
                            </div>
                            <div className="flex items-center gap-1">
                              <div className="w-2 h-2 rounded-full bg-rose-500"></div>
                              <span className="text-[10px] text-slate-600 font-bold">{stats.criticalCount}</span>
                            </div>
                          </div>
                        )}
                        {isExpanded ? <ChevronUp size={16} className="text-slate-400" /> : <ChevronDown size={16} className="text-slate-400" />}
                      </div>
                    </div>
                  </button>
                  {isExpanded && areaHalls.map(hall => (
                    <div key={hall.id} className="p-6 space-y-4">
                      <div className="flex items-center gap-3">
                        <div className="p-2 bg-slate-100 rounded-lg text-slate-500"><Building2 size={16} /></div>
                        <span className="font-bold text-slate-900 text-sm">{hall.name}</span>
                      </div>
                      <div className="grid grid-cols-4 gap-2">
                        {HEALTH_CHECK_CONFIG.map(facility => {
                          const status = getHallFacilityStatus(hall.name, facility.key as Category);
                          return (
                            <div key={facility.key} className="flex flex-col items-center gap-1 p-2 bg-slate-50 rounded-xl border border-slate-100">
                              <div className="text-slate-400">{facility.icon}</div>
                              <div className={`w-2.5 h-2.5 rounded-full ${status === 'GREEN' ? 'bg-emerald-500 shadow-sm shadow-emerald-200' :
                                status === 'YELLOW' ? 'bg-amber-500' :
                                  'bg-rose-500 animate-pulse'
                                }`}></div>
                            </div>
                          );
                        })}
                      </div>
                    </div>
                  ))}
                </div>
              );
            })}
          </div>

          {/* Desktop View: Table */}
          <div className="hidden md:block overflow-x-auto">
            <table className="w-full text-left">
              <thead>
                <tr className="text-[10px] font-black text-slate-400 uppercase tracking-widest border-b border-slate-50">
                  <th className="px-4 py-4">{t.hallName}</th>
                  {HEALTH_CHECK_CONFIG.map(facility => (
                    <th key={facility.key} className="px-4 py-4 text-center">
                      <div className="flex flex-col items-center gap-1">
                        {facility.icon}
                        <span>{facility.label}</span>
                      </div>
                    </th>
                  ))}
                  <th className="px-4 py-4 text-right">{t.manage}</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100">
                {areaOrder.map(area => {
                  const areaHalls = sortedHalls.filter(hall => hall.area === area);
                  if (areaHalls.length === 0) return null;
                  const isExpanded = expandedAreas[area];
                  const stats = getAreaStats(area);
                  return (
                    <React.Fragment key={area}>
                      <tr className="bg-slate-50/50 hover:bg-slate-100/50 transition-colors cursor-pointer" onClick={() => toggleArea(area)}>
                        <td colSpan={HEALTH_CHECK_CONFIG.length + 2} className="px-4 py-3">
                          <div className="flex items-center justify-between">
                            <div className="flex items-center gap-2">
                              <MapPin size={14} className="text-indigo-600" />
                              <span className="text-xs font-black text-slate-700 uppercase tracking-wider">{area}</span>
                              <span className="text-[10px] text-slate-400">({areaHalls.length} 間)</span>
                            </div>
                            <div className="flex items-center gap-4">
                              {!isExpanded && (
                                <div className="flex items-center gap-3">
                                  <div className="flex items-center gap-1.5">
                                    <div className="w-2.5 h-2.5 rounded-full bg-emerald-500"></div>
                                    <span className="text-[10px] text-slate-600 font-bold">正常 {stats.normalCount}</span>
                                  </div>
                                  <div className="flex items-center gap-1.5">
                                    <div className="w-2.5 h-2.5 rounded-full bg-amber-500"></div>
                                    <span className="text-[10px] text-slate-600 font-bold">警告 {stats.warningCount}</span>
                                  </div>
                                  <div className="flex items-center gap-1.5">
                                    <div className="w-2.5 h-2.5 rounded-full bg-rose-500"></div>
                                    <span className="text-[10px] text-slate-600 font-bold">緊急 {stats.criticalCount}</span>
                                  </div>
                                </div>
                              )}
                              {isExpanded ? <ChevronUp size={16} className="text-slate-400" /> : <ChevronDown size={16} className="text-slate-400" />}
                            </div>
                          </div>
                        </td>
                      </tr>
                      {isExpanded && areaHalls.map(hall => (
                        <tr key={hall.id} className="hover:bg-slate-50/50 transition-colors">
                          <td className="px-4 py-4">
                            <div className="flex items-center gap-3">
                              <div className="p-2 bg-slate-100 rounded-lg text-slate-500"><Building2 size={16} /></div>
                              <span className="font-bold text-slate-900 text-sm">{hall.name}</span>
                            </div>
                          </td>
                          {HEALTH_CHECK_CONFIG.map(facility => {
                            const status = getHallFacilityStatus(hall.name, facility.key as Category);
                            return (
                              <td key={facility.key} className="px-4 py-4">
                                <div className="flex justify-center">
                                  <div className={`w-4 h-4 rounded-full border-2 ${status === 'GREEN' ? 'bg-emerald-500 border-emerald-100 shadow-sm shadow-emerald-200' :
                                    status === 'YELLOW' ? 'bg-amber-500 border-amber-100' :
                                      'bg-rose-500 border-rose-100 animate-pulse'
                                    }`}></div>
                                </div>
                              </td>
                            );
                          })}
                          <td className="px-4 py-4 text-right">
                            <button className="p-2 text-slate-400 hover:text-indigo-600 transition-colors">
                              <ChevronRight size={18} />
                            </button>
                          </td>
                        </tr>
                      ))}
                    </React.Fragment>
                  );
                })}
              </tbody>
            </table>
          </div>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
        <div className="bg-white p-8 rounded-[40px] border border-slate-100 shadow-sm">
          <h3 className="text-xl font-bold text-slate-900 mb-8">{t.pieTitle}</h3>
          <div className="h-72">
            <ResponsiveContainer width="100%" height="100%">
              <PieChart>
                <Pie data={categoryData} cx="50%" cy="50%" innerRadius={70} outerRadius={100} paddingAngle={5} dataKey="value" stroke="none" labelLine={false}>
                  {categoryData.map((entry, index) => <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />)}
                </Pie>
                <Tooltip contentStyle={{ borderRadius: '24px', border: 'none', boxShadow: '0 10px 25px rgba(0,0,0,0.1)' }} />
                <Legend
                  verticalAlign="bottom"
                  height={36}
                  iconType="circle"
                  formatter={(value, entry) => (
                    <span style={{ color: entry.color, fontSize: '12px', fontWeight: 'bold' }}>
                      {value}
                    </span>
                  )}
                  wrapperStyle={{ paddingTop: '20px' }}
                />
              </PieChart>
            </ResponsiveContainer>
          </div>
        </div>

        <div className="bg-white p-8 rounded-[40px] border border-slate-100 shadow-sm">
          <h3 className="text-xl font-bold text-slate-900 mb-8">{t.barTitle}</h3>
          <div className="h-72">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={statusData}>
                <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#f1f5f9" />
                <XAxis dataKey="name" axisLine={false} tickLine={false} />
                <YAxis axisLine={false} tickLine={false} />
                <Tooltip cursor={{ fill: '#f8fafc' }} contentStyle={{ borderRadius: '24px', border: 'none' }} />
                <Bar dataKey="count" fill="#4f46e5" radius={[8, 8, 0, 0]} barSize={40} />
              </BarChart>
            </ResponsiveContainer>
          </div>
        </div>
      </div>

      <div className="bg-white p-8 rounded-[40px] border border-slate-100 shadow-sm">
        <div className="flex items-center justify-between mb-8">
          <h3 className="text-xl font-black text-slate-900 flex items-center gap-2">
            <TrendingUp className="text-indigo-600" /> {t.monthlyReports}
          </h3>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {monthlyReports.length > 0 ? (
            monthlyReports.slice(0, 6).map(report => (
              <div key={report.id} className="p-6 bg-slate-50 rounded-3xl border border-slate-100 hover:border-indigo-200 hover:bg-white transition-all group">
                <div className="flex items-center justify-between mb-4">
                  <span className="text-[10px] font-black uppercase tracking-widest text-indigo-600 bg-indigo-50 px-3 py-1 rounded-full">
                    {report.yearMonth}
                  </span>
                  <div className="p-2 bg-white rounded-xl shadow-sm group-hover:bg-indigo-600 group-hover:text-white transition-colors">
                    <FileText size={16} />
                  </div>
                </div>
                <h4 className="font-black text-slate-900 mb-2">{report.hallName}</h4>
                <p className="text-xs text-slate-500 font-medium line-clamp-3 leading-relaxed">
                  {report.content}
                </p>
                <div className="mt-4 pt-4 border-t border-slate-200/50 flex items-center justify-between text-[10px] font-bold text-slate-400">
                  <span className="flex items-center gap-1"><User size={10} /> {report.reporter}</span>
                  <span>{new Date(report.createdAt).toLocaleDateString()}</span>
                </div>
              </div>
            ))
          ) : (
            <div className="col-span-full py-12 text-center text-slate-400 font-bold border-2 border-dashed border-slate-100 rounded-3xl">
              尚未有月報表提交紀錄
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default Dashboard;
