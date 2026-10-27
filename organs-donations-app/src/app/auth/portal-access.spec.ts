import { TestBed } from '@angular/core/testing';
import { signal } from '@angular/core';
import { ActivatedRouteSnapshot, Router, RouterStateSnapshot, UrlTree, provideRouter } from '@angular/router';
import { realmRoles } from './roles';
import { SessionSede, SessionSedeService } from './session-sede.service';
import { portalGuard } from './auth.guard';
import { AuthService } from './auth.service';

/** Builds an unsigned JWT with the given payload (only the payload is read client-side). */
function jwt(payload: object): string {
  const b64 = (o: object) => btoa(JSON.stringify(o)).replace(/\+/g, '-').replace(/\//g, '_').replace(/=+$/, '');
  return `${b64({ alg: 'none' })}.${b64(payload)}.sig`;
}

describe('realmRoles', () => {
  it('reads realm_access.roles lower-cased', () => {
    expect(realmRoles(jwt({ realm_access: { roles: ['Clinical_Staff', 'offline_access'] } }))).toEqual([
      'clinical_staff',
      'offline_access',
    ]);
  });

  it('is empty for a missing or broken token', () => {
    expect(realmRoles(null)).toEqual([]);
    expect(realmRoles('not-a-jwt')).toEqual([]);
    expect(realmRoles(jwt({ sub: 'x' }))).toEqual([]);
  });
});

describe('SessionSedeService', () => {
  const sede: SessionSede = { id: 'c-1', name: 'Hospital Viedma – Banco de Sangre', access: 'clinical' };

  beforeEach(() => sessionStorage.clear());

  it('round-trips the sede through the OAuth state (no ";" separator, accents kept)', () => {
    const state = SessionSedeService.encode(sede);
    expect(state).not.toContain(';');
    expect(SessionSedeService.decode(state)).toEqual(sede);
  });

  it('keeps the sede for the tab and clears it on sign-out', () => {
    const service = new SessionSedeService();
    service.set(sede);
    expect(new SessionSedeService().sede()).toEqual(sede);
    service.clear();
    expect(new SessionSedeService().sede()).toBeNull();
  });

  it('takes the sede that comes back from Keycloak', () => {
    const service = new SessionSedeService();
    service.restoreFromState(SessionSedeService.encode({ ...sede, access: 'admin' }));
    expect(service.sede()?.access).toBe('admin');
    service.restoreFromState('garbage');
    expect(service.sede()?.access).toBe('admin');
  });
});

describe('portalGuard', () => {
  const loggedIn = signal(true);
  const canUsePortal = signal(true);
  let sede: SessionSedeService;

  function run(): boolean | UrlTree {
    return TestBed.runInInjectionContext(() =>
      portalGuard({} as ActivatedRouteSnapshot, {} as RouterStateSnapshot),
    ) as boolean | UrlTree;
  }
  const url = (result: boolean | UrlTree) => (result instanceof UrlTree ? TestBed.inject(Router).serializeUrl(result) : result);

  beforeEach(() => {
    sessionStorage.clear();
    TestBed.configureTestingModule({
      providers: [provideRouter([]), { provide: AuthService, useValue: { isLoggedIn: loggedIn, canUsePortal } }],
    });
    sede = TestBed.inject(SessionSedeService);
    loggedIn.set(true);
    canUsePortal.set(true);
    sede.set({ id: 'c-1', name: 'Sede A', access: 'clinical' });
  });

  it('lets clinical staff with a sede in', () => {
    expect(run()).toBeTrue();
  });

  it('sends anonymous users to the login', () => {
    loggedIn.set(false);
    expect(url(run())).toBe('/login');
  });

  it('shows "not authorized" to a donor instead of an empty dashboard', () => {
    canUsePortal.set(false);
    expect(url(run())).toBe('/no-autorizado');
  });

  it('asks for a sede when the session has none', () => {
    sede.clear();
    expect(url(run())).toBe('/login');
  });
});
