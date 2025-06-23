import { defineConfig } from 'vite'
import vue from '@vitejs/plugin-vue'

// https://vite.dev/config/
export default defineConfig({
  plugins: [vue()],
  server: {
    // Cho phép Vite server listen mọi interface trong container
    host: '0.0.0.0',
    // Tăng cường watch khi mount từ host
    watch: {
      usePolling: true,
      interval: 100,        // tùy chỉnh tốc độ polling nếu cần
      ignoreInitial: true,  // ignore initial build để tránh chạy quá tay
    },
    // Cấu hình HMR để client (trình duyệt) biết connect về đâu
    hmr: {
      protocol: 'ws',       // WebSocket
      host: 'localhost',    // host machine, không phải container
      port: 5173,           // match với port mà bạn expose
    },
  },
})