export interface LoginPayload {
  email: string;
  password: string;
}

export interface RegisterPayload {
  displayName: string;
  email: string;
  password: string;
  role: 'mentee' | 'mentor' | 'both';
}

