# Dev Setup

## Requirements

ODH requires the following to run:

### For Local Development (Recommended)

- [NodeJS and NPM](https://nodejs.org/)
  - Node recommended version -> `20.18.0`
  - NPM recommended version -> `10.8.2`
- Container Runtime:
  - [Docker](https://docs.docker.com/get-docker/) with [Docker Compose](https://docs.docker.com/compose/install/), OR
  - [Podman](https://podman.io/getting-started/installation) with `podman-compose` or built-in `podman compose`

### For External Cluster Development

- [NodeJS and NPM](https://nodejs.org/)
  - Node recommended version -> `20.18.0`
  - NPM recommended version -> `10.8.2`
- [OpenShift CLI](https://docs.redhat.com/en/documentation/openshift_container_platform/4.16/html/cli_tools/openshift-cli-oc)
- [kustomize](https://github.com/kubernetes-sigs/kustomize) (if you need to do deployment)

### Additional tooling

- [Podman](https://github.com/containers/podman)
- [Quay.io](https://quay.io/)

## Development

1. Clone the repository

   ```bash
   git clone https://github.com/opendatahub-io/odh-dashboard
   ```

2. Within the repo context, we use `npm` to install project dependencies

   ```bash
   cd odh-dashboard && npm install
   ```

### Build project

```bash
npm run build
```

### Serve development content

This is the default context for running a local UI. Make sure you build the project using the instructions above prior to running the command below.

#### Option 1: Local Development with KWOK (Recommended)

For a simplified development experience without needing external cluster access, use the local KWOK setup:

```bash
# Quick start with KWOK
./scripts/start-dev-with-kwok.sh
```

This will:
- Start a local KWOK cluster (simulated Kubernetes)
- Launch the RHOAI Dashboard 
- Configure everything automatically
- Open the dashboard at http://localhost:4010

**Manual KWOK setup:**

1. Copy the environment template:
   ```bash
   cp env.local.example .env.local
   ```

2. Start services with Docker Compose or Podman Compose:
   ```bash
   # With Docker
   docker-compose -f docker-compose.dev.yml up --build
   
   # With Podman (using podman-compose)
   podman-compose -f docker-compose.dev.yml up --build
   
   # With Podman (using built-in compose)
   podman compose -f docker-compose.dev.yml up --build
   ```

3. Access the dashboard at http://localhost:4010

#### Option 2: External OpenShift Cluster

> Note: You must be logged-in with `oc` before you can start the backend. Details for that are in the the [contribution guidelines](../CONTRIBUTING.md#give-your-dev-env-access).

> Note: The CLI logged-in user will need to be a `cluster-admin` level user on the cluster to mimic the Dashboard Service Account level of permissions. You could also bind the [cluster role](../manifests/core-bases/base/cluster-role.yaml) to your user as we do with the service account [binding](../manifests/core-bases/base/cluster-role-binding.yaml).

```bash
npm run start
```

> If you'd like to run "backend" and "frontend" separately for development, cd into each directory in two different terminals and run `npm run start:dev` from each.

For in-depth local run guidance review the [contribution guidelines](../CONTRIBUTING.md).

### Testing

Run the tests.

```bash
npm run test
```

For in-depth testing guidance review the [testing guidelines](./testing.md)

### Dev Feature Flags

Feature flags are defined in the odh-dashboard-config ([architectural documentation](https://github.com/opendatahub-io/architecture-decision-records/blob/main/documentation/components/dashboard/configuringDashboard.md) on feature flags). When testing on a live cluster, changing feature flags via the config affects all users on the cluster. It is also possible to personally control the enablement of feature flags within the browser session. Simply append `?devFeatureFlags` to the dashboard URL. A blue banner will appear at the top of the page where a modal can be opened, allowing one to adjust the enablement of feature flags. These settings will persist for the length of the browser session.

With the dev feature flags modal opened, the browser URL will update to include the current feature flag enablement settings. The URL can then be bookmarked or shared.

### Configuring Custom Console Link Domain (CONSOLE_LINK_DOMAIN)

Certain environments require custom access configurations for the OpenShift console and Prometheus endpoints because they may not have access to internal services. To support these configurations, the CONSOLE_LINK_DOMAIN environment variable allows developers to specify a custom domain to override default calculations.

Steps to Configure:

1. Open the root `.env.local` file (or create it if it doesn't exist).
2. Add the following line to define the custom console domain:

   <code>CONSOLE_LINK_DOMAIN=your-custom-domain.com</code>

Replace your-custom-domain.com with the specific domain for your OpenShift console

## Deploying the ODH Dashbard

### Official Image Builds

odh-dashboard images are automatically built and pushed to [quay.io](https://quay.io/repository/opendatahub/odh-dashboard) after every commit to the `main` branch. The image tag name format for each image is `main-<COMMIT SHORT HASH>`.

Example: The `main` branch is updated with commit `f76e3952834f453b1d085e8627f9c17297c2f64c`. The CI system will automatically build an odh-dashboard image based on that code and push the new image to `odh-dashboard:main-f76e395` and updated `odh-dashboard:main` to point to the same image hash.

The [nightly](https://quay.io/opendatahub/odh-dashboard:nightly) tag is a floating tag that is updated nightly and points to the most recent `main-<HASH>` commit from the previous day.

### Deploy using kustomize

The [manifests](../manifests) folder contains a [kustomize](https://kustomize.io) manifest that can be used with `kustomize build`.

### Deploy using a kfdef

> Note: This flow is deprecated, deploy v2 [Operator](https://github.com/opendatahub-io/opendatahub-operator) with their custom CR.

The [manifests/kfdef](../manifests/kfdef) folder contains an example kfdef to deploy ODH Dashboard with the Notebook Controller backend is located in [odh-dashboard-kfnbc-test.yaml](../manifests/kfdef/odh-dashboard-kfnbc-test.yaml).

## Local Development with KWOK

[KWOK (Kubernetes WithOut Kubelet)](https://github.com/kubernetes-sigs/kwok) is a lightweight Kubernetes simulator that allows you to run the RHOAI Dashboard without needing access to an external OpenShift cluster. This is the recommended approach for development.

### Why KWOK?

- **No external dependencies**: No need for `oc login` or cluster access
- **Fast startup**: Cluster starts in seconds, not minutes
- **Lightweight**: Minimal resource consumption on your laptop
- **Consistent**: Same environment for all developers
- **Simulated**: Can simulate thousands of nodes and pods for testing

### KWOK Architecture

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

### Quick Start

1. **One-command setup:**
   ```bash
   ./scripts/start-dev-with-kwok.sh
   ```

2. **Access the dashboard:**
   - Dashboard: http://localhost:4010
   - KWOK API: http://localhost:8080

### Manual Setup

If you prefer manual control:

1. **Copy environment configuration:**
   ```bash
   cp env.local.example .env.local
   ```

2. **Start services:**
   ```bash
   docker-compose -f docker-compose.dev.yml up --build
   ```

3. **Verify setup:**
   ```bash
   # Check KWOK cluster status
   curl http://localhost:8080/api/v1/nodes
   
   # Check dashboard status
   curl http://localhost:4010/api/status
   ```

### Environment Variables

Key environment variables for KWOK development:

| Variable | Description | Default |
|----------|-------------|---------|
| `LOCAL_K8S` | Enable local KWOK mode | `true` |
| `KWOK_API_SERVER` | KWOK API server URL | `http://kwok-cluster:8080` |
| `OC_PROJECT` | Default namespace | `opendatahub` |
| `DISABLE_CLUSTER_VERSION_CHECK` | Skip OpenShift version checks | `true` |
| `DISABLE_CONSOLE_CONFIG_CHECK` | Skip console config checks | `true` |

### What's Pre-configured

The KWOK cluster comes pre-configured with:

- **Namespaces**: `opendatahub`, `openshift-console`
- **CRDs**: `ClusterVersion`, `OdhDashboardConfig`
- **Sample resources**: 3 simulated worker nodes
- **RBAC**: Basic permissions for dashboard
- **ConfigMaps**: Console configuration for OpenShift compatibility

### Troubleshooting

**Services won't start:**
```bash
# Check Docker status
docker --version
docker-compose --version

# OR check Podman status
podman --version
podman-compose --version  # or: podman compose version

# View logs (use appropriate compose command)
docker-compose -f docker-compose.dev.yml logs -f
# OR
podman-compose -f docker-compose.dev.yml logs -f
```

**Dashboard can't connect to KWOK:**
```bash
# Verify KWOK is healthy (use your compose command)
docker-compose -f docker-compose.dev.yml exec kwok-cluster curl http://localhost:8080/healthz
# OR
podman-compose -f docker-compose.dev.yml exec kwok-cluster curl http://localhost:8080/healthz

# Check network connectivity
docker-compose -f docker-compose.dev.yml exec rhoai-dashboard curl http://kwok-cluster:8080/healthz
```

**Reset everything:**
```bash
# Stop and remove all containers/volumes (use your compose command)
docker-compose -f docker-compose.dev.yml down -v
docker system prune -f

# OR with Podman
podman-compose -f docker-compose.dev.yml down -v
podman system prune -f

# Start fresh
./scripts/start-dev-with-kwok.sh
```

### Development Workflow

1. **Make code changes** in your IDE
2. **Rebuild containers** (if needed):
   ```bash
   # Use your detected compose command, or manually:
   docker-compose -f docker-compose.dev.yml up --build rhoai-dashboard
   # OR
   podman-compose -f docker-compose.dev.yml up --build rhoai-dashboard
   ```
3. **Test changes** at http://localhost:4010
4. **View logs**:
   ```bash
   # The start script shows which compose command to use, or manually:
   docker-compose -f docker-compose.dev.yml logs -f rhoai-dashboard
   # OR
   podman-compose -f docker-compose.dev.yml logs -f rhoai-dashboard
   ```

### Advanced Usage

**Add custom resources to KWOK:**
Edit `scripts/kwok-init.sh` to add additional Kubernetes resources.

**Debug KWOK cluster:**
```bash
# Execute commands in KWOK container (use your compose command)
docker-compose -f docker-compose.dev.yml exec kwok-cluster kubectl get nodes
# OR
podman-compose -f docker-compose.dev.yml exec kwok-cluster kubectl get nodes

# Port forward for direct access
docker port $(docker-compose -f docker-compose.dev.yml ps -q kwok-cluster)
# OR
podman port $(podman-compose -f docker-compose.dev.yml ps -q kwok-cluster)
```

**Use different KWOK version:**
Update the image tag in `docker-compose.dev.yml`:
```yaml
image: registry.k8s.io/kwok/cluster:v0.5.0-k8s.v1.29.0
```
