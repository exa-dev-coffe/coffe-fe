# ===== STAGE 1: Build React App =====
FROM node:20-alpine AS build

WORKDIR /app

# Copy dependency files
COPY package*.json ./

# Install dependencies (gunakan npm ci kalau ada lockfile)
RUN npm ci || npm install

# Copy seluruh source code
COPY . .

# 🔍 Cek apakah .env sudah masuk
RUN ls -la && cat .env || echo "no .env found"


# Build React app (hasil build di /app/dist untuk Vite)
RUN npm run build


# ===== STAGE 2: Serve with Nginx =====
FROM nginx:alpine

# Hapus default nginx website
RUN rm -rf /usr/share/nginx/html/*

# Copy hasil build React ke folder html nginx
COPY --from=build /app/dist /usr/share/nginx/html

# Copy custom Nginx config (optional, pastikan file ini ada)
COPY nginx.conf /etc/nginx/conf.d/default.conf

# Expose port 80
EXPOSE 80

# Jalankan nginx di foreground
CMD ["nginx", "-g", "daemon off;"]
