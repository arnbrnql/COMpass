import { ComponentFixture, TestBed } from '@angular/core/testing';
import { ReactiveFormsModule } from '@angular/forms';
import { Router, ActivatedRoute } from '@angular/router';
import { Auth } from '@angular/fire/auth';
import { Firestore } from '@angular/fire/firestore';

import { LoginComponent } from './login';

// Mock Firebase Auth
const mockAuth = {
  currentUser: null,
  onAuthStateChanged: jasmine.createSpy('onAuthStateChanged').and.returnValue(() => {}),
  signInWithEmailAndPassword: jasmine.createSpy('signInWithEmailAndPassword'),
  signOut: jasmine.createSpy('signOut')
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

describe('LoginComponent', () => {
  let component: LoginComponent;
  let fixture: ComponentFixture<LoginComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [LoginComponent, ReactiveFormsModule],
      providers: [
        { provide: Auth, useValue: mockAuth },
        { provide: Firestore, useValue: mockFirestore },
        { provide: Router, useValue: mockRouter },
        { provide: ActivatedRoute, useValue: mockActivatedRoute }
      ]
    })
    .compileComponents();

    fixture = TestBed.createComponent(LoginComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
