import { ComponentFixture, TestBed } from '@angular/core/testing';
import { ReactiveFormsModule } from '@angular/forms';
import RequestModal from './request-modal';
import { MentorshipService } from '../../../core/services/mentorship.service';
import { of } from 'rxjs';

describe('RequestModal', () => {
  let component: RequestModal;
  let fixture: ComponentFixture<RequestModal>;
  let mockMentorshipService: jasmine.SpyObj<MentorshipService>;

  beforeEach(async () => {
    mockMentorshipService = jasmine.createSpyObj('MentorshipService', ['createRequest']);

    await TestBed.configureTestingModule({
      imports: [RequestModal, ReactiveFormsModule],
      providers: [
        { provide: MentorshipService, useValue: mockMentorshipService }
      ]
    }).compileComponents();

    fixture = TestBed.createComponent(RequestModal);
    component = fixture.componentInstance;
    fixture.componentRef.setInput('mentorId', 'test-mentor-id');
    fixture.componentRef.setInput('isModalOpen', true);
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });

  it('should have invalid form when message is empty', () => {
    expect(component.requestForm.valid).toBeFalsy();
  });

  it('should have invalid form when message is less than 20 characters', () => {
    component.requestForm.patchValue({ message: 'Short message' });
    expect(component.requestForm.valid).toBeFalsy();
  });

  it('should have valid form when message meets requirements', () => {
    component.requestForm.patchValue({ message: 'This is a valid message that is longer than 20 characters' });
    expect(component.requestForm.valid).toBeTruthy();
  });

  it('should call createRequest on valid form submission', async () => {
    mockMentorshipService.createRequest.and.returnValue(of({}));
    component.requestForm.patchValue({ message: 'This is a valid message that is longer than 20 characters' });

    await component.onSubmit();

    expect(mockMentorshipService.createRequest).toHaveBeenCalledWith('test-mentor-id', 'This is a valid message that is longer than 20 characters');
  });

  it('should reset form and emit closeModal on successful submission', async () => {
    mockMentorshipService.createRequest.and.returnValue(of({}));
    spyOn(component.closeModal, 'emit');
    component.requestForm.patchValue({ message: 'This is a valid message that is longer than 20 characters' });

    await component.onSubmit();

    expect(component.requestForm.value.message).toBeNull();
    expect(component.closeModal.emit).toHaveBeenCalled();
  });
});
