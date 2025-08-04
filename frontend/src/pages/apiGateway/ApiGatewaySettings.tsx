import * as React from 'react';
import {
  PageSection,
  Tabs,
  Tab,
  TabTitleText,
  TabContent,
  TabContentBody,
  Stack,
  StackItem,
} from '@patternfly/react-core';
import ApplicationsPage from '#~/pages/ApplicationsPage';
import TitleWithIcon from '#~/concepts/design/TitleWithIcon';
import { ProjectObjectType } from '#~/concepts/design/utils';
import AuthenticationTab from './tabs/AuthenticationTab';
import RequestRoutingTab from './tabs/RequestRoutingTab';
import ModelManagementTab from './tabs/ModelManagementTab';
import MonitoringTab from './tabs/MonitoringTab';
import ScalingTab from './tabs/ScalingTab';

enum ApiGatewayTab {
  AUTHENTICATION = 'authentication',
  ROUTING = 'routing',
  MODELS = 'models',
  MONITORING = 'monitoring',
  SCALING = 'scaling',
}

const ApiGatewaySettings: React.FC = () => {
  const [activeTabKey, setActiveTabKey] = React.useState<string | number>(ApiGatewayTab.AUTHENTICATION);

  const handleTabClick = (
    event: React.MouseEvent<any> | React.KeyboardEvent | MouseEvent,
    tabIndex: string | number,
  ) => {
    setActiveTabKey(tabIndex);
  };

  return (
    <ApplicationsPage
      title={
        <TitleWithIcon
          title="API Gateway"
          objectType={ProjectObjectType.clusterSettings}
        />
      }
      description={
        <Stack hasGutter>
          <StackItem>
            Configure API Gateway settings for models-as-a-service. Manage authentication, routing, 
            and performance settings that apply to all AI model endpoints.
          </StackItem>
        </Stack>
      }
      loaded
      empty={false}
      provideChildrenPadding
    >
      <PageSection hasBodyWrapper={false} isFilled>
        <Tabs
          activeKey={activeTabKey}
          onSelect={handleTabClick}
          isVertical
          aria-label="API Gateway settings tabs"
          role="region"
        >
          <Tab
            eventKey={ApiGatewayTab.AUTHENTICATION}
            title={<TabTitleText>Authentication & Authorization</TabTitleText>}
            aria-label="Authentication & Authorization tab"
            tabContentId={`tabContent-${ApiGatewayTab.AUTHENTICATION}`}
          >
            <TabContent
              eventKey={ApiGatewayTab.AUTHENTICATION}
              id={`tabContent-${ApiGatewayTab.AUTHENTICATION}`}
            >
              <TabContentBody>
                <AuthenticationTab />
              </TabContentBody>
            </TabContent>
          </Tab>

          <Tab
            eventKey={ApiGatewayTab.ROUTING}
            title={<TabTitleText>Request Routing</TabTitleText>}
            aria-label="Request Routing tab"
            tabContentId={`tabContent-${ApiGatewayTab.ROUTING}`}
          >
            <TabContent
              eventKey={ApiGatewayTab.ROUTING}
              id={`tabContent-${ApiGatewayTab.ROUTING}`}
            >
              <TabContentBody>
                <RequestRoutingTab />
              </TabContentBody>
            </TabContent>
          </Tab>

          <Tab
            eventKey={ApiGatewayTab.MODELS}
            title={<TabTitleText>Model Management</TabTitleText>}
            aria-label="Model Management tab"
            tabContentId={`tabContent-${ApiGatewayTab.MODELS}`}
          >
            <TabContent
              eventKey={ApiGatewayTab.MODELS}
              id={`tabContent-${ApiGatewayTab.MODELS}`}
            >
              <TabContentBody>
                <ModelManagementTab />
              </TabContentBody>
            </TabContent>
          </Tab>

          <Tab
            eventKey={ApiGatewayTab.MONITORING}
            title={<TabTitleText>Monitoring & Logging</TabTitleText>}
            aria-label="Monitoring & Logging tab"
            tabContentId={`tabContent-${ApiGatewayTab.MONITORING}`}
          >
            <TabContent
              eventKey={ApiGatewayTab.MONITORING}
              id={`tabContent-${ApiGatewayTab.MONITORING}`}
            >
              <TabContentBody>
                <MonitoringTab />
              </TabContentBody>
            </TabContent>
          </Tab>

          <Tab
            eventKey={ApiGatewayTab.SCALING}
            title={<TabTitleText>Scaling & Performance</TabTitleText>}
            aria-label="Scaling & Performance tab"
            tabContentId={`tabContent-${ApiGatewayTab.SCALING}`}
          >
            <TabContent
              eventKey={ApiGatewayTab.SCALING}
              id={`tabContent-${ApiGatewayTab.SCALING}`}
            >
              <TabContentBody>
                <ScalingTab />
              </TabContentBody>
            </TabContent>
          </Tab>
        </Tabs>
      </PageSection>
    </ApplicationsPage>
  );
};

export default ApiGatewaySettings;