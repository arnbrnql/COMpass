import {
  ChangeDetectionStrategy,
  Component,
  afterNextRender,
  computed,
  effect,
  inject,
  signal,
  viewChild,
} from '@angular/core';
import { Router, RouterLink } from '@angular/router';
import { firstValueFrom } from 'rxjs';

import { AuthService } from '../../../core/services/auth.service';
import { RoleService } from '../../../core/services/role.service';
import CalComSetupGuide from '../../../features/mentorship/cal-com-setup-guide/cal-com-setup-guide';
import { getInitialsAvatar } from '../../utils/avatar';
import { UnlockRoleModal } from '../unlock-role-modal/unlock-role-modal';

@Component({
  selector: 'app-navbar',
  imports: [RouterLink, UnlockRoleModal, CalComSetupGuide],
  templateUrl: './navbar.html',
  styleUrl: './navbar.scss',
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export default class Navbar {
  private authService = inject(AuthService);
  private roleService = inject(RoleService);
  private router = inject(Router);

  protected readonly isAuthenticated = this.authService.isAuthenticated;
  protected readonly currentUser = this.authService.currentUserProfile;
  protected readonly availableRoles = this.roleService.availableRoles;
  protected readonly activeRole = computed(() => this.roleService.activeRole());
  protected readonly isMentorActive = computed(() => this.activeRole() === 'mentor');
  protected readonly isMenteeActive = computed(() => this.activeRole() === 'mentee');
  protected readonly hasActiveRole = computed(() => this.activeRole() !== null);
  protected readonly avatarSrc = computed(() => {
    const user = this.currentUser();
    const photoUrl = user?.photoURL?.trim();
    return photoUrl && photoUrl.length > 0
      ? photoUrl
      : getInitialsAvatar(user?.displayName, { size: 40 });
  });

  protected readonly isUnlockModalOpen = signal(false);
  private readonly unlockModalRole = signal<'mentor' | 'mentee'>('mentor');
  protected readonly showCalComSetup = signal(false);

  private readonly unlockModalRef = viewChild(UnlockRoleModal);

  private readonly _triggerUnlockModal = effect(() => {
    if (!this.isUnlockModalOpen()) {
      return;
    }

    const modal = this.unlockModalRef();
    if (!modal) {
      return;
    }

    modal.open(this.unlockModalRole());
  });

  switchToRole(targetRole: 'mentor' | 'mentee') {
    const currentRole = this.roleService.activeRole();

    if (currentRole === targetRole) {
      return;
    }

    const roles = this.roleService.availableRoles();
    const hasTargetRole = targetRole === 'mentor' ? roles.isMentor : roles.isMentee;

    if (hasTargetRole) {
      this.roleService.setRole(targetRole);
      this.router.navigate(['/dashboard', targetRole]);
    } else {
      // Role is locked - show unlock modal
      this.unlockModalRole.set(targetRole);
      this.isUnlockModalOpen.set(true);
    }
  }

  async onUnlockSuccess(event: { role: 'mentor' | 'mentee' }) {
    this.isUnlockModalOpen.set(false);

    try {
      // The activeRole is already set in the unlock modal, so just update the local state
      this.roleService.activeRole.set(event.role);

      // Give the continuous watch a moment to sync the updated profile
      await new Promise(resolve => setTimeout(resolve, 800));

      if (event.role === 'mentor') {
        // Show Cal.com setup immediately for new mentors
        this.showCalComSetup.set(true);
      } else {
        // Navigate to mentee dashboard
        await this.router.navigate(['/dashboard', 'mentee']);
      }
    } catch (error) {
      console.error('Error during role unlock:', error);
      // Still try to navigate even if there's an error
      await this.router.navigate(['/dashboard', event.role]);
    }
  }

  closeCalComSetup() {
    this.showCalComSetup.set(false);
    this.router.navigate(['/dashboard', 'mentor']);
  }

  onCalComSetupComplete(username: string) {
    this.showCalComSetup.set(false);
    this.router.navigate(['/dashboard', 'mentor']);
  }

  onModalClose() {
    this.isUnlockModalOpen.set(false);
  }

  async logout() {
    await firstValueFrom(this.authService.logout());
  }
}

