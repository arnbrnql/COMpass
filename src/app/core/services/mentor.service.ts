import { Injectable, inject } from '@angular/core';
import {
  Firestore,
  collection,
  query,
  where,
  getDocs,
} from '@angular/fire/firestore';
import { User } from '../../shared/models/user.model';
import { Observable, from } from 'rxjs';
import { map } from 'rxjs/operators';

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

    return from(getDocs(mentorsQuery)).pipe(
      map((querySnapshot) => {
        const mentors: User[] = [];
        querySnapshot.forEach((doc) => {
          mentors.push(doc.data() as User);
        });
        return mentors;
      })
    );
  }
}
