import { TestBed } from '@angular/core/testing';

import { MentorService } from './mentor.service';

describe('MentorService', () => {
  let service: MentorService;

  beforeEach(() => {
    TestBed.configureTestingModule({});
    service = TestBed.inject(MentorService);
  });

  xit('should be created', () => {
    expect(service).toBeTruthy();
  });
});
