export interface User {
  uid: string;
  email: string | null;
  displayName?: string | null;
  photoUrl?: string | null;

  // New Profile Fields
  role?: 'mentor' | 'mentee' | 'both';
  bio?: string | null;
  location?: string | null;
  skills?: string[]; // An array of strings
  expertise?: string[];
  interests?: string[];
  goals?: string[];
  // define na lang later ng more specific type for availability later
  availability?: string | null;
  preferredLanguage?: string | null;
}
