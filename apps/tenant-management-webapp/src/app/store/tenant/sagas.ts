import { put, select } from 'redux-saga/effects';
import { RootState } from '..';
import { ErrorNotification } from '../notifications/actions';
import { FetchTenantSuccess, UpdateTenantAdminInfo, CreateTenantSuccess } from './actions';
import { getToken } from '../../services/session';
import axios from 'axios';

const http = axios.create();
export function* fetchTenant(action) {
  const state: RootState = yield select();

  const token = getToken();
  if (!token) {
    yield put(ErrorNotification({ message: `failed to get auth token - ` }));
    return;
  }

  const headers = {
    Authorization: `Bearer ${token}`,
  };

  // TODO: create an api lib (like the ) that has the host pre-configured
  // TODO: create methods within -^ for each of the endpoint urls
  const host = state.config.tenantApi.host;
  const path = state.config.tenantApi.endpoints.tenantNameByRealm;
  const realm = action.payload;
  const url = `${host}${path}/${realm}`;

  try {
    const tenant = yield http.get(url, { headers });
    yield put(FetchTenantSuccess(tenant.data));
  } catch (e) {
    yield put(ErrorNotification({ message: `failed to fetch tenant: ${e.message}` }));
  }
}

export function* isTenantAdmin(action) {
  const email = action.payload;
  try {
    const state: RootState = yield select();

    const token = getToken();
    if (!token) {
      yield put(ErrorNotification({ message: `failed to get auth token - ` }));
      return;
    }

    const headers = {
      Authorization: `Bearer ${token}`,
      'Content-Type': 'application/json;charset=UTF-8',
    };

    const host = state.config.tenantApi.host;
    const path = state.config.tenantApi.endpoints.tenantByEmail;

    const data = {
      email: email,
    };
    const url = host + path;
    const response = yield http.post(url, data, { headers });
    const tenant = response.data.name;
    // This is the login navigation. Using window.local.href might be good enough
    window.location.href = `/${tenant}/login`;
  } catch (e) {
    // The user is not tenant admin yet. The user can create a new tenant
    if (e.response.status === 404) {
      window.location.href = '/Realms/CreateRealm';
    } else {
      yield put(ErrorNotification({ message: `failed to check tenant admin: ${e.message}` }));
    }
  }
}

export function* createTenant(action) {
  const state: RootState = yield select();
  const host = state.config.tenantApi.host;
  const path = state.config.tenantApi.endpoints.createTenant;
  const url = `${host}${path}`;
  const token = state?.session?.credentials?.token;

  if (!token) {
    yield put(ErrorNotification({ message: `failed to get auth token - ` }));
    return;
  }

  const headers = {
    Authorization: `Bearer ${token}`,
    'Content-Type': 'application/json;charset=UTF-8',
  };

  const tenantName = action.payload;

  try {
    yield http.post(
      url,
      {
        tenantName: tenantName,
        realm: tenantName,
      },
      { headers }
    );
    yield put(CreateTenantSuccess());
  } catch (e) {
    yield put(ErrorNotification({ message: `Failed to create new tenant: ${e.message}` }));
  }
}
