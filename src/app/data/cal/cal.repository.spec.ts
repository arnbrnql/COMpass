import { TestBed } from '@angular/core/testing';

import { CalComRepository } from './cal.repository';

describe('CalComRepository', () => {
  let service: CalComRepository;

  beforeEach(() => {
    TestBed.configureTestingModule({});
    service = TestBed.inject(CalComRepository);
  });

  xit('should be created', () => {
    expect(service).toBeTruthy();
  });
});
