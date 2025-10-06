import { ChangeDetectionStrategy, Component, computed, inject, input, signal, effect } from '@angular/core';
import { Session } from '../../../shared/models/session.model';
import { DatePipe } from '@angular/common';
import { UserService } from '../../../core/services/user.service';
import { AuthService } from '../../../core/services/auth.service';
import { RouterLink } from '@angular/router';
import { User } from '../../../shared/models/user.model';

@Component({
  selector: 'app-session-card',
  imports: [DatePipe, RouterLink],
  templateUrl: './session-card.html',
  styleUrl: './session-card.scss',
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export default class SessionCard {
  session = input.required<Session>();

  private userService = inject(UserService);
  private authService = inject(AuthService);

  private currentUser = this.authService.currentUserProfile;

  // Store the other user's profile
  otherUser = signal<User | null>(null);

  // Determine who the 'other user' in the session is
  private otherUserId = computed(() => {
    const currentUserId = this.currentUser()?.uid;
    const session = this.session();
    return currentUserId === session.mentorId ? session.menteeId : session.mentorId;
  });

  // Determine the role of the other user for display purposes
  otherUserRole = computed(() => {
    const currentUserId = this.currentUser()?.uid;
    return currentUserId === this.session().mentorId ? 'Mentee' : 'Mentor';
  });

  constructor() {
    // Fetch the other user's profile when the otherUserId changes
    effect(() => {
      const userId = this.otherUserId();
      if (userId) {
        this.userService.getUserProfile(userId).subscribe(user => {
          this.otherUser.set(user);
        });
      } else {
        this.otherUser.set(null);
      }
    });
  }
}
