import { inject } from '@angular/core';
import { CanActivateFn, Router } from '@angular/router';
import { AuthService } from '../services/auth.service';
import { map } from 'rxjs';

export const authGuard: CanActivateFn = (route, state) => {
  const authService = inject(AuthService);
  const router = inject(Router);

  // If the user signal has a value, they are logged in. Allow access.
  if (authService.currentUser()) {
    return true;
  }

  // If not logged in, redirect them to the login page.
  return router.createUrlTree(['/auth/login']);
};
