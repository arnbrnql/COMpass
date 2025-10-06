import { ComponentFixture, TestBed } from '@angular/core/testing';
import { ActivatedRoute } from '@angular/router';
import { User } from '../../../shared/models/user.model';
import MentorCard from './mentor-card';

describe('MentorCard', () => {
  let component: MentorCard;
  let fixture: ComponentFixture<MentorCard>;

  const mockUser: User = {
    uid: 'test-uid',
    email: 'mentor@test.com',
    displayName: 'Test Mentor',
    photoURL: 'https://example.com/photo.jpg',
    bio: 'Test mentor bio',
    mentorProfile: {
      expertise: ['Angular', 'TypeScript'],
    },
    roleFlags: {
      isMentor: true,
      isMentee: false,
    },
  };

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [MentorCard],
      providers: [
        {
          provide: ActivatedRoute,
          useValue: { snapshot: { params: {} } },
        },
      ],
    }).compileComponents();

    fixture = TestBed.createComponent(MentorCard);
    component = fixture.componentInstance;
    fixture.componentRef.setInput('mentor', mockUser);
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });

  it('should display mentor information', () => {
    const compiled = fixture.nativeElement as HTMLElement;
    expect(compiled.textContent).toContain('Test Mentor');
    expect(compiled.textContent).toContain('Test mentor bio');
  });

  it('should have a view profile link', () => {
    const compiled = fixture.nativeElement as HTMLElement;
    const viewProfileLink = compiled.querySelector('a[routerLink]');
    expect(viewProfileLink).toBeTruthy();
    expect(viewProfileLink?.textContent?.trim()).toBe('View Profile');
  });
});
