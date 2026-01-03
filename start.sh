#!/bin/bash

# TSA 會館修繕系統 - 本地啟動腳本

echo "🚀 TSA 會館修繕系統 - 本地啟動腳本"
echo "=================================="
echo ""

# 檢查 Node.js 是否安裝
if ! command -v node &> /dev/null; then
    echo "❌ 錯誤：未檢測到 Node.js"
    echo ""
    echo "請先安裝 Node.js："
    echo "  方法 1（推薦）：brew install node"
    echo "  方法 2：前往 https://nodejs.org/ 下載安裝"
    echo ""
    echo "詳細說明請參考「本地運行指南.md」"
    exit 1
fi

# 顯示 Node.js 版本
echo "✅ Node.js 版本：$(node --version)"
echo "✅ npm 版本：$(npm --version)"
echo ""

# 檢查是否已安裝依賴
if [ ! -d "node_modules" ]; then
    echo "📦 正在安裝依賴套件..."
    npm install
    if [ $? -ne 0 ]; then
        echo "❌ 依賴安裝失敗，請檢查錯誤訊息"
        exit 1
    fi
    echo "✅ 依賴安裝完成"
    echo ""
fi

# 檢查環境變數文件
if [ ! -f ".env.local" ]; then
    echo "⚠️  提示：未找到 .env.local 文件"
    echo "   如果您需要使用 Gemini AI 功能，請創建此文件並添加："
    echo "   GEMINI_API_KEY=your_api_key_here"
    echo ""
fi

# 啟動開發伺服器
echo "🌐 正在啟動開發伺服器..."
echo "   伺服器將在 http://localhost:3000 運行"
echo "   按 Ctrl+C 可停止伺服器"
echo ""
echo "=================================="
echo ""

npm run dev

