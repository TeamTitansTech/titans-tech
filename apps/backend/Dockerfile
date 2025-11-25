# Build stage
FROM node:20-alpine AS builder

# Set working directory
WORKDIR /app

# Copy package files from root and apps
COPY package*.json ./
COPY apps/backend/package*.json ./apps/backend/
COPY packages/database/package*.json ./packages/database/
COPY packages/shared/package*.json ./packages/shared/

# Install dependencies
RUN npm ci

# Copy source code
COPY apps/backend ./apps/backend
COPY packages ./packages
COPY tsconfig*.json ./
COPY nx.json ./
COPY .eslintrc.json ./

# Build the backend application
WORKDIR /app/apps/backend
RUN npm run build

# Production stage
FROM node:20-alpine AS production

# Install dumb-init for proper signal handling
RUN apk add --no-cache dumb-init

# Create non-root user
RUN addgroup -g 1001 -S nodejs && \
    adduser -S nestjs -u 1001

# Set working directory
WORKDIR /app

# Copy package files
COPY --from=builder /app/package*.json ./
COPY --from=builder /app/apps/backend/package*.json ./apps/backend/
COPY --from=builder /app/packages/database/package*.json ./packages/database/
COPY --from=builder /app/packages/shared/package*.json ./packages/shared/

# Install production dependencies only
RUN npm ci --only=production && \
    npm cache clean --force

# Copy built application
COPY --from=builder --chown=nestjs:nodejs /app/apps/backend/dist ./apps/backend/dist
COPY --from=builder --chown=nestjs:nodejs /app/packages ./packages

# Copy Prisma files for database migrations
COPY --from=builder --chown=nestjs:nodejs /app/packages/database/prisma ./packages/database/prisma

# Generate Prisma Client
WORKDIR /app/packages/database
RUN npx prisma generate

# Switch back to app directory
WORKDIR /app/apps/backend

# Switch to non-root user
USER nestjs

# Expose port
EXPOSE 3001

# Health check
HEALTHCHECK --interval=30s --timeout=10s --start-period=60s --retries=3 \
  CMD node -e "require('http').get('http://localhost:3001/health', (r) => {if (r.statusCode !== 200) throw new Error()})"

# Start the application with dumb-init
ENTRYPOINT ["dumb-init", "--"]
CMD ["node", "dist/main.js"]