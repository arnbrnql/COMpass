import { ChangeDetectionStrategy, Component, computed, inject, signal } from '@angular/core';
import { toSignal } from '@angular/core/rxjs-interop';
import { DomSanitizer, SafeResourceUrl } from '@angular/platform-browser';
import { ActivatedRoute, RouterLink } from '@angular/router';
import { UserService } from '../../../core/services/user.service';
import { User } from '../../../shared/models/user.model';
import { Observable, of } from 'rxjs';
import { switchMap, finalize } from 'rxjs/operators';
import RequestModal from '../request-modal/request-modal';

@Component({
  selector: 'app-mentor-profile',
  imports: [RouterLink, RequestModal],
  templateUrl: './mentor-profile.html',
  styleUrl: './mentor-profile.scss',
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export default class MentorProfile {
  private route = inject(ActivatedRoute);
  private userService = inject(UserService);
  private sanitizer = inject(DomSanitizer);

  isLoading = signal(true);
  isRequestModalOpen = signal(false);

  private mentor$: Observable<User | null> = this.route.params.pipe(
    switchMap(params => {
      this.isLoading.set(true);
      const id = params['id'] as string;
      if (!id) {
        this.isLoading.set(false);
        return of(null);
      }
      return this.userService.getUserProfile(id).pipe(
        finalize(() => this.isLoading.set(false))
      );
    })
  );

  mentor = toSignal(this.mentor$);

  // This computed signal will create the sanitized Cal.com URL
  // It will only have a value if the mentor has set their calUsername
  calComUrl = computed<SafeResourceUrl | null>(() => {
    const username = this.mentor()?.mentorProfile?.calUsername;
    if (!username) {
      return null;
    }
    // You can customize this URL structure based on the specific Cal.com event type link
    const url = `https://cal.com/${username}`;
    return this.sanitizer.bypassSecurityTrustResourceUrl(url);
  });
}
