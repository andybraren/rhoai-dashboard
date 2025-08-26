# KWOK Development Setup for RHOAI Dashboard

This setup allows you to run the RHOAI Dashboard with a local KWOK (Kubernetes WithOut Kubelet) cluster, eliminating the need for external OpenShift cluster access during development.

## 🚀 Quick Start

Run this single command to get everything working:

```bash
./scripts/start-dev-with-kwok.sh
```

Then access your dashboard at: **http://localhost:4010**

## 📋 What You Get

- **RHOAI Dashboard** running at http://localhost:4010
- **Local KWOK Cluster** simulating OpenShift at http://localhost:8080  
- **Pre-configured Resources**: namespaces, CRDs, sample nodes, RBAC
- **No External Dependencies**: No need for `oc login` or cluster access

## 🏗️ Architecture

```
┌─────────────────┐    ┌──────────────────┐
│  RHOAI Dashboard│────│  KWOK Cluster    │
│  (Port 4010)    │    │  (Port 8080)     │
│                 │    │                  │
│  Frontend ──────┼────┼─▶ Kubernetes API │
│  Backend  ──────┘    │   - Simulated    │
└─────────────────┘    │   - OpenShift    │
                       │     compatible   │
                       └──────────────────┘
```

## 🔧 Manual Setup

If you prefer step-by-step control:

1. **Create environment configuration:**
   ```bash
   cp env.local.example .env.local
   ```

2. **Start services:**
   ```bash
   docker-compose -f docker-compose.dev.yml up --build
   ```

3. **Access dashboard:**
   - Dashboard UI: http://localhost:4010
   - KWOK API: http://localhost:8080

## 🛠️ Development Workflow

1. Make code changes in your IDE
2. For backend changes, rebuild the container:
   ```bash
   docker-compose -f docker-compose.dev.yml up --build rhoai-dashboard
   ```
3. Access dashboard at http://localhost:4010
4. View logs:
   ```bash
   docker-compose -f docker-compose.dev.yml logs -f
   ```

## 🔍 Useful Commands

```bash
# Check cluster status
curl http://localhost:8080/api/v1/nodes

# View all services
docker-compose -f docker-compose.dev.yml ps

# Stop everything
docker-compose -f docker-compose.dev.yml down

# Reset everything (including volumes)
docker-compose -f docker-compose.dev.yml down -v
docker system prune -f
```

## 🐛 Troubleshooting

### Services won't start
```bash
# Check Docker status
docker --version
docker-compose --version

# View detailed logs
docker-compose -f docker-compose.dev.yml logs -f kwok-cluster
docker-compose -f docker-compose.dev.yml logs -f rhoai-dashboard
```

### Dashboard can't connect to KWOK
```bash
# Test KWOK health
curl http://localhost:8080/healthz

# Test from dashboard container
docker-compose -f docker-compose.dev.yml exec rhoai-dashboard curl http://kwok-cluster:8080/healthz
```

### Reset everything
```bash
# Nuclear option - clean everything
docker-compose -f docker-compose.dev.yml down -v
docker system prune -af
./scripts/start-dev-with-kwok.sh
```

## ⚙️ Environment Variables

Key variables in `.env.local`:

| Variable | Description | Default |
|----------|-------------|---------|
| `LOCAL_K8S` | Enable KWOK mode | `true` |
| `KWOK_API_SERVER` | KWOK API URL | `http://kwok-cluster:8080` |
| `OC_PROJECT` | Default namespace | `opendatahub` |
| `DISABLE_CLUSTER_VERSION_CHECK` | Skip OpenShift checks | `true` |

## 📚 Resources

- [KWOK Project](https://github.com/kubernetes-sigs/kwok)
- [KWOK Documentation](https://kwok.sigs.k8s.io/)
- [Docker Compose Reference](https://docs.docker.com/compose/)

## 🎯 Next Steps

1. **Run the quick start**: `./scripts/start-dev-with-kwok.sh`
2. **Access dashboard**: http://localhost:4010
3. **Start developing**: Make changes and test immediately
4. **Check documentation**: See `docs/dev-setup.md` for detailed information

---

This setup provides a complete local development environment for RHOAI Dashboard without requiring external OpenShift cluster access. Perfect for rapid development and testing!
