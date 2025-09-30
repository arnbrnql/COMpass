import { TestBed } from '@angular/core/testing';
import { Firestore } from '@angular/fire/firestore';

import { UserService } from './user.service';

// Mock Firestore
const mockFirestore = {
  doc: jasmine.createSpy('doc'),
  collection: jasmine.createSpy('collection'),
  docData: jasmine.createSpy('docData'),
  setDoc: jasmine.createSpy('setDoc'),
  updateDoc: jasmine.createSpy('updateDoc')
};

describe('UserService', () => {
  let service: UserService;

  beforeEach(() => {
    TestBed.configureTestingModule({
      providers: [
        { provide: Firestore, useValue: mockFirestore }
      ]
    });
    service = TestBed.inject(UserService);
  });

  it('should be created', () => {
    expect(service).toBeTruthy();
  });
});
