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
  Slider,
  TextArea,
} from '@patternfly/react-core';

const RequestRoutingTab: React.FC = () => {
  const [loadBalancingEnabled, setLoadBalancingEnabled] = React.useState(true);
  const [loadBalanceMethod, setLoadBalanceMethod] = React.useState('round-robin');
  const [loadBalanceMethodOpen, setLoadBalanceMethodOpen] = React.useState(false);
  const [healthCheckEnabled, setHealthCheckEnabled] = React.useState(true);
  const [healthCheckInterval, setHealthCheckInterval] = React.useState(30);
  const [healthCheckTimeout, setHealthCheckTimeout] = React.useState(5);
  const [healthCheckPath, setHealthCheckPath] = React.useState('/health');
  
  const [retryEnabled, setRetryEnabled] = React.useState(true);
  const [maxRetries, setMaxRetries] = React.useState(3);
  const [retryDelay, setRetryDelay] = React.useState(1000);
  const [retryBackoff, setRetryBackoff] = React.useState('exponential');
  const [retryBackoffOpen, setRetryBackoffOpen] = React.useState(false);
  
  const [rateLimitingEnabled, setRateLimitingEnabled] = React.useState(true);
  const [globalRateLimit, setGlobalRateLimit] = React.useState(1000);
  const [perUserRateLimit, setPerUserRateLimit] = React.useState(100);
  const [rateLimitWindow, setRateLimitWindow] = React.useState(60);
  
  const [timeoutSettings, setTimeoutSettings] = React.useState({
    connectionTimeout: 30,
    requestTimeout: 300,
    idleTimeout: 60,
  });
  
  const [circuitBreakerEnabled, setCircuitBreakerEnabled] = React.useState(true);
  const [failureThreshold, setFailureThreshold] = React.useState(5);
  const [recoveryTimeout, setRecoveryTimeout] = React.useState(30);
  
  const [customRoutes, setCustomRoutes] = React.useState('');

  const loadBalanceMethods = [
    { value: 'round-robin', label: 'Round Robin', description: 'Distribute requests evenly across endpoints' },
    { value: 'weighted', label: 'Weighted Round Robin', description: 'Route based on endpoint weights' },
    { value: 'least-connections', label: 'Least Connections', description: 'Route to endpoint with fewest active connections' },
    { value: 'ip-hash', label: 'IP Hash', description: 'Route based on client IP hash for session affinity' },
    { value: 'random', label: 'Random', description: 'Randomly select endpoints' },
  ];

  const retryBackoffMethods = [
    { value: 'exponential', label: 'Exponential Backoff' },
    { value: 'linear', label: 'Linear Backoff' },
    { value: 'fixed', label: 'Fixed Delay' },
  ];

  return (
    <Stack hasGutter>
      <StackItem>
        <Alert variant="info" title="Request Routing Configuration">
          Configure how API requests are routed to model endpoints, including load balancing, 
          retry policies, rate limiting, and failover mechanisms.
        </Alert>
      </StackItem>

      <StackItem>
        <Card>
          <CardTitle>Load Balancing</CardTitle>
          <CardBody>
            <Form>
              <FormGroup label="Enable Load Balancing" fieldId="lb-enabled">
                <Switch
                  id="lb-enabled"
                  isChecked={loadBalancingEnabled}
                  onChange={(_event, checked) => setLoadBalancingEnabled(checked)}
                  label="Distribute requests across multiple model endpoints"
                  labelOff="Route to single endpoint"
                />
              </FormGroup>

              {loadBalancingEnabled && (
                <>
                  <FormGroup label="Load Balancing Method" fieldId="lb-method" isRequired>
                    <Select
                      variant={SelectVariant.single}
                      onToggle={(event, isExpanded) => setLoadBalanceMethodOpen(isExpanded)}
                      onSelect={(event, selection) => {
                        setLoadBalanceMethod(selection as string);
                        setLoadBalanceMethodOpen(false);
                      }}
                      selections={loadBalanceMethod}
                      isOpen={loadBalanceMethodOpen}
                      placeholderText="Select load balancing method"
                    >
                      {loadBalanceMethods.map(method => (
                        <SelectOption
                          key={method.value}
                          value={method.value}
                          description={method.description}
                        >
                          {method.label}
                        </SelectOption>
                      ))}
                    </Select>
                  </FormGroup>

                  <FormGroup label="Enable Health Checks" fieldId="health-check-enabled">
                    <Switch
                      id="health-check-enabled"
                      isChecked={healthCheckEnabled}
                      onChange={(_event, checked) => setHealthCheckEnabled(checked)}
                      label="Monitor endpoint health for routing decisions"
                      labelOff="Route to all endpoints regardless of health"
                    />
                  </FormGroup>

                  {healthCheckEnabled && (
                    <>
                      <Grid hasGutter>
                        <GridItem span={4}>
                          <FormGroup label="Health Check Interval (seconds)" fieldId="health-check-interval">
                            <NumberInput
                              id="health-check-interval"
                              value={healthCheckInterval}
                              onMinus={() => setHealthCheckInterval(Math.max(1, healthCheckInterval - 1))}
                              onPlus={() => setHealthCheckInterval(healthCheckInterval + 1)}
                              onChange={(event) => {
                                const value = parseInt((event.target as HTMLInputElement).value) || 30;
                                setHealthCheckInterval(Math.max(1, value));
                              }}
                              min={1}
                              max={300}
                            />
                          </FormGroup>
                        </GridItem>
                        <GridItem span={4}>
                          <FormGroup label="Health Check Timeout (seconds)" fieldId="health-check-timeout">
                            <NumberInput
                              id="health-check-timeout"
                              value={healthCheckTimeout}
                              onMinus={() => setHealthCheckTimeout(Math.max(1, healthCheckTimeout - 1))}
                              onPlus={() => setHealthCheckTimeout(healthCheckTimeout + 1)}
                              onChange={(event) => {
                                const value = parseInt((event.target as HTMLInputElement).value) || 5;
                                setHealthCheckTimeout(Math.max(1, value));
                              }}
                              min={1}
                              max={60}
                            />
                          </FormGroup>
                        </GridItem>
                        <GridItem span={4}>
                          <FormGroup label="Health Check Path" fieldId="health-check-path">
                            <TextInput
                              id="health-check-path"
                              value={healthCheckPath}
                              onChange={(_event, value) => setHealthCheckPath(value)}
                              placeholder="/health"
                            />
                          </FormGroup>
                        </GridItem>
                      </Grid>
                    </>
                  )}
                </>
              )}
            </Form>
          </CardBody>
        </Card>
      </StackItem>

      <StackItem>
        <Card>
          <CardTitle>Retry Policies</CardTitle>
          <CardBody>
            <Form>
              <FormGroup label="Enable Request Retries" fieldId="retry-enabled">
                <Switch
                  id="retry-enabled"
                  isChecked={retryEnabled}
                  onChange={(_event, checked) => setRetryEnabled(checked)}
                  label="Automatically retry failed requests"
                  labelOff="Do not retry failed requests"
                />
              </FormGroup>

              {retryEnabled && (
                <Grid hasGutter>
                  <GridItem span={4}>
                    <FormGroup label="Maximum Retries" fieldId="max-retries">
                      <NumberInput
                        id="max-retries"
                        value={maxRetries}
                        onMinus={() => setMaxRetries(Math.max(0, maxRetries - 1))}
                        onPlus={() => setMaxRetries(Math.min(10, maxRetries + 1))}
                        onChange={(event) => {
                          const value = parseInt((event.target as HTMLInputElement).value) || 3;
                          setMaxRetries(Math.max(0, Math.min(10, value)));
                        }}
                        min={0}
                        max={10}
                      />
                    </FormGroup>
                  </GridItem>
                  <GridItem span={4}>
                    <FormGroup label="Initial Retry Delay (ms)" fieldId="retry-delay">
                      <NumberInput
                        id="retry-delay"
                        value={retryDelay}
                        onMinus={() => setRetryDelay(Math.max(100, retryDelay - 100))}
                        onPlus={() => setRetryDelay(retryDelay + 100)}
                        onChange={(event) => {
                          const value = parseInt((event.target as HTMLInputElement).value) || 1000;
                          setRetryDelay(Math.max(100, value));
                        }}
                        min={100}
                        step={100}
                      />
                    </FormGroup>
                  </GridItem>
                  <GridItem span={4}>
                    <FormGroup label="Backoff Strategy" fieldId="retry-backoff">
                      <Select
                        variant={SelectVariant.single}
                        onToggle={(event, isExpanded) => setRetryBackoffOpen(isExpanded)}
                        onSelect={(event, selection) => {
                          setRetryBackoff(selection as string);
                          setRetryBackoffOpen(false);
                        }}
                        selections={retryBackoff}
                        isOpen={retryBackoffOpen}
                      >
                        {retryBackoffMethods.map(method => (
                          <SelectOption key={method.value} value={method.value}>
                            {method.label}
                          </SelectOption>
                        ))}
                      </Select>
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
          <CardTitle>Rate Limiting</CardTitle>
          <CardBody>
            <Form>
              <FormGroup label="Enable Rate Limiting" fieldId="rate-limit-enabled">
                <Switch
                  id="rate-limit-enabled"
                  isChecked={rateLimitingEnabled}
                  onChange={(_event, checked) => setRateLimitingEnabled(checked)}
                  label="Limit request rates to protect model endpoints"
                  labelOff="Allow unlimited request rates"
                />
              </FormGroup>

              {rateLimitingEnabled && (
                <Grid hasGutter>
                  <GridItem span={4}>
                    <FormGroup 
                      label="Global Rate Limit (requests/window)" 
                      fieldId="global-rate-limit"
                      helperText="Total requests allowed across all users"
                    >
                      <NumberInput
                        id="global-rate-limit"
                        value={globalRateLimit}
                        onMinus={() => setGlobalRateLimit(Math.max(1, globalRateLimit - 100))}
                        onPlus={() => setGlobalRateLimit(globalRateLimit + 100)}
                        onChange={(event) => {
                          const value = parseInt((event.target as HTMLInputElement).value) || 1000;
                          setGlobalRateLimit(Math.max(1, value));
                        }}
                        min={1}
                        step={100}
                      />
                    </FormGroup>
                  </GridItem>
                  <GridItem span={4}>
                    <FormGroup 
                      label="Per-User Rate Limit (requests/window)" 
                      fieldId="per-user-rate-limit"
                      helperText="Requests allowed per individual user"
                    >
                      <NumberInput
                        id="per-user-rate-limit"
                        value={perUserRateLimit}
                        onMinus={() => setPerUserRateLimit(Math.max(1, perUserRateLimit - 10))}
                        onPlus={() => setPerUserRateLimit(perUserRateLimit + 10)}
                        onChange={(event) => {
                          const value = parseInt((event.target as HTMLInputElement).value) || 100;
                          setPerUserRateLimit(Math.max(1, value));
                        }}
                        min={1}
                        step={10}
                      />
                    </FormGroup>
                  </GridItem>
                  <GridItem span={4}>
                    <FormGroup 
                      label="Rate Limit Window (seconds)" 
                      fieldId="rate-limit-window"
                      helperText="Time window for rate limit calculations"
                    >
                      <NumberInput
                        id="rate-limit-window"
                        value={rateLimitWindow}
                        onMinus={() => setRateLimitWindow(Math.max(1, rateLimitWindow - 10))}
                        onPlus={() => setRateLimitWindow(rateLimitWindow + 10)}
                        onChange={(event) => {
                          const value = parseInt((event.target as HTMLInputElement).value) || 60;
                          setRateLimitWindow(Math.max(1, value));
                        }}
                        min={1}
                        step={10}
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
          <CardTitle>Timeout Settings</CardTitle>
          <CardBody>
            <Form>
              <Grid hasGutter>
                <GridItem span={4}>
                  <FormGroup 
                    label="Connection Timeout (seconds)" 
                    fieldId="connection-timeout"
                    helperText="Time to wait for connection establishment"
                  >
                    <Slider
                      value={timeoutSettings.connectionTimeout}
                      onChange={(value) => setTimeoutSettings({...timeoutSettings, connectionTimeout: value})}
                      min={1}
                      max={120}
                      step={1}
                      showTicks
                      showBoundaries
                    />
                  </FormGroup>
                </GridItem>
                <GridItem span={4}>
                  <FormGroup 
                    label="Request Timeout (seconds)" 
                    fieldId="request-timeout"
                    helperText="Maximum time to wait for model response"
                  >
                    <Slider
                      value={timeoutSettings.requestTimeout}
                      onChange={(value) => setTimeoutSettings({...timeoutSettings, requestTimeout: value})}
                      min={1}
                      max={600}
                      step={5}
                      showTicks
                      showBoundaries
                    />
                  </FormGroup>
                </GridItem>
                <GridItem span={4}>
                  <FormGroup 
                    label="Idle Timeout (seconds)" 
                    fieldId="idle-timeout"
                    helperText="Time to keep idle connections open"
                  >
                    <Slider
                      value={timeoutSettings.idleTimeout}
                      onChange={(value) => setTimeoutSettings({...timeoutSettings, idleTimeout: value})}
                      min={1}
                      max={300}
                      step={1}
                      showTicks
                      showBoundaries
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
          <CardTitle>Circuit Breaker</CardTitle>
          <CardBody>
            <Form>
              <FormGroup label="Enable Circuit Breaker" fieldId="circuit-breaker-enabled">
                <Switch
                  id="circuit-breaker-enabled"
                  isChecked={circuitBreakerEnabled}
                  onChange={(_event, checked) => setCircuitBreakerEnabled(checked)}
                  label="Automatically stop routing to failing endpoints"
                  labelOff="Continue routing to all endpoints"
                />
              </FormGroup>

              {circuitBreakerEnabled && (
                <Grid hasGutter>
                  <GridItem span={6}>
                    <FormGroup 
                      label="Failure Threshold" 
                      fieldId="failure-threshold"
                      helperText="Number of consecutive failures before opening circuit"
                    >
                      <NumberInput
                        id="failure-threshold"
                        value={failureThreshold}
                        onMinus={() => setFailureThreshold(Math.max(1, failureThreshold - 1))}
                        onPlus={() => setFailureThreshold(failureThreshold + 1)}
                        onChange={(event) => {
                          const value = parseInt((event.target as HTMLInputElement).value) || 5;
                          setFailureThreshold(Math.max(1, value));
                        }}
                        min={1}
                        max={20}
                      />
                    </FormGroup>
                  </GridItem>
                  <GridItem span={6}>
                    <FormGroup 
                      label="Recovery Timeout (seconds)" 
                      fieldId="recovery-timeout"
                      helperText="Time to wait before attempting to close circuit"
                    >
                      <NumberInput
                        id="recovery-timeout"
                        value={recoveryTimeout}
                        onMinus={() => setRecoveryTimeout(Math.max(5, recoveryTimeout - 5))}
                        onPlus={() => setRecoveryTimeout(recoveryTimeout + 5)}
                        onChange={(event) => {
                          const value = parseInt((event.target as HTMLInputElement).value) || 30;
                          setRecoveryTimeout(Math.max(5, value));
                        }}
                        min={5}
                        step={5}
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
          <CardTitle>Custom Routing Rules</CardTitle>
          <CardBody>
            <FormGroup 
              label="Advanced Routing Configuration" 
              fieldId="custom-routes"
              helperText="Define custom routing rules using YAML. Specify path-based routing, header-based routing, and custom middleware."
            >
              <TextArea
                id="custom-routes"
                value={customRoutes}
                onChange={(_event, value) => setCustomRoutes(value)}
                placeholder={`# Example custom routing configuration
routes:
  - path: "/v1/models/gpt-*"
    methods: ["POST"]
    destination: "llm-cluster"
    middleware:
      - "auth-required"
      - "rate-limit-premium"
      
  - path: "/v1/models/vision-*" 
    methods: ["POST"]
    destination: "vision-cluster"
    headers:
      "x-model-type": "computer-vision"
      
  - path: "/v1/embeddings/*"
    methods: ["POST"] 
    destination: "embedding-cluster"
    load_balance: "least-connections"
    
middleware:
  - name: "rate-limit-premium"
    config:
      requests_per_minute: 1000
  - name: "auth-required"
    config:
      require_api_key: true`}
                rows={20}
              />
            </FormGroup>
          </CardBody>
        </Card>
      </StackItem>

      <StackItem>
        <Flex>
          <FlexItem>
            <Button variant="primary">Save Configuration</Button>
          </FlexItem>
          <FlexItem>
            <Button variant="secondary">Test Configuration</Button>
          </FlexItem>
          <FlexItem>
            <Button variant="link">Reset to Defaults</Button>
          </FlexItem>
        </Flex>
      </StackItem>
    </Stack>
  );
};

export default RequestRoutingTab;