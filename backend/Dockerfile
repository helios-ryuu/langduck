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

# Copy environment template and rename
COPY .env.example .env

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
