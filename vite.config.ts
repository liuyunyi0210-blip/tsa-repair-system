import path from 'path';
import { defineConfig, loadEnv } from 'vite';
import react from '@vitejs/plugin-react';

export default defineConfig(({ mode }) => {
    const env = loadEnv(mode, '.', '');
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
        'process.env.API_KEY': JSON.stringify(env.GEMINI_API_KEY),
        'process.env.GEMINI_API_KEY': JSON.stringify(env.GEMINI_API_KEY)
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
        rollupOptions: {
          output: {
            manualChunks: undefined,
          },
        },
      },
    };
});
