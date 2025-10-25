import { Pipe, PipeTransform } from '@angular/core';
import { MentorshipStatus, MenteeStatus } from '../../core/enums/mentorship-status.enum';

/**
 * Transform mentorship status enum values into human-readable labels.
 * @example {{ status | mentorshipStatus }} => "Available"
 */
@Pipe({
  name: 'mentorshipStatus',
  pure: true
})
export class MentorshipStatusPipe implements PipeTransform {
  private readonly mentorLabels: Record<MentorshipStatus, string> = {
    [MentorshipStatus.Available]: 'Available',
    [MentorshipStatus.Busy]: 'Busy',
    [MentorshipStatus.Unavailable]: 'Unavailable',
  };

  private readonly menteeLabels: Record<MenteeStatus, string> = {
    [MenteeStatus.Seeking]: 'Seeking Mentor',
    [MenteeStatus.Matched]: 'Matched',
    [MenteeStatus.NotSeeking]: 'Not Seeking',
  };

  transform(value: MentorshipStatus | MenteeStatus | string | null | undefined): string {
    if (value === null || value === undefined || value === '') {
      return '';
    }

    const text = value.toString();

    if (Object.values(MentorshipStatus).includes(text as MentorshipStatus)) {
      return this.mentorLabels[text as MentorshipStatus];
    }

    if (Object.values(MenteeStatus).includes(text as MenteeStatus)) {
      return this.menteeLabels[text as MenteeStatus];
    }

    return text.charAt(0).toUpperCase() + text.slice(1).replace(/-/g, ' ');
  }
}
