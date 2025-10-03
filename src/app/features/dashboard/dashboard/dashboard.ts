import { ChangeDetectionStrategy, Component, inject } from '@angular/core';
import { RoleService } from '../../../core/services/role.service';
import MentorDashboard from '../mentor-dashboard/mentor-dashboard/mentor-dashboard';
import MenteeDashboard from '../mentee-dashboard/mentee-dashboard/mentee-dashboard';

@Component({
  selector: 'app-dashboard',
  imports: [MentorDashboard, MenteeDashboard],
  templateUrl: './dashboard.html',
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export default class Dashboard {
  roleService = inject(RoleService);
}
