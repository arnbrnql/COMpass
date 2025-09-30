import { TestBed } from '@angular/core/testing';
import { Auth } from '@angular/fire/auth';
import { Firestore } from '@angular/fire/firestore';
import { Router } from '@angular/router';

import { AuthService } from './auth.service';

// Mock Firebase Auth
const mockAuth = {
  currentUser: null,
  onAuthStateChanged: jasmine.createSpy('onAuthStateChanged').and.returnValue(() => {}),
  signInWithEmailAndPassword: jasmine.createSpy('signInWithEmailAndPassword'),
  createUserWithEmailAndPassword: jasmine.createSpy('createUserWithEmailAndPassword'),
  signOut: jasmine.createSpy('signOut'),
  updateProfile: jasmine.createSpy('updateProfile')
};

// Mock Firestore
const mockFirestore = {
  doc: jasmine.createSpy('doc'),
  setDoc: jasmine.createSpy('setDoc'),
  docData: jasmine.createSpy('docData')
};

// Mock Router
const mockRouter = {
  navigate: jasmine.createSpy('navigate').and.returnValue(Promise.resolve(true)),
  createUrlTree: jasmine.createSpy('createUrlTree')
};

describe('AuthService', () => {
  let service: AuthService;

  beforeEach(() => {
    TestBed.configureTestingModule({
      providers: [
        { provide: Auth, useValue: mockAuth },
        { provide: Firestore, useValue: mockFirestore },
        { provide: Router, useValue: mockRouter }
      ]
    });
    service = TestBed.inject(AuthService);
  });

  it('should be created', () => {
    expect(service).toBeTruthy();
  });
});
