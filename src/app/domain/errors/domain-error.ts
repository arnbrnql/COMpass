export interface DomainErrorContext {
  cause?: unknown;
  data?: Record<string, unknown>;
}

export class DomainError extends Error {
  readonly context?: DomainErrorContext;
  readonly isOperational = true;

  constructor(message: string, context?: DomainErrorContext) {
    super(message);
    this.name = new.target.name;
    this.context = context;

    if (context?.cause instanceof Error) {
      (this as any).cause = context.cause;
    }
  }
}

export class ValidationError extends DomainError {
  constructor(message: string, context?: DomainErrorContext) {
    super(message, context);
  }
}

export class NotFoundError extends DomainError {
  constructor(message: string, context?: DomainErrorContext) {
    super(message, context);
  }
}

export class UnauthorizedError extends DomainError {
  constructor(message: string, context?: DomainErrorContext) {
    super(message, context);
  }
}

export class ConflictError extends DomainError {
  constructor(message: string, context?: DomainErrorContext) {
    super(message, context);
  }
}

export class TransientError extends DomainError {
  readonly retryable = true;

  constructor(message: string, context?: DomainErrorContext) {
    super(message, context);
  }
}

export function isDomainError(error: unknown): error is DomainError {
  return error instanceof DomainError;
}
