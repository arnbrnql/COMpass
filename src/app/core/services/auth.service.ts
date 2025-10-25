import { Injectable, inject } from '@angular/core';
import { User as FirebaseAuthUser, UserCredential } from '@angular/fire/auth';
import { Router } from '@angular/router';
import { BehaviorSubject, Observable, combineLatest, firstValueFrom, of } from 'rxjs';
import { catchError, map, shareReplay, startWith, switchMap, tap, finalize } from 'rxjs/operators';
import { toSignal } from '@angular/core/rxjs-interop';

import { LoginPayload, RegisterPayload } from '../../shared/models/auth.model';
import { User } from '../../shared/models/user.model';
import { MentorshipStatus, MenteeStatus } from '../enums/mentorship-status.enum';
import { AuthRepository } from '../../domain/repositories/auth.repository';
import { AUTH_REPOSITORY } from '../../domain/repositories/repository.tokens';
import { UserDomainService } from '../../domain/services/user.service';
import { AuthDomainService } from '../../domain/services/auth.service';

@Injectable({
  providedIn: 'root',
})
export class AuthService implements AuthDomainService {
  private router = inject(Router);
  private userService = inject(UserDomainService);
  private authRepository = inject<AuthRepository>(AUTH_REPOSITORY);

  private logoutInProgress$ = new BehaviorSubject<boolean>(false);

  private authState$ = this.authRepository
    .authState$()
    .pipe(shareReplay({ bufferSize: 1, refCount: true }));

  private profileState$ = combineLatest([this.authState$, this.logoutInProgress$]).pipe(
    switchMap(([user, loggingOut]) => {
      if (!user || loggingOut) {
        return of({ profile: null as User | null, loaded: true });
      }

      return this.userService.watchProfileContinuously(user.uid).pipe(
        map((profile) => ({ profile, loaded: true })),
        startWith({ profile: null as User | null, loaded: false }),
        catchError(() => of({ profile: null as User | null, loaded: true }))
      );
    }),
    shareReplay({ bufferSize: 1, refCount: true })
  );

  readonly currentUser = toSignal(this.authState$, { initialValue: null });
  readonly currentUserProfile = toSignal(this.profileState$.pipe(map((state) => state.profile)), {
    initialValue: null,
  });
  readonly isProfileLoaded = toSignal(this.profileState$.pipe(map((state) => state.loaded)), {
    initialValue: false,
  });

  readonly isAuthenticated = toSignal(this.authState$.pipe(map((user) => !!user)), {
    initialValue: false,
  });

  login(credentials: LoginPayload): Observable<UserCredential> {
    return this.authRepository.signIn(credentials);
  }

  async register(payload: RegisterPayload): Promise<void> {
    try {
      const userCredential = await this.authRepository.register(payload);
      await this.authRepository.updateDisplayName(userCredential.user, payload.displayName);

      const roleFlags = {
        isMentor: payload.role === 'mentor' || payload.role === 'both',
        isMentee: payload.role === 'mentee' || payload.role === 'both',
      };

      const mentorProfile = roleFlags.isMentor
        ? {
            mentorshipStatus: MentorshipStatus.Available,
            currentMentees: 0,
          }
        : undefined;

      const menteeProfile = roleFlags.isMentee
        ? {
            mentorshipStatus: MenteeStatus.Seeking,
          }
        : undefined;

      const newUser = User.fromProps({
        uid: userCredential.user.uid,
        email: userCredential.user.email!,
        displayName: userCredential.user.displayName!,
        photoURL: userCredential.user.photoURL || '',
        roleFlags,
        mentorProfile,
        menteeProfile,
        activeRole: roleFlags.isMentee ? 'mentee' : 'mentor',
      });

      await firstValueFrom(this.userService.register(newUser));
    } catch (error) {
      console.error('[AuthService] Registration failed:', error);
      throw error;
    }
  }

  logout(): Observable<void> {
    this.logoutInProgress$.next(true);

    return this.authRepository.signOut().pipe(
      tap(() => this.router.navigate(['/auth/login'])),
      finalize(() => this.logoutInProgress$.next(false))
    );
  }
}
