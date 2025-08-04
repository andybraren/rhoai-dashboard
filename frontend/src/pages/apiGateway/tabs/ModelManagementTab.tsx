import * as React from 'react';
import {
  Card,
  CardBody,
  CardTitle,
  Form,
  FormGroup,
  TextInput,
  Switch,
  Select,
  SelectOption,
  SelectList,
  MenuToggle,
  NumberInput,
  Stack,
  StackItem,
  Button,
  Alert,
  Flex,
  FlexItem,
  Grid,
  GridItem,
  TextArea,
  Badge,
  Table,
  Thead,
  Tr,
  Th,
  Tbody,
  Td,
  ActionsColumn,
} from '@patternfly/react-core';
import { PlusCircleIcon, EditIcon, TrashIcon } from '@patternfly/react-icons';

interface ModelEndpoint {
  id: string;
  name: string;
  version: string;
  endpoint: string;
  status: 'active' | 'inactive' | 'error';
  instances: number;
  lastUpdated: string;
}

const ModelManagementTab: React.FC = () => {
  const [autoDiscoveryEnabled, setAutoDiscoveryEnabled] = React.useState(true);
  const [versioningEnabled, setVersioningEnabled] = React.useState(true);
  const [canaryDeploymentEnabled, setCanaryDeploymentEnabled] = React.useState(false);
  const [modelRegistry, setModelRegistry] = React.useState('default-registry');
  const [modelRegistryOpen, setModelRegistryOpen] = React.useState(false);
  const [defaultModelVersion, setDefaultModelVersion] = React.useState('latest');
  const [healthCheckInterval, setHealthCheckInterval] = React.useState(60);
  const [autoScalingEnabled, setAutoScalingEnabled] = React.useState(true);
  const [minInstances, setMinInstances] = React.useState(1);
  const [maxInstances, setMaxInstances] = React.useState(10);
  const [deploymentStrategy, setDeploymentStrategy] = React.useState('rolling');
  const [deploymentStrategyOpen, setDeploymentStrategyOpen] = React.useState(false);
  const [modelMetadata, setModelMetadata] = React.useState('');

  const [modelEndpoints, setModelEndpoints] = React.useState<ModelEndpoint[]>([
    {
      id: '1',
      name: 'llama-2-7b-chat',
      version: 'v1.2.0',
      endpoint: 'https://api.company.com/v1/models/llama-2-7b-chat',
      status: 'active',
      instances: 3,
      lastUpdated: '2024-01-15T10:30:00Z'
    },
    {
      id: '2', 
      name: 'gpt-3.5-turbo',
      version: 'v1.0.5',
      endpoint: 'https://api.company.com/v1/models/gpt-3.5-turbo',
      status: 'active',
      instances: 5,
      lastUpdated: '2024-01-14T15:45:00Z'
    },
    {
      id: '3',
      name: 'claude-instant',
      version: 'v2.1.0',
      endpoint: 'https://api.company.com/v1/models/claude-instant',
      status: 'inactive',
      instances: 0,
      lastUpdated: '2024-01-13T09:15:00Z'
    }
  ]);

  const modelRegistries = [
    { value: 'default-registry', label: 'Default Model Registry' },
    { value: 'hugging-face', label: 'Hugging Face Hub' },
    { value: 'mlflow', label: 'MLflow Registry' },
    { value: 'custom-registry', label: 'Custom Registry' },
  ];

  const deploymentStrategies = [
    { value: 'rolling', label: 'Rolling Update', description: 'Gradual replacement of instances' },
    { value: 'blue-green', label: 'Blue-Green', description: 'Switch between two identical environments' },
    { value: 'canary', label: 'Canary', description: 'Gradual traffic shift to new version' },
    { value: 'recreate', label: 'Recreate', description: 'Stop all instances then start new ones' },
  ];

  const getStatusBadge = (status: string) => {
    const variants = {
      active: 'green',
      inactive: 'grey', 
      error: 'red'
    } as const;
    return <Badge variant="outline" color={variants[status as keyof typeof variants]}>{status}</Badge>;
  };

  const modelActions = (model: ModelEndpoint) => [
    {
      title: 'Edit',
      icon: <EditIcon />,
      onClick: () => console.log(`Edit ${model.name}`),
    },
    {
      title: 'Delete',
      icon: <TrashIcon />,
      onClick: () => setModelEndpoints(modelEndpoints.filter(m => m.id !== model.id)),
    },
  ];

  return (
    <Stack hasGutter>
      <StackItem>
        <Alert variant="info" title="Model Management Configuration">
          Configure how AI models are registered, versioned, and deployed through the API Gateway. 
          These settings control model discovery, routing, and lifecycle management.
        </Alert>
      </StackItem>

      <StackItem>
        <Card>
          <CardTitle>Model Registry Integration</CardTitle>
          <CardBody>
            <Form>
              <FormGroup label="Enable Auto-Discovery" fieldId="auto-discovery-enabled">
                <Switch
                  id="auto-discovery-enabled"
                  isChecked={autoDiscoveryEnabled}
                  onChange={(_event, checked) => setAutoDiscoveryEnabled(checked)}
                  label="Automatically discover and register new model deployments"
                  labelOff="Manually register model endpoints"
                />
              </FormGroup>

              <FormGroup label="Model Registry" fieldId="model-registry" isRequired>
                <Select
                  isOpen={modelRegistryOpen}
                  selected={modelRegistry}
                  onSelect={(event, selection) => {
                    setModelRegistry(selection as string);
                    setModelRegistryOpen(false);
                  }}
                  onOpenChange={(isOpen) => setModelRegistryOpen(isOpen)}
                  toggle={(toggleRef) => (
                    <MenuToggle
                      ref={toggleRef}
                      onClick={() => setModelRegistryOpen(!modelRegistryOpen)}
                      isExpanded={modelRegistryOpen}
                      isFullWidth
                    >
                      {modelRegistries.find(registry => registry.value === modelRegistry)?.label || "Select model registry"}
                    </MenuToggle>
                  )}
                >
                  <SelectList>
                    {modelRegistries.map(registry => (
                      <SelectOption key={registry.value} value={registry.value}>
                        {registry.label}
                      </SelectOption>
                    ))}
                  </SelectList>
                </Select>
              </FormGroup>

              <FormGroup label="Default Model Version" fieldId="default-model-version">
                <TextInput
                  id="default-model-version"
                  value={defaultModelVersion}
                  onChange={(_event, value) => setDefaultModelVersion(value)}
                  placeholder="latest, stable, v1.0.0"
                />
              </FormGroup>

              <FormGroup label="Health Check Interval (seconds)" fieldId="health-check-interval">
                <NumberInput
                  id="health-check-interval"
                  value={healthCheckInterval}
                  onMinus={() => setHealthCheckInterval(Math.max(10, healthCheckInterval - 10))}
                  onPlus={() => setHealthCheckInterval(healthCheckInterval + 10)}
                  onChange={(event) => {
                    const value = parseInt((event.target as HTMLInputElement).value) || 60;
                    setHealthCheckInterval(Math.max(10, value));
                  }}
                  min={10}
                  max={3600}
                  step={10}
                />
              </FormGroup>
            </Form>
          </CardBody>
        </Card>
      </StackItem>

      <StackItem>
        <Card>
          <CardTitle>Model Versioning & Deployment</CardTitle>
          <CardBody>
            <Form>
              <FormGroup label="Enable Model Versioning" fieldId="versioning-enabled">
                <Switch
                  id="versioning-enabled"
                  isChecked={versioningEnabled}
                  onChange={(_event, checked) => setVersioningEnabled(checked)}
                  label="Support multiple versions of the same model"
                  labelOff="Single version per model"
                />
              </FormGroup>

              <FormGroup label="Deployment Strategy" fieldId="deployment-strategy" isRequired>
                <Select
                  isOpen={deploymentStrategyOpen}
                  selected={deploymentStrategy}
                  onSelect={(event, selection) => {
                    setDeploymentStrategy(selection as string);
                    setDeploymentStrategyOpen(false);
                  }}
                  onOpenChange={(isOpen) => setDeploymentStrategyOpen(isOpen)}
                  toggle={(toggleRef) => (
                    <MenuToggle
                      ref={toggleRef}
                      onClick={() => setDeploymentStrategyOpen(!deploymentStrategyOpen)}
                      isExpanded={deploymentStrategyOpen}
                      isFullWidth
                    >
                      {deploymentStrategies.find(strategy => strategy.value === deploymentStrategy)?.label || "Select deployment strategy"}
                    </MenuToggle>
                  )}
                >
                  <SelectList>
                    {deploymentStrategies.map(strategy => (
                      <SelectOption
                        key={strategy.value}
                        value={strategy.value}
                        description={strategy.description}
                      >
                        {strategy.label}
                      </SelectOption>
                    ))}
                  </SelectList>
                </Select>
              </FormGroup>

              <FormGroup label="Enable Canary Deployments" fieldId="canary-deployment-enabled">
                <Switch
                  id="canary-deployment-enabled"
                  isChecked={canaryDeploymentEnabled}
                  onChange={(_event, checked) => setCanaryDeploymentEnabled(checked)}
                  label="Enable gradual rollout of new model versions"
                  labelOff="Full deployment of new versions"
                />
              </FormGroup>

              <FormGroup label="Enable Auto-Scaling" fieldId="auto-scaling-enabled">
                <Switch
                  id="auto-scaling-enabled"
                  isChecked={autoScalingEnabled}
                  onChange={(_event, checked) => setAutoScalingEnabled(checked)}
                  label="Automatically scale model instances based on demand"
                  labelOff="Fixed number of instances"
                />
              </FormGroup>

              {autoScalingEnabled && (
                <Grid hasGutter>
                  <GridItem span={6}>
                    <FormGroup label="Minimum Instances" fieldId="min-instances">
                      <NumberInput
                        id="min-instances"
                        value={minInstances}
                        onMinus={() => setMinInstances(Math.max(0, minInstances - 1))}
                        onPlus={() => setMinInstances(Math.min(maxInstances, minInstances + 1))}
                        onChange={(event) => {
                          const value = parseInt((event.target as HTMLInputElement).value) || 1;
                          setMinInstances(Math.max(0, Math.min(maxInstances, value)));
                        }}
                        min={0}
                        max={maxInstances}
                      />
                    </FormGroup>
                  </GridItem>
                  <GridItem span={6}>
                    <FormGroup label="Maximum Instances" fieldId="max-instances">
                      <NumberInput
                        id="max-instances"
                        value={maxInstances}
                        onMinus={() => setMaxInstances(Math.max(minInstances, maxInstances - 1))}
                        onPlus={() => setMaxInstances(maxInstances + 1)}
                        onChange={(event) => {
                          const value = parseInt((event.target as HTMLInputElement).value) || 10;
                          setMaxInstances(Math.max(minInstances, value));
                        }}
                        min={minInstances}
                        max={100}
                      />
                    </FormGroup>
                  </GridItem>
                </Grid>
              )}
            </Form>
          </CardBody>
        </Card>
      </StackItem>

      <StackItem>
        <Card>
          <CardTitle>Model Metadata & Configuration</CardTitle>
          <CardBody>
            <FormGroup 
              label="Global Model Configuration" 
              fieldId="model-metadata"
              helperText="Define global model settings, resource requirements, and deployment configurations in YAML format."
            >
              <TextArea
                id="model-metadata"
                value={modelMetadata}
                onChange={(_event, value) => setModelMetadata(value)}
                placeholder={`# Global model configuration
global_settings:
  timeout: 300s
  memory_limit: "8Gi"
  cpu_limit: "4"
  gpu_required: false

default_resources:
  requests:
    memory: "2Gi"
    cpu: "1"
  limits:
    memory: "8Gi"
    cpu: "4"

model_types:
  llm:
    default_timeout: 600s
    max_tokens: 4096
    temperature: 0.7
  vision:
    default_timeout: 120s
    max_image_size: "10MB"
  embedding:
    default_timeout: 60s
    batch_size: 32

deployment_config:
  readiness_probe:
    path: "/health"
    initial_delay: 30s
  liveness_probe:
    path: "/alive"
    period: 60s`}
                rows={25}
              />
            </FormGroup>
          </CardBody>
        </Card>
      </StackItem>

      <StackItem>
        <Card>
          <CardTitle>Registered Model Endpoints</CardTitle>
          <CardBody>
            <Stack hasGutter>
              <StackItem>
                <Flex>
                  <FlexItem grow={{ default: 'grow' }}>
                    <strong>Currently deployed models accessible through the API Gateway</strong>
                  </FlexItem>
                  <FlexItem>
                    <Button
                      variant="primary"
                      icon={<PlusCircleIcon />}
                      onClick={() => console.log('Add new model endpoint')}
                    >
                      Register New Model
                    </Button>
                  </FlexItem>
                </Flex>
              </StackItem>
              
              <StackItem>
                <Table aria-label="Model endpoints table">
                  <Thead>
                    <Tr>
                      <Th>Model Name</Th>
                      <Th>Version</Th>
                      <Th>Endpoint URL</Th>
                      <Th>Status</Th>
                      <Th>Instances</Th>
                      <Th>Last Updated</Th>
                      <Th></Th>
                    </Tr>
                  </Thead>
                  <Tbody>
                    {modelEndpoints.map(model => (
                      <Tr key={model.id}>
                        <Td dataLabel="Model Name">{model.name}</Td>
                        <Td dataLabel="Version">{model.version}</Td>
                        <Td dataLabel="Endpoint URL">
                          <Button variant="link" isInline component="a" href={model.endpoint} target="_blank">
                            {model.endpoint}
                          </Button>
                        </Td>
                        <Td dataLabel="Status">{getStatusBadge(model.status)}</Td>
                        <Td dataLabel="Instances">{model.instances}</Td>
                        <Td dataLabel="Last Updated">
                          {new Date(model.lastUpdated).toLocaleString()}
                        </Td>
                        <Td isActionCell>
                          <ActionsColumn items={modelActions(model)} />
                        </Td>
                      </Tr>
                    ))}
                  </Tbody>
                </Table>
              </StackItem>
            </Stack>
          </CardBody>
        </Card>
      </StackItem>

      <StackItem>
        <Flex>
          <FlexItem>
            <Button variant="primary">Save Configuration</Button>
          </FlexItem>
          <FlexItem>
            <Button variant="secondary">Sync with Registry</Button>
          </FlexItem>
          <FlexItem>
            <Button variant="link">Reset to Defaults</Button>
          </FlexItem>
        </Flex>
      </StackItem>
    </Stack>
  );
};

export default ModelManagementTab;