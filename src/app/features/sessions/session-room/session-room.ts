import { ChangeDetectionStrategy, Component, computed, inject, signal } from '@angular/core';
import { toSignal } from '@angular/core/rxjs-interop';
import { DomSanitizer, SafeResourceUrl } from '@angular/platform-browser';
import { ActivatedRoute, Router, RouterLink } from '@angular/router';
import { SessionService } from '../../../core/services/session.service';
import { Session } from '../../../shared/models/session.model';
import { Observable, of } from 'rxjs';
import { switchMap, finalize } from 'rxjs/operators';
import { DatePipe } from '@angular/common';
import { AuthService } from '../../../core/services/auth.service';
import FeedbackModal from '../feedback-modal/feedback-modal';

@Component({
  selector: 'app-session-room',
  imports: [RouterLink, DatePipe, FeedbackModal],
  templateUrl: './session-room.html',
  styleUrl: './session-room.scss',
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export default class SessionRoom {
  private route = inject(ActivatedRoute);
  private sessionService = inject(SessionService);
  private sanitizer = inject(DomSanitizer);
  private authService = inject(AuthService);
  private router = inject(Router);

  isLoading = signal(true);
  isCompleting = signal(false);
  isFeedbackModalOpen = signal(false);

  private session$: Observable<Session | null> = this.route.params.pipe(
    switchMap(params => {
      this.isLoading.set(true);
      const id = params['id'] as string;
      if (!id) {
        this.isLoading.set(false);
        return of(null);
      }
      return this.sessionService.getSessionById(id).pipe(
        finalize(() => this.isLoading.set(false))
      );
    })
  );

  session = toSignal(this.session$);
  currentUser = this.authService.currentUserProfile;

  // Computed signal for the sanitized Jitsi meeting URL
  jitsiUrl = computed<SafeResourceUrl | null>(() => {
    const meetingLink = this.session()?.meetingLink;
    if (!meetingLink) {
      return null;
    }

    // Safely encode the display name (fallback = "Participant" if null/undefined)
    const name = encodeURIComponent(this.currentUser()?.displayName ?? 'Participant');

    // Build the final URL with Jitsi config options
    const urlWithParams = `${meetingLink}#config.prejoinPageEnabled=false&userInfo.displayName=${name}`;

    // Mark the URL as safe for Angular (so it can be used in an <iframe src>)
    return this.sanitizer.bypassSecurityTrustResourceUrl(urlWithParams);
  });

  // Method to mark the session as completed
  async markAsCompleted() {
    const currentSession = this.session();
    if (!currentSession) return;

    this.isCompleting.set(true);
    this.sessionService.updateSessionStatus(currentSession.sessionId, 'completed').subscribe({
      next: () => {
        this.isCompleting.set(false);
        this.isFeedbackModalOpen.set(true); // Open the modal on success
      },
      error: (err) => {
        console.error('Failed to update session status', err);
        this.isCompleting.set(false);
      }
    });
  }

  handleCloseModal() {
    this.isFeedbackModalOpen.set(false);
    this.router.navigate(['/']); // Navigate home after modal is closed
  }
}
