import { ComponentFixture, TestBed } from '@angular/core/testing';

import MentorCard from './mentor-card';

describe('MentorCard', () => {
  let component: MentorCard;
  let fixture: ComponentFixture<MentorCard>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [MentorCard]
    })
    .compileComponents();

    fixture = TestBed.createComponent(MentorCard);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  xit('should create', () => {
    expect(component).toBeTruthy();
  });
});
