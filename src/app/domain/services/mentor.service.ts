import { Observable } from 'rxjs';

import { User } from '../../shared/models/user.model';
import {
  MentorCursor,
  MentorInfiniteResult,
  MentorPaginationOptions,
  MentorPaginationResult,
} from '../repositories/mentor.repository';

/**
 * Domain contract for mentor discovery use cases.
 */
export abstract class MentorDomainService {
  abstract watchMentorDirectory(): Observable<User[]>;
  abstract paginateMentorDirectory(options: MentorPaginationOptions): Observable<MentorPaginationResult>;
  abstract scrollMentorDirectory(limit: number, cursor?: MentorCursor | null): Observable<MentorInfiniteResult>;
}
