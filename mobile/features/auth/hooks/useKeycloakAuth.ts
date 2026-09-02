import * as AuthSession from "expo-auth-session";
import { KEYCLOAK_ISSUER, KEYCLOAK_CLIENT_ID, KEYCLOAK_SCOPES } from "../config/keycloak.config";

export function useKeycloakAuth() {
  const discovery = AuthSession.useAutoDiscovery(KEYCLOAK_ISSUER);
  const redirectUri = AuthSession.makeRedirectUri({ scheme: "myapp", path: "auth" });

  const [request, response, promptAsync] = AuthSession.useAuthRequest(
    {
      clientId: KEYCLOAK_CLIENT_ID,
      redirectUri,
      responseType: AuthSession.ResponseType.Code,
      usePKCE: true,
      scopes: KEYCLOAK_SCOPES,
    },
    discovery
  );

  return { request, response, promptAsync, discovery, redirectUri };
}
