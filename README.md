<div align="center">
<img width="1200" height="475" alt="GHBanner" src="https://github.com/user-attachments/assets/0aa67016-6eaf-458a-adb2-6e31a0763ed6" />
</div>

# TSA 會館修繕暨設施管理系統

一個專為 TSA 設計的會館維修管理與派工系統，整合 Gemini AI 進行故障分析與維護建議。

## 功能特色

- 📊 **儀表板管理**：完整的數據視覺化與統計分析
- 🏢 **會館管理**：會館基本資料與區域管理
- 📝 **工單管理**：維修工單的完整生命週期管理
- 🔧 **設施管理**：會館設施、飲水機、AED、公務車等管理
- 📋 **合約管理**：維護合約與供應商管理
- 🚨 **災害回報**：緊急災害事件回報與處理
- 🤖 **AI 分析**：整合 Gemini AI 進行故障分析與建議

## 本地開發

### 前置需求

- Node.js 18+ 
- npm 或 yarn

### 快速開始

**macOS / Linux：**
```bash
./start.sh
```

**Windows：**
```cmd
start.bat
```
或
```powershell
.\start.ps1
```

### 詳細安裝步驟

請參考 **[本地運行指南.md](./本地運行指南.md)** 獲取完整的安裝說明，包括：
- macOS 和 Windows 的詳細安裝步驟
- 環境變數設置
- 疑難排解
- 系統差異說明

### 手動安裝（不使用腳本）

1. **安裝依賴**
   ```bash
   npm install
   ```

2. **設置環境變數**
   
   創建 `.env.local` 文件（已包含在 `.gitignore` 中）：
   ```bash
   GEMINI_API_KEY=your_api_key_here
   ```

3. **啟動開發伺服器**
   ```bash
   npm run dev
   ```

   應用將在 `http://localhost:3000` 運行

4. **預覽生產構建**
   ```bash
   npm run build
   npm run preview
   ```

## 部署指南

本專案支援多種部署平台，已配置完整的 CI/CD 流程。

### GitHub Pages 部署（推薦）

#### 自動部署（已配置）

1. **設置 GitHub Secrets**
   - 前往倉庫 Settings → Secrets and variables → Actions
   - 添加 `GEMINI_API_KEY` secret

2. **啟用 GitHub Pages**
   - 前往 Settings → Pages
   - Source 選擇 **GitHub Actions**

3. **推送代碼**
   ```bash
   git push origin main
   ```

4. **查看部署狀態**
   - 前往 Actions 標籤頁查看部署進度
   - 部署完成後，網站將在以下網址可用：
     `https://[your-username].github.io/tsa-repair-system/`

#### 手動部署

如果需要手動部署：

```bash
npm run build
# 將 dist/ 目錄內容推送到 gh-pages 分支
```

### Vercel 部署

1. **安裝 Vercel CLI**（可選）
   ```bash
   npm i -g vercel
   ```

2. **部署**
   - 通過 [Vercel Dashboard](https://vercel.com) 導入專案
   - 或使用 CLI：`vercel`

3. **設置環境變數**
   - 在 Vercel Dashboard 中添加 `GEMINI_API_KEY`

4. **配置說明**
   - 專案已包含 `vercel.json` 配置
   - 自動處理 SPA 路由重定向
   - 已配置資源快取策略

### Netlify 部署

1. **部署方式**
   - 通過 [Netlify Dashboard](https://app.netlify.com) 連接 GitHub 倉庫
   - 或使用 Netlify CLI：`netlify deploy --prod`

2. **設置環境變數**
   - 在 Netlify Dashboard → Site settings → Environment variables
   - 添加 `GEMINI_API_KEY`

3. **配置說明**
   - 專案已包含 `netlify.toml` 配置
   - 自動處理 SPA 路由重定向
   - 已配置資源快取策略

## 環境變數配置

### 本地開發

創建 `.env.local` 文件：
```env
GEMINI_API_KEY=your_api_key_here
```

### 生產環境

#### GitHub Pages
- 在 GitHub Secrets 中設置 `GEMINI_API_KEY`
- 構建時會自動注入

#### Vercel / Netlify
- 在平台 Dashboard 的環境變數設置中添加 `GEMINI_API_KEY`

### 環境變數優先順序

1. `process.env.GEMINI_API_KEY`（構建時注入）
2. `process.env.API_KEY`（構建時注入）
3. `import.meta.env.VITE_GEMINI_API_KEY`（Vite 環境變數）
4. `.env.local` 文件（本地開發）

## 疑難排解

### 部署後網站空白

1. **檢查 base path 配置**
   - 確認 `vite.config.ts` 中的 `base` 路徑與倉庫名稱一致
   - 當前設置：`base: '/tsa-repair-system/'`

2. **檢查 404.html**
   - GitHub Pages 需要 `404.html` 來處理 SPA 路由
   - 構建流程會自動生成

3. **檢查構建日誌**
   - 前往 GitHub Actions 查看構建日誌
   - 確認構建成功且沒有錯誤

### API Key 相關錯誤

#### "API_KEY_MISSING"
- **原因**：環境變數未設置
- **解決**：檢查 GitHub Secrets 或平台環境變數設置

#### "API_KEY_INVALID"
- **原因**：API Key 配置錯誤或無效
- **解決**：確認 API Key 正確且有效

#### "QUOTA_EXCEEDED"
- **原因**：API 配額已用盡
- **解決**：檢查 Gemini API 配額，等待配額重置或升級方案

#### "NETWORK_ERROR"
- **原因**：網絡連接問題
- **解決**：檢查網絡連接，確認 API 服務可訪問

### 構建失敗

1. **檢查 Node.js 版本**
   - 確保使用 Node.js 18+ 版本

2. **檢查依賴安裝**
   - 刪除 `node_modules` 和 `package-lock.json`
   - 重新執行 `npm install`

3. **檢查環境變數**
   - 確認構建時環境變數已正確設置

## 技術棧

- **框架**：React 19 + TypeScript
- **構建工具**：Vite 6
- **UI 框架**：Tailwind CSS
- **圖表庫**：Recharts
- **圖標**：Lucide React
- **AI 服務**：Google Gemini API

## 專案結構

```
tsa-repair-system/
├── components/          # React 組件
├── services/           # API 服務
├── types.ts           # TypeScript 類型定義
├── constants.tsx      # 常數配置
├── vite.config.ts     # Vite 配置
├── vercel.json        # Vercel 部署配置
├── netlify.toml       # Netlify 部署配置
└── .github/
    └── workflows/
        └── deploy.yml # GitHub Actions 部署流程
```

## 開發說明

### 添加新功能

1. 在 `components/` 目錄創建新組件
2. 在 `types.ts` 定義相關類型
3. 在 `App.tsx` 中集成新功能

### 修改部署配置

- **GitHub Pages**：修改 `.github/workflows/deploy.yml`
- **Vercel**：修改 `vercel.json`
- **Netlify**：修改 `netlify.toml`
- **Vite 構建**：修改 `vite.config.ts`

## 授權

本專案為 TSA 內部使用系統。

## 快速預覽

### 方法一：直接打開說明頁面

雙擊打開 `本地預覽說明.html` 文件，查看詳細的設置說明。

### 方法二：使用啟動腳本

**macOS / Linux：**
```bash
./start.sh
```

**Windows：**
```cmd
start.bat
```
或
```powershell
.\start.ps1
```

### 方法三：手動啟動

```bash
npm install
npm run dev
```

然後在瀏覽器打開 `http://localhost:3000`

詳細說明請參考 [如何本地預覽.md](./如何本地預覽.md)

## 文檔

- **[如何本地預覽.md](./如何本地預覽.md)** - 本地預覽的完整指南
- **[本地運行指南.md](./本地運行指南.md)** - 詳細的本地環境設置說明（macOS 和 Windows）
- **[開發者協作指南.md](./開發者協作指南.md)** - 團隊協作與開發流程
- **[常見問題.md](./常見問題.md)** - FAQ 與疑難排解

## 支援

如有問題或建議，請：
1. 查看 [常見問題.md](./常見問題.md)
2. 查看 [本地運行指南.md](./本地運行指南.md)
3. 聯繫開發團隊或提交 Issue
