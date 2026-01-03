import path from 'path';
import { fileURLToPath } from 'url';
import fs from 'fs';
import { defineConfig, loadEnv } from 'vite';
import react from '@vitejs/plugin-react';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

export default defineConfig(({ mode }) => {
    // 優先從 process.env 讀取（GitHub Actions 設置的），然後從 .env 文件
    const env = loadEnv(mode, '.', '');
    const apiKey = process.env.GEMINI_API_KEY || env.GEMINI_API_KEY || '';
    
    // 構建時驗證環境變數
    if (mode === 'production' && !apiKey) {
      console.warn('⚠️  Warning: GEMINI_API_KEY is not set. The app may not work correctly.');
    }
    
    return {
      base: mode === 'production' ? '/tsa-repair-system/' : '/',
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
          name: 'fix-asset-paths',
          transformIndexHtml: {
            enforce: 'post', // 在 Vite 處理之後運行
            transform(html, ctx) {
              // 在構建時確保所有資源路徑都使用正確的 base path
              if (mode === 'production') {
                const base = '/tsa-repair-system/';
                // 修復所有資源路徑（scripts, links, images 等）
                // 但跳過已經正確的路徑
                html = html.replace(
                  /(href|src)="([^"]+)"/g,
                  (match, attr, url) => {
                    // 跳過外部 URL
                    if (url.startsWith('http://') || url.startsWith('https://') || url.startsWith('//')) {
                      return match;
                    }
                    // 如果路徑已經包含 base，跳過
                    if (url.startsWith(base)) {
                      return match;
                    }
                    // 如果路徑以 / 開頭但不是 base，則添加 base
                    if (url.startsWith('/') && !url.startsWith(base)) {
                      return `${attr}="${base}${url.substring(1)}"`;
                    }
                    return match;
                  }
                );
              }
              return html;
            },
          },
        },
        {
          name: 'generate-404',
          closeBundle() {
            // 在構建完成後創建 404.html 用於 GitHub Pages SPA 路由
            if (mode === 'production') {
              const distPath = path.resolve(__dirname, 'dist');
              const indexPath = path.join(distPath, 'index.html');
              const notFoundPath = path.join(distPath, '404.html');
              
              if (fs.existsSync(indexPath)) {
                // 複製為 404.html
                fs.copyFileSync(indexPath, notFoundPath);
                console.log('Created 404.html for GitHub Pages SPA routing');
                
                // 輸出調試信息
                const htmlContent = fs.readFileSync(indexPath, 'utf-8');
                console.log('--- Built index.html preview (first 800 chars) ---');
                console.log(htmlContent.substring(0, 800));
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
            // 完全禁用代碼分割，避免 React 19 的載入順序和壓縮問題
            manualChunks: undefined,
            chunkFileNames: 'assets/js/[name]-[hash].js',
            entryFileNames: 'assets/js/[name]-[hash].js',
            assetFileNames: 'assets/[ext]/[name]-[hash].[ext]',
          },
        },
        chunkSizeWarningLimit: 2000,
      },
    };
});
