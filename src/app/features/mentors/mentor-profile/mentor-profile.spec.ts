import { ComponentFixture, TestBed } from '@angular/core/testing';

import MentorProfile from './mentor-profile';

describe('MentorProfile', () => {
  let component: MentorProfile;
  let fixture: ComponentFixture<MentorProfile>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [MentorProfile]
    })
    .compileComponents();

    fixture = TestBed.createComponent(MentorProfile);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  xit('should create', () => {
    expect(component).toBeTruthy();
  });
});
