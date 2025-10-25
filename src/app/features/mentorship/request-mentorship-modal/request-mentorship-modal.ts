import { ChangeDetectionStrategy, Component, inject, input, output, signal } from '@angular/core';
import {
  FormArray,
  FormBuilder,
  FormControl,
  ReactiveFormsModule,
  Validators,
} from '@angular/forms';
import { MentorshipRequestService } from '../../../core/services/mentorship-request';
import { NotificationService } from '../../../core/services/notification.service';
import { MentorshipRequestFormData } from '../../../shared/models/mentorship-request.model';
import { firstValueFrom } from 'rxjs';
import { AuthService } from '../../../core/services/auth.service';

@Component({
  selector: 'app-request-mentorship-modal',
  imports: [ReactiveFormsModule],
  templateUrl: './request-mentorship-modal.html',
  styleUrl: './request-mentorship-modal.scss',
  changeDetection: ChangeDetectionStrategy.OnPush
})
export default class RequestMentorshipModal {
  mentorId = input.required<string>();
  mentorName = input<string>('');
  isModalOpen = input.required<boolean>();
  closeModal = output<void>();
  requestSuccess = output<string>();

  private formBuilder = inject(FormBuilder);
  private nonNullableBuilder = this.formBuilder.nonNullable;
  private mentorshipRequestService = inject(MentorshipRequestService);
  private notificationService = inject(NotificationService);
  private authService = inject(AuthService);

  isSubmitting = signal(false);
  errorMessage = signal<string | null>(null);

  readonly requestForm = this.nonNullableBuilder.group({
    message: ['', [Validators.required, Validators.minLength(10), Validators.maxLength(1000)]],
    goals: this.formBuilder.array<FormControl<string>>([
      this.nonNullableBuilder.control(''),
    ]),
    experienceLevel: this.nonNullableBuilder.control<'beginner' | 'intermediate' | 'advanced'>('beginner'),
    preferredMeetingFrequency: this.nonNullableBuilder.control<
      'weekly' | 'bi-weekly' | 'monthly' | 'as-needed'
    >('weekly'),
  });

  get goalsArray(): FormArray<FormControl<string>> {
    return this.requestForm.controls.goals;
  }

  addGoal() {
    if (this.goalsArray.length < 5) {
      this.goalsArray.push(this.nonNullableBuilder.control(''));
    }
  }

  removeGoal(index: number) {
    if (this.goalsArray.length > 1) {
      this.goalsArray.removeAt(index);
    }
  }

  async onSubmit() {
    if (this.requestForm.invalid) {
      this.requestForm.markAllAsTouched();
      return;
    }

    this.isSubmitting.set(true);
    this.errorMessage.set(null);

    try {
      const currentUser = this.authService.currentUser();
      if (!currentUser) {
        throw new Error('You must be logged in to send a request.');
      }

      const hasActiveRequest = await firstValueFrom(
        this.mentorshipRequestService.hasOutstandingRequest(currentUser.uid, this.mentorId())
      );
      if (hasActiveRequest) {
        this.errorMessage.set('You already have a pending or approved request with this mentor.');
        this.notificationService.error(
          'Duplicate Request',
          'You already have an active request with this mentor.',
          { duration: 5000 }
        );
        return;
      }

      const formValue = this.requestForm.getRawValue();
      const formData: MentorshipRequestFormData = {
        message: formValue.message,
        goals: this.goalsArray.value.map(goal => goal.trim()).filter(Boolean),
        experienceLevel: formValue.experienceLevel,
        preferredMeetingFrequency: formValue.preferredMeetingFrequency,
      };

      const requestId = await firstValueFrom(
        this.mentorshipRequestService.requestMentorship(this.mentorId(), formData)
      );

      this.notificationService.success(
        'Mentorship Request Sent!',
        'Your request has been sent to the mentor. You\'ll be notified when they respond.',
        { duration: 5000 }
      );

      this.requestSuccess.emit(requestId);
      this.closeModal.emit();
      this.resetFormValues();

    } catch {
      this.errorMessage.set('Failed to send mentorship request. Please try again.');
      this.notificationService.error(
        'Request Failed',
        'Unable to send your mentorship request. Please try again.',
        { duration: 5000 }
      );
    } finally {
      this.isSubmitting.set(false);
    }
  }

  onClose() {
    this.closeModal.emit();
    this.resetFormValues();
    this.errorMessage.set(null);
  }

  private resetFormValues(): void {
    this.requestForm.controls.message.reset('');
    this.requestForm.controls.experienceLevel.setValue('beginner');
    this.requestForm.controls.preferredMeetingFrequency.setValue('weekly');
    this.goalsArray.clear();
    this.addGoal();
    this.requestForm.markAsPristine();
    this.requestForm.markAsUntouched();
  }
}
