# ===== STAGE 1: Build React App =====
FROM node:18-alpine AS build

# Set working directory
WORKDIR /app

# Copy dependency files
COPY package*.json ./

# Install dependencies (gunakan npm ci kalau pakai lockfile)
RUN npm install

# Copy source code
COPY . .

# Build React app (hasilnya ke /app/build atau /app/dist tergantung tool)
RUN npm run build


# ===== STAGE 2: Serve with Nginx =====
FROM nginx:alpine

# Hapus default nginx website
RUN rm -rf /usr/share/nginx/html/*

# Copy hasil build React ke folder html nginx
COPY --from=build /app/dist /usr/share/nginx/html

# Optional: Copy custom Nginx config
COPY nginx.conf /etc/nginx/conf.d/default.conf

# Expose port 80
EXPOSE 80

# Jalankan nginx di foreground
CMD ["nginx", "-g", "daemon off;"]
