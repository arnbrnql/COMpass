import { Injectable, inject } from '@angular/core';
import {
  Firestore,
  doc,
  docData,
  setDoc,
  updateDoc,
} from '@angular/fire/firestore';
import { User } from '../../shared/models/user.model';
import { Observable, of, from } from 'rxjs';

@Injectable({
  providedIn: 'root',
})
export class UserService {
  firestore: Firestore = inject(Firestore);

  getUserProfile(uid: string | undefined): Observable<User | null> {
    if (!uid) {
      return of(null);
    }
    const userDocRef = doc(this.firestore, `users/${uid}`);
    return docData(userDocRef) as Observable<User | null>;
  }

  addUser(user: User): Observable<void> {
    const userDocRef = doc(this.firestore, `users/${user.uid}`);
    return from(setDoc(userDocRef, user));
  }

  updateUserProfile(uid: string, data: Partial<User>): Observable<void> {
    const userDocRef = doc(this.firestore, `users/${uid}`);
    return from(updateDoc(userDocRef, data));
  }
}
