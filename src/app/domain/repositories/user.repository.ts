import { Observable } from 'rxjs';

import { User, UserProps } from '../../shared/models/user.model';

export interface UserQueryOptions {
  role?: 'mentor' | 'mentee';
  limit?: number;
  searchTerm?: string;
}

/**
 * Abstraction around persistence of user profile documents.
 */
export abstract class UserRepository {
  /** Listen for profile updates for a given UID. */
  abstract watchProfile(uid: string): Observable<User | null>;

  /** Fetch a user profile once without subscribing to updates. */
  abstract fetchProfile(uid: string): Observable<User | null>;

  /** Persist a newly registered user profile. */
  abstract createProfile(user: User): Observable<void>;

  /** Apply a partial update to an existing user profile. */
  abstract updateProfile(uid: string, data: Partial<UserProps>): Observable<void>;

  /** Delete a user profile. */
  abstract deleteProfile(uid: string): Observable<void>;

  /** Query user profiles using optional filters. */
  abstract queryProfiles(options?: UserQueryOptions): Observable<User[]>;
}
