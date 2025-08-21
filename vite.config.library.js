import { defineConfig } from 'vite'
import vue from '@vitejs/plugin-vue'
import path from 'path'
import fs from 'fs'
import { fileURLToPath } from 'url'

// Определяем __dirname в модульной системе ES
const __filename = fileURLToPath(import.meta.url)
const __dirname = path.dirname(__filename)

export default defineConfig({
  plugins: [
     vue(),
     {
      name: 'copy-style-css',
      closeBundle() {
        const src = path.resolve(__dirname, 'src/style.css')
        const dest = path.resolve(__dirname, 'dist-library/style.css')
        
        // Создаём папку dist-library, если её нет
        fs.mkdirSync(path.dirname(dest), { recursive: true })
        
        fs.copyFileSync(src, dest)
        
        console.log('✓ style.css copied to dist-library/')
      }
    }
  ],
  build: {
    lib: {
      entry: path.resolve(__dirname, 'src/App.vue'),
      name: 'MyAppLibrary',
      formats: ['es', 'umd'],
      fileName: (format) => `app-library.${format}.js`
    },
    rollupOptions: {
      external: ['vue'],
      output: {
        globals: {
          vue: 'Vue'
        }
      }
    },
    outDir: 'dist-library',
    cssCodeSplit: true
  }
})