import { ChangeDetectionStrategy, Component, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { Router } from '@angular/router';
import { SafeResourceUrl } from '@angular/platform-browser';
import { BehaviorSubject, Subject, combineLatest, of } from 'rxjs';
import { map, shareReplay, startWith, switchMap } from 'rxjs/operators';

import { AuthService } from '../../../core/services/auth.service';
import { MentorshipRequestService } from '../../../core/services/mentorship-request';
import { NotificationService } from '../../../core/services/notification.service';
import { getInitialsAvatar } from '../../../shared/utils';
import { RequestStatus } from '../../../core/enums/request-status.enum';
import { TimeAgoPipe } from '../../../shared/pipes/time-ago.pipe';
import { MentorshipRequestFeedItem } from '../../../domain/services/mentorship-request.service';
import { CalService } from '../../../core/services/cal.service';
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

type MentorCalendarLink = {
  raw: string;
  safe: SafeResourceUrl;
};

@Component({
  selector: 'app-mentee-mentorship-requests',
  imports: [
    CommonModule,
    TimeAgoPipe,
    ErrorStateComponent,
    LoadingStateComponent,
    EmptyStateComponent,
  ],
  templateUrl: './mentee-mentorship-requests.html',
  styleUrl: './mentee-mentorship-requests.scss',
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export default class MenteeMentorshipRequests {
  private mentorshipRequestService = inject(MentorshipRequestService);
  private notificationService = inject(NotificationService);
  private authService = inject(AuthService);
  private calService = inject(CalService);
  private router = inject(Router);

  getInitialsAvatar = getInitialsAvatar;
  readonly getStatusBadgeClass = getMentorshipRequestStatusBadgeClass;
  readonly RequestStatus = RequestStatus;

  private statusFilter$ = new BehaviorSubject<RequestStatus | 'all'>('all');
  private reload$ = new Subject<void>();

  private currentUser$ = toObservable(this.authService.currentUser);

  private requestItemsState$ = combineLatest([
    this.currentUser$,
    this.reload$.pipe(startWith(void 0)),
  ]).pipe(
    switchMap(([user]) => {
      if (!user) {
        return of<LoadingState<MentorshipRequestFeedItem[]>>({
          data: [],
          loading: false,
          error: 'You need to be signed in to view your mentorship requests.',
        });
      }

      return this.mentorshipRequestService.watchMenteeRequestFeed(user.uid).pipe(
        withLoadingState<MentorshipRequestFeedItem[]>([], {
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
    state: this.requestItemsState$,
    selectedStatus: this.statusFilter$,
  }).pipe(
    map(({ state, selectedStatus }) => {
      const requests = state.data.map((item) => item.request);
      const filteredRequests =
        selectedStatus === 'all'
          ? requests
          : requests.filter((request) => request.status === selectedStatus);

      const requestCounts = calculateMentorshipRequestCounts(requests);

      const itemByMentorId = new Map<string, MentorshipRequestFeedItem>();
      const itemByRequestId = new Map<string, MentorshipRequestFeedItem>();
      const calendarByMentorId = new Map<string, MentorCalendarLink | null>();

      for (const item of state.data) {
        if (item.request.mentorId) {
          itemByMentorId.set(item.request.mentorId, item);
          calendarByMentorId.set(item.request.mentorId, this.buildMentorCalendarLink(item));
        }
        itemByRequestId.set(item.request.requestId, item);
      }

      return {
        ...state,
        selectedStatus,
        requests,
        filteredRequests,
        requestCounts,
        itemByMentorId,
        itemByRequestId,
        calendarByMentorId,
      };
    }),
    shareReplay({ bufferSize: 1, refCount: true })
  );

  setStatusFilter(status: RequestStatus | 'all') {
    this.statusFilter$.next(status);
  }

  retryLoad(): void {
    this.reload$.next();
  }

  goToMentorDirectory(): void {
    void this.router.navigate(['/discover-mentors']);
  }

  getEmptyFilterMessage(status: RequestStatus | 'all'): string {
    switch (status) {
      case RequestStatus.Pending:
        return 'You have no pending mentorship requests at the moment.';
      case RequestStatus.Approved:
        return 'You have no approved mentorship requests. Requests will appear here once mentors accept them.';
      case RequestStatus.Rejected:
        return 'You have no rejected requests in this category.';
      case RequestStatus.Done:
        return 'You have no completed mentorships yet. Keep learning and growing!';
      default:
        return 'No requests found in this category.';
    }
  }

  private buildMentorCalendarLink(item: MentorshipRequestFeedItem): MentorCalendarLink | null {
    const raw = item.schedule.bookingUrl();
    const safe = this.calService.buildSafeEmbedUrl(item.mentor?.mentorProfile?.calUsername ?? null);

    if (!raw || !safe) {
      return null;
    }

    return { raw, safe };
  }

  private describeError(error: unknown): string {
    if (isDomainError(error)) {
      return error.message;
    }

    return 'We could not load your mentorship requests right now. Please try again.';
  }
}
