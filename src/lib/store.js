// Local storage fallback for when Supabase is not configured
// This mirrors the Supabase data layer but uses localStorage

const BEATS_KEY = 'ajkeyzzz-beats-v3';
const INQUIRIES_KEY = 'ajkeyzzz-inquiries';
const ORDERS_KEY = 'ajkeyzzz-orders';
const MESSAGES_KEY = 'ajkeyzzz-messages';
const COLLECTIONS_KEY = 'ajkeyzzz-collections';
const ADMIN_KEY = 'ajkeyzzz-admin-session';
const LIKES_KEY = 'ajkeyzzz-likes';

function get(key, fallback = []) {
  try {
    const raw = localStorage.getItem(key);
    return raw ? JSON.parse(raw) : fallback;
  } catch {
    return fallback;
  }
}

function set(key, value) {
  try {
    localStorage.setItem(key, JSON.stringify(value));
  } catch {}
}

export const localStore = {
  // Beats
  getBeats: () => get(BEATS_KEY, []),
  setBeats: (beats) => set(BEATS_KEY, beats),

  // Inquiries
  getInquiries: () => get(INQUIRIES_KEY, []),
  setInquiries: (inqs) => set(INQUIRIES_KEY, inqs),

  // Orders
  getOrders: () => get(ORDERS_KEY, []),
  setOrders: (orders) => set(ORDERS_KEY, orders),

  // Messages (contact form)
  getMessages: () => get(MESSAGES_KEY, []),
  setMessages: (msgs) => set(MESSAGES_KEY, msgs),

  // Collections
  getCollections: () => get(COLLECTIONS_KEY, []),
  setCollections: (collections) => set(COLLECTIONS_KEY, collections),

  // Admin session
  getAdmin: () => get(ADMIN_KEY, false),
  setAdmin: (val) => set(ADMIN_KEY, val),

  // Likes
  getLikes: () => get(LIKES_KEY, []),
  setLikes: (likes) => set(LIKES_KEY, likes),
};
