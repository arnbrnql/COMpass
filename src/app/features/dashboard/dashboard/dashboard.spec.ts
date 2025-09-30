import { ComponentFixture, TestBed } from '@angular/core/testing';
import { Auth } from '@angular/fire/auth';
import { Firestore } from '@angular/fire/firestore';
import { Router } from '@angular/router';

import Dashboard from './dashboard';

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
  navigate: jasmine.createSpy('navigate').and.returnValue(Promise.resolve(true))
};

describe('Dashboard', () => {
  let component: Dashboard;
  let fixture: ComponentFixture<Dashboard>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [Dashboard],
      providers: [
        { provide: Auth, useValue: mockAuth },
        { provide: Firestore, useValue: mockFirestore },
        { provide: Router, useValue: mockRouter }
      ]
    })
    .compileComponents();

    fixture = TestBed.createComponent(Dashboard);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
