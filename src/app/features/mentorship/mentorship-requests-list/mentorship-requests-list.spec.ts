import { ComponentFixture, TestBed } from '@angular/core/testing';

import MentorshipRequestsList from './mentorship-requests-list';

describe('MentorshipRequestsList', () => {
  let component: MentorshipRequestsList;
  let fixture: ComponentFixture<MentorshipRequestsList>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [MentorshipRequestsList]
    })
    .compileComponents();

    fixture = TestBed.createComponent(MentorshipRequestsList);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  xit('should create', () => {
    expect(component).toBeTruthy();
  });
});
