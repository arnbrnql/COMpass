import { ChangeDetectionStrategy, Component, inject } from '@angular/core';
import { RouterLink } from '@angular/router';
import { AuthService } from '../../../core/services/auth.service';
import { RoleService } from '../../../core/services/role.service';

@Component({
  selector: 'app-navbar',
  imports: [RouterLink],
  templateUrl: './navbar.html',
  styleUrl: './navbar.scss',
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export default class Navbar {
  authService = inject(AuthService);
  roleService = inject(RoleService);

  logout() {
    this.authService.logout().subscribe();
  }

  setRole(role: 'mentor' | 'mentee') {
    this.roleService.setActiveRole(role);
  }
}
