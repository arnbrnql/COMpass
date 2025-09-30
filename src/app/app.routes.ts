import { Routes } from '@angular/router';
import { authGuard } from './core/guards/auth-guard';


export const routes: Routes = [
  { path: '', redirectTo: 'auth', pathMatch: 'full' },
  {
    path: 'auth',
    loadChildren: () => import('./features/auth/auth.routes').then(m => m.AUTH_ROUTES)
  },
  // Add this new protected route:
  {
    path: 'dashboard',
    // The canActivate property uses our guard
    canActivate: [authGuard],
    loadComponent: () => import('./features/dashboard/dashboard/dashboard').then(m => m.default)
  },
  // Add this block for the mentors feature
  {
    path: 'discover-mentors',
    loadComponent: () => import('./features/mentors/discover/discover'),
    canActivate: [authGuard],
  },
  // Add this block for the mentor profile page
  {
    path: 'mentors/:id',
    loadComponent: () => import('./features/mentors/mentor-profile/mentor-profile'),
    canActivate: [authGuard],
  },
];
