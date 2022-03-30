import { put, select, call, takeEvery } from 'redux-saga/effects';
import { RootState, store } from '@store/index';
import { ErrorNotification } from '@store/notifications/actions';
import {
  KeycloakCheckSSOAction,
  TenantLoginAction,
  KeycloakCheckSSOWithLogOutAction,
  FetchTenantAction,
  FetchTenantSucceededService,
  FETCH_TENANT,
} from './actions';

import { SessionLoginSuccess } from '@store/session/actions';
import { createKeycloakAuth, keycloakAuth } from '@lib/keycloak';
import { convertToSession } from '@lib/session';
import { SagaIterator } from '@redux-saga/core';

import axios from 'axios';

export function* fetchTenant(action: FetchTenantAction): SagaIterator {
  const { tenantId } = action.payload.tenant;

  try {
    const tenant = (yield call(axios.get, `/api/tenant/v1/tenant/${tenantId}`)).data;

    yield put(FetchTenantSucceededService(tenant));
  } catch (e) {
    yield put(ErrorNotification({ message: `${e.message} - fetchTenant` }));
  }
}

export function* keycloakCheckSSO(action: KeycloakCheckSSOAction): SagaIterator {
  try {
    const state: RootState = yield select();
    const realm = action.payload;

    const loginRedirectUrl = `${window.location.origin}/subscriptions`;
    const keycloakConfig = state.config.keycloakApi;
    createKeycloakAuth({ ...keycloakConfig, realm }, loginRedirectUrl);
    keycloakAuth.checkSSO(
      (keycloak) => {
        const session = convertToSession(keycloak);
        Promise.all([
          store.dispatch(SessionLoginSuccess(session)),
          // store.dispatch(IsTenantAdmin(session.userInfo.email)),
        ]);
      },
      () => {
        console.error('Failed to check the SSO');
      }
    );
  } catch (e) {
    yield put(ErrorNotification({ message: `Failed to check keycloak SSO: ${e.message}` }));
  }
}

export function* keycloakCheckSSOWithLogout(action: KeycloakCheckSSOWithLogOutAction): SagaIterator {
  try {
    const state: RootState = yield select();
    const realm = action.payload;
    const loginRedirectUrl = `${window.location.origin}/subscriptions`;
    const keycloakConfig = state.config.keycloakApi;
    createKeycloakAuth({ ...keycloakConfig, realm }, loginRedirectUrl);
    console.debug('Checkout keycloak SSO');
    keycloakAuth.checkSSO(
      (keycloak) => {
        const session = convertToSession(keycloak);
        Promise.all([store.dispatch(SessionLoginSuccess(session))]);
      },
      () => {
        window.location.replace(`/${realm}/login`);
      }
    );
  } catch (e) {
    yield put(ErrorNotification({ message: `Failed to check keycloak SSO: ${e.message}` }));
  }
}

export function* tenantLogin(action: TenantLoginAction): SagaIterator {
  try {
    const state: RootState = yield select();
    const loginRedirectUrl = `${window.location.origin}/subscriptions`;
    const keycloakConfig = state.config.keycloakApi;
    createKeycloakAuth({ ...keycloakConfig }, loginRedirectUrl);

    keycloakAuth.loginByIdP('core', action.payload);
  } catch (e) {
    yield put(ErrorNotification({ message: `Failed to tenant login: ${e.message}` }));
  }
}

export function* keycloakRefreshToken(realm?: string): SagaIterator {
  try {
    if (keycloakAuth) {
      keycloakAuth.refreshToken(
        (keycloak) => {
          const session = convertToSession(keycloak);
          Promise.all([store.dispatch(SessionLoginSuccess(session))]);
        },
        () => {
          window.location.replace(`/${realm}/login`);
        }
      );
    } else {
      console.warn(`Try to fresh keycloak token. But, keycloak instance is empty.`);
    }
  } catch (e) {
    yield put(ErrorNotification({ message: `Failed to tenant login: ${e.message}` }));
  }
}

export function* tenantLogout(): SagaIterator {
  try {
    if (keycloakAuth) {
      Promise.resolve(keycloakAuth.logout());
    }
  } catch (e) {
    yield put(ErrorNotification({ message: `Failed to tenant out: ${e.message}` }));
  }
}

export function* watchTenantSagas(): Generator {
  yield takeEvery(FETCH_TENANT, fetchTenant);
}
