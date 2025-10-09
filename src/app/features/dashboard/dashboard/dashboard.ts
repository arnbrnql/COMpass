import { ChangeDetectionStrategy, Component, inject, effect, DestroyRef } from '@angular/core';
import { Router, RouterOutlet, NavigationEnd } from '@angular/router';
import { RoleService } from '../../../core/services/role.service';
import { filter } from 'rxjs/operators';
import { takeUntilDestroyed } from '@angular/core/rxjs-interop';

@Component({
  selector: 'app-dashboard',
  imports: [RouterOutlet],
  template: '<router-outlet></router-outlet>',
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export default class Dashboard {
  private roleService = inject(RoleService);
  private router = inject(Router);
  private destroyRef = inject(DestroyRef);

  constructor() {
    console.log('[Dashboard] Component constructed');

    // effect() MUST be called in constructor (injection context)
    // This waits for activeRole to be set, then redirects to the appropriate dashboard
    effect(() => {
      const currentUrl = this.router.url;
      const activeRole = this.roleService.activeRole();

      console.log('[Dashboard] Effect triggered - URL:', currentUrl, 'activeRole:', activeRole);

      // Only redirect if we're at the base /dashboard route and activeRole is loaded
      // For single-role users: redirects to their only available role
      // For dual-role users: redirects to mentee (default priority)
      if (
        (currentUrl === '/dashboard' || currentUrl === '/dashboard/') &&
        activeRole !== null
      ) {
        console.log('[Dashboard] Redirecting to:', '/dashboard/' + activeRole);
        // Use replaceUrl to avoid adding to browser history
        this.router.navigate(['/dashboard', activeRole], { replaceUrl: true });
      }
    });

    // Also listen to navigation events to handle when user clicks "Compass" button
    // This ensures we redirect even when navigating from /dashboard/mentor to /dashboard
    this.router.events
      .pipe(
        filter(event => event instanceof NavigationEnd),
        takeUntilDestroyed(this.destroyRef)
      )
      .subscribe((event: NavigationEnd) => {
        console.log('[Dashboard] Navigation ended - URL:', event.urlAfterRedirects);

        // If we ended up at /dashboard without a role, redirect to the active role
        const activeRole = this.roleService.activeRole();
        if (
          (event.urlAfterRedirects === '/dashboard' || event.urlAfterRedirects === '/dashboard/') &&
          activeRole !== null
        ) {
          console.log('[Dashboard] Navigation to base /dashboard detected, redirecting to:', '/dashboard/' + activeRole);
          this.router.navigate(['/dashboard', activeRole], { replaceUrl: true });
        }
      });
  }
}
