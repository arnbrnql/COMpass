import { ChangeDetectionStrategy, Component, OnInit, effect, inject, signal } from '@angular/core';
import { Router } from '@angular/router';
import { FormBuilder, ReactiveFormsModule, Validators } from '@angular/forms';
import BackButtonComponent, {
  BackButtonFallbackEvent,
} from '../../../shared/components/back-button/back-button';
import { AuthService } from '../../../core/services/auth.service';
import { UserService } from '../../../core/services/user.service';
import { User, UserProps } from '../../../shared/models/user.model';
import { firstValueFrom } from 'rxjs';

@Component({
  selector: 'app-profile-edit',
  imports: [ReactiveFormsModule, BackButtonComponent],
  templateUrl: './profile-edit.html',
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export default class ProfileEdit implements OnInit {
  private formBuilder = inject(FormBuilder);
  private authService = inject(AuthService);
  private userService = inject(UserService);
  private router = inject(Router);

  currentUser = signal<User | null>(null);
  isSubmitting = signal(false);
  successMessage = signal<string | null>(null);

  private syncProfileEffect = effect(() => {
    const user = this.authService.currentUserProfile();
    this.currentUser.set(user);
    // Repopulate form when user data changes (e.g., after refresh)
    if (user) {
      this.populateForm();
    }
  });

  profileForm = this.formBuilder.group({
    displayName: ['', [Validators.required, Validators.maxLength(80)]],
    bio: ['', Validators.maxLength(500)],
    mentorProfile: this.formBuilder.group({
      expertise: [''],
      calUsername: [''],
    }),
    menteeProfile: this.formBuilder.group({
      goals: [''],
    }),
  });

  ngOnInit(): void {
    this.populateForm();
  }

  private populateForm(): void {
    const user = this.currentUser();
    if (user) {
      this.profileForm.patchValue({
        displayName: user.displayName,
        bio: user.bio || '',
        mentorProfile: {
          expertise: user.mentorProfile?.expertise?.join(', ') || '',
          calUsername: user.mentorProfile?.calUsername || '',
        },
        menteeProfile: {
          goals: user.menteeProfile?.goals?.join(', ') || '',
        },
      });
    }
  }

  async onSubmit() {
    const user = this.currentUser();
    if (!user) return;

    if (user.isMentor()) {
      const calUsername = this.profileForm.get('mentorProfile.calUsername')?.value?.trim();
      if (!calUsername) {
        this.profileForm.get('mentorProfile.calUsername')?.setErrors({ required: true });
        this.profileForm.get('mentorProfile.calUsername')?.markAsTouched();
        return;
      }
    }

    if (this.profileForm.invalid) return;

    this.isSubmitting.set(true);
    this.successMessage.set(null);

    const formValue = this.profileForm.getRawValue();

    const displayName = formValue.displayName?.trim() || user.displayName;
    const bio = formValue.bio?.trim() || '';

    const mentorProfile = user.isMentor()
      ? {
          ...(user.mentorProfile ?? {}),
          expertise: (formValue.mentorProfile?.expertise || '')
            .split(',')
            .map(s => s.trim())
            .filter(Boolean),
          calUsername: formValue.mentorProfile?.calUsername?.trim() || null,
        }
      : undefined;

    const menteeProfile = user.isMentee()
      ? {
          ...(user.menteeProfile ?? {}),
          goals: (formValue.menteeProfile?.goals || '')
            .split(',')
            .map(s => s.trim())
            .filter(Boolean),
        }
      : undefined;

    const updatedData: Partial<UserProps> = this.removeUndefined({
      displayName,
      bio,
      ...(mentorProfile ? { mentorProfile } : {}),
      ...(menteeProfile ? { menteeProfile } : {}),
    });

    try {
      await firstValueFrom(this.userService.applyProfileChanges(user.uid, updatedData));
      // The AuthService will automatically pick up the changes via the continuous watch
      // and the syncProfileEffect will update the form
      this.successMessage.set('Profile updated successfully!');
    } catch (error) {
      console.error('Failed to save profile:', error);
      this.successMessage.set('Failed to save profile. Please try again.');
    } finally {
      this.isSubmitting.set(false);
    }
  }

  private removeUndefined<T>(value: T): T {
    if (Array.isArray(value)) {
      return value.map((item) => this.removeUndefined(item)) as unknown as T;
    }

    if (value !== null && typeof value === 'object') {
      return Object.entries(value as Record<string, unknown>)
        .filter(([, v]) => v !== undefined)
        .reduce((acc, [key, v]) => {
          (acc as Record<string, unknown>)[key] = this.removeUndefined(v);
          return acc;
        }, {} as Record<string, unknown>) as T;
    }

    return value;
  }

  goBack(event?: BackButtonFallbackEvent): void {
    event?.preventDefault();
    const user = this.currentUser();
    const role = user?.isMentor() ? 'mentor' : 'mentee';
    void this.router.navigate(['/dashboard', role]);
  }
}
