import React from 'react';
import { Provider } from 'react-redux';
import { getDefaultMiddleware } from '@reduxjs/toolkit';
import { render, waitFor, cleanup } from '@testing-library/react';
import configureStore from 'redux-mock-store';
import ServiceStatuses from './status';
import axios from 'axios';
import moment from 'moment';
import { ApplicationInit } from '@store/status/models'
import { SessionInit } from '@store/session/models'

jest.mock('axios');
const axiosMock = axios as jest.Mocked<typeof axios>;

jest.mock('react-router-dom', () => ({
  useLocation: jest.fn().mockReturnValue({
    pathname: '/0014430f-abb9-4b57-915c-de9f3c889696',
    search: '',
    hash: '',
    state: null,
    key: '5nvxpbdafa',
  }),
}));

const mockStore = configureStore(getDefaultMiddleware());

describe('Service statuses', () => {
  let store;

  beforeEach(() => {
    store = mockStore({
      config: {
        serviceUrls: {
          serviceStatusApiUrl: 'http://localhost:3338',
        },
        platformTenantRealm: '0014430f-abb9-4b57-915c-de9f3c889696',
        envLoaded: true,
      },
      application: ApplicationInit
    });

    axiosMock.get.mockResolvedValueOnce({ data: {} });
  });

  afterEach(() => {
    axiosMock.get.mockReset();
    cleanup();
  });

  it('displays a message saying no services are available if there are none', async () => {
    const { getByText } = render(
      <Provider store={store}>
        <ServiceStatuses />
      </Provider>
    );
    await waitFor(() =>
      expect(
        getByText('Either there are no services available by this provider, or you have an incorrect ID')
      ).toBeTruthy()
    );
  });
});

describe('Service statuses (2 of them)', () => {
  let store;

  const data = [
    {
      repository: {},
      _id: '60ef54d5a3bdbd4d6c117381',
      endpoints: [
        {
          status: 'online',
          url: 'http://localhost:3338/health',
        },
      ],
      notices: [],
      metadata: null,
      name: 'Status Service',
      description: 'This service allows for easy monitoring of application downtime.',
      statusTimestamp: 1626378840127,
      tenantId: 'urn:ads:platform:tenant-service:v2:/tenants/60e76e9e852db55d8ce1fa80',
      tenantName: 'platform',
      tenantUUID: '0014430f-abb9-4b57-915c-de9f3c889696',
      status: 'operational',
      manualOverride: 'off',
    },
    {
      repository: {},
      _id: '60ef569d68ce787398e578f6',
      endpoints: [
        {
          status: 'online',
          url: 'http://localhost:3333/health',
        },
      ],
      notices: [],
      metadata: null,
      name: 'Tenant Service',
      description: 'Allows the provisioning of distinct services in their own namespace.',
      statusTimestamp: 1626380220228,
      tenantId: 'urn:ads:platform:tenant-service:v2:/tenants/60e76e9e852db55d8ce1fa80',
      tenantName: 'platform',
      tenantUUID: '0014430f-abb9-4b57-915c-de9f3c889696',
      status: 'operational',
      manualOverride: 'off',
    },
  ];

  beforeAll(() => {
    jest.useFakeTimers('modern');
    jest.setSystemTime(new Date(Date.UTC(2021, 6, 16)));
  });
  afterAll(() => {
    jest.useRealTimers();
  });

  beforeEach(() => {
    store = mockStore({
      config: {
        serviceUrls: {
          serviceStatusApiUrl: 'http://localhost:3338',
        },
        platformTenantRealm: '0014430f-abb9-4b57-915c-de9f3c889696',
        envLoaded: true,
      },
      application: {
        applications: data
      },
      session: SessionInit
    });
    axiosMock.get.mockResolvedValueOnce({ data: data });
  });

  afterEach(() => {
    axiosMock.get.mockReset();
    cleanup();
  });

  it('has service status names', async () => {
    const { getByText } = render(
      <Provider store={store}>
        <ServiceStatuses />
      </Provider>
    );

    await waitFor(() => expect(getByText('Status Service')).toBeTruthy());
    await waitFor(() => expect(getByText('Tenant Service')).toBeTruthy());
  });

  it('has service status descriptions', async () => {
    const { getByText } = render(
      <Provider store={store}>
        <ServiceStatuses />
      </Provider>
    );

    await waitFor(() =>
      expect(getByText('This service allows for easy monitoring of application downtime.')).toBeTruthy()
    );
    await waitFor(() =>
      expect(getByText('Allows the provisioning of distinct services in their own namespace.')).toBeTruthy()
    );
  });

  it('has service time of last service', async () => {
    const { getByText } = render(
      <Provider store={store}>
        <ServiceStatuses />
      </Provider>
    );

    await waitFor(() => expect(getByText(moment(data[0].statusTimestamp).calendar())).toBeTruthy());
    await waitFor(() => expect(getByText(moment(data[1].statusTimestamp).calendar())).toBeTruthy());
  });
});
