import { Component, inject, ChangeDetectionStrategy, signal } from '@angular/core';
import { FormBuilder, ReactiveFormsModule, Validators } from '@angular/forms';
import { Router, RouterLink } from '@angular/router';
import { AuthService } from '../../../core/services/auth.service';

@Component({
  selector: 'app-login',
  standalone: true,
  imports: [ReactiveFormsModule, RouterLink],
  templateUrl: './login.html',
  styleUrl: './login.scss',
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class LoginComponent {
  private fb = inject(FormBuilder);
  private authService = inject(AuthService);
  private router = inject(Router);

  isLoading = signal(false);
  errorMessage = signal<string | null>(null);

  form = this.fb.nonNullable.group({
    email: ['', [Validators.required, Validators.email]],
    password: ['', [Validators.required]],
  });

  async onSubmit() {
    if (this.form.invalid) {
      this.errorMessage.set('Please fill in all required fields correctly.');
      return;
    }

    this.isLoading.set(true);
    this.errorMessage.set(null);

    try {
      await this.authService.login(this.form.getRawValue());
      this.router.navigate(['/dashboard']);
    } catch (e: any) {
      console.error(e);
      this.errorMessage.set(e.message);
    } finally {
      this.isLoading.set(false);
    }
  }
}
