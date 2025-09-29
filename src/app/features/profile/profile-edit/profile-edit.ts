import {
  Component,
  inject,
  ChangeDetectionStrategy,
  signal,
  effect,
} from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormBuilder, ReactiveFormsModule, Validators } from '@angular/forms';
import { UserService } from '../../../core/services/user.service';
import { AuthService } from '../../../core/services/auth.service';
import { User } from '../../../shared/models/user.model';
import { firstValueFrom } from 'rxjs';

@Component({
  selector: 'app-profile-edit',
  standalone: true,
  imports: [CommonModule, ReactiveFormsModule],
  templateUrl: './profile-edit.html',
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class ProfileEdit {
  private fb = inject(FormBuilder);
  private userService = inject(UserService);
  private authService = inject(AuthService);

  isLoading = signal(false);
  statusMessage = signal<string | null>(null);
  currentUser = this.authService.currentUser;

  profileForm = this.fb.nonNullable.group({
    displayName: ['', Validators.required],
    bio: [''],
    location: [''],
    skills: [''],
    interests: [''],
    goals: [''],
  });

  constructor() {
    effect(async () => {
      const user = this.currentUser();
      if (user) {
        const profile = await firstValueFrom(
          this.userService.getUserProfile(user.uid)
        );
        if (profile) {
          this.profileForm.patchValue({
            displayName: profile.displayName || '',
            bio: profile.bio || '',
            location: profile.location || '',
            goals: profile.goals || '',
            skills: profile.skills?.join(', ') || '',
            interests: profile.interests?.join(', ') || '',
          });
        }
      }
    });
  }

  async onSubmit() {
    if (this.profileForm.invalid || !this.currentUser()) {
      this.statusMessage.set('Please fill out all required fields.');
      return;
    }

    this.isLoading.set(true);
    this.statusMessage.set(null);

    const formValue = this.profileForm.getRawValue();

    const profileData: Partial<User> = {
      ...formValue,
      skills: formValue.skills
        .split(',')
        .map((s) => s.trim())
        .filter((s) => s),
      interests: formValue.interests
        .split(',')
        .map((s) => s.trim())
        .filter((s) => s),
    };

    try {
      await firstValueFrom(
        this.userService.updateUserProfile(this.currentUser()!.uid, profileData)
      );
      this.statusMessage.set('Profile updated successfully!');
    } catch (e: any) {
      this.statusMessage.set(`Error: ${e.message}`);
    } finally {
      this.isLoading.set(false);
    }
  }
}
