/**
 * Firebase collection names
 * Centralized constants for Firestore collection paths
 */
export const FIREBASE_COLLECTIONS = {
  USERS: 'users',
  MENTORSHIP_REQUESTS: 'mentorshipRequests',
} as const;

/**
 * Type helper for Firebase collection names
 */
export type FirebaseCollection = typeof FIREBASE_COLLECTIONS[keyof typeof FIREBASE_COLLECTIONS];

