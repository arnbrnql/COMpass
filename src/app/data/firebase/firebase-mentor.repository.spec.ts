import { TestBed } from '@angular/core/testing';

import { FirebaseMentorRepository } from './firebase-mentor.repository';

describe('FirebaseMentorRepository', () => {
  let service: FirebaseMentorRepository;

  beforeEach(() => {
    TestBed.configureTestingModule({});
    service = TestBed.inject(FirebaseMentorRepository);
  });

  xit('should be created', () => {
    expect(service).toBeTruthy();
  });
});
