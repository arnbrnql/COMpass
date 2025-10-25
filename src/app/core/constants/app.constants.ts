/**
 * Application-wide constants
 */
export const APP_CONSTANTS = {
  SESSION_DURATION_MINUTES: 60,
  SESSION_BUFFER_MINUTES: 15,
  MAX_MENTEES_PER_MENTOR: 5,
  MAX_MENTORS_PER_MENTEE: 3,
  PAGINATION_DEFAULT_PAGE_SIZE: 12,
  PAGINATION_MAX_PAGE_SIZE: 50,
  NOTIFICATION_DURATION_MS: 5000,
  DEBOUNCE_TIME_MS: 300,
  DEFAULT_AVATAR_URL: 'assets/default-avatar.svg',
  CALCOM_BASE_URL: 'https://cal.com'
} as const;

/**
 * Application routes (for navigation)
 */
export const APP_ROUTES = {
  HOME: '/',
  AUTH: {
    LOGIN: '/auth/login',
    REGISTER: '/auth/register'
  },
  DASHBOARD: {
    BASE: '/dashboard',
    MENTOR: '/dashboard/mentor',
    MENTEE: '/dashboard/mentee'
  },
  DISCOVER: '/discover-mentors',
  PROFILE: {
    EDIT: '/profile/edit'
  },
  MENTOR: (id: string) => `/mentors/${id}`
} as const;

