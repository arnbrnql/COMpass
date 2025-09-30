export interface Feedback {
  sessionId: string;
  menteeId: string;
  rating: number; // e.g., 1-5
  comment: string;
}
