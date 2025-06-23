**Prerequisites**

_Trước khi bắt đầu, hãy đảm bảo bạn đã có:_

- **Hệ điều hành**: Windows 10 trở lên
    
- **CPU** hỗ trợ ảo hóa (VT-x/AMD-V) và đã bật trong BIOS/UEFI
    
- **Quyền Administrator** trên máy để cài đặt các thành phần hệ thống
    
- **Bộ nhớ RAM** tối thiểu 8 GB
    
- **Kết nối Internet** ổn định để tải về Docker, WSL, v.v.
    
- **Tài khoản GitHub** (để thêm SSH key và clone repo)
    
- **Tài khoản JetBrains** (tuỳ chọn, nếu dùng PhpStorm bản trả phí)
---
# 1. Thiết lập kỹ thuật

## 1.1. Mở tính năng WSL, Hyper-V, Virtual Machine Platform

- Chạy đoạn script ở dưới trong Terminal bằng quyền Administration:
    

```powershell
dism.exe /online /enable-feature /featurename:VirtualMachinePlatform /all /norestart
dism.exe /online /enable-feature /featurename:Microsoft-Windows-Subsystem-Linux /all /norestart
```

- Sau đó khởi động lại máy tính
    
- Chạy lệnh `wsl --install` và `wsl -l -v` để kiểm tra. Lệnh này chỉ hoạt động khi WSL chưa được cài đặt.
    

## 1.2. Cài đặt Docker Desktop

- Tải về từ [Windows | Docker Docs](https://docs.docker.com/desktop/setup/install/windows-install/)
    
- Double-click `Docker Desktop Installer.exe` để chạy installer. Mặc định Docker Desktop được tải vào `C:\Program Files\Docker\Docker`.
    
- Khi hiện cửa sổ, chắc chắn rằng **Use WSL 2 instead of Hyper-V** được chọn.
    
- Tiếp tục làm theo hướng dẫn để hoàn tất cài đặt, sau khi cài đặt xong nhấn Close.
    

## 1.3. Cài đặt PhpStorm

- Link tải: [Download PhpStorm: The PHP IDE](https://www.jetbrains.com/phpstorm/download/#section=windows)
    

## 1.4. Cài đặt Git

- Link tải: [Git - Downloading Package](https://git-scm.com/downloads/win)
    

# 2. Chạy dự án khi **clone** về máy mới

_(Trường hợp KHÔNG khởi tạo lại từ đầu mà chỉ cần chạy mã nguồn đã có trong Git.)_

> **Giả sử:**
> 
> - Đã cài WSL / Docker Desktop (bước 1) và **Docker Desktop đang bật**.
>     
> - Vừa `git clone` dự án và chuyển qua nhánh `develop` để phát triển, hoặc nhánh `main` để chạy các bản release.


### 2.1. Cấu hình thông tin người dùng Git

- Mở **PowerShell** hoặc **Git Bash** rồi chạy:
```bash
git config --global user.name "<name>"
git config --global user.email "<email>"
```

- Tạo SSH key riêng cho **ký commit**:
```powershell
ssh-keygen -t ed25519 -C "<email>" -f "$env:USERPROFILE\.ssh\id_ed25519_signing"
```
> Bạn **có thể đặt passphrase** để bảo mật, hoặc để trống nếu muốn tiện.

- Hiển thị nội dung public key:
```powershell
type "$env:USERPROFILE\.ssh\id_ed25519_signing.pub"
```

- Copy toàn bộ dòng có dạng:
```powershell
ssh-ed25519 AAAAC3... <email>
```

- Truy cập: [https://github.com/settings/ssh/new](https://github.com/settings/ssh/new)
	- **Title:** SSH signing key
	- **Key type:** chọn **Signing key**
	- **Key:** dán nội dung vừa copy

- Cấu hình Git để ký commit bằng SSH key:
```powershell
git config --global gpg.format ssh
git config --global user.signingkey "$env:USERPROFILE\.ssh\id_ed25519_signing"
git config --global commit.gpgsign true
```

### 2.2. Chuẩn bị biến môi trường

1. **Tạo file `.env` gốc** (repo đã lưu sẵn `env.example`):
    

```powershell
copy .env.example .env
```

2. **Tạo file `.env` cho từng service**:
    

```powershell
copy backend\.env.example backend\.env
```

**Lưu ý:** Kiểm tra và chỉnh lại các biến cổng nếu bạn muốn thay đổi mặc định:

- `POSTGRES_PORT` (5432)
    
- `LARAVEL_PORT` (8000)
    
- `FRONTEND_PORT` (5173)
    

---

### 2.3. Kéo (hoặc build) image, khởi động toàn bộ stack và kiểm tra log (tuỳ chọn)

```powershell
docker compose up -d
```

- `--build` đảm bảo **khi mã nguồn thay đổi** (mới clone / branch khác) thì image được rebuild.
    
- Docker sẽ:
    
    1. **Kéo** image PostgreSQL 17.5-alpine (hoặc dùng cache).
        
    2. **Build** image cho `backend` (Laravel) và `frontend` (Vite).
        
    3. **Tự cài** Composer/NPM & chạy server bên trong container.
        

- Kiểm tra log (tuỳ chọn):

```powershell
docker compose logs
```

Bạn sẽ thấy:

- PostgreSQL ready on port `5432`.
    
- Laravel chạy ở `http://localhost:8000`.
    
- Vite dev-server chạy ở `http://localhost:5173`.
    

---

### 2.4. Truy cập ứng dụng

|Thành phần|URL mặc định|Ghi chú|
|---|---|---|
|**Frontend (Vue/Vite)**|[http://localhost:5173](http://localhost:5173)|Hot-reload tự động|
|**Backend (Laravel)**|[http://localhost:8000](http://localhost:8000)|API / web routes|
|**PostgreSQL**|Host: `localhost`, Port: `POSTGRES_PORT`|Dùng client bất kỳ|

> Nếu bạn đã thay đổi các biến cổng trong `.env`, truy cập theo cổng mới.

---

### 2.5. Tắt stack khi không sử dụng

```powershell
docker compose down -v
```

- `-v` xóa luôn volume Postgres local.
    
    - **Giữ dữ liệu**? Bỏ `-v`:  
        `docker compose down`
        

---

### 2.6. Cập nhật khi có thay đổi (pull code mới)

1. `git pull` (hoặc checkout branch).
    
2. Chạy lại:  
    `docker compose up -d --build`  
    Docker chỉ rebuild layer thay đổi → nhanh hơn lần đầu.
    

---

# 3. Thiết lập dự án

- Đảm bảo Docker Desktop luôn bật.
    
- Mở phần mềm PhpStorm - Chọn New Project - Chọn PHP Empty Project - Chọn thư mục tạo dự án - Nhấn nút Create
    
- Tạo dự án theo cấu trúc dưới đây:
    

```txt
<ten-du-an>/                        # Thư mục gốc của dự án
├── backend/                        # Source code backend (Laravel, Express, NestJS,...)
├── database/
├── docs/
├── frontend/                       # Source code frontend (Vue, React,...)
├── .dockerignore                   # Bỏ qua file không cần trong quá trình build Docker
├── .env                            # Biến môi trường thực tế (không commit lên Git)
├── .env.example                    # Mẫu file .env (dùng để chia sẻ hoặc CI/CD)
├── .gitignore                      # Bỏ qua file không nên commit vào Git (node_modules, .env,...)
├── docker-compose.yml              # Khởi tạo các container: frontend, backend, database,...
├── README.md
└── .github/
    └── workflows/
        └── docker-image.yml        # GitHub Actions workflow để build/push image

```

- Nhập nội dung dưới đây vào `docker-compose.yml`:
    

```yml
services:  
  postgres:  
    image: postgres:17.5-alpine3.22  
    container_name: postgres  
    restart: unless-stopped  
    env_file: [ .env ]  
    healthcheck:  
      test: [ "CMD-SHELL", "pg_isready -U ${POSTGRES_USER} -d ${POSTGRES_DATABASE}" ]  
      interval: 10s  
      timeout: 5s  
      retries: 6  
      start_period: 30s  
    volumes:  
      - postgres-data:/var/lib/postgresql/data  
    ports:  
      - "${POSTGRES_PORT:-5432}:5432"  
  
  backend:  
    build:  
      context: ./backend  
      dockerfile: Dockerfile  
      target: dev  
    container_name: backend  
    restart: unless-stopped  
    env_file: [ .env ]  
    command: >  
      sh -c "php artisan migrate && \      
             php artisan serve --host=0.0.0.0 --port=${LARAVEL_PORT}"  
    volumes:  
      - ./backend:/app:cached  
      - backend-vendor:/app/vendor  
      - backend-node-modules:/app/node_modules  
    ports:  
      - "${LARAVEL_PORT:-8000}:8000"  
    depends_on:  
      postgres:  
        condition: service_healthy  
  
  frontend:  
    build:  
      context: ./frontend  
      dockerfile: Dockerfile  
    container_name: frontend  
    restart: unless-stopped  
    env_file: [ .env ]  
    command: ["npm", "run", "dev", "--", "--host"]  
    volumes:  
      - ./frontend:/app:cached  
      - frontend-node-modules:/app/node_modules  
    ports:  
      - "${FRONTEND_PORT:-5173}:5173"  
  
volumes:  
  postgres-data:  
  backend-vendor:  
  frontend-node-modules:  
  backend-node-modules:  
  
networks:  
  default:  
    driver: bridge
```

- Nhập nội dung dưới đây vào `docker-compose.prod.yml`:
    

```yml
services:  
  backend:  
    image: heliosryuu/langduck:backend-${TAG:-latest}  
    restart: unless-stopped  
    ports:  
      - "${LARAVEL_PORT:-8000}:8000"  
    env_file:  
      - .env  
    depends_on:  
      - postgres  
  
  frontend:  
    image: heliosryuu/langduck:frontend-${TAG:-latest}  
    restart: unless-stopped  
    ports:  
      - "${FRONTEND_PORT:-5173}:5173"  
    env_file:  
      - .env  
  
  postgres:  
    image: postgres:17.5-alpine3.22    
    restart: unless-stopped  
    env_file:  
      - .env  
    volumes:  
      - postgres-data:/var/lib/postgresql/data  
    ports:  
      - "${POSTGRES_PORT:-5432}:5432"  
    healthcheck:  
      test: ["CMD-SHELL", "pg_isready -U ${POSTGRES_USER} -d ${POSTGRES_DATABASE}"]  
      interval: 10s  
      timeout: 5s  
      retries: 6  
      start_period: 30s  
  
volumes:  
  postgres-data:
```

- Chạy script dưới trong Terminal tại thư mục gốc của dự án:
    

```powershell
docker run --rm -v "${PWD}:/app" -w /app composer create-project laravel/laravel backend
docker run --rm -v "${PWD}:/app" -w /app node:24-alpine3.22 sh -c "npm create vite@latest frontend -- --template vue --variant javascript --yes && cd frontend && npm install && cd ../backend && npm install"
```

- Nhập nội dung dưới đây vào `.env` và `.env.example` ở thư mục gốc:
    

```txt
# ---------- Laravel backend ----------  
APP_ENV=local  
APP_DEBUG=true  
LARAVEL_PORT=8000  
  
# Cấu hình DB cho Laravel  
# ---------- PostgreSQL ----------  
POSTGRES_PORT=5432  
POSTGRES_DATABASE=mydb  
POSTGRES_USER=myuser  
POSTGRES_PASSWORD=secret  
TZ=Asia/Ho_Chi_Minh  
  
DB_CONNECTION=pgsql  
DB_HOST=postgres  
DB_PORT=5432  
DB_DATABASE=mydb  
DB_USERNAME=myuser  
DB_PASSWORD=secret  
  
# ---------- Frontend ----------  
FRONTEND_PORT=5173  
VITE_API_BASE_URL=http://localhost:8000/api
```

- Điều chỉnh thông tin các biến này trong `.env` và `.env.example` ở `backend/
    

```txt
DB_CONNECTION=pgsql  
DB_HOST=postgres  
DB_PORT=5432  
DB_DATABASE=mydb  
DB_USERNAME=myuser  
DB_PASSWORD=secret
```

- Tạo file `Dockerfile` tại đường dẫn `backend/Dockerfile` với nội dung dưới đây:
    

```dockerfile
# ---------- Composer (dev deps) ----------
FROM composer:2 AS vendor-dev
WORKDIR /app

COPY composer.json composer.lock artisan ./
COPY bootstrap bootstrap
COPY routes routes

RUN composer install \
    --prefer-dist \
    --optimize-autoloader \
    --no-interaction

# ---------- Composer (prod deps) ----------
FROM composer:2 AS vendor-prod
WORKDIR /app

COPY composer.json composer.lock artisan ./
COPY bootstrap bootstrap
COPY routes routes

RUN composer install \
    --no-dev \
    --prefer-dist \
    --optimize-autoloader \
    --no-interaction

# ---------- Node (prod deps) ----------
FROM node:24.2-alpine3.22 AS js-deps
WORKDIR /app

COPY package*.json ./
RUN npm install

# ---------- Base PHP Runtime ----------
FROM php:8.3-fpm-alpine3.22 AS base
WORKDIR /app

# System tools + PostgreSQL extension
RUN apk add --no-cache \
      bash \
      curl \
      git \
      unzip \
      libpq-dev \
  && docker-php-ext-install pdo_pgsql

# Composer CLI (nếu cần chạy composer trong container)
COPY --from=composer:2 /usr/bin/composer /usr/bin/composer

# Copy ứng dụng và node_modules, vendor (dev) mặc định
COPY . .
COPY --from=js-deps /app/node_modules ./node_modules
COPY --from=vendor-dev /app/vendor ./vendor

# ---------- Development Image ----------
FROM base AS dev

ENV APP_ENV=development \
    APP_DEBUG=true

EXPOSE 8000
CMD ["php-fpm"]

# ---------- Production Image ----------
FROM base AS prod

ENV APP_ENV=production \
    APP_DEBUG=false

# Thay vendor bằng bản production (không có dev deps)
COPY --from=vendor-prod /app/vendor ./vendor

EXPOSE 8000
CMD ["php-fpm"]
```

- Tạo file `Dockerfile` tại đường dẫn `frontend/Dockerfile` với nội dung dưới đây:
    

```dockerfile
# Stage: Builder – prepare and build frontend assets  
FROM node:24.2-alpine3.22 AS builder
WORKDIR /app

# 1. Cache and install NPM dependencies  
#    Copy package files first to leverage Docker layer caching  
COPY package*.json ./
RUN npm ci

# 2. Copy application source code into container  
COPY . .

# 3. Build production-ready assets  
#    Runs the configured build script (e.g., Vite build)  
RUN npm run build

# 4. Expose port for development server or static preview  
EXPOSE 5173

# 5. Default command: start dev server with HMR listening on all interfaces  
CMD ["npm", "run", "dev", "--", "--host", "0.0.0.0"]
```

- Nhập nội dung dưới đây vào `.gitignore`:
    

```txt
# ──────────────────────────────────────────────────────────────────────────────  
# Core Git  
# ──────────────────────────────────────────────────────────────────────────────  
# macOS  
.DS_Store  
.AppleDouble  
.LSOverride  
  
# Windows  
Thumbs.db  
ehthumbs.db  
Icon?  
desktop.ini  
  
# Linux  
*~  
  
# Vim swap  
*.swp  
*.swo  
  
# Temp  
*.tmp  
*.temp  
*.bak  
*.orig  
*.rej  
*.patch  
  
# Logs  
logs/  
*.log  
npm-debug.log*  
yarn-debug.log*  
yarn-error.log*  
  
# env files  
.env  
.env.*.local  
.env.local  
.env.development.local  
.env.test.local  
.env.production.local  
  
# ──────────────────────────────────────────────────────────────────────────────  
# Node / Frontend  
# ──────────────────────────────────────────────────────────────────────────────  
# Node modules  
/frontend/node_modules/  
/backend/node_modules/  
  
# Vite build output  
/frontend/dist/  
/frontend/.vite/  
  
/package-lock.json  
/yarn.lock  
/pnpm-lock.yaml  
  
# ──────────────────────────────────────────────────────────────────────────────  
# PHP / Laravel (backend/)  
# ──────────────────────────────────────────────────────────────────────────────  
# Composer dependencies  
/backend/vendor/  
/composer.phar  
  
# Laravel generated  
/backend/storage/  
/backend/public/storage/  
/backend/.phpunit.result.cache  
  
# OAuth keys & storage secrets  
/backend/storage/*.key  
/backend/storage/oauth-private.key  
/backend/storage/oauth-public.key  
  
# Homestead / Vagrant  
/backend/homestead.yaml  
/backend/homestead.json  
  
# ──────────────────────────────────────────────────────────────────────────────  
# IDEs & Editors  
# ──────────────────────────────────────────────────────────────────────────────  
# VSCode  
.vscode/  
/backend/.vscode/  
/frontend/.vscode/  
  
# PhpStorm, IntelliJ  
.idea/  
/backend/.idea/  
/frontend/.idea/  
  
# IntelliJ module files  
.idea_modules/  
  
# History  
.history/  
  
# ──────────────────────────────────────────────────────────────────────────────  
# Docker & Compose  
# ──────────────────────────────────────────────────────────────────────────────  
# Docker override and cache  
**/docker-compose.override.yml  
.docker/  
/docker-compose.override.yml  
  
# PostgreSQL data volume (if you mount by path instead of named volume)  
/database/postgres/  
  
# ──────────────────────────────────────────────────────────────────────────────  
# Testing & Coverage  
# ──────────────────────────────────────────────────────────────────────────────  
/coverage/  
/.nyc_output/  
/junit.xml  
/lcov-report/  
  
# ──────────────────────────────────────────────────────────────────────────────  
# Misc artifacts  
# ──────────────────────────────────────────────────────────────────────────────  
*.zip  
*.tar.gz  
*.7z  
*.rar  
*.pdf  
*.exe  
*.dll  
*.so  
*.dylib  
/backend/package-lock.json
```

- Nhập nội dung dưới đây vào `.dockerignore:
    

```txt
# ──────────────────────────────────────────────────────────────────────────────  
# Exclude Git metadata  
# ──────────────────────────────────────────────────────────────────────────────  
.git  
.gitignore  
  
# ──────────────────────────────────────────────────────────────────────────────  
# Node & PHP dependencies  
# ──────────────────────────────────────────────────────────────────────────────  
**/node_modules  
**/vendor  
  
# ──────────────────────────────────────────────────────────────────────────────  
# Build outputs & caches  
# ──────────────────────────────────────────────────────────────────────────────  
**/dist  
**/.vite  
**/.cache  
**/.npm  
**/.yarn-cache  
**/.composer  
  
# ──────────────────────────────────────────────────────────────────────────────  
# Env & Secrets  
# ──────────────────────────────────────────────────────────────────────────────  
.env  
.env.*.local  
backend/.env  
frontend/.env  
  
# ──────────────────────────────────────────────────────────────────────────────  
# Logs & temp  
# ──────────────────────────────────────────────────────────────────────────────  
*.log  
logs/  
*.tmp  
*.temp  
  
# ──────────────────────────────────────────────────────────────────────────────  
# OS & editors  
# ──────────────────────────────────────────────────────────────────────────────  
.DS_Store  
Thumbs.db  
Icon?  
desktop.ini  
.vscode  
.idea  
.history  
  
# ──────────────────────────────────────────────────────────────────────────────  
# Dockerfiles & Compose (nếu không cần copy vào image)  
# ──────────────────────────────────────────────────────────────────────────────  
docker-compose.yml  
docker-compose.override.yml
```

- Nhập nội dung dưới đây vào `.github/workflows/docker-image.yml`:
```yml
name: Docker Image CI  
  
on:  
  push:  
    branches: [ main, develop, 'feature/**', 'release/**', 'hotfix/**']  
  pull_request:  
    branches: [ main, develop, 'release/**']  
  
jobs:  
  build-and-push:  
    runs-on: ubuntu-latest  
  
    strategy:  
      matrix:  
        service: [ backend, frontend ]  
  
    steps:  
      - name: Checkout code  
        uses: actions/checkout@v4  
  
      - name: Set up QEMU  
        uses: docker/setup-qemu-action@v2  
  
      - name: Set up Docker Buildx  
        uses: docker/setup-buildx-action@v2  
        with:  
          driver: docker-container  
  
      - name: Log in to Docker Hub  
        if: github.event_name != 'pull_request'  
        uses: docker/login-action@v3  
        with:  
          username: ${{ vars.DOCKER_USERNAME }}  
          password: ${{ secrets.DOCKER_PASSWORD }}  
  
      - id: meta  
        if: |  
          github.ref_name == 'main' ||  
          github.ref_name == 'develop' ||          startsWith(github.ref_name, 'release/')  
        uses: docker/metadata-action@v5  
        with:  
          images: heliosryuu/langduck  
          tags: |  
            type=raw,value=${{ matrix.service }}-latest,if=branch=main  
            type=raw,value=${{ matrix.service }}-develop,if=branch=develop  
  
      - name: Docker layer caching  
        uses: actions/cache@v3  
        with:  
          path: /tmp/.buildx-cache  
          key: ${{ runner.os }}-buildx-${{ matrix.service }}-${{ github.ref_name }}  
          restore-keys: |  
            ${{ runner.os }}-buildx-${{ matrix.service }}-  
  
      # 1) main → only latest  
      - name: Build & push ${{ matrix.service }} image (latest)  
        if: |  
          github.ref_name == 'main' ||  
          github.ref_name == 'develop' ||          startsWith(github.ref_name, 'release/')  
        uses: docker/build-push-action@v6  
        with:  
          context: ./${{ matrix.service }}  
          file: ./${{ matrix.service }}/Dockerfile  
          push: true  
          cache-from: type=local,src=/tmp/.buildx-cache  
          cache-to: type=local,dest=/tmp/.buildx-cache,mode=max  
          tags: ${{ steps.meta.outputs.tags }}  
          annotations: ${{ steps.meta.outputs.annotations }}  
          provenance: ${{ github.ref_name == 'main' || github.ref_name == 'develop' }}  
          sbom: ${{ github.ref_name == 'main' || github.ref_name == 'develop' }}  
  
      # 2) feature/hotfix → build only (no push)  
      - name: Build ${{ matrix.service }} image only (no push)  
        if: |  
          startsWith(github.ref_name, 'feature/') ||  
          startsWith(github.ref_name, 'hotfix/')  
        uses: docker/build-push-action@v6  
        with:  
          context: ./${{ matrix.service }}  
          file: ./${{ matrix.service }}/Dockerfile  
          push: false  
          cache-from: type=local,src=/tmp/.buildx-cache  
          cache-to: type=local,dest=/tmp/.buildx-cache,mode=max  
          tags: |  
            heliosryuu/langduck:${{ matrix.service }}-${{ github.ref_name }}
```

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

- Chạy script dưới trong Terminal tại thư mục gốc của dự án để build và chạy image:
    
```powershell
docker compose up -d --build
```

> Nếu đã build hoặc không có nhu cầu build lại (không có chỉnh sửa code) thì có thể chạy đơn giản: `docker compose up -d`

- Để xem log của hành động trên, chạy script dưới trong Terminal tại thư mục gốc của dự án:
    

```powershell
docker compose logs
```

- Để dừng các containers đang chạy, chạy script dưới trong Terminal tại thư mục gốc của dự án:
    

```powershell
docker compose down -v
```