import { ChangeDetectionStrategy, Component, inject, input } from '@angular/core';
import { TitleCasePipe, AsyncPipe } from '@angular/common';
import { getInitialsAvatar } from '../../../shared/utils';
import { MentorshipRequestService } from '../../../core/services/mentorship-request';
import { NotificationService } from '../../../core/services/notification.service';
import { MentorshipRequest } from '../../../shared/models/mentorship-request.model';
import { UserService } from '../../../core/services/user.service';
import { User } from '../../../shared/models/user.model';
import { BehaviorSubject, Subject, combineLatest, firstValueFrom, of } from 'rxjs';
import { map, shareReplay, startWith, switchMap } from 'rxjs/operators';
import { RequestStatus } from '../../../core/enums/request-status.enum';
import { TimeAgoPipe } from '../../../shared/pipes/time-ago.pipe';
import ErrorStateComponent from '../../../shared/components/error-state/error-state';
import LoadingStateComponent from '../../../shared/components/loading-state/loading-state';
import EmptyStateComponent from '../../../shared/components/empty-state/empty-state';
import { toObservable } from '@angular/core/rxjs-interop';
import { LoadingState, withLoadingState } from '../../../shared/rxjs/operators';
import {
  calculateMentorshipRequestCounts,
  getMentorshipRequestStatusBadgeClass,
} from '../../../shared/utils';
import { isDomainError } from '../../../domain/errors';

@Component({
  selector: 'app-mentorship-requests-list',
  imports: [TitleCasePipe, TimeAgoPipe, ErrorStateComponent, LoadingStateComponent, EmptyStateComponent, AsyncPipe],
  templateUrl: './mentorship-requests-list.html',
  styleUrl: './mentorship-requests-list.scss',
  changeDetection: ChangeDetectionStrategy.OnPush
})
export default class MentorshipRequestsList {
  mentorId = input.required<string>();

  private mentorshipRequestService = inject(MentorshipRequestService);
  private notificationService = inject(NotificationService);
  private userService = inject(UserService);
  getInitialsAvatar = getInitialsAvatar;
  readonly getStatusBadgeClass = getMentorshipRequestStatusBadgeClass;
  readonly RequestStatus = RequestStatus;

  private statusFilter$ = new BehaviorSubject<RequestStatus | 'all'>('all');
  private reload$ = new Subject<void>();
  private processingRequest$ = new BehaviorSubject<string | null>(null);

  private mentorId$ = toObservable(this.mentorId);

  private requestsState$ = combineLatest([
    this.mentorId$,
    this.reload$.pipe(startWith(void 0)),
  ]).pipe(
    switchMap(([mentorId]) => {
      if (!mentorId) {
        return of<LoadingState<MentorshipRequest[]>>({
          data: [],
          loading: false,
          error: 'A mentor identifier is required to load requests.',
        });
      }

      return this.mentorshipRequestService.watchMentorRequests(mentorId).pipe(
        withLoadingState<MentorshipRequest[]>([], {
          onError: () => {
            this.notificationService.error(
              'Unable to load requests',
              'Please check your connection or permissions and try again.',
              { duration: 5000 }
            );
          },
          errorMessage: (error) => this.describeError(error),
        })
      );
    }),
    shareReplay({ bufferSize: 1, refCount: true })
  );

  readonly viewModel$ = combineLatest({
    state: this.requestsState$,
    selectedStatus: this.statusFilter$,
  }).pipe(
    switchMap(({ state, selectedStatus }) => {
      const filteredRequests =
        selectedStatus === 'all'
          ? state.data
          : state.data.filter((request) => request.status === selectedStatus);

      const requestCounts = calculateMentorshipRequestCounts(state.data);

      // Pre-fetch all mentee profiles
      const uniqueMenteeIds = [...new Set(state.data.map(r => r.menteeId))];
      const menteeProfiles$ = uniqueMenteeIds.length > 0
        ? combineLatest(
            uniqueMenteeIds.map(id =>
              this.userService.observeProfile(id).pipe(
                map(user => ({ id, user })),
                startWith({ id, user: null })
              )
            )
          )
        : of([]);

      return menteeProfiles$.pipe(
        map(profiles => {
          const menteeById = new Map<string, User | null>();
          profiles.forEach(({ id, user }) => {
            menteeById.set(id, user);
          });

          return {
            ...state,
            filteredRequests,
            requestCounts,
            selectedStatus,
            menteeById,
            allRequests: state.data,
          };
        })
      );
    }),
    shareReplay({ bufferSize: 1, refCount: true })
  );

  readonly processingRequestState$ = this.processingRequest$.asObservable();

  async approveRequest(requestId: string) {
    this.processingRequest$.next(requestId);
    try {
      await firstValueFrom(this.mentorshipRequestService.approve(requestId));
      this.notificationService.success(
        'Request Approved',
        'The mentorship request has been approved successfully.',
        { duration: 5000 }
      );
    } catch {
      this.notificationService.error(
        'Approval Failed',
        'Unable to approve the request. Please try again.',
        { duration: 5000 }
      );
    } finally {
      this.processingRequest$.next(null);
    }
  }

  async rejectRequest(requestId: string, reason?: string) {
    this.processingRequest$.next(requestId);
    try {
      await firstValueFrom(this.mentorshipRequestService.reject(requestId, reason));
      this.notificationService.success(
        'Request Rejected',
        'The mentorship request has been rejected.',
        { duration: 5000 }
      );
    } catch {
      this.notificationService.error(
        'Rejection Failed',
        'Unable to reject the request. Please try again.',
        { duration: 5000 }
      );
    } finally {
      this.processingRequest$.next(null);
    }
  }

  async markAsCompleted(requestId: string) {
    this.processingRequest$.next(requestId);
    try {
      await firstValueFrom(this.mentorshipRequestService.markAsCompleted(requestId));
      this.notificationService.success(
        'Mentorship Completed',
        'The mentorship has been marked as completed.',
        { duration: 5000 }
      );
    } catch {
      this.notificationService.error(
        'Completion Failed',
        'Unable to mark mentorship as done. Please try again.',
        { duration: 5000 }
      );
    } finally {
      this.processingRequest$.next(null);
    }
  }

  setStatusFilter(status: RequestStatus | 'all') {
    this.statusFilter$.next(status);
  }

  retryLoad(): void {
    this.reload$.next();
  }

  getEmptyFilterMessage(status: RequestStatus | 'all'): string {
    switch (status) {
      case RequestStatus.Pending:
        return 'You have no pending mentorship requests at the moment.';
      case RequestStatus.Approved:
        return 'You have no approved mentorship requests. Requests will appear here once you accept them.';
      case RequestStatus.Rejected:
        return 'You have no rejected requests in this category.';
      case RequestStatus.Done:
        return 'You have no completed mentorships yet. Keep mentoring and making an impact!';
      default:
        return 'No requests found in this category.';
    }
  }

  private describeError(error: unknown): string {
    if (isDomainError(error)) {
      return error.message;
    }

    return 'We could not load mentorship requests right now. Please try again.';
  }
}
