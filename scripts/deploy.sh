#!/bin/bash
set -e

echo "🚀 Starting deployment..."

# Colors for output
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
RED='\033[0;31m'
NC='\033[0m' # No Color

# Configuration
PROJECT_DIR="/home/ubuntu/titans-tech"
COMPOSE_FILE="docker-compose.prod.yml"
BACKUP_DIR="/home/ubuntu/backups"

# Function to print colored messages
print_message() {
    echo -e "${GREEN}✓${NC} $1"
}

print_warning() {
    echo -e "${YELLOW}⚠${NC} $1"
}

print_error() {
    echo -e "${RED}✗${NC} $1"
}

# Navigate to project directory
cd "$PROJECT_DIR" || exit 1

# Check if .env.production exists
if [ ! -f ".env.production" ]; then
    print_error ".env.production file not found!"
    exit 1
fi

print_message "Pulling latest changes from git..."
git fetch origin
CURRENT_COMMIT=$(git rev-parse HEAD)
git pull origin main

NEW_COMMIT=$(git rev-parse HEAD)

if [ "$CURRENT_COMMIT" == "$NEW_COMMIT" ]; then
    print_warning "No new changes detected. Skipping deployment."
    exit 0
fi

print_message "New changes detected. Proceeding with deployment..."
print_message "Commit: $CURRENT_COMMIT → $NEW_COMMIT"

# Create backup timestamp
TIMESTAMP=$(date +%Y%m%d_%H%M%S)
mkdir -p "$BACKUP_DIR"

print_message "Backing up current state..."
docker compose -f "$COMPOSE_FILE" logs --tail=100 > "$BACKUP_DIR/logs_$TIMESTAMP.txt" 2>&1 || true

# Build new images
print_message "Building new Docker images..."
docker compose -f "$COMPOSE_FILE" build --no-cache

# Stop old containers
print_message "Stopping old containers..."
docker compose -f "$COMPOSE_FILE" down

# Start new containers
print_message "Starting new containers..."
docker compose -f "$COMPOSE_FILE" up -d

# Wait for services to be healthy
print_message "Waiting for services to be healthy..."
sleep 10

# Check health of services
print_message "Checking service health..."

# Check backend health
if curl -f http://localhost:4000/health > /dev/null 2>&1; then
    print_message "Backend is healthy"
else
    print_error "Backend health check failed!"
    print_warning "Rolling back..."
    docker compose -f "$COMPOSE_FILE" down
    git reset --hard "$CURRENT_COMMIT"
    docker compose -f "$COMPOSE_FILE" up -d
    exit 1
fi

# Check frontend health
if curl -f http://localhost:3000/api/health > /dev/null 2>&1; then
    print_message "Frontend is healthy"
else
    print_error "Frontend health check failed!"
    print_warning "Rolling back..."
    docker compose -f "$COMPOSE_FILE" down
    git reset --hard "$CURRENT_COMMIT"
    docker compose -f "$COMPOSE_FILE" up -d
    exit 1
fi

# Cleanup old images
print_message "Cleaning up old Docker images..."
docker image prune -f

# Show running containers
print_message "Deployment successful! Running containers:"
docker compose -f "$COMPOSE_FILE" ps

echo ""
print_message "Deployment completed successfully! 🎉"
print_message "Deployed commit: $NEW_COMMIT"
echo ""
