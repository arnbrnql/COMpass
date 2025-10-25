import { TestBed } from '@angular/core/testing';

import { FirebaseUserRepository } from './firebase-user.repository';

describe('FirebaseUserRepository', () => {
  let service: FirebaseUserRepository;

  beforeEach(() => {
    TestBed.configureTestingModule({});
    service = TestBed.inject(FirebaseUserRepository);
  });

  xit('should be created', () => {
    expect(service).toBeTruthy();
  });
});
