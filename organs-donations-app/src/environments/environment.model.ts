/**
 * Shape shared by every environment file, so a missing or misspelled key in one of them
 * fails the build instead of producing `undefined` at runtime.
 *
 * Everything here ends up in the public JS bundle: only put public values here
 * (URLs, realm, public OIDC client id) — never secrets.
 */
export interface Environment {
  production: boolean;
  /** Base URL of the .NET API, including the `/api` prefix, without a trailing slash. */
  apiUrl: string;
  keycloak: {
    url: string;
    realm: string;
    clientId: string;
    /** Alias of the Google identity provider in the realm (sent as kc_idp_hint). */
    googleIdpHint: string;
  };
  /** Where volunteer donors go from the portal login: mobile app landing or store page (US-WEB-01). */
  donorAppUrl: string;
}
