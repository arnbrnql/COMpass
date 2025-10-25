import { Injectable, inject } from '@angular/core';
import { Observable, combineLatest, of, throwError } from 'rxjs';
import { catchError, filter, map, switchMap, take } from 'rxjs/operators';
import { takeUntilDestroyed as takeUntilDestroyedRxjs, toObservable } from '@angular/core/rxjs-interop';
import { DestroyRef } from '@angular/core';

import {
  MentorshipRequest as MentorshipRequestModel,
  MentorshipRequestFormData,
} from '../../shared/models/mentorship-request.model';
import { AuthDomainService } from '../../domain/services/auth.service';
import {
  MentorshipRequestPaginationOptions,
  MentorshipRequestPaginationResult,
  MentorshipRequestRepository,
} from '../../domain/repositories/mentorship-request.repository';
import { MENTORSHIP_REQUEST_REPOSITORY } from '../../domain/repositories/repository.tokens';
import {
  MentorshipRequestDomainService,
  MentorshipRequestFeedItem,
} from '../../domain/services/mentorship-request.service';
import { Schedule } from '../../domain/models/schedule';
import { User } from '../../shared/models/user.model';
import { UserDomainService } from '../../domain/services/user.service';
import { CalDomainService } from '../../domain/services/cal.service';
import { assertUid, assertNonEmptyString, normalizeMentorshipRequestFormData, normalizePaginationOptions } from '../../domain/utils';
import { TransientError } from '../../domain/errors';
import { retryWithBackoff } from '../../shared/utils/rxjs/retry-with-backoff';

@Injectable({
  providedIn: 'root'
})
export class MentorshipRequestService implements MentorshipRequestDomainService {
  private authService = inject(AuthDomainService);
  private destroyRef = inject(DestroyRef);
  private repository = inject<MentorshipRequestRepository>(MENTORSHIP_REQUEST_REPOSITORY);
  private userService = inject(UserDomainService);
  private calService = inject(CalDomainService);

  private currentUser$ = toObservable(this.authService.currentUser);

  requestMentorship(mentorId: string, formData: MentorshipRequestFormData): Observable<string> {
    assertUid(mentorId, 'Mentor ID');
    const normalizedFormData = normalizeMentorshipRequestFormData(formData);

    return this.currentUser$.pipe(
      filter((user): user is NonNullable<typeof user> => !!user),
      take(1),
      switchMap(user =>
        this.repository.createRequest(user.uid, mentorId, normalizedFormData).pipe(
          catchError(error =>
            throwError(() =>
              new TransientError('Unable to submit mentorship request right now.', { cause: error })
            )
          )
        )
      )
    );
  }

  watchMentorRequests(mentorId: string): Observable<MentorshipRequestModel[]> {
    assertUid(mentorId, 'Mentor ID');

    return this.repository
      .streamRequestsForMentor(mentorId)
      .pipe(
        retryWithBackoff(),
        catchError(error =>
          throwError(() => new TransientError('Unable to load mentor requests.', { cause: error }))
        ),
        takeUntilDestroyedRxjs(this.destroyRef)
      );
  }

  watchMenteeRequests(menteeId: string): Observable<MentorshipRequestModel[]> {
    assertUid(menteeId, 'Mentee ID');

    return this.repository
      .streamRequestsForMentee(menteeId)
      .pipe(
        retryWithBackoff(),
        catchError(error =>
          throwError(() => new TransientError('Unable to load mentee requests.', { cause: error }))
        ),
        takeUntilDestroyedRxjs(this.destroyRef)
      );
  }

  watchMenteeRequestFeed(menteeId: string): Observable<MentorshipRequestFeedItem[]> {
    assertUid(menteeId, 'Mentee ID');

    return this.repository.streamRequestsForMentee(menteeId).pipe(
      retryWithBackoff(),
      switchMap(requests => {
        if (!requests.length) {
          return of([] as MentorshipRequestFeedItem[]);
        }

        const mentorIds = Array.from(new Set(requests.map(request => request.mentorId).filter(Boolean)));

        if (!mentorIds.length) {
          return of(requests.map(request => this.composeFeedItem(request, null)));
        }

        const mentorStreams = mentorIds.map(mentorId =>
          this.userService.observeProfile(mentorId).pipe(map(mentor => [mentorId, mentor] as const))
        );

        return combineLatest(mentorStreams).pipe(
          map(entries => new Map(entries)),
          map(mentorMap =>
            requests.map(request => this.composeFeedItem(request, mentorMap.get(request.mentorId) ?? null))
          )
        );
      }),
      catchError(error =>
        throwError(() => new TransientError('Unable to compose mentorship feed.', { cause: error }))
      ),
      takeUntilDestroyedRxjs(this.destroyRef)
    );
  }

  /**
   * Get a single mentorship request by ID (real-time)
   * @param requestId - ID of the request
   * @returns Observable of the mentorship request
   */
  watchRequest(requestId: string): Observable<MentorshipRequestModel | null> {
    if (!requestId) {
      return of(null);
    }
    assertNonEmptyString(requestId, 'Request ID');
    return this.repository
      .streamRequestById(requestId)
      .pipe(
        retryWithBackoff(),
        catchError(error =>
          throwError(() => new TransientError('Unable to load mentorship request.', { cause: error }))
        ),
        takeUntilDestroyedRxjs(this.destroyRef)
      );
  }

  /**
   * Approve a mentorship request
   * @param requestId - ID of the request to approve
   * @returns Observable<void>
   */
  approve(requestId: string): Observable<void> {
    assertNonEmptyString(requestId, 'Request ID');

    return this.repository.approveRequest(requestId).pipe(
      catchError(error =>
        throwError(() => new TransientError('Unable to approve mentorship request.', { cause: error }))
      )
    );
  }

  /**
   * Reject a mentorship request
   * @param requestId - ID of the request to reject
   * @param reason - Optional rejection reason
   * @returns Observable<void>
   */
  reject(requestId: string, reason?: string): Observable<void> {
    assertNonEmptyString(requestId, 'Request ID');

    const trimmedReason = reason?.trim();

    return this.repository.rejectRequest(requestId, trimmedReason).pipe(
      catchError(error =>
        throwError(() => new TransientError('Unable to reject mentorship request.', { cause: error }))
      )
    );
  }

  /**
   * Check if a mentee has already requested mentorship from a specific mentor
   * @param menteeId - ID of the mentee
   * @param mentorId - ID of the mentor
   * @returns Observable<boolean>
   */
  hasOutstandingRequest(menteeId: string, mentorId: string): Observable<boolean> {
    assertUid(menteeId, 'Mentee ID');
    assertUid(mentorId, 'Mentor ID');

    return this.repository.hasExistingRequest(menteeId, mentorId).pipe(
      retryWithBackoff(),
      catchError(error =>
        throwError(() => new TransientError('Unable to verify mentorship request status.', { cause: error }))
      )
    );
  }

  /**
   * Get paginated mentorship requests for mentor with real-time updates
   * @param mentorId - ID of the mentor
   * @param options - Pagination options
   * @returns Observable of paginated request results
   */
  paginateMentorRequests(
    mentorId: string,
    options: Partial<MentorshipRequestPaginationOptions> = {
      page: 1,
      limit: 10,
      orderBy: 'createdAt',
      orderDirection: 'desc',
    },
  ): Observable<MentorshipRequestPaginationResult> {
    assertUid(mentorId, 'Mentor ID');
    const normalized = normalizePaginationOptions<MentorshipRequestPaginationOptions>(options, {
      page: 1,
      limit: 10,
      orderBy: 'createdAt',
      orderDirection: 'desc',
    });

    return this.repository.streamRequestsForMentorPaginated(mentorId, normalized).pipe(
      retryWithBackoff(),
      catchError(error =>
        throwError(() => new TransientError('Unable to load mentor requests.', { cause: error }))
      ),
      takeUntilDestroyedRxjs(this.destroyRef)
    );
  }

  /**
   * Mark a mentorship request as done (mentor only)
   * @param requestId - ID of the request to mark as done
   * @returns Observable with void
   */
  markAsCompleted(requestId: string): Observable<void> {
    assertNonEmptyString(requestId, 'Request ID');

    return this.repository.markAsDone(requestId).pipe(
      catchError(error =>
        throwError(() => new TransientError('Unable to mark mentorship request as completed.', { cause: error }))
      )
    );
  }
  /**
   * Save booking URL after mentee books a session (mentee-only field)
   */
  recordBookingUrl(requestId: string, bookingUrl: string): Observable<void> {
    assertNonEmptyString(requestId, 'Request ID');
    assertNonEmptyString(bookingUrl, 'Booking URL');

    return this.repository.saveBookingUrl(requestId, bookingUrl.trim()).pipe(
      catchError(error =>
        throwError(() => new TransientError('Unable to save booking link.', { cause: error }))
      )
    );
  }

  /**
   * Check if mentee has calendar access to a specific mentor
   * @param menteeId - ID of the mentee
   * @param mentorId - ID of the mentor
   * @returns Observable with boolean indicating access
   */
  observeCalendarAccess(menteeId: string, mentorId: string): Observable<boolean> {
    assertUid(menteeId, 'Mentee ID');
    assertUid(mentorId, 'Mentor ID');

    return this.repository
      .hasCalendarAccess(menteeId, mentorId)
      .pipe(
        retryWithBackoff(),
        catchError(error =>
          throwError(() => new TransientError('Unable to verify calendar access.', { cause: error }))
        ),
        takeUntilDestroyedRxjs(this.destroyRef)
      );
  }

  private composeFeedItem(request: MentorshipRequestModel, mentor: User | null): MentorshipRequestFeedItem {
    return {
      request,
      mentor,
      schedule: this.composeSchedule(request, mentor),
    };
  }

  private composeSchedule(request: MentorshipRequestModel, mentor: User | null): Schedule {
    const calendarAccess = request.calendarAccess;
    const derivedBookingUrl = mentor?.mentorProfile?.calUsername
      ? this.calService.buildPublicBookingUrl(mentor.mentorProfile.calUsername)
      : request.bookingUrl;

    return Schedule.fromProps({
      ownerId: mentor?.uid ?? request.mentorId,
      calendarAccess: {
        isUnlocked: calendarAccess?.isUnlocked ?? false,
        unlockedAt: calendarAccess?.unlockedAt ?? null,
        lockedAt: calendarAccess?.lockedAt ?? null,
        bookingUrl: derivedBookingUrl ?? null,
      },
      meetings: [],
    });
  }
}
