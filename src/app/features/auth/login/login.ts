import { Component, inject, ChangeDetectionStrategy } from '@angular/core';
import { FormBuilder, ReactiveFormsModule, Validators } from '@angular/forms';
import { Router, RouterLink } from '@angular/router';
import { AsyncPipe } from '@angular/common';
import { Subject, of } from 'rxjs';
import { catchError, map, shareReplay, startWith, switchMap, tap } from 'rxjs/operators';
import { AuthService } from '../../../core/services/auth.service';

@Component({
  selector: 'app-login',
  imports: [ReactiveFormsModule, RouterLink, AsyncPipe],
  templateUrl: './login.html',
  styleUrl: './login.scss',
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export default class Login {
  private fb = inject(FormBuilder);
  private authService = inject(AuthService);
  private router = inject(Router);

  private submit$ = new Subject<{ email: string; password: string }>();

  readonly viewState$ = this.submit$.pipe(
    switchMap((credentials) =>
      this.authService.login(credentials).pipe(
        tap(() => this.router.navigate(['/dashboard'])),
        map(() => ({ loading: false, error: null })),
        startWith({ loading: true, error: null }),
        catchError(error =>
          of({ loading: false, error: this.getFriendlyErrorMessage(this.extractErrorCode(error)) })
        )
      )
    ),
    startWith({ loading: false, error: null }),
    shareReplay({ bufferSize: 1, refCount: true })
  );

  form = this.fb.nonNullable.group({
    email: ['', [Validators.required, Validators.email]],
    password: ['', [Validators.required]],
  });

  onSubmit() {
    if (this.form.invalid) {
      this.form.markAllAsTouched();
      return;
    }

    this.submit$.next(this.form.getRawValue());
  }

  private getFriendlyErrorMessage(errorCode: string): string {
    switch (errorCode) {
      case 'auth/invalid-email':
        return 'The email address is not valid.';
      case 'auth/user-not-found':
      case 'auth/wrong-password':
      case 'auth/invalid-credential':
        return 'Invalid email or password. Please try again.';
      default:
        return 'An unexpected error occurred during login.';
    }
  }

  private extractErrorCode(error: unknown): string {
    if (typeof error === 'object' && error && 'code' in error) {
      const code = (error as { code?: unknown }).code;
      if (typeof code === 'string') {
        return code;
      }
    }

    return 'unknown';
  }
}
