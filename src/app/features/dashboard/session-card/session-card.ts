import { ChangeDetectionStrategy, Component, effect, inject, input, signal, DestroyRef } from '@angular/core';
import { Session } from '../../../shared/models/session.model';
import { DatePipe } from '@angular/common';
import { UserService } from '../../../core/services/user.service';
import { User } from '../../../shared/models/user.model';
import { RouterLink } from '@angular/router';
import { takeUntilDestroyed } from '@angular/core/rxjs-interop';

@Component({
  selector: 'app-session-card',
  imports: [DatePipe, RouterLink],
  templateUrl: './session-card.html',
  styleUrl: './session-card.scss',
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export default class SessionCard {
  private userService = inject(UserService);
  private destroyRef = inject(DestroyRef);

  session = input.required<Session>();

  // Store mentor data in a signal
  mentor = signal<User | null>(null);

  constructor() {
    // Fetch mentor when session changes
    effect(() => {
      const mentorId = this.session().mentorId;
      if (mentorId) {
        this.userService.getUserProfile(mentorId)
          .pipe(takeUntilDestroyed(this.destroyRef))
          .subscribe(user => {
            this.mentor.set(user);
          });
      } else {
        this.mentor.set(null);
      }
    });
  }
}
