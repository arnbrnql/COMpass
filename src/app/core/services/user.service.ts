import { Injectable, inject } from '@angular/core';
import {
  Firestore,
  doc,
  docData,
  setDoc,
  updateDoc,
} from '@angular/fire/firestore';
import { User } from '../../shared/models/user.model';
import { from, Observable } from 'rxjs';

@Injectable({
  providedIn: 'root',
})
export class UserService {
  private firestore: Firestore = inject(Firestore);

  getUserProfile(uid: string): Observable<User> {
    const userDocRef = doc(this.firestore, 'users', uid);
    return docData(userDocRef) as Observable<User>;
  }

  createUserProfile(user: User) {
    const userDocRef = doc(this.firestore, 'users', user.uid);
    return from(setDoc(userDocRef, { ...user }));
  }

  updateUserProfile(uid: string, data: Partial<User>) {
    const userDocRef = doc(this.firestore, 'users', uid);
    return from(updateDoc(userDocRef, data));
  }
}
