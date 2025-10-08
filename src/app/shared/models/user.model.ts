export interface User {
  uid: string;
  email: string;
  displayName: string;
  photoURL?: string;
  bio?: string;
  location?: string;
  preferredLanguage?: string;
  roleFlags: {
    isMentor: boolean;
    isMentee: boolean;
  };
  activeRole?: 'mentor' | 'mentee';
  // Mentor-specific fields
  mentorProfile?: {
    expertise?: string[];
    industry?: string;
    calUsername?: string;
  };
  // Mentee-specific fields
  menteeProfile?: {
    goals?: string[];
    interests?: string[];
  };
}
