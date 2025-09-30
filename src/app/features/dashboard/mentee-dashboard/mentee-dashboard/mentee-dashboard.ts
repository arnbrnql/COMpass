import { ChangeDetectionStrategy, Component } from '@angular/core';
import { RouterLink } from '@angular/router';

@Component({
  selector: 'app-mentee-dashboard',
  imports: [RouterLink],
  templateUrl: './mentee-dashboard.html',
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export default class MenteeDashboard {}
