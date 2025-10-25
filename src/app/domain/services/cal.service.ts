import { SafeResourceUrl } from '@angular/platform-browser';

/**
 * Domain contract for Cal.com integrations.
 */
export abstract class CalDomainService {
  abstract buildPublicBookingUrl(username: string | null | undefined): string | null;
  abstract buildSafeEmbedUrl(username: string | null | undefined): SafeResourceUrl | null;
}
