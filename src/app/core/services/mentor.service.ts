import { Injectable, inject } from '@angular/core';
import { Observable, of, throwError } from 'rxjs';
import { catchError, switchMap } from 'rxjs/operators';
import { takeUntilDestroyed, toObservable } from '@angular/core/rxjs-interop';
import { DestroyRef } from '@angular/core';

import { User } from '../../shared/models/user.model';
import { AuthDomainService } from '../../domain/services/auth.service';
import {
  MentorCursor,
  MentorInfiniteResult,
  MentorPaginationOptions,
  MentorPaginationResult,
  MentorRepository,
} from '../../domain/repositories/mentor.repository';
import { MENTOR_REPOSITORY } from '../../domain/repositories/repository.tokens';
import { MentorDomainService } from '../../domain/services/mentor.service';
import { normalizePaginationOptions, assertPositiveInteger } from '../../domain/utils';
import { ValidationError } from '../../domain/errors';
import { retryWithBackoff } from '../../shared/utils/rxjs/retry-with-backoff';

@Injectable({
  providedIn: 'root',
})
export class MentorService implements MentorDomainService {
  private mentorRepository = inject<MentorRepository>(MENTOR_REPOSITORY);
  private authService = inject(AuthDomainService);
  private destroyRef = inject(DestroyRef);

  private currentUser$ = toObservable(this.authService.currentUser);

  watchMentorDirectory(): Observable<User[]> {
    return this.currentUser$.pipe(
      switchMap(user => {
        if (!user) {
          return of([]);
        }

        return this.mentorRepository
          .streamMentors(user.uid)
          .pipe(
            retryWithBackoff(),
            takeUntilDestroyed(this.destroyRef),
            catchError(error =>
              throwError(() =>
                error instanceof ValidationError
                  ? error
                  : new ValidationError('Unable to load mentor directory.', { cause: error })
              )
            )
          );
      }),
      takeUntilDestroyed(this.destroyRef)
    );
  }

  /**
   * Get paginated mentors with real-time updates
   * @param options Pagination options
   * @returns Observable of paginated mentor results
   */
  paginateMentorDirectory(
    options: Partial<MentorPaginationOptions> = {
      page: 1,
      limit: 12,
      orderBy: 'displayName',
      orderDirection: 'asc',
    },
  ): Observable<MentorPaginationResult> {
    const normalized = normalizePaginationOptions<MentorPaginationOptions>(options, {
      page: 1,
      limit: 12,
      orderBy: 'displayName',
      orderDirection: 'asc',
    });

    return this.currentUser$.pipe(
      switchMap(user => {
        if (!user) {
          return of({
            data: [],
            pagination: {
              page: normalized.page,
              limit: normalized.limit,
              total: 0,
              totalPages: 0,
              hasNext: false,
              hasPrevious: false,
            },
          } satisfies MentorPaginationResult);
        }

        return this.mentorRepository
          .streamMentorsPaginated(user.uid, normalized)
          .pipe(
            retryWithBackoff(),
            takeUntilDestroyed(this.destroyRef)
          );
      })
    );
  }

  /**
   * Get mentors with infinite scroll (load more)
   * @param limit Number of mentors to load
   * @param lastDoc Last document for pagination
   * @returns Observable of mentors array
   */
  scrollMentorDirectory(limitCount: number = 12, lastDoc?: MentorCursor | null): Observable<MentorInfiniteResult> {
    assertPositiveInteger(limitCount, 'Limit');

    return this.currentUser$.pipe(
      switchMap(user => {
        if (!user) {
          return of({ data: [], cursor: null } as MentorInfiniteResult);
        }

        return this.mentorRepository
          .streamMentorsInfinite(user.uid, limitCount, lastDoc)
          .pipe(
            retryWithBackoff(),
            takeUntilDestroyed(this.destroyRef)
          );
      })
    );
  }
}
