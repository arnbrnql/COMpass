import { Observable } from 'rxjs';
import { User as FirebaseUser, UserCredential } from '@angular/fire/auth';

import { LoginPayload, RegisterPayload } from '../../shared/models/auth.model';

/**
 * Contract for authentication data sources.
 */
export abstract class AuthRepository {
  /** Stream auth state changes for the current session. */
  abstract authState$(): Observable<FirebaseUser | null>;

  /** Sign a user in with the provided credentials. */
  abstract signIn(payload: LoginPayload): Observable<UserCredential>;

  /**
   * Create a new user account.
   *
   * Returns the credential for the newly registered user so that domain services can seed profile data.
   */
  abstract register(payload: RegisterPayload): Promise<UserCredential>;

  /** Sign the active user out. */
  abstract signOut(): Observable<void>;

  /** Update the display profile for the supplied Firebase user. */
  abstract updateDisplayName(user: FirebaseUser, displayName: string): Promise<void>;
}
