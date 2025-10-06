import { ChangeDetectionStrategy, Component, computed, inject } from '@angular/core';
import { toSignal } from '@angular/core/rxjs-interop';
import { SessionService } from '../../../../core/services/session.service';
import SessionCard from '../../session-card/session-card';

@Component({
  selector: 'app-mentor-dashboard',
  imports: [SessionCard],
  templateUrl: './mentor-dashboard.html',
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export default class MentorDashboard {
  private sessionService = inject(SessionService);

  private allSessions = toSignal(this.sessionService.getSessionsForMentor(), { initialValue: [] });

  upcomingSessions = computed(() =>
    this.allSessions().filter(s => s.status === 'scheduled' || s.status === 'pending')
  );

  pastSessions = computed(() =>
    this.allSessions().filter(s => s.status === 'completed' || s.status === 'cancelled')
  );
}
