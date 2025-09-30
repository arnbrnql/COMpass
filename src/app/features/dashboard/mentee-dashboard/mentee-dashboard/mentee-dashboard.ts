import { ChangeDetectionStrategy, Component } from '@angular/core';

@Component({
  selector: 'app-mentee-dashboard',
  standalone: true,
  imports: [],
  templateUrl: './mentee-dashboard.html',
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export default class MenteeDashboard {}
