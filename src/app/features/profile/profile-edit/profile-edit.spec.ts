import { ComponentFixture, TestBed } from '@angular/core/testing';
import ProfileEdit from './profile-edit';
import { provideFirebaseApp, initializeApp } from '@angular/fire/app';
import { provideFirestore, getFirestore } from '@angular/fire/firestore';
import { provideAuth, getAuth } from '@angular/fire/auth';
import { environment } from '../../../../environments/environment';

describe('ProfileEdit', () => {
  let component: ProfileEdit;
  let fixture: ComponentFixture<ProfileEdit>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [ProfileEdit],
      providers: [
        provideFirebaseApp(() => initializeApp(environment.firebase)),
        provideFirestore(() => getFirestore()),
        provideAuth(() => getAuth()),
      ],
    }).compileComponents();

    fixture = TestBed.createComponent(ProfileEdit);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
