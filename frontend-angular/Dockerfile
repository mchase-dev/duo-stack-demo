# Multi-stage build for Angular frontend
# BUILD_CONFIG selects the Angular build configuration:
#   production         → backend-node + socket.io  (default)
#   production-dotnet  → backend-dotnet + signalr
ARG BUILD_CONFIG=production

FROM node:22-alpine AS builder

WORKDIR /app

COPY package*.json ./
RUN npm ci

COPY . .

ARG BUILD_CONFIG
RUN npm run build -- --configuration=${BUILD_CONFIG}

# Production stage
FROM nginx:alpine

COPY --from=builder /app/dist/frontend-angular/browser /usr/share/nginx/html
COPY nginx.conf /etc/nginx/conf.d/default.conf

EXPOSE 80

CMD ["nginx", "-g", "daemon off;"]
