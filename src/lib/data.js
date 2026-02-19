// Unified data layer — uses Supabase when configured, localStorage fallback otherwise
import { supabase } from './supabase';
import { isSupabaseConfigured } from './env';
import { localStore } from './store';
import { SEED_BEATS, SEED_PLAYLISTS } from './seeds';

// ─── NOTIFICATIONS ───

export async function sendNotification(payload) {
  if (!isSupabaseConfigured) return; // Skip in demo mode
  try {
    const { error } = await supabase.functions.invoke('send-notification', {
      body: payload,
    });
    if (error) console.warn('Notification failed:', error);
  } catch (err) {
    console.warn('Notification failed:', err);
  }
}

// ─── BEATS ───

export async function fetchBeats({ published = true } = {}) {
  if (isSupabaseConfigured) {
    try {
      let query = supabase.from('beats').select('*').order('created_at', { ascending: false });
      if (published) query = query.eq('published', true);
      const { data, error } = await query;
      if (!error && data) return published ? data.filter(b => b.published !== false) : data;
      if (error) console.warn('fetchBeats: falling back to seed data —', error.message);
    } catch (err) {
      console.warn('fetchBeats: network error, falling back to seed data —', err.message);
    }
  }
  const beats = localStore.getBeats();
  if (beats.length === 0) {
    localStore.setBeats(SEED_BEATS);
    return published ? SEED_BEATS.filter(b => b.published !== false) : SEED_BEATS;
  }
  return published ? beats.filter(b => b.published !== false) : beats;
}

export async function fetchBeatBySlug(slug) {
  if (isSupabaseConfigured) {
    try {
      const { data, error } = await supabase.from('beats').select('*').eq('slug', slug).single();
      if (!error && data) return data;
      if (error) console.warn('fetchBeatBySlug: falling back to local —', error.message);
    } catch (err) {
      console.warn('fetchBeatBySlug: network error —', err.message);
    }
  }
  // Fall back to localStorage / seed data
  let beats = localStore.getBeats();
  if (beats.length === 0) {
    localStore.setBeats(SEED_BEATS);
    beats = SEED_BEATS;
  }
  return beats.find(b => b.slug === slug) || null;
}

export async function createBeat(beat) {
  if (isSupabaseConfigured) {
    const { data, error } = await supabase.from('beats').insert(beat).select().single();
    if (error) throw error;
    return data;
  }
  const beats = localStore.getBeats();
  const newBeat = { ...beat, id: crypto.randomUUID(), created_at: new Date().toISOString(), plays: 0 };
  localStore.setBeats([newBeat, ...beats]);
  return newBeat;
}

export async function updateBeat(id, updates) {
  if (isSupabaseConfigured) {
    const { data, error } = await supabase.from('beats').update({ ...updates, updated_at: new Date().toISOString() }).eq('id', id).select().single();
    if (error) throw error;
    return data;
  }
  const beats = localStore.getBeats();
  const updated = beats.map(b => b.id === id ? { ...b, ...updates, updated_at: new Date().toISOString() } : b);
  localStore.setBeats(updated);
  return updated.find(b => b.id === id);
}

export async function deleteBeat(id) {
  if (isSupabaseConfigured) {
    const { error } = await supabase.from('beats').delete().eq('id', id);
    if (error) throw error;
    return;
  }
  const beats = localStore.getBeats();
  localStore.setBeats(beats.filter(b => b.id !== id));
}

export async function incrementPlays(id) {
  if (isSupabaseConfigured) {
    try {
      await supabase.rpc('increment_plays', { beat_id: id });
      await supabase.from('play_events').insert({ beat_id: id });
    } catch (err) {
      console.warn('incrementPlays failed:', err.message);
    }
    return;
  }
  const beats = localStore.getBeats();
  const updated = beats.map(b => b.id === id ? { ...b, plays: (b.plays || 0) + 1 } : b);
  localStore.setBeats(updated);
}

// ─── INQUIRIES ───

export async function createInquiry(inquiry) {
  if (isSupabaseConfigured) {
    const { data, error } = await supabase.from('inquiries').insert(inquiry).select().single();
    if (error) throw error;
    // Fire-and-forget notification
    sendNotification({
      type: 'inquiry_notification',
      name: inquiry.name,
      email: inquiry.email,
      inquiry_type: inquiry.inquiry_type,
      message: inquiry.message,
      budget: inquiry.budget,
      timeline: inquiry.timeline,
    });
    return data;
  }
  const inqs = localStore.getInquiries();
  const newInq = { ...inquiry, id: crypto.randomUUID(), status: 'new', created_at: new Date().toISOString() };
  localStore.setInquiries([newInq, ...inqs]);
  return newInq;
}

export async function fetchInquiries() {
  if (isSupabaseConfigured) {
    const { data, error } = await supabase.from('inquiries').select('*').order('created_at', { ascending: false });
    if (error) return [];
    return data;
  }
  return localStore.getInquiries();
}

export async function updateInquiry(id, updates) {
  if (isSupabaseConfigured) {
    const { data, error } = await supabase.from('inquiries').update(updates).eq('id', id).select().single();
    if (error) throw error;
    return data;
  }
  const inqs = localStore.getInquiries();
  const updated = inqs.map(i => i.id === id ? { ...i, ...updates } : i);
  localStore.setInquiries(updated);
  return updated.find(i => i.id === id);
}

// ─── ORDERS ───

export async function createOrder(order) {
  if (isSupabaseConfigured) {
    const { data, error } = await supabase.from('orders').insert(order).select().single();
    if (error) throw error;
    return data;
  }
  const orders = localStore.getOrders();
  // Generate download token + expiry for local mode
  const token = Array.from(crypto.getRandomValues(new Uint8Array(32)))
    .map(b => b.toString(16).padStart(2, '0')).join('');
  const expires = new Date(Date.now() + 72 * 60 * 60 * 1000).toISOString();
  const newOrder = {
    ...order,
    id: crypto.randomUUID(),
    download_token: order.download_token || token,
    download_expires_at: order.download_expires_at || expires,
    fulfilled: false,
    created_at: new Date().toISOString(),
  };
  localStore.setOrders([newOrder, ...orders]);
  return newOrder;
}

export async function updateOrder(id, updates) {
  if (isSupabaseConfigured) {
    const { data, error } = await supabase.from('orders').update(updates).eq('id', id).select().single();
    if (error) throw error;
    return data;
  }
  const orders = localStore.getOrders();
  const updated = orders.map(o => o.id === id ? { ...o, ...updates } : o);
  localStore.setOrders(updated);
  return updated.find(o => o.id === id);
}

export async function fetchOrders() {
  if (isSupabaseConfigured) {
    const { data, error } = await supabase.from('orders').select('*, beats(title, slug, cover_emoji)').order('created_at', { ascending: false });
    if (error) return [];
    return data;
  }
  return localStore.getOrders();
}

export async function fetchOrderByToken(token) {
  if (isSupabaseConfigured) {
    const { data, error } = await supabase
      .from('orders')
      .select('*, beats(title, slug, cover_emoji, cover_color, full_audio_url, stems_url)')
      .eq('download_token', token)
      .single();
    if (error) return null;
    return data;
  }
  // Local fallback: find order by token and join beat data
  const orders = localStore.getOrders();
  const order = orders.find(o => o.download_token === token);
  if (!order) return null;
  // Attach beat data if not already present
  if (order.beat_id && !order.beats) {
    const beats = localStore.getBeats();
    const beat = beats.find(b => b.id === order.beat_id);
    if (beat) order.beats = beat;
  }
  return order;
}

// ─── MESSAGES (contact form) ───

export async function createMessage(message) {
  if (isSupabaseConfigured) {
    const { data, error } = await supabase.from('messages').insert(message).select().single();
    if (error) throw error;
    // Fire-and-forget notification
    sendNotification({
      type: 'contact_notification',
      name: message.name,
      email: message.email,
      subject: message.subject || '',
      message: message.message,
    });
    return data;
  }
  const msgs = localStore.getMessages();
  const newMsg = { ...message, id: crypto.randomUUID(), read: false, created_at: new Date().toISOString() };
  localStore.setMessages([newMsg, ...msgs]);
  return newMsg;
}

export async function fetchMessages() {
  if (isSupabaseConfigured) {
    const { data, error } = await supabase.from('messages').select('*').order('created_at', { ascending: false });
    if (error) return [];
    return data;
  }
  return localStore.getMessages();
}

export async function updateMessage(id, updates) {
  if (isSupabaseConfigured) {
    const { error } = await supabase.from('messages').update(updates).eq('id', id);
    if (error) throw error;
    return;
  }
  const msgs = localStore.getMessages();
  localStore.setMessages(msgs.map(m => m.id === id ? { ...m, ...updates } : m));
}

export async function deleteMessage(id) {
  if (isSupabaseConfigured) {
    const { error } = await supabase.from('messages').delete().eq('id', id);
    if (error) throw error;
    return;
  }
  const msgs = localStore.getMessages();
  localStore.setMessages(msgs.filter(m => m.id !== id));
}

// ─── COLLECTIONS ───

// Helper: check if error is a missing table error
const isTableMissing = (error) =>
  error?.message?.includes('schema cache') || error?.code === '42P01';

function getLocalCollections() {
  const collections = localStore.getCollections();
  if (collections.length === 0) {
    const seeded = SEED_PLAYLISTS.map((p, i) => ({ ...p, sort_order: i, created_at: new Date().toISOString() }));
    localStore.setCollections(seeded);
    return seeded;
  }
  return collections;
}

export async function fetchCollections() {
  if (isSupabaseConfigured) {
    try {
      const { data, error } = await supabase.from('collections').select('*').order('sort_order', { ascending: true });
      if (!error && data) return data;
      if (error) console.warn('fetchCollections: falling back to localStorage —', error.message);
    } catch (err) {
      console.warn('fetchCollections: network error —', err.message);
    }
  }
  return getLocalCollections();
}

export async function createCollection(collection) {
  if (isSupabaseConfigured) {
    const { data, error } = await supabase.from('collections').insert(collection).select().single();
    if (error && !isTableMissing(error)) throw error;
    if (!error) return data;
    console.warn('createCollection: falling back to localStorage —', error.message);
  }
  const collections = localStore.getCollections();
  const newCollection = {
    ...collection,
    id: collection.id || collection.name.toLowerCase().replace(/\s+/g, '-'),
    sort_order: collections.length,
    created_at: new Date().toISOString(),
  };
  localStore.setCollections([...collections, newCollection]);
  return newCollection;
}

export async function updateCollection(id, updates) {
  if (isSupabaseConfigured) {
    const { data, error } = await supabase.from('collections').update({ ...updates, updated_at: new Date().toISOString() }).eq('id', id).select().single();
    if (error && !isTableMissing(error)) throw error;
    if (!error) return data;
    console.warn('updateCollection: falling back to localStorage —', error.message);
  }
  const collections = localStore.getCollections();
  const updated = collections.map(c => c.id === id ? { ...c, ...updates, updated_at: new Date().toISOString() } : c);
  localStore.setCollections(updated);
  return updated.find(c => c.id === id);
}

export async function deleteCollection(id) {
  if (isSupabaseConfigured) {
    const { error } = await supabase.from('collections').delete().eq('id', id);
    if (error && !isTableMissing(error)) throw error;
    if (!error) return;
    console.warn('deleteCollection: falling back to localStorage —', error.message);
  }
  const collections = localStore.getCollections();
  localStore.setCollections(collections.filter(c => c.id !== id));
}
