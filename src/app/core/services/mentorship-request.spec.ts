import { TestBed } from '@angular/core/testing';

import { MentorshipRequestService } from './mentorship-request';

describe('MentorshipRequestService', () => {
  let service: MentorshipRequestService;

  beforeEach(() => {
    TestBed.configureTestingModule({});
    service = TestBed.inject(MentorshipRequestService);
  });

  xit('should be created', () => {
    expect(service).toBeTruthy();
  });
});
