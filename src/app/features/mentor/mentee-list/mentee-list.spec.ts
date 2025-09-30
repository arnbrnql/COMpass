import { ComponentFixture, TestBed } from '@angular/core/testing';

import { MenteeList } from './mentee-list';

describe('MenteeList', () => {
  let component: MenteeList;
  let fixture: ComponentFixture<MenteeList>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [MenteeList]
    })
    .compileComponents();

    fixture = TestBed.createComponent(MenteeList);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
