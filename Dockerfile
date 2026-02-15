# Build stage
FROM node:20-alpine AS build

WORKDIR /app

# Copy package files and install dependencies
COPY package.json package-lock.json ./
RUN npm ci --only=production=false

# Copy source code and build
COPY . .
RUN npm run build

# Production stage
FROM nginx:alpine

# Add labels for better container management
LABEL org.opencontainers.image.title="OmniTools"
LABEL org.opencontainers.image.description="Self-hosted web app with variety of online tools"
LABEL org.opencontainers.image.source="https://github.com/neosoda/Tools"
LABEL org.opencontainers.image.vendor="TechSentinel"

# Copy built assets from build stage
COPY --from=build /app/dist /usr/share/nginx/html

# Copy custom nginx configuration
COPY nginx.conf /etc/nginx/conf.d/default.conf

# Update mime.types for .mjs files
RUN sed -i 's/application\/javascript.*js;/application\/javascript                js mjs;/' /etc/nginx/mime.types

# Healthcheck for Coolify monitoring (force IPv4)
HEALTHCHECK --interval=30s --timeout=3s --start-period=10s --retries=3 \
    CMD wget --no-verbose --tries=1 --spider http://127.0.0.1:3000/health || exit 1

EXPOSE 3000

CMD ["nginx", "-g", "daemon off;"]
