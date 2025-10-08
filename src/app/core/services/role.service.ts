import { Injectable, computed, effect, inject, signal } from '@angular/core';
import { toObservable } from '@angular/core/rxjs-interop';
import { AuthService } from './auth.service';
import { UserService } from './user.service';
import { switchMap, filter } from 'rxjs/operators';
import { of } from 'rxjs';

@Injectable({
  providedIn: 'root',
})
export class RoleService {
  private authService = inject(AuthService);
  private userService = inject(UserService);

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
    // Effect to set the active role from the user's profile when it loads
    effect(() => {
      const profile = this.authService.currentUserProfile();
      if (!profile) {
        this.activeRole.set(null);
        return;
      }

      // If the user has an activeRole saved, use that
      if (profile.activeRole) {
        this.activeRole.set(profile.activeRole);
        return;
      }

      // Otherwise, default to mentee if available, then mentor
      if (profile.roleFlags.isMentee) {
        this.activeRole.set('mentee');
      } else if (profile.roleFlags.isMentor) {
        this.activeRole.set('mentor');
      } else {
        this.activeRole.set(null);
      }
    });

    // Effect to persist activeRole changes to Firestore
    toObservable(this.activeRole).pipe(
      filter(role => role !== null),
      switchMap(role => {
        const profile = this.authService.currentUserProfile();
        if (profile && role && profile.activeRole !== role) {
          return this.userService.updateUserProfile(profile.uid, { activeRole: role });
        }
        return of(null);
      })
    ).subscribe();
  }

  // Method to toggle between mentor and mentee roles
  toggleRole() {
    const currentRole = this.activeRole();
    if (currentRole === 'mentor') {
      this.activeRole.set('mentee');
    } else {
      this.activeRole.set('mentor');
    }
  }

  // Method to set a specific role
  setActiveRole(role: 'mentor' | 'mentee') {
    this.activeRole.set(role);
  }
}
