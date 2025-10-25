import { ComponentFixture, TestBed } from '@angular/core/testing';

import CalComSetupGuide from './cal-com-setup-guide';

describe('CalComSetupGuide', () => {
  let component: CalComSetupGuide;
  let fixture: ComponentFixture<CalComSetupGuide>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [CalComSetupGuide]
    })
    .compileComponents();

    fixture = TestBed.createComponent(CalComSetupGuide);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  xit('should create', () => {
    expect(component).toBeTruthy();
  });
});
