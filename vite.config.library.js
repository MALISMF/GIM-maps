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
        const dest = path.resolve(__dirname, 'gim-tec-library/style.css')
        
        // Создаём папку gim-tec-library, если её нет
        fs.mkdirSync(path.dirname(dest), { recursive: true })
        
        fs.copyFileSync(src, dest)
        
        console.log('✓ style.css copied to gim-tec-library/')
      }
    }
  ],
  build: {
    lib: {
      entry: path.resolve(__dirname, 'src/App.vue'),
      name: 'GimTecLibrary',
      formats: ['es', 'umd'],
      fileName: (format) => `gim-tec.${format}.js`
    },
    rollupOptions: {
      external: ['vue'],
      output: {
        globals: {
          vue: 'Vue'
        }
      }
    },
    outDir: 'gim-tec-library',
    cssCodeSplit: true
  }
})