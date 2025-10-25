import { inject } from '@angular/core';
import { CanActivateFn, Router } from '@angular/router';
import { toObservable } from '@angular/core/rxjs-interop';
import { filter, map, take, timeout } from 'rxjs/operators';
import { RoleService } from '../services/role.service';

export const mentorGuard: CanActivateFn = () => {
  const roleService = inject(RoleService);
  const router = inject(Router);

  return toObservable(roleService.activeRole).pipe(
    filter(role => role !== null),
    take(1),
    timeout(5000),
    map(activeRole => {
      if (activeRole === 'mentor') {
        return true;
      }
      return router.createUrlTree(['/dashboard', activeRole]);
    })
  );
};
