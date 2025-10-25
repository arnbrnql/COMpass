import { Injectable, inject } from '@angular/core';
import {
  Firestore,
  QueryConstraint,
  collection,
  collectionData,
  deleteDoc,
  doc,
  docData,
  getDoc,
  getDocs,
  limit,
  query,
  setDoc,
  updateDoc,
  where,
  serverTimestamp,
  writeBatch,
  FirestoreError,
} from '@angular/fire/firestore';
import { Observable, of, throwError } from 'rxjs';
import { catchError, map, retry, shareReplay, timeout } from 'rxjs/operators';

import { FIREBASE_COLLECTIONS } from '../../core/constants';
import { BaseRepository } from '../base.repository';
import { UserRepository, UserQueryOptions } from '../../domain/repositories/user.repository';
import { User, UserProps } from '../../shared/models/user.model';

/**
 * Convert Firestore document to User entity
 */
function toUser(uid: string, raw: Record<string, unknown> | undefined): User | null {
  if (!raw) {
    return null;
  }

  try {
    return User.fromProps({ uid, ...(raw as Record<string, unknown>) } as UserProps);
  } catch {
    return null;
  }
}

function sanitizeForFirestore<T>(value: T): T {
  if (Array.isArray(value)) {
    return value
      .map(item => sanitizeForFirestore(item))
      .filter(item => item !== undefined) as unknown as T;
  }

  if (value && typeof value === 'object') {
    const entries = Object.entries(value as Record<string, unknown>)
      .filter(([, nestedValue]) => nestedValue !== undefined)
      .map(([key, nestedValue]) => [key, sanitizeForFirestore(nestedValue)] as const);

    return Object.fromEntries(entries) as T;
  }

  return value;
}

@Injectable()
export class FirebaseUserRepository extends BaseRepository implements UserRepository {
  private firestore: Firestore = inject(Firestore);
  private readonly queryTimeoutMs = 15000;

  watchProfile(uid: string): Observable<User | null> {
    if (!uid || uid.trim().length === 0) {
      return of(null);
    }

    return this.fromObservable(() =>
      docData(doc(this.firestore, `${FIREBASE_COLLECTIONS.USERS}/${uid}`)).pipe(
        timeout(this.queryTimeoutMs),
        map(user => toUser(uid, user as Record<string, unknown>)),
        retry({ count: 2, delay: 1000 }),
        catchError((error: FirestoreError) => {
          return throwError(() => this.mapFirestoreError(error));
        })
      )
    );
  }

  fetchProfile(uid: string): Observable<User | null> {
    if (!uid || uid.trim().length === 0) {
      return of(null);
    }

    return this.fromPromise(async () => {
      try {
        const snapshot = await getDoc(doc(this.firestore, `${FIREBASE_COLLECTIONS.USERS}/${uid}`));
        if (!snapshot.exists()) {
          return null;
        }
        return toUser(snapshot.id, snapshot.data() as Record<string, unknown>);
      } catch (error) {
        throw this.mapFirestoreError(error as FirestoreError);
      }
    });
  }

  createProfile(user: User): Observable<void> {
    const props = user.toProps();
    const userDocRef = doc(this.firestore, `${FIREBASE_COLLECTIONS.USERS}/${props.uid}`);

    const profileData = {
      ...sanitizeForFirestore(props),
      createdAt: serverTimestamp(),
      updatedAt: serverTimestamp(),
    };

    return this.fromPromise(async () => {
      try {
        await setDoc(userDocRef, profileData);
      } catch (error) {
        console.error('[FirebaseUserRepository] Error creating profile:', error);
        throw this.mapFirestoreError(error as FirestoreError);
      }
    });
  }

  updateProfile(uid: string, data: Partial<UserProps>): Observable<void> {
    if (!uid || uid.trim().length === 0) {
      return throwError(() => new Error('User ID is required'));
    }

    if (!data || Object.keys(data).length === 0) {
      return throwError(() => new Error('Update data cannot be empty'));
    }

    const userDocRef = doc(this.firestore, `${FIREBASE_COLLECTIONS.USERS}/${uid}`);
    const sanitizedData = sanitizeForFirestore(data);

    if (Object.keys(sanitizedData as Record<string, unknown>).length === 0) {
      return throwError(() => new Error('Update data cannot be empty'));
    }

    const updateData = {
      ...sanitizedData,
      updatedAt: serverTimestamp(),
    };

    return this.fromPromise(async () => {
      try {
        await updateDoc(userDocRef, updateData);
      } catch (error) {
        throw this.mapFirestoreError(error as FirestoreError);
      }
    });
  }

  /**
   * Delete user profile
   * Note: This should rarely be used - consider soft delete instead
   */
  deleteProfile(uid: string): Observable<void> {
    if (!uid || uid.trim().length === 0) {
      return throwError(() => new Error('User ID is required'));
    }

    const userDocRef = doc(this.firestore, `${FIREBASE_COLLECTIONS.USERS}/${uid}`);

    return this.fromPromise(async () => {
      try {
        await deleteDoc(userDocRef);
      } catch (error) {
        throw this.mapFirestoreError(error as FirestoreError);
      }
    });
  }

  /**
   * Query user profiles with filters
   * Supports role filtering, search, and pagination
   */
  queryProfiles(options?: UserQueryOptions): Observable<User[]> {
    const usersCollection = collection(this.firestore, FIREBASE_COLLECTIONS.USERS);
    const queryConstraints: QueryConstraint[] = [];

    if (options?.role === 'mentor') {
      queryConstraints.push(where('roleFlags.isMentor', '==', true));
    } else if (options?.role === 'mentee') {
      queryConstraints.push(where('roleFlags.isMentee', '==', true));
    }

    if (options?.limit && options.limit > 0) {
      queryConstraints.push(limit(Math.min(options.limit, 100)));
    }

    const usersQuery = query(usersCollection, ...queryConstraints);

    return this.fromObservable(() =>
      collectionData(usersQuery, { idField: 'uid' }).pipe(
        timeout(this.queryTimeoutMs),
        map((users: unknown) => {
          const searchTerm = options?.searchTerm?.trim().toLowerCase();
          const usersArray = users as Record<string, unknown>[];
          let filteredUsers = usersArray;

          if (searchTerm) {
            filteredUsers = usersArray.filter((user: Record<string, unknown>) => {
              const displayName = (user['displayName'] as string | undefined)?.toLowerCase();
              const email = (user['email'] as string | undefined)?.toLowerCase();
              const bio = (user['bio'] as string | undefined)?.toLowerCase();

              return (
                displayName?.includes(searchTerm) ||
                email?.includes(searchTerm) ||
                bio?.includes(searchTerm)
              );
            });
          }

          return filteredUsers
            .map((user: Record<string, unknown>) => toUser(user['uid'] as string, user))
            .filter((user): user is User => user !== null);
        }),
        retry({ count: 2, delay: 1000 }),
        catchError(() => {
          return of([]);
        })
      )
    );
  }

  /**
   * Batch update multiple user profiles
   * Useful for admin operations or bulk updates
   */
  async batchUpdateProfiles(updates: Array<{ uid: string; data: Partial<UserProps> }>): Promise<void> {
    if (!updates || updates.length === 0) {
      return;
    }

    const MAX_BATCH_SIZE = 500;
    const batches: typeof updates[] = [];

    for (let i = 0; i < updates.length; i += MAX_BATCH_SIZE) {
      batches.push(updates.slice(i, i + MAX_BATCH_SIZE));
    }

    try {
      for (const batch of batches) {
        const writeBatchOp = writeBatch(this.firestore);

        for (const update of batch) {
          const userDocRef = doc(this.firestore, `${FIREBASE_COLLECTIONS.USERS}/${update.uid}`);
          writeBatchOp.update(userDocRef, {
            ...update.data,
            updatedAt: serverTimestamp(),
          });
        }

        await writeBatchOp.commit();
      }
    } catch (error) {
      throw this.mapFirestoreError(error as FirestoreError);
    }
  }

  /**
   * Check if a profile exists
   */
  async profileExists(uid: string): Promise<boolean> {
    if (!uid || uid.trim().length === 0) {
      return false;
    }

    try {
      const snapshot = await getDoc(doc(this.firestore, `${FIREBASE_COLLECTIONS.USERS}/${uid}`));
      return snapshot.exists();
    } catch {
      return false;
    }
  }


  /**
   * Map Firestore errors to user-friendly messages
   */
  private mapFirestoreError(error: FirestoreError): Error {
    const errorMessages: Record<string, string> = {
      'permission-denied': 'You do not have permission to perform this action.',
      'not-found': 'The requested document was not found.',
      'already-exists': 'This document already exists.',
      'resource-exhausted': 'Quota exceeded. Please try again later.',
      'failed-precondition': 'Operation cannot be performed in the current state.',
      'aborted': 'Operation was aborted. Please try again.',
      'out-of-range': 'Operation was attempted past the valid range.',
      'unimplemented': 'This operation is not implemented.',
      'internal': 'Internal server error. Please try again.',
      'unavailable': 'Service is currently unavailable. Please try again.',
      'data-loss': 'Unrecoverable data loss or corruption.',
      'unauthenticated': 'Please sign in to continue.',
      'invalid-argument': 'Invalid data provided.',
      'deadline-exceeded': 'Operation timed out. Please try again.',
      'cancelled': 'Operation was cancelled.',
    };

    const message = errorMessages[error.code] || error.message || 'An error occurred while accessing the database.';
    const mappedError = new Error(message);
    mappedError.name = error.code;
    return mappedError;
  }
}
