import { AuthConfig } from 'angular-oauth2-oidc';
import { KEYCLOAK_CLIENT_ID, KEYCLOAK_ISSUER } from './keycloak.config';

export const authConfig: AuthConfig = {
  issuer: KEYCLOAK_ISSUER,
  clientId: KEYCLOAK_CLIENT_ID,
  redirectUri: window.location.origin + '/',
  responseType: 'code',
  scope: 'openid profile email',
  strictDiscoveryDocumentValidation: false,
  showDebugInformation: false,
};
