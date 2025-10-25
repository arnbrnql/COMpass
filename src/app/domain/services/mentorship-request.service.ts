import { Observable } from 'rxjs';

import { MentorshipRequest, MentorshipRequestFormData } from '../../shared/models/mentorship-request.model';
import { MentorshipRequestPaginationOptions, MentorshipRequestPaginationResult } from '../repositories/mentorship-request.repository';
import { User } from '../../shared/models/user.model';
import { Schedule } from '../models/schedule';

export interface MentorshipRequestFeedItem {
  request: MentorshipRequest;
  mentor: User | null;
  schedule: Schedule;
}

/**
 * Domain contract for mentorship request workflows.
 */
export abstract class MentorshipRequestDomainService {
  abstract requestMentorship(mentorId: string, formData: MentorshipRequestFormData): Observable<string>;
  abstract watchMentorRequests(mentorId: string): Observable<MentorshipRequest[]>;
  abstract watchMenteeRequests(menteeId: string): Observable<MentorshipRequest[]>;
  abstract watchMenteeRequestFeed(menteeId: string): Observable<MentorshipRequestFeedItem[]>;
  abstract watchRequest(requestId: string): Observable<MentorshipRequest | null>;
  abstract approve(requestId: string): Observable<void>;
  abstract reject(requestId: string, reason?: string): Observable<void>;
  abstract hasOutstandingRequest(menteeId: string, mentorId: string): Observable<boolean>;
  abstract paginateMentorRequests(
    mentorId: string,
    options: MentorshipRequestPaginationOptions
  ): Observable<MentorshipRequestPaginationResult>;
  abstract markAsCompleted(requestId: string): Observable<void>;
  abstract recordBookingUrl(requestId: string, bookingUrl: string): Observable<void>;
  abstract observeCalendarAccess(menteeId: string, mentorId: string): Observable<boolean>;
}
