import { Observable, defer, throwError } from 'rxjs';
import { catchError, retry } from 'rxjs/operators';

/**
 * Error type returned by repository implementations when SDK calls fail.
 */
export class RepositoryError extends Error {
  constructor(
    message: string,
    public readonly code?: string,
    public readonly originalError?: unknown
  ) {
    super(message);
    this.name = 'RepositoryError';
  }
}

/**
 * Base class for repository implementations with retry logic and error translation.
 */
export abstract class BaseRepository {
  protected readonly retryAttempts = 1;

  protected fromPromise<T>(operation: () => Promise<T>): Observable<T> {
    return defer(operation).pipe(
      retry({ count: this.retryAttempts }),
      catchError((error: unknown) => throwError(() => this.translateError(error)))
    );
  }

  protected fromObservable<T>(operation: () => Observable<T>): Observable<T> {
    return defer(operation).pipe(
      catchError((error: unknown) => throwError(() => this.translateError(error)))
    );
  }

  protected translateError(error: unknown): RepositoryError {
    if (error instanceof RepositoryError) {
      return error;
    }

    const code = (error as { code?: string })?.code;
    const message =
      error instanceof Error ? error.message : 'Unexpected repository error';

    return new RepositoryError(message, code, error);
  }
}
