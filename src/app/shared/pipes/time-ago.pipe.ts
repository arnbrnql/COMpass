import { Pipe, PipeTransform } from '@angular/core';
import { Timestamp } from '@angular/fire/firestore';

/**
 * Format a date/timestamp as relative time (e.g., "2 hours ago")
 * @example {{ date | timeAgo }} => "2 hours ago"
 */
@Pipe({
  name: 'timeAgo',
  pure: true
})
export class TimeAgoPipe implements PipeTransform {
  transform(value: Date | Timestamp | { toDate: () => Date } | null | undefined): string {
    if (!value) return '';

    let date: Date;
    if (value instanceof Date) {
      date = value;
    } else if (value instanceof Timestamp) {
      date = value.toDate();
    } else if (typeof value === 'object' && 'toDate' in value) {
      date = value.toDate();
    } else {
      return '';
    }

    const now = new Date();
    const seconds = Math.floor((now.getTime() - date.getTime()) / 1000);

    if (seconds < 0) {
      return 'just now';
    }

    if (seconds < 60) {
      return 'just now';
    }

    const minutes = Math.floor(seconds / 60);
    if (minutes < 60) {
      return minutes === 1 ? '1 minute ago' : `${minutes} minutes ago`;
    }

    const hours = Math.floor(minutes / 60);
    if (hours < 24) {
      return hours === 1 ? '1 hour ago' : `${hours} hours ago`;
    }

    const days = Math.floor(hours / 24);
    if (days < 7) {
      return days === 1 ? '1 day ago' : `${days} days ago`;
    }

    const weeks = Math.floor(days / 7);
    if (weeks < 4) {
      return weeks === 1 ? '1 week ago' : `${weeks} weeks ago`;
    }

    const months = Math.floor(days / 30);
    if (months < 12) {
      return months === 1 ? '1 month ago' : `${months} months ago`;
    }

    const years = Math.floor(days / 365);
    return years === 1 ? '1 year ago' : `${years} years ago`;
  }
}

