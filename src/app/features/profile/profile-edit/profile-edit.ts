import { Component, Signal, effect, inject } from '@angular/core';
import { toSignal } from '@angular/core/rxjs-interop';
import { FormBuilder, ReactiveFormsModule, Validators, FormArray, FormControl } from '@angular/forms';
import { User } from '../../../shared/models/user.model';
import { AuthService } from '../../../core/services/auth.service';
import { UserService } from '../../../core/services/user.service';

@Component({
  selector: 'app-profile-edit',
  standalone: true,
  imports: [ReactiveFormsModule],
  templateUrl: './profile-edit.html',
  styleUrl: './profile-edit.scss'
})
export class ProfileEdit {
  private fb = inject(FormBuilder);
  private authService = inject(AuthService);
  private userService = inject(UserService);

  currentUser: Signal<User | null> = this.authService.currentUser;
  userProfile: Signal<User | undefined> = toSignal(
    this.userService.getUserProfile(this.currentUser()!.uid)
  );

  profileForm = this.fb.group({
    displayName: [''],
    bio: [''],
    location: [''],
    skills: this.fb.array<string>([])
  });

  constructor() {
    effect(() => {
      const profile = this.userProfile();
      if (profile) {
        this.skills.clear();
        if (profile.skills) {
          profile.skills.forEach(skill => this.skills.push(this.fb.control(skill)));
        }
        this.profileForm.patchValue(profile);
      }
    });
  }

  get skills() {
    return this.profileForm.get('skills') as FormArray;
  }

  addSkill() {
    this.skills.push(this.fb.control<string>(''));
  }

  removeSkill(index: number) {
    this.skills.removeAt(index);
  }

  async onSubmit() {
    if (!this.currentUser()) return;

    const formData = this.profileForm.value as Partial<User>;
    try {
      await this.userService.updateUserProfile(this.currentUser()!.uid, formData);
      alert('Profile updated successfully!');
    } catch (error) {
      console.error('Error updating profile', error);
      alert('Failed to update profile.');
    }
  }
}
