#!/bin/bash

# Start RHOAI Dashboard with local KWOK cluster for development
# This script simplifies the development workflow by setting up everything needed

set -e

echo "🚀 Starting RHOAI Dashboard with local KWOK cluster..."

# Check if podman is available
if ! command -v podman &> /dev/null; then
    echo "❌ Podman is not available. Please install Podman."
    echo "   • Podman: https://podman.io/getting-started/installation"
    exit 1
fi

# Check if podman compose is available
if ! podman compose version &> /dev/null; then
    echo "❌ Podman compose is not available. Please install or upgrade Podman."
    echo "   • Requires Podman 3.0+ with compose plugin"
    exit 1
fi

echo "🔧 Using: podman with 'podman compose'"

# Set container runtime for KWOK
export CONTAINER_RUNTIME="podman"

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
CONTAINER_RUNTIME=podman
EOF
    echo "✅ Created .env.local with KWOK configuration"
else
    echo "📋 Using existing .env.local file"
fi

# Start the services
echo "🐳 Starting services with podman compose..."
echo "⚠️  Note: Frontend build may take 3-5 minutes due to large codebase..."
podman compose -f podman-compose.dev.yml up --build -d

echo "⏳ Waiting for services to be ready..."

# Wait for KWOK cluster to be healthy
echo "🔍 Waiting for KWOK cluster to be ready..."
timeout 60 bash -c "until podman compose -f podman-compose.dev.yml exec kwok-cluster curl -sf http://localhost:8080/healthz > /dev/null 2>&1; do sleep 2; done" || {
    echo "❌ KWOK cluster failed to start within 60 seconds"
    echo "📋 Checking logs:"
    podman compose -f podman-compose.dev.yml logs kwok-cluster
    exit 1
}

# Wait for dashboard to be ready
echo "🎯 Waiting for RHOAI Dashboard to be ready..."
timeout 60 bash -c 'until curl -sf http://localhost:4010/api/status > /dev/null 2>&1; do sleep 2; done' || {
    echo "❌ Dashboard failed to start within 60 seconds"
    echo "📋 Checking logs:"
    podman compose -f podman-compose.dev.yml logs rhoai-dashboard
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
echo "   • View logs: podman compose -f podman-compose.dev.yml logs -f"
echo "   • Stop services: podman compose -f podman-compose.dev.yml down"
echo "   • Restart services: podman compose -f podman-compose.dev.yml restart"
echo "   • Check KWOK status: curl http://localhost:8080/api/v1/nodes"
echo ""
echo "🗑️  To stop everything: podman compose -f podman-compose.dev.yml down"

# Open the dashboard in the default browser (optional)
if command -v open &> /dev/null; then
    echo "🌐 Opening dashboard in browser..."
    open http://localhost:4010
elif command -v xdg-open &> /dev/null; then
    echo "🌐 Opening dashboard in browser..."
    xdg-open http://localhost:4010
fi
