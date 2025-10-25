import { Injectable, inject, signal } from '@angular/core';

export interface Notification {
  id: string;
  type: 'success' | 'info' | 'warning' | 'error';
  title: string;
  message: string;
  timestamp: Date;
  autoHide?: boolean;
  duration?: number;
}

@Injectable({
  providedIn: 'root',
})
export class NotificationService {
  private notificationsSignal = signal<Notification[]>([]);
  private nextId = 0;

  readonly notifications = this.notificationsSignal.asReadonly();

  /**
   * Add a new notification
   */
  add(notification: Omit<Notification, 'id' | 'timestamp'>): string {
    const id = `notification-${++this.nextId}`;
    const autoHide = notification.autoHide ?? true;
    const duration = notification.duration ?? 5000;

    const newNotification: Notification = {
      ...notification,
      id,
      timestamp: new Date(),
      autoHide,
      duration,
    };

    this.notificationsSignal.update(notifications => [...notifications, newNotification]);

    if (autoHide) {
      setTimeout(() => {
        this.remove(id);
      }, duration);
    }

    return id;
  }

  /**
   * Remove a notification by ID
   */
  remove(id: string): void {
    this.notificationsSignal.update(notifications =>
      notifications.filter(n => n.id !== id)
    );
  }

  /**
   * Clear all notifications
   */
  clear(): void {
    this.notificationsSignal.set([]);
  }

  /**
   * Show success notification
   */
  success(title: string, message: string, options?: Partial<Notification>): string {
    return this.add({
      type: 'success',
      title,
      message,
      ...options,
    });
  }

  /**
   * Show info notification
   */
  info(title: string, message: string, options?: Partial<Notification>): string {
    return this.add({
      type: 'info',
      title,
      message,
      ...options,
    });
  }

  /**
   * Show warning notification
   */
  warning(title: string, message: string, options?: Partial<Notification>): string {
    return this.add({
      type: 'warning',
      title,
      message,
      ...options,
    });
  }

  /**
   * Show error notification
   */
  error(title: string, message: string, options?: Partial<Notification>): string {
    return this.add({
      type: 'error',
      title,
      message,
      autoHide: options?.autoHide ?? false,
      duration: options?.duration ?? 5000,
      ...options,
    });
  }
}
