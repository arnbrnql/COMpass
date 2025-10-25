import { Timestamp } from '@angular/fire/firestore';

import { Meeting, MeetingProps } from './meeting';

export interface ScheduleAccessProps {
  isUnlocked: boolean;
  unlockedAt?: Date | Timestamp | null;
  lockedAt?: Date | Timestamp | null;
  bookingUrl?: string | null;
}

export interface ScheduleProps {
  ownerId: string;
  meetings?: MeetingProps[];
  calendarAccess?: ScheduleAccessProps;
}

function toDateOrNull(value: Date | Timestamp | null | undefined): Date | null {
  if (!value) {
    return null;
  }

  return value instanceof Date ? value : value.toDate();
}

/**
 * Aggregate root representing a mentorship schedule for a mentor/mentee pair.
 */
export class Schedule {
  private constructor(private readonly props: ScheduleProps) {}

  static empty(ownerId: string): Schedule {
    return new Schedule({ ownerId, meetings: [], calendarAccess: { isUnlocked: false } });
  }

  static fromProps(props: ScheduleProps): Schedule {
    return new Schedule({
      ownerId: props.ownerId,
      meetings: (props.meetings ?? []).map(meeting => ({ ...meeting })),
      calendarAccess: props.calendarAccess
        ? { ...props.calendarAccess }
        : undefined,
    });
  }

  get ownerId(): string {
    return this.props.ownerId;
  }

  private get access(): ScheduleAccessProps {
    const access = this.props.calendarAccess ?? { isUnlocked: false };
    return {
      ...access,
      unlockedAt: toDateOrNull(access.unlockedAt),
      lockedAt: toDateOrNull(access.lockedAt),
    };
  }

  /** Returns true when a mentee has unlocked the mentor's calendar. */
  isCalendarUnlocked(): boolean {
    return this.access.isUnlocked === true;
  }

  unlockedAt(): Date | null {
    return toDateOrNull(this.access.unlockedAt ?? null);
  }

  lockedAt(): Date | null {
    return toDateOrNull(this.access.lockedAt ?? null);
  }

  bookingUrl(): string | null {
    const url = this.access.bookingUrl;
    return url ? url : null;
  }

  withBookingUrl(bookingUrl: string | null | undefined): Schedule {
    return new Schedule({
      ...this.toProps(),
      calendarAccess: {
        ...this.access,
        bookingUrl: bookingUrl ?? null,
      },
    });
  }

  /** Marks the calendar as unlocked. */
  unlock(at: Date = new Date()): Schedule {
    return new Schedule({
      ...this.toProps(),
      calendarAccess: {
        ...this.access,
        isUnlocked: true,
        unlockedAt: at,
        lockedAt: null,
      },
    });
  }

  /** Marks the calendar as locked. */
  lock(at: Date = new Date()): Schedule {
    return new Schedule({
      ...this.toProps(),
      calendarAccess: {
        ...this.access,
        isUnlocked: false,
        lockedAt: at,
      },
    });
  }

  meetings(): Meeting[] {
    return (this.props.meetings ?? []).map(meeting => Meeting.fromProps(meeting));
  }

  addMeeting(meeting: Meeting): Schedule {
    return new Schedule({
      ...this.toProps(),
      meetings: [...(this.props.meetings ?? []), meeting.toProps()],
    });
  }

  upcomingMeetings(reference: Date = new Date()): Meeting[] {
    return this.meetings()
      .filter(meeting => meeting.isUpcoming(reference))
      .sort((a, b) => a.scheduledAt.getTime() - b.scheduledAt.getTime());
  }

  toProps(): ScheduleProps {
    return {
      ownerId: this.props.ownerId,
      meetings: this.meetings().map(meeting => meeting.toProps()),
      calendarAccess: {
        ...this.access,
      },
    };
  }
}
