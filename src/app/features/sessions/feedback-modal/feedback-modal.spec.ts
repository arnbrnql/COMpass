import { ComponentFixture, TestBed } from '@angular/core/testing';
import FeedbackModal from './feedback-modal';
import { provideFirebaseApp, initializeApp } from '@angular/fire/app';
import { provideFirestore, getFirestore } from '@angular/fire/firestore';
import { provideAuth, getAuth } from '@angular/fire/auth';
import { environment } from '../../../../environments/environment';

describe('FeedbackModal', () => {
  let component: FeedbackModal;
  let fixture: ComponentFixture<FeedbackModal>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [FeedbackModal],
      providers: [
        provideFirebaseApp(() => initializeApp(environment.firebase)),
        provideFirestore(() => getFirestore()),
        provideAuth(() => getAuth()),
      ],
    }).compileComponents();

    fixture = TestBed.createComponent(FeedbackModal);
    component = fixture.componentInstance;

    // Set required inputs
    fixture.componentRef.setInput('sessionId', 'test-session-123');
    fixture.componentRef.setInput('isModalOpen', false);

    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
