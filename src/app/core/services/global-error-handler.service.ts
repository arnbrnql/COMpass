import { ErrorHandler, Injectable, inject, isDevMode } from '@angular/core';
import { HttpErrorResponse } from '@angular/common/http';
import { NotificationService } from './notification.service';
import { ValidationError, TransientError, isDomainError } from '../../domain/errors';

@Injectable()
export class GlobalErrorHandler implements ErrorHandler {
  private notificationService = inject(NotificationService);

  handleError(error: Error | HttpErrorResponse): void {
    let message: string;
    let shouldNotify = true;

    if (isDomainError(error)) {
      message = error.message;

      if (error instanceof ValidationError) {
        this.notificationService.warning('Validation issue', message);
        return;
      }

      if (error instanceof TransientError) {
        this.notificationService.error('Temporary issue', `${message} Please try again shortly.`);
        return;
      }

      this.notificationService.error('Something went wrong', message);
      return;
    }

    if (error instanceof HttpErrorResponse) {
      message = `HTTP Error: ${error.status} - ${error.message}`;
      shouldNotify = false;
    } else {
      message = error.message || 'An unexpected error occurred';

      if (isDevMode()) {
        console.error('Unhandled Error:', error);
        console.error('Stack:', error.stack);
      } else {
        console.error('Error:', message);
      }
    }

    if (shouldNotify) {
      this.notificationService.error(
        'Unexpected Error',
        'Something went wrong. Please try again or refresh the page.'
      );
    }
  }
}

