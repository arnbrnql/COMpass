import { Observable } from 'rxjs';

import { PaginationOptions } from '../utils/validation';
import { User } from '../../shared/models/user.model';

export type MentorCursor = unknown;

export interface MentorPaginationOptions extends PaginationOptions {}

export interface MentorPaginationMetadata {
  page: number;
  limit: number;
  total: number;
  totalPages: number;
  hasNext: boolean;
  hasPrevious: boolean;
}

export interface MentorPaginationResult {
  data: User[];
  pagination: MentorPaginationMetadata;
}

export interface MentorInfiniteResult {
  data: User[];
  cursor: MentorCursor | null;
}

/**
 * Abstraction for mentor discovery queries.
 */
export abstract class MentorRepository {
  abstract streamMentors(excludeUid?: string | null): Observable<User[]>;

  abstract streamMentorsPaginated(
    excludeUid: string | null,
    options: MentorPaginationOptions
  ): Observable<MentorPaginationResult>;

  abstract streamMentorsInfinite(
    excludeUid: string | null,
    limit: number,
    cursor?: MentorCursor | null
  ): Observable<MentorInfiniteResult>;
}
