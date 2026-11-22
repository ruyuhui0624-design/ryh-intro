import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'

// base 用相对路径：打包后的 dist 既能部署到任意子路径，也能直接双击 index.html 预览
export default defineConfig({
  base: './',
  plugins: [react()],
  server: {
    port: 5173,
    host: true,
  },
})
