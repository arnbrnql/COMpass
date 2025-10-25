import { ChangeDetectionStrategy, Component, inject } from '@angular/core';
import { NotificationService } from '../../../core/services/notification.service';
import { DatePipe } from '@angular/common';

@Component({
  selector: 'app-notification-toast',
  imports: [DatePipe],
  template: `
    <div class="toast toast-top toast-end z-50">
      @for (notification of notifications(); track notification.id) {
        <div
          class="alert shadow-lg max-w-sm"
          [class.alert-success]="notification.type === 'success'"
          [class.alert-info]="notification.type === 'info'"
          [class.alert-warning]="notification.type === 'warning'"
          [class.alert-error]="notification.type === 'error'"
        >
          <div class="flex items-start gap-3">
            <div class="flex-shrink-0">
              @switch (notification.type) {
                @case ('success') {
                  <svg xmlns="http://www.w3.org/2000/svg" class="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
                  </svg>
                }
                @case ('info') {
                  <svg xmlns="http://www.w3.org/2000/svg" class="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                  </svg>
                }
                @case ('warning') {
                  <svg xmlns="http://www.w3.org/2000/svg" class="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-2.5L13.732 4c-.77-.833-1.964-.833-2.732 0L3.732 16.5c-.77.833.192 2.5 1.732 2.5z" />
                  </svg>
                }
                @case ('error') {
                  <svg xmlns="http://www.w3.org/2000/svg" class="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M10 14l2-2m0 0l2-2m-2 2l-2-2m2 2l2 2m7-2a9 9 0 11-18 0 9 9 0 0118 0z" />
                  </svg>
                }
              }
            </div>

            <div class="flex-1 min-w-0">
              <h4 class="font-semibold text-sm">{{ notification.title }}</h4>
              <p class="text-sm opacity-90 mt-1">{{ notification.message }}</p>
              <p class="text-xs opacity-70 mt-1">
                {{ notification.timestamp | date:'short' }}
              </p>
            </div>

            <button
              class="btn btn-ghost btn-xs btn-circle flex-shrink-0"
              (click)="removeNotification(notification.id)"
            >
              <svg xmlns="http://www.w3.org/2000/svg" class="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M6 18L18 6M6 6l12 12" />
              </svg>
            </button>
          </div>
        </div>
      }
    </div>
  `,
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export default class NotificationToast {
  private notificationService = inject(NotificationService);

  notifications = this.notificationService.notifications;

  removeNotification(id: string): void {
    this.notificationService.remove(id);
  }
}
