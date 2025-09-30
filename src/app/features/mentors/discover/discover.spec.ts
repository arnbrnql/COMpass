import { ComponentFixture, TestBed } from '@angular/core/testing';
import { of } from 'rxjs';
import { MentorService } from '../../../core/services/mentor.service';
import { User } from '../../../shared/models/user.model';
import Discover from './discover';

describe('Discover', () => {
  let component: Discover;
  let fixture: ComponentFixture<Discover>;
  let mockMentorService: jasmine.SpyObj<MentorService>;

  const mockMentors: User[] = [
    {
      uid: 'mentor1',
      email: 'mentor1@test.com',
      displayName: 'Mentor One',
      roleFlags: { isMentor: true, isMentee: false },
    },
    {
      uid: 'mentor2',
      email: 'mentor2@test.com',
      displayName: 'Mentor Two',
      roleFlags: { isMentor: true, isMentee: false },
    },
  ];

  beforeEach(async () => {
    const spy = jasmine.createSpyObj('MentorService', ['getMentors']);

    await TestBed.configureTestingModule({
      imports: [Discover],
      providers: [{ provide: MentorService, useValue: spy }],
    }).compileComponents();

    fixture = TestBed.createComponent(Discover);
    component = fixture.componentInstance;
    mockMentorService = TestBed.inject(MentorService) as jasmine.SpyObj<MentorService>;
  });

  it('should create', () => {
    mockMentorService.getMentors.and.returnValue(of(mockMentors));
    fixture.detectChanges();
    expect(component).toBeTruthy();
  });

  it('should display mentors when available', () => {
    mockMentorService.getMentors.and.returnValue(of(mockMentors));
    fixture.detectChanges();

    const compiled = fixture.nativeElement as HTMLElement;
    expect(compiled.textContent).toContain('Discover Mentors');
    expect(component.mentors()).toEqual(mockMentors);
  });

  it('should display no mentors message when empty', () => {
    mockMentorService.getMentors.and.returnValue(of([]));
    fixture.detectChanges();

    const compiled = fixture.nativeElement as HTMLElement;
    expect(compiled.textContent).toContain('No mentors are available at the moment');
  });
});
