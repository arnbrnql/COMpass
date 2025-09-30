import { ComponentFixture, TestBed } from '@angular/core/testing';

import { MenteeRequest } from './mentee-request';

describe('MenteeRequest', () => {
  let component: MenteeRequest;
  let fixture: ComponentFixture<MenteeRequest>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [MenteeRequest]
    })
    .compileComponents();

    fixture = TestBed.createComponent(MenteeRequest);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
