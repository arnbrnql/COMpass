import { ChangeDetectionStrategy, Component, inject, computed, signal } from '@angular/core';
import { RouterLink } from '@angular/router';
import { toSignal, toObservable } from '@angular/core/rxjs-interop';
import MenteeMentorshipRequests from '../../../mentorship/mentee-mentorship-requests/mentee-mentorship-requests';
import { AuthService } from '../../../../core/services/auth.service';
import { MentorshipRequestService } from '../../../../core/services/mentorship-request';
import { of, Subject } from 'rxjs';
import { catchError, startWith, switchMap, tap } from 'rxjs/operators';
import { RequestStatus } from '../../../../core/enums/request-status.enum';
import ErrorStateComponent from '../../../../shared/components/error-state/error-state';
import { isDomainError } from '../../../../domain/errors';

@Component({
  selector: 'app-mentee-dashboard',
  imports: [RouterLink, MenteeMentorshipRequests, ErrorStateComponent],
  templateUrl: './mentee-dashboard.html',
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export default class MenteeDashboard {
  private authService = inject(AuthService);
  private mentorshipRequestService = inject(MentorshipRequestService);
  private reload$ = new Subject<void>();

  currentUser = this.authService.currentUserProfile;

  private currentUser$ = toObservable(this.authService.currentUserProfile);

  isLoading = signal(true);
  loadError = signal<string | null>(null);

  requests = toSignal(
    this.reload$.pipe(
      startWith(void 0),
      switchMap(() =>
        this.currentUser$.pipe(
          switchMap(user => {
            if (!user) {
              this.isLoading.set(false);
              return of([]);
            }

            this.isLoading.set(true);
            this.loadError.set(null);

            return this.mentorshipRequestService.watchMenteeRequests(user.uid).pipe(
              tap(() => this.isLoading.set(false)),
              catchError(error => {
                this.isLoading.set(false);
                this.loadError.set(this.describeError(error));
                return of([]);
              })
            );
          })
        )
      )
    ),
    {
      initialValue: []
    }
  );

  dashboardStats = computed(() => {
    const reqs = this.requests();
    return {
      totalRequests: reqs.length,
      pendingRequests: reqs.filter(r => r.status === RequestStatus.Pending).length,
      approvedRequests: reqs.filter(r => r.status === RequestStatus.Approved).length,
      completedMentorships: reqs.filter(r => r.status === RequestStatus.Done).length,
      activeMentorships: reqs.filter(r => r.status === RequestStatus.Approved).length,
    };
  });

  get hasAnyRequests(): boolean {
    return (this.requests() || []).length > 0;
  }

  retryLoad(): void {
    this.isLoading.set(true);
    this.loadError.set(null);
    this.reload$.next();
  }

  private describeError(error: unknown): string {
    if (isDomainError(error)) {
      return error.message;
    }

    return 'We were unable to load your mentorship requests. Please try again shortly.';
  }
}
