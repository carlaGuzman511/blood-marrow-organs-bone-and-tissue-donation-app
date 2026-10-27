import { Routes } from '@angular/router';
import { HomeComponent } from './home/home.component';
import { DonationCenterComponent } from './donation-center/donation-center.component';
import { InformationComponent } from './information/information.component';
import { LoginComponent } from './login/login.component';
import { ReportsComponent } from './reports/reports.component';
import { portalGuard } from './auth/auth.guard';
import { PortalShellComponent } from './layout/portal-shell/portal-shell.component';
import { UnauthorizedComponent } from './unauthorized/unauthorized.component';
import { DonorAppComponent } from './donor-app/donor-app.component';

export const routes: Routes = [
    // Public
    { path: 'login', component: LoginComponent },
    { path: 'no-autorizado', component: UnauthorizedComponent },
    { path: 'donantes', component: DonorAppComponent },

    // Clinical portal: clinical role + session sede (US-WEB-01)
    {
        path: '',
        component: PortalShellComponent,
        canActivate: [portalGuard],
        canActivateChild: [portalGuard],
        children: [
            {
                path: 'solicitudes',
                loadComponent: () => import('./requests/requests.component').then(m => m.RequestsComponent),
                title: 'Solicitudes y Urgencias · Vitalis DonaVida',
            },
            { path: 'home', component: HomeComponent },
            { path: 'donation-center', component: DonationCenterComponent },
            { path: 'info', component: InformationComponent },
            { path: 'reports', component: ReportsComponent },
            { path: '', redirectTo: 'solicitudes', pathMatch: 'full' },
        ],
    },
    { path: '**', redirectTo: '' }
];
