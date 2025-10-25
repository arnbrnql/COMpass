import { ChangeDetectionStrategy, Component, input } from '@angular/core';
import { User } from '../../../shared/models/user.model';
import { RouterLink } from '@angular/router';
import { getInitialsAvatar } from '../../../shared/utils';

@Component({
  selector: 'app-mentor-card',
  imports: [RouterLink],
  templateUrl: './mentor-card.html',
  styleUrl: './mentor-card.scss',
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export default class MentorCard {
  mentor = input.required<User>();

  getAvatarFor(user: User): string {
    const url = user.photoURL?.trim();
    return url ? url : getInitialsAvatar(user.displayName, { size: 112 });
  }

  isDataUrl(value: string): boolean {
    return /^data:image\//.test(value);
  }
}
