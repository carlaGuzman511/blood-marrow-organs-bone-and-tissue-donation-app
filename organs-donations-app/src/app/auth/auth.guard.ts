import { inject } from '@angular/core';
import { CanActivateFn, Router } from '@angular/router';
import { AuthService } from './auth.service';
import { SessionSedeService } from './session-sede.service';

/** Signed in, nothing more. */
export const authGuard: CanActivateFn = () => {
  const authService = inject(AuthService);
  const router = inject(Router);

  if (authService.isLoggedIn()) {
    return true;
  }

  return router.createUrlTree(['/login']);
};

/**
 * The clinical portal (US-WEB-01): signed in, with a clinical or admin role, and with a sede
 * for the session. A donor gets the "not authorized" page instead of an empty dashboard; a
 * session without a sede goes back to the login page to pick one (no new sign-in needed).
 */
export const portalGuard: CanActivateFn = () => {
  const authService = inject(AuthService);
  const sessionSede = inject(SessionSedeService);
  const router = inject(Router);

  if (!authService.isLoggedIn()) return router.createUrlTree(['/login']);
  if (!authService.canUsePortal()) return router.createUrlTree(['/no-autorizado']);
  if (!sessionSede.sede()) return router.createUrlTree(['/login']);
  return true;
};
