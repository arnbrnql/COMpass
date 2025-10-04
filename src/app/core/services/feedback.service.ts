import { Injectable, inject } from '@angular/core';
import { Firestore, collection, addDoc, DocumentReference } from '@angular/fire/firestore';
import { Feedback } from '../../shared/models/feedback.model';
import { Observable, from } from 'rxjs';

@Injectable({
  providedIn: 'root',
})
export class FeedbackService {
  private firestore: Firestore = inject(Firestore);

  addFeedback(feedback: Omit<Feedback, 'feedbackId'>): Observable<DocumentReference> {
    const feedbackCollection = collection(this.firestore, 'feedback');
    return from(addDoc(feedbackCollection, feedback));
  }
}
