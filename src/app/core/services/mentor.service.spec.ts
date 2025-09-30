import { TestBed } from '@angular/core/testing';
import { Firestore } from '@angular/fire/firestore';
import { MentorService } from './mentor.service';

describe('MentorService', () => {
  let service: MentorService;
  let mockFirestore: jasmine.SpyObj<Firestore>;

  beforeEach(() => {
    const spy = jasmine.createSpyObj('Firestore', ['collection', 'query', 'where', 'getDocs']);

    TestBed.configureTestingModule({
      providers: [{ provide: Firestore, useValue: spy }],
    });
    service = TestBed.inject(MentorService);
    mockFirestore = TestBed.inject(Firestore) as jasmine.SpyObj<Firestore>;
  });

  it('should be created', () => {
    expect(service).toBeTruthy();
  });

  it('should have getMentors method', () => {
    expect(service.getMentors).toBeDefined();
    expect(typeof service.getMentors).toBe('function');
  });
});
