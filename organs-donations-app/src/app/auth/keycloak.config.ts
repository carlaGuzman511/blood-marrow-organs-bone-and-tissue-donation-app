import { environment } from '../../environments/environment';

export const KEYCLOAK_URL = environment.keycloak.url;
export const KEYCLOAK_REALM = environment.keycloak.realm;
export const KEYCLOAK_CLIENT_ID = environment.keycloak.clientId;

export const KEYCLOAK_ISSUER = `${KEYCLOAK_URL}/realms/${KEYCLOAK_REALM}`;
