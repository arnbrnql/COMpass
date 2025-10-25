import { ComponentFixture, TestBed } from '@angular/core/testing';

import LoadMore from './load-more';

describe('LoadMore', () => {
  let component: LoadMore;
  let fixture: ComponentFixture<LoadMore>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [LoadMore]
    })
    .compileComponents();

    fixture = TestBed.createComponent(LoadMore);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  xit('should create', () => {
    expect(component).toBeTruthy();
  });
});
