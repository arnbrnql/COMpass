import { ChangeDetectionStrategy, Component, inject } from '@angular/core';
import { toSignal } from '@angular/core/rxjs-interop';
import { DomSanitizer, SafeResourceUrl } from '@angular/platform-browser';
import { ActivatedRoute } from '@angular/router';
import { UserService } from '../../../core/services/user.service';
import { User } from '../../../shared/models/user.model';
import { Observable, of, switchMap } from 'rxjs';

@Component({
  selector: 'app-mentor-profile',
  templateUrl: './mentor-profile.html',
  styleUrl: './mentor-profile.scss',
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export default class MentorProfile {
  private route = inject(ActivatedRoute);
  private userService = inject(UserService);
  private sanitizer = inject(DomSanitizer);

  private mentor$: Observable<User | null> = this.route.params.pipe(
    switchMap(params => {
      const id = params['id'] as string;
      if (!id) {
        return of(null);
      }
      return this.userService.getUserProfile(id);
    })
  );

  mentor = toSignal(this.mentor$);

  // IMPORTANT: Replace 'YOUR_CAL_DOT_COM_USERNAME' with the mentor's actual Cal.com username.
  // This will need to be stored in the mentor's profile in a future step.
  // For now, we use a placeholder.
  // In a real implementation, this would be: `https://cal.com/${this.mentor()?.calUsername}`
  getCalComUrl(): SafeResourceUrl | null {
    const mentor = this.mentor();
    if (!mentor) {
      return null;
    }

    // Placeholder URL for the MVP.
    const url = `https://cal.com/team/compass-app/mentorship-session`;
    return this.sanitizer.bypassSecurityTrustResourceUrl(url);
  }
}
