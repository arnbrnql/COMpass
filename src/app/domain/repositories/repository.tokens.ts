import { InjectionToken, Type } from '@angular/core';

import { AuthRepository } from './auth.repository';
import { CalRepository } from './cal.repository';
import { MentorRepository } from './mentor.repository';
import { MentorshipRequestRepository } from './mentorship-request.repository';
import { UserRepository } from './user.repository';

export const AUTH_REPOSITORY = new InjectionToken<AuthRepository>('AuthRepository');
export const USER_REPOSITORY = new InjectionToken<UserRepository>('UserRepository');
export const MENTOR_REPOSITORY = new InjectionToken<MentorRepository>('MentorRepository');
export const MENTORSHIP_REQUEST_REPOSITORY = new InjectionToken<MentorshipRequestRepository>('MentorshipRequestRepository');
export const CAL_REPOSITORY = new InjectionToken<CalRepository>('CalRepository');

export interface RepositoryProviderOverrides {
  auth?: Type<AuthRepository>;
  user?: Type<UserRepository>;
  mentor?: Type<MentorRepository>;
  mentorshipRequest?: Type<MentorshipRequestRepository>;
  cal?: Type<CalRepository>;
}
