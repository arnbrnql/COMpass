export interface User {
  uid: string;
  email: string | null;
  displayName?: string | null; // Optional for now
  role?: 'mentor' | 'mentee' | 'both';
  // add na lang tayo ng more profile fields here in Phase 2
}
