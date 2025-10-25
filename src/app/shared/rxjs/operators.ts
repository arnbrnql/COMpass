import { MonoTypeOperatorFunction, Observable, OperatorFunction, of } from 'rxjs';
import { catchError, map, startWith, tap } from 'rxjs/operators';

export interface LoadingState<T> {
  data: T;
  loading: boolean;
  error: string | null;
}

type ErrorMapper = (error: unknown) => string;

type LoadingStateOptions<T> = {
  /** Emits before the error state is returned. Useful for side effects. */
  onError?: (error: unknown) => void;
  /** Maps the caught error into a user-friendly message. */
  errorMessage?: ErrorMapper;
  /** Called for each successful emission to transform the payload. */
  mapData?: (value: T) => T;
};

const defaultErrorMessage: ErrorMapper = () => 'Something went wrong. Please try again later.';

export function withLoadingState<T>(
  initialValue: T,
  options: LoadingStateOptions<T> = {}
): OperatorFunction<T, LoadingState<T>> {
  return (source: Observable<T>) =>
    source.pipe(
      map((value) => ({
        data: options.mapData ? options.mapData(value) : value,
        loading: false,
        error: null,
      })),
      startWith({ data: initialValue, loading: true, error: null }),
      catchError((error: unknown) => {
        options.onError?.(error);
        const message = (options.errorMessage ?? defaultErrorMessage)(error);
        return of({ data: initialValue, loading: false, error: message });
      })
    );
}

export function tapLoadingState<T>(
  onNext?: (value: T) => void,
  onError?: (error: unknown) => void
): MonoTypeOperatorFunction<LoadingState<T>> {
  return (source) =>
    source.pipe(
      tap({
        next: (state) => {
          if (!state.loading && !state.error) {
            onNext?.(state.data);
          }
        },
        error: onError,
      })
    );
}
