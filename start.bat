@echo off
chcp 65001 >nul
echo.
echo 🚀 TSA 會館修繕系統 - 本地啟動腳本
echo ==================================
echo.

REM 檢查 Node.js 是否安裝
where node >nul 2>&1
if %errorlevel% neq 0 (
    echo ❌ 錯誤：未檢測到 Node.js
    echo.
    echo 請先安裝 Node.js：
    echo   方法 1（推薦）：前往 https://nodejs.org/ 下載安裝
    echo   方法 2：使用 Chocolatey 執行 choco install nodejs-lts -y
    echo.
    echo 詳細說明請參考「本地運行指南.md」
    pause
    exit /b 1
)

REM 顯示 Node.js 版本
for /f "tokens=*" %%i in ('node --version') do set NODE_VERSION=%%i
for /f "tokens=*" %%i in ('npm --version') do set NPM_VERSION=%%i
echo ✅ Node.js 版本：%NODE_VERSION%
echo ✅ npm 版本：%NPM_VERSION%
echo.

REM 檢查是否已安裝依賴
if not exist "node_modules" (
    echo 📦 正在安裝依賴套件...
    call npm install
    if %errorlevel% neq 0 (
        echo ❌ 依賴安裝失敗，請檢查錯誤訊息
        pause
        exit /b 1
    )
    echo ✅ 依賴安裝完成
    echo.
)

REM 檢查環境變數文件
if not exist ".env.local" (
    echo ⚠️  提示：未找到 .env.local 文件
    echo    如果您需要使用 Gemini AI 功能，請創建此文件並添加：
    echo    GEMINI_API_KEY=your_api_key_here
    echo.
)

REM 啟動開發伺服器
echo 🌐 正在啟動開發伺服器...
echo    伺服器將在 http://localhost:3000 運行
echo    按 Ctrl+C 可停止伺服器
echo.
echo ==================================
echo.

call npm run dev

pause

