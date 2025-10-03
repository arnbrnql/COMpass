import { ChangeDetectionStrategy, Component, computed, inject, signal } from '@angular/core';
import { toSignal } from '@angular/core/rxjs-interop';
import { DomSanitizer, SafeResourceUrl } from '@angular/platform-browser';
import { ActivatedRoute, RouterLink } from '@angular/router';
import { SessionService } from '../../../core/services/session.service';
import { Session } from '../../../shared/models/session.model';
import { Observable, of } from 'rxjs';
import { switchMap, finalize } from 'rxjs/operators';
import { DatePipe } from '@angular/common';
import { AuthService } from '../../../core/services/auth.service';

@Component({
  selector: 'app-session-room',
  imports: [RouterLink, DatePipe],
  templateUrl: './session-room.html',
  styleUrl: './session-room.scss',
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export default class SessionRoom {
  private route = inject(ActivatedRoute);
  private sessionService = inject(SessionService);
  private sanitizer = inject(DomSanitizer);
  private authService = inject(AuthService);

  isLoading = signal(true);

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
  }
