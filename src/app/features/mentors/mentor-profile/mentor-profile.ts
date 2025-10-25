import {
  ChangeDetectionStrategy,
  Component,
  DestroyRef,
  computed,
  effect,
  inject,
  signal,
} from '@angular/core';
import { toObservable, toSignal } from '@angular/core/rxjs-interop';
import { SafeResourceUrl } from '@angular/platform-browser';
import { ActivatedRoute, Router, RouterLink } from '@angular/router';
import { Observable, combineLatest, of } from 'rxjs';
import { catchError, finalize, map, switchMap } from 'rxjs/operators';

import { AuthService } from '../../../core/services/auth.service';
import { MentorshipRequestService } from '../../../core/services/mentorship-request';
import { UserService } from '../../../core/services/user.service';
import { MentorshipRequest } from '../../../shared/models/mentorship-request.model';
import { User } from '../../../shared/models/user.model';
import RequestMentorshipModal from '../../mentorship/request-mentorship-modal/request-mentorship-modal';
import { RequestStatus } from '../../../core/enums/request-status.enum';
import CalComSetupGuide from '../../mentorship/cal-com-setup-guide/cal-com-setup-guide';
import { CalService } from '../../../core/services/cal.service';
import ErrorStateComponent from '../../../shared/components/error-state/error-state';
import LoadingStateComponent from '../../../shared/components/loading-state/loading-state';
import EmptyStateComponent from '../../../shared/components/empty-state/empty-state';
import BackButtonComponent from '../../../shared/components/back-button/back-button';
import { isDomainError } from '../../../domain/errors';
import { getDefaultAvatarDataUri } from '../../../shared/utils';

@Component({
  selector: 'app-mentor-profile',
  imports: [
    RouterLink,
    RequestMentorshipModal,
    CalComSetupGuide,
    ErrorStateComponent,
    LoadingStateComponent,
    EmptyStateComponent,
    BackButtonComponent,
  ],
  templateUrl: './mentor-profile.html',
  styleUrl: './mentor-profile.scss',
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export default class MentorProfile {
  private readonly route = inject(ActivatedRoute);
  private readonly userService = inject(UserService);
  private readonly mentorshipRequestService = inject(MentorshipRequestService);
  private readonly authService = inject(AuthService);
  private readonly calService = inject(CalService);
  private readonly router = inject(Router);
  private readonly destroyRef = inject(DestroyRef);

  readonly RequestStatus = RequestStatus;
  readonly getDefaultAvatar = getDefaultAvatarDataUri;

  readonly isLoading = signal(true);
  readonly isRequestModalOpen = signal(false);
  readonly loadError = signal<string | null>(null);
  private readonly manualRequestPending = signal(false);
  private mentor$: Observable<User | null> = this.route.params.pipe(
    switchMap(params => {
      this.isLoading.set(true);
      const id = (params['id'] as string | undefined) ?? '';

      if (!id) {
        this.isLoading.set(false);
        return of(null);
      }

      this.loadError.set(null);

      return this.userService.observeProfile(id).pipe(
        finalize(() => this.isLoading.set(false)),
        catchError(error => {
          this.loadError.set(this.describeError(error));
          return of(null);
        })
      );
    })
  );

  private currentUser$ = toObservable(this.authService.currentUser);
  private activeRequest = toSignal(
    combineLatest([this.currentUser$, this.mentor$]).pipe(
      switchMap(([currentUser, mentor]) => {
        if (!currentUser || !mentor) {
          return of(null);
        }

        return this.mentorshipRequestService.watchMenteeRequests(currentUser.uid).pipe(
          catchError(() => of([])),
          map(requests =>
            requests.find(request =>
              request.mentorId === mentor.uid &&
              (request.status === RequestStatus.Pending || request.status === RequestStatus.Approved)
            ) ?? null
          )
        );
      })
    ),
    { initialValue: null as MentorshipRequest | null }
  );

  private remoteHasExistingRequest = computed(() => !!this.activeRequest());

  hasExistingRequest = computed(() => this.manualRequestPending() || this.remoteHasExistingRequest());
  readonly successMessage = signal<string | null>(null);
  readonly showCalComSetup = signal(false);
  protected readonly isAuthenticated = this.authService.isAuthenticated;

  requestStatus = computed<RequestStatus | null>(() => {
    if (this.manualRequestPending()) {
      return RequestStatus.Pending;
    }

    return this.activeRequest()?.status ?? null;
  });

  mentor = toSignal(this.mentor$);

  private calComLink = computed(() =>
    this.calService.buildPublicBookingUrl(this.mentor()?.mentorProfile?.calUsername)
  );

  calComUrl = computed<SafeResourceUrl | null>(() =>
    this.calService.buildSafeEmbedUrl(this.mentor()?.mentorProfile?.calUsername)
  );

  hasCalendarAccess = computed(() => {
    const request = this.activeRequest();
    if (!request) {
      return false;
    }

    return request.status === RequestStatus.Approved && request.calendarAccess?.isUnlocked === true;
  });

  private readonly syncPendingRequestEffect = effect(() => {
    if (this.activeRequest()) {
      this.manualRequestPending.set(false);
    }
  });

  openRequestModal() {
    if (!this.canOpenRequestModal()) {
      return;
    }

    this.isRequestModalOpen.set(true);
    this.successMessage.set(null);
  }

  closeRequestModal() {
    this.isRequestModalOpen.set(false);
  }

  avatarFor(user: User | null): string {
    const url = user?.photoURL?.trim();
    return url && url.length > 0 ? url : this.getDefaultAvatar();
  }

  isDataUrl(value: string): boolean {
    return /^data:image\//.test(value);
  }

  handleRequestSuccess(_requestId: string) {
    this.successMessage.set('Mentorship request sent successfully!');
    this.manualRequestPending.set(true);
    this.scheduleSuccessMessageClear();
  }

  getRequestStatusLabel(status: RequestStatus | null): string {
    switch (status) {
      case RequestStatus.Pending:
        return 'Pending approval';
      case RequestStatus.Approved:
        return 'Approved';
      case RequestStatus.Rejected:
        return 'Rejected';
      case RequestStatus.Done:
        return 'Completed';
      default:
        return 'Unknown';
    }
  }

  openCalComSetup() {
    this.showCalComSetup.set(true);
  }

  closeCalComSetup() {
    this.showCalComSetup.set(false);
  }

  onCalComSetupComplete(username: string) {
    this.successMessage.set('Cal.com calendar connected successfully!');
    this.showCalComSetup.set(false);
    this.scheduleSuccessMessageClear();
  }

  navigateToDirectory(): void {
    void this.router.navigate(['/discover-mentors']);
  }

  private isViewingOwnProfile(): boolean {
    const viewer = this.authService.currentUser();
    const mentor = this.mentor();
    return !!viewer && !!mentor && viewer.uid === mentor.uid;
  }

  shouldShowCalSetupPrompt(): boolean {
    const mentor = this.mentor();
    if (!mentor) return false;
    const missingCal = !mentor.mentorProfile?.calUsername?.trim();
    return this.isViewingOwnProfile() && missingCal;
  }

  shouldShowVisitorCalInfo(): boolean {
    const mentor = this.mentor();
    if (!mentor) return false;
    const missingCal = !mentor.mentorProfile?.calUsername?.trim();
    return !this.isViewingOwnProfile() && missingCal;
  }

  bookingUrl(): string | null {
    if (!this.hasCalendarAccess()) return null;
    return this.calComLink();
  }

  requestBlockReason(): string | null {
    if (!this.isAuthenticated()) {
      return 'Please sign in to request mentorship.';
    }
    if (this.isViewingOwnProfile()) {
      return 'You cannot request mentorship from yourself.';
    }
    if (this.hasExistingRequest()) {
      return 'You already have an active request with this mentor.';
    }
    return null;
  }

  canOpenRequestModal(): boolean {
    return (
      this.isAuthenticated() &&
      !this.isViewingOwnProfile() &&
      !this.hasExistingRequest() &&
      !this.isLoading()
    );
  }

  private describeError(error: unknown): string {
    if (isDomainError(error)) {
      return error.message;
    }

    return 'We could not load this mentor right now. Please try again later.';
  }

  private successMessageTimeoutId: number | null = null;
  private hasRegisteredTimeoutCleanup = false;

  private scheduleSuccessMessageClear(delay = 5000): void {
    if (!this.hasRegisteredTimeoutCleanup) {
      this.destroyRef.onDestroy(() => this.clearSuccessMessageTimeout());
      this.hasRegisteredTimeoutCleanup = true;
    }

    this.clearSuccessMessageTimeout();
    this.successMessageTimeoutId = window.setTimeout(() => {
      this.successMessageTimeoutId = null;
      this.successMessage.set(null);
    }, delay);
  }

  private clearSuccessMessageTimeout(): void {
    if (this.successMessageTimeoutId !== null) {
      window.clearTimeout(this.successMessageTimeoutId);
      this.successMessageTimeoutId = null;
    }
  }
}
