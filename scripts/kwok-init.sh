#!/bin/bash

# KWOK initialization script to set up OpenShift-like resources
# This script runs inside the KWOK container during startup

set -e

echo "🚀 Initializing KWOK cluster with OpenShift-like resources..."

# Wait for the API server to be ready
echo "⏳ Waiting for KWOK API server to be ready..."
timeout 60 bash -c 'until curl -s http://localhost:8080/healthz > /dev/null; do sleep 2; done'

# Function to apply YAML manifests
apply_manifest() {
    local manifest_content="$1"
    echo "$manifest_content" | kubectl --server=http://localhost:8080 apply -f -
}

# Create the opendatahub namespace
echo "📁 Creating opendatahub namespace..."
apply_manifest "
apiVersion: v1
kind: Namespace
metadata:
  name: opendatahub
  labels:
    opendatahub.io/dashboard: 'true'
"

# Create openshift-console namespace for console config
echo "📁 Creating openshift-console namespace..."
apply_manifest "
apiVersion: v1
kind: Namespace
metadata:
  name: openshift-console
"

# Create console-config ConfigMap
echo "🔧 Creating console-config ConfigMap..."
apply_manifest "
apiVersion: v1
kind: ConfigMap
metadata:
  name: console-config
  namespace: openshift-console
data:
  console-config.yaml: |
    customization:
      branding: 'okd'
    servingInfo:
      bindAddress: https://0.0.0.0:8443
      bindNetwork: tcp4
"

# Create ClusterVersion CRD
echo "🏗️ Creating ClusterVersion CRD..."
apply_manifest "
apiVersion: apiextensions.k8s.io/v1
kind: CustomResourceDefinition
metadata:
  name: clusterversions.config.openshift.io
spec:
  group: config.openshift.io
  versions:
  - name: v1
    served: true
    storage: true
    schema:
      openAPIV3Schema:
        type: object
        properties:
          spec:
            type: object
            properties:
              clusterID:
                type: string
          status:
            type: object
  scope: Cluster
  names:
    plural: clusterversions
    singular: clusterversion
    kind: ClusterVersion
"

# Create ClusterVersion instance
echo "🆔 Creating ClusterVersion instance..."
apply_manifest "
apiVersion: config.openshift.io/v1
kind: ClusterVersion
metadata:
  name: version
spec:
  clusterID: 'kwok-dev-cluster-$(date +%s)'
"

# Create OdhDashboardConfig CRD
echo "🏗️ Creating OdhDashboardConfig CRD..."
apply_manifest "
apiVersion: apiextensions.k8s.io/v1
kind: CustomResourceDefinition
metadata:
  name: odhdashboardconfigs.opendatahub.io
spec:
  group: opendatahub.io
  versions:
  - name: v1alpha
    served: true
    storage: true
    schema:
      openAPIV3Schema:
        type: object
        properties:
          spec:
            type: object
            properties:
              dashboardConfig:
                type: object
                additionalProperties: true
          status:
            type: object
  scope: Namespaced
  names:
    plural: odhdashboardconfigs
    singular: odhdashboardconfig
    kind: OdhDashboardConfig
"

# Create ODH Dashboard Config
echo "⚙️ Creating ODH Dashboard Config..."
apply_manifest "
apiVersion: opendatahub.io/v1alpha
kind: OdhDashboardConfig
metadata:
  name: odh-dashboard-config
  namespace: opendatahub
  labels:
    opendatahub.io/dashboard: 'true'
spec:
  dashboardConfig:
    enablement: true
    disableInfo: false
    disableSupport: false
    disableClusterManager: false
    disableTracking: true
    disableBYONImageStream: false
    disableISVBadges: false
    disableAppLauncher: false
    disableUserManagement: false
    disableHome: false
    disableProjects: false
    disableModelServing: false
    disableProjectScoped: false
    disableProjectSharing: false
    disableCustomServingRuntimes: false
    disableTrustyBiasMetrics: false
    disablePerformanceMetrics: false
    disablePipelines: false
    disableKServe: false
    disableKServeAuth: false
    disableKServeMetrics: false
    disableKServeRaw: false
    disableModelMesh: false
    disableAcceleratorProfiles: false
    disableHardwareProfiles: true
    disableDistributedWorkloads: false
    disableModelCatalog: true
    disableModelRegistry: false
    disableModelRegistrySecureDB: false
    disableServingRuntimeParams: false
    disableConnectionTypes: false
    disableStorageClasses: false
    disableNIMModelServing: false
    disableAdminConnectionTypes: false
    disableFineTuning: true
    disableKueue: true
    disableLMEval: true
"

# Create basic RBAC for development
echo "🔐 Creating basic RBAC..."
apply_manifest "
apiVersion: rbac.authorization.k8s.io/v1
kind: ClusterRole
metadata:
  name: odh-dashboard-dev
rules:
- apiGroups: ['*']
  resources: ['*']
  verbs: ['*']
---
apiVersion: rbac.authorization.k8s.io/v1
kind: ClusterRoleBinding
metadata:
  name: odh-dashboard-dev
roleRef:
  apiGroup: rbac.authorization.k8s.io
  kind: ClusterRole
  name: odh-dashboard-dev
subjects:
- kind: User
  name: system:serviceaccount:default:default
  apiGroup: rbac.authorization.k8s.io
"

# Create some sample nodes for development
echo "🖥️ Creating sample nodes..."
for i in {1..3}; do
    apply_manifest "
apiVersion: v1
kind: Node
metadata:
  name: kwok-node-$i
  labels:
    node-role.kubernetes.io/worker: ''
    kubernetes.io/hostname: kwok-node-$i
    kubernetes.io/arch: amd64
    kubernetes.io/os: linux
  annotations:
    kwok.x-k8s.io/node: fake
spec:
  podCIDR: 10.244.$i.0/24
  podCIDRs:
  - 10.244.$i.0/24
status:
  allocatable:
    cpu: '4'
    memory: 8Gi
    pods: '110'
  capacity:
    cpu: '4'
    memory: 8Gi
    pods: '110'
  conditions:
  - type: Ready
    status: 'True'
    lastHeartbeatTime: '$(date -u +%Y-%m-%dT%H:%M:%SZ)'
    lastTransitionTime: '$(date -u +%Y-%m-%dT%H:%M:%SZ)'
  - type: MemoryPressure
    status: 'False'
    lastHeartbeatTime: '$(date -u +%Y-%m-%dT%H:%M:%SZ)'
    lastTransitionTime: '$(date -u +%Y-%m-%dT%H:%M:%SZ)'
  - type: DiskPressure
    status: 'False'
    lastHeartbeatTime: '$(date -u +%Y-%m-%dT%H:%M:%SZ)'
    lastTransitionTime: '$(date -u +%Y-%m-%dT%H:%M:%SZ)'
  - type: PIDPressure
    status: 'False'
    lastHeartbeatTime: '$(date -u +%Y-%m-%dT%H:%M:%SZ)'
    lastTransitionTime: '$(date -u +%Y-%m-%dT%H:%M:%SZ)'
  nodeInfo:
    architecture: amd64
    bootID: ''
    containerRuntimeVersion: ''
    kernelVersion: ''
    kubeProxyVersion: v1.28.0
    kubeletVersion: fake-v1.28.0
    machineID: ''
    operatingSystem: linux
    osImage: ''
    systemUUID: ''
  phase: Running
"
done

echo "✅ KWOK cluster initialization complete!"
echo "📊 Cluster status:"
kubectl --server=http://localhost:8080 get nodes
kubectl --server=http://localhost:8080 get namespaces
echo "🎯 Dashboard can now connect to: http://localhost:8080"
