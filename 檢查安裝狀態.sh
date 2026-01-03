#!/bin/bash

echo "🔍 TSA 會館修繕系統 - 安裝狀態檢查"
echo "=================================="
echo ""

# 檢查 Node.js
echo "📦 檢查 Node.js..."
if command -v node &> /dev/null; then
    NODE_VERSION=$(node --version)
    echo "✅ Node.js 已安裝：$NODE_VERSION"
else
    echo "❌ Node.js 未安裝"
fi
echo ""

# 檢查 npm
echo "📦 檢查 npm..."
if command -v npm &> /dev/null; then
    NPM_VERSION=$(npm --version)
    echo "✅ npm 已安裝：$NPM_VERSION"
else
    echo "❌ npm 未安裝"
fi
echo ""

# 檢查專案依賴
echo "📦 檢查專案依賴..."
if [ -d "node_modules" ]; then
    echo "✅ 專案依賴已安裝"
    echo "   依賴數量：$(ls -1 node_modules | wc -l | tr -d ' ') 個套件"
else
    echo "❌ 專案依賴未安裝"
    echo "   請執行：npm install"
fi
echo ""

# 檢查環境變數文件
echo "📦 檢查環境變數..."
if [ -f ".env.local" ]; then
    echo "✅ .env.local 文件存在"
    if grep -q "GEMINI_API_KEY" .env.local; then
        echo "✅ GEMINI_API_KEY 已設置"
    else
        echo "⚠️  GEMINI_API_KEY 未設置"
    fi
else
    echo "⚠️  .env.local 文件不存在（可選）"
fi
echo ""

# 總結
echo "=================================="
if command -v node &> /dev/null && command -v npm &> /dev/null && [ -d "node_modules" ]; then
    echo "✅ 所有必要項目已安裝，可以開始使用！"
    echo ""
    echo "啟動開發伺服器："
    echo "  npm run dev"
else
    echo "⚠️  需要完成安裝才能使用系統"
    echo ""
    echo "請參考："
    echo "  - 本地運行指南.md"
    echo "  - 安裝狀態檢查.md"
fi
echo ""
