import { Injectable, inject, signal, DestroyRef, NgZone } from '@angular/core';
import {
  Auth,
  User as FirebaseAuthUser,
  UserCredential,
  createUserWithEmailAndPassword,
  signInWithEmailAndPassword,
  signOut,
  updateProfile,
  onAuthStateChanged,
} from '@angular/fire/auth';
import { Router } from '@angular/router';
import { Observable, from, firstValueFrom } from 'rxjs';
import { tap, catchError } from 'rxjs/operators';
import { toSignal, takeUntilDestroyed } from '@angular/core/rxjs-interop';

import { LoginPayload } from '../../shared/models/auth.model';
import { UserService } from './user.service';
import { User as AppUser } from '../../shared/models/user.model';

@Injectable({
  providedIn: 'root',
})
export class AuthService {
  private auth: Auth = inject(Auth);
  private router = inject(Router);
  private userService = inject(UserService);
  private destroyRef = inject(DestroyRef);
  private ngZone = inject(NgZone);

  // This signal holds the basic Firebase Auth user object
  readonly currentUser = signal<FirebaseAuthUser | null>(null);
  // This signal will hold the detailed user profile from Firestore
  readonly currentUserProfile = signal<AppUser | null>(null);
  // Track whether the profile has been loaded (true even if null after loading)
  readonly isProfileLoaded = signal<boolean>(false);

  // Flag to prevent profile fetch during logout
  private isLoggingOut = false;

  readonly isAuthenticated = toSignal(
    new Observable<boolean>(subscriber =>
      onAuthStateChanged(this.auth, user => subscriber.next(!!user))
    )
  );

  constructor() {
    // Wrap onAuthStateChanged in NgZone to ensure proper change detection
    onAuthStateChanged(this.auth, (user) => {
      this.ngZone.run(() => {
        console.log('[AuthService] Auth state changed - user:', user ? user.uid : 'null');
        this.currentUser.set(user);
        if (user && !this.isLoggingOut) {
          // Only fetch profile if we're not in the middle of logging out
          // Reset the loaded flag when starting to fetch
          console.log('[AuthService] Fetching user profile for:', user.uid);
          this.isProfileLoaded.set(false);
          // If the user is logged in, fetch their full profile and set the signal
          this.userService.getUserProfile(user.uid)
            .pipe(
              takeUntilDestroyed(this.destroyRef),
              catchError(error => {
                console.error('[AuthService] Error fetching user profile:', error);
                this.isProfileLoaded.set(true);
                return [];
              })
            )
            .subscribe(profile => {
              console.log('[AuthService] Profile loaded:', profile);
              this.currentUserProfile.set(profile);
              this.isProfileLoaded.set(true);
            });
        } else {
          // If the user logs out, clear the profile immediately
          console.log('[AuthService] Clearing profile (logout or no user)');
          this.currentUserProfile.set(null);
          this.isProfileLoaded.set(true);
          // Reset the logout flag
          this.isLoggingOut = false;
        }
      });
    });
  }

  login(credentials: LoginPayload): Observable<UserCredential> {
    return from(signInWithEmailAndPassword(this.auth, credentials.email, credentials.password));
  }

  async register(displayName: string, email: string, password: string, role: string): Promise<void> {
    const userCredential = await createUserWithEmailAndPassword(this.auth, email, password);

    await updateProfile(userCredential.user, { displayName });

    const roleFlags = {
      isMentor: role === 'mentor' || role === 'both',
      isMentee: role === 'mentee' || role === 'both',
    };

    const newUser: AppUser = {
      uid: userCredential.user.uid,
      email: userCredential.user.email!,
      displayName: userCredential.user.displayName!,
      photoURL: userCredential.user.photoURL || '',
      roleFlags,
    };

    await firstValueFrom(this.userService.addUser(newUser));
  }

  logout(): Observable<void> {
    // Set flag to prevent profile fetch during logout
    this.isLoggingOut = true;
    // Clear profile immediately to prevent any stale data access
    this.currentUserProfile.set(null);
    this.isProfileLoaded.set(true);

    return from(signOut(this.auth)).pipe(
      tap(() => this.router.navigate(['/auth/login']))
    );
  }
}
