# Multi-stage build for NestJS backend
# Stage 1: Builder
FROM node:24.11.0-alpine AS builder

WORKDIR /app

# Install dependencies needed for Prisma
RUN apk add --no-cache openssl libc6-compat

# Copy package files
COPY package*.json ./
COPY turbo.json ./
COPY packages/database/package*.json ./packages/database/
COPY packages/shared/package*.json ./packages/shared/
COPY apps/backend/package*.json ./apps/backend/

# Install all dependencies
RUN npm ci --prefer-offline --no-audit


COPY packages/database ./packages/database
COPY packages/shared ./packages/shared
COPY apps/backend ./apps/backend

# Generate Prisma Client
WORKDIR /app/packages/database
RUN npx prisma generate

# Build shared package
WORKDIR /app/packages/shared
RUN npm run build

# Build backend
WORKDIR /app/apps/backend
RUN npm run build

# Stage 2: Production
FROM node:24.11.0-alpine AS production

WORKDIR /app

# Install production dependencies
RUN apk add --no-cache openssl libc6-compat curl

# Copy package files
COPY package*.json ./
COPY turbo.json ./
COPY packages/database/package*.json ./packages/database/
COPY packages/shared/package*.json ./packages/shared/
COPY apps/backend/package*.json ./apps/backend/

# Install only production dependencies
RUN npm ci --prefer-offline --no-audit --omit=dev

# Copy built artifacts from builder
COPY --from=builder /app/packages/database/dist ./packages/database/dist
COPY --from=builder /app/packages/database/prisma ./packages/database/prisma
COPY --from=builder /app/packages/database/node_modules/.prisma ./packages/database/node_modules/.prisma
COPY --from=builder /app/packages/shared/dist ./packages/shared/dist
COPY --from=builder /app/apps/backend/dist ./apps/backend/dist

# Set working directory to backend
WORKDIR /app/apps/backend

# Create non-root user
RUN addgroup -g 1001 -S nodejs && \
    adduser -S nestjs -u 1001

# Change ownership
RUN chown -R nestjs:nodejs /app

USER nestjs

# Expose port
EXPOSE 4000

# Health check
HEALTHCHECK --interval=30s --timeout=10s --start-period=40s --retries=3 \
  CMD curl -f http://localhost:4000/health || exit 1

# Start the application
CMD ["node", "dist/main.js"]
