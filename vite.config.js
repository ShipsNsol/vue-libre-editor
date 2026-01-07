import { defineConfig } from 'vite'
import vue from '@vitejs/plugin-vue'
import path from 'path'
import tailwindcss from '@tailwindcss/vite'

// https://vitejs.dev/config/
export default defineConfig({
  plugins: [vue(), tailwindcss()],
  base: "./",
  build: {
    lib: {
      entry: path.resolve(__dirname, 'src/index.js'),
      name: 'VueLibreEditor',
      fileName: (format) => `vue-libre-editor.${format}.js`
    },
    rollupOptions: {
      external: ['vue'],
      output: {
        globals: {
          vue: 'Vue'
        },
        assetFileNames: (assetInfo) => {
          if (assetInfo.name === 'style.css') {
            return 'vue-libre-editor.css';
          }
          return assetInfo.name;
        }
      }
    },
    minify: false,
    sourcemap: false,
    cssCodeSplit: false,
    target: "esnext",
  },
  resolve: {
    alias: {
      '@': path.resolve(__dirname, './src'),
    },
  },
})