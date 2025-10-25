import { Injectable, inject } from '@angular/core';
import {
  DocumentData,
  Firestore,
  QueryDocumentSnapshot,
  collection,
  collectionData,
  getCountFromServer,
  getDocs,
  limit,
  orderBy,
  query,
  startAfter,
  where,
} from '@angular/fire/firestore';
import { Observable, combineLatest, from } from 'rxjs';
import { map } from 'rxjs/operators';

import { FIREBASE_COLLECTIONS } from '../../core/constants';
import {
  MentorCursor,
  MentorInfiniteResult,
  MentorPaginationOptions,
  MentorPaginationResult,
  MentorRepository,
} from '../../domain/repositories/mentor.repository';
import { User, UserProps } from '../../shared/models/user.model';

function toUser(raw: Record<string, unknown>): User {
  return User.fromProps(raw as unknown as UserProps);
}

@Injectable()
export class FirebaseMentorRepository implements MentorRepository {
  private firestore: Firestore = inject(Firestore);

  streamMentors(excludeUid?: string | null): Observable<User[]> {
    const usersCollection = collection(this.firestore, FIREBASE_COLLECTIONS.USERS);
    const mentorsQuery = query(
      usersCollection,
      where('roleFlags.isMentor', '==', true)
    );

    return collectionData(mentorsQuery, { idField: 'uid' }).pipe(
      map((mentors) =>
        mentors
          .filter((mentor) => !excludeUid || mentor['uid'] !== excludeUid)
          .map((mentor) => toUser(mentor as Record<string, unknown>))
      )
    );
  }

  streamMentorsPaginated(
    excludeUid: string | null,
    options: MentorPaginationOptions
  ): Observable<MentorPaginationResult> {
    const usersCollection = collection(this.firestore, FIREBASE_COLLECTIONS.USERS);
    const orderField = options.orderBy ?? 'displayName';
    const direction = options.orderDirection ?? 'asc';

    const baseQuery = query(
      usersCollection,
      where('roleFlags.isMentor', '==', true),
      orderBy(orderField, direction)
    );

    const paginatedQuery = query(baseQuery, limit(options.limit));

    const data$ = collectionData(paginatedQuery, { idField: 'uid' }).pipe(
      map((mentors) =>
        mentors
          .filter((mentor) => !excludeUid || mentor['uid'] !== excludeUid)
          .map((mentor) => toUser(mentor as Record<string, unknown>))
      )
    );

    const count$ = from(getCountFromServer(baseQuery)).pipe(
      map((snapshot) => snapshot.data().count)
    );

    return combineLatest([data$, count$]).pipe(
      map(([mentors, total]) => {
        const totalPages = Math.ceil(total / options.limit) || 0;
        return {
          data: mentors,
          pagination: {
            page: options.page,
            limit: options.limit,
            total,
            totalPages,
            hasNext: options.page < totalPages,
            hasPrevious: options.page > 1,
          },
        } satisfies MentorPaginationResult;
      })
    );
  }

  streamMentorsInfinite(
    excludeUid: string | null,
    limitCount: number,
    cursor?: MentorCursor | null
  ): Observable<MentorInfiniteResult> {
    const usersCollection = collection(this.firestore, FIREBASE_COLLECTIONS.USERS);
    let mentorsQuery = query(
      usersCollection,
      where('roleFlags.isMentor', '==', true),
      orderBy('displayName', 'asc'),
      limit(limitCount)
    );

    if (cursor) {
      mentorsQuery = query(
        mentorsQuery,
        startAfter(cursor as QueryDocumentSnapshot<DocumentData>)
      );
    }

    return from(getDocs(mentorsQuery)).pipe(
      map((snapshot) => {
        const mentors = snapshot.docs
          .map((doc) => ({ uid: doc.id, ...(doc.data() as Record<string, unknown>) }))
          .map((data) => toUser(data))
          .filter((mentor) => !excludeUid || mentor.uid !== excludeUid);

        const lastDoc = snapshot.docs[snapshot.docs.length - 1] ?? null;

        return {
          data: mentors,
          cursor: lastDoc,
        } satisfies MentorInfiniteResult;
      })
    );
  }
}
