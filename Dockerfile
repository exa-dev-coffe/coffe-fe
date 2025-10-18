# ===== STAGE 1: Build React App =====
FROM node:20-alpine AS build

WORKDIR /app

# Copy package files dulu biar caching build layer lebih efisien
COPY package*.json ./

# Install dependencies (gunakan npm ci untuk reproducible builds)
RUN npm ci

# Copy seluruh source code
COPY . .

# Build React app (hasil build di /app/dist untuk Vite)
RUN npm run build


# ===== STAGE 2: Serve with Nginx =====
FROM nginx:alpine

# Bersihkan default nginx html
RUN rm -rf /usr/share/nginx/html/*

# Copy hasil build React dari stage sebelumnya
COPY --from=build /app/dist /usr/share/nginx/html

# (Opsional) Copy custom Nginx config jika kamu punya
# Kalau tidak punya nginx.conf, hapus baris di bawah
COPY nginx.conf /etc/nginx/conf.d/default.conf

# Expose port 80
EXPOSE 80

# Jalankan nginx di foreground
CMD ["nginx", "-g", "daemon off;"]
