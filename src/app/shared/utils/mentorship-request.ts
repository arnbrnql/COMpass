import { RequestStatus } from '../../core/enums/request-status.enum';
import { MentorshipRequest } from '../models/mentorship-request.model';

export interface MentorshipRequestCounts {
  all: number;
  pending: number;
  approved: number;
  rejected: number;
  done: number;
}

export function calculateMentorshipRequestCounts(
  requests: readonly MentorshipRequest[]
): MentorshipRequestCounts {
  return requests.reduce<MentorshipRequestCounts>(
    (counts, request) => {
      switch (request.status) {
        case RequestStatus.Pending:
          counts.pending += 1;
          break;
        case RequestStatus.Approved:
          counts.approved += 1;
          break;
        case RequestStatus.Rejected:
          counts.rejected += 1;
          break;
        case RequestStatus.Done:
          counts.done += 1;
          break;
        default:
          break;
      }

      counts.all += 1;
      return counts;
    },
    { all: 0, pending: 0, approved: 0, rejected: 0, done: 0 }
  );
}

export function getMentorshipRequestStatusBadgeClass(status: RequestStatus): string {
  switch (status) {
    case RequestStatus.Pending:
      return 'badge-warning';
    case RequestStatus.Approved:
      return 'badge-success';
    case RequestStatus.Rejected:
      return 'badge-error';
    case RequestStatus.Done:
      return 'badge-info';
    default:
      return 'badge-neutral';
  }
}
