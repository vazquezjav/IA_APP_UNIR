import { Routes } from '@angular/router';
import { HomeComponent } from './pages/home/home.component';
import { LiveMapComponent } from './pages/live-map/live-map.component';
import { LoginComponent } from './pages/login/login.component';
import { RegisterComponent } from './pages/register/register.component';
import { TeamComponent } from './pages/team/team.component';
import { AdminComponent } from './pages/admin/admin.component';
import { DashboardComponent } from './pages/dashboard/dashboard.component';
import { authGuard } from './guards/auth.guard';

export const routes: Routes = [
    { path: '', component: HomeComponent },
    { path: 'en-vivo', component: LiveMapComponent },
    { path: 'login', component: LoginComponent },
    { path: 'registro', component: RegisterComponent },
    { path: 'equipo', component: TeamComponent },
    {
        path: 'dashboard',
        component: DashboardComponent,
        canActivate: [authGuard]
    },
    {
        path: 'admin',
        component: AdminComponent,
        canActivate: [authGuard],
        data: { role: 'admin' }
    },
    { path: '**', redirectTo: '' }
];
