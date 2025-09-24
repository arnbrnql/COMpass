import { Routes } from '@angular/router';

export const routes: Routes = [
  // Redirect root to the auth page for now
  { path: '', redirectTo: 'auth', pathMatch: 'full' },
  // Lazy load the auth routes
  {
    path: 'auth',
    loadChildren: () => import('./features/auth/auth.routes').then(m => m.AUTH_ROUTES)
  }
  // We will add our guarded dashboard route here later!
];
