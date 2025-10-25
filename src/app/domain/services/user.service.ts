import { Observable } from 'rxjs';

import { User, UserProps } from '../../shared/models/user.model';

/**
 * Domain contract for user profile interactions.
 */
export abstract class UserDomainService {
  abstract observeProfile(uid: string | undefined): Observable<User | null>;
  abstract watchProfileContinuously(uid: string | undefined): Observable<User | null>;
  abstract register(user: User): Observable<void>;
  abstract applyProfileChanges(uid: string, data: Partial<UserProps>): Observable<void>;
  abstract linkMentorCalendar(uid: string, username: string): Observable<void>;
}
