import { ChangeDetectionStrategy, Component, inject, input, output, signal } from '@angular/core';
import { FormBuilder, ReactiveFormsModule, Validators } from '@angular/forms';
import { UserService } from '../../../core/services/user.service';
import { AuthService } from '../../../core/services/auth.service';
import { NotificationService } from '../../../core/services/notification.service';
import { firstValueFrom } from 'rxjs';

@Component({
  selector: 'app-cal-com-setup-guide',
  imports: [ReactiveFormsModule],
  templateUrl: './cal-com-setup-guide.html',
  styleUrl: './cal-com-setup-guide.scss',
  changeDetection: ChangeDetectionStrategy.OnPush
})
export default class CalComSetupGuide {
  isModalOpen = input.required<boolean>();
  closeModal = output<void>();
  setupComplete = output<string>();

  private formBuilder = inject(FormBuilder);
  private userService = inject(UserService);
  private authService = inject(AuthService);
  private notificationService = inject(NotificationService);

  isSubmitting = signal(false);
  currentStep = signal(1);
  totalSteps = 4;
  readonly math = Math;

  calComForm = this.formBuilder.group({
    username: ['', [Validators.required, Validators.pattern(/^[a-zA-Z0-9-_]+$/), Validators.minLength(3)]],
    confirmSetup: [false, Validators.requiredTrue]
  });

  nextStep() {
    if (this.currentStep() < this.totalSteps) {
      this.currentStep.update(step => step + 1);
    }
  }

  previousStep() {
    if (this.currentStep() > 1) {
      this.currentStep.update(step => step - 1);
    }
  }

  async onSubmit() {
    if (this.calComForm.invalid) {
      this.calComForm.markAllAsTouched();
      return;
    }

    this.isSubmitting.set(true);

    try {
      const username = this.calComForm.value.username!;
      const currentUser = this.authService.currentUser();

      if (!currentUser) {
        throw new Error('User not authenticated');
      }

      await firstValueFrom(this.userService.linkMentorCalendar(currentUser.uid, username));

      this.notificationService.success(
        'Cal.com Setup Complete!',
        'Your Cal.com calendar is now connected. Mentees can book sessions with you.',
        { duration: 5000 }
      );

      this.setupComplete.emit(username);
      this.closeModal.emit();
      this.calComForm.reset();

    } catch {
      this.notificationService.error(
        'Setup Failed',
        'Unable to save your Cal.com username. Please try again.',
        { duration: 5000 }
      );
    } finally {
      this.isSubmitting.set(false);
    }
  }

  onClose() {
    this.closeModal.emit();
    this.calComForm.reset();
    this.currentStep.set(1);
  }

  getStepTitle(step: number): string {
    switch (step) {
      case 1: return 'Welcome to Cal.com Setup';
      case 2: return 'Create Your Cal.com Account';
      case 3: return 'Configure Your Calendar';
      case 4: return 'Connect to COMpass';
      default: return 'Setup Guide';
    }
  }

  getStepContent(step: number): string {
    switch (step) {
      case 1: return 'As a mentor, you need to set up a Cal.com calendar for mentees to book sessions with you.';
      case 2: return 'Create a free account at cal.com and choose your username. This will be your booking link.';
      case 3: return 'Configure your availability, time zones, and meeting preferences in your Cal.com dashboard.';
      case 4: return 'Enter your Cal.com username below to connect your calendar to COMpass.';
      default: return '';
    }
  }
}
