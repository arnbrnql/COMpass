import { ChangeDetectionStrategy, Component, input } from '@angular/core';
import { User } from '../../../shared/models/user.model';
import { RouterLink } from '@angular/router';

@Component({
  selector: 'app-mentor-card',
  imports: [RouterLink],
  templateUrl: './mentor-card.html',
  styleUrl: './mentor-card.scss',
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export default class MentorCard {
  mentor = input.required<User>();
}
