export type SessionStatus = 'pending' | 'scheduled' | 'cancelled' | 'completed' | 'no-show';

export interface Session {
  sessionId: string;
  mentorId: string;
  menteeId: string;
  startTime: any; // Using 'any' for Firestore Timestamp compatibility
  endTime: any;   // Using 'any' for Firestore Timestamp compatibility
  status: SessionStatus;
  meetingLink?: string;
}
