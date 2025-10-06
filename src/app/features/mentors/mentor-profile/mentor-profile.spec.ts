import { ComponentFixture, TestBed } from '@angular/core/testing';
import { ActivatedRoute } from '@angular/router';
import { DomSanitizer } from '@angular/platform-browser';
import { of } from 'rxjs';
import { UserService } from '../../../core/services/user.service';
import { User } from '../../../shared/models/user.model';
import MentorProfile from './mentor-profile';

describe('MentorProfile', () => {
  let component: MentorProfile;
  let fixture: ComponentFixture<MentorProfile>;
  let mockUserService: jasmine.SpyObj<UserService>;
  let mockActivatedRoute: jasmine.SpyObj<ActivatedRoute>;
  let mockDomSanitizer: jasmine.SpyObj<DomSanitizer>;

  const mockMentor: User = {
    uid: 'mentor1',
    email: 'mentor1@test.com',
    displayName: 'Mentor One',
    bio: 'Experienced software engineer',
    mentorProfile: {
      expertise: ['JavaScript', 'Angular', 'Node.js'],
    },
    roleFlags: { isMentor: true, isMentee: false },
  };

  beforeEach(async () => {
    const userServiceSpy = jasmine.createSpyObj('UserService', ['getUserProfile']);
    const routeSpy = jasmine.createSpyObj('ActivatedRoute', [], {
      params: of({ id: 'mentor1' })
    });
    const sanitizerSpy = jasmine.createSpyObj('DomSanitizer', ['bypassSecurityTrustResourceUrl']);

    await TestBed.configureTestingModule({
      imports: [MentorProfile],
      providers: [
        { provide: UserService, useValue: userServiceSpy },
        { provide: ActivatedRoute, useValue: routeSpy },
        { provide: DomSanitizer, useValue: sanitizerSpy }
      ],
    }).compileComponents();

    fixture = TestBed.createComponent(MentorProfile);
    component = fixture.componentInstance;
    mockUserService = TestBed.inject(UserService) as jasmine.SpyObj<UserService>;
    mockActivatedRoute = TestBed.inject(ActivatedRoute) as jasmine.SpyObj<ActivatedRoute>;
    mockDomSanitizer = TestBed.inject(DomSanitizer) as jasmine.SpyObj<DomSanitizer>;
  });

  it('should create', () => {
    mockUserService.getUserProfile.and.returnValue(of(mockMentor));
    fixture.detectChanges();
    expect(component).toBeTruthy();
  });

  it('should load mentor profile when route param is provided', () => {
    mockUserService.getUserProfile.and.returnValue(of(mockMentor));
    fixture.detectChanges();

    expect(mockUserService.getUserProfile).toHaveBeenCalledWith('mentor1');
    expect(component.mentor()).toEqual(mockMentor);
  });

  it('should return null when no mentor is found', () => {
    mockUserService.getUserProfile.and.returnValue(of(null));
    fixture.detectChanges();

    expect(component.mentor()).toBeNull();
  });

  it('should generate Cal.com URL when mentor is available', () => {
    mockUserService.getUserProfile.and.returnValue(of(mockMentor));
    const mockSafeUrl = {} as any;
    mockDomSanitizer.bypassSecurityTrustResourceUrl.and.returnValue(mockSafeUrl);
    fixture.detectChanges();

    const result = component.calComUrl();
    expect(mockDomSanitizer.bypassSecurityTrustResourceUrl).toHaveBeenCalledWith('https://cal.com/team/compass-app/mentorship-session');
    expect(result).toBe(mockSafeUrl);
  });

  it('should return null Cal.com URL when no mentor is available', () => {
    mockUserService.getUserProfile.and.returnValue(of(null));
    fixture.detectChanges();

    const result = component.calComUrl();
    expect(result).toBeNull();
  });
});
