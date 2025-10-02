import { ChangeDetectionStrategy, Component, input } from '@angular/core';
import { Session } from '../../../shared/models/session.model';
import { DatePipe } from '@angular/common';

@Component({
  selector: 'app-session-card',
  imports: [DatePipe],
  templateUrl: './session-card.html',
  styleUrl: './session-card.scss',
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export default class SessionCard {
  session = input.required<Session>();
}
