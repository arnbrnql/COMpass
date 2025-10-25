import {
  ApplicationConfig,
  ErrorHandler,
  provideBrowserGlobalErrorListeners,
  provideZoneChangeDetection,
  isDevMode,
} from '@angular/core';
import { provideRouter, withComponentInputBinding } from '@angular/router';
import { initializeApp, provideFirebaseApp } from '@angular/fire/app';
import { getAnalytics, provideAnalytics, ScreenTrackingService, UserTrackingService } from '@angular/fire/analytics';
import { initializeAppCheck, ReCaptchaEnterpriseProvider, provideAppCheck } from '@angular/fire/app-check';
import { getAuth, provideAuth } from '@angular/fire/auth';
import { getFirestore, provideFirestore } from '@angular/fire/firestore';
import { getFunctions, provideFunctions } from '@angular/fire/functions';
import { getMessaging, provideMessaging } from '@angular/fire/messaging';
import { getPerformance, providePerformance } from '@angular/fire/performance';
import { getStorage, provideStorage } from '@angular/fire/storage';

import { environment } from '../environments/environment';
import { routes } from './app.routes';
import { provideRepositories } from './app.repository-providers';
import { APP_CONFIG } from './core/config/app-config.token';
import { CalService } from './core/services/cal.service';
import { GlobalErrorHandler } from './core/services/global-error-handler.service';
import { MentorshipRequestService } from './core/services/mentorship-request';
import { MentorService } from './core/services/mentor.service';
import { AuthService } from './core/services/auth.service';
import { UserService } from './core/services/user.service';
import { CalDomainService } from './domain/services/cal.service';
import { MentorshipRequestDomainService } from './domain/services/mentorship-request.service';
import { MentorDomainService } from './domain/services/mentor.service';
import { AuthDomainService } from './domain/services/auth.service';
import { UserDomainService } from './domain/services/user.service';

const firebaseProviders = [
  provideFirebaseApp(() => initializeApp(environment.firebase)),
  provideAuth(() => getAuth()),
  provideAnalytics(() => getAnalytics()),
  ScreenTrackingService,
  UserTrackingService,
  provideAppCheck(() => {
    const globalRef = globalThis as typeof globalThis & {
      FIREBASE_APPCHECK_DEBUG_TOKEN?: boolean | string;
    };

    globalRef.FIREBASE_APPCHECK_DEBUG_TOKEN = true;

    const provider = new ReCaptchaEnterpriseProvider(environment.recaptchaEnterpriseKey);
    return initializeAppCheck(undefined, { provider, isTokenAutoRefreshEnabled: true });
  }),
  provideFirestore(() => getFirestore()),
  provideFunctions(() => getFunctions()),
  provideMessaging(() => getMessaging()),
  providePerformance(() => getPerformance()),
  provideStorage(() => getStorage()),
];

const domainProviders = [
  { provide: AuthDomainService, useExisting: AuthService },
  { provide: UserDomainService, useExisting: UserService },
  { provide: MentorDomainService, useExisting: MentorService },
  { provide: MentorshipRequestDomainService, useExisting: MentorshipRequestService },
  { provide: CalDomainService, useExisting: CalService },
];

export const appConfig: ApplicationConfig = {
  providers: [
    { provide: APP_CONFIG, useValue: environment },
    { provide: ErrorHandler, useClass: GlobalErrorHandler },
    provideBrowserGlobalErrorListeners(),
    provideZoneChangeDetection({ eventCoalescing: true }),
    provideRouter(routes, withComponentInputBinding()),
    ...firebaseProviders,
    ...provideRepositories(environment.repositoryProviderOverrides),
    ...domainProviders,
  ]
};
