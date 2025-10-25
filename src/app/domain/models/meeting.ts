import { Timestamp } from '@angular/fire/firestore';

export interface MeetingProps {
  id: string;
  mentorId: string;
  menteeId: string;
  scheduledAt: Date | Timestamp;
  durationMinutes: number;
  topic?: string;
  notes?: string;
  locationUrl?: string;
}

/**
 * Domain model representing a single mentorship meeting.
 */
export class Meeting {
  private constructor(private readonly props: MeetingProps) {}

  static fromProps(props: MeetingProps): Meeting {
    return new Meeting({
      ...props,
      scheduledAt: props.scheduledAt instanceof Date ? props.scheduledAt : props.scheduledAt.toDate(),
    });
  }

  get id(): string {
    return this.props.id;
  }

  get mentorId(): string {
    return this.props.mentorId;
  }

  get menteeId(): string {
    return this.props.menteeId;
  }

  get scheduledAt(): Date {
    return this.props.scheduledAt instanceof Date ? this.props.scheduledAt : this.props.scheduledAt.toDate();
  }

  get durationMinutes(): number {
    return this.props.durationMinutes;
  }

  get topic(): string | undefined {
    return this.props.topic;
  }

  get notes(): string | undefined {
    return this.props.notes;
  }

  get locationUrl(): string | undefined {
    return this.props.locationUrl;
  }

  /**
   * Returns the end time for the meeting, calculated using the start time and duration.
   */
  endsAt(): Date {
    const end = new Date(this.scheduledAt);
    end.setMinutes(end.getMinutes() + this.durationMinutes);
    return end;
  }

  /** Determines whether this meeting will occur in the future compared to the provided reference. */
  isUpcoming(reference: Date = new Date()): boolean {
    return this.scheduledAt.getTime() > reference.getTime();
  }

  /** Determines whether this meeting has already finished. */
  hasFinished(reference: Date = new Date()): boolean {
    return this.endsAt().getTime() <= reference.getTime();
  }

  /** Whether this meeting overlaps with another meeting in time. */
  overlaps(other: Meeting): boolean {
    return this.scheduledAt < other.endsAt() && other.scheduledAt < this.endsAt();
  }

  toProps(): MeetingProps {
    return {
      ...this.props,
      scheduledAt: this.scheduledAt,
    };
  }
}
