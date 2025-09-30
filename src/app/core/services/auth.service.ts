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
import { switchMap } from 'rxjs/operators';
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

  private user$ = new Observable<User | null>((subscriber) =>
    onAuthStateChanged(this.auth, subscriber)
  ).pipe(
    switchMap((user) => {
      if (!user) return of(null);
      return of(user);
    })
  );

  currentUser = toSignal(this.user$);
  isAuthenticated = toSignal(this.user$.pipe(switchMap((user) => of(!!user))));

  constructor() {
    console.log('AuthService initialized');
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
      switchMap(async () => {
        await this.router.navigate(['/auth/login']);
      })
    );
  }
}
