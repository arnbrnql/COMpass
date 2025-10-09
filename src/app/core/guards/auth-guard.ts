import { inject } from '@angular/core';
import { CanActivateFn, Router } from '@angular/router';
import { AuthService } from '../services/auth.service';
import { toObservable } from '@angular/core/rxjs-interop';
import { filter, map, take, timeout } from 'rxjs/operators';
import { combineLatest } from 'rxjs';

export const authGuard: CanActivateFn = (route, state) => {
  const authService = inject(AuthService);
  const router = inject(Router);

  // Wait for both auth state AND profile to be loaded before deciding
  return combineLatest([
    toObservable(authService.currentUser),
    toObservable(authService.isProfileLoaded)
  ]).pipe(
    // Wait until profile loading is complete
    filter(([user, isLoaded]) => isLoaded),
    take(1),
    timeout(5000), // Add timeout to prevent infinite waiting
    map(([user, isLoaded]) => {
      if (user) {
        return true;
      }
      // If not logged in, redirect to login
      return router.createUrlTree(['/auth/login']);
    })
  );
};
