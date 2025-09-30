import { TestBed } from '@angular/core/testing';
import { CanActivateFn, Router } from '@angular/router';
import { Auth } from '@angular/fire/auth';
import { Firestore } from '@angular/fire/firestore';

import { authGuard } from './auth-guard';

// Mock Firebase Auth
const mockAuth = {
  currentUser: null,
  onAuthStateChanged: jasmine.createSpy('onAuthStateChanged').and.returnValue(() => {})
};

// Mock Firestore
const mockFirestore = {
  doc: jasmine.createSpy('doc'),
  docData: jasmine.createSpy('docData')
};

// Mock Router
const mockRouter = {
  navigate: jasmine.createSpy('navigate').and.returnValue(Promise.resolve(true)),
  createUrlTree: jasmine.createSpy('createUrlTree')
};

describe('authGuard', () => {
  const executeGuard: CanActivateFn = (...guardParameters) =>
      TestBed.runInInjectionContext(() => authGuard(...guardParameters));

  beforeEach(() => {
    TestBed.configureTestingModule({
      providers: [
        { provide: Auth, useValue: mockAuth },
        { provide: Firestore, useValue: mockFirestore },
        { provide: Router, useValue: mockRouter }
      ]
    });
  });

  it('should be created', () => {
    expect(executeGuard).toBeTruthy();
  });
});
