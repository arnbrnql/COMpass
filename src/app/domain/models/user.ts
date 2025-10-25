import { Schedule, ScheduleProps } from './schedule';
import { MentorshipStatus, MenteeStatus } from '../../core/enums/mentorship-status.enum';

export interface MentorProfileProps {
  expertise?: string[];
  calUsername?: string | null;
  mentorshipStatus?: MentorshipStatus;
  maxMentees?: number;
  currentMentees?: number;
  rating?: number;
  totalRatings?: number;
  schedule?: ScheduleProps;
}

export interface MenteeProfileProps {
  goals?: string[];
  mentorshipStatus?: MenteeStatus;
  currentMentors?: string[];
}

export interface RoleFlagsProps {
  isMentor: boolean;
  isMentee: boolean;
}

export interface UserProps {
  uid: string;
  email: string;
  displayName: string;
  photoURL?: string;
  bio?: string;
  roleFlags: RoleFlagsProps;
  activeRole?: 'mentor' | 'mentee';
  mentorProfile?: MentorProfileProps;
  menteeProfile?: MenteeProfileProps;
}

function cloneMentorProfile(profile: MentorProfileProps | undefined): MentorProfileProps | undefined {
  if (!profile) {
    return undefined;
  }

  return {
    ...profile,
    expertise: profile.expertise ? [...profile.expertise] : undefined,
    schedule: profile.schedule ? Schedule.fromProps(profile.schedule).toProps() : undefined,
  };
}

function cloneMenteeProfile(profile: MenteeProfileProps | undefined): MenteeProfileProps | undefined {
  if (!profile) {
    return undefined;
  }

  return {
    ...profile,
    goals: profile.goals ? [...profile.goals] : undefined,
    currentMentors: profile.currentMentors ? [...profile.currentMentors] : undefined,
  };
}

/**
 * Rich domain model for an application user that exposes role-aware helpers.
 */
export class User {
  private constructor(private readonly props: UserProps) {}

  static fromProps(props: UserProps): User {
    return new User({
      ...props,
      mentorProfile: cloneMentorProfile(props.mentorProfile),
      menteeProfile: cloneMenteeProfile(props.menteeProfile),
    });
  }

  static anonymous(): User {
    return new User({
      uid: '',
      email: '',
      displayName: '',
      roleFlags: { isMentor: false, isMentee: false },
    });
  }

  get uid(): string {
    return this.props.uid;
  }

  get email(): string {
    return this.props.email;
  }

  get displayName(): string {
    return this.props.displayName;
  }

  get photoURL(): string | undefined {
    return this.props.photoURL;
  }

  get bio(): string | undefined {
    return this.props.bio;
  }

  get roleFlags(): RoleFlagsProps {
    return { ...this.props.roleFlags };
  }

  get activeRole(): 'mentor' | 'mentee' | undefined {
    return this.props.activeRole;
  }

  get mentorProfile(): MentorProfileProps | undefined {
    return cloneMentorProfile(this.props.mentorProfile);
  }

  get menteeProfile(): MenteeProfileProps | undefined {
    return cloneMenteeProfile(this.props.menteeProfile);
  }

  isMentor(): boolean {
    return this.props.roleFlags.isMentor;
  }

  isMentee(): boolean {
    return this.props.roleFlags.isMentee;
  }

  hasActiveRole(role: 'mentor' | 'mentee'): boolean {
    return this.activeRole === role;
  }

  /**
   * Returns a mentor schedule aggregate when mentor profile information is present.
   */
  mentorSchedule(): Schedule | null {
    if (!this.props.mentorProfile) {
      return null;
    }

    const scheduleProps: ScheduleProps | undefined = this.props.mentorProfile.schedule
      ? this.props.mentorProfile.schedule
      : undefined;

    return scheduleProps ? Schedule.fromProps({ ...scheduleProps, ownerId: this.uid }) : Schedule.empty(this.uid);
  }

  withUpdates(updates: Partial<UserProps>): User {
    const nextMentorProfile = updates.mentorProfile
      ? { ...cloneMentorProfile(this.props.mentorProfile), ...updates.mentorProfile }
      : cloneMentorProfile(this.props.mentorProfile);

    const nextMenteeProfile = updates.menteeProfile
      ? { ...cloneMenteeProfile(this.props.menteeProfile), ...updates.menteeProfile }
      : cloneMenteeProfile(this.props.menteeProfile);

    return new User({
      ...this.props,
      ...updates,
      mentorProfile: nextMentorProfile ?? undefined,
      menteeProfile: nextMenteeProfile ?? undefined,
    });
  }

  withMentorProfile(updates: Partial<MentorProfileProps>): User {
    return this.withUpdates({ mentorProfile: updates });
  }

  withMenteeProfile(updates: Partial<MenteeProfileProps>): User {
    return this.withUpdates({ menteeProfile: updates });
  }

  withActiveRole(role: 'mentor' | 'mentee'): User {
    return this.withUpdates({ activeRole: role });
  }

  withBio(bio: string): User {
    return this.withUpdates({ bio });
  }

  withDisplayName(displayName: string): User {
    return this.withUpdates({ displayName });
  }

  toProps(): UserProps {
    return {
      ...this.props,
      mentorProfile: cloneMentorProfile(this.props.mentorProfile),
      menteeProfile: cloneMenteeProfile(this.props.menteeProfile),
    };
  }
}
