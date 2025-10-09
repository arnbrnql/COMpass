import { Routes } from '@angular/router';
import { authGuard } from './core/guards/auth-guard';
import { mentorGuard } from './core/guards/mentor-guard';
import { menteeGuard } from './core/guards/mentee-guard';


export const routes: Routes = [
  { path: '', redirectTo: 'dashboard', pathMatch: 'full' },
  {
    path: 'auth',
    loadChildren: () => import('./features/auth/auth.routes').then(m => m.AUTH_ROUTES)
  },
  // Dashboard with child routes for mentor and mentee
  {
    path: 'dashboard',
    canActivate: [authGuard],
    loadComponent: () => import('./features/dashboard/dashboard/dashboard').then(m => m.default),
    children: [
      // Remove the automatic redirect - let Dashboard component handle it
      {
        path: 'mentor',
        canActivate: [mentorGuard],
        loadComponent: () => import('./features/dashboard/mentor-dashboard/mentor-dashboard/mentor-dashboard').then(m => m.default)
      },
      {
        path: 'mentee',
        canActivate: [menteeGuard],
        loadComponent: () => import('./features/dashboard/mentee-dashboard/mentee-dashboard/mentee-dashboard').then(m => m.default)
      }
    ]
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
  // Add this block for the session room
  {
    path: 'session/:id',
    loadComponent: () => import('./features/sessions/session-room/session-room'),
    canActivate: [authGuard],
  },
  // Add this block for the profile edit page
  {
    path: 'profile/edit',
    loadComponent: () => import('./features/profile/profile-edit/profile-edit'),
    canActivate: [authGuard],
  },
];
