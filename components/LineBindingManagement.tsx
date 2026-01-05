
import React, { useState, useEffect } from 'react';
import {
  MessageCircle,
  Plus,
  Edit,
  Trash2,
  Save,
  X,
  Search,
  Send,
  User,
  Phone,
  Briefcase,
  CheckCircle2,
  XCircle,
  Key,
  AlertCircle
} from 'lucide-react';
import { LineUser, Language } from '../types';
import { storageService } from '../services/storageService';
import { lineService } from '../services/lineService';

interface LineBindingManagementProps {
  language: Language;
  isOpen: boolean;
  onClose: () => void;
  onLogOperation?: (log: Omit<any, 'id' | 'createdAt'>) => void;
}

const LineBindingManagement: React.FC<LineBindingManagementProps> = ({ language, isOpen, onClose, onLogOperation }) => {
  const [view, setView] = useState<'LIST' | 'EDIT' | 'SEND_MESSAGE'>('LIST');
  const [lineUsers, setLineUsers] = useState<LineUser[]>([]);
  const [searchTerm, setSearchTerm] = useState('');
  const [editingUser, setEditingUser] = useState<LineUser | null>(null);
  const [channelToken, setChannelToken] = useState('');
  const [formData, setFormData] = useState({
    lineId: '',
    name: '',
    mission: '',
    phone: ''
  });
  const [messageData, setMessageData] = useState({
    lineId: '',
    message: ''
  });
  const [sending, setSending] = useState(false);

  const translations = {
    [Language.ZH]: {
      title: 'LINE 綁定管理',
      listTitle: 'LINE 使用者列表',
      addUser: '新增綁定',
      editUser: '編輯綁定',
      sendMessage: '發送訊息',
      lineId: 'LINE ID',
      name: '姓名',
      mission: '使命',
      phone: '手機',
      channelToken: 'LINE Channel Access Token',
      channelTokenPlaceholder: '請輸入 Channel Access Token',
      channelTokenHelp: '在 LINE Developers Console 取得',
      save: '儲存',
      cancel: '取消',
      delete: '刪除',
      searchPlaceholder: '搜尋 LINE ID 或姓名...',
      deleteConfirm: '確定要刪除此綁定嗎？',
      lineIdRequired: '請輸入 LINE ID',
      nameRequired: '請輸入姓名',
      missionRequired: '請輸入使命',
      phoneRequired: '請輸入手機',
      saved: '綁定已儲存',
      deleted: '綁定已刪除',
      noUsers: '尚無 LINE 綁定資料',
      sendBindingMessage: '發送綁定通知',
      sendCustomMessage: '發送自訂訊息',
      messagePlaceholder: '輸入訊息內容...',
      messageSent: '訊息已發送',
      messageFailed: '訊息發送失敗',
      tokenNotSet: '請先設定 Channel Access Token',
      active: '啟用',
      inactive: '停用',
      isActive: '啟用狀態'
    },
    [Language.JA]: {
      title: 'LINE 連携管理',
      listTitle: 'LINE ユーザー一覧',
      addUser: '連携追加',
      editUser: '連携編集',
      sendMessage: 'メッセージ送信',
      lineId: 'LINE ID',
      name: '氏名',
      mission: '使命',
      phone: '電話番号',
      channelToken: 'LINE Channel Access Token',
      channelTokenPlaceholder: 'Channel Access Token を入力',
      channelTokenHelp: 'LINE Developers Console で取得',
      save: '保存',
      cancel: 'キャンセル',
      delete: '削除',
      searchPlaceholder: 'LINE ID または氏名を検索...',
      deleteConfirm: 'この連携を削除しますか？',
      lineIdRequired: 'LINE ID を入力してください',
      nameRequired: '氏名を入力してください',
      missionRequired: '使命を入力してください',
      phoneRequired: '電話番号を入力してください',
      saved: '連携を保存しました',
      deleted: '連携を削除しました',
      noUsers: 'LINE 連携データがありません',
      sendBindingMessage: '連携通知送信',
      sendCustomMessage: 'カスタムメッセージ送信',
      messagePlaceholder: 'メッセージ内容を入力...',
      messageSent: 'メッセージを送信しました',
      messageFailed: 'メッセージ送信に失敗しました',
      tokenNotSet: 'Channel Access Token を設定してください',
      active: '有効',
      inactive: '無効',
      isActive: '有効状態'
    }
  };

  const t = translations[language];

  useEffect(() => {
    if (isOpen) {
      const loadData = async () => {
        const savedUsers = await storageService.loadLineUsers();
        setLineUsers(savedUsers || []);
        const token = lineService.getChannelAccessToken();
        if (token) setChannelToken(token);
      };
      loadData();
    }
  }, [isOpen]);

  const saveLineUsers = async (newUsers: LineUser[]) => {
    setLineUsers(newUsers);
    await storageService.saveLineUsers(newUsers);
  };

  const handleAddUser = () => {
    setFormData({
      lineId: '',
      name: '',
      mission: '',
      phone: ''
    });
    setEditingUser(null);
    setView('EDIT');
  };

  const handleEditUser = (user: LineUser) => {
    setEditingUser(user);
    setFormData({
      lineId: user.lineId,
      name: user.name,
      mission: user.mission,
      phone: user.phone
    });
    setView('EDIT');
  };

  const handleDeleteUser = async (userId: string) => {
    const user = lineUsers.find(u => u.id === userId);
    if (!user) return;

    if (window.confirm(t.deleteConfirm)) {
      const newUsers = lineUsers.filter(u => u.id !== userId);
      await saveLineUsers(newUsers);
      if (onLogOperation) {
        onLogOperation({
          module: 'line_binding',
          action: 'delete',
          targetType: 'line_user',
          targetId: userId,
          targetName: user.name,
          description: `刪除 LINE 綁定：${user.lineId} (${user.name})`
        });
      }
      alert(t.deleted);
    }
  };

  const handleSaveUser = async () => {
    if (!formData.lineId.trim()) {
      alert(t.lineIdRequired);
      return;
    }
    if (!formData.name.trim()) {
      alert(t.nameRequired);
      return;
    }
    if (!formData.mission.trim()) {
      alert(t.missionRequired);
      return;
    }
    if (!formData.phone.trim()) {
      alert(t.phoneRequired);
      return;
    }

    const updatedUser: LineUser = {
      id: editingUser?.id || `line-${Date.now()}`,
      lineId: formData.lineId.trim(),
      name: formData.name.trim(),
      mission: formData.mission.trim(),
      phone: formData.phone.trim(),
      isActive: editingUser?.isActive ?? true,
      createdAt: editingUser?.createdAt || new Date().toISOString(),
      updatedAt: new Date().toISOString()
    };

    const existingIndex = lineUsers.findIndex(u => u.id === updatedUser.id);
    let newUsers: LineUser[];

    if (existingIndex >= 0) {
      newUsers = lineUsers.map((u, i) => i === existingIndex ? updatedUser : u);
    } else {
      // 檢查 LINE ID 是否已存在
      if (lineUsers.some(u => u.lineId === updatedUser.lineId)) {
        alert('此 LINE ID 已存在');
        return;
      }
      newUsers = [...lineUsers, updatedUser];
    }

    await saveLineUsers(newUsers);
    setView('LIST');
    setEditingUser(null);
    setFormData({
      lineId: '',
      name: '',
      mission: '',
      phone: ''
    });
    alert(t.saved);

    if (onLogOperation) {
      onLogOperation({
        module: 'line_binding',
        action: existingIndex >= 0 ? 'edit' : 'create',
        targetType: 'line_user',
        targetId: updatedUser.id,
        targetName: updatedUser.name,
        description: `${existingIndex >= 0 ? '編輯' : '新增'} LINE 綁定：${updatedUser.lineId}`
      });
    }
  };

  const handleSendBindingMessage = async (user: LineUser) => {
    const token = lineService.getChannelAccessToken();
    if (!token) {
      alert(t.tokenNotSet);
      return;
    }

    setSending(true);
    try {
      await lineService.sendBindingMessage(user.lineId, user.name, user.mission, user.phone);
      alert(t.messageSent);
    } catch (error: any) {
      alert(`${t.messageFailed}：${error.message || '未知錯誤'}`);
    } finally {
      setSending(false);
    }
  };

  const handleSendCustomMessage = async () => {
    if (!messageData.lineId.trim()) {
      alert('請輸入 LINE ID');
      return;
    }
    if (!messageData.message.trim()) {
      alert('請輸入訊息內容');
      return;
    }

    const token = lineService.getChannelAccessToken();
    if (!token) {
      alert(t.tokenNotSet);
      return;
    }

    setSending(true);
    try {
      await lineService.pushMessage(messageData.lineId, [{
        type: 'text',
        text: messageData.message
      }]);
      alert(t.messageSent);
      setMessageData({ lineId: '', message: '' });
      setView('LIST');
    } catch (error: any) {
      alert(`${t.messageFailed}：${error.message || '未知錯誤'}`);
    } finally {
      setSending(false);
    }
  };

  const handleSaveToken = () => {
    if (channelToken.trim()) {
      lineService.setChannelAccessToken(channelToken.trim());
      alert('Token 已儲存');
    } else {
      alert('請輸入 Token');
    }
  };

  const filteredUsers = lineUsers.filter(user =>
    user.lineId.toLowerCase().includes(searchTerm.toLowerCase()) ||
    user.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
    user.phone.includes(searchTerm)
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
                <X size={20} className="text-slate-600" />
              </button>
              <h1 className="text-2xl font-black text-slate-900">{t.editUser}</h1>
            </div>
          </div>

          <div className="p-6 space-y-6">
            <div className="space-y-4">
              <div>
                <label className="block text-sm font-bold text-slate-700 mb-2">{t.lineId}</label>
                <input
                  type="text"
                  value={formData.lineId}
                  onChange={(e) => setFormData({ ...formData, lineId: e.target.value })}
                  disabled={!!editingUser}
                  className="w-full px-4 py-3 bg-slate-50 border border-slate-200 rounded-xl focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 outline-none disabled:opacity-50"
                  placeholder={t.lineId}
                />
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
                <label className="block text-sm font-bold text-slate-700 mb-2">{t.mission}</label>
                <input
                  type="text"
                  value={formData.mission}
                  onChange={(e) => setFormData({ ...formData, mission: e.target.value })}
                  className="w-full px-4 py-3 bg-slate-50 border border-slate-200 rounded-xl focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 outline-none"
                  placeholder={t.mission}
                />
              </div>

              <div>
                <label className="block text-sm font-bold text-slate-700 mb-2">{t.phone}</label>
                <input
                  type="tel"
                  value={formData.phone}
                  onChange={(e) => setFormData({ ...formData, phone: e.target.value })}
                  className="w-full px-4 py-3 bg-slate-50 border border-slate-200 rounded-xl focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 outline-none"
                  placeholder={t.phone}
                />
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

  if (view === 'SEND_MESSAGE') {
    return (
      <div className="fixed inset-0 z-[300] flex">
        <div className="absolute inset-0 bg-black/50" onClick={onClose} />
        <div className="relative w-full max-w-2xl bg-white ml-auto h-full overflow-y-auto">
          <div className="sticky top-0 bg-white border-b border-slate-200 p-6 z-10">
            <div className="flex items-center gap-4">
              <button
                onClick={() => setView('LIST')}
                className="p-2 hover:bg-slate-100 rounded-lg transition-colors"
              >
                <X size={20} className="text-slate-600" />
              </button>
              <h1 className="text-2xl font-black text-slate-900">{t.sendMessage}</h1>
            </div>
          </div>

          <div className="p-6 space-y-6">
            <div className="space-y-4">
              <div>
                <label className="block text-sm font-bold text-slate-700 mb-2">{t.lineId}</label>
                <input
                  type="text"
                  value={messageData.lineId}
                  onChange={(e) => setMessageData({ ...messageData, lineId: e.target.value })}
                  className="w-full px-4 py-3 bg-slate-50 border border-slate-200 rounded-xl focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 outline-none"
                  placeholder={t.lineId}
                />
              </div>

              <div>
                <label className="block text-sm font-bold text-slate-700 mb-2">訊息內容</label>
                <textarea
                  value={messageData.message}
                  onChange={(e) => setMessageData({ ...messageData, message: e.target.value })}
                  rows={6}
                  className="w-full px-4 py-3 bg-slate-50 border border-slate-200 rounded-xl focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 outline-none resize-none"
                  placeholder={t.messagePlaceholder}
                />
              </div>
            </div>

            <div className="flex gap-3 pt-4 border-t border-slate-200">
              <button
                onClick={handleSendCustomMessage}
                disabled={sending}
                className="flex-1 flex items-center justify-center gap-2 py-3 bg-indigo-600 text-white rounded-xl font-black hover:bg-indigo-700 transition-colors disabled:opacity-50"
              >
                <Send size={18} />
                {sending ? '發送中...' : '發送'}
              </button>
              <button
                onClick={() => setView('LIST')}
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
      <div className="relative w-full max-w-4xl bg-white ml-auto h-full overflow-y-auto flex flex-col">
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
          {/* Channel Token 設定 */}
          <div className="bg-slate-50 rounded-2xl p-6 border border-slate-200">
            <div className="flex items-center gap-2 mb-4">
              <Key size={20} className="text-indigo-600" />
              <h3 className="text-lg font-black text-slate-900">{t.channelToken}</h3>
            </div>
            <div className="flex gap-3">
              <input
                type="password"
                value={channelToken}
                onChange={(e) => setChannelToken(e.target.value)}
                placeholder={t.channelTokenPlaceholder}
                className="flex-1 px-4 py-3 bg-white border border-slate-200 rounded-xl focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 outline-none"
              />
              <button
                onClick={handleSaveToken}
                className="px-6 py-3 bg-indigo-600 text-white rounded-xl font-black hover:bg-indigo-700 transition-colors"
              >
                儲存
              </button>
            </div>
            <p className="text-xs text-slate-500 mt-2 flex items-center gap-1">
              <AlertCircle size={12} />
              {t.channelTokenHelp}
            </p>
          </div>

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
            <div className="flex gap-2">
              <button
                onClick={() => setView('SEND_MESSAGE')}
                className="flex items-center gap-2 px-4 py-2 bg-indigo-50 text-indigo-700 rounded-xl font-black hover:bg-indigo-100 transition-colors border border-indigo-200"
              >
                <Send size={18} />
                {t.sendMessage}
              </button>
              <button
                onClick={handleAddUser}
                className="flex items-center gap-2 px-4 py-2 bg-indigo-600 text-white rounded-xl font-black hover:bg-indigo-700 transition-colors"
              >
                <Plus size={18} />
                {t.addUser}
              </button>
            </div>
          </div>

          <div className="bg-white rounded-2xl shadow-sm border border-slate-200 overflow-hidden">
            <div className="divide-y divide-slate-200">
              {filteredUsers.map(user => (
                <div
                  key={user.id}
                  className="p-4 hover:bg-slate-50 transition-colors"
                >
                  <div className="flex items-center justify-between">
                    <div className="flex-1">
                      <div className="flex items-center gap-3 mb-2">
                        <MessageCircle size={20} className="text-indigo-600" />
                        <div>
                          <h3 className="font-black text-slate-900">{user.name}</h3>
                          <p className="text-sm text-slate-500 font-mono">{user.lineId}</p>
                        </div>
                        {user.isActive ? (
                          <CheckCircle2 size={18} className="text-emerald-500" />
                        ) : (
                          <XCircle size={18} className="text-slate-400" />
                        )}
                      </div>
                      <div className="flex items-center gap-4 text-xs text-slate-500 ml-8">
                        <div className="flex items-center gap-1">
                          <Briefcase size={14} />
                          <span>{user.mission}</span>
                        </div>
                        <div className="flex items-center gap-1">
                          <Phone size={14} />
                          <span>{user.phone}</span>
                        </div>
                      </div>
                    </div>
                    <div className="flex gap-2">
                      <button
                        onClick={() => handleSendBindingMessage(user)}
                        disabled={sending}
                        className="p-2 text-indigo-600 hover:bg-indigo-50 rounded-lg transition-colors disabled:opacity-50"
                        title={t.sendBindingMessage}
                      >
                        <Send size={18} />
                      </button>
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
              ))}
            </div>

            {filteredUsers.length === 0 && (
              <div className="text-center py-12 text-slate-400">
                <MessageCircle size={48} className="mx-auto mb-4 opacity-50" />
                <p className="font-bold">{t.noUsers}</p>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

export default LineBindingManagement;


