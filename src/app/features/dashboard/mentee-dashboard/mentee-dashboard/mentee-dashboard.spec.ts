import { ComponentFixture, TestBed } from '@angular/core/testing';

import MenteeDashboard from './mentee-dashboard';

describe('MenteeDashboard', () => {
  let component: MenteeDashboard;
  let fixture: ComponentFixture<MenteeDashboard>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [MenteeDashboard]
    })
    .compileComponents();

    fixture = TestBed.createComponent(MenteeDashboard);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  xit('should create', () => {
    expect(component).toBeTruthy();
  });
});
