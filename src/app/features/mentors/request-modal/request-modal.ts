import { ChangeDetectionStrategy, Component, inject, input, output, signal } from '@angular/core';
import { FormBuilder, ReactiveFormsModule, Validators } from '@angular/forms';
import { lastValueFrom } from 'rxjs';
import { MentorshipService } from '../../../core/services/mentorship.service';

@Component({
  selector: 'app-request-modal',
  imports: [ReactiveFormsModule],
  templateUrl: './request-modal.html',
  styleUrls: ['./request-modal.scss'],
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export default class RequestModal {
  mentorId = input.required<string>();
  isModalOpen = input.required<boolean>();
  closeModal = output<void>();

  private formBuilder = inject(FormBuilder);
  private mentorshipService = inject(MentorshipService);

  isSubmitting = signal(false);
  errorMessage = signal<string | null>(null);

  requestForm = this.formBuilder.group({
    message: ['', [Validators.required, Validators.minLength(20)]],
  });

  async onSubmit() {
    if (this.requestForm.invalid) {
      this.requestForm.markAllAsTouched();
      return;
    }

    this.isSubmitting.set(true);
    this.errorMessage.set(null);

    try {
      await lastValueFrom(this.mentorshipService.createRequest(this.mentorId(), this.requestForm.value.message!));
      this.close(true);
    } catch (error: any) {
      this.errorMessage.set(error.message || 'An unexpected error occurred.');
    } finally {
      this.isSubmitting.set(false);
    }
  }

  close(isSuccess: boolean = false) {
    this.requestForm.reset();
    this.closeModal.emit();
    if (isSuccess) {
      // Potentially show a global success toast/notification here in the future
      console.log('Request sent successfully!');
    }
  }
}
