/**
 * Abstraction for Cal.com related operations.
 */
export abstract class CalRepository {
  /** Build a public booking URL for the provided Cal.com username. */
  abstract buildPublicBookingUrl(username: string): string;
}
