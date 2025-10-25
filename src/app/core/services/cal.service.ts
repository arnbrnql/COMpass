import { Injectable, inject } from '@angular/core';
import { DomSanitizer, SafeResourceUrl } from '@angular/platform-browser';

import { CalRepository } from '../../domain/repositories/cal.repository';
import { CAL_REPOSITORY } from '../../domain/repositories/repository.tokens';
import { CalDomainService } from '../../domain/services/cal.service';
import { TransientError } from '../../domain/errors';

@Injectable({
  providedIn: 'root',
})
export class CalService implements CalDomainService {
  private calRepository = inject<CalRepository>(CAL_REPOSITORY);
  private sanitizer = inject(DomSanitizer);

  buildPublicBookingUrl(username: string | null | undefined): string | null {
    if (!username?.trim()) {
      return null;
    }

    try {
      return this.calRepository.buildPublicBookingUrl(username.trim());
    } catch (error) {
      throw new TransientError('Unable to build calendar booking link.', { cause: error });
    }
  }

  buildSafeEmbedUrl(username: string | null | undefined): SafeResourceUrl | null {
    const publicUrl = this.buildPublicBookingUrl(username);
    if (!publicUrl) {
      return null;
    }

    try {
      return this.sanitizer.bypassSecurityTrustResourceUrl(publicUrl);
    } catch (error) {
      throw new TransientError('Unable to secure calendar booking link.', { cause: error });
    }
  }
}
