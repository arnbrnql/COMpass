import { Injectable, inject } from '@angular/core';
import { Observable, of, throwError } from 'rxjs';
import { catchError, take, tap } from 'rxjs/operators';
import { takeUntilDestroyed } from '@angular/core/rxjs-interop';
import { DestroyRef } from '@angular/core';

import { User, UserProps } from '../../shared/models/user.model';
import { UserRepository } from '../../domain/repositories/user.repository';
import { USER_REPOSITORY } from '../../domain/repositories/repository.tokens';
import { UserDomainService } from '../../domain/services/user.service';
import { assertUid, assertNonEmptyString } from '../../domain/utils';
import { TransientError, ValidationError } from '../../domain/errors';

@Injectable({
  providedIn: 'root',
})
export class UserService implements UserDomainService {
  private userRepository = inject<UserRepository>(USER_REPOSITORY);
  private destroyRef = inject(DestroyRef);

  observeProfile(uid: string | undefined): Observable<User | null> {
    if (uid == null) {
      return of(null);
    }

    assertUid(uid, 'User ID');

    return this.userRepository.watchProfile(uid).pipe(
      take(1),
      catchError(error =>
        throwError(() => new TransientError('Unable to load user profile.', { cause: error }))
      ),
      takeUntilDestroyed(this.destroyRef)
    );
  }

  watchProfileContinuously(uid: string | undefined): Observable<User | null> {
    if (uid == null) {
      return of(null);
    }

    assertUid(uid, 'User ID');

    return this.userRepository.watchProfile(uid).pipe(
      catchError(error => {
        console.error('Error watching profile:', error);
        return of(null);
      })
    );
  }

  register(user: User): Observable<void> {
    if (!(user instanceof User)) {
      throw new ValidationError('A valid user entity is required to register.');
    }

    return this.userRepository.createProfile(user).pipe(
      catchError(error => {
        console.error('[UserService] Failed to create profile:', error);
        return throwError(() => new TransientError('Failed to register user profile.', { cause: error }));
      })
    );
  }

  applyProfileChanges(uid: string, data: Partial<UserProps>): Observable<void> {
    assertUid(uid, 'User ID');
    if (!data || Object.keys(data).length === 0) {
      throw new ValidationError('No profile changes were provided.');
    }

    return this.userRepository.updateProfile(uid, data).pipe(
      catchError(error =>
        throwError(() => new TransientError('Failed to update profile.', { cause: error }))
      )
    );
  }

  linkMentorCalendar(uid: string, username: string): Observable<void> {
    assertUid(uid, 'User ID');
    assertNonEmptyString(username, 'Cal.com username');

    const sanitizedUsername = username.trim();
    const mentorProfile = {
      calUsername: sanitizedUsername,
    } satisfies NonNullable<UserProps['mentorProfile']>;

    return this.userRepository.updateProfile(uid, {
      mentorProfile,
    }).pipe(
      catchError(error =>
        throwError(() => new TransientError('Failed to link calendar.', { cause: error }))
      )
    );
  }
}
