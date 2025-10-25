import { MonoTypeOperatorFunction, ObservableInput, timer } from 'rxjs';
import { retry } from 'rxjs/operators';

import { TransientError } from '../../../domain/errors';

export interface RetryBackoffOptions {
  maxRetries?: number;
  baseDelayMs?: number;
  maxDelayMs?: number;
  shouldRetry?: (error: unknown) => boolean;
}

const DEFAULT_OPTIONS: Required<Omit<RetryBackoffOptions, 'shouldRetry'>> = {
  maxRetries: 3,
  baseDelayMs: 500,
  maxDelayMs: 5000,
};

export function retryWithBackoff<T>(options: RetryBackoffOptions = {}): MonoTypeOperatorFunction<T> {
  const merged = { ...DEFAULT_OPTIONS, ...options };
  const shouldRetry = options.shouldRetry ?? ((error: unknown) => error instanceof TransientError);

  return retry({
    count: merged.maxRetries,
    delay: (error: unknown, retryCount: number): ObservableInput<unknown> => {
      if (!shouldRetry(error)) {
        throw error;
      }

      const delay = Math.min(merged.maxDelayMs, merged.baseDelayMs * Math.pow(2, retryCount - 1));
      return timer(delay);
    },
    resetOnSuccess: true,
  });
}
