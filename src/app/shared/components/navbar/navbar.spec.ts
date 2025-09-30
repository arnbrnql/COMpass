import { ComponentFixture, TestBed } from '@angular/core/testing';
import { Router, ActivatedRoute } from '@angular/router';
import { Auth } from '@angular/fire/auth';
import { Firestore } from '@angular/fire/firestore';

import Navbar from './navbar';

// Mock Firebase Auth
const mockAuth = {
  currentUser: null,
  onAuthStateChanged: jasmine.createSpy('onAuthStateChanged').and.returnValue(() => {}),
  signOut: jasmine.createSpy('signOut')
};

// Mock Firestore
const mockFirestore = {
  doc: jasmine.createSpy('doc'),
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

describe('Navbar', () => {
  let component: Navbar;
  let fixture: ComponentFixture<Navbar>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [Navbar],
      providers: [
        { provide: Auth, useValue: mockAuth },
        { provide: Firestore, useValue: mockFirestore },
        { provide: Router, useValue: mockRouter },
        { provide: ActivatedRoute, useValue: mockActivatedRoute }
      ]
    })
    .compileComponents();

    fixture = TestBed.createComponent(Navbar);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
