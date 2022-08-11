import React from 'react';
import { Provider } from 'react-redux';
import configureStore from 'redux-mock-store';
import { render } from '@testing-library/react';
import '@testing-library/jest-dom';
import { CalendarsView } from './calendarsView';
import { SESSION_INIT } from '@store/session/models';
describe('Calendar list Page', () => {
  const mockStore = configureStore([]);
  const store = mockStore({
    calendarService: {
      calendars: [
        {
          id: '',
          name: 'DDI-Calendar',
          displayName: '',
          description: '',
          readRoles: ['auto-test-role1', 'stream-listener'],
          updateRoles: ['auto-test-role1', 'stream-listener'],
        },
      ],
    },
    tenant: {
      realmRoles: [
        {
          name: 'testRoleA',
          id: 'test-role-a-id',
        },
        {
          name: 'testRoleB',
          id: 'test-role-b-id',
        },
      ],
    },
    session: SESSION_INIT,
  });

  it('Render calendar service', () => {
    const { queryByTestId } = render(
      <Provider store={store}>
        <CalendarsView activeEdit={false} />
      </Provider>
    );

    const addButton = queryByTestId('add-calendar-btn');
    expect(addButton).not.toBeNull();
  });
});