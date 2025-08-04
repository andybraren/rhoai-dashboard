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
  Label,
  LabelGroup,
  Checkbox,
  Radio,
} from '@patternfly/react-core';
import { PlusCircleIcon, BellIcon, ExclamationTriangleIcon } from '@patternfly/react-icons';

const MonitoringTab: React.FC = () => {
  const [metricsEnabled, setMetricsEnabled] = React.useState(true);
  const [loggingEnabled, setLoggingEnabled] = React.useState(true);
  const [tracingEnabled, setTracingEnabled] = React.useState(false);
  const [alertingEnabled, setAlertingEnabled] = React.useState(true);
  
  const [metricsRetention, setMetricsRetention] = React.useState(30);
  const [logsRetention, setLogsRetention] = React.useState(7);
  const [samplingRate, setSamplingRate] = React.useState(10);
  
  const [logLevel, setLogLevel] = React.useState('INFO');
  const [logLevelOpen, setLogLevelOpen] = React.useState(false);
  const [logFormat, setLogFormat] = React.useState('json');
  
  const [metricsEndpoint, setMetricsEndpoint] = React.useState('http://prometheus:9090');
  const [logsEndpoint, setLogsEndpoint] = React.useState('http://elasticsearch:9200');
  const [tracingEndpoint, setTracingEndpoint] = React.useState('http://jaeger:14268');
  
  const [auditEnabled, setAuditEnabled] = React.useState(true);
  const [securityLoggingEnabled, setSecurityLoggingEnabled] = React.useState(true);
  const [performanceLoggingEnabled, setPerformanceLoggingEnabled] = React.useState(true);
  
  const [alertRules, setAlertRules] = React.useState('');
  const [notificationChannels, setNotificationChannels] = React.useState([
    'slack-alerts',
    'email-ops-team'
  ]);
  
  const [dashboardConfig, setDashboardConfig] = React.useState('');

  const logLevels = [
    { value: 'DEBUG', label: 'DEBUG', description: 'Detailed diagnostic information' },
    { value: 'INFO', label: 'INFO', description: 'General operational messages' },
    { value: 'WARN', label: 'WARN', description: 'Warning messages for potential issues' },
    { value: 'ERROR', label: 'ERROR', description: 'Error messages for failures' },
    { value: 'FATAL', label: 'FATAL', description: 'Critical errors that cause shutdown' },
  ];

  const availableChannels = [
    'slack-alerts',
    'email-ops-team',
    'pagerduty',
    'webhook-monitoring',
    'teams-devops'
  ];

  const toggleNotificationChannel = (channel: string) => {
    if (notificationChannels.includes(channel)) {
      setNotificationChannels(notificationChannels.filter(c => c !== channel));
    } else {
      setNotificationChannels([...notificationChannels, channel]);
    }
  };

  return (
    <Stack hasGutter>
      <StackItem>
        <Alert variant="info" title="Monitoring & Logging Configuration">
          Configure comprehensive monitoring, logging, and alerting for the API Gateway. 
          Track request metrics, model performance, security events, and system health.
        </Alert>
      </StackItem>

      <StackItem>
        <Card>
          <CardTitle>Metrics Collection</CardTitle>
          <CardBody>
            <Form>
              <FormGroup label="Enable Metrics Collection" fieldId="metrics-enabled">
                <Switch
                  id="metrics-enabled"
                  isChecked={metricsEnabled}
                  onChange={(_event, checked) => setMetricsEnabled(checked)}
                  label="Collect and export API Gateway metrics"
                  labelOff="Disable metrics collection"
                />
              </FormGroup>

              {metricsEnabled && (
                <>
                  <FormGroup label="Metrics Endpoint" fieldId="metrics-endpoint" isRequired>
                    <TextInput
                      id="metrics-endpoint"
                      value={metricsEndpoint}
                      onChange={(_event, value) => setMetricsEndpoint(value)}
                      placeholder="http://prometheus:9090"
                    />
                  </FormGroup>

                  <FormGroup 
                    label="Metrics Retention (days)" 
                    fieldId="metrics-retention"
                    helperText="How long to retain metrics data"
                  >
                    <NumberInput
                      id="metrics-retention"
                      value={metricsRetention}
                      onMinus={() => setMetricsRetention(Math.max(1, metricsRetention - 1))}
                      onPlus={() => setMetricsRetention(metricsRetention + 1)}
                      onChange={(event) => {
                        const value = parseInt((event.target as HTMLInputElement).value) || 30;
                        setMetricsRetention(Math.max(1, value));
                      }}
                      min={1}
                      max={365}
                    />
                  </FormGroup>

                  <FormGroup label="Collected Metrics">
                    <Stack hasGutter>
                      <StackItem>
                        <Checkbox id="metric-requests" label="Request count and rate" defaultChecked />
                      </StackItem>
                      <StackItem>
                        <Checkbox id="metric-latency" label="Response latency (p50, p95, p99)" defaultChecked />
                      </StackItem>
                      <StackItem>
                        <Checkbox id="metric-errors" label="Error rates by status code" defaultChecked />
                      </StackItem>
                      <StackItem>
                        <Checkbox id="metric-model-perf" label="Model inference metrics" defaultChecked />
                      </StackItem>
                      <StackItem>
                        <Checkbox id="metric-auth" label="Authentication success/failure rates" defaultChecked />
                      </StackItem>
                      <StackItem>
                        <Checkbox id="metric-rate-limit" label="Rate limiting metrics" defaultChecked />
                      </StackItem>
                      <StackItem>
                        <Checkbox id="metric-resources" label="Resource utilization (CPU, memory, GPU)" defaultChecked />
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
          <CardTitle>Logging Configuration</CardTitle>
          <CardBody>
            <Form>
              <FormGroup label="Enable Logging" fieldId="logging-enabled">
                <Switch
                  id="logging-enabled"
                  isChecked={loggingEnabled}
                  onChange={(_event, checked) => setLoggingEnabled(checked)}
                  label="Enable structured logging for all API requests"
                  labelOff="Disable logging"
                />
              </FormGroup>

              {loggingEnabled && (
                <>
                  <Grid hasGutter>
                    <GridItem span={6}>
                      <FormGroup label="Log Level" fieldId="log-level" isRequired>
                        <Select
                          isOpen={logLevelOpen}
                          selected={logLevel}
                          onSelect={(event, selection) => {
                            setLogLevel(selection as string);
                            setLogLevelOpen(false);
                          }}
                          onOpenChange={(isOpen) => setLogLevelOpen(isOpen)}
                          toggle={(toggleRef) => (
                            <MenuToggle
                              ref={toggleRef}
                              onClick={() => setLogLevelOpen(!logLevelOpen)}
                              isExpanded={logLevelOpen}
                              isFullWidth
                            >
                              {logLevels.find(level => level.value === logLevel)?.label || "Select log level"}
                            </MenuToggle>
                          )}
                        >
                          <SelectList>
                            {logLevels.map(level => (
                              <SelectOption
                                key={level.value}
                                value={level.value}
                                description={level.description}
                              >
                                {level.label}
                              </SelectOption>
                            ))}
                          </SelectList>
                        </Select>
                      </FormGroup>
                    </GridItem>
                    <GridItem span={6}>
                      <FormGroup label="Log Format" fieldId="log-format">
                        <div>
                          <Radio
                            id="log-format-json"
                            name="log-format"
                            label="JSON (structured)"
                            isChecked={logFormat === 'json'}
                            onChange={() => setLogFormat('json')}
                          />
                          <Radio
                            id="log-format-text"
                            name="log-format"
                            label="Plain text"
                            isChecked={logFormat === 'text'}
                            onChange={() => setLogFormat('text')}
                          />
                        </div>
                      </FormGroup>
                    </GridItem>
                  </Grid>

                  <FormGroup label="Logs Endpoint" fieldId="logs-endpoint" isRequired>
                    <TextInput
                      id="logs-endpoint"
                      value={logsEndpoint}
                      onChange={(_event, value) => setLogsEndpoint(value)}
                      placeholder="http://elasticsearch:9200"
                    />
                  </FormGroup>

                  <FormGroup 
                    label="Logs Retention (days)" 
                    fieldId="logs-retention"
                    helperText="How long to retain log data"
                  >
                    <NumberInput
                      id="logs-retention"
                      value={logsRetention}
                      onMinus={() => setLogsRetention(Math.max(1, logsRetention - 1))}
                      onPlus={() => setLogsRetention(logsRetention + 1)}
                      onChange={(event) => {
                        const value = parseInt((event.target as HTMLInputElement).value) || 7;
                        setLogsRetention(Math.max(1, value));
                      }}
                      min={1}
                      max={365}
                    />
                  </FormGroup>

                  <FormGroup label="Logging Categories">
                    <Grid hasGutter>
                      <GridItem span={6}>
                        <FormGroup label="Security Logging" fieldId="security-logging">
                          <Switch
                            id="security-logging"
                            isChecked={securityLoggingEnabled}
                            onChange={(_event, checked) => setSecurityLoggingEnabled(checked)}
                            label="Log authentication attempts, authorization failures"
                          />
                        </FormGroup>
                      </GridItem>
                      <GridItem span={6}>
                        <FormGroup label="Performance Logging" fieldId="performance-logging">
                          <Switch
                            id="performance-logging"
                            isChecked={performanceLoggingEnabled}
                            onChange={(_event, checked) => setPerformanceLoggingEnabled(checked)}
                            label="Log response times, resource usage"
                          />
                        </FormGroup>
                      </GridItem>
                    </Grid>
                  </FormGroup>
                </>
              )}
            </Form>
          </CardBody>
        </Card>
      </StackItem>

      <StackItem>
        <Card>
          <CardTitle>Distributed Tracing</CardTitle>
          <CardBody>
            <Form>
              <FormGroup label="Enable Distributed Tracing" fieldId="tracing-enabled">
                <Switch
                  id="tracing-enabled"
                  isChecked={tracingEnabled}
                  onChange={(_event, checked) => setTracingEnabled(checked)}
                  label="Enable OpenTelemetry-based distributed tracing"
                  labelOff="Disable tracing"
                />
              </FormGroup>

              {tracingEnabled && (
                <>
                  <FormGroup label="Tracing Endpoint" fieldId="tracing-endpoint" isRequired>
                    <TextInput
                      id="tracing-endpoint"
                      value={tracingEndpoint}
                      onChange={(_event, value) => setTracingEndpoint(value)}
                      placeholder="http://jaeger:14268"
                    />
                  </FormGroup>

                  <FormGroup 
                    label="Sampling Rate (%)" 
                    fieldId="sampling-rate"
                    helperText="Percentage of traces to sample (1-100)"
                  >
                    <NumberInput
                      id="sampling-rate"
                      value={samplingRate}
                      onMinus={() => setSamplingRate(Math.max(1, samplingRate - 1))}
                      onPlus={() => setSamplingRate(Math.min(100, samplingRate + 1))}
                      onChange={(event) => {
                        const value = parseInt((event.target as HTMLInputElement).value) || 10;
                        setSamplingRate(Math.max(1, Math.min(100, value)));
                      }}
                      min={1}
                      max={100}
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
          <CardTitle>Audit Logging</CardTitle>
          <CardBody>
            <Form>
              <FormGroup label="Enable Audit Logging" fieldId="audit-enabled">
                <Switch
                  id="audit-enabled"
                  isChecked={auditEnabled}
                  onChange={(_event, checked) => setAuditEnabled(checked)}
                  label="Log all administrative actions and configuration changes"
                  labelOff="Disable audit logging"
                />
              </FormGroup>

              {auditEnabled && (
                <FormGroup label="Audit Events" fieldId="audit-events">
                  <Stack hasGutter>
                    <StackItem>
                      <Checkbox id="audit-config" label="Configuration changes" defaultChecked />
                    </StackItem>
                    <StackItem>
                      <Checkbox id="audit-auth" label="Authentication events" defaultChecked />
                    </StackItem>
                    <StackItem>
                      <Checkbox id="audit-model" label="Model registration/deregistration" defaultChecked />
                    </StackItem>
                    <StackItem>
                      <Checkbox id="audit-access" label="API access attempts" defaultChecked />
                    </StackItem>
                    <StackItem>
                      <Checkbox id="audit-admin" label="Administrative actions" defaultChecked />
                    </StackItem>
                  </Stack>
                </FormGroup>
              )}
            </Form>
          </CardBody>
        </Card>
      </StackItem>

      <StackItem>
        <Card>
          <CardTitle>Alerting Rules</CardTitle>
          <CardBody>
            <Form>
              <FormGroup label="Enable Alerting" fieldId="alerting-enabled">
                <Switch
                  id="alerting-enabled"
                  isChecked={alertingEnabled}
                  onChange={(_event, checked) => setAlertingEnabled(checked)}
                  label="Enable automated alerting based on metrics and events"
                  labelOff="Disable alerting"
                />
              </FormGroup>

              {alertingEnabled && (
                <>
                  <FormGroup label="Notification Channels" fieldId="notification-channels">
                    <LabelGroup>
                      {availableChannels.map(channel => (
                        <Label
                          key={channel}
                          color={notificationChannels.includes(channel) ? 'blue' : 'grey'}
                          variant={notificationChannels.includes(channel) ? 'filled' : 'outline'}
                          onClick={() => toggleNotificationChannel(channel)}
                          style={{ cursor: 'pointer' }}
                          icon={notificationChannels.includes(channel) ? <BellIcon /> : undefined}
                        >
                          {channel}
                        </Label>
                      ))}
                    </LabelGroup>
                  </FormGroup>

                  <FormGroup 
                    label="Alert Rules Configuration" 
                    fieldId="alert-rules"
                    helperText="Define alerting rules in YAML format using Prometheus-style expressions"
                  >
                    <TextArea
                      id="alert-rules"
                      value={alertRules}
                      onChange={(_event, value) => setAlertRules(value)}
                      placeholder={`# Example alerting rules
groups:
  - name: api-gateway-alerts
    rules:
      - alert: HighErrorRate
        expr: (sum(rate(http_requests_total{status=~"5.."}[5m])) / sum(rate(http_requests_total[5m]))) > 0.05
        for: 5m
        labels:
          severity: warning
        annotations:
          summary: "High error rate detected"
          description: "Error rate is {{ $value | humanizePercentage }}"
          
      - alert: HighLatency
        expr: histogram_quantile(0.95, sum(rate(http_request_duration_seconds_bucket[5m])) by (le)) > 2
        for: 10m
        labels:
          severity: warning
        annotations:
          summary: "High request latency"
          description: "95th percentile latency is {{ $value }}s"
          
      - alert: ModelEndpointDown
        expr: up{job="model-endpoints"} == 0
        for: 1m
        labels:
          severity: critical
        annotations:
          summary: "Model endpoint is down"
          description: "Model endpoint {{ $labels.instance }} has been down for more than 1 minute"
          
      - alert: RateLimitExceeded
        expr: increase(rate_limit_exceeded_total[5m]) > 100
        for: 5m
        labels:
          severity: warning
        annotations:
          summary: "High rate limit violations"
          description: "Rate limit exceeded {{ $value }} times in the last 5 minutes"`}
                      rows={25}
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
          <CardTitle>Dashboard Configuration</CardTitle>
          <CardBody>
            <FormGroup 
              label="Grafana Dashboard JSON" 
              fieldId="dashboard-config"
              helperText="Import or configure Grafana dashboard for API Gateway monitoring"
            >
              <TextArea
                id="dashboard-config"
                value={dashboardConfig}
                onChange={(_event, value) => setDashboardConfig(value)}
                placeholder={`{
  "dashboard": {
    "title": "API Gateway Monitoring",
    "tags": ["api-gateway", "monitoring"],
    "panels": [
      {
        "title": "Request Rate",
        "type": "graph",
        "targets": [
          {
            "expr": "sum(rate(http_requests_total[5m])) by (status)",
            "legendFormat": "{{ status }}"
          }
        ]
      },
      {
        "title": "Response Time",
        "type": "graph", 
        "targets": [
          {
            "expr": "histogram_quantile(0.95, sum(rate(http_request_duration_seconds_bucket[5m])) by (le))",
            "legendFormat": "95th percentile"
          }
        ]
      },
      {
        "title": "Model Performance",
        "type": "table",
        "targets": [
          {
            "expr": "avg(model_inference_duration_seconds) by (model_name)",
            "format": "table"
          }
        ]
      }
    ]
  }
}`}
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
            <Button variant="secondary">Test Alerts</Button>
          </FlexItem>
          <FlexItem>
            <Button variant="tertiary">Export Dashboard</Button>
          </FlexItem>
          <FlexItem>
            <Button variant="link">Reset to Defaults</Button>
          </FlexItem>
        </Flex>
      </StackItem>
    </Stack>
  );
};

export default MonitoringTab;