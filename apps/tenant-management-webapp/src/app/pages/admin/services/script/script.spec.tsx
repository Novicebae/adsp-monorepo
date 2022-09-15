import React from 'react';
import { Provider } from 'react-redux';
import configureStore from 'redux-mock-store';
import { render } from '@testing-library/react';
import '@testing-library/jest-dom';
import { ScriptsView } from './scriptsView';
import { SESSION_INIT } from '@store/session/models';
describe('Script list Page', () => {
  const mockStore = configureStore([]);
  const store = mockStore({
    scriptService: {
      scripts: {
        'ddi-script': {
          name: 'ddi-script',
          id: 'ddi-script',
          description: '',
          runnerRoles: ['auto-test-role1', 'stream-listener'],
        },
      },
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

  it('Render script service', () => {
    const { queryByTestId } = render(
      <Provider store={store}>
        <ScriptsView activeEdit={false} />
      </Provider>
    );

    const addButton = queryByTestId('add-script-btn');
    expect(addButton).not.toBeNull();
  });
});
