import { Injectable, computed, signal } from '@angular/core';
import { OAuthService } from 'angular-oauth2-oidc';
import { authConfig } from './auth-config';
import { environment } from '../../environments/environment';
import { ADMIN_ROLES, PORTAL_ROLES, realmRoles } from './roles';
import { SessionSede, SessionSedeService } from './session-sede.service';

export type LoginOptions = {
  /** Required: the hospital or blood bank chosen on the login page. */
  sede: SessionSede;
  /** Institutional email, pre-filled on the Keycloak page. */
  email?: string;
  /** Sign in through the Google identity provider configured in Keycloak. */
  google?: boolean;
};

@Injectable({
  providedIn: 'root',
})
export class AuthService {
  readonly isLoggedIn = signal(false);
  readonly roles = signal<string[]>([]);
  /** Clinical staff or network admin: may use the clinical portal. */
  readonly canUsePortal = computed(() => this.roles().some((r) => PORTAL_ROLES.includes(r)));
  readonly isNetworkAdmin = computed(() => this.roles().some((r) => ADMIN_ROLES.includes(r)));

  constructor(private oauthService: OAuthService, private sessionSede: SessionSedeService) {
    this.oauthService.configure(authConfig);
    this.oauthService.events.subscribe(() => this.refreshLoginState());
  }

  async init(): Promise<void> {
    await this.oauthService.loadDiscoveryDocumentAndTryLogin();
    // Back from Keycloak: the sede chosen before the redirect comes back in the OAuth state.
    this.sessionSede.restoreFromState(this.oauthService.state);
    this.refreshLoginState();
  }

  /**
   * Starts the existing Keycloak Authorization Code + PKCE flow. Credentials are typed on the
   * Keycloak page, never in the portal. The sede travels in the OAuth state.
   */
  login(options: LoginOptions): void {
    this.sessionSede.set(options.sede);
    const params: Record<string, string> = {};
    if (options.email?.trim()) params['login_hint'] = options.email.trim();
    if (options.google) params['kc_idp_hint'] = environment.keycloak.googleIdpHint;
    this.oauthService.initCodeFlow(SessionSedeService.encode(options.sede), params);
  }

  logout(): void {
    this.sessionSede.clear();
    this.oauthService.logOut();
  }

  getAccessToken(): string | null {
    return this.oauthService.getAccessToken();
  }

  get userClaims() {
    return this.oauthService.getIdentityClaims();
  }

  get userName(): string | null {
    const claims = this.userClaims as Record<string, unknown> | null;
    return (claims?.['name'] as string) ?? (claims?.['email'] as string) ?? null;
  }

  private refreshLoginState(): void {
    const loggedIn = this.oauthService.hasValidAccessToken();
    this.isLoggedIn.set(loggedIn);
    this.roles.set(loggedIn ? realmRoles(this.oauthService.getAccessToken()) : []);
  }
}
