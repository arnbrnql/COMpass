import { ChangeDetectionStrategy, Component, computed, inject } from '@angular/core';
import { toSignal } from '@angular/core/rxjs-interop';
import { RouterLink } from '@angular/router';
import { SessionService } from '../../../../core/services/session.service';
import { Session } from '../../../../shared/models/session.model';
import SessionCard from '../../session-card/session-card';

@Component({
  selector: 'app-mentee-dashboard',
  imports: [RouterLink, SessionCard],
  templateUrl: './mentee-dashboard.html',
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export default class MenteeDashboard {
  private sessionService = inject(SessionService);

  private allSessions = toSignal(this.sessionService.getSessionsForMentee(), { initialValue: [] });

  upcomingSessions = computed(() =>
    this.allSessions().filter(s => s.status === 'scheduled' || s.status === 'pending')
  );

  pastSessions = computed(() =>
    this.allSessions().filter(s => s.status === 'completed' || s.status === 'cancelled')
  );
}
