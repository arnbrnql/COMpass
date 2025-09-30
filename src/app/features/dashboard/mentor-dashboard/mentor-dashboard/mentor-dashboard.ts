import { ChangeDetectionStrategy, Component } from '@angular/core';

@Component({
  selector: 'app-mentor-dashboard',
  standalone: true,
  imports: [],
  templateUrl: './mentor-dashboard.html',
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export default class MentorDashboard {}
