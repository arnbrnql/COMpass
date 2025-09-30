export interface User {
  uid: string;
  email: string;
  displayName: string;
  photoURL?: string;
  // MVP-specific fields
  bio?: string;
  timezone?: string;
  expertiseTags?: string[];
  roleFlags: {
    isMentor: boolean;
    isMentee: boolean;
  };
}
