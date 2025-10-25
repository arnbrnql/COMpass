import { Provider } from '@angular/core';

import {
  AUTH_REPOSITORY,
  CAL_REPOSITORY,
  MENTOR_REPOSITORY,
  MENTORSHIP_REQUEST_REPOSITORY,
  RepositoryProviderOverrides,
  USER_REPOSITORY,
} from './domain/repositories/repository.tokens';
import { FirebaseAuthRepository } from './data/firebase/firebase-auth.repository';
import { FirebaseUserRepository } from './data/firebase/firebase-user.repository';
import { FirebaseMentorRepository } from './data/firebase/firebase-mentor.repository';
import { FirebaseMentorshipRequestRepository } from './data/firebase/firebase-mentorship-request.repository';
import { CalComRepository } from './data/cal/cal.repository';

type RepositoryKey = keyof RepositoryProviderOverrides;

type RepositoryProviderFactory = (
  overrides: RepositoryProviderOverrides | undefined,
) => Provider;

const providerFactories: Record<RepositoryKey, RepositoryProviderFactory> = {
  auth: (overrides) => ({
    provide: AUTH_REPOSITORY,
    useClass: overrides?.auth ?? FirebaseAuthRepository,
  }),
  user: (overrides) => ({
    provide: USER_REPOSITORY,
    useClass: overrides?.user ?? FirebaseUserRepository,
  }),
  mentor: (overrides) => ({
    provide: MENTOR_REPOSITORY,
    useClass: overrides?.mentor ?? FirebaseMentorRepository,
  }),
  mentorshipRequest: (overrides) => ({
    provide: MENTORSHIP_REQUEST_REPOSITORY,
    useClass: overrides?.mentorshipRequest ?? FirebaseMentorshipRequestRepository,
  }),
  cal: (overrides) => ({
    provide: CAL_REPOSITORY,
    useClass: overrides?.cal ?? CalComRepository,
  }),
};

const repositoryKeys = Object.keys(providerFactories) as RepositoryKey[];

export function provideRepositories(
  overrides: RepositoryProviderOverrides | undefined,
): Provider[] {
  return repositoryKeys.map((key) => providerFactories[key](overrides));
}
