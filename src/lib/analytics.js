// Structured analytics event tracking
// Events are logged to Supabase play_events table (for plays) and console (for all events).
// This module provides a unified interface for tracking user interactions.

import { supabase } from './supabase';
import { isSupabaseConfigured } from './env';
import env from './env';

const EVENT_TYPES = {
  PLAY: 'play',
  PAUSE: 'pause',
  SEEK: 'seek',
  LICENSE_CLICK: 'license_click',
  CHECKOUT_START: 'checkout_start',
  INQUIRY_SUBMIT: 'inquiry_submit',
  CONTACT_SUBMIT: 'contact_submit',
  PAGE_VIEW: 'page_view',
  BEAT_VIEW: 'beat_view',
  SEARCH: 'search',
};

// In-memory buffer for batching events
const eventBuffer = [];
let flushTimer = null;

function scheduleFlush() {
  if (flushTimer) return;
  flushTimer = setTimeout(() => {
    flushEvents();
    flushTimer = null;
  }, 5000);
}

async function flushEvents() {
  if (eventBuffer.length === 0) return;
  const events = eventBuffer.splice(0, eventBuffer.length);

  if (isSupabaseConfigured && supabase) {
    // Batch insert play events for play-type events
    const playEvents = events
      .filter(e => e.type === EVENT_TYPES.PLAY && e.properties?.beat_id)
      .map(e => ({ beat_id: e.properties.beat_id }));

    if (playEvents.length > 0) {
      await supabase.from('play_events').insert(playEvents).catch(() => {});
    }
  }
}

export function trackEvent(type, properties = {}) {
  const event = {
    type,
    properties,
    timestamp: new Date().toISOString(),
    url: window.location.pathname,
  };

  // Log to console in development
  if (import.meta.env.DEV) {
    console.debug('[analytics]', type, properties);
  }

  eventBuffer.push(event);
  scheduleFlush();
}

// Convenience methods
export function trackPlay(beatId, beatTitle) {
  trackEvent(EVENT_TYPES.PLAY, { beat_id: beatId, beat_title: beatTitle });
}

export function trackPause(beatId) {
  trackEvent(EVENT_TYPES.PAUSE, { beat_id: beatId });
}

export function trackLicenseClick(beatId, beatTitle) {
  trackEvent(EVENT_TYPES.LICENSE_CLICK, { beat_id: beatId, beat_title: beatTitle });
}

export function trackCheckoutStart(beatId, licenseTier, amount) {
  trackEvent(EVENT_TYPES.CHECKOUT_START, { beat_id: beatId, license_tier: licenseTier, amount });
}

export function trackInquirySubmit(inquiryType) {
  trackEvent(EVENT_TYPES.INQUIRY_SUBMIT, { inquiry_type: inquiryType });
}

export function trackContactSubmit() {
  trackEvent(EVENT_TYPES.CONTACT_SUBMIT);
}

export function trackPageView(page) {
  trackEvent(EVENT_TYPES.PAGE_VIEW, { page });
}

export function trackBeatView(beatId, beatTitle) {
  trackEvent(EVENT_TYPES.BEAT_VIEW, { beat_id: beatId, beat_title: beatTitle });
}

export function trackSearch(query, resultCount) {
  trackEvent(EVENT_TYPES.SEARCH, { query, result_count: resultCount });
}

// Flush remaining events when page unloads using sendBeacon for reliability
function flushOnUnload() {
  if (eventBuffer.length === 0 || !isSupabaseConfigured) return;

  const playEvents = eventBuffer
    .filter(e => e.type === EVENT_TYPES.PLAY && e.properties?.beat_id)
    .map(e => ({ beat_id: e.properties.beat_id }));

  eventBuffer.length = 0;

  if (playEvents.length > 0 && navigator.sendBeacon) {
    const url = `${env.SUPABASE_URL}/rest/v1/play_events`;
    const blob = new Blob([JSON.stringify(playEvents)], { type: 'application/json' });
    const headers = new Headers({
      apikey: env.SUPABASE_ANON_KEY,
      'Content-Type': 'application/json',
      Prefer: 'return=minimal',
    });
    // sendBeacon doesn't support custom headers, fall back to fetch keepalive
    fetch(url, {
      method: 'POST',
      headers: { apikey: env.SUPABASE_ANON_KEY, 'Content-Type': 'application/json', Prefer: 'return=minimal' },
      body: JSON.stringify(playEvents),
      keepalive: true,
    }).catch(() => {});
  }
}

if (typeof window !== 'undefined') {
  window.addEventListener('visibilitychange', () => {
    if (document.visibilityState === 'hidden') flushOnUnload();
  });
  window.addEventListener('beforeunload', flushOnUnload);
}
