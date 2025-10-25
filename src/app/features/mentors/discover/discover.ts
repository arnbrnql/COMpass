import { ChangeDetectionStrategy, Component, inject, signal, computed } from '@angular/core';
import { toSignal } from '@angular/core/rxjs-interop';
import { Subject, of } from 'rxjs';
import { catchError, startWith, switchMap, tap } from 'rxjs/operators';

import { MentorService } from '../../../core/services/mentor.service';
import { User } from '../../../shared/models/user.model';
import MentorCard from '../mentor-card/mentor-card';
import ErrorStateComponent from '../../../shared/components/error-state/error-state';
import LoadingStateComponent from '../../../shared/components/loading-state/loading-state';
import EmptyStateComponent from '../../../shared/components/empty-state/empty-state';
import BackButtonComponent from '../../../shared/components/back-button/back-button';
import { isDomainError } from '../../../domain/errors';

@Component({
  selector: 'app-discover',
  imports: [
    MentorCard,
    ErrorStateComponent,
    LoadingStateComponent,
    EmptyStateComponent,
    BackButtonComponent,
  ],
  templateUrl: './discover.html',
  styleUrl: './discover.scss',
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export default class Discover {
  private mentorService = inject(MentorService);

  private reload$ = new Subject<void>();

  isLoading = signal(true);
  searchQuery = signal('');
  loadError = signal<string | null>(null);

  emptyStateMessage = computed(() => {
    const query = this.searchQuery().trim();
    if (query) {
      return `We couldn't find any mentors matching "${query}". Try adjusting your search terms.`;
    }

    return 'No mentors are available yet. Check back soon as new mentors join the platform!';
  });

  mentors = toSignal(
    this.reload$.pipe(
      startWith(void 0),
      tap(() => {
        this.isLoading.set(true);
        this.loadError.set(null);
      }),
      switchMap(() =>
        this.mentorService.watchMentorDirectory().pipe(
          tap(() => this.isLoading.set(false)),
          catchError(error => {
            this.isLoading.set(false);
            this.loadError.set(this.describeError(error));
            return of([] as User[]);
          })
        )
      )
    ),
    { initialValue: [] as User[] }
  );

  filteredMentors = computed(() => {
    const q = this.searchQuery().toLowerCase().trim();
    return this.mentors().filter(m => {
      const name = m.displayName?.toLowerCase() || '';
      const bio = m.bio?.toLowerCase() || '';
      const expertise = (m.mentorProfile?.expertise || []).join(' ').toLowerCase();
      const textMatch = q === '' || name.includes(q) || bio.includes(q) || expertise.includes(q);
      return textMatch;
    });
  });

  retryLoad(): void {
    this.isLoading.set(true);
    this.loadError.set(null);
    this.reload$.next();
  }

  clearSearch(): void {
    this.searchQuery.set('');
  }

  private describeError(error: unknown): string {
    if (isDomainError(error)) {
      return error.message;
    }

    return 'We could not load mentors right now. Please try again.';
  }
}
