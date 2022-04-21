import React, { FunctionComponent } from 'react';
import { Aside, Main, Page } from '@components/Html';
import { Tab, Tabs } from '@components/Tabs';
import { ConfigurationOverview } from './overview';
import { ConfigurationDefinitions } from './definitions/definitions';
import SupportLinks from '@components/SupportLinks';
import { useSelector } from 'react-redux';
import { RootState } from '@store/index';

export const Configuration: FunctionComponent = () => {
  const tenantName = useSelector((state: RootState) => state.tenant?.name);
  const docBaseUrl = useSelector((state: RootState) => state.config.serviceUrls?.docServiceApiUrl);

  return (
    <Page>
      <Main>
        <h1 data-testid="configuration-title">Configuration service</h1>
        <Tabs activeIndex={0}>
          <Tab label="Overview">
            <ConfigurationOverview />
          </Tab>
          <Tab label="Definitions">
            <ConfigurationDefinitions />
          </Tab>
        </Tabs>
      </Main>
      <Aside>
        <>
          <h3>Helpful links</h3>
          <a
            rel="noopener noreferrer"
            target="_blank"
            href={`${docBaseUrl}/${tenantName}?urls.primaryName=Configuration service`}
          >
            Read the API docs
          </a>
          <br />
          <a
            rel="noopener noreferrer"
            target="_blank"
            href="https://github.com/GovAlta/adsp-monorepo/tree/main/apps/configuration-service"
          >
            See the code
          </a>

          <SupportLinks />
        </>
      </Aside>
    </Page>
  );
};
