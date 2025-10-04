import { Injectable, inject } from '@angular/core';
import {
  Firestore,
  collection,
  query,
  where,
  getDocs,
  orderBy,
  doc,
  docData,
  updateDoc,
} from '@angular/fire/firestore';
import { Session, SessionStatus } from '../../shared/models/session.model';
import { Observable, from, of } from 'rxjs';
import { map, switchMap } from 'rxjs/operators';
import { AuthService } from './auth.service';
import { toObservable } from '@angular/core/rxjs-interop';

@Injectable({
  providedIn: 'root',
})
export class SessionService {
  private firestore: Firestore = inject(Firestore);
  private authService = inject(AuthService);

  private currentUser$ = toObservable(this.authService.currentUser);

  // Get a single session by ID
  getSessionById(sessionId: string): Observable<Session | null> {
    if (!sessionId) {
      return of(null);
    }
    const sessionDocRef = doc(this.firestore, `sessions/${sessionId}`);
    return docData(sessionDocRef, { idField: 'sessionId' }) as Observable<Session | null>;
  }

  // Update session status
  updateSessionStatus(sessionId: string, status: SessionStatus): Observable<void> {
    const sessionDocRef = doc(this.firestore, `sessions/${sessionId}`);
    return from(updateDoc(sessionDocRef, { status }));
  }

  getSessionsForMentee(): Observable<Session[]> {
    return this.currentUser$.pipe(
      switchMap(user => {
        if (!user) {
          return of([]);
        }

        const sessionsCollection = collection(this.firestore, 'sessions');
        const sessionsQuery = query(
          sessionsCollection,
          where('menteeId', '==', user.uid),
          orderBy('startTime', 'desc') // Order by start time, newest first
        );

        return from(getDocs(sessionsQuery)).pipe(
          map(querySnapshot => {
            const sessions: Session[] = [];
            querySnapshot.forEach(doc => {
              sessions.push({ sessionId: doc.id, ...doc.data() } as Session);
            });
            return sessions;
          })
        );
      })
    );
  }
}
