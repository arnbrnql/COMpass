import { Signal } from '@angular/core';
import { Observable } from 'rxjs';
import { User as FirebaseUser, UserCredential } from '@angular/fire/auth';

import { LoginPayload, RegisterPayload } from '../../shared/models/auth.model';
import { User } from '../../shared/models/user.model';

/**
 * Domain-facing contract for authentication orchestration.
 */
export abstract class AuthDomainService {
  abstract readonly currentUser: Signal<FirebaseUser | null>;
  abstract readonly currentUserProfile: Signal<User | null>;
  abstract readonly isProfileLoaded: Signal<boolean>;
  abstract readonly isAuthenticated: Signal<boolean>;

  abstract login(credentials: LoginPayload): Observable<UserCredential>;
  abstract register(payload: RegisterPayload): Promise<void>;
  abstract logout(): Observable<void>;
}
