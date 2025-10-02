import { Injectable, computed, effect, inject, signal } from '@angular/core';
import { AuthService } from './auth.service';

@Injectable({
  providedIn: 'root',
})
export class RoleService {
  private authService = inject(AuthService);

  // The currently active role ('mentor' or 'mentee')
  activeRole = signal<'mentor' | 'mentee' | null>(null);

  // Available roles now come directly from the AuthService's profile signal
  availableRoles = computed(() => {
    const profile = this.authService.currentUserProfile();
    if (!profile) {
      return { isMentor: false, isMentee: false };
    }
    return profile.roleFlags;
  });

  // A flag to determine if the role switcher should be visible
  canSwitchRoles = computed(() => {
    const roles = this.availableRoles();
    return roles.isMentor && roles.isMentee;
  });

  constructor() {
    // Effect to set the default active role when the user profile loads
    effect(() => {
      const roles = this.availableRoles();
      if (roles.isMentee) {
        this.activeRole.set('mentee');
      } else if (roles.isMentor) {
        this.activeRole.set('mentor');
      } else {
        this.activeRole.set(null);
      }
    });
  }

  // Method to switch the active role
  setActiveRole(role: 'mentor' | 'mentee') {
    this.activeRole.set(role);
  }
}
