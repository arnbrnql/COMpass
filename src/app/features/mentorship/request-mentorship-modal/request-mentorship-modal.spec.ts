import { ComponentFixture, TestBed } from '@angular/core/testing';

import RequestMentorshipModal from './request-mentorship-modal';

describe('RequestMentorshipModal', () => {
  let component: RequestMentorshipModal;
  let fixture: ComponentFixture<RequestMentorshipModal>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [RequestMentorshipModal]
    })
    .compileComponents();

    fixture = TestBed.createComponent(RequestMentorshipModal);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  xit('should create', () => {
    expect(component).toBeTruthy();
  });
});
