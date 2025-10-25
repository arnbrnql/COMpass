import { Timestamp } from '@angular/fire/firestore';

import { RequestStatus } from '../../core/enums/request-status.enum';

export type MentorshipExperienceLevel = 'beginner' | 'intermediate' | 'advanced';
export type MentorshipMeetingFrequency = 'weekly' | 'bi-weekly' | 'monthly' | 'as-needed';

export interface MentorshipRequestCalendarAccessProps {
  isUnlocked: boolean;
  unlockedAt?: Date | Timestamp | { toDate: () => Date } | null;
  lockedAt?: Date | Timestamp | { toDate: () => Date } | null;
}

export interface MentorshipRequestProps {
  requestId: string;
  menteeId: string;
  mentorId: string;
  status: RequestStatus;
  message?: string;
  goals?: string[];
  experienceLevel?: MentorshipExperienceLevel;
  preferredMeetingFrequency?: MentorshipMeetingFrequency;
  createdAt: Date | Timestamp | { toDate: () => Date };
  updatedAt: Date | Timestamp | { toDate: () => Date };
  approvedAt?: Date | Timestamp | { toDate: () => Date };
  rejectedAt?: Date | Timestamp | { toDate: () => Date };
  rejectionReason?: string;
  completedAt?: Date | Timestamp | { toDate: () => Date };
  calendarAccess?: MentorshipRequestCalendarAccessProps;
  bookingUrl?: string | null;
}

export interface MentorshipRequestFormData {
  message: string;
  goals?: string[];
  experienceLevel?: MentorshipExperienceLevel;
  preferredMeetingFrequency?: MentorshipMeetingFrequency;
}

export interface MentorshipRequestCalendarAccess {
  isUnlocked: boolean;
  unlockedAt: Date | null;
  lockedAt: Date | null;
}

interface NormalizedMentorshipRequestProps {
  requestId: string;
  menteeId: string;
  mentorId: string;
  status: RequestStatus;
  message?: string;
  goals: string[];
  experienceLevel?: MentorshipExperienceLevel;
  preferredMeetingFrequency?: MentorshipMeetingFrequency;
  createdAt: Date;
  updatedAt: Date;
  approvedAt: Date | null;
  rejectedAt: Date | null;
  rejectionReason?: string;
  completedAt: Date | null;
  calendarAccess?: MentorshipRequestCalendarAccess;
  bookingUrl?: string | null;
}

function coerceDate(value: Date | Timestamp | { toDate: () => Date } | null | undefined): Date | null {
  if (!value) {
    return null;
  }

  if (value instanceof Date) {
    return value;
  }

  if (value instanceof Timestamp) {
    return value.toDate();
  }

  if (typeof value === 'object' && 'toDate' in value && typeof value.toDate === 'function') {
    return value.toDate();
  }

  return null;
}

function ensureDate(value: Date | Timestamp | { toDate: () => Date }): Date {
  return coerceDate(value) ?? new Date();
}

function cloneGoals(goals: string[] | undefined): string[] {
  return goals ? goals.map(goal => goal) : [];
}

function normalizeCalendarAccess(
  access: MentorshipRequestCalendarAccessProps | undefined
): MentorshipRequestCalendarAccess | undefined {
  if (!access) {
    return undefined;
  }

  return {
    isUnlocked: access.isUnlocked ?? false,
    unlockedAt: coerceDate(access.unlockedAt),
    lockedAt: coerceDate(access.lockedAt),
  };
}

/**
 * Domain representation of a mentorship request.
 */
export class MentorshipRequest {
  private constructor(private readonly props: NormalizedMentorshipRequestProps) {}

  static fromProps(props: MentorshipRequestProps): MentorshipRequest {
    return new MentorshipRequest({
      requestId: props.requestId,
      menteeId: props.menteeId,
      mentorId: props.mentorId,
      status: props.status,
      message: props.message?.trim() || undefined,
      goals: cloneGoals(props.goals),
      experienceLevel: props.experienceLevel,
      preferredMeetingFrequency: props.preferredMeetingFrequency,
      createdAt: ensureDate(props.createdAt),
      updatedAt: ensureDate(props.updatedAt),
      approvedAt: coerceDate(props.approvedAt),
      rejectedAt: coerceDate(props.rejectedAt),
      rejectionReason: props.rejectionReason?.trim() || undefined,
      completedAt: coerceDate(props.completedAt),
      calendarAccess: normalizeCalendarAccess(props.calendarAccess),
      bookingUrl: props.bookingUrl ?? null,
    });
  }

  toProps(): MentorshipRequestProps {
    return {
      requestId: this.requestId,
      menteeId: this.menteeId,
      mentorId: this.mentorId,
      status: this.status,
      message: this.message,
      goals: cloneGoals(this.goals),
      experienceLevel: this.experienceLevel,
      preferredMeetingFrequency: this.preferredMeetingFrequency,
      createdAt: this.createdAt,
      updatedAt: this.updatedAt,
      approvedAt: this.approvedAt ?? undefined,
      rejectedAt: this.rejectedAt ?? undefined,
      rejectionReason: this.rejectionReason,
      completedAt: this.completedAt ?? undefined,
      calendarAccess: this.calendarAccess
        ? {
            isUnlocked: this.calendarAccess.isUnlocked,
            unlockedAt: this.calendarAccess.unlockedAt ?? undefined,
            lockedAt: this.calendarAccess.lockedAt ?? undefined,
          }
        : undefined,
      bookingUrl: this.bookingUrl ?? undefined,
    };
  }

  get requestId(): string {
    return this.props.requestId;
  }

  get menteeId(): string {
    return this.props.menteeId;
  }

  get mentorId(): string {
    return this.props.mentorId;
  }

  get status(): RequestStatus {
    return this.props.status;
  }

  get message(): string | undefined {
    return this.props.message;
  }

  get goals(): string[] {
    return [...this.props.goals];
  }

  get experienceLevel(): MentorshipExperienceLevel | undefined {
    return this.props.experienceLevel;
  }

  get preferredMeetingFrequency(): MentorshipMeetingFrequency | undefined {
    return this.props.preferredMeetingFrequency;
  }

  get createdAt(): Date {
    return this.props.createdAt;
  }

  get updatedAt(): Date {
    return this.props.updatedAt;
  }

  get approvedAt(): Date | null {
    return this.props.approvedAt;
  }

  get rejectedAt(): Date | null {
    return this.props.rejectedAt;
  }

  get rejectionReason(): string | undefined {
    return this.props.rejectionReason;
  }

  get completedAt(): Date | null {
    return this.props.completedAt;
  }

  get calendarAccess(): MentorshipRequestCalendarAccess | undefined {
    if (!this.props.calendarAccess) {
      return undefined;
    }

    return { ...this.props.calendarAccess };
  }

  get bookingUrl(): string | null {
    return this.props.bookingUrl ?? null;
  }

  isPending(): boolean {
    return this.status === RequestStatus.Pending;
  }

  isApproved(): boolean {
    return this.status === RequestStatus.Approved;
  }

  isRejected(): boolean {
    return this.status === RequestStatus.Rejected;
  }

  isCompleted(): boolean {
    return this.status === RequestStatus.Done;
  }

  withUpdates(updates: Partial<MentorshipRequestProps>): MentorshipRequest {
    return MentorshipRequest.fromProps({
      ...this.toProps(),
      ...updates,
    });
  }
}
