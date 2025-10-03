import { ComponentFixture, TestBed } from '@angular/core/testing';
import { ComponentRef } from '@angular/core';
import SessionCard from './session-card';
import { Session } from '../../../shared/models/session.model';

describe('SessionCard', () => {
  let component: SessionCard;
  let fixture: ComponentFixture<SessionCard>;
  let componentRef: ComponentRef<SessionCard>;

  const mockSession: Session = {
    sessionId: 'test-123',
    mentorId: 'mentor-123',
    menteeId: 'mentee-123',
    startTime: { toDate: () => new Date() },
    endTime: { toDate: () => new Date() },
    status: 'scheduled',
    meetingLink: 'https://meet.jit.si/test'
  };

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [SessionCard]
    })
    .compileComponents();

    fixture = TestBed.createComponent(SessionCard);
    component = fixture.componentInstance;
    componentRef = fixture.componentRef;

    // Set the required input before detecting changes
    componentRef.setInput('session', mockSession);
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
