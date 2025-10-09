import { Injectable, computed, effect, inject, signal } from '@angular/core';
import { Router } from '@angular/router';
import { AuthService } from './auth.service';
import { UserService } from './user.service';
import { firstValueFrom } from 'rxjs';

@Injectable({
  providedIn: 'root',
})
export class RoleService {
  private authService = inject(AuthService);
  private userService = inject(UserService);
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

  constructor() {
    console.log('[RoleService] Constructor - initializing');
    // This effect sets the role when profile loads
    effect(() => {
      const profile = this.authService.currentUserProfile();
      const isLoaded = this.authService.isProfileLoaded();

      console.log('[RoleService] Effect triggered - isLoaded:', isLoaded, 'profile:', profile ? profile.uid : 'null', 'isInitialized:', this.isInitialized());

      // Only proceed once profile loading is complete
      if (!isLoaded) {
        console.log('[RoleService] Waiting for profile to load...');
        return;
      }

      if (!profile) {
        console.log('[RoleService] No profile found, clearing activeRole and resetting initialization');
        this.activeRole.set(null);
        // Reset initialization flag so we can re-initialize when user logs in
        this.isInitialized.set(false);
        return;
      }

      // Initialize or re-initialize when we have a profile
      // This prevents the loop: we read from profile once per login session
      if (!this.isInitialized()) {
        console.log('[RoleService] Initializing role for logged-in user');
        // Check if user has a saved activeRole preference
        if (profile.activeRole) {
          console.log('[RoleService] Setting activeRole from profile:', profile.activeRole);
          this.activeRole.set(profile.activeRole);
        } else {
          // Determine role based on availability:
          // - Single role (mentee-only): navigate to /dashboard/mentee
          // - Single role (mentor-only): navigate to /dashboard/mentor
          // - Both roles: default to /dashboard/mentee
          if (profile.roleFlags.isMentee) {
            console.log('[RoleService] User has mentee role, setting as active');
            this.activeRole.set('mentee');
          } else if (profile.roleFlags.isMentor) {
            console.log('[RoleService] User has mentor role (no mentee), setting as active');
            this.activeRole.set('mentor');
          }
        }
        console.log('[RoleService] Initialization complete. Final activeRole:', this.activeRole());
        console.log('[RoleService] Available roles:', profile.roleFlags);
        this.isInitialized.set(true);
      } else {
        console.log('[RoleService] Already initialized, skipping');
      }
    });
  }

  async setRole(role: 'mentor' | 'mentee'): Promise<void> {
    const user = this.authService.currentUserProfile();
    if (!user) return;

    // Only update if the role is actually changing
    if (user.activeRole === role) return;

    // Update local state immediately for UI responsiveness
    this.activeRole.set(role);

    // Update Firestore in the background
    try {
      await firstValueFrom(this.userService.updateUserProfile(user.uid, { activeRole: role }));
    } catch (error) {
      console.error('Failed to update role in Firestore:', error);
      // Revert on error
      this.activeRole.set(user.activeRole || null);
    }
  }

  async toggleRole(): Promise<void> {
    if (!this.canSwitchRoles()) return;

    const currentRole = this.activeRole();
    if (!currentRole) return;

    const newRole = currentRole === 'mentor' ? 'mentee' : 'mentor';
    await this.setRole(newRole);

    // Navigate after role is set
    this.router.navigate(['/dashboard', newRole]);
  }
}
