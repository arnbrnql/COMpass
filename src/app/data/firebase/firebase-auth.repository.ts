import { Injectable, inject } from '@angular/core';
import {
  Auth,
  User as FirebaseUser,
  UserCredential,
  createUserWithEmailAndPassword,
  onAuthStateChanged,
  signInWithEmailAndPassword,
  signOut,
  updateProfile,
  AuthError,
  sendPasswordResetEmail,
  sendEmailVerification,
  updateEmail,
  updatePassword,
} from '@angular/fire/auth';
import { Observable, from, throwError } from 'rxjs';
import { catchError, retry, timeout } from 'rxjs/operators';

import { AuthRepository } from '../../domain/repositories/auth.repository';
import { LoginPayload, RegisterPayload } from '../../shared/models/auth.model';

@Injectable()
export class FirebaseAuthRepository implements AuthRepository {
  private auth: Auth = inject(Auth);
  private readonly authTimeoutMs = 30000;

  authState$(): Observable<FirebaseUser | null> {
    return new Observable<FirebaseUser | null>((subscriber) => {
      const unsubscribe = onAuthStateChanged(
        this.auth,
        (user) => subscriber.next(user),
        () => subscriber.next(null),
        () => subscriber.complete()
      );

      return () => unsubscribe();
    });
  }

  signIn(payload: LoginPayload): Observable<UserCredential> {
    return from(signInWithEmailAndPassword(this.auth, payload.email.trim(), payload.password)).pipe(
      timeout(this.authTimeoutMs),
      catchError((error) => {
        const authError = error as AuthError;
        return throwError(() => this.mapAuthError(authError));
      })
    );
  }

  /**
   * Register a new user with email and password
   * Automatically sends email verification
   */
  async register(payload: RegisterPayload): Promise<UserCredential> {
    try {
      const userCredential = await createUserWithEmailAndPassword(
        this.auth,
        payload.email.trim(),
        payload.password
      );

      if (userCredential.user && !userCredential.user.emailVerified) {
        await sendEmailVerification(userCredential.user).catch(() => undefined);
      }

      return userCredential;
    } catch (error) {
      throw this.mapAuthError(error as AuthError);
    }
  }

  /**
   * Sign out the current user
   * Includes retry logic for network failures
   */
  signOut(): Observable<void> {
    return from(signOut(this.auth)).pipe(
      retry({ count: 2, delay: 1000 }),
      catchError(() => from(signOut(this.auth)))
    );
  }

  /**
   * Update user display name
   * Includes validation and error handling
   */
  async updateDisplayName(user: FirebaseUser, displayName: string): Promise<void> {
    if (!displayName || displayName.trim().length === 0) {
      throw new Error('Display name cannot be empty');
    }

    try {
      await updateProfile(user, { displayName: displayName.trim() });
    } catch (error) {
      throw this.mapAuthError(error as AuthError);
    }
  }

  /**
   * Send password reset email
   */
  async sendPasswordReset(email: string): Promise<void> {
    try {
      await sendPasswordResetEmail(this.auth, email.trim());
    } catch (error) {
      throw this.mapAuthError(error as AuthError);
    }
  }

  /**
   * Update user email
   */
  async updateUserEmail(user: FirebaseUser, newEmail: string): Promise<void> {
    try {
      await updateEmail(user, newEmail.trim());
      await sendEmailVerification(user).catch(() => undefined);
    } catch (error) {
      throw this.mapAuthError(error as AuthError);
    }
  }

  /**
   * Update user password
   */
  async updateUserPassword(user: FirebaseUser, newPassword: string): Promise<void> {
    try {
      await updatePassword(user, newPassword);
    } catch (error) {
      throw this.mapAuthError(error as AuthError);
    }
  }

  /**
   * Map Firebase Auth errors to user-friendly messages
   */
  private mapAuthError(error: AuthError): Error {
    const errorMessages: Record<string, string> = {
      'auth/invalid-email': 'The email address is invalid.',
      'auth/user-disabled': 'This account has been disabled.',
      'auth/user-not-found': 'No account found with this email.',
      'auth/wrong-password': 'Incorrect password.',
      'auth/invalid-credential': 'Invalid email or password.',
      'auth/email-already-in-use': 'This email is already registered.',
      'auth/weak-password': 'Password should be at least 6 characters.',
      'auth/operation-not-allowed': 'This operation is not allowed.',
      'auth/requires-recent-login': 'Please sign in again to complete this action.',
      'auth/network-request-failed': 'Network error. Please check your connection.',
      'auth/too-many-requests': 'Too many attempts. Please try again later.',
      'auth/popup-blocked': 'Popup was blocked by the browser.',
      'auth/popup-closed-by-user': 'Popup was closed before completing sign in.',
    };

    const message = errorMessages[error.code] || error.message || 'An authentication error occurred.';
    const mappedError = new Error(message);
    mappedError.name = error.code;
    return mappedError;
  }
}
