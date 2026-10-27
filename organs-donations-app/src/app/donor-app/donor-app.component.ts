import { ChangeDetectionStrategy, Component } from '@angular/core';
import { RouterLink } from '@angular/router';

/**
 * Public page for volunteer donors who land on the clinical portal (US-WEB-01): points them to
 * the DonaVida mobile app. Replace `donorAppUrl` in the environment files with the store link
 * once the app is published.
 */
@Component({
  selector: 'app-donor-app',
  standalone: true,
  imports: [RouterLink],
  changeDetection: ChangeDetectionStrategy.OnPush,
  template: `
    <main class="page">
      <section class="vd-card panel" aria-labelledby="donor-title">
        <span class="icon" aria-hidden="true"><span class="material-symbols-outlined">favorite</span></span>
        <span class="vd-badge vd-badge--info">Donadores voluntarios</span>
        <h1 id="donor-title" class="vd-headline-lg">DonaVida App</h1>
        <p class="vd-body-md">
          Agenda tu cita, revisa tu carnet de donación y recibe alertas de urgencias compatibles
          cerca de ti desde la app móvil DonaVida.
        </p>
        <p class="vd-body-sm muted">
          Este portal es de uso clínico para bancos de sangre, hospitales y CENATRA.
        </p>
        <a class="vd-btn vd-btn--subtle" routerLink="/login">Volver al acceso clínico</a>
      </section>
    </main>
  `,
  styles: `
    .page { min-height: 100vh; display: flex; align-items: center; justify-content: center; padding: var(--vd-space-md); box-sizing: border-box; }
    .panel { max-width: 32rem; text-align: center; display: flex; flex-direction: column; align-items: center; gap: var(--vd-space-sm); }
    .panel h1, .panel p { margin: 0; color: var(--vd-color-text); }
    .muted { color: var(--vd-color-text-muted) !important; }
    .icon { width: 3rem; height: 3rem; display: flex; align-items: center; justify-content: center; border-radius: var(--vd-radius-full); background: var(--vd-tone-info-bg); color: var(--vd-tone-info-fg); }
  `,
})
export class DonorAppComponent {}
