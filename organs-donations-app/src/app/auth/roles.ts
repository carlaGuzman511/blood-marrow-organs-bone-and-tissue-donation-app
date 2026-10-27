/**
 * Keycloak realm roles, as the API names them (Models/Security/AppRoles). Compared lower-cased.
 * The clinical portal is for hospital/blood-bank staff and network admins; donors use the app.
 */
export const ROLE_DONOR = 'donor';
export const ROLE_CLINICAL_STAFF = 'clinical_staff';
export const ROLE_NETWORK_ADMIN = 'network_admin';
/** Old name of network_admin, still accepted by the API. */
export const ROLE_LEGACY_ADMIN = 'admin';

export const PORTAL_ROLES = [ROLE_CLINICAL_STAFF, ROLE_NETWORK_ADMIN, ROLE_LEGACY_ADMIN];
export const ADMIN_ROLES = [ROLE_NETWORK_ADMIN, ROLE_LEGACY_ADMIN];

/** The two login tabs: Banco / Hospital and Admin / CENATRA. */
export type PortalAccess = 'clinical' | 'admin';

/** Realm roles in an access token (`realm_access.roles`), lower-cased. Empty for a bad token. */
export function realmRoles(accessToken: string | null | undefined): string[] {
  if (!accessToken) return [];
  try {
    const payload = accessToken.split('.')[1];
    const json = atob(payload.replace(/-/g, '+').replace(/_/g, '/'));
    const roles = JSON.parse(json)?.realm_access?.roles;
    return Array.isArray(roles) ? roles.map((r: unknown) => String(r).toLowerCase()) : [];
  } catch {
    return [];
  }
}
