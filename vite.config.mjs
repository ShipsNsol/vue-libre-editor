import { defineConfig } from 'vite'
import vue from '@vitejs/plugin-vue'
import path from 'path'
import tailwindcss from '@tailwindcss/vite'

// https://vitejs.dev/config/
export default defineConfig(({ command }) => {
  const config = {
    plugins: [vue(), tailwindcss()],
    define: {
      __VUE_OPTIONS_API__: true,
      __VUE_PROD_DEVTOOLS__: false,
    },
    resolve: {
      alias: {
        '@': path.resolve(__dirname, './src'),
      },
    },
  }

  // For development mode
  if (command === 'serve') {
    return {
      ...config,
      base: "./",
      build: {
        minify: false,
        sourcemap: true,
        cssCodeSplit: false,
        target: "esnext",
        ssr: false,
      }
    }
  }
  
  // For production build (module)
  return {
    ...config,
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
          exports: "named",
          assetFileNames: (assetInfo) => {
            if (assetInfo.name.endsWith('.css')) return 'vue-libre-editor.css';
            return assetInfo.name;
          },
          inlineDynamicImports: false
        }
      },
      minify: false,
      sourcemap: true,
      cssCodeSplit: false
    }
  }
})
