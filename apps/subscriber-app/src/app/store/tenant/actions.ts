export const TENANT_LOGIN = 'TENANT_LOGIN';
export const KEYCLOAK_CHECK_SSO = 'KEYCLOAK_CHECK_SSO';
export const KEYCLOAK_CHECK_SSO_WITH_LOGOUT = 'KEYCLOAK_CHECK_SSO_WITH_LOGOUT';
export const KEYCLOAK_REFRESH_TOKEN = 'KEYCLOAK_REFRESH_TOKEN';
export const TENANT_LOGOUT = 'TENANT_LOGOUT';

export interface KeycloakCheckSSOAction {
  type: typeof KEYCLOAK_CHECK_SSO;
  payload: string;
}

export interface KeycloakCheckSSOWithLogOutAction {
  type: typeof KEYCLOAK_CHECK_SSO_WITH_LOGOUT;
  payload: string;
}

export interface TenantLoginAction {
  type: typeof TENANT_LOGIN;
  payload: string;
}

interface KeycloakRefreshTokenAction {
  type: typeof KEYCLOAK_REFRESH_TOKEN;
  payload: string;
}

interface TenantLogoutAction {
  type: typeof TENANT_LOGOUT;
}
export type ActionType = TenantLoginAction | KeycloakRefreshTokenAction | TenantLogoutAction | KeycloakCheckSSOAction;

export const TenantLogin = (realm: string): TenantLoginAction => ({
  type: 'TENANT_LOGIN',
  payload: realm,
});

export const KeycloakCheckSSO = (realm: string): KeycloakCheckSSOAction => ({
  type: 'KEYCLOAK_CHECK_SSO',
  payload: realm,
});

export const KeycloakCheckSSOWithLogout = (realm: string): KeycloakCheckSSOWithLogOutAction => ({
  type: 'KEYCLOAK_CHECK_SSO_WITH_LOGOUT',
  payload: realm,
});

export const KeycloakRefreshToken = (realm?: string): KeycloakRefreshTokenAction => ({
  type: 'KEYCLOAK_REFRESH_TOKEN',
  payload: realm,
});

export const TenantLogout = (): TenantLogoutAction => ({
  type: 'TENANT_LOGOUT',
});
