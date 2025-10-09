import { Component, inject, signal, ViewChild, AfterViewInit, ChangeDetectionStrategy, ElementRef } from '@angular/core';
import { Router, RouterLink } from '@angular/router';
import { AuthService } from '../../../core/services/auth.service';
import { RoleService } from '../../../core/services/role.service';
import { UnlockPersonaModal } from '../unlock-persona-modal/unlock-persona-modal';

@Component({
  selector: 'app-navbar',
  imports: [RouterLink, UnlockPersonaModal],
  templateUrl: './navbar.html',
  styleUrl: './navbar.scss',
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export default class Navbar {
  authService = inject(AuthService);
  roleService = inject(RoleService);
  private router = inject(Router);

  @ViewChild('unlockModal') unlockModal!: UnlockPersonaModal;
  @ViewChild('toggleInput') toggleInput!: ElementRef<HTMLInputElement>;

  isUnlockModalOpen = signal(false);
  roleToUnlock = signal<'mentor' | 'mentee'>('mentor');

  handleRoleToggle() {
    if (this.roleService.canSwitchRoles()) {
      // Both roles unlocked - just toggle
      this.roleService.toggleRole();
    } else {
      // Role is locked - show modal
      const targetRole = this.roleService.activeRole() === 'mentor' ? 'mentee' : 'mentor';
      this.roleToUnlock.set(targetRole);
      this.isUnlockModalOpen.set(true);
      // Use setTimeout to ensure the modal is rendered before calling open
      setTimeout(() => {
        this.unlockModal?.open(targetRole);
      });
    }
  }

  onUnlockSuccess() {
    this.isUnlockModalOpen.set(false);
    this.roleService.setRole(this.roleToUnlock());
  }

  onModalClose() {
    this.isUnlockModalOpen.set(false);
    // Revert the toggle to match the current activeRole
    this.resetToggleState();
  }

  private resetToggleState() {
    if (this.toggleInput?.nativeElement) {
      const activeRole = this.roleService.activeRole();
      this.toggleInput.nativeElement.checked = activeRole === 'mentor';
    }
  }

  logout() {
    this.authService.logout().subscribe(() => {
      this.router.navigate(['/auth/login']);
    });
  }
}

