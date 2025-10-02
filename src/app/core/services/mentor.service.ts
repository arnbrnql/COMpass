import { Injectable, inject } from '@angular/core';
import {
  Firestore,
  collection,
  query,
  where,
  getDocs,
} from '@angular/fire/firestore';
import { User } from '../../shared/models/user.model';
import { Observable, from, of } from 'rxjs';
import { map, switchMap } from 'rxjs/operators';
import { AuthService } from './auth.service';
import { toObservable } from '@angular/core/rxjs-interop';

@Injectable({
  providedIn: 'root',
})
export class MentorService {
  private firestore: Firestore = inject(Firestore);
  private authService = inject(AuthService);

  // Convert the currentUser signal to an observable for use in the stream
  private currentUser$ = toObservable(this.authService.currentUser);

  getMentors(): Observable<User[]> {
    return this.currentUser$.pipe(
      switchMap(user => {
        if (!user) {
          // If no user is logged in, return an empty array
          return of([]);
        }

        const usersCollection = collection(this.firestore, 'users');
        const mentorsQuery = query(
          usersCollection,
          where('roleFlags.isMentor', '==', true)
        );

        return from(getDocs(mentorsQuery)).pipe(
          map((querySnapshot) => {
            const mentors: User[] = [];
            querySnapshot.forEach((doc) => {
              const mentorData = doc.data() as User;
              // Exclude the currently logged-in user from the list
              if (mentorData.uid !== user.uid) {
                mentors.push(mentorData);
              }
            });
            return mentors;
          })
        );
      })
    );
  }
}
