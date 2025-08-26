#!/bin/bash

# Fix for frontend build memory issues
# This script helps resolve common build problems with the RHOAI Dashboard

set -e

echo "🔧 Fixing build issues for RHOAI Dashboard..."

# Clean up any failed builds
echo "🧹 Cleaning up previous build artifacts..."
if command -v podman &> /dev/null; then
    CONTAINER_CMD="podman"
else
    CONTAINER_CMD="docker"
fi

# Remove any dangling build containers
$CONTAINER_CMD system prune -f

# Clean npm cache and node_modules
echo "🗑️ Cleaning npm cache and dependencies..."
rm -rf node_modules frontend/node_modules backend/node_modules
rm -rf frontend/public frontend/dist

# Clear npm cache
npm cache clean --force

# Reinstall dependencies with increased memory
echo "📦 Reinstalling dependencies..."
export NODE_OPTIONS="--max-old-space-size=4096"
npm ci
cd frontend && npm ci && cd ..
cd backend && npm ci && cd ..

# Try building locally first to verify it works
echo "🏗️ Testing local build..."
npm run build

echo "✅ Local build successful! Now trying Docker/Podman build..."

# Now try the container build
if [ -f podman-compose.dev.yml ]; then
    if command -v podman-compose &> /dev/null; then
        COMPOSE_CMD="podman-compose"
    elif podman compose version &> /dev/null 2>&1; then
        COMPOSE_CMD="podman compose"
    elif command -v docker-compose &> /dev/null; then
        COMPOSE_CMD="docker-compose"
    elif docker compose version &> /dev/null 2>&1; then
        COMPOSE_CMD="docker compose"
    fi
    
    echo "🐳 Building containers with $COMPOSE_CMD..."
    $COMPOSE_CMD -f podman-compose.dev.yml build --no-cache rhoai-dashboard
else
    echo "❌ podman-compose.dev.yml not found!"
    exit 1
fi

echo "✅ Build fix complete!"
