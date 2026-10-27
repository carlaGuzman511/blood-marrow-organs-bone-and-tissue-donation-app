import { ChangeDetectionStrategy, Component, inject } from '@angular/core';
import { AuthService } from '../auth/auth.service';
import { environment } from '../../environments/environment';

/** Shown to signed-in users without a clinical role (e.g. donors) instead of an empty portal. */
@Component({
  selector: 'app-unauthorized',
  standalone: true,
  changeDetection: ChangeDetectionStrategy.OnPush,
  template: `
    <main class="page">
      <section class="vd-card panel" role="alert" aria-labelledby="unauthorized-title">
        <span class="icon" aria-hidden="true"><span class="material-symbols-outlined">block</span></span>
        <h1 id="unauthorized-title" class="vd-headline-lg">Acceso no autorizado</h1>
        <p class="vd-body-md vd-text-muted">
          El Portal Clínico es solo para personal de bancos de sangre, hospitales y coordinación CENATRA.
          Tu cuenta no tiene un rol clínico asignado.
        </p>
        <p class="vd-body-md vd-text-muted">Si eres donador voluntario, usa la app DonaVida.</p>
        <div class="actions">
          <a class="vd-btn vd-btn--secondary" [href]="donorAppUrl">Ir a DonaVida App</a>
          <button type="button" class="vd-btn vd-btn--subtle" (click)="logout()">Cerrar sesión</button>
        </div>
      </section>
    </main>
  `,
  styles: `
    .page { min-height: 100vh; display: flex; align-items: center; justify-content: center; padding: var(--vd-space-md); box-sizing: border-box; }
    .panel { max-width: 32rem; text-align: center; display: flex; flex-direction: column; align-items: center; gap: var(--vd-space-sm); }
    .panel h1, .panel p { margin: 0; color: var(--vd-color-text); }
    .panel p { color: var(--vd-color-text-muted); }
    .icon { width: 3rem; height: 3rem; display: flex; align-items: center; justify-content: center; border-radius: var(--vd-radius-full); background: var(--vd-tone-urgent-bg); color: var(--vd-tone-urgent-fg); }
    .actions { display: flex; flex-wrap: wrap; gap: var(--vd-space-sm); justify-content: center; margin-top: var(--vd-space-sm); }
  `,
})
export class UnauthorizedComponent {
  private readonly authService = inject(AuthService);
  readonly donorAppUrl = environment.donorAppUrl;

  logout(): void {
    this.authService.logout();
  }
}
