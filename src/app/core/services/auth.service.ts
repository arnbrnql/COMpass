import { Injectable, inject, signal } from '@angular/core';
import {
  Auth,
  User,
  UserCredential,
  createUserWithEmailAndPassword,
  signInWithEmailAndPassword,
  signOut,
  updateProfile,
  onAuthStateChanged,
} from '@angular/fire/auth';
import { Router } from '@angular/router';
import { Observable, from, of } from 'rxjs';
import { map, switchMap } from 'rxjs/operators';
import { toSignal } from '@angular/core/rxjs-interop';

import { LoginPayload, RegisterPayload } from '../../shared/models/auth.model';
import { UserService } from './user.service';
import { User as AppUser } from '../../shared/models/user.model';

@Injectable({
  providedIn: 'root',
})
export class AuthService {
  private auth: Auth = inject(Auth);
  private router = inject(Router);
  private userService = inject(UserService);

  private authState$ = new Observable<User | null>((subscriber) =>
    onAuthStateChanged(this.auth, subscriber)
  );

  readonly currentUser = toSignal(this.authState$);

  readonly currentUserProfile = toSignal(
    this.authState$.pipe(
      switchMap((user) =>
        user ? this.userService.getUserProfile(user.uid) : of(null)
      )
    )
  );

  readonly isAuthenticated = toSignal(
    this.authState$.pipe(switchMap((user) => of(!!user)))
  );

  constructor() {
    console.log('AuthService initialized'); //remove in prod
  }

  login(credentials: LoginPayload): Observable<UserCredential> {
    return from(signInWithEmailAndPassword(this.auth, credentials.email, credentials.password));
  }

  register(payload: RegisterPayload): Observable<void> {
    return from(createUserWithEmailAndPassword(this.auth, payload.email, payload.password)).pipe(
      switchMap((userCredential) =>
        from(updateProfile(userCredential.user, { displayName: payload.displayName })).pipe(
          switchMap(() => {
            const roleFlags = {
              isMentor: payload.role === 'mentor' || payload.role === 'both',
              isMentee: payload.role === 'mentee' || payload.role === 'both',
            };
            const newUser: AppUser = {
              uid: userCredential.user.uid,
              email: userCredential.user.email!,
              displayName: payload.displayName,
              photoURL: userCredential.user.photoURL || '',
              roleFlags,
            };
            return from(this.userService.addUser(newUser));
          })
        )
      )
    );
  }

  logout(): Observable<void> {
    return from(signOut(this.auth)).pipe(
      switchMap(() => this.router.navigate(['/auth/login'])),
      map(() => {})
    );
  }
}
