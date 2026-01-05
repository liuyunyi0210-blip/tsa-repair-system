
import React, { useState } from 'react';
import {
  User,
  Phone,
  Briefcase,
  Save,
  AlertCircle,
  MessageCircle
} from 'lucide-react';
import { LineUser } from '../types';
import { storageService } from '../services/storageService';

interface LineBindingFormProps {
  lineId: string;
  displayName: string;
  onComplete: () => void;
}

const LineBindingForm: React.FC<LineBindingFormProps> = ({ lineId, displayName, onComplete }) => {
  const [formData, setFormData] = useState({
    name: displayName || '',
    mission: '',
    phone: ''
  });
  const [error, setError] = useState('');
  const [saving, setSaving] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    
    if (!formData.name.trim()) {
      setError('請輸入姓名');
      return;
    }
    if (!formData.mission.trim()) {
      setError('請輸入使命');
      return;
    }
    if (!formData.phone.trim()) {
      setError('請輸入手機');
      return;
    }

    setSaving(true);
    try {
      const existingUsers = await storageService.loadLineUsers();
      const users = existingUsers || [];

      // 檢查是否已存在
      const existingIndex = users.findIndex(u => u.lineId === lineId);
      
      const newUser: LineUser = {
        id: existingIndex >= 0 ? users[existingIndex].id : `line-${Date.now()}`,
        lineId: lineId,
        name: formData.name.trim(),
        mission: formData.mission.trim(),
        phone: formData.phone.trim(),
        isActive: true,
        createdAt: existingIndex >= 0 ? users[existingIndex].createdAt : new Date().toISOString(),
        updatedAt: new Date().toISOString()
      };

      if (existingIndex >= 0) {
        users[existingIndex] = newUser;
      } else {
        users.push(newUser);
      }

      await storageService.saveLineUsers(users);
      onComplete();
    } catch (err: any) {
      setError(`儲存失敗：${err.message || '未知錯誤'}`);
      setSaving(false);
    }
  };

  return (
    <div className="min-h-screen w-full flex items-center justify-center bg-slate-950 p-4">
      <div className="w-full max-w-md bg-white rounded-[32px] shadow-2xl p-8 space-y-6">
        <div className="text-center space-y-2">
          <div className="inline-flex p-4 bg-indigo-100 rounded-[24px] mb-2">
            <MessageCircle size={32} className="text-indigo-600" />
          </div>
          <h1 className="text-2xl font-black text-slate-900">LINE 帳號綁定</h1>
          <p className="text-sm text-slate-500">請填寫以下資料，之後填寫問卷時會自動帶入</p>
        </div>

        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label className="block text-sm font-bold text-slate-700 mb-2">
              <User size={16} className="inline mr-2" />
              姓名
            </label>
            <input
              type="text"
              value={formData.name}
              onChange={(e) => setFormData({ ...formData, name: e.target.value })}
              className="w-full px-4 py-3 bg-slate-50 border border-slate-200 rounded-xl focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 outline-none"
              placeholder="請輸入姓名"
              required
            />
          </div>

          <div>
            <label className="block text-sm font-bold text-slate-700 mb-2">
              <Briefcase size={16} className="inline mr-2" />
              使命
            </label>
            <input
              type="text"
              value={formData.mission}
              onChange={(e) => setFormData({ ...formData, mission: e.target.value })}
              className="w-full px-4 py-3 bg-slate-50 border border-slate-200 rounded-xl focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 outline-none"
              placeholder="請輸入使命（例如：志工、職員等）"
              required
            />
          </div>

          <div>
            <label className="block text-sm font-bold text-slate-700 mb-2">
              <Phone size={16} className="inline mr-2" />
              手機
            </label>
            <input
              type="tel"
              value={formData.phone}
              onChange={(e) => setFormData({ ...formData, phone: e.target.value })}
              className="w-full px-4 py-3 bg-slate-50 border border-slate-200 rounded-xl focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 outline-none"
              placeholder="請輸入手機號碼"
              required
            />
          </div>

          {error && (
            <div className="flex items-center gap-2 p-3 bg-rose-50 text-rose-600 rounded-xl border border-rose-100">
              <AlertCircle size={16} />
              <span className="text-sm font-bold">{error}</span>
            </div>
          )}

          <button
            type="submit"
            disabled={saving}
            className="w-full bg-indigo-600 text-white font-black py-4 rounded-xl shadow-lg hover:bg-indigo-700 transition-all active:scale-95 disabled:opacity-50 flex items-center justify-center gap-2"
          >
            {saving ? (
              <div className="w-5 h-5 border-2 border-white/30 border-t-white rounded-full animate-spin"></div>
            ) : (
              <>
                <Save size={18} />
                完成綁定
              </>
            )}
          </button>
        </form>
      </div>
    </div>
  );
};

export default LineBindingForm;

