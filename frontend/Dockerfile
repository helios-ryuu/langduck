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