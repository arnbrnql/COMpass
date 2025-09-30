import { ChangeDetectionStrategy, Component, inject } from '@angular/core';
import { toSignal } from '@angular/core/rxjs-interop';
import { MentorService } from '../../../core/services/mentor.service';
import { User } from '../../../shared/models/user.model';
import MentorCard from '../mentor-card/mentor-card';

@Component({
  selector: 'app-discover',
  imports: [MentorCard],
  templateUrl: './discover.html',
  styleUrl: './discover.scss',
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export default class Discover {
  private mentorService = inject(MentorService);
  mentors = toSignal(this.mentorService.getMentors(), { initialValue: [] as User[] });
}
