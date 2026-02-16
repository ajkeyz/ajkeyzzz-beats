import { describe, it, expect } from 'vitest';
import { beatSchema, inquirySchema, contactSchema } from '../lib/schema';

describe('beatSchema', () => {
  it('validates a valid beat', () => {
    const result = beatSchema.safeParse({
      title: 'Test Beat',
      slug: 'test-beat',
      genre: 'Alté',
      bpm: 120,
    });
    expect(result.success).toBe(true);
  });

  it('rejects a beat without title', () => {
    const result = beatSchema.safeParse({
      slug: 'test',
      genre: 'Alté',
      bpm: 100,
    });
    expect(result.success).toBe(false);
  });

  it('rejects a beat with BPM below minimum', () => {
    const result = beatSchema.safeParse({
      title: 'Test',
      slug: 'test',
      genre: 'Alté',
      bpm: 10,
    });
    expect(result.success).toBe(false);
  });
});

describe('inquirySchema', () => {
  it('validates a valid inquiry', () => {
    const result = inquirySchema.safeParse({
      name: 'Test User',
      email: 'test@example.com',
      message: 'I need a custom beat for my project',
    });
    expect(result.success).toBe(true);
  });

  it('rejects invalid email', () => {
    const result = inquirySchema.safeParse({
      name: 'Test',
      email: 'not-an-email',
      message: 'Hello there testing this form',
    });
    expect(result.success).toBe(false);
  });

  it('rejects empty message', () => {
    const result = inquirySchema.safeParse({
      name: 'Test',
      email: 'test@example.com',
      message: '',
    });
    expect(result.success).toBe(false);
  });
});

describe('contactSchema', () => {
  it('validates a valid contact form', () => {
    const result = contactSchema.safeParse({
      name: 'Jane Doe',
      email: 'jane@example.com',
      message: 'Just wanted to reach out about a project',
    });
    expect(result.success).toBe(true);
  });

  it('accepts optional subject', () => {
    const result = contactSchema.safeParse({
      name: 'Jane',
      email: 'jane@example.com',
      subject: 'Collaboration',
      message: 'This is a message with more than ten characters',
    });
    expect(result.success).toBe(true);
    expect(result.data.subject).toBe('Collaboration');
  });

  it('rejects empty name', () => {
    const result = contactSchema.safeParse({
      name: '',
      email: 'jane@example.com',
      message: 'Hello world from the contact form',
    });
    expect(result.success).toBe(false);
  });
});
