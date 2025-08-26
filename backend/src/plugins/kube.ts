import * as fs from 'fs';
import fp from 'fastify-plugin';
import { FastifyInstance } from 'fastify';
import * as jsYaml from 'js-yaml';
import * as k8s from '@kubernetes/client-node';
import { errorHandler, isKubeFastifyInstance } from '../utils';
import { DEV_MODE } from '../utils/constants';
import {
  cleanupGPU,
  cleanupKserveRoleBindings,
  initializeWatchedResources,
} from '../utils/resourceUtils';

const CONSOLE_CONFIG_YAML_FIELD = 'console-config.yaml';

const kc = new k8s.KubeConfig();

// Check if we're using local KWOK cluster
if (DEV_MODE && process.env.LOCAL_K8S === 'true' && process.env.KWOK_API_SERVER) {
  // Configure for local KWOK cluster
  const kwokApiServer = process.env.KWOK_API_SERVER;
  console.log(`🔧 Configuring for local KWOK cluster at: ${kwokApiServer}`);
  
  kc.loadFromOptions({
    clusters: [
      {
        name: 'kwok-cluster',
        server: kwokApiServer,
        skipTLSVerify: true,
      },
    ],
    users: [
      {
        name: 'kwok-user',
        // KWOK doesn't require authentication in development mode
      },
    ],
    contexts: [
      {
        name: 'kwok-context',
        cluster: 'kwok-cluster',
        user: 'kwok-user',
        namespace: 'opendatahub',
      },
    ],
    currentContext: 'kwok-context',
  });
} else {
  // Use default kubeconfig (existing behavior)
  kc.loadFromDefault();
}

const currentContext = kc.getCurrentContext();
const customObjectsApi = kc.makeApiClient(k8s.CustomObjectsApi);
const coreV1Api = kc.makeApiClient(k8s.CoreV1Api);
const batchV1Api = kc.makeApiClient(k8s.BatchV1Api);
const batchV1beta1Api = kc.makeApiClient(k8s.BatchV1beta1Api);
const currentUser = kc.getCurrentUser();
const rbac = kc.makeApiClient(k8s.RbacAuthorizationV1Api);

export default fp(async (fastify: FastifyInstance) => {
  let namespace;
  try {
    namespace = await getCurrentNamespace();
  } catch (e) {
    fastify.log.error(e, 'Failed to retrieve current namespace');
  }

  let currentToken;
  try {
    currentToken = await getCurrentToken();
  } catch (e) {
    currentToken = '';
    fastify.log.error(e, 'Failed to retrieve current token');
    // For KWOK development, we don't need a real token
    if (DEV_MODE && process.env.LOCAL_K8S === 'true') {
      currentToken = 'kwok-dev-token';
      fastify.log.info('Using development token for KWOK cluster');
    }
  }

  let clusterID;
  try {
    // Skip cluster version check if disabled (for local development)
    if (process.env.DISABLE_CLUSTER_VERSION_CHECK === 'true') {
      clusterID = 'kwok-dev-cluster';
      fastify.log.info('Cluster version check disabled, using default cluster ID');
    } else {
      const clusterVersion = await customObjectsApi.getClusterCustomObject(
        'config.openshift.io',
        'v1',
        'clusterversions',
        'version',
      );
      clusterID = (clusterVersion.body as { spec: { clusterID: string } }).spec.clusterID;
    }
  } catch (e) {
    fastify.log.error(e, `Failed to retrieve cluster id: ${errorHandler(e)}.`);
    // Fallback for local development
    if (DEV_MODE && process.env.LOCAL_K8S === 'true') {
      clusterID = 'kwok-dev-cluster';
      fastify.log.info('Using fallback cluster ID for local development');
    }
  }
  let clusterBranding = 'okd';
  try {
    // Skip console config check if disabled (for local development)
    if (process.env.DISABLE_CONSOLE_CONFIG_CHECK === 'true') {
      clusterBranding = 'okd';
      fastify.log.info('Console config check disabled, using default branding');
    } else {
      const consoleConfig = await coreV1Api
        .readNamespacedConfigMap('console-config', 'openshift-console')
        .then((result) => result.body);
      if (consoleConfig.data?.[CONSOLE_CONFIG_YAML_FIELD]) {
        const consoleConfigData = jsYaml.load(consoleConfig.data[CONSOLE_CONFIG_YAML_FIELD]);
        clusterBranding = consoleConfigData.customization?.branding || 'okd';
        fastify.log.info(`Cluster Branding: ${clusterBranding}`);
      }
    }
  } catch (e) {
    fastify.log.error(`Failed to retrieve console cluster info: ${errorHandler(e)}`);
    // Fallback for local development
    if (DEV_MODE && process.env.LOCAL_K8S === 'true') {
      clusterBranding = 'okd';
      fastify.log.info('Using fallback branding for local development');
    }
  }

  fastify.decorate('kube', {
    config: kc,
    currentContext,
    namespace,
    coreV1Api,
    batchV1beta1Api,
    batchV1Api,
    customObjectsApi,
    currentUser,
    currentToken,
    clusterID,
    clusterBranding,
    rbac,
  });

  // Initialize the watching of resources
  if (isKubeFastifyInstance(fastify)) {
    initializeWatchedResources(fastify);

    cleanupGPU(fastify).catch((e) =>
      fastify.log.error(
        `Unable to fully convert GPU to use accelerator profiles. ${
          e.response?.body?.message || e.message || e
        }`,
      ),
    );

    cleanupKserveRoleBindings(fastify).catch((e) =>
      fastify.log.error(
        `Unable to fully convert kserve rolebindings to use secure role. ${
          e.response?.body?.message || e.message || e
        }`,
      ),
    );
  }
});

const getCurrentNamespace = async () =>
  new Promise((resolve, reject) => {
    if (currentContext === 'inClusterContext') {
      fs.readFile(
        '/var/run/secrets/kubernetes.io/serviceaccount/namespace',
        'utf8',
        (err, data) => {
          if (err) {
            reject(err);
          }
          resolve(data);
        },
      );
    } else if (DEV_MODE) {
      // For KWOK development, use opendatahub namespace
      if (process.env.LOCAL_K8S === 'true') {
        resolve(process.env.OC_PROJECT || 'opendatahub');
      } else {
        resolve(process.env.OC_PROJECT);
      }
    } else {
      resolve(currentContext.split('/')[0]);
    }
  });

const getCurrentToken = async () =>
  new Promise((resolve, reject) => {
    if (currentContext === 'inClusterContext') {
      const location =
        currentUser?.authProvider?.config?.tokenFile ||
        '/var/run/secrets/kubernetes.io/serviceaccount/token';
      fs.readFile(location, 'utf8', (err, data) => {
        if (err) {
          reject(err);
        }
        resolve(data);
      });
    } else if (DEV_MODE && process.env.LOCAL_K8S === 'true') {
      // For KWOK development, we don't need a real token
      resolve('kwok-dev-token');
    } else {
      resolve(currentUser?.token || '');
    }
  });
