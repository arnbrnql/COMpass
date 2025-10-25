import { Observable } from 'rxjs';

import {
  MentorshipRequest,
  MentorshipRequestFormData,
} from '../../shared/models/mentorship-request.model';
import { PaginationOptions } from '../utils/validation';

export interface MentorshipRequestPaginationOptions extends PaginationOptions {}

export interface MentorshipRequestPaginationMetadata {
  page: number;
  limit: number;
  total: number;
  totalPages: number;
  hasNext: boolean;
  hasPrevious: boolean;
}

export interface MentorshipRequestPaginationResult {
  data: MentorshipRequest[];
  pagination: MentorshipRequestPaginationMetadata;
}

/**
 * Abstraction around mentorship request persistence.
 */
export abstract class MentorshipRequestRepository {
  abstract createRequest(
    menteeId: string,
    mentorId: string,
    formData: MentorshipRequestFormData
  ): Observable<string>;

  abstract streamRequestsForMentor(mentorId: string): Observable<MentorshipRequest[]>;

  abstract streamRequestsForMentee(menteeId: string): Observable<MentorshipRequest[]>;

  abstract streamRequestById(requestId: string): Observable<MentorshipRequest | null>;

  abstract approveRequest(requestId: string): Observable<void>;

  abstract rejectRequest(requestId: string, reason?: string): Observable<void>;

  abstract hasExistingRequest(menteeId: string, mentorId: string): Observable<boolean>;

  abstract streamRequestsForMentorPaginated(
    mentorId: string,
    options: MentorshipRequestPaginationOptions
  ): Observable<MentorshipRequestPaginationResult>;

  abstract markAsDone(requestId: string): Observable<void>;

  abstract saveBookingUrl(requestId: string, bookingUrl: string): Observable<void>;

  abstract hasCalendarAccess(menteeId: string, mentorId: string): Observable<boolean>;
}
