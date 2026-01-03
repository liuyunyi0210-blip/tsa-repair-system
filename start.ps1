# TSA 會館修繕系統 - PowerShell 啟動腳本

Write-Host ""
Write-Host "🚀 TSA 會館修繕系統 - 本地啟動腳本" -ForegroundColor Cyan
Write-Host "==================================" -ForegroundColor Cyan
Write-Host ""

# 檢查 Node.js 是否安裝
try {
    $nodeVersion = node --version 2>$null
    $npmVersion = npm --version 2>$null
} catch {
    Write-Host "❌ 錯誤：未檢測到 Node.js" -ForegroundColor Red
    Write-Host ""
    Write-Host "請先安裝 Node.js：" -ForegroundColor Yellow
    Write-Host "  方法 1（推薦）：前往 https://nodejs.org/ 下載安裝"
    Write-Host "  方法 2：使用 Chocolatey 執行 choco install nodejs-lts -y"
    Write-Host ""
    Write-Host "詳細說明請參考「本地運行指南.md」" -ForegroundColor Yellow
    Read-Host "按 Enter 鍵退出"
    exit 1
}

# 顯示 Node.js 版本
Write-Host "✅ Node.js 版本：$nodeVersion" -ForegroundColor Green
Write-Host "✅ npm 版本：$npmVersion" -ForegroundColor Green
Write-Host ""

# 檢查是否已安裝依賴
if (-not (Test-Path "node_modules")) {
    Write-Host "📦 正在安裝依賴套件..." -ForegroundColor Yellow
    npm install
    if ($LASTEXITCODE -ne 0) {
        Write-Host "❌ 依賴安裝失敗，請檢查錯誤訊息" -ForegroundColor Red
        Read-Host "按 Enter 鍵退出"
        exit 1
    }
    Write-Host "✅ 依賴安裝完成" -ForegroundColor Green
    Write-Host ""
}

# 檢查環境變數文件
if (-not (Test-Path ".env.local")) {
    Write-Host "⚠️  提示：未找到 .env.local 文件" -ForegroundColor Yellow
    Write-Host "   如果您需要使用 Gemini AI 功能，請創建此文件並添加："
    Write-Host "   GEMINI_API_KEY=your_api_key_here"
    Write-Host ""
}

# 啟動開發伺服器
Write-Host "🌐 正在啟動開發伺服器..." -ForegroundColor Cyan
Write-Host "   伺服器將在 http://localhost:3000 運行"
Write-Host "   按 Ctrl+C 可停止伺服器"
Write-Host ""
Write-Host "==================================" -ForegroundColor Cyan
Write-Host ""

npm run dev

Read-Host "按 Enter 鍵退出"

