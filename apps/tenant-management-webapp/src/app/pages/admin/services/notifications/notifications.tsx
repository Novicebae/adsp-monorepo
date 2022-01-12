import { Aside, Main, Page } from '@components/Html';
import SupportLinks from '@components/SupportLinks';
import { Tab, Tabs } from '@components/Tabs';
import { RootState } from '@store/index';
import { GoACallout } from '@abgov/react-components';
import React, { FunctionComponent, useState, useEffect } from 'react';
import { useSelector } from 'react-redux';
import { NotificationsOverview } from './overview';
import { NotificationTypes } from './notificationTypes';
import { Subscriptions } from './subscriptions';
import { Subscribers } from './subscribers';

export const Notifications: FunctionComponent = () => {
  const tenantId = useSelector((state: RootState) => state.tenant?.id);
  const docBaseUrl = useSelector((state: RootState) => state.config.serviceUrls?.docServiceApiUrl);
  const adminEmail = useSelector((state: RootState) => state.tenant.adminEmail);
  const hasTenantAdminRole = useSelector((state: RootState) =>
    state.session?.resourceAccess?.['urn:ads:platform:tenant-service']?.roles?.includes('tenant-admin')
  );

  const hasNotificationAdminRole = useSelector((state: RootState) =>
    state.session?.resourceAccess?.['urn:ads:platform:notification-service']?.roles?.includes('subscription-admin')
  );

  const [activateEditState, setActivateEditState] = useState<boolean>(false);
  const [activeIndex, setActiveIndex] = useState<number>(0);

  const activateEdit = (edit: boolean) => {
    setActiveIndex(1);
    setActivateEditState(edit);
  };

  useEffect(() => {
    if (activeIndex !== null) {
      setActiveIndex(null);
    }
  }, [activeIndex]);

  const calloutMessage = () => {
    return (
      <Main>
        <Tabs activeIndex={activeIndex}>
          <Tab label="Overview">
            <NotificationsOverview setActiveEdit={activateEdit} disabled />
          </Tab>
        </Tabs>

        <GoACallout type="important" data-testid="delete-modal">
          <h3>Access to notifications requires admin roles</h3>
          <p>
            You require the tenant-admin role or subscription-admin role to access notifications and will need to
            contact the administrator of the tenant at <a href={`mailto: ${adminEmail}`}>{adminEmail}</a>
          </p>
        </GoACallout>
      </Main>
    );
  };

  return (
    <Page>
      <Main>
        <h1>Notifications</h1>
        {hasTenantAdminRole || hasNotificationAdminRole ? (
          <Tabs activeIndex={activeIndex}>
            <Tab label="Overview">
              <NotificationsOverview setActiveEdit={activateEdit} />
            </Tab>
            <Tab label="Notification types">
              <NotificationTypes activeEdit={activateEditState} activateEdit={activateEdit} />
            </Tab>
            <Tab label="Subscriptions">
              <Subscriptions />
            </Tab>
            <Tab label="Subscribers">
              <Subscribers />
            </Tab>
          </Tabs>
        ) : (
          calloutMessage()
        )}
      </Main>
      <Aside>
        <h3>Helpful links</h3>
        <a
          rel="noopener noreferrer"
          target="_blank"
          href={`${docBaseUrl}?tenant=${tenantId}&urls.primaryName=Notification service`}
        >
          Read the API docs
        </a>
        <br />
        <a
          rel="noopener noreferrer"
          target="_blank"
          href="https://gitlab.gov.ab.ca/dio/core/core-services/-/tree/master/apps/event-service"
        >
          See the code
        </a>
        <SupportLinks />
      </Aside>
    </Page>
  );
};
