import { describe, it, expect, beforeEach, vi } from 'vitest';

// Mock Supabase as unconfigured so we test localStorage path
vi.mock('../lib/env', () => ({
  isSupabaseConfigured: false,
  isStripeConfigured: false,
  default: {
    SUPABASE_URL: '',
    SUPABASE_ANON_KEY: '',
    STRIPE_PUBLISHABLE_KEY: '',
    SITE_URL: 'http://localhost:5173',
  },
}));

vi.mock('../lib/supabase', () => ({
  supabase: null,
  getPublicUrl: () => null,
  getSignedUrl: async () => null,
  uploadFile: async () => ({ error: { message: 'Not configured' } }),
  deleteFile: async () => ({ error: { message: 'Not configured' } }),
}));

import {
  fetchBeats,
  fetchBeatBySlug,
  createBeat,
  updateBeat,
  deleteBeat,
  incrementPlays,
  createInquiry,
  fetchInquiries,
  createMessage,
  fetchMessages,
  deleteMessage,
} from '../lib/data';

// Clear localStorage before each test
beforeEach(() => {
  localStorage.clear();
});

describe('Beats (localStorage)', () => {
  it('returns seed beats on first fetch', async () => {
    const beats = await fetchBeats();
    expect(beats.length).toBeGreaterThan(0);
    expect(beats[0]).toHaveProperty('title');
    expect(beats[0]).toHaveProperty('slug');
  });

  it('fetches a beat by slug', async () => {
    await fetchBeats(); // Initialize store with seeds
    const beat = await fetchBeatBySlug('hearts');
    expect(beat).not.toBeNull();
    expect(beat.title).toBe('hearts');
  });

  it('returns null for unknown slug', async () => {
    await fetchBeats();
    const beat = await fetchBeatBySlug('nonexistent-beat');
    expect(beat).toBeNull();
  });

  it('creates a new beat', async () => {
    const newBeat = await createBeat({
      title: 'Test Beat',
      slug: 'test-beat',
      genre: 'Alté',
      bpm: 100,
    });
    expect(newBeat.id).toBeDefined();
    expect(newBeat.title).toBe('Test Beat');

    const found = await fetchBeatBySlug('test-beat');
    expect(found).not.toBeNull();
  });

  it('updates a beat', async () => {
    const created = await createBeat({
      title: 'Before',
      slug: 'update-test',
      genre: 'Alté',
      bpm: 100,
    });

    const updated = await updateBeat(created.id, { title: 'After' });
    expect(updated.title).toBe('After');
    expect(updated.updated_at).toBeDefined();
  });

  it('deletes a beat', async () => {
    const created = await createBeat({
      title: 'Delete Me',
      slug: 'delete-test',
      genre: 'Alté',
      bpm: 100,
    });

    await deleteBeat(created.id);
    const found = await fetchBeatBySlug('delete-test');
    expect(found).toBeNull();
  });

  it('increments plays', async () => {
    const created = await createBeat({
      title: 'Playable',
      slug: 'play-test',
      genre: 'Alté',
      bpm: 100,
      plays: 0,
    });

    await incrementPlays(created.id);
    const found = await fetchBeatBySlug('play-test');
    expect(found.plays).toBe(1);
  });
});

describe('Inquiries (localStorage)', () => {
  it('creates and fetches inquiries', async () => {
    const inquiry = await createInquiry({
      name: 'Test User',
      email: 'test@example.com',
      inquiry_type: 'custom_beat',
      message: 'I need a custom beat',
    });

    expect(inquiry.id).toBeDefined();
    expect(inquiry.status).toBe('new');

    const all = await fetchInquiries();
    expect(all.length).toBe(1);
    expect(all[0].name).toBe('Test User');
  });
});

describe('Messages (localStorage)', () => {
  it('creates, fetches, and deletes messages', async () => {
    await createMessage({
      name: 'Jane',
      email: 'jane@example.com',
      subject: 'Hello',
      message: 'Testing the contact form',
    });

    let msgs = await fetchMessages();
    expect(msgs.length).toBe(1);
    expect(msgs[0].read).toBe(false);

    await deleteMessage(msgs[0].id);
    msgs = await fetchMessages();
    expect(msgs.length).toBe(0);
  });
});
