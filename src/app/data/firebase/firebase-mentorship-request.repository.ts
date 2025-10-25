import { Injectable, NgZone, inject } from '@angular/core';
import {
  Firestore,
  addDoc,
  collection,
  collectionData,
  doc,
  docData,
  getCountFromServer,
  limit,
  orderBy,
  query,
  serverTimestamp,
  updateDoc,
  where,
} from '@angular/fire/firestore';
import { Observable, combineLatest, defer, from, map, of } from 'rxjs';
import { DocumentData, Transaction, runTransaction } from 'firebase/firestore';

import { FIREBASE_COLLECTIONS } from '../../core/constants';
import { RequestStatus } from '../../core/enums/request-status.enum';
import {
  MentorshipRequestRepository,
  MentorshipRequestPaginationOptions,
  MentorshipRequestPaginationResult,
} from '../../domain/repositories/mentorship-request.repository';
import {
  MentorshipRequest,
  MentorshipRequestFormData,
  MentorshipRequestProps,
} from '../../shared/models/mentorship-request.model';

@Injectable()
export class FirebaseMentorshipRequestRepository implements MentorshipRequestRepository {
  private firestore: Firestore = inject(Firestore);
  private ngZone = inject(NgZone);

  createRequest(
    menteeId: string,
    mentorId: string,
    formData: MentorshipRequestFormData
  ): Observable<string> {
    const requestsCollection = collection(this.firestore, FIREBASE_COLLECTIONS.MENTORSHIP_REQUESTS);
    const requestData = {
      menteeId,
      mentorId,
      status: RequestStatus.Pending,
      message: formData.message,
      goals: formData.goals,
      experienceLevel: formData.experienceLevel,
      preferredMeetingFrequency: formData.preferredMeetingFrequency,
      createdAt: serverTimestamp(),
      updatedAt: serverTimestamp(),
    };

    return defer(() => this.ngZone.run(() => addDoc(requestsCollection, requestData))).pipe(
      map((docRef) => docRef.id)
    );
  }

  streamRequestsForMentor(mentorId: string): Observable<MentorshipRequest[]> {
    const requestsQuery = query(
      collection(this.firestore, FIREBASE_COLLECTIONS.MENTORSHIP_REQUESTS),
      where('mentorId', '==', mentorId),
      orderBy('createdAt', 'desc')
    );

    return collectionData(requestsQuery, { idField: 'requestId' }).pipe(
      map(requests => requests.map(request => this.toDomainRequest(request as MentorshipRequestProps)))
    );
  }

  streamRequestsForMentee(menteeId: string): Observable<MentorshipRequest[]> {
    const requestsQuery = query(
      collection(this.firestore, FIREBASE_COLLECTIONS.MENTORSHIP_REQUESTS),
      where('menteeId', '==', menteeId),
      orderBy('createdAt', 'desc')
    );

    return collectionData(requestsQuery, { idField: 'requestId' }).pipe(
      map(requests => requests.map(request => this.toDomainRequest(request as MentorshipRequestProps)))
    );
  }

  streamRequestById(requestId: string): Observable<MentorshipRequest | null> {
    if (!requestId) {
      return of(null);
    }

    const requestDocRef = doc(
      this.firestore,
      `${FIREBASE_COLLECTIONS.MENTORSHIP_REQUESTS}/${requestId}`
    );
    return docData(requestDocRef, { idField: 'requestId' }).pipe(
      map(request => (request ? this.toDomainRequest(request as MentorshipRequestProps) : null))
    );
  }

  approveRequest(requestId: string): Observable<void> {
    const requestDocRef = doc(
      this.firestore,
      `${FIREBASE_COLLECTIONS.MENTORSHIP_REQUESTS}/${requestId}`
    );

    return defer(() =>
      this.ngZone.run(() =>
        runTransaction(this.firestore, async (transaction: Transaction) => {
          const snapshot = await transaction.get(requestDocRef);
          if (!snapshot.exists()) {
            throw new Error('Request not found');
          }

          const data = snapshot.data() as DocumentData & MentorshipRequestProps;
          if (data.status !== RequestStatus.Pending) {
            throw new Error('Only pending requests can be approved');
          }

          const existingAccess = (data.calendarAccess ?? {}) as Record<string, unknown>;
          const { lockedAt: _lockedAt, ...restAccess } = existingAccess;

          transaction.update(requestDocRef, {
            status: RequestStatus.Approved,
            approvedAt: serverTimestamp(),
            updatedAt: serverTimestamp(),
            calendarAccess: {
              ...restAccess,
              isUnlocked: true,
              unlockedAt: serverTimestamp(),
            },
          });
        })
      )
    ).pipe(map(() => void 0));
  }

  rejectRequest(requestId: string, reason?: string): Observable<void> {
    const requestDocRef = doc(
      this.firestore,
      `${FIREBASE_COLLECTIONS.MENTORSHIP_REQUESTS}/${requestId}`
    );

    return defer(() =>
      this.ngZone.run(() =>
        runTransaction(this.firestore, async (transaction: Transaction) => {
          const snapshot = await transaction.get(requestDocRef);
          if (!snapshot.exists()) {
            throw new Error('Request not found');
          }

          const data = snapshot.data() as DocumentData & MentorshipRequestProps;
          if (data.status !== RequestStatus.Pending) {
            throw new Error('Only pending requests can be rejected');
          }

          transaction.update(requestDocRef, {
            status: RequestStatus.Rejected,
            rejectedAt: serverTimestamp(),
            updatedAt: serverTimestamp(),
            ...(reason ? { rejectionReason: reason } : {}),
          });
        })
      )
    ).pipe(map(() => void 0));
  }

  hasExistingRequest(menteeId: string, mentorId: string): Observable<boolean> {
    const requestsQuery = query(
      collection(this.firestore, FIREBASE_COLLECTIONS.MENTORSHIP_REQUESTS),
      where('menteeId', '==', menteeId),
      where('mentorId', '==', mentorId),
      where('status', 'in', [RequestStatus.Pending, RequestStatus.Approved]),
      limit(1)
    );

    return collectionData(requestsQuery).pipe(
      map(requests =>
        requests
          .map(request => this.toDomainRequest(request as MentorshipRequestProps))
          .some(request => request.isPending() || request.isApproved())
      )
    );
  }

  streamRequestsForMentorPaginated(
    mentorId: string,
    options: MentorshipRequestPaginationOptions
  ): Observable<MentorshipRequestPaginationResult> {
    const requestsQuery = query(
      collection(this.firestore, FIREBASE_COLLECTIONS.MENTORSHIP_REQUESTS),
      where('mentorId', '==', mentorId),
      orderBy(options.orderBy ?? 'createdAt', options.orderDirection ?? 'desc'),
      limit(options.limit)
    );

    const requests$ = collectionData(requestsQuery, { idField: 'requestId' }).pipe(
      map(requests => requests.map(request => this.toDomainRequest(request as MentorshipRequestProps)))
    );

    const countQuery = query(
      collection(this.firestore, FIREBASE_COLLECTIONS.MENTORSHIP_REQUESTS),
      where('mentorId', '==', mentorId)
    );

    const count$ = from(getCountFromServer(countQuery)).pipe(
      map((snapshot) => snapshot.data().count)
    );

    return combineLatest([requests$, count$]).pipe(
      map(([requests, total]) => {
        const totalPages = Math.ceil(total / options.limit) || 0;
        return {
          data: requests,
          pagination: {
            page: options.page,
            limit: options.limit,
            total,
            totalPages,
            hasNext: options.page < totalPages,
            hasPrevious: options.page > 1,
          },
        } satisfies MentorshipRequestPaginationResult;
      })
    );
  }

  markAsDone(requestId: string): Observable<void> {
    const requestRef = doc(
      this.firestore,
      `${FIREBASE_COLLECTIONS.MENTORSHIP_REQUESTS}/${requestId}`
    );

    return defer(() =>
      this.ngZone.run(() =>
        runTransaction(this.firestore, async (transaction: Transaction) => {
          const snapshot = await transaction.get(requestRef);
          if (!snapshot.exists()) {
            throw new Error('Request not found');
          }

          const data = snapshot.data() as DocumentData & MentorshipRequestProps;
          if (data.status !== RequestStatus.Approved) {
            throw new Error('Only approved requests can be marked done');
          }

          const existingAccess = (data.calendarAccess ?? {}) as Record<string, unknown>;
          transaction.update(requestRef, {
            status: RequestStatus.Done,
            completedAt: serverTimestamp(),
            updatedAt: serverTimestamp(),
            calendarAccess: {
              ...existingAccess,
              isUnlocked: false,
              lockedAt: serverTimestamp(),
            },
          });
        })
      )
    ).pipe(map(() => void 0));
  }

  saveBookingUrl(requestId: string, bookingUrl: string): Observable<void> {
    const requestRef = doc(
      this.firestore,
      `${FIREBASE_COLLECTIONS.MENTORSHIP_REQUESTS}/${requestId}`
    );

    return from(
      updateDoc(requestRef, {
        bookingUrl,
        updatedAt: serverTimestamp(),
      })
    );
  }

  hasCalendarAccess(menteeId: string, mentorId: string): Observable<boolean> {
    const requestsQuery = query(
      collection(this.firestore, FIREBASE_COLLECTIONS.MENTORSHIP_REQUESTS),
      where('menteeId', '==', menteeId),
      where('mentorId', '==', mentorId),
      where('status', '==', RequestStatus.Approved)
    );

    return collectionData(requestsQuery, { idField: 'requestId' }).pipe(
      map(requests =>
        requests
          .map(request => this.toDomainRequest(request as MentorshipRequestProps))
          .some(request => request.isApproved() && request.calendarAccess?.isUnlocked)
      )
    );
  }

  private toDomainRequest(raw: MentorshipRequestProps): MentorshipRequest {
    return MentorshipRequest.fromProps(raw);
  }
}
