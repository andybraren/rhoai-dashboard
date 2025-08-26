#!/bin/bash

# Start RHOAI Dashboard with local KWOK cluster for development
# This script simplifies the development workflow by setting up everything needed

set -e

echo "🚀 Starting RHOAI Dashboard with local KWOK cluster..."

# Detect available container runtime and compose command
CONTAINER_CMD=""
COMPOSE_CMD=""

if command -v podman &> /dev/null; then
    CONTAINER_CMD="podman"
    if command -v podman-compose &> /dev/null; then
        COMPOSE_CMD="podman-compose"
    elif podman compose version &> /dev/null; then
        COMPOSE_CMD="podman compose"
    fi
elif command -v docker &> /dev/null; then
    CONTAINER_CMD="docker"
    if command -v docker-compose &> /dev/null; then
        COMPOSE_CMD="docker-compose"
    elif docker compose version &> /dev/null; then
        COMPOSE_CMD="docker compose"
    fi
fi

if [ -z "$CONTAINER_CMD" ]; then
    echo "❌ Neither Docker nor Podman is available. Please install one of them."
    echo "   • Docker: https://docs.docker.com/get-docker/"
    echo "   • Podman: https://podman.io/getting-started/installation"
    exit 1
fi

if [ -z "$COMPOSE_CMD" ]; then
    echo "❌ No compose command available. Please install:"
    if [ "$CONTAINER_CMD" = "podman" ]; then
        echo "   • Podman Compose: dnf install podman-compose (or pip install podman-compose)"
        echo "   • Or use built-in: podman compose (requires Podman 3.0+)"
    else
        echo "   • Docker Compose: https://docs.docker.com/compose/install/"
    fi
    exit 1
fi

echo "🔧 Using: $CONTAINER_CMD with '$COMPOSE_CMD'"

# Create .env.local file if it doesn't exist
if [ ! -f .env.local ]; then
    echo "📝 Creating .env.local file..."
    cat > .env.local << EOF
# Local development with KWOK cluster
LOCAL_K8S=true
KWOK_API_SERVER=http://kwok-cluster:8080
OC_PROJECT=opendatahub
APP_ENV=development
DISABLE_CLUSTER_VERSION_CHECK=true
DISABLE_CONSOLE_CONFIG_CHECK=true
EOF
    echo "✅ Created .env.local with KWOK configuration"
else
    echo "📋 Using existing .env.local file"
fi

# Start the services
echo "🐳 Starting services with $COMPOSE_CMD..."
$COMPOSE_CMD -f docker-compose.dev.yml up --build -d

echo "⏳ Waiting for services to be ready..."

# Wait for KWOK cluster to be healthy
echo "🔍 Waiting for KWOK cluster to be ready..."
timeout 60 bash -c "until $COMPOSE_CMD -f docker-compose.dev.yml exec kwok-cluster curl -sf http://localhost:8080/healthz > /dev/null 2>&1; do sleep 2; done" || {
    echo "❌ KWOK cluster failed to start within 60 seconds"
    echo "📋 Checking logs:"
    $COMPOSE_CMD -f docker-compose.dev.yml logs kwok-cluster
    exit 1
}

# Wait for dashboard to be ready
echo "🎯 Waiting for RHOAI Dashboard to be ready..."
timeout 60 bash -c 'until curl -sf http://localhost:4010/api/status > /dev/null 2>&1; do sleep 2; done' || {
    echo "❌ Dashboard failed to start within 60 seconds"
    echo "📋 Checking logs:"
    $COMPOSE_CMD -f docker-compose.dev.yml logs rhoai-dashboard
    exit 1
}

echo "✅ All services are ready!"
echo ""
echo "🎉 RHOAI Dashboard is now running with local KWOK cluster!"
echo ""
echo "📋 Access Information:"
echo "   • Dashboard UI: http://localhost:4010"
echo "   • KWOK API Server: http://localhost:8080"
echo ""
echo "🔧 Useful Commands:"
echo "   • View logs: docker-compose -f docker-compose.dev.yml logs -f"
echo "   • Stop services: docker-compose -f docker-compose.dev.yml down"
echo "   • Restart services: docker-compose -f docker-compose.dev.yml restart"
echo "   • Check KWOK status: curl http://localhost:8080/api/v1/nodes"
echo ""
echo "🗑️  To stop everything: docker-compose -f docker-compose.dev.yml down"

# Open the dashboard in the default browser (optional)
if command -v open &> /dev/null; then
    echo "🌐 Opening dashboard in browser..."
    open http://localhost:4010
elif command -v xdg-open &> /dev/null; then
    echo "🌐 Opening dashboard in browser..."
    xdg-open http://localhost:4010
fi
