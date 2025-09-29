import { Injectable, inject } from '@angular/core';
import {
  Auth,
  signInWithEmailAndPassword,
  createUserWithEmailAndPassword,
  signOut,
  authState,
} from '@angular/fire/auth';
import { toSignal } from '@angular/core/rxjs-interop';
import { Router } from '@angular/router';
import { UserService } from './user.service';
import { User } from '../../shared/models/user.model';
import { LoginPayload, RegisterPayload } from '../../shared/models/auth.model';

@Injectable({
  providedIn: 'root',
})
export class AuthService {
  private auth: Auth = inject(Auth);
  private router: Router = inject(Router);
  private userService: UserService = inject(UserService);

  // Directly convert the Firebase auth state observable to a signal.
  // This signal will automatically update when the user logs in or out.
  private user$ = authState(this.auth);
  currentUser = toSignal(this.user$);

  async login(payload: LoginPayload) {
    const userCredential = await signInWithEmailAndPassword(
      this.auth,
      payload.email,
      payload.password
    );
    return userCredential;
  }

  async register(payload: RegisterPayload) {
    const userCredential = await createUserWithEmailAndPassword(
      this.auth,
      payload.email,
      payload.password
    );

    const user: User = {
      uid: userCredential.user.uid,
      email: userCredential.user.email,
      displayName: payload.displayName,
    };

    await this.userService.createUserProfile(user);
    return userCredential;
  }

  logout() {
    signOut(this.auth);
    this.router.navigate(['/']);
  }
}
