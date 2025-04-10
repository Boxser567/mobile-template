import react from '@vitejs/plugin-react';
import path from 'path';
import { visualizer } from 'rollup-plugin-visualizer';
import { defineConfig, loadEnv } from 'vite';
import viteCompression from 'vite-plugin-compression';
import vitePluginImp from 'vite-plugin-imp';
import svgr from 'vite-plugin-svgr';

export default defineConfig(({ mode }) => {
  const env = loadEnv(mode, process.cwd(), '');

  return {
    define: {
      __APP_ENV__: JSON.stringify(env.APP_ENV),
    },
    resolve: {
      alias: [
        // 将以 "~" 开头的路径替换为空
        { find: /^~/, replacement: '' },
        // 将 "@" 映射到项目的 src 目录
        { find: '@', replacement: path.join(__dirname, 'src') },
      ],
    },
    server: {
      port: 3099,
      proxy: {
        '/api/auth-center/oauth2/token': {
          target: 'https://whatsbook.dcraysai.com/api/auth-center/oauth2/token',
          changeOrigin: true,
          rewrite: () => {
            return '';
          },
        },

        '/api/portal-tools-center/iam/get/temp/key': {
          target: 'https://whatsbook.dcraysai.com/api/portal-tools-center/iam/get/temp/key',
          changeOrigin: true,
          rewrite: () => {
            return '';
          },
        },

        // 请求后台的路径是
        '/api/virtual-human-center': {
          target: `https://whatsbook.dcraysai.com/api/virtual-human-center`,
          changeOrigin: true,
          rewrite: path => {
            return path.replace(/^\/api/, '');
          },
          // rewrite: path => path.replace(/^\/api/, ''),
        },
      },
    },
    css: {
      preprocessorOptions: {
        less: {
          javascriptEnabled: true,
        },
      },
    },
    plugins: [
      react({
        jsxImportSource: '@emotion/react',
        babel: {
          plugins: ['@emotion/babel-plugin'],
        },
      }),
      svgr(),
      vitePluginImp({
        libList: [
          // {
          //   libName: 'antd-mobile',
          //   style: name => {
          //     console.log("this----name", name)
          //     if (name === 'theme') return null;
          //     return `antd-mobile/es/${name}/style`;
          //   },
          // },
        ],
      }),
      // purgecss({
      //   content: ['./src/**/*.html', './src/**/*.tsx', './src/**/*.ts', './src/**/*.js'],
      // }),
      viteCompression({
        verbose: true,
        algorithm: 'brotliCompress',
        ext: '.br',
        deleteOriginFile: false,
      }),
      visualizer({ open: false }), // 生成打包体积分析报告
    ],
    build: {
      chunkSizeWarningLimit: 1500, // 调高至 10500KB
      treeshake: {
        preset: 'recommended',
        manualPureFunctions: ['styled', 'local', 'console.log'],
      },
      rollupOptions: {
        output: {
          experimentalMinChunkSize: 100_000,
          chunkFileNames: 'js/[name]-[hash].js',
          entryFileNames: 'js/[name]-[hash].js',
          assetFileNames: 'assets/[name]-[hash].[ext]',
          manualChunks(id) {
            if (id.includes('node_modules/antd-mobile')) {
              return 'antd-mobile-vendors';
            }

            if (id.includes('node_modules')) {
              return 'vendor';
            }

            return 'main';
          },
        },
      },
      sourcemap: false,
      minify: false,
      optimizeDeps: {
        include: ['react', 'react-dom', 'react-router-dom', 'antd-mobile', 'zustand'],
      },
      esbuild: {
        drop: mode === 'production' ? ['console', 'debugger'] : [],
      },
    },
  };
});
