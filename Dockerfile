FROM node:18.20.4-alpine AS builder

WORKDIR /app

COPY package*.json ./

# Install dependencies first
RUN npm install

COPY . .

# Build the application
RUN npm run build

# Stage 2: Serve application with Nginx
FROM nginx:alpine

COPY nginx.conf /etc/nginx/conf.d/default.conf

# Remove default Nginx index.html (optional, but good practice)
RUN [ -f /etc/nginx/html/index.html ] && rm /etc/nginx/html/index.html || true

COPY --from=builder /app/dist /usr/share/nginx/html

EXPOSE 80

CMD ["nginx", "-g", "daemon off;"]