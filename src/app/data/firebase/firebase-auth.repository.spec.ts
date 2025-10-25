import { TestBed } from '@angular/core/testing';

import { FirebaseAuthRepository } from './firebase-auth.repository';

describe('FirebaseAuthRepository', () => {
  let service: FirebaseAuthRepository;

  beforeEach(() => {
    TestBed.configureTestingModule({});
    service = TestBed.inject(FirebaseAuthRepository);
  });

  xit('should be created', () => {
    expect(service).toBeTruthy();
  });
});
