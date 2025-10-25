import { Injectable } from '@angular/core';

import { APP_CONSTANTS } from '../../core/constants/app.constants';
import { CalRepository } from '../../domain/repositories/cal.repository';

@Injectable()
export class CalComRepository implements CalRepository {
  buildPublicBookingUrl(username: string): string {
    return `${APP_CONSTANTS.CALCOM_BASE_URL}/${username}`;
  }
}
