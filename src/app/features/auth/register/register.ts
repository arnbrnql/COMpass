import { ChangeDetectionStrategy, Component, inject, signal } from '@angular/core';
import { FormBuilder, ReactiveFormsModule, Validators } from '@angular/forms';
import { Router, RouterLink } from '@angular/router';
import { AuthService } from '../../../core/services/auth.service';
import CalComSetupGuide from '../../mentorship/cal-com-setup-guide/cal-com-setup-guide';

@Component({
  selector: 'app-register',
  imports: [ReactiveFormsModule, RouterLink, CalComSetupGuide],
  templateUrl: './register.html',
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export default class Register {
  private formBuilder = inject(FormBuilder);
  private authService = inject(AuthService);
  private router = inject(Router);

  isLoading = signal(false);
  errorMessage = signal<string | null>(null);
  showCalComSetup = signal(false);

  registerForm = this.formBuilder.group({
    displayName: ['', [Validators.required, Validators.minLength(3)]],
    email: ['', [Validators.required, Validators.email]],
    password: ['', [Validators.required, Validators.minLength(6)]],
    role: ['mentee' as 'mentee' | 'mentor' | 'both', Validators.required],
  });

  async onSubmit() {
    if (this.registerForm.invalid) {
      this.registerForm.markAllAsTouched();
      return;
    }

    this.isLoading.set(true);
    this.errorMessage.set(null);

    const formValue = this.registerForm.getRawValue();

    try {
      await this.authService.register({
        displayName: formValue.displayName!,
        email: formValue.email!,
        password: formValue.password!,
        role: formValue.role as 'mentee' | 'mentor' | 'both'
      });

      if (formValue.role === 'mentor' || formValue.role === 'both') {
        this.showCalComSetup.set(true);
        this.isLoading.set(false);
        return;
      }

      this.router.navigate(['/']);
    } catch (error) {
      this.errorMessage.set(this.getFriendlyErrorMessage(this.extractErrorCode(error)));
    } finally {
      this.isLoading.set(false);
    }
  }

  async onCalComSetupComplete(username: string) {
    this.showCalComSetup.set(false);
    this.router.navigate(['/']);
  }

  onCalComSetupClose() {
    this.showCalComSetup.set(false);
    this.router.navigate(['/']);
  }

  private getFriendlyErrorMessage(errorCode: string): string {
    switch (errorCode) {
      case 'auth/email-already-in-use':
        return 'This email address is already in use by another account.';
      case 'auth/invalid-email':
        return 'The email address is not valid.';
      case 'auth/weak-password':
        return 'The password is too weak. It must be at least 6 characters long.';
      default:
        return 'An unexpected error occurred during registration.';
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
