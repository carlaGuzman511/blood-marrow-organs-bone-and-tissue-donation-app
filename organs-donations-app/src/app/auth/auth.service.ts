import { Injectable, signal } from '@angular/core';
import { OAuthService } from 'angular-oauth2-oidc';
import { authConfig } from './auth-config';

@Injectable({
  providedIn: 'root',
})
export class AuthService {
  readonly isLoggedIn = signal(false);

  constructor(private oauthService: OAuthService) {
    this.oauthService.configure(authConfig);
    this.oauthService.events.subscribe(() => this.refreshLoginState());
  }

  async init(): Promise<void> {
    await this.oauthService.loadDiscoveryDocumentAndTryLogin();
    this.refreshLoginState();
  }

  login(): void {
    this.oauthService.initCodeFlow();
  }

  logout(): void {
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
    this.isLoggedIn.set(this.oauthService.hasValidAccessToken());
  }
}
