# Multi-stage build for Next.js dashboard
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
COPY apps/dashboard/package*.json ./apps/dashboard/

# Install dependencies
RUN npm ci --prefer-offline --no-audit

# Copy source files
COPY packages/database ./packages/database
COPY packages/shared ./packages/shared
COPY apps/dashboard ./apps/dashboard

# Generate Prisma Client
WORKDIR /app/packages/database
RUN npx prisma generate

# Build shared package
WORKDIR /app/packages/shared
RUN npm run build

# Build dashboard with standalone output
WORKDIR /app/apps/dashboard

# Set environment variables for build
ENV NEXT_TELEMETRY_DISABLED=1
ENV NODE_ENV=production

RUN npm run build

# Stage 2: Production
FROM node:24.11.0-alpine AS production

WORKDIR /app

# Install runtime dependencies
RUN apk add --no-cache openssl libc6-compat curl

# Create non-root user
RUN addgroup -g 1001 -S nodejs && \
    adduser -S nextjs -u 1001

# Copy standalone build
COPY --from=builder --chown=nextjs:nodejs /app/apps/dashboard/.next/standalone ./
COPY --from=builder --chown=nextjs:nodejs /app/apps/dashboard/.next/static ./apps/dashboard/.next/static
COPY --from=builder --chown=nextjs:nodejs /app/apps/dashboard/public ./apps/dashboard/public

# Copy Prisma client for runtime
COPY --from=builder --chown=nextjs:nodejs /app/packages/database/node_modules/.prisma ./packages/database/node_modules/.prisma

USER nextjs

# Expose port
EXPOSE 3000

# Environment variables
ENV PORT=3000
ENV NODE_ENV=production
ENV NEXT_TELEMETRY_DISABLED=1

# Health check
HEALTHCHECK --interval=30s --timeout=10s --start-period=40s --retries=3 \
  CMD curl -f http://localhost:3000/api/health || exit 1

# Start the application
CMD ["node", "apps/dashboard/server.js"]
