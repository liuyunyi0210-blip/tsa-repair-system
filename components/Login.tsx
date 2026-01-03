
import React, { useState } from 'react';
import {
  Wrench,
  Lock,
  User,
  AlertCircle,
  ArrowRight,
  Globe
} from 'lucide-react';
import { Language } from '../types';
import { storageService } from '../services/storageService';

interface LoginProps {
  onLogin: (token: string, userId: string) => void;
  language: Language;
  onLanguageChange: (lang: Language) => void;
  onShowPrivacy: () => void;
  onShowTerms: () => void;
}

const Login: React.FC<LoginProps> = ({ onLogin, language, onLanguageChange, onShowPrivacy, onShowTerms }) => {
  const [account, setAccount] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);

  const translations = {
    [Language.ZH]: {
      systemName: '會館維修暨設施管理系統',
      organization: 'TSA 台灣創價學會',
      welcome: '歡迎回來',
      instruction: '請輸入您的管理員帳號與密碼以進入系統',
      accountLabel: '管理帳號',
      passwordLabel: '通行密碼',
      loginBtn: '登入系統',
      quickLogin: '測試員快速登入',
      errorMsg: '帳號或密碼輸入錯誤，請重新確認',
      footer: '© 2025 台灣創價學會 總務局 版權所有',
      privacy: '隱私權政策',
      terms: '服務條款'
    },
    [Language.JA]: {
      systemName: '会館施設管理・修繕システム',
      organization: 'TSA 台湾創価学会',
      welcome: 'おかえりなさい',
      instruction: '管理者アカウントとパスワードを入力してください',
      accountLabel: '管理者ID',
      passwordLabel: 'パスワード',
      loginBtn: 'ログイン',
      quickLogin: 'テストログイン',
      errorMsg: 'IDまたはパスワードが正しくありません',
      footer: '© 2025 台湾創価学会 総務局 All Rights Reserved.',
      privacy: 'プライバシーポリシー',
      terms: '利用規約'
    }
  };

  const t = translations[language];

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError('');

    try {
      // 從儲存服務讀取用戶資料
      const users = await storageService.loadUsers();
      
      // 如果沒有用戶資料，檢查是否為開發環境的預設帳號
      if (!users || users.length === 0) {
        if (import.meta.env.DEV && account === 'admin' && password === 'tsa2025') {
          // 建立預設管理員帳號
          const defaultUser = {
            id: 'user-admin',
            account: 'admin',
            password: 'tsa2025',
            name: '系統管理員',
            roleId: 'admin',
            isActive: true,
            createdAt: new Date().toISOString(),
            updatedAt: new Date().toISOString(),
            lastLoginAt: new Date().toISOString()
          };
          await storageService.saveUsers([defaultUser]);
          onLogin('mock-token-12345', defaultUser.id);
          return;
        } else {
          setError(t.errorMsg);
          setLoading(false);
          return;
        }
      }

      // 查找匹配的用戶
      const user = users.find(u => u.account === account.trim());

      if (!user) {
        setError(t.errorMsg);
        setLoading(false);
        return;
      }

      // 檢查用戶是否啟用
      if (!user.isActive) {
        setError('此帳號已被停用，請聯絡系統管理員');
        setLoading(false);
        return;
      }

      // 驗證密碼
      if (user.password !== password) {
        setError(t.errorMsg);
        setLoading(false);
        return;
      }

      // 更新最後登入時間
      const updatedUsers = users.map(u => 
        u.id === user.id 
          ? { ...u, lastLoginAt: new Date().toISOString(), updatedAt: new Date().toISOString() }
          : u
      );
      await storageService.saveUsers(updatedUsers);

      // 登入成功
      onLogin(`token-${user.id}`, user.id);
    } catch (error) {
      console.error('登入錯誤:', error);
      setError('登入時發生錯誤，請稍後再試');
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen w-full flex items-center justify-center relative overflow-hidden bg-slate-950 font-['Inter','Noto_Sans_TC']">
      <div className="absolute top-[-10%] right-[-10%] w-[50%] h-[50%] bg-indigo-600/20 blur-[120px] rounded-full"></div>
      <div className="absolute bottom-[-10%] left-[-10%] w-[50%] h-[50%] bg-rose-600/10 blur-[120px] rounded-full"></div>

      <div className="w-full max-w-lg p-6 relative z-10 animate-in fade-in zoom-in duration-700">
        <div className="flex justify-end mb-8">
          <button
            onClick={() => onLanguageChange(language === Language.ZH ? Language.JA : Language.ZH)}
            className="flex items-center gap-2 px-4 py-2 rounded-full bg-white/5 border border-white/10 text-white/60 hover:text-white hover:bg-white/10 transition-all text-xs font-bold"
          >
            <Globe size={14} />
            {language === Language.ZH ? '日本語' : '中文'}
          </button>
        </div>

        <div className="bg-white rounded-[48px] shadow-2xl p-10 md:p-14 space-y-10 border border-slate-100">
          <div className="text-center space-y-4">
            <div className="inline-flex p-4 bg-indigo-600 text-white rounded-[24px] shadow-xl shadow-indigo-200 mb-2">
              <Wrench size={32} />
            </div>
            <div>
              <h1 className="text-2xl font-black text-slate-900 tracking-tight">{t.systemName}</h1>
              <p className="text-slate-400 font-bold text-[10px] uppercase tracking-[0.2em] mt-1">{t.organization}</p>
            </div>
          </div>

          <div className="space-y-2">
            <h2 className="text-xl font-black text-slate-800">{t.welcome}</h2>
            <p className="text-sm text-slate-400 font-medium">{t.instruction}</p>
          </div>

          <form onSubmit={handleLogin} className="space-y-6">
            <div className="space-y-4">
              <div className="space-y-1">
                <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest ml-1">{t.accountLabel}</label>
                <div className="relative group">
                  <User className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-300 group-focus-within:text-indigo-600 transition-colors" size={18} />
                  <input
                    type="text"
                    className="w-full pl-12 pr-4 py-4 bg-slate-50 border border-slate-100 rounded-[20px] outline-none focus:ring-4 focus:ring-indigo-50 focus:border-indigo-600 font-bold transition-all"
                    placeholder="User ID"
                    value={account}
                    onChange={e => setAccount(e.target.value)}
                  />
                </div>
              </div>

              <div className="space-y-1">
                <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest ml-1">{t.passwordLabel}</label>
                <div className="relative group">
                  <Lock className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-300 group-focus-within:text-indigo-600 transition-colors" size={18} />
                  <input
                    type="password"
                    className="w-full pl-12 pr-4 py-4 bg-slate-50 border border-slate-100 rounded-[20px] outline-none focus:ring-4 focus:ring-indigo-50 focus:border-indigo-600 font-bold transition-all"
                    placeholder="••••••••"
                    value={password}
                    onChange={e => setPassword(e.target.value)}
                  />
                </div>
              </div>
            </div>

            {error && (
              <div className="flex items-center gap-2 p-4 bg-rose-50 text-rose-600 rounded-2xl border border-rose-100 animate-in slide-in-from-top-2">
                <AlertCircle size={16} />
                <span className="text-xs font-bold">{error}</span>
              </div>
            )}

            <button
              type="submit"
              disabled={loading}
              className="w-full bg-slate-900 text-white font-black py-5 rounded-[24px] shadow-2xl shadow-slate-200 flex items-center justify-center gap-3 hover:bg-indigo-600 transition-all active:scale-95 disabled:opacity-50"
            >
              {loading ? (
                <div className="w-5 h-5 border-2 border-white/30 border-t-white rounded-full animate-spin"></div>
              ) : (
                <>
                  <span>{t.loginBtn}</span>
                  <ArrowRight size={20} />
                </>
              )}
            </button>
          </form>

          {!import.meta.env.PROD && (
            <div className="pt-6 border-t border-slate-50">
              <button
                onClick={() => {
                  setAccount('admin');
                  setPassword('tsa2025');
                }}
                className="w-full py-3 text-indigo-600 font-bold text-xs hover:bg-indigo-50 rounded-xl transition-all"
              >
                {t.quickLogin}
              </button>
            </div>
          )}
        </div>

        <div className="mt-12 flex flex-col items-center gap-4">
          <div className="flex gap-6">
            <button onClick={onShowPrivacy} className="text-white/40 hover:text-white/80 text-[10px] font-bold uppercase tracking-widest transition-colors">
              {t.privacy}
            </button>
            <div className="w-px h-3 bg-white/10 self-center"></div>
            <button onClick={onShowTerms} className="text-white/40 hover:text-white/80 text-[10px] font-bold uppercase tracking-widest transition-colors">
              {t.terms}
            </button>
          </div>
          <p className="text-white/20 text-[10px] font-bold uppercase tracking-widest leading-loose">
            {t.footer}
          </p>
        </div>
      </div>
    </div>
  );
};

export default Login;
