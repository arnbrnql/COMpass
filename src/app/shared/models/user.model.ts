export type UserRole = 'mentor' | 'mentee' | 'both' | 'admin';

export interface User {
  uid: string;
  email: string | null;
  displayName?: string | null;
  photoUrl?: string | null;
  role?: UserRole;

  bio?: string;
  location?: string;
  skills?: string[];
  interests?: string[];
  goals?: string;
}
