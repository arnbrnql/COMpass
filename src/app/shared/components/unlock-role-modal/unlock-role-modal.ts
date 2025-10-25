import { Component, ChangeDetectionStrategy, signal, inject, output } from '@angular/core';
import { ReactiveFormsModule, FormBuilder, Validators } from '@angular/forms';
import { UserService } from '../../../core/services/user.service';
import { AuthService } from '../../../core/services/auth.service';
import { NotificationService } from '../../../core/services/notification.service';
import { firstValueFrom } from 'rxjs';
import { UserProps } from '../../../shared/models/user.model';

@Component({
  selector: 'app-unlock-role-modal',
  imports: [ReactiveFormsModule],
  templateUrl: './unlock-role-modal.html',
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class UnlockRoleModal {
  private fb = inject(FormBuilder);
  private userService = inject(UserService);
  private authService = inject(AuthService);
  private notificationService = inject(NotificationService);

  close = output<void>();
  unlockSuccess = output<{ role: 'mentor' | 'mentee' }>();

  unlockForm = this.fb.group({
    roleToUnlock: ['', Validators.required],
    expertise: [''],
    goals: [''],
  });

  isSubmitting = signal(false);

  open(role: 'mentor' | 'mentee') {
    this.unlockForm.reset();
    this.unlockForm.patchValue({
      roleToUnlock: role,
      expertise: '',
      goals: '',
    });
  }

  async onSubmit() {
    if (this.unlockForm.invalid) {
      this.notificationService.error(
        'Invalid Form',
        'Please check your inputs and try again.',
        { duration: 3000 }
      );
      return;
    }

    this.isSubmitting.set(true);

    const currentUser = this.authService.currentUserProfile();
    if (!currentUser) {
      this.notificationService.error(
        'Authentication Error',
        'Please sign in again to continue.',
        { duration: 3000 }
      );
      this.isSubmitting.set(false);
      return;
    }

    const roleToUnlock = this.unlockForm.get('roleToUnlock')!.value as 'mentor' | 'mentee';
    const expertise = (this.unlockForm.get('expertise')!.value || '')
      .split(',')
      .map(s => s.trim())
      .filter(Boolean);
    const goals = (this.unlockForm.get('goals')!.value || '')
      .split(',')
      .map(s => s.trim())
      .filter(Boolean);

    const roleFlags = currentUser.roleFlags;
    const partialUpdate: Partial<UserProps> = {
      roleFlags: {
        ...roleFlags,
        isMentor: roleToUnlock === 'mentor' ? true : roleFlags.isMentor,
        isMentee: roleToUnlock === 'mentee' ? true : roleFlags.isMentee,
      },
      // Set the active role immediately to avoid second Firebase write
      activeRole: roleToUnlock,
    };

    if (roleToUnlock === 'mentor') {
      partialUpdate.mentorProfile = {
        ...(currentUser.mentorProfile ?? {}),
        ...(expertise.length ? { expertise } : {}),
      };
    } else {
      partialUpdate.menteeProfile = {
        ...(currentUser.menteeProfile ?? {}),
        ...(goals.length ? { goals } : {}),
      };
    }

    try {
      await firstValueFrom(this.userService.applyProfileChanges(currentUser.uid, partialUpdate));

      this.notificationService.success(
        'Role Unlocked!',
        `You can now access ${roleToUnlock} features.`,
        { duration: 3000 }
      );

      // Wait a moment for Firestore to propagate the changes
      await new Promise(resolve => setTimeout(resolve, 300));

      this.unlockSuccess.emit({ role: roleToUnlock });
    } catch (error) {
      console.error('Error unlocking role:', error);
      this.notificationService.error(
        'Failed to Unlock Role',
        'Something went wrong. Please try again.',
        { duration: 5000 }
      );
      this.isSubmitting.set(false);
    }
  }
}

