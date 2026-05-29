import { Routes } from '@angular/router';
import { HomeComponent } from './home/home.component';
import { DonationCenterComponent } from './donation-center/donation-center.component';
import { InformationComponent } from './information/information.component';

export const routes: Routes = [
    { path: 'home', component: HomeComponent },  
    { path: 'donation-center', component: DonationCenterComponent },   
    { path: 'info', component: InformationComponent },   
    { path: '', redirectTo: 'home', pathMatch: 'full' },
    { path: '**', redirectTo: 'home' } 
];
