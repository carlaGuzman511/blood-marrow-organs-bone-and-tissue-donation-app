import { Routes } from '@angular/router';
import { HomeComponent } from './home/home.component';
import { DonationCenterComponent } from './donation-center/donation-center.component';
import { InformationComponent } from './information/information.component';
import { LoginComponent } from './login/login.component';
import { ReportsComponent } from './reports/reports.component';
import { authGuard } from './auth/auth.guard';

export const routes: Routes = [
    { path: 'home', component: HomeComponent, canActivate: [authGuard] },
    { path: 'donation-center', component: DonationCenterComponent, canActivate: [authGuard] },
    { path: 'info', component: InformationComponent, canActivate: [authGuard] },
    { path: 'login', component: LoginComponent },
    { path: 'reports', component: ReportsComponent, canActivate: [authGuard] },
    { path: '', redirectTo: 'home', pathMatch: 'full' },
    { path: '**', redirectTo: 'home' }
];
