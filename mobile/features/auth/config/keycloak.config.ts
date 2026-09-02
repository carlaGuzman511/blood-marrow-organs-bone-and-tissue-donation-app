import Constants from "expo-constants";

const extra = Constants.expoConfig?.extra ?? {};

export const KEYCLOAK_URL = (extra.KEYCLOAK_URL as string) ?? "";
export const KEYCLOAK_REALM = (extra.KEYCLOAK_REALM as string) ?? "";
export const KEYCLOAK_CLIENT_ID = (extra.KEYCLOAK_CLIENT_ID as string) ?? "";

export const KEYCLOAK_ISSUER = `${KEYCLOAK_URL}/realms/${KEYCLOAK_REALM}`;

export const KEYCLOAK_SCOPES = ["openid", "profile", "email"];
