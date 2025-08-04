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
  SelectVariant,
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
  Slider,
  Progress,
  ProgressSize,
  ProgressMeasureLocation,
  Checkbox,
} from '@patternfly/react-core';
import { 
  CubeIcon, 
  TachometerAltIcon, 
  DatabaseIcon,
  ClockIcon 
} from '@patternfly/react-icons';

const ScalingTab: React.FC = () => {
  const [autoScalingEnabled, setAutoScalingEnabled] = React.useState(true);
  const [horizontalScalingEnabled, setHorizontalScalingEnabled] = React.useState(true);
  const [verticalScalingEnabled, setVerticalScalingEnabled] = React.useState(false);
  
  const [minReplicas, setMinReplicas] = React.useState(2);
  const [maxReplicas, setMaxReplicas] = React.useState(20);
  const [targetCpuUtilization, setTargetCpuUtilization] = React.useState(70);
  const [targetMemoryUtilization, setTargetMemoryUtilization] = React.useState(80);
  const [scaleUpCooldown, setScaleUpCooldown] = React.useState(300);
  const [scaleDownCooldown, setScaleDownCooldown] = React.useState(600);
  
  const [cachingEnabled, setCachingEnabled] = React.useState(true);
  const [cacheType, setCacheType] = React.useState('redis');
  const [cacheTypeOpen, setCacheTypeOpen] = React.useState(false);
  const [cacheTtl, setCacheTtl] = React.useState(3600);
  const [cacheSize, setCacheSize] = React.useState(1024);
  const [cacheEvictionPolicy, setCacheEvictionPolicy] = React.useState('lru');
  const [cacheEvictionPolicyOpen, setCacheEvictionPolicyOpen] = React.useState(false);
  
  const [compressionEnabled, setCompressionEnabled] = React.useState(true);
  const [compressionLevel, setCompressionLevel] = React.useState(6);
  const [connectionPoolingEnabled, setConnectionPoolingEnabled] = React.useState(true);
  const [maxConnections, setMaxConnections] = React.useState(1000);
  const [connectionTimeout, setConnectionTimeout] = React.useState(30);
  
  const [resourceLimits, setResourceLimits] = React.useState({
    cpuRequest: '500m',
    cpuLimit: '2',
    memoryRequest: '1Gi',
    memoryLimit: '4Gi',
    gpuLimit: '0'
  });
  
  const [performanceTuning, setPerformanceTuning] = React.useState('');
  const [preemptiveScaling, setPreemptiveScaling] = React.useState(false);
  const [burstingEnabled, setBurstingEnabled] = React.useState(true);
  const [loadSheddingEnabled, setLoadSheddingEnabled] = React.useState(true);
  const [loadSheddingThreshold, setLoadSheddingThreshold] = React.useState(95);

  const cacheTypes = [
    { value: 'redis', label: 'Redis', description: 'In-memory data structure store' },
    { value: 'memcached', label: 'Memcached', description: 'High-performance distributed memory caching' },
    { value: 'hazelcast', label: 'Hazelcast', description: 'Distributed in-memory computing platform' },
    { value: 'local', label: 'Local Cache', description: 'In-process caching for single instances' },
  ];

  const evictionPolicies = [
    { value: 'lru', label: 'LRU (Least Recently Used)' },
    { value: 'lfu', label: 'LFU (Least Frequently Used)' },
    { value: 'fifo', label: 'FIFO (First In, First Out)' },
    { value: 'random', label: 'Random' },
  ];

  const updateResourceLimit = (key: string, value: string) => {
    setResourceLimits({ ...resourceLimits, [key]: value });
  };

  return (
    <Stack hasGutter>
      <StackItem>
        <Alert variant="info" title="Scaling & Performance Configuration">
          Configure auto-scaling policies, performance optimization, caching strategies, and resource management 
          for the API Gateway to handle varying loads efficiently.
        </Alert>
      </StackItem>

      <StackItem>
        <Card>
          <CardTitle>Auto-Scaling Configuration</CardTitle>
          <CardBody>
            <Form>
              <FormGroup label="Enable Auto-Scaling" fieldId="auto-scaling-enabled">
                <Switch
                  id="auto-scaling-enabled"
                  isChecked={autoScalingEnabled}
                  onChange={(_event, checked) => setAutoScalingEnabled(checked)}
                  label="Automatically scale API Gateway instances based on demand"
                  labelOff="Use fixed number of instances"
                />
              </FormGroup>

              {autoScalingEnabled && (
                <>
                  <Grid hasGutter>
                    <GridItem span={6}>
                      <FormGroup label="Enable Horizontal Scaling" fieldId="horizontal-scaling-enabled">
                        <Switch
                          id="horizontal-scaling-enabled"
                          isChecked={horizontalScalingEnabled}
                          onChange={(_event, checked) => setHorizontalScalingEnabled(checked)}
                          label="Scale by adding/removing instances"
                        />
                      </FormGroup>
                    </GridItem>
                    <GridItem span={6}>
                      <FormGroup label="Enable Vertical Scaling" fieldId="vertical-scaling-enabled">
                        <Switch
                          id="vertical-scaling-enabled"
                          isChecked={verticalScalingEnabled}
                          onChange={(_event, checked) => setVerticalScalingEnabled(checked)}
                          label="Scale by adjusting instance resources"
                        />
                      </FormGroup>
                    </GridItem>
                  </Grid>

                  {horizontalScalingEnabled && (
                    <>
                      <Grid hasGutter>
                        <GridItem span={6}>
                          <FormGroup label="Minimum Replicas" fieldId="min-replicas">
                            <NumberInput
                              id="min-replicas"
                              value={minReplicas}
                              onMinus={() => setMinReplicas(Math.max(1, minReplicas - 1))}
                              onPlus={() => setMinReplicas(Math.min(maxReplicas, minReplicas + 1))}
                              onChange={(event) => {
                                const value = parseInt((event.target as HTMLInputElement).value) || 2;
                                setMinReplicas(Math.max(1, Math.min(maxReplicas, value)));
                              }}
                              min={1}
                              max={maxReplicas}
                            />
                          </FormGroup>
                        </GridItem>
                        <GridItem span={6}>
                          <FormGroup label="Maximum Replicas" fieldId="max-replicas">
                            <NumberInput
                              id="max-replicas"
                              value={maxReplicas}
                              onMinus={() => setMaxReplicas(Math.max(minReplicas, maxReplicas - 1))}
                              onPlus={() => setMaxReplicas(maxReplicas + 1)}
                              onChange={(event) => {
                                const value = parseInt((event.target as HTMLInputElement).value) || 20;
                                setMaxReplicas(Math.max(minReplicas, value));
                              }}
                              min={minReplicas}
                              max={100}
                            />
                          </FormGroup>
                        </GridItem>
                      </Grid>

                      <Grid hasGutter>
                        <GridItem span={6}>
                          <FormGroup 
                            label={`Target CPU Utilization: ${targetCpuUtilization}%`}
                            fieldId="target-cpu-utilization"
                          >
                            <Slider
                              value={targetCpuUtilization}
                              onChange={(value) => setTargetCpuUtilization(value)}
                              min={10}
                              max={100}
                              step={5}
                              showTicks
                              showBoundaries
                            />
                          </FormGroup>
                        </GridItem>
                        <GridItem span={6}>
                          <FormGroup 
                            label={`Target Memory Utilization: ${targetMemoryUtilization}%`}
                            fieldId="target-memory-utilization"
                          >
                            <Slider
                              value={targetMemoryUtilization}
                              onChange={(value) => setTargetMemoryUtilization(value)}
                              min={10}
                              max={100}
                              step={5}
                              showTicks
                              showBoundaries
                            />
                          </FormGroup>
                        </GridItem>
                      </Grid>

                      <Grid hasGutter>
                        <GridItem span={6}>
                          <FormGroup 
                            label="Scale-up Cooldown (seconds)" 
                            fieldId="scale-up-cooldown"
                            helperText="Minimum time between scale-up events"
                          >
                            <NumberInput
                              id="scale-up-cooldown"
                              value={scaleUpCooldown}
                              onMinus={() => setScaleUpCooldown(Math.max(60, scaleUpCooldown - 30))}
                              onPlus={() => setScaleUpCooldown(scaleUpCooldown + 30)}
                              onChange={(event) => {
                                const value = parseInt((event.target as HTMLInputElement).value) || 300;
                                setScaleUpCooldown(Math.max(60, value));
                              }}
                              min={60}
                              step={30}
                            />
                          </FormGroup>
                        </GridItem>
                        <GridItem span={6}>
                          <FormGroup 
                            label="Scale-down Cooldown (seconds)" 
                            fieldId="scale-down-cooldown"
                            helperText="Minimum time between scale-down events"
                          >
                            <NumberInput
                              id="scale-down-cooldown"
                              value={scaleDownCooldown}
                              onMinus={() => setScaleDownCooldown(Math.max(60, scaleDownCooldown - 30))}
                              onPlus={() => setScaleDownCooldown(scaleDownCooldown + 30)}
                              onChange={(event) => {
                                const value = parseInt((event.target as HTMLInputElement).value) || 600;
                                setScaleDownCooldown(Math.max(60, value));
                              }}
                              min={60}
                              step={30}
                            />
                          </FormGroup>
                        </GridItem>
                      </Grid>
                    </>
                  )}

                  <FormGroup label="Enable Preemptive Scaling" fieldId="preemptive-scaling">
                    <Switch
                      id="preemptive-scaling"
                      isChecked={preemptiveScaling}
                      onChange={(_event, checked) => setPreemptiveScaling(checked)}
                      label="Scale proactively based on predicted load patterns"
                      labelOff="Scale reactively based on current metrics"
                    />
                  </FormGroup>
                </>
              )}
            </Form>
          </CardBody>
        </Card>
      </StackItem>

      <StackItem>
        <Card>
          <CardTitle>Resource Limits & Allocation</CardTitle>
          <CardBody>
            <Form>
              <Grid hasGutter>
                <GridItem span={6}>
                  <FormGroup label="CPU Request" fieldId="cpu-request">
                    <TextInput
                      id="cpu-request"
                      value={resourceLimits.cpuRequest}
                      onChange={(_event, value) => updateResourceLimit('cpuRequest', value)}
                      placeholder="500m"
                    />
                  </FormGroup>
                </GridItem>
                <GridItem span={6}>
                  <FormGroup label="CPU Limit" fieldId="cpu-limit">
                    <TextInput
                      id="cpu-limit"
                      value={resourceLimits.cpuLimit}
                      onChange={(_event, value) => updateResourceLimit('cpuLimit', value)}
                      placeholder="2"
                    />
                  </FormGroup>
                </GridItem>
                <GridItem span={6}>
                  <FormGroup label="Memory Request" fieldId="memory-request">
                    <TextInput
                      id="memory-request"
                      value={resourceLimits.memoryRequest}
                      onChange={(_event, value) => updateResourceLimit('memoryRequest', value)}
                      placeholder="1Gi"
                    />
                  </FormGroup>
                </GridItem>
                <GridItem span={6}>
                  <FormGroup label="Memory Limit" fieldId="memory-limit">
                    <TextInput
                      id="memory-limit"
                      value={resourceLimits.memoryLimit}
                      onChange={(_event, value) => updateResourceLimit('memoryLimit', value)}
                      placeholder="4Gi"
                    />
                  </FormGroup>
                </GridItem>
                <GridItem span={6}>
                  <FormGroup label="GPU Limit" fieldId="gpu-limit">
                    <TextInput
                      id="gpu-limit"
                      value={resourceLimits.gpuLimit}
                      onChange={(_event, value) => updateResourceLimit('gpuLimit', value)}
                      placeholder="0"
                    />
                  </FormGroup>
                </GridItem>
              </Grid>
            </Form>
          </CardBody>
        </Card>
      </StackItem>

      <StackItem>
        <Card>
          <CardTitle>Caching Configuration</CardTitle>
          <CardBody>
            <Form>
              <FormGroup label="Enable Response Caching" fieldId="caching-enabled">
                <Switch
                  id="caching-enabled"
                  isChecked={cachingEnabled}
                  onChange={(_event, checked) => setCachingEnabled(checked)}
                  label="Cache API responses to improve performance"
                  labelOff="Disable response caching"
                />
              </FormGroup>

              {cachingEnabled && (
                <>
                  <Grid hasGutter>
                    <GridItem span={6}>
                      <FormGroup label="Cache Type" fieldId="cache-type" isRequired>
                        <Select
                          variant={SelectVariant.single}
                          onToggle={(event, isExpanded) => setCacheTypeOpen(isExpanded)}
                          onSelect={(event, selection) => {
                            setCacheType(selection as string);
                            setCacheTypeOpen(false);
                          }}
                          selections={cacheType}
                          isOpen={cacheTypeOpen}
                          placeholderText="Select cache type"
                        >
                          {cacheTypes.map(type => (
                            <SelectOption
                              key={type.value}
                              value={type.value}
                              description={type.description}
                            >
                              {type.label}
                            </SelectOption>
                          ))}
                        </Select>
                      </FormGroup>
                    </GridItem>
                    <GridItem span={6}>
                      <FormGroup label="Cache Eviction Policy" fieldId="cache-eviction-policy">
                        <Select
                          variant={SelectVariant.single}
                          onToggle={(event, isExpanded) => setCacheEvictionPolicyOpen(isExpanded)}
                          onSelect={(event, selection) => {
                            setCacheEvictionPolicy(selection as string);
                            setCacheEvictionPolicyOpen(false);
                          }}
                          selections={cacheEvictionPolicy}
                          isOpen={cacheEvictionPolicyOpen}
                        >
                          {evictionPolicies.map(policy => (
                            <SelectOption key={policy.value} value={policy.value}>
                              {policy.label}
                            </SelectOption>
                          ))}
                        </Select>
                      </FormGroup>
                    </GridItem>
                  </Grid>

                  <Grid hasGutter>
                    <GridItem span={4}>
                      <FormGroup 
                        label="Cache TTL (seconds)" 
                        fieldId="cache-ttl"
                        helperText="Time to live for cached responses"
                      >
                        <NumberInput
                          id="cache-ttl"
                          value={cacheTtl}
                          onMinus={() => setCacheTtl(Math.max(60, cacheTtl - 300))}
                          onPlus={() => setCacheTtl(cacheTtl + 300)}
                          onChange={(event) => {
                            const value = parseInt((event.target as HTMLInputElement).value) || 3600;
                            setCacheTtl(Math.max(60, value));
                          }}
                          min={60}
                          step={300}
                        />
                      </FormGroup>
                    </GridItem>
                    <GridItem span={4}>
                      <FormGroup 
                        label="Cache Size (MB)" 
                        fieldId="cache-size"
                        helperText="Maximum cache size"
                      >
                        <NumberInput
                          id="cache-size"
                          value={cacheSize}
                          onMinus={() => setCacheSize(Math.max(128, cacheSize - 128))}
                          onPlus={() => setCacheSize(cacheSize + 128)}
                          onChange={(event) => {
                            const value = parseInt((event.target as HTMLInputElement).value) || 1024;
                            setCacheSize(Math.max(128, value));
                          }}
                          min={128}
                          step={128}
                        />
                      </FormGroup>
                    </GridItem>
                    <GridItem span={4}>
                      <FormGroup label="Cache Hit Rate">
                        <Progress
                          value={87}
                          title="87%"
                          size={ProgressSize.lg}
                          measureLocation={ProgressMeasureLocation.top}
                        />
                      </FormGroup>
                    </GridItem>
                  </Grid>

                  <FormGroup label="Cache Strategies" fieldId="cache-strategies">
                    <Stack hasGutter>
                      <StackItem>
                        <Checkbox id="cache-get" label="Cache GET requests" defaultChecked />
                      </StackItem>
                      <StackItem>
                        <Checkbox id="cache-post" label="Cache POST requests (for idempotent operations)" />
                      </StackItem>
                      <StackItem>
                        <Checkbox id="cache-model-responses" label="Cache model inference responses" defaultChecked />
                      </StackItem>
                      <StackItem>
                        <Checkbox id="cache-metadata" label="Cache model metadata and schema" defaultChecked />
                      </StackItem>
                    </Stack>
                  </FormGroup>
                </>
              )}
            </Form>
          </CardBody>
        </Card>
      </StackItem>

      <StackItem>
        <Card>
          <CardTitle>Connection & Performance Optimization</CardTitle>
          <CardBody>
            <Form>
              <FormGroup label="Enable Connection Pooling" fieldId="connection-pooling-enabled">
                <Switch
                  id="connection-pooling-enabled"
                  isChecked={connectionPoolingEnabled}
                  onChange={(_event, checked) => setConnectionPoolingEnabled(checked)}
                  label="Use connection pools for backend model services"
                  labelOff="Create new connections for each request"
                />
              </FormGroup>

              {connectionPoolingEnabled && (
                <Grid hasGutter>
                  <GridItem span={6}>
                    <FormGroup label="Maximum Connections" fieldId="max-connections">
                      <NumberInput
                        id="max-connections"
                        value={maxConnections}
                        onMinus={() => setMaxConnections(Math.max(10, maxConnections - 50))}
                        onPlus={() => setMaxConnections(maxConnections + 50)}
                        onChange={(event) => {
                          const value = parseInt((event.target as HTMLInputElement).value) || 1000;
                          setMaxConnections(Math.max(10, value));
                        }}
                        min={10}
                        step={50}
                      />
                    </FormGroup>
                  </GridItem>
                  <GridItem span={6}>
                    <FormGroup label="Connection Timeout (seconds)" fieldId="connection-timeout">
                      <NumberInput
                        id="connection-timeout"
                        value={connectionTimeout}
                        onMinus={() => setConnectionTimeout(Math.max(5, connectionTimeout - 5))}
                        onPlus={() => setConnectionTimeout(connectionTimeout + 5)}
                        onChange={(event) => {
                          const value = parseInt((event.target as HTMLInputElement).value) || 30;
                          setConnectionTimeout(Math.max(5, value));
                        }}
                        min={5}
                        step={5}
                      />
                    </FormGroup>
                  </GridItem>
                </Grid>
              )}

              <FormGroup label="Enable Compression" fieldId="compression-enabled">
                <Switch
                  id="compression-enabled"
                  isChecked={compressionEnabled}
                  onChange={(_event, checked) => setCompressionEnabled(checked)}
                  label="Compress API responses to reduce bandwidth"
                  labelOff="Send uncompressed responses"
                />
              </FormGroup>

              {compressionEnabled && (
                <FormGroup 
                  label={`Compression Level: ${compressionLevel}`}
                  fieldId="compression-level"
                  helperText="Higher levels provide better compression but use more CPU"
                >
                  <Slider
                    value={compressionLevel}
                    onChange={(value) => setCompressionLevel(value)}
                    min={1}
                    max={9}
                    step={1}
                    showTicks
                    showBoundaries
                  />
                </FormGroup>
              )}
            </Form>
          </CardBody>
        </Card>
      </StackItem>

      <StackItem>
        <Card>
          <CardTitle>Load Management</CardTitle>
          <CardBody>
            <Form>
              <FormGroup label="Enable Request Bursting" fieldId="bursting-enabled">
                <Switch
                  id="bursting-enabled"
                  isChecked={burstingEnabled}
                  onChange={(_event, checked) => setBurstingEnabled(checked)}
                  label="Allow temporary bursts above normal rate limits"
                  labelOff="Enforce strict rate limits"
                />
              </FormGroup>

              <FormGroup label="Enable Load Shedding" fieldId="load-shedding-enabled">
                <Switch
                  id="load-shedding-enabled"
                  isChecked={loadSheddingEnabled}
                  onChange={(_event, checked) => setLoadSheddingEnabled(checked)}
                  label="Drop requests when system is overloaded"
                  labelOff="Process all requests regardless of load"
                />
              </FormGroup>

              {loadSheddingEnabled && (
                <FormGroup 
                  label={`Load Shedding Threshold: ${loadSheddingThreshold}%`}
                  fieldId="load-shedding-threshold"
                  helperText="CPU utilization threshold for dropping requests"
                >
                  <Slider
                    value={loadSheddingThreshold}
                    onChange={(value) => setLoadSheddingThreshold(value)}
                    min={50}
                    max={100}
                    step={5}
                    showTicks
                    showBoundaries
                  />
                </FormGroup>
              )}
            </Form>
          </CardBody>
        </Card>
      </StackItem>

      <StackItem>
        <Card>
          <CardTitle>Advanced Performance Tuning</CardTitle>
          <CardBody>
            <FormGroup 
              label="Custom Performance Configuration" 
              fieldId="performance-tuning"
              helperText="Advanced performance tuning parameters in YAML format"
            >
              <TextArea
                id="performance-tuning"
                value={performanceTuning}
                onChange={(_event, value) => setPerformanceTuning(value)}
                placeholder={`# Advanced performance configuration
performance:
  worker_processes: auto
  worker_connections: 1024
  keepalive_timeout: 65
  client_max_body_size: "50MB"
  
  # Gateway-specific optimizations
  proxy_buffering: true
  proxy_buffer_size: "64k"
  proxy_buffers: "8 64k"
  proxy_busy_buffers_size: "128k"
  
  # Model inference optimizations
  model_timeout: 300s
  batch_processing:
    enabled: true
    max_batch_size: 32
    timeout: 100ms
  
  # Memory management
  memory_optimization:
    enable_zero_copy: true
    buffer_recycling: true
    gc_tuning:
      max_heap_size: "2g"
      new_ratio: 3
      
  # Network optimizations
  tcp_nodelay: true
  tcp_keepalive: true
  sendfile: true
  
  # Thread pool configuration
  thread_pools:
    inference: 
      threads: 16
      queue_size: 1000
    io:
      threads: 8
      queue_size: 500`}
                rows={25}
              />
            </FormGroup>
          </CardBody>
        </Card>
      </StackItem>

      <StackItem>
        <Grid hasGutter>
          <GridItem span={3}>
            <Card isCompact>
              <CardBody>
                <Flex direction={{ default: 'column' }} spaceItems={{ default: 'spaceItemsSm' }}>
                  <FlexItem>
                    <CubeIcon size="lg" />
                  </FlexItem>
                  <FlexItem>
                    <strong>Current Replicas</strong>
                  </FlexItem>
                  <FlexItem>
                    <span style={{ fontSize: '1.5rem', fontWeight: 'bold' }}>5</span>
                  </FlexItem>
                </Flex>
              </CardBody>
            </Card>
          </GridItem>
          <GridItem span={3}>
            <Card isCompact>
              <CardBody>
                <Flex direction={{ default: 'column' }} spaceItems={{ default: 'spaceItemsSm' }}>
                  <FlexItem>
                    <TachometerAltIcon size="lg" />
                  </FlexItem>
                  <FlexItem>
                    <strong>CPU Usage</strong>
                  </FlexItem>
                  <FlexItem>
                    <Progress value={68} size={ProgressSize.sm} title="68%" />
                  </FlexItem>
                </Flex>
              </CardBody>
            </Card>
          </GridItem>
          <GridItem span={3}>
            <Card isCompact>
              <CardBody>
                <Flex direction={{ default: 'column' }} spaceItems={{ default: 'spaceItemsSm' }}>
                  <FlexItem>
                    <DatabaseIcon size="lg" />
                  </FlexItem>
                  <FlexItem>
                    <strong>Memory Usage</strong>
                  </FlexItem>
                  <FlexItem>
                    <Progress value={74} size={ProgressSize.sm} title="74%" />
                  </FlexItem>
                </Flex>
              </CardBody>
            </Card>
          </GridItem>
          <GridItem span={3}>
            <Card isCompact>
              <CardBody>
                <Flex direction={{ default: 'column' }} spaceItems={{ default: 'spaceItemsSm' }}>
                  <FlexItem>
                    <ClockIcon size="lg" />
                  </FlexItem>
                  <FlexItem>
                    <strong>Avg Response Time</strong>
                  </FlexItem>
                  <FlexItem>
                    <span style={{ fontSize: '1.5rem', fontWeight: 'bold' }}>245ms</span>
                  </FlexItem>
                </Flex>
              </CardBody>
            </Card>
          </GridItem>
        </Grid>
      </StackItem>

      <StackItem>
        <Flex>
          <FlexItem>
            <Button variant="primary">Save Configuration</Button>
          </FlexItem>
          <FlexItem>
            <Button variant="secondary">Test Scaling Policy</Button>
          </FlexItem>
          <FlexItem>
            <Button variant="tertiary">View Performance Metrics</Button>
          </FlexItem>
          <FlexItem>
            <Button variant="link">Reset to Defaults</Button>
          </FlexItem>
        </Flex>
      </StackItem>
    </Stack>
  );
};

export default ScalingTab;