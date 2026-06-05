import { describe, it, expect } from 'vitest';
import { formatDate } from './formatDate';

describe('formatDate', () => {
  it('should return — when called with no argument', () => {
    expect(formatDate()).toBe('—');
  });

  it('should return — when called with undified', () => {
    expect(formatDate()).toBe('—');
  });

  it('should return Norwegian date format when iso format', () => {
    expect(formatDate('2026-04-05T08:04:02+02:00')).toBe('5.4.26 08:04:02');
  });
});
