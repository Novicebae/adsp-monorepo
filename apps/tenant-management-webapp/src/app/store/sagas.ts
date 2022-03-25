import { all, takeEvery, takeLatest } from 'redux-saga/effects';

// Sagas
import { fetchAccess } from './access/sagas';
import { fetchConfig } from './config/sagas';
import {
  fetchTenant,
  createTenant,
  isTenantAdmin,
  tenantAdminLogin,
  tenantCreationInitLogin,
  keycloakCheckSSO,
  tenantLogin,
  keycloakCheckSSOWithLogout,
  keycloakRefreshToken,
  tenantLogout,
  fetchRealmRoles,
} from './tenant/sagas';
import {
  deleteApplication,
  fetchServiceStatusApps,
  fetchStatusMetrics,
  saveApplication,
  setApplicationStatus,
  toggleApplicationStatus,
  updateStatusContactInformation,
  fetchStatusConfiguration,
} from './status/sagas';
import { watchEventSagas } from './event/sagas';
import { watchFileSagas } from './file/sagas';
import {
  fetchDirectory,
  createEntryDirectory,
  updateEntryDirectory,
  deleteEntryDirectory,
  fetchEntryDetail,
} from './directory/sagas';
import { watchNotificationSagas } from './notification/sagas';
import { watchSubscriptionSagas } from './subscription/sagas';

// Actions
import { FETCH_ACCESS_ACTION } from './access/actions';
import { FETCH_CONFIG_ACTION } from './config/actions';
import {
  FETCH_TENANT,
  CREATE_TENANT,
  CHECK_IS_TENANT_ADMIN,
  TENANT_ADMIN_LOGIN,
  TENANT_CREATION_LOGIN_INIT,
  KEYCLOAK_CHECK_SSO,
  TENANT_LOGIN,
  KEYCLOAK_CHECK_SSO_WITH_LOGOUT,
  KEYCLOAK_REFRESH_TOKEN,
  TENANT_LOGOUT,
  FETCH_REALM_ROLES,
} from './tenant/actions';
import { FETCH_DIRECTORY, CREATE_ENTRY, UPDATE_ENTRY, DELETE_ENTRY, FETCH_ENTRY_DETAIL } from './directory/actions';
import {
  DELETE_APPLICATION_ACTION,
  FETCH_SERVICE_STATUS_APPS_ACTION,
  FETCH_STATUS_METRICS_ACTION,
  SAVE_APPLICATION_ACTION,
  UPDATE_STATUS_CONTACT_INFORMATION,
  FETCH_STATUS_CONFIGURATION,
} from './status/actions';
import { SAVE_NOTICE_ACTION, GET_NOTICES_ACTION, DELETE_NOTICE_ACTION } from './notice/actions';
import { saveNotice, getNotices, deleteNotice } from './notice/sagas';
import { SET_APPLICATION_STATUS_ACTION } from './status/actions/setApplicationStatus';
import { TOGGLE_APPLICATION_STATUS_ACTION } from './status/actions/toggleApplication';

// eslint-disable-next-line  @typescript-eslint/explicit-module-boundary-types
export function* watchSagas() {
  yield takeEvery(FETCH_CONFIG_ACTION, fetchConfig);
  yield takeLatest(FETCH_ACCESS_ACTION, fetchAccess);

  // tenant and keycloak
  yield takeEvery(CHECK_IS_TENANT_ADMIN, isTenantAdmin);
  yield takeEvery(KEYCLOAK_CHECK_SSO, keycloakCheckSSO);
  yield takeEvery(TENANT_LOGIN, tenantLogin);
  yield takeEvery(KEYCLOAK_CHECK_SSO_WITH_LOGOUT, keycloakCheckSSOWithLogout);
  yield takeEvery(KEYCLOAK_REFRESH_TOKEN, keycloakRefreshToken);
  yield takeEvery(TENANT_LOGOUT, tenantLogout);

  //tenant config
  yield takeEvery(CREATE_TENANT, createTenant);
  yield takeLatest(FETCH_TENANT, fetchTenant);
  yield takeEvery(FETCH_REALM_ROLES, fetchRealmRoles);
  yield takeEvery(TENANT_ADMIN_LOGIN, tenantAdminLogin);
  yield takeEvery(TENANT_CREATION_LOGIN_INIT, tenantCreationInitLogin);

  //directory
  yield takeEvery(FETCH_DIRECTORY, fetchDirectory);
  yield takeEvery(CREATE_ENTRY, createEntryDirectory);
  yield takeEvery(UPDATE_ENTRY, updateEntryDirectory);
  yield takeEvery(DELETE_ENTRY, deleteEntryDirectory);
  yield takeEvery(FETCH_ENTRY_DETAIL, fetchEntryDetail);
  // service status
  yield takeEvery(FETCH_SERVICE_STATUS_APPS_ACTION, fetchServiceStatusApps);
  yield takeEvery(SAVE_APPLICATION_ACTION, saveApplication);
  yield takeEvery(DELETE_APPLICATION_ACTION, deleteApplication);
  yield takeEvery(SET_APPLICATION_STATUS_ACTION, setApplicationStatus);
  yield takeEvery(TOGGLE_APPLICATION_STATUS_ACTION, toggleApplicationStatus);
  yield takeEvery(UPDATE_STATUS_CONTACT_INFORMATION, updateStatusContactInformation);
  yield takeEvery(FETCH_STATUS_CONFIGURATION, fetchStatusConfiguration);
  yield takeLatest(FETCH_STATUS_METRICS_ACTION, fetchStatusMetrics);

  // notices
  yield takeEvery(SAVE_NOTICE_ACTION, saveNotice);
  yield takeEvery(GET_NOTICES_ACTION, getNotices);
  yield takeEvery(DELETE_NOTICE_ACTION, deleteNotice);

  yield all([
    // file service
    watchFileSagas(),
    // event
    watchEventSagas(),
    // notification
    watchNotificationSagas(),
    // subscription
    watchSubscriptionSagas(),
  ]);
}
