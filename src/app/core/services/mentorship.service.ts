import { Injectable, inject } from '@angular/core';
import {
  Firestore,
  collection,
  addDoc,
  serverTimestamp,
  query,
  where,
  getDocs,
  doc,
  updateDoc
} from '@angular/fire/firestore';
import { MentorshipRequest, MentorshipRequestStatus } from '../../shared/models/mentorship-request.model';
import { Observable, from, of } from 'rxjs';
import { map, switchMap } from 'rxjs/operators';
import { AuthService } from './auth.service';
import { toObservable } from '@angular/core/rxjs-interop';

@Injectable({
  providedIn: 'root',
})
export class MentorshipService {
  private firestore: Firestore = inject(Firestore);
  private authService = inject(AuthService);
  private currentUser$ = toObservable(this.authService.currentUser);

  // Create a new mentorship request
  createRequest(mentorId: string, message: string): Observable<any> {
    const menteeId = this.authService.currentUserProfile()?.uid;
    if (!menteeId) return of(null);

    const request: Omit<MentorshipRequest, 'id'> = {
      mentorId,
      menteeId,
      message,
      status: 'pending',
      createdAt: serverTimestamp(),
    };

    const requestsCollection = collection(this.firestore, 'mentorshipRequests');
    return from(addDoc(requestsCollection, request));
  }

  // Get all pending requests for the current mentor
  getPendingRequestsForMentor(): Observable<MentorshipRequest[]> {
    return this.currentUser$.pipe(
      switchMap(user => {
        if (!user) return of([]);

        const requestsCollection = collection(this.firestore, 'mentorshipRequests');
        const requestsQuery = query(
          requestsCollection,
          where('mentorId', '==', user.uid),
          where('status', '==', 'pending')
        );

        return from(getDocs(requestsQuery)).pipe(
          map(snapshot => snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() } as MentorshipRequest)))
        );
      })
    );
  }

  // Update the status of a request
  updateRequestStatus(requestId: string, status: MentorshipRequestStatus): Observable<void> {
    const requestDoc = doc(this.firestore, `mentorshipRequests/${requestId}`);
    return from(updateDoc(requestDoc, { status }));
  }
}
