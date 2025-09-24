import { Injectable, inject } from '@angular/core';
import { Firestore, doc, setDoc } from '@angular/fire/firestore';
import { User } from '../../shared/models/user.model';

@Injectable({
  providedIn: 'root'
})
export class UserService {
  private firestore: Firestore = inject(Firestore);

  // Creates a new user document in the 'users' collection
  createUserProfile(user: User) {
    const userDocRef = doc(this.firestore, `users/${user.uid}`);
    return setDoc(userDocRef, {
      uid: user.uid,
      email: user.email,
      displayName: user.displayName,
      role: 'mentee' // Default role on registration
    });
  }
}
