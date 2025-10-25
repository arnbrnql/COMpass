import { MentorshipRequestFormData } from '../../shared/models/mentorship-request.model';
import { ValidationError } from '../errors';

export interface PaginationOptions {
  page: number;
  limit: number;
  orderBy?: string;
  orderDirection?: 'asc' | 'desc';
}

export function assertNonEmptyString(value: unknown, fieldName: string): asserts value is string {
  if (typeof value !== 'string' || value.trim().length === 0) {
    throw new ValidationError(`${fieldName} is required.`);
  }
}

export function assertPositiveInteger(value: unknown, fieldName: string): asserts value is number {
  if (typeof value !== 'number' || !Number.isFinite(value) || !Number.isInteger(value) || value <= 0) {
    throw new ValidationError(`${fieldName} must be a positive integer.`);
  }
}

export function assertUid(value: unknown, fieldName: string = 'User ID'): asserts value is string {
  assertNonEmptyString(value, fieldName);
  if (value.length < 5) {
    throw new ValidationError(`${fieldName} appears to be invalid.`);
  }
}

export function normalizePaginationOptions<T extends PaginationOptions>(
  options: Partial<T> | undefined,
  defaults: T
): T {
  const merged: PaginationOptions = {
    page: options?.page ?? defaults.page,
    limit: options?.limit ?? defaults.limit,
    orderBy: options?.orderBy ?? defaults.orderBy,
    orderDirection: options?.orderDirection ?? defaults.orderDirection,
  };

  assertPositiveInteger(merged.page, 'Page');
  assertPositiveInteger(merged.limit, 'Limit');

  if (merged.orderDirection && !['asc', 'desc'].includes(merged.orderDirection)) {
    throw new ValidationError('orderDirection must be either "asc" or "desc".');
  }

  return {
    ...defaults,
    ...merged,
    page: Math.max(1, merged.page),
  } as T;
}

export function normalizeMentorshipRequestFormData(
  formData: MentorshipRequestFormData
): MentorshipRequestFormData {
  if (!formData || typeof formData !== 'object') {
    throw new ValidationError('Mentorship request details are required.');
  }

  assertNonEmptyString(formData.message, 'Mentorship request message');

  const goals = formData.goals?.map(goal => goal.trim()).filter(goal => goal.length > 0);
  if (formData.goals && !Array.isArray(formData.goals)) {
    throw new ValidationError('Mentorship goals must be an array of strings.');
  }

  return {
    ...formData,
    message: formData.message.trim(),
    goals,
  };
}
