
import React, { useState, useEffect } from 'react';
import {
  User,
  Plus,
  Edit,
  Trash2,
  Save,
  X,
  ArrowLeft,
  Search,
  Lock,
  Shield,
  Building,
  Mail,
  Eye,
  EyeOff,
  CheckCircle2,
  XCircle
} from 'lucide-react';
import { User as UserType, Role, Language, Hall } from '../types';
import { MOCK_HALLS, DEFAULT_ROLES } from '../constants';
import { storageService } from '../services/storageService';

interface UserManagementProps {
  language: Language;
  isOpen: boolean;
  onClose: () => void;
  onLogOperation?: (log: Omit<any, 'id' | 'createdAt'>) => void;
}

const UserManagement: React.FC<UserManagementProps> = ({ language, isOpen, onClose, onLogOperation }) => {
  const [view, setView] = useState<'LIST' | 'EDIT'>('LIST');
  const [users, setUsers] = useState<UserType[]>([]);
  const [roles, setRoles] = useState<Role[]>([]);
  const [halls, setHalls] = useState<Hall[]>([]);
  const [editingUser, setEditingUser] = useState<UserType | null>(null);
  const [searchTerm, setSearchTerm] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [formData, setFormData] = useState({
    account: '',
    password: '',
    name: '',
    email: '',
    roleId: '',
    hallName: '',
    allowedHalls: [] as string[],
    isActive: true
  });

  const translations = {
    [Language.ZH]: {
      title: '帳號管理',
      listTitle: '帳號列表',
      addUser: '新增帳號',
      editUser: '編輯帳號',
      account: '帳號',
      password: '密碼',
      name: '姓名',
      email: '電子郵件',
      role: '角色',
      hall: '所屬會館',
      allowedHalls: '允許存取的會館',
      isActive: '啟用狀態',
      active: '啟用',
      inactive: '停用',
      save: '儲存',
      cancel: '取消',
      delete: '刪除',
      searchPlaceholder: '搜尋帳號或姓名...',
      deleteConfirm: '確定要刪除此帳號嗎？',
      accountRequired: '請輸入帳號',
      passwordRequired: '請輸入密碼',
      nameRequired: '請輸入姓名',
      roleRequired: '請選擇角色',
      saved: '帳號已儲存',
      deleted: '帳號已刪除',
      allHalls: '全部會館',
      selectHalls: '選擇會館',
      noUsers: '尚無帳號資料',
      lastLogin: '最後登入',
      never: '從未登入'
    },
    [Language.JA]: {
      title: 'アカウント管理',
      listTitle: 'アカウント一覧',
      addUser: 'アカウント追加',
      editUser: 'アカウント編集',
      account: 'アカウント',
      password: 'パスワード',
      name: '氏名',
      email: 'メールアドレス',
      role: 'ロール',
      hall: '所属会館',
      allowedHalls: 'アクセス可能な会館',
      isActive: '有効状態',
      active: '有効',
      inactive: '無効',
      save: '保存',
      cancel: 'キャンセル',
      delete: '削除',
      searchPlaceholder: 'アカウントまたは氏名を検索...',
      deleteConfirm: 'このアカウントを削除しますか？',
      accountRequired: 'アカウントを入力してください',
      passwordRequired: 'パスワードを入力してください',
      nameRequired: '氏名を入力してください',
      roleRequired: 'ロールを選択してください',
      saved: 'アカウントを保存しました',
      deleted: 'アカウントを削除しました',
      allHalls: 'すべての会館',
      selectHalls: '会館を選択',
      noUsers: 'アカウントデータがありません',
      lastLogin: '最終ログイン',
      never: 'ログインなし'
    }
  };

  const t = translations[language];

  useEffect(() => {
    const loadData = async () => {
      const savedUsers = await storageService.loadUsers();
      const savedRoles = await storageService.loadRoles();
      const savedHalls = await storageService.loadHalls();

      if (savedUsers) {
        setUsers(savedUsers);
      } else {
        // 初始化預設管理員帳號
        const defaultUser: UserType = {
          id: 'user-admin',
          account: 'admin',
          password: 'tsa2025', // 實際應用中應該加密
          name: '系統管理員',
          roleId: 'admin',
          isActive: true,
          createdAt: new Date().toISOString(),
          updatedAt: new Date().toISOString()
        };
        setUsers([defaultUser]);
        await storageService.saveUsers([defaultUser]);
      }

      if (savedRoles && savedRoles.length > 0) {
        setRoles(savedRoles);
      } else {
        // 初始化預設角色
        setRoles(DEFAULT_ROLES);
        await storageService.saveRoles(DEFAULT_ROLES);
      }

      setHalls(savedHalls || MOCK_HALLS);
    };
    loadData();
  }, []);

  const saveUsers = async (newUsers: UserType[]) => {
    setUsers(newUsers);
    await storageService.saveUsers(newUsers);
  };

  const handleAddUser = () => {
    setFormData({
      account: '',
      password: '',
      name: '',
      email: '',
      roleId: '',
      hallName: '',
      allowedHalls: [],
      isActive: true
    });
    setEditingUser(null);
    setShowPassword(true);
    setView('EDIT');
  };

  const handleEditUser = (user: UserType) => {
    setEditingUser(user);
    setFormData({
      account: user.account,
      password: '', // 編輯時不顯示密碼
      name: user.name,
      email: user.email || '',
      roleId: user.roleId,
      hallName: user.hallName || '',
      allowedHalls: user.allowedHalls || [],
      isActive: user.isActive
    });
    setShowPassword(false);
    setView('EDIT');
  };

  const handleDeleteUser = async (userId: string) => {
    const user = users.find(u => u.id === userId);
    if (!user) return;

    if (user.roleId === 'admin' && users.filter(u => u.roleId === 'admin').length === 1) {
      alert('無法刪除最後一個系統管理員帳號');
      return;
    }

    if (window.confirm(t.deleteConfirm)) {
      const newUsers = users.filter(u => u.id !== userId);
      await saveUsers(newUsers);
      if (onLogOperation) {
        onLogOperation({
          module: 'permissions',
          action: 'delete',
          targetType: 'user',
          targetId: userId,
          targetName: user.name,
          description: `刪除帳號：${user.account} (${user.name})`,
          changes: [{ field: 'user', oldValue: user, newValue: null }]
        });
      }
      alert(t.deleted);
    }
  };

  const handleSaveUser = async () => {
    if (!formData.account.trim()) {
      alert(t.accountRequired);
      return;
    }
    if (!formData.name.trim()) {
      alert(t.nameRequired);
      return;
    }
    if (!formData.roleId) {
      alert(t.roleRequired);
      return;
    }
    if (!editingUser && !formData.password.trim()) {
      alert(t.passwordRequired);
      return;
    }

    const updatedUser: UserType = {
      id: editingUser?.id || `user-${Date.now()}`,
      account: formData.account.trim(),
      password: formData.password.trim() || editingUser?.password || '',
      name: formData.name.trim(),
      email: formData.email.trim() || undefined,
      roleId: formData.roleId,
      hallName: formData.hallName || undefined,
      allowedHalls: formData.allowedHalls.length > 0 ? formData.allowedHalls : undefined,
      isActive: formData.isActive,
      createdAt: editingUser?.createdAt || new Date().toISOString(),
      updatedAt: new Date().toISOString()
    };

    const existingIndex = users.findIndex(u => u.id === updatedUser.id);
    let newUsers: UserType[];

    if (existingIndex >= 0) {
      newUsers = users.map((u, i) => i === existingIndex ? updatedUser : u);
      if (onLogOperation) {
        onLogOperation({
          module: 'permissions',
          action: 'edit',
          targetType: 'user',
          targetId: updatedUser.id,
          targetName: updatedUser.name,
          description: `編輯帳號：${updatedUser.account}`,
          changes: [
            { field: 'name', oldValue: editingUser?.name, newValue: updatedUser.name },
            { field: 'roleId', oldValue: editingUser?.roleId, newValue: updatedUser.roleId },
            { field: 'hallName', oldValue: editingUser?.hallName, newValue: updatedUser.hallName }
          ]
        });
      }
    } else {
      // 檢查帳號是否已存在
      if (users.some(u => u.account === updatedUser.account)) {
        alert('此帳號已存在');
        return;
      }
      newUsers = [...users, updatedUser];
      if (onLogOperation) {
        onLogOperation({
          module: 'permissions',
          action: 'create',
          targetType: 'user',
          targetId: updatedUser.id,
          targetName: updatedUser.name,
          description: `新增帳號：${updatedUser.account}`
        });
      }
    }

    await saveUsers(newUsers);
    setView('LIST');
    setEditingUser(null);
    setFormData({
      account: '',
      password: '',
      name: '',
      email: '',
      roleId: '',
      hallName: '',
      allowedHalls: [],
      isActive: true
    });
    alert(t.saved);
  };

  const toggleHall = (hallName: string) => {
    const newHalls = formData.allowedHalls.includes(hallName)
      ? formData.allowedHalls.filter(h => h !== hallName)
      : [...formData.allowedHalls, hallName];
    setFormData({ ...formData, allowedHalls: newHalls });
  };

  const filteredUsers = users.filter(user =>
    user.account.toLowerCase().includes(searchTerm.toLowerCase()) ||
    user.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
    user.email?.toLowerCase().includes(searchTerm.toLowerCase())
  );

  if (!isOpen) return null;

  if (view === 'EDIT') {
    return (
      <div className="fixed inset-0 z-[300] flex">
        <div className="absolute inset-0 bg-black/50" onClick={onClose} />
        <div className="relative w-full max-w-2xl bg-white ml-auto h-full overflow-y-auto">
          <div className="sticky top-0 bg-white border-b border-slate-200 p-6 z-10">
            <div className="flex items-center gap-4">
              <button
                onClick={() => {
                  setView('LIST');
                  setEditingUser(null);
                }}
                className="p-2 hover:bg-slate-100 rounded-lg transition-colors"
              >
                <ArrowLeft size={20} className="text-slate-600" />
              </button>
              <h1 className="text-2xl font-black text-slate-900">{t.editUser}</h1>
              <button
                onClick={onClose}
                className="ml-auto p-2 hover:bg-slate-100 rounded-lg transition-colors"
              >
                <X size={20} className="text-slate-600" />
              </button>
            </div>
          </div>

          <div className="p-6 space-y-6">
            <div className="space-y-4">
              <div>
                <label className="block text-sm font-bold text-slate-700 mb-2">{t.account}</label>
                <input
                  type="text"
                  value={formData.account}
                  onChange={(e) => setFormData({ ...formData, account: e.target.value })}
                  disabled={!!editingUser}
                  className="w-full px-4 py-3 bg-slate-50 border border-slate-200 rounded-xl focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 outline-none disabled:opacity-50"
                  placeholder={t.account}
                />
              </div>

              <div>
                <label className="block text-sm font-bold text-slate-700 mb-2">{t.password}</label>
                <div className="relative">
                  <input
                    type={showPassword ? 'text' : 'password'}
                    value={formData.password}
                    onChange={(e) => setFormData({ ...formData, password: e.target.value })}
                    className="w-full px-4 py-3 bg-slate-50 border border-slate-200 rounded-xl focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 outline-none pr-12"
                    placeholder={editingUser ? '留空則不變更密碼' : t.password}
                  />
                  <button
                    type="button"
                    onClick={() => setShowPassword(!showPassword)}
                    className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-600"
                  >
                    {showPassword ? <EyeOff size={20} /> : <Eye size={20} />}
                  </button>
                </div>
              </div>

              <div>
                <label className="block text-sm font-bold text-slate-700 mb-2">{t.name}</label>
                <input
                  type="text"
                  value={formData.name}
                  onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                  className="w-full px-4 py-3 bg-slate-50 border border-slate-200 rounded-xl focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 outline-none"
                  placeholder={t.name}
                />
              </div>

              <div>
                <label className="block text-sm font-bold text-slate-700 mb-2">{t.email}</label>
                <input
                  type="email"
                  value={formData.email}
                  onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                  className="w-full px-4 py-3 bg-slate-50 border border-slate-200 rounded-xl focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 outline-none"
                  placeholder={t.email}
                />
              </div>

              <div>
                <label className="block text-sm font-bold text-slate-700 mb-2">{t.role}</label>
                <select
                  value={formData.roleId}
                  onChange={(e) => setFormData({ ...formData, roleId: e.target.value })}
                  className="w-full px-4 py-3 bg-slate-50 border border-slate-200 rounded-xl focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 outline-none"
                >
                  <option value="">請選擇角色</option>
                  {roles.map(role => (
                    <option key={role.id} value={role.id}>{role.name}</option>
                  ))}
                </select>
              </div>

              <div>
                <label className="block text-sm font-bold text-slate-700 mb-2">{t.hall}</label>
                <select
                  value={formData.hallName}
                  onChange={(e) => setFormData({ ...formData, hallName: e.target.value })}
                  className="w-full px-4 py-3 bg-slate-50 border border-slate-200 rounded-xl focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 outline-none"
                >
                  <option value="">不限制</option>
                  {halls.map(hall => (
                    <option key={hall.id} value={hall.name}>{hall.name}</option>
                  ))}
                </select>
              </div>

              <div>
                <label className="block text-sm font-bold text-slate-700 mb-2">{t.allowedHalls}</label>
                <div className="border border-slate-200 rounded-xl p-4 max-h-48 overflow-y-auto">
                  <div className="space-y-2">
                    {halls.map(hall => (
                      <label
                        key={hall.id}
                        className="flex items-center gap-2 p-2 rounded-lg hover:bg-slate-50 cursor-pointer"
                      >
                        <input
                          type="checkbox"
                          checked={formData.allowedHalls.includes(hall.name)}
                          onChange={() => toggleHall(hall.name)}
                          className="w-4 h-4 text-indigo-600 rounded focus:ring-indigo-500"
                        />
                        <span className="text-sm font-medium text-slate-700">{hall.name}</span>
                      </label>
                    ))}
                  </div>
                  <p className="text-xs text-slate-400 mt-2">未選擇任何會館表示可存取全部會館</p>
                </div>
              </div>

              <div>
                <label className="flex items-center gap-2 cursor-pointer">
                  <input
                    type="checkbox"
                    checked={formData.isActive}
                    onChange={(e) => setFormData({ ...formData, isActive: e.target.checked })}
                    className="w-4 h-4 text-indigo-600 rounded focus:ring-indigo-500"
                  />
                  <span className="text-sm font-bold text-slate-700">{t.isActive}</span>
                </label>
              </div>
            </div>

            <div className="flex gap-3 pt-4 border-t border-slate-200">
              <button
                onClick={handleSaveUser}
                className="flex-1 flex items-center justify-center gap-2 py-3 bg-indigo-600 text-white rounded-xl font-black hover:bg-indigo-700 transition-colors"
              >
                <Save size={18} />
                {t.save}
              </button>
              <button
                onClick={() => {
                  setView('LIST');
                  setEditingUser(null);
                }}
                className="flex-1 flex items-center justify-center gap-2 py-3 bg-slate-100 text-slate-700 rounded-xl font-black hover:bg-slate-200 transition-colors"
              >
                <X size={18} />
                {t.cancel}
              </button>
            </div>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="fixed inset-0 z-[300] flex">
      <div className="absolute inset-0 bg-black/50" onClick={onClose} />
      <div className="relative w-full max-w-3xl bg-white ml-auto h-full overflow-y-auto flex flex-col">
        <div className="sticky top-0 bg-white border-b border-slate-200 p-6 z-10">
          <div className="flex items-center justify-between">
            <h1 className="text-2xl font-black text-slate-900">{t.title}</h1>
            <button
              onClick={onClose}
              className="p-2 hover:bg-slate-100 rounded-lg transition-colors"
            >
              <X size={20} className="text-slate-600" />
            </button>
          </div>
        </div>

        <div className="flex-1 p-6 space-y-6">
          <div className="flex items-center justify-between">
            <div className="flex-1 relative max-w-md">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" size={18} />
              <input
                type="text"
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                placeholder={t.searchPlaceholder}
                className="w-full pl-10 pr-4 py-2.5 bg-slate-50 border border-slate-200 rounded-xl focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 outline-none"
              />
            </div>
            <button
              onClick={handleAddUser}
              className="flex items-center gap-2 px-4 py-2 bg-indigo-600 text-white rounded-xl font-black hover:bg-indigo-700 transition-colors"
            >
              <Plus size={18} />
              {t.addUser}
            </button>
          </div>

          <div className="bg-white rounded-2xl shadow-sm border border-slate-200 overflow-hidden">
            <div className="divide-y divide-slate-200">
              {filteredUsers.map(user => {
                const role = roles.find(r => r.id === user.roleId);
                return (
                  <div
                    key={user.id}
                    className="p-4 hover:bg-slate-50 transition-colors"
                  >
                    <div className="flex items-center justify-between">
                      <div className="flex-1">
                        <div className="flex items-center gap-3 mb-2">
                          <User size={20} className="text-slate-600" />
                          <div>
                            <h3 className="font-black text-slate-900">{user.name}</h3>
                            <p className="text-sm text-slate-500">{user.account}</p>
                          </div>
                          {user.isActive ? (
                            <CheckCircle2 size={18} className="text-emerald-500" />
                          ) : (
                            <XCircle size={18} className="text-slate-400" />
                          )}
                        </div>
                        <div className="flex items-center gap-4 text-xs text-slate-500 ml-8">
                          {role && (
                            <div className="flex items-center gap-1">
                              <Shield size={14} />
                              <span>{role.name}</span>
                            </div>
                          )}
                          {user.hallName && (
                            <div className="flex items-center gap-1">
                              <Building size={14} />
                              <span>{user.hallName}</span>
                            </div>
                          )}
                          {user.email && (
                            <div className="flex items-center gap-1">
                              <Mail size={14} />
                              <span>{user.email}</span>
                            </div>
                          )}
                        </div>
                        {user.lastLoginAt && (
                          <p className="text-xs text-slate-400 ml-8 mt-1">
                            {t.lastLogin}: {new Date(user.lastLoginAt).toLocaleString('zh-TW')}
                          </p>
                        )}
                      </div>
                      <div className="flex gap-2">
                        <button
                          onClick={() => handleEditUser(user)}
                          className="p-2 text-indigo-600 hover:bg-indigo-50 rounded-lg transition-colors"
                        >
                          <Edit size={18} />
                        </button>
                        <button
                          onClick={() => handleDeleteUser(user.id)}
                          className="p-2 text-rose-600 hover:bg-rose-50 rounded-lg transition-colors"
                        >
                          <Trash2 size={18} />
                        </button>
                      </div>
                    </div>
                  </div>
                );
              })}
            </div>

            {filteredUsers.length === 0 && (
              <div className="text-center py-12 text-slate-400">
                <User size={48} className="mx-auto mb-4 opacity-50" />
                <p className="font-bold">{t.noUsers}</p>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

export default UserManagement;

