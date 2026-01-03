@echo off
chcp 65001 >nul
echo.
echo 🔍 TSA 會館修繕系統 - 安裝狀態檢查
echo ==================================
echo.

REM 檢查 Node.js
echo 📦 檢查 Node.js...
where node >nul 2>&1
if %errorlevel% equ 0 (
    for /f "tokens=*" %%i in ('node --version') do set NODE_VERSION=%%i
    echo ✅ Node.js 已安裝：%NODE_VERSION%
) else (
    echo ❌ Node.js 未安裝
)
echo.

REM 檢查 npm
echo 📦 檢查 npm...
where npm >nul 2>&1
if %errorlevel% equ 0 (
    for /f "tokens=*" %%i in ('npm --version') do set NPM_VERSION=%%i
    echo ✅ npm 已安裝：%NPM_VERSION%
) else (
    echo ❌ npm 未安裝
)
echo.

REM 檢查專案依賴
echo 📦 檢查專案依賴...
if exist "node_modules" (
    echo ✅ 專案依賴已安裝
    for /f %%i in ('dir /b /ad node_modules ^| find /c /v ""') do echo    依賴數量：%%i 個套件
) else (
    echo ❌ 專案依賴未安裝
    echo    請執行：npm install
)
echo.

REM 檢查環境變數文件
echo 📦 檢查環境變數...
if exist ".env.local" (
    echo ✅ .env.local 文件存在
    findstr /C:"GEMINI_API_KEY" .env.local >nul 2>&1
    if %errorlevel% equ 0 (
        echo ✅ GEMINI_API_KEY 已設置
    ) else (
        echo ⚠️  GEMINI_API_KEY 未設置
    )
) else (
    echo ⚠️  .env.local 文件不存在（可選）
)
echo.

REM 總結
echo ==================================
where node >nul 2>&1
set NODE_OK=%errorlevel%
where npm >nul 2>&1
set NPM_OK=%errorlevel%
if exist "node_modules" (
    set DEPS_OK=0
) else (
    set DEPS_OK=1
)

if %NODE_OK% equ 0 if %NPM_OK% equ 0 if %DEPS_OK% equ 0 (
    echo ✅ 所有必要項目已安裝，可以開始使用！
    echo.
    echo 啟動開發伺服器：
    echo   npm run dev
) else (
    echo ⚠️  需要完成安裝才能使用系統
    echo.
    echo 請參考：
    echo   - 本地運行指南.md
    echo   - 安裝狀態檢查.md
)
echo.

pause

