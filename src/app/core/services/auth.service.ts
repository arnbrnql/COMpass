import { Injectable, signal, inject } from '@angular/core';
import { Auth, signInWithEmailAndPassword, createUserWithEmailAndPassword, signOut, onAuthStateChanged, User as FirebaseUser } from '@angular/fire/auth';
import { Router } from '@angular/router';
import { UserService } from './user.service';
import { User } from '../../shared/models/user.model';
import { LoginPayload, RegisterPayload } from '../../shared/models/auth.model';

@Injectable({
  providedIn: 'root'
})
export class AuthService {
  private auth: Auth = inject(Auth);
  private router: Router = inject(Router);
  private userService: UserService = inject(UserService);

  // The signal that holds the current user state for the entire app
  currentUser = signal<User | null>(null);

  constructor() {
    // Listen to Firebase's auth state changes
    onAuthStateChanged(this.auth, async (firebaseUser: FirebaseUser | null) => {
      if (firebaseUser) {
        const user: User = {
          uid: firebaseUser.uid,
          email: firebaseUser.email,
          displayName: firebaseUser.displayName
        };
        this.currentUser.set(user);
      } else {
        this.currentUser.set(null);
      }
    });
  }

  async login(payload: LoginPayload) {
    const userCredential = await signInWithEmailAndPassword(this.auth, payload.email, payload.password);
    return userCredential;
  }


  async register(payload: RegisterPayload) {

    const userCredential = await createUserWithEmailAndPassword(this.auth, payload.email, payload.password);
    const user: User = {
      uid: userCredential.user.uid,
      email: userCredential.user.email,
      displayName: payload.displayName
    };
    // Create the user profile document in Firestore
    await this.userService.createUserProfile(user);
    return userCredential;
  }

  logout() {
    signOut(this.auth);
    this.router.navigate(['/']); // Redirect to home/login on logout
  }
}
