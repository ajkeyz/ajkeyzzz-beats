import { describe, it, expect } from 'vitest';
import { formatTime, formatPrice, slugify, sanitizeFilename, classNames, formatDate, canSubmit } from '../lib/utils';

describe('formatTime', () => {
  it('formats seconds into m:ss', () => {
    expect(formatTime(0)).toBe('0:00');
    expect(formatTime(5)).toBe('0:05');
    expect(formatTime(60)).toBe('1:00');
    expect(formatTime(125)).toBe('2:05');
    expect(formatTime(3661)).toBe('61:01');
  });

  it('handles null/undefined/NaN', () => {
    expect(formatTime(null)).toBe('0:00');
    expect(formatTime(undefined)).toBe('0:00');
    expect(formatTime(NaN)).toBe('0:00');
  });

  it('floors fractional seconds', () => {
    expect(formatTime(62.7)).toBe('1:02');
    expect(formatTime(59.9)).toBe('0:59');
  });
});

describe('formatPrice', () => {
  it('formats number as dollar amount', () => {
    expect(formatPrice(29.99)).toBe('$29.99');
    expect(formatPrice(0)).toBe('$0.00');
    expect(formatPrice(100)).toBe('$100.00');
  });

  it('handles string input', () => {
    expect(formatPrice('49.50')).toBe('$49.50');
  });
});

describe('slugify', () => {
  it('converts text to a URL-safe slug', () => {
    expect(slugify('Hello World')).toBe('hello-world');
    expect(slugify('Midnight Cruise')).toBe('midnight-cruise');
    expect(slugify('  spaces  ')).toBe('spaces');
  });

  it('removes special characters', () => {
    expect(slugify('beat #1!')).toBe('beat-1');
    expect(slugify("it's a vibe")).toBe('its-a-vibe');
  });

  it('collapses multiple hyphens', () => {
    expect(slugify('one---two')).toBe('one-two');
  });
});

describe('sanitizeFilename', () => {
  it('replaces special chars with underscores', () => {
    expect(sanitizeFilename('my beat (final).mp3')).toBe('my_beat_final_.mp3');
  });

  it('collapses multiple underscores', () => {
    expect(sanitizeFilename('a!!!b')).toBe('a_b');
  });

  it('lowercases the result', () => {
    expect(sanitizeFilename('MyFile.WAV')).toBe('myfile.wav');
  });
});

describe('classNames', () => {
  it('joins truthy values', () => {
    expect(classNames('a', 'b', 'c')).toBe('a b c');
  });

  it('filters out falsy values', () => {
    expect(classNames('a', false, null, undefined, '', 'b')).toBe('a b');
  });
});

describe('canSubmit', () => {
  it('allows first submission', () => {
    expect(canSubmit('test-form-1', 1000)).toBe(true);
  });

  it('blocks rapid re-submission', () => {
    canSubmit('test-form-2', 60000);
    expect(canSubmit('test-form-2', 60000)).toBe(false);
  });

  it('allows submission from different form ids', () => {
    canSubmit('test-form-3', 60000);
    expect(canSubmit('test-form-4', 60000)).toBe(true);
  });
});

describe('formatDate', () => {
  it('formats ISO date strings', () => {
    // Use midday UTC to avoid timezone date-shift issues
    const result = formatDate('2025-06-15T12:00:00Z');
    expect(result).toContain('Jun');
    expect(result).toContain('15');
    expect(result).toContain('2025');
  });

  it('returns empty string for falsy input', () => {
    expect(formatDate(null)).toBe('');
    expect(formatDate('')).toBe('');
    expect(formatDate(undefined)).toBe('');
  });
});
