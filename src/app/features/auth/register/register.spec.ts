import { ComponentFixture, TestBed } from '@angular/core/testing';
import { ReactiveFormsModule } from '@angular/forms';
import { Router, ActivatedRoute } from '@angular/router';
import { Auth } from '@angular/fire/auth';
import { Firestore } from '@angular/fire/firestore';

import Register from './register';

// Mock Firebase Auth
const mockAuth = {
  currentUser: null,
  onAuthStateChanged: jasmine.createSpy('onAuthStateChanged').and.returnValue(() => {}),
  createUserWithEmailAndPassword: jasmine.createSpy('createUserWithEmailAndPassword'),
  updateProfile: jasmine.createSpy('updateProfile')
};

// Mock Firestore
const mockFirestore = {
  doc: jasmine.createSpy('doc'),
  setDoc: jasmine.createSpy('setDoc')
};

// Mock Router
const mockRouter = {
  navigate: jasmine.createSpy('navigate').and.returnValue(Promise.resolve(true)),
  createUrlTree: jasmine.createSpy('createUrlTree').and.returnValue({}),
  serializeUrl: jasmine.createSpy('serializeUrl').and.returnValue(''),
  events: {
    subscribe: jasmine.createSpy('subscribe')
  }
};

// Mock ActivatedRoute
const mockActivatedRoute = {
  snapshot: { params: {} },
  params: jasmine.createSpy('params')
};

describe('Register', () => {
  let component: Register;
  let fixture: ComponentFixture<Register>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [Register, ReactiveFormsModule],
      providers: [
        { provide: Auth, useValue: mockAuth },
        { provide: Firestore, useValue: mockFirestore },
        { provide: Router, useValue: mockRouter },
        { provide: ActivatedRoute, useValue: mockActivatedRoute }
      ]
    })
    .compileComponents();

    fixture = TestBed.createComponent(Register);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
