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
  TextArea,
  Stack,
  StackItem,
  Button,
  Alert,
  Flex,
  FlexItem,
  Grid,
  GridItem,
} from '@patternfly/react-core';
import { PlusCircleIcon, TrashIcon } from '@patternfly/react-icons';

const AuthenticationTab: React.FC = () => {
  const [authEnabled, setAuthEnabled] = React.useState(true);
  const [rbacEnabled, setRbacEnabled] = React.useState(true);
  const [apiKeysEnabled, setApiKeysEnabled] = React.useState(true);
  const [oauthEnabled, setOauthEnabled] = React.useState(false);
  const [authMethod, setAuthMethod] = React.useState('');
  const [authMethodOpen, setAuthMethodOpen] = React.useState(false);
  const [jwtSecret, setJwtSecret] = React.useState('');
  const [tokenExpiry, setTokenExpiry] = React.useState('24h');
  const [oauthClientId, setOauthClientId] = React.useState('');
  const [oauthClientSecret, setOauthClientSecret] = React.useState('');
  const [oauthProvider, setOauthProvider] = React.useState('');
  const [rbacRules, setRbacRules] = React.useState<string>('');
  const [apiKeys, setApiKeys] = React.useState<Array<{id: string, name: string, key: string, permissions: string}>>([
    { id: '1', name: 'Default Admin Key', key: 'ak_***************', permissions: 'admin' }
  ]);

  const authMethods = [
    { value: 'jwt', label: 'JWT Tokens', description: 'JSON Web Tokens for stateless authentication' },
    { value: 'oauth', label: 'OAuth 2.0', description: 'OAuth 2.0 / OpenID Connect integration' },
    { value: 'apikey', label: 'API Keys', description: 'Simple API key authentication' },
    { value: 'mutual-tls', label: 'Mutual TLS', description: 'Certificate-based authentication' },
  ];

  const addApiKey = () => {
    const newKey = {
      id: String(apiKeys.length + 1),
      name: '',
      key: `ak_${Math.random().toString(36).substring(2, 15)}`,
      permissions: 'user'
    };
    setApiKeys([...apiKeys, newKey]);
  };

  const removeApiKey = (id: string) => {
    setApiKeys(apiKeys.filter(key => key.id !== id));
  };

  const updateApiKey = (id: string, field: string, value: string) => {
    setApiKeys(apiKeys.map(key => 
      key.id === id ? { ...key, [field]: value } : key
    ));
  };

  return (
    <Stack hasGutter>
      <StackItem>
        <Alert variant="info" title="Authentication Configuration">
          Configure authentication and authorization settings for all model API endpoints. 
          These settings apply globally to all models served through the API Gateway.
        </Alert>
      </StackItem>

      <StackItem>
        <Card>
          <CardTitle>Global Authentication Settings</CardTitle>
          <CardBody>
            <Form>
              <FormGroup label="Enable Authentication" fieldId="auth-enabled">
                <Switch
                  id="auth-enabled"
                  isChecked={authEnabled}
                  onChange={(_event, checked) => setAuthEnabled(checked)}
                  label="Require authentication for all API endpoints"
                  labelOff="Allow anonymous access"
                />
              </FormGroup>

              {authEnabled && (
                <>
                  <FormGroup label="Authentication Method" fieldId="auth-method" isRequired>
                    <Select
                      isOpen={authMethodOpen}
                      selected={authMethod}
                      onSelect={(event, selection) => {
                        setAuthMethod(selection as string);
                        setAuthMethodOpen(false);
                      }}
                      onOpenChange={(isOpen) => setAuthMethodOpen(isOpen)}
                      toggle={(toggleRef) => (
                        <MenuToggle
                          ref={toggleRef}
                          onClick={() => setAuthMethodOpen(!authMethodOpen)}
                          isExpanded={authMethodOpen}
                          isFullWidth
                        >
                          {authMethods.find(method => method.value === authMethod)?.label || "Select authentication method"}
                        </MenuToggle>
                      )}
                    >
                      <SelectList>
                        {authMethods.map(method => (
                          <SelectOption
                            key={method.value}
                            value={method.value}
                            description={method.description}
                          >
                            {method.label}
                          </SelectOption>
                        ))}
                      </SelectList>
                    </Select>
                  </FormGroup>

                  <FormGroup label="Token Expiry" fieldId="token-expiry">
                    <TextInput
                      id="token-expiry"
                      value={tokenExpiry}
                      onChange={(_event, value) => setTokenExpiry(value)}
                      placeholder="e.g., 24h, 7d, 30m"
                    />
                  </FormGroup>

                  <FormGroup label="JWT Secret" fieldId="jwt-secret">
                    <TextInput
                      id="jwt-secret"
                      type="password"
                      value={jwtSecret}
                      onChange={(_event, value) => setJwtSecret(value)}
                      placeholder="Enter JWT signing secret"
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
          <CardTitle>Role-Based Access Control (RBAC)</CardTitle>
          <CardBody>
            <Form>
              <FormGroup label="Enable RBAC" fieldId="rbac-enabled">
                <Switch
                  id="rbac-enabled"
                  isChecked={rbacEnabled}
                  onChange={(_event, checked) => setRbacEnabled(checked)}
                  label="Enable role-based access control"
                  labelOff="Use basic authorization only"
                />
              </FormGroup>

              {rbacEnabled && (
                <FormGroup 
                  label="RBAC Rules Configuration" 
                  fieldId="rbac-rules"
                  helperText="Define RBAC rules in YAML format. Specify roles, permissions, and resource mappings."
                >
                  <TextArea
                    id="rbac-rules"
                    value={rbacRules}
                    onChange={(_event, value) => setRbacRules(value)}
                    placeholder={`# Example RBAC configuration
roles:
  - name: "model-admin"
    permissions:
      - "models:*"
      - "deployments:*"
  - name: "model-user"  
    permissions:
      - "models:read"
      - "infer:execute"
      
bindings:
  - role: "model-admin"
    subjects:
      - kind: "User"
        name: "admin@company.com"
  - role: "model-user"
    subjects:
      - kind: "Group"
        name: "ai-engineers"`}
                    rows={15}
                  />
                </FormGroup>
              )}
            </Form>
          </CardBody>
        </Card>
      </StackItem>

      <StackItem>
        <Card>
          <CardTitle>API Key Management</CardTitle>
          <CardBody>
            <Stack hasGutter>
              <StackItem>
                <FormGroup label="Enable API Keys" fieldId="apikeys-enabled">
                  <Switch
                    id="apikeys-enabled"
                    isChecked={apiKeysEnabled}
                    onChange={(_event, checked) => setApiKeysEnabled(checked)}
                    label="Allow API key authentication"
                    labelOff="Disable API key access"
                  />
                </FormGroup>
              </StackItem>

              {apiKeysEnabled && (
                <StackItem>
                  <Flex>
                    <FlexItem grow={{ default: 'grow' }}>
                      <strong>Configured API Keys</strong>
                    </FlexItem>
                    <FlexItem>
                      <Button
                        variant="link"
                        icon={<PlusCircleIcon />}
                        onClick={addApiKey}
                        isInline
                      >
                        Add API Key
                      </Button>
                    </FlexItem>
                  </Flex>
                  
                  <Stack hasGutter>
                    {apiKeys.map(apiKey => (
                      <StackItem key={apiKey.id}>
                        <Card isCompact>
                          <CardBody>
                            <Grid hasGutter>
                              <GridItem span={4}>
                                <FormGroup label="Name" fieldId={`apikey-name-${apiKey.id}`}>
                                  <TextInput
                                    id={`apikey-name-${apiKey.id}`}
                                    value={apiKey.name}
                                    onChange={(_event, value) => updateApiKey(apiKey.id, 'name', value)}
                                    placeholder="API Key Name"
                                  />
                                </FormGroup>
                              </GridItem>
                              <GridItem span={4}>
                                <FormGroup label="Key" fieldId={`apikey-key-${apiKey.id}`}>
                                  <TextInput
                                    id={`apikey-key-${apiKey.id}`}
                                    value={apiKey.key}
                                    onChange={(_event, value) => updateApiKey(apiKey.id, 'key', value)}
                                    isReadOnly
                                  />
                                </FormGroup>
                              </GridItem>
                              <GridItem span={3}>
                                <FormGroup label="Permissions" fieldId={`apikey-perms-${apiKey.id}`}>
                                  <Select
                                    selected={apiKey.permissions}
                                    onSelect={(event, selection) => updateApiKey(apiKey.id, 'permissions', selection as string)}
                                    toggle={(toggleRef) => (
                                      <MenuToggle
                                        ref={toggleRef}
                                        isFullWidth
                                      >
                                        {{admin: 'Admin', user: 'User', readonly: 'Read Only'}[apiKey.permissions] || 'Select permissions'}
                                      </MenuToggle>
                                    )}
                                  >
                                    <SelectList>
                                      <SelectOption value="admin">Admin</SelectOption>
                                      <SelectOption value="user">User</SelectOption>
                                      <SelectOption value="readonly">Read Only</SelectOption>
                                    </SelectList>
                                  </Select>
                                </FormGroup>
                              </GridItem>
                              <GridItem span={1}>
                                <Button
                                  variant="link"
                                  icon={<TrashIcon />}
                                  onClick={() => removeApiKey(apiKey.id)}
                                  isDanger
                                  style={{ marginTop: '24px' }}
                                />
                              </GridItem>
                            </Grid>
                          </CardBody>
                        </Card>
                      </StackItem>
                    ))}
                  </Stack>
                </StackItem>
              )}
            </Stack>
          </CardBody>
        </Card>
      </StackItem>

      <StackItem>
        <Card>
          <CardTitle>OAuth 2.0 / OpenID Connect</CardTitle>
          <CardBody>
            <Form>
              <FormGroup label="Enable OAuth" fieldId="oauth-enabled">
                <Switch
                  id="oauth-enabled"
                  isChecked={oauthEnabled}
                  onChange={(_event, checked) => setOauthEnabled(checked)}
                  label="Enable OAuth 2.0 / OpenID Connect"
                  labelOff="Disable OAuth integration"
                />
              </FormGroup>

              {oauthEnabled && (
                <>
                  <FormGroup label="OAuth Provider" fieldId="oauth-provider" isRequired>
                    <TextInput
                      id="oauth-provider"
                      value={oauthProvider}
                      onChange={(_event, value) => setOauthProvider(value)}
                      placeholder="https://auth.company.com"
                    />
                  </FormGroup>

                  <FormGroup label="Client ID" fieldId="oauth-client-id" isRequired>
                    <TextInput
                      id="oauth-client-id"
                      value={oauthClientId}
                      onChange={(_event, value) => setOauthClientId(value)}
                      placeholder="Enter OAuth client ID"
                    />
                  </FormGroup>

                  <FormGroup label="Client Secret" fieldId="oauth-client-secret" isRequired>
                    <TextInput
                      id="oauth-client-secret"
                      type="password"
                      value={oauthClientSecret}
                      onChange={(_event, value) => setOauthClientSecret(value)}
                      placeholder="Enter OAuth client secret"
                    />
                  </FormGroup>
                </>
              )}
            </Form>
          </CardBody>
        </Card>
      </StackItem>

      <StackItem>
        <Flex>
          <FlexItem>
            <Button variant="primary">Save Configuration</Button>
          </FlexItem>
          <FlexItem>
            <Button variant="secondary">Reset to Defaults</Button>
          </FlexItem>
        </Flex>
      </StackItem>
    </Stack>
  );
};

export default AuthenticationTab;