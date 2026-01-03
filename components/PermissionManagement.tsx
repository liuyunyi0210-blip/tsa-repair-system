
import React, { useState, useEffect } from 'react';
import { 
  Shield, 
  Plus, 
  Edit, 
  Trash2, 
  Save, 
  X, 
  ArrowLeft,
  CheckSquare,
  Square,
  Lock,
  Users,
  Search,
  ChevronRight
} from 'lucide-react';
import { Role, Permission, Language } from '../types';
import { MODULES, PERMISSION_ACTIONS, ALL_PERMISSIONS, DEFAULT_ROLES } from '../constants';
import { storageService } from '../services/storageService';

interface PermissionManagementProps {
  language: Language;
  isOpen: boolean;
  onClose: () => void;
  onLogOperation?: (log: Omit<any, 'id' | 'createdAt'>) => void;
}

const PermissionManagement: React.FC<PermissionManagementProps> = ({ language, isOpen, onClose, onLogOperation }) => {
  const [view, setView] = useState<'LIST' | 'EDIT'>('LIST');
  const [roles, setRoles] = useState<Role[]>([]);
  const [editingRole, setEditingRole] = useState<Role | null>(null);
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedPermissions, setSelectedPermissions] = useState<Set<string>>(new Set());

  const translations = {
    [Language.ZH]: {
      title: '角色權限設定',
      listTitle: '角色列表',
      addRole: '新增角色',
      editRole: '編輯角色',
      roleName: '角色名稱',
      description: '角色說明',
      permissions: '權限設定',
      save: '儲存',
      cancel: '取消',
      delete: '刪除',
      systemRole: '系統預設角色',
      customRole: '自訂角色',
      noRoles: '尚無角色資料',
      searchPlaceholder: '搜尋角色...',
      selectAll: '全選',
      deselectAll: '取消全選',
      modulePermissions: '模組權限',
      deleteConfirm: '確定要刪除此角色嗎？',
      cannotDeleteSystem: '無法刪除系統預設角色',
      cannotEditSystem: '無法編輯系統預設角色',
      nameRequired: '請輸入角色名稱',
      saved: '角色已儲存',
      deleted: '角色已刪除'
    },
    [Language.JA]: {
      title: 'ロール権限設定',
      listTitle: 'ロール一覧',
      addRole: 'ロール追加',
      editRole: 'ロール編集',
      roleName: 'ロール名',
      description: '説明',
      permissions: '権限設定',
      save: '保存',
      cancel: 'キャンセル',
      delete: '削除',
      systemRole: 'システムロール',
      customRole: 'カスタムロール',
      noRoles: 'ロールデータがありません',
      searchPlaceholder: 'ロールを検索...',
      selectAll: 'すべて選択',
      deselectAll: 'すべて解除',
      modulePermissions: 'モジュール権限',
      deleteConfirm: 'このロールを削除しますか？',
      cannotDeleteSystem: 'システムロールは削除できません',
      nameRequired: 'ロール名を入力してください',
      saved: 'ロールを保存しました',
      deleted: 'ロールを削除しました'
    }
  };

  const t = translations[language];

  useEffect(() => {
    const loadData = async () => {
      const saved = await storageService.loadRoles();
      if (saved) {
        setRoles(saved);
      } else {
        // 初始化預設角色
        setRoles(DEFAULT_ROLES);
        await storageService.saveRoles(DEFAULT_ROLES);
      }
    };
    loadData();
  }, []);

  const saveRoles = async (newRoles: Role[]) => {
    setRoles(newRoles);
    await storageService.saveRoles(newRoles);
  };

  const handleAddRole = () => {
    setEditingRole({
      id: `role-${Date.now()}`,
      name: '',
      description: '',
      permissions: [],
      isSystem: false,
      createdAt: new Date().toISOString()
    });
    setSelectedPermissions(new Set());
    setView('EDIT');
  };

  const handleEditRole = (role: Role) => {
    setEditingRole({ ...role });
    setSelectedPermissions(new Set(role.permissions));
    setView('EDIT');
  };

  const handleDeleteRole = async (roleId: string) => {
    const role = roles.find(r => r.id === roleId);
    if (!role) return;
    
    if (role.isSystem) {
      alert(t.cannotDeleteSystem);
      return;
    }

    if (window.confirm(t.deleteConfirm)) {
      const newRoles = roles.filter(r => r.id !== roleId);
      await saveRoles(newRoles);
      if (onLogOperation) {
        onLogOperation({
          module: 'permissions',
          action: 'delete',
          targetType: 'role',
          targetId: roleId,
          targetName: role.name,
          description: `刪除角色：${role.name}`,
          changes: [{ field: 'role', oldValue: role, newValue: null }]
        });
      }
      alert(t.deleted);
    }
  };

  const handleSaveRole = async () => {
    if (!editingRole) return;
    
    if (!editingRole.name.trim()) {
      alert(t.nameRequired);
      return;
    }

    const updatedRole: Role = {
      ...editingRole,
      permissions: Array.from(selectedPermissions),
      updatedAt: new Date().toISOString(),
      // 保持 isSystem 屬性
      isSystem: editingRole.isSystem
    };

    const existingIndex = roles.findIndex(r => r.id === updatedRole.id);
    let newRoles: Role[];
    
    if (existingIndex >= 0) {
      newRoles = roles.map((r, i) => i === existingIndex ? updatedRole : r);
      if (onLogOperation) {
        onLogOperation({
          module: 'permissions',
          action: 'edit',
          targetType: 'role',
          targetId: updatedRole.id,
          targetName: updatedRole.name,
          description: `編輯角色：${updatedRole.name}`,
          changes: [
            { field: 'name', oldValue: editingRole.name, newValue: updatedRole.name },
            { field: 'permissions', oldValue: editingRole.permissions, newValue: updatedRole.permissions }
          ]
        });
      }
    } else {
      newRoles = [...roles, updatedRole];
      if (onLogOperation) {
        onLogOperation({
          module: 'permissions',
          action: 'create',
          targetType: 'role',
          targetId: updatedRole.id,
          targetName: updatedRole.name,
          description: `新增角色：${updatedRole.name}`
        });
      }
    }

    await saveRoles(newRoles);
    setView('LIST');
    setEditingRole(null);
    setSelectedPermissions(new Set());
    alert(t.saved);
  };

  const togglePermission = (permissionId: string) => {
    const newSet = new Set(selectedPermissions);
    if (newSet.has(permissionId)) {
      newSet.delete(permissionId);
    } else {
      newSet.add(permissionId);
    }
    setSelectedPermissions(newSet);
  };

  const toggleModulePermissions = (moduleId: string, checked: boolean) => {
    const newSet = new Set(selectedPermissions);
    const modulePermissions = ALL_PERMISSIONS.filter(p => p.module === moduleId);
    
    if (checked) {
      modulePermissions.forEach(p => newSet.add(p.id));
    } else {
      modulePermissions.forEach(p => newSet.delete(p.id));
    }
    setSelectedPermissions(newSet);
  };

  const isModuleFullySelected = (moduleId: string) => {
    const modulePermissions = ALL_PERMISSIONS.filter(p => p.module === moduleId);
    return modulePermissions.length > 0 && modulePermissions.every(p => selectedPermissions.has(p.id));
  };

  const isModulePartiallySelected = (moduleId: string) => {
    const modulePermissions = ALL_PERMISSIONS.filter(p => p.module === moduleId);
    const selectedCount = modulePermissions.filter(p => selectedPermissions.has(p.id)).length;
    return selectedCount > 0 && selectedCount < modulePermissions.length;
  };

  const filteredRoles = roles.filter(role => 
    role.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
    role.description?.toLowerCase().includes(searchTerm.toLowerCase())
  );

  const systemRoles = filteredRoles.filter(r => r.isSystem);
  const customRoles = filteredRoles.filter(r => !r.isSystem);

  if (!isOpen) return null;

  if (view === 'EDIT' && editingRole) {
    return (
      <div className="fixed inset-0 z-50 flex">
        <div className="absolute inset-0 bg-black/50" onClick={onClose} />
        <div className="relative w-full max-w-4xl bg-white ml-auto h-full overflow-y-auto">
          <div className="sticky top-0 bg-white border-b border-slate-200 p-6 z-10">
            <div className="flex items-center gap-4">
              <button
                onClick={() => {
                  setView('LIST');
                  setEditingRole(null);
                  setSelectedPermissions(new Set());
                }}
                className="p-2 hover:bg-slate-100 rounded-lg transition-colors"
              >
                <ArrowLeft size={20} className="text-slate-600" />
              </button>
              <h1 className="text-2xl font-black text-slate-900">{t.editRole}</h1>
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
              <label className="block text-sm font-bold text-slate-700 mb-2">{t.roleName}</label>
              <input
                type="text"
                value={editingRole.name}
                onChange={(e) => setEditingRole({ ...editingRole, name: e.target.value })}
                className="w-full px-4 py-3 bg-slate-50 border border-slate-200 rounded-xl focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 outline-none"
                placeholder={t.roleName}
              />
            </div>

            <div>
              <label className="block text-sm font-bold text-slate-700 mb-2">{t.description}</label>
              <textarea
                value={editingRole.description || ''}
                onChange={(e) => setEditingRole({ ...editingRole, description: e.target.value })}
                className="w-full px-4 py-3 bg-slate-50 border border-slate-200 rounded-xl focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 outline-none resize-none"
                rows={3}
                placeholder={t.description}
              />
            </div>
          </div>

          <div className="border-t border-slate-200 pt-6">
            <div className="flex items-center justify-between mb-4">
              <h3 className="text-lg font-black text-slate-900">{t.modulePermissions}</h3>
              <div className="flex gap-2">
                <button
                  onClick={() => {
                    const allPerms = new Set(ALL_PERMISSIONS.map(p => p.id));
                    setSelectedPermissions(allPerms);
                  }}
                  className="text-xs px-3 py-1.5 bg-indigo-50 text-indigo-600 rounded-lg hover:bg-indigo-100 font-bold transition-colors"
                >
                  {t.selectAll}
                </button>
                <button
                  onClick={() => setSelectedPermissions(new Set())}
                  className="text-xs px-3 py-1.5 bg-slate-50 text-slate-600 rounded-lg hover:bg-slate-100 font-bold transition-colors"
                >
                  {t.deselectAll}
                </button>
              </div>
            </div>

            <div className="space-y-4">
              {MODULES.map(module => {
                const modulePermissions = ALL_PERMISSIONS.filter(p => p.module === module.id);
                const isFullySelected = isModuleFullySelected(module.id);
                const isPartiallySelected = isModulePartiallySelected(module.id);

                return (
                  <div key={module.id} className="border border-slate-200 rounded-xl p-4">
                    <div className="flex items-center gap-3 mb-3">
                      <button
                        onClick={() => toggleModulePermissions(module.id, !isFullySelected)}
                        className="flex items-center gap-2 text-sm font-bold text-slate-700 hover:text-indigo-600 transition-colors"
                      >
                        {isFullySelected ? (
                          <CheckSquare size={18} className="text-indigo-600" />
                        ) : isPartiallySelected ? (
                          <div className="w-[18px] h-[18px] border-2 border-indigo-600 bg-indigo-50 rounded" />
                        ) : (
                          <Square size={18} className="text-slate-400" />
                        )}
                        <span>{module.name}</span>
                      </button>
                    </div>

                    <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-2 ml-7">
                      {PERMISSION_ACTIONS.map(action => {
                        const permId = `${module.id}:${action.id}`;
                        const isSelected = selectedPermissions.has(permId);
                        return (
                          <label
                            key={permId}
                            className="flex items-center gap-2 p-2 rounded-lg hover:bg-slate-50 cursor-pointer transition-colors"
                          >
                            <input
                              type="checkbox"
                              checked={isSelected}
                              onChange={() => togglePermission(permId)}
                              className="w-4 h-4 text-indigo-600 rounded focus:ring-indigo-500"
                            />
                            <span className="text-xs font-medium text-slate-600">{action.name}</span>
                          </label>
                        );
                      })}
                    </div>
                  </div>
                );
              })}
            </div>
          </div>

          <div className="flex gap-3 pt-4 border-t border-slate-200">
            <button
              onClick={handleSaveRole}
              className="flex-1 flex items-center justify-center gap-2 py-3 bg-indigo-600 text-white rounded-xl font-black hover:bg-indigo-700 transition-colors"
            >
              <Save size={18} />
              {t.save}
            </button>
            <button
              onClick={() => {
                setView('LIST');
                setEditingRole(null);
                setSelectedPermissions(new Set());
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
    <div className="fixed inset-0 z-50 flex">
      <div className="absolute inset-0 bg-black/50" onClick={onClose} />
      <div className="relative w-full max-w-2xl bg-white ml-auto h-full overflow-y-auto flex flex-col">
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
          <div className="flex justify-end">
            <button
              onClick={handleAddRole}
              className="flex items-center gap-2 px-4 py-2 bg-indigo-600 text-white rounded-xl font-black hover:bg-indigo-700 transition-colors"
            >
              <Plus size={18} />
              {t.addRole}
            </button>
          </div>

          <div className="bg-white rounded-2xl shadow-sm border border-slate-200 p-6">
        <div className="flex items-center gap-4 mb-6">
          <div className="flex-1 relative">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" size={18} />
            <input
              type="text"
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              placeholder={t.searchPlaceholder}
              className="w-full pl-10 pr-4 py-2.5 bg-slate-50 border border-slate-200 rounded-xl focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 outline-none"
            />
          </div>
        </div>

        {systemRoles.length > 0 && (
          <div className="mb-8">
            <div className="flex items-center gap-2 mb-4">
              <Lock size={18} className="text-slate-500" />
              <h2 className="text-lg font-black text-slate-700">{t.systemRole}</h2>
            </div>
            <div className="grid gap-3">
              {systemRoles.map(role => (
                <div
                  key={role.id}
                  className="flex items-center justify-between p-4 bg-slate-50 border border-slate-200 rounded-xl"
                >
                  <div className="flex-1">
                    <div className="flex items-center gap-2 mb-1">
                      <Shield size={18} className="text-indigo-600" />
                      <h3 className="font-black text-slate-900">{role.name}</h3>
                    </div>
                    {role.description && (
                      <p className="text-sm text-slate-600">{role.description}</p>
                    )}
                    <p className="text-xs text-slate-400 mt-1">
                      {role.permissions.length} 個權限
                    </p>
                  </div>
                  <div className="flex gap-2">
                    <button
                      onClick={() => handleEditRole(role)}
                      className="p-2 text-indigo-600 hover:bg-indigo-50 rounded-lg transition-colors"
                    >
                      <Edit size={18} />
                    </button>
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}

        {customRoles.length > 0 && (
          <div>
            <div className="flex items-center gap-2 mb-4">
              <Users size={18} className="text-slate-500" />
              <h2 className="text-lg font-black text-slate-700">{t.customRole}</h2>
            </div>
            <div className="grid gap-3">
              {customRoles.map(role => (
                <div
                  key={role.id}
                  className="flex items-center justify-between p-4 bg-white border border-slate-200 rounded-xl hover:border-indigo-300 transition-colors"
                >
                  <div className="flex-1">
                    <div className="flex items-center gap-2 mb-1">
                      <Shield size={18} className="text-slate-600" />
                      <h3 className="font-black text-slate-900">{role.name}</h3>
                    </div>
                    {role.description && (
                      <p className="text-sm text-slate-600">{role.description}</p>
                    )}
                    <p className="text-xs text-slate-400 mt-1">
                      {role.permissions.length} 個權限
                    </p>
                  </div>
                  <div className="flex gap-2">
                    <button
                      onClick={() => handleEditRole(role)}
                      className="p-2 text-indigo-600 hover:bg-indigo-50 rounded-lg transition-colors"
                    >
                      <Edit size={18} />
                    </button>
                    {!role.isSystem && (
                      <button
                        onClick={() => handleDeleteRole(role.id)}
                        className="p-2 text-rose-600 hover:bg-rose-50 rounded-lg transition-colors"
                      >
                        <Trash2 size={18} />
                      </button>
                    )}
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}

            {filteredRoles.length === 0 && (
              <div className="text-center py-12 text-slate-400">
                <Shield size={48} className="mx-auto mb-4 opacity-50" />
                <p className="font-bold">{t.noRoles}</p>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

export default PermissionManagement;

