import { Injectable, inject } from '@angular/core';
import {
  Firestore,
  collection,
  query,
  where,
  getDocs,
  collectionData,
} from '@angular/fire/firestore';
import { User } from '../../shared/models/user.model';
import { Observable } from 'rxjs';

@Injectable({
  providedIn: 'root',
})
export class MentorService {
  private firestore: Firestore = inject(Firestore);

  getMentors(): Observable<User[]> {
    const usersCollection = collection(this.firestore, 'users');
    const mentorsQuery = query(
      usersCollection,
      where('roleFlags.isMentor', '==', true)
    );

    return collectionData(mentorsQuery, { idField: 'uid' }) as Observable<User[]>;
  }
}
