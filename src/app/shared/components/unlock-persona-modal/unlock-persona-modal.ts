import { Component, ChangeDetectionStrategy, signal, inject, output } from '@angular/core';
import { ReactiveFormsModule, FormBuilder, Validators } from '@angular/forms';
import { UserService } from '../../../core/services/user.service';
import { AuthService } from '../../../core/services/auth.service';
import { firstValueFrom } from 'rxjs';

@Component({
  selector: 'app-unlock-persona-modal',
  imports: [ReactiveFormsModule],
  templateUrl: './unlock-persona-modal.html',
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class UnlockPersonaModal {
  private fb = inject(FormBuilder);
  private userService = inject(UserService);
  private authService = inject(AuthService);

  close = output<void>();
  unlockSuccess = output<void>();

  unlockForm = this.fb.group({
    roleToUnlock: ['', Validators.required],
    bio: [''],
    expertise: [''],
    goals: [''],
  });

  isSubmitting = signal(false);

  open(role: 'mentor' | 'mentee') {
    this.unlockForm.reset();
    this.unlockForm.get('roleToUnlock')?.setValue(role);
  }

  async onSubmit() {
    if (this.unlockForm.invalid) return;
    this.isSubmitting.set(true);

    const currentUser = this.authService.currentUserProfile();
    if (!currentUser) return;

    const { roleToUnlock, bio, expertise, goals } = this.unlockForm.value;

    const updatedProfile = { ...currentUser };
    updatedProfile.roleFlags = { ...currentUser.roleFlags };

    if (roleToUnlock === 'mentor') {
      updatedProfile.roleFlags.isMentor = true;
      updatedProfile.mentorProfile = {
        ...updatedProfile.mentorProfile,
        expertise: (expertise || '').split(',').map(s => s.trim()),
      };
      if (bio) updatedProfile.bio = bio;
    } else {
      updatedProfile.roleFlags.isMentee = true;
      updatedProfile.menteeProfile = {
        ...updatedProfile.menteeProfile,
        goals: (goals || '').split(',').map(s => s.trim()),
      };
    }

    try {
      await firstValueFrom(this.userService.updateUserProfile(currentUser.uid, updatedProfile));
      this.unlockSuccess.emit();
    } catch (error) {
      console.error('Failed to unlock persona', error);
    } finally {
      this.isSubmitting.set(false);
    }
  }
}
