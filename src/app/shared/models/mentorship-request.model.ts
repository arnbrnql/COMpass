export interface MentorshipRequest {
  id: string;
  menteeId: string;
  mentorId: string;
  status: 'pending' | 'accepted' | 'rejected';
  message: string;
  createdAt: number;
  updatedAt?: number;
}
