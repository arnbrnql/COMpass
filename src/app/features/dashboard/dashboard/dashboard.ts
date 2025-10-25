import { ChangeDetectionStrategy, Component, effect, inject } from '@angular/core';
import { Router, RouterOutlet, NavigationEnd } from '@angular/router';
import { RoleService } from '../../../core/services/role.service';
import { filter } from 'rxjs/operators';
import { toSignal } from '@angular/core/rxjs-interop';

@Component({
  selector: 'app-dashboard',
  imports: [RouterOutlet],
  template: '<router-outlet></router-outlet>',
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export default class Dashboard {
  private roleService = inject(RoleService);
  private router = inject(Router);

  private navigationEnd = toSignal(
    this.router.events.pipe(filter((event): event is NavigationEnd => event instanceof NavigationEnd)),
    { initialValue: null }
  );

  private readonly initialRedirectEffect = effect(() => {
    const currentUrl = this.router.url;
    const activeRole = this.roleService.activeRole();

    if ((currentUrl === '/dashboard' || currentUrl === '/dashboard/') && activeRole !== null) {
      void this.router.navigate(['/dashboard', activeRole], { replaceUrl: true });
    }
  });

  private readonly navigationRedirectEffect = effect(() => {
    const event = this.navigationEnd();
    if (!event) {
      return;
    }

    const activeRole = this.roleService.activeRole();
    if (
      (event.urlAfterRedirects === '/dashboard' || event.urlAfterRedirects === '/dashboard/') &&
      activeRole !== null
    ) {
      void this.router.navigate(['/dashboard', activeRole], { replaceUrl: true });
    }
  });
}
