import path from 'path';
import { defineConfig, loadEnv } from 'vite';
import react from '@vitejs/plugin-react';

export default defineConfig(({ mode }) => {
    // 優先從 process.env 讀取（GitHub Actions 設置的），然後從 .env 文件
    const env = loadEnv(mode, '.', '');
    const apiKey = process.env.GEMINI_API_KEY || env.GEMINI_API_KEY || '';
    
    // 構建時驗證環境變數
    if (mode === 'production' && !apiKey) {
      console.warn('⚠️  Warning: GEMINI_API_KEY is not set. The app may not work correctly.');
    }
    
    return {
      base: '/tsa-repair-system/',
      server: {
        port: 3000,
        host: '0.0.0.0',
      },
      plugins: [
        react(),
        {
          name: 'remove-importmap',
          transformIndexHtml(html) {
            // 在構建時移除 importmap，因為 Vite 會打包所有依賴
            if (mode === 'production') {
              return html.replace(/<script type="importmap">[\s\S]*?<\/script>/g, '');
            }
            return html;
          },
        },
        {
          name: 'generate-404',
          closeBundle() {
            // 在構建完成後創建 404.html 用於 GitHub Pages SPA 路由
            if (mode === 'production') {
              const fs = require('fs');
              const path = require('path');
              const distPath = path.resolve(__dirname, 'dist');
              const indexPath = path.join(distPath, 'index.html');
              const notFoundPath = path.join(distPath, '404.html');
              
              if (fs.existsSync(indexPath)) {
                fs.copyFileSync(indexPath, notFoundPath);
                console.log('Created 404.html for GitHub Pages SPA routing');
              }
            }
          },
        },
      ],
      define: {
        'process.env.API_KEY': JSON.stringify(apiKey),
        'process.env.GEMINI_API_KEY': JSON.stringify(apiKey),
        'import.meta.env.VITE_GEMINI_API_KEY': JSON.stringify(apiKey),
      },
      resolve: {
        alias: {
          '@': path.resolve(__dirname, '.'),
        }
      },
      build: {
        outDir: 'dist',
        assetsDir: 'assets',
        sourcemap: false,
        minify: 'esbuild',
        cssMinify: true,
        rollupOptions: {
          output: {
            manualChunks: (id) => {
              // 優化代碼分割：將 node_modules 中的大型依賴分離
              if (id.includes('node_modules')) {
                if (id.includes('react') || id.includes('react-dom')) {
                  return 'vendor-react';
                }
                if (id.includes('@google/genai')) {
                  return 'vendor-gemini';
                }
                if (id.includes('recharts')) {
                  return 'vendor-recharts';
                }
                return 'vendor';
              }
            },
            chunkFileNames: 'assets/js/[name]-[hash].js',
            entryFileNames: 'assets/js/[name]-[hash].js',
            assetFileNames: 'assets/[ext]/[name]-[hash].[ext]',
          },
        },
        chunkSizeWarningLimit: 1000,
      },
    };
});
