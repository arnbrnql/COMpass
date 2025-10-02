import { Injectable, inject, signal } from '@angular/core';
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
import { Observable, from } from 'rxjs';
import { tap } from 'rxjs/operators';
import { toSignal } from '@angular/core/rxjs-interop';

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

  // This signal holds the basic Firebase Auth user object
  readonly currentUser = signal<FirebaseAuthUser | null>(null);
  // This signal will hold the detailed user profile from Firestore
  readonly currentUserProfile = signal<AppUser | null>(null);

  readonly isAuthenticated = toSignal(
    new Observable<boolean>(subscriber =>
      onAuthStateChanged(this.auth, user => subscriber.next(!!user))
    )
  );

  constructor() {
    onAuthStateChanged(this.auth, (user) => {
      this.currentUser.set(user);
      if (user) {
        // If the user is logged in, fetch their full profile and set the signal
        this.userService.getUserProfile(user.uid).subscribe(profile => {
          this.currentUserProfile.set(profile);
        });
      } else {
        // If the user logs out, clear the profile
        this.currentUserProfile.set(null);
      }
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

    await this.userService.addUser(newUser);
  }

  logout(): Observable<void> {
    return from(signOut(this.auth)).pipe(
      tap(() => this.router.navigate(['/auth/login']))
    );
  }
}
