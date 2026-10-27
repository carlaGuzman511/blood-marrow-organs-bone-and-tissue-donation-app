import { Injectable, signal } from '@angular/core';
import { PortalAccess } from './roles';

/** The hospital or blood bank the user works from in this session (US-WEB-01). */
export type SessionSede = {
  id: string;
  name: string;
  access: PortalAccess;
};

const STORAGE_KEY = 'vd.session.sede';

/**
 * Holds the session's sede. It is chosen on the login page, travels through Keycloak in the
 * OAuth `state` (so the sede that comes back is the one the login started with) and is kept in
 * sessionStorage, like the tokens, so it lasts for the tab and ends with the session.
 * Screens read it from here: never a hardcoded center id.
 */
@Injectable({ providedIn: 'root' })
export class SessionSedeService {
  readonly sede = signal<SessionSede | null>(SessionSedeService.read());

  set(sede: SessionSede): void {
    this.sede.set(sede);
    try {
      sessionStorage.setItem(STORAGE_KEY, JSON.stringify(sede));
    } catch {
      // Storage blocked: the sede still lives for this page.
    }
  }

  clear(): void {
    this.sede.set(null);
    try {
      sessionStorage.removeItem(STORAGE_KEY);
    } catch {
      // nothing to clear
    }
  }

  /** After the Keycloak redirect: the sede the login started with wins. */
  restoreFromState(state: string | null | undefined): void {
    const fromState = SessionSedeService.decode(state);
    if (fromState) this.set(fromState);
  }

  /** OAuth `state` payload (URL-safe, no ';' which the OAuth library uses as a separator). */
  static encode(sede: SessionSede): string {
    const json = JSON.stringify({ i: sede.id, n: sede.name, a: sede.access });
    return btoa(unescape(encodeURIComponent(json))).replace(/\+/g, '-').replace(/\//g, '_').replace(/=+$/, '');
  }

  static decode(state: string | null | undefined): SessionSede | null {
    if (!state) return null;
    try {
      const b64 = state.replace(/-/g, '+').replace(/_/g, '/');
      const value = JSON.parse(decodeURIComponent(escape(atob(b64))));
      if (typeof value?.i !== 'string' || typeof value?.n !== 'string') return null;
      return { id: value.i, name: value.n, access: value.a === 'admin' ? 'admin' : 'clinical' };
    } catch {
      return null;
    }
  }

  private static read(): SessionSede | null {
    try {
      const raw = sessionStorage.getItem(STORAGE_KEY);
      const value = raw ? JSON.parse(raw) : null;
      return value?.id && value?.name ? value : null;
    } catch {
      return null;
    }
  }
}
