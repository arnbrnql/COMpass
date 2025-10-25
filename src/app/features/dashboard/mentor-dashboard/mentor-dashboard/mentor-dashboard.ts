import { ChangeDetectionStrategy, Component, inject } from '@angular/core';
import { toObservable } from '@angular/core/rxjs-interop';
import { RouterLink } from '@angular/router';
import { AsyncPipe } from '@angular/common';
import { AuthService } from '../../../../core/services/auth.service';
import { MentorshipRequestService } from '../../../../core/services/mentorship-request';
import MentorshipRequestsList from '../../../mentorship/mentorship-requests-list/mentorship-requests-list';
import { Subject, combineLatest, of } from 'rxjs';
import { map, shareReplay, startWith, switchMap } from 'rxjs/operators';
import { RequestStatus } from '../../../../core/enums/request-status.enum';
import ErrorStateComponent from '../../../../shared/components/error-state/error-state';
import { isDomainError } from '../../../../domain/errors';
import { LoadingState, withLoadingState } from '../../../../shared/rxjs/operators';
import { MentorshipRequest } from '../../../../shared/models/mentorship-request.model';

@Component({
  selector: 'app-mentor-dashboard',
  imports: [RouterLink, MentorshipRequestsList, ErrorStateComponent, AsyncPipe],
  templateUrl: './mentor-dashboard.html',
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export default class MentorDashboard {
  private authService = inject(AuthService);
  private mentorshipRequestService = inject(MentorshipRequestService);
  private reload$ = new Subject<void>();

  readonly currentUser$ = toObservable(this.authService.currentUserProfile);

  private requestsState$ = combineLatest([
    this.currentUser$,
    this.reload$.pipe(startWith(void 0)),
  ]).pipe(
    switchMap(([user]) => {
      if (!user) {
        return of<LoadingState<MentorshipRequest[]>>({
          data: [],
          loading: false,
          error: null,
        });
      }

      return this.mentorshipRequestService.watchMentorRequests(user.uid).pipe(
        withLoadingState<MentorshipRequest[]>([], {
          errorMessage: (error) => this.describeError(error),
        })
      );
    }),
    shareReplay({ bufferSize: 1, refCount: true })
  );

  readonly viewModel$ = this.requestsState$.pipe(
    map((state) => {
      const requests = state.data;
      const stats = {
        totalRequests: requests.length,
        pendingRequests: requests.filter((r) => r.status === RequestStatus.Pending).length,
        approvedRequests: requests.filter((r) => r.status === RequestStatus.Approved).length,
        completedMentorships: requests.filter((r) => r.status === RequestStatus.Done).length,
        activeMentees: requests.filter((r) => r.status === RequestStatus.Approved).length,
      };

      return {
        ...state,
        stats,
      };
    }),
    shareReplay({ bufferSize: 1, refCount: true })
  );

  retryLoad(): void {
    this.reload$.next();
  }

  private describeError(error: unknown): string {
    if (isDomainError(error)) {
      return error.message;
    }

    return 'We were unable to load your mentorship requests. Please try again shortly.';
  }
}
