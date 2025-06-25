# Thiết lập dự án
- Đảm bảo Docker Desktop luôn bật
- Mở phần mềm PhpStorm - Chọn New Project - Chọn PHP Empty Project - Chọn thư mục tạo dự án - Nhấn nút Create
- Nhập nội dung vào `docker-compose.yml`
- Nhập nội dung vào `docker-compose.prod.yml`
- Chạy script dưới trong Terminal tại thư mục gốc của dự án:


```bash
docker run --rm -v "${PWD}:/app" -w /app composer create-project laravel/laravel backend
docker run --rm -v "${PWD}:/app" -w /app node:24.2-alpine3.22 sh -c "npm create vite@latest frontend -- --template vue --variant javascript --yes && cd frontend && npm install && cd ../backend && npm install"
```

- Nhập nội dung vào `.env` và `.env.example` ở thư mục gốc
- Điều chỉnh thông tin các biến cơ sở dữ liệu trong `.env` và `.env.example` ở `backend/
- Tạo file `Dockerfile` tại đường dẫn `backend/Dockerfile` và `frontend/Dockerfile`
- Nhập nội dung vào `.gitignore` và`.dockerignore:`
- Nhập nội dung vào `.github/workflows/docker-image.yml`:
- Tại `frontend/vite.config.js`, thay thế nội dung trong file thành nội dung dưới đây để bật Hot Reload:
    
```javascript
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
```