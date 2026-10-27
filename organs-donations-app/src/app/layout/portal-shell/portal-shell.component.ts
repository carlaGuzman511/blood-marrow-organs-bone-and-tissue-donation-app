import { ChangeDetectionStrategy, Component, computed, inject } from '@angular/core';
import { Router, RouterLink, RouterLinkActive, RouterOutlet } from '@angular/router';
import { AuthService } from '../../auth/auth.service';
import { SessionSedeService } from '../../auth/session-sede.service';

type NavItem = { path: string; label: string; icon: string };

/** Portal frame from the Stitch portal screens: sidebar, top bar with the session sede and user. */
@Component({
  selector: 'app-portal-shell',
  standalone: true,
  imports: [RouterOutlet, RouterLink, RouterLinkActive],
  templateUrl: './portal-shell.component.html',
  styleUrl: './portal-shell.component.css',
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class PortalShellComponent {
  private readonly authService = inject(AuthService);
  private readonly sessionSede = inject(SessionSedeService);
  private readonly router = inject(Router);

  /** Only screens that exist today; the rest of the Stitch menu arrives with its stories. */
  readonly nav: NavItem[] = [
    { path: '/home', label: 'Dashboard General', icon: 'grid_view' },
    { path: '/donation-center', label: 'Centros y Sedes', icon: 'local_hospital' },
    { path: '/solicitudes', label: 'Solicitudes y Urgencias', icon: 'emergency_home' },
    { path: '/reports', label: 'Auditoría Hemoterápica', icon: 'chips' },
    { path: '/info', label: 'Módulo Educativo CMS', icon: 'school' },
  ];

  readonly sede = this.sessionSede.sede;
  readonly userName = computed(() => (this.authService.isLoggedIn() ? this.authService.userName : null));
  readonly roleLabel = computed(() =>
    this.authService.isNetworkAdmin() ? 'Coordinación CENATRA (Admin)' : 'Personal clínico',
  );

  /** Pick another sede: back to the login page, without signing in again. */
  changeSede(): void {
    this.sessionSede.clear();
    this.router.navigateByUrl('/login');
  }

  logout(): void {
    this.authService.logout();
  }
}
