
import React, { useState, useEffect } from 'react';
import {
  Database,
  Cloud,
  Save,
  X,
  AlertCircle,
  CheckCircle2,
  Key,
  Info,
  Copy
} from 'lucide-react';
import { Language } from '../types';
import { storageService } from '../services/storageService';

interface StorageSettingsProps {
  language: Language;
  isOpen: boolean;
  onClose: () => void;
}

const StorageSettings: React.FC<StorageSettingsProps> = ({ language, isOpen, onClose }) => {
  const [storageType, setStorageType] = useState<'local' | 'gist'>('local');
  const [gistToken, setGistToken] = useState('');
  const [gistId, setGistId] = useState('');
  const [status, setStatus] = useState<{ type: 'success' | 'error' | null; message: string }>({ type: null, message: '' });
  const [testing, setTesting] = useState(false);

  const translations = {
    [Language.ZH]: {
      title: '資料儲存設定',
      localTitle: '本地儲存 (localStorage)',
      localDesc: '資料儲存在瀏覽器中，關閉後仍保留，但僅限單一裝置',
      gistTitle: 'GitHub Gist 儲存',
      gistDesc: '資料儲存在 GitHub，可跨裝置同步，需要 GitHub Personal Access Token',
      tokenLabel: 'GitHub Personal Access Token',
      tokenPlaceholder: 'ghp_xxxxxxxxxxxx',
      tokenHelp: '在 GitHub Settings > Developer settings > Personal access tokens 建立',
      save: '儲存設定',
      test: '測試連線',
      cancel: '取消',
      success: '設定已儲存',
      error: '設定失敗',
      testing: '測試中...',
      testSuccess: '連線成功！',
      testError: '連線失敗，請檢查 Token',
      currentType: '目前儲存方式',
      warning: '切換儲存方式不會遷移現有資料，請手動備份'
    },
    [Language.JA]: {
      title: 'データ保存設定',
      localTitle: 'ローカル保存 (localStorage)',
      localDesc: 'データはブラウザに保存され、閉じても保持されますが、単一デバイスのみ',
      gistTitle: 'GitHub Gist 保存',
      gistDesc: 'データは GitHub に保存され、デバイス間で同期可能。GitHub Personal Access Token が必要',
      tokenLabel: 'GitHub Personal Access Token',
      tokenPlaceholder: 'ghp_xxxxxxxxxxxx',
      tokenHelp: 'GitHub Settings > Developer settings > Personal access tokens で作成',
      save: '設定を保存',
      test: '接続テスト',
      cancel: 'キャンセル',
      success: '設定を保存しました',
      error: '保存に失敗しました',
      testing: 'テスト中...',
      testSuccess: '接続成功！',
      testError: '接続失敗。Token を確認してください',
      currentType: '現在の保存方式',
      warning: '保存方式の切り替えは既存データを移行しません。手動でバックアップしてください'
    }
  };

  const t = translations[language];

  useEffect(() => {
    if (isOpen) {
      const currentType = storageService.getStorageType();
      setStorageType(currentType);
      setGistToken(storageService.getGistToken() || '');
      setGistId(storageService.getGistId() || '');
      setStatus({ type: null, message: '' });
    }
  }, [isOpen]);

  const handleTest = async () => {
    if (!gistToken.trim()) {
      setStatus({ type: 'error', message: '請輸入 Token' });
      return;
    }

    setTesting(true);
    setStatus({ type: null, message: '' });

    try {
      const response = await fetch('https://api.github.com/user', {
        headers: {
          'Authorization': `token ${gistToken}`,
          'Accept': 'application/vnd.github.v3+json',
        }
      });

      if (response.ok) {
        setStatus({ type: 'success', message: t.testSuccess });
      } else {
        setStatus({ type: 'error', message: t.testError });
      }
    } catch (error) {
      setStatus({ type: 'error', message: t.testError });
    } finally {
      setTesting(false);
    }
  };

  const handleSave = () => {
    try {
      if (storageType === 'gist' && !gistToken.trim()) {
        setStatus({ type: 'error', message: '請輸入 GitHub Token' });
        return;
      }

      storageService.init({
        type: storageType,
        gistToken: storageType === 'gist' ? gistToken : undefined,
        gistId: storageType === 'gist' && gistId ? gistId : undefined
      });

      setStatus({ type: 'success', message: t.success });
      setTimeout(() => {
        onClose();
      }, 1500);
    } catch (error) {
      setStatus({ type: 'error', message: t.error });
    }
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-[300] flex">
      <div className="absolute inset-0 bg-black/50" onClick={onClose} />
      <div className="relative w-full max-w-2xl bg-white ml-auto h-full overflow-y-auto">
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

        <div className="p-6 space-y-6">
          <div className="bg-amber-50 border border-amber-200 rounded-xl p-4">
            <div className="flex items-start gap-3">
              <AlertCircle size={20} className="text-amber-600 mt-0.5" />
              <div>
                <p className="text-sm font-bold text-amber-900">{t.warning}</p>
              </div>
            </div>
          </div>

          <div className="space-y-4">
            <div className="border border-slate-200 rounded-xl p-6">
              <label className="flex items-start gap-4 cursor-pointer">
                <input
                  type="radio"
                  name="storage"
                  value="local"
                  checked={storageType === 'local'}
                  onChange={(e) => setStorageType(e.target.value as 'local')}
                  className="mt-1 w-4 h-4 text-indigo-600"
                />
                <div className="flex-1">
                  <div className="flex items-center gap-2 mb-2">
                    <Database size={20} className="text-slate-600" />
                    <h3 className="font-black text-slate-900">{t.localTitle}</h3>
                    {storageService.getStorageType() === 'local' && (
                      <span className="text-xs px-2 py-1 bg-indigo-100 text-indigo-600 rounded font-bold">
                        {t.currentType}
                      </span>
                    )}
                  </div>
                  <p className="text-sm text-slate-600">{t.localDesc}</p>
                </div>
              </label>
            </div>

            <div className="border border-slate-200 rounded-xl p-6">
              <label className="flex items-start gap-4 cursor-pointer">
                <input
                  type="radio"
                  name="storage"
                  value="gist"
                  checked={storageType === 'gist'}
                  onChange={(e) => setStorageType(e.target.value as 'gist')}
                  className="mt-1 w-4 h-4 text-indigo-600"
                />
                <div className="flex-1">
                  <div className="flex items-center gap-2 mb-2">
                    <Cloud size={20} className="text-slate-600" />
                    <h3 className="font-black text-slate-900">{t.gistTitle}</h3>
                    {storageService.getStorageType() === 'gist' && (
                      <span className="text-xs px-2 py-1 bg-indigo-100 text-indigo-600 rounded font-bold">
                        {t.currentType}
                      </span>
                    )}
                  </div>
                  <p className="text-sm text-slate-600 mb-4">{t.gistDesc}</p>

                  {storageType === 'gist' && (
                    <div className="space-y-4 mt-4">
                      <div>
                        <label className="block text-sm font-bold text-slate-700 mb-2">
                          {t.tokenLabel}
                        </label>
                        <div className="relative">
                          <Key className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" size={18} />
                          <input
                            type="password"
                            value={gistToken}
                            onChange={(e) => setGistToken(e.target.value)}
                            placeholder={t.tokenPlaceholder}
                            className="w-full pl-10 pr-4 py-3 bg-slate-50 border border-slate-200 rounded-xl focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 outline-none"
                          />
                        </div>
                        <div className="flex items-start gap-2 mt-2 text-xs text-slate-500">
                          <Info size={14} className="mt-0.5" />
                          <p>{t.tokenHelp}</p>
                        </div>
                      </div>

                      <div>
                        <div className="flex items-center justify-between mb-2">
                          <label className="block text-sm font-bold text-slate-700">
                            Gist ID (跨裝置同步必填)
                          </label>
                          {gistToken && !gistId && (
                            <button
                              onClick={async () => {
                                setTesting(true);
                                try {
                                  const res = await fetch('https://api.github.com/gists', {
                                    headers: { 'Authorization': `token ${gistToken}` }
                                  });
                                  const gists = await res.json();
                                  const tsaGist = gists.find((g: any) => g.description === 'TSA 會館設施維護系統資料');
                                  if (tsaGist) {
                                    setGistId(tsaGist.id);
                                    setStatus({ type: 'success', message: '已找到現有雲端資料庫！' });
                                  } else {
                                    setStatus({ type: 'error', message: '找不到現有資料庫，請手動輸入或儲存以建立新庫。' });
                                  }
                                } catch (e) {
                                  setStatus({ type: 'error', message: '搜尋失敗' });
                                } finally {
                                  setTesting(false);
                                }
                              }}
                              className="text-[10px] font-black text-indigo-600 hover:bg-indigo-50 px-2 py-1 rounded border border-indigo-200"
                            >
                              自動搜尋現有資料庫
                            </button>
                          )}
                        </div>
                        <div className="relative">
                          <input
                            type="text"
                            value={gistId}
                            onChange={(e) => setGistId(e.target.value)}
                            placeholder="請輸入現有 Gist ID 或留空以建立新的"
                            className="w-full px-4 py-3 bg-slate-50 border border-slate-200 rounded-xl focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 outline-none font-mono text-xs pr-12"
                          />
                          {gistId && (
                            <button
                              onClick={() => {
                                navigator.clipboard.writeText(gistId);
                                alert('Gist ID 已複製！');
                              }}
                              className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-400 hover:text-indigo-600 transition-colors"
                              title="複製 ID"
                            >
                              <Copy size={18} />
                            </button>
                          )}
                        </div>
                        <p className="mt-1 text-[10px] text-slate-400">
                          提示：手機端必須與後台使用「同一個 Gist ID」才能看到彼此的資料。
                        </p>
                      </div>

                      <button
                        onClick={handleTest}
                        disabled={testing || !gistToken.trim()}
                        className="w-full py-2.5 bg-slate-100 text-slate-700 rounded-xl font-bold hover:bg-slate-200 transition-colors disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2"
                      >
                        {testing ? (
                          <>
                            <div className="w-4 h-4 border-2 border-slate-400 border-t-transparent rounded-full animate-spin" />
                            {t.testing}
                          </>
                        ) : (
                          <>
                            <CheckCircle2 size={18} />
                            {t.test}
                          </>
                        )}
                      </button>
                    </div>
                  )}
                </div>
              </label>
            </div>
          </div>

          {status.type && (
            <div className={`flex items-center gap-2 p-4 rounded-xl ${status.type === 'success'
              ? 'bg-emerald-50 text-emerald-700 border border-emerald-200'
              : 'bg-rose-50 text-rose-700 border border-rose-200'
              }`}>
              {status.type === 'success' ? (
                <CheckCircle2 size={20} />
              ) : (
                <AlertCircle size={20} />
              )}
              <span className="text-sm font-bold">{status.message}</span>
            </div>
          )}

          <div className="flex gap-3 pt-4 border-t border-slate-200">
            <button
              onClick={handleSave}
              className="flex-1 flex items-center justify-center gap-2 py-3 bg-indigo-600 text-white rounded-xl font-black hover:bg-indigo-700 transition-colors"
            >
              <Save size={18} />
              {t.save}
            </button>
            <button
              onClick={onClose}
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
};

export default StorageSettings;

