import { Timestamp } from '@angular/fire/firestore';

export type SessionStatus = 'pending' | 'scheduled' | 'cancelled' | 'completed' | 'no-show';

export interface Session {
  sessionId: string;
  mentorId: string;
  menteeId: string;
  startTime: Timestamp | { toDate: () => Date }; // Better typing for Firestore Timestamp
  endTime: Timestamp | { toDate: () => Date };
  status: SessionStatus;
  meetingLink?: string;
  createdAt?: Timestamp | { toDate: () => Date };
  updatedAt?: Timestamp | { toDate: () => Date };
}
