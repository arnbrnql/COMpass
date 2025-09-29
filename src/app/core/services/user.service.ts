import { Injectable, inject } from '@angular/core';
import { Firestore, doc, setDoc, docData, updateDoc } from '@angular/fire/firestore';
import { User } from '../../shared/models/user.model';
import { Observable } from 'rxjs';

@Injectable({
  providedIn: 'root'
})
export class UserService {
  private firestore: Firestore = inject(Firestore);

  // Creates the initial user document (already exists)
  createUserProfile(user: User) {
    const userDocRef = doc(this.firestore, `users/${user.uid}`);
    // Using setDoc with merge: true will create or update the document
    return setDoc(userDocRef, {
      uid: user.uid,
      email: user.email,
      displayName: user.displayName,
      role: 'mentee'
    }, { merge: true });
  }

  // --- NEW METHODS ---

  // Gets a real-time stream of a user's profile data
  getUserProfile(uid: string): Observable<User | undefined> {
    const userDocRef = doc(this.firestore, `users/${uid}`);
    return docData(userDocRef) as Observable<User | undefined>;
  }

  // Updates a user's profile document
  updateUserProfile(uid: string, data: Partial<User>): Promise<void> {
    const userDocRef = doc(this.firestore, `users/${uid}`);
    return updateDoc(userDocRef, data);
  }
}
