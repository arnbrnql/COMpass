import { ChangeDetectionStrategy, Component, inject, input, output, signal } from '@angular/core';
import { FormBuilder, ReactiveFormsModule, Validators } from '@angular/forms';
import { FeedbackService } from '../../../core/services/feedback.service';
import { AuthService } from '../../../core/services/auth.service';
import { firstValueFrom } from 'rxjs';

@Component({
  selector: 'app-feedback-modal',
  imports: [ReactiveFormsModule],
  templateUrl: './feedback-modal.html',
  styleUrls: ['./feedback-modal.scss'],
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export default class FeedbackModal {
  sessionId = input.required<string>();
  isModalOpen = input.required<boolean>();
  closeModal = output<void>();

  private formBuilder = inject(FormBuilder);
  private feedbackService = inject(FeedbackService);
  private authService = inject(AuthService);

  isSubmitting = signal(false);
  errorMessage = signal<string | null>(null);
  currentRating = signal(0);

  feedbackForm = this.formBuilder.group({
    comment: ['', [Validators.required, Validators.minLength(10)]],
  });

  setRating(rating: number) {
    if (rating < 0 || rating > 5) {
      this.errorMessage.set('Rating must be between 0 and 5.');
      return;
    }
    this.currentRating.set(rating);
  }

  async onSubmit() {
    if (this.feedbackForm.invalid || this.currentRating() < 0 || this.currentRating() > 5) {
      this.errorMessage.set('Please provide a valid rating and a comment.');
      return;
    }
    this.isSubmitting.set(true);
    this.errorMessage.set(null);

    const menteeId = this.authService.currentUserProfile()?.uid;
    if (!menteeId) {
        this.errorMessage.set('You must be logged in to submit feedback.');
        this.isSubmitting.set(false);
        return;
    }

    try {
      await firstValueFrom(this.feedbackService.addFeedback({
        sessionId: this.sessionId(),
        menteeId: menteeId,
        rating: this.currentRating(),
        comment: this.feedbackForm.value.comment!,
      }));

      this.close(); // Close modal on success
    } catch (error: any) {
      this.errorMessage.set(error.message || 'An unexpected error occurred.');
    } finally {
      this.isSubmitting.set(false);
    }
  }

  close() {
    this.feedbackForm.reset();
    this.currentRating.set(0);
    this.closeModal.emit();
  }
}
