import { ChangeDetectionStrategy, Component, OnInit, inject, signal } from '@angular/core';
import { Router } from '@angular/router';
import { FormBuilder, ReactiveFormsModule, Validators } from '@angular/forms';
import { AuthService } from '../../../core/services/auth.service';
import { UserService } from '../../../core/services/user.service';
import { User } from '../../../shared/models/user.model';
import { firstValueFrom } from 'rxjs';

@Component({
  selector: 'app-profile-edit',
  imports: [ReactiveFormsModule],
  templateUrl: './profile-edit.html',
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export default class ProfileEdit implements OnInit {
  private formBuilder = inject(FormBuilder);
  private authService = inject(AuthService);
  private userService = inject(UserService);
  private router = inject(Router);

  currentUser = this.authService.currentUserProfile;
  isSubmitting = signal(false);
  successMessage = signal<string | null>(null);

  profileForm = this.formBuilder.group({
    displayName: ['', Validators.required],
    bio: [''],
    location: [''],
    preferredLanguage: [''],
    mentorProfile: this.formBuilder.group({
      expertise: [''], // Will be handled as a string of tags
      industry: [''],
      calUsername: [''],
    }),
    menteeProfile: this.formBuilder.group({
      interests: [''], // Will be handled as a string of tags
      goals: [''], // Will be handled as a string of tags
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
        bio: user.bio,
        location: user.location,
        preferredLanguage: user.preferredLanguage,
        mentorProfile: {
          expertise: user.mentorProfile?.expertise?.join(', '),
          industry: user.mentorProfile?.industry,
          calUsername: user.mentorProfile?.calUsername,
        },
        menteeProfile: {
          interests: user.menteeProfile?.interests?.join(', '),
          goals: user.menteeProfile?.goals?.join(', '),
        },
      });
    }
  }

  async onSubmit() {
    if (this.profileForm.invalid) return;

    this.isSubmitting.set(true);
    this.successMessage.set(null);

    const formValue = this.profileForm.getRawValue();
    const user = this.currentUser();
    if (!user) return;

    // Convert comma-separated strings to arrays
    const updatedData: Partial<User> = {
      displayName: formValue.displayName || undefined,
      bio: formValue.bio || undefined,
      location: formValue.location || undefined,
      preferredLanguage: formValue.preferredLanguage || undefined,
      mentorProfile: {
        ...user.mentorProfile,
        expertise: formValue.mentorProfile.expertise
          ?.split(',')
          .map((s) => s.trim())
          .filter(Boolean),
        industry: formValue.mentorProfile.industry || undefined,
        calUsername: formValue.mentorProfile.calUsername || undefined,
      },
      menteeProfile: {
        ...user.menteeProfile,
        interests: formValue.menteeProfile.interests
          ?.split(',')
          .map((s) => s.trim())
          .filter(Boolean),
        goals: formValue.menteeProfile.goals
          ?.split(',')
          .map((s) => s.trim())
          .filter(Boolean),
      },
    };

    try {
      await firstValueFrom(this.userService.updateUserProfile(user.uid, updatedData));
      this.successMessage.set('Profile updated successfully!');
    } catch (error) {
      console.error('Error updating profile:', error);
    } finally {
      this.isSubmitting.set(false);
    }
  }

  // Navigate back to dashboard based on the user's active role (falls back to 'mentee')
  goBack(): void {
    const user = this.currentUser();
    const role = user?.roleFlags?.isMentor ? 'mentor' : 'mentee';
    this.router.navigate(['/dashboard', role]);
  }
}
