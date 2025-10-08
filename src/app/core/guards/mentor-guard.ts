import { inject } from '@angular/core';
import { CanActivateFn, Router } from '@angular/router';
import { toObservable } from '@angular/core/rxjs-interop';
import { map } from 'rxjs/operators';
import { RoleService } from '../services/role.service';

export const mentorGuard: CanActivateFn = () => {
  const roleService = inject(RoleService);
  const router = inject(Router);

  return toObservable(roleService.activeRole).pipe(
    map(activeRole => {
      if (activeRole === 'mentor') {
        return true;
      } else {
        router.navigate(['/dashboard']);
        return false;
      }
    })
  );
};
