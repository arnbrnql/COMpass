export type MentorshipRequestStatus = 'pending' | 'accepted' | 'rejected';

export interface MentorshipRequest {
  id: string;
  menteeId: string;
  mentorId: string;
  status: MentorshipRequestStatus;
  message: string;
  createdAt: any; // Firestore Timestamp
}
