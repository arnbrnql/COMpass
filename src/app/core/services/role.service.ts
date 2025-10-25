import { Injectable, computed, effect, inject, signal } from '@angular/core';
import { Router } from '@angular/router';
import { AuthDomainService } from '../../domain/services/auth.service';
import { UserDomainService } from '../../domain/services/user.service';
import { firstValueFrom } from 'rxjs';

@Injectable({
  providedIn: 'root',
})
export class RoleService {
  private authService = inject(AuthDomainService);
  private userService = inject(UserDomainService);
  private router = inject(Router);

  activeRole = signal<'mentor' | 'mentee' | null>(null);
  private isInitialized = signal<boolean>(false);

  availableRoles = computed(() => {
    const profile = this.authService.currentUserProfile();
    return profile?.roleFlags || { isMentor: false, isMentee: false };
  });

  canSwitchRoles = computed(() => {
    const roles = this.availableRoles();
    return roles.isMentor && roles.isMentee;
  });

  private readonly initializeActiveRoleEffect = effect(() => {
    const profile = this.authService.currentUserProfile();
    const isLoaded = this.authService.isProfileLoaded();

    if (!isLoaded) {
      return;
    }

    if (!profile) {
      this.activeRole.set(null);
      this.isInitialized.set(false);
      return;
    }

    if (this.isInitialized()) {
      return;
    }

    let roleToSet: 'mentor' | 'mentee' | null = null;

    if (profile.activeRole) {
      roleToSet = profile.activeRole;
    } else if (profile.roleFlags.isMentee) {
      roleToSet = 'mentee';
    } else if (profile.roleFlags.isMentor) {
      roleToSet = 'mentor';
    }

    if (roleToSet && !profile.activeRole) {
      void firstValueFrom(
        this.userService.applyProfileChanges(profile.uid, { activeRole: roleToSet })
      ).catch(() => undefined);
    }

    if (roleToSet) {
      this.activeRole.set(roleToSet);
    }

    this.isInitialized.set(true);
  });

  async setRole(role: 'mentor' | 'mentee'): Promise<void> {
    const user = this.authService.currentUserProfile();
    if (!user) return;

    const currentActiveRole = this.activeRole();

    if (currentActiveRole === role) return;

    this.activeRole.set(role);

    try {
      await firstValueFrom(this.userService.applyProfileChanges(user.uid, { activeRole: role }));
    } catch {
      this.activeRole.set(currentActiveRole);
    }
  }

  async toggleRole(): Promise<void> {
    if (!this.canSwitchRoles()) return;

    const currentRole = this.activeRole();
    if (!currentRole) return;

    const newRole = currentRole === 'mentor' ? 'mentee' : 'mentor';
    await this.setRole(newRole);

    this.router.navigate(['/dashboard', newRole]);
  }
}
